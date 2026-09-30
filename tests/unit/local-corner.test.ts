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

function withPeople(people: Array<Record<string, unknown>>, lineups: Array<{ month: string; people: string[] }> = []): RawContent {
  const raw = fixtureContent();
  raw.people = people.map((p) => ({ file: `people/${p.slug}.yml`, data: p }));
  raw.localCorner = { file: "local-corner.yml", data: { lineups } };
  return raw;
}

const errors = (raw: RawContent) => validateContent(raw, { today: TODAY }).issues.filter((i) => i.level === "error").map((i) => i.message);

describe("Local corner profiles", () => {
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

  it("rejects schedules naming draft or unknown profiles", () => {
    const raw = withPeople([person("fixture-a"), person("fixture-b", { publication_status: "draft" })], [{ month: "2026-10", people: ["fixture-a", "fixture-b", "nobody"] }]);
    const msgs = errors(raw);
    expect(msgs).toContain('"fixture-b" is not a published profile');
    expect(msgs).toContain('"nobody" is not a published profile');
  });

  it("uses the editor's lineup when scheduled, otherwise rotates deterministically through the pool", () => {
    const slugs = Array.from({ length: 12 }, (_, i) => `fixture-p${String(i).padStart(2, "0")}`);
    const raw = withPeople(slugs.map((s) => person(s)), [{ month: "2026-10", people: ["fixture-p03", "fixture-p07"] }]);
    const catalog = new Catalog(validateContent(raw, { today: TODAY }));
    expect(catalog.localCornerLineup("2026-10")).toMatchObject({ source: "schedule" });
    expect(catalog.localCornerLineup("2026-10").people.map((p) => p.slug)).toEqual(["fixture-p03", "fixture-p07"]);

    const nov = catalog.localCornerLineup("2026-11");
    const dec = catalog.localCornerLineup("2026-12");
    expect(nov.source).toBe("rotation");
    expect(nov.people).toHaveLength(5);
    expect(new Set(nov.people.map((p) => p.slug)).size).toBe(5);
    expect(catalog.localCornerLineup("2026-11").people).toEqual(nov.people); // deterministic
    expect(dec.people.map((p) => p.slug)).not.toEqual(nov.people.map((p) => p.slug)); // changes monthly
  });

  it("never exposes draft profiles", () => {
    const raw = withPeople([person("fixture-a"), person("fixture-secret", { publication_status: "draft" })]);
    const catalog = new Catalog(validateContent(raw, { today: TODAY }));
    expect(catalog.people.map((p) => p.slug)).toEqual(["fixture-a"]);
    expect(catalog.localCornerLineup("2027-01").people.map((p) => p.slug)).toEqual(["fixture-a"]);
  });
});
