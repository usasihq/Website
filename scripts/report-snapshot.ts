/**
 * npm run report:snapshot -- <YYYY-MM> [--force] [--out <dir>] [--at <ISO time>]
 *
 * Computes one edition of "The State of American AI" from the catalog as it is
 * now (content/) and the jobs data (data/jobs/current.json), and writes it to
 * content/reports/<YYYY-MM>.json. Commit that file: the site renders editions
 * only from these frozen files, so later catalog changes never rewrite a
 * published edition.
 *
 *   --force  replace an existing edition (only before it is published)
 *   --out    write somewhere else (tests; default content/reports)
 *   --at     compute as of this instant instead of now (jobs freshness and the
 *            cutoff date both use it)
 *
 * The file records what it was computed from: a digest of the published
 * records it read, a digest of the jobs file, and the repository commit.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../lib/catalog";
import { todayIso } from "../lib/content-loader";
import { DATA_PATH, readJobs } from "../lib/jobs/load";
import { STALE_MS } from "../lib/jobs/search";
import { RUBRIC_VERSION } from "../lib/openness";
import { createSnapshot, isEdition, snapshotProblems } from "../lib/report";
import { catalogDigest, fileDigest, REPORTS_DIR } from "../lib/report-editions";
import { SCHEMA_VERSION } from "../lib/schema";

function fail(message: string): never {
  console.error(`report:snapshot — ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  if (i < 0) return null;
  const value = args[i + 1];
  if (!value || value.startsWith("--")) fail(`${name} needs a value`);
  args.splice(i, 2);
  return value;
};
const out = path.resolve(flag("--out") ?? REPORTS_DIR);
const at = flag("--at");
const force = args.includes("--force");
const edition = args.find((a) => !a.startsWith("--"));
if (!edition || !isEdition(edition)) fail("give the edition as YYYY-MM, for example: npm run report:snapshot -- 2026-10");

const generatedAt = at ? new Date(at).toISOString() : new Date().toISOString();
if (!generatedAt.startsWith(edition)) fail(`edition ${edition} must be computed during that month (now ${generatedAt.slice(0, 10)}); pass --at to set the time`);
const file = path.join(out, `${edition}.json`);
if (fs.existsSync(file) && !force) fail(`${path.relative(process.cwd(), file)} already exists. Published editions are permanent; pass --force only to replace an unpublished draft.`);

const root = process.cwd();
// Records are validated against today's date (USASI_TODAY overrides it), never the --at time.
const catalog = loadCatalog(path.join(root, "content"), { today: todayIso(), buildAt: generatedAt });
const jobsData = readJobs(catalog.organizations);
const now = Date.parse(generatedAt);
const lastCheck = jobsData.feeds.map((f) => f.last_successful).filter((v): v is string => Boolean(v)).sort().at(-1);
if (!lastCheck || now - Date.parse(lastCheck) > STALE_MS || Date.parse(lastCheck) > now) {
  fail(`the jobs data were last checked ${lastCheck ?? "never"}, not within 48 hours before ${generatedAt}. Refresh the jobs data (npm run jobs:refresh) or pass --at.`);
}

function git(...gitArgs: string[]): string | null {
  try {
    return execFileSync("git", gitArgs, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}
const commit = git("rev-parse", "HEAD");
const dirty = git("status", "--porcelain", "--", "content/organizations", "content/artifacts", "content/finder", "content/policy", "content/licenses");

const snapshot = createSnapshot({
  catalog,
  jobs: { data: jobsData, now },
  edition,
  generatedAt,
  inputs: {
    catalog_digest: catalogDigest(catalog),
    jobs_digest: fileDigest(DATA_PATH),
    git_commit: commit,
    content_clean: dirty === null ? null : dirty === "",
    schema_version: SCHEMA_VERSION,
    rubric_version: RUBRIC_VERSION,
  },
});
const problems = snapshotProblems(snapshot);
if (problems.length) fail(`the computed edition is inconsistent:\n  ${problems.join("\n  ")}`);

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(file, JSON.stringify(snapshot, null, 2) + "\n");
const total = (k: string) => snapshot.totals.find((t) => t.key === k)?.value ?? 0;
console.log(
  `report:snapshot — wrote ${path.relative(root, file) || file}: ${total("organizations")} organizations, ${total("model_releases")} model releases, ` +
    `${total("job_listings")} job listings, ${snapshot.tables.length} tables, ${snapshot.findings.length} findings (cutoff ${snapshot.data_cutoff}).`,
);
