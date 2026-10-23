#!/usr/bin/env node
/**
 * npm run prepare:social
 *
 * Renders section-specific 1200×630 social preview cards with the site's own
 * fonts and colors, so a shared section link is distinguishable from a
 * homepage link. The homepage card (public/og.png) comes from
 * scripts/prepare-images.mjs.
 *
 * Outputs (committed to the repository):
 *   public/og-open.png   Open Models & Tools (/open/ and its record pages)
 *   public/og-jobs.png   Jobs (/jobs/), in the light site theme
 *   public/og-news.png, og-changelog.png,
 *   og-newsletter.png    section index pages, in the same light theme
 *
 * `npm run prepare:social -- og-news.png og-changelog.png` renders only the named
 * cards, so existing PNGs are not rewritten.
 *
 * Alt text for each card lives in lib/metadata.ts; update it when a card changes.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = process.cwd();
// Fonts and artwork are inlined as data URLs; Chromium does not load file://
// resources into a page created with setContent.
const fontUrl = (file) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, "app/fonts", file)).toString("base64")}`;
// Only the network map from the lower part of the branding artwork, so the
// homepage card's lettering and skyline do not show through.
const hero = path.join(root, "assets/branding/usasi-hero.png");
const { width: heroWidth, height: heroHeight } = await sharp(hero).metadata();
const mapTop = Math.round(heroHeight * 0.44);
const mapCrop = await sharp(hero).extract({ left: 0, top: mapTop, width: heroWidth, height: heroHeight - mapTop }).jpeg({ quality: 90 }).toBuffer();
const art = `data:image/jpeg;base64,${mapCrop.toString("base64")}`;

const CARDS = [
  {
    file: "og-open.png",
    eyebrow: "USASI · Directory",
    title: ["Open Models", "&amp; Tools"],
    description: "U.S.-led open models, software, datasets, and evaluation tools.",
    panelTitle: "Every entry records",
    rows: ["Availability", "License", "Maintainer", "Public materials", "Sources"],
    url: "unitedstatesofamericasuperintelligence.com/open/",
  },
];

const html = (card) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: "Instrument Sans"; src: url("${fontUrl("InstrumentSans-latin-wght.woff2")}") format("woff2"); font-weight: 400 700; }
@font-face { font-family: "IBM Plex Mono"; src: url("${fontUrl("IBMPlexMono-latin-500.woff2")}") format("woff2"); font-weight: 500; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; background: #050816; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; color: #e8eefc; font-family: "Instrument Sans", sans-serif; }
.art { position: absolute; inset: 0; background: url("${art}") right -40px bottom -20px / 1300px auto no-repeat;
  filter: brightness(0.55) saturate(1.15); -webkit-mask-image: linear-gradient(100deg, transparent 25%, #000 72%); }
.grid { position: absolute; inset: 0; opacity: 0.35;
  background-image: linear-gradient(rgba(120,180,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(120,180,255,.12) 1px, transparent 1px);
  background-size: 48px 48px; -webkit-mask-image: linear-gradient(90deg, #000 0%, transparent 60%); }
.bar { position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: linear-gradient(#4cc9ff, #2f6bff); }
.content { position: absolute; left: 76px; top: 72px; width: 600px; }
.eyebrow { font-family: "IBM Plex Mono", monospace; font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: #4cc9ff; }
h1 { margin-top: 26px; font-size: 92px; line-height: 1.0; font-weight: 650; letter-spacing: -0.02em; }
p { margin-top: 28px; font-size: 30px; line-height: 1.35; color: #b7d7ff; max-width: 540px; }
.url { position: absolute; left: 76px; bottom: 56px; font-family: "IBM Plex Mono", monospace; font-size: 20px; color: #9aa8c7; }
.panel { position: absolute; right: 64px; top: 112px; width: 400px; padding: 26px 30px 14px; border-radius: 18px;
  background: rgba(11,22,44,.82); border: 1.5px solid rgba(120,180,255,.32); box-shadow: 0 0 40px rgba(76,201,255,.25); }
.panel h2 { font-family: "IBM Plex Mono", monospace; font-weight: 500; font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #9aa8c7; margin-bottom: 8px; }
.row { display: flex; align-items: center; gap: 16px; padding: 13px 0; font-size: 27px; font-weight: 550; border-top: 1px solid rgba(120,180,255,.18); }
.row:first-of-type { border-top: 0; }
.tick { flex: none; width: 28px; height: 28px; border-radius: 8px; background: rgba(76,201,255,.16); border: 1.5px solid #4cc9ff; position: relative; }
.tick::after { content: ""; position: absolute; left: 8px; top: 3px; width: 7px; height: 14px; border: solid #4cc9ff; border-width: 0 3px 3px 0; transform: rotate(45deg); }
</style></head><body><div class="card">
  <div class="art"></div><div class="grid"></div><div class="bar"></div>
  <div class="content">
    <div class="eyebrow">${card.eyebrow}</div>
    <h1>${card.title.join("<br>")}</h1>
    <p>${card.description}</p>
  </div>
  <div class="panel"><h2>${card.panelTitle}</h2>${card.rows.map((r) => `<div class="row"><span class="tick"></span>${r}</div>`).join("")}</div>
  <div class="url">${card.url}</div>
</div></body></html>`;


// The Jobs card uses the light theme (soft white, navy type, gold top bar, red
// eyebrow) so a shared /jobs/ link looks unlike the homepage and Open cards.
// It shows how the board works, not counts, so it never goes out of date.
// The section cards below reuse it; none of them shows a count either.
const JOBS_CARD = {
  file: "og-jobs.png",
  eyebrow: "USASI Jobs",
  title: ["Jobs in", "American AI"],
  description: "Open roles at U.S. AI companies, labs, and research universities. Apply with the employer.",
  search: "Title, skill, or place",
  panelTitle: "Filter by",
  rows: ["Role and experience level", "City, state, or remote", "Pay range", "Employer"],
  url: "unitedstatesofamericasuperintelligence.com/jobs/",
};
const LIGHT_CARDS = [
  JOBS_CARD,
  {
    file: "og-news.png",
    eyebrow: "USASI News",
    title: ["U.S. AI news,", "with sources"],
    description: "Dated updates about the organizations and open artifacts in the USASI catalog.",
    panelTitle: "Updates on",
    rows: ["Releases", "License changes", "Ownership", "Governance"],
    url: "unitedstatesofamericasuperintelligence.com/news/",
  },
  {
    file: "og-changelog.png",
    eyebrow: "USASI Editorial log",
    title: ["Catalog", "changelog"],
    description: "Substantive changes to the USASI catalog and its policies, with dates.",
    panelTitle: "Entries record",
    rows: ["Added", "Updated", "Corrected", "Policy changes"],
    url: "unitedstatesofamericasuperintelligence.com/changelog/",
  },
  {
    file: "og-newsletter.png",
    eyebrow: "Weekly email",
    title: ["The USASI", "weekly"],
    description: "One email a week on what changed in the catalog, each item linked to its sourced page.",
    panelTitle: "Each issue sums up",
    rows: ["New catalog records", "Releases", "License changes", "Corrections"],
    url: "unitedstatesofamericasuperintelligence.com/newsletter/",
  },
];

const lightHtml = (card) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: "Instrument Sans"; src: url("${fontUrl("InstrumentSans-latin-wght.woff2")}") format("woff2"); font-weight: 400 700; }
@font-face { font-family: "IBM Plex Mono"; src: url("${fontUrl("IBMPlexMono-latin-500.woff2")}") format("woff2"); font-weight: 500; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; background: #F7F8FA; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; color: #24374A; font-family: "Instrument Sans", sans-serif; }
.top { position: absolute; left: 0; right: 0; top: 0; height: 12px; background: #D3A552; }
.dots { position: absolute; inset: 0; opacity: .55; background-image: radial-gradient(#DAE2E9 1.6px, transparent 1.6px); background-size: 28px 28px;
  -webkit-mask-image: linear-gradient(90deg, transparent 35%, #000 100%); }
.content { position: absolute; left: 76px; top: 86px; width: 560px; }
.eyebrow { display: flex; align-items: center; gap: 14px; font-size: 22px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #9E3F46; }
.eyebrow::before { content: ""; width: 36px; height: 3px; background: #B9545A; }
h1 { margin-top: 26px; font-size: 88px; line-height: 1.0; font-weight: 700; letter-spacing: -0.025em; color: #1B2A38; }
p { margin-top: 26px; font-size: 29px; line-height: 1.38; color: #41566B; }
.url { position: absolute; left: 76px; bottom: 52px; font-family: "IBM Plex Mono", monospace; font-size: 20px; color: #5B6B7C; }
.search { position: absolute; right: 64px; top: 92px; width: 452px; padding: 18px 20px; border-radius: 14px; background: #fff; border: 1.5px solid #DAE2E9;
  box-shadow: 0 8px 24px rgba(36,55,74,.09); display: flex; align-items: center; gap: 14px; font-size: 25px; color: #5B6B7C; }
.glass { flex: none; width: 24px; height: 24px; border: 3.5px solid #2D6DAA; border-radius: 50%; position: relative; }
.glass::after { content: ""; position: absolute; width: 4px; height: 11px; background: #2D6DAA; right: -7px; bottom: -9px; transform: rotate(-45deg); border-radius: 2px; }
.btn { margin-left: auto; padding: 9px 16px; border-radius: 10px; background: #2D6DAA; color: #fff; font-size: 21px; font-weight: 700; }
.panel { position: absolute; right: 64px; top: 196px; width: 452px; padding: 22px 26px 12px; border-radius: 14px; background: #fff; border: 1.5px solid #DAE2E9;
  border-top: 4px solid #B9545A; box-shadow: 0 8px 24px rgba(36,55,74,.07); }
.panel h2 { font-size: 17px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #9E3F46; margin-bottom: 6px; }
.row { display: flex; align-items: center; gap: 16px; padding: 12px 0; font-size: 25px; font-weight: 600; color: #24374A; border-top: 1px solid #E8EEF3; }
.row:first-of-type { border-top: 0; }
.chip { flex: none; width: 26px; height: 26px; border-radius: 8px; background: #E8EEF3; border: 1.5px solid #2D6DAA; position: relative; }
.chip::after { content: ""; position: absolute; left: 8px; top: 3px; width: 6px; height: 13px; border: solid #2D6DAA; border-width: 0 3px 3px 0; transform: rotate(45deg); }
</style></head><body><div class="card">
  <div class="dots"></div><div class="top"></div>
  <div class="content">
    <div class="eyebrow">${card.eyebrow}</div>
    <h1>${card.title.join("<br>")}</h1>
    <p>${card.description}</p>
  </div>
  ${card.search ? `<div class="search"><span class="glass"></span>${card.search}<span class="btn">Search</span></div>` : ""}
  <div class="panel"${card.search ? "" : ' style="top: 112px"'}><h2>${card.panelTitle}</h2>${card.rows.map((r) => `<div class="row"><span class="chip"></span>${r}</div>`).join("")}</div>
  <div class="url">${card.url}</div>
</div></body></html>`;

// With file names on the command line, render only those cards.
const only = new Set(process.argv.slice(2));
const wanted = (file) => only.size === 0 || only.has(file);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const render = async (file, markup) => {
    await page.setContent(markup, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({ type: "png" });
    const out = path.join(root, "public", file);
    await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }).toFile(out);
    console.log(`${file.padEnd(18)} ${(fs.statSync(out).size / 1024).toFixed(0).padStart(5)} KiB`);
  };
  for (const card of CARDS) if (wanted(card.file)) await render(card.file, html(card));
  for (const card of LIGHT_CARDS) if (wanted(card.file)) await render(card.file, lightHtml(card));
} finally {
  await browser.close();
}
