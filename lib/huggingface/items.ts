/**
 * AI on Hugging Face: ranked entries, pages, hero cards, cross-links to the
 * USASI catalog and AI on GitHub, search and sitemap entries, and JSON-LD.
 * Server/build only (reads data/huggingface/*.json through ./load).
 */
import type { Catalog } from "../catalog";
import { formatDate } from "../dates";
import { githubEntries } from "../github/projects";
import { absoluteUrl } from "../paths";
import { artifactHref } from "../routes";
import type { SearchEntry } from "../search";
import type { JsonLdNode } from "../structured-data";
import { SCHEMA_CONTEXT } from "../structured-data";
import { AUTHOR_TYPE_LABELS, formatParams, hfLicenseLabel, taskLabel, type HfListItem } from "./directory";
import { assignHfSlugs, hfUrlKey, isQuantized } from "./filters";
import { hfHeroAlt, type HfHero } from "./hero";
import { readHfDatasets, readHfModels } from "./load";
import type { HfDataset, HfDatasetSnapshot, HfKind, HfModel, HfModelSnapshot } from "./schema";

export const HF_INDEX = "/huggingface/";
export const HF_DATASETS_INDEX = "/huggingface/datasets/";
/** Items per page on the indexes and their /page/<n>/ ranking pages. */
export const HF_PAGE_SIZE = 100;

type Extra = { rank: number; slug: string; href: string; image: string };
export type HfModelEntry = HfModel & Extra & { kind: "model" };
export type HfDatasetEntry = HfDataset & Extra & { kind: "dataset" };
export type HfEntry = HfModelEntry | HfDatasetEntry;

export const hfIndexOf = (kind: HfKind) => (kind === "model" ? HF_INDEX : HF_DATASETS_INDEX);
export const hfHref = (kind: HfKind, slug: string) => `${hfIndexOf(kind)}${slug}/`;
export const hfPageHref = (kind: HfKind, n: number) => (n <= 1 ? hfIndexOf(kind) : `${hfIndexOf(kind)}page/${n}/`);
export const hfHubUrl = (kind: HfKind, id: string) => `https://huggingface.co/${kind === "dataset" ? "datasets/" : ""}${id}`;
const imageOf = (kind: HfKind, slug: string) => `/og/huggingface/${kind === "dataset" ? "datasets/" : ""}${slug}.jpg`;

const modelCache = new WeakMap<HfModelSnapshot, HfModelEntry[]>();
const datasetCache = new WeakMap<HfDatasetSnapshot, HfDatasetEntry[]>();

export function hfModelEntries(data: HfModelSnapshot = readHfModels()): HfModelEntry[] {
  const hit = modelCache.get(data);
  if (hit) return hit;
  const slugs = assignHfSlugs(data.items);
  const out = data.items.map((m, i) => ({ ...m, kind: "model" as const, rank: i + 1, slug: slugs[i], href: hfHref("model", slugs[i]), image: imageOf("model", slugs[i]) }));
  modelCache.set(data, out);
  return out;
}

export function hfDatasetEntries(data: HfDatasetSnapshot = readHfDatasets()): HfDatasetEntry[] {
  const hit = datasetCache.get(data);
  if (hit) return hit;
  const slugs = assignHfSlugs(data.items);
  const out = data.items.map((d, i) => ({ ...d, kind: "dataset" as const, rank: i + 1, slug: slugs[i], href: hfHref("dataset", slugs[i]), image: imageOf("dataset", slugs[i]) }));
  datasetCache.set(data, out);
  return out;
}

export function hfEntries(kind: HfKind): HfEntry[] {
  return kind === "model" ? hfModelEntries() : hfDatasetEntries();
}

const bySlug = new Map<HfKind, Map<string, HfEntry>>();
const byId = new Map<HfKind, Map<string, HfEntry>>();
function index(kind: HfKind) {
  if (!bySlug.has(kind)) {
    const all = hfEntries(kind);
    bySlug.set(kind, new Map(all.map((e) => [e.slug, e])));
    byId.set(kind, new Map(all.map((e) => [e.id.toLowerCase(), e])));
  }
  return { slug: bySlug.get(kind)!, id: byId.get(kind)! };
}

export function hfModelEntry(slug: string): HfModelEntry | undefined {
  return index("model").slug.get(slug) as HfModelEntry | undefined;
}
export function hfDatasetEntry(slug: string): HfDatasetEntry | undefined {
  return index("dataset").slug.get(slug) as HfDatasetEntry | undefined;
}
/** A listed item by Hub id (case-insensitive). */
export function hfEntryById(kind: HfKind, id: string): HfEntry | undefined {
  return index(kind).id.get(id.toLowerCase());
}

export function hfPageCount(kind: HfKind): number {
  return Math.max(1, Math.ceil(hfEntries(kind).length / HF_PAGE_SIZE));
}

export function hfPageEntries(kind: HfKind, n: number): HfEntry[] {
  return hfEntries(kind).slice((n - 1) * HF_PAGE_SIZE, n * HF_PAGE_SIZE);
}

/** The fetch date as shown on pages, e.g. "October 18, 2026". */
export function hfFetchedLabel(): string {
  return formatDate(readHfModels().fetched_at.slice(0, 10));
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export const quantizedBase = (e: Pick<HfModel, "base_models">) => e.base_models.find((b) => b.relation === "quantized")?.id ?? null;

export function toHfListItem(e: HfEntry): HfListItem {
  const model = e.kind === "model";
  return {
    kind: e.kind,
    slug: e.slug,
    rank: e.rank,
    id: e.id,
    author: e.author,
    authorType: e.author_type,
    name: e.name,
    likes: e.likes,
    downloads: e.downloads_30d,
    task: model ? e.pipeline_tag : (e.task_categories[0] ?? null),
    tasks: model ? (e.pipeline_tag ? [e.pipeline_tag] : []) : e.task_categories,
    library: model ? e.library_name : null,
    license: e.license ?? "none",
    licenseName: e.license_name,
    gated: e.gated !== false,
    quantizedFrom: model ? quantizedBase(e) : null,
    params: model ? e.params : null,
    modalities: model ? [] : e.modalities,
    // Rows clamp to two lines, so the list carries a shorter copy.
    description: model ? "" : clip(e.description, 170),
    modified: e.last_modified.slice(0, 10),
  };
}

/* ---- Cross-links ---- */

const catalogCache = new WeakMap<Catalog, Map<string, { slug: string; name: string }>>();

/**
 * Catalog artifacts by the Hub model or dataset they link to ("model:<id>" /
 * "dataset:<id>", lowercase). A record's own links win over its cited sources.
 */
export function catalogHfIndex(catalog: Catalog): Map<string, { slug: string; name: string }> {
  const hit = catalogCache.get(catalog);
  if (hit) return hit;
  const strong = new Map<string, { slug: string; name: string }>();
  const weak = new Map<string, { slug: string; name: string }>();
  for (const a of catalog.artifacts) {
    for (const [urls, target] of [
      [a.links.map((l) => l.url), strong],
      [a.sources.map((s) => s.url), weak],
    ] as const) {
      for (const url of urls) {
        const key = hfUrlKey(url);
        if (!key) continue;
        const k = `${key.kind}:${key.id.toLowerCase()}`;
        if (!target.has(k)) target.set(k, { slug: a.slug, name: a.name });
      }
    }
  }
  const out = new Map(weak);
  for (const [k, v] of strong) out.set(k, v);
  catalogCache.set(catalog, out);
  return out;
}

export function hfCatalogMatch(catalog: Catalog, e: Pick<HfEntry, "kind" | "id">): { slug: string; name: string; href: string } | null {
  const hit = catalogHfIndex(catalog).get(`${e.kind}:${e.id.toLowerCase()}`);
  return hit ? { ...hit, href: artifactHref(hit.slug) } : null;
}

/** Listed Hugging Face items that a catalog artifact links to, models first, by likes. */
export function hfItemsForArtifact(catalog: Catalog, artifactSlug: string): HfEntry[] {
  const out: HfEntry[] = [];
  for (const [k, v] of catalogHfIndex(catalog)) {
    if (v.slug !== artifactSlug) continue;
    const [kind, id] = [k.slice(0, k.indexOf(":")) as HfKind, k.slice(k.indexOf(":") + 1)];
    const e = hfEntryById(kind, id);
    if (e) out.push(e);
  }
  return out.sort((a, b) => (a.kind === b.kind ? b.likes - a.likes : a.kind === "model" ? -1 : 1));
}

let githubIndex: Map<string, { href: string; fullName: string }> | undefined;
/** The AI on GitHub page for the same owner/repo, if that section lists it. */
export function hfGithubMatch(id: string): { href: string; fullName: string } | null {
  githubIndex ??= new Map(githubEntries().map((g) => [g.full_name.toLowerCase(), { href: g.href, fullName: g.full_name }]));
  return githubIndex.get(id.toLowerCase()) ?? null;
}

/** For an AI on GitHub project: the listed Hugging Face model (or dataset) with the same owner/name. */
export function hfForGithub(fullName: string): HfEntry | null {
  return hfEntryById("model", fullName) ?? hfEntryById("dataset", fullName) ?? null;
}

/** Listed models built on this one (quantized, fine-tuned, adapters, merges), by likes. */
export function derivedModels(e: HfModelEntry, n = 12): { entry: HfModelEntry; relation: string }[] {
  const id = e.id.toLowerCase();
  const out: { entry: HfModelEntry; relation: string }[] = [];
  for (const m of hfModelEntries()) {
    const b = m.base_models.find((x) => x.id.toLowerCase() === id);
    if (b) out.push({ entry: m, relation: b.relation });
  }
  return out.slice(0, n);
}

/** Up to `n` other listed items from the same author, by rank. */
export function sameAuthor(e: HfEntry, n = 6): HfEntry[] {
  return hfEntries(e.kind)
    .filter((x) => x.author === e.author && x.slug !== e.slug)
    .slice(0, n);
}

export const RELATION_LABELS: Record<string, string> = {
  quantized: "Quantized version of",
  finetune: "Fine-tuned from",
  adapter: "Adapter for",
  merge: "Merged from",
  base: "Based on",
};

/* ---- Heroes ---- */

function heroFacts(e: HfEntry): [string, string][] {
  const task = e.kind === "model" ? e.pipeline_tag : (e.task_categories[0] ?? null);
  return [
    ["Task", task ? taskLabel(task) : e.kind === "model" ? "Not given" : "Not given"],
    ["License", hfLicenseLabel(e.license ?? "none", e.license_name)],
  ];
}

/**
 * The hero shows only fields that rarely change (kind, name, author, task,
 * license), never rank, likes, downloads, or dates, so a weekly refresh
 * re-renders only new or changed items. The page shows the current counts.
 */
export function hfItemHero(e: HfEntry): HfHero {
  const base = {
    page: e.href,
    image: e.image,
    template: "item" as const,
    kind: e.kind === "model" ? ("Model" as const) : ("Dataset" as const),
    seed: `${e.kind}:${e.id}`,
    author: e.author,
    title: e.name,
    subtitle: null,
    facts: heroFacts(e),
  };
  return { ...base, alt: hfHeroAlt(base) };
}

/** The /huggingface/ card: no counts or dates, so it never needs rendering again. */
export function hfSectionHero(): HfHero {
  const base = {
    page: HF_INDEX,
    image: "/og/huggingface/index.jpg",
    template: "section" as const,
    kind: null,
    seed: "usasi/ai-on-hugging-face",
    author: "USASI",
    title: "AI on Hugging Face",
    subtitle: "The most-liked open models and datasets on the Hugging Face Hub, ranked by likes, each with its own page.",
    facts: [
      ["Ranked by", "Likes on the Hub"],
      ["Data", "Hugging Face Hub API"],
    ] as [string, string][],
  };
  return { ...base, alt: hfHeroAlt(base) };
}

export function hfHeroes(): HfHero[] {
  return [hfSectionHero(), ...hfModelEntries().map(hfItemHero), ...hfDatasetEntries().map(hfItemHero)];
}

/* ---- Search and sitemap ---- */

/**
 * Site search covers the 1,000 most-liked items (models and datasets
 * together), so the shared search index stays small; /huggingface/ searches
 * and filters every item. (The index pages are in SITE_PAGES.)
 */
export const HF_SEARCH_LIMIT = 1000;

export function hfSearchEntries(): SearchEntry[] {
  const all: HfEntry[] = [...hfModelEntries(), ...hfDatasetEntries()].sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id));
  return all.slice(0, HF_SEARCH_LIMIT).map((e) => {
    const task = e.kind === "model" ? e.pipeline_tag : e.task_categories[0];
    const what = e.kind === "model" ? "Model" : "Dataset";
    return {
      type: "huggingface-item" as const,
      slug: `${e.kind}-${e.slug}`,
      href: e.href,
      name: e.id,
      summary: e.kind === "dataset" && e.description ? clip(e.description, 110) : `${what} on Hugging Face${task ? `: ${taskLabel(task).toLowerCase()}` : ""}, by ${e.author}`,
      keywords: [e.name.replace(/[-_.]/g, " "), what.toLowerCase(), "hugging face", task ?? "", e.kind === "model" ? (e.library_name ?? "") : ""].join(" "),
    };
  });
}

export function hfSitemap(): { path: string; lastModified: string }[] {
  const day = readHfModels().fetched_at.slice(0, 10);
  const pages = (kind: HfKind) => Array.from({ length: hfPageCount(kind) - 1 }, (_, i) => ({ path: hfPageHref(kind, i + 2), lastModified: day }));
  return [
    { path: HF_DATASETS_INDEX, lastModified: day },
    ...pages("model"),
    ...pages("dataset"),
    ...hfModelEntries().map((e) => ({ path: e.href, lastModified: day })),
    ...hfDatasetEntries().map((e) => ({ path: e.href, lastModified: day })),
  ];
}

/* ---- JSON-LD ---- */

/** Hub license tags that name one SPDX license exactly. */
const SPDX: Record<string, string> = {
  "apache-2.0": "Apache-2.0",
  mit: "MIT",
  "bsd-3-clause": "BSD-3-Clause",
  "bsd-2-clause": "BSD-2-Clause",
  "mpl-2.0": "MPL-2.0",
  "cc0-1.0": "CC0-1.0",
  "cc-by-4.0": "CC-BY-4.0",
  "cc-by-sa-4.0": "CC-BY-SA-4.0",
  "cc-by-nc-4.0": "CC-BY-NC-4.0",
  "cc-by-nc-sa-4.0": "CC-BY-NC-SA-4.0",
  "cc-by-nc-nd-4.0": "CC-BY-NC-ND-4.0",
  "cc-by-3.0": "CC-BY-3.0",
  "odc-by": "ODC-By-1.0",
  odbl: "ODbL-1.0",
  pddl: "PDDL-1.0",
  "artistic-2.0": "Artistic-2.0",
  unlicense: "Unlicense",
};
export const spdxUrl = (license: string | null) => (license && SPDX[license] ? `https://spdx.org/licenses/${SPDX[license]}.html` : undefined);

export function hfItemLd(e: HfEntry): JsonLdNode {
  const page = absoluteUrl(e.href);
  const license = spdxUrl(e.license);
  const author = e.author_type ? { "@type": e.author_type === "org" ? "Organization" : "Person", name: e.author, url: `https://huggingface.co/${e.author}` } : undefined;
  const common = {
    "@context": SCHEMA_CONTEXT,
    name: e.name,
    mainEntityOfPage: page,
    url: hfHubUrl(e.kind, e.id),
    ...(license ? { license } : {}),
    dateCreated: e.created_at.slice(0, 10),
    dateModified: e.last_modified.slice(0, 10),
    ...(author ? { creator: author } : {}),
    ...(e.languages.length && !e.languages.includes("multilingual") ? { inLanguage: e.languages.slice(0, 12) } : {}),
    ...(e.gated !== false ? { conditionsOfAccess: "Access requires accepting terms on Hugging Face" } : {}),
    image: absoluteUrl(e.image),
  };
  if (e.kind === "model") {
    return {
      ...common,
      "@type": "SoftwareSourceCode",
      "@id": `${page}#model`,
      codeRepository: hfHubUrl("model", e.id),
      ...(e.pipeline_tag ? { keywords: [taskLabel(e.pipeline_tag), e.library_name].filter(Boolean).join(", ") } : {}),
      ...(e.base_models.length ? { isBasedOn: e.base_models.map((b) => hfHubUrl("model", b.id)) } : {}),
    };
  }
  return {
    ...common,
    "@type": "Dataset",
    "@id": `${page}#dataset`,
    // Search engines expect a dataset description; without a usable excerpt, a factual line from the Hub fields.
    description:
      e.description.length >= 50
        ? e.description
        : `${e.id}: a dataset on the Hugging Face Hub${e.task_categories.length ? ` for ${e.task_categories.slice(0, 3).map((t) => taskLabel(t).toLowerCase()).join(", ")}` : ""}, published by ${e.author}.`,
    ...(e.task_categories.length ? { keywords: e.task_categories.map(taskLabel).join(", ") } : {}),
  };
}

export { AUTHOR_TYPE_LABELS, formatParams, hfLicenseLabel, isQuantized, taskLabel };
