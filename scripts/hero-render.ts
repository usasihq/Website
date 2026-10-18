/**
 * Shared renderer for generated hero images (1200×630 JPEG): AI on GitHub
 * (scripts/github-heroes.ts) and AI on Hugging Face (scripts/hf-heroes.ts).
 * Each section supplies its own HTML template, which must define
 * window.fill(payload); text is set with textContent there, never as markup.
 * Called by scripts/page-cards.ts, which owns the cache.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

/** The site's fonts as data: URLs, for templates rendered from setContent. */
export const fontUrl = (file: string) => `data:font/woff2;base64,${fs.readFileSync(path.join(process.cwd(), "app/fonts", file)).toString("base64")}`;

export async function renderHeroImages<T>(
  heroes: T[],
  opts: { label: string; template: string; payload: (h: T) => unknown; fileOf: (h: T) => string; done: (h: T) => void; quality?: number },
): Promise<void> {
  const browser = await chromium.launch();
  try {
    // Four pages in parallel; each renders every fourth hero.
    const LANES = 4;
    let n = 0;
    await Promise.all(
      Array.from({ length: LANES }, async (_, lane) => {
        const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
        await page.setContent(opts.template, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        for (let i = lane; i < heroes.length; i += LANES) {
          const h = heroes[i];
          await page.evaluate((c) => (window as unknown as { fill: (c: unknown) => void }).fill(c), opts.payload(h));
          const shot = await page.screenshot({ type: "png" });
          const file = opts.fileOf(h);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          await sharp(shot).jpeg({ quality: opts.quality ?? 80, mozjpeg: true }).toFile(file);
          opts.done(h);
          if (++n % 500 === 0) console.log(`${opts.label}: ${n} of ${heroes.length} rendered`);
        }
      }),
    );
  } finally {
    await browser.close();
  }
}
