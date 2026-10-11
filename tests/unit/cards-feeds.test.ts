import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { cardImage, pageCards } from "@/lib/page-cards";
import { changelogAnchor, rssDocument } from "@/lib/rss";

describe("per-page social cards", () => {
  const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
  const cards = pageCards(catalog);

  it("gives every published record, news item, and issue its own card", () => {
    const pages = new Set(cards.map((c) => c.page));
    for (const a of catalog.artifacts) expect(pages.has(`/open/${a.slug}/`), a.slug).toBe(true);
    for (const o of catalog.organizations) expect(pages.has(`/companies/${o.slug}/`), o.slug).toBe(true);
    for (const n of catalog.news) expect(pages.has(`/news/${n.slug}/`), n.slug).toBe(true);
    for (const i of catalog.newsletter) expect(pages.has(`/newsletter/${i.slug}/`), i.slug).toBe(true);
  });

  it("uses unique image files and descriptive alt text", () => {
    expect(new Set(cards.map((c) => c.image)).size).toBe(cards.length);
    for (const c of cards) {
      expect(c.image).toMatch(/^\/og\/[a-z]+\/[a-z0-9-]+\.jpg$/);
      expect(c.alt.length).toBeLessThanOrEqual(420);
      expect(c.alt).toContain(c.title.slice(0, 20));
    }
  });

  it("is what the page metadata points to", () => {
    const a = catalog.artifacts[0];
    const image = cardImage(catalog, `/open/${a.slug}/`)!;
    const meta = pageMetadata({ title: a.name, description: "x", path: `/open/${a.slug}/`, image });
    const og = (meta.openGraph?.images as { url: string; alt: string }[])[0];
    expect(og.url).toMatch(new RegExp(`/og/open/${a.slug}\\.jpg$`));
    expect((meta.twitter?.images as { url: string; alt: string }[])[0]).toEqual({ url: og.url, alt: image.alt });
  });
});

describe("RSS", () => {
  it("escapes content and links every item", () => {
    const xml = rssDocument({
      title: "A & B",
      path: "/news/",
      selfPath: "/news/feed.xml",
      description: "Desc <x>",
      items: [{ title: "T <1>", path: "/news/t/", date: "2026-10-11", category: "release", description: "S & D" }],
    });
    expect(xml).toContain("<title>A &amp; B</title>");
    expect(xml).toContain("<title>T &lt;1&gt;</title>");
    expect(xml).toMatch(/<link>https:\/\/[^<]+\/news\/t\/<\/link>/);
    expect(xml).toContain("<pubDate>Sun, 11 Oct 2026 12:00:00 GMT</pubDate>");
    expect(xml).toContain("Not a United States government website.");
  });

  it("gives changelog entries stable anchors", () => {
    expect(changelogAnchor({ date: "2026-10-11", title: "Share and cite tools, a badge!" })).toBe("c-2026-10-11-share-and-cite-tools-a-badge");
  });

  it("announces feeds in page metadata", () => {
    const meta = pageMetadata({ description: "x", path: "/news/", feeds: [{ path: "/news/feed.xml", title: "News" }] });
    const types = meta.alternates?.types as Record<string, { url: string; title: string }[]>;
    expect(types["application/rss+xml"][0].url).toMatch(/\/news\/feed\.xml$/);
  });
});
