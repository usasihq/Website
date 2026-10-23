/**
 * Where the Jobs landing pages appear besides their own routes: the /jobs/
 * "Browse by" links, other landing pages (a state page lists its city pages,
 * an employer page lists role pages it has listings on), /places/<state>/, the
 * sitemap, site search, and per-page preview cards (/og/jobs/<slug>.jpg).
 * Build-time only.
 */
import type { Catalog } from "../catalog";
import { formatDate } from "../dates";
import { card, type PageCard } from "../page-cards";
import type { SearchEntry } from "../search";
import { jobsDirectoryData } from "./directory-data";
import { jobsLandingData, stateDisplayName, type LandingKind, type LandingPage } from "./landing";
import { landingPageHref, landingPageCount } from "./pagination";
import { ALL_JOB_FILTERS, filterJobs } from "./search";

export type LandingLink = { path: string; name: string; count: number; kind: LandingKind; state: string | null };

const n = (v: number) => v.toLocaleString("en-US");

const link = (p: LandingPage): LandingLink => ({ path: p.path, name: p.name, count: p.count, kind: p.kind, state: p.state });

/** Topic pages first, then states alphabetically, then cities alphabetically. */
export function landingLinks(catalog: Catalog): LandingLink[] {
  return jobsLandingData(catalog).all.map(link);
}

/** Topic, role, state, and metro pages, for "More job pages" (single-city pages are listed on their state's page, employer pages on /jobs/). */
export function topicAndStateLinks(catalog: Catalog, except: string): LandingLink[] {
  return landingLinks(catalog).filter((l) => (l.kind === "topic" || l.kind === "role" || l.kind === "state" || l.kind === "metro") && l.path !== except);
}

/** Role pages with current listings. */
export function roleLinks(catalog: Catalog, except = ""): LandingLink[] {
  return jobsLandingData(catalog)
    .roles.filter((p) => p.count > 0 && p.path !== except)
    .map(link);
}

/** Role × state pages for one role, by number of listings. */
export function roleStateLinksForRole(catalog: Catalog, roleSlug: string): LandingLink[] {
  return jobsLandingData(catalog)
    .roleStates.filter((p) => p.filters.role === roleSlug)
    .map(link)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

/** Role × state pages in one state, by number of listings. */
export function roleStateLinksForState(catalog: Catalog, state: string): LandingLink[] {
  return jobsLandingData(catalog)
    .roleStates.filter((p) => p.state === state)
    .map(link)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

/** Role pages that include listings from one employer, with that employer's count on each role. */
export function roleLinksForEmployer(catalog: Catalog, slug: string): LandingLink[] {
  return jobsLandingData(catalog)
    .roles.filter((p) => p.employers.some((e) => e.slug === slug && e.count > 0))
    .map((p) => {
      const count = p.employers.find((e) => e.slug === slug)!.count;
      return { path: p.path, name: p.name, count, kind: "role" as const, state: null };
    });
}

/** Employer pages with current listings, most listings first. */
export function companyLinks(catalog: Catalog, except = ""): LandingLink[] {
  return jobsLandingData(catalog)
    .companies.filter((p) => p.count > 0 && p.path !== except)
    .map(link)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

/**
 * Employer browse on /jobs/: employers with current listings. The federal USAJOBS page joins
 * once it has listings (it is noindex and out of the sitemap while empty; the feed needs an API key).
 */
export function employerBrowseLinks(catalog: Catalog): LandingLink[] {
  return companyLinks(catalog);
}

/** City pages in one state, by number of listings. */
export function cityLinks(catalog: Catalog, state: string): LandingLink[] {
  return jobsLandingData(catalog)
    .cities.filter((p) => p.state === state)
    .map(link)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

/** Metro hub pages that include a city in this state. */
export function metroLinksForState(catalog: Catalog, state: string): LandingLink[] {
  return jobsLandingData(catalog)
    .metros.filter((p) => p.metro?.places.some((place) => place.state === state))
    .map(link)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

function geographyLine(p: LandingPage): string {
  if (p.scope === "state") return `Every listing names a location in ${stateDisplayName(p.state!)}`;
  if (p.scope === "city") return `Every listing names ${p.city!.label}, ${p.state}`;
  if (p.scope === "metro" && p.metro) {
    const places = p.metro.places.map((place) => `${place.label}, ${place.state}`).join(" or ");
    return `Every listing names ${places}`;
  }
  if (p.scope === "us-only") return "U.S. locations only";
  return p.geography.outside ? "Includes positions outside the United States" : "No positions outside the United States listed";
}

export function jobLandingCard(p: LandingPage): PageCard {
  const checked = p.lastChecked ? formatDate(p.lastChecked.slice(0, 10)) : "not yet";
  return card({
    page: p.path,
    image: p.image,
    template: "article",
    eyebrow:
      p.kind === "state"
        ? "Jobs · U.S. state"
        : p.kind === "city" || p.kind === "metro"
          ? "Jobs · U.S. city"
          : p.kind === "company"
            ? "Jobs · Employer"
            : p.kind === "role"
              ? "Jobs · Role"
              : p.kind === "role-state"
                ? "Jobs · Role and state"
                : "Jobs",
    title: p.h1,
    subtitle: `${n(p.count)} open ${p.count === 1 ? "listing" : "listings"} from ${n(p.employers.length)} ${p.employers.length === 1 ? "employer" : "employers"} · ${geographyLine(p)} · Checked ${checked}`,
    facts: [],
  });
}

/** Preview cards for every landing page, rendered with the other cards by scripts/page-cards.ts. */
export function jobLandingCards(catalog: Catalog): PageCard[] {
  return jobsLandingData(catalog).all.map(jobLandingCard);
}

/** The card as page metadata ({ path, alt }). */
export function jobLandingImage(p: LandingPage): { path: string; alt: string } {
  const c = jobLandingCard(p);
  return { path: c.image, alt: c.alt };
}

/** Site search entries, with today's counts. */
export function jobLandingSearchEntries(catalog: Catalog): SearchEntry[] {
  return jobsLandingData(catalog).all.map((p) => ({
    type: "page",
    slug: p.path.replace(/^\/|\/$/g, "").replace(/\//g, "-"),
    href: p.path,
    name: p.h1,
    summary: p.description,
    keywords: `jobs careers hiring openings ${
      p.kind === "state"
        ? `state ${stateDisplayName(p.state!)} ${p.state}`
        : p.kind === "city"
          ? `city ${p.city!.label} ${stateDisplayName(p.state!)} ${p.state}`
          : p.kind === "metro" && p.metro
            ? `city metro ${p.metro.places.map((place) => `${place.label} ${stateDisplayName(place.state)} ${place.state}`).join(" ")}`
          : p.kind === "company"
            ? `employer company careers hiring ${p.organization!.name}`
            : p.kind === "role" || p.kind === "role-state"
              ? `role ${p.name} ${p.id.replace(/-/g, " ")}`
              : p.id.replace(/-/g, " ")
    }`,
  }));
}

/**
 * Sitemap entries for the indexable landing pages, dated by the newest first_seen among their
 * listings (when the page last gained a listing), never by the build or the last check.
 */
export function jobLandingSitemap(catalog: Catalog): { path: string; lastModified: string | undefined }[] {
  const lastmod = (p: LandingPage) => p.newestFirstSeen?.slice(0, 10);
  const rows: { path: string; lastModified: string | undefined }[] = [];
  for (const p of jobsLandingData(catalog).all) {
    if (!p.indexable) continue;
    rows.push({ path: p.path, lastModified: lastmod(p) });
    const pages = landingPageCount(p.count);
    for (let n = 2; n <= pages; n++) {
      rows.push({ path: landingPageHref(p.basePath, n), lastModified: lastmod(p) });
    }
  }
  return rows;
}

/** The employer jobs page when it has current listings (for the company job-count line). */
export function companyJobsLink(catalog: Catalog, slug: string): LandingLink | null {
  const page = jobsLandingData(catalog).companies.find((p) => p.organization?.slug === slug && p.count > 0);
  return page ? link(page) : null;
}

/** Numbered /jobs/page/n/ entries so crawlers can walk every current listing from /jobs/. */
export function jobsDirectorySitemap(catalog: Catalog): { path: string; lastModified: string | undefined }[] {
  const data = jobsDirectoryData(catalog);
  const now = Date.parse(catalog.buildAt);
  const current = filterJobs(data.items, data.feeds, ALL_JOB_FILTERS, now);
  const lastmod = current.reduce<string | null>((a, j) => (a === null || j.first_seen > a ? j.first_seen : a), null)?.slice(0, 10);
  const pages = landingPageCount(current.length);
  const rows: { path: string; lastModified: string | undefined }[] = [];
  for (let n = 2; n <= pages; n++) rows.push({ path: landingPageHref("/jobs/", n), lastModified: lastmod });
  return rows;
}
