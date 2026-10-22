import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCatalog } from "@/lib/catalog";
import { coverageTable, jobPostingErrors } from "@/lib/jobs/job-posting-coverage";
import { jobPages, jobPostingLd, type JobPage } from "@/lib/jobs/job-pages";
import { JOB_META_MAX, jobMetaDescription, renderJobPage } from "@/lib/jobs/job-page-html";
import type { Description } from "@/lib/jobs/description";

const catalog = loadCatalog(path.join(process.cwd(), "content"), { today: new Date().toISOString().slice(0, 10) });
const stub: Description = [{ type: "p", runs: [{ t: "The employer describes responsibilities, qualifications, and how to apply." }] }];

function withDescription(p: JobPage): JobPage {
  return p.description ? p : { ...p, description: stub };
}

describe("JobPosting Google requirements", () => {
  it("emits no required-field errors on fixture-quality listings", () => {
    const pages = jobPages(catalog).map(withDescription);
    let checked = 0;
    for (const p of pages) {
      const ld = jobPostingLd(p);
      if (!ld) continue;
      checked += 1;
      expect(jobPostingErrors(ld), p.path).toEqual([]);
      const org = ld.hiringOrganization as { logo?: string; url?: string };
      expect(org.logo, p.path).toMatch(/^https:\/\//);
      expect(org.url, p.path).toMatch(/^https:\/\//);
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("reports field coverage for current listings that can carry JobPosting", () => {
    const pages = jobPages(catalog).map(withDescription);
    const cov = coverageTable(pages);
    expect(cov.invalid).toBe(0);
    expect(cov.postings).toBeGreaterThan(0);
    const byField = Object.fromEntries(cov.rows.map((r) => [r.field, r]));
    // Always emitted by our markup, including after a live jobs refresh.
    expect(byField.title.pct).toBe(100);
    expect(byField.description.pct).toBe(100);
    expect(byField.datePosted.pct).toBe(100);
    expect(byField.hiringOrganization.pct).toBe(100);
    expect(byField["hiringOrganization.logo"].pct).toBe(100);
    expect(byField["hiringOrganization.url"].pct).toBe(100);
    expect(byField.identifier.pct).toBe(100);
    expect(byField.directApply.pct).toBe(100);
    expect(byField.locationEligible.pct).toBe(100);
    // Feed-dependent: inference covers most titles, not every vague posting.
    expect(byField.employmentType.pct).toBeGreaterThan(50);
    // Keep the meta description helper in the same file as the page so coverage
    // stays tied to what Google and readers see.
    expect(JOB_META_MAX).toBe(160);
    expect(jobMetaDescription(pages[0]).length).toBeLessThanOrEqual(JOB_META_MAX);
    expect(renderJobPage(pages[0], { htmlClass: "", links: "" })).toContain("org-logo");
  });
});
