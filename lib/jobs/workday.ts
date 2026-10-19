/**
 * Workday career sites. Workday publishes no documented job feed; each
 * employer's career site (https://<tenant>.<wdN>.myworkdayjobs.com/<site>)
 * reads its openings from a public JSON endpoint under /wday/cxs/, which the
 * site's robots.txt does not disallow. The owner approved reading it on
 * 2026-10-16. Requests are paced, and full details are fetched only for
 * postings not seen before: the list gives title and path, the detail gives
 * description, location, country, date, and job type. What was learned from a
 * detail is kept in data/jobs/workday-meta.json (local, never committed), so
 * later refreshes read only the list.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "../zod";
import type { Careers } from "./schema";
import { abortableDelay, endpoint, fetchJson, FeedError, throwIfAborted, workdaySite } from "./security";

const short = z.string().max(1000);
const ListPosting = z.object({ title: short, externalPath: z.string().max(500).regex(/^\/job\/[^\s?#]+$/), locationsText: short.nullable().optional(), bulletFields: z.array(short).max(10).optional() });
type FacetValue = { id?: string; descriptor?: string; count?: number; values?: FacetValue[] };
const FacetValueS: z.ZodType<FacetValue> = z.lazy(() => z.object({ id: z.string().max(200).optional(), descriptor: short.optional(), count: z.number().int().nonnegative().optional(), values: z.array(FacetValueS).max(500).optional() }));
// Some sites mix non-job tiles into the list; entries without a title and job path are skipped, not fatal.
const ListPage = z.object({ total: z.number().int().nonnegative(),
  jobPostings: z.array(z.unknown()).max(20),
  facets: z.array(z.object({ facetParameter: z.string().max(100), values: z.array(FacetValueS).max(500).optional() })).max(30).optional() });
const Detail = z.object({ jobPostingInfo: z.object({
  title: short, jobDescription: z.string().max(400000).nullable().optional(), location: short.nullable().optional(),
  additionalLocations: z.array(short).max(1000).nullable().optional(), startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  timeType: short.nullable().optional(), jobReqId: short.nullable().optional(), remoteType: short.nullable().optional(),
  country: z.object({ descriptor: short.optional() }).nullable().optional(),
  jobRequisitionLocation: z.object({ country: z.object({ alpha2Code: z.string().regex(/^[A-Z]{2}$/).optional() }).nullable().optional() }).nullable().optional(),
}) });

export const WdMeta = z.object({ locations: z.array(short).max(50), country: z.string().regex(/^[A-Z]{2}$/).nullable(), startDate: z.string().nullable(),
  timeType: short.nullable(), reqId: short.nullable(), remote: z.boolean(), remoteType: short.nullable().optional() }).strict();
export type WdMeta = z.infer<typeof WdMeta>;
export type WdPayload = { postings: z.infer<typeof ListPosting>[]; meta: Record<string, WdMeta>; details: Record<string, string> };

/** The posting's source ID: the last path segment (title and requisition), kept to safe characters. */
export const workdayId = (externalPath: string) => externalPath.split("/").at(-1)!.replace(/[^A-Za-z0-9_-]/g, "-").slice(-100);

export const PAGE = 20;
const MAX_PAGES = 250;
// Workday reports at most 2,000 as a site's total, though the list continues past it.
export const TOTAL_CAP = 2000;
// Details are the slow part (about 1.5 s each with pacing). Each run fetches at most this many per
// site and across all sites, so a refresh stays well inside the routines' time; new postings fill in
// over the next runs and meanwhile show the list's location text.
export const MAX_DETAILS_PER_SITE = Number(process.env.WORKDAY_MAX_DETAILS_PER_SITE ?? 100);
let detailBudget = Number(process.env.WORKDAY_DETAIL_BUDGET ?? 1500);

export async function fetchWorkday(c: Careers, known: (id: string) => WdMeta | undefined, hasDescription: (id: string) => boolean,
  fetcher: typeof fetch = fetch, signal?: AbortSignal): Promise<WdPayload> {
  if (c.source.type !== "workday") throw new FeedError("payload");
  const w = workdaySite(c.source.identifier);
  const list = endpoint(c);
  const postings: WdPayload["postings"] = [];
  const seenPaths = new Set<string>();
  const ingest = (data: z.infer<typeof ListPage>) => {
    for (const raw of data.jobPostings) {
      const parsed = ListPosting.safeParse(raw);
      if (!parsed.success) continue;
      const p = parsed.data;
      if (!seenPaths.has(p.externalPath)) { seenPaths.add(p.externalPath); postings.push(p); }
    }
  };
  const readPage = async (appliedFacets: Record<string, string[]>, page: number) => {
    throwIfAborted(signal);
    return ListPage.parse(await fetchJson(list, fetcher, { appliedFacets, limit: PAGE, offset: page * PAGE, searchText: "" }, signal));
  };
  /** Every posting for one set of facet filters; returns the first page (for its facets and total). */
  const readAll = async (appliedFacets: Record<string, string[]>) => {
    let first: z.infer<typeof ListPage> | null = null;
    let total = 0, got = 0;
    for (let page = 0; page < MAX_PAGES; page++) {
      const data = await readPage(appliedFacets, page);
      // Workday reports the total on the first page; later pages may say 0.
      if (page === 0) { first = data; total = data.total; }
      got += data.jobPostings.length;
      ingest(data);
      // Past the 2,000 cap Workday repeats earlier pages; stop there and split instead.
      if (data.jobPostings.length < PAGE || got >= Math.min(total, TOTAL_CAP)) break;
      await abortableDelay(400, signal);
    }
    return first;
  };
  // Page 0 first: a capped total means split by facet instead of walking 100 unfiltered pages
  // that Workday will only repeat (NVIDIA reports 2,735 and the unfiltered walk is wasted).
  const first = await readPage({}, 0);
  ingest(first);
  if (first.total >= TOTAL_CAP) {
    // A capped list: read it split by a facet whose groups are each under the cap and add up
    // to the whole list (job family first), so postings past 2,000 are not left out.
    const flat = (vals: FacetValue[] = []): FacetValue[] => vals.flatMap((v) => (v.values ? flat(v.values) : [v]));
    const options = (first.facets ?? []).map((f) => ({ param: f.facetParameter, values: flat(f.values).filter((v) => v.id && v.count) }))
      .filter((f) => f.values.length > 1 && f.values.every((v) => v.count! < TOTAL_CAP))
      .map((f) => ({ ...f, sum: f.values.reduce((n, v) => n + v.count!, 0) }));
    const pick = options.find((f) => /jobfamily/i.test(f.param) && f.sum >= first.total) ?? options.filter((f) => !/location/i.test(f.param)).sort((a, b) => b.sum - a.sum)[0];
    if (!pick) throw new FeedError("anomaly");
    const expected = pick.sum;
    for (const v of pick.values) { await abortableDelay(400, signal); await readAll({ [pick.param]: [v.id!] }); }
    // A split that misses more than a few percent of postings is not trusted.
    if (postings.length < expected * 0.97) throw new FeedError("anomaly");
  } else {
    let got = first.jobPostings.length;
    for (let page = 1; page < MAX_PAGES && got < first.total && first.jobPostings.length >= PAGE; page++) {
      await abortableDelay(400, signal);
      const data = await readPage({}, page);
      got += data.jobPostings.length;
      ingest(data);
      if (data.jobPostings.length < PAGE) break;
    }
  }
  if (!postings.length && first.total > 0) throw new FeedError("payload");
  const meta: Record<string, WdMeta> = {};
  const details: Record<string, string> = {};
  let fetched = 0;
  for (const p of postings) {
    throwIfAborted(signal);
    const id = workdayId(p.externalPath);
    const cached = known(id);
    if (cached && hasDescription(id)) { meta[id] = cached; continue; }
    if (fetched >= MAX_DETAILS_PER_SITE || detailBudget <= 0) { if (cached) meta[id] = cached; continue; }
    let raw: unknown;
    try {
      raw = await fetchJson(`https://${w.host}/wday/cxs/${w.tenant}/${w.site}${p.externalPath}`, fetcher, undefined, signal);
    } catch (e) {
      // A posting can close between the list and its detail; skip it rather than fail the site.
      // Rate limits and network failures still stop the run for this site.
      if (e instanceof FeedError && e.category === "http") { if (cached) meta[id] = cached; continue; }
      throw e;
    }
    fetched++;
    detailBudget--;
    const parsed = Detail.safeParse(raw);
    if (!parsed.success) { if (cached) meta[id] = cached; continue; }
    const d = parsed.data.jobPostingInfo;
    const locations = [d.location, ...(d.additionalLocations ?? [])].filter((l): l is string => Boolean(l)).slice(0, 50);
    meta[id] = WdMeta.parse({ locations, country: d.jobRequisitionLocation?.country?.alpha2Code ?? null, startDate: d.startDate ?? null,
      timeType: d.timeType ?? null, reqId: d.jobReqId ?? null, remote: /remote/i.test(`${d.remoteType ?? ""} ${locations.join(" ")}`), remoteType: d.remoteType ?? null });
    if (d.jobDescription) details[id] = d.jobDescription;
    await abortableDelay(300, signal);
  }
  return { postings, meta, details };
}

export const WORKDAY_META_PATH = path.join(process.cwd(), "data/jobs/workday-meta.json");
const Store = z.object({ version: z.literal(1), meta: z.record(z.string(), WdMeta) });
export function readWorkdayMeta(): Map<string, WdMeta> {
  try {
    if (!fs.existsSync(WORKDAY_META_PATH)) return new Map();
    return new Map(Object.entries(Store.parse(JSON.parse(fs.readFileSync(WORKDAY_META_PATH, "utf8"))).meta));
  } catch {
    console.warn("jobs: workday-meta.json unreadable; details will be fetched again");
    return new Map();
  }
}
export function writeWorkdayMeta(meta: Map<string, WdMeta>): void {
  const tmp = `${WORKDAY_META_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({ version: 1, meta: Object.fromEntries([...meta].sort(([a], [b]) => (a < b ? -1 : 1))) }));
  fs.renameSync(tmp, WORKDAY_META_PATH);
}
