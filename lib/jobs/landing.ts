/**
 * Jobs landing pages: /jobs/in/<state>/ and the topic pages (/jobs/entry-level/,
 * /jobs/no-programming/, /jobs/data-center-infrastructure/, /jobs/remote-us/,
 * /jobs/remote/). Build-time only (reads data/jobs/current.json through
 * readJobs). Every count, list, and date is recomputed on each build from the
 * same rules the /jobs/ directory filters use, so a page's "see all" link shows
 * exactly the same listings.
 */
import type { Catalog } from "../catalog";
import { formatDate } from "../dates";
import { stateSlug, US_STATES } from "../places";
import { readJobs } from "./load";
import type { FeedHealth } from "./schema";
import { jobGeography, stateDisplayName } from "./geo";
import { DEFAULT_JOB_FILTERS, filterJobs, serializeJobFilters, toJobItem, type JobFilters, type JobItem } from "./search";
import { DATA_CENTER_RULE, ENTRY_LEVEL_RULE, NO_PROGRAMMING_RULE } from "./tracks";

/** A state page needs at least this many current listings; fewer would make a thin page. */
export const MIN_STATE_LISTINGS = 10;
/** Topic pages below this are kept out of search engines (noindex) and the sitemap. */
export const MIN_TOPIC_LISTINGS = 10;
/** Listings embedded in a page's HTML; the rest are one link away in the directory. */
export const LISTINGS_SHOWN = 100;

/** How a page's listings relate to the United States. */
export type GeographyScope = "state" | "us-only" | "includes-outside";

export type TopicId = "data-center-infrastructure" | "no-programming" | "entry-level" | "remote-us" | "remote";

export type Facts = { count: number; employers: number; soleEmployer: string | null; date: string; usOnly: number; outside: number };

export type LandingDefinition = {
  id: string;
  path: string;
  /** Short name for breadcrumbs, links, and search. */
  name: string;
  h1: string;
  eyebrow: string;
  scope: GeographyScope;
  /** The /jobs/ directory filters that select exactly these listings. */
  filters: Partial<JobFilters>;
  intro: string;
  rule: string;
  title: (f: Facts) => string;
  description: (f: Facts) => string;
  /** Card image path, /og/jobs/<slug>.jpg. */
  image: string;
};

const n = (v: number) => v.toLocaleString("en-US");
const plural = (v: number, one: string, many: string) => `${n(v)} ${v === 1 ? one : many}`;
/** Whether any listing names a place outside the United States, said precisely either way. */
const abroad = (f: Facts) => (f.outside > 0 ? "Includes non-U.S. roles." : "No non-U.S. roles listed.");
const listings = (v: number, adjective = "open") => plural(v, `${adjective} listing`, `${adjective} listings`);
/** "14 U.S. AI companies and labs", or the employer's name when there is only one. */
const at = (f: Facts, kind = "U.S. AI") => (f.employers === 1 && f.soleEmployer ? f.soleEmployer : plural(f.employers, `${kind} company or lab`, `${kind} companies and labs`));

export { stateDisplayName };

const REMOTE_RULE =
  "Listings the employer marks as remote, or with a listed location that says “Remote” (for example “Remote - US” or “Remote-Friendly, United States”). The employer’s workplace field is shown on each listing as supplied, so a listing can say “hybrid” while offering a remote location.";

export const TOPICS: Record<TopicId, LandingDefinition> = {
  "data-center-infrastructure": {
    id: "data-center-infrastructure",
    path: "/jobs/data-center-infrastructure/",
    name: "Data-center and infrastructure jobs",
    h1: "AI data-center and infrastructure jobs",
    eyebrow: "Jobs by topic",
    scope: "includes-outside",
    filters: { track: "infrastructure" },
    intro:
      "Open positions for planning, building, powering, cooling, and running the data centers and computing hardware that AI runs on: construction and commissioning, electrical and mechanical work, critical facilities, technicians, capacity planning, and the finance, sourcing, and legal roles attached to them.",
    rule: DATA_CENTER_RULE,
    title: (f) => `AI data-center and infrastructure jobs: ${listings(f.count)}`,
    description: (f) =>
      `${plural(f.count, "open AI data-center job", "open AI data-center jobs")} in construction, power, cooling, and operations at ${at(f)}. ${abroad(f)} Checked ${f.date}.`,
    image: "/og/jobs/data-center-infrastructure.jpg",
  },
  "no-programming": {
    id: "no-programming",
    path: "/jobs/no-programming/",
    name: "Jobs that don't require programming",
    h1: "AI jobs that don't require programming",
    eyebrow: "Jobs by topic",
    scope: "includes-outside",
    filters: { track: "beyond-engineering" },
    intro:
      "Open positions at AI companies and labs whose titles name work other than programming: sales and partnerships, marketing and communications, policy and legal, finance, recruiting and people, operations, facilities and technicians, customer success and support, program and product management, design, and writing.",
    rule: NO_PROGRAMMING_RULE,
    title: (f) => `AI jobs without programming: ${listings(f.count)} at U.S. AI companies`,
    description: (f) =>
      `${plural(f.count, "AI job", "AI jobs")} without programming (sales, policy, finance, design, and more) at ${at(f)}. ${abroad(f)} Checked ${f.date}.`,
    image: "/og/jobs/no-programming.jpg",
  },
  "entry-level": {
    id: "entry-level",
    path: "/jobs/entry-level/",
    name: "Entry-level jobs",
    h1: "Entry-level jobs at AI companies",
    eyebrow: "Jobs by topic",
    scope: "includes-outside",
    filters: { track: "early-career" },
    intro:
      "Internships, new-graduate roles, apprenticeships, residencies, fellowships, and other entry points at AI companies and labs in the USASI catalog, found from the employer’s own title and employment type.",
    rule: ENTRY_LEVEL_RULE,
    title: (f) => `Entry-level AI jobs: ${plural(f.count, "internship or early-career listing", "internships and early-career listings")}`,
    description: (f) =>
      `${plural(f.count, "internship, new-grad, or early-career listing", "internships, new-grad, and early-career listings")} at ${at(f)}, matched by job title. ${abroad(f)} Checked ${f.date}.`,
    image: "/og/jobs/entry-level.jpg",
  },
  "remote-us": {
    id: "remote-us",
    path: "/jobs/remote-us/",
    name: "Remote jobs, U.S. locations",
    h1: "Remote jobs at American AI companies, U.S. locations",
    eyebrow: "Jobs by location",
    scope: "us-only",
    filters: { where: "remote-us" },
    intro:
      "Remote and remote-friendly positions at American AI companies and labs whose listed locations are all in the United States. Remote listings that also name places outside the United States are on the page for all remote jobs.",
    rule: `${REMOTE_RULE} A listing is included here only when it names the United States or a U.S. state (in its locations or the employer-supplied country) and names no place outside the United States.`,
    title: (f) => `Remote AI jobs in the U.S.: ${listings(f.count)} at American AI companies`,
    description: (f) =>
      `${listings(f.count, "remote")} with U.S. locations only, at ${at(f, "American AI")} in the USASI catalog. Listings last checked ${f.date}.`,
    image: "/og/jobs/remote-us.jpg",
  },
  remote: {
    id: "remote",
    path: "/jobs/remote/",
    name: "Remote jobs, all locations",
    h1: "Remote jobs at American AI companies, all locations",
    eyebrow: "Jobs by location",
    scope: "includes-outside",
    filters: { where: "remote" },
    intro:
      "Every remote and remote-friendly position from American AI companies and labs in the USASI catalog, wherever the employer lists it. Many are open only in specific countries; read each listing’s locations.",
    rule: REMOTE_RULE,
    title: (f) => `Remote AI jobs: ${listings(f.count)}, including outside the U.S.`,
    description: (f) =>
      `${listings(f.count, "remote")} at ${at(f, "American AI")}: ${n(f.usOnly)} with U.S. locations only, ${n(f.outside)} naming places outside the U.S. Checked ${f.date}.`,
    image: "/og/jobs/remote.jpg",
  },
};
export const TOPIC_IDS = Object.keys(TOPICS) as TopicId[];

export function stateDefinition(code: string): LandingDefinition {
  const name = stateDisplayName(code);
  const slug = stateSlug(code);
  return {
    id: `in-${slug}`,
    path: `/jobs/in/${slug}/`,
    name: `Jobs in ${name}`,
    h1: `AI jobs in ${name}`,
    eyebrow: "Jobs by U.S. state",
    scope: "state",
    filters: { state: code },
    intro: `Open positions at AI companies and labs in the USASI catalog whose listed location names ${name}. The catalog covers U.S. organizations, and a listing appears here only when one of its employer-supplied locations is in ${name}.`,
    rule: `A listing counts when one of its employer-supplied locations names ${name}: by postal code after a city (“Atlanta, GA”), by full name (“Atlanta, Georgia, United States”), “New York City” or “NYC” for New York, or “Washington, DC” for the District of Columbia. Locations that give only a city (“San Francisco”), only the country (“Remote - US”, “United States”), or a code that belongs to another country’s city (“Toronto, CA” is Canada) are not counted.`,
    title: (f) => `AI jobs in ${name}: ${listings(f.count)} at U.S. AI companies and labs`,
    description: (f) =>
      `${listings(f.count)} naming a location in ${name}, at ${at(f)} in the USASI catalog. Listings last checked ${f.date}.`,
    image: `/og/jobs/in-${slug}.jpg`,
  };
}

export type LandingEmployer = { slug: string; name: string; headquarters: string | null; count: number };

export type LandingPage = Omit<LandingDefinition, "title" | "description"> & {
  kind: "state" | "topic";
  /** The state's postal code, for state pages. */
  state: string | null;
  title: string;
  description: string;
  count: number;
  /** The listings embedded in the page (newest first, at most LISTINGS_SHOWN). */
  listings: JobItem[];
  employers: LandingEmployer[];
  /** Most recent and oldest successful check among the listings. */
  lastChecked: string | null;
  oldestChecked: string | null;
  geography: { usOnly: number; outside: number; outsideOnly: number; unclear: number; alsoElsewhere: number };
  /** /jobs/?… that shows exactly these listings, newest first. */
  directoryHref: string;
  /** Same topic, U.S. locations only, in the directory (topic pages that include non-U.S. positions). */
  usOnlyHref: string | null;
  usOnlyCount: number;
  indexable: boolean;
  /** When the counts were computed (the build), for the client-side freshness notice. */
  buildAt: string;
};

export type JobsLandingData = { states: LandingPage[]; topics: LandingPage[]; all: LandingPage[]; stateCounts: Record<string, number> };

const memo = new WeakMap<Catalog, JobsLandingData>();

type Source = { items: JobItem[]; feeds: FeedHealth[]; now: number };

function build(catalog: Catalog, def: LandingDefinition, kind: "state" | "topic", src: Source, state: string | null): LandingPage {
  const filters: JobFilters = { ...DEFAULT_JOB_FILTERS, ...def.filters, sort: "newest" };
  const listings = filterJobs(src.items, src.feeds, filters, src.now);
  const byOrg = new Map<string, number>();
  for (const j of listings) byOrg.set(j.organization_slug, (byOrg.get(j.organization_slug) ?? 0) + 1);
  const employers = [...byOrg]
    .map(([slug, count]) => {
      const o = catalog.organization(slug);
      return { slug, name: o?.name ?? slug, headquarters: o?.headquarters?.label ?? null, count };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
  const seen = listings.map((j) => j.last_seen).sort();
  const geo = { usOnly: 0, outside: 0, outsideOnly: 0, unclear: 0, alsoElsewhere: 0 };
  for (const j of listings) {
    const g = jobGeography(j);
    if (g.us && !g.outside) geo.usOnly += 1;
    if (g.outside) geo.outside += 1;
    if (g.outside && !g.us) geo.outsideOnly += 1;
    if (!g.us && !g.outside) geo.unclear += 1;
    if (state && (g.outside || g.states.some((s) => s !== state))) geo.alsoElsewhere += 1;
  }
  const facts: Facts = {
    count: listings.length,
    employers: employers.length,
    soleEmployer: employers.length === 1 ? employers[0].name : null,
    date: seen.length ? formatDate(seen[seen.length - 1].slice(0, 10)) : "not yet",
    usOnly: geo.usOnly,
    outside: geo.outside,
  };
  const usOnlyFilters = def.scope === "includes-outside" ? { ...filters, where: def.filters.where === "remote" ? "remote-us" : "us" } as JobFilters : null;
  return {
    ...def,
    kind,
    state,
    title: def.title(facts),
    description: def.description(facts),
    count: listings.length,
    listings: listings.slice(0, LISTINGS_SHOWN),
    employers,
    lastChecked: seen.at(-1) ?? null,
    oldestChecked: seen[0] ?? null,
    geography: geo,
    directoryHref: `/jobs/?${serializeJobFilters(filters)}`,
    usOnlyHref: usOnlyFilters ? `/jobs/?${serializeJobFilters(usOnlyFilters)}` : null,
    usOnlyCount: geo.usOnly,
    indexable: kind === "state" || listings.length >= MIN_TOPIC_LISTINGS,
    buildAt: new Date(src.now).toISOString(),
  };
}

/**
 * Every landing page from a set of listings. Listings are the directory's
 * default "recently confirmed" view at `now`: open, from a feed whose last
 * check succeeded, and seen within the last 48 hours.
 */
export function computeLandingData(catalog: Catalog, items: JobItem[], feeds: FeedHealth[], now: number): JobsLandingData {
  const src: Source = { items, feeds, now };
  const current = filterJobs(items, feeds, DEFAULT_JOB_FILTERS, now);
  const stateCounts: Record<string, number> = {};
  for (const j of current) for (const s of jobGeography(j).states) stateCounts[s] = (stateCounts[s] ?? 0) + 1;
  const states = Object.keys(US_STATES)
    .filter((code) => (stateCounts[code] ?? 0) >= MIN_STATE_LISTINGS)
    .map((code) => build(catalog, stateDefinition(code), "state", src, code))
    .sort((a, b) => a.h1.localeCompare(b.h1, "en"));
  const topics = TOPIC_IDS.map((id) => build(catalog, TOPICS[id], "topic", src, null));
  return { states, topics, all: [...topics, ...states], stateCounts };
}

/** The site's landing pages, from data/jobs/current.json at this build's timestamp; computed once per catalog. */
export function jobsLandingData(catalog: Catalog): JobsLandingData {
  const hit = memo.get(catalog);
  if (hit) return hit;
  const data = readJobs(catalog.organizations);
  const names = new Map(catalog.organizations.map((o) => [o.slug, o.name]));
  const items = data.jobs.filter((j) => j.status === "open").map((j) => toJobItem(j, names.get(j.organization_slug)!));
  const result = computeLandingData(catalog, items, data.feeds, Date.parse(catalog.buildAt));
  memo.set(catalog, result);
  return result;
}

export function landingPage(catalog: Catalog, path: string): LandingPage | undefined {
  return jobsLandingData(catalog).all.find((p) => p.path === path);
}
