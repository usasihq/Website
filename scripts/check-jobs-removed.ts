/**
 * npm run check:jobs-removed [-- --require-out]
 *
 * POP-BACK GUARD. The jobs section (/jobs) moved to https://aipeoplewiki.com/jobs/
 * and must not be re-added to this site (docs/JOBS_MOVED.md). This fails when any
 * of these reappear:
 *   - app/jobs, lib/jobs, data/jobs, data/layoffs, the refresh-jobs workflow;
 *   - jobs components, scripts, or a Jobs nav/footer link;
 *   - an internal link to /jobs in source, content or public text files;
 *   - in ./out (when present, required with --require-out): a /jobs directory,
 *     a jobs sitemap shard, or a /jobs URL in the sitemap, llms.txt or search index.
 * The old addresses are answered by worker.ts (301), never by a static file.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FORBIDDEN_DIRS = ["app/jobs", "lib/jobs", "data/jobs", "data/layoffs", "hf-space"];

const FORBIDDEN_FILES = [
  "components/JobsDirectory.tsx",
  "components/JobsDirectoryPages.tsx",
  "components/JobsFollow.tsx",
  "components/JobsFreshness.tsx",
  "components/JobsHiringIndex.tsx",
  "components/JobsLanding.tsx",
  "components/JobsLayoffs.tsx",
  "components/JobsPay.tsx",
  "components/JobsSectionNav.tsx",
  "components/OrganizationJobs.tsx",
  "components/JobNotFound.tsx",
  "components/HiringProcess.tsx",
  "components/useJobsClock.ts",
  "public/og-jobs.png",
  ".github/workflows/refresh-jobs.yml",
  "scripts/job-pages.ts",
  "scripts/refresh-jobs.ts",
  "scripts/automation/jobs-update.sh",
  "docs/JOBS.md",
];

const SCAN_ROOTS = ["app", "components", "lib", "content", "public", "scripts"];
const SKIP_DIRS = new Set(["node_modules", ".next", "out", "data"]);
const SKIP_FILES = new Set(["lib/jobs-redirects.ts", "scripts/check-jobs-removed.ts"]);
const TEXT_EXT = /\.(ts|tsx|mjs|js|mdx|md|ya?ml|json|txt|xml|html|css|svg)$/;
const MAX_BYTES = 1_500_000;

const LINK_RE = /(?<=["'`(\s=:])\/jobs(?=[/"'`)\\s#?]|$)/;
const ABS_RE = /unitedstatesofamericasuperintelligence\.com\/jobs(?=[/"'`)\\s#?]|$)/;
const SITEMAP_JOBS_RE = /\/sitemaps\/jobs-\d+\.xml|\/sitemap-jobs-\d+\.xml/;

function walk(root: string, rel: string, out: string[]): void {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) && !(e.name === "data" && r !== "public/data")) continue;
      walk(root, r, out);
    } else if (TEXT_EXT.test(e.name)) out.push(r);
  }
}

export function findSourceViolations(root: string): string[] {
  const v: string[] = [];
  for (const d of FORBIDDEN_DIRS) if (fs.existsSync(path.join(root, d))) v.push(`directory must not exist: ${d}/`);
  for (const f of FORBIDDEN_FILES) if (fs.existsSync(path.join(root, f))) v.push(`file must not exist: ${f}`);

  const pkg = path.join(root, "package.json");
  if (fs.existsSync(pkg)) {
    const scripts = (JSON.parse(fs.readFileSync(pkg, "utf8")) as { scripts?: Record<string, string> }).scripts ?? {};
    for (const name of Object.keys(scripts)) {
      if (name === "jobs:validate" || name.startsWith("jobs:") || name === "indexnow" || name === "layoffs:refresh") {
        v.push(`package.json script must not exist: ${name}`);
      }
    }
  }

  const files: string[] = [];
  for (const r of SCAN_ROOTS) walk(root, r, files);
  for (const f of files) {
    if (SKIP_FILES.has(f)) continue;
    const full = path.join(root, f);
    if (fs.statSync(full).size > MAX_BYTES) continue;
    const text = fs.readFileSync(full, "utf8");
    text.split("\n").forEach((line, i) => {
      const m = line.match(LINK_RE) ?? line.match(ABS_RE) ?? line.match(SITEMAP_JOBS_RE);
      if (m) v.push(`${f}:${i + 1}: link to a moved jobs path (${m[0].trim()}): ${line.trim().slice(0, 120)}`);
    });
  }
  return v;
}

export function findOutViolations(root: string, requireOut: boolean): string[] {
  const out = path.join(root, "out");
  if (!fs.existsSync(out)) return requireOut ? [`no export at ${out}. Run npm run build first.`] : [];
  const v: string[] = [];
  if (fs.existsSync(path.join(out, "jobs"))) v.push("out/jobs/ must not exist");
  if (fs.existsSync(path.join(out, "sitemaps"))) {
    for (const name of fs.readdirSync(path.join(out, "sitemaps"))) {
      if (/^jobs-\d+\.xml$/.test(name)) v.push(`out/sitemaps/${name} must not exist`);
    }
  }
  for (const f of ["sitemap.xml", "sitemap-pages.xml", "llms.txt", "data/search-index.json", "data/catalog.json"]) {
    const p = path.join(out, f);
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, "utf8").split("\n");
    const i = lines.findIndex((l) => LINK_RE.test(l) || ABS_RE.test(l) || SITEMAP_JOBS_RE.test(l) || ABS_RE.test(l.replaceAll("\\/", "/")));
    if (i >= 0) v.push(`out/${f}:${i + 1}: lists a moved jobs path`);
  }
  return v;
}

export function checkJobsRemoved(root: string, requireOut = false): string[] {
  return [...findSourceViolations(root), ...findOutViolations(root, requireOut)];
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const problems = checkJobsRemoved(process.cwd(), process.argv.includes("--require-out"));
  if (problems.length) {
    console.error("Jobs section pop-back guard FAILED (see docs/JOBS_MOVED.md):");
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log("jobs removal guard: ok");
}
