/**
 * Closed listing URLs: /jobs/at/<employer>/<title>-<code>/ after the posting
 * has left the current feed. Client-safe (no Node APIs) so the Cloudflare
 * Worker and the static preview server can share the same matching rules.
 *
 * The employer comes from the path. The posting itself is gone, so similar
 * open roles are found by the title words in the slug (and the job category
 * those words imply). Nothing here writes JobPosting data.
 */
import { BASE_PATH } from "../site-config";
import { displayLocation } from "./geo";
import { jobCategory, type JobCategory } from "./levels";
import { JOB_ROLES } from "./roles";

export type ClosedJobShell = { htmlClass: string; links: string };

export type ClosedJobOrg = {
  name: string;
  jobsPath: string | null;
  companyPath: string | null;
};

export type ClosedJobListing = {
  org: string;
  title: string;
  path: string;
  location: string;
};

export type ClosedJobIndex = {
  shell: ClosedJobShell;
  orgs: Record<string, ClosedJobOrg>;
  jobs: ClosedJobListing[];
};

export type JobListingPath = { company: string; slug: string; words: string };

export type ClosedJobCard = ClosedJobListing & { orgName: string };

export type ClosedJobView = {
  hit: JobListingPath;
  titleGuess: string;
  companyName: string;
  jobsPath: string | null;
  companyPath: string | null;
  companyJobs: ClosedJobCard[];
  similarJobs: ClosedJobCard[];
};

export const CLOSED_COMPANY_LIMIT = 8;
export const CLOSED_SIMILAR_LIMIT = 8;
export const CLOSED_JOBS_INDEX_PATH = "/data/closed-jobs.json";

const ACRONYM = new Set(["ai", "ml", "us", "uk", "api", "gpu", "llm", "nlp", "sre", "ios", "hr", "vp", "it"]);
const STOP = new Set(["and", "the", "for", "of", "to", "in", "at", "or", "a", "an", "on", "by", "with"]);

/** A missing job page's employer, slug, and title words ("/jobs/at/anthropic/research-engineer-1a2b3c4/"). */
export function parseJobListingPath(pathname: string): JobListingPath | null {
  const path = BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname;
  const m = /^\/jobs\/at\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/.exec(path);
  if (!m) return null;
  const slug = m[2];
  const words = slug.replace(/-[a-z0-9]{7}$/, "").split("-").filter(Boolean).slice(0, 8).join(" ");
  return { company: m[1], slug, words };
}

/** Employer and title words only; kept for the 404 card and existing tests. */
export function missingJob(pathname: string): { org: string; words: string } | null {
  const hit = parseJobListingPath(pathname);
  return hit ? { org: hit.company, words: hit.words } : null;
}

/** Readable title from a job-page slug, after dropping the 7-character posting code. */
export function titleFromJobSlug(slug: string): string {
  return titleCaseWords(slug.replace(/-[a-z0-9]{7}$/, "").split("-").filter(Boolean));
}

function titleCaseWords(words: string[]): string {
  return words.map((w) => (ACRONYM.has(w) ? w.toUpperCase() : `${w.charAt(0).toUpperCase()}${w.slice(1)}`)).join(" ");
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function scoreListing(job: ClosedJobListing, query: string[], category: JobCategory, roleTest: ((title: string) => boolean) | null): number {
  const titleTokens = tokens(job.title);
  const shared = query.filter((t) => titleTokens.includes(t));
  let score = shared.length * 3;
  if (category !== "other" && jobCategory(job.title) === category) score += 5;
  if (roleTest?.(job.title)) score += 3;
  if (query.length >= 2 && query.every((t) => titleTokens.includes(t))) score += 4;
  return score;
}

function card(job: ClosedJobListing, orgs: Record<string, ClosedJobOrg>): ClosedJobCard {
  return { ...job, orgName: orgs[job.org]?.name ?? titleCaseWords(job.org.split("-")) };
}

/**
 * Open roles to show on a closed listing URL: current jobs at the same
 * employer (from the company slug), then same-function or same-title roles
 * at other employers. When the slug does not match a current posting, the
 * title words in the slug are the query.
 */
export function closedJobView(index: ClosedJobIndex, hit: JobListingPath): ClosedJobView {
  const org = index.orgs[hit.company];
  const titleGuess = titleFromJobSlug(hit.slug);
  const query = tokens(hit.words || titleGuess);
  const category = jobCategory(titleGuess);
  const role = JOB_ROLES.find((r) => r.test(titleGuess)) ?? null;
  const roleTest = role ? (title: string) => role.test(title) : null;

  const atCompany = index.jobs
    .filter((j) => j.org === hit.company)
    .map((j) => ({ j, score: scoreListing(j, query, category, roleTest) }))
    .sort((a, b) => b.score - a.score || a.j.title.localeCompare(b.j.title, "en") || (a.j.path < b.j.path ? -1 : 1))
    .slice(0, CLOSED_COMPANY_LIMIT)
    .map(({ j }) => card(j, index.orgs));

  const scored: { j: ClosedJobListing; score: number }[] = [];
  for (const j of index.jobs) {
    if (j.org === hit.company) continue;
    const score = scoreListing(j, query, category, roleTest);
    if (score <= 0) continue;
    scored.push({ j, score });
  }
  scored.sort((a, b) => b.score - a.score || a.j.title.localeCompare(b.j.title, "en") || (a.j.path < b.j.path ? -1 : 1));
  const similar: ClosedJobCard[] = [];
  const perOrg = new Map<string, number>();
  for (const { j } of scored) {
    if ((perOrg.get(j.org) ?? 0) >= 2) continue;
    perOrg.set(j.org, (perOrg.get(j.org) ?? 0) + 1);
    similar.push(card(j, index.orgs));
    if (similar.length >= CLOSED_SIMILAR_LIMIT) break;
  }

  return {
    hit,
    titleGuess,
    companyName: org?.name ?? titleCaseWords(hit.company.split("-")),
    jobsPath: org?.jobsPath ?? null,
    companyPath: org?.companyPath ?? null,
    companyJobs: atCompany,
    similarJobs: similar,
  };
}

/** Snapshot of current listings used to fill a closed-job page. Build-time only. */
export function buildClosedJobIndex(input: {
  shell: ClosedJobShell;
  pages: Array<{ org: { slug: string }; job: { title: string; locations: string[] }; path: string }>;
  orgs: Array<{ slug: string; name: string; jobsPath: string | null; companyPath: string | null }>;
}): ClosedJobIndex {
  return {
    shell: input.shell,
    orgs: Object.fromEntries(input.orgs.map((o) => [o.slug, { name: o.name, jobsPath: o.jobsPath, companyPath: o.companyPath }])),
    jobs: input.pages.map((p) => ({
      org: p.org.slug,
      title: p.job.title,
      path: p.path,
      location: p.job.locations.slice(0, 2).map(displayLocation).join(" · "),
    })),
  };
}
