/**
 * "Follow this search" on /jobs/: the job feed (RSS) that best matches the
 * directory's current filters. Client-safe and pure.
 *
 * A feed matches exactly when its page's filters are the same set of narrowing
 * filters as the search. Otherwise the closest feed is the one whose filters
 * are all part of the search (the most of them, then the smallest page), and
 * without one, the feed of all U.S. jobs. Sorting, paging, and the
 * verification view never narrow a feed. The default location scope ("U.S. or
 * location not stated") and "all countries" are treated alike, because
 * employer and role feeds list every country and state feeds are U.S. anyway.
 */
import { DEFAULT_JOB_FILTERS, type JobFilters } from "./search";

export type FollowFeed = {
  /** The feed's own address, e.g. /jobs/at/openai/feed.xml. */
  path: string;
  /** The page the feed follows, e.g. /jobs/at/openai/. */
  page: string;
  title: string;
  /** The page's directory filters. */
  filters: Partial<JobFilters>;
  /** Whether the feed lists positions outside the United States too. */
  includesOutside: boolean;
};

export type FollowMatch = {
  feed: FollowFeed;
  exact: boolean;
  /** Narrowing filters of the search that the feed does not apply. */
  unmatched: (keyof JobFilters)[];
};

const IGNORED = new Set<string>(["sort", "page", "view", "verified"]);

/** The filters that narrow a view, as key → value; empty and default values do not narrow. */
export function narrowingFilters(f: Partial<JobFilters>): Map<keyof JobFilters, string> {
  const out = new Map<keyof JobFilters, string>();
  for (const [k, v] of Object.entries(f) as [keyof JobFilters, unknown][]) {
    if (IGNORED.has(k) || v === undefined || v === null || v === "" || v === false) continue;
    if (k === "where" && (v === DEFAULT_JOB_FILTERS.where || v === "all")) continue;
    if (v === (DEFAULT_JOB_FILTERS as Record<string, unknown>)[k]) continue;
    out.set(k, String(v));
  }
  return out;
}

export function closestFeed(f: Partial<JobFilters>, feeds: FollowFeed[], fallback: FollowFeed): FollowMatch {
  const want = narrowingFilters(f);
  let best: { feed: FollowFeed; size: number } | null = null;
  for (const feed of feeds) {
    const have = narrowingFilters(feed.filters);
    if (!have.size) continue;
    let inside = true;
    for (const [k, v] of have) if (want.get(k) !== v) inside = false;
    if (!inside) continue;
    if (have.size === want.size) return { feed, exact: true, unmatched: [] };
    if (!best || have.size > best.size) best = { feed, size: have.size };
  }
  const feed = best?.feed ?? fallback;
  const have = narrowingFilters(feed.filters);
  return { feed, exact: want.size === 0 && !best, unmatched: [...want.keys()].filter((k) => !have.has(k)) };
}

/** Plain names for filters a feed leaves out ("search words", "pay"). */
export const FILTER_NAMES: Partial<Record<keyof JobFilters, string>> = {
  q: "search words",
  track: "career track",
  role: "role",
  level: "experience level",
  category: "job category",
  pay: "pay",
  company: "employer",
  department: "department",
  location: "location text",
  state: "state",
  city: "city",
  where: "remote or country",
  workplace: "workplace type",
  employment: "employment type",
  salary: "shows pay",
  currency: "salary currency",
  period: "salary period",
  salary_min: "minimum salary",
  posted: "date posted",
};
