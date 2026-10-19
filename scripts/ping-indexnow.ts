/**
 * After a jobs refresh is live, tell IndexNow which job (and hub) URLs were
 * added or removed. Batches of 10,000; cap 10,000 per run. An IndexNow error
 * logs a warning and exits 0 so the refresh still counts as published.
 */
import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../lib/catalog";
import { INDEXNOW_MAX_URLS, indexNowBatches, indexNowChangedUrls, submitIndexNow } from "../lib/jobs/indexnow";
import { DATA_PATH } from "../lib/jobs/load";
import { Dataset, EMPTY_DATASET } from "../lib/jobs/schema";
import { SITE_URL } from "../lib/site-config";

const PREVIOUS_PATH = process.env.JOBS_PREVIOUS_PATH ?? path.join(process.cwd(), "data/jobs/previous.json");

function readDataset(file: string): Dataset {
  if (!fs.existsSync(file)) return EMPTY_DATASET;
  try {
    return Dataset.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    console.warn(`jobs: indexnow: ${path.basename(file)} is unreadable; treating it as empty`);
    return EMPTY_DATASET;
  }
}

try {
  const catalog = loadCatalog();
  const now = Date.now();
  const previous = readDataset(PREVIOUS_PATH);
  const next = readDataset(DATA_PATH);
  const allow = (job: { organization_slug: string }) => {
    const org = catalog.organization(job.organization_slug);
    return Boolean(org && catalog.isActiveOrganization(org.slug));
  };
  const urls = indexNowChangedUrls(previous, next, SITE_URL, now, allow);
  if (urls.length === 0) {
    console.log("jobs: indexnow: no URL changes; skipped");
    process.exit(0);
  }

  const payloads = indexNowBatches(urls, SITE_URL);
  const result = await submitIndexNow(payloads);
  if (result.failed > 0) {
    console.warn(
      `jobs: indexnow: ${result.ok} batch(es) accepted, ${result.failed} failed (${result.submitted} URLs, cap ${INDEXNOW_MAX_URLS})`,
    );
  } else {
    console.log(`jobs: indexnow: ${result.submitted} URL(s) submitted in ${result.ok} batch(es)`);
  }
} catch (error) {
  console.warn(`jobs: indexnow: skipped (${error instanceof Error ? error.message : "unknown error"})`);
}
