/**
 * Fixed "what can I run on N GB?" pages built from the finder's documented
 * configurations (content/finder). There is no separate rule here: each page
 * is one fixed finder input, and a configuration is listed exactly when the
 * finder's own `assess` says every requirement is met and its own
 * `memoryVerdict` says the publisher's figure is within the amount.
 */
import { assess, DEFAULT_INPUT, memoryVerdict, serializeInput, type Assessment, type FinderInput } from "./finder";
import type { FinderConfig, FinderTask } from "./schema";

export type MemoryKind = "vram" | "apple-silicon";
export type MemoryPage = { slug: string; kind: MemoryKind; gb: number };

/** Graphics-card memory amounts with their own page. */
export const VRAM_AMOUNTS = [8, 12, 16, 24] as const;
/** Apple silicon unified-memory amounts with their own page. */
export const UNIFIED_AMOUNTS = [8, 16, 24, 32, 64] as const;

export const MEMORY_PAGES: MemoryPage[] = [
  ...VRAM_AMOUNTS.map((gb) => ({ slug: `${gb}gb-vram`, kind: "vram" as const, gb })),
  ...UNIFIED_AMOUNTS.map((gb) => ({ slug: `${gb}gb-apple-silicon`, kind: "apple-silicon" as const, gb })),
];

export const MEMORY_INDEX_HREF = "/find/memory/";
export const memoryPageHref = (p: MemoryPage) => `/find/memory/${p.slug}/`;
export const memoryPage = (slug: string) => MEMORY_PAGES.find((p) => p.slug === slug);

/** "an 8 GB Apple silicon Mac", "a 16 GB Apple silicon Mac". */
export const appleMac = (gb: number) => `${/^8|^1[18]$/.test(String(gb)) ? "an" : "a"} ${gb} GB Apple silicon Mac`;

/** "8 GB of VRAM" / "16 GB of Apple silicon unified memory". */
export const memoryLabel = (p: MemoryPage) => (p.kind === "vram" ? `${p.gb} GB of VRAM` : `${p.gb} GB of Apple silicon unified memory`);
export const memoryShortLabel = (p: MemoryPage) => (p.kind === "vram" ? `${p.gb} GB VRAM` : `${p.gb} GB Apple silicon`);

/** Page title, kept to about 50 characters so the site suffix still fits in a result. */
export const memoryPageTitle = (p: MemoryPage) =>
  p.kind === "vram" ? `AI models you can run on ${p.gb} GB of VRAM (documented)` : `AI models you can run on ${appleMac(p.gb)}`;

/**
 * The finder answers this page stands for: runs on my computer, the memory
 * amount, and (for Apple silicon) macOS on Apple silicon graphics. Comfort is
 * set to "writing code" so setup effort never hides a configuration; each
 * entry still shows its setup level.
 */
export function memoryPageInput(p: MemoryPage, task: FinderTask | "" = ""): FinderInput {
  return p.kind === "vram"
    ? { ...DEFAULT_INPUT, task, where: "local", gpuGb: p.gb, skill: "advanced" }
    : { ...DEFAULT_INPUT, task, where: "local", os: "macos", gpu: "apple-silicon", ramGb: p.gb, skill: "advanced" };
}

/** The finder, pre-filled with this page's hardware (and a task, when given). */
export const finderHref = (p: MemoryPage, task: FinderTask | "" = "") => `/find/?${serializeInput(memoryPageInput(p, task))}`;

/**
 * Whether the publisher's figure is within the amount, by the finder's own
 * memoryVerdict. A USASI test record short-circuits that verdict to "tested"
 * for any input, so a tested configuration is judged by its publisher's figure
 * like every other one rather than appearing on every page.
 */
function figureFits(c: FinderConfig, input: FinderInput): boolean {
  const v = memoryVerdict(c, input);
  if (v.kind === "fits") return true;
  return v.kind === "tested" && memoryVerdict({ ...c, tested: null }, input).kind === "fits";
}

export type MemoryEntry = Assessment & {
  /** The publisher's figure in GB and what it measures. */
  figure: { gb: number; unit: "graphics memory" | "memory" };
};

export type MemoryPageResults = {
  page: MemoryPage;
  /** Every requirement met and the publisher's figure within the amount: the list itself. */
  fits: MemoryEntry[];
  /** Would match, but the publisher's figure is higher than this amount. */
  needsMore: MemoryEntry[];
  /** Would match, but the publisher states system memory, which the finder never compares with graphics memory. */
  systemFigure: MemoryEntry[];
  /** Would match, but no publisher memory figure is recorded, so fit is not established. */
  noFigure: Assessment[];
};

const withFigure = (a: Assessment): MemoryEntry => {
  const m = a.config.memory!;
  return { ...a, figure: m.gpu_gb !== null ? { gb: m.gpu_gb, unit: "graphics memory" } : { gb: m.system_gb!, unit: "memory" } };
};
const byFigure = (a: MemoryEntry, b: MemoryEntry) => a.figure.gb - b.figure.gb || a.config.title.localeCompare(b.config.title);

export function memoryPageResults(configs: FinderConfig[], p: MemoryPage): MemoryPageResults {
  const input = memoryPageInput(p);
  const fits: MemoryEntry[] = [];
  const needsMore: MemoryEntry[] = [];
  const systemFigure: MemoryEntry[] = [];
  const noFigure: Assessment[] = [];
  for (const c of configs) {
    const a = assess(c, input);
    if (a.fit === "match" && figureFits(c, input)) fits.push(withFigure(a));
    else if (a.memory.kind === "too-small" && a.blockers.length === 1) needsMore.push(withFigure(a));
    else if (a.fit === "match" && a.memory.kind === "no-input") systemFigure.push(withFigure(a));
    else if (a.fit === "match" && a.memory.kind === "insufficient") noFigure.push(a);
  }
  noFigure.sort((a, b) => a.config.title.localeCompare(b.config.title));
  return { page: p, fits: fits.sort(byFigure), needsMore: needsMore.sort(byFigure), systemFigure: systemFigure.sort(byFigure), noFigure };
}

/** Fewest listed configurations before a memory page is offered to search engines. */
export const MIN_INDEXABLE_FITS = 3;

/**
 * Whether a memory page should be indexed. A page that lists fewer than
 * MIN_INDEXABLE_FITS configurations, or exactly the same ones as the next
 * smaller amount of the same kind, would only duplicate another result, so it
 * stays reachable (index page, finder links) but is marked noindex and left
 * out of the sitemap until more finder records state a memory figure.
 */
export function memoryPageIndexable(configs: FinderConfig[], p: MemoryPage): boolean {
  const fits = memoryPageResults(configs, p).fits;
  if (fits.length < MIN_INDEXABLE_FITS) return false;
  const smaller = MEMORY_PAGES.filter((q) => q.kind === p.kind && q.gb < p.gb).sort((x, y) => y.gb - x.gb)[0];
  if (!smaller) return true;
  const key = (list: MemoryEntry[]) => list.map((e) => e.config.slug).sort().join("|");
  return key(memoryPageResults(configs, smaller).fits) !== key(fits);
}

const gbText = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1).replace(/\.0$/, "")} GB`;
export const figureText = (e: MemoryEntry) => `about ${gbText(e.figure.gb)} of ${e.figure.unit}`;

function listText(items: string[]) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** One or two quotable sentences that answer the page's question from the data alone. */
export function memoryPageAnswer(r: MemoryPageResults): string {
  const p = r.page;
  const where = p.kind === "vram" ? `With ${p.gb} GB of graphics memory (VRAM)` : `With ${p.gb} GB of unified memory on an Apple silicon Mac`;
  const n = r.fits.length;
  if (n === 0) return `${where}, none of the documented local configurations in this catalog fits by its publisher's own memory figure yet.`;
  // "LM Studio with Gemma 4 12B (QAT Q4_0 GGUF)" → "LM Studio with Gemma 4 12B, QAT Q4_0 GGUF (about 6.7 GB)".
  const shown = r.fits.slice(0, 3).map((e) => `${e.config.title.replace(/\s*\(([^)]+)\)\s*$/, ", $1")} (about ${gbText(e.figure.gb)})`);
  const more = n > 3 ? `, including ${listText(shown)}` : `: ${listText(shown)}`;
  const tested = r.fits.filter((e) => e.config.tested).length;
  const caveat =
    tested === 0
      ? "These are estimates from each publisher's documentation; USASI has not tested them."
      : `${tested} of them ${tested === 1 ? "was" : "were"} tested by USASI; the rest are estimates from each publisher's documentation.`;
  return `${where}, you can run ${n} documented local ${n === 1 ? "configuration" : "configurations"} in this catalog by ${n === 1 ? "its publisher's" : "their publishers'"} own memory figures${more}. ${caveat}`;
}

export const PLATFORM_LABELS: Record<string, string> = { windows: "Windows", macos: "macOS", linux: "Linux", web: "Web browser", ios: "iOS", android: "Android" };
export const ACCELERATOR_LABELS: Record<string, string> = {
  nvidia: "NVIDIA",
  amd: "AMD",
  "apple-silicon": "Apple silicon",
  intel: "Intel",
  "cpu-only": "Processor only",
};
