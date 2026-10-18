import type { Catalog } from "../catalog";
import { readJobsForBuild } from "./load";
import { ALL_JOB_FILTERS, DEFAULT_JOB_FILTERS, filterJobs, toJobItem, type JobItem } from "./search";
import type { FeedHealth } from "./schema";

const uniq = (values: Array<string | null>) => [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b, "en"));

/**
 * Jobs directory data, shared by the /jobs/ page and the build's public/data/jobs.json.
 * The page embeds only the first page of the default view plus summary counts and
 * filter options; the browser loads the full list from jobs.json after first paint.
 */
export function jobsDirectoryData(catalog: Catalog): {
  items: JobItem[];
  feeds: FeedHealth[];
  initial: JobItem[];
  summary: { currentCount: number; defaultCount: number; organizationCount: number; currencies: string[]; periods: string[] };
} {
  const now = Date.parse(catalog.buildAt);
  const data = readJobsForBuild(catalog.organizations, now);
  const names = new Map(catalog.organizations.map((o) => [o.slug, o.name]));
  const items = data.jobs.filter((j) => j.status === "open").map((j) => toJobItem(j, names.get(j.organization_slug)!));
  // The headline counts every current listing; the first page and its count are the default view (U.S. or location not stated).
  const current = filterJobs(items, data.feeds, ALL_JOB_FILTERS, now);
  const shown = filterJobs(items, data.feeds, DEFAULT_JOB_FILTERS, now);
  return {
    items,
    feeds: data.feeds,
    initial: shown.slice(0, 30),
    summary: {
      currentCount: current.length,
      defaultCount: shown.length,
      organizationCount: new Set(current.map((j) => j.organization_slug)).size,
      currencies: uniq(items.flatMap((j) => j.salaries.map((s) => s.currency))),
      periods: uniq(items.flatMap((j) => j.salaries.map((s) => s.period))),
    },
  };
}
