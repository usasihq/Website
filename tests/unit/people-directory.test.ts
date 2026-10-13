import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { DEFAULT_PEOPLE_FILTERS, filterPeople, parsePeopleFilters, serializePeopleFilters } from "@/lib/people";
import { organizationSector, peopleAtOrganization, peopleListItems } from "@/lib/people-index";
import { DEFAULT_NEWS_FILTERS, filterNews, parseNewsFilters, serializeNewsFilters, type NewsListItem } from "@/lib/news-list";
import { personLd } from "@/lib/structured-data";
import { personSeo } from "@/lib/seo";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: "2026-10-13" });
const items = peopleListItems(catalog);

describe("People directory", () => {
  it("lists every published profile once, alphabetically, with its own page", () => {
    expect(items.length).toBe(catalog.people.length + catalog.leaders.length - catalog.people.filter((p) => catalog.leader(p.slug)).length);
    expect(new Set(items.map((i) => i.href)).size).toBe(items.length);
    const names = items.map((i) => i.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    for (const i of items) expect(i.href).toMatch(i.kind === "leader" ? /^\/big-si\/[a-z0-9-]+\/$/ : /^\/people\/[a-z0-9-]+\/$/);
  });

  it("lists Big SI leaders as founders and executives, with their organization's sector", () => {
    const leader = items.find((i) => i.kind === "leader" && i.organizations.some((o) => o.slug === "nvidia"))!;
    expect(leader.groups).toEqual(["leadership"]);
    expect(leader.sector).toBe("corporate");
  });

  it("derives a sector from the organization's record when a profile does not give one", () => {
    expect(organizationSector(catalog, "stanford-university")).toBe("academic");
    expect(organizationSector(catalog, "nvidia")).toBe("corporate");
    expect(organizationSector(catalog, "eleutherai")).toBe("nonprofit");
    expect(organizationSector(catalog, "lawrence-livermore-national-laboratory")).toBe("government");
    expect(organizationSector(catalog, null)).toBeNull();
  });

  it("parses, serializes, and applies filters", () => {
    const f = parsePeopleFilters(new URLSearchParams("group=local&org=hugging-face&specialty=nope&type=open-weights&q=  llama "));
    expect(f).toEqual({ ...DEFAULT_PEOPLE_FILTERS, q: "llama", group: "local", org: "hugging-face", type: "open-weights" });
    expect(serializePeopleFilters(f)).toBe("q=llama&group=local&org=hugging-face&type=open-weights");
    expect(parsePeopleFilters(new URLSearchParams("org=../x")).org).toBe("");
    const local = filterPeople(items, { ...DEFAULT_PEOPLE_FILTERS, group: "local" });
    expect(local.length).toBe(catalog.people.filter((p) => p.groups.includes("local")).length);
    const atHf = filterPeople(items, { ...DEFAULT_PEOPLE_FILTERS, org: "hugging-face" });
    expect(atHf.map((i) => i.slug)).toContain("thomas-wolf");
    expect(filterPeople(items, { ...DEFAULT_PEOPLE_FILTERS, q: "llama.cpp" }).map((i) => i.slug)).toContain("georgi-gerganov");
  });

  it("lists people at an organization, current roles first", () => {
    const people = peopleAtOrganization(catalog, "hugging-face");
    const current = people.map((p) => p.organizations.some((o) => o.slug === "hugging-face" && o.current));
    expect(current).toEqual([...current].sort((a, b) => Number(b) - Number(a)));
  });

  it("describes a profile for search engines from its own fields", () => {
    const p = catalog.person("tri-dao")!;
    const ld = personLd(catalog, p) as { "@type": string; mainEntity: { name: string; worksFor?: unknown[] } };
    expect(ld["@type"]).toBe("ProfilePage");
    expect(ld.mainEntity.name).toBe("Tri Dao");
    expect(ld.mainEntity.worksFor?.length).toBeGreaterThan(0);
    const seo = personSeo(catalog, p);
    expect(seo.title.startsWith("Tri Dao")).toBe(true);
    expect(seo.description.length).toBeLessThanOrEqual(160);
  });
});

describe("News list", () => {
  it("orders items by event date, newest first", () => {
    const dates = catalog.news.map((n) => n.event_date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("filters by category, organization, month, and words", () => {
    const rows: NewsListItem[] = [
      { slug: "a", title: "vLLM 1.0 released", event_date: "2026-10-05", published_at: "2026-10-06", category: "release", summary: "Release notes.", related: [], organizations: ["pytorch-foundation"] },
      { slug: "b", title: "A license change", event_date: "2026-09-02", published_at: "2026-10-13", category: "license", summary: "Now Apache-2.0.", related: [], organizations: ["google"] },
    ];
    expect(filterNews(rows, { ...DEFAULT_NEWS_FILTERS, category: "license" }).map((r) => r.slug)).toEqual(["b"]);
    expect(filterNews(rows, { ...DEFAULT_NEWS_FILTERS, org: "pytorch-foundation" }).map((r) => r.slug)).toEqual(["a"]);
    expect(filterNews(rows, { ...DEFAULT_NEWS_FILTERS, month: "2026-09" }).map((r) => r.slug)).toEqual(["b"]);
    expect(filterNews(rows, { ...DEFAULT_NEWS_FILTERS, q: "vllm" }).map((r) => r.slug)).toEqual(["a"]);
    const f = parseNewsFilters(new URLSearchParams("category=release&month=2026-13&org=google"));
    expect(f).toEqual({ ...DEFAULT_NEWS_FILTERS, category: "release", org: "google" });
    expect(serializeNewsFilters(f)).toBe("category=release&org=google");
  });
});
