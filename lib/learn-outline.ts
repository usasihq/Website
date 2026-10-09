/**
 * Build-time outline of an explainer's MDX source: its section headings (for
 * the "On this page" list) and an estimated reading time. Server-only.
 */
import fs from "node:fs";
import path from "node:path";
import { explainer } from "./learn";

export type Outline = { headings: { id: string; title: string }[]; words: number; minutes: number };

const WORDS_PER_MINUTE = 230;

export function outlineFromMdx(mdx: string): Outline {
  const headings = [...mdx.matchAll(/<h2 id="([a-z0-9-]+)">([^<]+)<\/h2>/g)].map((m) => ({ id: m[1], title: m[2].trim() }));
  // Count reading words only: drop the Sources list, headings markup, link targets, and code.
  const body = mdx
    .split(/<h2 id="sources">/)[0]
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/[#*_`[\]]/g, " ");
  const words = body.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return { headings, words, minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
}

const cache = new Map<string, Outline>();

export function explainerOutline(slug: string): Outline {
  const hit = cache.get(slug);
  if (hit) return hit;
  const e = explainer(slug);
  if (!e) throw new Error(`Unknown explainer: ${slug}`);
  const outline = outlineFromMdx(fs.readFileSync(path.join(process.cwd(), "content", "pages", `${e.file}.mdx`), "utf8"));
  cache.set(slug, outline);
  return outline;
}
