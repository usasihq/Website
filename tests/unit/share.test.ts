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
