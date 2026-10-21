import { describe, expect, it } from "vitest";
import path from "node:path";
import { loadCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/paths";
import {
  breadcrumbList,
  breadcrumbTrail,
  catalogDatasetLd,
  HF_DATASET_URL,
  collectionPage,
  itemList,
  leaderLd,
  newsArticleLd,
  organizationLd,
  serializeJsonLd,
  softwareSourceCodeLd,
} from "@/lib/structured-data";

// The real catalog, validated against today's date (vitest pins USASI_TODAY for fixture suites).
const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

/** Every value must survive JSON (no undefined, functions, or NaN) and every node needs a @type. */
function expectCleanNode(node: unknown, where: string) {
  expect(JSON.parse(JSON.stringify(node)), where).toEqual(node);
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        expect(x, `${where} › ${k}`).not.toBeUndefined();
        walk(x);
      }
    }
  };
  walk(node);
}

describe("breadcrumbs", () => {
  it("start at Home, end at the current page, and use absolute links", () => {
    const trail = breadcrumbTrail([{ href: "/open/", label: "Open Models & Tools" }], { href: "/open/x/", label: "X" });
    const ld = breadcrumbList(trail);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Open Models & Tools", item: absoluteUrl("/open/") },
      { "@type": "ListItem", position: 3, name: "X", item: absoluteUrl("/open/x/") },
    ]);
  });

  it("do not repeat the current page when the visible trail already ends with it", () => {
    const trail = breadcrumbTrail([{ href: "/hubs/", label: "Hubs" }, { href: "/hubs/a/", label: "A" }], { href: "/hubs/a/", label: "A" });
    expect(trail.map((c) => c.href)).toEqual(["/", "/hubs/", "/hubs/a/"]);
  });
});

describe("item lists", () => {
  it("number every entry and link it absolutely", () => {
    const ld = itemList({ name: "L", path: "/l/", items: [{ name: "a", href: "/a/" }, { name: "b", href: "/b/" }] });
    expect(ld.numberOfItems).toBe(2);
    expect(ld.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "a", url: absoluteUrl("/a/") },
      { "@type": "ListItem", position: 2, name: "b", url: absoluteUrl("/b/") },
    ]);
  });

  it("wraps a directory as CollectionPage whose main entity is the ItemList", () => {
    const ld = collectionPage({ name: "Voices of SI", path: "/voices/", items: [{ name: "a", href: "/people/a/" }] });
    expect(ld["@type"]).toBe("CollectionPage");
    expect(ld.url).toBe(absoluteUrl("/voices/"));
    expect((ld.mainEntity as { "@type": string })["@type"]).toBe("ItemList");
  });
});

describe("news articles", () => {
  it("emit NewsArticle with the record's headline and dates", () => {
    const item = catalog.news[0];
    expect(item).toBeDefined();
    const ld = newsArticleLd(item);
    expectCleanNode(ld, item.slug);
    expect(ld).toMatchObject({
      "@type": "NewsArticle",
      headline: item.title,
      datePublished: item.published_at.slice(0, 10),
      dateModified: item.updated_at.slice(0, 10),
      url: absoluteUrl(`/news/${item.slug}/`),
    });
  });
});

describe("organizations", () => {
  it("use the official website and only official profile links from the record", () => {
    for (const org of catalog.organizations) {
      const ld = organizationLd(catalog, org);
      expectCleanNode(ld, org.slug);
      expect(ld["@type"]).toBe("Organization");
      expect(ld.url).toBe(org.website);
      expect(ld.name).toBe(org.name);
      const resources = (org.profile?.resources ?? []).map((r) => r.url);
      for (const u of (ld.sameAs as string[] | undefined) ?? []) expect(resources, org.slug).toContain(u);
      if (org.founded) expect(ld.foundingDate).toBe(String(org.founded.year));
      else expect(ld.foundingDate).toBeUndefined();
    }
  });
});

describe("software source code", () => {
  it("covers software projects only, with repository and license links from the record", () => {
    for (const a of catalog.artifacts) {
      const ld = softwareSourceCodeLd(catalog, a);
      if (!["framework", "runtime", "research-stack"].includes(a.kind)) {
        expect(ld, a.slug).toBeNull();
        continue;
      }
      expect(ld, a.slug).not.toBeNull();
      expectCleanNode(ld, a.slug);
      if (ld!.codeRepository) expect(a.links.map((l) => l.url)).toContain(ld!.codeRepository);
      const licenses = ld!.license === undefined ? [] : ([] as string[]).concat(ld!.license as string | string[]);
      for (const u of licenses) {
        const fromRecord = a.licenses.some((l) => l.url === u || (l.spdx && u === `https://spdx.org/licenses/${l.spdx}.html`));
        expect(fromRecord, `${a.slug}: ${u}`).toBe(true);
      }
    }
  });
});

describe("people", () => {
  it("link current organizations to their official websites", () => {
    for (const l of catalog.leaders) {
      const ld = leaderLd(catalog, l);
      expectCleanNode(ld, l.slug);
      const person = ld.mainEntity as { "@type": string; worksFor: { name: string; url?: string }[] };
      expect(person["@type"]).toBe("Person");
      for (const w of person.worksFor) {
        if (w.url) expect(catalog.organizations.map((o) => o.website)).toContain(w.url);
      }
    }
  });
});

describe("catalog dataset", () => {
  it("names the license and the published downloads", () => {
    const ld = catalogDatasetLd(catalog);
    expectCleanNode(ld, "dataset");
    expect(ld.license).toBe("https://creativecommons.org/licenses/by/4.0/");
    expect(ld.sameAs).toBe(HF_DATASET_URL);
    const downloads = ld.distribution as { encodingFormat: string; contentUrl: string }[];
    expect(downloads.map((d) => d.contentUrl)).toContain(absoluteUrl("/data/catalog.json"));
    expect(downloads.filter((d) => d.encodingFormat === "text/csv").every((d) => d.contentUrl.startsWith(`${HF_DATASET_URL}/resolve/main/`))).toBe(true);
    expect((ld.description as string).length).toBeGreaterThan(50);
  });
});

it("serializes without a way to close the script element", () => {
  expect(serializeJsonLd({ name: "</script><b>" })).not.toContain("<");
});
