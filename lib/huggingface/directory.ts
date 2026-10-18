/**
 * AI on Hugging Face list items, labels, and filters. Client-safe and pure:
 * the /huggingface/ directories, their URL state, and the unit tests share these.
 */
import { normalize } from "../search";
import type { HfKind } from "./schema";

export type HfListItem = {
  kind: HfKind;
  slug: string;
  rank: number;
  id: string;
  author: string;
  authorType: "org" | "user" | null;
  name: string;
  likes: number;
  downloads: number;
  /** Pipeline tag (models) or first task category (datasets). */
  task: string | null;
  /** Every task category (datasets); the pipeline tag alone for models. */
  tasks: string[];
  library: string | null;
  /** Hub license tag, or "none". */
  license: string;
  licenseName: string | null;
  gated: boolean;
  /** Base model id when this is a quantized version of another model. */
  quantizedFrom: string | null;
  params: number | null;
  modalities: string[];
  description: string;
  /** YYYY-MM-DD */
  modified: string;
};

export const AUTHOR_TYPE_LABELS = { org: "Organization", user: "Personal account" } as const;

const TASK_LABELS: Record<string, string> = {
  "text-generation": "Text generation",
  "text2text-generation": "Text-to-text generation",
  "image-text-to-text": "Image and text to text",
  "text-to-image": "Text to image",
  "image-to-image": "Image to image",
  "text-to-video": "Text to video",
  "image-to-video": "Image to video",
  "text-to-speech": "Text to speech",
  "text-to-audio": "Text to audio",
  "automatic-speech-recognition": "Speech recognition",
  "feature-extraction": "Feature extraction (embeddings)",
  "sentence-similarity": "Sentence similarity",
  "any-to-any": "Any to any",
  "visual-question-answering": "Visual question answering",
  "question-answering": "Question answering",
  "zero-shot-classification": "Zero-shot classification",
  "zero-shot-image-classification": "Zero-shot image classification",
  "object-detection": "Object detection",
  "image-segmentation": "Image segmentation",
  "mask-generation": "Mask generation",
  "depth-estimation": "Depth estimation",
  "image-to-3d": "Image to 3D",
  "text-to-3d": "Text to 3D",
  "fill-mask": "Fill mask",
  "token-classification": "Token classification",
  "text-classification": "Text classification",
  "image-classification": "Image classification",
  "audio-classification": "Audio classification",
  "audio-to-audio": "Audio to audio",
  "video-text-to-text": "Video and text to text",
  "image-to-text": "Image to text",
  "text-ranking": "Text ranking (reranking)",
  "reinforcement-learning": "Reinforcement learning",
  "robotics": "Robotics",
  "time-series-forecasting": "Time-series forecasting",
  "tabular-classification": "Tabular classification",
  "translation": "Translation",
  "summarization": "Summarization",
  "unconditional-image-generation": "Unconditional image generation",
  "keypoint-detection": "Keypoint detection",
  "video-classification": "Video classification",
  "table-question-answering": "Table question answering",
  "document-question-answering": "Document question answering",
  "text-retrieval": "Text retrieval",
  "graph-ml": "Graph machine learning",
};

/** "text-generation" → "Text generation". */
export function taskLabel(tag: string | null): string {
  if (!tag) return "Task not given";
  if (TASK_LABELS[tag]) return TASK_LABELS[tag];
  const s = tag.replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const LICENSE_LABELS: Record<string, string> = {
  "apache-2.0": "Apache 2.0",
  mit: "MIT",
  "bsd-3-clause": "BSD 3-Clause",
  "bsd-2-clause": "BSD 2-Clause",
  "bsd": "BSD",
  "gpl-3.0": "GPL 3.0",
  "gpl-2.0": "GPL 2.0",
  "agpl-3.0": "AGPL 3.0",
  "lgpl-3.0": "LGPL 3.0",
  "mpl-2.0": "MPL 2.0",
  "cc0-1.0": "CC0 1.0",
  "cc-by-4.0": "CC BY 4.0",
  "cc-by-sa-4.0": "CC BY-SA 4.0",
  "cc-by-nc-4.0": "CC BY-NC 4.0",
  "cc-by-nc-sa-4.0": "CC BY-NC-SA 4.0",
  "cc-by-nc-nd-4.0": "CC BY-NC-ND 4.0",
  "cc-by-3.0": "CC BY 3.0",
  "cc-by-sa-3.0": "CC BY-SA 3.0",
  "cc-by-nc-2.0": "CC BY-NC 2.0",
  "cc-by-nc-3.0": "CC BY-NC 3.0",
  "odc-by": "ODC-By",
  "odbl": "ODbL",
  "pddl": "PDDL",
  "openrail": "OpenRAIL",
  "openrail++": "OpenRAIL++",
  "creativeml-openrail-m": "CreativeML OpenRAIL-M",
  "bigscience-openrail-m": "BigScience OpenRAIL-M",
  "bigscience-bloom-rail-1.0": "BigScience BLOOM RAIL 1.0",
  "bigcode-openrail-m": "BigCode OpenRAIL-M",
  "llama2": "Llama 2 license",
  "llama3": "Llama 3 license",
  "llama3.1": "Llama 3.1 license",
  "llama3.2": "Llama 3.2 license",
  "llama3.3": "Llama 3.3 license",
  "llama4": "Llama 4 license",
  "gemma": "Gemma terms",
  "artistic-2.0": "Artistic 2.0",
  "afl-3.0": "AFL 3.0",
  "unlicense": "Unlicense",
  "wtfpl": "WTFPL",
  "c-uda": "C-UDA",
  "deepfloyd-if-license": "DeepFloyd IF license",
  "apple-ascl": "Apple ASCL",
  "apple-amlr": "Apple AMLR",
  "intel-research": "Intel research license",
  "lgpl-lr": "LGPL-LR",
  "other": "Other license",
  "unknown": "Unknown license",
  "none": "No license given",
};

/** Label for a license key; a card's own license name is used when the key is "other". */
export function hfLicenseLabel(key: string, name: string | null = null): string {
  if (key === "other" && name) {
    const s = name.replace(/[-_]+/g, " ").replace(/\bv(\d)/g, "v$1").trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return LICENSE_LABELS[key] ?? key.toUpperCase().replace(/-(\d)/g, " $1").replace(/-/g, " ");
}

/** 7,615,000,000 → "7.6B parameters"-style: "7.6B", "27B", "350M", "1.2T". */
export function formatParams(n: number): string {
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [v, u] of units) {
    if (n >= v) {
      const x = n / v;
      return `${x >= 100 ? Math.round(x) : x >= 10 ? Math.round(x * 10) / 10 : Math.round(x * 100) / 100}${u}`.replace(/\.0+(?=[A-Z])/, "");
    }
  }
  return String(n);
}

export const DEFAULT_HF_FILTERS = {
  q: "",
  task: "",
  lib: "",
  license: "",
  author: "" as "" | "org" | "user",
  gated: "" as "" | "yes" | "no",
  quant: "" as "" | "yes" | "no",
  modality: "",
};
export type HfFilters = typeof DEFAULT_HF_FILTERS;

const token = (v: string | null, max: number, re: RegExp) => {
  const s = (v ?? "").trim().slice(0, max);
  return re.test(s) ? s : "";
};
const TAG = /^[A-Za-z0-9][A-Za-z0-9._+-]*$/;
const yesNo = (v: string | null) => (v === "yes" || v === "no" ? v : "");

export function parseHfFilters(p: URLSearchParams): HfFilters {
  const author = p.get("author");
  return {
    q: (p.get("q") ?? "").trim().slice(0, 120),
    task: token(p.get("task"), 80, TAG),
    lib: token(p.get("lib"), 80, TAG),
    license: token(p.get("license"), 80, TAG),
    author: author === "org" || author === "user" ? author : "",
    gated: yesNo(p.get("gated")),
    quant: yesNo(p.get("quant")),
    modality: token(p.get("modality"), 40, TAG),
  };
}

export function serializeHfFilters(f: HfFilters): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  return p.toString();
}

export const activeHfFilters = (f: HfFilters) => Object.values(f).filter(Boolean).length;
export const isDefaultHfView = (f: HfFilters) => activeHfFilters(f) === 0;

/** Every query word must appear in the id, task, library, license, or description. Rank order is kept. */
export function filterHf(items: readonly HfListItem[], f: HfFilters): HfListItem[] {
  const words = normalize(f.q).split(/\s+/).filter(Boolean);
  return items.filter((i) => {
    if (f.task && !i.tasks.includes(f.task)) return false;
    if (f.lib && i.library !== f.lib) return false;
    if (f.license && i.license !== f.license) return false;
    if (f.author && i.authorType !== f.author) return false;
    if (f.gated && i.gated !== (f.gated === "yes")) return false;
    if (f.quant && Boolean(i.quantizedFrom) !== (f.quant === "yes")) return false;
    if (f.modality && !i.modalities.includes(f.modality)) return false;
    if (!words.length) return true;
    const text = normalize(
      [i.id, i.name.replace(/[-_.]/g, " "), i.tasks.map((t) => `${t} ${taskLabel(t)}`).join(" "), i.library ?? "", i.license, i.licenseName ?? "", i.description, i.quantizedFrom ?? ""].join(" "),
    );
    return words.every((w) => text.includes(w));
  });
}

export { countOptions } from "../github/directory";
