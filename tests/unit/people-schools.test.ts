import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { schoolIndexSeo, schoolListSeo } from "@/lib/people-seo";
import { MIN_SCHOOL_PEOPLE, PEOPLE_SCHOOLS, personSchoolLinks, schoolPeopleLists } from "@/lib/people-schools";
import { TITLE_MAX } from "@/lib/metadata";
import { personLd } from "@/lib/structured-data";
import { isKnownSitePath } from "@/lib/site-routes";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

describe("people-by-school pages", () => {
  const lists = schoolPeopleLists(catalog);

  it("publishes at least the ten largest schools, each with five or more people", () => {
    expect(lists.length).toBeGreaterThanOrEqual(10);
    expect(lists.every((l) => l.items.length >= MIN_SCHOOL_PEOPLE)).toBe(true);
    expect(lists.map((l) => l.items.length)).toEqual([...lists.map((l) => l.items.length)].sort((a, b) => b - a));
    const slugs = new Set(PEOPLE_SCHOOLS.map((s) => s.slug));
    for (const list of lists) expect(slugs.has(list.slug)).toBe(true);
  });

  it("lists people alphabetically and only once per school", () => {
    for (const list of lists) {
      const names = list.items.map((i) => i.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
      expect(new Set(list.items.map((i) => i.href)).size).toBe(list.items.length);
    }
  });

  it("writes titles and descriptions in the People search style", () => {
    const index = schoolIndexSeo(lists.length, new Set(lists.flatMap((l) => l.items.map((i) => i.href))).size);
    expect(index.title.length).toBeGreaterThan(10);
    expect(index.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(index.description.length).toBeGreaterThan(20);
    expect(index.description.length).toBeLessThanOrEqual(160);
    for (const list of lists.slice(0, 12)) {
      const seo = schoolListSeo(list);
      expect(seo.title, list.slug).toContain(list.shortName);
      expect(seo.title.length, seo.title).toBeLessThanOrEqual(TITLE_MAX);
      expect(seo.description, list.slug).toContain(String(list.items.length));
      expect(seo.description.length, list.slug).toBeLessThanOrEqual(160);
    }
  });

  it("exposes school and identifier pages as known site paths", () => {
    expect(isKnownSitePath("/people/school/", { organizations: new Set(), artifacts: new Set(), news: new Set(), hubs: new Set(), licenses: new Set(), explainers: new Set(), paths: new Set(), issues: new Set() })).toBe(true);
    expect(isKnownSitePath(lists[0].path, { organizations: new Set(), artifacts: new Set(), news: new Set(), hubs: new Set(), licenses: new Set(), explainers: new Set(), paths: new Set(), issues: new Set() })).toBe(true);
  });
});

describe("Person JSON-LD enrichment", () => {
  it("adds alumniOf for a documented Stanford education", () => {
    const p = catalog.person("andrej-karpathy")!;
    expect(personSchoolLinks(p).some((s) => s.slug === "stanford-university" && s.kind === "education")).toBe(true);
    const ld = personLd(catalog, p) as unknown as { mainEntity: { alumniOf?: { name: string }[]; sameAs?: string[]; image?: string } };
    expect(ld.mainEntity.alumniOf?.some((o) => /Stanford/i.test(o.name))).toBe(true);
    expect(ld.mainEntity.sameAs?.some((u) => u.includes("wikidata.org/wiki/Q"))).toBe(true);
    expect(ld.mainEntity.sameAs?.some((u) => u.startsWith("https://en.wikipedia.org/wiki/"))).toBe(true);
    expect(ld.mainEntity.image?.startsWith("https://upload.wikimedia.org/")).toBe(true);
  });

  it("adds affiliation for a current academic employer", () => {
    const p = catalog.person("andrew-ng")!;
    const ld = personLd(catalog, p) as unknown as { mainEntity: { affiliation?: { name: string }[]; worksFor?: { name: string }[] } };
    expect(ld.mainEntity.affiliation?.some((o) => /Stanford/i.test(o.name))).toBe(true);
    expect(ld.mainEntity.worksFor?.length).toBeGreaterThan(0);
  });
});
