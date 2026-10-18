/**
 * npm run hf:refresh [-- --offline | --cached] [-- --force] [-- --seed-includes]
 *
 * Refreshes data/huggingface/models.json and datasets.json from the PUBLIC
 * Hugging Face Hub API (no token, no account or email in any header; the
 * User-Agent is the project's research string only). Network access happens
 * here only; the build reads the committed snapshots.
 *
 * - The top models (5,000) and datasets (1,000) by likes, paged with the
 *   API's Link-header cursor; a page stops early once likes fall below 100.
 * - data/huggingface/includes.yml and every Hub model or dataset a USASI
 *   catalog record links to are looked up one by one, so catalog items are
 *   always considered (they then pass the same rules and denylist).
 * - Whether an author is an organization or a user comes from the Hub's
 *   profile endpoints, looked up once per author and remembered from the
 *   previous snapshot; when neither endpoint answers it stays unknown.
 *
 * Requests are spaced at least 600 ms apart (under 2 a second) and back off on
 * 429 using the RateLimit header. Raw results are cached in .cache/huggingface/
 * so `--offline` re-applies the rules without the network (`--cached` does the
 * same but still looks up authors it has not seen). If a run gets fewer
 * items than the previous snapshot's fetched_count * 0.8, the snapshot is kept
 * (pass --force to write). `--seed-includes` adds every catalog Hub URL to
 * includes.yml and exits.
 */
import fs from "node:fs";
import path from "node:path";
import { stringify } from "yaml";
import { compareHf, hfExclusionReason, stripRaw, toHfDataset, toHfModel, type HfExclusionReason, type RawHfItem } from "../lib/huggingface/filters";
import { catalogHfItems, hfDenylistMap, HF_INCLUDES_PATH, readHfDatasets, readHfDenylist, readHfIncludes, readHfModels, writeHfSnapshot } from "../lib/huggingface/load";
import type { HfDatasetSnapshot, HfIncludeEntry, HfKind, HfModelSnapshot } from "../lib/huggingface/schema";

const USER_AGENT = "USASI-catalog-research/0.3";
const API = "https://huggingface.co/api";
const PAUSE_MS = 600;
export const HF_TOP_MODELS = 5000;
export const HF_TOP_DATASETS = 1000;
export const HF_MIN_LIKES = 100;
const PAGE = 1000;
const CACHE_DIR = path.join(process.cwd(), ".cache/huggingface");
const CACHE = path.join(CACHE_DIR, "raw.json");
const AUTHORS = path.join(CACHE_DIR, "authors.json");

const MODEL_EXPAND = ["author", "likes", "downloads", "tags", "pipeline_tag", "library_name", "gated", "createdAt", "lastModified", "private", "disabled", "safetensors", "cardData"];
const DATASET_EXPAND = ["author", "likes", "downloads", "tags", "gated", "createdAt", "lastModified", "private", "disabled", "cardData", "description"];
const expandQuery = (fields: string[]) => fields.map((f) => `expand[]=${f}`).join("&");

const args = process.argv.slice(2);
const offline = args.includes("--offline");
const force = args.includes("--force");
const seedIncludes = args.includes("--seed-includes");
// --cached: re-apply the rules to the cached lists, but look up any authors not seen before (after a rule change).
const cached = args.includes("--cached");

/** `included`: "<kind>:<lowercase id>" of every must-include as the Hub resolved it (a renamed repository redirects to its new id). */
type Cache = { fetched_at: string; models: RawHfItem[]; datasets: RawHfItem[]; missing: string[]; included?: string[]; renamed?: string[] };
type AuthorType = "org" | "user" | null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let last = 0;
let calls = 0;

/** GET with pacing and 429 back-off. Returns null on a network error or a non-OK status other than 404/401. */
async function get(url: string): Promise<Response | null> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const wait = last + PAUSE_MS - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    calls++;
    let res: Response;
    try {
      res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": USER_AGENT } });
    } catch (err) {
      console.log(`hf: network error (${(err as Error).message}); retrying`);
      await sleep(5_000 * (attempt + 1));
      continue;
    }
    if (res.status === 429 || res.status === 503) {
      // RateLimit: "api";r=0;t=94  (t = seconds until the window resets)
      const t = Number(res.headers.get("ratelimit")?.match(/t=(\d+)/)?.[1] ?? res.headers.get("retry-after") ?? 60);
      const s = Math.min(Math.max(t, 5), 310) + 2;
      console.log(`hf: ${res.status}, waiting ${s}s`);
      await res.body?.cancel();
      await sleep(s * 1000);
      continue;
    }
    return res;
  }
  return null;
}

async function fetchTop(kind: HfKind, limit: number): Promise<RawHfItem[] | null> {
  const base = `${API}/${kind === "model" ? "models" : "datasets"}?sort=likes&direction=-1&limit=${PAGE}&${expandQuery(kind === "model" ? MODEL_EXPAND : DATASET_EXPAND)}`;
  let url: string | null = base;
  const out: RawHfItem[] = [];
  while (url && out.length < limit) {
    const res = await get(url);
    if (!res || !res.ok) {
      console.log(`hf: ${kind} list failed (${res?.status ?? "network"}); stopping`);
      return out.length ? out : null;
    }
    const body = (await res.json()) as Record<string, unknown>[];
    out.push(...body.map(stripRaw));
    const lastLikes = out[out.length - 1]?.likes ?? 0;
    console.log(`hf: ${kind}s ${out.length} (last likes ${lastLikes})`);
    if (body.length < PAGE || lastLikes < HF_MIN_LIKES) break;
    const link = res.headers.get("link") ?? "";
    const next = link.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
    url = next && next.startsWith(`${API}/`) ? next : null;
  }
  return out.slice(0, limit);
}

function includeTargets(): { kind: HfKind; id: string }[] {
  const out = new Map<string, { kind: HfKind; id: string }>();
  for (const i of [...readHfIncludes(), ...catalogHfItems()]) out.set(`${i.kind}:${i.id.toLowerCase()}`, { kind: i.kind, id: i.id });
  return [...out.values()];
}

async function fetchIncludes(cache: Cache): Promise<void> {
  const have = new Set([...cache.models.map((m) => `model:${m.id.toLowerCase()}`), ...cache.datasets.map((d) => `dataset:${d.id.toLowerCase()}`)]);
  let added = 0;
  const included = new Set(cache.included ?? []);
  const renamed = new Set(cache.renamed ?? []);
  for (const t of includeTargets()) {
    if (have.has(`${t.kind}:${t.id.toLowerCase()}`)) {
      included.add(`${t.kind}:${t.id.toLowerCase()}`);
      continue;
    }
    const res = await get(`${API}/${t.kind === "model" ? "models" : "datasets"}/${t.id}?${expandQuery(t.kind === "model" ? MODEL_EXPAND : DATASET_EXPAND)}`);
    if (!res || !res.ok) {
      cache.missing.push(`${t.kind}:${t.id} (${res?.status ?? "network"})`);
      await res?.body?.cancel();
      continue;
    }
    const raw = stripRaw((await res.json()) as Record<string, unknown>);
    const key = `${t.kind}:${raw.id.toLowerCase()}`;
    included.add(key);
    if (raw.id.toLowerCase() !== t.id.toLowerCase()) renamed.add(`${t.kind}:${t.id} -> ${raw.id}`);
    if (have.has(key)) continue; // a renamed repository that redirected to one already fetched
    have.add(key);
    (t.kind === "model" ? cache.models : cache.datasets).push(raw);
    added++;
  }
  cache.included = [...included].sort();
  cache.renamed = [...renamed].sort();
  if (renamed.size) console.log(`hf: renamed on the Hub (update the catalog links): ${[...renamed].join(", ")}`);
  console.log(`hf: includes and catalog items: ${added} added beyond the top lists${cache.missing.length ? `; not found: ${cache.missing.join(", ")}` : ""}`);
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Organization or user, from GET /api/organizations/<name>/overview, then /api/users/<name>/overview. */
async function authorTypes(names: string[], known: Record<string, AuthorType>): Promise<Record<string, AuthorType>> {
  const out = { ...known };
  const todo = names.filter((n) => !(n in out) || (out[n] === null && !offline && !cached));
  if (offline) return out;
  console.log(`hf: looking up ${todo.length} author profiles`);
  let n = 0;
  for (const name of todo) {
    const org = await get(`${API}/organizations/${encodeURIComponent(name)}/overview`);
    await org?.body?.cancel();
    if (org?.ok) out[name] = "org";
    else {
      const user = await get(`${API}/users/${encodeURIComponent(name)}/overview`);
      await user?.body?.cancel();
      out[name] = user?.ok ? "user" : null;
    }
    if (++n % 200 === 0) {
      console.log(`hf: authors ${n} of ${todo.length}`);
      fs.writeFileSync(AUTHORS, JSON.stringify(out));
    }
  }
  return out;
}

if (seedIncludes) {
  const existing = readHfIncludes();
  const have = new Set(existing.map((e) => `${e.kind}:${e.id.toLowerCase()}`));
  const add: HfIncludeEntry[] = catalogHfItems()
    .filter((c) => !have.has(`${c.kind}:${c.id.toLowerCase()}`))
    .map((c) => ({ kind: c.kind, id: c.id, reason: `Linked from the USASI catalog record ${c.record}` }));
  const entries = [...existing, ...add].sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));
  const headComment = fs.existsSync(HF_INCLUDES_PATH) ? fs.readFileSync(HF_INCLUDES_PATH, "utf8").split("\n").filter((l) => l.startsWith("#")).join("\n") : "";
  fs.writeFileSync(HF_INCLUDES_PATH, `${headComment ? `${headComment}\n` : ""}${stringify({ entries }, { lineWidth: 0, flowCollectionPadding: true, collectionStyle: "block" }).replace(/^  - kind/gm, "  - kind")}`);
  console.log(`hf: includes.yml has ${entries.length} entries (${add.length} added from the catalog)`);
  process.exit(0);
}

let cache: Cache;
if (offline || cached) {
  cache = readJson<Cache>(CACHE, { fetched_at: "", models: [], datasets: [], missing: [] });
  console.log(`hf: offline, ${cache.models.length} models and ${cache.datasets.length} datasets cached from ${cache.fetched_at}`);
  if (cached) {
    // Look up only must-includes the cache has not resolved (new catalog links, renamed repositories).
    await fetchIncludes(cache);
    fs.writeFileSync(CACHE, JSON.stringify(cache));
  }
} else {
  const fetched_at = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const modelsRaw = await fetchTop("model", HF_TOP_MODELS);
  const datasetsRaw = await fetchTop("dataset", HF_TOP_DATASETS);
  if (!modelsRaw || !datasetsRaw) {
    console.log("hf: a top list could not be fetched; keeping the snapshots.");
    process.exit(0);
  }
  cache = { fetched_at, models: modelsRaw, datasets: datasetsRaw, missing: [] };
  await fetchIncludes(cache);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(cache));
}

const deny = hfDenylistMap(readHfDenylist());
const includeKeys = new Set([...includeTargets().map((t) => `${t.kind}:${t.id.toLowerCase()}`), ...(cache.included ?? [])]);

function select(kind: HfKind, raws: RawHfItem[], top: number) {
  const excluded: Partial<Record<HfExclusionReason, number>> = {};
  const kept: RawHfItem[] = [];
  const seen = new Set<string>();
  let considered = 0;
  for (const raw of raws) {
    const key = `${kind}:${raw.id.toLowerCase()}`;
    if (seen.has(key) || !/^[^/]+\/[^/]+$/.test(raw.id)) continue;
    seen.add(key);
    // The top list is cut at `top` items and 100 likes; must-includes are considered whatever their likes.
    if (!includeKeys.has(key) && (raw.likes ?? 0) < HF_MIN_LIKES) continue;
    considered++;
    const reason = hfExclusionReason(kind, raw, deny);
    if (reason) {
      excluded[reason] = (excluded[reason] ?? 0) + 1;
      continue;
    }
    kept.push(raw);
  }
  return { kept, excluded, fetched: Math.min(considered, top + includeKeys.size) };
}

const m = select("model", cache.models, HF_TOP_MODELS);
const d = select("dataset", cache.datasets, HF_TOP_DATASETS);

let prevModels: HfModelSnapshot | undefined;
let prevDatasets: HfDatasetSnapshot | undefined;
try {
  prevModels = readHfModels();
  prevDatasets = readHfDatasets();
} catch {
  /* first run */
}
const known: Record<string, AuthorType> = readJson<Record<string, AuthorType>>(AUTHORS, {});
for (const x of [...(prevModels?.items ?? []), ...(prevDatasets?.items ?? [])]) if (!(x.author in known)) known[x.author] = x.author_type;
const names = [...new Set([...m.kept, ...d.kept].map((x) => x.id.split("/")[0]))].sort();
const types = await authorTypes(names, known);
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.writeFileSync(AUTHORS, JSON.stringify(types));

const exclusions = (e: Partial<Record<HfExclusionReason, number>>) => Object.fromEntries(Object.entries(e).sort(([a], [b]) => a.localeCompare(b)));
const modelSnap: HfModelSnapshot = {
  fetched_at: cache.fetched_at,
  source: "https://huggingface.co/api/models",
  top_n: HF_TOP_MODELS,
  min_likes: HF_MIN_LIKES,
  fetched_count: m.fetched,
  excluded: exclusions(m.excluded),
  items: m.kept.map((r) => toHfModel(r, types[r.id.split("/")[0]] ?? null)).sort(compareHf),
};
const datasetSnap: HfDatasetSnapshot = {
  fetched_at: cache.fetched_at,
  source: "https://huggingface.co/api/datasets",
  top_n: HF_TOP_DATASETS,
  min_likes: HF_MIN_LIKES,
  fetched_count: d.fetched,
  excluded: exclusions(d.excluded),
  items: d.kept.map((r) => toHfDataset(r, types[r.id.split("/")[0]] ?? null)).sort(compareHf),
};

for (const [kind, snap, prev] of [
  ["model", modelSnap, prevModels],
  ["dataset", datasetSnap, prevDatasets],
] as const) {
  if (!force && prev && snap.fetched_count < prev.fetched_count * 0.8) {
    console.log(`hf: only ${snap.fetched_count} ${kind}s fetched (previous ${prev.fetched_count}); keeping that snapshot. Use --force to write.`);
    continue;
  }
  writeHfSnapshot(kind, snap);
  const ex = Object.entries(snap.excluded).map(([k, v]) => `${k}=${v}`).join(" ");
  console.log(`hf: ${kind}s: ${snap.fetched_count} fetched, ${snap.fetched_count - snap.items.length} excluded (${ex}), ${snap.items.length} written`);
}
if (!offline) console.log(`hf: ${calls} API requests`);
