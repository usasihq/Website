import { describe, expect, it } from "vitest";
import { badgeSnippets, bibtexEscape, citations, shareLinks } from "@/lib/share";

describe("share links", () => {
  it("passes only the encoded address and title", () => {
    const links = shareLinks("https://site.test/open/a b/", "A & B");
    expect(links.map((l) => l.id)).toEqual(["x", "bluesky", "linkedin", "reddit", "hacker-news", "email"]);
    for (const l of links) {
      expect(l.href).not.toContain(" ");
      expect(l.href).not.toContain("A & B");
    }
    expect(links.find((l) => l.id === "x")!.href).toBe("https://x.com/intent/tweet?text=A%20%26%20B&url=https%3A%2F%2Fsite.test%2Fopen%2Fa%20b%2F");
  });
});

describe("citations", () => {
  it("formats APA with the page's own date", () => {
    const { apa } = citations({ title: "OLMo 2", url: "https://site.test/open/olmo-2/", date: "2026-10-08", key: "olmo-2" });
    expect(apa).toBe("USASI. (2026, October 8). OLMo 2. United States of America Superintelligence. https://site.test/open/olmo-2/");
  });
  it("produces escaped BibTeX", () => {
    const { bibtex } = citations({ title: "R&D 100% {x}", url: "https://site.test/a_b/", date: "2026-10", key: "a-b" });
    expect(bibtex).toContain("@misc{usasi_a_b,");
    expect(bibtex).toContain("title = {R\\&D 100\\% \\{x\\}},");
    expect(bibtex).toContain("month = oct,");
    expect(bibtex).toContain("howpublished = {\\url{https://site.test/a_b/}},");
  });
  it("escapes backslashes once", () => {
    expect(bibtexEscape("a\\b")).toBe("a\\textbackslash{}b");
  });
});

describe("badge snippets", () => {
  it("link the badge image to the record", () => {
    const s = badgeSnippets("https://site.test/open/x/", "https://site.test/badges/listed.svg");
    expect(s.markdown).toBe("[![Listed in the USASI catalog](https://site.test/badges/listed.svg)](https://site.test/open/x/)");
    expect(s.html).toContain('href="https://site.test/open/x/"');
  });
});

describe("share kit", async () => {
  const { shareKit, POST_LIMITS } = await import("@/lib/share-kit");
  const issue = {
    number: 3,
    slug: "issue-3",
    subject: "Issue 3: a fairly long subject line about several model releases and policy updates this week",
    preview: "p",
    sent_at: "2026-10-25",
    covers: { from: "2026-10-19", to: "2026-10-25" },
    intro: ["x"],
    sections: [
      { heading: "Open models", intro: null, note: null, items: ["**Thing.** text [a](/news/a/)", "[B 1.0](/news/b/): more"] },
      { heading: "Corrections", intro: "None this week. Reply to this email.", note: null, items: [] },
    ],
    closing: [],
    web_url: null,
    publication_status: "published" as const,
  };
  it("keeps every post within its platform's limit and links the issue", () => {
    const url = "https://unitedstatesofamericasuperintelligence.com/newsletter/issue-3/";
    const kit = shareKit(issue, url);
    expect([...kit.bluesky].length).toBeLessThanOrEqual(POST_LIMITS.bluesky);
    expect([...kit.truthSocial].length).toBeLessThanOrEqual(POST_LIMITS.truthSocial);
    expect([...kit.x.replace(url, "x".repeat(23))].length).toBeLessThanOrEqual(POST_LIMITS.x);
    for (const post of Object.values(kit)) expect(post).toContain(url);
    expect(kit.linkedin).not.toContain("Reply to this email");
    expect(kit.linkedin).toContain("Open models: Thing; B 1.0");
  });
});
