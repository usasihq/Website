import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { readRawContent } from "@/lib/content-loader";
import { inlineLinks, inlinePlain, inlineToEmailHtml, isAllowedHref, parseInline } from "@/lib/inline-text";
import { issueEmailHtml } from "@/lib/newsletter-email";
import { absoluteUrl } from "@/lib/paths";
import { isKnownSitePath } from "@/lib/site-routes";
import { validateContent, type RawContent } from "@/lib/validate";
import { fixtureContent, TODAY } from "../fixtures/content";

describe("inline issue markup", () => {
  it("parses bold, links, and bold links", () => {
    expect(parseInline("**A.** see [the site](/) now")).toEqual([
      { type: "bold", children: [{ type: "text", text: "A." }] },
      { type: "text", text: " see " },
      { type: "link", href: "/", children: [{ type: "text", text: "the site" }] },
      { type: "text", text: " now" },
    ]);
    expect(inlineLinks("**[Learn](/learn/)** and [x](https://example.org/a)")).toEqual(["/learn/", "https://example.org/a"]);
    expect(inlinePlain("**[Learn](/learn/)** is new")).toBe("Learn is new");
  });

  it("leaves unmatched markup as text", () => {
    expect(inlinePlain("a ** b [c] (d)")).toBe("a ** b [c] (d)");
  });

  it("allows only site paths and https URLs", () => {
    expect(isAllowedHref("/news/x/")).toBe(true);
    expect(isAllowedHref("https://example.org/")).toBe(true);
    expect(isAllowedHref("//evil.example/")).toBe(false);
    expect(isAllowedHref("http://example.org/")).toBe(false);
    expect(isAllowedHref("javascript:alert(1)")).toBe(false);
  });

  it("escapes text and resolves links in email HTML", () => {
    const html = inlineToEmailHtml("<b> & [x](/a/)", (h) => `https://site.test${h}`, { link: "color:red", bold: "" });
    expect(html).toBe('&lt;b&gt; &amp; <a style="color:red" href="https://site.test/a/">x</a>');
  });
});

describe("site path checks for issue links", () => {
  const slugs = {
    organizations: new Set(["ai2"]),
    artifacts: new Set(["olmo"]),
    news: new Set(["n1"]),
    hubs: new Set<string>(),
    licenses: new Set<string>(),
    explainers: new Set(["tokens"]),
    paths: new Set(["new-to-ai"]),
    issues: new Set(["issue-1"]),
  };
  it("accepts built pages and rejects others", () => {
    expect(isKnownSitePath("/", slugs)).toBe(true);
    expect(isKnownSitePath("/contribute/#corrections", slugs)).toBe(true);
    expect(isKnownSitePath("/open/olmo/", slugs)).toBe(true);
    expect(isKnownSitePath("/learn/paths/new-to-ai/", slugs)).toBe(true);
    expect(isKnownSitePath("/open/missing/", slugs)).toBe(false);
    expect(isKnownSitePath("/news/n1", slugs)).toBe(false);
  });
});

describe("issue validation", () => {
  const issue = (over: Record<string, unknown> = {}) => ({
    number: 1,
    slug: "issue-1",
    subject: "Issue 1: a test subject line",
    preview: "What changed this week.",
    sent_at: TODAY,
    covers: { from: TODAY, to: TODAY },
    intro: ["Welcome. See [the catalog](/companies/)."],
    sections: [{ heading: "News", items: ["[A page that does not exist](/open/does-not-exist/)"] }],
    publication_status: "published",
    ...over,
  });
  const errors = (data: Record<string, unknown>) => {
    const raw: RawContent = { ...fixtureContent(), newsletter: [{ file: `newsletter/${data.slug}.yml`, data }] };
    return validateContent(raw, { today: TODAY }).issues.filter((i) => i.level === "error").map((i) => i.message);
  };
  it("rejects links to pages the site does not publish", () => {
    expect(errors(issue())).toContainEqual(expect.stringContaining("/open/does-not-exist/"));
  });
  it("rejects non-https external links", () => {
    expect(errors(issue({ sections: [{ heading: "News", items: ["[x](http://example.org/)"] }] }))).toContainEqual(expect.stringContaining("https"));
  });
  it("rejects a cover period that ends after the send date", () => {
    expect(errors(issue({ covers: { from: TODAY, to: "2099-01-01" }, sections: [{ heading: "News", items: ["Plain text."] }] }))).toContainEqual(
      expect.stringContaining("covers"),
    );
  });
});

describe("issue 1 archive", () => {
  it("regenerates exactly the HTML that was emailed", () => {
    const validated = validateContent(readRawContent(), { today: new Date().toISOString().slice(0, 10) });
    const issue = validated.newsletter.find((n) => n.slug === "issue-1")!;
    const html = issueEmailHtml(issue, (href) => (href.startsWith("/") ? absoluteUrl(href) : href));
    expect(html.length).toBe(11217);
    expect(crypto.createHash("sha256").update(html).digest("hex")).toBe("9ebaa1dd2c64d8483499e238b133ba66228e6c2751a106e15cb8a6f7f67006b4");
  });
});
