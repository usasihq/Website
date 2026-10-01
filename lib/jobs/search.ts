import type { Job, FeedHealth } from "./schema";
export const STALE_MS = 48 * 3600000;
/** The fields the Jobs directory reads. Reconciliation bookkeeping stays out of the page and its data file. */
export type JobItem = Pick<Job, "id" | "organization_slug" | "source_type" | "source_identifier" | "source_job_id" | "source_url" | "title" |
  "locations" | "countries" | "workplace" | "employment_type" | "department" | "team" | "salaries" | "official_url" | "posted_at" |
  "posted_date_kind" | "last_seen" | "status"> & { organization_name: string };
export function toJobItem(j: Job, organization_name: string): JobItem {
  return { id: j.id, organization_slug: j.organization_slug, source_type: j.source_type, source_identifier: j.source_identifier,
    source_job_id: j.source_job_id, source_url: j.source_url, title: j.title, locations: j.locations, countries: j.countries,
    workplace: j.workplace, employment_type: j.employment_type, department: j.department, team: j.team, salaries: j.salaries,
    official_url: j.official_url, posted_at: j.posted_at, posted_date_kind: j.posted_date_kind, last_seen: j.last_seen, status: j.status,
    organization_name };
}
export function isCurrent(job: Pick<Job, "status" | "last_seen">, feed: FeedHealth | undefined, now: number): boolean {
  return job.status === "open" && feed?.result === "ok" && now >= Date.parse(job.last_seen) && now - Date.parse(job.last_seen) <= STALE_MS;
}
export function checkedLabel(value: string | null): string {
  return value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC" : "Not yet successfully checked";
}
export const DEFAULT_JOB_FILTERS = { q: "", company: "", department: "", location: "", workplace: "", employment: "", salary: false,
  currency: "", period: "", salary_min: "", posted: "", verified: "", view: "current", sort: "verified", page: 1 };
export type JobFilters = typeof DEFAULT_JOB_FILTERS;
const clean = (v: string | null, max = 120) => (v ?? "").trim().slice(0, max);
const choice = (v: string | null, values: string[], fallback = "") => v && values.includes(v) ? v : fallback;
export function parseJobFilters(p: URLSearchParams): JobFilters {
  const currency = /^[A-Z]{3}$/.test(p.get("currency") ?? "") ? p.get("currency")! : "";
  const period = choice(p.get("period"), ["hour", "day", "week", "month", "year"]);
  const min = p.get("salary_min") ?? "";
  return { q: clean(p.get("q"), 200), company: clean(p.get("company")), department: clean(p.get("department")), location: clean(p.get("location")),
    workplace: p.get("remote") === "1" ? "remote" : choice(p.get("workplace"), ["remote", "hybrid", "on-site", "unknown"]),
    employment: choice(p.get("employment"), ["full-time", "part-time", "contract", "temporary", "internship", "unknown"]),
    salary: p.get("salary") === "1", currency, period,
    salary_min: currency && period && /^\d{1,9}(\.\d{1,2})?$/.test(min) ? min : "",
    posted: choice(p.get("posted"), ["7", "30"]), verified: choice(p.get("verified"), ["24", "48"]),
    view: choice(p.get("view"), ["current", "unverified"], "current"), sort: choice(p.get("sort"), ["verified", "newest", "company", "title"], "verified"),
    page: /^\d{1,4}$/.test(p.get("page") ?? "") ? Math.max(1, Number(p.get("page"))) : 1 };
}
export function serializeJobFilters(f: JobFilters): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(f)) if (value !== DEFAULT_JOB_FILTERS[key as keyof JobFilters] && value !== "") p.set(key, typeof value === "boolean" ? "1" : String(value));
  return p.toString();
}
const normalize = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const collator = new Intl.Collator("en");
const byCode = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** Currently confirmed rows, unsorted (for counts). */
export function currentJobs(items: JobItem[], feeds: FeedHealth[], now: number): JobItem[] {
  const health = new Map(feeds.map(v => [`${v.organization_slug}:${v.source_type}:${v.source_identifier}`, v]));
  return items.filter(j => isCurrent(j, health.get(`${j.organization_slug}:${j.source_type}:${j.source_identifier}`), now));
}
export function filterJobs(items: JobItem[], feeds: FeedHealth[], f: JobFilters, now: number): JobItem[] {
  const health = new Map(feeds.map(v => [`${v.organization_slug}:${v.source_type}:${v.source_identifier}`, v]));
  const words = normalize(f.q).split(/\s+/).filter(Boolean);
  const rows = items.filter(j => {
    if (j.status !== "open") return false;
    const current = isCurrent(j, health.get(`${j.organization_slug}:${j.source_type}:${j.source_identifier}`), now);
    if (f.view === "current" ? !current : current) return false;
    if (f.company && j.organization_slug !== f.company) return false;
    if (f.department && j.department !== f.department) return false;
    if (f.location && !j.locations.some(l => normalize(l).includes(normalize(f.location)))) return false;
    if (f.workplace && j.workplace !== f.workplace) return false;
    if (f.employment && j.employment_type !== f.employment) return false;
    if (f.salary && !j.salaries.length) return false;
    if ((f.currency || f.period || f.salary_min) && !j.salaries.some(s => (!f.currency || s.currency === f.currency) && (!f.period || s.period === f.period) && (!f.salary_min || (s.min !== null && s.min >= Number(f.salary_min))))) return false;
    if (f.posted && (!j.posted_at || now < Date.parse(j.posted_at) || now - Date.parse(j.posted_at) > Number(f.posted) * 86400000)) return false;
    if (f.verified && now - Date.parse(j.last_seen) > Number(f.verified) * 3600000) return false;
    if (!words.length) return true;
    const text = normalize([j.title, j.organization_name, j.department, j.team, ...j.locations, ...j.countries].join(" "));
    return words.every(w => text.includes(w));
  });
  // ISO timestamps and IDs sort correctly by code point; names use one shared collator (much faster than localeCompare per pair).
  return rows.sort((a,b) => {
    const order = f.sort === "newest" ? byCode(b.posted_at ?? "", a.posted_at ?? "") : f.sort === "verified" ? byCode(b.last_seen, a.last_seen) :
      f.sort === "company" ? collator.compare(a.organization_name, b.organization_name) : collator.compare(a.title, b.title);
    return order || collator.compare(a.title, b.title) || byCode(a.id, b.id);
  });
}
/** True when only the page number differs from the default (current) view. */
export function isDefaultJobView(f: JobFilters): boolean {
  return (Object.keys(DEFAULT_JOB_FILTERS) as Array<keyof JobFilters>).every(k => k === "page" || f[k] === DEFAULT_JOB_FILTERS[k]);
}
