/**
 * Renders AI on Hugging Face hero images (1200×630 JPEG, light theme) with the
 * site's fonts, through the shared renderer in scripts/hero-render.ts. Called
 * by scripts/page-cards.ts, which owns the cache. The artwork comes from
 * lib/huggingface/hero.ts. Unlike the AI on GitHub heroes (text over a veil,
 * pill facts), the text sits on a rounded panel with labeled rows. Names are
 * set with textContent, never as markup.
 */
import { hfHeroArt, hfHeroInk, type HfHero } from "../lib/huggingface/hero";
import { fontUrl, renderHeroImages } from "./hero-render";

const template = () => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Instrument Sans"; src: url("${fontUrl("InstrumentSans-latin-wght.woff2")}") format("woff2"); font-weight: 400 700; }
@font-face { font-family: "IBM Plex Mono"; src: url("${fontUrl("IBMPlexMono-latin-500.woff2")}") format("woff2"); font-weight: 500; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; background: #FFF8F1; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; color: #2A1E17; font-family: "Instrument Sans", sans-serif; }
#art, #art svg { position: absolute; inset: 0; width: 1200px; height: 630px; }
.panel { position: absolute; left: 44px; top: 44px; width: 660px; height: 542px; padding: 40px 44px 34px; border-radius: 32px; background: rgba(255,252,248,.93); box-shadow: 0 18px 50px rgba(90,50,20,.14), inset 0 0 0 1.5px rgba(120,70,30,.12); display: flex; flex-direction: column; }
.section .panel { width: 760px; }
.top { display: flex; align-items: center; gap: 14px; }
.kind { padding: 7px 16px; border-radius: 12px; font-size: 19px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #fff; }
.section .kind { display: none; }
.eyebrow { font-size: 19px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.author { margin-top: 30px; font-family: "IBM Plex Mono", monospace; font-size: 26px; color: #6B5444; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.section .author { display: none; }
h1 { margin-top: 8px; font-weight: 700; letter-spacing: -0.025em; line-height: 1.04; color: #2A1E17; overflow-wrap: normal; }
.section h1 { margin-top: 34px; }
.sub { margin-top: 20px; font-size: 27px; line-height: 1.36; color: #5C4A3D; }
.item .sub { display: none; }
.facts { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 0 28px; border-top: 1.5px solid rgba(120,70,30,.14); padding-top: 18px; }
.k { font-family: "IBM Plex Mono", monospace; font-size: 15px; letter-spacing: .12em; text-transform: uppercase; color: #8A715F; }
.v { margin-top: 6px; font-size: 25px; font-weight: 650; color: #2A1E17; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.url { margin-top: 20px; font-family: "IBM Plex Mono", monospace; font-size: 17px; color: #8A715F; }
</style></head><body><div class="card" id="card">
<div id="art"></div>
<div class="panel"><div class="top"><span class="kind" id="kind"></span><span class="eyebrow" id="eyebrow">USASI · AI on Hugging Face</span></div>
<div class="author" id="author"></div><h1 id="title"></h1><p class="sub" id="sub"></p>
<div class="facts" id="facts"></div>
<div class="url">unitedstatesofamericasuperintelligence.com/huggingface/</div></div>
</div><script>
window.fill = function (c) {
  var el = function (id) { return document.getElementById(id); };
  el("card").className = "card " + c.template;
  el("art").innerHTML = c.art;
  el("kind").textContent = c.kind || "";
  el("kind").style.background = c.accent;
  el("eyebrow").style.color = c.accent;
  el("author").textContent = c.author + " /";
  var h = el("title");
  // Break long names after - _ . so they wrap between words.
  h.textContent = c.title.replace(/([-_.])/g, "$1\\u200b");
  // Largest size that fits one line (down to 64px), else two lines (down to 46px), else three.
  var passes = c.template === "section" ? [[92, 40, 1]] : [[96, 64, 1], [80, 46, 2], [62, 30, 3]];
  var size = 30;
  outer: for (var p = 0; p < passes.length; p++) {
    for (var s = passes[p][0]; s >= passes[p][1]; s -= 2) {
      h.style.fontSize = s + "px";
      if (h.scrollWidth <= h.clientWidth && h.scrollHeight <= s * 1.04 * passes[p][2] + 6) { size = s; break outer; }
    }
  }
  h.style.fontSize = size + "px";
  el("sub").textContent = c.subtitle || "";
  el("facts").innerHTML = "";
  c.facts.forEach(function (f) {
    var d = document.createElement("div");
    var k = document.createElement("div"); k.className = "k"; k.textContent = f[0];
    var v = document.createElement("div"); v.className = "v"; v.textContent = f[1];
    d.append(k, v); el("facts").append(d);
  });
};
</script></body></html>`;

export async function renderHfHeroes(heroes: HfHero[], fileOf: (h: HfHero) => string, done: (h: HfHero) => void): Promise<void> {
  await renderHeroImages(heroes, {
    label: "huggingface heroes",
    template: template(),
    payload: (h) => ({ ...h, art: hfHeroArt(h.seed), ...hfHeroInk(h.seed) }),
    fileOf,
    done,
    quality: 78,
  });
}
