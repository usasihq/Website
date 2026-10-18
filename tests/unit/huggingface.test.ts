import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import path from "node:path";
import { activeHfFilters, filterHf, formatParams, hfLicenseLabel, parseHfFilters, serializeHfFilters, taskLabel, type HfListItem } from "@/lib/huggingface/directory";
import {
  assignHfSlugs,
  baseModelsOf,
  cleanHfDescription,
  compareHf,
  hfBaseSlug,
  hfExclusionReason,
  hfUrlKey,
  languagesOf,
  licenseOf,
  stripRaw,
  toHfDataset,
  toHfModel,
  type RawHfItem,
} from "@/lib/huggingface/filters";
import { HF_PATTERNS, hfHeroArt, hfHue, hfPattern, warm } from "@/lib/huggingface/hero";
import { catalogHfItems, hfDenylistMap, readHfDatasets, readHfIncludes, readHfModels, serializeHfSnapshot } from "@/lib/huggingface/load";
import {
  derivedModels,
  hfCatalogMatch,
  hfDatasetEntries,
  hfEntryById,
  hfItemHero,
  hfItemLd,
  hfModelEntries,
  hfSearchEntries,
  hfSitemap,
  toHfListItem,
  type HfModelEntry,
} from "@/lib/huggingface/items";
import { checkHfSnapshot, HfModelSnapshot } from "@/lib/huggingface/schema";
import { validateHfData } from "@/lib/huggingface/validate";
import { isKnownSitePath } from "@/lib/site-routes";

const model = (over: Partial<RawHfItem> = {}): RawHfItem => ({
  id: "acme/Acme-7B-Instruct",
  author: "acme",
  likes: 1200,
  downloads: 345678,
  tags: ["transformers", "safetensors", "text-generation", "en", "fr", "license:apache-2.0", "base_model:acme/Acme-7B", "base_model:finetune:acme/Acme-7B", "region:us"],
  pipeline_tag: "text-generation",
  library_name: "transformers",
  gated: false,
  createdAt: "2025-01-02T03:04:05.000Z",
  lastModified: "2026-10-01T00:00:00.000Z",
  private: false,
  disabled: false,
  params: 7_241_732_096,
  card: { license: "apache-2.0", language: ["en", "fr"] },
  description: null,
  ...over,
});

describe("AI on Hugging Face inclusion rules", () => {
  it("keeps an ordinary model and an ordinary dataset", () => {
    expect(hfExclusionReason("model", model())).toBeNull();
    expect(hfExclusionReason("dataset", model({ id: "acme/web-corpus", tags: ["task_categories:text-generation", "license:odc-by"] }))).toBeNull();
  });

  it("drops private and disabled repositories", () => {
    expect(hfExclusionReason("model", model({ private: true }))).toBe("unavailable");
    expect(hfExclusionReason("model", model({ disabled: true }))).toBe("unavailable");
  });

  it("drops not-for-all-audiences and explicit items", () => {
    expect(hfExclusionReason("model", model({ tags: ["not-for-all-audiences", "text-to-image"] }))).toBe("nsfw");
    expect(hfExclusionReason("dataset", model({ id: "x/nsfw-captions" }))).toBe("nsfw");
    // "nude" inside another word is not a match.
    expect(hfExclusionReason("model", model({ id: "x/denuded-forest-segmentation" }))).toBeNull();
  });

  it("drops deepfake, face-swap, and undressing tools but keeps detectors", () => {
    expect(hfExclusionReason("model", model({ id: "x/inswapper_128" }))).toBe("deepfake");
    expect(hfExclusionReason("model", model({ id: "x/FaceSwap-XL" }))).toBe("deepfake");
    expect(hfExclusionReason("model", model({ id: "x/undress-lora" }))).toBe("deepfake");
    expect(hfExclusionReason("model", model({ id: "x/roop" }))).toBe("deepfake");
    expect(hfExclusionReason("model", model({ id: "x/deepfake-detector-v2" }))).toBeNull();
    expect(hfExclusionReason("model", model({ id: "x/troop-planner" }))).toBeNull();
  });

  it("drops uncensored and abliterated fine-tunes", () => {
    expect(hfExclusionReason("model", model({ id: "x/Llama-3-8B-Instruct-abliterated" }))).toBe("safety-removed");
    expect(hfExclusionReason("model", model({ id: "x/Wizard-Vicuna-13B-Uncensored" }))).toBe("safety-removed");
    expect(hfExclusionReason("model", model({ tags: ["uncensored", "text-generation"] }))).toBe("safety-removed");
    expect(hfExclusionReason("model", model({ id: "x/Qwen3-8B-heretic" }))).toBe("safety-removed");
  });

  it("drops jailbreak and leaked-prompt collections, keeps detectors and benchmarks", () => {
    expect(hfExclusionReason("dataset", model({ id: "x/jailbreak-prompts" }))).toBe("jailbreak");
    expect(hfExclusionReason("dataset", model({ id: "x/leaked-system-prompts", tags: ["leaked-prompts"] }))).toBe("jailbreak");
    expect(hfExclusionReason("dataset", model({ id: "x/jailbreak-classification" }))).toBeNull();
    expect(hfExclusionReason("dataset", model({ id: "x/JailbreakBench" }))).toBeNull();
    expect(hfExclusionReason("model", model({ id: "x/jailbreak-detector", tags: ["text-classification"] }))).toBeNull();
  });

  it("applies the reviewed denylist by kind and id, case-insensitively", () => {
    const deny = hfDenylistMap([{ kind: "dataset", id: "Acme/Faces", reason: "personal-data", note: "Scraped photos of people" }]);
    expect(hfExclusionReason("dataset", model({ id: "acme/faces" }), deny)).toBe("personal-data");
    expect(hfExclusionReason("model", model({ id: "acme/faces" }), deny)).toBeNull();
  });
});

describe("AI on Hugging Face records", () => {
  it("strips raw API items to factual fields (no gating prompt or card prose)", () => {
    const raw = stripRaw({ id: "a/b", author: "a", likes: 5, cardData: { license: "mit", extra_gated_prompt: "Agree to the terms", base_model: "c/d", configs: [{}] }, safetensors: { total: 123 }, siblings: [{ rfilename: "x" }] });
    expect(JSON.stringify(raw)).not.toContain("Agree");
    expect(JSON.stringify(raw)).not.toContain("siblings");
    expect(raw.params).toBe(123);
  });

  it("maps a model: license, languages, base models, parameters", () => {
    const m = toHfModel(model(), "org");
    expect(m).toMatchObject({ id: "acme/Acme-7B-Instruct", author: "acme", name: "Acme-7B-Instruct", author_type: "org", license: "apache-2.0", languages: ["en", "fr"], params: 7_241_732_096, gated: false, downloads_30d: 345678 });
    expect(m.base_models).toEqual([{ id: "acme/Acme-7B", relation: "finetune" }]);
    expect(m.created_at).toBe("2025-01-02T03:04:05Z");
  });

  it("reads quantized relations and keeps a bare base_model tag as 'base'", () => {
    expect(baseModelsOf(model({ tags: ["base_model:meta-llama/Llama-3.1-8B", "base_model:quantized:meta-llama/Llama-3.1-8B"] }))).toEqual([{ id: "meta-llama/Llama-3.1-8B", relation: "quantized" }]);
    expect(baseModelsOf(model({ tags: ["base_model:org/base"] }))).toEqual([{ id: "org/base", relation: "base" }]);
    expect(baseModelsOf(model({ id: "a/b", tags: ["base_model:finetune:a/b"] }))).toEqual([]);
  });

  it("takes the license tag first and the card's license name for 'other'", () => {
    expect(licenseOf(model({ tags: ["license:other"], card: { license: "other", license_name: "flux-1-dev-non-commercial-license" } }))).toEqual({ license: "other", license_name: "flux-1-dev-non-commercial-license" });
    expect(licenseOf(model({ tags: [], card: { license: "MIT" } }))).toEqual({ license: "mit", license_name: null });
    expect(licenseOf(model({ tags: [], card: {} }))).toEqual({ license: null, license_name: null });
  });

  it("reads dataset languages from language: tags when the card has none", () => {
    expect(languagesOf(model({ card: {}, tags: ["language:en", "language:de", "modality:text"] }))).toEqual(["en", "de"]);
  });

  it("maps a dataset and cleans its description excerpt", () => {
    const d = toHfDataset(
      model({
        id: "acme/corpus",
        tags: ["task_categories:text-generation", "modality:text", "size_categories:1M<n<10M", "license:odc-by"],
        description: "\n\t\tDataset Card for Corpus\n\t\n\n\tDataset Summary\n\nA large <b>web</b> corpus for pretraining… See the full description on the dataset page: https://huggingface.co/datasets/acme/corpus.",
      }),
      "user",
    );
    expect(d).toMatchObject({ task_categories: ["text-generation"], modalities: ["text"], size_category: "1M<n<10M", license: "odc-by", author_type: "user" });
    expect(d.description).toBe("A large b web /b corpus for pretraining…");
    expect(d.description).not.toMatch(/[<>]|See the full description|Dataset Card/);
    expect(cleanHfDescription("x".repeat(400)).length).toBeLessThanOrEqual(280);
  });

  it("sorts by likes, then id", () => {
    const list = [{ likes: 5, id: "b/x" }, { likes: 9, id: "z/z" }, { likes: 5, id: "a/x" }].sort(compareHf);
    expect(list.map((x) => x.id)).toEqual(["z/z", "a/x", "b/x"]);
  });
});

describe("AI on Hugging Face slugs and URLs", () => {
  it("makes author--name slugs and disambiguates collisions in rank order", () => {
    expect(hfBaseSlug("black-forest-labs/FLUX.1-dev")).toBe("black-forest-labs--flux-1-dev");
    expect(assignHfSlugs([{ id: "a/Foo.1" }, { id: "a/foo-1" }, { id: "a/foo_1" }])).toEqual(["a--foo-1", "a--foo-1-2", "a--foo-1-3"]);
  });

  it("reads Hub model and dataset URLs, and skips spaces, docs, and profiles", () => {
    expect(hfUrlKey("https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE")).toEqual({ kind: "model", id: "meta-llama/Llama-3.1-8B" });
    expect(hfUrlKey("https://huggingface.co/datasets/HuggingFaceFW/fineweb")).toEqual({ kind: "dataset", id: "HuggingFaceFW/fineweb" });
    expect(hfUrlKey("https://huggingface.co/api/models/openai/gpt-oss-20b")).toEqual({ kind: "model", id: "openai/gpt-oss-20b" });
    expect(hfUrlKey("https://huggingface.co/spaces/a/b")).toBeNull();
    expect(hfUrlKey("https://huggingface.co/docs/transformers")).toBeNull();
    expect(hfUrlKey("https://huggingface.co/blog/some-post")).toBeNull();
    expect(hfUrlKey("https://huggingface.co/openai")).toBeNull();
  });

  it("knows the section's routes", () => {
    const e = hfModelEntries()[0];
    const d = hfDatasetEntries()[0];
    const slugs = { organizations: new Set<string>(), artifacts: new Set<string>(), news: new Set<string>(), hubs: new Set<string>(), licenses: new Set<string>(), explainers: new Set<string>(), paths: new Set<string>(), issues: new Set<string>(), huggingfaceModels: new Set([e.slug]), huggingfaceDatasets: new Set([d.slug]) };
    expect(isKnownSitePath("/huggingface/", slugs)).toBe(true);
    expect(isKnownSitePath("/huggingface/datasets/", slugs)).toBe(true);
    expect(isKnownSitePath(e.href, slugs)).toBe(true);
    expect(isKnownSitePath(d.href, slugs)).toBe(true);
    expect(isKnownSitePath("/huggingface/nobody--nothing/", slugs)).toBe(false);
  });
});

describe("AI on Hugging Face filters (URL state)", () => {
  const item = (over: Partial<HfListItem>): HfListItem => ({
    kind: "model",
    slug: "a--b",
    rank: 1,
    id: "a/b",
    author: "a",
    authorType: "org",
    name: "b",
    likes: 10,
    downloads: 5,
    task: "text-generation",
    tasks: ["text-generation"],
    library: "transformers",
    license: "apache-2.0",
    licenseName: null,
    gated: false,
    quantizedFrom: null,
    params: null,
    modalities: [],
    description: "",
    modified: "2026-10-01",
    ...over,
  });
  const items = [
    item({}),
    item({ slug: "u--b-gguf", id: "u/b-GGUF", author: "u", name: "b-GGUF", authorType: "user", library: "gguf", quantizedFrom: "a/b", license: "mit" }),
    item({ slug: "g--vision", id: "g/vision", author: "g", name: "vision", task: "image-text-to-text", tasks: ["image-text-to-text"], gated: true, license: "llama3.1" }),
  ];

  it("round-trips through the query string and ignores junk", () => {
    const f = parseHfFilters(new URLSearchParams("q=llama&task=text-generation&lib=gguf&license=apache-2.0&author=user&gated=yes&quant=no&modality=text&n=200"));
    expect(f).toEqual({ q: "llama", task: "text-generation", lib: "gguf", license: "apache-2.0", author: "user", gated: "yes", quant: "no", modality: "text" });
    expect(parseHfFilters(new URLSearchParams(serializeHfFilters(f)))).toEqual(f);
    expect(parseHfFilters(new URLSearchParams("author=robot&gated=maybe&task=<script>"))).toEqual({ q: "", task: "", lib: "", license: "", author: "", gated: "", quant: "", modality: "" });
    expect(activeHfFilters(f)).toBe(8);
  });

  it("filters by task, library, license, author type, gated, quantized, and text", () => {
    const f = parseHfFilters(new URLSearchParams());
    expect(filterHf(items, { ...f, quant: "yes" }).map((i) => i.id)).toEqual(["u/b-GGUF"]);
    expect(filterHf(items, { ...f, quant: "no" }).map((i) => i.id)).toEqual(["a/b", "g/vision"]);
    expect(filterHf(items, { ...f, gated: "yes" }).map((i) => i.id)).toEqual(["g/vision"]);
    expect(filterHf(items, { ...f, author: "user" }).map((i) => i.id)).toEqual(["u/b-GGUF"]);
    expect(filterHf(items, { ...f, task: "image-text-to-text" }).map((i) => i.id)).toEqual(["g/vision"]);
    expect(filterHf(items, { ...f, lib: "gguf" }).map((i) => i.id)).toEqual(["u/b-GGUF"]);
    expect(filterHf(items, { ...f, license: "mit" }).map((i) => i.id)).toEqual(["u/b-GGUF"]);
    expect(filterHf(items, { ...f, q: "image text" }).map((i) => i.id)).toEqual(["g/vision"]);
    expect(filterHf(items, { ...f, q: "a/b" }).map((i) => i.id)).toEqual(["a/b", "u/b-GGUF"]);
  });

  it("labels tasks, licenses, and parameter counts", () => {
    expect(taskLabel("automatic-speech-recognition")).toBe("Speech recognition");
    expect(taskLabel("some-new-task")).toBe("Some new task");
    expect(hfLicenseLabel("apache-2.0")).toBe("Apache 2.0");
    expect(hfLicenseLabel("other", "flux-1-dev-non-commercial-license")).toBe("Flux 1 dev non commercial license");
    expect(formatParams(27_781_427_952)).toBe("27.8B");
    expect(formatParams(684_489_845_504)).toBe("684B");
    expect(formatParams(2_000_000_000)).toBe("2B");
    expect(formatParams(355_000_000)).toBe("355M");
  });
});

describe("AI on Hugging Face hero images", () => {
  it("draws the same picture for the same seed, a different one for another, in warm hues only", () => {
    expect(hfHeroArt("model:a/b")).toBe(hfHeroArt("model:a/b"));
    expect(hfHeroArt("model:a/b")).not.toBe(hfHeroArt("model:a/c"));
    expect(hfHeroArt("model:a/b")).not.toBe(hfHeroArt("dataset:a/b"));
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) {
      seen.add(hfPattern(`model:x/${i}`));
      const h = hfHue(`model:x/${i}`);
      expect(h <= 50 || h >= 330).toBe(true);
    }
    expect([...seen].sort()).toEqual([...HF_PATTERNS].sort());
    for (const h of [60, 120, 200, 300, 330, 359, 0, 25, 50]) expect(warm(h) <= 50 || warm(h) >= 330).toBe(true);
    for (const m of hfHeroArt("model:a/b").matchAll(/hsl\((\d+) /g)) expect(Number(m[1]) <= 50 || Number(m[1]) >= 330).toBe(true);
  });

  it("keys a hero on stable fields only: likes, downloads, rank, and dates do not change it", () => {
    const e = hfModelEntries()[0];
    const moved = { ...e, likes: e.likes + 999, downloads_30d: 1, rank: 4321, last_modified: "2030-01-01T00:00:00Z" } as HfModelEntry;
    expect(hfItemHero(moved)).toEqual(hfItemHero(e));
    expect(JSON.stringify(hfItemHero(e))).not.toContain(e.likes.toLocaleString("en-US"));
    expect(hfItemHero({ ...e, license: e.license === "mit" ? "apache-2.0" : "mit" }).facts).not.toEqual(hfItemHero(e).facts);
  });
});

describe("AI on Hugging Face snapshot", () => {
  it("passes validation", () => {
    expect(validateHfData()).toEqual([]);
  });

  it("is sorted, unique, and serializes one item per line", () => {
    const data = readHfModels();
    expect(checkHfSnapshot("model", data)).toEqual([]);
    const text = serializeHfSnapshot(data);
    expect(HfModelSnapshot.parse(JSON.parse(text))).toEqual(data);
    expect(text.split("\n").length).toBeGreaterThan(data.items.length);
    expect(checkHfSnapshot("model", { ...data, items: [...data.items].reverse() }).join(" ")).toMatch(/not sorted/);
  });

  it("has the top models and datasets, with likes over the minimum except catalog items", () => {
    const m = readHfModels();
    const d = readHfDatasets();
    expect(m.items.length).toBeGreaterThan(3000);
    expect(d.items.length).toBeGreaterThan(500);
    const included = new Set(readHfIncludes().map((i) => `${i.kind}:${i.id.toLowerCase()}`));
    for (const x of m.items) if (x.likes < m.min_likes) expect(included.has(`model:${x.id.toLowerCase()}`)).toBe(true);
  });

  it("lists every catalog-linked model and dataset that the rules keep, and links it to its record", () => {
    const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
    const includes = readHfIncludes();
    expect(includes.length).toBeGreaterThanOrEqual(catalogHfItems().length);
    let present = 0;
    let linked = 0;
    for (const c of catalogHfItems()) if (hfEntryById(c.kind, c.id)) present++;
    // Every listed item that a published record links to or cites links back to a record.
    for (const a of catalog.artifacts) {
      for (const url of [...a.links.map((l) => l.url), ...a.sources.map((x) => x.url)]) {
        const key = hfUrlKey(url);
        const e = key && hfEntryById(key.kind, key.id);
        if (!e) continue;
        linked++;
        expect(hfCatalogMatch(catalog, e), e.id).not.toBeNull();
      }
    }
    expect(linked).toBeGreaterThan(50);
    expect(present / catalogHfItems().length).toBeGreaterThan(0.9);
  });

  it("links quantized versions to their base and lists them on the base's page", () => {
    const q = hfModelEntries().find((m) => m.base_models.some((b) => b.relation === "quantized" && hfEntryById("model", b.id)))!;
    const base = hfEntryById("model", q.base_models.find((b) => b.relation === "quantized")!.id) as HfModelEntry;
    expect(toHfListItem(q).quantizedFrom).toBe(q.base_models.find((b) => b.relation === "quantized")!.id);
    expect(derivedModels(base, 1000).some((x) => x.entry.slug === q.slug)).toBe(true);
  });

  it("builds honest JSON-LD, search entries for the top 1,000, and a sitemap of every page", () => {
    const m = hfModelEntries()[0];
    const d = hfDatasetEntries()[0];
    expect(hfItemLd(m)).toMatchObject({ "@type": "SoftwareSourceCode", codeRepository: `https://huggingface.co/${m.id}` });
    expect(hfItemLd(d)).toMatchObject({ "@type": "Dataset", url: `https://huggingface.co/datasets/${d.id}` });
    expect(JSON.stringify(hfItemLd(m))).not.toMatch(/"(aggregateRating|interactionStatistic)"/);
    const search = hfSearchEntries();
    expect(search.length).toBe(1000);
    expect(search.every((s) => s.type === "huggingface-item" && s.href.startsWith("/huggingface/"))).toBe(true);
    const paths = new Set(hfSitemap().map((p) => p.path));
    expect(paths.has(m.href) && paths.has(d.href) && paths.has("/huggingface/page/2/")).toBe(true);
    expect(paths.size).toBe(hfModelEntries().length + hfDatasetEntries().length + 1 + Math.ceil(hfModelEntries().length / 100) - 1 + Math.ceil(hfDatasetEntries().length / 100) - 1);
  });
});
