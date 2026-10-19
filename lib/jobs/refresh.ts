/**
 * Jobs refresh orchestration: every enabled employer is checked, previous
 * listings are kept when a source fails or times out, and progress is written
 * after each source so a later workflow timeout still leaves a usable snapshot.
 */
import fs from "node:fs";
import type { Description } from "./description";
import { descriptionText, htmlToDescription } from "./description";
import { adapters, type SourceRow } from "./adapters";
import { DATA_PATH } from "./load";
import { type Dataset, isAutomatedSource, Job, type Careers } from "./schema";
import { FeedError, fetchFeed } from "./security";
import { reconcile, type FeedResult } from "./reconcile";
import { allLocationsRemote, workplaceFromText } from "./workplace-text";
import { withDescriptionPay } from "./pay-text";
import { writeDescriptions } from "./descriptions-store";
import { fetchUsaJobsItems, usaJobsPayload, usajobsCredentials } from "./usajobs";
import { fetchSmartRecruiters } from "./smartrecruiters";
import { fetchWorkday, writeWorkdayMeta, type WdMeta, type WdPayload } from "./workday";

export const DEFAULT_CONCURRENCY = 4;
export const DEFAULT_SOURCE_TIMEOUT_MS = 180_000;
const MAX_CONCURRENCY = 8;

export type EnabledOrg = { slug: string; careers: Careers };

export function parseConcurrency(raw: string | undefined, fallback = DEFAULT_CONCURRENCY): number {
  const n = Number(raw ?? fallback);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(MAX_CONCURRENCY, Math.floor(n));
}

export function parseTimeoutMs(raw: string | undefined, fallback = DEFAULT_SOURCE_TIMEOUT_MS): number {
  const n = Number(raw ?? fallback);
  if (!Number.isFinite(n) || n < 1_000) return fallback;
  return Math.floor(n);
}

/** At most `concurrency` calls in flight; results stay in input order. */
export async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Math.max(1, Math.min(Math.floor(concurrency) || 1, items.length || 1));
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: items.length ? workers : 0 }, () => worker()));
  return results;
}

export function createLock(): <T>(fn: () => T | Promise<T>) => Promise<T> {
  let tail: Promise<void> = Promise.resolve();
  return function lock<T>(fn: () => T | Promise<T>): Promise<T> {
    const run = tail.then(fn, fn);
    tail = run.then(() => undefined, () => undefined);
    return run;
  };
}

export async function withSourceTimeout<T>(ms: number, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await work(controller.signal);
  } catch (e) {
    if (controller.signal.aborted) throw new FeedError("network", "timeout");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function persistJobsState(
  state: Dataset,
  descriptions: Map<string, Description>,
  workdayMeta: Map<string, WdMeta>,
): void {
  writeDescriptions(descriptions);
  writeWorkdayMeta(workdayMeta);
  fs.mkdirSync("data/jobs", { recursive: true });
  fs.writeFileSync(`${DATA_PATH}.tmp`, JSON.stringify(state) + "\n");
  fs.renameSync(`${DATA_PATH}.tmp`, DATA_PATH);
}

type FetchCtx = {
  descriptions: Map<string, Description>;
  workdayMeta: Map<string, WdMeta>;
};

async function fetchPayload(org: EnabledOrg, ctx: FetchCtx, signal: AbortSignal): Promise<unknown> {
  const c = org.careers;
  if (!isAutomatedSource(c.source.type)) throw new FeedError("payload");
  if (c.source.type === "usajobs") {
    const usajobs = usajobsCredentials();
    if (!usajobs) throw new FeedError("payload");
    return usaJobsPayload(await fetchUsaJobsItems(usajobs, fetch, undefined, signal));
  }
  if (c.source.type === "workday") {
    const identifier = "identifier" in c.source ? c.source.identifier : "";
    return fetchWorkday(
      c,
      (id) => ctx.workdayMeta.get(`${org.slug}:workday:${identifier}:${id}`),
      (id) => ctx.descriptions.has(`${org.slug}:workday:${identifier}:${id}`),
      fetch,
      signal,
    );
  }
  if (c.source.type === "smartrecruiters") {
    const identifier = c.source.type === "smartrecruiters" ? c.source.identifier : "";
    return fetchSmartRecruiters(
      c,
      (id) => ctx.descriptions.has(`${org.slug}:smartrecruiters:${identifier}:${id}`),
      fetch,
      signal,
    );
  }
  return fetchFeed(c, fetch, signal);
}

function enrichRows(rows: SourceRow[], descriptions: Map<string, Description>): SourceRow[] {
  for (const r of rows) {
    if (r.job.workplace !== "unknown" && r.job.salaries.length) continue;
    const text = r.html ? descriptionText(htmlToDescription(r.html) ?? []) : descriptions.has(r.job.id) ? descriptionText(descriptions.get(r.job.id)!) : "";
    if (r.job.workplace === "unknown") {
      const w = allLocationsRemote(r.job.locations) ? "remote" : text ? workplaceFromText(text) : null;
      if (w) r.job = { ...r.job, workplace: w, remote: w === "remote" };
    }
    r.job = withDescriptionPay(r.job, text);
  }
  return rows;
}

export type CheckedSource = {
  slug: string;
  result: FeedResult;
  durationMs: number;
  timedOut: boolean;
  retried: boolean;
  skipped?: boolean;
  rows?: SourceRow[];
  payload?: unknown;
};

async function runAttempt(org: EnabledOrg, ctx: FetchCtx, timeoutMs: number): Promise<{ rows: SourceRow[]; payload: unknown }> {
  const c = org.careers;
  if (!isAutomatedSource(c.source.type)) throw new FeedError("payload");
  const payload = await withSourceTimeout(timeoutMs, (signal) => fetchPayload(org, ctx, signal));
  const rows = enrichRows(adapters[c.source.type].rows(payload, org.slug, c), ctx.descriptions);
  const nowProbe = "1970-01-01T00:00:00.000Z";
  for (const j of rows.map((r) => r.job)) {
    Job.parse({
      ...j,
      first_seen: nowProbe,
      last_seen: nowProbe,
      last_successfully_checked: nowProbe,
      status: "open",
      missing_since: null,
      missing_checks: 0,
      closed_at: null,
    });
  }
  return { rows, payload };
}

export async function checkSource(org: EnabledOrg, ctx: FetchCtx, timeoutMs: number): Promise<CheckedSource> {
  const started = Date.now();
  const c = org.careers;
  if (!isAutomatedSource(c.source.type)) throw new Error("Invalid enabled source");
  if (c.source.type === "usajobs" && !usajobsCredentials()) {
    return { slug: org.slug, result: { ok: false, error: "network" }, durationMs: Date.now() - started, timedOut: false, retried: false, skipped: true };
  }
  let retried = false;
  const fail = (error: Exclude<FeedResult, { ok: true }>["error"], timedOut: boolean): CheckedSource => ({
    slug: org.slug,
    result: { ok: false, error },
    durationMs: Date.now() - started,
    timedOut,
    retried,
  });
  try {
    const { rows, payload } = await runAttempt(org, ctx, timeoutMs);
    return { slug: org.slug, result: { ok: true, jobs: rows.map((r) => r.job) }, durationMs: Date.now() - started, timedOut: false, retried, rows, payload };
  } catch (e) {
    const err = e instanceof FeedError ? e : new FeedError("payload");
    if (err.reason === "timeout") return fail("network", true);
    if (err.category !== "network") return fail(err.category, false);
    retried = true;
    try {
      const { rows, payload } = await runAttempt(org, ctx, timeoutMs);
      return { slug: org.slug, result: { ok: true, jobs: rows.map((r) => r.job) }, durationMs: Date.now() - started, timedOut: false, retried, rows, payload };
    } catch (e2) {
      const err2 = e2 instanceof FeedError ? e2 : new FeedError("payload");
      return fail(err2.category, err2.reason === "timeout");
    }
  }
}

function applySuccessfulRows(
  org: EnabledOrg,
  checked: CheckedSource,
  descriptions: Map<string, Description>,
  workdayMeta: Map<string, WdMeta>,
): void {
  const c = org.careers;
  const rows = checked.rows ?? [];
  if (c.source.type === "workday" && checked.payload) {
    const meta = (checked.payload as WdPayload).meta;
    for (const r of rows) {
      const m = meta[r.job.source_job_id];
      if (m) workdayMeta.set(r.job.id, m);
    }
  }
  for (const r of rows) {
    if (r.html === undefined) continue;
    const d = htmlToDescription(r.html);
    if (d) descriptions.set(r.job.id, d);
    else descriptions.delete(r.job.id);
  }
}

function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export type RefreshOptions = {
  orgs: EnabledOrg[];
  state: Dataset;
  now: string;
  descriptions: Map<string, Description>;
  workdayMeta: Map<string, WdMeta>;
  concurrency?: number;
  timeoutMs?: number;
  persist?: boolean;
  snapshot?: (data: Dataset, at: string) => void;
  log?: (line: string) => void;
};

export async function refreshJobs(opts: RefreshOptions): Promise<{
  state: Dataset;
  failed: number;
  timings: { slug: string; result: string; durationMs: number; timedOut: boolean }[];
  elapsedMs: number;
}> {
  const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_SOURCE_TIMEOUT_MS;
  const log = opts.log ?? console.log;
  const persist = opts.persist !== false;
  const started = Date.now();
  let state = opts.state;
  const descriptions = opts.descriptions;
  const workdayMeta = opts.workdayMeta;
  const lock = createLock();
  const timings: { slug: string; result: string; durationMs: number; timedOut: boolean }[] = [];
  let failed = 0;

  await mapPool(opts.orgs, concurrency, async (org) => {
    const checked = await checkSource(org, { descriptions, workdayMeta }, timeoutMs);
    await lock(() => {
      if (checked.skipped) {
        log(`jobs: ${org.slug}: skipped (USAJOBS_API_KEY not set)`);
        timings.push({ slug: org.slug, result: "skipped", durationMs: checked.durationMs, timedOut: false });
        return;
      }
      if (checked.result.ok) applySuccessfulRows(org, checked, descriptions, workdayMeta);
      state = reconcile(state, org.slug, org.careers, checked.result, opts.now);
      opts.snapshot?.(state, opts.now);
      if (persist) persistJobsState(state, descriptions, workdayMeta);
      const health = state.feeds.find((f) => f.organization_slug === org.slug)!;
      if (health.result !== "ok") failed++;
      timings.push({ slug: org.slug, result: health.result, durationMs: checked.durationMs, timedOut: checked.timedOut });
      if (checked.timedOut) {
        log(`jobs: ${org.slug}: timed out after ${formatSeconds(checked.durationMs)}; previous listings kept`);
      } else {
        log(`jobs: ${org.slug}: ${health.result}; ${health.current_count} last-confirmed postings (${formatSeconds(checked.durationMs)}${checked.retried ? ", retried" : ""})`);
      }
    });
  });

  const elapsedMs = Date.now() - started;
  const slowest = [...timings].sort((a, b) => b.durationMs - a.durationMs).slice(0, 8)
    .map((t) => `${t.slug} ${formatSeconds(t.durationMs)}`).join(", ");
  log(`jobs: ${opts.orgs.length} sources checked, ${failed} need attention. Failure preserves previous job state.`);
  log(`jobs: elapsed ${formatSeconds(elapsedMs)} (concurrency ${concurrency}, per-source budget ${formatSeconds(timeoutMs)})`);
  if (slowest) log(`jobs: slowest: ${slowest}`);
  return { state, failed, timings, elapsedMs };
}
