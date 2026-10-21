import { describe, expect, it } from "vitest";
import { auditPageSeo, collectPageSeo, formatSeoAudit, loadSiteCatalog } from "@/lib/page-seo-audit";
import { DESCRIPTION_MAX } from "@/lib/metadata";

describe("generated page titles and descriptions", () => {
  const catalog = loadSiteCatalog();
  const pages = collectPageSeo(catalog);
  const audit = auditPageSeo(pages);

  it("reports how many pages fail emptiness, length, and uniqueness checks", () => {
    // Printed so a PR can compare before/after counts from the same checker.
    console.log(`SEO audit: ${formatSeoAudit(audit)}`);
    expect(audit.counts.pages).toBeGreaterThan(100);
    expect(audit.counts.emptyTitle, formatSeoAudit(audit)).toBe(0);
    expect(audit.counts.emptyDescription, formatSeoAudit(audit)).toBe(0);
    expect(audit.counts.titleTooLong, formatSeoAudit(audit)).toBe(0);
    expect(audit.counts.descriptionTooLong, formatSeoAudit(audit)).toBe(0);
    expect(audit.counts.descriptionTooShort, formatSeoAudit(audit)).toBe(0);
    expect(audit.counts.duplicateTitles, formatSeoAudit(audit)).toBe(0);
  });

  it("keeps every description within the snippet limit", () => {
    for (const row of pages) {
      expect(row.description.length, row.path).toBeGreaterThan(0);
      expect(row.description.length, `${row.path}: ${row.description}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });
});
