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
import { displayLocation, isUSOnly, placeGeography, REMOTE_LOCATION, stateDisplayName } from "./geo";
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
   * Set by assignTitleSuffixes only when another current posting at the same employer would get the
   * same title: the page's distinct title. Slugs and URLs are unaffected.
   */
  titleText?: string | null;
  /** When those postings also share their places: the requisition or posting ID (or the page's own code) in the title. */
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

export const shortOrg = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, "").trim();
export const TITLE_LIMIT = 70;

/** Shortens text to at most `max` characters at a word boundary, marking the cut with "…"; never cuts inside a word. */
export function clipWords(t: string, max: number): string {
  if (t.length <= max) return t;
  const room = t.slice(0, Math.max(0, max - 1));
  const cut = room.lastIndexOf(" ");
  const trim = (v: string) => v.replace(/[\s,;:·|–—(/&+-]+$/, "");
  let head = trim(cut > 0 ? room.slice(0, cut) : "");
  // A cut inside a parenthesis drops the unfinished parenthesis.
  if ((head.match(/\(/g) ?? []).length > (head.match(/\)/g) ?? []).length) head = trim(head.slice(0, head.lastIndexOf("(")));
  return head ? `${head}…` : "";
}

/**
 * One location, short: "San Francisco, CA" for a U.S. city, "Remote" for a remote location, a state's
 * name for a state alone, otherwise the employer's text with middle parts dropped ("London, United
 * Kingdom") and cut to whole words. Nothing is guessed beyond lib/jobs/geo.ts's published rules.
 */
export function shortPlaces(location: string): string[] {
  const g = placeGeography(location);
  if (g.cities.length) return g.cities.map((c) => `${c.slice(3)}, ${c.slice(0, 2)}`);
  if (REMOTE_LOCATION.test(location)) return ["Remote"];
  if (g.states.length === 1) return [stateDisplayName(g.states[0])];
  const parts = displayLocation(location).replace(/\s*\([^)]*\)/g, "").split(/\s*[,;|·]\s*/).filter(Boolean);
  const text = parts.length > 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : parts.join(", ");
  const clipped = clipWords(text, 28) || clipWords(parts[0] ?? "", 28);
  return clipped ? [clipped] : [];
}

/** The listing's short places, distinct, in the employer's order; "Remote" first for a remote listing. */
export function titlePlaces(job: Pick<Job, "locations" | "workplace">): string[] {
  const places = [...new Set(job.locations.flatMap(shortPlaces))];
  if (job.workplace === "remote" && !places.includes("Remote")) places.unshift("Remote");
  return places;
}

/** "San Francisco, CA", "Remote", or "San Francisco, CA +2 locations"; null when the listing names no place. */
export function locationLabel(places: string[], all = false): string | null {
  if (!places.length) return null;
  if (all || places.length === 1) return places.join(" · ");
  const more = places.length - 1;
  return `${places[0]} +${more} ${more === 1 ? "location" : "locations"}`;
}

const employerFor = (p: JobPage) => (p.job.source_type === "usajobs" && p.job.department ? p.job.department : shortOrg(p.org.name));

/**
 * Title candidates, best first: "{Title} at {Employer} ({place})", then shorter forms (first place
 * only, no place, no employer). `allPlaces` lists every place (to tell apart same-titled postings);
 * `ref` (a requisition or posting ID) is appended when even that does not.
 */
function titleCandidates(p: JobPage, allPlaces = false, ref: string | null = null): string[] {
  const t = p.job.title.trim().replace(/\s+/g, " ");
  const org = employerFor(p);
  const places = titlePlaces(p.job);
  const label = locationLabel(places, allPlaces);
  const first = places[0] ?? null;
  const tail = ref ? ` · ${ref}` : "";
  const atOrg = ` at ${org}`;
  const forms = [
    label ? `${t}${atOrg} (${label})` : null,
    first && places.length > 1 && !allPlaces ? `${t}${atOrg} (${first} +${places.length - 1})` : null,
    first && places.length > 1 ? `${t}${atOrg} (${first})` : null,
    label && allPlaces ? `${t} (${label})` : null,
    `${t}${atOrg}`,
    label ? `${t} (${label})` : null,
    first && places.length > 1 ? `${t} (${first})` : null,
    t,
  ].filter((v): v is string => Boolean(v));
  // A title too long on its own is cut at a word, keeping the employer when the cut leaves enough of it.
  const clippedWithOrg = clipWords(t, TITLE_LIMIT - atOrg.length - tail.length);
  if (clippedWithOrg.length >= 32) forms.push(`${clippedWithOrg}${atOrg}`);
  return [...forms.map((f) => `${f}${tail}`), `${clipWords(t, TITLE_LIMIT - tail.length) || t.slice(0, TITLE_LIMIT - tail.length)}${tail}`];
}

const firstFitting = (forms: string[]) => forms.find((f) => f.length <= TITLE_LIMIT) ?? forms[forms.length - 1];

/**
 * The page title: "{Title} at {Employer} ({City, ST} | Remote | "+N locations")", at most about 70
 * characters, shortened by dropping parts (extra places, the place, the employer) and only then
 * by cutting the job title at a word. assignTitleSuffixes makes titles at one employer distinct.
 */
export function jobPageTitle(p: JobPage): string {
  return p.titleText ?? firstFitting(titleCandidates(p));
}

/** A short, distinguishing reference for a posting: its requisition, its posting ID, or its page code. */
function postingRef(p: JobPage, kind: "req" | "id" | "code"): string | null {
  if (kind === "req") return p.job.requisition_id && p.job.requisition_id.length <= 20 ? `Req. ${p.job.requisition_id}` : null;
  if (kind === "id") return p.job.source_job_id.length <= 16 ? `ID ${p.job.source_job_id}` : null;
  return `ref. ${shortCode(p.job.id)}`;
}

/**
 * Makes every page title unique among one employer's current postings. A title shared with another
 * posting first lists every place; postings that still match get a reference (requisition, then
 * posting ID, then the page's own code, which is unique per posting).
 */
export function assignTitleSuffixes(pages: JobPage[]): void {
  const groupBy = (list: JobPage[]) => {
    const groups = new Map<string, JobPage[]>();
    for (const p of list) {
      const k = `${p.org.slug}\u0000${jobPageTitle(p).toLowerCase()}`;
      (groups.get(k) ?? groups.set(k, []).get(k)!).push(p);
    }
    return [...groups.values()].filter((g) => g.length > 1);
  };
  for (const p of pages) {
    p.titleText = null;
    p.titleId = null;
  }
  for (const same of groupBy(pages)) for (const p of same) p.titleText = firstFitting(titleCandidates(p, true));
  for (const same of groupBy(pages)) {
    // The first kind of reference every posting has, distinct across them; the page code always is.
    for (const kind of ["req", "id", "code"] as const) {
      const refs = same.map((p) => postingRef(p, kind));
      if (refs.every(Boolean) && new Set(refs).size === refs.length) {
        same.forEach((p, i) => {
          p.titleId = refs[i];
          p.titleText = firstFitting(titleCandidates(p, false, refs[i]));
        });
        break;
      }
    }
  }
  // Shortening can still make two titles read the same; those get the page's own code.
  for (const same of groupBy(pages)) {
    for (const p of same) {
      p.titleId = postingRef(p, "code");
      p.titleText = firstFitting(titleCandidates(p, false, p.titleId));
    }
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
