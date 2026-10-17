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

describe("Workable and SmartRecruiters adapters", () => {
  const cfg = (type: "workable" | "smartrecruiters", identifier: string) => ({ url: "https://example.com/careers", enabled: true, source: { type, identifier }, posting_hosts: [], source_ids: ["x"], reviewed_at: "2026-10-16" });
  it("Workable: one list with descriptions, /j/<shortcode> links only", async () => {
    const { adapters } = await import("@/lib/jobs/adapters");
    const job = { title: "ML Engineer", shortcode: "81B46579FE", url: "https://apply.workable.com/j/81B46579FE", application_url: "https://apply.workable.com/j/81B46579FE/apply",
      employment_type: "Full-time", telecommuting: true, department: "Open Source", published_on: "2026-05-29", country: "France", city: "Paris", state: "Île-de-France",
      locations: [{ country: "France", city: "Paris", region: "Île-de-France", hidden: false }], description: "<p>Hello</p>" };
    const [row] = adapters.workable.rows({ jobs: [job] }, "hugging-face", cfg("workable", "huggingface"));
    expect(row.job.id).toBe("hugging-face:workable:huggingface:81B46579FE");
    expect(row.job.official_url).toBe("https://apply.workable.com/j/81B46579FE");
    expect(row.job.workplace).toBe("remote");
    expect(row.job.locations).toEqual(["Paris, Île-de-France, France"]);
    expect(row.job.posted_at).toBe("2026-05-29T00:00:00.000Z");
    expect(row.html).toBe("<p>Hello</p>");
    expect(() => adapters.workable.rows({ jobs: [{ ...job, url: "https://apply.workable.com/other/81B46579FE" }] }, "hugging-face", cfg("workable", "huggingface"))).toThrow();
  });
  it("SmartRecruiters: builds the public posting URL and keeps a stored description when none was fetched", async () => {
    const { adapters } = await import("@/lib/jobs/adapters");
    const posting = { id: "744000156093019", name: "Principal Software Engineer", releasedDate: "2026-10-16T23:15:30.201Z", refNumber: "JB0076129",
      location: { city: "San Diego", region: "CALIFORNIA", country: "us", remote: false, hybrid: true, fullLocation: "San Diego, CALIFORNIA, United States" },
      department: { label: "Engineering" }, typeOfEmployment: { id: "permanent", label: "Full-time" } };
    const c = cfg("smartrecruiters", "ServiceNow");
    const [withHtml] = adapters.smartrecruiters.rows({ postings: [posting], details: { "744000156093019": "<p>Role</p>" } }, "servicenow", c);
    expect(withHtml.job.official_url).toBe("https://jobs.smartrecruiters.com/ServiceNow/744000156093019");
    expect(withHtml.job.workplace).toBe("hybrid");
    expect(withHtml.job.employment_type).toBe("full-time");
    expect(withHtml.job.countries).toEqual(["US"]);
    expect(withHtml.html).toBe("<p>Role</p>");
    const [kept] = adapters.smartrecruiters.rows({ postings: [posting], details: {} }, "servicenow", c);
    expect(kept.html).toBeUndefined();
  });
  it("accepts board names with a period, as Ashby uses for nomic.ai", async () => {
    const { Careers } = await import("@/lib/jobs/schema");
    expect(Careers.safeParse({ ...cfg("workable", "x"), source: { type: "ashby", identifier: "nomic.ai" } }).success).toBe(true);
    expect(Careers.safeParse({ ...cfg("workable", "x"), source: { type: "ashby", identifier: ".hidden" } }).success).toBe(false);
  });
});

describe("Workday adapter", () => {
  const c = { url: "https://acme.wd5.myworkdayjobs.com/External", enabled: true, source: { type: "workday" as const, identifier: "acme.wd5.External" }, posting_hosts: [], source_ids: ["x"], reviewed_at: "2026-10-16" };
  const posting = { title: "Senior GPU Engineer", externalPath: "/job/US-CA-Santa-Clara/Senior-GPU-Engineer_JR1", locationsText: "2 Locations", bulletFields: ["JR1"] };
  it("uses cached details, builds the career-site link, and ignores location counts", async () => {
    const { adapters } = await import("@/lib/jobs/adapters");
    const meta = { "Senior-GPU-Engineer_JR1": { locations: ["US, CA, Santa Clara", "US, TX, Austin"], country: "US", startDate: "2026-10-01", timeType: "Full time", reqId: "JR1", remote: false } };
    const [row] = adapters.workday.rows({ postings: [posting], meta, details: { "Senior-GPU-Engineer_JR1": "<p>Build GPUs</p>" } }, "acme", c);
    expect(row.job.id).toBe("acme:workday:acme.wd5.External:Senior-GPU-Engineer_JR1");
    expect(row.job.official_url).toBe("https://acme.wd5.myworkdayjobs.com/External/job/US-CA-Santa-Clara/Senior-GPU-Engineer_JR1");
    expect(row.job.locations).toEqual(["US, CA, Santa Clara", "US, TX, Austin"]);
    expect(row.job.employment_type).toBe("full-time");
    expect(row.job.posted_at).toBe("2026-10-01T00:00:00.000Z");
    expect(row.html).toBe("<p>Build GPUs</p>");
    const [bare] = adapters.workday.rows({ postings: [posting], meta: {}, details: {} }, "acme", c);
    expect(bare.job.locations).toEqual([]);
    expect(bare.html).toBeUndefined();
  });
  it("rejects links off the employer's Workday host or outside /<site>/job/", async () => {
    const { postingUrl } = await import("@/lib/jobs/security");
    expect(() => postingUrl("https://evil.wd5.myworkdayjobs.com/External/job/x", c)).toThrow();
    expect(() => postingUrl("https://acme.wd5.myworkdayjobs.com/Other/job/x", c)).toThrow();
    expect(postingUrl("https://acme.wd5.myworkdayjobs.com/External/job/x?source=li", c)).toBe("https://acme.wd5.myworkdayjobs.com/External/job/x");
  });
  it("accepts only <tenant>.<wdN>.<site> identifiers", async () => {
    const { Careers } = await import("@/lib/jobs/schema");
    expect(Careers.safeParse(c).success).toBe(true);
    expect(Careers.safeParse({ ...c, source: { type: "workday", identifier: "acme.External" } }).success).toBe(false);
  });
});

describe("workplace from the employer's own words", () => {
  it("reads only explicit statements about the role", async () => {
    const { workplaceFromText, allLocationsRemote, workplaceFromWorkdayType } = await import("@/lib/jobs/workplace-text");
    expect(workplaceFromText("Location: This is a fully remote position open to U.S. candidates.")).toBe("remote");
    expect(workplaceFromText("This is a hybrid role based in our Austin office.")).toBe("hybrid");
    expect(workplaceFromText("You will work three days a week in the office.")).toBe("hybrid");
    expect(workplaceFromText("This is an onsite position at our Salem office.")).toBe("on-site");
    // Benefits, duties, slogans, and mixed statements stay unknown.
    expect(workplaceFromText("Benefits: hybrid work model, wellness days.")).toBeNull();
    expect(workplaceFromText("Run live and hybrid events for the company.")).toBeNull();
    expect(workplaceFromText("We are a remote-first company.")).toBeNull();
    expect(workplaceFromText("Work on remote sensing pipelines.")).toBeNull();
    expect(workplaceFromText("This is a fully remote role. This is an onsite position.")).toBeNull();
    expect(allLocationsRemote(["Remote - US", "Remote, Canada"])).toBe(true);
    expect(allLocationsRemote(["Remote - US", "New York, NY"])).toBe(false);
    expect(workplaceFromWorkdayType("Office - Flexible")).toBe("hybrid");
    expect(workplaceFromWorkdayType("Remote")).toBe("remote");
    expect(workplaceFromWorkdayType(null)).toBeNull();
  });
});

describe("Workday myworkdaysite.com sites", () => {
  it("builds and checks links under /recruiting/<tenant>/<site>/job/", async () => {
    const { workdaySite, postingUrl } = await import("@/lib/jobs/security");
    expect(workdaySite("uw.wd5site.UWHires")).toEqual({ tenant: "uw", host: "wd5.myworkdaysite.com", site: "UWHires", base: "/recruiting/uw/UWHires" });
    const c = { url: "https://wd5.myworkdaysite.com/recruiting/uw/UWHires", enabled: true, source: { type: "workday" as const, identifier: "uw.wd5site.UWHires" }, posting_hosts: [], source_ids: ["x"], reviewed_at: "2026-10-17" };
    expect(postingUrl("https://wd5.myworkdaysite.com/recruiting/uw/UWHires/job/Seattle-WA/Analyst_REQ-1", c)).toBe("https://wd5.myworkdaysite.com/recruiting/uw/UWHires/job/Seattle-WA/Analyst_REQ-1");
    expect(() => postingUrl("https://wd5.myworkdaysite.com/recruiting/other/UWHires/job/x", c)).toThrow();
  });
});
