import { describe, expect, it } from "vitest";
import { artifactExport, exportCsv, orgExport } from "@/lib/export";
import type { ArtifactListItem, OrgListItem } from "@/lib/search";

const artifact = {
  slug: "example",
  name: "=Example, \"quoted\"",
  kind: "model",
  level: "release",
  entryType: "model-release",
  familySlug: null,
  familyName: null,
  version: null,
  summary: "",
  maintainers: [],
  organizations: [{ slug: "ai2", name: "Ai2" }],
  availability: "public",
  licenses: [{ key: "Apache-2.0", label: "Apache-2.0", appliesTo: "weights" }],
  tier: null,
  checks: {},
  tags: [],
  releasedAt: "2026-09",
  lastReviewed: "2026-10-08",
  releaseCount: 0,
} as unknown as ArtifactListItem;

describe("directory exports", () => {
  it("keeps record links, review dates, and the filtered view", () => {
    const data = artifactExport([artifact], "https://example.org", "kind=model", "2026-10-08T00:00:00Z");
    expect(data.source).toBe("https://example.org/open/?kind=model");
    expect(data.rows[0]).toMatchObject({ record_page: "https://example.org/open/example/", last_reviewed: "2026-10-08", licenses: "Apache-2.0 (weights)" });
    expect(data.caveat).toMatch(/not a ranking/);
  });

  it("writes CSV that spreadsheets read as text", () => {
    const csv = exportCsv(artifactExport([artifact], "https://example.org", "", "2026-10-08"));
    const [header, row] = csv.trim().split("\n");
    expect(header.split(",")[0]).toBe("slug");
    expect(row).toContain(`"'=Example, ""quoted"""`);
  });

  it("exports organizations with readable labels", () => {
    const org = { slug: "ai2", name: "Ai2", logoText: "A", summary: "", roles: ["research-lab"], sectors: ["research"], ownership: "nonprofit", legalName: null, headquarters: "Seattle, Washington", parent: null, artifactCount: 3, hostedModelProductCount: 0, productNames: [], lastReviewed: "2026-10-01" } as unknown as OrgListItem;
    const data = orgExport([org], "https://example.org", "", "2026-10-08");
    expect(data.rows[0]).toMatchObject({ record_page: "https://example.org/companies/ai2/", headquarters: "Seattle, Washington", open_artifacts: 3 });
  });
});
