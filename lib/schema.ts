/**
 * Content schema for the USASI catalog.
 *
 * Every catalog record lives in YAML under /content and is validated against
 * these schemas at build time. Cross-record rules (unique slugs, relationships,
 * source references, publication consistency) live in lib/validate.ts.
 *
 * Enum values live in lib/enums.ts so client code can use them without Zod.
 */
import { z } from "zod";
import {
  ARTIFACT_KINDS,
  AVAILABILITY_STATUSES,
  ELIGIBILITY_BASES,
  ELIGIBILITY_STATUSES,
  ORGANIZATION_ROLES,
  OWNERSHIP_CATEGORIES,
  PARENT_RELATIONSHIPS,
  PRODUCT_KINDS,
  PUBLICATION_STATUSES,
  RECORD_LEVELS,
  SECTORS,
} from "./enums";

export const SCHEMA_VERSION = "0.1.0";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function isRealCalendarDate(value: string): boolean {
  const parts = value.split("-").map(Number);
  const [y, m = 1, d = 1] = parts;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/** Full ISO calendar date, YYYY-MM-DD. Used for editorial dates. */
export const IsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date in YYYY-MM-DD form")
  .refine(isRealCalendarDate, "Not a real calendar date");

/**
 * Documented date with the precision the evidence supports:
 * YYYY, YYYY-MM, or YYYY-MM-DD. Never pad an unknown day or month.
 */
export const DocumentedDate = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "Expected YYYY, YYYY-MM, or YYYY-MM-DD")
  .refine(isRealCalendarDate, "Not a real calendar date");

export const Slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slugs use lowercase letters, digits, and single hyphens",
  );

export const SourceId = z
  .string()
  .regex(/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/, "Source IDs use lowercase letters, digits, and - _ .");

const SAFE_PROTOCOLS = new Set(["https:"]);

/** External URL. HTTPS only; rejects javascript:, data:, http:, and malformed values. */
export const HttpsUrl = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return SAFE_PROTOCOLS.has(url.protocol) && Boolean(url.hostname) && url.hostname.includes(".");
  } catch {
    return false;
  }
}, "Expected an absolute https:// URL");

export const PublicationStatus = z.enum(PUBLICATION_STATUSES);
export type PublicationStatus = z.infer<typeof PublicationStatus>;

/* ------------------------------------------------------------------ */
/* Sources and claims                                                  */
/* ------------------------------------------------------------------ */

export const SourceKind = z.enum([
  "official-page",
  "documentation",
  "repository",
  "model-card",
  "dataset-card",
  "license",
  "release-notes",
  "announcement",
  "paper",
  "filing",
  "news",
  "other",
]);

export const Source = z
  .object({
    id: SourceId,
    title: z.string().min(3),
    url: HttpsUrl,
    publisher: z.string().min(2),
    kind: SourceKind.optional(),
    published_at: DocumentedDate.nullable().optional(),
    accessed_at: IsoDate,
  })
  .strict();
export type Source = z.infer<typeof Source>;

/** A statement shown on the site together with the sources that support it. */
export const Claim = z
  .object({
    text: z.string().trim().min(1),
    source_ids: z.array(SourceId).min(1, "Every claim needs at least one source ID"),
  })
  .strict();
export type Claim = z.infer<typeof Claim>;

/* ------------------------------------------------------------------ */
/* Eligibility                                                         */
/* ------------------------------------------------------------------ */

export const EligibilityStatus = z.enum(ELIGIBILITY_STATUSES);
export type EligibilityStatus = z.infer<typeof EligibilityStatus>;

export const EligibilityBasis = z.enum(ELIGIBILITY_BASES);
export type EligibilityBasis = z.infer<typeof EligibilityBasis>;

export const Eligibility = z
  .object({
    status: EligibilityStatus,
    basis: EligibilityBasis,
    explanation: z.string().trim().min(20),
    source_ids: z.array(SourceId),
    assessed_at: IsoDate,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === "eligible") {
      if (value.source_ids.length === 0) {
        ctx.addIssue({ code: "custom", message: "An eligible decision must cite at least one source", path: ["source_ids"] });
      }
      if (value.basis === "none" || value.basis === "undetermined") {
        ctx.addIssue({ code: "custom", message: "An eligible decision needs a concrete basis", path: ["basis"] });
      }
    }
  });
export type Eligibility = z.infer<typeof Eligibility>;

/* ------------------------------------------------------------------ */
/* Organizations                                                       */
/* ------------------------------------------------------------------ */

export const OrganizationRole = z.enum(ORGANIZATION_ROLES);
export type OrganizationRole = z.infer<typeof OrganizationRole>;

export const OwnershipCategory = z.enum(OWNERSHIP_CATEGORIES);
export type OwnershipCategory = z.infer<typeof OwnershipCategory>;

export const ParentRelationship = z.enum(PARENT_RELATIONSHIPS);
export type ParentRelationship = z.infer<typeof ParentRelationship>;

export const Sector = z.enum(SECTORS);
export type Sector = z.infer<typeof Sector>;

export const Location = z
  .object({
    label: z.string().min(2),
    country: z.string().regex(/^[A-Z]{2}$/, "ISO 3166-1 alpha-2 country code"),
    source_ids: z.array(SourceId).min(1),
  })
  .strict();
export type Location = z.infer<typeof Location>;

export const ProductKind = z.enum(PRODUCT_KINDS);
export type ProductKind = z.infer<typeof ProductKind>;

/** Product kinds that count as a documented hosted-model product in /matrix. */
export const HOSTED_MODEL_PRODUCT_KINDS: readonly ProductKind[] = ["hosted-model-api", "assistant-app"];

export const Product = z
  .object({
    id: Slug,
    name: z.string().min(1),
    kind: ProductKind,
    access: z.string().trim().min(10, "Describe the documented delivery/access in a sentence"),
    url: HttpsUrl,
    source_ids: z.array(SourceId).min(1),
    last_reviewed: IsoDate,
  })
  .strict();
export type Product = z.infer<typeof Product>;

export const Organization = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    legal_name: Claim.nullable().default(null),
    website: HttpsUrl,
    logo_text: z.string().regex(/^[A-Za-z0-9&]{1,3}$/, "1–3 characters for the monogram tile"),
    summary: Claim,
    organization_roles: z.array(OrganizationRole).min(1),
    ownership_category: OwnershipCategory,
    legal_form: Claim.nullable().default(null),
    parent_org_slug: Slug.nullable().default(null),
    parent_relationship: ParentRelationship.nullable().default(null),
    headquarters: Location.nullable().default(null),
    other_locations: z.array(Location).default([]),
    founded: z
      .object({ year: z.number().int().min(1800).max(2100), source_ids: z.array(SourceId).min(1) })
      .strict()
      .nullable()
      .default(null),
    sectors: z.array(Sector).default([]),
    status_note: Claim.nullable().default(null),
    products: z.array(Product).default([]),
    notable_facts: z.array(Claim).default([]),
    eligibility: Eligibility,
    openness_summary: Claim.nullable().default(null),
    hiring_url: HttpsUrl.nullable().default(null),
    publication_status: PublicationStatus,
    archive_note: z.string().trim().min(10).nullable().default(null),
    updated_at: IsoDate,
    last_reviewed: IsoDate.nullable(),
    sources: z.array(Source).min(1),
  })
  .strict()
  .superRefine((org, ctx) => {
    if ((org.parent_org_slug === null) !== (org.parent_relationship === null)) {
      ctx.addIssue({
        code: "custom",
        message: "parent_org_slug and parent_relationship must be set together",
        path: ["parent_relationship"],
      });
    }
    if (org.parent_org_slug === org.slug) {
      ctx.addIssue({ code: "custom", message: "An organization cannot be its own parent", path: ["parent_org_slug"] });
    }
  });
export type Organization = z.infer<typeof Organization>;

/* ------------------------------------------------------------------ */
/* Artifacts                                                           */
/* ------------------------------------------------------------------ */

export const ArtifactKind = z.enum(ARTIFACT_KINDS);
export type ArtifactKind = z.infer<typeof ArtifactKind>;

export const RecordLevel = z.enum(RECORD_LEVELS);
export type RecordLevel = z.infer<typeof RecordLevel>;

export const AvailabilityStatus = z.enum(AVAILABILITY_STATUSES);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatus>;

export const LinkKind = z.enum([
  "website",
  "repository",
  "model-hub",
  "dataset-hub",
  "documentation",
  "paper",
  "license",
  "release-notes",
]);

export const ArtifactLink = z
  .object({
    label: z.string().min(1),
    url: HttpsUrl,
    kind: LinkKind,
  })
  .strict();

export const Maintainer = z
  .object({
    name: z.string().min(1),
    organization_slug: Slug.nullable().default(null),
    source_ids: z.array(SourceId).min(1),
  })
  .strict();
export type Maintainer = z.infer<typeof Maintainer>;

export const LicenseAppliesTo = z.enum(["weights", "code", "data", "documentation", "weights-and-code", "all"]);

export const LicenseRecord = z
  .object({
    name: z.string().min(2),
    spdx: z.string().min(2).nullable().default(null),
    url: HttpsUrl.nullable().default(null),
    applies_to: LicenseAppliesTo,
    source_ids: z.array(SourceId).min(1),
  })
  .strict();
export type LicenseRecord = z.infer<typeof LicenseRecord>;

export const ChecklistItem = z
  .object({
    status: AvailabilityStatus,
    note: z.string().trim().min(1).nullable().default(null),
    source_ids: z.array(SourceId).default([]),
  })
  .strict()
  .superRefine((item, ctx) => {
    if (item.status !== "unknown" && item.status !== "not_applicable" && item.source_ids.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: `A checklist status of "${item.status}" needs at least one source ID; use "unknown" when unassessed`,
        path: ["source_ids"],
      });
    }
  });
export type ChecklistItem = z.infer<typeof ChecklistItem>;

export const Provenance = z
  .object({
    text: z.string().trim().min(10),
    derived_from: z
      .array(
        z
          .object({
            name: z.string().min(1),
            artifact_slug: Slug.nullable().default(null),
            url: HttpsUrl.nullable().default(null),
            note: z.string().nullable().default(null),
          })
          .strict(),
      )
      .default([]),
    source_ids: z.array(SourceId).min(1),
  })
  .strict();
export type Provenance = z.infer<typeof Provenance>;

export const Artifact = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    kind: ArtifactKind,
    record_level: RecordLevel,
    family_slug: Slug.nullable().default(null),
    version: z.string().min(1).nullable().default(null),
    maintainers: z.array(Maintainer).min(1),
    organization_slugs: z.array(Slug).default([]),
    links: z.array(ArtifactLink).default([]),
    summary: Claim,
    useful_for: Claim.nullable().default(null),
    eligibility: Eligibility,
    availability: z
      .object({
        status: AvailabilityStatus,
        access_conditions: z.string().trim().min(1).nullable().default(null),
        source_ids: z.array(SourceId).default([]),
      })
      .strict(),
    licenses: z.array(LicenseRecord).default([]),
    license_notes: Claim.nullable().default(null),
    checklist: z.record(z.string(), ChecklistItem).default({}),
    run_notes: z.array(Claim).default([]),
    provenance: Provenance.nullable().default(null),
    tags: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).default([]),
    publication_status: PublicationStatus,
    archive_note: z.string().trim().min(10).nullable().default(null),
    released_at: DocumentedDate.nullable().default(null),
    updated_at: IsoDate,
    last_reviewed: IsoDate.nullable(),
    sources: z.array(Source).min(1),
  })
  .strict()
  .superRefine((a, ctx) => {
    if (a.kind === "model" && a.record_level === "project") {
      ctx.addIssue({ code: "custom", message: "Model records must be a family or a release", path: ["record_level"] });
    }
    if (a.kind !== "model" && a.record_level !== "project") {
      ctx.addIssue({ code: "custom", message: "Only model records use family/release levels; use project", path: ["record_level"] });
    }
    if (a.record_level === "release" && !a.family_slug) {
      ctx.addIssue({ code: "custom", message: "A release must name its family_slug", path: ["family_slug"] });
    }
    if (a.record_level !== "release" && a.family_slug) {
      ctx.addIssue({ code: "custom", message: "Only releases carry a family_slug", path: ["family_slug"] });
    }
    if (a.availability.status !== "unknown" && a.availability.status !== "not_applicable" && a.availability.source_ids.length === 0) {
      ctx.addIssue({ code: "custom", message: "A documented availability status needs source IDs", path: ["availability", "source_ids"] });
    }
  });
export type Artifact = z.infer<typeof Artifact>;

/* ------------------------------------------------------------------ */
/* Changelog and featured selection                                    */
/* ------------------------------------------------------------------ */

export const ChangeType = z.enum(["added", "updated", "corrected", "archived", "removed", "policy"]);

export const ChangelogEntry = z
  .object({
    date: IsoDate,
    title: z.string().min(3),
    summary: z.string().min(10),
    changes: z
      .array(
        z
          .object({
            type: ChangeType,
            record_type: z.enum(["organization", "artifact", "policy", "site"]),
            slug: Slug.nullable().default(null),
            note: z.string().nullable().default(null),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();
export type ChangelogEntry = z.infer<typeof ChangelogEntry>;

export const FeaturedSelection = z
  .object({
    explanation: z.string().min(20),
    selected_at: IsoDate,
    organizations: z.array(Slug).max(6).default([]),
    artifacts: z.array(Slug).max(6).default([]),
  })
  .strict();
export type FeaturedSelection = z.infer<typeof FeaturedSelection>;

/* ------------------------------------------------------------------ */
/* Local corner: people (professional information only)                */
/* ------------------------------------------------------------------ */

/**
 * A person featured in the Local corner. Deliberately has no fields for
 * location, nationality, age, photos, or any personal detail: only public,
 * sourced professional information, tied to records in this catalog.
 */
export const PersonAffiliation = z
  .object({
    name: z.string().min(1),
    organization_slug: Slug.nullable().default(null),
    role: z.string().trim().min(2),
    current: z.boolean(),
    source_ids: z.array(SourceId).min(1),
  })
  .strict();

export const PersonWork = z
  .object({
    name: z.string().min(1),
    artifact_slug: Slug.nullable().default(null),
    url: HttpsUrl.nullable().default(null),
    contribution: z.string().trim().min(10),
    source_ids: z.array(SourceId).min(1),
  })
  .strict();

export const Person = z
  .object({
    slug: Slug,
    name: z.string().min(1),
    initials: z.string().regex(/^[A-Za-z]{1,3}$/, "1–3 letters for the initials tile"),
    headline: z.string().trim().min(10).max(110),
    bio: Claim,
    affiliations: z.array(PersonAffiliation).min(1),
    work: z.array(PersonWork).min(1),
    links: z
      .array(z.object({ label: z.string().min(1).max(40), url: HttpsUrl }).strict())
      .max(4)
      .default([]),
    publication_status: PublicationStatus,
    updated_at: IsoDate,
    last_reviewed: IsoDate.nullable(),
    sources: z.array(Source).min(1),
  })
  .strict();
export type Person = z.infer<typeof Person>;

export const LocalCornerSchedule = z
  .object({
    lineups: z
      .array(
        z
          .object({
            month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "YYYY-MM"),
            people: z.array(Slug).min(1).max(5),
          })
          .strict(),
      )
      .default([]),
  })
  .strict();
export type LocalCornerSchedule = z.infer<typeof LocalCornerSchedule>;

/* ------------------------------------------------------------------ */
/* Latest news (hand-edited, sourced, tied to catalog records)         */
/* ------------------------------------------------------------------ */

export const NEWS_CATEGORIES = ["release", "license", "acquisition", "governance", "catalog", "research", "policy"] as const;
export const NewsCategory = z.enum(NEWS_CATEGORIES);
export type NewsCategory = z.infer<typeof NewsCategory>;

/**
 * A short, dated news item about organizations or artifacts in the catalog.
 * Written by hand from primary sources — never generated by rewriting other
 * outlets' articles. Same evidence rules as catalog records: no funding,
 * valuations, staffing numbers, user counts, or benchmark scores.
 */
export const NewsItem = z
  .object({
    slug: Slug,
    title: z.string().trim().min(10).max(120),
    /** Date of the documented event (at the precision the source gives). */
    event_date: DocumentedDate,
    /** Date the item was published on USASI. */
    published_at: IsoDate,
    category: NewsCategory,
    summary: Claim,
    related_organizations: z.array(Slug).default([]),
    related_artifacts: z.array(Slug).default([]),
    publication_status: PublicationStatus,
    updated_at: IsoDate,
    sources: z.array(Source).min(1),
  })
  .strict();
export type NewsItem = z.infer<typeof NewsItem>;
