import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Careers } from "../../lib/jobs/schema";
import { adapters } from "../../lib/jobs/adapters";
import { postingUrl } from "../../lib/jobs/security";
import {
  fetchUsaJobsItems,
  isOpenUsaJob,
  isRelevantAiJob,
  rowsUsaJobs,
  searchUrl,
  usaJobsPayload,
  usajobsCredentials,
  USAJOBS_KEYWORDS,
} from "../../lib/jobs/usajobs";

const config = Careers.parse({
  url: "https://www.usajobs.gov",
  enabled: true,
  source: { type: "usajobs", identifier: "ai" },
  source_ids: ["usajobs-home"],
  reviewed_at: "2026-10-16",
});
const sample = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/usajobs-search.json"), "utf8")) as unknown;
const NOW = Date.parse("2026-10-16T12:00:00.000Z");

describe("USAJOBS credentials", () => {
  it("skips when the API key is missing and never requires a committed secret", () => {
    expect(usajobsCredentials({})).toBeNull();
    expect(usajobsCredentials({ USAJOBS_API_KEY: "  " })).toBeNull();
    expect(usajobsCredentials({ USAJOBS_API_KEY: "test-key-not-a-secret" })).toEqual({
      key: "test-key-not-a-secret",
      userAgent: "shadowfetch@mail.grokbot.com",
    });
    expect(usajobsCredentials({ USAJOBS_API_KEY: "test-key-not-a-secret", USAJOBS_USER_AGENT: "ops@example.com" })?.userAgent).toBe("ops@example.com");
  });
});

describe("USAJOBS relevance and close-date filters", () => {
  it("keeps AI titles and spelled-out body terms, and drops keyword false positives", () => {
    expect(isRelevantAiJob("IT SPECIALIST (ARTIFICIAL INTELLIGENCE)", "")).toBe(true);
    expect(isRelevantAiJob("Machine Learning Engineer", "")).toBe(true);
    expect(isRelevantAiJob("Data Scientist", "Analyze health-system data.")).toBe(true);
    expect(isRelevantAiJob("AI Engineer", "")).toBe(true);
    expect(isRelevantAiJob("ML Engineer", "")).toBe(true);
    expect(isRelevantAiJob("IT Specialist (INFOSEC)", "evaluating artificial intelligence systems used in screening")).toBe(true);
    expect(isRelevantAiJob("Nurse Practitioner", "This position is available immediately. Training is provided. Said clinic serves veterans.")).toBe(false);
    expect(isRelevantAiJob("Maintenance Worker", "Aid with air-conditioning available")).toBe(false);
  });
  it("treats a midnight close date as open through that UTC day and drops later", () => {
    expect(isOpenUsaJob({ ApplicationCloseDate: "2026-10-16T00:00:00Z" }, NOW)).toBe(true);
    expect(isOpenUsaJob({ ApplicationCloseDate: "2026-10-15T00:00:00Z" }, NOW)).toBe(false);
    expect(isOpenUsaJob({ ApplicationCloseDate: "2026-10-16T11:00:00Z" }, NOW)).toBe(false);
    expect(isOpenUsaJob({ ApplicationCloseDate: "2026-12-01T00:00:00Z" }, NOW)).toBe(true);
  });
  it("accepts USAJOBS date-only and DateTime strings with extra fractional digits", () => {
    expect(isOpenUsaJob({ ApplicationCloseDate: "2026-10-16" }, NOW)).toBe(true);
    expect(isOpenUsaJob({ ApplicationCloseDate: "2026-10-15" }, NOW)).toBe(false);
    const rows = rowsUsaJobs(
      {
        SearchResult: {
          SearchResultItems: [
            {
              MatchedObjectId: "9",
              MatchedObjectDescriptor: {
                PositionTitle: "AI Engineer",
                PositionURI: "https://www.usajobs.gov/GetJob/ViewDetails/9",
                PublicationStartDate: "2026-10-01",
                ApplicationCloseDate: "2026-12-01T23:59:59.9970000",
              },
            },
          ],
        },
      },
      "federal",
      config,
      NOW,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].job.posted_at).toBe("2026-10-01T00:00:00.000Z");
  });
});

describe("USAJOBS mapper", () => {
  it("maps the recorded sample: agency, pay, apply URL, de-dupe, relevance, and closed posts", () => {
    expect(JSON.stringify(sample)).not.toMatch(/Authorization-Key|USAJOBS_API_KEY/i);
    const rows = rowsUsaJobs(sample, "federal", config, NOW);
    expect(rows.map((r) => r.job.source_job_id)).toEqual(["21947200", "33001001", "33001003"]);
    const ai = rows.find((r) => r.job.source_job_id === "21947200")!.job;
    expect(ai.id).toBe("federal:usajobs:ai:21947200");
    expect(ai.title).toBe("IT SPECIALIST (ARTIFICIAL INTELLIGENCE)");
    expect(ai.department).toBe("National Institute of Standards and Technology");
    expect(ai.team).toBe("Department of Commerce");
    expect(ai.locations).toEqual(["Gaithersburg, Maryland"]);
    expect(ai.countries).toEqual(["United States"]);
    expect(ai.employment_type).toBe("full-time");
    expect(ai.salaries).toEqual([{ min: 92108, max: 119746, currency: "USD", period: "year", label: null, source_status: "employer-provided" }]);
    expect(ai.official_url).toBe("https://www.usajobs.gov/GetJob/ViewDetails/21947200");
    expect(ai.apply_url).toBe("https://www.usajobs.gov/GetJob/ViewDetails/21947200?PostingChannelID=RESTAPI");
    expect(ai.posted_at).toBe("2026-10-01T00:00:00.000Z");
    expect(ai.posted_date_kind).toBe("first-published");
    expect(ai.source_url).toBe("https://data.usajobs.gov/api/search");
    const hourly = rows.find((r) => r.job.source_job_id === "33001001")!.job;
    expect(hourly.title).toBe("Data Scientist");
    expect(hourly.workplace).toBe("remote");
    expect(hourly.remote).toBe(true);
    expect(hourly.salaries[0]).toMatchObject({ min: 45.12, max: 68.4, period: "hour" });
    expect(rows.some((r) => r.job.title === "Nurse Practitioner")).toBe(false);
    expect(rows.some((r) => r.job.source_job_id === "33001999")).toBe(false);
    expect(rows.filter((r) => r.job.source_job_id === "21947200")).toHaveLength(1);
  });
  it("exposes the same rows through the adapter contract", () => {
    expect(adapters.usajobs.normalize(sample, "federal", config).map((j) => j.source_job_id).sort()).toEqual(
      ["21947200", "33001001", "33001003"],
    );
  });
  it("rejects hostile posting hosts and keeps the USAJOBS apply channel parameter", () => {
    expect(postingUrl("https://www.usajobs.gov/GetJob/ViewDetails/21947200?utm_source=x&PostingChannelID=RESTAPI", config))
      .toBe("https://www.usajobs.gov/GetJob/ViewDetails/21947200?PostingChannelID=RESTAPI");
    expect(() => postingUrl("https://www.usajobs.gov.evil.com/GetJob/ViewDetails/1", config)).toThrow();
    expect(() => postingUrl("https://www.usajobs.gov/Apply/Other/1", config)).toThrow();
  });
});

describe("USAJOBS pagination fetch", () => {
  it("searches each keyword, paginates, de-duplicates by control number, and sends required headers without logging the key", async () => {
    const calls: { url: string; headers: Record<string, string> }[] = [];
    const page1 = {
      SearchResult: {
        SearchResultCount: 500,
        SearchResultCountAll: 501,
        SearchResultItems: [{ MatchedObjectId: "1", MatchedObjectDescriptor: { PositionTitle: "AI Engineer", PositionURI: "https://www.usajobs.gov/GetJob/ViewDetails/1", ApplicationCloseDate: "2026-12-01T00:00:00Z" } }],
        UserArea: { NumberOfPages: "2" },
      },
    };
    const page2 = {
      SearchResult: {
        SearchResultCount: 1,
        SearchResultCountAll: 501,
        SearchResultItems: [
          { MatchedObjectId: "1", MatchedObjectDescriptor: { PositionTitle: "AI Engineer", PositionURI: "https://www.usajobs.gov/GetJob/ViewDetails/1" } },
          { MatchedObjectId: "2", MatchedObjectDescriptor: { PositionTitle: "ML Engineer", PositionURI: "https://www.usajobs.gov/GetJob/ViewDetails/2" } },
        ],
        UserArea: { NumberOfPages: "2" },
      },
    };
    const later = {
      SearchResult: { SearchResultCount: 0, SearchResultCountAll: 0, SearchResultItems: [], UserArea: { NumberOfPages: "1" } },
    };
    const fetcher = (async (url: string | URL, init?: RequestInit) => {
      const href = String(url);
      const headers = (init?.headers ?? {}) as Record<string, string>;
      calls.push({ url: href, headers });
      const body = href.includes("Page=2") ? page2 : /(?:\?|&)Keyword=AI(?:&|$)/.test(href) && href.includes("Page=1") ? page1 : later;
      return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
    }) as typeof fetch;
    const items = await fetchUsaJobsItems(
      { key: "test-key-not-a-secret", userAgent: "shadowfetch@mail.grokbot.com" },
      fetcher,
      async () => undefined,
    );
    expect(USAJOBS_KEYWORDS).toEqual(["artificial intelligence", "machine learning", "data scientist", "AI"]);
    expect(calls[0].url).toBe(searchUrl("artificial intelligence", 1));
    expect(calls.some((c) => c.url.includes("Keyword=AI") && c.url.includes("Page=2"))).toBe(true);
    expect(calls.every((c) => c.headers["Authorization-Key"] === "test-key-not-a-secret")).toBe(true);
    expect(calls.every((c) => c.headers["User-Agent"] === "shadowfetch@mail.grokbot.com")).toBe(true);
    expect(calls.every((c) => c.headers.Host === "data.usajobs.gov")).toBe(true);
    expect(JSON.stringify(calls)).not.toMatch(/USAJOBS_API_KEY/);
    expect(items.map((i) => String(i.MatchedObjectId)).sort()).toEqual(["1", "2"]);
    const rows = rowsUsaJobs(usaJobsPayload(items), "federal", config, NOW);
    expect(rows.map((r) => r.job.source_job_id).sort()).toEqual(["1", "2"]);
  });
});
