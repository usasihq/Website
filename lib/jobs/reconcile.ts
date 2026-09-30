import { createHash } from "node:crypto";
import { Dataset, Job, type FeedHealth, type NormalizedJob, type Careers } from "./schema";
import { FeedError } from "./security";
export const DAY = 86400000;
export function sourceKey(org: string, c: Careers): string { return `${org}:${c.source.type}:${"identifier" in c.source ? c.source.identifier : ""}`; }
export function jobSourceKey(j: Job | FeedHealth): string { return `${j.organization_slug}:${j.source_type}:${j.source_identifier}`; }
export function deduplicate(rows: NormalizedJob[]): NormalizedJob[] {
  const unique = new Map<string, NormalizedJob>();
  for (const row of rows) {
    const old = unique.get(row.id);
    if (old && JSON.stringify(old) !== JSON.stringify(row)) throw new FeedError("payload");
    unique.set(row.id, row);
  }
  return [...unique.values()].sort((a,b) => a.id.localeCompare(b.id, "en"));
}
export function contentDigest(rows: unknown[]): string { return createHash("sha256").update(JSON.stringify(rows)).digest("hex"); }
export type FeedResult = { ok: true; jobs: NormalizedJob[] } | { ok: false; error: Exclude<FeedHealth["result"], "ok"> };
/** Pure reconciliation; network and invalid payloads cannot remove jobs. */
export function reconcile(previous: Dataset, org: string, c: Careers, result: FeedResult, now: string): Dataset {
  if (c.source.type !== "greenhouse" && c.source.type !== "ashby") throw new FeedError("payload");
  const key = sourceKey(org, c);
  const oldJobs = previous.jobs.filter(j => jobSourceKey(j) === key);
  const otherJobs = previous.jobs.filter(j => jobSourceKey(j) !== key);
  const prior = previous.feeds.find(f => jobSourceKey(f) === key);
  const time = Date.parse(now);
  const health: FeedHealth = {
    organization_slug: org, source_type: c.source.type, source_identifier: c.source.identifier,
    last_attempted: now, last_successful: prior?.last_successful ?? null, result: "ok",
    consecutive_failures: 0, current_count: prior?.current_count ?? 0, pending_digest: null, pending_since: null,
  };
  let jobs = oldJobs;
  if (result.ok) {
    const rows = deduplicate(result.jobs);
    const digest = contentDigest(rows);
    const lastCount = prior?.current_count ?? oldJobs.filter(j => j.status === "open").length;
    const drop = (lastCount > 0 && rows.length === 0) || (lastCount >= 10 && rows.length < lastCount * 0.5);
    const confirmed = prior?.pending_digest === digest && prior.pending_since && time - Date.parse(prior.pending_since) >= 6 * 3600000;
    if (drop && !confirmed) {
      result = { ok: false, error: "anomaly" };
      health.pending_digest = digest;
      health.pending_since = prior?.pending_digest === digest ? prior.pending_since : now;
    } else {
      const byId = new Map(oldJobs.map(j => [j.id, j]));
      const present = new Set(rows.map(j => j.id));
      jobs = rows.map(row => Job.parse({ ...row, first_seen: byId.get(row.id)?.first_seen ?? now,
        last_seen: now, last_successfully_checked: now, status: "open", missing_since: null, missing_checks: 0, closed_at: null }));
      for (const old of oldJobs) {
        if (present.has(old.id)) continue;
        const since = old.missing_since ?? now;
        const count = old.missing_checks + 1;
        const closed = count >= 2 && time - Date.parse(since) >= DAY;
        const row: Job = { ...old, last_successfully_checked: now, missing_since: since, missing_checks: count,
          status: closed ? "closed" : "possibly_closed", closed_at: closed ? old.closed_at ?? now : null };
        if (!row.closed_at || time - Date.parse(row.closed_at) <= 30 * DAY) jobs.push(row);
      }
      health.last_successful = now;
      health.current_count = rows.length;
    }
  }
  if (!result.ok) {
    health.result = result.error;
    health.consecutive_failures = (prior?.consecutive_failures ?? 0) + 1;
    // A failed check breaks anomaly confirmation; only two successful identical payloads qualify.
  }
  return Dataset.parse({ version: 1, jobs: [...otherJobs, ...jobs].filter(j => !j.closed_at || time - Date.parse(j.closed_at) <= 30 * DAY).sort((a,b) => a.id.localeCompare(b.id, "en")),
    feeds: [...previous.feeds.filter(f => jobSourceKey(f) !== key), health].sort((a,b) => jobSourceKey(a).localeCompare(jobSourceKey(b), "en")) });
}
