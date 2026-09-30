import { describe, expect, it } from "vitest";
import { Catalog } from "@/lib/catalog";
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
    for (const q of ["fixture", "api", "cloud", "apache", "research", "nonprofit", "language model"]) {
      const results = searchEntries(entries, q, 1000);
      const orgHits = results.filter((r) => r.type === "organization").length;
      expect(orgHits, q).toBe(filterOrganizations(orgs, { ...DEFAULT_ORG_FILTERS, q }).length);
      expect(results.length - orgHits, q).toBe(filterArtifacts(artifacts, { ...DEFAULT_ARTIFACT_FILTERS, q }).length);
    }
  });
});
