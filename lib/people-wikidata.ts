/**
 * Checked-in Wikidata / Commons enrichment for People profiles.
 *
 * The build reads data/people/wikidata.json only. scripts/match-wikidata.ts
 * talks to Wikidata and Commons and writes that file. A wrong person is worse
 * than no link: matches need a name agreement plus one corroborating fact.
 */
import fs from "node:fs";
import path from "node:path";
import type { Person } from "./schema";
import { z } from "./zod";

export const PEOPLE_WIKIDATA_PATH = path.join(process.cwd(), "data/people/wikidata.json");

const httpsUrl = z
  .string()
  .url()
  .refine((v) => v.startsWith("https://"), "Expected an https URL");

export const PersonSchoolLink = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(2),
    kind: z.enum(["education", "affiliation"]),
    evidence: z.enum(["bio", "affiliation", "wikidata-p69"]),
  })
  .strict();
export type PersonSchoolLink = z.infer<typeof PersonSchoolLink>;

export const CommonsImage = z
  .object({
    title: z.string().min(5),
    commons_url: httpsUrl.refine((v) => v.startsWith("https://commons.wikimedia.org/wiki/File:"), "Expected a Commons file page"),
    thumb_url: httpsUrl.refine((v) => v.startsWith("https://upload.wikimedia.org/"), "Expected a Commons thumbnail"),
    license: z.string().min(2).max(80),
    license_url: httpsUrl.nullable(),
    author: z.string().min(1).max(200),
  })
  .strict();
export type CommonsImage = z.infer<typeof CommonsImage>;

export const PersonWikidataMatch = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    qid: z.string().regex(/^Q[1-9][0-9]*$/).nullable(),
    label: z.string().min(1).nullable(),
    wikipedia: httpsUrl
      .refine((v) => v.startsWith("https://en.wikipedia.org/wiki/"), "Expected an English Wikipedia article")
      .nullable(),
    match_reasons: z.array(z.string().min(1)).max(12),
    image: CommonsImage.nullable(),
    schools: z.array(PersonSchoolLink).max(8),
  })
  .strict();
export type PersonWikidataMatch = z.infer<typeof PersonWikidataMatch>;

export const WikidataSkip = z
  .object({
    slug: z.string(),
    reason: z.enum(["ambiguous", "unmatched"]),
    detail: z.string().min(1).max(400),
    candidates: z.array(z.object({ qid: z.string(), label: z.string(), notes: z.array(z.string()) }).strict()).max(8),
  })
  .strict();
export type WikidataSkip = z.infer<typeof WikidataSkip>;

export const PeopleWikidataDataset = z
  .object({
    generated_at: z.string().min(10),
    source: z.literal("https://www.wikidata.org/"),
    people_count: z.number().int().nonnegative(),
    matched: z.number().int().nonnegative(),
    photos: z.number().int().nonnegative(),
    ambiguous: z.number().int().nonnegative(),
    unmatched: z.number().int().nonnegative(),
    people: z.array(PersonWikidataMatch),
    skipped: z.array(WikidataSkip),
  })
  .strict();
export type PeopleWikidataDataset = z.infer<typeof PeopleWikidataDataset>;

let cached: PeopleWikidataDataset | undefined;

export function emptyPeopleWikidataDataset(generatedAt = new Date().toISOString()): PeopleWikidataDataset {
  return {
    generated_at: generatedAt,
    source: "https://www.wikidata.org/",
    people_count: 0,
    matched: 0,
    photos: 0,
    ambiguous: 0,
    unmatched: 0,
    people: [],
    skipped: [],
  };
}

export function readPeopleWikidata(file = PEOPLE_WIKIDATA_PATH): PeopleWikidataDataset {
  if (file === PEOPLE_WIKIDATA_PATH && cached) return cached;
  if (!fs.existsSync(file)) return emptyPeopleWikidataDataset();
  const data = PeopleWikidataDataset.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  if (file === PEOPLE_WIKIDATA_PATH) cached = data;
  return data;
}

/** Stable JSON: one person per line so a re-run diffs as added/removed rows. */
export function serializePeopleWikidata(data: PeopleWikidataDataset): string {
  const parsed = PeopleWikidataDataset.parse(data);
  const people = [...parsed.people].sort((a, b) => a.slug.localeCompare(b.slug));
  const skipped = [...parsed.skipped].sort((a, b) => a.slug.localeCompare(b.slug));
  const head = {
    generated_at: parsed.generated_at,
    source: parsed.source,
    people_count: parsed.people_count,
    matched: parsed.matched,
    photos: parsed.photos,
    ambiguous: parsed.ambiguous,
    unmatched: parsed.unmatched,
  };
  const peopleLines = people.map((p) => `    ${JSON.stringify(p)}`);
  const skipLines = skipped.map((p) => `    ${JSON.stringify(p)}`);
  return `${JSON.stringify(head, null, 2).replace(/\n}$/, "")},\n  "people": [\n${peopleLines.join(",\n")}\n  ],\n  "skipped": [\n${skipLines.join(",\n")}\n  ]\n}\n`;
}

export function writePeopleWikidata(data: PeopleWikidataDataset, file = PEOPLE_WIKIDATA_PATH): void {
  PeopleWikidataDataset.parse(data);
  cached = undefined;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, serializePeopleWikidata(data));
  fs.renameSync(`${file}.tmp`, file);
}

export function personEnrichment(slug: string): PersonWikidataMatch | undefined {
  return readPeopleWikidata().people.find((p) => p.slug === slug);
}

export const wikidataUrl = (qid: string) => `https://www.wikidata.org/wiki/${qid}`;
export const commonsFileUrl = (title: string) => {
  const name = title.replace(/^File:/i, "").replace(/ /g, "_");
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name).replace(/%2C/g, ",").replace(/%3A/g, ":")}`;
};

/* ------------------------------------------------------------------ */
/* Matching (pure; the script supplies Wikidata rows)                    */
/* ------------------------------------------------------------------ */

export type PersonFacts = {
  slug: string;
  name: string;
  affiliations: { name: string; role: string }[];
  work: string[];
  github: string | null;
  websites: string[];
  handles: string[];
  schoolNames: string[];
};

export type WikidataCandidate = {
  qid: string;
  label: string;
  aliases: string[];
  instanceOf: string[];
  employers: string[];
  educatedAt: { qid: string; name: string }[];
  occupations: string[];
  fields: string[];
  notableWork: string[];
  github: string | null;
  websites: string[];
  image: string | null;
  wikipedia: string | null;
};

const GENERIC = new Set([
  "university",
  "college",
  "institute",
  "laboratory",
  "laboratories",
  "lab",
  "research",
  "the",
  "of",
  "and",
  "inc",
  "llc",
  "corp",
  "co",
  "ai",
  "group",
  "center",
  "school",
  "department",
]);

export function foldName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return foldName(value).split(/\s+/).filter(Boolean);
}

function significantTokens(value: string): string[] {
  return tokens(value).filter((t) => t.length > 1 && !GENERIC.has(t));
}

/** Given-name + family-name agreement, allowing a dropped or extra middle name. */
export function personNameMatches(personName: string, candidateName: string): boolean {
  const a = tokens(personName);
  const b = tokens(candidateName);
  if (a.length === 0 || b.length === 0) return false;
  if (a.join(" ") === b.join(" ")) return true;
  if (a.length === 1 || b.length === 1) return a[0] === b[0] && a.length === 1 && b.length === 1;
  if (a[0] !== b[0] || a[a.length - 1] !== b[b.length - 1]) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  const extra = a.length >= b.length ? a.slice(1, -1) : b.slice(1, -1);
  const core = a.length >= b.length ? b.slice(1, -1) : a.slice(1, -1);
  return extra.length === 0 || core.every((t) => extra.includes(t)) || extra.every((t) => core.includes(t));
}

export function nameAgrees(person: PersonFacts, candidate: WikidataCandidate): boolean {
  const names = [candidate.label, ...candidate.aliases];
  if (names.some((n) => personNameMatches(person.name, n))) return true;
  if (person.handles.some((h) => names.some((n) => foldName(n) === foldName(h)))) return true;
  return false;
}

const EMPLOYER_ALIASES: Record<string, string[]> = {
  openai: ["openai"],
  google: ["google", "google brain", "google deepmind", "deepmind", "google research"],
  meta: ["meta", "facebook", "fair", "facebook ai research", "meta ai", "meta platforms"],
  microsoft: ["microsoft", "microsoft research"],
  anthropic: ["anthropic"],
  tesla: ["tesla"],
  apple: ["apple"],
  amazon: ["amazon", "amazon web services", "aws", "amazon scholar"],
  nvidia: ["nvidia"],
  "hugging face": ["hugging face", "huggingface"],
  ibm: ["ibm", "ibm research"],
  intel: ["intel"],
  salesforce: ["salesforce", "salesforce research"],
  adobe: ["adobe"],
  databricks: ["databricks"],
  xai: ["xai"],
  "scale ai": ["scale ai"],
  figure: ["figure ai", "figure"],
  physical: ["physical intelligence"],
  thinking: ["thinking machines", "thinking machines lab"],
};

function aliasKeys(name: string): string[] {
  const folded = foldName(name);
  const keys = [folded];
  for (const [canon, aliases] of Object.entries(EMPLOYER_ALIASES)) {
    if (folded === canon || aliases.some((a) => foldName(a) === folded)) keys.push(canon, ...aliases.map(foldName));
  }
  return [...new Set(keys)];
}

export function namesOverlap(a: string, b: string): boolean {
  const fa = foldName(a);
  const fb = foldName(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  const keysA = new Set(aliasKeys(a));
  const keysB = new Set(aliasKeys(b));
  for (const k of keysA) if (keysB.has(k) && k.length >= 3) return true;
  if (fa.length >= 5 && fb.includes(fa)) return true;
  if (fb.length >= 5 && fa.includes(fb)) return true;
  const ta = significantTokens(a);
  const tb = significantTokens(b);
  if (ta.length === 0 || tb.length === 0) return false;
  const shared = ta.filter((t) => tb.includes(t) && t.length >= 4);
  return shared.length > 0 && (shared.length >= Math.min(ta.length, tb.length) || shared.some((t) => t.length >= 6));
}

export function personFactsFrom(person: Person, schoolNames: string[]): PersonFacts {
  const github = person.links.map((l) => githubUsername(l.url)).find((u): u is string => Boolean(u)) ?? null;
  const websites = person.links.map((l) => l.url).filter((u) => !githubUsername(u));
  const handles = /\s/.test(person.name.trim()) ? [] : [person.name.trim()];
  return {
    slug: person.slug,
    name: person.name,
    affiliations: person.affiliations.map((a) => ({ name: a.name, role: a.role })),
    work: person.work.map((w) => w.name),
    github,
    websites,
    handles,
    schoolNames,
  };
}

export function githubUsername(url: string): string | null {
  const m = url.match(/^https:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)(?:\/|$)/i);
  if (!m) return null;
  const skip = new Set(["orgs", "topics", "features", "apps", "marketplace", "sponsors", "collections", "settings", "users", "enterprise"]);
  return skip.has(m[1].toLowerCase()) ? null : m[1];
}

function websiteKey(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const path = u.pathname.replace(/\/+$/, "").toLowerCase();
    if (!host) return null;
    return `${host}${path}`;
  } catch {
    return null;
  }
}

export function corroborations(person: PersonFacts, candidate: WikidataCandidate): string[] {
  const reasons: string[] = [];
  if (person.github && candidate.github && person.github.toLowerCase() === candidate.github.toLowerCase()) {
    reasons.push(`github:${person.github}`);
  }
  const personSites = new Set(person.websites.map(websiteKey).filter((x): x is string => Boolean(x)));
  for (const site of candidate.websites) {
    const key = websiteKey(site);
    if (key && personSites.has(key)) reasons.push(`website:${key}`);
  }
  for (const aff of person.affiliations) {
    if (candidate.employers.some((e) => namesOverlap(aff.name, e))) {
      reasons.push(`employer:${aff.name}`);
      break;
    }
  }
  for (const school of person.schoolNames) {
    if (candidate.educatedAt.some((e) => namesOverlap(school, e.name))) {
      reasons.push(`education:${school}`);
      break;
    }
  }
  for (const work of person.work) {
    const hit = candidate.notableWork.find((w) => namesOverlap(work, w) || foldName(w).includes(foldName(work)) || foldName(work).includes(foldName(w)));
    if (hit && foldName(work).length >= 4 && foldName(hit).length >= 4) {
      reasons.push(`work:${work}`);
      break;
    }
  }
  return [...new Set(reasons)];
}

const HUMAN = "Q5";

export type MatchDecision =
  | { status: "matched"; candidate: WikidataCandidate; reasons: string[] }
  | { status: "ambiguous"; detail: string; candidates: { qid: string; label: string; notes: string[] }[] }
  | { status: "unmatched"; detail: string; candidates: { qid: string; label: string; notes: string[] }[] };

/**
 * High-confidence only: the English name (or a listed alias / handle) must
 * agree, the item must be a human, and at least one fact from the bio must
 * match. Several qualifying humans → skip as ambiguous.
 */
export function decideMatch(person: PersonFacts, raw: WikidataCandidate[]): MatchDecision {
  const unique = [...new Map(raw.map((c) => [c.qid, c])).values()];
  const humans = unique.filter((c) => c.instanceOf.includes(HUMAN) || c.instanceOf.length === 0);
  const named = humans.filter((c) => nameAgrees(person, c) || (person.github && c.github && person.github.toLowerCase() === c.github.toLowerCase()));
  const qualified = named
    .map((c) => ({ candidate: c, reasons: corroborations(person, c) }))
    .filter((x) => x.reasons.length > 0);

  if (qualified.length === 1) {
    const [hit] = qualified;
    return { status: "matched", candidate: hit.candidate, reasons: hit.reasons };
  }
  if (qualified.length > 1) {
    return {
      status: "ambiguous",
      detail: `${qualified.length} Wikidata humans named ${person.name} each match a fact from the profile`,
      candidates: qualified.map((q) => ({ qid: q.candidate.qid, label: q.candidate.label, notes: q.reasons })),
    };
  }
  if (named.length > 1) {
    return {
      status: "ambiguous",
      detail: `${named.length} Wikidata humans share this name and none has a corroborating employer, education, work, or profile link`,
      candidates: named.slice(0, 6).map((c) => ({ qid: c.qid, label: c.label, notes: ["name-only"] })),
    };
  }
  if (named.length === 1) {
    return {
      status: "unmatched",
      detail: `Wikidata ${named[0].qid} matches the name but no employer, education, work, or profile link agrees`,
      candidates: [{ qid: named[0].qid, label: named[0].label, notes: ["name-only"] }],
    };
  }
  return { status: "unmatched", detail: "No Wikidata human with this name", candidates: [] };
}

/* ------------------------------------------------------------------ */
/* Commons licenses                                                     */
/* ------------------------------------------------------------------ */

/** Licenses we will display. Non-free, NC, ND, and unknown stay out. */
const FREE_LICENSE =
  /^(?:cc0(?:\s*1\.0)?|cc[-\s]?by(?:[-\s]?sa)?(?:\s+\d+(?:\.\d+)?)?|public\s*domain|pd(?:[-\s](?:us|old|self|art|author))?|wikimedia|gfdl)$/i;

export function isFreeCommonsLicense(shortName: string | null | undefined): boolean {
  if (!shortName) return false;
  const n = shortName.trim().replace(/_/g, " ");
  if (/fair\s*use|non-?commercial|no[-\s]?deriv|all rights reserved|unknown|unlicensed/i.test(n)) return false;
  if (/^cc[-\s]?by[-\s]?nc/i.test(n) || /^cc[-\s]?by[-\s]?nd/i.test(n)) return false;
  if (FREE_LICENSE.test(n)) return true;
  if (/^cc[-\s]?by(?:[-\s]?sa)?\b/i.test(n)) return true;
  if (/public domain/i.test(n)) return true;
  return false;
}

export function stripAttributionHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ", ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export type CommonsExtMetadata = {
  LicenseShortName?: { value?: string };
  LicenseUrl?: { value?: string };
  Artist?: { value?: string };
  Credit?: { value?: string };
  UsageTerms?: { value?: string };
};

export function commonsImageFromMetadata(
  title: string,
  thumbUrl: string,
  meta: CommonsExtMetadata,
): CommonsImage | null {
  const license = meta.LicenseShortName?.value?.trim();
  if (!isFreeCommonsLicense(license)) return null;
  let url = thumbUrl.split("#")[0];
  try {
    const parsed = new URL(url);
    parsed.search = "";
    url = parsed.toString();
  } catch {
    return null;
  }
  if (!url.startsWith("https://upload.wikimedia.org/")) return null;
  const author = stripAttributionHtml(meta.Artist?.value || meta.Credit?.value || "Wikimedia Commons contributors");
  const licenseUrl = meta.LicenseUrl?.value && meta.LicenseUrl.value.startsWith("https://") ? meta.LicenseUrl.value : null;
  const fileTitle = title.startsWith("File:") ? title : `File:${title}`;
  return {
    title: fileTitle,
    commons_url: `https://commons.wikimedia.org/wiki/${fileTitle.replace(/ /g, "_")}`,
    thumb_url: url,
    license: license!,
    license_url: licenseUrl,
    author: author.slice(0, 200) || "Wikimedia Commons contributors",
  };
}
