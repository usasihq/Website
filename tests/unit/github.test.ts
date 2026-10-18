import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { assignSlugs, baseSlug, cleanDescription, compareProjects, exclusionReason, toProject, type RawRepo } from "@/lib/github/filters";
import { filterGithub, licenseKey, parseGithubFilters, serializeGithubFilters, type GithubListItem } from "@/lib/github/directory";
import { compactStars, heroArt, heroHue, heroPattern, PATTERNS } from "@/lib/github/hero";
import { catalogRepositoryLinks, denylistMap, readGithubDataset, readIncludes, reviewedAiRepos, serializeGithubDataset } from "@/lib/github/load";
import { catalogMatch, githubEntries, githubHref, githubSearchEntries, projectHero, relatedProjects, repoKey } from "@/lib/github/projects";
import { checkGithubDataset, GithubDataset } from "@/lib/github/schema";
import { validateGithubData } from "@/lib/github/validate";
import { isKnownSitePath } from "@/lib/site-routes";

const repo = (over: Partial<RawRepo> = {}): RawRepo => ({
  id: 1,
  full_name: "acme/agent-kit",
  name: "agent-kit",
  owner: { login: "acme", type: "Organization" },
  description: "A framework for building LLM agents",
  html_url: "https://github.com/acme/agent-kit",
  homepage: "https://agentkit.dev",
  stargazers_count: 1200,
  forks_count: 10,
  open_issues_count: 3,
  language: "Python",
  license: { spdx_id: "MIT", name: "MIT License" },
  topics: ["llm", "agents"],
  created_at: "2023-01-02T03:04:05Z",
  pushed_at: "2026-10-01T00:00:00Z",
  default_branch: "main",
  fork: false,
  archived: false,
  disabled: false,
  ...over,
});

describe("AI on GitHub inclusion rules", () => {
  it("keeps an ordinary AI project", () => {
    expect(exclusionReason(repo())).toBeNull();
  });

  it("drops forks, archived and disabled repositories", () => {
    expect(exclusionReason(repo({ fork: true }))).toBe("fork");
    expect(exclusionReason(repo({ archived: true }))).toBe("archived");
    expect(exclusionReason(repo({ disabled: true }))).toBe("archived");
  });

  it("drops curated link lists", () => {
    expect(exclusionReason(repo({ name: "awesome-llm", full_name: "x/awesome-llm" }))).toBe("list");
    expect(exclusionReason(repo({ name: "llm-resources", description: "A curated list of resources for large language models" }))).toBe("list");
    expect(exclusionReason(repo({ name: "ai-tools", description: "A collection of links to the best AI tools" }))).toBe("list");
    expect(exclusionReason(repo({ topics: ["awesome-list", "llm"] }))).toBe("list");
  });

  it("drops courses, tutorials, books, interview prep, and roadmaps", () => {
    expect(exclusionReason(repo({ description: "12 weeks, 26 lessons: a machine learning course for beginners" }))).toBe("education");
    expect(exclusionReason(repo({ description: "Code for the book Deep Learning with PyTorch" }))).toBe("education");
    expect(exclusionReason(repo({ description: "Machine learning interview questions and answers" }))).toBe("education");
    expect(exclusionReason(repo({ description: "Roadmap to becoming an AI engineer" }))).toBe("education");
    expect(exclusionReason(repo({ topics: ["tutorial", "pytorch"] }))).toBe("education");
    // "notebook" and "Facebook" are not "book".
    expect(exclusionReason(repo({ description: "Run LLM agents in a Jupyter notebook, from Facebook research" }))).toBeNull();
  });

  it("drops collected system prompts and jailbreaks, but not defenses", () => {
    expect(exclusionReason(repo({ description: "Full system prompts of popular AI tools, leaked" }))).toBe("prompts");
    expect(exclusionReason(repo({ name: "chatgpt-jailbreaks", description: "Jailbreak prompts for ChatGPT" }))).toBe("prompts");
    expect(exclusionReason(repo({ description: "Detect jailbreak and prompt injection attempts against LLM apps" }))).toBeNull();
  });

  it("drops deepfake and face-swap tools, but not detectors", () => {
    expect(exclusionReason(repo({ name: "faceswap", description: "Deepfakes software for all" }))).toBe("deepfake");
    expect(exclusionReason(repo({ description: "Real-time face swap for video calls with one image" }))).toBe("deepfake");
    expect(exclusionReason(repo({ description: "Deepfake detection models and benchmark" }))).toBeNull();
  });

  it("drops repositories with no AI signal", () => {
    expect(exclusionReason(repo({ name: "dotfiles", description: "My terminal configuration", topics: ["zsh", "vim"] }))).toBe("non-ai");
    expect(exclusionReason(repo({ name: "notes", description: "A note-taking app", topics: ["ai"] }))).toBeNull();
  });

  it("skips only the no-AI-signal rule for reviewed must-includes and catalog repositories", () => {
    const quiet = repo({ name: "t3code", full_name: "acme/t3code", description: "T3 Code", topics: [] });
    expect(exclusionReason(quiet)).toBe("non-ai");
    expect(exclusionReason(quiet, new Map(), new Set(["acme/t3code"]))).toBeNull();
    expect(exclusionReason({ ...quiet, archived: true }, new Map(), new Set(["acme/t3code"]))).toBe("archived");
    expect(exclusionReason({ ...quiet, name: "awesome-x", full_name: "acme/awesome-x" }, new Map(), new Set(["acme/awesome-x"]))).toBe("list");
  });

  it("reads the must-include list and the catalog's repository links", () => {
    const inc = readIncludes();
    expect(inc.length).toBeGreaterThanOrEqual(16);
    expect(inc.every((i) => i.reason.length > 2)).toBe(true);
    expect(catalogRepositoryLinks()).toContain("vllm-project/vllm");
    expect(reviewedAiRepos().has("anthropics/claude-code")).toBe(true);
  });

  it("applies the reviewed denylist with its reason", () => {
    const deny = denylistMap([{ full_name: "Acme/Agent-Kit", reason: "other", note: "Reviewed: test entry" }]);
    expect(exclusionReason(repo(), deny)).toBe("other");
  });
});

describe("AI on GitHub records", () => {
  it("cleans descriptions to trimmed plain text", () => {
    expect(cleanDescription(":rocket: Fast   LLM\u0007 inference :fire:")).toBe("Fast LLM inference");
    const long = cleanDescription("word ".repeat(100), 300);
    expect(long.length).toBeLessThanOrEqual(300);
    expect(long.endsWith("…")).toBe(true);
    expect(cleanDescription(null)).toBe("");
  });

  it("stores only factual fields and only https homepages", () => {
    const p = toProject(repo({ homepage: "http://agentkit.dev", license: { spdx_id: "NOASSERTION", name: "Other" } }));
    expect(p.homepage).toBeNull();
    expect(p.license_spdx).toBeNull();
    expect(p.license_name).toBe("Other");
    expect(licenseKey(p)).toBe("Other");
    expect(Object.keys(p).sort()).toEqual(
      ["created_at", "default_branch", "description", "forks", "full_name", "homepage", "html_url", "id", "language", "license_name", "license_spdx", "name", "open_issues", "owner", "owner_type", "pushed_at", "stars", "topics"].sort(),
    );
    expect(toProject(repo({ homepage: "javascript:alert(1)" })).homepage).toBeNull();
    expect(toProject(repo()).homepage).toBe("https://agentkit.dev");
    expect(licenseKey(toProject(repo({ license: null })))).toBe("None");
  });

  it("makes lowercase, slug-safe owner--repo slugs and resolves collisions in rank order", () => {
    expect(baseSlug("Significant-Gravitas/AutoGPT")).toBe("significant-gravitas--autogpt");
    expect(baseSlug("openai/whisper.cpp")).toBe("openai--whisper-cpp");
    expect(baseSlug("x/__init__")).toBe("x--init");
    expect(baseSlug("a/b--c")).toBe("a--b-c");
    expect(assignSlugs([{ full_name: "a/foo.js" }, { full_name: "a/foo-js" }, { full_name: "a/foo_js" }])).toEqual(["a--foo-js", "a--foo-js-2", "a--foo-js-3"]);
  });

  it("checks schema, order, and uniqueness of a snapshot", () => {
    const a = toProject(repo({ id: 1, full_name: "a/x", name: "x", owner: { login: "a", type: "User" }, html_url: "https://github.com/a/x", stargazers_count: 900 }));
    const b = toProject(repo({ id: 2, full_name: "b/y", name: "y", owner: { login: "b", type: "User" }, html_url: "https://github.com/b/y", stargazers_count: 800 }));
    const base = { fetched_at: "2026-10-18T00:00:00Z", source: "https://api.github.com/search/repositories", queries: ["topic:llm stars:>=500"], min_stars: 500, fetched_count: 2, excluded: {} };
    expect(checkGithubDataset({ ...base, projects: [a, b] })).toEqual([]);
    expect(checkGithubDataset({ ...base, projects: [b, a] }).join()).toMatch(/not sorted/);
    expect(checkGithubDataset({ ...base, projects: [a, a] }).join()).toMatch(/duplicate/);
    expect(checkGithubDataset({ ...base, projects: [{ ...a, extra: 1 }] }).length).toBeGreaterThan(0);
    expect(checkGithubDataset({ ...base, projects: [{ ...a, homepage: "http://x.dev" }] }).length).toBeGreaterThan(0);
    // Stable serialization round-trips.
    const data = GithubDataset.parse({ ...base, projects: [a, b] });
    expect(JSON.parse(serializeGithubDataset(data))).toEqual(data);
    expect([b, a].sort(compareProjects)).toEqual([a, b]);
  });
});

describe("AI on GitHub filters and URL state", () => {
  const items: GithubListItem[] = [
    { slug: "a--x", rank: 1, fullName: "a/x", owner: "a", ownerType: "Organization", name: "x", description: "Agent framework", stars: 900, language: "Python", license: "MIT", topics: ["agents"], pushedAt: "2026-10-01" },
    { slug: "b--y", rank: 2, fullName: "b/y", owner: "b", ownerType: "User", name: "y", description: "Speech recognition", stars: 800, language: "C++", license: "None", topics: ["asr"], pushedAt: "2026-09-01" },
  ];

  it("round-trips filters and rejects junk values", () => {
    const f = parseGithubFilters(new URLSearchParams("q=agent&topic=agents&lang=C%2B%2B&license=MIT&owner=User"));
    expect(f).toEqual({ q: "agent", topic: "agents", lang: "C++", license: "MIT", owner: "User" });
    expect(parseGithubFilters(new URLSearchParams(serializeGithubFilters(f)))).toEqual(f);
    expect(parseGithubFilters(new URLSearchParams("topic=<script>&owner=Admin&license=a b"))).toEqual({ q: "", topic: "", lang: "", license: "", owner: "" });
  });

  it("filters by text, topic, language, license, and owner type in rank order", () => {
    const run = (q: string) => filterGithub(items, parseGithubFilters(new URLSearchParams(q))).map((i) => i.slug);
    expect(run("")).toEqual(["a--x", "b--y"]);
    expect(run("q=speech")).toEqual(["b--y"]);
    expect(run("topic=agents")).toEqual(["a--x"]);
    expect(run("lang=C%2B%2B")).toEqual(["b--y"]);
    expect(run("license=None")).toEqual(["b--y"]);
    expect(run("owner=Organization")).toEqual(["a--x"]);
    expect(run("q=nothing-matches")).toEqual([]);
  });
});

describe("AI on GitHub hero images", () => {
  it("draws the same artwork for the same seed and different artwork for others", () => {
    expect(heroArt("a/b")).toBe(heroArt("a/b"));
    expect(heroArt("a/b")).not.toBe(heroArt("a/c"));
    expect(heroArt("ollama/ollama")).toMatch(/^<svg [^>]*width="1200" height="630"/);
    const hues = new Set(["a/1", "a/2", "a/3", "a/4", "a/5", "a/6", "a/7", "a/8"].map(heroHue));
    expect(hues.size).toBeGreaterThan(4);
    for (const h of hues) expect(h > 45 && h < 85).toBe(false);
    const seen = new Set(Array.from({ length: 40 }, (_, i) => heroPattern(`seed/${i}`)));
    expect(seen.size).toBe(PATTERNS.length);
  });

  it("formats compact star counts", () => {
    expect(compactStars(950)).toBe("950");
    expect(compactStars(1000)).toBe("1k");
    expect(compactStars(12_345)).toBe("12.3k");
    expect(compactStars(123_456)).toBe("123k");
  });
});

describe("AI on GitHub snapshot", () => {
  const data = readGithubDataset();
  const entries = githubEntries(data);

  it("passes validation and has a large ranked list", () => {
    expect(validateGithubData()).toEqual([]);
    expect(entries.length).toBeGreaterThan(500);
    expect(entries[0].rank).toBe(1);
    expect(new Set(entries.map((e) => e.slug)).size).toBe(entries.length);
    expect(entries.every((e, i) => i === 0 || entries[i - 1].stars >= e.stars)).toBe(true);
  });

  it("gives every project a hero with a descriptive alt and a known site path", () => {
    const slugs = new Set(entries.map((e) => e.slug));
    for (const e of entries.slice(0, 50)) {
      const h = projectHero(e);
      expect(h.image).toBe(`/og/github/${e.slug}.jpg`);
      expect(h.alt).toContain(e.full_name);
      expect(h.alt).not.toMatch(/rank|stars/i);
      if (e.language) expect(h.facts).toContain(e.language);
      expect(isKnownSitePath(githubHref(e.slug), { organizations: new Set(), artifacts: new Set(), news: new Set(), hubs: new Set(), licenses: new Set(), explainers: new Set(), paths: new Set(), issues: new Set(), github: slugs })).toBe(true);
    }
  });

  it("keeps hero images stable when rank, stars, and dates change", () => {
    const e = entries[3];
    const moved = { ...e, rank: e.rank + 40, stars: e.stars + 1234, forks: e.forks + 9, open_issues: 0, pushed_at: "2030-01-01T00:00:00Z" };
    expect(projectHero(moved)).toEqual(projectHero(e));
    expect(JSON.stringify(projectHero(e))).not.toContain(String(e.stars));
  });

  it("finds related projects by shared topics, never the project itself", () => {
    const e = entries.find((x) => x.topics.length >= 3)!;
    const rel = relatedProjects(e, 6, entries);
    expect(rel.length).toBeGreaterThan(0);
    expect(rel.length).toBeLessThanOrEqual(6);
    expect(rel.some((r) => r.slug === e.slug)).toBe(false);
    expect(rel.every((r) => r.topics.some((t) => e.topics.includes(t)))).toBe(true);
  });

  it("indexes the top projects in site search", () => {
    const search = githubSearchEntries(data);
    expect(search.length).toBe(Math.min(entries.length, 1000));
    expect(search[0].href).toBe(entries[0].href);
    expect(search.every((s) => s.type === "github-project" && s.href.startsWith("/github/"))).toBe(true);
  });

  it("links to the USASI catalog record that names the same repository", () => {
    expect(repoKey("https://github.com/vllm-project/vllm")).toBe("vllm-project/vllm");
    expect(repoKey("https://github.com/vllm-project/vllm.git")).toBe("vllm-project/vllm");
    expect(repoKey("https://github.com/vllm-project/vllm/blob/main/LICENSE")).toBe("vllm-project/vllm");
    expect(repoKey("https://github.com/orgs/vllm-project")).toBeNull();
    expect(repoKey("https://gitlab.com/a/b")).toBeNull();
    const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
    const vllm = entries.find((e) => e.full_name.toLowerCase() === "vllm-project/vllm");
    if (vllm) expect(catalogMatch(catalog, vllm)?.href).toBe("/open/vllm/");
  });
});
