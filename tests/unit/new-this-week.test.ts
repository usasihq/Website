import { describe, expect, it } from "vitest";
import { markFirstSeen } from "@/lib/first-seen";
import { catalogAdditions, newFeedItems, newWindow, type NewThisWeek } from "@/lib/new-this-week";
import type { ChangelogEntry } from "@/lib/schema";

const entry = (date: string, changes: ChangelogEntry["changes"]): ChangelogEntry => ({ date, title: `Entry ${date}`, summary: "A summary of changes.", changes });

describe("New this week", () => {
  it("covers the seven days ending on the build date", () => {
    expect(newWindow("2026-10-19T13:01:11.546Z")).toEqual({ from: "2026-10-13", to: "2026-10-19" });
  });

  it("lists records the changelog marks as added in the window, once each, newest first", () => {
    const changelog = [
      entry("2026-10-18", [
        { type: "added", record_type: "artifact", slug: "t3-code", note: "T3 Code" },
        { type: "updated", record_type: "organization", slug: "acme", note: null },
        { type: "added", record_type: "site", slug: null, note: "Profiles: A, B" },
      ]),
      entry("2026-10-14", [{ type: "added", record_type: "organization", slug: "acme", note: null }, { type: "added", record_type: "artifact", slug: "t3-code", note: null }]),
      entry("2026-10-01", [{ type: "added", record_type: "organization", slug: "old", note: null }]),
      entry("2026-10-15", [{ type: "added", record_type: "organization", slug: "gone", note: null }]),
    ];
    const names: Record<string, string> = { acme: "Acme AI", old: "Old Co", "t3-code": "T3 Code" };
    const catalog = {
      changelog,
      organization: (s: string) => (s in names && s !== "t3-code" ? ({ name: names[s] } as never) : undefined),
      artifact: (s: string) => (s === "t3-code" ? ({ name: "T3 Code" } as never) : undefined),
    };
    const w = catalogAdditions(catalog as never, { from: "2026-10-13", to: "2026-10-19" });
    expect(w.entries.map((e) => e.date)).toEqual(["2026-10-18", "2026-10-15", "2026-10-14"]);
    expect(w.records.map((r) => [r.kind, r.slug, r.date])).toEqual([
      ["artifact", "t3-code", "2026-10-18"],
      ["organization", "acme", "2026-10-14"],
    ]);
    expect(w.records[0].href).toBe("/open/t3-code/");
    expect(w.siteNotes).toEqual([{ date: "2026-10-18", note: "Profiles: A, B", entry: "Entry 2026-10-18" }]);
  });

  it("feeds catalog additions, news, and newly ranked items, newest first", () => {
    const w = {
      from: "2026-10-13",
      to: "2026-10-19",
      records: [{ kind: "organization", slug: "acme", name: "Acme AI", href: "/companies/acme/", date: "2026-10-14", note: "Maker of things" }],
      news: [],
      github: { trackingSince: "2026-10-18T00:00:00Z", items: [{ full_name: "a/b", href: "/github/a--b/", first_seen: "2026-10-19T08:00:00Z", stars: 1200 }] },
      hfModels: { trackingSince: null, items: [] },
      hfDatasets: { trackingSince: null, items: [] },
    } as unknown as NewThisWeek;
    const items = newFeedItems(w);
    expect(items.map((i) => i.path)).toEqual(["/github/a--b/", "/companies/acme/"]);
    expect(items[0]).toMatchObject({ exact: true, title: "New on AI on GitHub: a/b" });
    expect(items[1].description).toBe("Maker of things.");
  });

  it("records first_seen only for items new since tracking started", () => {
    type X = { id: number; first_seen?: string };
    const start = markFirstSeen<X>([{ id: 1 }, { id: 2 }], { items: [{ id: 1 }] }, (x) => x.id, "2026-10-18T00:00:00Z");
    expect(start).toEqual({ tracking_since: "2026-10-18T00:00:00Z", items: [{ id: 1 }, { id: 2 }] });
    const next = markFirstSeen<X>([{ id: 1 }, { id: 2 }, { id: 3 }], { tracking_since: "2026-10-18T00:00:00Z", items: start.items }, (x) => x.id, "2026-10-25T00:00:00Z");
    expect(next.items).toEqual([{ id: 1 }, { id: 2 }, { id: 3, first_seen: "2026-10-25T00:00:00Z" }]);
    const later = markFirstSeen<X>([{ id: 3 }], { tracking_since: "2026-10-18T00:00:00Z", items: next.items }, (x) => x.id, "2026-11-01T00:00:00Z");
    expect(later.items[0].first_seen).toBe("2026-10-25T00:00:00Z");
    expect(markFirstSeen<X>([{ id: 9 }], undefined, (x) => x.id, "2026-10-18T00:00:00Z").items[0].first_seen).toBeUndefined();
  });
});
