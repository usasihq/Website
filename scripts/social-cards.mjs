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

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const card of CARDS) {
    await page.setContent(html(card), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({ type: "png" });
    const out = path.join(root, "public", card.file);
    await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }).toFile(out);
    console.log(`${card.file.padEnd(14)} ${(fs.statSync(out).size / 1024).toFixed(0).padStart(5)} KiB`);
  }
} finally {
  await browser.close();
}
