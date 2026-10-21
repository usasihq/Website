/**
 * After a successful deploy, POST new or changed sitemap URLs to IndexNow.
 * Failures are logged and never fail the process (workflows also continue-on-error).
 */
import fs from "node:fs";
import path from "node:path";
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_HOST,
  INDEXNOW_KEY,
  INDEXNOW_KEY_PATH,
  INDEXNOW_LAST_PATH,
  INDEXNOW_MAX_URLS,
} from "../lib/indexnow";
import { SITE_URL } from "../lib/site-config";

const OUT = process.env.INDEXNOW_OUT ?? path.join(process.cwd(), "out");
const LAST = process.env.INDEXNOW_LAST_PATH ?? path.join(process.cwd(), INDEXNOW_LAST_PATH);

function locUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].trim());
}

function readSitemapUrls(root: string): string[] {
  const indexFile = path.join(root, "sitemap.xml");
  if (!fs.existsSync(indexFile)) {
    console.log("indexnow: skipped (out/sitemap.xml is missing)");
    return [];
  }
  const index = fs.readFileSync(indexFile, "utf8");
  const children = locUrls(index).filter((u) => u.endsWith(".xml"));
  const pages = locUrls(index).filter((u) => !u.endsWith(".xml"));
  const extra: string[] = [];
  for (const url of children) {
    const rel = url.replace(new RegExp(`^${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), "").replace(/^\//, "");
    const file = path.join(root, rel);
    if (fs.existsSync(file)) extra.push(...locUrls(fs.readFileSync(file, "utf8")).filter((u) => !u.endsWith(".xml")));
  }
  return [...new Set([...pages, ...extra])].sort();
}

function readLast(file: string): string[] {
  if (!fs.existsSync(file)) return [];
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8")) as { urls?: string[] };
    return Array.isArray(value.urls) ? value.urls.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

function writeLast(file: string, urls: string[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ urls, updated_at: new Date().toISOString() }) + "\n");
}

try {
  const urls = readSitemapUrls(OUT);
  if (!urls.length) process.exit(0);
  const prev = new Set(readLast(LAST));
  const changed = prev.size ? urls.filter((u) => !prev.has(u)) : urls;
  const send = changed.slice(0, INDEXNOW_MAX_URLS);
  writeLast(LAST, urls);
  if (!send.length) {
    console.log(`indexnow: ${urls.length} sitemap URLs, none new since last run`);
    process.exit(0);
  }
  const body = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${INDEXNOW_HOST}${INDEXNOW_KEY_PATH}`,
    urlList: send,
  };
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  console.log(`indexnow: posted ${send.length} of ${changed.length} new URLs (${urls.length} in sitemap); HTTP ${res.status}`);
} catch (error) {
  console.log(`indexnow: skipped (${error instanceof Error ? error.message : "unknown error"})`);
}
process.exit(0);
