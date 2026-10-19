/**
 * AI pay pages (/jobs/pay/, /jobs/pay/<role>/) and the pay section of each
 * employer page, computed from disclosed pay only. Build-time only.
 *
 * Method (also shown on the pages):
 * - Listings: current listings in the directory's default view (a U.S.
 *   location, or no location that can be read), from the same snapshot and
 *   "current" rule as /jobs/.
 * - Pay: yearly U.S.-dollar base ranges with both ends stated. The feed's own
 *   salary is used when it has one; otherwise a range the employer's job
 *   description states (lib/jobs/pay-text.ts), labelled as such. A listing
 *   with several yearly ranges (location tiers) counts once, from its lowest
 *   lower end to its highest upper end. Hourly, monthly, open-ended, and
 *   non-dollar pay are left out, and so are ranges labelled as on-target
 *   earnings, commission, bonus, equity, or total compensation; nothing is
 *   converted or annualized.
 * - Each listing contributes the midpoint of its range. The page reports how
 *   many listings have pay, the median midpoint, and the middle range (25th to
 *   75th percentile, linear interpolation between the nearest ranks).
 * - A range whose lower end is under $10,000 or whose upper end is over
 *   $2,000,000 is not a plausible yearly base salary and is left out (counted).
 * - A group is published only with at least MIN_PAY_LISTINGS listings with pay.
 * - No trend: the site keeps no history of listings or pay, so none is shown.
 */
import type { Catalog } from "../catalog";
import { jobPages } from "./job-pages";
import { isRemoteListing } from "./geo";
import { readJobsForBuild } from "./load";
import { JOB_ROLES, type JobRole } from "./roles";
import { DEFAULT_JOB_FILTERS, filterJobs, serializeJobFilters, toJobItem, type JobFilters, type JobItem } from "./search";
import type { FeedHealth } from "./schema";

export const MIN_PAY_LISTINGS = 10;
export const PAY_INDEX = "/jobs/pay/";
export const payRoleHref = (slug: string) => `/jobs/pay/${slug}/`;
/** Rows shown in a page's table; the rest are one link away in the directory. */
export const PAY_TABLE_ROWS = 250;
const MIN_YEARLY = 10_000;
/** Labels that mark a range as more than base pay (on-target earnings include commission). */
const NOT_BASE = /\b(?:on[- ]target|OTE|commission|bonus|equity|variable|total comp(?:ensation)?)\b/i;
const MAX_YEARLY = 2_000_000;

type Salary = JobItem["salaries"][number];

export type PayRange = { min: number; max: number; mid: number; source: Salary["source_status"] };

/** One listing's yearly U.S.-dollar base range, or null (see the method above). `implausible` when it fails the bounds. */
export function yearlyUsdRange(salaries: Salary[]): PayRange | "implausible" | null {
  const usable = salaries.filter((s) => s.currency === "USD" && s.period === "year" && s.min !== null && s.max !== null && !NOT_BASE.test(s.label ?? ""));
  if (!usable.length) return null;
  const feed = usable.filter((s) => s.source_status === "employer-provided");
  const pick = feed.length ? feed : usable;
  const min = Math.min(...pick.map((s) => s.min!));
  const max = Math.max(...pick.map((s) => s.max!));
  if (min < MIN_YEARLY || max > MAX_YEARLY) return "implausible";
  return { min, max, mid: (min + max) / 2, source: pick[0].source_status };
}

/** The p-th quantile (0–1) of sorted values, interpolating linearly between the nearest ranks. */
export function quantile(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export type PayRow = { job: JobItem; range: PayRange; remote: boolean; path: string | null };

export type PayStats = {
  /** Listings in the group (with or without pay). */
  listings: number;
  /** Listings with a usable yearly U.S.-dollar range. */
  count: number;
  median: number;
  p25: number;
  p75: number;
  remote: number;
  fromDescription: number;
  implausible: number;
  /** Highest midpoint first. */
  rows: PayRow[];
  /** Newest first_seen among the listings with pay: the page's honest last-modified date. */
  newestFirstSeen: string | null;
  lastChecked: string | null;
};

export function payStats(jobs: JobItem[], paths: Map<string, string> = new Map()): PayStats {
  const rows: PayRow[] = [];
  let implausible = 0;
  for (const job of jobs) {
    const range = yearlyUsdRange(job.salaries);
    if (range === "implausible") implausible++;
    if (!range || range === "implausible") continue;
    rows.push({ job, range, remote: isRemoteListing(job), path: paths.get(job.id) ?? null });
  }
  rows.sort((a, b) => b.range.mid - a.range.mid || (a.job.title < b.job.title ? -1 : a.job.title > b.job.title ? 1 : 0));
  const mids = rows.map((r) => r.range.mid).sort((a, b) => a - b);
  const firstSeen = rows.map((r) => r.job.first_seen).sort();
  const checked = rows.map((r) => r.job.last_seen).sort();
  return {
    listings: jobs.length,
    count: rows.length,
    median: quantile(mids, 0.5),
    p25: quantile(mids, 0.25),
    p75: quantile(mids, 0.75),
    remote: rows.filter((r) => r.remote).length,
    fromDescription: rows.filter((r) => r.range.source === "employer-description").length,
    implausible,
    rows,
    newestFirstSeen: firstSeen.at(-1) ?? null,
    lastChecked: checked.at(-1) ?? null,
  };
}

export type PayGroup = {
  kind: "all" | "role" | "employer";
  slug: string;
  name: string;
  /** The pay page (roles and all) or the employer's jobs page (employers). */
  path: string;
  /** /jobs/?… listing the same jobs with pay shown, highest pay first. */
  directoryHref: string;
  stats: PayStats;
  role: JobRole | null;
};

export type PayData = { all: PayGroup; roles: PayGroup[]; employers: PayGroup[]; buildAt: string };

const memo = new WeakMap<Catalog, PayData>();

export function computePayData(catalog: Catalog, items: JobItem[], feeds: FeedHealth[], now: number, paths: Map<string, string>): PayData {
  const base: JobFilters = { ...DEFAULT_JOB_FILTERS, sort: "newest" };
  const dir = (extra: Partial<JobFilters>) => `/jobs/?${serializeJobFilters({ ...DEFAULT_JOB_FILTERS, ...extra, salary: true, sort: "pay" })}`;
  const current = filterJobs(items, feeds, base, now);
  const all: PayGroup = { kind: "all", slug: "all", name: "All AI jobs", path: PAY_INDEX, directoryHref: dir({}), stats: payStats(current, paths), role: null };
  const roles = JOB_ROLES.map((role) => ({
    kind: "role" as const,
    slug: role.slug,
    name: role.name,
    path: payRoleHref(role.slug),
    directoryHref: dir({ role: role.slug }),
    stats: payStats(filterJobs(items, feeds, { ...base, role: role.slug }, now), paths),
    role,
  }))
    .filter((g) => g.stats.count >= MIN_PAY_LISTINGS)
    .sort((a, b) => b.stats.median - a.stats.median || a.name.localeCompare(b.name, "en"));
  const byOrg = new Map<string, JobItem[]>();
  for (const j of current) (byOrg.get(j.organization_slug) ?? byOrg.set(j.organization_slug, []).get(j.organization_slug)!).push(j);
  const employers = [...byOrg]
    .map(([slug, jobs]) => ({
      kind: "employer" as const,
      slug,
      name: catalog.organization(slug)?.name ?? slug,
      path: `/jobs/at/${slug}/`,
      directoryHref: dir({ company: slug }),
      stats: payStats(jobs, paths),
      role: null,
    }))
    .filter((g) => g.stats.count >= MIN_PAY_LISTINGS)
    .sort((a, b) => b.stats.median - a.stats.median || a.name.localeCompare(b.name, "en"));
  return { all, roles, employers, buildAt: new Date(now).toISOString() };
}

/** Pay data for this build (data/jobs/current.json at the catalog's build time); computed once per catalog. */
export function payData(catalog: Catalog): PayData {
  const hit = memo.get(catalog);
  if (hit) return hit;
  const now = Date.parse(catalog.buildAt);
  const data = readJobsForBuild(catalog.organizations, now);
  const names = new Map(catalog.organizations.map((o) => [o.slug, o.name]));
  const items = data.jobs
    .filter((j) => j.status === "open" && catalog.organization(j.organization_slug) && catalog.isActiveOrganization(j.organization_slug))
    .map((j) => toJobItem(j, names.get(j.organization_slug)!));
  const paths = new Map(jobPages(catalog).map((p) => [p.job.id, p.path]));
  const result = computePayData(catalog, items, data.feeds, now, paths);
  memo.set(catalog, result);
  return result;
}

export const payRole = (catalog: Catalog, slug: string) => payData(catalog).roles.find((g) => g.slug === slug);
export const payEmployer = (catalog: Catalog, slug: string) => payData(catalog).employers.find((g) => g.slug === slug);

/** "$187K" (nearest thousand). */
export const kUsd = (v: number) => `$${Math.round(v / 1000).toLocaleString("en-US")}K`;
export const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "0%");

/** Sitemap entries for the role pay pages (the index is a fixed route), dated by the newest listing with pay. */
export function paySitemap(catalog: Catalog): { path: string; lastModified: string | undefined }[] {
  return payData(catalog).roles.map((g) => ({ path: g.path, lastModified: g.stats.newestFirstSeen?.slice(0, 10) }));
}
