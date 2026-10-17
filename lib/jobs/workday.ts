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
import { setTimeout as delay } from "node:timers/promises";
import { z } from "../zod";
import type { Careers } from "./schema";
import { endpoint, fetchJson, FeedError, workdaySite } from "./security";

const short = z.string().max(1000);
const ListPosting = z.object({ title: short, externalPath: z.string().max(500).regex(/^\/job\/[^\s?#]+$/), locationsText: short.nullable().optional(), bulletFields: z.array(short).max(10).optional() });
const ListPage = z.object({ total: z.number().int().nonnegative(), jobPostings: z.array(ListPosting).max(20) });
const Detail = z.object({ jobPostingInfo: z.object({
  title: short, jobDescription: z.string().max(400000).nullable().optional(), location: short.nullable().optional(),
  additionalLocations: z.array(short).max(1000).nullable().optional(), startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  timeType: short.nullable().optional(), jobReqId: short.nullable().optional(), remoteType: short.nullable().optional(),
  country: z.object({ descriptor: short.optional() }).nullable().optional(),
  jobRequisitionLocation: z.object({ country: z.object({ alpha2Code: z.string().regex(/^[A-Z]{2}$/).optional() }).nullable().optional() }).nullable().optional(),
}) });

export const WdMeta = z.object({ locations: z.array(short).max(50), country: z.string().regex(/^[A-Z]{2}$/).nullable(), startDate: z.string().nullable(),
  timeType: short.nullable(), reqId: short.nullable(), remote: z.boolean() }).strict();
export type WdMeta = z.infer<typeof WdMeta>;
export type WdPayload = { postings: z.infer<typeof ListPosting>[]; meta: Record<string, WdMeta>; details: Record<string, string> };

/** The posting's source ID: the last path segment (title and requisition), kept to safe characters. */
export const workdayId = (externalPath: string) => externalPath.split("/").at(-1)!.replace(/[^A-Za-z0-9_-]/g, "-").slice(-100);

const PAGE = 20;
const MAX_PAGES = 250;
// Workday reports at most 2,000 as a site's total, though the list continues past it.
const TOTAL_CAP = 2000;
// Details are the slow part (about 1.5 s each with pacing). Each run fetches at most this many per
// site and across all sites, so a refresh stays well inside the routines' time; new postings fill in
// over the next runs and meanwhile show the list's location text.
const MAX_DETAILS_PER_SITE = 500;
let detailBudget = Number(process.env.WORKDAY_DETAIL_BUDGET ?? 1500);

export async function fetchWorkday(c: Careers, known: (id: string) => WdMeta | undefined, hasDescription: (id: string) => boolean,
  fetcher: typeof fetch = fetch): Promise<WdPayload> {
  if (c.source.type !== "workday") throw new FeedError("payload");
  const w = workdaySite(c.source.identifier);
  const list = endpoint(c);
  const postings: WdPayload["postings"] = [];
  let total = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = ListPage.parse(await fetchJson(list, fetcher, { appliedFacets: {}, limit: PAGE, offset: page * PAGE, searchText: "" }));
    // Workday reports the total on the first page; later pages may say 0.
    if (page === 0) total = data.total;
    postings.push(...data.jobPostings);
    if (data.jobPostings.length < PAGE || (total < TOTAL_CAP && postings.length >= total)) break;
    await delay(400);
  }
  if (!postings.length && total > 0) throw new FeedError("payload");
  const meta: Record<string, WdMeta> = {};
  const details: Record<string, string> = {};
  let fetched = 0;
  for (const p of postings) {
    const id = workdayId(p.externalPath);
    const cached = known(id);
    if (cached && hasDescription(id)) { meta[id] = cached; continue; }
    if (fetched >= MAX_DETAILS_PER_SITE || detailBudget <= 0) { if (cached) meta[id] = cached; continue; }
    let raw: unknown;
    try {
      raw = await fetchJson(`https://${w.host}/wday/cxs/${w.tenant}/${w.site}${p.externalPath}`, fetcher);
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
      timeType: d.timeType ?? null, reqId: d.jobReqId ?? null, remote: /remote/i.test(`${d.remoteType ?? ""} ${locations.join(" ")}`) });
    if (d.jobDescription) details[id] = d.jobDescription;
    await delay(300);
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
