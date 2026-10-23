/**
 * "The State of American AI": a recurring report whose every figure is
 * computed from this catalog. Pure functions only (no file system), so the
 * same code computes a frozen edition (scripts/report-snapshot.ts), the live
 * comparison shown on /report/, and the unit tests.
 *
 * An edition is computed once, written to content/reports/<YYYY-MM>.json, and
 * never recomputed: later catalog changes cannot rewrite a published edition.
 * The text that defines each figure (captions and counting notes) is frozen
 * with the numbers, so an edition always says how its own numbers were made.
 *
 * Wording rules: figures describe "records in this catalog", never the
 * country or an industry; no rankings, no "best", no capability claims.
 */
import type { Catalog } from "./catalog";
import { MEMORY_PAGES, memoryLabel, memoryPageResults } from "./hardware";
import { KIND_PLURAL, OWNERSHIP_LABELS, ROLE_LABELS, SECTOR_LABELS } from "./labels";
import { guideFor } from "./licenses";
import { checklistStatus, computeTier, RUBRIC_LABEL, TIER_LABELS, type ModelTier } from "./openness";
import { stateFromHeadquarters, US_STATES } from "./places";
import { policyShortName, POLICY_STATUS_LABELS, POLICY_TYPE_LABELS } from "./policy";
import { OWNERSHIP_CATEGORIES, ORGANIZATION_ROLES, SECTORS } from "./enums";
import type { Artifact, LicenseRecord, PolicyDocumentType, PolicyStatus } from "./schema";

export const REPORT_NAME = "The State of American AI";
/** Shape of the edition files. Bump only with a migration for older editions. */
export const REPORT_FORMAT_VERSION = 1;
/**
 * Counting rules. Bump when a definition changes; older editions keep theirs.
 * 2 (from the November 2026 edition): a city given on its own counts in its state when it is in the jobs location table.
 */
export const REPORT_METHOD_VERSION = 2;
export const REPORT_LICENSE = { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" } as const;
export const REPORT_NOTICE =
  "Independent project. Not a United States government website. Every figure counts published records in the USASI catalog as of the data cutoff; coverage is selective, so counts are not a census, a ranking, or a measure of capability.";

export const EDITION_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const isEdition = (value: string) => EDITION_RE.test(value);
/** "2026-10" → "October 2026". */
export function editionLabel(edition: string): string {
  const m = EDITION_RE.exec(edition);
  if (!m) throw new Error(`Not an edition id (YYYY-MM): ${edition}`);
  return `${MONTH_NAMES[Number(m[2]) - 1]} ${m[1]}`;
}
/** "2026-10" → "2026-11": editions are published monthly. */
export function nextEdition(edition: string): string {
  const m = EDITION_RE.exec(edition);
  if (!m) throw new Error(`Not an edition id (YYYY-MM): ${edition}`);
  const [y, mo] = [Number(m[1]), Number(m[2])];
  return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
}
export const editionTitle = (edition: string) => `${REPORT_NAME}, ${editionLabel(edition)}`;
export const REPORT_HREF = "/report/";
export const editionHref = (edition: string) => `/report/${edition}/`;
export const editionDataHref = (edition: string, format: "csv" | "json") => `/report/${edition}/data.${format}`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export const REPORT_SECTIONS = [
  { id: "organizations", title: "Organizations" },
  { id: "artifacts", title: "Open models and tools" },
  { id: "licenses", title: "Licenses" },
  { id: "local", title: "Local AI" },
  { id: "jobs", title: "Jobs" },
  { id: "policy", title: "Policy" },
] as const;
export type ReportSectionId = (typeof REPORT_SECTIONS)[number]["id"];

/** How a row's key maps to a page on the site (resolved when the page is built, so every link exists). */
export type ReportLinkKind = "state" | "organization" | "license" | "memory" | "jobs-state" | "kind";

export type ReportRow = { key: string; label: string; count: number };

export type ReportTable = {
  id: string;
  section: ReportSectionId;
  title: string;
  /** Plain caption: what the table shows. */
  caption: string;
  /** How this is counted. */
  counted: string;
  /** What one counted unit is ("organization records", "model releases"). */
  unit: string;
  /** Number of records the table is about; shares are out of this. */
  universe: number;
  /** True when one record can appear in several rows, so rows add up to more than the universe. */
  overlapping: boolean;
  link: ReportLinkKind | null;
  /** Rows shown before "show all" (the rest stay in the full table and the downloads). */
  show: number | null;
  /** The table is a time series (drawn as columns as well as a table). */
  series?: boolean;
  rows: ReportRow[];
};

export type ReportTotal = { key: string; label: string; value: number; section: ReportSectionId };

export type ReportFinding = { id: string; text: string; definition: string; table: string };

export type PolicyEntry = { slug: string; name: string; type: PolicyDocumentType; status: PolicyStatus; date: string };

export type ReportRecords = { organizations: string[]; artifacts: string[]; finder: string[]; policy: PolicyEntry[] };

export type ReportFigures = { totals: ReportTotal[]; tables: ReportTable[]; findings: ReportFinding[]; records: ReportRecords };

export type ReportInputs = {
  /** sha256 of the published records the report reads (see lib/report-editions.ts). */
  catalog_digest: string;
  /** sha256 of the jobs data file as read, or null when no jobs data were used. */
  jobs_digest: string | null;
  /** Repository commit the catalog was read at, when known. */
  git_commit: string | null;
  /** Whether content/ had uncommitted changes at snapshot time (null when unknown). */
  content_clean: boolean | null;
  schema_version: string;
  rubric_version: string;
};

export type ReportSnapshot = {
  report: typeof REPORT_NAME;
  format_version: number;
  method_version: number;
  edition: string;
  title: string;
  /** Date the edition was published (YYYY-MM-DD). */
  published: string;
  /** The catalog as published on this date (YYYY-MM-DD). */
  data_cutoff: string;
  /** When the figures were computed. Jobs counts use this instant. */
  generated_at: string;
  /** Most recent successful check of an employer job feed in the jobs data used. */
  jobs_checked_at: string | null;
  inputs: ReportInputs;
  license: { name: string; url: string };
  notice: string;
} & ReportFigures;

export type JobsInput = null;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const nf = (v: number) => v.toLocaleString("en-US");

/** Whole-percent share for prose and tables: "42%", "<1%" for a small nonzero share. */
export function percent(count: number, of: number): string {
  if (!of) return "0%";
  const p = (100 * count) / of;
  if (count > 0 && p < 0.5) return "<1%";
  return `${Math.round(p)}%`;
}

function tally<T>(items: T[], keyOf: (x: T) => string | string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of items) {
    const keys = keyOf(x);
    for (const k of new Set(Array.isArray(keys) ? keys : [keys])) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/** Rows in a fixed order (zero rows kept: a zero is a finding for a fixed list of categories). */
function fixedRows(order: readonly string[], counts: Map<string, number>, label: (k: string) => string): ReportRow[] {
  return order.map((key) => ({ key, label: label(key), count: counts.get(key) ?? 0 }));
}

/** Rows by count, largest first, then by label; zero rows dropped. */
function rankedRows(counts: Map<string, number>, label: (k: string) => string): ReportRow[] {
  return [...counts]
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, label: label(key), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "en"));
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ------------------------------------------------------------------ */
/* License grouping and families                                       */
/* ------------------------------------------------------------------ */

const WEIGHTS: LicenseRecord["applies_to"][] = ["weights", "weights-and-code", "all"];
const CODE: LicenseRecord["applies_to"][] = ["code", "weights-and-code", "all"];

/** Standard permissive licenses, by SPDX identifier. */
export const PERMISSIVE_SPDX = [
  "Apache-2.0",
  "Apache-2.0 WITH LLVM-exception",
  "MIT",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "NCSA",
  "Zlib",
  "BSL-1.0",
  "0BSD",
  "Unlicense",
  "CC0-1.0",
  "CC-BY-4.0",
  "ODC-By-1.0",
  "PDDL-1.0",
  "CDLA-Permissive-2.0",
] as const;
/** Standard copyleft (share-alike) licenses, by SPDX identifier prefix. */
export const COPYLEFT_SPDX_PREFIXES = ["GPL-", "LGPL-", "AGPL-", "MPL-", "EPL-", "CC-BY-SA-", "ODbL-"] as const;

export const LICENSE_FAMILIES = ["permissive", "copyleft", "custom", "non-commercial", "none"] as const;
export type LicenseFamily = (typeof LICENSE_FAMILIES)[number];
export const LICENSE_FAMILY_LABELS: Record<LicenseFamily, string> = {
  permissive: "Standard permissive license",
  copyleft: "Standard copyleft license",
  custom: "Custom license (publisher's own terms)",
  "non-commercial": "Non-commercial terms",
  none: "No weights license recorded",
};
/** Most restrictive first: a release with several weights licenses is counted in the first family it has. */
const FAMILY_PRECEDENCE: LicenseFamily[] = ["non-commercial", "custom", "copyleft", "permissive"];

export function licenseFamily(catalog: Catalog, l: LicenseRecord): Exclude<LicenseFamily, "none"> {
  const guide = guideFor(catalog, l);
  if (guide?.category === "non-commercial" || /-NC(-|$)/.test(l.spdx ?? "") || /non-?commercial/i.test(l.name)) return "non-commercial";
  if (l.spdx && (PERMISSIVE_SPDX as readonly string[]).includes(l.spdx)) return "permissive";
  if (l.spdx && COPYLEFT_SPDX_PREFIXES.some((p) => l.spdx!.startsWith(p))) return "copyleft";
  return "custom";
}

export function releaseLicenseFamily(catalog: Catalog, a: Artifact): LicenseFamily {
  const families = new Set<LicenseFamily>(a.licenses.filter((l) => WEIGHTS.includes(l.applies_to)).map((l) => licenseFamily(catalog, l)));
  return FAMILY_PRECEDENCE.find((f) => families.has(f)) ?? "none";
}

/** One license entry as a table row key and label: its license guide, else its SPDX id, else its recorded name. */
export function licenseKey(catalog: Catalog, l: LicenseRecord): { key: string; label: string } {
  const guide = guideFor(catalog, l);
  if (guide) return { key: guide.slug, label: guide.name };
  if (l.spdx) return { key: slugify(l.spdx), label: l.spdx };
  const name = l.name.replace(/\s*\([^)]*\)\s*$/, "").trim() || l.name;
  return { key: slugify(name), label: name };
}

function licenseRows(catalog: Catalog, records: Artifact[], covers: LicenseRecord["applies_to"][], noneLabel: string): ReportRow[] {
  const labels = new Map<string, string>();
  const counts = tally(records, (a) => {
    const keys = a.licenses
      .filter((l) => covers.includes(l.applies_to))
      .map((l) => {
        const k = licenseKey(catalog, l);
        labels.set(k.key, k.label);
        return k.key;
      });
    return keys.length ? keys : ["none"];
  });
  const none = counts.get("none") ?? 0;
  counts.delete("none");
  const rows = rankedRows(counts, (k) => labels.get(k)!);
  return none ? [...rows, { key: "none", label: noneLabel, count: none }] : rows;
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

/** "2025-08-14" → "2025-Q3"; "2025" and null → null. */
export function releaseQuarter(date: string | null): string | null {
  if (!date || date.length < 7) return null;
  return `${date.slice(0, 4)}-Q${Math.floor((Number(date.slice(5, 7)) - 1) / 3) + 1}`;
}
const quarterLabel = (q: string) => `Q${q.slice(6)} ${q.slice(0, 4)}`;
function quartersBetween(first: string, last: string): string[] {
  const out: string[] = [];
  let [y, q] = [Number(first.slice(0, 4)), Number(first.slice(6))];
  const [ly, lq] = [Number(last.slice(0, 4)), Number(last.slice(6))];
  while (y < ly || (y === ly && q <= lq)) {
    out.push(`${y}-Q${q}`);
    q += 1;
    if (q > 4) [y, q] = [y + 1, 1];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* The figures                                                         */
/* ------------------------------------------------------------------ */

const OPEN_TIERS: ModelTier[] = ["fully-open", "open-stack", "open-weight"];
const TIER_ORDER: ModelTier[] = ["fully-open", "open-stack", "open-weight", "restricted-weights", "weights-not-public", "unknown"];
const EXACT_TIER_LABELS: Record<ModelTier, string> = { ...TIER_LABELS, "open-weight": "Open-weight (no higher tier)" };
const WEIGHT_STATES = ["public", "partial", "not_public", "unknown"] as const;
const WEIGHT_LABELS: Record<(typeof WEIGHT_STATES)[number], string> = {
  public: "Public download",
  partial: "Gated (by request, approval, or for some users)",
  not_public: "Not public",
  unknown: "Not assessed",
};
const ARTIFACT_GROUPS = [
  { key: "model-family", label: "Model families" },
  { key: "model-release", label: "Model releases" },
  { key: "framework", label: KIND_PLURAL.framework },
  { key: "runtime", label: KIND_PLURAL.runtime },
  { key: "research-stack", label: KIND_PLURAL["research-stack"] },
  { key: "dataset", label: KIND_PLURAL.dataset },
  { key: "eval", label: KIND_PLURAL.eval },
] as const;
const artifactGroup = (a: Artifact) => (a.kind === "model" ? `model-${a.record_level}` : a.kind);
const SOFTWARE_KINDS: Artifact["kind"][] = ["framework", "runtime", "research-stack"];
const POLICY_TYPES = Object.keys(POLICY_TYPE_LABELS) as PolicyDocumentType[];
const POLICY_STATUSES = Object.keys(POLICY_STATUS_LABELS) as PolicyStatus[];

function table(t: Omit<ReportTable, "show" | "link"> & { show?: number | null; link?: ReportLinkKind | null }): ReportTable {
  return { show: null, link: null, ...t };
}

const stateDisplayName = (code: string) => US_STATES[code] ?? code;

export function computeFigures(catalog: Catalog, cutoff: string): ReportFigures {
  const orgs = catalog.organizations;
  const artifacts = catalog.artifacts;
  const releases = artifacts.filter((a) => a.kind === "model" && a.record_level === "release");
  const software = artifacts.filter((a) => SOFTWARE_KINDS.includes(a.kind));
  const tierOf = new Map(releases.map((a) => [a.slug, computeTier(a)!]));
  const openWeight = releases.filter((a) => OPEN_TIERS.includes(tierOf.get(a.slug)!));
  const orgName = (slug: string) => catalog.organization(slug)?.name ?? slug;
  const N = orgs.length;
  const R = releases.length;
  const tables: ReportTable[] = [];

  /* ---- Organizations ---- */
  const units = orgs.filter((o) => o.parent_org_slug).length;
  tables.push(
    table({
      id: "org-ownership",
      section: "organizations",
      title: "Organization records by ownership",
      caption: `Ownership category of each of the ${nf(N)} organization records.`,
      counted:
        "Each published organization record has exactly one ownership category, recorded from its sources: publicly traded, privately held, nonprofit, a unit of another organization, foundation-hosted, a public institution, or unknown. Research units and subsidiaries have their own records. Rows add up to the total.",
      unit: "organization records",
      universe: N,
      overlapping: false,
      rows: fixedRows(OWNERSHIP_CATEGORIES, tally(orgs, (o) => o.ownership_category), (k) => OWNERSHIP_LABELS[k as keyof typeof OWNERSHIP_LABELS]),
    }),
    table({
      id: "org-structure",
      section: "organizations",
      title: "Independent organizations and units",
      caption: "Organization records that stand alone, and records for a unit of another organization in the catalog.",
      counted:
        "A unit is a research unit, division, subsidiary, or hosted project whose record names a parent organization. Units are counted separately so that a parent and its unit are never presented as two independent companies. Rows add up to the total.",
      unit: "organization records",
      universe: N,
      overlapping: false,
      rows: [
        { key: "independent", label: "Independent organizations", count: N - units },
        { key: "unit", label: "Units of another organization", count: units },
      ],
    }),
    table({
      id: "org-roles",
      section: "organizations",
      title: "What the organizations do",
      caption: "Documented roles on organization records, such as model developer or chip designer.",
      counted: `Roles are the documented activities recorded for each organization. Most records have more than one role, so the rows add up to more than the ${nf(N)} records; each share is out of all organization records.`,
      unit: "organization records",
      universe: N,
      overlapping: true,
      rows: rankedRows(tally(orgs, (o) => o.organization_roles), (k) => ROLE_LABELS[k as (typeof ORGANIZATION_ROLES)[number]]),
    }),
    table({
      id: "org-sectors",
      section: "organizations",
      title: "Sectors",
      caption: "Sector tags on organization records.",
      counted: `Sectors are applied only where a record's evidence supports them, and a record can have several, so rows add up to more than the ${nf(N)} records. Records with no sector tag are counted in their own row.`,
      unit: "organization records",
      universe: N,
      overlapping: true,
      rows: (() => {
        const counts = tally(orgs, (o) => (o.sectors.length ? o.sectors : ["none"]));
        const none = counts.get("none") ?? 0;
        counts.delete("none");
        const rows = rankedRows(counts, (k) => SECTOR_LABELS[k as (typeof SECTORS)[number]]);
        return none ? [...rows, { key: "none", label: "No sector recorded", count: none }] : rows;
      })(),
    }),
  );
  const stateCounts = tally(orgs, (o) => stateFromHeadquarters(o.headquarters?.label, o.headquarters?.country) ?? "none");
  const noState = stateCounts.get("none") ?? 0;
  stateCounts.delete("none");
  const stateRows = rankedRows(stateCounts, stateDisplayName);
  tables.push(
    table({
      id: "org-hq-state",
      section: "organizations",
      title: "Headquarters by U.S. state",
      caption: "Organization records by the U.S. state named in their documented headquarters.",
      counted:
        "The state is read only from the text of each record's sourced headquarters label (for example “Santa Clara, California”). Offices, data centers, and other locations are not counted. Records whose label names no U.S. state are counted in the last row. Each record counts once; rows add up to the total.",
      unit: "organization records",
      universe: N,
      overlapping: false,
      link: "state",
      show: 10,
      rows: noState ? [...stateRows, { key: "none", label: "No U.S. state in the headquarters label", count: noState }] : stateRows,
    }),
  );
  const decades = tally(orgs, (o) => (o.founded ? String(Math.floor(o.founded.year / 10) * 10) : "none"));
  const noYear = decades.get("none") ?? 0;
  decades.delete("none");
  tables.push(
    table({
      id: "org-founded",
      section: "organizations",
      title: "Founded, by decade",
      caption: "Organization records by the decade of their documented founding year.",
      counted: `Founding years come from each record's sourced founding date. Records with no founding year recorded are counted in the last row: a missing year means the catalog has not documented it, not that the organization is new. Units are counted separately from their parents. Rows add up to the total.`,
      unit: "organization records",
      universe: N,
      overlapping: false,
      rows: [
        ...[...decades].sort(([a], [b]) => Number(a) - Number(b)).map(([key, count]) => ({ key, label: `${key}s`, count })),
        ...(noYear ? [{ key: "none", label: "No founding year recorded", count: noYear }] : []),
      ],
    }),
  );

  /* ---- Open models and tools ---- */
  tables.push(
    table({
      id: "artifact-kinds",
      section: "artifacts",
      title: "Open Models & Tools records by kind",
      caption: `All ${nf(artifacts.length)} published records in the Open Models & Tools directory, by kind.`,
      counted:
        "Model families (overview records for a line of models) are counted separately from model releases (one record per assessed release, which carries the license and checklist). Frameworks, runtimes, and research stacks together are this report's software. Rows add up to the total.",
      unit: "records",
      universe: artifacts.length,
      overlapping: false,
      link: "kind",
      rows: fixedRows(
        ARTIFACT_GROUPS.map((g) => g.key),
        tally(artifacts, artifactGroup),
        (k) => ARTIFACT_GROUPS.find((g) => g.key === k)!.label,
      ),
    }),
    table({
      id: "model-tiers",
      section: "artifacts",
      title: "Model releases by openness tier",
      caption: `The openness tier of each of the ${nf(R)} model releases under ${RUBRIC_LABEL}.`,
      counted: `Tiers are computed from each release's public-materials checklist and licenses under ${RUBRIC_LABEL}; they are never typed by hand. Each release has exactly one tier, so rows add up to the total. In the rubric the open tiers are cumulative (every open-stack release is also open-weight), so open-weight in the wider sense is the first three rows together: ${nf(openWeight.length)} releases.`,
      unit: "model releases",
      universe: R,
      overlapping: false,
      rows: fixedRows(TIER_ORDER, tally(releases, (a) => tierOf.get(a.slug)!), (k) => EXACT_TIER_LABELS[k as ModelTier]),
    }),
    table({
      id: "model-weights",
      section: "artifacts",
      title: "Can the weights be downloaded?",
      caption: "Model releases by the documented availability of their weights.",
      counted:
        "From the weights entry of each release's checklist. Public download: the general public can download the parameters (license terms may still restrict use). Gated: available only by request, with approval, or to some users. Not public: documented as unavailable. Not assessed: the evidence is missing or insufficient. Rows add up to the total.",
      unit: "model releases",
      universe: R,
      overlapping: false,
      rows: fixedRows(WEIGHT_STATES, tally(releases, (a) => {
        const s = checklistStatus(a, "weights");
        return s === "not_applicable" ? "unknown" : s;
      }), (k) => WEIGHT_LABELS[k as (typeof WEIGHT_STATES)[number]]),
    }),
  );
  const firstDated = releases.map((a) => releaseQuarter(a.released_at)).filter((q): q is string => Boolean(q)).sort()[0];
  const lastQuarter = releaseQuarter(cutoff)!;
  const quarterCounts = tally(releases, (a) => releaseQuarter(a.released_at) ?? (a.released_at ? "year-only" : "none"));
  tables.push(
    table({
      id: "model-quarters",
      section: "artifacts",
      title: "Model releases by documented release quarter",
      caption: "Model releases by the calendar quarter of their documented release date.",
      counted:
        "The quarter of each release's documented release date. Dates documented only as a year cannot be placed in a quarter and are counted separately, as are releases with no documented date. The catalog records a few assessed releases per model family, mostly recent ones chosen when the family was researched, so this shows the catalog's coverage over time, not how often models are released. The last quarter is partial: it runs to the data cutoff. Rows add up to the total.",
      unit: "model releases",
      universe: R,
      overlapping: false,
      series: true,
      rows: [
        ...(firstDated ? quartersBetween(firstDated, lastQuarter) : []).map((q) => ({ key: q, label: quarterLabel(q), count: quarterCounts.get(q) ?? 0 })),
        ...(quarterCounts.get("year-only") ? [{ key: "year-only", label: "Year documented, quarter not", count: quarterCounts.get("year-only")! }] : []),
        ...(quarterCounts.get("none") ? [{ key: "none", label: "No documented release date", count: quarterCounts.get("none")! }] : []),
      ],
    }),
  );
  const byOrg = tally(openWeight, (a) => {
    const slugs = a.organization_slugs.filter((s) => catalog.isActiveOrganization(s));
    return slugs.length ? slugs : ["none"];
  });
  const owNone = byOrg.get("none") ?? 0;
  byOrg.delete("none");
  tables.push(
    table({
      id: "open-weight-organizations",
      section: "artifacts",
      title: "Organizations with open-weight releases in the catalog",
      caption: `Organization records by the number of open-weight model releases (of ${nf(openWeight.length)}) that list them.`,
      counted:
        "Open-weight releases (the open-weight tier or a higher one) counted for each organization record the release lists. A release that lists two organizations counts for both, so rows can add up to more than the total. Counts reflect the releases this catalog has assessed, not everything an organization has published.",
      unit: "open-weight model releases",
      universe: openWeight.length,
      overlapping: true,
      link: "organization",
      show: 10,
      rows: [...rankedRows(byOrg, orgName), ...(owNone ? [{ key: "none", label: "No organization record listed", count: owNone }] : [])],
    }),
  );

  /* ---- Licenses ---- */
  tables.push(
    table({
      id: "model-license-family",
      section: "licenses",
      title: "License family of the weights",
      caption: "Model releases by the kind of license that applies to their weights.",
      counted: `Licenses that apply to a release's weights (weights, weights and code, or everything). Standard permissive: an SPDX identifier on this report's permissive list (${PERMISSIVE_SPDX.join(", ")}). Standard copyleft: a GPL-family, MPL, EPL, or share-alike identifier. Non-commercial: the license's guide on this site is in the non-commercial category, or its SPDX identifier or name says non-commercial. Custom: any other license, usually the publisher's own terms without an SPDX identifier. A release with several weights licenses counts once, in its most restrictive family (non-commercial, then custom, then copyleft, then permissive). Rows add up to the total.`,
      unit: "model releases",
      universe: R,
      overlapping: false,
      rows: fixedRows(LICENSE_FAMILIES, tally(releases, (a) => releaseLicenseFamily(catalog, a)), (k) => LICENSE_FAMILY_LABELS[k as LicenseFamily]),
    }),
    table({
      id: "model-licenses",
      section: "licenses",
      title: "Licenses on model weights",
      caption: "The licenses that apply to model releases' weights, by how many releases use each.",
      counted:
        "Each license that applies to a release's weights, grouped by this site's license guide when one matches and otherwise by SPDX identifier or recorded name. A release counts once per license; a release with two weights licenses counts under both.",
      unit: "model releases",
      universe: R,
      overlapping: true,
      link: "license",
      show: 10,
      rows: licenseRows(catalog, releases, WEIGHTS, "No weights license recorded"),
    }),
    table({
      id: "software-licenses",
      section: "licenses",
      title: "Licenses on software",
      caption: `The code licenses of the ${nf(software.length)} framework, runtime, and research-stack records.`,
      counted:
        "Each license that applies to a project's code, grouped by license guide, SPDX identifier, or recorded name. Projects often license different parts differently, so a project can count under several licenses and rows add up to more than the total.",
      unit: "software records",
      universe: software.length,
      overlapping: true,
      link: "license",
      show: 10,
      rows: licenseRows(catalog, software, CODE, "No code license recorded"),
    }),
  );

  /* ---- Local AI ---- */
  const local = catalog.finder.filter((c) => c.runs === "local");
  tables.push(
    table({
      id: "finder-runs",
      section: "local",
      title: "Documented configurations by where they run",
      caption: `The ${nf(catalog.finder.length)} configurations in the finder, by where the model runs.`,
      counted:
        "A configuration is one documented way to do a task: a specific combination of model, runtime, app, or hosted service, with requirements restated from the publisher's own documentation. Local: runs on your own computer. Hybrid: a tool on your computer that sends requests to a hosted model. Hosted: runs on the provider's servers. Rows add up to the total.",
      unit: "configurations",
      universe: catalog.finder.length,
      overlapping: false,
      rows: fixedRows(["local", "hybrid", "hosted"], tally(catalog.finder, (c) => c.runs), (k) => ({ local: "Local", hybrid: "Hybrid", hosted: "Hosted" })[k]!),
    }),
  );
  const memoryBin = (c: (typeof local)[number]) => {
    if (!c.memory) return "none";
    const gpu = c.memory.gpu_gb !== null;
    const gb = c.memory.gpu_gb ?? c.memory.system_gb!;
    return `${gpu ? "vram" : "system"}-${gb <= 8 ? "8" : gb <= 16 ? "16" : "more"}`;
  };
  const BIN_LABELS: Record<string, string> = {
    "vram-8": "Graphics memory (VRAM): 8 GB or less",
    "vram-16": "Graphics memory (VRAM): more than 8, up to 16 GB",
    "vram-more": "Graphics memory (VRAM): more than 16 GB",
    "system-8": "System memory: 8 GB or less",
    "system-16": "System memory: more than 8, up to 16 GB",
    "system-more": "System memory: more than 16 GB",
    none: "No memory figure documented",
  };
  const bins = tally(local, memoryBin);
  tables.push(
    table({
      id: "local-memory",
      section: "local",
      title: "Memory the publisher documents",
      caption: `The ${nf(local.length)} local configurations by the memory figure their publisher states.`,
      counted:
        "The publisher's own memory statement for the exact variant named on each configuration, as recorded with its source. Graphics-memory (VRAM) and system-memory figures are kept apart, because they describe different memory. A figure is the publisher's estimate, not a USASI test, unless the record documents a test. Configurations without a stated figure are counted in the last row. Rows add up to the total.",
      unit: "local configurations",
      universe: local.length,
      overlapping: false,
      rows: Object.keys(BIN_LABELS)
        .filter((k) => k === "none" || bins.get(k))
        .map((key) => ({ key, label: BIN_LABELS[key], count: bins.get(key) ?? 0 })),
    }),
    table({
      id: "local-memory-pages",
      section: "local",
      title: "Configurations that fit each amount of memory",
      caption: "How many local configurations fit each amount of graphics memory or Apple silicon unified memory.",
      counted:
        "The same rule as the Local AI by memory pages: a configuration is listed when every finder requirement is met and the publisher's figure is within the amount. A configuration that fits 8 GB also fits larger amounts, so rows overlap; shares are out of all local configurations.",
      unit: "local configurations",
      universe: local.length,
      overlapping: true,
      link: "memory",
      rows: MEMORY_PAGES.map((p) => ({ key: p.slug, label: memoryLabel(p), count: memoryPageResults(catalog.finder, p).fits.length })),
    }),
  );

  /* ---- Policy ---- */
  const docs = catalog.policy;
  tables.push(
    table({
      id: "policy-types",
      section: "policy",
      title: "Policy tracker documents by type",
      caption: `The ${nf(docs.length)} U.S. federal AI policy documents in the tracker, by document type.`,
      counted: "Each published document in the policy tracker, by its document type as recorded from the official text. Types with no document are shown as zero. Rows add up to the total.",
      unit: "policy documents",
      universe: docs.length,
      overlapping: false,
      rows: fixedRows(POLICY_TYPES, tally(docs, (d) => d.document_type), (k) => POLICY_TYPE_LABELS[k as PolicyDocumentType]),
    }),
    table({
      id: "policy-status",
      section: "policy",
      title: "Policy tracker documents by status",
      caption: "Tracked documents by their status at their last review.",
      counted:
        "Status as recorded from official sources when the document was last reviewed: in effect, final, revoked, superseded, rescinded, draft, or status not stated. A revoked or superseded document stays in the tracker with that status. Rows add up to the total.",
      unit: "policy documents",
      universe: docs.length,
      overlapping: false,
      rows: fixedRows(POLICY_STATUSES, tally(docs, (d) => d.status), (k) => POLICY_STATUS_LABELS[k as PolicyStatus]),
    }),
  );

  /* ---- Totals ---- */
  const counts = catalog.counts();
  const totals: ReportTotal[] = [
    { key: "organizations", label: "Organization records", value: N, section: "organizations" },
    { key: "organization_units", label: "of which units of another organization", value: units, section: "organizations" },
    {
      key: "headquarters_states",
      label: "U.S. states named in headquarters labels (Washington, D.C. not included)",
      value: stateRows.filter((r) => r.key !== "DC").length,
      section: "organizations",
    },
    { key: "artifacts", label: "Open Models & Tools records", value: artifacts.length, section: "artifacts" },
    { key: "model_families", label: "Model families", value: counts.modelFamilies, section: "artifacts" },
    { key: "model_releases", label: "Model releases", value: R, section: "artifacts" },
    { key: "open_weight_releases", label: "Open-weight model releases", value: openWeight.length, section: "artifacts" },
    { key: "software", label: "Software records", value: software.length, section: "artifacts" },
    { key: "datasets", label: "Datasets", value: counts.datasets, section: "artifacts" },
    { key: "evals", label: "Evaluation tools", value: counts.evals, section: "artifacts" },
    { key: "finder_configurations", label: "Documented configurations", value: catalog.finder.length, section: "local" },
    { key: "local_configurations", label: "Local configurations", value: local.length, section: "local" },
    { key: "local_with_memory_figure", label: "Local configurations with a publisher memory figure", value: local.filter((c) => c.memory).length, section: "local" },
    { key: "policy_documents", label: "Policy documents tracked", value: docs.length, section: "policy" },
  ];

  /* ---- Headline findings (each a computed number with its definition) ---- */
  const findings: ReportFinding[] = [];
  const top = stateRows[0];
  if (top) {
    const dc = stateCounts.has("DC");
    const named = stateRows.filter((r) => r.key !== "DC").length;
    findings.push({
      id: "headquarters",
      table: "org-hq-state",
      text: `Of ${nf(N)} organization records, ${nf(top.count)} (${percent(top.count, N)}) have a documented headquarters in ${top.label}; headquarters labels name ${nf(named)} ${named === 1 ? "state" : "states"}${dc ? " and Washington, D.C." : ""} in all.`,
      definition: "Organization records: published records in Companies & Labs, research units included. The state is read only from each record's sourced headquarters label.",
    });
  }
  const weights = tally(releases, (a) => checklistStatus(a, "weights"));
  const gated = weights.get("partial") ?? 0;
  const notPublic = weights.get("not_public") ?? 0;
  findings.push({
    id: "open-weights",
    table: "model-tiers",
    text: `${nf(openWeight.length)} of ${nf(R)} model releases (${percent(openWeight.length, R)}) have weights the public can download; ${nf(gated)} ${gated === 1 ? "is" : "are"} gated, and ${notPublic === 0 ? "none is" : `${nf(notPublic)} ${notPublic === 1 ? "is" : "are"}`} recorded as not public.`,
    definition: `Model releases: one record per assessed release. Weights the public can download: the open-weight tier or a higher one under ${RUBRIC_LABEL}; license terms may still restrict use.`,
  });
  const fam = tally(releases, (a) => releaseLicenseFamily(catalog, a));
  const famN = (f: LicenseFamily) => fam.get(f) ?? 0;
  findings.push({
    id: "license-families",
    table: "model-license-family",
    text: `${nf(famN("permissive"))} of ${nf(R)} model releases (${percent(famN("permissive"), R)}) license their weights under a standard permissive license such as Apache-2.0 or MIT; ${nf(famN("custom"))} (${percent(famN("custom"), R)}) use a custom license and ${nf(famN("non-commercial"))} (${percent(famN("non-commercial"), R)}) carry non-commercial terms.`,
    definition: "License family of the license that applies to each release's weights; a release with several weights licenses counts in its most restrictive family. Non-commercial is counted only where the license's guide, SPDX identifier, or name says so.",
  });
  const withFigure = local.filter((c) => c.memory);
  const figures = withFigure.map((c) => c.memory!.gpu_gb ?? c.memory!.system_gb!).sort((a, b) => a - b);
  findings.push({
    id: "local-ai",
    table: "local-memory",
    text:
      `${nf(local.length)} of ${nf(catalog.finder.length)} documented configurations run on your own computer; ` +
      (withFigure.length
        ? `${nf(withFigure.length)} of those state a publisher memory figure, from ${figures[0]} GB to ${figures[figures.length - 1]} GB.`
        : "none of those states a publisher memory figure yet."),
    definition: "Configurations: the finder's documented combinations of model, runtime, app, or service. Memory figure: the publisher's own statement for the named variant, not a USASI test.",
  });
  return {
    totals,
    tables,
    findings,
    records: {
      organizations: orgs.map((o) => o.slug).sort(),
      artifacts: artifacts.map((a) => a.slug).sort(),
      finder: catalog.finder.map((c) => c.slug).sort(),
      policy: docs
        .map((d) => ({ slug: d.slug, name: policyShortName(d), type: d.document_type, status: d.status, date: d.date }))
        .sort((a, b) => a.slug.localeCompare(b.slug)),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Snapshots, comparisons, and downloads                               */
/* ------------------------------------------------------------------ */

export function createSnapshot({
  catalog,
  edition,
  generatedAt,
  inputs,
}: {
  catalog: Catalog;
  edition: string;
  generatedAt: string;
  inputs: ReportInputs;
}): ReportSnapshot {
  if (!isEdition(edition)) throw new Error(`Edition must be YYYY-MM, got "${edition}"`);
  const date = generatedAt.slice(0, 10);
  if (!date.startsWith(edition)) throw new Error(`Edition ${edition} must be generated in its own month (generated ${date})`);
  return {
    report: REPORT_NAME,
    format_version: REPORT_FORMAT_VERSION,
    method_version: REPORT_METHOD_VERSION,
    edition,
    title: editionTitle(edition),
    published: date,
    data_cutoff: date,
    generated_at: generatedAt,
    jobs_checked_at: null,
    inputs,
    license: { ...REPORT_LICENSE },
    notice: REPORT_NOTICE,
    ...computeFigures(catalog, date),
  };
}

export type FigureChange = { key: string; label: string; from: number; to: number };

/**
 * Catalog figures that differ between an edition and a later computation
 * (another edition, or the live catalog). Jobs are left out: they change daily
 * and each edition freezes its own.
 */
export function compareFigures(before: Pick<ReportFigures, "totals" | "records" | "tables">, after: Pick<ReportFigures, "totals" | "records" | "tables">) {
  const now = new Map(after.totals.map((t) => [t.key, t]));
  const rowsOf = (t: ReportTable) => JSON.stringify([t.universe, t.rows.map((r) => [r.key, r.count])]);
  const later = new Map(after.tables.map((t) => [t.id, t]));
  const tables = before.tables
    .filter((t) => t.section !== "jobs" && later.has(t.id) && rowsOf(later.get(t.id)!) !== rowsOf(t))
    .map((t) => ({ id: t.id, title: t.title }));
  const totals: FigureChange[] = before.totals
    .filter((t) => t.section !== "jobs" && now.has(t.key) && now.get(t.key)!.value !== t.value)
    .map((t) => ({ key: t.key, label: t.label, from: t.value, to: now.get(t.key)!.value }));
  const diff = (a: string[], b: string[]) => ({ added: b.filter((x) => !a.includes(x)), removed: a.filter((x) => !b.includes(x)) });
  return {
    totals,
    tables,
    organizations: diff(before.records.organizations, after.records.organizations),
    artifacts: diff(before.records.artifacts, after.records.artifacts),
    finder: diff(before.records.finder, after.records.finder),
    policy: diff(
      before.records.policy.map((p) => p.slug),
      after.records.policy.map((p) => p.slug),
    ),
  };
}
export type FigureComparison = ReturnType<typeof compareFigures>;
export const hasChanges = (c: FigureComparison) =>
  c.totals.length > 0 || c.tables.length > 0 || [c.organizations, c.artifacts, c.finder, c.policy].some((d) => d.added.length > 0 || d.removed.length > 0);

const csvCell = (v: string | number | boolean) => {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const CSV_COLUMNS = ["edition", "section", "table_id", "table_title", "unit", "universe", "rows_overlap", "row_key", "row_label", "count", "share"] as const;

/** The edition's figures as one tidy CSV table: totals first, then one line per table row. */
export function snapshotCsv(s: ReportSnapshot): string {
  const lines: (string | number | boolean)[][] = [[...CSV_COLUMNS]];
  for (const t of s.totals) lines.push([s.edition, t.section, "totals", "Totals", "", "", false, t.key, t.label, t.value, ""]);
  for (const t of s.tables) {
    for (const r of t.rows) {
      lines.push([s.edition, t.section, t.id, t.title, t.unit, t.universe, t.overlapping, r.key, r.label, r.count, t.universe ? (r.count / t.universe).toFixed(4) : ""]);
    }
  }
  return lines.map((l) => l.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/** Rules every edition must satisfy; returns a list of problems (empty when consistent). */
export function snapshotProblems(s: ReportSnapshot): string[] {
  const problems: string[] = [];
  if (!isEdition(s.edition)) problems.push(`bad edition id ${s.edition}`);
  if (s.title !== editionTitle(s.edition)) problems.push("title does not match the edition");
  const ids = new Set<string>();
  for (const t of s.tables) {
    if (ids.has(t.id)) problems.push(`duplicate table ${t.id}`);
    ids.add(t.id);
    const keys = new Set(t.rows.map((r) => r.key));
    if (keys.size !== t.rows.length) problems.push(`${t.id}: duplicate row keys`);
    const sum = t.rows.reduce((n, r) => n + r.count, 0);
    if (!t.overlapping && sum !== t.universe) problems.push(`${t.id}: rows add up to ${sum}, not ${t.universe}`);
    if (t.rows.some((r) => r.count < 0 || r.count > t.universe || !Number.isInteger(r.count))) problems.push(`${t.id}: a row count is outside 0..${t.universe}`);
    if (t.overlapping && t.universe > 0 && sum < Math.max(0, ...t.rows.map((r) => r.count))) problems.push(`${t.id}: inconsistent overlapping rows`);
  }
  for (const f of s.findings) if (!ids.has(f.table)) problems.push(`finding ${f.id} names a missing table ${f.table}`);
  const total = (k: string) => s.totals.find((t) => t.key === k)?.value;
  const universe = (id: string) => s.tables.find((t) => t.id === id)?.universe;
  const expect = (label: string, a: number | undefined, b: number | undefined) => {
    if (a !== b) problems.push(`${label}: ${a} ≠ ${b}`);
  };
  expect("organizations total vs. ownership table", total("organizations"), universe("org-ownership"));
  expect("organizations total vs. record list", total("organizations"), s.records.organizations.length);
  expect("artifacts total vs. kinds table", total("artifacts"), universe("artifact-kinds"));
  expect("artifacts total vs. record list", total("artifacts"), s.records.artifacts.length);
  expect("model releases total vs. tier table", total("model_releases"), universe("model-tiers"));
  expect("open-weight total vs. organizations table", total("open_weight_releases"), universe("open-weight-organizations"));
  expect("configurations total vs. record list", total("finder_configurations"), s.records.finder.length);
  expect("local configurations vs. memory table", total("local_configurations"), universe("local-memory"));
  expect("policy total vs. record list", total("policy_documents"), s.records.policy.length);
  const tiers = s.tables.find((t) => t.id === "model-tiers");
  if (tiers) {
    const open = tiers.rows.filter((r) => OPEN_TIERS.includes(r.key as ModelTier)).reduce((n, r) => n + r.count, 0);
    expect("open-weight total vs. open tiers", total("open_weight_releases"), open);
  }
  if (total("job_listings") !== undefined) {
    expect("job listings vs. geography table", total("job_listings"), universe("jobs-geography"));
    const remote = s.tables.find((t) => t.id === "jobs-remote");
    expect("remote listings vs. remote table", total("job_listings_remote"), remote && remote.universe - (remote.rows.find((r) => r.key === "not-remote")?.count ?? 0));
  }
  const memory = s.tables.find((t) => t.id === "local-memory");
  if (memory) expect("memory figures vs. memory table", total("local_with_memory_figure"), memory.universe - (memory.rows.find((r) => r.key === "none")?.count ?? 0));
  return problems;
}
