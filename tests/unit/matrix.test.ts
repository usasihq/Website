import path from "node:path";
import { describe, expect, it } from "vitest";
import { Catalog, loadCatalog } from "@/lib/catalog";
import { buildCoverage, buildModelMatrix, MODEL_COLUMNS } from "@/lib/matrix";
import { filterArtifacts, filterOrganizations, parseArtifactFilters, parseOrgFilters } from "@/lib/search";
import { validateContent } from "@/lib/validate";
import { fixtureContent, TODAY } from "../fixtures/content";

function setup(catalog: Catalog) {
  const orgs = catalog.organizations.map((o) => catalog.toOrgListItem(o));
  const artifacts = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
  const hosted = Object.fromEntries(catalog.organizations.map((o) => [o.slug, catalog.hostedModelProducts(o).map((p) => p.id)]));
  return { orgs, artifacts, rows: buildModelMatrix(orgs, artifacts, hosted), coverage: buildCoverage(orgs, artifacts) };
}

/** Follow a cell link exactly as the directory page would, and return what it lists. */
function resolve(href: string, data: ReturnType<typeof setup>) {
  const url = new URL(href, "https://usasi.test");
  if (url.pathname === "/open/") return filterArtifacts(data.artifacts, parseArtifactFilters(url.searchParams)).map((a) => a.slug);
  if (url.pathname === "/companies/") return filterOrganizations(data.orgs, parseOrgFilters(url.searchParams)).map((o) => o.slug);
  throw new Error(`unexpected link ${href}`);
}

for (const [label, catalog] of [
  ["fixtures", new Catalog(validateContent(fixtureContent(), { today: TODAY }))],
  ["real content", loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) })],
] as const) {
  describe(`matrix (${label})`, () => {
    const data = setup(catalog);

    it("every model-view cell links to exactly the records it counts", () => {
      for (const row of data.rows) {
        for (const column of MODEL_COLUMNS) {
          const cell = row.cells[column.key];
          const listed = resolve(cell.href, data);
          expect(listed, `${row.org.slug} / ${column.key}`).toEqual(cell.slugs);
          expect(cell.count).toBe(listed.length);
        }
      }
    });

    it("hosted-product cells count sourced product records on the organization", () => {
      for (const row of data.rows) {
        const org = catalog.organization(row.org.slug)!;
        expect(row.hosted.slugs).toEqual(catalog.hostedModelProducts(org).map((p) => p.id));
        expect(row.hosted.href).toBe(`/companies/${row.org.slug}/#hosted-model-products`);
      }
    });

    it("every coverage cell links to exactly the records it counts", () => {
      for (const row of data.coverage) {
        expect(resolve(row.cell.href, data), row.key).toEqual(row.cell.slugs);
      }
    });

    it("tier columns overlap cumulatively and never exceed the release count", () => {
      for (const row of data.rows) {
        const c = row.cells;
        expect(c["fully-open"].count).toBeLessThanOrEqual(c["open-stack"].count);
        expect(c["open-stack"].count).toBeLessThanOrEqual(c["open-weight"].count);
        expect(c["open-weight"].count).toBeLessThanOrEqual(c["releases"].count);
        for (const slug of c["fully-open"].slugs) expect(c["open-stack"].slugs).toContain(slug);
        for (const slug of c["open-stack"].slugs) expect(c["open-weight"].slugs).toContain(slug);
      }
    });

    it("counts family overviews separately from releases", () => {
      const families = data.coverage.find((r) => r.key === "families")!.cell;
      const releases = data.coverage.find((r) => r.key === "releases")!.cell;
      expect(families.slugs.filter((s) => releases.slugs.includes(s))).toEqual([]);
      expect(families.count).toBe(catalog.counts().modelFamilies);
      expect(releases.count).toBe(catalog.counts().modelReleases);
    });

    it("counts units separately so parent + unit is not two independent companies", () => {
      const all = data.coverage.find((r) => r.key === "organizations")!.cell.count;
      const top = data.coverage.find((r) => r.key === "independent")!.cell.count;
      const units = data.coverage.find((r) => r.key === "units")!.cell.count;
      expect(top + units).toBe(all);
    });
  });
}
