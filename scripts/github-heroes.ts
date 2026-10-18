/**
 * Renders AI on GitHub hero images (1200×630 JPEG, light theme) with the
 * site's fonts. Called by scripts/page-cards.ts, which owns the cache. The
 * artwork comes from lib/github/hero.ts; repository names are set with
 * textContent, never as markup.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { heroArt, heroInk, type GithubHero } from "../lib/github/hero";

const root = process.cwd();
const fontUrl = (file: string) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, "app/fonts", file)).toString("base64")}`;

const template = () => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Instrument Sans"; src: url("${fontUrl("InstrumentSans-latin-wght.woff2")}") format("woff2"); font-weight: 400 700; }
@font-face { font-family: "IBM Plex Mono"; src: url("${fontUrl("IBMPlexMono-latin-500.woff2")}") format("woff2"); font-weight: 500; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; background: #F7F8FA; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; color: #1B2A38; font-family: "Instrument Sans", sans-serif; }
#art, #art svg { position: absolute; inset: 0; width: 1200px; height: 630px; }
.veil { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,255,255,.72) 0%, rgba(255,255,255,.5) 38%, rgba(255,255,255,0) 62%); }
.bar { position: absolute; left: 0; right: 0; top: 0; height: 10px; }
.content { position: absolute; left: 72px; top: 70px; width: 640px; }
.section .content { width: 720px; }
.eyebrow { display: flex; align-items: center; gap: 14px; font-size: 21px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #9E3F46; }
.eyebrow::before { content: ""; width: 34px; height: 3px; background: #B9545A; }
.owner { margin-top: 34px; font-family: "IBM Plex Mono", monospace; font-size: 28px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.section .owner { display: none; }
h1 { margin-top: 10px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.02; color: #1B2A38; overflow-wrap: normal; }
.section h1 { margin-top: 30px; }
.sub { margin-top: 22px; font-size: 29px; line-height: 1.35; color: #41566B; max-width: 640px; }
.project .sub { display: none; }
.facts { position: absolute; left: 72px; bottom: 104px; display: flex; flex-wrap: wrap; gap: 12px; max-width: 760px; }
.fact { padding: 10px 18px; border-radius: 999px; background: rgba(255,255,255,.9); border: 1.5px solid #DAE2E9; font-size: 24px; font-weight: 600; color: #24374A; box-shadow: 0 6px 18px rgba(36,55,74,.08); white-space: nowrap; }
.fact:first-child { color: #fff; border-color: transparent; }
.url { position: absolute; left: 72px; bottom: 50px; font-family: "IBM Plex Mono", monospace; font-size: 19px; color: #5B6B7C; }
</style></head><body><div class="card" id="card">
<div id="art"></div><div class="veil"></div><div class="bar" id="bar"></div>
<div class="content"><div class="eyebrow">USASI · AI on GitHub</div><div class="owner" id="owner"></div><h1 id="title"></h1><p class="sub" id="sub"></p></div>
<div class="facts" id="facts"></div>
<div class="url">unitedstatesofamericasuperintelligence.com/github/</div>
</div><script>
window.fill = function (c) {
  var el = function (id) { return document.getElementById(id); };
  el("card").className = "card " + c.template;
  el("art").innerHTML = c.art;
  el("bar").style.background = c.bar;
  el("owner").textContent = c.owner + " /";
  el("owner").style.color = c.accent;
  var h = el("title");
  // Break long names after - _ . so they wrap between words.
  h.textContent = c.title.replace(/([-_.])/g, "$1\\u200b");
  var max = c.template === "section" ? 104 : 96, lines = c.template === "section" ? 1 : 2;
  var size = max;
  for (; size > 34; size -= 2) {
    h.style.fontSize = size + "px";
    if (h.scrollWidth <= h.clientWidth && h.scrollHeight <= size * 1.02 * lines + 6) break;
  }
  h.style.fontSize = size + "px";
  el("sub").textContent = c.subtitle || "";
  el("facts").innerHTML = "";
  c.facts.forEach(function (f, i) {
    var s = document.createElement("span"); s.className = "fact"; s.textContent = f;
    if (i === 0) s.style.background = c.accent;
    el("facts").append(s);
  });
};
</script></body></html>`;

export async function renderGithubHeroes(heroes: GithubHero[], fileOf: (h: GithubHero) => string, done: (h: GithubHero) => void): Promise<void> {
  const browser = await chromium.launch();
  try {
    // Four pages in parallel; each renders every fourth hero.
    const LANES = 4;
    let n = 0;
    await Promise.all(
      Array.from({ length: LANES }, async (_, lane) => {
        const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
        await page.setContent(template(), { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        for (let i = lane; i < heroes.length; i += LANES) {
          const h = heroes[i];
          const ink = heroInk(h.seed);
          await page.evaluate((c) => (window as unknown as { fill: (c: unknown) => void }).fill(c), { ...h, art: heroArt(h.seed), accent: ink.accent, bar: ink.bar });
          const shot = await page.screenshot({ type: "png" });
          fs.mkdirSync(path.dirname(fileOf(h)), { recursive: true });
          await sharp(shot).jpeg({ quality: 80, mozjpeg: true }).toFile(fileOf(h));
          done(h);
          if (++n % 500 === 0) console.log(`github heroes: ${n} of ${heroes.length} rendered`);
        }
      }),
    );
  } finally {
    await browser.close();
  }
}
