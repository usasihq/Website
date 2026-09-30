import { describe, expect, it } from "vitest";
import { Artifact, Organization, Source } from "@/lib/schema";
import { validateContent, type RawContent } from "@/lib/validate";
import { artifact, fixtureContent, org, TODAY } from "../fixtures/content";

const errorsFor = (raw: RawContent) => validateContent(raw, { today: TODAY }).issues.filter((i) => i.level === "error");

function withOrg(data: Record<string, unknown>): RawContent {
  const raw = fixtureContent();
  raw.organizations.push({ file: `organizations/${data.slug}.yml`, data });
  return raw;
}

function withArtifact(data: Record<string, unknown>): RawContent {
  const raw = fixtureContent();
  raw.artifacts.push({ file: `artifacts/${data.slug}.yml`, data });
  return raw;
}

describe("schema: malformed records are rejected", () => {
  it("accepts the fixture set without errors", () => {
    expect(errorsFor(fixtureContent())).toEqual([]);
  });

  it.each([
    ["uppercase slug", { slug: "Bad-Slug" }],
    ["http website", { website: "http://insecure.usasi-fixtures.org" }],
    ["javascript: website", { website: "javascript:alert(1)" }],
    ["logo text too long", { logo_text: "ABCD" }],
    ["no roles", { organization_roles: [] }],
    ["unknown sector", { sectors: ["crypto"] }],
    ["unknown field", { valuation: "$1T" }],
    ["no sources", { sources: [] }],
    ["summary without sources", { summary: { text: "Unsupported claim.", source_ids: [] } }],
    ["parent without relationship", { parent_org_slug: "fixture-parent" }],
  ])("organization: %s", (_label, override) => {
    expect(Organization.safeParse(org("fixture-x", override)).success).toBe(false);
  });

  it("rejects an eligible decision with no source or no concrete basis", () => {
    const noSource = org("x", { eligibility: { status: "eligible", basis: "us-headquarters", explanation: "Explanation long enough here.", source_ids: [], assessed_at: TODAY } });
    const noBasis = org("x", { eligibility: { status: "eligible", basis: "undetermined", explanation: "Explanation long enough here.", source_ids: ["s1"], assessed_at: TODAY } });
    expect(Organization.safeParse(noSource).success).toBe(false);
    expect(Organization.safeParse(noBasis).success).toBe(false);
  });

  it.each([
    ["model marked as project", { record_level: "project", family_slug: null }],
    ["release without family", { family_slug: null }],
    ["project with family", { kind: "framework", record_level: "project" }],
    ["checklist public without sources", { checklist: { weights: { status: "public", note: null, source_ids: [] } } }],
    ["availability without sources", { availability: { status: "public", access_conditions: null, source_ids: [] } }],
    ["padded unknown date", { released_at: "2025-13" }],
    ["impossible date", { released_at: "2025-02-30" }],
    ["data: license URL", { licenses: [{ name: "X", spdx: null, url: "data:text/html,hi", applies_to: "code", source_ids: ["s1"] }] }],
  ])("artifact: %s", (_label, override) => {
    expect(Artifact.safeParse(artifact("fixture-x", override)).success).toBe(false);
  });

  it("rejects sources with unsafe or relative URLs", () => {
    const base = { id: "a", title: "Title", publisher: "Pub", accessed_at: TODAY };
    expect(Source.safeParse({ ...base, url: "/relative" }).success).toBe(false);
    expect(Source.safeParse({ ...base, url: "ftp://files.usasi-fixtures.org/x" }).success).toBe(false);
    expect(Source.safeParse({ ...base, url: "https://ok.usasi-fixtures.org/x" }).success).toBe(true);
  });
});

describe("validation: cross-record rules", () => {
  const messages = (raw: RawContent) => errorsFor(raw).map((e) => e.message);

  it("flags references to unknown source IDs", () => {
    const raw = withOrg(org("fixture-bad-ref", { summary: { text: "Claim.", source_ids: ["missing"] } }));
    expect(messages(raw)).toContain('Unknown source id "missing"');
  });

  it("requires the file name to match the slug", () => {
    const raw = fixtureContent();
    raw.organizations.push({ file: "organizations/wrong-name.yml", data: org("fixture-right-name") });
    expect(messages(raw).some((m) => m.startsWith("File name must match slug"))).toBe(true);
  });

  it("rejects duplicate slugs", () => {
    const raw = withOrg(org("fixture-parent"));
    raw.organizations[raw.organizations.length - 1].file = "organizations/fixture-parent-copy.yml";
    expect(messages(raw).some((m) => m.startsWith('Duplicate organization slug "fixture-parent"'))).toBe(true);
  });

  it("rejects publishing a record that is not eligible", () => {
    const raw = withOrg(
      org("fixture-ineligible", {
        eligibility: { status: "pending_review", basis: "undetermined", explanation: "Not yet assessed in this fixture.", source_ids: [], assessed_at: TODAY },
      }),
    );
    expect(messages(raw).some((m) => m.startsWith("Published records must be eligible"))).toBe(true);
  });

  it("rejects future editorial dates", () => {
    const raw = withOrg(org("fixture-future", { last_reviewed: "2030-01-01" }));
    expect(messages(raw)).toContain("last_reviewed is in the future");
  });

  it("rejects placeholder text in public records but only warns for drafts", () => {
    const published = withOrg(org("fixture-todo", { summary: { text: "TODO write summary", source_ids: ["s1"] } }));
    expect(messages(published).some((m) => m.startsWith("Placeholder text"))).toBe(true);
    const draft = withOrg(org("fixture-todo", { publication_status: "draft", summary: { text: "TODO write summary", source_ids: ["s1"] } }));
    expect(messages(draft).some((m) => m.startsWith("Placeholder text"))).toBe(false);
  });

  it("rejects placeholder hosts such as example.com", () => {
    const raw = withOrg(org("fixture-example", { website: "https://www.example.com" }));
    expect(messages(raw).some((m) => m.startsWith("Placeholder URL"))).toBe(true);
  });

  it("rejects unknown parent organizations and cycles", () => {
    const unknownParent = withOrg(org("fixture-orphan", { parent_org_slug: "nope", parent_relationship: "division" }));
    expect(messages(unknownParent)).toContain('Unknown parent_org_slug "nope"');

    const raw = fixtureContent();
    raw.organizations.push({ file: "organizations/fixture-a.yml", data: org("fixture-a", { parent_org_slug: "fixture-b", parent_relationship: "division" }) });
    raw.organizations.push({ file: "organizations/fixture-b.yml", data: org("fixture-b", { parent_org_slug: "fixture-a", parent_relationship: "division" }) });
    expect(messages(raw)).toContain("Parent relationship forms a cycle");
  });

  it("rejects artifacts pointing at unknown organizations or families", () => {
    expect(messages(withArtifact(artifact("fixture-x", { organization_slugs: ["ghost"], maintainers: [{ name: "Ghost", organization_slug: null, source_ids: ["s1"] }] })))).toContain(
      'Unknown organization slug "ghost"',
    );
    expect(messages(withArtifact(artifact("fixture-x", { family_slug: "no-family" })))).toContain('Unknown family_slug "no-family"');
  });

  it("rejects a published release whose family is not published", () => {
    const raw = fixtureContent();
    raw.artifacts.push({ file: "artifacts/fixture-draft-family.yml", data: artifact("fixture-draft-family", { record_level: "family", family_slug: null, licenses: [], checklist: {}, publication_status: "draft" }) });
    raw.artifacts.push({ file: "artifacts/fixture-orphan-release.yml", data: artifact("fixture-orphan-release", { family_slug: "fixture-draft-family" }) });
    expect(messages(raw)).toContain('Published release belongs to unpublished family "fixture-draft-family"');
  });

  it("rejects licenses or checklists on family overviews", () => {
    const raw = withArtifact(artifact("fixture-bad-family", { record_level: "family", family_slug: null, checklist: {} }));
    expect(messages(raw).some((m) => m.startsWith("Family overviews do not carry licenses"))).toBe(true);
  });

  it("rejects checklist items that do not apply to the artifact kind", () => {
    const raw = withArtifact(
      artifact("fixture-bad-check", { kind: "dataset", record_level: "project", family_slug: null, checklist: { weights: { status: "public", note: null, source_ids: ["s1"] } } }),
    );
    expect(messages(raw)).toContain('Checklist item "weights" does not apply to kind "dataset"');
  });

  it("rejects memory figures without stated precision or assumptions", () => {
    const bad = withArtifact(artifact("fixture-mem", { run_notes: [{ text: "Runs on a single 24 GB GPU.", source_ids: ["s1"] }] }));
    expect(messages(bad).some((m) => m.startsWith("Memory figures"))).toBe(true);
    const ok = withArtifact(artifact("fixture-mem", { run_notes: [{ text: "The model card states 16 GB of memory for MXFP4 weights.", source_ids: ["s1"] }] }));
    expect(messages(ok).some((m) => m.startsWith("Memory figures"))).toBe(false);
  });

  it("requires archived records to explain the archive", () => {
    const raw = withOrg(org("fixture-archived-no-note", { publication_status: "archived" }));
    expect(messages(raw)).toContain("Archived records need an archive_note explaining why");
  });

  it("rejects featured selections that are not published", () => {
    const raw = fixtureContent();
    (raw.featured!.data as { organizations: string[] }).organizations = ["fixture-draft-org"];
    expect(messages(raw)).toContain('Featured organization "fixture-draft-org" is not published');
  });
});
