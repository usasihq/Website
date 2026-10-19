import { describe, expect, it } from "vitest";
import { fetchWorkday, TOTAL_CAP } from "@/lib/jobs/workday";
import type { Careers } from "@/lib/jobs/schema";

const c = {
  url: "https://acme.wd5.myworkdayjobs.com/External",
  enabled: true,
  source: { type: "workday" as const, identifier: "acme.wd5.External" },
  posting_hosts: [],
  source_ids: ["x"],
  reviewed_at: "2026-10-16",
} satisfies Careers;

const cached = () => ({
  locations: ["US, CA, Santa Clara"],
  country: "US" as const,
  startDate: null,
  timeType: "Full time",
  reqId: "JR",
  remote: false,
});

const posting = (prefix: string, i: number) => ({
  title: `${prefix} ${i}`,
  externalPath: `/job/US/${prefix}-${i}`,
});

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });

describe("Workday list pagination", () => {
  it("does not walk the unfiltered list when Workday reports the 2,000 cap", async () => {
    const unfilteredOffsets: number[] = [];
    const facetKeys: string[] = [];
    const fetcher = (async (_url: string | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { appliedFacets?: Record<string, string[]>; offset?: number };
      const facets = body.appliedFacets ?? {};
      const offset = body.offset ?? 0;
      if (!Object.keys(facets).length) {
        unfilteredOffsets.push(offset);
        expect(offset, "capped lists must not paginate the unfiltered walk").toBe(0);
        return json({
          total: TOTAL_CAP,
          jobPostings: Array.from({ length: 20 }, (_, i) => posting("Open", i)),
          facets: [{
            facetParameter: "jobFamilyGroup",
            values: [
              { id: "eng", descriptor: "Engineering", count: 30 },
              { id: "sales", descriptor: "Sales", count: 25 },
            ],
          }],
        });
      }
      const family = facets.jobFamilyGroup?.[0] ?? "other";
      facetKeys.push(`${family}:${offset}`);
      const n = family === "eng" ? (offset === 0 ? 20 : 10) : (offset === 0 ? 20 : 5);
      return json({
        total: family === "eng" ? 30 : 25,
        jobPostings: Array.from({ length: n }, (_, i) => posting(family, offset + i)),
        facets: [],
      });
    }) as typeof fetch;

    const payload = await fetchWorkday(c, () => cached(), () => true, fetcher);
    expect(unfilteredOffsets).toEqual([0]);
    expect(facetKeys).toEqual(["eng:0", "eng:20", "sales:0", "sales:20"]);
    expect(payload.postings.length).toBeGreaterThanOrEqual(Math.ceil(55 * 0.97));
  });

  it("paginates the unfiltered list when the total is under the cap", async () => {
    const offsets: number[] = [];
    const fetcher = (async (_url: string | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as { offset?: number };
      const offset = body.offset ?? 0;
      offsets.push(offset);
      const n = offset === 0 ? 20 : 5;
      return json({
        total: 25,
        jobPostings: Array.from({ length: n }, (_, i) => posting("Role", offset + i)),
      });
    }) as typeof fetch;

    const payload = await fetchWorkday(c, () => cached(), () => true, fetcher);
    expect(offsets).toEqual([0, 20]);
    expect(payload.postings).toHaveLength(25);
  });
});
