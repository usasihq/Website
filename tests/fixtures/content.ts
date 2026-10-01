/**
 * Synthetic test fixtures. These live outside /content and are never loaded
 * by the site build. Every name uses the "Fixture" prefix and the reserved
 * `.invalid` / fixture domains so a leak would be obvious.
 */
import type { RawContent, RawDocument } from "@/lib/validate";

export const TODAY = "2026-09-29";

const src = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Fixture source ${id}`,
  url: `https://fixture-${id}.usasi-fixtures.org/page`,
  publisher: "Fixture Publisher",
  kind: "official-page",
  published_at: null,
  accessed_at: TODAY,
  ...extra,
});

const eligible = (basis = "us-headquarters") => ({
  status: "eligible",
  basis,
  explanation: "Fixture explanation of the documented U.S. basis for this record.",
  source_ids: ["s1"],
  assessed_at: TODAY,
});

export function org(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    slug,
    name: `Fixture ${slug}`,
    website: `https://${slug}.usasi-fixtures.org`,
    logo_text: "FX",
    summary: { text: `Fixture summary for ${slug}.`, source_ids: ["s1"] },
    organization_roles: ["model-developer"],
    ownership_category: "privately-held",
    headquarters: { label: "Fixture City, Ohio", country: "US", source_ids: ["s1"] },
    sectors: ["research"],
    products: [],
    eligibility: eligible(),
    publication_status: "published",
    updated_at: TODAY,
    last_reviewed: TODAY,
    sources: [src("s1")],
    ...overrides,
  };
}

const allPublic = (keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, { status: "public", note: null, source_ids: ["s1"] }]));

const MODEL_KEYS = ["weights", "inference_code", "training_code", "training_data_information", "training_pipeline", "training_recipe", "evaluation_materials"];

export function artifact(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    slug,
    name: `Fixture ${slug}`,
    kind: "model",
    record_level: "release",
    family_slug: "fixture-family",
    version: "1",
    maintainers: [{ name: "Fixture parent", organization_slug: "fixture-parent", source_ids: ["s1"] }],
    organization_slugs: ["fixture-parent"],
    summary: { text: `Fixture artifact ${slug}.`, source_ids: ["s1"] },
    eligibility: eligible("us-governed-project"),
    availability: { status: "public", access_conditions: null, source_ids: ["s1"] },
    licenses: [{ name: "Apache License 2.0", spdx: "Apache-2.0", url: null, applies_to: "weights-and-code", source_ids: ["s1"] }],
    checklist: allPublic(MODEL_KEYS),
    tags: ["language-model"],
    publication_status: "published",
    released_at: "2026-05",
    updated_at: TODAY,
    last_reviewed: TODAY,
    sources: [src("s1")],
    ...overrides,
  };
}

const doc = (dir: string, data: { slug: string }): RawDocument => ({ file: `${dir}/${data.slug}.yml`, data });

export function fixtureContent(): RawContent {
  const organizations = [
    org("fixture-parent", {
      products: [
        {
          id: "fixture-api",
          name: "Fixture API",
          kind: "hosted-model-api",
          access: "Hosted API access to fixture models.",
          url: "https://api.usasi-fixtures.org",
          source_ids: ["s1"],
          last_reviewed: TODAY,
        },
        {
          id: "fixture-cloud",
          name: "Fixture Cloud",
          kind: "cloud-platform",
          access: "A cloud platform used only in tests.",
          url: "https://cloud.usasi-fixtures.org",
          source_ids: ["s1"],
          last_reviewed: TODAY,
        },
      ],
      sectors: ["frontier-models", "cloud"],
    }),
    org("fixture-unit", {
      parent_org_slug: "fixture-parent",
      parent_relationship: "research-unit",
      ownership_category: "unit-of-another-organization",
      eligibility: eligible("us-control"),
      organization_roles: ["research-lab"],
    }),
    org("fixture-nonprofit", {
      ownership_category: "nonprofit",
      organization_roles: ["nonprofit-research"],
      eligibility: eligible("us-nonprofit-or-lab"),
      sectors: ["open-models"],
    }),
    org("fixture-draft-org", { publication_status: "draft", name: "Fixture Secret Draft Org" }),
    org("fixture-pending-org", {
      publication_status: "draft",
      eligibility: { status: "pending_review", basis: "undetermined", explanation: "Dual headquarters not yet assessed in fixtures.", source_ids: [], assessed_at: TODAY },
    }),
    org("fixture-archived-org", { publication_status: "archived", archive_note: "Fixture organization archived for tests." }),
  ].map((o) => doc("organizations", o));

  const artifacts = [
    artifact("fixture-family", { record_level: "family", family_slug: null, licenses: [], checklist: {}, released_at: null }),
    // Fully open: everything public, OSI licenses.
    artifact("fixture-fully-open", { system_openness_review: { status: "verified", permissions: { parameters: "qualifying", code: "qualifying", data_information: "qualifying" }, rationale: "Synthetic fixture with reviewed complete data information, pipeline and qualifying component rights.", source_ids: ["s1"], reviewed_at: TODAY } }),
    // Open-stack: eval materials unknown.
    artifact("fixture-open-stack", {
      checklist: { ...allPublic(MODEL_KEYS), evaluation_materials: { status: "unknown", note: null, source_ids: [] } },
      organization_slugs: ["fixture-parent", "fixture-unit"],
      maintainers: [
        { name: "Fixture parent", organization_slug: "fixture-parent", source_ids: ["s1"] },
        { name: "Fixture unit", organization_slug: "fixture-unit", source_ids: ["s1"] },
      ],
    }),
    // Open-weight: custom license, no training code.
    artifact("fixture-open-weight", {
      licenses: [{ name: "Fixture Community License", spdx: null, url: null, applies_to: "weights", source_ids: ["s1"] }],
      checklist: { weights: { status: "public", note: null, source_ids: ["s1"] }, training_code: { status: "not_public", note: null, source_ids: ["s1"] } },
      released_at: "2026-08-15",
    }),
    // Weights not public.
    artifact("fixture-closed-weights", {
      checklist: { weights: { status: "not_public", note: null, source_ids: ["s1"] } },
      availability: { status: "not_public", access_conditions: null, source_ids: ["s1"] },
      released_at: null,
    }),
    // Weights unknown.
    artifact("fixture-unknown-weights", { checklist: {}, availability: { status: "unknown", access_conditions: null, source_ids: [] }, released_at: "2025" }),
    // Independent software project (no organization).
    artifact("fixture-tool", {
      kind: "framework",
      record_level: "project",
      family_slug: null,
      maintainers: [{ name: "Fixture community", organization_slug: null, source_ids: ["s1"] }],
      organization_slugs: [],
      licenses: [{ name: "MIT License", spdx: "MIT", url: null, applies_to: "code", source_ids: ["s1"] }],
      checklist: { source_code: { status: "public", note: null, source_ids: ["s1"] } },
      tags: ["training"],
    }),
    artifact("fixture-dataset", {
      kind: "dataset",
      record_level: "project",
      family_slug: null,
      organization_slugs: ["fixture-nonprofit"],
      maintainers: [{ name: "Fixture nonprofit", organization_slug: "fixture-nonprofit", source_ids: ["s1"] }],
      licenses: [{ name: "ODC-By", spdx: "ODC-By-1.0", url: null, applies_to: "data", source_ids: ["s1"] }],
      checklist: { access: { status: "public", note: null, source_ids: ["s1"] } },
      provenance: { text: "Fixture dataset derived from the fixture tool's output.", derived_from: [{ name: "Fixture tool", artifact_slug: "fixture-tool", url: null, note: null }], source_ids: ["s1"] },
      tags: ["pretraining-data"],
    }),
    artifact("fixture-draft-artifact", { publication_status: "draft", name: "Fixture Secret Draft Model" }),
    artifact("fixture-archived-artifact", { publication_status: "archived", archive_note: "Fixture release archived for tests." }),
  ].map((a) => doc("artifacts", a));

  return {
    organizations,
    artifacts,
    changelog: [
      {
        file: "changelog/2026-09-29-fixture.yml",
        data: {
          date: TODAY,
          title: "Fixture changes",
          summary: "Changes used only in tests.",
          changes: [{ type: "added", record_type: "organization", slug: "fixture-parent", note: null }],
        },
      },
    ],
    featured: {
      file: "featured.yml",
      data: { explanation: "Fixture selection to show a range of fixture roles.", selected_at: TODAY, organizations: ["fixture-nonprofit"], artifacts: ["fixture-tool"] },
    },
  };
}
