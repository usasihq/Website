import { describe, expect, it } from "vitest";
import path from "node:path";
import { loadCatalog } from "@/lib/catalog";
import { documentTitle, TITLE_MAX } from "@/lib/metadata";
import {
  buildPersonTitle,
  personSeo,
  personTitleRepeatsSegment,
  sameTitleSegment,
  titleSegmentKey,
} from "@/lib/seo";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

describe("people-bio title segments", () => {
  it("compares names case-insensitively and ignores punctuation", () => {
    expect(titleSegmentKey("Wes Roth")).toBe("wesroth");
    expect(sameTitleSegment("Wes Roth", "wes-roth!")).toBe(true);
    expect(sameTitleSegment("PyTorch", "pytorch")).toBe(true);
    expect(sameTitleSegment("PyTorch", "PyTorch 2")).toBe(false);
    expect(sameTitleSegment("Lilian Weng", "Lil'Log")).toBe(false);
  });

  it("flags the live repeated-word titles from the old template", () => {
    expect(personTitleRepeatsSegment("Wes Roth at Wes Roth — Wes Roth")).toBe(true);
    expect(personTitleRepeatsSegment("Natalia Gimelshein at PyTorch — PyTorch")).toBe(true);
    expect(personTitleRepeatsSegment("Jordan Harrod at Jordan Harrod — Jordan Harrod")).toBe(true);
    expect(personTitleRepeatsSegment("Lilian Weng at Lil'Log — Lil'Log")).toBe(true);
    expect(personTitleRepeatsSegment("Samy Bengio at Apple")).toBe(false);
    expect(personTitleRepeatsSegment("Wes Roth, Creator")).toBe(false);
    expect(personTitleRepeatsSegment("Natalia Gimelshein, Core Maintainer at PyTorch")).toBe(false);
  });

  it("dedupes the Wes Roth / Natalia Gimelshein / Jordan Harrod examples", () => {
    expect(
      buildPersonTitle({
        name: "Wes Roth",
        org: "Wes Roth (YouTube channel)",
        role: "Creator",
        works: ["Wes Roth (YouTube channel)"],
      }),
    ).toBe("Wes Roth, Creator");
    expect(
      buildPersonTitle({
        name: "Natalia Gimelshein",
        org: "PyTorch (open-source project)",
        role: "Core Maintainer",
        works: ["PyTorch (CUDA)", "PyTorch 2: TorchDynamo and TorchInductor (torch.compile)"],
      }),
    ).toBe("Natalia Gimelshein at PyTorch — PyTorch 2");
    expect(
      buildPersonTitle({
        name: "Jordan Harrod",
        org: "Jordan Harrod (YouTube channel)",
        role: "Creator and host",
        works: ["Jordan Harrod (YouTube channel)", "AI IRL"],
      }),
    ).toBe("Jordan Harrod — AI IRL");
    expect(
      buildPersonTitle({
        name: "Lilian Weng",
        org: "Lil'Log",
        role: "Author",
        works: ["Lil'Log"],
      }),
    ).toBe("Lilian Weng, Author at Lil'Log");
  });

  it("drops at-org when the org is the name and falls back to role or AI researcher", () => {
    expect(buildPersonTitle({ name: "Wes Roth", org: "Wes Roth", works: ["Wes Roth"] })).toBe("Wes Roth — AI researcher");
    expect(buildPersonTitle({ name: "Wes Roth", org: "wes roth!", role: "Creator", works: ["Wes Roth."] })).toBe("Wes Roth, Creator");
    expect(buildPersonTitle({ name: "Alex", org: "Alex", role: "Alex" })).toBe("Alex — AI researcher");
  });

  it("keeps titles within the search-result length", () => {
    const long = buildPersonTitle({
      name: "Károly Zsolnai-Fehér",
      org: "Two Minute Papers",
      role: "Creator and host",
      works: ["Two Minute Papers"],
    });
    expect(long.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(personTitleRepeatsSegment(long)).toBe(false);
    expect(documentTitle("Wes Roth, Creator")).toBe("Wes Roth, Creator | USASI");
  });
});

describe("catalog people titles", () => {
  it("no longer repeats the name, org, or project in the examples seen live", () => {
    const expected: Record<string, string> = {
      "wes-roth": "Wes Roth, Creator",
      "natalia-gimelshein": "Natalia Gimelshein at PyTorch — PyTorch 2",
      "jordan-harrod": "Jordan Harrod at Harrod & Co — AI IRL",
    };
    for (const [slug, title] of Object.entries(expected)) {
      const seo = personSeo(catalog, catalog.person(slug)!);
      expect(seo.title, slug).toBe(title);
      expect(personTitleRepeatsSegment(seo.title), seo.title).toBe(false);
    }
  });

  it("does not emit a repeated name/org/project segment on any bio", () => {
    const repeats = catalog.people.map((p) => ({ slug: p.slug, title: personSeo(catalog, p).title })).filter((row) => personTitleRepeatsSegment(row.title));
    expect(repeats, repeats.map((r) => `${r.slug}: ${r.title}`).join("\n")).toEqual([]);
  });
});
