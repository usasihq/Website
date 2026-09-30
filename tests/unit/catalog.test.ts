import path from "node:path";
import { describe, expect, it } from "vitest";
import { Catalog, ContentValidationError, loadCatalog } from "@/lib/catalog";
import { readRawContent } from "@/lib/content-loader";
import { validateContent } from "@/lib/validate";
import { fixtureContent, TODAY } from "../fixtures/content";

const catalog = new Catalog(validateContent(fixtureContent(), { today: TODAY }), "2026-09-29T12:00:00.000Z");

describe("catalog: publication filtering", () => {
  it("includes only published + eligible records in directories", () => {
    const orgSlugs = catalog.organizations.map((o) => o.slug);
    expect(orgSlugs).toEqual(expect.arrayContaining(["fixture-parent", "fixture-unit", "fixture-nonprofit"]));
    expect(orgSlugs).not.toContain("fixture-draft-org");
    expect(orgSlugs).not.toContain("fixture-pending-org");
    expect(orgSlugs).not.toContain("fixture-archived-org");
    expect(catalog.artifacts.map((a) => a.slug)).not.toContain("fixture-draft-artifact");
  });

  it("never exposes drafts, even by direct lookup", () => {
    expect(catalog.organization("fixture-draft-org")).toBeUndefined();
    expect(catalog.artifact("fixture-draft-artifact")).toBeUndefined();
  });

  it("keeps archived records reachable for their historical page but out of lists and counts", () => {
    expect(catalog.organization("fixture-archived-org")?.publication_status).toBe("archived");
    expect(catalog.archivedArtifacts.map((a) => a.slug)).toEqual(["fixture-archived-artifact"]);
    expect(catalog.counts().organizations).toBe(3);
  });

  it("keeps drafts and archived records out of the search index", () => {
    const slugs = catalog.searchEntries().map((e) => e.slug);
    for (const hidden of ["fixture-draft-org", "fixture-pending-org", "fixture-archived-org", "fixture-draft-artifact", "fixture-archived-artifact"]) {
      expect(slugs).not.toContain(hidden);
    }
    expect(JSON.stringify(catalog.searchEntries())).not.toContain("Secret Draft");
  });
});

describe("catalog: derived relationships", () => {
  it("derives organization → artifact reverse links from artifact records", () => {
    const parent = catalog.artifactsForOrganization("fixture-parent").map((a) => a.slug);
    expect(parent).toContain("fixture-open-stack");
    expect(parent).not.toContain("fixture-dataset");
    expect(catalog.artifactsForOrganization("fixture-unit").map((a) => a.slug)).toEqual(["fixture-open-stack"]);
    expect(catalog.artifactsForOrganization("fixture-nonprofit").map((a) => a.slug)).toEqual(["fixture-dataset"]);
  });

  it("derives parent and child organizations", () => {
    const unit = catalog.organization("fixture-unit")!;
    expect(catalog.parentOrganization(unit)?.slug).toBe("fixture-parent");
    expect(catalog.childOrganizations("fixture-parent").map((o) => o.slug)).toEqual(["fixture-unit"]);
  });

  it("links releases to families and derivatives to their source", () => {
    const releases = catalog.releasesOf("fixture-family").map((r) => r.slug);
    expect(releases).toEqual(
      expect.arrayContaining(["fixture-fully-open", "fixture-open-stack", "fixture-open-weight", "fixture-closed-weights", "fixture-unknown-weights"]),
    );
    expect(releases).not.toContain("fixture-archived-artifact");
    expect(catalog.familyOf(catalog.artifact("fixture-open-weight")!)?.slug).toBe("fixture-family");
    expect(catalog.derivativesOf("fixture-tool").map((a) => a.slug)).toEqual(["fixture-dataset"]);
  });
});

describe("catalog: counting", () => {
  it("counts families separately from releases and units separately from top-level organizations", () => {
    const counts = catalog.counts();
    expect(counts.modelFamilies).toBe(1);
    expect(counts.modelReleases).toBe(5);
    expect(counts.organizationUnits).toBe(1);
    expect(counts.independentOrganizations).toBe(2);
    expect(counts.organizations).toBe(counts.independentOrganizations + counts.organizationUnits);
    expect(counts.software).toBe(1);
    expect(counts.datasets).toBe(1);
  });

  it("counts hosted-model products only from sourced product records", () => {
    const parent = catalog.organization("fixture-parent")!;
    expect(catalog.hostedModelProducts(parent).map((p) => p.id)).toEqual(["fixture-api"]);
    expect(catalog.toOrgListItem(parent).hostedModelProductCount).toBe(1);
  });
});

describe("catalog: loading from disk", () => {
  it("throws a ContentValidationError when content is invalid", () => {
    const raw = fixtureContent();
    raw.organizations.push({ file: "organizations/broken.yml", data: { slug: "broken" } });
    const validated = validateContent(raw, { today: TODAY });
    expect(validated.issues.some((i) => i.level === "error")).toBe(true);
    expect(() => {
      const errors = validated.issues.filter((i) => i.level === "error");
      if (errors.length) throw new ContentValidationError(errors);
    }).toThrow(/validation error/);
  });

  it("the real /content tree validates and loads", () => {
    const root = path.join(process.cwd(), "content");
    const validated = validateContent(readRawContent(root), { today: TODAY });
    expect(validated.issues.filter((i) => i.level === "error")).toEqual([]);
    const real = loadCatalog(root, { today: TODAY });
    expect(real.organizations.length).toBeGreaterThan(0);
    expect(real.artifacts.length).toBeGreaterThan(0);
    // Test fixtures never leak into the real catalog.
    expect(JSON.stringify(real.searchEntries())).not.toMatch(/fixture/i);
  });
});

describe("catalog: public exports", () => {
  it("strips references to unpublished records from exported copies", () => {
    const raw = fixtureContent();
    const ds = raw.artifacts.find((a) => (a.data as { slug: string }).slug === "fixture-dataset")!.data as Record<string, unknown>;
    ds.provenance = {
      text: "Fixture dataset derived from an unpublished draft.",
      derived_from: [{ name: "Draft thing", artifact_slug: "fixture-draft-artifact", url: null, note: null }],
      source_ids: ["s1"],
    };
    const c = new Catalog(validateContent(raw, { today: TODAY }));
    const exported = JSON.stringify(c.artifacts.map((a) => c.publicArtifact(a)));
    expect(exported).not.toContain("fixture-draft-artifact");
    expect(exported).toContain("Draft thing");
  });
});
