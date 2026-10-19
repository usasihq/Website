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
import { isCurrent } from "./search";

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

export const EmployerStates = z
  .object({
    key,
    states: z.array(CountRow).max(60),
  })
  .strict();
export type EmployerStates = z.infer<typeof EmployerStates>;

/**
 * One week's counts. `checked`, `unchecked`, and `employer_states` were added
 * on 2026-10-19 and are optional so older buckets still parse. A bucket with
 * `checked` was counted with the Jobs directory's "current" rule (open, from a
 * source whose latest check succeeded, seen within 48 hours); a bucket without
 * it was counted from every open-state row, including rows from sources whose
 * latest check had failed.
 */
export const WeekSnapshot = z
  .object({
    week_start: z.iso.date(),
    captured_at: z.iso.datetime({ offset: true }),
    open_count: z.number().int().nonnegative(),
    companies: z.array(CountRow).max(500),
    states: z.array(CountRow).max(60),
    /** Employers whose career source's latest check succeeded at capture time. */
    checked: z.array(key).max(500).optional(),
    /** Employers with a configured source whose latest check had not succeeded. */
    unchecked: z.array(key).max(500).optional(),
    /** Per-employer state counts, so state change can be limited to employers counted in both weeks. */
    employer_states: z.array(EmployerStates).max(500).optional(),
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
 * Current listings only, by the same rule the Jobs directory, employer pages,
 * and job pages use (`isCurrent` in ./search): open, from a source whose latest
 * check succeeded, and seen within 48 hours of `now`. A listing that names
 * several U.S. states counts once per state; a listing that names none is in
 * the employer total only.
 */
export function countOpenJobs(
  data: Dataset,
  now: number,
): Pick<WeekSnapshot, "open_count" | "companies" | "states" | "checked" | "unchecked" | "employer_states"> {
  const health = new Map(data.feeds.map((f) => [`${f.organization_slug}:${f.source_type}:${f.source_identifier}`, f]));
  const open = data.jobs.filter((j) => isCurrent(j, health.get(`${j.organization_slug}:${j.source_type}:${j.source_identifier}`), now));
  const ok = new Set<string>();
  const failed = new Set<string>();
  for (const f of data.feeds) (f.result === "ok" ? ok : failed).add(f.organization_slug);
  // An employer counts as checked only when every one of its sources succeeded.
  for (const slug of failed) ok.delete(slug);
  const byEmployer = new Map<string, string[]>();
  for (const j of open) {
    const list = byEmployer.get(j.organization_slug) ?? [];
    list.push(...jobGeography(j).states);
    byEmployer.set(j.organization_slug, list);
  }
  return {
    open_count: open.length,
    companies: tally(open.map((j) => j.organization_slug)),
    states: tally(open.flatMap((j) => jobGeography(j).states)),
    checked: [...ok].sort(),
    unchecked: [...failed].sort(),
    employer_states: [...byEmployer]
      .map(([k, states]) => ({ key: k, states: tally(states) }))
      .filter((e) => e.states.length)
      .sort((a, b) => a.key.localeCompare(b.key, "en")),
  };
}

export function snapshotFromDataset(data: Dataset, at: string): WeekSnapshot {
  const captured = new Date(Date.parse(at));
  if (!Number.isFinite(captured.getTime())) throw new Error("hiring-index: invalid snapshot time");
  const captured_at = captured.toISOString();
  return { week_start: weekStartUtc(captured_at), captured_at, ...countOpenJobs(data, captured.getTime()) };
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

/**
 * How a row's week-over-week change was found:
 * - `compared`: the employer's source was checked successfully in both weeks
 *   (for states: the change counts only those employers);
 * - `new`: the employer was not in last week's index at all (a source added this week);
 * - `unchecked`: the employer's source was not checked successfully this week;
 * - `unchecked-before`: it was not checked successfully last week;
 * - `none`: no comparison (first week, or no per-employer state counts last week).
 */
export type ChangeStatus = "compared" | "new" | "unchecked" | "unchecked-before" | "none";

export type ChangeRow = {
  key: string;
  name: string;
  /** Null when there is nothing current to link to (an employer with no current listings). */
  href: string | null;
  count: number;
  previous: number | null;
  delta: number | null;
  status: ChangeStatus;
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
  /** Employers with at least one current listing this week. */
  employerCount: number;
  /** "50 U.S. states and D.C." style label for the states named this week. */
  statesLabel: string;
  /** Employers counted (source checked successfully) in both weeks, and their totals each week. */
  compared: { employers: number; previous: number; current: number } | null;
  /** Change at employers counted in both weeks; null in the first week. Newly added sources are not part of it. */
  openDelta: number | null;
  /** Sources that first appear this week. */
  newSources: { employers: number; listings: number };
  /** Employers whose source was not checked successfully this week. */
  uncheckedNow: number;
  /** State change is shown only when both weeks have per-employer state counts. */
  stateCompare: boolean;
  /** Labels of shown weeks counted before the "current" rule (they may include listings from failing sources). */
  earlierRuleWeeks: string[];
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

/** "50 U.S. states and D.C.", "3 U.S. states", "D.C." — D.C. is never counted as a state. */
export function statesLabel(codes: string[]): string {
  const dc = codes.includes("DC");
  const states = codes.filter((c) => c !== "DC").length;
  const label = `${states.toLocaleString("en-US")} U.S. ${states === 1 ? "state" : "states"}`;
  if (!dc) return label;
  return states ? `${label} and D.C.` : "D.C.";
}

function employerSets(w: WeekSnapshot) {
  const counted = new Set(w.companies.filter((r) => r.count > 0).map((r) => r.key));
  // Older buckets (no `checked`) only tell us which employers had listings.
  const checked = w.checked ? new Set(w.checked) : counted;
  const unchecked = new Set(w.unchecked ?? []);
  return { checked, unchecked, known: new Set([...checked, ...unchecked, ...counted]) };
}

/** Employer rows with each change limited to employers whose sources were checked successfully in both weeks. */
export function companyChanges(
  current: WeekSnapshot,
  previous: WeekSnapshot | null,
  nameOf: (key: string) => string = (k) => k,
  hrefOf: (key: string) => string | null = companyHref,
): ChangeRow[] {
  const cur = employerSets(current);
  const prev = previous ? employerSets(previous) : null;
  const keys = new Set([
    ...current.companies.map((r) => r.key),
    ...(previous?.companies ?? []).map((r) => r.key),
    ...(prev ? [...cur.checked].filter((k) => prev.checked.has(k) && !prev.unchecked.has(k) && !cur.unchecked.has(k)) : []),
  ]);
  return [...keys]
    .map((key): ChangeRow => {
      const count = countOf(current.companies, key);
      const before = previous ? countOf(previous.companies, key) : null;
      let status: ChangeStatus = "none";
      if (prev) {
        // An older bucket kept failing sources' listings open, so an employer missing from it had a successful check.
        if (cur.unchecked.has(key) || (current.checked && !cur.checked.has(key))) status = "unchecked";
        else if (prev.unchecked.has(key)) status = "unchecked-before";
        else if (!prev.known.has(key)) status = "new";
        else status = "compared";
      }
      return {
        key,
        name: nameOf(key),
        href: count > 0 ? hrefOf(key) : null,
        count,
        previous: before,
        delta: status === "compared" && before !== null ? count - before : null,
        status,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

/** State rows; change only over employers compared in both weeks, and only when both weeks have per-employer state counts. */
export function stateChanges(
  current: WeekSnapshot,
  previous: WeekSnapshot | null,
  comparedEmployers: Set<string>,
  nameOf: (key: string) => string = (k) => k,
  hrefOf: (key: string) => string = (k) => k,
): { rows: ChangeRow[]; compared: boolean } {
  const compared = Boolean(previous && current.employer_states && previous.employer_states);
  const sum = (w: WeekSnapshot, code: string) =>
    (w.employer_states ?? []).reduce((s, e) => (comparedEmployers.has(e.key) ? s + countOf(e.states, code) : s), 0);
  const keys = new Set([...current.states.map((r) => r.key), ...(compared ? previous!.states.map((r) => r.key) : [])]);
  const rows = [...keys]
    .map((key): ChangeRow => {
      const count = countOf(current.states, key);
      const delta = compared ? sum(current, key) - sum(previous!, key) : null;
      return {
        key,
        name: nameOf(key),
        href: hrefOf(key),
        count,
        previous: previous ? countOf(previous.states, key) : null,
        delta,
        status: compared ? "compared" : "none",
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
  return { rows, compared };
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
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.—-]+$/, "")}…`;
}

const fmt = (v: number) => v.toLocaleString("en-US");

function pageDescription(page: Omit<HiringIndexPage, "title" | "description">): string {
  if (!page.current) {
    return "Weekly open AI job counts by employer and U.S. state, shown next to official WARN Act layoff notices. The first week of the index starts when Jobs next refreshes.";
  }
  const n = fmt(page.openCount);
  const week = page.weekLabel ?? "this week";
  if (page.coldStart) {
    return `${n} open AI listings the week of ${week}, by employer and U.S. state. Week-over-week change starts next week.`;
  }
  const delta = page.openDelta ?? 0;
  const k = page.compared?.employers ?? 0;
  const change = delta === 0 ? "unchanged" : delta > 0 ? `up ${fmt(delta)}` : `down ${fmt(Math.abs(delta))}`;
  const newer = page.newSources.employers ? `; ${fmt(page.newSources.employers)} new ${page.newSources.employers === 1 ? "source" : "sources"}` : "";
  return `${n} open AI listings the week of ${week}, ${change} at the ${fmt(k)} ${k === 1 ? "employer" : "employers"} counted both weeks${newer}. By employer and U.S. state.`;
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
  const allCompanies = current ? companyChanges(current, previous, (k) => companyName(catalog, k), companyHref) : [];
  const comparedRows = allCompanies.filter((r) => r.status === "compared");
  const comparedKeys = new Set(comparedRows.map((r) => r.key));
  const { rows: states, compared: stateCompare } = current
    ? stateChanges(current, previous, comparedKeys, (k) => stateDisplayName(k) ?? k, (k) => stateHref(catalog, k))
    : { rows: [], compared: false };
  const stateDelta = new Map(states.map((r) => [r.key, r.delta]));
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
      delta: stateDelta.get(s.meta.code) ?? (stateCompare ? 0 : null),
      notices: s.file.notices.length,
      employees,
      layoffHref: layoffHref(s.meta.code),
    };
  });
  const newRows = allCompanies.filter((r) => r.status === "new");
  const compared =
    current && previous
      ? {
          employers: comparedRows.length,
          previous: comparedRows.reduce((s, r) => s + (r.previous ?? 0), 0),
          current: comparedRows.reduce((s, r) => s + r.count, 0),
        }
      : null;
  const shownWeeks = weeks.filter((w) => w === current || w === previous);
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
    employerCount: current ? current.companies.filter((r) => r.count > 0).length : 0,
    statesLabel: statesLabel(current?.states.map((r) => r.key) ?? []),
    compared,
    openDelta: compared ? compared.current - compared.previous : null,
    newSources: { employers: newRows.length, listings: newRows.reduce((s, r) => s + r.count, 0) },
    uncheckedNow: current?.unchecked?.length ?? 0,
    stateCompare,
    earlierRuleWeeks: shownWeeks.filter((w) => !w.checked).map((w) => weekLabel(w.week_start)),
    companies: allCompanies.filter((r) => r.count > 0).slice(0, HIRING_INDEX_TOP_COMPANIES),
    states: states.slice(0, HIRING_INDEX_TOP_STATES),
    rising: byDelta(comparedRows, 1),
    fewer: byDelta(comparedRows, -1),
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
        ...(r.href ? { url: absoluteUrl(r.href) } : {}),
      })),
    });
  }
  return { "@context": SCHEMA_CONTEXT, "@graph": graph };
}
