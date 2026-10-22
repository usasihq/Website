/**
 * People-page SEO extras that read jobs and news already shown on the profile.
 * Kept out of lib/seo.ts so catalog title helpers stay free of the jobs snapshot.
 */
import type { Catalog } from "./catalog";
import { companyJobsLink } from "./jobs/landing-links";
import type { SchoolPeopleList } from "./people-schools";
import type { Person } from "./schema";
import { composeDescription, fitTitle, personSeo, type PersonSeoExtras, type SeoText } from "./seo";

/**
 * News items whose title or summary names this person (not merely their employer).
 * Single-word names (handles such as "argo") are skipped: they match unrelated text.
 */
export function personNews(catalog: Catalog, p: Person, limit = 2): Catalog["news"] {
  const needle = p.name.toLowerCase();
  if (!/\s/.test(needle.trim())) return [];
  const pattern = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  return catalog.news
    .filter((n) => pattern.test(`${n.title} ${n.summary.text}`.toLowerCase()))
    .sort((a, b) => b.event_date.localeCompare(a.event_date) || a.slug.localeCompare(b.slug))
    .slice(0, limit);
}

export function personNewsMentions(catalog: Catalog, p: Person, limit = 2): string[] {
  return personNews(catalog, p, limit).map((n) => n.title);
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

export function schoolListSeo(list: SchoolPeopleList): SeoText {
  const n = list.items.length;
  return {
    title: fitTitle([`AI people from ${list.shortName} — ${n} sourced profiles`, `AI people from ${list.shortName}`, `${list.shortName} AI people`]),
    description: composeDescription(
      [`${n} sourced profiles of people in the USASI catalog who studied at or hold a documented academic role at ${list.name}.`],
      ["Listed alphabetically; this is not a ranking. Each profile covers public professional work only."],
    ),
  };
}

export function schoolIndexSeo(schoolCount: number, peopleCount: number): SeoText {
  return {
    title: fitTitle([`People by school — ${schoolCount} universities in U.S. AI`, "People by school — alumni in U.S. AI", "People by school"]),
    description: composeDescription([
      `Browse ${peopleCount} sourced USASI people profiles by university: alumni and faculty at ${schoolCount} schools, listed alphabetically.`,
    ]),
  };
}
