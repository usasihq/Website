/**
 * People-page SEO extras that read jobs and news already shown on the profile.
 * Kept out of lib/seo.ts so catalog title helpers stay free of the jobs snapshot.
 */
import type { Catalog } from "./catalog";
import { companyJobsLink } from "./jobs/landing-links";
import type { Person } from "./schema";
import { personSeo, type PersonSeoExtras, type SeoText } from "./seo";

/** News items whose title or summary names this person (not merely their employer). */
export function personNewsMentions(catalog: Catalog, p: Person, limit = 2): string[] {
  const needle = p.name.toLowerCase();
  return catalog.news
    .filter((n) => `${n.title} ${n.summary.text}`.toLowerCase().includes(needle))
    .sort((a, b) => b.event_date.localeCompare(a.event_date) || a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map((n) => n.title);
}

/** Open jobs at organizations on the profile, and news items that name the person. */
export function personSeoContext(catalog: Catalog, p: Person): PersonSeoExtras {
  const openJobs: NonNullable<PersonSeoExtras["openJobs"]> = [];
  const seen = new Set<string>();
  for (const a of p.affiliations) {
    if (!a.organization_slug) continue;
    const jobs = companyJobsLink(catalog, a.organization_slug);
    if (!jobs || seen.has(jobs.path)) continue;
    seen.add(jobs.path);
    openJobs.push({ orgName: a.name, count: jobs.count });
  }
  return { openJobs, newsHeadlines: personNewsMentions(catalog, p) };
}

export function personPageSeo(catalog: Catalog, p: Person): SeoText {
  return personSeo(catalog, p, personSeoContext(catalog, p));
}
