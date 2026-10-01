/**
 * Build-time catalog access. Node-only (reads /content through the loader).
 *
 * Only records that are `published` AND `eligible` enter directories, search,
 * counts, exports, and the sitemap. `archived` records keep a historical detail
 * page (noindex, clearly labeled) but are excluded from everything else.
 * Drafts never leave this module.
 */
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_CONTENT_DIR, readRawContent, todayIso } from "./content-loader";
import { entryTypeFor, type EntryType } from "./labels";
import { lineupSlugs } from "./local-corner";
import { checklistFor, computeTier } from "./openness";
import {
  HOSTED_MODEL_PRODUCT_KINDS,
  type Artifact,
  type ChangelogEntry,
  type FeaturedSelection,
  type LocalCornerSchedule,
  type NewsItem,
  type Organization,
  type Person,
} from "./schema";
import type { ArtifactListItem, OrgListItem, SearchEntry } from "./search";
import { artifactHref, orgHref } from "./routes";
import { validateContent, type ValidatedContent, type ValidationIssue } from "./validate";

export class ContentValidationError extends Error {
  constructor(public issues: ValidationIssue[]) {
    super(
      `Catalog content has ${issues.length} validation error(s). Run \`npm run validate\` for details.\n` +
        issues
          .slice(0, 10)
          .map((i) => `  ${i.file}${i.path ? ` › ${i.path}` : ""}: ${i.message}`)
          .join("\n"),
    );
  }
}

const isActive = (r: { publication_status: string; eligibility: { status: string } }) =>
  r.publication_status === "published" && r.eligibility.status === "eligible";

const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });

export interface CatalogCounts {
  organizations: number;
  independentOrganizations: number;
  organizationUnits: number;
  modelFamilies: number;
  modelReleases: number;
  software: number;
  datasets: number;
  evals: number;
  byKind: Record<Artifact["kind"], number>;
}

export class Catalog {
  readonly organizations: Organization[];
  readonly artifacts: Artifact[];
  readonly archivedOrganizations: Organization[];
  readonly archivedArtifacts: Artifact[];
  readonly changelog: ChangelogEntry[];
  readonly featured: FeaturedSelection | null;
  readonly people: Person[];
  readonly localCorner: LocalCornerSchedule | null;
  readonly news: NewsItem[];
  readonly buildAt: string;

  private orgMap: Map<string, Organization>;
  private artifactMap: Map<string, Artifact>;

  constructor(
    content: Pick<ValidatedContent, "organizations" | "artifacts" | "changelog" | "featured"> &
      Partial<Pick<ValidatedContent, "people" | "localCorner" | "news">>,
    buildAt = new Date().toISOString(),
  ) {
    this.organizations = content.organizations.filter(isActive).sort(byName);
    this.artifacts = content.artifacts.filter(isActive).sort(byName);
    this.archivedOrganizations = content.organizations.filter((o) => o.publication_status === "archived").sort(byName);
    this.archivedArtifacts = content.artifacts.filter((a) => a.publication_status === "archived").sort(byName);
    this.changelog = content.changelog;
    this.featured = content.featured;
    this.people = (content.people ?? []).filter((p) => p.publication_status === "published").sort(byName);
    this.localCorner = content.localCorner ?? null;
    this.news = (content.news ?? [])
      .filter((n) => n.publication_status === "published")
      .sort((a, b) => b.published_at.localeCompare(a.published_at) || b.event_date.localeCompare(a.event_date) || a.title.localeCompare(b.title));
    this.buildAt = buildAt;
    this.orgMap = new Map([...this.organizations, ...this.archivedOrganizations].map((o) => [o.slug, o]));
    this.artifactMap = new Map([...this.artifacts, ...this.archivedArtifacts].map((a) => [a.slug, a]));
  }

  /* ---- lookups (published or archived; never drafts) ---- */

  organization(slug: string): Organization | undefined {
    return this.orgMap.get(slug);
  }

  artifact(slug: string): Artifact | undefined {
    return this.artifactMap.get(slug);
  }

  isActiveOrganization(slug: string | null | undefined): boolean {
    return Boolean(slug && this.organizations.some((o) => o.slug === slug));
  }

  isActiveArtifact(slug: string | null | undefined): boolean {
    return Boolean(slug && this.artifacts.some((a) => a.slug === slug));
  }

  /* ---- derived relationships ---- */

  /** Active artifacts that list this organization. Reverse of artifact.organization_slugs. */
  artifactsForOrganization(slug: string): Artifact[] {
    return this.artifacts.filter((a) => a.organization_slugs.includes(slug));
  }

  childOrganizations(slug: string): Organization[] {
    return this.organizations.filter((o) => o.parent_org_slug === slug);
  }

  parentOrganization(org: Organization): Organization | undefined {
    return org.parent_org_slug ? this.organizations.find((o) => o.slug === org.parent_org_slug) : undefined;
  }

  releasesOf(familySlug: string): Artifact[] {
    return this.artifacts.filter((a) => a.record_level === "release" && a.family_slug === familySlug);
  }

  familyOf(artifact: Artifact): Artifact | undefined {
    return artifact.family_slug ? this.artifacts.find((a) => a.slug === artifact.family_slug) : undefined;
  }

  /** Active artifacts whose provenance names this artifact. */
  derivativesOf(slug: string): Artifact[] {
    return this.artifacts.filter((a) => a.provenance?.derived_from.some((d) => d.artifact_slug === slug));
  }

  hostedModelProducts(org: Organization) {
    return org.products.filter((p) => HOSTED_MODEL_PRODUCT_KINDS.includes(p.kind));
  }

  /**
   * Public copy of a record for data exports: references to records that are
   * not active (drafts, pending, archived) are removed so an export never
   * reveals that an unpublished record exists. Names and URLs are kept.
   */
  publicOrganization(org: Organization): Organization {
    const parentActive = this.isActiveOrganization(org.parent_org_slug);
    return {
      ...org,
      parent_org_slug: parentActive ? org.parent_org_slug : null,
      parent_relationship: parentActive ? org.parent_relationship : null,
    };
  }

  publicPerson(person: Person): Person {
    return {
      ...person,
      affiliations: person.affiliations.map((a) => ({
        ...a,
        organization_slug: this.isActiveOrganization(a.organization_slug) ? a.organization_slug : null,
      })),
      work: person.work.map((w) => ({ ...w, artifact_slug: this.isActiveArtifact(w.artifact_slug) ? w.artifact_slug : null })),
    };
  }

  publicArtifact(artifact: Artifact): Artifact {
    return {
      ...artifact,
      family_slug: this.isActiveArtifact(artifact.family_slug) ? artifact.family_slug : null,
      organization_slugs: artifact.organization_slugs.filter((s) => this.isActiveOrganization(s)),
      maintainers: artifact.maintainers.map((m) => ({
        ...m,
        organization_slug: this.isActiveOrganization(m.organization_slug) ? m.organization_slug : null,
      })),
      provenance: artifact.provenance
        ? {
            ...artifact.provenance,
            derived_from: artifact.provenance.derived_from.map((d) => ({
              ...d,
              artifact_slug: this.isActiveArtifact(d.artifact_slug) ? d.artifact_slug : null,
            })),
          }
        : null,
    };
  }

  /* ---- News ---- */

  newsItem(slug: string): NewsItem | undefined {
    return this.news.find((n) => n.slug === slug);
  }

  newsForOrganization(slug: string): NewsItem[] {
    return this.news.filter((n) => n.related_organizations.includes(slug));
  }

  newsForArtifact(slug: string): NewsItem[] {
    return this.news.filter((n) => n.related_artifacts.includes(slug));
  }

  /* ---- Local corner ---- */

  /**
   * The month's five profiles: the editor's lineup from content/local-corner.yml
   * when one exists for that month, otherwise a deterministic rotation through
   * the published pool (sorted by slug), advancing five places each month.
   */
  localCornerLineup(month: string): { month: string; people: Person[]; source: "schedule" | "rotation" } {
    const { slugs, source } = lineupSlugs(month, this.people.map((p) => p.slug), this.localCorner);
    return { month, people: slugs.map((s) => this.people.find((p) => p.slug === s)!), source };
  }

  /** The month shown on the site: USASI_MONTH (YYYY-MM) for testing, else the build month. */
  currentMonth(): string {
    const override = process.env.USASI_MONTH;
    return override && /^\d{4}-(0[1-9]|1[0-2])$/.test(override) ? override : this.buildAt.slice(0, 7);
  }

  /* ---- counts ---- */

  counts(): CatalogCounts {
    const byKind = { model: 0, dataset: 0, framework: 0, eval: 0, runtime: 0, "research-stack": 0 } as CatalogCounts["byKind"];
    for (const a of this.artifacts) byKind[a.kind] += 1;
    const units = this.organizations.filter((o) => o.parent_org_slug).length;
    return {
      organizations: this.organizations.length,
      independentOrganizations: this.organizations.length - units,
      organizationUnits: units,
      modelFamilies: this.artifacts.filter((a) => a.kind === "model" && a.record_level === "family").length,
      modelReleases: this.artifacts.filter((a) => a.kind === "model" && a.record_level === "release").length,
      software: byKind.framework + byKind.runtime + byKind["research-stack"],
      datasets: byKind.dataset,
      evals: byKind.eval,
      byKind,
    };
  }

  /* ---- serializable projections for client components ---- */

  toOrgListItem(org: Organization): OrgListItem {
    const parent = this.parentOrganization(org);
    const related = this.artifactsForOrganization(org.slug);
    return {
      slug: org.slug,
      name: org.name,
      logoText: org.logo_text,
      summary: org.summary.text,
      roles: org.organization_roles,
      sectors: org.sectors,
      ownership: org.ownership_category,
      legalName: org.legal_name?.text ?? null,
      headquarters: org.headquarters?.label ?? null,
      parent: org.parent_org_slug
        ? { slug: org.parent_org_slug, name: parent?.name ?? null, relationship: org.parent_relationship }
        : null,
      artifactCount: related.length,
      hostedModelProductCount: this.hostedModelProducts(org).length,
      productNames: org.products.map((p) => p.name),
      lastReviewed: org.last_reviewed!,
    };
  }

  toArtifactListItem(artifact: Artifact): ArtifactListItem {
    const family = this.familyOf(artifact);
    const checks: Record<string, string> = {};
    if (artifact.record_level !== "family") {
      for (const row of checklistFor(artifact)) checks[row.key] = row.item.status;
    }
    return {
      slug: artifact.slug,
      name: artifact.name,
      kind: artifact.kind,
      level: artifact.record_level,
      entryType: entryTypeFor(artifact.kind, artifact.record_level),
      familySlug: artifact.family_slug,
      familyName: family?.name ?? null,
      version: artifact.version,
      summary: artifact.summary.text,
      maintainers: artifact.maintainers.map((m) => m.name),
      organizations: artifact.organization_slugs
        .filter((slug) => this.isActiveOrganization(slug))
        .map((slug) => ({ slug, name: this.organizations.find((o) => o.slug === slug)!.name })),
      availability: artifact.availability.status,
      licenses: artifact.licenses.map((l) => ({ key: l.spdx ?? l.name, label: l.spdx ?? l.name, appliesTo: l.applies_to })),
      tier: computeTier(artifact),
      checks,
      tags: artifact.tags,
      releasedAt: artifact.released_at,
      lastReviewed: artifact.last_reviewed!,
      releaseCount: artifact.record_level === "family" ? this.releasesOf(artifact.slug).length : 0,
    };
  }

  searchEntries(): SearchEntry[] {
    const orgEntries: SearchEntry[] = this.organizations.map((o) => ({
      type: "organization" as EntryType,
      slug: o.slug,
      href: orgHref(o.slug),
      name: o.name,
      summary: o.summary.text,
      keywords: [
        o.legal_name?.text,
        o.headquarters?.label,
        ...o.sectors,
        ...o.organization_roles,
        ...o.products.map((p) => p.name),
        this.parentOrganization(o)?.name,
      ]
        .filter(Boolean)
        .join(" "),
    }));
    const artifactEntries: SearchEntry[] = this.artifacts.map((a) => ({
      type: entryTypeFor(a.kind, a.record_level),
      slug: a.slug,
      href: artifactHref(a.slug),
      name: a.name,
      summary: a.summary.text,
      keywords: [
        a.version,
        a.kind,
        ...a.tags,
        ...a.maintainers.map((m) => m.name),
        ...a.licenses.map((l) => l.spdx ?? l.name),
        ...a.organization_slugs.map((slug) => this.organizations.find((o) => o.slug === slug)?.name),
        this.familyOf(a)?.name,
      ]
        .filter(Boolean)
        .join(" "),
    }));
    return [...orgEntries, ...artifactEntries];
  }
}

export function loadCatalog(root: string = DEFAULT_CONTENT_DIR, options: { today?: string; buildAt?: string } = {}): Catalog {
  const validated = validateContent(readRawContent(root), { today: options.today ?? todayIso() });
  const errors = validated.issues.filter((i) => i.level === "error");
  if (errors.length > 0) throw new ContentValidationError(errors);
  return new Catalog(validated, options.buildAt);
}

export const BUILD_INFO_PATH = path.join(process.cwd(), "public", "data", "build-info.json");

/**
 * The website-generation timestamp. Written once by scripts/generate-data.ts so
 * every page and export in a build agrees. This is never an editorial date.
 */
export function readBuildAt(): string {
  try {
    const info = JSON.parse(fs.readFileSync(BUILD_INFO_PATH, "utf8")) as { build_at?: string };
    if (info.build_at) return info.build_at;
  } catch {
    /* not generated yet (e.g. unit tests) */
  }
  return new Date().toISOString();
}

let cached: Catalog | null = null;

/** The site's catalog, loaded once per build process. Always the real /content tree. */
export function getCatalog(): Catalog {
  if (!cached) cached = loadCatalog(DEFAULT_CONTENT_DIR, { buildAt: readBuildAt() });
  return cached;
}
