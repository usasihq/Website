import type { Job, FeedHealth } from "./schema";
import { JOB_ROLES, jobRole } from "./roles";
import { isExpressionOfInterest, JOB_TRACKS, jobTrack } from "./tracks";
import { annualUsdTop, jobCategory, jobLevel, JOB_CATEGORIES, JOB_LEVELS, PAY_THRESHOLDS } from "./levels";
import { cityHubBySlug, listingMatchesCityHub } from "./city-hubs";
import { CITY_SLUG_ALIASES, cityKey, DEFAULT_LOCATION_SCOPE, inLocationScope, jobGeography, LOCATION_SCOPES, type LocationScope } from "./geo";
import { parseWhere } from "./where";
import { US_STATES } from "../places";
export const STALE_MS = 48 * 3600000;
/** The fields the Jobs directory reads. Reconciliation bookkeeping stays out of the page and its data file. */
export type JobItem = Pick<Job, "id" | "organization_slug" | "source_type" | "source_identifier" | "source_job_id" | "source_url" | "title" |
  "locations" | "countries" | "workplace" | "employment_type" | "department" | "team" | "salaries" | "official_url" | "posted_at" |
  "posted_date_kind" | "first_seen" | "last_seen" | "status"> & { organization_name: string };
export function toJobItem(j: Job, organization_name: string): JobItem {
  return { id: j.id, organization_slug: j.organization_slug, source_type: j.source_type, source_identifier: j.source_identifier,
    source_job_id: j.source_job_id, source_url: j.source_url, title: j.title, locations: j.locations, countries: j.countries,
    workplace: j.workplace, employment_type: j.employment_type, department: j.department, team: j.team, salaries: j.salaries,
    official_url: j.official_url, posted_at: j.posted_at, posted_date_kind: j.posted_date_kind, first_seen: j.first_seen, last_seen: j.last_seen, status: j.status,
    organization_name };
}
export function isCurrent(job: Pick<Job, "status" | "last_seen">, feed: FeedHealth | undefined, now: number): boolean {
  return job.status === "open" && feed?.result === "ok" && now >= Date.parse(job.last_seen) && now - Date.parse(job.last_seen) <= STALE_MS;
}
export function checkedLabel(value: string | null): string {
  return value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC" : "Not yet successfully checked";
}
export const DEFAULT_JOB_FILTERS = { q: "", track: "", role: "", level: "", category: "", pay: "", company: "", department: "", location: "", state: "", city: "", metro: "", where: DEFAULT_LOCATION_SCOPE as LocationScope, workplace: "", employment: "", salary: false,
  currency: "", period: "", salary_min: "", posted: "", verified: "", view: "current", sort: "verified", page: 1 };
export type JobFilters = typeof DEFAULT_JOB_FILTERS;
/**
 * Every current listing, in every country. Landing pages, reports, and links that mean "all of
 * this employer's or role's listings" start here, so the directory's U.S. default never narrows them.
 */
export const ALL_JOB_FILTERS: JobFilters = { ...DEFAULT_JOB_FILTERS, where: "all" };
const clean = (v: string | null, max = 120) => (v ?? "").trim().slice(0, max);
const choice = (v: string | null, values: string[], fallback = "") => v && values.includes(v) ? v : fallback;
export function parseJobFilters(p: URLSearchParams): JobFilters {
  const currency = /^[A-Z]{3}$/.test(p.get("currency") ?? "") ? p.get("currency")! : "";
  const period = choice(p.get("period"), ["hour", "day", "week", "month", "year"]);
  const min = p.get("salary_min") ?? "";
  const state = choice((p.get("state") ?? "").toUpperCase(), Object.keys(US_STATES));
  // A city is a slug within a state ("state=CA&city=san-francisco"); without a state it means nothing.
  const rawCity = state && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.get("city") ?? "") ? p.get("city")!.slice(0, 60) : "";
  // A renamed city slug ("longmont-max") still selects the city.
  const city = rawCity && CITY_SLUG_ALIASES[`${state}|${rawCity}`] ? CITY_SLUG_ALIASES[`${state}|${rawCity}`].slice(3) : rawCity;
  const metroRaw = p.get("metro") ?? "";
  const metro = cityHubBySlug(metroRaw)?.slug ?? "";
  // "w" is the search form's "Where" box submitted without JavaScript (method="get"); it reads like typing it in.
  const typed = !p.has("where") && !state && !p.get("location") && p.get("w")?.trim() ? parseWhere(p.get("w")!.slice(0, 120)) : null;
  if (typed) {
    const rest = new URLSearchParams(p);
    rest.delete("w");
    for (const [k, v] of Object.entries(typed)) if (v) rest.set(k, v);
    return parseJobFilters(rest);
  }
  return { q: clean(p.get("q"), 200), track: choice(p.get("track"), JOB_TRACKS.map(t => t.id)), role: choice(p.get("role"), JOB_ROLES.map(r => r.slug)), level: choice(p.get("level"), JOB_LEVELS.map(l => l.id)), category: choice(p.get("category"), JOB_CATEGORIES.map(c => c.id)), pay: choice(p.get("pay"), [...PAY_THRESHOLDS]), company: clean(p.get("company")), department: clean(p.get("department")), location: clean(p.get("location")),
    state, city, metro,
    where: choice(p.get("where"), [...LOCATION_SCOPES], DEFAULT_LOCATION_SCOPE) as LocationScope,
    workplace: p.get("remote") === "1" ? "remote" : choice(p.get("workplace"), ["remote", "hybrid", "on-site", "unknown"]),
    employment: choice(p.get("employment"), ["full-time", "part-time", "contract", "temporary", "internship", "unknown"]),
    salary: p.get("salary") === "1", currency, period,
    salary_min: currency && period && /^\d{1,9}(\.\d{1,2})?$/.test(min) ? min : "",
    posted: choice(p.get("posted"), ["1", "3", "7", "30"]), verified: choice(p.get("verified"), ["24", "48"]),
    view: choice(p.get("view"), ["current", "unverified"], "current"), sort: choice(p.get("sort"), ["verified", "newest", "pay", "company", "title"], "verified"),
    page: /^\d{1,4}$/.test(p.get("page") ?? "") ? Math.max(1, Number(p.get("page"))) : 1 };
}
export function serializeJobFilters(f: JobFilters): string {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(f)) if (value !== DEFAULT_JOB_FILTERS[key as keyof JobFilters] && value !== "") p.set(key, typeof value === "boolean" ? "1" : String(value));
  return p.toString();
}
const normalize = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Lowercase words separated by single spaces, for whole-word matching. */
const words = (s: string) => ` ${normalize(s).replace(/[^a-z0-9+#.]+/g, " ").trim()} `;

/** Job-search abbreviations and the words they stand for; a query matches any form in its group. */
export const JOB_SYNONYMS: string[][] = [
  ["ml", "machine learning"], ["ai", "artificial intelligence"], ["swe", "software engineer"], ["sde", "software development engineer"],
  ["pm", "product manager"], ["tpm", "technical program manager"], ["sre", "site reliability"], ["ux", "user experience"],
  ["nlp", "natural language processing"], ["llm", "large language model"], ["gtm", "go to market"], ["hr", "human resources"],
  ["mgr", "manager"], ["sr", "senior"], ["jr", "junior"], ["intern", "internship"], ["infra", "infrastructure"], ["mts", "member of technical staff"],
  ["rl", "reinforcement learning"], ["cv", "computer vision"], ["ae", "account executive"], ["sdr", "sales development representative"],
  ["bd", "business development"], ["qa", "quality assurance"], ["ds", "data scientist"], ["eng", "engineer", "engineering"],
  ["fde", "forward deployed", "forward deployed engineer"],
];

/**
 * A search query as groups of alternatives. Every group must match somewhere in a
 * listing. Words of three letters or fewer match whole words only ("go" does not
 * match "Chicago"); longer words match inside words ("engineer" matches
 * "engineering"); phrases match from the start of a word ("software engineer"
 * matches "Software Engineering Manager").
 */
export function jobQuery(q: string): string[][] {
  let text = words(q);
  const groups: string[][] = [];
  // Spelled-out phrases first ("machine learning" also matches "ML"), longest first.
  const forms = JOB_SYNONYMS.flatMap((g) => g.map((f) => ({ f, g }))).sort((a, b) => b.f.length - a.f.length);
  for (const { f, g } of forms) {
    if (!f.includes(" ")) continue;
    if (text.includes(` ${f} `)) {
      groups.push(g);
      text = text.replace(` ${f} `, " ");
    }
  }
  for (const w of text.trim().split(" ").filter(Boolean)) {
    const g = JOB_SYNONYMS.find((group) => group.includes(w));
    groups.push(g ?? [w]);
  }
  return groups;
}
const hasTerm = (text: string, term: string) =>
  term.length <= 3 ? text.includes(` ${term} `) : term.includes(" ") ? text.includes(` ${term}`) : text.includes(term);
const matchesGroup = (text: string, group: string[]) => group.some((t) => hasTerm(text, t));
const collator = new Intl.Collator("en");
const byCode = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/**
 * When the listing appeared: the employer's publication date when supplied and
 * not in the future, otherwise when USASI first saw it in the feed.
 */
export function postedTime(j: Pick<JobItem, "posted_at" | "first_seen">): number {
  const posted = j.posted_at ? Date.parse(j.posted_at) : NaN;
  const seen = Date.parse(j.first_seen);
  return Number.isFinite(posted) && posted <= seen + 86400000 ? posted : seen;
}
/** Currently confirmed rows, unsorted (for counts). */
export function currentJobs(items: JobItem[], feeds: FeedHealth[], now: number): JobItem[] {
  const health = new Map(feeds.map(v => [`${v.organization_slug}:${v.source_type}:${v.source_identifier}`, v]));
  return items.filter(j => isCurrent(j, health.get(`${j.organization_slug}:${j.source_type}:${j.source_identifier}`), now));
}
/** The listings matching `f`, in the directory's order (`sorted: false` skips ordering, for counts). */
export function filterJobs(items: JobItem[], feeds: FeedHealth[], f: JobFilters, now: number, sorted = true): JobItem[] {
  const health = new Map(feeds.map(v => [`${v.organization_slug}:${v.source_type}:${v.source_identifier}`, v]));
  const query = jobQuery(f.q);
  const city = f.city && f.state ? `${f.state}|${f.city}` : "";
  const rows = items.filter(j => {
    if (j.status !== "open") return false;
    const current = isCurrent(j, health.get(`${j.organization_slug}:${j.source_type}:${j.source_identifier}`), now);
    if (f.view === "current" ? !current : current) return false;
    if (f.track && !jobTrack(f.track)?.test(j)) return false;
    if (f.role && !jobRole(f.role)?.test(j.title)) return false;
    if (f.level && jobLevel(j.title) !== f.level) return false;
    if (f.category && jobCategory(j.title) !== f.category) return false;
    if (f.pay && (annualUsdTop(j.salaries) ?? 0) < Number(f.pay)) return false;
    if (f.company && j.organization_slug !== f.company) return false;
    if (f.department && j.department !== f.department) return false;
    if (f.location && !j.locations.some(l => normalize(l).includes(normalize(f.location)))) return false;
    if (f.state && !jobGeography(j).states.includes(f.state)) return false;
    if (city && !jobGeography(j).cities.some(c => cityKey(c) === city)) return false;
    if (f.metro) {
      const hub = cityHubBySlug(f.metro);
      if (!hub || !listingMatchesCityHub(j, hub)) return false;
    }
    if (f.where !== "all" && !inLocationScope(j, f.where)) return false;
    if (f.workplace && j.workplace !== f.workplace) return false;
    if (f.employment && j.employment_type !== f.employment) return false;
    if (f.salary && !j.salaries.length) return false;
    if ((f.currency || f.period || f.salary_min) && !j.salaries.some(s => (!f.currency || s.currency === f.currency) && (!f.period || s.period === f.period) && (!f.salary_min || (s.min !== null && s.min >= Number(f.salary_min))))) return false;
    if (f.posted && now - postedTime(j) > Number(f.posted) * 86400000) return false;
    if (f.verified && now - Date.parse(j.last_seen) > Number(f.verified) * 3600000) return false;
    if (!query.length) return true;
    const text = words([j.title, j.organization_name, j.department, j.team, ...j.locations, ...j.countries].join(" "));
    return query.every(g => matchesGroup(text, g));
  });
  if (!sorted) return rows;
  // With a search and the default order, listings whose title matches more of the query come first.
  const relevance = new Map<string, number>();
  if (query.length && f.sort === "verified") {
    for (const j of rows) {
      const title = words(j.title);
      const hits = query.filter(g => matchesGroup(title, g)).length;
      relevance.set(j.id, hits + (hits === query.length ? 1 : 0));
    }
  }
  // ISO timestamps and IDs sort correctly by code point; names use one shared collator (much faster than localeCompare per pair).
  // Sort keys are computed once per row, not once per comparison.
  const keys = new Map(rows.map(j => [j, { posted: postedTime(j), eoi: Number(isExpressionOfInterest(j.title)), pay: annualUsdTop(j.salaries) ?? -1 }]));
  return rows.sort((a,b) => {
    const ka = keys.get(a)!, kb = keys.get(b)!;
    const rel = (relevance.get(b.id) ?? 0) - (relevance.get(a.id) ?? 0);
    if (rel) return rel;
    // Equally good matches: newest listing first.
    if (relevance.size) { const fresh = kb.posted - ka.posted; if (fresh) return fresh; }
    // General expressions of interest are not specific vacancies: they go last unless sorting by name.
    if (f.sort !== "company" && f.sort !== "title") {
      const eoi = ka.eoi - kb.eoi;
      if (eoi) return eoi;
    }
    // The default order is newest first (the page and its links call it "Newest first").
    const order = f.sort === "newest" || f.sort === "verified" ? kb.posted - ka.posted : f.sort === "pay" ? kb.pay - ka.pay : f.sort === "verified" ? byCode(b.last_seen, a.last_seen) :
      f.sort === "company" ? collator.compare(a.organization_name, b.organization_name) : collator.compare(a.title, b.title);
    return order || collator.compare(a.title, b.title) || byCode(a.id, b.id);
  });
}
/** True when only the page number differs from the default (current) view. */
export function isDefaultJobView(f: JobFilters): boolean {
  return (Object.keys(DEFAULT_JOB_FILTERS) as Array<keyof JobFilters>).every(k => k === "page" || f[k] === DEFAULT_JOB_FILTERS[k]);
}
