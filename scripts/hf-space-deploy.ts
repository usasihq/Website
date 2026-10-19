/**
 * Uploads hf-space/ to the usasihq/usasi-ai-jobs static Space.
 * Missing HF_TOKEN skips and exits 0. Hub errors fail this script (the
 * deploy workflow is separate from the jobs refresh).
 *
 * Usage: npx tsx scripts/hf-space-deploy.ts
 */
import path from "node:path";
import { HF_JOBS_SPACE } from "../lib/jobs/hf-dataset";
import { commitHubFiles, ensureHubRepo, hfAccessToken, readUploadFiles, setHubSpaceSdk } from "./hf-push";

// Always addOrUpdate these so a failed first commit still overwrites the
// default static-Space template (index.html + style.css). style.css is used.
const SPACE_FILES = ["README.md", "index.html", "app.js", "style.css"] as const;
const REMOVE_STALE_FILES = ["app.py", "requirements.txt"];

const token = hfAccessToken();
if (!token) {
  console.log("hf-space: skipped (HF_TOKEN is not set)");
  process.exit(0);
}

const dir = path.join(process.cwd(), "hf-space");
const created = await ensureHubRepo({ type: "space", name: HF_JOBS_SPACE, token, sdk: "static" });
if (created === "created") console.log(`hf-space: created ${HF_JOBS_SPACE} (sdk: static)`);
if (created === "exists") {
  // The README's `sdk: static` front matter sets the Space type on upload, so a failed
  // settings call (the Hub answers 404 for it) must not stop the files from being uploaded.
  try {
    await setHubSpaceSdk({ name: HF_JOBS_SPACE, token, sdk: "static" });
    console.log(`hf-space: ${HF_JOBS_SPACE} sdk set to static`);
  } catch (e) {
    console.warn(`hf-space: could not set sdk via settings (${e instanceof Error ? e.message.split(":").slice(0, 2).join(":") : "error"}); README front matter sets it`);
  }
}
await commitHubFiles({
  type: "space",
  name: HF_JOBS_SPACE,
  token,
  files: readUploadFiles(dir, [...SPACE_FILES]),
  deletePaths: REMOVE_STALE_FILES,
  title: "Deploy USASI AI Jobs static explorer",
});
console.log(`hf-space: uploaded ${SPACE_FILES.join(", ")} to ${HF_JOBS_SPACE} (overwrite)`);
