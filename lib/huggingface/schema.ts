/**
 * AI on Hugging Face (/huggingface/): the most-liked models and datasets on
 * the Hugging Face Hub, from its public API. Only factual repository fields
 * are stored; the one piece of prose is a dataset's short description, which
 * is third-party text rendered as plain text only.
 */
import { z } from "../zod";

/** Hub user, organization, and repository names: letters, digits, '-', '_', '.' */
export const HF_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}\/[A-Za-z0-9._-]{1,96}$/;
const hfId = z.string().regex(HF_ID_RE, "Expected a Hub id (author/name)");
const hfName = z.string().regex(/^[A-Za-z0-9._-]{1,96}$/, "Expected a Hub name");
/** Tags such as pipeline tags, libraries, licenses, languages, task categories. */
const tag = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._+-]{0,79}$/, "Expected a Hub tag");

export const BASE_RELATIONS = ["quantized", "finetune", "adapter", "merge", "base"] as const;
export type BaseRelation = (typeof BASE_RELATIONS)[number];

const common = {
  id: hfId,
  author: hfName,
  /** From the Hub's organization and user profile endpoints; null when neither answered. */
  author_type: z.enum(["org", "user"]).nullable(),
  name: hfName,
  likes: z.number().int().nonnegative(),
  /** Downloads in the last 30 days, as the Hub API reports them. */
  downloads_30d: z.number().int().nonnegative(),
  /** SPDX-style id or Hub license tag (e.g. "apache-2.0", "llama3.1", "other"). */
  license: tag.nullable(),
  /** The card's own license name when the license is "other" (e.g. "flux-1-dev-non-commercial-license"). */
  license_name: tag.nullable(),
  languages: z.array(tag).max(30),
  /** false, or how access is granted after accepting the terms ("auto" or "manual"). */
  gated: z.union([z.literal(false), z.literal("auto"), z.literal("manual")]),
  created_at: z.iso.datetime(),
  last_modified: z.iso.datetime(),
};

export const HfModel = z
  .object({
    ...common,
    pipeline_tag: tag.nullable(),
    library_name: tag.nullable(),
    /** Base models from the Hub's base_model tags. */
    base_models: z.array(z.object({ id: hfId, relation: z.enum(BASE_RELATIONS) }).strict()).max(12),
    /** Total parameters from the Hub's safetensors metadata; null when the API gives none. */
    params: z.number().int().positive().nullable(),
  })
  .strict();
export type HfModel = z.infer<typeof HfModel>;

export const HfDataset = z
  .object({
    ...common,
    task_categories: z.array(tag).max(12),
    modalities: z.array(tag).max(8),
    /** The Hub's size bucket, e.g. "1M<n<10M". */
    size_category: z.string().regex(/^[0-9A-Za-z<>.]{1,30}$/).nullable(),
    /** Short plain-text excerpt the API gives for the dataset card; may be empty. */
    description: z
      .string()
      .trim()
      .max(300)
      .refine((v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v), "Expected plain text"),
  })
  .strict();
export type HfDataset = z.infer<typeof HfDataset>;

const head = {
  fetched_at: z.iso.datetime({ offset: true }),
  /** How many the run asked the API for, by likes (the includes come on top). */
  top_n: z.number().int().positive(),
  min_likes: z.number().int().nonnegative(),
  /** Unique items fetched (top list plus includes), before filtering. */
  fetched_count: z.number().int().nonnegative(),
  excluded: z.record(z.string(), z.number().int().nonnegative()),
};

export const HfModelSnapshot = z.object({ ...head, source: z.literal("https://huggingface.co/api/models"), items: z.array(HfModel) }).strict();
export type HfModelSnapshot = z.infer<typeof HfModelSnapshot>;
export const HfDatasetSnapshot = z.object({ ...head, source: z.literal("https://huggingface.co/api/datasets"), items: z.array(HfDataset) }).strict();
export type HfDatasetSnapshot = z.infer<typeof HfDatasetSnapshot>;

export type HfKind = "model" | "dataset";

export const HfDenylistEntry = z
  .object({
    kind: z.enum(["model", "dataset"]),
    id: hfId,
    reason: z.enum(["nsfw", "deepfake", "safety-removed", "jailbreak", "personal-data", "spam", "other"]),
    note: z.string().trim().min(3).max(200),
  })
  .strict();
export const HfDenylist = z.object({ entries: z.array(HfDenylistEntry) }).strict();
export type HfDenylistEntry = z.infer<typeof HfDenylistEntry>;

export const HfIncludeEntry = z
  .object({
    kind: z.enum(["model", "dataset"]),
    id: hfId,
    reason: z.string().trim().min(3).max(160),
  })
  .strict();
export const HfIncludes = z.object({ entries: z.array(HfIncludeEntry) }).strict();
export type HfIncludeEntry = z.infer<typeof HfIncludeEntry>;

/** Check ordering, uniqueness, and per-record schema. Returns problems (empty = valid). */
export function checkHfSnapshot(kind: HfKind, raw: unknown): string[] {
  const parsed = (kind === "model" ? HfModelSnapshot : HfDatasetSnapshot).safeParse(raw);
  if (!parsed.success) {
    return parsed.error.issues.slice(0, 20).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
  }
  const problems: string[] = [];
  const seen = new Set<string>();
  const items = parsed.data.items as (HfModel | HfDataset)[];
  items.forEach((m, i) => {
    const key = m.id.toLowerCase();
    if (seen.has(key)) problems.push(`items.${i}: duplicate id ${m.id}`);
    seen.add(key);
    if (`${m.author}/${m.name}` !== m.id) problems.push(`items.${i}: id does not match author/name`);
    const prev = items[i - 1];
    if (prev && (prev.likes < m.likes || (prev.likes === m.likes && prev.id.localeCompare(m.id) > 0))) {
      problems.push(`items.${i}: not sorted by likes desc, then id`);
    }
  });
  return problems;
}
