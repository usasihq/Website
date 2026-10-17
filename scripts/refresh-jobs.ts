/** Network access happens here only, never in the site build or browser. */
import fs from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { loadCatalog } from "../lib/catalog";
import { adapters } from "../lib/jobs/adapters";
import { DATA_PATH, validateDataset } from "../lib/jobs/load";
import { Dataset, EMPTY_DATASET, isAutomatedSource, Job } from "../lib/jobs/schema";
import { fetchFeed, FeedError } from "../lib/jobs/security";
import { reconcile, sourceKey, jobSourceKey, type FeedResult } from "../lib/jobs/reconcile";
import { descriptionText, htmlToDescription } from "../lib/jobs/description";
import { allLocationsRemote, workplaceFromText } from "../lib/jobs/workplace-text";
import { readDescriptions, writeDescriptions } from "../lib/jobs/descriptions-store";
import { fetchUsaJobsItems, usaJobsPayload, usajobsCredentials } from "../lib/jobs/usajobs";
import { fetchSmartRecruiters } from "../lib/jobs/smartrecruiters";
import { fetchWorkday, readWorkdayMeta, writeWorkdayMeta, type WdPayload } from "../lib/jobs/workday";
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
const workdayMeta = readWorkdayMeta();
for (const org of configs) {
  const c = org.careers!;
  if (!isAutomatedSource(c.source.type)) throw new Error("Invalid enabled source");
  const usajobs = c.source.type === "usajobs" ? usajobsCredentials() : null;
  if (c.source.type === "usajobs" && !usajobs) {
    // Missing key must not fail the refresh or the build; previous federal listings stay until a keyed run.
    console.log(`jobs: ${org.slug}: skipped (USAJOBS_API_KEY not set)`);
    continue;
  }
  let result: FeedResult;
  try {
    const payload = usajobs ? usaJobsPayload(await fetchUsaJobsItems(usajobs))
      : c.source.type === "workday" ? await fetchWorkday(c, (id) => workdayMeta.get(`${org.slug}:workday:${"identifier" in c.source ? c.source.identifier : ""}:${id}`),
        (id) => descriptions.has(`${org.slug}:workday:${"identifier" in c.source ? c.source.identifier : ""}:${id}`))
      : c.source.type === "smartrecruiters" ? await fetchSmartRecruiters(c, (id) => descriptions.has(`${org.slug}:smartrecruiters:${c.source.type === "smartrecruiters" ? c.source.identifier : ""}:${id}`))
      : await fetchFeed(c);
    const rows = adapters[c.source.type].rows(payload, org.slug, c);
    // Fill an unknown workplace only from what the employer states: every location remote, or an
    // explicit sentence in this or the stored description (lib/jobs/workplace-text.ts).
    for (const r of rows) {
      if (r.job.workplace !== "unknown") continue;
      const text = r.html ? descriptionText(htmlToDescription(r.html) ?? []) : descriptions.has(r.job.id) ? descriptionText(descriptions.get(r.job.id)!) : "";
      const w = allLocationsRemote(r.job.locations) ? "remote" : text ? workplaceFromText(text) : null;
      if (w) r.job = { ...r.job, workplace: w, remote: w === "remote" };
    }
    const jobs = rows.map(r => r.job);
    // Validate every row before reconciliation. One poisoned row rejects the entire feed.
    for (const j of jobs) Job.parse({ ...j, first_seen: now, last_seen: now, last_successfully_checked: now,
      status: "open", missing_since: null, missing_checks: 0, closed_at: null });
    result = { ok: true, jobs };
    if (c.source.type === "workday") {
      const meta = (payload as WdPayload).meta;
      for (const r of rows) { const m = meta[r.job.source_job_id]; if (m) workdayMeta.set(r.job.id, m); }
    }
    for (const r of rows) {
      if (r.html === undefined) continue; // not fetched this time: keep the stored description
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
for (const id of [...workdayMeta.keys()]) if (!live.has(id)) workdayMeta.delete(id);
writeWorkdayMeta(workdayMeta);
fs.mkdirSync("data/jobs", { recursive: true });
fs.writeFileSync(`${DATA_PATH}.tmp`, JSON.stringify(state) + "\n");
fs.renameSync(`${DATA_PATH}.tmp`, DATA_PATH);
console.log(`jobs: ${configs.length} sources checked, ${failed} need attention. Failure preserves previous job state.`);
console.log(`jobs: ${descriptions.size} descriptions stored for ${live.size} open or possibly closed postings.`);
// A total outage still writes health for transparency. Workflow publishes stale warnings, not false closures.
