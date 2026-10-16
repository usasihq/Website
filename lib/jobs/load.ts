import fs from "node:fs";
import path from "node:path";
import { Dataset, isAutomatedSource, type Careers } from "./schema";
import type { Organization } from "../schema";
import { endpoint, postingUrl } from "./security";
import { jobSourceKey, sourceKey } from "./reconcile";
import { STALE_MS } from "./search";
export const DATA_PATH = path.join(process.cwd(), "data/jobs/current.json");
export function validateDataset(input: unknown, organizations: Organization[]): Dataset {
  const data = Dataset.parse(input);
  const orgs = new Map(organizations.filter(o => o.publication_status === "published" && o.eligibility.status === "eligible").map(o => [o.slug, o]));
  const ids = new Set<string>(); const feeds = new Set<string>();
  const configFor = (slug: string): Careers => {
    const c = orgs.get(slug)?.careers;
    if (!c?.enabled || !isAutomatedSource(c.source.type)) throw new Error(`Jobs: ${slug} is not a published eligible organization with enabled source`);
    return c;
  };
  for (const f of data.feeds) {
    const c = configFor(f.organization_slug), key = jobSourceKey(f);
    if (key !== sourceKey(f.organization_slug, c) || feeds.has(key)) throw new Error(`Jobs: duplicate or mismatched feed ${key}`);
    if (f.last_successful && Date.parse(f.last_successful) > Date.parse(f.last_attempted)) throw new Error(`Jobs: invalid feed dates ${key}`);
    const matching = data.jobs.filter(j => jobSourceKey(j) === key);
    if (f.current_count !== matching.filter(j => j.status === "open").length) throw new Error(`Jobs: inconsistent feed count ${key}`);
    if (matching.some(j => !f.last_successful || Date.parse(j.last_seen) > Date.parse(f.last_successful))) throw new Error(`Jobs: job observation after feed verification ${key}`);
    feeds.add(key);
  }
  for (const j of data.jobs) {
    const c = configFor(j.organization_slug), key = jobSourceKey(j);
    if (key !== sourceKey(j.organization_slug, c) || !feeds.has(key) || j.id !== `${key}:${j.source_job_id}` || ids.has(j.id)) throw new Error(`Jobs: duplicate or mismatched job ${j.id}`);
    if (j.source_url !== endpoint(c) || postingUrl(j.official_url, c) !== j.official_url || (j.apply_url && postingUrl(j.apply_url, c) !== j.apply_url)) throw new Error(`Jobs: invalid destination for ${j.id}`);
    if (Date.parse(j.first_seen) > Date.parse(j.last_seen) || Date.parse(j.last_seen) > Date.parse(j.last_successfully_checked)) throw new Error(`Jobs: invalid verification dates for ${j.id}`);
    if ((j.status === "open") !== (j.missing_since === null && j.missing_checks === 0) || (j.status === "closed") !== (j.closed_at !== null)) throw new Error(`Jobs: inconsistent status for ${j.id}`);
    ids.add(j.id);
  }
  return data;
}
export function readJobs(organizations: Organization[]): Dataset {
  // Missing/corrupted data is a build error, never silently interpreted as zero jobs.
  return validateDataset(JSON.parse(fs.readFileSync(DATA_PATH, "utf8")), organizations);
}

const shiftIso = (iso: string | null, delta: number) => (iso ? new Date(Date.parse(iso) + delta).toISOString() : iso);

/**
 * Latest successful feed check in a snapshot, or null when none has ever succeeded.
 */
export function latestSuccessfulCheck(data: Dataset): number | null {
  const times = data.feeds.map((f) => f.last_successful).filter((v): v is string => Boolean(v)).map(Date.parse);
  return times.length ? Math.max(...times) : null;
}

/**
 * The committed bootstrap snapshot is not refreshed in Git (operational
 * `current.json` stays local). When that snapshot is older than the 48-hour
 * "current" window, a site build would otherwise emit zero city/state pages and
 * Next.js `output: export` would fail. Shift verification timestamps so the
 * snapshot is evaluated at `now`. Used only when alignSnapshotEnabled();
 * production refreshes feeds first and never takes this path. Does not rewrite
 * the file.
 */
export function alignJobsSnapshot(data: Dataset, now: number): Dataset {
  const last = latestSuccessfulCheck(data);
  if (last === null || now - last <= STALE_MS) return data;
  const delta = now - last;
  console.log(
    `jobs: bootstrap snapshot last checked ${new Date(last).toISOString()}, ${Math.round((now - last) / 3600000)}h before this build; treating it as collected at build time`,
  );
  return {
    ...data,
    jobs: data.jobs.map((j) => ({
      ...j,
      first_seen: shiftIso(j.first_seen, delta)!,
      last_seen: shiftIso(j.last_seen, delta)!,
      last_successfully_checked: shiftIso(j.last_successfully_checked, delta)!,
      missing_since: shiftIso(j.missing_since, delta),
      closed_at: shiftIso(j.closed_at, delta),
    })),
    feeds: data.feeds.map((f) => ({
      ...f,
      last_attempted: shiftIso(f.last_attempted, delta)!,
      last_successful: shiftIso(f.last_successful, delta),
      pending_since: shiftIso(f.pending_since, delta),
    })),
  };
}

let buildCache: { now: number; data: Dataset } | null = null;

/**
 * Opt-in only (`JOBS_SNAPSHOT_AT_BUILD=1`, set by CI): shifting timestamps makes
 * old listings look freshly checked, so a production build must never do it. If
 * the real feeds stop refreshing, stale listings have to age out of the site and
 * a build that would publish none of them should fail, not relabel them current.
 */
export const alignSnapshotEnabled = () => process.env.JOBS_SNAPSHOT_AT_BUILD === "1";

/** Jobs snapshot for website generation at `now` (usually `catalog.buildAt`). */
export function readJobsForBuild(organizations: Organization[], now: number): Dataset {
  if (buildCache && buildCache.now === now) return buildCache.data;
  const raw = readJobs(organizations);
  const data = alignSnapshotEnabled() ? alignJobsSnapshot(raw, now) : raw;
  buildCache = { now, data };
  return data;
}
