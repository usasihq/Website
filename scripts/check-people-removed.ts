/**
 * npm run check:people-removed [-- --require-out]
 *
 * POP-BACK GUARD. The people section (/people, /big-si, /voices, /local) moved to
 * https://aipeoplewiki.com/ and must not be re-added to this site (docs/PEOPLE_MOVED.md).
 * This fails when any of these reappear:
 *   - the route directories under app/, or the people content/data directories;
 *   - the people components and libs (lib/people-redirects.ts is the one allowed file);
 *   - an internal link to /people, /big-si, /voices or /local in source, content or
 *     public text files (nav, footer, home, MDX, YAML, JSON);
 *   - in ./out (when present, required with --require-out): a file for any key of
 *     data/people-redirect-map.json, a /people|/big-si|/voices|/local directory, or an
 *     entry for those paths in the sitemap, llms.txt or the search index.
 * The old addresses are answered by worker.ts (301), never by a static file.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MOVED = ["people", "big-si", "voices", "local"];

const FORBIDDEN_DIRS = [
  ...MOVED.map((m) => `app/${m}`),
  "content/people",
  "content/leaders",
  "data/people",
];

const FORBIDDEN_FILES = [
  "components/PeopleDirectory.tsx",
  "components/PeopleListPage.tsx",
  "components/PersonClaimBox.tsx",
  "components/LocalCorner.tsx",
  "public/og-people.png",
  "public/og-voices.png",
];

/** lib/people*.ts is gone; only the redirect map reader may use that name. */
const ALLOWED_LIB_PEOPLE = new Set(["people-redirects.ts"]);

const SCAN_ROOTS = ["app", "components", "lib", "content", "public", "scripts"];
const SKIP_DIRS = new Set(["node_modules", ".next", "out", "data"]);
const SKIP_FILES = new Set(["lib/people-redirects.ts", "scripts/check-people-removed.ts"]);
const TEXT_EXT = /\.(ts|tsx|mjs|js|mdx|md|ya?ml|json|txt|xml|html|css|svg)$/;
const MAX_BYTES = 1_500_000;

/** An internal link/path to a moved prefix: "/people", "/people/x/", "](/voices/)", "href: /local/". */
const LINK_RE = new RegExp(
  `(?<=["'\`(\\s=:])/(?:${MOVED.join("|")})(?=[/"'\`)\\s#?]|$)`,
);
const ABS_RE = new RegExp(`unitedstatesofamericasuperintelligence\\.com/(?:${MOVED.join("|")})(?=[/"'\`)\\s#?]|$)`);

function walk(root: string, rel: string, out: string[]): void {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = path.posix.join(rel, e.name);
    if (e.isDirectory()) {
      // "data" is skipped only for generated public/data; scripts/ and app/ never have one that matters.
      if (SKIP_DIRS.has(e.name) && !(e.name === "data" && r !== "public/data")) continue;
      walk(root, r, out);
    } else if (TEXT_EXT.test(e.name)) out.push(r);
  }
}

export function findSourceViolations(root: string): string[] {
  const v: string[] = [];
  for (const d of FORBIDDEN_DIRS) if (fs.existsSync(path.join(root, d))) v.push(`directory must not exist: ${d}/`);
  for (const f of FORBIDDEN_FILES) if (fs.existsSync(path.join(root, f))) v.push(`file must not exist: ${f}`);
  const lib = path.join(root, "lib");
  if (fs.existsSync(lib)) {
    for (const f of fs.readdirSync(lib)) {
      if (/^people/i.test(f) && !ALLOWED_LIB_PEOPLE.has(f)) v.push(`file must not exist: lib/${f}`);
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
      const m = line.match(LINK_RE) ?? line.match(ABS_RE);
      if (m) v.push(`${f}:${i + 1}: link to a moved people path (${m[0].trim()}): ${line.trim().slice(0, 120)}`);
    });
  }
  return v;
}

/** The keys are old paths with a trailing slash; the bare form must not exist either. */
export function findOutViolations(root: string, requireOut: boolean): string[] {
  const out = path.join(root, "out");
  if (!fs.existsSync(out)) return requireOut ? [`no export at ${out}. Run npm run build first.`] : [];
  const v: string[] = [];
  const map = JSON.parse(fs.readFileSync(path.join(root, "data/people-redirect-map.json"), "utf8")) as Record<string, string>;
  for (const key of Object.keys(map)) {
    const bare = key.replace(/\/$/, "");
    for (const rel of [`${bare}/index.html`, `${bare}.html`, bare, `${bare}/index.txt`]) {
      if (fs.existsSync(path.join(out, rel))) v.push(`out/${rel} exists (redirect-map key ${key}); it must be a Worker 301, not a file`);
    }
  }
  for (const m of MOVED) if (fs.existsSync(path.join(out, m))) v.push(`out/${m}/ must not exist`);
  for (const f of ["sitemap.xml", "llms.txt", "data/search-index.json", "data/catalog.json"]) {
    const p = path.join(out, f);
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, "utf8").split("\n");
    const i = lines.findIndex((l) => LINK_RE.test(l) || ABS_RE.test(l) || ABS_RE.test(l.replaceAll("\\/", "/")));
    if (i >= 0) v.push(`out/${f}:${i + 1}: lists a moved people path`);
  }
  return v;
}

export function checkPeopleRemoved(root: string, requireOut = false): string[] {
  return [...findSourceViolations(root), ...findOutViolations(root, requireOut)];
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const problems = checkPeopleRemoved(process.cwd(), process.argv.includes("--require-out"));
  if (problems.length) {
    console.error("People section pop-back guard FAILED (see docs/PEOPLE_MOVED.md):");
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log("people removal guard: ok");
}
