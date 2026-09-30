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
    "img-src 'self' data:",
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
  "404.html",
  "sitemap.xml",
  "robots.txt",
  "_headers",
  "og.png",
  "hero.png",
  "data/catalog.json",
  "data/search-index.json",
  "companies/index.html",
  "open/index.html",
  "jobs/index.html",
  "matrix/index.html",
  "compact/index.html",
  "methodology/index.html",
  "about/index.html",
  "disclaimer/index.html",
  "changelog/index.html",
  "contribute/index.html",
  "support/index.html",
  "privacy/index.html",
  "local/index.html",
  "news/index.html",
  "news/feed.xml",
];
for (const rel of required) {
  if (!fs.existsSync(path.join(out, rel))) failures.push(`missing ${rel}`);
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
    const inSearch = searchJson?.entries?.some((e) => e.slug === record.slug && (key === "organizations" ? e.type === "organization" : e.type !== "organization"));
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

// Draft profiles must not appear anywhere in the export.
for (const person of readDir("people")) {
  if (!person?.slug || person.publication_status === "published") continue;
  if (catalogJson && JSON.stringify(catalogJson).includes(`"${person.slug}"`)) failures.push(`draft profile ${person.slug} leaked into catalog.json`);
  const local = path.join(out, "local", "index.html");
  if (fs.existsSync(local) && fs.readFileSync(local, "utf8").includes(`id="${person.slug}"`)) failures.push(`draft profile ${person.slug} leaked into /local/`);
}

// Private material must never be exported.
for (const forbidden of ["research", "CONTENT_REVIEW.md", "tests", "content"]) {
  if (fs.existsSync(path.join(out, forbidden))) failures.push(`private path exported: ${forbidden}`);
}

if (failures.length) {
  console.error(`postbuild: ${failures.length} problem(s)\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`postbuild: CSP meta added to ${hashed} HTML files; export verified (${htmlFiles.length} HTML files).`);
