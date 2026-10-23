/**
 * npm run prepare:cards  (part of `npm run build`)
 *
 * Renders a 1200×630 JPEG social preview card for each record, news item,
 * explainer, hub, license guide, and weekly issue into public/og/ (not
 * committed). Cards are defined in lib/page-cards.ts. AI on GitHub and AI on
 * Hugging Face hero images (lib/github/hero.ts, lib/huggingface/hero.ts,
 * rendered by scripts/hero-render.ts) share the cache. Only cards whose content
 * or template changed are rendered again; cards for removed pages are deleted.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { getCatalog } from "../lib/catalog";
import { CARD_TEMPLATE_VERSION, pageCards, type PageCard } from "../lib/page-cards";
import { GITHUB_HERO_VERSION, type GithubHero } from "../lib/github/hero";
import { githubHeroes } from "../lib/github/projects";
import { renderGithubHeroes } from "./github-heroes";
import { HF_HERO_VERSION, type HfHero } from "../lib/huggingface/hero";
import { hfHeroes } from "../lib/huggingface/items";
import { renderHfHeroes } from "./hf-heroes";

const root = process.cwd();
const outRoot = path.join(root, "public", "og");
const manifestPath = path.join(root, ".cache", "page-cards.json");

const catalog = getCatalog();
const cards = pageCards(catalog);
const hashOf = (c: PageCard) => crypto.createHash("sha256").update(JSON.stringify({ v: CARD_TEMPLATE_VERSION, c: { ...c, alt: undefined } })).digest("hex").slice(0, 16);
let manifest: Record<string, string> = {};
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch {
  /* first run */
}
const fileOf = (c: PageCard) => path.join(root, "public", c.image);
const todo = cards.filter((c) => manifest[c.image] !== hashOf(c) || !fs.existsSync(fileOf(c)));
const heroes = githubHeroes();
const heroHashOf = (h: GithubHero) => crypto.createHash("sha256").update(JSON.stringify({ v: GITHUB_HERO_VERSION, h: { ...h, alt: undefined } })).digest("hex").slice(0, 16);
const heroTodo = heroes.filter((h) => manifest[h.image] !== heroHashOf(h) || !fs.existsSync(path.join(root, "public", h.image)));
// Stable key: the hero's own fields (no counts, ranks, or dates) and the template version.
const hf = hfHeroes();
const hfHashOf = (h: HfHero) => crypto.createHash("sha256").update(JSON.stringify({ v: HF_HERO_VERSION, h: { ...h, alt: undefined } })).digest("hex").slice(0, 16);
const hfTodo = hf.filter((h) => manifest[h.image] !== hfHashOf(h) || !fs.existsSync(path.join(root, "public", h.image)));

// Remove cards for pages that no longer exist.
const wanted = new Set([...cards.map((c) => c.image), ...heroes.map((h) => h.image), ...hf.map((h) => h.image)]);
let removed = 0;
for (const image of Object.keys(manifest)) {
  if (!wanted.has(image)) {
    fs.rmSync(path.join(root, "public", image), { force: true });
    delete manifest[image];
    removed += 1;
  }
}

if (todo.length > 0) {
  const fontUrl = (file: string) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, "app/fonts", file)).toString("base64")}`;
  const hero = path.join(root, "assets/branding/usasi-hero.png");
  const meta = await sharp(hero).metadata();
  const top = Math.round(meta.height! * 0.44);
  const map = await sharp(hero).extract({ left: 0, top, width: meta.width!, height: meta.height! - top }).resize({ width: 1300 }).jpeg({ quality: 80 }).toBuffer();
  const art = `data:image/jpeg;base64,${map.toString("base64")}`;

  const template = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Instrument Sans"; src: url("${fontUrl("InstrumentSans-latin-wght.woff2")}") format("woff2"); font-weight: 400 700; }
@font-face { font-family: "IBM Plex Mono"; src: url("${fontUrl("IBMPlexMono-latin-500.woff2")}") format("woff2"); font-weight: 500; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; background: #050816; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; color: #e8eefc; font-family: "Instrument Sans", sans-serif; }
.art { position: absolute; inset: 0; background: url("${art}") right -40px bottom -20px / 1300px auto no-repeat; filter: brightness(0.42) saturate(1.1); -webkit-mask-image: linear-gradient(100deg, transparent 30%, #000 80%); }
.grid { position: absolute; inset: 0; opacity: .3; background-image: linear-gradient(rgba(120,180,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(120,180,255,.12) 1px, transparent 1px); background-size: 48px 48px; -webkit-mask-image: linear-gradient(90deg, #000 0%, transparent 60%); }
.bar { position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: linear-gradient(#4cc9ff, #2f6bff); }
.brand { position: absolute; left: 76px; top: 56px; font-family: "IBM Plex Mono", monospace; font-size: 22px; letter-spacing: .14em; color: #e8eefc; }
.brand b { color: #4cc9ff; font-weight: 500; }
.content { position: absolute; left: 76px; top: 120px; right: 76px; }
.record .content { right: 520px; }
.eyebrow { font-family: "IBM Plex Mono", monospace; font-size: 22px; letter-spacing: .12em; text-transform: uppercase; color: #4cc9ff; }
h1 { margin-top: 22px; font-weight: 650; letter-spacing: -0.02em; line-height: 1.06; overflow-wrap: normal; word-break: normal; }
.sub { margin-top: 24px; font-size: 28px; line-height: 1.35; color: #b7d7ff; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
.panel { position: absolute; right: 64px; top: 120px; width: 420px; padding: 22px 28px 10px; border-radius: 18px; background: rgba(11,22,44,.86); border: 1.5px solid rgba(120,180,255,.32); box-shadow: 0 0 40px rgba(76,201,255,.2); }
.article .panel { display: none; }
.row { padding: 12px 0; border-top: 1px solid rgba(120,180,255,.18); }
.row:first-child { border-top: 0; }
.row .k { font-family: "IBM Plex Mono", monospace; font-size: 15px; letter-spacing: .12em; text-transform: uppercase; color: #9aa8c7; }
.row .v { margin-top: 4px; font-size: 25px; font-weight: 600; color: #e8eefc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.foot { position: absolute; left: 76px; right: 64px; bottom: 48px; display: flex; justify-content: space-between; font-family: "IBM Plex Mono", monospace; font-size: 19px; color: #9aa8c7; }
</style></head><body><div class="card" id="card">
<div class="art"></div><div class="grid"></div><div class="bar"></div>
<div class="brand"><b>USASI</b> · Independent catalog</div>
<div class="content"><div class="eyebrow" id="eyebrow"></div><h1 id="title"></h1><p class="sub" id="sub"></p></div>
<div class="panel" id="panel"></div>
<div class="foot"><span id="url"></span><span>Every claim sourced</span></div>
</div><script>
window.fill = function (c) {
  var el = function (id) { return document.getElementById(id); };
  el("card").className = "card " + c.template;
  el("eyebrow").textContent = c.eyebrow;
  el("title").textContent = c.title;
  // Largest size at which whole words fit in at most three lines.
  var h = el("title");
  var size = c.template === "record" ? 84 : 72;
  for (; size > 36; size -= 2) {
    h.style.fontSize = size + "px";
    if (h.scrollWidth <= h.clientWidth && h.scrollHeight <= size * 1.06 * 3 + 4) break;
  }
  h.style.fontSize = size + "px";
  el("sub").textContent = c.subtitle || "";
  el("panel").innerHTML = "";
  c.facts.forEach(function (f) {
    var row = document.createElement("div"); row.className = "row";
    var k = document.createElement("div"); k.className = "k"; k.textContent = f[0];
    var v = document.createElement("div"); v.className = "v"; v.textContent = f[1];
    row.append(k, v); el("panel").append(row);
  });
  el("url").textContent = "unitedstatesofamericasuperintelligence.com" + (c.page.length > 30 ? c.page.slice(0, 29) + "\u2026" : c.page);
};
</script></body></html>`;

  const browser = await chromium.launch();
  const openPage = async () => {
    const p = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await p.setContent(template, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    return p;
  };
  try {
    let page = await openPage();
    for (const c of todo) {
      fs.mkdirSync(path.dirname(fileOf(c)), { recursive: true });
      // Chromium occasionally fails one capture on long runs; reopen the page and retry instead of losing the batch.
      for (let attempt = 1; ; attempt++) {
        try {
          await page.evaluate((card) => (window as unknown as { fill: (c: unknown) => void }).fill(card), c);
          await page.screenshot({ type: "jpeg", quality: 82, path: fileOf(c) });
          break;
        } catch (err) {
          if (attempt >= 3) throw err;
          console.warn(`page-cards: retrying ${c.image} after: ${(err as Error).message.split("\n")[0]}`);
          await page.close().catch(() => {});
          page = await openPage();
        }
      }
      manifest[c.image] = hashOf(c);
    }
  } finally {
    await browser.close();
  }
}
if (heroTodo.length > 0) {
  await renderGithubHeroes(heroTodo, (h) => path.join(root, "public", h.image), (h) => {
    manifest[h.image] = heroHashOf(h);
  });
}
if (hfTodo.length > 0) {
  await renderHfHeroes(hfTodo, (h) => path.join(root, "public", h.image), (h) => {
    manifest[h.image] = hfHashOf(h);
  });
}
fs.mkdirSync(outRoot, { recursive: true });
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 0));
console.log(`page cards: ${cards.length} total, ${todo.length} rendered, ${removed} removed`);
console.log(`github heroes: ${heroes.length} total, ${heroTodo.length} rendered`);
console.log(`huggingface heroes: ${hf.length} total, ${hfTodo.length} rendered`);
