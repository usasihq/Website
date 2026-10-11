import { describe, expect, it } from "vitest";
import { Catalog } from "@/lib/catalog";
import { validateContent, type RawContent } from "@/lib/validate";
import { fixtureContent, org, TODAY } from "../fixtures/content";

const src = (id: string) => ({ id, title: `Source ${id}`, url: `https://usasi-fixtures.org/${id}`, publisher: "Fixture", kind: "official-page", accessed_at: TODAY });
const errorsFor = (raw: RawContent) => validateContent(raw, { today: TODAY }).issues.filter((i) => i.level === "error");

function withDeepDive(deep: Record<string, unknown>): RawContent {
  const raw = fixtureContent();
  raw.organizations.push({ file: "organizations/fixture-deep.yml", data: org("fixture-deep", { deep_dive: { reviewed_at: TODAY, ...deep } }) });
  return raw;
}

function leader(overrides: Record<string, unknown> = {}) {
  return {
    slug: "fixture-leader",
    name: "Fixture Leader",
    initials: "FL",
    headline: "Founder who built a fixture company from a dorm room",
    summary: { text: "Fixture Leader founded a fixture company.", source_ids: ["s1"] },
    current_roles: [{ organization: "Fixture", organization_slug: null, role: "Chief Executive Officer", since: "2010", source_ids: ["s1"] }],
    bio_sections: [{ heading: "Early career", paragraphs: [{ text: "Fixture Leader studied engineering.", source_ids: ["s1"] }] }],
    timeline: [{ date: "2010", text: "Founded the fixture company.", source_ids: ["s1"] }],
    publication_status: "published",
    updated_at: TODAY,
    last_reviewed: TODAY,
    sources: [src("s1")],
    ...overrides,
  };
}

function withLeader(data: Record<string, unknown>): RawContent {
  const raw = fixtureContent();
  raw.leaders = [{ file: `leaders/${data.slug}.yml`, data }];
  return raw;
}

describe("organization deep dives", () => {
  const ok = {
    overview: [{ text: "Fixture builds models.", source_ids: ["s1"] }],
    sections: [{ id: "models", title: "Models", items: [{ text: "Fixture Model 1 is offered through an API.", source_ids: ["s1"] }] }],
    lineup: [{ name: "Fixture Model 1", kind: "model", status: "current", released: "2026-01", description: "A model offered by API.", url: null, source_ids: ["s1"] }],
    timeline: [{ date: "2026-01-05", text: "Fixture released Fixture Model 1.", source_ids: ["s1"] }],
    leadership: [{ name: "Fixture Leader", role: "Chief Executive Officer", source_ids: ["s1"] }],
  };

  it("accepts a sourced deep dive", () => {
    expect(errorsFor(withDeepDive(ok))).toEqual([]);
  });

  it.each([
    ["an unknown source", { overview: [{ text: "Fixture builds models.", source_ids: ["nope"] }] }],
    ["a future timeline date", { timeline: [{ date: "2099-01-01", text: "Something in the future.", source_ids: ["s1"] }] }],
    ["a user count", { overview: [{ text: "Fixture has many users worldwide.", source_ids: ["s1"] }] }],
    ["a dollar figure", { overview: [{ text: "Fixture spent $5 on compute.", source_ids: ["s1"] }] }],
    ["a gendered pronoun", { overview: [{ text: "The founder said he would ship it.", source_ids: ["s1"] }] }],
    ["duplicate section ids", { sections: [ok.sections[0], ok.sections[0]] }],
  ])("rejects %s", (_label, override) => {
    expect(errorsFor(withDeepDive({ ...ok, ...override })).length).toBeGreaterThan(0);
  });
});

describe("People Behind Big SI", () => {
  it("accepts and publishes a sourced leader profile", () => {
    const raw = withLeader(leader());
    const validated = validateContent(raw, { today: TODAY });
    expect(validated.issues.filter((i) => i.level === "error")).toEqual([]);
    const catalog = new Catalog(validated);
    expect(catalog.leader("fixture-leader")?.name).toBe("Fixture Leader");
  });

  it.each([
    ["net worth", { summary: { text: "Fixture Leader has a large net worth.", source_ids: ["s1"] } }],
    ["family details", { summary: { text: "Fixture Leader is married with children.", source_ids: ["s1"] } }],
    ["a gendered pronoun", { summary: { text: "Fixture Leader built it, and she led it.", source_ids: ["s1"] } }],
    ["an unknown organization", { current_roles: [{ organization: "X", organization_slug: "no-such-org", role: "CEO", since: null, source_ids: ["s1"] }] }],
    ["an unknown source", { summary: { text: "Fixture Leader founded it.", source_ids: ["missing"] } }],
  ])("rejects %s", (_label, override) => {
    expect(errorsFor(withLeader(leader(override))).length).toBeGreaterThan(0);
  });

  it("keeps drafts off the site", () => {
    const catalog = new Catalog(validateContent(withLeader(leader({ publication_status: "draft" })), { today: TODAY }));
    expect(catalog.leaders).toEqual([]);
  });
});
