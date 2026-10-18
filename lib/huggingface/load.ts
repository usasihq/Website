/**
 * Loads data/huggingface/{models,datasets}.json, the reviewed denylist, and
 * the must-include list. Server/build only. The build works from the
 * committed snapshots; only scripts/refresh-huggingface.ts touches the network.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { hfUrlKey } from "./filters";
import {
  HfDatasetSnapshot,
  HfDenylist,
  HfIncludes,
  HfModelSnapshot,
  type HfDenylistEntry,
  type HfIncludeEntry,
  type HfKind,
} from "./schema";

const dir = () => path.join(process.cwd(), "data/huggingface");
export const HF_MODELS_PATH = path.join(process.cwd(), "data/huggingface/models.json");
export const HF_DATASETS_PATH = path.join(process.cwd(), "data/huggingface/datasets.json");
export const HF_DENYLIST_PATH = path.join(process.cwd(), "data/huggingface/denylist.yml");
export const HF_INCLUDES_PATH = path.join(process.cwd(), "data/huggingface/includes.yml");

let models: HfModelSnapshot | undefined;
let datasets: HfDatasetSnapshot | undefined;

export function readHfModels(file = HF_MODELS_PATH): HfModelSnapshot {
  if (file === HF_MODELS_PATH && models) return models;
  const data = HfModelSnapshot.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  if (file === HF_MODELS_PATH) models = data;
  return data;
}

export function readHfDatasets(file = HF_DATASETS_PATH): HfDatasetSnapshot {
  if (file === HF_DATASETS_PATH && datasets) return datasets;
  const data = HfDatasetSnapshot.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  if (file === HF_DATASETS_PATH) datasets = data;
  return data;
}

export function readHfDenylist(file = HF_DENYLIST_PATH): HfDenylistEntry[] {
  if (!fs.existsSync(file)) return [];
  return HfDenylist.parse(parse(fs.readFileSync(file, "utf8")) ?? { entries: [] }).entries;
}

/** Denylist keyed "<kind>:<lowercase id>". */
export function hfDenylistMap(entries: HfDenylistEntry[]): Map<string, HfDenylistEntry> {
  return new Map(entries.map((e) => [`${e.kind}:${e.id.toLowerCase()}`, e]));
}

export function readHfIncludes(file = HF_INCLUDES_PATH): HfIncludeEntry[] {
  if (!fs.existsSync(file)) return [];
  return HfIncludes.parse(parse(fs.readFileSync(file, "utf8")) ?? { entries: [] }).entries;
}

/** Stable JSON: one item per line keeps diffs readable. */
export function serializeHfSnapshot(data: HfModelSnapshot | HfDatasetSnapshot): string {
  const { items, ...head } = data;
  const lines = (items as unknown[]).map((p) => `    ${JSON.stringify(p)}`);
  const headJson = JSON.stringify(head, null, 2).replace(/\n}$/, "");
  return `${headJson},\n  "items": [\n${lines.join(",\n")}\n  ]\n}\n`;
}

export function writeHfSnapshot(kind: HfKind, data: HfModelSnapshot | HfDatasetSnapshot): void {
  const file = kind === "model" ? HF_MODELS_PATH : HF_DATASETS_PATH;
  (kind === "model" ? HfModelSnapshot : HfDatasetSnapshot).parse(data);
  fs.mkdirSync(dir(), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, serializeHfSnapshot(data));
  fs.renameSync(`${file}.tmp`, file);
}

/**
 * Every Hub model and dataset a catalog artifact links to or cites, with the
 * first record (by file name) that does. Spaces, collections, docs, and
 * profile pages are skipped.
 */
export function catalogHfItems(root = path.join(process.cwd(), "content/artifacts")): { kind: HfKind; id: string; record: string }[] {
  const seen = new Map<string, { kind: HfKind; id: string; record: string }>();
  for (const f of fs.readdirSync(root).filter((x) => x.endsWith(".yml")).sort()) {
    const text = fs.readFileSync(path.join(root, f), "utf8");
    for (const m of text.matchAll(/https:\/\/(?:www\.)?huggingface\.co\/[^\s"'<>)\]]+/g)) {
      const key = hfUrlKey(m[0].replace(/[.,;:]+$/, ""));
      if (!key) continue;
      const k = `${key.kind}:${key.id.toLowerCase()}`;
      if (!seen.has(k)) seen.set(k, { ...key, record: f.replace(/\.yml$/, "") });
    }
  }
  return [...seen.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
}
