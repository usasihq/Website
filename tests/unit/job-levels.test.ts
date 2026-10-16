import { describe, expect, it } from "vitest";
import { annualUsdTop, jobCategory, jobLevel } from "@/lib/jobs/levels";
import { parseWhere, whereText } from "@/lib/jobs/where";
import { DEFAULT_JOB_FILTERS, filterJobs, parseJobFilters, serializeJobFilters, type JobItem } from "@/lib/jobs/search";
import type { FeedHealth } from "@/lib/jobs/schema";

describe("experience level from the title", () => {
  it.each([
    ["2027 Summer Intern, PhD, Data Science", "intern"],
    ["Software Engineer - New Grad 2026", "entry"],
    ["Mechanical Engineer I", "entry"],
    ["Research Associate II, Horns Lab", "not-stated"],
    ["Associate Director, Finance", "director"],
    ["Senior Software Engineer, Storage", "senior"],
    ["Senior Engineering Manager, Capacity", "manager"],
    ["Principal Product Manager", "staff"],
    ["Staff Research Scientist", "staff"],
    ["Director, Field Engineering", "director"],
    ["Head of Customer Engineering", "director"],
    ["VP, Product Management", "executive"],
    ["Software Engineer, Infrastructure", "not-stated"],
  ])("%s → %s", (title, level) => {
    expect(jobLevel(title)).toBe(level);
  });
});

describe("job category from the title", () => {
  it.each([
    ["Data Center Technician", "facilities"],
    ["Engineering Manager, Connectivity", "software"],
    ["Senior Cloud Support Engineer", "customer"],
    ["Data Scientist, Safeguards", "data"],
    ["Research Scientist, Foundation Models", "ml-research"],
    ["Staff Product Designer", "design"],
    ["Enterprise Account Executive - Retail", "sales"],
    ["Solutions Architect - Manufacturing", "solutions"],
    ["Counsel, Intellectual Property", "legal-policy"],
    ["Technical Recruiter (Entry Level)", "people"],
  ])("%s → %s", (title, category) => {
    expect(jobCategory(title)).toBe(category);
  });
});

describe("annual U.S.-dollar pay top", () => {
  it("uses the top of USD ranges, annualizing hourly pay, and ignores other currencies", () => {
    expect(annualUsdTop([{ currency: "USD", period: "year", min: 180000, max: 250000 }])).toBe(250000);
    expect(annualUsdTop([{ currency: "USD", period: "hour", min: 40, max: 50 }])).toBe(104000);
    expect(annualUsdTop([{ currency: "EUR", period: "year", min: 90000, max: 120000 }])).toBeNull();
    expect(annualUsdTop([])).toBeNull();
  });
});

describe("the Where box", () => {
  it.each([
    ["Remote", { where: "remote" }],
    ["remote us", { where: "remote-us" }],
    ["Remote (U.S.)", { where: "remote-us" }],
    ["California", { state: "CA" }],
    ["tx", { state: "TX" }],
    ["San Francisco, CA", { state: "CA", city: "san-francisco" }],
    ["New York, New York", { state: "NY", city: "new-york" }],
    ["Washington, DC", { state: "DC" }],
    ["London", { location: "London" }],
  ])("%s", (text, expected) => {
    expect(parseWhere(text)).toEqual({ where: "", state: "", city: "", location: "", ...expected });
  });
  it("reads back as the same words", () => {
    expect(whereText(parseWhere("Remote"))).toBe("Remote");
    expect(whereText(parseWhere("San Francisco, CA"), "San Francisco")).toBe("San Francisco, CA");
  });
});

describe("level, category, and pay filters", () => {
  const now = Date.parse("2026-10-16T12:00:00.000Z");
  const seen = "2026-10-16T11:00:00.000Z";
  const feed: FeedHealth = { organization_slug: "x", source_type: "greenhouse", source_identifier: "x", last_attempted: seen, last_successful: seen, result: "ok", consecutive_failures: 0, current_count: 0, pending_digest: null, pending_since: null };
  let n = 0;
  const job = (title: string, salaries: JobItem["salaries"] = [], posted: string | null = null): JobItem => ({
    id: `x:greenhouse:x:${++n}`, organization_slug: "x", source_type: "greenhouse", source_identifier: "x", source_job_id: String(n),
    source_url: "https://boards-api.greenhouse.io/v1/boards/x/jobs", title, locations: ["San Francisco, CA"], countries: [], workplace: "unknown",
    employment_type: "unknown", department: null, team: null, salaries, official_url: `https://job-boards.greenhouse.io/x/jobs/${n}`, posted_at: posted,
    posted_date_kind: "first-published", first_seen: seen, last_seen: seen, status: "open", organization_name: "X" });
  const rows = [
    job("Senior Software Engineer", [{ currency: "USD", period: "year", min: 200000, max: 280000, label: null, source_status: "employer-provided" as const }], "2026-10-15T00:00:00.000Z"),
    job("Software Engineer - New Grad", [{ currency: "USD", period: "year", min: 120000, max: 150000, label: null, source_status: "employer-provided" as const }], "2026-09-01T00:00:00.000Z"),
    job("Account Executive"),
  ];
  const run = (patch: Partial<typeof DEFAULT_JOB_FILTERS>) => filterJobs(rows, [feed], { ...DEFAULT_JOB_FILTERS, ...patch }, now).map((j) => j.title);
  it("filters by level, category, and the pay threshold", () => {
    expect(run({ level: "entry" })).toEqual(["Software Engineer - New Grad"]);
    expect(run({ category: "sales" })).toEqual(["Account Executive"]);
    expect(run({ pay: "200000" })).toEqual(["Senior Software Engineer"]);
  });
  it("sorts by highest pay and by newest", () => {
    expect(run({ sort: "pay" })).toEqual(["Senior Software Engineer", "Software Engineer - New Grad", "Account Executive"]);
    expect(run({ sort: "newest" })[0]).toBe("Account Executive"); // first seen today, newer than both publication dates
    expect(run({ posted: "7" }).sort()).toEqual(["Account Executive", "Senior Software Engineer"]);
  });
  it("round-trips the new filters through the URL", () => {
    const f = { ...DEFAULT_JOB_FILTERS, level: "senior", category: "software", pay: "150000", sort: "pay" };
    expect(parseJobFilters(new URLSearchParams(serializeJobFilters(f)))).toEqual(f);
    expect(parseJobFilters(new URLSearchParams("level=bogus&category=nope&pay=7")).level).toBe("");
  });
});

describe("Lever adapter", () => {
  it("normalizes a posting, keeps the description sections, and rejects foreign posting hosts", async () => {
    const { adapters } = await import("@/lib/jobs/adapters");
    const c = { url: "https://example.com/careers", enabled: true, source: { type: "lever" as const, identifier: "acme" }, posting_hosts: [], source_ids: ["x"], reviewed_at: "2026-10-16" };
    const posting = { id: "6ed76ce8-4156-4b60-b120-403538bd66cd", text: "Forward Deployed Engineer", hostedUrl: "https://jobs.lever.co/acme/6ed76ce8-4156-4b60-b120-403538bd66cd",
      applyUrl: "https://jobs.lever.co/acme/6ed76ce8-4156-4b60-b120-403538bd66cd/apply", createdAt: 1786469891368, country: "US", workplaceType: "remote",
      categories: { location: "New York, NY", team: "Engineering", commitment: "Full-time", allLocations: ["New York, NY", "Remote - US"] },
      description: "<div>About the role</div>", lists: [{ text: "What you'll do", content: "<li>Ship</li>" }], additional: "<p>Benefits</p>",
      salaryRange: { min: 150000, max: 200000, currency: "USD", interval: "per-year-salary" } };
    const [row] = adapters.lever.rows([posting], "acme", c);
    expect(row.job.id).toBe("acme:lever:acme:6ed76ce8-4156-4b60-b120-403538bd66cd");
    expect(row.job.workplace).toBe("remote");
    expect(row.job.employment_type).toBe("full-time");
    expect(row.job.locations).toEqual(["New York, NY", "Remote - US"]);
    expect(row.job.salaries[0]).toMatchObject({ min: 150000, max: 200000, currency: "USD", period: "year" });
    expect(row.html).toContain("<h3>What you'll do</h3><ul><li>Ship</li></ul>");
    expect(() => adapters.lever.rows([{ ...posting, hostedUrl: "https://evil.example/acme/1" }], "acme", c)).toThrow();
  });
});

describe("Greenhouse locations", () => {
  it("splits a semicolon-separated location field into separate locations", async () => {
    const { adapters } = await import("@/lib/jobs/adapters");
    const c = { url: "https://example.com/careers", enabled: true, source: { type: "greenhouse" as const, identifier: "acme" }, posting_hosts: [], source_ids: ["x"], reviewed_at: "2026-10-16" };
    const many = Array.from({ length: 12 }, (_, i) => `City ${i}, Colorado, United States`).join("; ");
    const [row] = adapters.greenhouse.rows({ jobs: [{ id: 1, internal_job_id: 2, title: "Engineer", absolute_url: "https://boards.greenhouse.io/acme/jobs/1", location: { name: many } }], meta: { total: 1 } }, "acme", c);
    expect(row.job.locations).toHaveLength(12);
    expect(row.job.locations[0]).toBe("City 0, Colorado, United States");
  });
});
