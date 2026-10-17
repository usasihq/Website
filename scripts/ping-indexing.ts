/**
 * After a jobs refresh, tell the Google Indexing API which job pages were
 * added (URL_UPDATED) or removed (URL_DELETED). Newest first, 200/day.
 * Missing GOOGLE_INDEXING_SA_JSON skips without an error.
 */
import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../lib/catalog";
import {
  applyDailyQuota,
  indexingAccessToken,
  indexingNotifications,
  indexingQuotaDay,
  parseServiceAccountJson,
  publishIndexingNotifications,
  type IndexingQuota,
} from "../lib/jobs/indexing";
import { DATA_PATH } from "../lib/jobs/load";
import { Dataset, EMPTY_DATASET } from "../lib/jobs/schema";
import { SITE_URL } from "../lib/site-config";

const PREVIOUS_PATH = process.env.JOBS_PREVIOUS_PATH ?? path.join(process.cwd(), "data/jobs/previous.json");
const QUOTA_PATH = process.env.JOBS_INDEXING_QUOTA_PATH ?? path.join(process.cwd(), "data/jobs/indexing-quota.json");

function readDataset(file: string): Dataset {
  if (!fs.existsSync(file)) return EMPTY_DATASET;
  try {
    return Dataset.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    console.log(`jobs: indexing: ${path.basename(file)} is unreadable; treating it as empty`);
    return EMPTY_DATASET;
  }
}

function readQuota(file: string): IndexingQuota | null {
  if (!fs.existsSync(file)) return null;
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8")) as IndexingQuota;
    if (typeof value.day === "string" && Number.isFinite(value.sent)) return { day: value.day, sent: value.sent };
  } catch {
    /* start the day over */
  }
  return null;
}

const account = parseServiceAccountJson(process.env.GOOGLE_INDEXING_SA_JSON);
if (!account) {
  console.log("jobs: indexing: skipped (GOOGLE_INDEXING_SA_JSON is not set)");
  process.exit(0);
}

const catalog = loadCatalog();
const now = Date.now();
const previous = readDataset(PREVIOUS_PATH);
const next = readDataset(DATA_PATH);
const allow = (job: { organization_slug: string }) => {
  const org = catalog.organization(job.organization_slug);
  return Boolean(org && catalog.isActiveOrganization(org.slug));
};
const pending = indexingNotifications(previous, next, SITE_URL, now, allow);
const today = indexingQuotaDay();
const { send, next: quota, skipped } = applyDailyQuota(pending, readQuota(QUOTA_PATH), today);

if (send.length === 0) {
  fs.mkdirSync(path.dirname(QUOTA_PATH), { recursive: true });
  fs.writeFileSync(QUOTA_PATH, JSON.stringify(quota) + "\n");
  console.log(`jobs: indexing: ${pending.length} URL changes, none sent (${skipped} held for the daily cap of 200)`);
  process.exit(0);
}

try {
  const token = await indexingAccessToken(account);
  const result = await publishIndexingNotifications(send, token);
  fs.mkdirSync(path.dirname(QUOTA_PATH), { recursive: true });
  fs.writeFileSync(QUOTA_PATH, JSON.stringify(quota) + "\n");
  console.log(
    `jobs: indexing: ${result.ok} notified, ${result.failed} failed, ${skipped} held (${quota.sent} of 200 used ${today}; ${send.filter((n) => n.type === "URL_UPDATED").length} updated, ${send.filter((n) => n.type === "URL_DELETED").length} deleted)`,
  );
} catch {
  console.log("jobs: indexing: skipped (could not authenticate with the Indexing API)");
  process.exit(0);
}
