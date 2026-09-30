import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Catalog } from "@/lib/catalog";
import { validateContent, type RawContent } from "@/lib/validate";
import { fixtureContent, TODAY } from "../fixtures/content";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
const { NewsletterSignup } = await import("@/components/NewsletterSignup");

function news(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    slug,
    title: "Fixture parent releases a fixture model",
    event_date: "2026-09-01",
    published_at: TODAY,
    category: "release",
    summary: { text: "The fixture parent published the fixture model's weights under Apache 2.0.", source_ids: ["s1"] },
    related_organizations: ["fixture-parent"],
    related_artifacts: ["fixture-fully-open"],
    publication_status: "published",
    updated_at: TODAY,
    sources: [{ id: "s1", title: "Fixture announcement", url: "https://news.usasi-fixtures.org/a", publisher: "Fixture", kind: "announcement", published_at: "2026-09-01", accessed_at: TODAY }],
    ...overrides,
  };
}

function withNews(items: Array<Record<string, unknown>>): RawContent {
  const raw = fixtureContent();
  raw.news = items.map((n) => ({ file: `news/${n.slug}.yml`, data: n }));
  return raw;
}
const errors = (raw: RawContent) => validateContent(raw, { today: TODAY }).issues.filter((i) => i.level === "error").map((i) => i.message);

describe("news items", () => {
  it("accepts a sourced item tied to published catalog records", () => {
    expect(errors(withNews([news("fixture-news")]))).toEqual([]);
  });

  it.each([
    ["a funding amount", "The fixture parent raised $50 million."],
    ["a valuation", "The deal implies a valuation for the fixture parent."],
    ["user counts", "The model reached many users in a week."],
    ["superlatives", "The leading fixture model was released."],
  ])("rejects %s", (_label, text) => {
    expect(errors(withNews([news("fixture-news", { summary: { text, source_ids: ["s1"] } })])).some((m) => m.startsWith("News may not include"))).toBe(true);
  });

  it("requires at least one related, published catalog record", () => {
    expect(errors(withNews([news("fixture-news", { related_organizations: [], related_artifacts: [] })]))).toContain(
      "News items must relate to at least one catalog record",
    );
    expect(errors(withNews([news("fixture-news", { related_artifacts: ["fixture-draft-artifact"] })]))).toContain(
      'Related artifact "fixture-draft-artifact" is not published',
    );
  });

  it("rejects events dated after publication or in the future", () => {
    expect(errors(withNews([news("fixture-news", { event_date: "2030-01-01" })]))).toContain("event_date is in the future");
  });

  it("orders published items newest first and derives reverse links", () => {
    const raw = withNews([news("older", { published_at: "2026-09-01", event_date: "2026-08-01" }), news("newer"), news("draft-item", { publication_status: "draft" })]);
    const catalog = new Catalog(validateContent(raw, { today: TODAY }));
    expect(catalog.news.map((n) => n.slug)).toEqual(["newer", "older"]);
    expect(catalog.newsForOrganization("fixture-parent").map((n) => n.slug)).toEqual(["newer", "older"]);
    expect(catalog.newsItem("draft-item")).toBeUndefined();
  });
});

describe("weekly email signup", () => {
  const base = { enabled: true, heading: "The USASI weekly", description: "Weekly catalog updates.", provider: "Buttondown", url: null };

  it("without a URL: honest 'coming soon', no signup link, RSS offered", () => {
    const html = renderToStaticMarkup(<NewsletterSignup config={base} />);
    expect(html).toContain("The weekly email is coming soon.");
    expect(html).not.toContain("Subscribe");
    expect(html).toContain("/news/feed.xml");
  });

  it("with a URL: outbound signup link and the no-collection note", () => {
    const html = renderToStaticMarkup(<NewsletterSignup config={{ ...base, url: "https://buttondown.com/usasi-fixture" }} />);
    expect(html).toContain('href="https://buttondown.com/usasi-fixture"');
    expect(html).toContain("Subscribe on Buttondown");
    expect(html).toContain("USASI doesn’t collect your email address.");
  });
});
