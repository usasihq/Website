/**
 * Job descriptions, as the employer publishes them on its job board.
 *
 * Employer HTML is never stored or rendered as HTML. At refresh time it is
 * reduced to a small, validated structure (headings, paragraphs, lists, with
 * bold, italic, and HTTPS links inside them) and everything else is dropped:
 * scripts, styles, images, iframes, forms, attributes, and inline event
 * handlers never survive. Pages render the structure as React elements; the
 * JobPosting description for search engines is rebuilt from it with every
 * text node escaped.
 */
import { z } from "../zod";
import { safeJobUrl } from "./schema";

const MAX_TEXT = 4000;
const MAX_TOTAL = 40000;

export const Run = z
  .object({
    t: z.string().min(1).max(MAX_TEXT),
    b: z.literal(true).optional(),
    i: z.literal(true).optional(),
    href: z.string().refine(safeJobUrl).optional(),
  })
  .strict();
export type Run = z.infer<typeof Run>;
const Runs = z.array(Run).min(1).max(400);
export const Block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("h"), runs: Runs }).strict(),
  z.object({ type: z.literal("p"), runs: Runs }).strict(),
  z.object({ type: z.literal("ul"), items: z.array(Runs).min(1).max(200) }).strict(),
  z.object({ type: z.literal("ol"), items: z.array(Runs).min(1).max(200) }).strict(),
]);
export type Block = z.infer<typeof Block>;
export const Description = z.array(Block).min(1).max(600);
export type Description = z.infer<typeof Description>;

/** Elements whose content is dropped entirely. */
const DROP = new Set(["script", "style", "noscript", "iframe", "object", "embed", "svg", "math", "template", "head", "title", "form", "select", "textarea", "button", "canvas", "video", "audio", "picture", "img"]);
const BLOCK = new Set(["p", "div", "section", "article", "header", "footer", "main", "aside", "blockquote", "figure", "figcaption", "pre", "address", "table", "thead", "tbody", "tfoot", "tr", "dl", "dt", "dd", "hr"]);
const HEADING = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const BOLD = new Set(["b", "strong"]);
const ITALIC = new Set(["i", "em"]);

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“", bull: "•", middot: "·", copy: "©", reg: "®", trade: "™", euro: "€", pound: "£", deg: "°", times: "×",
  eacute: "é", egrave: "è", aacute: "á", agrave: "à", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", ccedil: "ç", uuml: "ü",
  ouml: "ö", auml: "ä", szlig: "ß", shy: "",
};

/** Decode character references once (unknown named references stay as written). */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});/gi, (whole, ref: string) => {
    if (ref[0] === "#") {
      const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return " ";
      return String.fromCodePoint(code);
    }
    return NAMED[ref.toLowerCase()] ?? whole;
  });
}

/** Text that cannot be shown: control characters and zero-width marks. */
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‍⁠﻿]/g, "");

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return m ? decodeEntities(m[1] ?? m[2] ?? m[3] ?? "") : null;
}

/**
 * Reduce employer HTML to the Description structure. Returns null when nothing
 * readable is left. Text beyond MAX_TOTAL characters is cut at a block boundary.
 */
export function htmlToDescription(html: string | null | undefined): Description | null {
  if (!html) return null;
  const source = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, " ");
  const blocks: Block[] = [];
  let runs: Run[] = [];
  let kind: "p" | "h" = "p";
  const lists: { type: "ul" | "ol"; items: Run[][] }[] = [];
  let item: Run[] | null = null;
  let bold = 0, italic = 0, dropDepth = 0;
  let dropTag = "";
  const links: (string | null)[] = [];
  let total = 0;
  let full = false;

  const push = (text: string) => {
    if (full) return;
    const t = clean(text).replace(/\s+/g, " ");
    if (!t.trim()) {
      if (t && (item ?? runs).length) addRun(" ");
      return;
    }
    if (total + t.length > MAX_TOTAL) {
      full = true;
      return;
    }
    total += t.length;
    addRun(t);
  };
  const addRun = (t: string) => {
    const target = item ?? runs;
    const href = links.length ? (links[links.length - 1] ?? undefined) : undefined;
    const run: Run = { t, ...(bold ? { b: true as const } : {}), ...(italic ? { i: true as const } : {}), ...(href ? { href } : {}) };
    const last = target[target.length - 1];
    if (last && last.b === run.b && last.i === run.i && last.href === run.href && last.t.length + t.length <= MAX_TEXT) last.t += t;
    else if (t.length <= MAX_TEXT) target.push(run);
  };
  const trimRuns = (r: Run[]): Run[] => {
    const out = r.map((x) => ({ ...x }));
    if (out.length) out[0].t = out[0].t.replace(/^\s+/, "");
    if (out.length) out[out.length - 1].t = out[out.length - 1].t.replace(/\s+$/, "");
    return out.filter((x) => x.t.length > 0);
  };
  const endBlock = () => {
    const r = trimRuns(runs);
    runs = [];
    if (r.length) blocks.push({ type: kind, runs: r });
    kind = "p";
  };
  const endItem = () => {
    if (!item) return;
    const r = trimRuns(item);
    item = null;
    if (r.length && lists.length) lists[lists.length - 1].items.push(r);
  };

  const token = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)|(<)/g;
  for (const m of source.matchAll(token)) {
    const [, closing, rawName, attrs, text, stray] = m;
    if (text !== undefined || stray !== undefined) {
      if (!dropDepth) push(decodeEntities(text ?? "<"));
      continue;
    }
    const name = rawName.toLowerCase();
    const selfClosing = /\/\s*$/.test(attrs ?? "");
    if (dropDepth) {
      if (name === dropTag) dropDepth += closing ? -1 : selfClosing ? 0 : 1;
      continue;
    }
    if (DROP.has(name)) {
      if (!closing && !selfClosing && name !== "img") {
        dropDepth = 1;
        dropTag = name;
      }
      continue;
    }
    if (name === "br") {
      if (item) addRun(" ");
      else endBlock();
      continue;
    }
    if (HEADING.has(name)) {
      if (item) continue;
      endBlock();
      if (!closing) kind = "h";
      continue;
    }
    if (name === "ul" || name === "ol") {
      if (!closing) {
        endItem();
        if (!lists.length) endBlock();
        lists.push({ type: name, items: [] });
      } else if (lists.length) {
        endItem();
        const list = lists.pop()!;
        if (list.items.length) {
          if (lists.length) {
            // A nested list becomes items of the enclosing list.
            lists[lists.length - 1].items.push(...list.items);
          } else blocks.push({ type: list.type, items: list.items.slice(0, 200) });
        }
      }
      continue;
    }
    if (name === "li") {
      if (!lists.length) {
        endBlock();
        continue;
      }
      endItem();
      if (!closing) item = [];
      continue;
    }
    if (BLOCK.has(name) || name === "td" || name === "th") {
      if (item) {
        if ((name === "td" || name === "th") && !closing) addRun(" ");
        continue;
      }
      if (name === "td" || name === "th") {
        if (!closing && runs.length) addRun(" · ");
        continue;
      }
      endBlock();
      continue;
    }
    if (BOLD.has(name)) {
      bold = Math.max(0, bold + (closing ? -1 : 1));
      continue;
    }
    if (ITALIC.has(name)) {
      italic = Math.max(0, italic + (closing ? -1 : 1));
      continue;
    }
    if (name === "a") {
      if (closing) links.pop();
      else {
        const href = attr(m[0], "href");
        links.push(href && safeJobUrl(href) ? href : null);
      }
      continue;
    }
    // Any other element (span, font, u, sup, …) keeps its text and loses itself.
  }
  endItem();
  while (lists.length) {
    const list = lists.pop()!;
    if (list.items.length) blocks.push({ type: list.type, items: list.items.slice(0, 200) });
  }
  endBlock();
  const parsed = Description.safeParse(blocks.slice(0, 600));
  return parsed.success ? parsed.data : null;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const runsHtml = (runs: Run[]) =>
  runs
    .map((r) => {
      let s = esc(r.t);
      if (r.i) s = `<em>${s}</em>`;
      if (r.b) s = `<strong>${s}</strong>`;
      return s;
    })
    .join("");

/** Minimal HTML for a JobPosting description: only p, h3, ul, ol, li, strong, em; every text node escaped. */
export function descriptionHtml(d: Description): string {
  return d
    .map((b) =>
      b.type === "h"
        ? `<h3>${runsHtml(b.runs)}</h3>`
        : b.type === "p"
          ? `<p>${runsHtml(b.runs)}</p>`
          : `<${b.type}>${b.items.map((i) => `<li>${runsHtml(i)}</li>`).join("")}</${b.type}>`,
    )
    .join("");
}

/** Plain text of a description, for search snippets and meta descriptions. */
export function descriptionText(d: Description): string {
  return d
    .map((b) => (b.type === "h" || b.type === "p" ? b.runs.map((r) => r.t).join("") : b.items.map((i) => i.map((r) => r.t).join("")).join(" ")))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
