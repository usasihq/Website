/**
 * Inclusion rules and record mapping for AI on Hugging Face. Pure functions,
 * shared by the refresh script, validation, and tests. Each rule is a
 * transparent test on the item's own id and Hub tags; a small reviewed
 * denylist (data/huggingface/denylist.yml) covers what the rules miss, with a
 * reason per entry.
 */
import { assignSlugs as assignGithubSlugs, baseSlug as githubBaseSlug } from "../github/filters";
import { BASE_RELATIONS, HF_ID_RE, type BaseRelation, type HfDataset, type HfDenylistEntry, type HfKind, type HfModel } from "./schema";

/**
 * An item as the refresh keeps it from GET /api/models or /api/datasets
 * (with expand[]), already stripped to the fields the rules and records read.
 */
export type RawHfItem = {
  id: string;
  author?: string | null;
  likes?: number;
  downloads?: number;
  tags?: string[];
  pipeline_tag?: string | null;
  library_name?: string | null;
  gated?: boolean | string | null;
  createdAt?: string;
  lastModified?: string;
  private?: boolean;
  disabled?: boolean;
  /** safetensors.total, when the API gives it. */
  params?: number | null;
  card?: { license?: unknown; license_name?: unknown; language?: unknown; base_model?: unknown; task_categories?: unknown };
  description?: string | null;
};

/** Keep only what the rules and records read from a raw API item (drops gating prompts, configs, and other prose). */
export function stripRaw(item: Record<string, unknown>): RawHfItem {
  const card = (item.cardData ?? {}) as Record<string, unknown>;
  const st = item.safetensors as { total?: unknown } | undefined;
  return {
    id: String(item.id ?? ""),
    author: typeof item.author === "string" ? item.author : null,
    likes: typeof item.likes === "number" ? item.likes : 0,
    downloads: typeof item.downloads === "number" ? item.downloads : 0,
    tags: Array.isArray(item.tags) ? item.tags.filter((t): t is string => typeof t === "string").slice(0, 200) : [],
    pipeline_tag: typeof item.pipeline_tag === "string" ? item.pipeline_tag : null,
    library_name: typeof item.library_name === "string" ? item.library_name : null,
    gated: typeof item.gated === "string" || typeof item.gated === "boolean" ? item.gated : false,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    lastModified: typeof item.lastModified === "string" ? item.lastModified : undefined,
    private: item.private === true,
    disabled: item.disabled === true,
    params: st && typeof st.total === "number" && Number.isFinite(st.total) && st.total > 0 ? Math.round(st.total) : null,
    card: { license: card.license, license_name: card.license_name, language: card.language, base_model: card.base_model, task_categories: card.task_categories },
    description: typeof item.description === "string" ? item.description.slice(0, 2000) : null,
  };
}

export const HF_EXCLUSION_REASONS = {
  unavailable: "Private, disabled, or removed on the Hub",
  nsfw: "Tagged not-for-all-audiences, or explicit content",
  deepfake: "Deepfake, face-swap, or undressing tool",
  "safety-removed": "Safety training removed (“uncensored” or “abliterated” fine-tunes)",
  jailbreak: "Jailbreak or leaked-prompt collection",
  "personal-data": "Scraped personal data",
  spam: "Spam or duplicate upload",
  other: "Excluded on review (see denylist note)",
} as const;
export type HfExclusionReason = keyof typeof HF_EXCLUSION_REASONS;

const lower = (s: string | null | undefined) => (s ?? "").toLowerCase();

const NSFW_TAGS = new Set(["not-for-all-audiences", "nsfw", "porn", "hentai", "explicit", "adult", "erotic", "lewd"]);
const NSFW_NAME = /(^|[^a-z])(nsfw|porn|hentai|erotic|erotica|lewd|r18|nude|nudes|xxx|deepsex|sex)([^a-z]|$)/;
/** A classifier that detects explicit content is a safety tool, even when its author tags it not-for-all-audiences. */
const NSFW_DETECTOR = /detect|classif|filter|moderat|safety|checker/;
const CLASSIFIER_TASKS = new Set(["image-classification", "text-classification", "zero-shot-image-classification", "zero-shot-classification", "object-detection"]);
const DEEPFAKE = /deep[-_ ]?fakes?|deep[-_ ]?nude|face[-_ ]?swap|faceswap|face[-_ ]?fusion|faceswapper|(?:^|[^a-z])roop(?:[^a-z]|$)|inswapper|reactor[-_]faceswap|undress|nudify|cloth(es|ing)?[-_ ]?remov|remove[-_ ]?cloth/;
const DEEPFAKE_DETECT = /detect|detector|detection|classif|forensic|benchmark|eval/;
const SAFETY_REMOVED = /uncensor|abliterat|obliterat|lorablat|de-?censor|decensor|no[-_]?refusal|norefusal|refusal[-_]?(removed|ablat|direction)|jailbroken|unaligned|heretic/;
const JAILBREAK = /jailbreak|jail[-_]break|leaked[-_ ]?prompts?|system[-_]?prompts?[-_]?leak|prompt[-_]?leak|dan[-_]prompts?/;
/** Names that say the item exists to detect, classify, guard against, or benchmark jailbreaks. */
const JAILBREAK_DEFENSIVE = /classif|detect|guard|defen[cs]e|bench|eval/;
/** Tags a dataset author uses for safety-training data built from jailbreak attempts paired with refusals. */
const SAFETY_TRAINING_TAGS = new Set(["safety training", "safety-training", "safety-alignment", "refusal-training"]);

/**
 * Ordered rules. The first that matches gives the reason. Rules read the
 * item's id and its own tags; tags that name other repositories
 * ("dataset:", "source_datasets:", "base_model:") are ignored, except that a
 * model built on a safety-removed base model counts as safety-removed too.
 */
export function hfExclusionReason(kind: HfKind, item: RawHfItem, denylist: Map<string, HfDenylistEntry> = new Map()): HfExclusionReason | null {
  if (item.private || item.disabled) return "unavailable";
  const denied = denylist.get(`${kind}:${lower(item.id)}`);
  if (denied) return denied.reason;
  const id = lower(item.id);
  const all = (item.tags ?? []).map(lower);
  const tags = all.filter((t) => !/^(dataset|source_datasets|base_model|arxiv|doi|region|deploy|license):/.test(t));
  const bases = all.filter((t) => t.startsWith("base_model:")).map((t) => t.replace(/^base_model:(?:[a-z]+:)?/, ""));
  const words = [id, ...tags].join(" ");
  if (tags.some((t) => NSFW_TAGS.has(t)) || NSFW_NAME.test(id)) {
    const detector = kind === "model" && NSFW_DETECTOR.test(id) && (CLASSIFIER_TASKS.has(lower(item.pipeline_tag)) || tags.some((t) => CLASSIFIER_TASKS.has(t)));
    if (!detector) return "nsfw";
  }
  if (DEEPFAKE.test(words) && !DEEPFAKE_DETECT.test(id)) return "deepfake";
  if (SAFETY_REMOVED.test(words) || bases.some((b) => SAFETY_REMOVED.test(b))) return "safety-removed";
  // Jailbreak and leaked-prompt collections go. Models and datasets for detecting, classifying,
  // guarding against, or benchmarking jailbreaks stay, and so does safety-training data.
  if (JAILBREAK.test(id) || tags.some((t) => JAILBREAK.test(t))) {
    const defensive =
      JAILBREAK_DEFENSIVE.test(id) || (kind === "model" && tags.some((t) => /classif|detect|guard/.test(t))) || (kind === "dataset" && tags.some((t) => SAFETY_TRAINING_TAGS.has(t)));
    if (!defensive) return "jailbreak";
  }
  return null;
}

const TAG_RE = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,79}$/;
const tagOk = (t: unknown): t is string => typeof t === "string" && TAG_RE.test(t);
const iso = (s: string | undefined) => new Date(s ?? 0).toISOString().replace(/\.\d{3}Z$/, "Z");

/** License from the license:* tag, else the card's license field. */
export function licenseOf(item: RawHfItem): { license: string | null; license_name: string | null } {
  const fromTag = (item.tags ?? []).find((t) => t.startsWith("license:"))?.slice(8) ?? null;
  const card = item.card?.license;
  const raw = fromTag ?? (typeof card === "string" ? card : Array.isArray(card) && typeof card[0] === "string" ? card[0] : null);
  const license = raw && tagOk(raw.toLowerCase()) ? raw.toLowerCase() : null;
  const nameRaw = item.card?.license_name;
  const license_name = license === "other" && typeof nameRaw === "string" && tagOk(nameRaw.trim().toLowerCase()) ? nameRaw.trim().toLowerCase() : null;
  return { license, license_name };
}

/**
 * Language codes: the card's language list, else bare 2–3 letter tags
 * ("en") and "language:xx" tags the Hub adds to datasets.
 */
export function languagesOf(item: RawHfItem): string[] {
  const card = item.card?.language;
  const fromCard = (Array.isArray(card) ? card : typeof card === "string" ? [card] : []).filter((l): l is string => typeof l === "string");
  const fromTags = (item.tags ?? []).flatMap((t) => (t.startsWith("language:") ? [t.slice(9)] : /^[a-z]{2,3}$/.test(t) ? [t] : []));
  const out = new Set<string>();
  for (const l of fromCard.length ? fromCard : fromTags) {
    const v = l.trim().toLowerCase();
    if (/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(v) && v !== "code" && v !== "multilingual") out.add(v);
    else if (v === "multilingual") out.add("multilingual");
  }
  return [...out].slice(0, 30);
}

/**
 * Base models from the Hub's base_model tags. "base_model:<rel>:<id>" names
 * the relation (quantized, finetune, adapter, merge); a bare
 * "base_model:<id>" without a relation is kept as "base".
 */
export function baseModelsOf(item: RawHfItem): { id: string; relation: BaseRelation }[] {
  const out = new Map<string, BaseRelation>();
  const bare: string[] = [];
  for (const t of item.tags ?? []) {
    if (!t.startsWith("base_model:")) continue;
    const rest = t.slice(11);
    const m = rest.match(/^(quantized|finetune|adapter|merge):(.+)$/);
    if (m) {
      if (HF_ID_RE.test(m[2]) && lower(m[2]) !== lower(item.id)) out.set(m[2], m[1] as BaseRelation);
    } else if (HF_ID_RE.test(rest) && lower(rest) !== lower(item.id)) bare.push(rest);
  }
  for (const b of bare) if (![...out.keys()].some((k) => lower(k) === lower(b))) out.set(b, "base");
  return [...out]
    .map(([id, relation]) => ({ id, relation }))
    .sort((a, b) => BASE_RELATIONS.indexOf(a.relation) - BASE_RELATIONS.indexOf(b.relation) || a.id.localeCompare(b.id))
    .slice(0, 12);
}

export const isQuantized = (m: Pick<HfModel, "base_models">) => m.base_models.some((b) => b.relation === "quantized");

function gatedOf(g: RawHfItem["gated"]): HfModel["gated"] {
  if (g === "manual") return "manual";
  if (g === true || g === "auto" || g === "true") return "auto";
  return false;
}

/**
 * The API's dataset description is an excerpt of the card, one heading or
 * paragraph per line. Drop the leading heading lines ("Dataset Card for …",
 * "Dataset Summary", other short title lines), links, and the trailing "See the
 * full description" pointer; cut on a word boundary.
 */
export function cleanHfDescription(raw: string | null | undefined, max = 280): string {
  let text = (raw ?? "").replace(/\r/g, "");
  const truncated = /See the full description on the dataset page:\s*\S+\s*$/i.test(text);
  text = text.replace(/\s*(?:…|\.\.\.)?\s*See the full description on the dataset page:\s*\S+\s*$/i, "");
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const HEADING = /^(?:Dataset (?:Summary|Description|Details|Overview|Card)|Overview|Summary|Introduction|About|Description|TL;?DR|Abstract|Notice)\s*:?$/i;
  while (lines.length > 1 && (/^\W{0,3}Dataset Card for\b/i.test(lines[0]) || HEADING.test(lines[0].replace(/^\W+/u, "")) || (lines[0].length <= 40 && !/[.!?]$/.test(lines[0]) && lines[0].split(" ").length <= 5))) lines.shift();
  let s = lines
    .join(" ")
    .replace(/[<>]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    // Contact details in a card are not ours to republish.
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (truncated && s && !/[…]$/.test(s)) s = `${s.replace(/[\s,.;:–—-]+$/, "")}…`;
  if (s.length > max) {
    const cut = s.slice(0, max - 1);
    const space = cut.lastIndexOf(" ");
    s = `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
  }
  return s;
}

function common(item: RawHfItem, authorType: "org" | "user" | null) {
  const [author, name] = item.id.split("/");
  return {
    id: item.id,
    author,
    author_type: authorType,
    name,
    likes: Math.max(0, Math.round(item.likes ?? 0)),
    downloads_30d: Math.max(0, Math.round(item.downloads ?? 0)),
    ...licenseOf(item),
    languages: languagesOf(item),
    gated: gatedOf(item.gated),
    created_at: iso(item.createdAt ?? item.lastModified),
    last_modified: iso(item.lastModified ?? item.createdAt),
  };
}

export function toHfModel(item: RawHfItem, authorType: "org" | "user" | null): HfModel {
  return {
    ...common(item, authorType),
    pipeline_tag: tagOk(item.pipeline_tag) ? item.pipeline_tag : null,
    library_name: tagOk(item.library_name) ? item.library_name : null,
    base_models: baseModelsOf(item),
    params: item.params && item.params > 0 ? item.params : null,
  };
}

export function toHfDataset(item: RawHfItem, authorType: "org" | "user" | null): HfDataset {
  const tags = item.tags ?? [];
  const pick = (prefix: string, max: number) => [...new Set(tags.filter((t) => t.startsWith(prefix)).map((t) => t.slice(prefix.length)).filter(tagOk))].slice(0, max);
  const size = tags.find((t) => t.startsWith("size_categories:"))?.slice(16) ?? null;
  return {
    ...common(item, authorType),
    task_categories: pick("task_categories:", 12),
    modalities: pick("modality:", 8),
    size_category: size && /^[0-9A-Za-z<>.]{1,30}$/.test(size) ? size : null,
    description: cleanHfDescription(item.description),
  };
}

export function compareHf(a: { likes: number; id: string }, b: { likes: number; id: string }): number {
  return b.likes - a.likes || a.id.localeCompare(b.id);
}

/** author--name, lowercase, [a-z0-9-] only; "--" appears only as the separator (same scheme as AI on GitHub). */
export const hfBaseSlug = (id: string) => githubBaseSlug(id);

/** Slugs for a ranked list; a collision (e.g. Foo.1 vs foo-1) gets -2, -3 … in rank order. */
export const assignHfSlugs = (items: readonly { id: string }[]) => assignGithubSlugs(items.map((i) => ({ full_name: i.id })));

/** "author/name" for a Hub URL of a model or dataset (huggingface.co/<a>/<n>, /datasets/<a>/<n>, /api/models|datasets/<a>/<n>). */
export function hfUrlKey(url: string): { kind: HfKind; id: string } | null {
  const m = url.match(/^https?:\/\/(?:www\.)?huggingface\.co\/(?:(api)\/)?(?:(datasets|models|spaces)\/)?([A-Za-z0-9][A-Za-z0-9._-]*)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/?#].*)?$/);
  if (!m) return null;
  const [, api, section, author, name] = m;
  if (section === "spaces") return null;
  if (!section && api) return null; // /api/<other>
  const RESERVED = new Set(["api", "datasets", "spaces", "collections", "docs", "blog", "papers", "organizations", "models", "settings", "join", "login", "pricing", "learn", "tasks", "chat", "posts", "enterprise", "new", "search", "inference-endpoints", "changelog", "terms-of-service", "privacy", "spaces-dev", "storage", "buckets", "kernels"]);
  if (!section && RESERVED.has(author.toLowerCase())) return null;
  const id = `${author}/${name}`;
  if (!HF_ID_RE.test(id)) return null;
  return { kind: section === "datasets" ? "dataset" : "model", id };
}
