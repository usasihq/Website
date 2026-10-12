import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Catalog, loadCatalog } from "@/lib/catalog";
import type { EntryType } from "@/lib/labels";
import { parseFaq, parseGlossary, referenceSearchEntries } from "@/lib/reference-search";
import {
  DEFAULT_ARTIFACT_FILTERS,
  DEFAULT_ORG_FILTERS,
  filterArtifacts,
  filterOrganizations,
  parseArtifactFilters,
  parseOrgFilters,
  searchEntries,
  serializeArtifactFilters,
  serializeOrgFilters,
  type SearchEntry,
} from "@/lib/search";
import { validateContent } from "@/lib/validate";
import { fixtureContent, TODAY } from "../fixtures/content";

const catalog = new Catalog(validateContent(fixtureContent(), { today: TODAY }));
const orgs = catalog.organizations.map((o) => catalog.toOrgListItem(o));
const artifacts = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
const slugs = (list: Array<{ slug: string }>) => list.map((i) => i.slug);

describe("URL state", () => {
  it("round-trips organization filters and omits defaults", () => {
    const f = { ...DEFAULT_ORG_FILTERS, q: "fixture unit", sector: "research" as const, open: true, sort: "reviewed" as const };
    const qs = serializeOrgFilters(f);
    expect(qs).toBe("q=fixture+unit&sector=research&open=1&sort=reviewed");
    expect(parseOrgFilters(new URLSearchParams(qs))).toEqual(f);
    expect(serializeOrgFilters(DEFAULT_ORG_FILTERS)).toBe("");
  });

  it("round-trips artifact filters, including checklist filters", () => {
    const f = { ...DEFAULT_ARTIFACT_FILTERS, kind: "model" as const, level: "release" as const, tier: "open-stack" as const, org: "fixture-parent", check: "training_code:public" };
    expect(parseArtifactFilters(new URLSearchParams(serializeArtifactFilters(f)))).toEqual(f);
  });

  it("ignores invalid or hostile parameter values", () => {
    const parsed = parseArtifactFilters(new URLSearchParams("kind=spaceship&tier=best&check=weights:maybe&org=<script>&sort=hype"));
    expect(parsed).toEqual(DEFAULT_ARTIFACT_FILTERS);
    const org = parseOrgFilters(new URLSearchParams("sector=crypto&structure=secret&open=yes"));
    expect(org).toEqual(DEFAULT_ORG_FILTERS);
  });
});

describe("filtering and sorting", () => {
  it("filters organizations by sector, structure, and open artifacts", () => {
    expect(slugs(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, sector: "cloud" }))).toEqual(["fixture-parent"]);
    expect(slugs(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, structure: "unit" }))).toEqual(["fixture-unit"]);
    expect(slugs(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, structure: "independent" }))).not.toContain("fixture-unit");
    expect(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, open: true }).every((o) => o.artifactCount > 0)).toBe(true);
  });

  it("combines filters (AND) and returns an empty list when nothing matches", () => {
    const combined = filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, kind: "model", level: "release", tier: "open-weight", org: "fixture-unit" });
    expect(slugs(combined)).toEqual(["fixture-open-stack"]);
    expect(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, kind: "dataset", tier: "fully-open" })).toEqual([]);
    expect(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, q: "no-such-organization-anywhere" })).toEqual([]);
  });

  it("matches text across names, summaries, maintainers, licenses, and tags", () => {
    expect(slugs(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, q: "MIT" }))).toEqual(["fixture-tool"]);
    expect(slugs(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, q: "pretraining data" }))).toEqual(["fixture-dataset"]);
    expect(slugs(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, q: "fixture api" }))).toEqual(["fixture-parent"]);
  });

  it("ignores question words and spacing in directory searches", () => {
    expect(slugs(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, q: "what is the fixture api" }))).toEqual(["fixture-parent"]);
    expect(slugs(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, q: "fixtureunit" }))).toEqual(["fixture-unit"]);
    expect(slugs(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, q: "where is the pretraining data" }))).toEqual(["fixture-dataset"]);
  });

  it("filters by license key and checklist status", () => {
    expect(slugs(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, license: "ODC-By-1.0" }))).toEqual(["fixture-dataset"]);
    const unknownEval = slugs(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, check: "evaluation_materials:unknown" }));
    expect(unknownEval).toEqual(expect.arrayContaining(["fixture-open-stack", "fixture-open-weight"]));
    expect(unknownEval).not.toContain("fixture-family");
  });

  it("sorts alphabetically, by review date, and by documented release date with unknown dates last", () => {
    const byName = slugs(filterArtifacts(artifacts, DEFAULT_ARTIFACT_FILTERS));
    expect(byName).toEqual([...byName].sort((a, b) => a.localeCompare(b)));
    const released = filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, level: "release", sort: "released" });
    expect(released[0].slug).toBe("fixture-open-weight"); // 2026-08-15 is the latest documented date
    expect(released[released.length - 1].releasedAt).toBeNull();
  });
});

describe("cross-directory search", () => {
  const entries = catalog.searchEntries();

  it("labels results by entry type", () => {
    const types = new Set(searchEntries(entries, "fixture", 100).map((e) => e.type));
    expect(types).toEqual(new Set(["organization", "model-family", "model-release", "software", "dataset"]));
  });

  it("ranks exact name matches first", () => {
    expect(searchEntries(entries, "Fixture fixture-tool")[0].slug).toBe("fixture-tool");
  });

  it("returns nothing for an empty query", () => {
    expect(searchEntries(entries, "   ")).toEqual([]);
  });

  it("agrees with each directory's own filter for the same query", () => {
    for (const q of ["fixture", "api", "cloud", "apache", "research", "nonprofit", "language model", "what is a language model", "the fixture api", "fixtureunit"]) {
      const results = searchEntries(entries, q, 1000);
      const orgHits = results.filter((r) => r.type === "organization").length;
      expect(orgHits, q).toBe(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, q }).length);
      expect(results.length - orgHits, q).toBe(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, q }).length);
    }
  });
});

describe("search query matching", () => {
  const entry = (slug: string, name: string, summary = "", type: EntryType = "software"): SearchEntry => ({ type, slug, href: `/x/${slug}/`, name, summary, keywords: "" });
  const sample = [
    entry("hf", "Hugging Face", "Hosts models and datasets.", "organization"),
    entry("anthropic", "Anthropic", "Makes the Claude models.", "organization"),
    entry("gpt-oss-20b", "gpt-oss-20b", "An open-weight model.", "model-release"),
    entry("runner", "Local runner", "Runs models on a laptop."),
    entry("guide", "Laptop guide", "Choosing a laptop for local models."),
    entry("about", "About", "Who maintains the site.", "page"),
  ];
  const find = (q: string, list = sample) => slugs(searchEntries(list, q, 100));

  it("drops question and stop words unless nothing else is left", () => {
    expect(find("what is a hugging face")[0]).toBe("hf");
    expect(find("how do i run models on my laptop")).toEqual(["runner"]);
    expect(find("about")[0]).toBe("about");
  });

  it("ignores spacing and punctuation in names, but only from the start of a word", () => {
    for (const q of ["huggingface", "hugging-face", "HuggingFace", "Hugging Face"]) expect(find(q)[0], q).toBe("hf");
    for (const q of ["gptoss", "gpt oss 20b", "gpt-oss"]) expect(find(q)[0], q).toBe("gpt-oss-20b");
    expect(find("ingface")).toEqual([]);
  });

  it("falls back to the entries matching the most words instead of nothing", () => {
    expect(find("laptop runner zzzz")).toEqual(["runner"]);
    // Three of four words, then two of four.
    expect(find("laptop guide choosing runner")).toEqual(["guide", "runner"]);
  });

  it("tolerates one-letter typos in names for longer words, below exact matches", () => {
    expect(find("antropic")).toEqual(["anthropic"]);
    expect(find("antrhopic")).toEqual(["anthropic"]);
    const withExact = [...sample, entry("note", "Spelling note", "People often type antropic by mistake.")];
    expect(find("antropic", withExact)).toEqual(["note", "anthropic"]);
    // Short words and bigger slips are not guessed at.
    expect(find("fase")).toEqual([]);
    expect(find("antrpc")).toEqual([]);
  });
});

describe("search on the published index", () => {
  let cached: SearchEntry[] | undefined;
  // Built the way scripts/generate-data.ts builds public/data/search-index.json.
  const index = () => {
    if (!cached) {
      const root = path.join(process.cwd(), "content");
      const read = (file: string) => (fs.existsSync(path.join(root, "pages", file)) ? fs.readFileSync(path.join(root, "pages", file), "utf8") : "");
      const real = loadCatalog(root, { today: new Date().toISOString().slice(0, 10) });
      cached = [...real.searchEntries(), ...referenceSearchEntries(real, parseGlossary(read("glossary.mdx")), parseFaq(read("faq.mdx")))];
    }
    return cached;
  };
  const top = (q: string, n: number) => searchEntries(index(), q, n).map((e) => `${e.type}:${e.slug}`);

  it("answers questions phrased in plain English", () => {
    const local = top("how do i run ai on my computer", 3);
    expect(local[0]).toBe("faq:run-ai-locally");
    expect(local).toContain("hub:local-ai");
    expect(top("what is rag", 2)).toEqual(expect.arrayContaining(["glossary-term:rag", "explainer:retrieval-augmented-generation"]));
  });

  it("returns the local runtimes for a query no single entry fully matches", () => {
    expect(top("run llama on my laptop", 5)).toEqual(expect.arrayContaining(["software:llama-cpp", "software:ollama", "software:llamafile"]));
  });

  it("finds organizations despite typos and spacing", () => {
    for (const q of ["antropic", "antrhopic", "anthropc"]) expect(top(q, 1), q).toEqual(["organization:anthropic"]);
    for (const q of ["huggingface", "hugging face"]) expect(top(q, 1), q).toEqual(["organization:hugging-face"]);
    expect(top("gptoss", 1)).toEqual(["model-family:gpt-oss"]);
  });

  it("keeps exact names first", () => {
    expect(top("anthropic", 1)).toEqual(["organization:anthropic"]);
    expect(top("llama", 1)).toEqual(["model-family:llama"]);
    expect(top("ollama", 1)).toEqual(["software:ollama"]);
    expect(top("about", 1)).toEqual(["page:about"]);
    // The only entry with both words; partial matches are not mixed in when full matches exist.
    expect(top("coding assistant", 3)).toEqual(["organization:github"]);
  });
});

describe("organization sort by catalog contributions", () => {
  it("orders by number of open-artifact records, then name, and round-trips in the URL", () => {
    const sorted = filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, sort: "artifacts" });
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].artifactCount).toBeGreaterThanOrEqual(sorted[i].artifactCount);
    }
    expect(parseOrgFilters(new URLSearchParams(serializeOrgFilters({ ...DEFAULT_ORG_FILTERS, sort: "artifacts" }))).sort).toBe("artifacts");
  });
});

describe("directory name relevance", () => {
  const names = ["Arcee", "OpenAI Research", "OpenAI", "Zeta"];
  const orgItems = names.map((name, i) => ({ ...orgs[0], name, slug: `org-${i}`, summary: "OpenAI tools", artifactCount: i, lastReviewed: `2026-09-0${i + 1}` }));
  const artifactItems = names.map((name, i) => ({ ...artifacts[0], name, slug: `artifact-${i}`, summary: "OpenAI tools" }));

  it("ranks exact names, prefixes, then alphabetical description matches in both directories", () => {
    for (const query of ["OpenAI", "  OPENAI  ", "OpénAI"]) {
      expect(filterOrganizations(orgItems, { ...DEFAULT_ORG_FILTERS, q: query }).map((o) => o.name)).toEqual(["OpenAI", "OpenAI Research", "Arcee", "Zeta"]);
      expect(filterArtifacts(artifactItems, { ...DEFAULT_ARTIFACT_FILTERS, q: query }).map((o) => o.name)).toEqual(["OpenAI", "OpenAI Research", "Arcee", "Zeta"]);
    }
  });

  it("preserves explicit sorting and AND filters, and restores alphabetical order when empty", () => {
    expect(filterOrganizations(orgItems, { ...DEFAULT_ORG_FILTERS, q: "OpenAI", sort: "artifacts" })[0].name).toBe("Zeta");
    expect(filterOrganizations(orgItems, { ...DEFAULT_ORG_FILTERS, q: "OpenAI", sector: "robotics" })).toEqual([]);
    expect(filterOrganizations(orgItems, DEFAULT_ORG_FILTERS).map((o) => o.name)).toEqual(["Arcee", "OpenAI", "OpenAI Research", "Zeta"]);
    expect(filterArtifacts(artifactItems, { ...DEFAULT_ARTIFACT_FILTERS, q: "!!!" }).map((o) => o.name)).toEqual(["Arcee", "OpenAI", "OpenAI Research", "Zeta"]);
  });

  it("breaks equal-name ties by stable slug regardless of input order", () => {
    const items = ["b", "a"].map((slug) => ({ ...orgItems[0], name: "OpenAI", slug }));
    expect(filterOrganizations(items, { ...DEFAULT_ORG_FILTERS, q: "OpenAI" }).map((o) => o.slug)).toEqual(["a", "b"]);
  });
});

describe("strict mode for directory counts", () => {
  const entries = [
    { type: "organization", slug: "anthropic", href: "/companies/anthropic/", name: "Anthropic", summary: "AI safety company", keywords: "" },
    { type: "organization", slug: "github", href: "/companies/github/", name: "GitHub", summary: "Code hosting", keywords: "coding" },
  ] as unknown as Parameters<typeof searchEntries>[0];
  it("finds a typo in fuzzy mode but not in strict mode", () => {
    expect(searchEntries(entries, "antropic").map((e) => e.slug)).toContain("anthropic");
    expect(searchEntries(entries, "antropic", 12, { fuzzy: false })).toEqual([]);
  });
  it("requires every word in strict mode", () => {
    expect(searchEntries(entries, "anthropic github", 12, { fuzzy: false })).toEqual([]);
    expect(searchEntries(entries, "anthropic", 12, { fuzzy: false }).map((e) => e.slug)).toEqual(["anthropic"]);
  });
});
