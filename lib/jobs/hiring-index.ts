/**
 * Weekly AI Hiring Index: small dated counts of open jobs by employer and by
 * U.S. state. Written on each jobs refresh (`scripts/snapshot-jobs.ts` and
 * `scripts/refresh-jobs.ts`); read by /jobs/index/ at build time.
 *
 * Snapshots are counts only (no job records). One bucket per ISO week (Monday
 * UTC); later refreshes in the same week replace that bucket. Missing file is
 * an empty history, not a build error.
 */
import fs from "node:fs";
import path from "node:path";
import type { Catalog } from "../catalog";
import { formatDate } from "../dates";
import { absoluteUrl } from "../paths";
import { stateSlug, US_STATES } from "../places";
import { SCHEMA_CONTEXT } from "../structured-data";
import { z } from "../zod";
import { jobGeography, stateDisplayName } from "./geo";
import { landingPage } from "./landing";
import { layoffHref, layoffsIndex, type LayoffsIndex } from "./layoffs";
import { DATA_PATH } from "./load";
import type { Dataset } from "./schema";
import { Dataset as DatasetSchema } from "./schema";

export const HIRING_INDEX_PATH = path.join(process.cwd(), "data/jobs/hiring-index.json");
export const HIRING_INDEX_HREF = "/jobs/index/";
/** Keep a year of weeks; older buckets drop off the file. */
export const HIRING_INDEX_MAX_WEEKS = 52;
export const HIRING_INDEX_TOP_COMPANIES = 20;
export const HIRING_INDEX_TOP_STATES = 15;
export const HIRING_INDEX_MOVERS = 10;

const key = z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/);

export const CountRow = z
  .object({
    key,
    count: z.number().int().nonnegative(),
  })
  .strict();
export type CountRow = z.infer<typeof CountRow>;

export const WeekSnapshot = z
  .object({
    week_start: z.iso.date(),
    captured_at: z.iso.datetime({ offset: true }),
    open_count: z.number().int().nonnegative(),
    companies: z.array(CountRow).max(500),
    states: z.array(CountRow).max(60),
  })
  .strict();
export type WeekSnapshot = z.infer<typeof WeekSnapshot>;

export const HiringIndex = z
  .object({
    version: z.literal(1),
    weeks: z.array(WeekSnapshot).max(HIRING_INDEX_MAX_WEEKS),
  })
  .strict();
export type HiringIndex = z.infer<typeof HiringIndex>;

export const EMPTY_HIRING_INDEX: HiringIndex = { version: 1, weeks: [] };

/** Monday (UTC) of the ISO week that contains `at`. */
export function weekStartUtc(at: string | number | Date): string {
  const d = new Date(typeof at === "string" || typeof at === "number" ? at : at.getTime());
  if (!Number.isFinite(d.getTime())) throw new Error("hiring-index: invalid snapshot time");
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

/** Sunday (UTC) of the week that starts on `weekStart` (YYYY-MM-DD Monday). */
export function weekEndUtc(weekStart: string): string {
  const d = new Date(`${weekStart}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** "Oct 12–18, 2026" for a Monday UTC week start. */
export function weekLabel(weekStart: string): string {
  const end = weekEndUtc(weekStart);
  const a = formatDate(weekStart);
  const b = formatDate(end);
  if (weekStart.slice(0, 4) !== end.slice(0, 4)) return `${a}–${b}`;
  if (weekStart.slice(0, 7) === end.slice(0, 7)) {
    return `${a.replace(/, \d{4}$/, "")}–${Number(end.slice(8))}, ${end.slice(0, 4)}`;
  }
  return `${a.replace(/, \d{4}$/, "")}–${b}`;
}

function tally(rows: Iterable<string>): CountRow[] {
  const counts = new Map<string, number>();
  for (const k of rows) counts.set(k, (counts.get(k) ?? 0) + 1);
  return [...counts]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "en"));
}

/**
 * Open listings only. A listing that names several U.S. states counts once per
 * state; a listing that names none is in the employer total only.
 */
export function countOpenJobs(data: Dataset): { open_count: number; companies: CountRow[]; states: CountRow[] } {
  const open = data.jobs.filter((j) => j.status === "open");
  return {
    open_count: open.length,
    companies: tally(open.map((j) => j.organization_slug)),
    states: tally(open.flatMap((j) => jobGeography(j).states)),
  };
}

export function snapshotFromDataset(data: Dataset, at: string): WeekSnapshot {
  const captured = new Date(Date.parse(at));
  if (!Number.isFinite(captured.getTime())) throw new Error("hiring-index: invalid snapshot time");
  const captured_at = captured.toISOString();
  return { week_start: weekStartUtc(captured_at), captured_at, ...countOpenJobs(data) };
}

/** Replace this week's bucket (or append it); keep the newest `HIRING_INDEX_MAX_WEEKS` weeks. */
export function mergeSnapshot(index: HiringIndex, week: WeekSnapshot): HiringIndex {
  const weeks = index.weeks.filter((w) => w.week_start !== week.week_start);
  weeks.push(week);
  weeks.sort((a, b) => a.week_start.localeCompare(b.week_start) || a.captured_at.localeCompare(b.captured_at));
  return { version: 1, weeks: weeks.slice(-HIRING_INDEX_MAX_WEEKS) };
}

export function readHiringIndex(file = HIRING_INDEX_PATH): HiringIndex {
  if (!fs.existsSync(file)) return EMPTY_HIRING_INDEX;
  return HiringIndex.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

export function writeHiringIndex(data: HiringIndex, file = HIRING_INDEX_PATH): void {
  HiringIndex.parse(data);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data) + "\n");
  fs.renameSync(`${file}.tmp`, file);
}

export function readJobsDataset(file = DATA_PATH): Dataset | null {
  if (!fs.existsSync(file)) return null;
  return DatasetSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}

/**
 * Count open jobs in `data` (or `current.json`) and upsert this week's bucket.
 * Returns the week that was written. Safe to call often: the file is small.
 */
export function recordHiringIndex(at: string, data?: Dataset, file = HIRING_INDEX_PATH): WeekSnapshot | null {
  const dataset = data ?? readJobsDataset();
  if (!dataset) return null;
  const week = snapshotFromDataset(dataset, at);
  writeHiringIndex(mergeSnapshot(readHiringIndex(file), week), file);
  return week;
}

export type ChangeRow = {
  key: string;
  name: string;
  href: string;
  count: number;
  previous: number | null;
  delta: number | null;
};

export type WarnPairing = {
  code: string;
  name: string;
  href: string;
  jobsHref: string | null;
  jobs: number;
  previousJobs: number | null;
  delta: number | null;
  notices: number;
  employees: number | null;
  layoffHref: string;
};

export type HiringIndexPage = {
  path: string;
  title: string;
  description: string;
  weeks: WeekSnapshot[];
  current: WeekSnapshot | null;
  previous: WeekSnapshot | null;
  coldStart: boolean;
  weekLabel: string | null;
  previousLabel: string | null;
  capturedAt: string | null;
  openCount: number;
  previousOpen: number | null;
  openDelta: number | null;
  companies: ChangeRow[];
  states: ChangeRow[];
  rising: ChangeRow[];
  fewer: ChangeRow[];
  risingStates: ChangeRow[];
  fewerStates: ChangeRow[];
  warn: WarnPairing[];
  layoffs: LayoffsIndex;
};

const countOf = (rows: CountRow[], key: string) => rows.find((r) => r.key === key)?.count ?? 0;

function changeRows(
  current: CountRow[],
  previous: CountRow[] | null,
  nameOf: (key: string) => string,
  hrefOf: (key: string) => string,
): ChangeRow[] {
  const keys = new Set([...current.map((r) => r.key), ...(previous ?? []).map((r) => r.key)]);
  return [...keys]
    .map((key) => {
      const count = countOf(current, key);
      const prev = previous ? countOf(previous, key) : null;
      return {
        key,
        name: nameOf(key),
        href: hrefOf(key),
        count,
        previous: prev,
        delta: prev === null ? null : count - prev,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

function companyName(catalog: Catalog, slug: string): string {
  return catalog.organizations.find((o) => o.slug === slug)?.name ?? slug;
}

function companyHref(slug: string): string {
  return `/jobs/at/${slug}/`;
}

/** A state's jobs page exists only with enough listings (MIN_STATE_LISTINGS); otherwise link the filtered search. */
function stateHref(catalog: Catalog, code: string): string {
  const path = code in US_STATES ? `/jobs/in/${stateSlug(code)}/` : null;
  return path && landingPage(catalog, path) ? path : `/jobs/?state=${code}&where=all`;
}

function clipMeta(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.\u2014-]+$/, "")}\u2026`;
}

function pageDescription(page: Omit<HiringIndexPage, "title" | "description">): string {
  if (!page.current) {
    return "Weekly open AI job counts by employer and U.S. state, shown next to official WARN Act layoff notices. The first week of the index starts when Jobs next refreshes.";
  }
  const n = page.openCount.toLocaleString("en-US");
  const week = page.weekLabel ?? "this week";
  if (page.coldStart) {
    return `${n} open AI listings the week of ${week}, by employer and U.S. state. Week-over-week change starts next week.`;
  }
  const delta = page.openDelta ?? 0;
  const change =
    delta === 0 ? "unchanged from last week" : delta > 0 ? `up ${delta.toLocaleString("en-US")} from last week` : `down ${Math.abs(delta).toLocaleString("en-US")} from last week`;
  return `${n} open AI listings the week of ${week}, ${change}. Counts by employer and U.S. state, next to official WARN Act notices.`;
}

function pageTitle(page: Omit<HiringIndexPage, "title" | "description">): string {
  if (!page.current) return "AI Hiring Index";
  if (page.coldStart) return "AI Hiring Index: first weekly counts";
  return "AI Hiring Index: weekly U.S. job counts";
}

let memo: { catalog: Catalog; data: HiringIndex; layoffs: LayoffsIndex; page: HiringIndexPage } | null = null;

export function hiringIndexPage(catalog: Catalog, data = readHiringIndex(), layoffs = layoffsIndex(catalog)): HiringIndexPage {
  if (memo && memo.catalog === catalog && memo.data === data && memo.layoffs === layoffs) return memo.page;
  const weeks = data.weeks;
  const current = weeks.at(-1) ?? null;
  const previous = weeks.length > 1 ? weeks[weeks.length - 2]! : null;
  const companies = current
    ? changeRows(current.companies, previous?.companies ?? null, (k) => companyName(catalog, k), companyHref)
    : [];
  const states = current
    ? changeRows(current.states, previous?.states ?? null, (k) => stateDisplayName(k) ?? k, (k) => stateHref(catalog, k))
    : [];
  const byDelta = (rows: ChangeRow[], sign: 1 | -1) =>
    rows
      .filter((r) => r.delta !== null && r.delta * sign > 0)
      .sort((a, b) => sign * ((b.delta ?? 0) - (a.delta ?? 0)) || a.name.localeCompare(b.name, "en"))
      .slice(0, HIRING_INDEX_MOVERS);
  const warn: WarnPairing[] = layoffs.states.map((s) => {
    const jobs = current ? countOf(current.states, s.meta.code) : 0;
    const previousJobs = previous ? countOf(previous.states, s.meta.code) : null;
    const employees = s.file.notices.reduce<number | null>((sum, n) => (n.employees === null ? sum : (sum ?? 0) + n.employees), null);
    return {
      code: s.meta.code,
      name: s.meta.name,
      href: s.jobState?.path ?? stateHref(catalog, s.meta.code),
      jobsHref: s.jobState?.path ?? (jobs > 0 ? stateHref(catalog, s.meta.code) : null),
      jobs,
      previousJobs,
      delta: previousJobs === null ? null : jobs - previousJobs,
      notices: s.file.notices.length,
      employees,
      layoffHref: layoffHref(s.meta.code),
    };
  });
  const draft = {
    path: HIRING_INDEX_HREF,
    weeks,
    current,
    previous,
    coldStart: !current || !previous,
    weekLabel: current ? weekLabel(current.week_start) : null,
    previousLabel: previous ? weekLabel(previous.week_start) : null,
    capturedAt: current?.captured_at ?? null,
    openCount: current?.open_count ?? 0,
    previousOpen: previous?.open_count ?? null,
    openDelta: current && previous ? current.open_count - previous.open_count : null,
    companies: companies.slice(0, HIRING_INDEX_TOP_COMPANIES),
    states: states.slice(0, HIRING_INDEX_TOP_STATES),
    rising: byDelta(companies, 1),
    fewer: byDelta(companies, -1),
    risingStates: byDelta(states, 1),
    fewerStates: byDelta(states, -1),
    warn,
    layoffs,
  };
  const page: HiringIndexPage = {
    ...draft,
    title: pageTitle(draft),
    description: clipMeta(pageDescription(draft), 160),
  };
  memo = { catalog, data, layoffs, page };
  return page;
}

export function hiringIndexSearchEntry(catalog: Catalog, data = readHiringIndex()) {
  const page = hiringIndexPage(catalog, data);
  return {
    type: "page" as const,
    slug: "jobs-hiring-index",
    href: HIRING_INDEX_HREF,
    name: "AI Hiring Index",
    summary: page.description,
    keywords: "hiring index jobs weekly counts layoffs warn employers states ai careers",
  };
}

export function hiringIndexJsonLd(page: HiringIndexPage): object {
  const url = absoluteUrl(HIRING_INDEX_HREF);
  const graph: object[] = [
    {
      "@type": "CollectionPage",
      name: page.title,
      url,
      description: page.description,
      mainEntity: { "@id": `${url}#index` },
    },
    {
      "@type": "Dataset",
      "@id": `${url}#index`,
      name: "USASI AI Hiring Index",
      description: page.description,
      url,
      creator: { "@type": "Organization", name: "USASI", url: absoluteUrl("/") },
      isAccessibleForFree: true,
      measurementTechnique: "Open listings counted from employer career feeds in the USASI Jobs catalog, aggregated by ISO week (Monday UTC).",
      variableMeasured: ["open job listings by employer", "open job listings by U.S. state named in the listing location"],
    },
  ];
  if (page.companies.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#employers`,
      name: "Employers by open AI listings this week",
      url,
      numberOfItems: page.companies.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: page.companies.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.name,
        url: absoluteUrl(r.href),
      })),
    });
  }
  return { "@context": SCHEMA_CONTEXT, "@graph": graph };
}
