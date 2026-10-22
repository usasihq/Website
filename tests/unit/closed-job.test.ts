import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildClosedJobIndex,
  closedJobView,
  missingJob,
  parseJobListingPath,
  titleFromJobSlug,
  type ClosedJobIndex,
} from "@/lib/jobs/closed-job";
import { closedJobResponse, renderClosedJobPage } from "@/lib/jobs/closed-job-html";

const index: ClosedJobIndex = {
  shell: { htmlClass: "fonts", links: '<link rel="stylesheet" href="/_next/static/chunks/a.css"/>' },
  orgs: {
    "agility-robotics": { name: "Agility Robotics", jobsPath: "/jobs/at/agility-robotics/", companyPath: "/companies/agility-robotics/" },
    acme: { name: "Acme AI", jobsPath: "/jobs/at/acme/", companyPath: "/companies/acme/" },
    other: { name: "Other Lab", jobsPath: "/jobs/at/other/", companyPath: "/companies/other/" },
  },
  jobs: [
    { org: "agility-robotics", title: "Robotics Software Engineer", path: "/jobs/at/agility-robotics/robotics-software-engineer-aaaaaaa/", location: "Remote" },
    { org: "agility-robotics", title: "Mechanical Engineer", path: "/jobs/at/agility-robotics/mechanical-engineer-bbbbbbb/", location: "Salem, OR" },
    { org: "acme", title: "Senior AI Research Engineer", path: "/jobs/at/acme/senior-ai-research-engineer-ccccccc/", location: "San Francisco, CA" },
    { org: "acme", title: "Staff Research Scientist", path: "/jobs/at/acme/staff-research-scientist-ddddddd/", location: "New York, NY" },
    { org: "acme", title: "Account Executive", path: "/jobs/at/acme/account-executive-eeeeeee/", location: "Austin, TX" },
    { org: "other", title: "Research Engineer, Interpretability", path: "/jobs/at/other/research-engineer-interpretability-fffffff/", location: "Remote" },
  ],
};

describe("closed listing addresses", () => {
  it("reads the employer and title words, and ignores other addresses", () => {
    expect(parseJobListingPath("/jobs/at/anthropic/research-engineer-interpretability-1a2b3c4/")).toEqual({
      company: "anthropic",
      slug: "research-engineer-interpretability-1a2b3c4",
      words: "research engineer interpretability",
    });
    expect(missingJob("/jobs/at/anthropic/does-not-exist-zzz/")).toEqual({ org: "anthropic", words: "does not exist zzz" });
    expect(parseJobListingPath("/jobs/at/anthropic/")).toBeNull();
    expect(parseJobListingPath("/jobs/at/anthropic/page/2/")).toBeNull();
    expect(parseJobListingPath("/jobs/at/openai/feed.xml")).toBeNull();
    expect(parseJobListingPath("/companies/anthropic/")).toBeNull();
    expect(titleFromJobSlug("senior-ai-research-engineer-zzzzzzz")).toBe("Senior AI Research Engineer");
  });
});

describe("similar open roles for a closed listing", () => {
  it("lists the same employer first, then same-function or same-title roles elsewhere", () => {
    const hit = parseJobListingPath("/jobs/at/agility-robotics/senior-ai-research-engineer-zzzzzzz/")!;
    const view = closedJobView(index, hit);
    expect(view.companyName).toBe("Agility Robotics");
    expect(view.jobsPath).toBe("/jobs/at/agility-robotics/");
    expect(view.companyPath).toBe("/companies/agility-robotics/");
    expect(view.companyJobs.map((j) => j.path)).toEqual(
      expect.arrayContaining([
        "/jobs/at/agility-robotics/robotics-software-engineer-aaaaaaa/",
        "/jobs/at/agility-robotics/mechanical-engineer-bbbbbbb/",
      ]),
    );
    expect(view.companyJobs.every((j) => j.org === "agility-robotics")).toBe(true);
    expect(view.similarJobs.map((j) => j.path)).toEqual(
      expect.arrayContaining([
        "/jobs/at/acme/senior-ai-research-engineer-ccccccc/",
        "/jobs/at/other/research-engineer-interpretability-fffffff/",
      ]),
    );
    expect(view.similarJobs.every((j) => j.org !== "agility-robotics")).toBe(true);
    expect(view.similarJobs.some((j) => j.title === "Account Executive")).toBe(false);
  });

  it("falls back to slug keywords when the posting code is gone", () => {
    const hit = parseJobListingPath("/jobs/at/unknown-lab/research-scientist-zzzzzzz/")!;
    const view = closedJobView(index, hit);
    expect(view.companyName).toBe("Unknown Lab");
    expect(view.jobsPath).toBeNull();
    expect(view.companyJobs).toEqual([]);
    expect(view.similarJobs.some((j) => /research/i.test(j.title))).toBe(true);
  });
});

describe("closed job HTML", () => {
  it("is noindex, has no JobPosting data, and links to open roles", () => {
    const hit = parseJobListingPath("/jobs/at/agility-robotics/senior-ai-research-engineer-zzzzzzz/")!;
    const html = renderClosedJobPage(index, hit);
    expect(html).toContain('<meta name="robots" content="noindex, follow"/>');
    expect(html).not.toContain("JobPosting");
    expect(html).not.toContain("application/ld+json");
    expect(html).toContain("This role has closed");
    expect(html).toContain("Senior AI Research Engineer at Agility Robotics");
    expect(html).toContain('href="/jobs/at/agility-robotics/"');
    expect(html).toContain('href="/companies/agility-robotics/"');
    expect(html).toContain('href="/jobs/"');
    expect(html).toContain('href="/jobs/fellowships/"');
    expect(html).toContain("/jobs/at/agility-robotics/robotics-software-engineer-aaaaaaa/");
    expect(html).toContain("/jobs/at/acme/senior-ai-research-engineer-ccccccc/");
    expect(html).toContain('data-testid="closed-job"');
  });

  it("escapes employer and title text from the slug", () => {
    const html = renderClosedJobPage(index, {
      company: "acme",
      slug: "x-yyyyyyy",
      words: `<script>alert(1)</script>`,
    });
    expect(html).not.toContain("<script>alert");
    expect(closedJobResponse(index, "/jobs/")).toBeNull();
    expect(closedJobResponse(index, "/jobs/at/acme/x-yyyyyyy/")?.status).toBe(410);
  });
});

describe("closed-job index", () => {
  it("stores current listings and employer links without inventing pages", () => {
    const built = buildClosedJobIndex({
      shell: { htmlClass: "", links: "" },
      pages: [
        { org: { slug: "acme" }, job: { title: "Engineer", locations: ["Austin, TX"] }, path: "/jobs/at/acme/engineer-aaaaaaa/" },
      ],
      orgs: [{ slug: "acme", name: "Acme AI", jobsPath: "/jobs/at/acme/", companyPath: "/companies/acme/" }],
    });
    expect(built.jobs).toEqual([{ org: "acme", title: "Engineer", path: "/jobs/at/acme/engineer-aaaaaaa/", location: "Austin, TX" }]);
    expect(built.orgs.acme.companyPath).toBe("/companies/acme/");
  });
});

describe("Cloudflare routing for closed listings", () => {
  it("runs the Worker first on /jobs/at/* so navigations are not swallowed by 404.html", () => {
    const file = fs.readFileSync(path.join(process.cwd(), "wrangler.jsonc"), "utf8");
    expect(file).toContain('"main": "worker.ts"');
    expect(file).toContain('"binding": "ASSETS"');
    expect(file).toContain('"/jobs/at/*"');
    expect(file).toContain("run_worker_first");
  });
});
