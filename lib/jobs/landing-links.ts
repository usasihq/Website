/**
 * Where the Jobs landing pages appear besides their own routes: the /jobs/
 * "Browse by" links, other landing pages, /places/<state>/, the sitemap, site
 * search, and per-page preview cards (/og/jobs/<slug>.jpg). Build-time only.
 */
import type { Catalog } from "../catalog";
import { formatDate } from "../dates";
import { card, type PageCard } from "../page-cards";
import type { SearchEntry } from "../search";
import { jobsLandingData, stateDisplayName, type LandingPage } from "./landing";

export type LandingLink = { path: string; name: string; count: number; kind: "state" | "topic" };

const n = (v: number) => v.toLocaleString("en-US");

/** Topic pages first, then states alphabetically. */
export function landingLinks(catalog: Catalog): LandingLink[] {
  return jobsLandingData(catalog).all.map((p) => ({ path: p.path, name: p.name, count: p.count, kind: p.kind }));
}

function geographyLine(p: LandingPage): string {
  if (p.scope === "state") return `Every listing names a location in ${stateDisplayName(p.state!)}`;
  if (p.scope === "us-only") return "U.S. locations only";
  return p.geography.outside ? "Includes positions outside the United States" : "No positions outside the United States listed";
}

export function jobLandingCard(p: LandingPage): PageCard {
  const checked = p.lastChecked ? formatDate(p.lastChecked.slice(0, 10)) : "not yet";
  return card({
    page: p.path,
    image: p.image,
    template: "article",
    eyebrow: p.kind === "state" ? "Jobs · U.S. state" : "Jobs",
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
    keywords: `jobs careers hiring openings ${p.kind === "state" ? `state ${stateDisplayName(p.state!)} ${p.state}` : p.id.replace(/-/g, " ")}`,
  }));
}

/** Sitemap entries for the indexable landing pages, dated by their last successful check. */
export function jobLandingSitemap(catalog: Catalog): { path: string; lastModified: string | undefined }[] {
  return jobsLandingData(catalog)
    .all.filter((p) => p.indexable)
    .map((p) => ({ path: p.path, lastModified: p.lastChecked?.slice(0, 10) }));
}
