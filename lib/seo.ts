/**
 * Search titles and meta descriptions, built only from catalog fields.
 *
 * Titles name the record and what people search for about it, for example
 * "Llama 3.1 8B: license, openness & downloads". Each builder lists candidate
 * titles from most to least descriptive; the first that fits in TITLE_MAX
 * characters is used, and pageMetadata adds the site suffix only when it still
 * fits. Descriptions lead with the answer and the record's key facts (maker,
 * openness tier, license, release date) and add the summary's opening sentence
 * only when it fits. Nothing here adds a fact the record does not already hold.
 */
import type { Catalog } from "./catalog";
import { formatDate } from "./dates";
import { EXPLAINERS, type Explainer } from "./learn";
import { KIND_LABELS } from "./labels";
import { LICENSE_CATEGORY_LABELS, usesOfLicense } from "./licenses";
import { clipDescription, clipTitle, DESCRIPTION_MAX, TITLE_MAX } from "./metadata";
import { checklistStatus, computeTier, isOsiApproved, type ModelTier } from "./openness";
import type { StateGroup } from "./place-index";
import type { Artifact, Hub, Leader, LicenseCategory, LicenseRecord, Organization, OrganizationRole, Person } from "./schema";

export type SeoText = { title: string; description: string };

const squash = (s: string) => s.replace(/\s+/g, " ").trim();
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export const article = (word: string) => (/^(?:uni|use|eu|one)/i.test(word) ? "a" : /^[aeiou]/i.test(word) ? "an" : "a");

/** The first candidate that fits in `max` characters, or else the shortest one. */
export function fitTitle(candidates: Array<string | false | null | undefined>, max = TITLE_MAX): string {
  const list = [...new Set(candidates.filter((c): c is string => Boolean(c)).map(squash))];
  if (list.length === 0) return "";
  return list.find((c) => c.length <= max) ?? list.reduce((a, b) => (b.length < a.length ? b : a));
}

/** A name without its trailing parenthetical note: "Chai-1 (weights used by chai_lab 0.6.1)" → "Chai-1". */
export function shortName(name: string): string {
  return name.replace(/\s*\([^()]*\)\s*$/, "").trim() || name;
}

/** "A", "A and B", "A, B, and C". */
export function listJoin(items: string[], conjunction = "and"): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

const ABBREVIATION = /^(?:(?:[A-Z]\.)+|Inc\.|Corp\.|Co\.|Ltd\.|Jr\.|Sr\.|Dr\.|Mr\.|Ms\.|St\.|No\.|vs\.|etc\.|approx\.|e\.g\.|i\.e\.)$/;

/** Splits prose into sentences without breaking after "U.S.", "Inc.", or "e.g.". */
export function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  for (const m of text.matchAll(/[.!?]["”’)]?(?=\s+["“‘(]?[A-Z0-9])/g)) {
    const end = (m.index ?? 0) + m[0].length;
    const lastWord = (text.slice(start, end).trim().split(/\s+/).pop() ?? "").replace(/^["“‘(]+/, "");
    if (ABBREVIATION.test(lastWord)) continue;
    out.push(squash(text.slice(start, end)));
    start = end;
  }
  const rest = squash(text.slice(start));
  if (rest) out.push(rest);
  return out;
}

export const firstSentence = (text: string) => sentences(text)[0] ?? squash(text);

/**
 * A description of at most `max` characters: the required parts joined (and
 * clipped at a word boundary if they are too long), then each optional part
 * that still fits, in order.
 */
export function composeDescription(required: Array<string | false | null | undefined>, optional: Array<string | false | null | undefined> = [], max = DESCRIPTION_MAX): string {
  // "Ollama Inc.." → "Ollama Inc.": a sentence that ends in an abbreviation keeps one period.
  const keep = (parts: Array<string | false | null | undefined>) =>
    parts
      .filter((p): p is string => Boolean(p))
      .map((p) => squash(p).replace(/([.!?])\.(?=\s|$)/g, "$1"))
      .filter(Boolean);
  let out = clipDescription(keep(required).join(" "), max);
  for (const part of keep(optional)) {
    const next = out ? `${out} ${part}` : part;
    if (next.length <= max) out = next;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Shared record facts                                                 */
/* ------------------------------------------------------------------ */

/** Organizations behind an artifact (active records first), else its named maintainers. */
export function makersOf(catalog: Catalog, a: Artifact): string[] {
  const orgs = a.organization_slugs.filter((s) => catalog.isActiveOrganization(s)).map((s) => catalog.organization(s)!.name);
  return orgs.length ? orgs : [...new Set(a.maintainers.map((m) => m.name))];
}

const makerPhrase = (makers: string[]) => (makers.length > 2 ? `${makers.slice(0, 2).join(", ")}, and others` : listJoin(makers));

export const licenseLabel = (l: LicenseRecord) => l.spdx ?? l.name;

/** Which license entries cover the component a reader asks about first. */
export const COVERS: Record<"weights" | "code" | "data", LicenseRecord["applies_to"][]> = {
  weights: ["weights", "weights-and-code", "all"],
  code: ["code", "weights-and-code", "all"],
  data: ["data", "all"],
};

const APPLIES_SHORT: Record<LicenseRecord["applies_to"], string> = {
  weights: "weights",
  code: "code",
  data: "data",
  documentation: "docs",
  "weights-and-code": "weights and code",
  all: "",
};

/** License entries with the ones covering `primary` first, one per license and component. */
export function orderedLicenses(a: Artifact, primary: keyof typeof COVERS): LicenseRecord[] {
  const seen = new Set<string>();
  const ordered = [...a.licenses.filter((l) => COVERS[primary].includes(l.applies_to)), ...a.licenses.filter((l) => !COVERS[primary].includes(l.applies_to))];
  return ordered.filter((l) => {
    const key = `${licenseLabel(l)}|${l.applies_to}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** "License: MIT." or "Licenses: OpenMDW … (weights) and Apache-2.0 (code)." */
export function licenseSentence(a: Artifact, primary: keyof typeof COVERS): string {
  const list = orderedLicenses(a, primary);
  if (list.length === 0) return "No license is recorded.";
  const components = new Map<string, string[]>();
  for (const l of list) components.set(licenseLabel(l), [...(components.get(licenseLabel(l)) ?? []), APPLIES_SHORT[l.applies_to]]);
  if (components.size === 1) return `License: ${[...components.keys()][0]}.`;
  const named = [...components].map(([label, parts]) => (parts.every(Boolean) ? `${label} (${listJoin(parts)})` : label));
  return `Licenses: ${listJoin(named)}.`;
}

const released = (a: Artifact) => (a.released_at ? `, released ${formatDate(a.released_at)}` : "");

/** Openness of a model release, phrased from its computed tier. */
export const TIER_PHRASES: Record<ModelTier, { title: "downloads" | "access"; lead: (name: string, from: string) => string }> = {
  "open-weight": { title: "downloads", lead: (n, f) => `${n} is an open-weight model${f}.` },
  "open-stack": { title: "downloads", lead: (n, f) => `${n} is an open-stack model${f}, with public weights, training code, and recipe.` },
  "fully-open": { title: "downloads", lead: (n, f) => `${n} is an open-system model${f}, with weights, code, and data information public.` },
  "restricted-weights": { title: "access", lead: (n, f) => `${n} is a model${f}. Its weights are gated: access by request or approval.` },
  "weights-not-public": { title: "access", lead: (n, f) => `${n} is a model${f}. Its weights are not public.` },
  unknown: { title: "access", lead: (n, f) => `${n} is a model release${f}.` },
};

/* ------------------------------------------------------------------ */
/* Records                                                             */
/* ------------------------------------------------------------------ */

const NAMES_MODELS = /\bmodels?\b/i;
const NAMES_DATA = /\b(?:dataset|data|corpus)\b/i;

export function artifactSeo(catalog: Catalog, a: Artifact): SeoText {
  const name = a.name;
  const short = shortName(name);
  const makers = makersOf(catalog, a);
  const from = makers.length ? ` from ${makerPhrase(makers)}` : "";
  const summary = firstSentence(a.summary.text);

  if (a.kind === "model" && a.record_level === "release") {
    const tier = computeTier(a) ?? "unknown";
    const word = TIER_PHRASES[tier].title;
    const middle = word === "downloads" ? "license, openness & downloads" : "license, access & openness";
    const brief = word === "downloads" ? "license & downloads" : "license & access";
    return {
      title: fitTitle([`${name}: ${middle}`, `${short}: ${middle}`, `${name}: ${brief}`, `${short}: ${brief}`, name, short]),
      description: composeDescription([TIER_PHRASES[tier].lead(name, `${from}${released(a)}`), licenseSentence(a, "weights")], [summary]),
    };
  }

  if (a.kind === "model") {
    const releases = catalog.releasesOf(a.slug);
    const models = NAMES_MODELS.test(name) ? name : `${name} models`;
    const shortModels = NAMES_MODELS.test(short) ? short : `${short} models`;
    const names = releases.map((r) => r.name);
    const releaseList = names.length > 3 ? `${names.slice(0, 3).join(", ")}, and ${names.length - 3} more` : listJoin(names);
    const licenses = [...new Set(releases.flatMap((r) => orderedLicenses(r, "weights").filter((l) => COVERS.weights.includes(l.applies_to)).map(licenseLabel)))];
    return {
      title: fitTitle([
        `${models}: releases, licenses & openness`,
        `${shortModels}: releases, licenses & openness`,
        `${models}: releases & licenses`,
        `${shortModels}: releases & licenses`,
        name,
        short,
      ]),
      description: composeDescription(
        [`${name} is a model family${from}.`, releases.length ? `USASI assesses ${plural(releases.length, "release")}: ${releaseList}.` : "No release in it has been assessed yet."],
        [licenses.length ? `Weights licenses: ${listJoin(licenses.slice(0, 3))}.` : null, summary],
      ),
    };
  }

  // Projects: software, datasets, evaluation tools.
  const kindNoun = a.kind === "eval" ? "evaluation tool" : KIND_LABELS[a.kind].toLowerCase();
  const primary = a.kind === "dataset" ? "data" : "code";
  const codeKey = a.kind === "eval" ? "code" : "source_code";
  const codePublic = a.kind !== "dataset" && checklistStatus(a, codeKey) === "public";
  const access = a.kind === "dataset" ? checklistStatus(a, "access") : null;

  let title: string;
  if (a.kind === "dataset") {
    const subject = NAMES_DATA.test(name) ? name : `${name} dataset`;
    const shortSubject = NAMES_DATA.test(short) ? short : `${short} dataset`;
    title = fitTitle([`${subject}: license & access`, `${shortSubject}: license & access`, `${name}: license & access`, `${short}: license & access`, name, short]);
  } else if (codePublic) {
    title = fitTitle([`${name}: license, openness & source code`, `${short}: license, openness & source code`, `${name}: license & source code`, `${short}: license & source code`, name, short]);
  } else {
    title = fitTitle([`${name}: license, access & openness`, `${short}: license, access & openness`, `${name}: license & access`, `${short}: license & access`, name, short]);
  }

  const lead = `${name} is ${article(kindNoun)} ${kindNoun}${from}${released(a)}.`;
  const facts = [
    licenseSentence(a, primary),
    codePublic ? (a.kind === "eval" ? "Its code is public." : "Its source code is public.") : null,
    access === "public" ? "The data is publicly available." : access === "partial" ? "Access to the data is partial or restricted." : null,
  ].filter((x): x is string => Boolean(x));
  // The project's own summary usually says best what it is; lead with it when the facts still fit.
  const maker = makers.length && !summary.includes(shortName(makers[0])) ? `From ${makerPhrase(makers)}.` : null;
  const summaryFirst = [summary, maker, ...facts].filter(Boolean).join(" ");
  const description = summaryFirst.length <= DESCRIPTION_MAX ? summaryFirst : composeDescription([lead, ...facts], [summary]);
  return { title, description };
}

/** Organization roles as nouns, for "X is a chip designer and hardware maker". */
const ROLE_NOUNS: Record<OrganizationRole, string> = {
  "model-developer": "AI model developer",
  "research-lab": "research lab",
  "cloud-provider": "cloud provider",
  "compute-infrastructure": "compute infrastructure provider",
  "chip-designer": "chip designer",
  "hardware-manufacturer": "hardware maker",
  "inference-provider": "inference provider",
  "data-platform": "data platform company",
  "enterprise-software": "enterprise software company",
  "developer-platform": "developer platform company",
  "consumer-products": "consumer products company",
  robotics: "robotics company",
  "open-source-steward": "open-source steward",
  "nonprofit-research": "nonprofit research organization",
  "data-services": "data services organization",
  // Every record with this role is a university; the role marks its research labs.
  "university-lab": "university",
  "standards-body": "standards body",
};

/** "an AI model developer and research lab", from the first two documented roles. */
export function roleDescription(org: Organization): string {
  const roles = org.organization_roles.includes("university-lab") ? org.organization_roles.filter((r) => r !== "research-lab") : org.organization_roles;
  const [a, b] = roles.slice(0, 2).map((r) => ROLE_NOUNS[r]);
  if (!a) return "an organization";
  if (!b) return `${article(a)} ${a}`;
  const lastA = a.split(" ").pop();
  const phrase = lastA === b.split(" ").pop() && a.includes(" ") ? `${a.slice(0, a.lastIndexOf(" "))} and ${b}` : `${a} and ${b}`;
  return `${article(phrase)} ${phrase}`;
}

/** "headquartered in Seattle, Washington", or "based in …" when the label carries a note about the address. */
export function headquartersPhrase(label: string): { verb: "headquartered in" | "based in"; place: string } {
  const [main, note] = label.split(/\s*\(/);
  const place = main.trim() === "United States" ? "the United States" : main.trim();
  return { verb: note ? "based in" : "headquartered in", place };
}

/** What an organization publishes openly in this catalog, by kind, for titles and lead sentences. */
export function organizationOutput(catalog: Catalog, org: Organization) {
  const related = catalog.artifactsForOrganization(org.slug);
  const releases = related.filter((a) => a.kind === "model" && a.record_level === "release");
  const families = related.filter((a) => a.kind === "model" && a.record_level === "family");
  const software = related.filter((a) => ["framework", "runtime", "research-stack"].includes(a.kind));
  const datasets = related.filter((a) => a.kind === "dataset");
  const evals = related.filter((a) => a.kind === "eval");
  const parts = [
    releases.length ? plural(releases.length, "open model release") : families.length ? plural(families.length, "model family", "model families") : null,
    software.length ? plural(software.length, "software project") : null,
    datasets.length ? plural(datasets.length, "dataset") : null,
    evals.length ? plural(evals.length, "evaluation tool") : null,
  ].filter((x): x is string => Boolean(x));
  const counts = new Map<string, { license: LicenseRecord; n: number }>();
  for (const a of related) {
    for (const l of a.licenses) {
      const key = licenseLabel(l);
      counts.set(key, { license: counts.get(key)?.license ?? l, n: (counts.get(key)?.n ?? 0) + 1 });
    }
  }
  const licenses = [...counts.values()].sort((x, y) => y.n - x.n || licenseLabel(x.license).localeCompare(licenseLabel(y.license))).map((x) => x.license);
  return { related, releases, families, software, datasets, evals, parts, licenses };
}

export function organizationSeo(catalog: Catalog, org: Organization, extras?: { jobCount?: number }): SeoText {
  const name = org.name;
  const short = shortName(name);
  const out = organizationOutput(catalog, org);
  const hasModels = out.releases.length + out.families.length > 0;
  const tools = [...out.software, ...out.datasets, ...out.evals];
  const osi = tools.some((a) => a.licenses.some((l) => isOsiApproved(l.spdx)));
  const noun = hasModels ? "open models" : !tools.length ? null : out.datasets.length === tools.length ? "open datasets" : osi ? "open-source tools" : "open tools";
  const products = org.products.length > 0;
  const jobs = extras?.jobCount && extras.jobCount > 0 ? extras.jobCount : null;
  const variants = (n: string) =>
    noun
      ? [jobs ? `${n}: ${noun}, jobs & key facts` : null, products && `${n}: ${noun}, products & key facts`, `${n}: ${noun} & key facts`]
      : [jobs ? `${n}: AI jobs & key facts` : null, products ? `${n}: AI products & key facts` : `${n}: AI profile & key facts`];
  const title = fitTitle([...variants(name), ...variants(short), `${name}: key facts`, name, short]);

  const hq = org.headquarters ? headquartersPhrase(org.headquarters.label) : null;
  const lead = `${name} is ${roleDescription(org)}${hq ? ` ${hq.verb} ${hq.place}` : ""}.`;
  const shortLead = `${name} is ${roleDescription(org)}.`;
  const records = out.parts.length ? `In the catalog: ${listJoin(out.parts)}.` : "No open models or tools from it are cataloged yet.";
  const licenses = out.licenses.length ? `Licenses include ${listJoin(out.licenses.slice(0, 2).map(licenseLabel))}.` : null;
  const productList = products ? `Products include ${listJoin(org.products.slice(0, 3).map((p) => p.name))}.` : null;
  // Lead with the record's own summary when it fits beside the catalog facts; otherwise describe it from its roles.
  const opening = [firstSentence(org.summary.text), lead, shortLead].find((o) => `${o} ${records}`.length <= DESCRIPTION_MAX) ?? shortLead;
  const hqSentence = hq && opening !== lead ? `${hq.verb === "based in" ? "Based in" : "Headquarters:"} ${hq.place}.` : null;
  const jobsLine = jobs ? `${jobs.toLocaleString("en-US")} open jobs on USASI.` : null;
  return { title, description: composeDescription([opening, records], [hqSentence, licenses, productList, jobsLine]) };
}

/** Distinct current organizations for a leader, preferring ones with a catalog page. */
export function leaderOrganizations(catalog: Catalog, l: Leader): string[] {
  const roles = [...l.current_roles].sort((a, b) => Number(catalog.isActiveOrganization(b.organization_slug)) - Number(catalog.isActiveOrganization(a.organization_slug)));
  const linked = roles.filter((r) => catalog.isActiveOrganization(r.organization_slug));
  return [...new Set((linked.length ? linked : roles).map((r) => shortName(r.organization)))];
}

/** A short work or paper name for titles: keep parenthetical nicknames, drop a long subtitle. */
export function shortWorkName(name: string, max = 28): string {
  return wholeWorkName(name, max) ?? clipDescription(shortName(name), max).replace(/\u2026$/, "").trim();
}

/** The work name or its part before a subtitle, but never a name cut mid-phrase ("Random-Access Neural"). */
export function wholeWorkName(name: string, max = 28): string | null {
  const s = shortName(name);
  if (s.length <= max) return s;
  const cut = s.split(/[:—–,]/)[0]!.trim();
  return cut.length >= 4 && cut.length <= max ? cut : null;
}

function shortRole(role: string, max = 28): string | null {
  const s = role.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (s.length <= max) return s;
  const cut = s.split(/[,:—]/)[0]!.trim();
  if (cut.length >= 3 && cut.length <= max) return cut;
  return null;
}

/** Compare title segments case-insensitively, ignoring punctuation and spacing. */
export function titleSegmentKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function sameTitleSegment(a: string, b: string): boolean {
  const left = titleSegmentKey(a);
  const right = titleSegmentKey(b);
  return left.length > 0 && left === right;
}

/**
 * The name / org / project pieces of a people-bio title (`Name at Org — Project`
 * or `Name, Role at Org`). Used to detect the repeated-word titles that happen
 * when a creator's channel or a project name matches the person or the org.
 */
export function personTitleParts(title: string): { name: string; org?: string; known?: string } {
  const [head, knownRaw] = title.split(" — ");
  const known = knownRaw?.trim() || undefined;
  const at = head!.lastIndexOf(" at ");
  if (at === -1) return { name: head!.split(",")[0]!.trim(), known };
  return { name: head!.slice(0, at).split(",")[0]!.trim(), org: head!.slice(at + 4).trim() || undefined, known };
}

/** True when the org or trailing project repeats the name or each other. */
export function personTitleRepeatsSegment(title: string): boolean {
  const { name, org, known } = personTitleParts(title);
  const keys = [name, org, known].filter((s): s is string => Boolean(s)).map(titleSegmentKey).filter(Boolean);
  return new Set(keys).size < keys.length;
}

function distinctTitleSegment(value: string | null | undefined, ...seen: Array<string | null | undefined>): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (seen.some((s) => s && sameTitleSegment(trimmed, s))) return null;
  return trimmed;
}

/**
 * People-bio title: name, then a current org and what they are known for.
 * Drops `at <Org>` when the org is the person's own name (a channel or personal
 * brand) and drops a trailing project that repeats the name or org, so titles
 * stay unique. Falls back to the role, then "AI researcher".
 */
export function buildPersonTitle(input: { name: string; org?: string | null; role?: string | null; works?: Array<string | null | undefined> }): string {
  const name = squash(input.name);
  const org = distinctTitleSegment(input.org ? shortName(input.org) : null, name);
  const role = distinctTitleSegment(input.role ? shortRole(input.role) : null, name, org);
  const works: string[] = [];
  for (const raw of input.works ?? []) {
    const work = raw ? wholeWorkName(raw) : null;
    if (!work) continue;
    if (sameTitleSegment(work, name) || (org && sameTitleSegment(work, org))) continue;
    if (works.some((w) => sameTitleSegment(w, work))) continue;
    works.push(work);
  }
  const known = works[0] ?? null;
  const known2 = works[1] ?? null;
  return fitTitle([
    org && known && `${name} at ${org} — ${known}`,
    org && role && `${name}, ${role} at ${org}`,
    org && `${name} at ${org}`,
    known && known2 && `${name} — ${known} & ${known2}`,
    known && `${name} — ${known}`,
    role && `${name}, ${role}`,
    `${name} — AI researcher`,
    `${name} — sourced AI profile`,
    name,
  ]);
}

/** Optional USASI-only facts already shown on the profile (jobs, news mentions). */
export type PersonSeoExtras = {
  openJobs?: { orgName: string; count: number }[];
  newsHeadlines?: string[];
};

/**
 * A People directory profile. Title leads with the name, then a current org
 * and what they are known for, with repeated name/org/project segments dropped.
 * Description is the sourced headline plus distinctive catalog facts (open
 * jobs, a news mention, their links).
 */
export function personSeo(catalog: Catalog, p: Person, extras?: PersonSeoExtras): SeoText {
  const current = p.affiliations.filter((a) => a.current);
  // Prefer a current org that is not just the person's own name (a channel or personal brand).
  const orgAff = current.find((a) => !sameTitleSegment(shortName(a.name), p.name)) ?? current[0];
  const works = p.work.map((w) => wholeWorkName(w.name)).filter((w): w is string => w !== null);
  const links = p.links.map((l) => l.label);
  return {
    title: buildPersonTitle({
      name: p.name,
      org: orgAff?.name,
      role: orgAff?.role ?? current[0]?.role,
      works: p.work.map((w) => w.name),
    }),
    description: composeDescription(
      [/[.!?]$/.test(p.headline) ? p.headline : `${p.headline}.`],
      [
        extras?.openJobs?.[0] && `${extras.openJobs[0].count.toLocaleString("en-US")} open jobs at ${shortName(extras.openJobs[0].orgName)} on USASI.`,
        extras?.newsHeadlines?.[0] && `Recent catalog news: ${shortWorkName(extras.newsHeadlines[0], 70)}.`,
        links.length ? `Links: ${listJoin(links.slice(0, 3))}.` : null,
        works.length ? `Known for ${listJoin(works.slice(0, 3))}.` : null,
      ],
    ),
  };
}

/** News story: the headline as the title, a one-sentence summary as the description. */
export function newsItemSeo(item: { title: string; summary: { text: string } }): SeoText {
  const parts = sentences(item.summary.text);
  return { title: clipTitle(item.title), description: composeDescription([parts[0]], parts.slice(1)) };
}

export function leaderSeo(catalog: Catalog, l: Leader): SeoText {
  const orgs = leaderOrganizations(catalog, l);
  const has = [l.current_roles.length || l.past_roles.length ? "roles" : null, l.timeline.length ? "career timeline" : null, l.honors.length ? "honors" : null].filter(
    (x): x is string => Boolean(x),
  );
  return {
    title: fitTitle([
      orgs.length > 1 && `${l.name}: career and roles at ${orgs[0]} and ${orgs[1]}`,
      orgs.length > 0 && `${l.name}: career and role at ${orgs[0]}`,
      orgs.length > 0 && `${l.name}, ${orgs[0]}: career`,
      `${l.name}: career profile`,
      l.name,
    ]),
    description: composeDescription([/[.!?]$/.test(l.headline) ? l.headline : `${l.headline}.`], [has.length ? `Sourced profile: ${listJoin(has)}.` : null]),
  };
}

const LICENSE_SUBJECT: Record<LicenseCategory, string> = {
  permissive: "AI models & code",
  copyleft: "AI software",
  "model-license": "AI models",
  "non-commercial": "AI models",
  "data-license": "AI datasets",
  "content-license": "AI datasets & docs",
  other: "AI projects",
};

export function licenseGuideSeo(catalog: Catalog, slug: string): SeoText | null {
  const g = catalog.licenses.find((x) => x.slug === slug);
  if (!g) return null;
  const subject = LICENSE_SUBJECT[g.category];
  const plain = g.name.replace(/\s+Agreement\b/, "").trim();
  const uses = usesOfLicense(catalog, g);
  const records = [...new Set(uses.map((u) => u.artifact.name))];
  return {
    title: fitTitle([
      `${g.name}: what it allows for ${subject}`,
      `${plain}: what it allows for ${subject}`,
      g.spdx && `${g.spdx}: what it allows for ${subject}`,
      `${plain}: what it allows`,
      g.spdx && `${g.spdx} license: what it allows`,
      plain,
    ]),
    description: composeDescription(
      [firstSentence(g.summary.text)],
      [
        `${LICENSE_CATEGORY_LABELS[g.category]}${g.spdx ? ` (SPDX ${g.spdx})` : ""}.`,
        records.length ? `Used by ${plural(records.length, "record")} in the catalog, including ${listJoin(records.slice(0, 2))}.` : null,
        records.length ? `Used by ${plural(records.length, "record")} in the catalog.` : null,
      ],
    ),
  };
}

/** How a state is named in titles and headings ("Washington, D.C." rather than "District of Columbia"). */
export const statePlaceName = (group: Pick<StateGroup, "code" | "name">) => (group.code === "DC" ? "Washington, D.C." : group.name);

export const stateTitle = (group: Pick<StateGroup, "code" | "name">) => `AI companies & labs in ${statePlaceName(group)}`;

export function stateSeo(catalog: Catalog, group: StateGroup): SeoText {
  const n = group.organizations.length;
  const place = statePlaceName(group);
  // Name the organizations with the most records in the catalog first; ties stay alphabetical.
  const names = [...group.organizations]
    .sort((a, b) => catalog.artifactsForOrganization(b.slug).length - catalog.artifactsForOrganization(a.slug).length || a.name.localeCompare(b.name))
    .map((o) => o.name);
  const lead =
    n === 1
      ? `One AI organization in the USASI catalog is headquartered in ${place}: ${names[0]}.`
      : `${n} AI companies, labs, and research organizations in the USASI catalog are headquartered in ${place}.`;
  const options = n === 1 ? [] : [6, 5, 4, 3, 2].filter((k) => k <= n).map((k) => (k === n ? `They are ${listJoin(names)}.` : `They include ${listJoin(names.slice(0, k))}.`));
  return { title: stateTitle(group), description: composeDescription([lead], [options.find((o) => `${lead} ${o}`.length <= DESCRIPTION_MAX) ?? null]) };
}

export function hubSeo(catalog: Catalog, hub: Hub): SeoText {
  const scope = hub.artifacts.length ? "U.S. organizations & open tools" : "U.S. organizations";
  return { title: fitTitle([`${hub.title}: ${scope}`, hub.title]), description: composeDescription([hub.summary]) };
}

/**
 * Titles for explainers, phrased the way people ask. The page heading keeps the
 * explainer's own title; every phrase here appears in the explainer itself.
 */
export const EXPLAINER_SEARCH_TITLES: Record<string, string> = {
  "how-language-models-work": "How large language models (LLMs) work",
  "tokens-and-context-windows": "Tokens and context windows explained",
  "open-weight-vs-open-source": "Open weight vs. open source AI: what's the difference?",
  "how-to-read-a-model-card": "How to read an AI model card",
  "pretraining-and-post-training": "Pretraining vs. fine-tuning vs. post-training, explained",
  "training-data-disclosures": "AI training data disclosures: what model makers reveal",
  "hosted-or-local": "Hosted AI API or local model: how to choose",
  "how-models-use-tools": "How AI models use tools: function calling explained",
  "agents-and-robotics": "AI agents and robotics without the hype",
  "retrieval-augmented-generation": "What is RAG? Retrieval-augmented generation explained",
  "inference-hardware": "What hardware do you need to run an AI model?",
  quantization: "Quantization: running AI models on smaller hardware",
  "ai-content-provenance": "How to tell if content is AI-made: labels & watermarks",
  "reading-evaluations": "How to read AI benchmark results",
  "safety-testing-and-frameworks": "How AI labs test models: system cards & red teaming",
  "how-the-ecosystem-fits-together": "How the U.S. AI ecosystem fits together: chips to apps",
  "infrastructure-and-energy-claims": "How to read AI data center & energy claims",
  "ai-and-your-data": "Do AI services keep or train on what you type?",
  "policy-and-standards-sources": "Where to find official AI policy & standards texts",
};

export function explainerSeo(e: Explainer): SeoText {
  return { title: fitTitle([EXPLAINER_SEARCH_TITLES[e.slug], e.title]), description: composeDescription([e.question], e.takeaways) };
}

export const explainerBySlug = (slug: string) => EXPLAINERS.find((e) => e.slug === slug);
