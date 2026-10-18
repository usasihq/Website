/**
 * Hero images for AI on GitHub: one 1200×630 JPEG per project at
 * /og/github/<slug>.jpg, used as the visible hero on the project page and as
 * its og:image / twitter:image. The artwork is deterministic generative art
 * seeded from the repository's full name (a soft light gradient in a hue
 * derived from the hash, plus one of four line patterns), so every project
 * gets its own image and a rebuild draws the same one. No third-party logos
 * or avatars. Rendered by scripts/page-cards.ts with the page-card cache.
 */

/** Bump when the hero template or artwork changes, so every hero is rendered again. */
export const GITHUB_HERO_VERSION = 2;

export type GithubHero = {
  page: string;
  image: string;
  /** "project" for a repository page, "section" for /github/ itself. */
  template: "project" | "section";
  seed: string;
  owner: string;
  title: string;
  /** Shown under the title on the section card only. */
  subtitle: string | null;
  facts: string[];
  alt: string;
};

/** FNV-1a, 32-bit. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small, fast, deterministic. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hue for a seed. Murky yellow-greens (45–85°) are shifted toward green. */
export function heroHue(seed: string): number {
  const h = hash32(`hue:${seed}`) % 360;
  return h > 45 && h < 85 ? h + 50 : h;
}

export const PATTERNS = ["constellation", "circuit", "orbits", "waves"] as const;
export type HeroPattern = (typeof PATTERNS)[number];
export function heroPattern(seed: string): HeroPattern {
  return PATTERNS[hash32(`pattern:${seed}`) % PATTERNS.length];
}

export function hueName(h: number): string {
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 150) return "green";
  if (h < 190) return "teal";
  if (h < 215) return "sky blue";
  if (h < 250) return "blue";
  if (h < 285) return "violet";
  if (h < 320) return "purple";
  return "pink";
}

const W = 1200;
const H = 630;
const f = (n: number) => Math.round(n * 10) / 10;

/** The artwork as an SVG string (1200×630). Pure: the same seed always draws the same picture. */
export function heroArt(seed: string): string {
  const r = rng(hash32(seed));
  const hue = heroHue(seed);
  const pattern = heroPattern(seed);
  const hue2 = (hue + 25 + Math.floor(r() * 30)) % 360;
  const hue3 = (hue + 330 - Math.floor(r() * 30)) % 360;
  const ink = `hsl(${hue} 55% 38%)`;
  const ink2 = `hsl(${hue2} 60% 45%)`;
  const parts: string[] = [];
  const angle = Math.floor(r() * 60) + 100;
  parts.push(
    `<defs><linearGradient id="bg" gradientTransform="rotate(${angle - 90} .5 .5)"><stop offset="0" stop-color="hsl(${hue} 60% 97%)"/><stop offset=".55" stop-color="hsl(${hue} 65% 93%)"/><stop offset="1" stop-color="hsl(${hue2} 70% 86%)"/></linearGradient>` +
      `<radialGradient id="b1"><stop offset="0" stop-color="hsl(${hue2} 80% 78%)" stop-opacity=".75"/><stop offset="1" stop-color="hsl(${hue2} 80% 78%)" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="b2"><stop offset="0" stop-color="hsl(${hue3} 75% 82%)" stop-opacity=".7"/><stop offset="1" stop-color="hsl(${hue3} 75% 82%)" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="glow"><stop offset="0" stop-color="hsl(${hue} 80% 60%)" stop-opacity=".45"/><stop offset="1" stop-color="hsl(${hue} 80% 60%)" stop-opacity="0"/></radialGradient></defs>`,
  );
  parts.push(`<rect width="${W}" height="${H}" fill="url(#bg)"/>`);
  parts.push(`<circle cx="${f(820 + r() * 300)}" cy="${f(r() * 260)}" r="${f(260 + r() * 140)}" fill="url(#b1)"/>`);
  parts.push(`<circle cx="${f(640 + r() * 360)}" cy="${f(380 + r() * 250)}" r="${f(220 + r() * 160)}" fill="url(#b2)"/>`);

  const g: string[] = [];
  // A faint dot grid for texture, offset per seed.
  const dot = 26 + Math.floor(r() * 8);
  parts.push(
    `<defs><pattern id="dots" width="${dot}" height="${dot}" patternUnits="userSpaceOnUse" x="${Math.floor(r() * dot)}" y="${Math.floor(r() * dot)}"><circle cx="2" cy="2" r="1.6" fill="hsl(${hue} 40% 40%)" fill-opacity=".16"/></pattern></defs>`,
  );
  g.push(`<rect x="440" width="${W - 440}" height="${H}" fill="url(#dots)"/>`);
  if (pattern === "constellation") {
    const n = 26 + Math.floor(r() * 18);
    const pts = Array.from({ length: n }, () => {
      const x = 560 + Math.pow(r(), 0.7) * 660;
      return [x, 20 + r() * (H - 40), r()] as const;
    });
    const edges = new Set<string>();
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2] as const)
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2 + (r() < 0.3 ? 1 : 0));
      for (const [j] of near) edges.add(i < j ? `${i}-${j}` : `${j}-${i}`);
    });
    for (const e of edges) {
      const [i, j] = e.split("-").map(Number);
      g.push(`<line x1="${f(pts[i][0])}" y1="${f(pts[i][1])}" x2="${f(pts[j][0])}" y2="${f(pts[j][1])}" stroke="${ink}" stroke-opacity=".32" stroke-width="1.6"/>`);
    }
    for (const [x, y, s] of pts) {
      if (s > 0.86) g.push(`<circle cx="${f(x)}" cy="${f(y)}" r="34" fill="url(#glow)"/><circle cx="${f(x)}" cy="${f(y)}" r="14" fill="none" stroke="${ink2}" stroke-opacity=".55" stroke-width="2"/>`);
      g.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(2.5 + s * 5)}" fill="${s > 0.6 ? ink2 : ink}" fill-opacity="${s > 0.6 ? 0.85 : 0.6}"/>`);
    }
  } else if (pattern === "circuit") {
    const step = 30;
    const traces = 22 + Math.floor(r() * 12);
    for (let t = 0; t < traces; t++) {
      let x = Math.round((620 + r() * 560) / step) * step;
      let y = Math.round((30 + r() * (H - 60)) / step) * step;
      let d = `M${x} ${y}`;
      let dir = Math.floor(r() * 4);
      const segs = 2 + Math.floor(r() * 4);
      g.push(`<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${ink}" stroke-opacity=".55" stroke-width="2"/>`);
      for (let s = 0; s < segs; s++) {
        const len = step * (1 + Math.floor(r() * 4));
        if (r() < 0.35) {
          const dx = (dir % 2 === 0 ? 1 : -1) * len * 0.7;
          const dy = (dir < 2 ? 1 : -1) * len * 0.7;
          x += dx;
          y += dy;
        } else if (dir % 2 === 0) x += dir === 0 ? len : -len;
        else y += dir === 1 ? len : -len;
        x = Math.max(560, Math.min(W - 10, x));
        y = Math.max(12, Math.min(H - 12, y));
        d += ` L${f(x)} ${f(y)}`;
        dir = (dir + (r() < 0.5 ? 1 : 3)) % 4;
      }
      const strong = r() < 0.3;
      g.push(`<path d="${d}" fill="none" stroke="${strong ? ink2 : ink}" stroke-opacity="${strong ? 0.6 : 0.34}" stroke-width="${strong ? 2.6 : 1.8}" stroke-linejoin="round"/>`);
      g.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${strong ? 6 : 4}" fill="${strong ? ink2 : ink}" fill-opacity=".8"/>`);
    }
    const chips = 1 + Math.floor(r() * 2);
    for (let c = 0; c < chips; c++) {
      const cx = 740 + r() * 340;
      const cy = 120 + r() * 380;
      const s = 70 + r() * 50;
      g.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 1.3)}" fill="url(#glow)"/>`);
      g.push(`<rect x="${f(cx - s / 2)}" y="${f(cy - s / 2)}" width="${f(s)}" height="${f(s)}" rx="10" fill="hsl(${hue} 60% 97%)" fill-opacity=".8" stroke="${ink2}" stroke-opacity=".7" stroke-width="2.4"/>`);
      for (let k = 1; k < 4; k++) {
        const o = (s / 4) * k - s / 2;
        g.push(
          `<path d="M${f(cx + o)} ${f(cy - s / 2)}v-14M${f(cx + o)} ${f(cy + s / 2)}v14M${f(cx - s / 2)} ${f(cy + o)}h-14M${f(cx + s / 2)} ${f(cy + o)}h14" stroke="${ink2}" stroke-opacity=".6" stroke-width="2.4"/>`,
        );
      }
    }
  } else if (pattern === "orbits") {
    const cx = 860 + r() * 220;
    const cy = 170 + r() * 290;
    const tilt = Math.floor(r() * 180);
    const rings = 5 + Math.floor(r() * 4);
    g.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="90" fill="url(#glow)"/>`);
    for (let k = 1; k <= rings; k++) {
      const rx = 50 + k * (48 + r() * 10);
      const ry = rx * (0.42 + r() * 0.3);
      const rot = tilt + k * (8 + r() * 14);
      g.push(`<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})" fill="none" stroke="${k % 2 ? ink : ink2}" stroke-opacity="${f(0.42 - k * 0.025)}" stroke-width="1.6"${r() < 0.4 ? ' stroke-dasharray="4 7"' : ""}/>`);
      const dots = 2 + Math.floor(r() * 3);
      for (let d = 0; d < dots; d++) {
        const a = r() * Math.PI * 2;
        const rad = (rot * Math.PI) / 180;
        const ex = rx * Math.cos(a);
        const ey = ry * Math.sin(a);
        const x = cx + ex * Math.cos(rad) - ey * Math.sin(rad);
        const y = cy + ex * Math.sin(rad) + ey * Math.cos(rad);
        g.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 5)}" fill="${d % 2 ? ink2 : ink}" fill-opacity=".8"/>`);
      }
    }
    g.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="12" fill="${ink2}" fill-opacity=".85"/><circle cx="${f(cx)}" cy="${f(cy)}" r="22" fill="none" stroke="${ink2}" stroke-opacity=".5" stroke-width="2"/>`);
  } else {
    const lines = 16 + Math.floor(r() * 10);
    const amp = 30 + r() * 50;
    const freq = 0.004 + r() * 0.006;
    const drift = r() * Math.PI * 2;
    for (let k = 0; k < lines; k++) {
      const y0 = 10 + (k / lines) * (H - 20);
      const phase = drift + k * (0.25 + r() * 0.1);
      let d = "";
      for (let x = 380; x <= W; x += 20) {
        const y = y0 + Math.sin(x * freq + phase) * amp * (0.6 + (x - 540) / 1300) + Math.sin(x * freq * 2.3 + k) * 8;
        d += `${d ? " L" : "M"}${x} ${f(y)}`;
      }
      const strong = k % 5 === 2;
      g.push(`<path d="${d}" fill="none" stroke="${strong ? ink2 : ink}" stroke-opacity="${strong ? 0.6 : 0.26}" stroke-width="${strong ? 2.4 : 1.5}"/>`);
      if (strong || r() < 0.25) {
        const x = 700 + r() * 460;
        const y = y0 + Math.sin(x * freq + phase) * amp * (0.6 + (x - 540) / 1300) + Math.sin(x * freq * 2.3 + k) * 8;
        g.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${strong ? 7 : 4}" fill="${ink2}" fill-opacity=".85"/>`);
      }
    }
  }
  // The pattern fades out toward the text on the left.
  parts.push(
    `<defs><linearGradient id="fade" x1="0" x2="1"><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask></defs>`,
  );
  parts.push(`<g mask="url(#m)">${g.join("")}</g>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>`;
}

/** Accent colors for the text layer, matching the artwork's hue. */
export function heroInk(seed: string): { accent: string; bar: string } {
  const hue = heroHue(seed);
  return { accent: `hsl(${hue} 60% 30%)`, bar: `linear-gradient(90deg, hsl(${hue} 60% 45%), hsl(${(hue + 40) % 360} 65% 55%))` };
}

/** 1,234 → "1.2k", 123,456 → "123k" */
export function compactStars(n: number): string {
  if (n < 1000) return String(n);
  if (n < 100_000) return `${(Math.round(n / 100) / 10).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(n / 1000)}k`;
}

export function heroAlt(h: Pick<GithubHero, "seed" | "template" | "title" | "owner" | "facts" | "subtitle">): string {
  const colour = hueName(heroHue(h.seed));
  const pattern = { constellation: "constellation network", circuit: "circuit-trace", orbits: "orbit", waves: "flowing-wave" }[heroPattern(h.seed)];
  if (h.template === "section") {
    return `USASI AI on GitHub card: ${h.title}. ${h.subtitle ?? ""} Generated ${colour} ${pattern} artwork.`.replace(/\s+/g, " ").trim();
  }
  return `Generated ${colour} ${pattern} artwork for ${h.owner}/${h.title}, labeled USASI · AI on GitHub, with ${h.facts.join(" · ")}.`;
}
