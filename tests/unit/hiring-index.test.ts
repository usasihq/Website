import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import {
  companyChanges,
  countOpenJobs,
  stateChanges,
  statesLabel,
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
import type { Dataset, FeedHealth, Job } from "@/lib/jobs/schema";
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

const feed = (slug: string, result: FeedHealth["result"] = "ok"): FeedHealth => ({
  organization_slug: slug,
  source_type: "greenhouse",
  source_identifier: "board",
  last_attempted: "2026-10-18T00:00:00.000Z",
  last_successful: result === "ok" ? "2026-10-18T00:00:00.000Z" : "2026-10-10T00:00:00.000Z",
  result,
  consecutive_failures: result === "ok" ? 0 : 1,
  current_count: 0,
  pending_digest: null,
  pending_since: null,
});

/** Every employer in `jobs` gets a successful feed unless `feeds` overrides it. */
const dataset = (jobs: Job[], feeds: FeedHealth[] = []): Dataset => {
  const given = new Set(feeds.map((f) => f.organization_slug));
  return { version: 1, jobs, feeds: [...feeds, ...[...new Set(jobs.map((j) => j.organization_slug))].filter((s) => !given.has(s)).map((s) => feed(s))] };
};

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
    const counts = countOpenJobs(data, Date.parse("2026-10-18T12:00:00.000Z"));
    expect(counts.open_count).toBe(2);
    expect(counts.companies).toEqual([{ key: "openai", count: 2 }]);
    expect(counts.states).toEqual([
      { key: "CA", count: 1 },
      { key: "NY", count: 1 },
    ]);
  });
});

describe("current rule (same as the Jobs directory)", () => {
  const at = Date.parse("2026-10-19T00:00:00.000Z");
  it("leaves out listings from failed or anomalous sources and listings not seen in 48 hours", () => {
    const data = dataset(
      [
        job({ id: "openai:greenhouse:board:1", organization_slug: "openai", locations: ["San Francisco, CA"] }),
        job({ id: "openai:greenhouse:board:2", organization_slug: "openai", locations: ["Austin, TX"], last_seen: "2026-10-16T00:00:00.000Z" }),
        job({ id: "micron:greenhouse:board:3", organization_slug: "micron", locations: ["Boise, ID"] }),
        job({ id: "salesforce:greenhouse:board:4", organization_slug: "salesforce", locations: ["Seattle, WA"] }),
      ],
      [feed("micron", "anomaly"), feed("salesforce", "rate-limited")],
    );
    const counts = countOpenJobs(data, at);
    expect(counts.open_count).toBe(1);
    expect(counts.companies).toEqual([{ key: "openai", count: 1 }]);
    expect(counts.states).toEqual([{ key: "CA", count: 1 }]);
    expect(counts.checked).toEqual(["openai"]);
    expect(counts.unchecked).toEqual(["micron", "salesforce"]);
    expect(counts.employer_states).toEqual([{ key: "openai", states: [{ key: "CA", count: 1 }] }]);
  });

  it("does not link an employer with no current listings", () => {
    const now = week("2026-10-19", { companies: [{ key: "openai", count: 3 }], checked: ["openai"], unchecked: ["micron"] });
    const before = week("2026-10-12", { companies: [{ key: "openai", count: 2 }, { key: "micron", count: 5 }] });
    const rows = companyChanges(now, before);
    expect(rows.find((r) => r.key === "openai")).toMatchObject({ href: "/jobs/at/openai/", delta: 1, status: "compared" });
    expect(rows.find((r) => r.key === "micron")).toMatchObject({ href: null, count: 0, delta: null, status: "unchecked" });
  });
});

describe("week-over-week change", () => {
  const before = week("2026-10-12", {
    open_count: 30,
    companies: [{ key: "openai", count: 20 }, { key: "anthropic", count: 10 }],
    states: [{ key: "CA", count: 30 }],
    checked: ["anthropic", "openai"],
    unchecked: [],
    employer_states: [
      { key: "anthropic", states: [{ key: "CA", count: 10 }] },
      { key: "openai", states: [{ key: "CA", count: 20 }] },
    ],
  });
  const now = week("2026-10-19", {
    open_count: 1030,
    companies: [{ key: "nvidia", count: 1000 }, { key: "openai", count: 25 }, { key: "anthropic", count: 5 }],
    states: [{ key: "CA", count: 1030 }],
    checked: ["anthropic", "nvidia", "openai"],
    unchecked: [],
    employer_states: [
      { key: "anthropic", states: [{ key: "CA", count: 5 }] },
      { key: "nvidia", states: [{ key: "CA", count: 1000 }] },
      { key: "openai", states: [{ key: "CA", count: 25 }] },
    ],
  });

  it("counts change only at employers checked both weeks and marks new sources", () => {
    const page = hiringIndexPage(catalog, { version: 1, weeks: [before, now] });
    expect(page.openCount).toBe(1030);
    expect(page.compared).toEqual({ employers: 2, previous: 30, current: 30 });
    expect(page.openDelta).toBe(0);
    expect(page.newSources).toEqual({ employers: 1, listings: 1000 });
    const nvidia = page.companies.find((c) => c.key === "nvidia")!;
    expect(nvidia.status).toBe("new");
    expect(nvidia.delta).toBeNull();
    expect(page.rising.map((r) => r.key)).toEqual(["openai"]);
    expect(page.fewer.map((r) => r.key)).toEqual(["anthropic"]);
    expect(page.description).not.toMatch(/up 1,000/);
    expect(page.description).toMatch(/unchanged at the 2 employers counted both weeks; 1 new source/);
    expect(page.description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(page.earlierRuleWeeks).toEqual([]);
  });

  it("limits state change to the same employers", () => {
    const { rows, compared } = stateChanges(now, before, new Set(["openai", "anthropic"]));
    expect(compared).toBe(true);
    expect(rows[0]).toMatchObject({ key: "CA", count: 1030, delta: 0 });
  });

  it("shows no state change, and notes the earlier rule, when last week predates per-employer counts", () => {
    const old = week("2026-10-12");
    const page = hiringIndexPage(catalog, { version: 1, weeks: [old, now] });
    expect(page.stateCompare).toBe(false);
    expect(page.states.every((r) => r.delta === null)).toBe(true);
    expect(page.risingStates).toEqual([]);
    expect(page.earlierRuleWeeks).toEqual(["Oct 12–18, 2026"]);
    // openai and anthropic had listings in the old week, so they compare; nvidia is new.
    expect(page.companies.find((c) => c.key === "nvidia")?.status).toBe("new");
    expect(page.compared?.employers).toBe(2);
  });

  it("marks a source that failed last week instead of showing its jump", () => {
    const failedBefore = { ...before, companies: [{ key: "anthropic", count: 10 }], checked: ["anthropic"], unchecked: ["openai"] };
    const rows = companyChanges(now, failedBefore);
    expect(rows.find((r) => r.key === "openai")).toMatchObject({ status: "unchecked-before", delta: null });
  });
});

describe("state count label", () => {
  it("never counts D.C. as a state", () => {
    expect(statesLabel(["CA", "DC", "NY"])).toBe("2 U.S. states and D.C.");
    expect(statesLabel(["CA"])).toBe("1 U.S. state");
    expect(statesLabel(["DC"])).toBe("D.C.");
    const fifty = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
    expect(statesLabel([...fifty, "DC"])).toBe("50 U.S. states and D.C.");
  });
});

describe("weekly merge", () => {
  it("replaces the same week and keeps later weeks", () => {
    const first = snapshotFromDataset(
      dataset([job({ id: "openai:greenhouse:board:1", organization_slug: "openai", locations: ["San Francisco, CA"] })]),
      "2026-10-18T06:00:00.000Z",
    );
    const second = snapshotFromDataset(
      dataset([
        job({ id: "openai:greenhouse:board:1", organization_slug: "openai", locations: ["San Francisco, CA"] }),
        job({ id: "anthropic:greenhouse:board:2", organization_slug: "anthropic", locations: ["Seattle, WA"] }),
      ]),
      "2026-10-18T18:00:00.000Z",
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
    // An employer with no listings this week is left out of the top table but still listed under "fewer" (unlinked).
    expect(page.companies.find((c) => c.key === "anthropic")).toBeUndefined();
    expect(page.fewer.find((c) => c.key === "anthropic")).toMatchObject({ delta: -4, href: null });
    expect(page.rising[0]?.key).toBe("openai");
    expect(page.fewer[0]?.key).toBe("anthropic");
    // Weeks without per-employer state counts can't separate new sources, so no state change is shown.
    expect(page.stateCompare).toBe(false);
    expect(page.risingStates).toEqual([]);
    expect(page.fewerStates).toEqual([]);
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
