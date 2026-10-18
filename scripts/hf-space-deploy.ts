/**
 * Uploads hf-space/ to the usasihq/usasi-ai-jobs Gradio Space.
 * Missing HF_TOKEN skips and exits 0. Hub errors fail this script (the
 * deploy workflow is separate from the jobs refresh).
 *
 * Usage: npx tsx scripts/hf-space-deploy.ts
 */
import path from "node:path";
import { HF_JOBS_SPACE } from "../lib/jobs/hf-dataset";
import { commitHubFiles, ensureHubRepo, hfAccessToken, readUploadFiles } from "./hf-push";

const SPACE_FILES = ["README.md", "app.py", "requirements.txt"] as const;

const token = hfAccessToken();
if (!token) {
  console.log("hf-space: skipped (HF_TOKEN is not set)");
  process.exit(0);
}

const dir = path.join(process.cwd(), "hf-space");
const created = await ensureHubRepo({ type: "space", name: HF_JOBS_SPACE, token, sdk: "gradio" });
if (created === "created") console.log(`hf-space: created ${HF_JOBS_SPACE}`);
await commitHubFiles({
  type: "space",
  name: HF_JOBS_SPACE,
  token,
  files: readUploadFiles(dir, [...SPACE_FILES]),
  title: "Deploy USASI AI Jobs explorer",
});
console.log(`hf-space: uploaded ${HF_JOBS_SPACE}`);
