import { describe, expect, it } from "vitest";
import { Catalog } from "@/lib/catalog";
import { validateContent, type RawContent } from "@/lib/validate";
import { fixtureContent, TODAY } from "../fixtures/content";

function person(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    slug,
    name: `Fixture Person ${slug}`,
    initials: "FP",
    headline: "Maintains a fixture runtime for local models",
    bio: { text: "Works on a fixture runtime that runs models on personal computers.", source_ids: ["s1"] },
    affiliations: [{ name: "Fixture parent", organization_slug: "fixture-parent", role: "Engineer", current: true, source_ids: ["s1"] }],
    work: [{ name: "Fixture tool", artifact_slug: "fixture-tool", url: null, contribution: "Maintains the fixture tool.", source_ids: ["s1"] }],
    links: [],
    publication_status: "published",
    updated_at: TODAY,
    last_reviewed: TODAY,
    sources: [{ id: "s1", title: "Fixture profile page", url: "https://people.usasi-fixtures.org/p", publisher: "Fixture", kind: "official-page", published_at: null, accessed_at: TODAY }],
    ...overrides,
  };
}

function withPeople(people: Array<Record<string, unknown>>): RawContent {
  const raw = fixtureContent();
  raw.people = people.map((p) => ({ file: `people/${p.slug}.yml`, data: p }));
  return raw;
}

const errors = (raw: RawContent) => validateContent(raw, { today: TODAY }).issues.filter((i) => i.level === "error").map((i) => i.message);

describe("People Behind Local AI profiles", () => {
  it("accepts a professional, sourced profile tied to the catalog", () => {
    expect(errors(withPeople([person("fixture-a")]))).toEqual([]);
  });

  it.each([
    ["location", "They live in a fixture town and maintain the runtime."],
    ["birthplace", "Born in a fixture city, they maintain the runtime."],
    ["nationality", "Their nationality is recorded here."],
    ["family", "Married with children, they maintain the runtime."],
  ])("rejects personal details (%s)", (_label, text) => {
    const raw = withPeople([person("fixture-a", { bio: { text, source_ids: ["s1"] } })]);
    expect(errors(raw).some((m) => m.startsWith("Personal detail not allowed"))).toBe(true);
  });

  it("rejects fields outside the professional schema", () => {
    const raw = withPeople([person("fixture-a", { location: "Anywhere" })]);
    expect(errors(raw).length).toBeGreaterThan(0);
  });

  it("requires a published profile to link to a published catalog record", () => {
    const raw = withPeople([
      person("fixture-a", {
        affiliations: [{ name: "Elsewhere", organization_slug: null, role: "Engineer", current: true, source_ids: ["s1"] }],
        work: [{ name: "Elsewhere tool", artifact_slug: null, url: null, contribution: "Maintains a tool.", source_ids: ["s1"] }],
      }),
    ]);
    expect(errors(raw)).toContain("A published profile must link to at least one published catalog organization or artifact");
  });

  it("lists every published profile, alphabetically by name, with no monthly limit", () => {
    const slugs = Array.from({ length: 12 }, (_, i) => `fixture-p${String(11 - i).padStart(2, "0")}`);
    const catalog = new Catalog(validateContent(withPeople(slugs.map((s) => person(s))), { today: TODAY }));
    expect(catalog.people).toHaveLength(12);
    expect(catalog.people.map((p) => p.name)).toEqual([...catalog.people.map((p) => p.name)].sort((a, b) => a.localeCompare(b)));
  });

  it("never exposes draft profiles", () => {
    const raw = withPeople([person("fixture-a"), person("fixture-secret", { publication_status: "draft" })]);
    const catalog = new Catalog(validateContent(raw, { today: TODAY }));
    expect(catalog.people.map((p) => p.slug)).toEqual(["fixture-a"]);
  });
});
