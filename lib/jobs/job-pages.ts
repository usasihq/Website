/**
 * Data for each current job's own page (/jobs/at/<employer>/<slug>/) and its
 * schema.org JobPosting, built from the same snapshot and "current" rule as
 * the directory: open, from a source whose last check succeeded, and seen in
 * the last 48 hours at build time. Build-time only.
 */
import type { Catalog } from "../catalog";
import { absoluteUrl } from "../paths";
import type { Organization } from "../schema";
import { descriptionHtml, descriptionText, type Description } from "./description";
import { readDescriptions } from "./descriptions-store";
import { isUSOnly, placeGeography } from "./geo";
import { jobSlug } from "./job-url";
import { readJobsForBuild } from "./load";
import type { Job } from "./schema";
import { isCurrent } from "./search";
import { isExpressionOfInterest } from "./tracks";
import { jobCategory, jobLevel } from "./levels";

export type JobPage = { job: Job; org: Organization; slug: string; path: string; description: Description | null };

const memo = new WeakMap<Catalog, JobPage[]>();

export function jobPages(catalog: Catalog): JobPage[] {
  const hit = memo.get(catalog);
  if (hit) return hit;
  const now = Date.parse(catalog.buildAt);
  const data = readJobsForBuild(catalog.organizations, now);
  const descriptions = readDescriptions();
  const health = new Map(data.feeds.map((f) => [`${f.organization_slug}:${f.source_type}:${f.source_identifier}`, f]));
  const taken = new Set<string>();
  const pages: JobPage[] = [];
  for (const job of data.jobs) {
    const org = catalog.organization(job.organization_slug);
    if (!org || !catalog.isActiveOrganization(org.slug)) continue;
    if (!isCurrent(job, health.get(`${job.organization_slug}:${job.source_type}:${job.source_identifier}`), now)) continue;
    let slug = jobSlug(job);
    // Two postings with the same title and code would share an address; the second gets its source ID appended.
    if (taken.has(`${org.slug}/${slug}`)) slug = `${slug}-${job.source_job_id.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
    taken.add(`${org.slug}/${slug}`);
    pages.push({ job, org, slug, path: `/jobs/at/${org.slug}/${slug}/`, description: descriptions.get(job.id) ?? null });
  }
  pages.sort((a, b) => (a.path < b.path ? -1 : 1));
  memo.set(catalog, pages);
  return pages;
}

export function jobPage(catalog: Catalog, company: string, slug: string): JobPage | undefined {
  return jobPages(catalog).find((p) => p.org.slug === company && p.slug === slug);
}

const EMPLOYMENT: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  temporary: "TEMPORARY",
  internship: "INTERN",
};
const UNIT: Record<string, string> = { hour: "HOUR", day: "DAY", week: "WEEK", month: "MONTH", year: "YEAR" };

/** U.S. addresses the listing's own location text names (city and state, or state alone). Nothing is guessed. */
export function postalAddresses(job: Pick<Job, "locations">): { addressLocality?: string; addressRegion: string; addressCountry: "US" }[] {
  const cities = new Map<string, { addressLocality: string; addressRegion: string; addressCountry: "US" }>();
  const states = new Set<string>();
  for (const location of job.locations) {
    const g = placeGeography(location);
    for (const c of g.cities) cities.set(c, { addressLocality: c.slice(3), addressRegion: c.slice(0, 2), addressCountry: "US" });
    for (const s of g.states) states.add(s);
  }
  // A state named without a city becomes a state-level address only when no city in that state is listed.
  const withCity = new Set([...cities.values()].map((c) => c.addressRegion));
  const stateOnly = [...states].filter((s) => !withCity.has(s)).map((s) => ({ addressRegion: s, addressCountry: "US" as const }));
  return [...cities.values(), ...stateOnly].slice(0, 20);
}

/**
 * schema.org JobPosting for Google's job search, or null when the listing
 * lacks what the format requires (a description, and a U.S. address or a
 * fully remote listing open to U.S. applicants). Every field comes from the
 * employer's feed; nothing is inferred. validThrough is omitted: feeds do not
 * supply an expiration date. Stale listings never reach this function
 * (`isCurrent`, seen within 48 hours), so their pages and markup are gone
 * after the next refresh and deploy rather than given a guessed expiry.
 *
 * Applications happen on the employer's site (`directApply: false`). Google's
 * JobPosting type has no field for "apply on the employer URL"; the visible
 * apply links and this flag are the accurate signal.
 */
export function jobPostingLd(p: JobPage): Record<string, unknown> | null {
  const { job, org, description } = p;
  if (!description) return null;
  if (isExpressionOfInterest(job.title)) return null;
  const addresses = postalAddresses(job);
  // Google's TELECOMMUTE value is only for jobs that are 100% remote, not hybrid
  // or "remote-friendly". The employer workplace field is the only verified signal.
  const fullyRemote = job.workplace === "remote";
  const usOnly = isUSOnly(job);
  if (!addresses.length && !(fullyRemote && usOnly)) return null;
  const salary = job.salaries.find((s) => s.currency && (s.min !== null || s.max !== null));
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionHtml(description),
    datePosted: (job.posted_at ?? job.first_seen).slice(0, 10),
    hiringOrganization: { "@type": "Organization", name: org.name, sameAs: org.website },
    identifier: { "@type": "PropertyValue", name: org.name, value: job.requisition_id ?? job.source_job_id },
    directApply: false,
    url: absoluteUrl(p.path),
    ...(EMPLOYMENT[job.employment_type] ? { employmentType: EMPLOYMENT[job.employment_type] } : {}),
    ...(addresses.length
      ? { jobLocation: addresses.map((a) => ({ "@type": "Place", address: { "@type": "PostalAddress", ...a } })) }
      : {}),
    ...(fullyRemote && usOnly ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "US" } } : {}),
    ...(salary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: salary.currency,
            value: {
              "@type": "QuantitativeValue",
              ...(salary.min !== null ? { minValue: salary.min } : {}),
              ...(salary.max !== null ? { maxValue: salary.max } : {}),
              unitText: UNIT[salary.period],
            },
          },
        }
      : {}),
  };
}

/** About 150 characters of the description, for the page's meta description. */
export function jobSnippet(p: JobPage): string | null {
  if (!p.description) return null;
  const text = descriptionText(p.description);
  if (text.length <= 150) return text;
  return `${text.slice(0, 147).replace(/\s+\S*$/, "")}…`;
}

/**
 * Up to `limit` other current jobs like this one: the same job category from
 * the title, preferring the same experience level, a shared U.S. state, and
 * other employers, newest first. Built once for every page.
 */
export function similarJobs(pages: JobPage[], limit = 6): Map<string, JobPage[]> {
  const meta = new Map(pages.map((p) => [p.path, {
    category: jobCategory(p.job.title), level: jobLevel(p.job.title),
    states: new Set(p.job.locations.flatMap((l) => placeGeography(l).states)),
    time: Date.parse(p.job.posted_at ?? p.job.first_seen) || 0,
  }]));
  const byCategory = new Map<string, JobPage[]>();
  for (const p of pages) {
    const c = meta.get(p.path)!.category;
    if (c === "other") continue;
    (byCategory.get(c) ?? byCategory.set(c, []).get(c)!).push(p);
  }
  const result = new Map<string, JobPage[]>();
  for (const p of pages) {
    const m = meta.get(p.path)!;
    const pool = byCategory.get(m.category);
    if (!pool) { result.set(p.path, []); continue; }
    const scored: { q: JobPage; score: number; time: number }[] = [];
    for (const q of pool) {
      if (q === p || isExpressionOfInterest(q.job.title)) continue;
      const n = meta.get(q.path)!;
      let score = 0;
      if (n.level === m.level) score += 2;
      for (const st of n.states) if (m.states.has(st)) { score += 1; break; }
      if (q.org.slug !== p.org.slug) score += 1;
      scored.push({ q, score, time: n.time });
    }
    scored.sort((a, b) => b.score - a.score || b.time - a.time || (a.q.path < b.q.path ? -1 : 1));
    // At most two from any one employer, so the list shows a spread.
    const picked: JobPage[] = [];
    const perOrg = new Map<string, number>();
    for (const { q } of scored) {
      if ((perOrg.get(q.org.slug) ?? 0) >= 2) continue;
      perOrg.set(q.org.slug, (perOrg.get(q.org.slug) ?? 0) + 1);
      picked.push(q);
      if (picked.length >= limit) break;
    }
    result.set(p.path, picked);
  }
  return result;
}
