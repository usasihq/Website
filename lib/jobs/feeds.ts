/**
 * Job feeds (RSS 2.0): /jobs/feed.xml (every current U.S. listing, or one with
 * no location that can be read: the directory's default view) and one feed per
 * existing role, topic, state, and employer page (<page>/feed.xml). Each feed
 * lists the page's JOB_FEED_LIMIT most recently published current listings.
 *
 * Every item links to the listing's own page on this site (also its guid), is
 * dated by the employer's publication date or, when the feed gives none, the
 * date USASI first saw it, and describes only facts from the listing. A
 * listing leaves its feeds when it leaves the directory. Build-time only.
 */
import type { Catalog } from "../catalog";
import { formatDate } from "../dates";
import { rssDocument, type RssItem } from "../rss";
import { displayLocation } from "./geo";
import { jobPages, jobPageTitle, shortOrg, type JobPage } from "./job-pages";
import { jobsLandingData, LISTINGS_SHOWN, type LandingPage } from "./landing";
import type { FollowFeed } from "./feed-match";
import { readJobsForBuild } from "./load";
import { DEFAULT_JOB_FILTERS, filterJobs, toJobItem, type JobItem } from "./search";

export const JOB_FEED_LIMIT = LISTINGS_SHOWN;
export const ALL_JOBS_FEED = "/jobs/feed.xml";
export const jobFeedPath = (pagePath: string) => `${pagePath}feed.xml`;
/** Feeds are written only at the landing's first-page path, never at `/page/n/feed.xml`. */
export const landingFeedPath = (page: Pick<LandingPage, "basePath">) => jobFeedPath(page.basePath);

const PER: Record<string, string> = { hour: "an hour", day: "a day", week: "a week", month: "a month", year: "a year" };
const money = (v: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "USD" && v < 1000 ? 2 : 0 }).format(v);

/** The listing's facts in one or two short sentences: employer, locations, workplace, and the first stated pay with its source. */
export function jobFeedDescription(p: Pick<JobPage, "job" | "org">): string {
  const { job } = p;
  const employer = job.source_type === "usajobs" && job.department ? job.department : shortOrg(p.org.name);
  const where = job.locations.map(displayLocation);
  const parts = [`${employer}. ${where.length ? `Location: ${where.slice(0, 3).join("; ")}${where.length > 3 ? ` and ${where.length - 3} more` : ""}.` : "Location not supplied."}`];
  if (job.workplace !== "unknown") parts.push(`Workplace: ${job.workplace}.`);
  const s = job.salaries[0];
  if (s) {
    const range = s.min !== null && s.max !== null ? `${money(s.min, s.currency)} to ${money(s.max, s.currency)}` : money((s.min ?? s.max)!, s.currency);
    parts.push(`Pay: ${range} ${PER[s.period] ?? `per ${s.period}`}, ${s.source_status === "employer-description" ? "as stated in the employer's job description" : "as the employer lists it"}.`);
  }
  parts.push(`First listed on USASI ${formatDate(job.first_seen.slice(0, 10))}.`);
  return parts.join(" ");
}

/** Feed items for listings that have a page on this site, in the given order. */
export function jobFeedItems(catalog: Catalog, jobs: Pick<JobItem, "id">[]): RssItem[] {
  const byId = new Map(jobPages(catalog).map((p) => [p.job.id, p]));
  const items: RssItem[] = [];
  for (const j of jobs) {
    const p = byId.get(j.id);
    if (!p) continue;
    items.push({ title: jobPageTitle(p), path: p.path, date: p.job.posted_at ?? p.job.first_seen, exact: true, category: shortOrg(p.org.name), description: jobFeedDescription(p) });
    if (items.length >= JOB_FEED_LIMIT) break;
  }
  return items;
}

const memo = new WeakMap<Catalog, JobItem[]>();
/** The directory's default view (U.S. or location not stated), newest first. */
function defaultView(catalog: Catalog): JobItem[] {
  const hit = memo.get(catalog);
  if (hit) return hit;
  const now = Date.parse(catalog.buildAt);
  const data = readJobsForBuild(catalog.organizations, now);
  const names = new Map(catalog.organizations.map((o) => [o.slug, o.name]));
  const items = data.jobs.filter((j) => j.status === "open" && names.has(j.organization_slug)).map((j) => toJobItem(j, names.get(j.organization_slug)!));
  const view = filterJobs(items, data.feeds, { ...DEFAULT_JOB_FILTERS, sort: "newest" }, now);
  memo.set(catalog, view);
  return view;
}

const ABOUT =
  "Each item links to the listing's page on USASI, which shows the employer's description and links to apply on the employer's site. Listings come from employers' own job boards; a listing leaves this feed when it leaves the directory.";

export function allJobsFeedXml(catalog: Catalog): string {
  return rssDocument({
    title: "USASI — New AI jobs in the U.S.",
    path: "/jobs/",
    selfPath: ALL_JOBS_FEED,
    description: `The ${JOB_FEED_LIMIT} most recently published current listings at U.S. AI companies and labs that name a U.S. location or no location that can be read (such as "Remote"). ${ABOUT}`,
    items: jobFeedItems(catalog, defaultView(catalog)),
  });
}

export function landingFeedXml(catalog: Catalog, page: LandingPage): string {
  return rssDocument({
    title: `USASI — ${page.h1}`,
    path: page.path,
    selfPath: jobFeedPath(page.path),
    description: `The ${JOB_FEED_LIMIT} most recently published current listings on the page "${page.h1}". ${ABOUT}`,
    items: jobFeedItems(catalog, page.listings),
  });
}

/** Pages with their own job feed: role, topic, state, and employer pages (not city pages). */
export function feedLandingPages(catalog: Catalog): LandingPage[] {
  const d = jobsLandingData(catalog);
  return [...d.roles, ...d.topics, ...d.states, ...d.companies];
}

export const hasJobFeed = (page: Pick<LandingPage, "kind">) => page.kind !== "city" && page.kind !== "metro" && page.kind !== "role-state";

export const ALL_JOBS_FOLLOW: FollowFeed = { path: ALL_JOBS_FEED, page: "/jobs/", title: "New AI jobs in the U.S.", filters: {}, includesOutside: false };

/** The feeds "Follow this search" chooses from (small: paths, names, and filters). */
export function followFeeds(catalog: Catalog): FollowFeed[] {
  return feedLandingPages(catalog).map((p) => ({
    path: jobFeedPath(p.path),
    page: p.path,
    title: p.h1,
    filters: p.filters,
    includesOutside: p.scope === "includes-outside",
  }));
}
