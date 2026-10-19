/**
 * Data for each current job's own page (/jobs/at/<employer>/<slug>/) and its
 * schema.org JobPosting, built from the same snapshot and "current" rule as
 * the directory: open, from a source whose last check succeeded, and seen in
 * the last 48 hours at build time. Build-time only.
 */
import type { Catalog } from "../catalog";
import { absoluteUrl } from "../paths";
import type { Organization } from "../schema";
import { descriptionHtml, type Description } from "./description";
import { readDescriptions } from "./descriptions-store";
import { displayLocation, isUSOnly, placeGeography } from "./geo";
import { jobSlug, shortCode } from "./job-url";
import { readJobsForBuild } from "./load";
import type { Job } from "./schema";
import { isCurrent } from "./search";
import { isExpressionOfInterest } from "./tracks";
import { jobCategory, jobLevel } from "./levels";

export type JobPage = {
  job: Job;
  org: Organization;
  slug: string;
  path: string;
  description: Description | null;
  /**
   * Set only when another current posting at the same employer has the identical title: the
   * posting's own location(s), so each page's <title> is distinct. Slugs and URLs are unaffected.
   */
  titleSuffix?: string | null;
  /** When those postings also share their locations: the requisition or posting ID (or the page's own code). */
  titleId?: string | null;
};

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
  assignTitleSuffixes(pages);
  memo.set(catalog, pages);
  return pages;
}

/** The location part of a duplicate title: up to two display locations, or the first and a count. */
export function locationSuffix(locations: string[]): string {
  const shown = locations.map(displayLocation);
  if (!shown.length) return "location not stated";
  return shown.length > 2 ? `${shown[0]} +${shown.length - 1} more` : shown.join(" · ");
}

export const shortOrg = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, "").trim();
const TITLE_LIMIT = 70;
const clipTitle = (t: string, max: number) => (t.length <= max ? t : `${t.slice(0, max - 1).replace(/[\s,;:·-]+$/, "")}…`);

/**
 * The page title: role, employer, and first location when it fits. When the
 * employer has another current posting with the same title, the posting's
 * location suffix (see assignTitleSuffixes) is always kept, so titles differ.
 */
export function jobPageTitle(p: JobPage): string {
  const org = p.job.source_type === "usajobs" && p.job.department ? p.job.department : shortOrg(p.org.name);
  if (p.titleSuffix) {
    // The posting reference is never shortened; the location is, when space runs out.
    const id = p.titleId ? `, ${p.titleId}` : "";
    const suffix = `${clipTitle(p.titleSuffix, 40 - id.length)}${id}`;
    const full = [`${p.job.title} at ${org}, ${suffix}`, `${p.job.title}, ${suffix}`].find((t) => t.length <= TITLE_LIMIT);
    return full ?? `${clipTitle(p.job.title, TITLE_LIMIT - suffix.length - 2)}, ${suffix}`;
  }
  const where = p.job.locations[0] ? displayLocation(p.job.locations[0]) : undefined;
  return [`${p.job.title} at ${org}${where ? `, ${where}` : ""}`, `${p.job.title} at ${org}`, p.job.title].find((t) => t.length <= TITLE_LIMIT) ?? p.job.title.slice(0, TITLE_LIMIT);
}

/** A short, distinguishing reference for a posting: its requisition, its posting ID, or its page code. */
function postingRef(p: JobPage, kind: "req" | "id" | "code"): string | null {
  if (kind === "req") return p.job.requisition_id && p.job.requisition_id.length <= 20 ? `Req. ${p.job.requisition_id}` : null;
  if (kind === "id") return p.job.source_job_id.length <= 16 ? `ID ${p.job.source_job_id}` : null;
  return `ref. ${shortCode(p.job.id)}`;
}

/** Gives every page whose employer has another current posting with the same title a distinguishing suffix. */
export function assignTitleSuffixes(pages: JobPage[]): void {
  const groups = new Map<string, JobPage[]>();
  for (const p of pages) {
    const k = `${p.org.slug}\u0000${p.job.title.trim().replace(/\s+/g, " ").toLowerCase()}`;
    const list = groups.get(k) ?? [];
    list.push(p);
    groups.set(k, list);
  }
  for (const list of groups.values()) {
    for (const p of list) {
      p.titleSuffix = list.length > 1 ? locationSuffix(p.job.locations) : null;
      p.titleId = null;
    }
    if (list.length < 2) continue;
    const byWhere = new Map<string, JobPage[]>();
    for (const p of list) byWhere.set(p.titleSuffix!, [...(byWhere.get(p.titleSuffix!) ?? []), p]);
    for (const same of byWhere.values()) {
      if (same.length < 2) continue;
      // The first kind of reference every posting has, distinct across them; the page code always is.
      for (const kind of ["req", "id", "code"] as const) {
        const refs = same.map((p) => postingRef(p, kind));
        if (refs.every(Boolean) && new Set(refs).size === refs.length) {
          same.forEach((p, i) => (p.titleId = refs[i]));
          break;
        }
      }
    }
  }
  // Shortening can still make two titles at one employer read the same (long titles or long
  // locations). Those pages get the location and the page's own code, which is unique per posting.
  for (let pass = 0; pass < 2; pass++) {
    const byTitle = new Map<string, JobPage[]>();
    for (const p of pages) {
      const k = `${p.org.slug}\u0000${jobPageTitle(p)}`;
      byTitle.set(k, [...(byTitle.get(k) ?? []), p]);
    }
    let clashes = 0;
    for (const same of byTitle.values()) {
      if (same.length < 2) continue;
      clashes++;
      for (const p of same) {
        p.titleSuffix ??= locationSuffix(p.job.locations);
        p.titleId = postingRef(p, "code");
      }
    }
    if (!clashes) break;
  }
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
 * employer's feed; nothing is inferred. validThrough is included only where the
 * source states a closing date (USAJOBS); other feeds do not supply one. Stale listings never reach this function
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
  // The feed's own salary first; a range read from the description text only when the feed gives none.
  const usable = job.salaries.filter((s) => s.currency && (s.min !== null || s.max !== null));
  const salary = usable.find((s) => s.source_status === "employer-provided") ?? usable[0];
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionHtml(description),
    datePosted: (job.posted_at ?? job.first_seen).slice(0, 10),
    hiringOrganization:
      job.source_type === "usajobs" && job.department
        ? { "@type": "Organization", name: job.department, parentOrganization: { "@type": "Organization", name: org.name, sameAs: org.website } }
        : { "@type": "Organization", name: org.name, sameAs: org.website },
    identifier: { "@type": "PropertyValue", name: org.name, value: job.requisition_id ?? job.source_job_id },
    directApply: false,
    url: absoluteUrl(p.path),
    ...(EMPLOYMENT[job.employment_type] ? { employmentType: EMPLOYMENT[job.employment_type] } : {}),
    ...(addresses.length
      ? { jobLocation: addresses.map((a) => ({ "@type": "Place", address: { "@type": "PostalAddress", ...a } })) }
      : {}),
    ...(job.valid_through ? { validThrough: job.valid_through } : {}),
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
