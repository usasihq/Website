import type { Catalog } from "../catalog";
import { readJobs } from "./load";
import { DEFAULT_JOB_FILTERS, filterJobs, toJobItem, type JobItem } from "./search";
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
  summary: { currentCount: number; organizationCount: number; departments: string[]; currencies: string[]; periods: string[] };
} {
  const data = readJobs(catalog.organizations);
  const names = new Map(catalog.organizations.map((o) => [o.slug, o.name]));
  const items = data.jobs.filter((j) => j.status === "open").map((j) => toJobItem(j, names.get(j.organization_slug)!));
  const current = filterJobs(items, data.feeds, DEFAULT_JOB_FILTERS, Date.parse(catalog.buildAt));
  return {
    items,
    feeds: data.feeds,
    initial: current.slice(0, 30),
    summary: {
      currentCount: current.length,
      organizationCount: new Set(current.map((j) => j.organization_slug)).size,
      departments: uniq(items.map((j) => j.department)),
      currencies: uniq(items.flatMap((j) => j.salaries.map((s) => s.currency))),
      periods: uniq(items.flatMap((j) => j.salaries.map((s) => s.period))),
    },
  };
}
