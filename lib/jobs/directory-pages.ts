/**
 * Numbered /jobs/page/n/ listings of every current job (all countries).
 * Page 1 is /jobs/; later pages are crawlable static HTML so every job page
 * is linked from a listing even when the directory's first paint shows 30.
 */
import type { Catalog } from "../catalog";
import { jobsDirectoryData } from "./directory-data";
import { LISTINGS_SHOWN } from "./landing";
import { directoryLinks, landingPageCount, landingPageHref, pageSlice } from "./pagination";
import { jobHref } from "./job-url";
import { ALL_JOB_FILTERS, filterJobs } from "./search";
import { asset } from "../paths";

export function jobsDirectoryPages(catalog: Catalog) {
  const data = jobsDirectoryData(catalog);
  const now = Date.parse(catalog.buildAt);
  const current = filterJobs(data.items, data.feeds, ALL_JOB_FILTERS, now);
  return {
    items: current,
    total: current.length,
    pageCount: landingPageCount(current.length),
    newestFirstSeen: current.reduce<string | null>((a, j) => (a === null || j.first_seen > a ? j.first_seen : a), null),
  };
}

export function jobsDirectoryPage(catalog: Catalog, n: number) {
  const { items, pageCount, newestFirstSeen } = jobsDirectoryPages(catalog);
  const page = Math.min(Math.max(1, n), pageCount);
  return {
    page,
    pageCount,
    total: items.length,
    path: landingPageHref("/jobs/", page),
    newestFirstSeen,
    links: directoryLinks(pageSlice(items, page, LISTINGS_SHOWN), (j) => asset(jobHref(j))),
  };
}
