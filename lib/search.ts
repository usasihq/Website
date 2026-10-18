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

/**
 * Words that only say how a question is phrased ("how do I ... on my
 * computer"), not what it is about. They are dropped from a query unless
 * nothing else is left, so "what is RAG" looks for "rag" while a lone "about"
 * still finds the About page. Words that carry meaning on this site, such as
 * "run", "ai", "open", "us", "no", "all", "may", and "use", are kept.
 */
const STOP_WORDS = new Set(
  [
    "a an the this that these those some any",
    "what whats which who whom whose how why when where",
    "is are was were be been being am do does did can could should would will",
    "i im ive me my mine we our you your it its they them their he she his her",
    "of in on at to for with from by about into onto as and or but if than then so",
    "there here just really very also please want need",
    "s t d m ll re ve don doesn didn isn aren",
  ]
    .join(" ")
    .split(" "),
);

/** The words a query is matched on: normalized, without stop words, at most 12. */
export function queryTokens(query: string): string[] {
  const all = normalize(query).split(" ").filter(Boolean);
  const meaningful = all.filter((t) => !STOP_WORDS.has(t));
  return (meaningful.length ? meaningful : all).slice(0, 12);
}

/** Letters and digits only, so "Hugging Face", "huggingface", and "hugging-face" compare equal. */
const compact = (text: string) => text.replace(/[^a-z0-9]/g, "");

/** A normalized text with its spaces and punctuation removed, and where each original word started. */
interface CompactText {
  text: string;
  starts: Set<number>;
}

function compactText(normalized: string): CompactText {
  let text = "";
  const starts = new Set<number>();
  for (const word of normalized.split(" ")) {
    const c = compact(word);
    if (!c) continue;
    starts.add(text.length);
    text += c;
  }
  return { text, starts };
}

/**
 * True when a squeezed query word (see `compact`) occurs in the compact text
 * starting at a word boundary: "huggingface" finds "Hugging Face" and "gptoss"
 * finds "gpt-oss". Short words are left to plain matching.
 */
function compactHit(target: CompactText, squeezed: string): boolean {
  if (squeezed.length < 4) return false;
  for (let i = target.text.indexOf(squeezed); i !== -1; i = target.text.indexOf(squeezed, i + 1)) {
    if (target.starts.has(i)) return true;
  }
  return false;
}

/** Plain substring match on the whole text, or a spacing-insensitive match on the labels (names, products, tags). */
function matchesTokens(haystack: string, labels: string, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const text = ` ${normalize(haystack)} `;
  let compactLabels: CompactText | null = null;
  return tokens.every((t) => text.includes(t) || compactHit((compactLabels ??= compactText(normalize(labels))), compact(t)));
}

type Phrase = { plain: string; squeezed: string };

/** The whole query, and the query without stop words, as phrases a name can equal or start with. */
function queryPhrases(query: string): Phrase[] {
  const all = tokenize(query);
  if (all.length === 0) return [];
  return [...new Set([all.join(" "), queryTokens(query).join(" ")])].map((plain) => ({ plain, squeezed: compact(plain) }));
}

/** 2 when the normalized name equals a phrase (ignoring spacing), 1 when it starts with one, else 0. */
function phraseRelevance(name: string, squeezedName: string, phrases: Phrase[]): number {
  let relevance = 0;
  for (const { plain, squeezed } of phrases) {
    if (name === plain || (squeezed && squeezedName === squeezed)) return 2;
    if (name.startsWith(plain) || (squeezed.length >= 3 && squeezedName.startsWith(squeezed))) relevance = 1;
  }
  return relevance;
}

/** Exact names, then name prefixes; description-only matches come afterwards. */
export function nameRelevance(name: string, query: string): number {
  const normalized = normalize(name);
  return phraseRelevance(normalized, compact(normalized), queryPhrases(query));
}

const byBaseLetters = new Intl.Collator("en", { sensitivity: "base" });
const bySlug = new Intl.Collator("en");

function compareNames(a: { name: string; slug: string }, b: { name: string; slug: string }): number {
  return byBaseLetters.compare(a.name, b.name) || bySlug.compare(a.slug, b.slug);
}

/* ------------------------------------------------------------------ */
/* Cross-directory search                                              */
/* ------------------------------------------------------------------ */

/** An entry's normalized text, computed once per entry and reused on every keystroke. */
interface PreparedEntry {
  entry: SearchEntry;
  name: string;
  nameWords: string[];
  compactName: CompactText;
  /** Name and keywords without spaces or punctuation. */
  compactLabels: CompactText;
  keywords: string;
  /** ` name summary keywords ` */
  text: string;
  /** Name words (and the whole name squeezed together) that a misspelled query word may stand for. */
  typoTargets: string[];
}

const preparedEntries = new WeakMap<SearchEntry, PreparedEntry>();

function prepare(entry: SearchEntry): PreparedEntry {
  let p = preparedEntries.get(entry);
  if (!p) {
    const name = normalize(entry.name);
    const keywords = normalize(entry.keywords);
    const nameWords = name.split(" ").filter(Boolean);
    const compactName = compactText(name);
    p = {
      entry,
      name,
      nameWords,
      compactName,
      compactLabels: compactText(`${name} ${keywords}`),
      keywords,
      text: ` ${name} ${normalize(entry.summary)} ${keywords} `,
      typoTargets: [...new Set([...nameWords.filter((w) => w.length >= 3), ...(nameWords.length > 1 ? [compactName.text] : [])])],
    };
    preparedEntries.set(entry, p);
  }
  return p;
}

/** The prepared entries plus every distinct typo target, once per index. */
interface Corpus {
  prepared: PreparedEntry[];
  vocabulary: string[];
}

const corpora = new WeakMap<SearchEntry[], Corpus>();

function corpusOf(entries: SearchEntry[]): Corpus {
  let corpus = corpora.get(entries);
  if (!corpus) {
    const prepared = entries.map(prepare);
    corpus = { prepared, vocabulary: [...new Set(prepared.flatMap((p) => p.typoTargets))] };
    corpora.set(entries, corpus);
  }
  return corpus;
}

/** Edit distance counting insertions, deletions, substitutions, and swaps of neighboring letters. */
function editDistance(a: string, b: string): number {
  let before: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, before[j - 2] + 1);
      row.push(d);
    }
    before = prev;
    prev = row;
  }
  return prev[b.length];
}

/**
 * Name words a query word may be a misspelling of: only for words of five or
 * more letters that appear in no name at all ("antropic"), within one edit,
 * or two for words of eight or more letters. Null when the word is not a
 * likely typo. A length check skips most of the vocabulary before any
 * distance is computed.
 */
function typoMatches(corpus: Corpus, token: string): Set<string> | null {
  if (token.length < 5 || !/^[a-z]+$/.test(token)) return null;
  if (corpus.prepared.some((p) => p.name.includes(token) || compactHit(p.compactName, token))) return null;
  const max = token.length >= 8 ? 2 : 1;
  const found = new Set<string>();
  for (const word of corpus.vocabulary) {
    if (Math.abs(word.length - token.length) <= max && editDistance(token, word) <= max) found.add(word);
  }
  return found.size ? found : null;
}

/** A query word as matched against one entry (a misspelling is replaced by the name word it matched). */
type Term = { plain: string; squeezed: string };

/** How a query word matched an entry. */
const NO_HIT = 0;
/** Only inside another word of the description ("run" in "pruned", "rag" in "storage"). */
const INSIDE_WORD = 1;
/** At the start of a word, inside a name ("llama" in "Ollama"), or ignoring spacing ("huggingface"). */
const WORD_HIT = 2;

function exactHit(p: PreparedEntry, { plain, squeezed }: Term): number {
  if (p.text.includes(plain)) {
    const atWordStart = p.text.includes(` ${plain}`) || p.text.includes(`.${plain}`);
    return atWordStart || (plain.length >= 4 && p.name.includes(plain)) ? WORD_HIT : INSIDE_WORD;
  }
  return compactHit(p.compactLabels, squeezed) ? WORD_HIT : NO_HIT;
}

/** Ranking score for an entry from the query words it matched. */
function scorePrepared(p: PreparedEntry, terms: Term[]): number {
  const phrase = terms.map((t) => t.plain).join(" ");
  const squeezed = terms.map((t) => t.squeezed).join("");
  let score = 1;
  if (p.name === phrase || (squeezed && p.compactName.text === squeezed)) score += 100;
  else if (p.name.startsWith(phrase) || (squeezed.length >= 3 && p.compactName.text.startsWith(squeezed))) score += 60;
  else if (` ${p.name}`.includes(` ${phrase}`)) score += 40;
  for (const { plain, squeezed } of terms) {
    if (p.nameWords.some((w) => w.startsWith(plain)) || compactHit(p.compactName, squeezed)) score += 10;
    if (p.nameWords.includes(plain)) score += 2;
    if (p.keywords.includes(plain)) score += 3;
    // A whole word ("rag") rather than part of one ("storage").
    if (p.text.includes(` ${plain} `)) score += 2;
  }
  if (p.entry.type === "organization" || p.entry.type === "model-family") score += 1;
  return score;
}

const termOf = (plain: string): Term => ({ plain, squeezed: compact(plain) });

/** Relevance score for the cross-directory search. 0 means no match. */
export function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const p = prepare(entry);
  const terms = tokens.map(termOf);
  return terms.every((t) => exactHit(p, t) !== NO_HIT) ? scorePrepared(p, terms) : 0;
}

/**
 * Searches every entry for the meaningful words of `query`.
 *
 * Entries that contain every word come first, ranked by exact name, name
 * prefix, then score. A word of five or more letters that appears in no name
 * may match a name word one letter off ("antropic" finds Anthropic); such
 * matches rank below exact ones, and so do words found only inside other
 * words. When no entry contains every word, the entries that contain the most
 * words are returned instead of nothing.
 *
 * With `{ fuzzy: false }` there are no typo matches and no partial fallback:
 * every word must appear, the way the directory pages filter. Counts that
 * link to a directory use this, so the number shown is the number found there.
 */
const secondary = (e: SearchEntry) => (e.type === "github-project" || e.type === "huggingface-item" ? 1 : 0);

export function searchEntries(entries: SearchEntry[], query: string, limit = 12, { fuzzy = true }: { fuzzy?: boolean } = {}): SearchEntry[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  const terms = tokens.map(termOf);
  const phrases = queryPhrases(query);
  const corpus = corpusOf(entries);
  const typos = tokens.map((t) => (fuzzy ? typoMatches(corpus, t) : null));
  type Hit = { p: PreparedEntry; matched: Term[]; fuzzy: number; inside: number; relevance: number; score: number };
  const hits: Hit[] = [];
  let most = 0;
  for (const p of corpus.prepared) {
    const matched: Term[] = [];
    let fuzzy = 0;
    let inside = 0;
    terms.forEach((term, i) => {
      const hit = exactHit(p, term);
      if (hit !== NO_HIT) {
        matched.push(term);
        if (hit === INSIDE_WORD) inside++;
        return;
      }
      const target = typos[i] && p.typoTargets.find((w) => typos[i]!.has(w));
      if (target) {
        matched.push(termOf(target));
        fuzzy++;
      }
    });
    if (matched.length === 0) continue;
    hits.push({ p, matched, fuzzy, inside, relevance: 0, score: 0 });
    most = Math.max(most, matched.length);
  }
  // Every word if any entry has them all; otherwise at least half of them (or the most any entry has).
  const needed = !fuzzy || most === tokens.length ? tokens.length : Math.min(most, Math.ceil(tokens.length / 2));
  const kept = hits.filter((h) => h.matched.length >= needed);
  for (const h of kept) {
    h.relevance = phraseRelevance(h.p.name, h.p.compactName.text, phrases);
    h.score = scorePrepared(h.p, h.matched);
  }
  return kept
    .sort(
      (a, b) =>
        // AI on GitHub's and AI on Hugging Face's third-party projects come after the site's own records and pages.
        secondary(a.p.entry) - secondary(b.p.entry) ||
        b.relevance - a.relevance ||
        b.matched.length - a.matched.length ||
        a.fuzzy - b.fuzzy ||
        a.inside - b.inside ||
        b.score - a.score ||
        compareNames(a.p.entry, b.p.entry),
    )
    .slice(0, limit)
    .map((h) => h.p.entry);
}

/* ------------------------------------------------------------------ */
/* Organization filters                                                */
/* ------------------------------------------------------------------ */

export const ORG_SORTS = ["name", "reviewed", "artifacts"] as const;
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
  const labels = [item.name, item.legalName, item.headquarters, item.parent?.name, ...item.roles, ...item.sectors, ...item.productNames].filter(Boolean).join(" ");
  return matchesTokens(haystack, labels, queryTokens(f.q));
}

export function sortOrganizations(items: OrgListItem[], sort: OrgSort, query = ""): OrgListItem[] {
  const copy = [...items];
  const byName = (a: OrgListItem, b: OrgListItem) => compareNames(a, b);
  copy.sort((a, b) => {
    if (sort === "reviewed") return b.lastReviewed.localeCompare(a.lastReviewed) || byName(a, b);
    if (sort === "artifacts") return b.artifactCount - a.artifactCount || byName(a, b);
    return nameRelevance(b.name, query) - nameRelevance(a.name, query) || byName(a, b);
  });
  return copy;
}

export function filterOrganizations(items: OrgListItem[], f: OrgFilters): OrgListItem[] {
  return sortOrganizations(items.filter((i) => orgMatches(i, f)), f.sort, f.q);
}

/* ------------------------------------------------------------------ */
/* Artifact filters                                                    */
/* ------------------------------------------------------------------ */

export const ARTIFACT_SORTS = ["name", "reviewed", "released"] as const;
export type ArtifactSort = (typeof ARTIFACT_SORTS)[number];

export const CHECK_MODES = ["public", "documented", "unknown"] as const;
export type CheckMode = (typeof CHECK_MODES)[number];

export const LICENSE_COMPONENTS = ["weights", "code", "data", "documentation"] as const;
export type LicenseComponent = (typeof LICENSE_COMPONENTS)[number];

export function licenseCovers(appliesTo: string, component: LicenseComponent | ""): boolean {
  return !component || appliesTo === "all" || appliesTo === component || (appliesTo === "weights-and-code" && (component === "weights" || component === "code"));
}

export function matchedLicenses(item: ArtifactListItem, f: Pick<ArtifactFilters, "license" | "licenseComponent">) {
  return item.licenses.filter(l => (!f.license || l.key === f.license) && licenseCovers(l.appliesTo, f.licenseComponent));
}

export interface ArtifactFilters {
  q: string;
  kind: ArtifactKind | "";
  level: RecordLevel | "";
  availability: AvailabilityStatus | "";
  license: string;
  licenseComponent: LicenseComponent | "";
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
  licenseComponent: "",
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
    licenseComponent: pick(params.get("licenseComponent"), LICENSE_COMPONENTS),
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
  if (f.licenseComponent) p.set("licenseComponent", f.licenseComponent);
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
  if ((f.license || f.licenseComponent) && matchedLicenses(item, f).length === 0) return false;
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
  const labels = [
    item.name,
    item.version,
    item.familyName,
    item.kind,
    ...item.maintainers,
    ...item.organizations.map((o) => o.name),
    ...item.licenses.map((l) => l.label),
    ...item.tags,
  ];
  const haystack = [labels[0], labels[1], item.summary, ...labels.slice(2)].filter(Boolean).join(" ");
  return matchesTokens(haystack, labels.filter(Boolean).join(" "), queryTokens(f.q));
}

export function sortArtifacts(items: ArtifactListItem[], sort: ArtifactSort, query = ""): ArtifactListItem[] {
  const copy = [...items];
  const byName = (a: ArtifactListItem, b: ArtifactListItem) => compareNames(a, b);
  copy.sort((a, b) => {
    if (sort === "reviewed") return b.lastReviewed.localeCompare(a.lastReviewed) || byName(a, b);
    if (sort === "released") {
      if (a.releasedAt && b.releasedAt) return b.releasedAt.localeCompare(a.releasedAt) || byName(a, b);
      if (a.releasedAt) return -1;
      if (b.releasedAt) return 1;
      return byName(a, b);
    }
    return nameRelevance(b.name, query) - nameRelevance(a.name, query) || byName(a, b);
  });
  return copy;
}

export function filterArtifacts(items: ArtifactListItem[], f: ArtifactFilters): ArtifactListItem[] {
  return sortArtifacts(items.filter((i) => artifactMatches(i, f)), f.sort, f.q);
}

export function activeFilterCount(f: ArtifactFilters | OrgFilters): number {
  return Object.entries(f).filter(([key, value]) => key !== "sort" && value !== "" && value !== false).length;
}
