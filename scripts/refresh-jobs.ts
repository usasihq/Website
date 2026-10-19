/** Network access happens here only, never in the site build or browser. */
import fs from "node:fs";
import { loadCatalog } from "../lib/catalog";
import { DATA_PATH, validateDataset } from "../lib/jobs/load";
import { Dataset, EMPTY_DATASET } from "../lib/jobs/schema";
import { sourceKey, jobSourceKey } from "../lib/jobs/reconcile";
import { readDescriptions, writeDescriptions } from "../lib/jobs/descriptions-store";
import { readWorkdayMeta, writeWorkdayMeta } from "../lib/jobs/workday";
import { recordHiringIndex } from "../lib/jobs/hiring-index";
import {
  parseConcurrency,
  parseTimeoutMs,
  persistJobsState,
  refreshJobs,
  type EnabledOrg,
} from "../lib/jobs/refresh";

/** Counts only. Must stay cheap and must not fail the refresh. */
function snapshotHiring(data: Dataset, at: string) {
  try {
    const week = recordHiringIndex(at, data);
    if (week) console.log(`jobs: hiring-index: week ${week.week_start} · ${week.open_count} open · ${week.companies.length} employers · ${week.states.length} states`);
  } catch (e) {
    console.warn(`jobs: hiring-index snapshot skipped (${e instanceof Error ? e.message : "error"})`);
  }
}

const orgs = loadCatalog().organizations;
const configs: EnabledOrg[] = orgs.filter((o): o is typeof o & EnabledOrg => Boolean(o.careers?.enabled)).map((o) => ({ slug: o.slug, careers: o.careers! }));
// State is trusted only after schema validation. Removed/disabled sources are intentionally pruned.
let state = fs.existsSync(DATA_PATH) ? Dataset.parse(JSON.parse(fs.readFileSync(DATA_PATH, "utf8"))) : EMPTY_DATASET;
const keys = new Set(configs.map((o) => sourceKey(o.slug, o.careers)));
state = validateDataset({ ...state, jobs: state.jobs.filter((j) => keys.has(jobSourceKey(j))), feeds: state.feeds.filter((f) => keys.has(jobSourceKey(f))) }, orgs);
const now = new Date().toISOString();
// Record this week's counts from whatever is already on disk, then again after
// each source, so a slow later feed still leaves a snapshot for the page.
snapshotHiring(state, now);
const descriptions = readDescriptions();
const workdayMeta = readWorkdayMeta();
const concurrency = parseConcurrency(process.env.JOBS_REFRESH_CONCURRENCY);
const timeoutMs = parseTimeoutMs(process.env.JOBS_SOURCE_TIMEOUT_MS);

const result = await refreshJobs({
  orgs: configs,
  state,
  now,
  descriptions,
  workdayMeta,
  concurrency,
  timeoutMs,
  persist: true,
  snapshot: snapshotHiring,
});

validateDataset(result.state, orgs);
const live = new Set(result.state.jobs.filter((j) => j.status !== "closed").map((j) => j.id));
for (const id of [...descriptions.keys()]) if (!live.has(id)) descriptions.delete(id);
writeDescriptions(descriptions);
for (const id of [...workdayMeta.keys()]) if (!live.has(id)) workdayMeta.delete(id);
writeWorkdayMeta(workdayMeta);
persistJobsState(result.state, descriptions, workdayMeta);
console.log(`jobs: ${descriptions.size} descriptions stored for ${live.size} open or possibly closed postings.`);
const open = result.state.jobs.filter((j) => j.status === "open");
const paid = open.filter((j) => j.salaries.length);
console.log(`jobs: ${paid.length} of ${open.length} open postings show pay (${paid.filter((j) => j.salaries.every((s) => s.source_status === "employer-description")).length} from the description text).`);
// A total outage still writes health for transparency. Workflow publishes stale warnings, not false closures.
