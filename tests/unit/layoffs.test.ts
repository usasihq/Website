import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import {
  cityFromLocation,
  EMPTY_WARN_DATASET,
  layoffHref,
  layoffSearchEntries,
  layoffSitemap,
  layoffsIndex,
  LAYOFF_STATES,
  type WarnDataset,
} from "@/lib/jobs/layoffs";
import { mergeLayoffRefresh, noticesFromCsv, parseCsv, parseEmployees, parseIsoDate, recentSince } from "@/lib/jobs/layoffs-refresh";
import { clipDescription, DESCRIPTION_MAX, documentTitle, pageMetadata, TITLE_MAX } from "@/lib/metadata";
import { isKnownSitePath, STATIC_ROUTES } from "@/lib/site-routes";

const csv = `id,state,company,location,employees_affected,notice_date
a1,CA,"Acme, Inc.",San Francisco,120,2026-09-18
a2,CA,Old Co,Oakland,10,2025-01-01
a3,CA,No Date,San Jose,5,
a4,CA,Future Co,San Diego,8,2026-12-01
`;

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

const fixture = (over: Partial<WarnDataset> = {}): WarnDataset => ({
  version: 1,
  fetched_at: "2026-10-16T12:00:00.000Z",
  collector: { name: "Big Local News warn-scraper", url: "https://github.com/biglocalnews/warn-scraper" },
  states: [
    {
      code: "CA",
      fetched_at: "2026-10-16T12:00:00.000Z",
      source_name: "California Employment Development Department",
      source_url: "https://edd.ca.gov/en/Jobs_and_Training/Layoff_Services_WARN",
      dataset_url: "https://raw.githubusercontent.com/APVentureEngine/warn-act-notices/main/data/by-state/ca.csv",
      notices: [
        {
          id: "a1",
          state: "CA",
          company: "Acme, Inc.",
          city: "San Francisco",
          notice_date: "2026-09-18",
          employees: 120,
          source_url: "https://edd.ca.gov/en/Jobs_and_Training/Layoff_Services_WARN",
        },
      ],
    },
  ],
  ...over,
});

describe("WARN CSV parsing", () => {
  it("keeps quoted commas and drops empty rows", () => {
    expect(parseCsv('id,company\n1,"Acme, Inc."\n\n')).toEqual([
      ["id", "company"],
      ["1", "Acme, Inc."],
    ]);
  });
  it("reads ISO and US dates, and integer employee counts", () => {
    expect(parseIsoDate("2026-09-18")).toBe("2026-09-18");
    expect(parseIsoDate("9/8/2026")).toBe("2026-09-08");
    expect(parseIsoDate("soon")).toBeNull();
    expect(parseEmployees("1,200")).toBe(1200);
    expect(parseEmployees("")).toBeNull();
  });
  it("keeps recent notices and reads company, city, date, and count", () => {
    const notices = noticesFromCsv(csv, LAYOFF_STATES[0], "2026-10-16");
    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatchObject({ company: "Acme, Inc.", city: "San Francisco", notice_date: "2026-09-18", employees: 120 });
    expect(recentSince("2026-10-16", 180)).toBe("2026-04-19");
  });
  it("reads a city from 'City, County' and drops a trailing County label", () => {
    expect(cityFromLocation("Houston, Harris")).toBe("Houston");
    expect(cityFromLocation("Alameda County")).toBe("Alameda");
    expect(cityFromLocation("Statewide")).toBe("");
  });
});

describe("refresh keeps last data or skips a failed state", () => {
  it("writes a successful state and keeps the previous file when the fetch fails", async () => {
    const previous = fixture();
    const fetcher = (async (url: string) => {
      if (String(url).includes("/wa.csv")) {
        return new Response(
          `id,state,company,location,employees_affected,notice_date\nw1,WA,Expedia,Seattle,58,2026-09-22\n`,
          { status: 200 },
        );
      }
      return new Response("nope", { status: 503 });
    }) as typeof fetch;
    const { dataset, kept, skipped, counts } = await mergeLayoffRefresh(previous, "2026-10-16", fetcher, () => "2026-10-16T18:00:00.000Z");
    expect(counts.WA).toBe(1);
    expect(counts.CA).toBe(1);
    expect(kept).toContain("CA");
    expect(skipped).toEqual(expect.arrayContaining(["NY", "TX"]));
    expect(dataset.states.find((s) => s.code === "CA")?.notices[0].company).toBe("Acme, Inc.");
    expect(dataset.states.find((s) => s.code === "WA")?.notices[0].city).toBe("Seattle");
    expect(dataset.collector.url).toBe("https://github.com/biglocalnews/warn-scraper");
  });

  it("skips a failed state that has no previous notices", async () => {
    const fetcher = (async () => new Response("nope", { status: 500 })) as typeof fetch;
    const { dataset, skipped } = await mergeLayoffRefresh(EMPTY_WARN_DATASET, "2026-10-16", fetcher);
    expect(dataset.states).toEqual([]);
    expect(skipped).toEqual(["CA", "WA", "NY", "TX"]);
  });
});

describe("layoff pages", () => {
  it("are known site paths and appear in the sitemap and search", () => {
    const slugs = { organizations: new Set<string>(), artifacts: new Set<string>(), news: new Set<string>(), hubs: new Set<string>(), licenses: new Set<string>(), explainers: new Set<string>(), paths: new Set<string>(), issues: new Set<string>() };
    expect(STATIC_ROUTES).toContain("/jobs/layoffs/");
    expect(isKnownSitePath("/jobs/layoffs/", slugs)).toBe(true);
    for (const s of LAYOFF_STATES) expect(isKnownSitePath(layoffHref(s.code), slugs)).toBe(true);
    expect(isKnownSitePath("/jobs/layoffs/ohio/", slugs)).toBe(false);
    const index = layoffsIndex(catalog, fixture());
    expect(index.states).toHaveLength(1);
    expect(index.states[0].jobState?.path === "/jobs/in/california/" || index.states[0].jobState === null).toBe(true);
    const sitemap = layoffSitemap(catalog, fixture());
    expect(sitemap.some((p) => p.path === "/jobs/layoffs/california/")).toBe(true);
    const search = layoffSearchEntries(catalog, fixture());
    expect(search.some((e) => e.href === "/jobs/layoffs/")).toBe(true);
    expect(search.some((e) => e.href === "/jobs/layoffs/california/")).toBe(true);
  });

  it("keeps titles and descriptions within search limits", () => {
    expect(documentTitle("WARN Act layoff notices and nearby AI jobs in the U.S.").length).toBeLessThanOrEqual(TITLE_MAX);
    expect(documentTitle("WARN Act layoffs in California and nearby AI jobs").length).toBeLessThanOrEqual(TITLE_MAX);
    const description =
      "Recent official WARN Act layoff notices in California, Washington, New York, and Texas, with links to open AI jobs in those places.";
    expect(clipDescription(description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    const meta = pageMetadata({ title: "Layoffs in California", description: "12 recent WARN Act notices in California from the California Employment Development Department, with links to open AI jobs in the state and its cities.", path: "/jobs/layoffs/california/" });
    expect(String(meta.description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it("covers the four required states", () => {
    expect(LAYOFF_STATES.map((s) => s.code)).toEqual(["CA", "WA", "NY", "TX"]);
    for (const s of LAYOFF_STATES) {
      expect(s.sourceUrl.startsWith("https://")).toBe(true);
      expect(s.datasetUrl.endsWith(`${s.code.toLowerCase()}.csv`)).toBe(true);
    }
  });
});
