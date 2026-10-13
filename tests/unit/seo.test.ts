import { describe, expect, it } from "vitest";
import path from "node:path";
import { loadCatalog } from "@/lib/catalog";
import { EXPLAINERS } from "@/lib/learn";
import { DESCRIPTION_MAX, documentTitle, INDEX_ROBOTS, pageMetadata, TITLE_MAX } from "@/lib/metadata";
import { computeTier } from "@/lib/openness";
import { organizationsByState } from "@/lib/place-index";
import {
  artifactSeo,
  composeDescription,
  EXPLAINER_SEARCH_TITLES,
  explainerSeo,
  fitTitle,
  hubSeo,
  leaderSeo,
  licenseGuideSeo,
  listJoin,
  organizationSeo,
  roleDescription,
  sentences,
  shortName,
  stateSeo,
} from "@/lib/seo";

// The real catalog, validated against today's date (vitest pins USASI_TODAY for fixture suites).
const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

describe("title and description helpers", () => {
  it("picks the first title that fits, else the shortest", () => {
    expect(fitTitle(["x".repeat(61), "fits", "also fits"])).toBe("fits");
    expect(fitTitle(["x".repeat(70), "y".repeat(65)])).toBe("y".repeat(65));
    expect(fitTitle([null, false, "a  b"])).toBe("a b");
  });

  it("keeps the site suffix only while the whole title fits", () => {
    expect(documentTitle("Jobs")).toBe("Jobs · USASI");
    const long = "Compare U.S. AI labs: open-weight models & openness, more";
    expect(documentTitle(long)).toBe(long);
    expect(documentTitle("x".repeat(TITLE_MAX - " · USASI".length))).toMatch(/ · USASI$/);
  });

  it("drops a trailing note from a name", () => {
    expect(shortName("Chai-1 (weights used by chai_lab 0.6.1)")).toBe("Chai-1");
    expect(shortName("Meta")).toBe("Meta");
  });

  it("splits sentences without breaking at abbreviations", () => {
    expect(sentences("It is based in the U.S. and in Canada. It ships tools.")).toEqual(["It is based in the U.S. and in Canada.", "It ships tools."]);
    expect(sentences("Acme Inc. builds things. Done.")).toEqual(["Acme Inc. builds things.", "Done."]);
  });

  it("composes descriptions within the limit, keeping required parts first", () => {
    const d = composeDescription(["Required sentence."], ["x".repeat(200), "Short optional."]);
    expect(d).toBe("Required sentence. Short optional.");
    expect(composeDescription(["word ".repeat(80)]).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(listJoin(["a", "b", "c"])).toBe("a, b, and c");
  });

  it("describes roles as nouns", () => {
    const mit = catalog.organization("mit");
    if (mit) expect(roleDescription(mit)).toBe("a university");
  });
});

describe("generated titles and descriptions", () => {
  const all = [
    ...catalog.artifacts.map((a) => ({ key: `/open/${a.slug}/`, name: a.name, seo: artifactSeo(catalog, a) })),
    ...catalog.organizations.map((o) => ({ key: `/companies/${o.slug}/`, name: o.name, seo: organizationSeo(catalog, o) })),
    ...catalog.leaders.map((l) => ({ key: `/big-si/${l.slug}/`, name: l.name, seo: leaderSeo(catalog, l) })),
    ...catalog.licenses.map((g) => ({ key: `/licenses/${g.slug}/`, name: null, seo: licenseGuideSeo(catalog, g.slug)! })),
    ...organizationsByState(catalog).states.map((s) => ({ key: `/places/${s.code}/`, name: null, seo: stateSeo(catalog, s) })),
    ...catalog.hubs.map((h) => ({ key: `/hubs/${h.slug}/`, name: h.title, seo: hubSeo(catalog, h) })),
    ...EXPLAINERS.map((e) => ({ key: `/learn/${e.slug}/`, name: null, seo: explainerSeo(e) })),
  ];

  it("fit in search results", () => {
    for (const { key, seo } of all) {
      expect(seo.title.length, key).toBeGreaterThan(0);
      expect(seo.title.length, `${key}: ${seo.title}`).toBeLessThanOrEqual(TITLE_MAX);
      expect(seo.description.length, key).toBeGreaterThan(20);
      expect(seo.description.length, `${key}: ${seo.description}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });

  it("start with the record's name", () => {
    for (const { key, name, seo } of all) {
      if (name) expect(seo.title.startsWith(shortName(name)), `${key}: ${seo.title}`).toBe(true);
    }
  });

  it("name what people search for on model releases", () => {
    for (const a of catalog.artifacts.filter((x) => x.kind === "model" && x.record_level === "release")) {
      const { title, description } = artifactSeo(catalog, a);
      expect(title, a.slug).toMatch(/license/);
      expect(description.startsWith(a.name), a.slug).toBe(true);
      if (computeTier(a) === "open-weight") expect(description, a.slug).toContain("open-weight");
      if (computeTier(a) === "restricted-weights") expect(title, a.slug).not.toContain("downloads");
    }
  });

  it("only state licenses the record lists", () => {
    for (const a of catalog.artifacts.filter((x) => x.record_level !== "family")) {
      const { description } = artifactSeo(catalog, a);
      const m = description.match(/License: ([^.]+?)\.(?: |$)/);
      if (m) expect(a.licenses.map((l) => l.spdx ?? l.name), a.slug).toContain(m[1]);
    }
  });

  it("titles state pages the way people search", () => {
    for (const s of organizationsByState(catalog).states) {
      expect(stateSeo(catalog, s).title).toBe(`AI companies & labs in ${s.code === "DC" ? "Washington, D.C." : s.name}`);
    }
  });

  it("phrase explainer titles for real explainers only", () => {
    for (const slug of Object.keys(EXPLAINER_SEARCH_TITLES)) expect(EXPLAINERS.some((e) => e.slug === slug), slug).toBe(true);
  });
});

describe("robots directives", () => {
  it("allow large previews and full snippets on indexable pages", () => {
    const meta = pageMetadata({ title: "About", description: "About.", path: "/about/" });
    expect(meta.robots).toEqual(INDEX_ROBOTS);
    expect(INDEX_ROBOTS).toMatchObject({ index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 });
  });

  it("keep noindex pages noindex", () => {
    const meta = pageMetadata({ title: "Archived", description: "Archived.", path: "/open/x/", noindex: true });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});
