import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { parseGlossary, referenceSearchEntries } from "@/lib/reference-search";
import { sourceLibrary } from "@/lib/source-library";
import { groupTimeline, timelineEvents, type TimelineEvent } from "@/lib/timeline";

describe("reference pages", () => {
  it("parses glossary headings and plain first paragraphs", () => {
    const terms = parseGlossary('<h2 id="weights">Weights</h2>\n\nThe trained [parameters](/x/) of a *model*.\n\n<h2 id="gguf">GGUF</h2>\n\nA file format.\n');
    expect(terms).toEqual([
      { id: "weights", term: "Weights", definition: "The trained parameters of a model." },
      { id: "gguf", term: "GGUF", definition: "A file format." },
    ]);
    const real = parseGlossary(fs.readFileSync(path.join(process.cwd(), "content/pages/glossary.mdx"), "utf8"));
    expect(real.length).toBe((fs.readFileSync(path.join(process.cwd(), "content/pages/glossary.mdx"), "utf8").match(/<h2 id=/g) ?? []).length);
  });

  it("groups the timeline newest first and keeps year-only dates apart", () => {
    const ev = (date: string): TimelineEvent => ({ date, type: "release", label: "Released", title: date, href: `/open/${date}/` });
    const groups = groupTimeline([ev("2026-09-03"), ev("2026"), ev("2025-01")].sort((a, b) => b.date.localeCompare(a.date)));
    expect(groups.map((g) => g.year)).toEqual(["2026", "2025"]);
    expect(groups[0].months.map((m) => m.month)).toEqual(["2026-09", ""]);
  });

  it("builds the library, timeline, and reference search from published content only", () => {
    const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
    const lib = sourceLibrary(catalog);
    expect(new Set(lib.map((e) => e.url)).size).toBe(lib.length);
    expect(lib.every((e) => e.cited_by.length > 0)).toBe(true);
    const events = timelineEvents(catalog);
    expect(events.every((e) => /^\d{4}(-\d{2}(-\d{2})?)?$/.test(e.date))).toBe(true);
    const entries = referenceSearchEntries(catalog, []);
    const draftPeople = fs.readdirSync(path.join(process.cwd(), "content/people")).filter((f) => /publication_status: draft/.test(fs.readFileSync(path.join(process.cwd(), "content/people", f), "utf8")));
    for (const f of draftPeople) expect(entries.some((e) => e.slug === f.replace(/\.yml$/, ""))).toBe(false);
  });
});
