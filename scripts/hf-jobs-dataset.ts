/**
 * Builds the Hugging Face jobs dataset (CSV + card) from the current snapshot
 * and, when HF_TOKEN is set, uploads it to usasihq/usasi-ai-jobs.
 *
 * Missing token, a Hub outage, or an empty snapshot skip the upload and exit 0
 * so the jobs refresh is never blocked. Pass --no-upload to write files only.
 *
 * Usage: npx tsx scripts/hf-jobs-dataset.ts [--no-upload]
 */
import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../lib/catalog";
import { jobsDirectoryData } from "../lib/jobs/directory-data";
import {
  HF_JOBS_DATASET,
  hfJobsCsv,
  hfJobRows,
  hfJobsReadme,
} from "../lib/jobs/hf-dataset";
import { absoluteUrl } from "../lib/paths";
import { commitHubFiles, ensureHubRepo, hfAccessToken } from "./hf-push";

const out = path.join("reports", "automation", "hf-jobs-dataset");
const noUpload = process.argv.includes("--no-upload");

function skip(reason: string): never {
  console.log(`jobs: hf-dataset: skipped (${reason})`);
  process.exit(0);
}

async function main(): Promise<void> {
  const token = hfAccessToken();
  if (!token && !noUpload) skip("HF_TOKEN is not set");

  const catalog = loadCatalog();
  const { items } = jobsDirectoryData(catalog);
  const rows = hfJobRows(items, absoluteUrl("/"));
  if (!rows.length) skip("no open job listings in this snapshot");

  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const csv = hfJobsCsv(rows);
  const readme = hfJobsReadme(rows, catalog.buildAt);
  fs.writeFileSync(path.join(out, "jobs.csv"), csv);
  fs.writeFileSync(path.join(out, "README.md"), readme);
  console.log(`jobs: hf-dataset: ${rows.length} rows → ${out}/jobs.csv`);

  if (noUpload || !token) return;

  try {
    const created = await ensureHubRepo({ type: "dataset", name: HF_JOBS_DATASET, token });
    if (created === "created") console.log(`jobs: hf-dataset: created ${HF_JOBS_DATASET}`);
    await commitHubFiles({
      type: "dataset",
      name: HF_JOBS_DATASET,
      token,
      files: [
        { path: "jobs.csv", content: fs.readFileSync(path.join(out, "jobs.csv")) },
        { path: "README.md", content: fs.readFileSync(path.join(out, "README.md")) },
      ],
      deletePaths: ["jobs.parquet"],
      title: `Refresh USASI AI jobs snapshot ${catalog.buildAt.slice(0, 10)}`,
    });
    console.log(`jobs: hf-dataset: uploaded ${HF_JOBS_DATASET}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.log(`jobs: hf-dataset: upload failed; site refresh continues (${message.slice(0, 240)})`);
  }
}

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : "unknown error";
  console.log(`jobs: hf-dataset: failed; site refresh continues (${message.slice(0, 240)})`);
}
