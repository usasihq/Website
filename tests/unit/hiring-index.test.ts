import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import {
  countOpenJobs,
  EMPTY_HIRING_INDEX,
  HIRING_INDEX_HREF,
  hiringIndexJsonLd,
  hiringIndexPage,
  hiringIndexSearchEntry,
  mergeSnapshot,
  readHiringIndex,
  recordHiringIndex,
  snapshotFromDataset,
  weekLabel,
  weekStartUtc,
  writeHiringIndex,
  type HiringIndex,
  type WeekSnapshot,
} from "@/lib/jobs/hiring-index";
import type { Dataset, Job } from "@/lib/jobs/schema";
import { clipDescription, DESCRIPTION_MAX, documentTitle, pageMetadata, TITLE_MAX } from "@/lib/metadata";
import { cardImage, pageCards } from "@/lib/page-cards";
import { isKnownSitePath, STATIC_ROUTES } from "@/lib/site-routes";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });

const job = (over: Partial<Job> & Pick<Job, "id" | "organization_slug" | "locations">): Job => ({
  source_job_id: "1",
  requisition_id: null,
  source_type: "greenhouse",
  source_identifier: "board",
  source_url: "https://boards-api.greenhouse.io/v1/boards/board/jobs",
  title: "Engineer",
  countries: ["United States"],
  workplace: "on-site",
  remote: false,
  employment_type: "full-time",
  department: null,
  team: null,
  salaries: [],
  official_url: "https://job-boards.greenhouse.io/board/jobs/1",
  apply_url: null,
  posted_at: null,
  posted_date_kind: null,
  first_seen: "2026-10-13T00:00:00.000Z",
  last_seen: "2026-10-18T00:00:00.000Z",
  last_successfully_checked: "2026-10-18T00:00:00.000Z",
  status: "open",
  missing_since: null,
  missing_checks: 0,
  closed_at: null,
  ...over,
});

const dataset = (jobs: Job[]): Dataset => ({ version: 1, jobs, feeds: [] });

const week = (start: string, over: Partial<WeekSnapshot> = {}): WeekSnapshot => ({
  week_start: start,
  captured_at: `${start}T12:00:00.000Z`,
  open_count: 10,
  companies: [{ key: "openai", count: 6 }, { key: "anthropic", count: 4 }],
  states: [{ key: "CA", count: 8 }, { key: "NY", count: 2 }],
  ...over,
});

describe("ISO week buckets", () => {
  it("starts Monday UTC and labels the Sunday end", () => {
    expect(weekStartUtc("2026-10-18T21:00:00.000Z")).toBe("2026-10-12");
    expect(weekStartUtc("2026-10-12T00:00:00.000Z")).toBe("2026-10-12");
    expect(weekStartUtc("2026-10-11T23:00:00.000Z")).toBe("2026-10-05");
    expect(weekLabel("2026-10-12")).toBe("Oct 12–18, 2026");
  });
});

describe("open-job counts", () => {
  it("counts each employer once and each named state, ignoring closed rows", () => {
    const data = dataset([
      job({ id: "openai:greenhouse:board:1", organization_slug: "openai", locations: ["San Francisco, CA", "New York, NY"] }),
      job({ id: "openai:greenhouse:board:2", organization_slug: "openai", locations: ["Remote - US"] }),
      job({ id: "anthropic:greenhouse:board:3", organization_slug: "anthropic", locations: ["San Francisco, CA"], status: "closed", closed_at: "2026-10-17T00:00:00.000Z" }),
    ]);
    const counts = countOpenJobs(data);
    expect(counts.open_count).toBe(2);
    expect(counts.companies).toEqual([{ key: "openai", count: 2 }]);
    expect(counts.states).toEqual([
      { key: "CA", count: 1 },
      { key: "NY", count: 1 },
    ]);
  });
});

describe("weekly merge", () => {
  it("replaces the same week and keeps later weeks", () => {
    const first = snapshotFromDataset(
      dataset([job({ id: "openai:greenhouse:board:1", organization_slug: "openai", locations: ["San Francisco, CA"] })]),
      "2026-10-14T12:00:00.000Z",
    );
    const second = snapshotFromDataset(
      dataset([
        job({ id: "openai:greenhouse:board:1", organization_slug: "openai", locations: ["San Francisco, CA"] }),
        job({ id: "anthropic:greenhouse:board:2", organization_slug: "anthropic", locations: ["Seattle, WA"] }),
      ]),
      "2026-10-16T18:00:00.000Z",
    );
    expect(first.week_start).toBe(second.week_start);
    const merged = mergeSnapshot(mergeSnapshot(EMPTY_HIRING_INDEX, first), second);
    expect(merged.weeks).toHaveLength(1);
    expect(merged.weeks[0].open_count).toBe(2);
    expect(merged.weeks[0].companies.map((c) => c.key).sort()).toEqual(["anthropic", "openai"]);
  });

  it("appends a new week and treats a missing previous count as zero", () => {
    const index: HiringIndex = { version: 1, weeks: [week("2026-10-05"), week("2026-10-12", { open_count: 12, companies: [{ key: "openai", count: 12 }], states: [{ key: "CA", count: 12 }] })] };
    const page = hiringIndexPage(catalog, index);
    expect(page.coldStart).toBe(false);
    expect(page.openCount).toBe(12);
    expect(page.openDelta).toBe(2);
    expect(page.companies.find((c) => c.key === "openai")?.delta).toBe(6);
    expect(page.companies.find((c) => c.key === "anthropic")?.delta).toBe(-4);
    expect(page.rising[0]?.key).toBe("openai");
    expect(page.fewer[0]?.key).toBe("anthropic");
    expect(page.risingStates[0]?.key).toBe("CA");
    expect(page.fewerStates[0]?.key).toBe("NY");
  });

  it("says the trend starts this week when only one bucket exists", () => {
    const page = hiringIndexPage(catalog, { version: 1, weeks: [week("2026-10-12")] });
    expect(page.coldStart).toBe(true);
    expect(page.openDelta).toBeNull();
    expect(page.rising).toEqual([]);
    expect(page.fewer).toEqual([]);
    expect(page.description).toMatch(/Week-over-week change starts next week/);
    expect(page.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });
});

describe("snapshot file", () => {
  it("writes atomically and records from a dataset", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hiring-index-"));
    const file = path.join(dir, "hiring-index.json");
    expect(readHiringIndex(file)).toEqual(EMPTY_HIRING_INDEX);
    const data = dataset([job({ id: "openai:greenhouse:board:1", organization_slug: "openai", locations: ["Austin, TX"] })]);
    const recorded = recordHiringIndex("2026-10-18T09:00:00.000Z", data, file);
    expect(recorded?.week_start).toBe("2026-10-12");
    expect(recorded?.states).toEqual([{ key: "TX", count: 1 }]);
    const saved = readHiringIndex(file);
    expect(saved.weeks).toHaveLength(1);
    writeHiringIndex(saved, file);
    expect(JSON.parse(fs.readFileSync(file, "utf8")).weeks[0].open_count).toBe(1);
  });
});

describe("hiring index page", () => {
  it("is a known site path with search, card, and titles that fit", () => {
    const slugs = { organizations: new Set<string>(), artifacts: new Set<string>(), news: new Set<string>(), hubs: new Set<string>(), licenses: new Set<string>(), explainers: new Set<string>(), paths: new Set<string>(), issues: new Set<string>() };
    expect(STATIC_ROUTES).toContain(HIRING_INDEX_HREF);
    expect(isKnownSitePath(HIRING_INDEX_HREF, slugs)).toBe(true);
    expect(hiringIndexSearchEntry(catalog).href).toBe(HIRING_INDEX_HREF);
    expect(pageCards(catalog).some((c) => c.page === HIRING_INDEX_HREF)).toBe(true);
    expect(cardImage(catalog, HIRING_INDEX_HREF)?.path).toBe("/og/jobs/hiring-index.jpg");
    const page = hiringIndexPage(catalog);
    expect(documentTitle(page.title).length).toBeLessThanOrEqual(TITLE_MAX);
    expect(clipDescription(page.description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    const meta = pageMetadata({ title: page.title, description: page.description, path: HIRING_INDEX_HREF });
    expect(String(meta.description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    const ld = hiringIndexJsonLd(page);
    expect(JSON.stringify(ld)).toContain("CollectionPage");
    expect(JSON.stringify(ld)).toContain("Dataset");
    expect(JSON.stringify(ld)).not.toContain("JobPosting");
  });

  it("pairs WARN states with this week's job counts", () => {
    const page = hiringIndexPage(catalog, { version: 1, weeks: [week("2026-10-12")] });
    for (const row of page.warn) {
      expect(["CA", "WA", "NY", "TX"]).toContain(row.code);
      expect(row.layoffHref).toMatch(/^\/jobs\/layoffs\//);
      if (row.code === "CA") expect(row.jobs).toBe(8);
    }
  });
});
