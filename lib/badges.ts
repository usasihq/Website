/**
 * Embeddable rank badges for AI on GitHub and AI on Hugging Face pages.
 *
 * The artwork is a string-templated SVG in the same shields.io style as
 * public/badges/listed.svg (site navy + cyan, 20px tall). Ranks come from the
 * same ordered lists the pages use, so a badge and its page cannot disagree.
 */
import { badgeSnippets } from "./share";

export const RANK_BADGE_HEIGHT = 20;
export type RankBadgeKind = "github" | "huggingface";

const LABEL = "USASI";
/** Left-hand "USASI" panel, locked to public/badges/listed.svg. */
const LABEL_BOX = 46;
const LABEL_TEXT = 36;
const PAD = 5;

/**
 * Approximate Verdana 11px advances (shields.io / listed.svg). Only the
 * characters that appear on a rank badge are listed; anything else is 7.
 */
const CHAR_W: Record<string, number> = {
  " ": 3.3,
  "#": 8.5,
  ",": 3.5,
  "0": 7,
  "1": 7,
  "2": 7,
  "3": 7,
  "4": 7,
  "5": 7,
  "6": 7,
  "7": 7,
  "8": 7,
  "9": 7,
  G: 9,
  H: 8.5,
  M: 9.8,
  R: 8.5,
  S: 8,
  U: 8.5,
  a: 7,
  b: 7.3,
  d: 7.3,
  e: 7,
  f: 4.2,
  i: 3.3,
  k: 6.6,
  l: 3.3,
  n: 7.3,
  o: 7.3,
  p: 7.3,
  r: 5.1,
  s: 6,
  t: 4.4,
  u: 7.3,
};

const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function formatRank(rank: number): string {
  if (!Number.isInteger(rank) || rank < 1) throw new Error(`rank must be a positive integer, got ${rank}`);
  return rank.toLocaleString("en-US");
}

/** Visible right-hand text: short, same pattern on both directories. */
export function rankBadgeMessage(kind: RankBadgeKind, rank: number): string {
  return `${kind === "github" ? "GitHub" : "Models"} #${formatRank(rank)}`;
}

/** Image alt / accessible name. Matches the wording on the pages. */
export function rankBadgeAlt(kind: RankBadgeKind, rank: number): string {
  const n = formatRank(rank);
  return kind === "github" ? `Ranked #${n} in AI on GitHub` : `Ranked #${n} among Hugging Face models`;
}

export function rankBadgeTitle(kind: RankBadgeKind, rank: number): string {
  return `USASI: ${rankBadgeAlt(kind, rank)}`;
}

export function rankBadgePath(kind: RankBadgeKind, slug: string): string {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`unsafe badge slug: ${slug}`);
  return `/badges/${kind}/${slug}.svg`;
}

function textWidth(text: string): number {
  return [...text].reduce((sum, ch) => sum + (CHAR_W[ch] ?? 7), 0);
}

/** Shields-style SVG; no browser, no fonts on disk. */
export function rankBadgeSvg(kind: RankBadgeKind, rank: number): string {
  return messageBadgeSvg(rankBadgeMessage(kind, rank), rankBadgeTitle(kind, rank));
}

/** The same USASI label panel with any short message on the right. */
export function messageBadgeSvg(message: string, title: string): string {
  const messageText = Math.ceil(textWidth(message));
  const messageBox = messageText + PAD * 2;
  const width = LABEL_BOX + messageBox;
  const labelX = Math.round((LABEL_BOX / 2) * 10);
  const messageX = Math.round((LABEL_BOX + messageBox / 2) * 10);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${RANK_BADGE_HEIGHT}" role="img" aria-label="${xml(title)}"><title>${xml(title)}</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="${width}" height="${RANK_BADGE_HEIGHT}" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="${LABEL_BOX}" height="${RANK_BADGE_HEIGHT}" fill="#0b1224"/><rect x="${LABEL_BOX}" width="${messageBox}" height="${RANK_BADGE_HEIGHT}" fill="#4cc9ff"/><rect width="${width}" height="${RANK_BADGE_HEIGHT}" fill="url(#s)"/></g><g text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="${labelX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${LABEL_TEXT * 10}">${LABEL}</text><text x="${labelX}" y="140" transform="scale(.1)" fill="#fff" textLength="${LABEL_TEXT * 10}">${LABEL}</text><text x="${messageX}" y="140" transform="scale(.1)" fill="#041022" textLength="${messageText * 10}">${xml(message)}</text></g></svg>`;
}

export function rankBadge(kind: RankBadgeKind, slug: string, rank: number): { path: string; svg: string; alt: string; message: string } {
  return {
    path: rankBadgePath(kind, slug),
    svg: rankBadgeSvg(kind, rank),
    alt: rankBadgeAlt(kind, rank),
    message: rankBadgeMessage(kind, rank),
  };
}

export function rankBadgeSnippets(pageUrl: string, badgeUrl: string, kind: RankBadgeKind, rank: number) {
  return badgeSnippets(pageUrl, badgeUrl, rankBadgeAlt(kind, rank));
}
