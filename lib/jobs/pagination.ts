/**
 * Numbered listing pages for Jobs landings and the /jobs/ directory.
 * Page 1 stays at the landing's own path; page 2+ live at <path>page/<n>/.
 */
import { LISTINGS_SHOWN, type LandingPage } from "./landing";
import type { JobItem } from "./search";

export function landingPageCount(total: number, size = LISTINGS_SHOWN): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / size));
}

/** Page 1 is the landing itself; later pages are `<base>page/<n>/`. */
export function landingPageHref(basePath: string, page: number): string {
  const base = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return page <= 1 ? base : `${base}page/${page}/`;
}

export function pageSlice<T>(items: T[], page: number, size = LISTINGS_SHOWN): T[] {
  const n = Math.max(1, page);
  return items.slice((n - 1) * size, n * size);
}

/** Title for a numbered listing page; keeps the first page's title unchanged. */
export function paginatedTitle(title: string, page: number): string {
  if (page <= 1) return title;
  const suffix = ` · page ${page}`;
  return title.length + suffix.length <= 60 ? `${title}${suffix}` : `${title.slice(0, Math.max(20, 59 - suffix.length)).trim()}…${suffix}`;
}

/**
 * The landing as shown on page `n`: same facts, listings sliced to that page,
 * self-canonical path, and a title that names the page number when n > 1.
 */
export function paginatedLanding(page: LandingPage, n: number): LandingPage {
  const pageCount = landingPageCount(page.count);
  const pageNumber = Math.min(Math.max(1, n), pageCount);
  const listings = pageSlice(page.allListings, pageNumber);
  const path = landingPageHref(page.basePath, pageNumber);
  return {
    ...page,
    path,
    listings,
    title: paginatedTitle(page.title, pageNumber),
    pageNumber,
    pageCount,
  };
}

export function paginationPages(basePath: string, total: number, size = LISTINGS_SHOWN): { page: number; path: string }[] {
  const count = landingPageCount(total, size);
  return Array.from({ length: count }, (_, i) => ({ page: i + 1, path: landingPageHref(basePath, i + 1) }));
}

/** Compact crawlable rows for directory pagination (title + employer + href). */
export type DirectoryLink = { id: string; title: string; organization_name: string; href: string };

export function directoryLinks(items: JobItem[], hrefOf: (job: JobItem) => string): DirectoryLink[] {
  return items.map((j) => ({
    id: j.id,
    title: j.title,
    organization_name: j.source_type === "usajobs" && j.department ? j.department : j.organization_name,
    href: hrefOf(j),
  }));
}

/** Drop allListings before render so the HTML/RSC payload stays one page of jobs. */
export function landingView(page: LandingPage): LandingPage {
  return { ...page, allListings: [] };
}

/** Visible page numbers with gaps collapsed to an ellipsis. */
export function pageWindow(current: number, count: number): Array<number | "…"> {
  if (count <= 9) return Array.from({ length: count }, (_, i) => i + 1);
  const keep = new Set([1, count, current - 2, current - 1, current, current + 1, current + 2]);
  const nums = [...keep].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (const n of nums) {
    if (out.length && n - (out.at(-1) as number) > 1) out.push("…");
    out.push(n);
  }
  return out;
}
