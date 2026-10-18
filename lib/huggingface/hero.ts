/**
 * Hero images for AI on Hugging Face: one 1200×630 JPEG per model or dataset
 * at /og/huggingface/<slug>.jpg (datasets under /og/huggingface/datasets/),
 * used as the page's visible hero and its og:image. The artwork is
 * deterministic generative art seeded from the item's kind and id, in a warm
 * palette with one of four tile and lattice motifs, so it reads as a sibling
 * of the AI on GitHub heroes, not a copy. No logos (Hugging Face's or anyone
 * else's) or avatars. Rendered by scripts/page-cards.ts with the page-card cache.
 */
import { hash32, rng } from "../github/hero";

/** Bump when the hero template or artwork changes, so every hero is rendered again. */
export const HF_HERO_VERSION = 1;

export type HfHero = {
  page: string;
  image: string;
  /** "item" for a model or dataset page, "section" for /huggingface/ itself. */
  template: "item" | "section";
  kind: "Model" | "Dataset" | null;
  seed: string;
  author: string;
  title: string;
  subtitle: string | null;
  /** [label, value] rows: task and license. Never counts, ranks, or dates. */
  facts: [string, string][];
  alt: string;
};

/** Warm hues only: coral, tangerine, orange, amber, gold, and rose. */
const HUES = [4, 12, 18, 24, 30, 36, 42, 46, 336, 344, 352, 8] as const;
export function hfHue(seed: string): number {
  return HUES[hash32(`hfhue:${seed}`) % HUES.length];
}

export const HF_PATTERNS = ["tiles", "lattice", "stack", "bento"] as const;
export type HfPattern = (typeof HF_PATTERNS)[number];
export function hfPattern(seed: string): HfPattern {
  return HF_PATTERNS[hash32(`hfpattern:${seed}`) % HF_PATTERNS.length];
}

export function hfHueName(h: number): string {
  if (h >= 320 && h < 345) return "rose";
  if (h >= 345 || h < 10) return "coral";
  if (h < 22) return "tangerine";
  if (h < 34) return "orange";
  if (h < 44) return "amber";
  return "gold";
}

/** Clamp a hue to the warm band, -30° (330°) to 50°. */
export function warm(h: number): number {
  const x = ((((h + 180) % 360) + 360) % 360) - 180;
  return (Math.max(-30, Math.min(50, x)) + 360) % 360;
}

const W = 1200;
const H = 630;
const f = (n: number) => Math.round(n * 10) / 10;

/** The artwork as an SVG string (1200×630). Pure: the same seed always draws the same picture. */
export function hfHeroArt(seed: string): string {
  const r = rng(hash32(`hf:${seed}`));
  const hue = hfHue(seed);
  const pattern = hfPattern(seed);
  // Companion hues stay in the warm band (rose 330° through gold 50°), so nothing turns lime or magenta.
  const hue2 = warm(hue - 12 - Math.floor(r() * 14));
  const hue3 = warm(hue + 8 + Math.floor(r() * 10));
  const fill = (h: number, l: number, s = 85) => `hsl(${h} ${s}% ${l}%)`;
  const ink = fill(hue, 34, 60);
  const parts: string[] = [];
  parts.push(
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 80% 97.5%)"/><stop offset=".6" stop-color="hsl(${hue2} 85% 93%)"/><stop offset="1" stop-color="hsl(${hue3} 80% 88%)"/></linearGradient>` +
      `<linearGradient id="t1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fill(hue2, 72)}"/><stop offset="1" stop-color="${fill(hue, 60)}"/></linearGradient>` +
      `<linearGradient id="t2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fill(hue3, 86)}"/><stop offset="1" stop-color="${fill(hue2, 74)}"/></linearGradient>` +
      `<linearGradient id="t3" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${fill(hue, 52, 75)}"/><stop offset="1" stop-color="${fill(hue3, 66)}"/></linearGradient>` +
      `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="hsl(${hue} 50% 30%)" flood-opacity=".18"/></filter></defs>`,
  );
  parts.push(`<rect width="${W}" height="${H}" fill="url(#bg)"/>`);
  const g: string[] = [];
  const grads = ["url(#t1)", "url(#t2)", "url(#t3)", "#fff"];
  if (pattern === "tiles") {
    // A tilted grid of rounded tiles, some lifted (shadowed and solid), some only outlined.
    const size = 64 + Math.floor(r() * 18);
    const gap = 16 + Math.floor(r() * 8);
    const rot = -14 + Math.floor(r() * 28);
    const cx = 900 + r() * 80;
    const cy = 315;
    for (let gy = -5; gy <= 5; gy++) {
      for (let gx = -5; gx <= 5; gx++) {
        const x = cx + gx * (size + gap) - size / 2;
        const y = cy + gy * (size + gap) - size / 2;
        const v = r();
        if (v < 0.18) continue;
        if (v < 0.5) g.push(`<rect x="${f(x)}" y="${f(y)}" width="${size}" height="${size}" rx="${f(size * 0.26)}" fill="none" stroke="${ink}" stroke-opacity=".22" stroke-width="2"/>`);
        else if (v < 0.86) g.push(`<rect x="${f(x)}" y="${f(y)}" width="${size}" height="${size}" rx="${f(size * 0.26)}" fill="${grads[Math.floor(r() * 3)]}" fill-opacity="${f(0.45 + r() * 0.4)}"/>`);
        else g.push(`<rect x="${f(x)}" y="${f(y - 8)}" width="${size}" height="${size}" rx="${f(size * 0.26)}" fill="${grads[Math.floor(r() * 2)]}" filter="url(#sh)"/><circle cx="${f(x + size / 2)}" cy="${f(y - 8 + size / 2)}" r="${f(size * 0.14)}" fill="#fff" fill-opacity=".8"/>`);
      }
    }
    parts.push(`<g transform="rotate(${rot} ${f(cx)} ${cy})">${g.splice(0).join("")}</g>`);
  } else if (pattern === "lattice") {
    // A lattice of nodes displaced by two crossing waves, joined along both axes.
    const cols = 14 + Math.floor(r() * 4);
    const rows = 10 + Math.floor(r() * 3);
    const amp = 18 + r() * 26;
    const fx = 0.008 + r() * 0.006;
    const fy = 0.01 + r() * 0.008;
    const ph = r() * Math.PI * 2;
    const pt = (i: number, j: number) => {
      const x0 = 470 + (i / (cols - 1)) * 760;
      const y0 = -20 + (j / (rows - 1)) * (H + 40);
      return [x0 + Math.sin(y0 * fy + ph) * amp * 0.6, y0 + Math.sin(x0 * fx + ph + j * 0.35) * amp] as const;
    };
    for (let j = 0; j < rows; j++) {
      let d = "";
      for (let i = 0; i < cols; i++) {
        const [x, y] = pt(i, j);
        d += `${d ? " L" : "M"}${f(x)} ${f(y)}`;
      }
      g.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-opacity="${j % 3 === 1 ? 0.45 : 0.22}" stroke-width="${j % 3 === 1 ? 2.4 : 1.5}" stroke-linejoin="round"/>`);
    }
    for (let i = 0; i < cols; i++) {
      let d = "";
      for (let j = 0; j < rows; j++) {
        const [x, y] = pt(i, j);
        d += `${d ? " L" : "M"}${f(x)} ${f(y)}`;
      }
      g.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-opacity=".16" stroke-width="1.4"/>`);
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const v = r();
        if (v < 0.78) continue;
        const [x, y] = pt(i, j);
        const s = 14 + r() * 16;
        g.push(`<rect x="${f(x - s / 2)}" y="${f(y - s / 2)}" width="${f(s)}" height="${f(s)}" rx="${f(s * 0.3)}" fill="${grads[Math.floor(r() * 3)]}"${v > 0.94 ? ' filter="url(#sh)"' : ""}/>`);
      }
    }
  } else if (pattern === "stack") {
    // A fanned stack of rounded layers, like cards, turning around one corner.
    const px = 820 + r() * 140;
    const py = 520 + r() * 60;
    const n = 5 + Math.floor(r() * 3);
    const w = 330 + r() * 80;
    const h = 220 + r() * 60;
    const start = -38 - r() * 10;
    const step = 9 + r() * 5;
    for (let k = 0; k < n; k++) {
      const a = start + k * step;
      const fillK = k === n - 1 ? "#fff" : grads[k % 3];
      g.push(
        `<g transform="rotate(${f(a)} ${f(px)} ${f(py)})"><rect x="${f(px - w * 0.2)}" y="${f(py - h)}" width="${f(w)}" height="${f(h)}" rx="34" fill="${fillK}" fill-opacity="${k === n - 1 ? 0.92 : f(0.55 + k * 0.06)}" stroke="${ink}" stroke-opacity=".18" stroke-width="2" filter="url(#sh)"/>` +
          (k === n - 1
            ? Array.from({ length: 4 }, (_, i) => `<rect x="${f(px - w * 0.2 + 34)}" y="${f(py - h + 40 + i * 36)}" width="${f((w - 68) * (0.45 + r() * 0.55))}" height="14" rx="7" fill="${fill(hue, 70, 70)}" fill-opacity=".55"/>`).join("")
            : "") +
          `</g>`,
      );
    }
    for (let k = 0; k < 9; k++) {
      const s = 10 + r() * 22;
      g.push(`<rect x="${f(560 + r() * 620)}" y="${f(20 + r() * 590)}" width="${f(s)}" height="${f(s)}" rx="${f(s * 0.3)}" fill="${grads[k % 3]}" fill-opacity=".7"/>`);
    }
  } else {
    // A bento mosaic: a grid split into rounded blocks of different spans.
    const cell = 74 + Math.floor(r() * 12);
    const gap = 12;
    const cols = Math.ceil((W - 520) / (cell + gap)) + 1;
    const rows = Math.ceil(H / (cell + gap)) + 1;
    const used = new Set<string>();
    const ox = 540 - Math.floor(r() * 40);
    const oy = -Math.floor(r() * 50);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if (used.has(`${i},${j}`)) continue;
        let sw = r() < 0.3 ? 2 : 1;
        let sh = r() < 0.3 ? 2 : 1;
        if (used.has(`${i + 1},${j}`)) sw = 1;
        if (sw === 2 && sh === 2 && r() < 0.5) sh = 1;
        for (let a = 0; a < sw; a++) for (let b = 0; b < sh; b++) used.add(`${i + a},${j + b}`);
        const x = ox + i * (cell + gap);
        const y = oy + j * (cell + gap);
        const wv = sw * cell + (sw - 1) * gap;
        const hv = sh * cell + (sh - 1) * gap;
        const v = r();
        if (v < 0.22) g.push(`<rect x="${x}" y="${y}" width="${wv}" height="${hv}" rx="22" fill="none" stroke="${ink}" stroke-opacity=".2" stroke-width="2" stroke-dasharray="${v < 0.1 ? "6 8" : "0"}"/>`);
        else g.push(`<rect x="${x}" y="${y}" width="${wv}" height="${hv}" rx="22" fill="${grads[Math.floor(r() * 4)]}" fill-opacity="${f(0.4 + r() * 0.5)}"${sw * sh > 1 && v > 0.7 ? ' filter="url(#sh)"' : ""}/>`);
        if (sw * sh > 1 && v > 0.55) {
          const cr = Math.min(wv, hv) * 0.22;
          g.push(`<circle cx="${f(x + wv / 2)}" cy="${f(y + hv / 2)}" r="${f(cr)}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="5"/>`);
        }
      }
    }
  }
  // The pattern fades out toward the text panel on the left.
  parts.push(
    `<defs><linearGradient id="fade" x1="0" x2="1"><stop offset=".36" stop-color="#fff" stop-opacity=".15"/><stop offset=".6" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask></defs>`,
  );
  parts.push(`<g mask="url(#m)">${g.join("")}</g>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>`;
}

/** Accent colors for the text layer, matching the artwork's hue. */
export function hfHeroInk(seed: string): { accent: string; soft: string } {
  const hue = hfHue(seed);
  return { accent: `hsl(${hue} 70% 32%)`, soft: `hsl(${hue} 80% 94%)` };
}

export function hfHeroAlt(h: Pick<HfHero, "seed" | "template" | "title" | "author" | "facts" | "subtitle" | "kind">): string {
  const colour = hfHueName(hfHue(h.seed));
  const pattern = { tiles: "rounded-tile grid", lattice: "wave-lattice", stack: "layered-card", bento: "tile-mosaic" }[hfPattern(h.seed)];
  if (h.template === "section") {
    return `USASI AI on Hugging Face card: ${h.title}. ${h.subtitle ?? ""} Generated ${colour} ${pattern} artwork.`.replace(/\s+/g, " ").trim();
  }
  return `Generated ${colour} ${pattern} artwork for the ${(h.kind ?? "item").toLowerCase()} ${h.author}/${h.title}, labeled USASI · AI on Hugging Face, with ${h.facts.map(([k, v]) => `${k}: ${v}`).join(" · ")}.`;
}
