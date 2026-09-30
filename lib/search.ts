/**
 * Search, filtering, sorting, and URL state for both directories.
 *
 * Client-safe and pure. The same predicates power the directory pages, the
 * homepage search, and the /matrix cell links, so a matrix count and the
 * filtered directory view it links to can never disagree.
 */
import type { EntryType } from "./labels";
import { CHECKLISTS, TIER_FILTERS, tierSatisfies, type ModelTier, type TierFilter } from "./openness";
import {
  ARTIFACT_KINDS,
  AVAILABILITY_STATUSES,
  ORGANIZATION_ROLES,
  OWNERSHIP_CATEGORIES,
  RECORD_LEVELS,
  SECTORS,
} from "./enums";
import type {
  ArtifactKind,
  AvailabilityStatus,
  OrganizationRole,
  OwnershipCategory,
  ParentRelationship,
  RecordLevel,
  Sector,
} from "./schema";

/* ------------------------------------------------------------------ */
/* Serializable list items                                             */
/* ------------------------------------------------------------------ */

export interface OrgListItem {
  slug: string;
  name: string;
  logoText: string;
  summary: string;
  roles: OrganizationRole[];
  sectors: Sector[];
  ownership: OwnershipCategory;
  legalName: string | null;
  headquarters: string | null;
  parent: { slug: string; name: string | null; relationship: ParentRelationship | null } | null;
  artifactCount: number;
  hostedModelProductCount: number;
  productNames: string[];
  lastReviewed: string;
}

export interface ArtifactListItem {
  slug: string;
  name: string;
  kind: ArtifactKind;
  level: RecordLevel;
  entryType: EntryType;
  familySlug: string | null;
  familyName: string | null;
  version: string | null;
  summary: string;
  maintainers: string[];
  organizations: Array<{ slug: string; name: string }>;
  availability: AvailabilityStatus;
  licenses: Array<{ key: string; label: string; appliesTo: string }>;
  tier: ModelTier | null;
  checks: Record<string, string>;
  tags: string[];
  releasedAt: string | null;
  lastReviewed: string;
  releaseCount: number;
}

export interface SearchEntry {
  type: EntryType;
  slug: string;
  href: string;
  name: string;
  summary: string;
  keywords: string;
}

/* ------------------------------------------------------------------ */
/* Text matching                                                       */
/* ------------------------------------------------------------------ */

export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.+#]+/g, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  return normalize(query).split(" ").filter(Boolean).slice(0, 12);
}

function matchesTokens(haystack: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const text = ` ${normalize(haystack)} `;
  return tokens.every((t) => text.includes(t));
}

/** Relevance score for the cross-directory search. 0 means no match. */
export function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const name = normalize(entry.name);
  const all = ` ${name} ${normalize(entry.summary)} ${normalize(entry.keywords)} `;
  if (!tokens.every((t) => all.includes(t))) return 0;
  const phrase = tokens.join(" ");
  let score = 1;
  if (name === phrase) score += 100;
  else if (name.startsWith(phrase)) score += 60;
  else if (name.includes(phrase)) score += 40;
  for (const t of tokens) {
    if (name.split(" ").some((w) => w.startsWith(t))) score += 10;
    if (normalize(entry.keywords).includes(t)) score += 3;
  }
  if (entry.type === "organization" || entry.type === "model-family") score += 1;
  return score;
}

export function searchEntries(entries: SearchEntry[], query: string, limit = 12): SearchEntry[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((r) => r.entry);
}

/* ------------------------------------------------------------------ */
/* Organization filters                                                */
/* ------------------------------------------------------------------ */

export const ORG_SORTS = ["name", "reviewed"] as const;
export type OrgSort = (typeof ORG_SORTS)[number];

export interface OrgFilters {
  q: string;
  sector: Sector | "";
  role: OrganizationRole | "";
  ownership: OwnershipCategory | "";
  structure: "" | "independent" | "unit";
  open: boolean;
  sort: OrgSort;
}

export const DEFAULT_ORG_FILTERS: OrgFilters = {
  q: "",
  sector: "",
  role: "",
  ownership: "",
  structure: "",
  open: false,
  sort: "name",
};

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | "" {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

export function parseOrgFilters(params: URLSearchParams): OrgFilters {
  return {
    q: (params.get("q") ?? "").slice(0, 100),
    sector: pick(params.get("sector"), SECTORS),
    role: pick(params.get("role"), ORGANIZATION_ROLES),
    ownership: pick(params.get("ownership"), OWNERSHIP_CATEGORIES),
    structure: pick(params.get("structure"), ["independent", "unit"] as const),
    open: params.get("open") === "1",
    sort: pick(params.get("sort"), ORG_SORTS) || "name",
  };
}

export function serializeOrgFilters(f: Partial<OrgFilters>): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.sector) p.set("sector", f.sector);
  if (f.role) p.set("role", f.role);
  if (f.ownership) p.set("ownership", f.ownership);
  if (f.structure) p.set("structure", f.structure);
  if (f.open) p.set("open", "1");
  if (f.sort && f.sort !== "name") p.set("sort", f.sort);
  return p.toString();
}

export function orgMatches(item: OrgListItem, f: OrgFilters): boolean {
  if (f.sector && !item.sectors.includes(f.sector)) return false;
  if (f.role && !item.roles.includes(f.role)) return false;
  if (f.ownership && item.ownership !== f.ownership) return false;
  if (f.structure === "independent" && item.parent) return false;
  if (f.structure === "unit" && !item.parent) return false;
  if (f.open && item.artifactCount === 0) return false;
  const haystack = [item.name, item.legalName, item.summary, item.headquarters, item.parent?.name, ...item.roles, ...item.sectors, ...item.productNames]
    .filter(Boolean)
    .join(" ");
  return matchesTokens(haystack, tokenize(f.q));
}

export function sortOrganizations(items: OrgListItem[], sort: OrgSort): OrgListItem[] {
  const copy = [...items];
  copy.sort((a, b) =>
    sort === "reviewed"
      ? b.lastReviewed.localeCompare(a.lastReviewed) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );
  return copy;
}

export function filterOrganizations(items: OrgListItem[], f: OrgFilters): OrgListItem[] {
  return sortOrganizations(items.filter((i) => orgMatches(i, f)), f.sort);
}

/* ------------------------------------------------------------------ */
/* Artifact filters                                                    */
/* ------------------------------------------------------------------ */

export const ARTIFACT_SORTS = ["name", "reviewed", "released"] as const;
export type ArtifactSort = (typeof ARTIFACT_SORTS)[number];

export const CHECK_MODES = ["public", "documented", "unknown"] as const;
export type CheckMode = (typeof CHECK_MODES)[number];

export interface ArtifactFilters {
  q: string;
  kind: ArtifactKind | "";
  level: RecordLevel | "";
  availability: AvailabilityStatus | "";
  license: string;
  tier: TierFilter | "";
  org: string;
  /** `<checklist key>:<public|documented|unknown>`; documented = public or partial. */
  check: string;
  sort: ArtifactSort;
}

export const DEFAULT_ARTIFACT_FILTERS: ArtifactFilters = {
  q: "",
  kind: "",
  level: "",
  availability: "",
  license: "",
  tier: "",
  org: "",
  check: "",
  sort: "name",
};

const ALL_CHECK_KEYS = new Set(Object.values(CHECKLISTS).flatMap((list) => list.map((d) => d.key)));

function parseCheck(value: string | null): string {
  if (!value) return "";
  const [key, mode] = value.split(":");
  return ALL_CHECK_KEYS.has(key) && (CHECK_MODES as readonly string[]).includes(mode) ? `${key}:${mode}` : "";
}

export function parseArtifactFilters(params: URLSearchParams): ArtifactFilters {
  return {
    q: (params.get("q") ?? "").slice(0, 100),
    kind: pick(params.get("kind"), ARTIFACT_KINDS),
    level: pick(params.get("level"), RECORD_LEVELS),
    availability: pick(params.get("availability"), AVAILABILITY_STATUSES),
    license: (params.get("license") ?? "").slice(0, 80),
    tier: pick(params.get("tier"), TIER_FILTERS),
    org: /^[a-z0-9-]{1,80}$/.test(params.get("org") ?? "") ? params.get("org")! : "",
    check: parseCheck(params.get("check")),
    sort: pick(params.get("sort"), ARTIFACT_SORTS) || "name",
  };
}

export function serializeArtifactFilters(f: Partial<ArtifactFilters>): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.kind) p.set("kind", f.kind);
  if (f.level) p.set("level", f.level);
  if (f.availability) p.set("availability", f.availability);
  if (f.license) p.set("license", f.license);
  if (f.tier) p.set("tier", f.tier);
  if (f.org) p.set("org", f.org);
  if (f.check) p.set("check", f.check);
  if (f.sort && f.sort !== "name") p.set("sort", f.sort);
  return p.toString();
}

export function artifactMatches(item: ArtifactListItem, f: ArtifactFilters): boolean {
  if (f.kind && item.kind !== f.kind) return false;
  if (f.level && item.level !== f.level) return false;
  if (f.availability && item.availability !== f.availability) return false;
  if (f.license && !item.licenses.some((l) => l.key === f.license)) return false;
  if (f.tier && !tierSatisfies(item.tier, f.tier)) return false;
  if (f.org && !item.organizations.some((o) => o.slug === f.org)) return false;
  if (f.check) {
    const [key, mode] = f.check.split(":");
    if (item.level === "family") return false;
    const status = item.checks[key];
    if (status === undefined) return false; // item does not apply to this kind
    if (mode === "public" && status !== "public") return false;
    if (mode === "documented" && status !== "public" && status !== "partial") return false;
    if (mode === "unknown" && status !== "unknown") return false;
  }
  const haystack = [
    item.name,
    item.version,
    item.summary,
    item.familyName,
    item.kind,
    ...item.maintainers,
    ...item.organizations.map((o) => o.name),
    ...item.licenses.map((l) => l.label),
    ...item.tags,
  ]
    .filter(Boolean)
    .join(" ");
  return matchesTokens(haystack, tokenize(f.q));
}

export function sortArtifacts(items: ArtifactListItem[], sort: ArtifactSort): ArtifactListItem[] {
  const copy = [...items];
  const byName = (a: ArtifactListItem, b: ArtifactListItem) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  copy.sort((a, b) => {
    if (sort === "reviewed") return b.lastReviewed.localeCompare(a.lastReviewed) || byName(a, b);
    if (sort === "released") {
      if (a.releasedAt && b.releasedAt) return b.releasedAt.localeCompare(a.releasedAt) || byName(a, b);
      if (a.releasedAt) return -1;
      if (b.releasedAt) return 1;
      return byName(a, b);
    }
    return byName(a, b);
  });
  return copy;
}

export function filterArtifacts(items: ArtifactListItem[], f: ArtifactFilters): ArtifactListItem[] {
  return sortArtifacts(items.filter((i) => artifactMatches(i, f)), f.sort);
}

export function activeFilterCount(f: ArtifactFilters | OrgFilters): number {
  return Object.entries(f).filter(([key, value]) => key !== "sort" && value !== "" && value !== false).length;
}
