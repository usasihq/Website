/** Network access happens here only, never in the site build or browser. */
import fs from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { loadCatalog } from "../lib/catalog";
import { adapters } from "../lib/jobs/adapters";
import { DATA_PATH, validateDataset } from "../lib/jobs/load";
import { Dataset, EMPTY_DATASET, Job } from "../lib/jobs/schema";
import { fetchFeed, FeedError } from "../lib/jobs/security";
import { reconcile, sourceKey, jobSourceKey, type FeedResult } from "../lib/jobs/reconcile";
import { htmlToDescription } from "../lib/jobs/description";
import { readDescriptions, writeDescriptions } from "../lib/jobs/descriptions-store";
const orgs = loadCatalog().organizations;
const configs = orgs.filter(o => o.careers?.enabled);
// State is trusted only after schema validation. Removed/disabled sources are intentionally pruned.
let state = fs.existsSync(DATA_PATH) ? Dataset.parse(JSON.parse(fs.readFileSync(DATA_PATH, "utf8"))) : EMPTY_DATASET;
const keys = new Set(configs.map(o => sourceKey(o.slug, o.careers!)));
state = validateDataset({ ...state, jobs: state.jobs.filter(j => keys.has(jobSourceKey(j))), feeds: state.feeds.filter(f => keys.has(jobSourceKey(f))) }, orgs);
const now = new Date().toISOString();
let failed = 0;
// Descriptions follow the listings: replaced on a successful check, kept when a source fails, dropped when a posting closes.
const descriptions = readDescriptions();
for (const org of configs) {
  const c = org.careers!;
  if (c.source.type !== "greenhouse" && c.source.type !== "ashby" && c.source.type !== "lever") throw new Error("Invalid enabled source");
  let result: FeedResult;
  try {
    const payload = await fetchFeed(c);
    const rows = adapters[c.source.type].rows(payload, org.slug, c);
    const jobs = rows.map(r => r.job);
    // Validate every row before reconciliation. One poisoned row rejects the entire feed.
    for (const j of jobs) Job.parse({ ...j, first_seen: now, last_seen: now, last_successfully_checked: now,
      status: "open", missing_since: null, missing_checks: 0, closed_at: null });
    result = { ok: true, jobs };
    for (const r of rows) {
      const d = htmlToDescription(r.html);
      if (d) descriptions.set(r.job.id, d);
      else descriptions.delete(r.job.id);
    }
  } catch (e) {
    result = { ok: false, error: e instanceof FeedError ? e.category : "payload" };
  }
  state = reconcile(state, org.slug, c, result, now);
  const health = state.feeds.find(f => f.organization_slug === org.slug)!;
  if (health.result !== "ok") failed++;
  // Never print source payloads, stack traces, URLs, or potentially sensitive errors.
  console.log(`jobs: ${org.slug}: ${health.result}; ${health.current_count} last-confirmed postings`);
  await delay(1000); // serial feeds and bounded requests; no retry of 429/access controls
}
validateDataset(state, orgs);
const live = new Set(state.jobs.filter(j => j.status !== "closed").map(j => j.id));
for (const id of [...descriptions.keys()]) if (!live.has(id)) descriptions.delete(id);
writeDescriptions(descriptions);
fs.mkdirSync("data/jobs", { recursive: true });
fs.writeFileSync(`${DATA_PATH}.tmp`, JSON.stringify(state) + "\n");
fs.renameSync(`${DATA_PATH}.tmp`, DATA_PATH);
console.log(`jobs: ${configs.length} sources checked, ${failed} need attention. Failure preserves previous job state.`);
console.log(`jobs: ${descriptions.size} descriptions stored for ${live.size} open or possibly closed postings.`);
// A total outage still writes health for transparency. Workflow publishes stale warnings, not false closures.
