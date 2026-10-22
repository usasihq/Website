/**
 * Optional, not part of CI: download a square mark from each organization's
 * own website (apple-touch-icon, icon, og:image, or /favicon.ico) into
 * assets/org-logos/<slug>.png. Failures are skipped so the build never depends
 * on this script. Re-run after adding companies; then commit the PNGs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadCatalog } from "../lib/catalog";
import { ORG_LOGO_SIZE } from "../lib/org-logos";
import { SOURCE_DIR } from "./generate-org-logos";

const UA = "USASI-org-logos/1.0 (+https://unitedstatesofamericasuperintelligence.com/; logo cache for JobPosting)";
const TIMEOUT_MS = 12000;
const MIN = 32;

function absUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.href;
  } catch {
    return null;
  }
}

function iconHrefs(html: string, pageUrl: string): string[] {
  const found: string[] = [];
  const push = (href: string | undefined) => {
    if (!href) return;
    const abs = absUrl(href.trim(), pageUrl);
    if (abs) found.push(abs);
  };
  for (const m of html.matchAll(/<link\b([^>]+)>/gi)) {
    const tag = m[1];
    const rel = /rel\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? "";
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (/\b(apple-touch-icon|icon|shortcut icon|apple-touch-icon-precomposed)\b/i.test(rel)) push(href);
  }
  for (const m of html.matchAll(/<meta\b([^>]+)>/gi)) {
    const tag = m[1];
    const prop = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] ?? "";
    const content = /content\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (/^og:image/i.test(prop) || /^twitter:image/i.test(prop)) push(content);
  }
  const origin = new URL(pageUrl).origin;
  for (const guess of ["/apple-touch-icon.png", "/apple-touch-icon-precomposed.png", "/favicon.png", "/favicon.ico", "/favicon.svg"]) {
    found.push(`${origin}${guess}`);
  }
  return [...new Set(found)];
}

async function fetchBuf(url: string): Promise<Buffer | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA, accept: "image/*,text/html;q=0.8" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 32 && buf.length < 8_000_000 ? buf : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function toSquarePng(buf: Buffer): Promise<Buffer | null> {
  try {
    const img = sharp(buf, { failOn: "error", animated: false }).rotate();
    const meta = await img.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w < MIN || h < MIN) return null;
    const ratio = w / h;
    if (ratio < 0.75 || ratio > 2.5) return null;
    return img
      .resize(ORG_LOGO_SIZE, ORG_LOGO_SIZE, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

export async function fetchOneLogo(website: string): Promise<Buffer | null> {
  const page = await fetchBuf(website);
  const html = page && page[0] < 32 ? null : page?.toString("utf8");
  const candidates = html ? iconHrefs(html, website) : [];
  const origin = new URL(website).origin;
  if (!candidates.length) {
    candidates.push(`${origin}/apple-touch-icon.png`, `${origin}/favicon.ico`);
  }
  // Prefer apple-touch-icon (usually ≥120px) over tiny favicons.
  candidates.sort((a, b) => Number(/apple-touch/i.test(b)) - Number(/apple-touch/i.test(a)));
  for (const url of candidates.slice(0, 10)) {
    const raw = await fetchBuf(url);
    if (!raw) continue;
    const png = await toSquarePng(raw);
    if (png) return png;
  }
  // Last resort: Google's cache of the company's own favicon (sites that block bots).
  const host = new URL(website).hostname.replace(/^www\./, "");
  const fallback = await fetchBuf(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`);
  return fallback ? toSquarePng(fallback) : null;
}

async function main() {
  const root = process.cwd();
  const destDir = path.join(root, SOURCE_DIR);
  fs.mkdirSync(destDir, { recursive: true });
  const catalog = loadCatalog(path.join(root, "content"), { today: new Date().toISOString().slice(0, 10) });
  const orgs = catalog.organizations.filter((o) => o.publication_status === "published");
  const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const targets = only.length ? orgs.filter((o) => only.includes(o.slug)) : orgs;
  const manifest: Record<string, { source: string; fetched_at: string; bytes: number }> = {};
  const existingPath = path.join(destDir, "manifest.json");
  if (fs.existsSync(existingPath)) {
    try {
      Object.assign(manifest, JSON.parse(fs.readFileSync(existingPath, "utf8")));
    } catch {
      /* start fresh */
    }
  }
  let ok = 0;
  let fail = 0;
  for (const org of targets) {
    const file = path.join(destDir, `${org.slug}.png`);
    if (fs.existsSync(file) && !process.argv.includes("--force")) {
      ok += 1;
      continue;
    }
    process.stdout.write(`fetch ${org.slug} ${org.website} … `);
    const png = await fetchOneLogo(org.website);
    if (!png) {
      console.log("skip");
      fail += 1;
      continue;
    }
    fs.writeFileSync(file, png);
    manifest[org.slug] = { source: org.website, fetched_at: new Date().toISOString(), bytes: png.length };
    console.log(`${png.length} bytes`);
    ok += 1;
  }
  fs.writeFileSync(existingPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`org-logos fetch: ${ok} saved or kept, ${fail} skipped → ${SOURCE_DIR}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
