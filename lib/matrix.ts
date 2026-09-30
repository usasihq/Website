/**
 * /matrix — the comparison workspace (not a leaderboard).
 *
 * Every numeric cell is defined as a directory filter. The count is computed
 * by running that filter, and the cell links to the same filter, so the linked
 * view lists exactly the records counted. Pure and client-safe.
 */
import { CHECKLISTS } from "./openness";
import { companiesHref, openHref, orgHref } from "./routes";
import {
  DEFAULT_ARTIFACT_FILTERS,
  DEFAULT_ORG_FILTERS,
  filterArtifacts,
  filterOrganizations,
  serializeArtifactFilters,
  serializeOrgFilters,
  type ArtifactFilters,
  type ArtifactListItem,
  type OrgFilters,
  type OrgListItem,
} from "./search";
import type { ArtifactKind } from "./schema";

export interface MatrixCell {
  count: number;
  href: string;
  slugs: string[];
}

export interface ModelColumn {
  key: string;
  label: string;
  description: string;
  filters: Partial<ArtifactFilters>;
  group: "records" | "tiers" | "materials" | "gaps";
}

const RELEASES = { kind: "model", level: "release" } as const;

export const MODEL_COLUMNS: ModelColumn[] = [
  {
    key: "families",
    label: "Model families",
    description: "Family overview records. Families summarize releases and are never counted as releases.",
    filters: { kind: "model", level: "family" },
    group: "records",
  },
  {
    key: "releases",
    label: "Model releases",
    description: "Specific releases assessed in this catalog.",
    filters: { ...RELEASES },
    group: "records",
  },
  {
    key: "open-weight",
    label: "Open-weight",
    description: "Releases with publicly downloadable weights. Includes every open-stack and fully open release.",
    filters: { ...RELEASES, tier: "open-weight" },
    group: "tiers",
  },
  {
    key: "open-stack",
    label: "Open-stack",
    description: "Subset of open-weight releases that also publish code, recipe, and training-data information. Includes fully open releases.",
    filters: { ...RELEASES, tier: "open-stack" },
    group: "tiers",
  },
  {
    key: "fully-open",
    label: "Fully open",
    description: "Subset of open-stack releases meeting every item of the rubric.",
    filters: { ...RELEASES, tier: "fully-open" },
    group: "tiers",
  },
  {
    key: "training-code",
    label: "Training code public",
    description: "Releases whose training code is documented as public.",
    filters: { ...RELEASES, check: "training_code:public" },
    group: "materials",
  },
  {
    key: "training-data",
    label: "Training-data info",
    description: "Releases whose training data is public, or whose composition is documented (public or partial).",
    filters: { ...RELEASES, check: "training_data_information:documented" },
    group: "materials",
  },
  {
    key: "evaluation",
    label: "Evaluation materials public",
    description: "Releases whose evaluation code or prompts are published, so others can re-run the evaluations. Results-only releases are not counted.",
    filters: { ...RELEASES, check: "evaluation_materials:public" },
    group: "materials",
  },
  {
    key: "restricted-weights",
    label: "Restricted weights",
    description: "Releases whose weights are available only by request or approval, or to some users. Not counted as open-weight.",
    filters: { ...RELEASES, tier: "restricted-weights" },
    group: "gaps",
  },
  {
    key: "weights-unassessed",
    label: "Weights unassessed",
    description: "Releases whose weight availability is Unknown in this catalog.",
    filters: { ...RELEASES, tier: "unknown" },
    group: "gaps",
  },
];

export function artifactCell(items: ArtifactListItem[], filters: Partial<ArtifactFilters>): MatrixCell {
  const full: ArtifactFilters = { ...DEFAULT_ARTIFACT_FILTERS, ...filters };
  const matched = filterArtifacts(items, full);
  return { count: matched.length, href: openHref(serializeArtifactFilters(full)), slugs: matched.map((m) => m.slug) };
}

export function organizationCell(items: OrgListItem[], filters: Partial<OrgFilters>): MatrixCell {
  const full: OrgFilters = { ...DEFAULT_ORG_FILTERS, ...filters };
  const matched = filterOrganizations(items, full);
  return { count: matched.length, href: companiesHref(serializeOrgFilters(full)), slugs: matched.map((m) => m.slug) };
}

export interface ModelMatrixRow {
  org: OrgListItem;
  hosted: MatrixCell;
  cells: Record<string, MatrixCell>;
}

/** Rows: organizations with a documented hosted-model product or any model record. */
export function buildModelMatrix(orgs: OrgListItem[], artifacts: ArtifactListItem[], hostedProductIds: Record<string, string[]>): ModelMatrixRow[] {
  return orgs
    .filter((org) => org.hostedModelProductCount > 0 || artifacts.some((a) => a.kind === "model" && a.organizations.some((o) => o.slug === org.slug)))
    .map((org) => ({
      org,
      hosted: {
        count: org.hostedModelProductCount,
        href: `${orgHref(org.slug)}#hosted-model-products`,
        slugs: hostedProductIds[org.slug] ?? [],
      },
      cells: Object.fromEntries(MODEL_COLUMNS.map((c) => [c.key, artifactCell(artifacts, { ...c.filters, org: org.slug })])),
    }));
}

export interface CoverageRow {
  key: string;
  label: string;
  note: string;
  cell: MatrixCell;
}

export function buildCoverage(orgs: OrgListItem[], artifacts: ArtifactListItem[]): CoverageRow[] {
  const kinds: Array<[ArtifactKind, string, string]> = [
    ["framework", "Frameworks", "Software libraries for building or training models."],
    ["runtime", "Runtimes", "Software for serving or running models."],
    ["research-stack", "Research stacks", "Reference training or research codebases."],
    ["dataset", "Datasets", "Published datasets."],
    ["eval", "Evaluation tools", "Benchmarks and evaluation harnesses."],
  ];
  return [
    {
      key: "organizations",
      label: "Organization records",
      note: "Every published organization record, including research units and subsidiaries listed separately.",
      cell: organizationCell(orgs, {}),
    },
    {
      key: "independent",
      label: "Top-level organizations",
      note: "Organization records without a parent organization in this catalog.",
      cell: organizationCell(orgs, { structure: "independent" }),
    },
    {
      key: "units",
      label: "Units and subsidiaries",
      note: "Organization records that belong to a parent listed in this catalog. Not independent companies.",
      cell: organizationCell(orgs, { structure: "unit" }),
    },
    {
      key: "families",
      label: "Model families",
      note: "Overview records. Not added to release counts.",
      cell: artifactCell(artifacts, { kind: "model", level: "family" }),
    },
    {
      key: "releases",
      label: "Model releases",
      note: "Specific releases assessed.",
      cell: artifactCell(artifacts, { kind: "model", level: "release" }),
    },
    ...kinds.map(([kind, label, note]) => ({ key: kind, label, note, cell: artifactCell(artifacts, { kind }) })),
  ];
}

/** Non-model artifact groups for the software/data/evaluation view. */
export const PROJECT_GROUPS: Array<{ key: string; label: string; kinds: ArtifactKind[] }> = [
  { key: "software", label: "Frameworks and runtimes", kinds: ["framework", "runtime"] },
  { key: "research-stack", label: "Research stacks", kinds: ["research-stack"] },
  { key: "datasets", label: "Datasets", kinds: ["dataset"] },
  { key: "evals", label: "Evaluation tools", kinds: ["eval"] },
];

export function checklistColumnsFor(kinds: ArtifactKind[]) {
  // Frameworks and runtimes share one checklist, so the first kind defines the columns.
  return CHECKLISTS[kinds[0]];
}
