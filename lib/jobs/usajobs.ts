/**
 * USAJOBS Search API adapter: keyword searches for federal AI-related openings.
 * Network access lives in fetchUsaJobsItems; mapping and filters are pure.
 * The API key is read from USAJOBS_API_KEY and is never logged or written.
 */
import { z } from "../zod";
import type { Careers, NormalizedJob } from "./schema";
import { Salary } from "./schema";
import { endpoint, FeedError, postingUrl, readJsonBody } from "./security";

// The site's public contact address (lib/site-config.ts); USAJOBS asks for the email the API key was registered with.
export const DEFAULT_USAJOBS_USER_AGENT = "usasi@usasihq.com";
export const USAJOBS_HOST = "data.usajobs.gov";
export const USAJOBS_SEARCH_URL = "https://data.usajobs.gov/api/search";
/** Keyword searches that feed this board. Short "AI" is noisy; isRelevantAiJob drops false positives. */
export const USAJOBS_KEYWORDS = ["artificial intelligence", "machine learning", "data scientist", "AI"] as const;
export const USAJOBS_RESULTS_PER_PAGE = 500;
export const USAJOBS_MAX_PAGES_PER_KEYWORD = 40;

export type UsaJobsCredentials = { key: string; userAgent: string };

/** Missing or blank key: callers skip USAJOBS instead of failing the refresh. */
export function usajobsCredentials(
  env: { USAJOBS_API_KEY?: string; USAJOBS_USER_AGENT?: string } = process.env as {
    USAJOBS_API_KEY?: string;
    USAJOBS_USER_AGENT?: string;
  },
): UsaJobsCredentials | null {
  const key = env.USAJOBS_API_KEY?.trim();
  if (!key) return null;
  return { key, userAgent: env.USAJOBS_USER_AGENT?.trim() || DEFAULT_USAJOBS_USER_AGENT };
}

const short = z.string().max(4000);
const named = z.object({ Name: short.optional(), Code: z.union([z.string(), z.number()]).optional() }).passthrough();
const location = z.object({
  LocationName: short.optional(),
  CountryCode: short.optional(),
  CountrySubDivisionCode: short.optional(),
  CityName: short.optional(),
}).passthrough();
const remuneration = z.object({
  MinimumRange: z.union([z.string(), z.number()]).optional(),
  MaximumRange: z.union([z.string(), z.number()]).optional(),
  RateIntervalCode: short.optional(),
  Description: short.optional(),
}).passthrough();
const formatted = z.object({ Content: short.optional(), Label: short.optional() }).passthrough();
/** Fields=Full returns some announcement sections as a string and others as a string array. */
const longText = z.string().max(400000);
const textBlock = z.union([longText, z.array(longText).max(200)]).transform((v) => (Array.isArray(v) ? v.filter(Boolean).join("\n") : v));
const count = z.preprocess(
  (v) => (v === "" || v == null ? undefined : typeof v === "string" ? Number(v) : v),
  z.number().int().nonnegative().optional(),
);
export const usaJobsDescriptor = z.object({
  PositionID: short.optional(),
  PositionTitle: short,
  PositionURI: z.string().optional(),
  ApplyURI: z.array(z.string()).max(10).optional(),
  PositionLocationDisplay: short.optional(),
  PositionLocation: z.array(location).max(200).optional(),
  OrganizationName: short.optional(),
  DepartmentName: short.optional(),
  PositionSchedule: z.array(named).max(10).optional(),
  PositionRemuneration: z.array(remuneration).max(10).optional(),
  QualificationSummary: textBlock.optional(),
  PositionFormattedDescription: z.array(formatted).max(50).optional(),
  PublicationStartDate: z.string().optional(),
  PositionStartDate: z.string().optional(),
  ApplicationCloseDate: z.string().optional(),
  PositionEndDate: z.string().optional(),
  UserArea: z.object({
    Details: z.object({
      JobSummary: textBlock.optional(),
      MajorDuties: textBlock.optional(),
      SubAgencyName: short.optional(),
    }).passthrough().optional(),
  }).passthrough().optional(),
}).passthrough();
export const usaJobsItem = z.object({
  MatchedObjectId: z.union([z.string(), z.number()]),
  MatchedObjectDescriptor: usaJobsDescriptor,
}).passthrough();
export type UsaJobsItem = z.infer<typeof usaJobsItem>;
export const usaJobsSearch = z.object({
  SearchResult: z.object({
    SearchResultCount: count,
    SearchResultCountAll: count,
    SearchResultItems: z.array(z.unknown()).max(20000).optional().default([]),
    UserArea: z.object({
      NumberOfPages: z.union([z.string(), z.number()]).optional(),
    }).passthrough().optional(),
  }).passthrough(),
}).passthrough();
function itemsFromPage(page: z.infer<typeof usaJobsSearch>): UsaJobsItem[] {
  const items: UsaJobsItem[] = [];
  for (const raw of page.SearchResult.SearchResultItems) {
    const parsed = usaJobsItem.safeParse(raw);
    if (parsed.success) items.push(parsed.data);
  }
  return items;
}
/** Keep a valid announcement when a sibling row in the same page is malformed. */
export function usaJobsItems(payload: unknown): UsaJobsItem[] {
  return itemsFromPage(usaJobsSearch.parse(payload));
}

const TITLE_TERMS = [
  /\bartificial intelligence\b/i,
  /\bmachine[- ]learning\b/i,
  /\bdeep[- ]learning\b/i,
  /\bdata scientists?\b/i,
  /\bdata science\b/i,
  /\bneural networks?\b/i,
  /\bnatural language processing\b/i,
  /\bcomputer vision\b/i,
  /\blarge language models?\b/i,
  /\bgenerative ai\b/i,
  /\breinforcement learning\b/i,
  /\bmlops\b/i,
  /\bgenai\b/i,
  /\baiops\b/i,
  /\bai[/\- ]ml\b/i,
  /\bml[/\- ]ai\b/i,
  /\bml\b/i,
  /\bllms?\b/i,
  /\bnlp\b/i,
  /\bai\b/i,
];
/** Body matches require spelled-out AI terms so keyword "AI" does not keep "available"/"aid" hits. */
const BODY_TERMS = [
  /\bartificial intelligence\b/i,
  /\bmachine[- ]learning\b/i,
  /\bdeep[- ]learning\b/i,
  /\bdata scientists?\b/i,
  /\bdata science\b/i,
  /\blarge language models?\b/i,
  /\bgenerative ai\b/i,
  /\bneural networks?\b/i,
  /\bnatural language processing\b/i,
  /\breinforcement learning\b/i,
  /\bcomputer vision\b/i,
];

export function isRelevantAiJob(title: string, description: string): boolean {
  if (TITLE_TERMS.some((re) => re.test(title))) return true;
  return BODY_TERMS.some((re) => re.test(description));
}

/**
 * USAJOBS dates are often YYYY-MM-DD, or DateTime with extra fractional digits
 * and no offset. Reject anything else rather than asking Date.parse to guess.
 */
export function parseUsaJobsInstant(value: string | undefined | null): number | null {
  if (!value) return null;
  const s = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (dateOnly) {
    const t = Date.parse(`${dateOnly[0]}T00:00:00.000Z`);
    return Number.isFinite(t) ? t : null;
  }
  const dt = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})?$/.exec(s);
  if (!dt) return null;
  const frac = dt[2] ? dt[2].slice(0, 4).padEnd(4, "0") : ".000";
  const t = Date.parse(`${dt[1]}${frac}${dt[3] ?? "Z"}`);
  return Number.isFinite(t) ? t : null;
}

/** Date-only midnight timestamps stay open through that UTC calendar day. */
export function usajobsCloseMs(value: string | undefined | null): number | null {
  const t = parseUsaJobsInstant(value);
  if (t === null) return null;
  const d = new Date(t);
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0) {
    return t + 86400000 - 1;
  }
  return t;
}

export function isOpenUsaJob(descriptor: { ApplicationCloseDate?: string; PositionEndDate?: string }, now = Date.now()): boolean {
  const close = usajobsCloseMs(descriptor.ApplicationCloseDate ?? descriptor.PositionEndDate);
  return close === null || close >= now;
}

/** Feed text is displayed only as React text nodes. Strip tags; truncate rather than reject a long agency name. */
function clip(value: string | undefined | null, max = 240): string | null {
  if (!value) return null;
  const s = value.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  return s || null;
}

function closeIso(value?: string | null): string | null {
  const t = usajobsCloseMs(value);
  return t === null ? null : new Date(t).toISOString();
}

function isoDate(value?: string | null): string | null {
  const t = parseUsaJobsInstant(value);
  return t === null ? null : new Date(t).toISOString();
}

function money(value: string | number | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const PERIOD: Record<string, "hour" | "day" | "week" | "month" | "year"> = {
  PA: "year", PH: "hour", PW: "week", PM: "month", PD: "day",
  "PER YEAR": "year", "PER HOUR": "hour", "PER WEEK": "week", "PER MONTH": "month", "PER DAY": "day",
};

function salaries(rows: z.infer<typeof remuneration>[] | undefined): NormalizedJob["salaries"] {
  const out: NormalizedJob["salaries"] = [];
  for (const row of rows ?? []) {
    const period = PERIOD[(row.RateIntervalCode ?? row.Description ?? "").trim().toUpperCase()];
    const min = money(row.MinimumRange);
    const max = money(row.MaximumRange);
    if (!period || (min === null && max === null)) continue;
    const parsed = Salary.safeParse({ min, max, currency: "USD", period, label: null, source_status: "employer-provided" });
    if (parsed.success) out.push(parsed.data);
  }
  return out.slice(0, 30);
}

function employment(rows: z.infer<typeof named>[] | undefined): NormalizedJob["employment_type"] {
  const code = String(rows?.[0]?.Code ?? "");
  if (code === "1") return "full-time";
  if (code === "2") return "part-time";
  const name = (rows?.[0]?.Name ?? "").toLowerCase();
  if (name.includes("full")) return "full-time";
  if (name.includes("part")) return "part-time";
  return "unknown";
}

function locationsOf(d: z.infer<typeof usaJobsDescriptor>): { locations: string[]; countries: string[] } {
  const places = (d.PositionLocation ?? []).map((l) => clip(l.LocationName ?? l.CityName)).filter((x): x is string => Boolean(x));
  const display = clip(d.PositionLocationDisplay);
  const locations = [...new Set(places.length ? places : display ? [display] : [])].sort();
  const countries = [...new Set((d.PositionLocation ?? []).map((l) => clip(l.CountryCode, 100)).filter((x): x is string => Boolean(x)))].sort();
  return { locations: locations.slice(0, 50), countries: countries.slice(0, 50) };
}

export function usaJobsDescriptionText(d: z.infer<typeof usaJobsDescriptor>): string {
  return [
    d.UserArea?.Details?.JobSummary,
    d.QualificationSummary,
    d.UserArea?.Details?.MajorDuties,
    ...(d.PositionFormattedDescription ?? []).map((p) => p.Content),
  ].filter((x): x is string => Boolean(x)).join("\n");
}

function descriptionHtml(d: z.infer<typeof usaJobsDescriptor>): string | null {
  const parts: string[] = [];
  const push = (heading: string | null, body: string | undefined) => {
    if (!body?.trim()) return;
    if (heading) parts.push(`<h2>${heading}</h2>`);
    parts.push(`<p>${body}</p>`);
  };
  push(null, d.UserArea?.Details?.JobSummary ?? d.QualificationSummary);
  push("Duties", d.UserArea?.Details?.MajorDuties);
  const teaser = d.PositionFormattedDescription?.find((p) => p.Content?.trim())?.Content;
  if (teaser && teaser !== d.UserArea?.Details?.JobSummary && teaser !== d.QualificationSummary) push(null, teaser);
  return parts.length ? parts.join("") : null;
}

function controlNumber(id: string | number): string | null {
  const s = String(id).trim();
  return /^[A-Za-z0-9_-]{1,100}$/.test(s) ? s : null;
}

export function mapUsaJobsItem(item: UsaJobsItem, org: string, c: Careers, now = Date.now()): { job: NormalizedJob; html: string | null } | null {
  if (c.source.type !== "usajobs") throw new FeedError("payload");
  const id = controlNumber(item.MatchedObjectId);
  const d = item.MatchedObjectDescriptor;
  if (!id || !d.PositionTitle) return null;
  if (!isOpenUsaJob(d, now)) return null;
  const body = usaJobsDescriptionText(d);
  if (!isRelevantAiJob(d.PositionTitle, body)) return null;
  const official = d.PositionURI || d.ApplyURI?.[0];
  if (!official) return null;
  const title = clip(d.PositionTitle);
  if (!title) return null;
  const { locations, countries } = locationsOf(d);
  const remote = locations.some((l) => /\bremote\b/i.test(l));
  const agency = clip(d.OrganizationName) ?? clip(d.DepartmentName);
  const department = clip(d.DepartmentName);
  const job: NormalizedJob = {
    id: `${org}:${c.source.type}:${c.source.identifier}:${id}`,
    source_job_id: id,
    organization_slug: org,
    source_type: c.source.type,
    source_identifier: c.source.identifier,
    source_url: endpoint(c),
    title,
    official_url: postingUrl(official, c),
    apply_url: d.ApplyURI?.[0] ? postingUrl(d.ApplyURI[0], c) : null,
    requisition_id: clip(d.PositionID, 100),
    locations,
    countries,
    workplace: remote ? "remote" : "unknown",
    remote: remote ? true : null,
    employment_type: employment(d.PositionSchedule),
    department: agency,
    team: department && department !== agency ? department : clip(d.UserArea?.Details?.SubAgencyName),
    salaries: salaries(d.PositionRemuneration),
    posted_at: isoDate(d.PublicationStartDate ?? d.PositionStartDate),
    posted_date_kind: d.PublicationStartDate || d.PositionStartDate ? "first-published" : null,
    // The announcement's stated application close date, emitted as JobPosting validThrough.
    valid_through: closeIso(d.ApplicationCloseDate),
  };
  return { job, html: descriptionHtml(d) };
}

/** Deduplicate by USAJOBS control number; first occurrence wins (earlier keyword). */
export function rowsUsaJobs(payload: unknown, org: string, c: Careers, now = Date.now()): { job: NormalizedJob; html: string | null }[] {
  const seen = new Set<string>();
  const rows: { job: NormalizedJob; html: string | null }[] = [];
  for (const item of usaJobsItems(payload)) {
    const mapped = mapUsaJobsItem(item, org, c, now);
    if (!mapped || seen.has(mapped.job.source_job_id)) continue;
    seen.add(mapped.job.source_job_id);
    rows.push(mapped);
  }
  return rows.sort((a, b) => a.job.id.localeCompare(b.job.id, "en"));
}

export function searchUrl(keyword: string, page: number): string {
  const u = new URL(USAJOBS_SEARCH_URL);
  u.searchParams.set("Keyword", keyword);
  u.searchParams.set("ResultsPerPage", String(USAJOBS_RESULTS_PER_PAGE));
  u.searchParams.set("Page", String(page));
  u.searchParams.set("Fields", "Full");
  u.searchParams.set("HiringPath", "public");
  return u.href;
}

function pagesOf(payload: z.infer<typeof usaJobsSearch>): number {
  const raw = payload.SearchResult.UserArea?.NumberOfPages;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (Number.isFinite(n) && n >= 1) return Math.min(Math.ceil(n), USAJOBS_MAX_PAGES_PER_KEYWORD);
  const total = payload.SearchResult.SearchResultCountAll ?? payload.SearchResult.SearchResultItems.length;
  return Math.min(Math.max(1, Math.ceil(total / USAJOBS_RESULTS_PER_PAGE)), USAJOBS_MAX_PAGES_PER_KEYWORD);
}

async function getJson(
  url: string,
  creds: UsaJobsCredentials,
  fetcher: typeof fetch,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetcher(url, {
      redirect: "error",
      signal: controller.signal,
      credentials: "omit",
      headers: {
        Accept: "application/json",
        Host: USAJOBS_HOST,
        "User-Agent": creds.userAgent,
        "Authorization-Key": creds.key,
      },
    });
    return await readJsonBody(response);
  } catch (e) {
    if (e instanceof FeedError) throw e;
    throw new FeedError(e instanceof SyntaxError ? "payload" : "network");
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Paginate each keyword within API limits and return the combined search envelope.
 * Callers must skip this when usajobsCredentials() is null.
 */
export async function fetchUsaJobsItems(
  creds: UsaJobsCredentials,
  fetcher: typeof fetch = fetch,
  delayMs: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<UsaJobsItem[]> {
  const byId = new Map<string, UsaJobsItem>();
  for (const keyword of USAJOBS_KEYWORDS) {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      if (byId.size || page > 1) await delayMs(1000);
      const payload = usaJobsSearch.parse(await getJson(searchUrl(keyword, page), creds, fetcher));
      const totalAll = payload.SearchResult.SearchResultCountAll ?? 0;
      if (page === 1) {
        totalPages = pagesOf(payload);
        if (totalAll > USAJOBS_RESULTS_PER_PAGE * USAJOBS_MAX_PAGES_PER_KEYWORD) throw new FeedError("payload");
      }
      for (const item of itemsFromPage(payload)) {
        const id = controlNumber(item.MatchedObjectId);
        if (id && !byId.has(id)) byId.set(id, item);
      }
      page += 1;
    }
  }
  return [...byId.values()];
}

export function usaJobsPayload(items: UsaJobsItem[]): unknown {
  return { SearchResult: { SearchResultCount: items.length, SearchResultCountAll: items.length, SearchResultItems: items } };
}
