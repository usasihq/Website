import { describe, expect, it } from "vitest";
import { jobHref, shortCode, titleSlug } from "@/lib/jobs/job-url";
import { hfJobPagePath, hfJobRows, hfJobsCsv, hfJobsReadme } from "@/lib/jobs/hf-dataset";
import type { JobItem } from "@/lib/jobs/search";

const item = (over: Partial<JobItem> = {}): JobItem => ({
  id: "acme-ai:greenhouse:acme:1",
  organization_slug: "acme-ai",
  organization_name: "Acme AI",
  source_type: "greenhouse",
  source_identifier: "acme",
  source_job_id: "1",
  source_url: "https://boards-api.greenhouse.io/v1/boards/acme/jobs",
  title: "Research Engineer",
  locations: ["San Francisco, CA", "NYC Office"],
  countries: ["USA"],
  workplace: "hybrid",
  employment_type: "full-time",
  department: "Research",
  team: null,
  salaries: [{ min: 180000, max: 220000, currency: "USD", period: "year", label: null, source_status: "employer-provided" }],
  official_url: "https://job-boards.greenhouse.io/acme/jobs/1",
  posted_at: "2026-10-01T00:00:00.000Z",
  posted_date_kind: "first-published",
  first_seen: "2026-10-02T00:00:00.000Z",
  last_seen: "2026-10-18T00:00:00.000Z",
  status: "open",
  ...over,
});

describe("Hugging Face jobs dataset rows", () => {
  it("adds the USASI job page and keeps the employer posting URL", () => {
    const [row] = hfJobRows([item()], "https://unitedstatesofamericasuperintelligence.com/");
    expect(row.page).toBe(`https://unitedstatesofamericasuperintelligence.com${jobHref(item())}`);
    expect(row.official_url).toBe("https://job-boards.greenhouse.io/acme/jobs/1");
    expect(row.employer).toBe("Acme AI");
    expect(row.employer_slug).toBe("acme-ai");
    expect(row.locations).toBe("San Francisco, CA; NYC Office");
    expect(row.ats).toBe("greenhouse");
    expect(row.remote).toBe(false);
    expect(row.salary_min).toBe(180000);
    expect(row.salary_max).toBe(220000);
  });

  it("uses the first employer-provided pay range and leaves description-only pay empty", () => {
    const fromText = item({
      salaries: [{ min: 90000, max: 110000, currency: "USD", period: "year", label: null, source_status: "employer-description" }],
    });
    expect(hfJobRows([fromText], "https://example.org")[0].salary_min).toBe("");
    const mixed = item({
      salaries: [
        { min: 50, max: 80, currency: "USD", period: "hour", label: "intern", source_status: "employer-provided" },
        { min: 200000, max: 300000, currency: "USD", period: "year", label: null, source_status: "employer-provided" },
      ],
    });
    expect(hfJobRows([mixed], "https://example.org")[0].salary_period).toBe("hour");
  });

  it("records remote as true / false / empty from workplace", () => {
    expect(hfJobRows([item({ workplace: "remote" })], "https://example.org")[0].remote).toBe(true);
    expect(hfJobRows([item({ workplace: "on-site" })], "https://example.org")[0].remote).toBe(false);
    expect(hfJobRows([item({ workplace: "unknown" })], "https://example.org")[0].remote).toBe("");
  });

  it("keeps colliding title slugs unique the same way job pages do", () => {
    const taken = new Set<string>();
    const a = hfJobPagePath(item({ id: "acme-ai:greenhouse:acme:1", source_job_id: "1" }), taken);
    const b = hfJobPagePath(item({ id: "acme-ai:greenhouse:acme:1", source_job_id: "1" }), taken);
    expect(a).toMatch(/^\/jobs\/at\/acme-ai\/research-engineer-[0-9a-z]{7}\/$/);
    expect(b).toBe(`${a.slice(0, -1)}-1/`);
  });

  it("writes CSV with page as a column and a dataset card that credits the live jobs board", () => {
    const rows = hfJobRows([item()], "https://unitedstatesofamericasuperintelligence.com");
    const csv = hfJobsCsv(rows);
    expect(csv.split("\n")[0]).toContain("page");
    expect(csv).toContain(rows[0].page);
    const readme = hfJobsReadme(rows, "2026-10-18T12:00:00.000Z");
    expect(readme).toContain("unitedstatesofamericasuperintelligence.com/jobs/");
    expect(readme).toContain("`page`");
    expect(readme).toContain("path: jobs.csv");
  });
});

describe("job page codes the Space app copies", () => {
  it("are stable values the static explorer can match when page is missing", () => {
    expect(titleSlug("Senior Software Engineer, Inference (C++/CUDA)")).toBe("senior-software-engineer-inference-c-cuda");
    expect(titleSlug("R&D Lead")).toBe("r-and-d-lead");
    expect(shortCode("openai:ashby:openai:abc")).toBe("0e1cf02");
    expect(jobHref({ id: "acme-ai:greenhouse:acme:1", title: "Research Engineer", organization_slug: "acme-ai" })).toBe("/jobs/at/acme-ai/research-engineer-1k4n0g0/");
    expect(shortCode("abridge:ashby:Abridge:03a3231f-8361-405e-87a6-192d710ca912")).toBe(shortCode("abridge:ashby:Abridge:03a3231f-8361-405e-87a6-192d710ca912"));
  });
});
