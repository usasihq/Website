#!/usr/bin/env node
/**
 * Runs after `next build` (static export to ./out).
 *
 * 1. Adds a per-page Content-Security-Policy <meta> whose script-src lists the
 *    SHA-256 hash of every inline script on that page. Combined with the
 *    header CSP from public/_headers, only matching inline scripts run. The
 *    Cloudflare beacon host is permitted; collection remains same-origin.
 * 2. Verifies the export: required files exist, and no draft / non-published
 *    record leaked into routes, data exports, or the sitemap.
 *
 * Exits non-zero on any failure.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const root = process.cwd();
const out = path.join(root, "out");
const failures = [];

if (!fs.existsSync(out)) {
  console.error("postbuild: ./out does not exist — did next build run with output: 'export'?");
  process.exit(1);
}

/* ---------------------------------------------------------------- */
/* 1. Per-page CSP with inline-script hashes                         */
/* ---------------------------------------------------------------- */

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const htmlFiles = walk(out).filter((f) => f.endsWith(".html"));
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let hashed = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) continue; // idempotent
  const hashes = new Set();
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    const body = match[1];
    if (!body) continue;
    hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
  const policy = [
    "default-src 'self'",
    `script-src 'self' https://static.cloudflareinsights.com ${[...hashes].join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://upload.wikimedia.org",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`;
  const charset = /<meta charSet="utf-8"\/>|<meta charset="utf-8"\s*\/?>/i;
  if (!charset.test(html)) {
    failures.push(`${path.relative(out, file)}: no <meta charset> to anchor the CSP meta tag`);
    continue;
  }
  html = html.replace(charset, (m) => `${m}${meta}`);
  fs.writeFileSync(file, html);
  hashed += 1;
}

/* ---------------------------------------------------------------- */
/* 2. Export verification                                            */
/* ---------------------------------------------------------------- */

const required = [
  "index.html",
  "llms.txt",
  "404.html",
  "sitemap.xml",
  "robots.txt",
  "_headers",
  "og.png",
  "og-open.png",
  "hero.png",
  "data/catalog.json",
  "data/search-index.json",
  "companies/index.html",
  "open/index.html",
  "matrix/index.html",
  "compact/index.html",
  "methodology/index.html",
  "about/index.html",
  "disclaimer/index.html",
  "changelog/index.html",
  "contribute/index.html",
  "support/index.html",
  "privacy/index.html",
  "badges/index.html",
  "badges/listed.svg",
  "news/index.html",
  "news/feed.xml",
];
for (const rel of required) {
  if (!fs.existsSync(path.join(out, rel))) failures.push(`missing ${rel}`);
}

{
  const llms = fs.existsSync(path.join(out, "llms.txt")) ? fs.readFileSync(path.join(out, "llms.txt"), "utf8") : "";
  if (llms && (!llms.startsWith("# ") || !llms.includes("> ") || !llms.includes("https://") || !llms.includes("/companies/"))) {
    failures.push("llms.txt is missing the title, summary, absolute URLs, or /companies/");
  }
}

{
  const countSvg = (sub) => {
    const dir = path.join(out, "badges", sub);
    return fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => n.endsWith(".svg")).length : 0;
  };
  const gh = countSvg("github");
  const hf = countSvg("huggingface");
  if (gh < 500) failures.push(`expected hundreds of GitHub rank badges, found ${gh}`);
  if (hf < 500) failures.push(`expected hundreds of Hugging Face rank badges, found ${hf}`);
}

// Any record that is not active (published + eligible) must not appear as a
// route, in the data exports, or in the sitemap. Archived records may have a
// (noindex) page but must stay out of exports and the sitemap.
const readDir = (sub) => {
  const dir = path.join(root, "content", sub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".yml") || n.endsWith(".yaml"))
    .map((n) => YAML.parse(fs.readFileSync(path.join(dir, n), "utf8")));
};
const sitemap = fs.existsSync(path.join(out, "sitemap.xml")) ? fs.readFileSync(path.join(out, "sitemap.xml"), "utf8") : "";
if (!sitemap.includes("<urlset") || !sitemap.includes("<loc>")) failures.push("sitemap.xml is not a urlset of public pages");
{
  const urls = (sitemap.match(/<loc>/g) ?? []).length;
  if (urls > 50000 || Buffer.byteLength(sitemap) > 50 * 1024 * 1024) failures.push(`sitemap.xml exceeds the sitemap limits (${urls} URLs)`);
  if (/\/jobs\/|\/sitemaps\/jobs-\d+\.xml|\/sitemap-jobs-\d+\.xml/.test(sitemap)) failures.push("sitemap.xml still lists a moved jobs path");
}
const catalogJson = fs.existsSync(path.join(out, "data/catalog.json")) ? JSON.parse(fs.readFileSync(path.join(out, "data/catalog.json"), "utf8")) : null;
const searchJson = fs.existsSync(path.join(out, "data/search-index.json")) ? JSON.parse(fs.readFileSync(path.join(out, "data/search-index.json"), "utf8")) : null;

for (const [sub, route, key] of [
  ["organizations", "companies", "organizations"],
  ["artifacts", "open", "artifacts"],
]) {
  for (const record of readDir(sub)) {
    if (!record?.slug) continue;
    const active = record.publication_status === "published" && record.eligibility?.status === "eligible";
    const routeExists = fs.existsSync(path.join(out, route, record.slug, "index.html"));
    const inExport = catalogJson?.[key]?.some((r) => r.slug === record.slug);
    const inSearch = searchJson?.entries?.some(
      (e) => e.slug === record.slug && (key === "organizations" ? e.type === "organization" : ["model-family", "model-release", "software", "dataset", "evaluation-tool"].includes(e.type)),
    );
    const inSitemap = sitemap.includes(`/${route}/${record.slug}/<`);
    if (active) {
      if (!routeExists) failures.push(`published ${sub}/${record.slug} has no page`);
      if (!inExport) failures.push(`published ${sub}/${record.slug} missing from catalog.json`);
      if (!inSitemap) failures.push(`published ${sub}/${record.slug} missing from sitemap`);
      continue;
    }
    if (record.publication_status !== "archived" && routeExists) failures.push(`non-published ${sub}/${record.slug} has a page`);
    if (inExport) failures.push(`non-published ${sub}/${record.slug} leaked into catalog.json`);
    if (catalogJson && JSON.stringify(catalogJson).includes(`"${record.slug}"`)) {
      failures.push(`non-published ${sub}/${record.slug} is referenced by slug in catalog.json`);
    }
    if (inSearch) failures.push(`non-published ${sub}/${record.slug} leaked into search-index.json`);
    if (inSitemap) failures.push(`non-published ${sub}/${record.slug} leaked into sitemap.xml`);
  }
}

// No exported page may link to the route of a record that is not active.
const inactiveRoutes = [];
for (const [sub, route] of [
  ["organizations", "companies"],
  ["artifacts", "open"],
]) {
  for (const record of readDir(sub)) {
    const active = record?.publication_status === "published" && record?.eligibility?.status === "eligible";
    if (record?.slug && !active && record.publication_status !== "archived") inactiveRoutes.push(`/${route}/${record.slug}/`);
  }
}
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const route of inactiveRoutes) {
    if (html.includes(`href="${route}"`) || html.includes(`href="${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${route}"`)) {
      failures.push(`${path.relative(out, file)} links to unpublished ${route}`);
    }
  }
}

// Private material must never be exported.
// React keys and other strings that look like site paths are visible to crawlers in the
// embedded page data. A key such as "/section/" + index reads as a link to a page that does
// not exist (Google once reported such a key as a 404), so every path-shaped key must be a real page.
{
  const KEYED_PATH = /\["\$","[a-zA-Z0-9]+","(\/[^"]*)"/g;
  const exists = (p) => {
    const rel = p.split(/[?#]/)[0].replace(/^\//, "");
    const abs = path.join(out, rel);
    return fs.existsSync(path.join(abs, "index.html")) || fs.existsSync(abs) || fs.existsSync(`${abs.replace(/\/$/, "")}.html`);
  };
  const seen = new Set();
  for (const file of walk(out).filter((f) => f.endsWith(".html") || f.endsWith(".txt"))) {
    for (const m of fs.readFileSync(file, "utf8").matchAll(KEYED_PATH)) {
      const p = m[1];
      if (seen.has(p) || exists(p)) continue;
      seen.add(p);
      failures.push(`path-shaped key "${p}" (in ${path.relative(out, file)}) is not a page; use a key that is not a URL`);
    }
  }
}

/* ---------------------------------------------------------------- */
/* 3. Structured data (JSON-LD)                                      */
/* ---------------------------------------------------------------- */

// Every JSON-LD block must parse, name the schema.org context, and give each
// node a @type. Breadcrumb and item lists need position, name, and an absolute
// link for every entry. Detail pages must carry a BreadcrumbList.
{
  const LD = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  const DETAIL = /^(?:(?:companies|open|licenses|places|hubs|news|newsletter|learn|kids)\/[^/]+|learn\/(?:paths|tools)\/[^/]+)\/index\.html$/;
  const absolute = (u) => typeof u === "string" && /^https?:\/\/[^\s/]+\//.test(u);
  const nodesOf = (value, found = []) => {
    if (Array.isArray(value)) value.forEach((v) => nodesOf(v, found));
    else if (value && typeof value === "object") {
      if (value["@type"]) found.push(value);
      for (const v of Object.values(value)) if (v && typeof v === "object") nodesOf(v, found);
    }
    return found;
  };
  let blocks = 0;
  for (const file of htmlFiles) {
    const rel = path.relative(out, file).split(path.sep).join("/");
    const html = fs.readFileSync(file, "utf8");
    const types = new Set();
    for (const match of html.matchAll(LD)) {
      blocks += 1;
      let data;
      try {
        data = JSON.parse(match[1]);
      } catch (error) {
        failures.push(`${rel}: JSON-LD is not valid JSON (${error.message})`);
        continue;
      }
      if (data?.["@context"] !== "https://schema.org") failures.push(`${rel}: JSON-LD block without "@context": "https://schema.org"`);
      const top = Array.isArray(data?.["@graph"]) ? data["@graph"] : [data];
      for (const node of top) if (!node?.["@type"]) failures.push(`${rel}: JSON-LD node without @type`);
      for (const node of nodesOf(data)) {
        types.add(node["@type"]);
        if (node["@type"] === "JobPosting") {
          failures.push(`${rel}: JobPosting structured data must not appear (the jobs section moved)`);
        }
        if (node["@type"] !== "BreadcrumbList" && node["@type"] !== "ItemList") continue;
        const isTrail = node["@type"] === "BreadcrumbList";
        const items = node.itemListElement;
        if (!Array.isArray(items) || items.length === 0) {
          if (isTrail) failures.push(`${rel}: BreadcrumbList without items`);
          continue;
        }
        items.forEach((item, i) => {
          const link = isTrail ? item.item : item.url;
          if (item["@type"] !== "ListItem" || item.position !== i + 1 || typeof item.name !== "string" || !item.name.trim() || !absolute(link)) {
            failures.push(`${rel}: ${node["@type"]} entry ${i + 1} needs @type ListItem, position ${i + 1}, a name, and an absolute ${isTrail ? "item" : "url"}`);
          }
        });
      }
    }
    if (DETAIL.test(rel) && !types.has("BreadcrumbList")) failures.push(`${rel}: detail page without a BreadcrumbList`);
  }
  console.log(`postbuild: ${blocks} JSON-LD blocks checked.`);
}

// RSC payloads (index.txt, __next.*.txt) exist only for Next.js client-side
// navigation and prefetching. Internal links are plain <a> (components/Link.tsx),
// so every navigation is a full page load and these ~7,000 files are never
// requested; removing them keeps the export inside the file limit below.
{
  const RSC = /(^|\/)(index\.txt|__next\.[^/]*\.txt)$/;
  let removed = 0;
  for (const f of walk(out)) {
    if (RSC.test(path.relative(out, f).split(path.sep).join("/"))) { fs.unlinkSync(f); removed++; }
  }
  console.log(`postbuild: ${removed} RSC payload files removed (plain links never request them).`);
}

// Cloudflare Workers static assets: at most 100,000 files per deployment on the
// Workers Paid plan (the account's plan since 2026-10-16; Free allows 20,000)
// and 25 MiB per file. ASSET_FILE_LIMIT overrides the limit.
{
  const limit = Number(process.env.ASSET_FILE_LIMIT ?? 100000);
  const all = walk(out);
  if (all.length > limit) failures.push(`${all.length} files in ./out; Cloudflare accepts at most ${limit} per deployment`);
  else if (all.length > limit * 0.9) console.warn(`postbuild: warning: ${all.length} files in ./out, close to the ${limit}-file deployment limit`);
  for (const f of all) if (fs.statSync(f).size > 25 * 1024 * 1024) failures.push(`${path.relative(out, f)}: larger than 25 MiB`);
  console.log(`postbuild: ${all.length} files to deploy (limit ${limit}).`);
}

for (const forbidden of ["research", "CONTENT_REVIEW.md", "tests", "content"]) {
  if (fs.existsSync(path.join(out, forbidden))) failures.push(`private path exported: ${forbidden}`);
}

if (failures.length) {
  console.error(`postbuild: ${failures.length} problem(s)\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`postbuild: CSP meta added to ${hashed} HTML files; export verified (${htmlFiles.length} HTML files).`);
