#!/usr/bin/env node
/**
 * npm run check:links
 *
 * Crawls every HTML file in ./out and verifies that each internal link and
 * asset reference resolves to an exported file, and that in-page fragments
 * (#id) exist on the target page. External links are not fetched here (see
 * npm run check:sources). Honors NEXT_PUBLIC_BASE_PATH.
 */
import fs from "node:fs";
import path from "node:path";

const dirArg = process.argv.indexOf("--dir");
const out = path.resolve(dirArg >= 0 ? process.argv[dirArg + 1] : "out");
const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");
if (!fs.existsSync(out)) {
  console.error(`No export at ${out}. Run npm run build first.`);
  process.exit(1);
}

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (e.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const pages = walk(out);
const idCache = new Map();
function idsFor(file) {
  if (!idCache.has(file)) {
    const html = fs.readFileSync(file, "utf8");
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

function resolveTarget(urlPath) {
  let p = decodeURIComponent(urlPath);
  if (base) {
    if (!p.startsWith(`${base}/`) && p !== base) return { missingBase: true };
    p = p.slice(base.length) || "/";
  }
  const candidates = p.endsWith("/") ? [path.join(out, p, "index.html")] : [path.join(out, p), path.join(out, p, "index.html"), path.join(out, `${p}.html`)];
  return { file: candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null };
}

const problems = [];
let checked = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  const pageUrl = "/" + path.relative(out, page).replace(/index\.html$/, "").replace(/\\/g, "/");
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  const srcsets = [...html.matchAll(/\s(?:srcSet|srcset|imageSrcSet|imagesrcset)="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0]));
  for (const ref of [...refs, ...srcsets]) {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) {
      if (/^javascript:/i.test(ref)) problems.push(`${pageUrl}: javascript: URL`);
      continue;
    }
    if (ref === "#") {
      problems.push(`${pageUrl}: empty "#" link`);
      continue;
    }
    checked += 1;
    const [pathPart, fragment] = ref.split("#");
    const target = pathPart ? new URL(pathPart, `https://x${base}${pageUrl}`).pathname : null;
    let file = page;
    if (target) {
      const r = resolveTarget(target);
      if (r.missingBase) {
        problems.push(`${pageUrl}: ${ref} is missing the base path ${base}`);
        continue;
      }
      if (!r.file) {
        problems.push(`${pageUrl}: broken link ${ref}`);
        continue;
      }
      file = r.file;
    }
    if (fragment && file.endsWith(".html") && !idsFor(file).has(fragment)) problems.push(`${pageUrl}: missing anchor ${ref}`);
  }
}

if (problems.length) {
  console.error(`check:links — ${problems.length} problem(s):\n  ${[...new Set(problems)].join("\n  ")}`);
  process.exit(1);
}
console.log(`check:links — ${checked} internal references across ${pages.length} pages resolve.`);
