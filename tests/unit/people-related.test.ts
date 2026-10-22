import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { canLinkRelatedPeople, RELATED_PEOPLE_MAX, relatedPeople } from "@/lib/people-related";
import { personHref } from "@/lib/routes";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

describe("related people on bios", () => {
  it("links profiles that previously had no colleagues, via field or school", () => {
    for (const slug of ["lilian-weng", "wes-roth"]) {
      const p = catalog.person(slug)!;
      const related = relatedPeople(catalog, p);
      expect(related.people.length, slug).toBeGreaterThan(0);
      expect(related.people.length, slug).toBeLessThanOrEqual(RELATED_PEOPLE_MAX);
      expect(related.people.every((r) => r.href !== personHref(p.slug)), slug).toBe(true);
      expect(related.people.every((r) => r.href.startsWith("/people/") || r.href.startsWith("/big-si/")), slug).toBe(true);
      expect(related.hubs.length, slug).toBeGreaterThan(0);
    }
  });

  it("picks the same people on every call so static builds stay stable", () => {
    const p = catalog.person("tri-dao")!;
    expect(relatedPeople(catalog, p)).toEqual(relatedPeople(catalog, p));
  });

  it("links every bio to at least one other person when they share an org, field, or school", () => {
    const missing: string[] = [];
    for (const p of catalog.people) {
      const related = relatedPeople(catalog, p);
      expect(related.people.length, p.slug).toBeLessThanOrEqual(RELATED_PEOPLE_MAX);
      expect(new Set(related.people.map((r) => r.href)).size, p.slug).toBe(related.people.length);
      expect(related.people.some((r) => r.href === personHref(p.slug)), p.slug).toBe(false);
      if (canLinkRelatedPeople(catalog, p) && related.people.length === 0) missing.push(p.slug);
    }
    expect(missing).toEqual([]);
  });
});
