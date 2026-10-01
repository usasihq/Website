import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { EntryActions } from "@/components/EntryActions";
import { DEFAULT_ARTIFACT_FILTERS, artifactMatches, licenseCovers, parseArtifactFilters, serializeArtifactFilters, type ArtifactListItem } from "@/lib/search";
import { componentRights, computeTier } from "@/lib/openness";
import { Artifact } from "@/lib/schema";
import { artifact, TODAY } from "../fixtures/content";

const item: ArtifactListItem = { slug: "mixed", name: "Mixed", summary: "Example", kind: "model", level: "release", entryType: "model-release", familySlug: null, familyName: null, version: null, maintainers: [], organizations: [], availability: "public", licenses: [{ key: "Custom", label: "Custom", appliesTo: "weights" }, { key: "MIT", label: "MIT", appliesTo: "code" }, { key: "MIT", label: "MIT", appliesTo: "documentation" }], tier: "open-weight", checks: {}, tags: [], releasedAt: null, lastReviewed: TODAY, releaseCount: 0 };
const release = () => Artifact.parse(artifact("test"));

describe("component evidence", () => {
  it("matches selected key and scope on the same license and preserves URL state", () => {
    expect(artifactMatches(item, { ...DEFAULT_ARTIFACT_FILTERS, license: "MIT", licenseComponent: "weights" })).toBe(false);
    expect(artifactMatches(item, { ...DEFAULT_ARTIFACT_FILTERS, license: "MIT", licenseComponent: "code" })).toBe(true);
    expect(artifactMatches(item, { ...DEFAULT_ARTIFACT_FILTERS, license: "MIT" })).toBe(true);
    const f = { ...DEFAULT_ARTIFACT_FILTERS, license: "MIT", licenseComponent: "documentation" as const };
    expect(parseArtifactFilters(new URLSearchParams(serializeArtifactFilters(f)))).toEqual(f);
    expect(licenseCovers("weights-and-code", "data")).toBe(false);
    expect(licenseCovers("weights-and-code", "documentation")).toBe(false);
    expect(licenseCovers("weights-and-code", "weights")).toBe(true);
  });
  it("does not infer rights from downloads, readable docs, unreviewed terms or dual-license records", () => {
    const l = release().licenses[0];
    expect(componentRights([{ ...l, spdx: "MIT" }], "weights")).toBe("unknown");
    expect(componentRights([{ ...l, reviewed_at: TODAY, spdx: "CC-BY-NC-4.0", applies_to: "data" }], "data")).toBe("review-required");
    expect(componentRights([{ ...l, reviewed_at: TODAY, spdx: "CC-BY-ND-4.0", applies_to: "documentation" }], "documentation")).toBe("review-required");
    expect(componentRights([{ ...l, reviewed_at: TODAY, spdx: "CC-BY-4.0", applies_to: "data" }], "data")).toBe("qualifying-license");
    expect(componentRights([{ ...l, reviewed_at: TODAY }, { ...l, reviewed_at: TODAY, spdx: "MIT" }], "code")).toBe("review-required");
  });
  it("requires new information completeness and full pipeline, not legacy access or fine-tuning", () => {
    const a = release();
    a.checklist.training_data_information = { status: "unknown", note: null, source_ids: [] };
    a.checklist.training_data_access = { status: "public", note: null, source_ids: ["s1"] };
    expect(computeTier(a)).toBe("open-weight");
    a.checklist.training_data_information = { status: "public", note: null, source_ids: ["s1"] };
    a.checklist.training_pipeline = { status: "partial", note: "Fine-tuning only", source_ids: ["s1"] };
    a.system_openness_review = { status: "verified", permissions: { parameters: "qualifying", code: "qualifying", data_information: "qualifying" }, rationale: "Synthetic reviewed information, code, and parameter permissions.", source_ids: ["s1"], reviewed_at: TODAY };
    expect(computeTier(a)).toBe("open-stack");
    a.checklist.training_pipeline.status = "public";
    a.checklist.training_data_access.status = "not_public";
    expect(computeTier(a)).toBe("fully-open"); // unshareable original data is not an automatic disqualifier
    a.system_openness_review.permissions.data_information = "unknown";
    expect(computeTier(a)).toBe("open-stack");
  });
  it("offers an account-free correction with the entry URL and evidence fields", () => {
    const html = renderToStaticMarkup(createElement(EntryActions, { contentPath: "content/organizations/openai.yml", title: "OpenAI" }));
    expect(html).toContain("mailto:usasihq@gmail.com");
    const decoded = decodeURIComponent(html);
    expect(decoded).toContain("https://unitedstatesofamericasuperintelligence.com/companies/openai/");
    expect(decoded).toContain("Disputed field:");
    expect(decoded).toContain("Proposed correction:");
    expect(decoded).toContain("Supporting primary source");
  });
});
