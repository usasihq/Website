/**
 * Schools / alma maters for People profiles. Names come from a checked-in
 * catalog; a person is tied to a school only when the bio states education or
 * an academic role, a sourced affiliation names the school, or a high-confidence
 * Wikidata match lists it as educated-at (P69). Passing mentions do not count.
 */
import type { Catalog } from "./catalog";
import type { PeopleListItem } from "./people";
import { peopleListItems } from "./people-index";
import { personEnrichment, type PersonSchoolLink } from "./people-wikidata";
import type { Person } from "./schema";

/** A list page needs this many people. Thin one-name school pages are not published. */
export const MIN_SCHOOL_PEOPLE = 5;

export const peopleSchoolIndexHref = () => "/people/school/";
export const peopleSchoolHref = (slug: string) => `/people/school/${slug}/`;

export type SchoolKind = "education" | "affiliation";
export type SchoolEvidence = "bio" | "affiliation" | "wikidata-p69";

export type PeopleSchool = {
  slug: string;
  name: string;
  /** Short name for titles and badges (fits " | USASI"). */
  shortName: string;
  /** Wikidata QID, when the school has a well-known item. */
  qid: string | null;
  /** Catalog organization slug, when the school has a company page. */
  organizationSlug: string | null;
  /**
   * Aliases used to find the school in bios and Wikidata labels.
   * Longer phrases are matched first. Short tokens such as "MIT" have extra guards.
   */
  aliases: string[];
};

/**
 * Universities that appear often in U.S. AI bios. Aliases are conservative:
 * "Cambridge" and "Washington" alone are not enough; "MIT" ignores the license.
 */
export const PEOPLE_SCHOOLS: PeopleSchool[] = [
  {
    slug: "stanford-university",
    name: "Stanford University",
    shortName: "Stanford",
    qid: "Q41506",
    organizationSlug: "stanford-university",
    aliases: ["stanford university", "stanford vision lab", "stanford ai lab", "stanford nlp", "stanford crfm", "stanford"],
  },
  {
    slug: "uc-berkeley",
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    qid: "Q168756",
    organizationSlug: "uc-berkeley",
    aliases: [
      "university of california, berkeley",
      "university of california berkeley",
      "uc berkeley",
      "berkeley eecs",
      "berkeley cs",
      "u.c. berkeley",
    ],
  },
  {
    slug: "mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    qid: "Q49108",
    organizationSlug: "mit",
    aliases: ["massachusetts institute of technology", "mit csail", "mit eecs"],
  },
  {
    slug: "carnegie-mellon-university",
    name: "Carnegie Mellon University",
    shortName: "Carnegie Mellon",
    qid: "Q190080",
    organizationSlug: "carnegie-mellon-university",
    aliases: ["carnegie mellon university", "carnegie mellon", "cmu"],
  },
  {
    slug: "harvard-university",
    name: "Harvard University",
    shortName: "Harvard",
    qid: "Q13371",
    organizationSlug: "harvard-university",
    aliases: ["harvard university", "harvard"],
  },
  {
    slug: "princeton-university",
    name: "Princeton University",
    shortName: "Princeton",
    qid: "Q21578",
    organizationSlug: "princeton-university",
    aliases: ["princeton university", "princeton"],
  },
  {
    slug: "cornell-university",
    name: "Cornell University",
    shortName: "Cornell",
    qid: "Q49115",
    organizationSlug: "cornell-university",
    aliases: ["cornell university", "cornell tech", "cornell"],
  },
  {
    slug: "new-york-university",
    name: "New York University",
    shortName: "NYU",
    qid: "Q49210",
    organizationSlug: "new-york-university",
    aliases: ["new york university", "nyu center for data science", "nyu"],
  },
  {
    slug: "university-of-washington",
    name: "University of Washington",
    shortName: "UW",
    qid: "Q219563",
    organizationSlug: "university-of-washington",
    aliases: ["university of washington", "uw cse", "uw allen school"],
  },
  {
    slug: "university-of-illinois-urbana-champaign",
    name: "University of Illinois Urbana-Champaign",
    shortName: "UIUC",
    qid: "Q457281",
    organizationSlug: "university-of-illinois-urbana-champaign",
    aliases: ["university of illinois urbana-champaign", "university of illinois at urbana-champaign", "uiuc", "u. of illinois"],
  },
  {
    slug: "university-of-texas-at-austin",
    name: "The University of Texas at Austin",
    shortName: "UT Austin",
    qid: "Q49213",
    organizationSlug: "university-of-texas-at-austin",
    aliases: ["university of texas at austin", "ut austin", "utaustin"],
  },
  {
    slug: "university-of-california-san-diego",
    name: "University of California San Diego",
    shortName: "UC San Diego",
    qid: "Q622664",
    organizationSlug: "university-of-california-san-diego",
    aliases: ["university of california san diego", "university of california, san diego", "uc san diego", "ucsd"],
  },
  {
    slug: "ucla",
    name: "University of California, Los Angeles",
    shortName: "UCLA",
    qid: "Q174710",
    organizationSlug: null,
    aliases: ["university of california, los angeles", "university of california los angeles", "ucla"],
  },
  {
    slug: "caltech",
    name: "California Institute of Technology",
    shortName: "Caltech",
    qid: "Q161562",
    organizationSlug: null,
    aliases: ["california institute of technology", "caltech"],
  },
  {
    slug: "columbia-university",
    name: "Columbia University",
    shortName: "Columbia",
    qid: "Q49088",
    organizationSlug: null,
    aliases: ["columbia university"],
  },
  {
    slug: "yale-university",
    name: "Yale University",
    shortName: "Yale",
    qid: "Q49112",
    organizationSlug: null,
    aliases: ["yale university", "yale"],
  },
  {
    slug: "georgia-institute-of-technology",
    name: "Georgia Institute of Technology",
    shortName: "Georgia Tech",
    qid: "Q864855",
    organizationSlug: "georgia-institute-of-technology",
    aliases: ["georgia institute of technology", "georgia tech"],
  },
  {
    slug: "university-of-michigan",
    name: "University of Michigan",
    shortName: "Michigan",
    qid: "Q230492",
    organizationSlug: null,
    aliases: ["university of michigan", "u. of michigan", "umich"],
  },
  {
    slug: "usc",
    name: "University of Southern California",
    shortName: "USC",
    qid: "Q4614",
    organizationSlug: null,
    aliases: ["university of southern california", "usc"],
  },
  {
    slug: "university-of-pennsylvania",
    name: "University of Pennsylvania",
    shortName: "Penn",
    qid: "Q49117",
    organizationSlug: null,
    aliases: ["university of pennsylvania", "upenn", "u. of pennsylvania"],
  },
  {
    slug: "johns-hopkins-university",
    name: "Johns Hopkins University",
    shortName: "Johns Hopkins",
    qid: "Q193727",
    organizationSlug: null,
    aliases: ["johns hopkins university", "johns hopkins", "jhu"],
  },
  {
    slug: "university-of-chicago",
    name: "University of Chicago",
    shortName: "UChicago",
    qid: "Q131252",
    organizationSlug: null,
    aliases: ["university of chicago", "uchicago"],
  },
  {
    slug: "northwestern-university",
    name: "Northwestern University",
    shortName: "Northwestern",
    qid: "Q309350",
    organizationSlug: null,
    aliases: ["northwestern university", "northwestern"],
  },
  {
    slug: "brown-university",
    name: "Brown University",
    shortName: "Brown",
    qid: "Q49114",
    organizationSlug: null,
    aliases: ["brown university", "brown"],
  },
  {
    slug: "duke-university",
    name: "Duke University",
    shortName: "Duke",
    qid: "Q168751",
    organizationSlug: null,
    aliases: ["duke university", "duke"],
  },
  {
    slug: "umass-amherst",
    name: "University of Massachusetts Amherst",
    shortName: "UMass Amherst",
    qid: "Q15142",
    organizationSlug: null,
    aliases: ["university of massachusetts amherst", "umass amherst", "u. of massachusetts"],
  },
  {
    slug: "university-of-oxford",
    name: "University of Oxford",
    shortName: "Oxford",
    qid: "Q34433",
    organizationSlug: null,
    aliases: ["university of oxford", "oxford university", "oxford vgg"],
  },
  {
    slug: "university-of-cambridge",
    name: "University of Cambridge",
    shortName: "Cambridge",
    qid: "Q35794",
    organizationSlug: null,
    aliases: ["university of cambridge", "cambridge university", "cambridge computer laboratory"],
  },
  {
    slug: "university-of-toronto",
    name: "University of Toronto",
    shortName: "Toronto",
    qid: "Q180865",
    organizationSlug: null,
    aliases: ["university of toronto", "u. of toronto"],
  },
  {
    slug: "eth-zurich",
    name: "ETH Zurich",
    shortName: "ETH Zurich",
    qid: "Q11942",
    organizationSlug: null,
    aliases: ["eth zurich", "eth zürich", "swiss federal institute of technology"],
  },
  {
    slug: "university-of-montreal",
    name: "Université de Montréal",
    shortName: "Montréal",
    qid: "Q392189",
    organizationSlug: null,
    aliases: ["université de montréal", "universite de montreal", "university of montreal", "udem"],
  },
  {
    slug: "epfl",
    name: "École Polytechnique Fédérale de Lausanne",
    shortName: "EPFL",
    qid: "Q262760",
    organizationSlug: null,
    aliases: ["école polytechnique fédérale de lausanne", "ecole polytechnique federale de lausanne", "epfl"],
  },
  {
    slug: "tsinghua-university",
    name: "Tsinghua University",
    shortName: "Tsinghua",
    qid: "Q16955",
    organizationSlug: null,
    aliases: ["tsinghua university", "tsinghua"],
  },
  {
    slug: "peking-university",
    name: "Peking University",
    shortName: "Peking",
    qid: "Q16952",
    organizationSlug: null,
    aliases: ["peking university", "peking"],
  },
  {
    slug: "university-of-edinburgh",
    name: "University of Edinburgh",
    shortName: "Edinburgh",
    qid: "Q160302",
    organizationSlug: null,
    aliases: ["university of edinburgh", "edinburgh university"],
  },
  {
    slug: "imperial-college-london",
    name: "Imperial College London",
    shortName: "Imperial",
    qid: "Q189022",
    organizationSlug: null,
    aliases: ["imperial college london", "imperial college"],
  },
  {
    slug: "university-college-london",
    name: "University College London",
    shortName: "UCL",
    qid: "Q193196",
    organizationSlug: null,
    aliases: ["university college london", "ucl"],
  },
  {
    slug: "university-of-waterloo",
    name: "University of Waterloo",
    shortName: "Waterloo",
    qid: "Q1049470",
    organizationSlug: null,
    aliases: ["university of waterloo"],
  },
  {
    slug: "mcgill-university",
    name: "McGill University",
    shortName: "McGill",
    qid: "Q201492",
    organizationSlug: null,
    aliases: ["mcgill university", "mcgill"],
  },
  {
    slug: "hebrew-university",
    name: "Hebrew University of Jerusalem",
    shortName: "Hebrew University",
    qid: "Q174158",
    organizationSlug: null,
    aliases: ["hebrew university of jerusalem", "hebrew university"],
  },
  {
    slug: "technion",
    name: "Technion – Israel Institute of Technology",
    shortName: "Technion",
    qid: "Q333705",
    organizationSlug: null,
    aliases: ["israel institute of technology", "technion"],
  },
  {
    slug: "university-of-wisconsin-madison",
    name: "University of Wisconsin–Madison",
    shortName: "UW–Madison",
    qid: "Q838330",
    organizationSlug: null,
    aliases: ["university of wisconsin–madison", "university of wisconsin-madison", "uw–madison", "uw-madison"],
  },
  {
    slug: "purdue-university",
    name: "Purdue University",
    shortName: "Purdue",
    qid: "Q217741",
    organizationSlug: null,
    aliases: ["purdue university", "purdue"],
  },
  {
    slug: "uc-irvine",
    name: "University of California, Irvine",
    shortName: "UC Irvine",
    qid: "Q868421",
    organizationSlug: null,
    aliases: ["university of california, irvine", "university of california irvine", "uc irvine", "uci"],
  },
  {
    slug: "uc-santa-barbara",
    name: "University of California, Santa Barbara",
    shortName: "UC Santa Barbara",
    qid: "Q263064",
    organizationSlug: null,
    aliases: ["university of california, santa barbara", "university of california santa barbara", "uc santa barbara", "ucsb"],
  },
  {
    slug: "northeastern-university",
    name: "Northeastern University",
    shortName: "Northeastern",
    qid: "Q37548",
    organizationSlug: null,
    aliases: ["northeastern university"],
  },
];

const SCHOOL_BY_SLUG = new Map(PEOPLE_SCHOOLS.map((s) => [s.slug, s]));
const SCHOOL_BY_QID = new Map(PEOPLE_SCHOOLS.filter((s) => s.qid).map((s) => [s.qid!, s]));

/** Alias → school, longest aliases first so "Stanford University" wins over "Stanford". */
const ALIAS_INDEX: { alias: string; school: PeopleSchool }[] = PEOPLE_SCHOOLS.flatMap((school) =>
  school.aliases.map((alias) => ({ alias, school })),
).sort((a, b) => b.alias.length - a.alias.length || a.alias.localeCompare(b.alias));

export function schoolBySlug(slug: string): PeopleSchool | undefined {
  return SCHOOL_BY_SLUG.get(slug);
}

export function schoolByQid(qid: string): PeopleSchool | undefined {
  return SCHOOL_BY_QID.get(qid);
}

const EDUCATION_CUE =
  /\b(?:ph\.?\s*d\.?|doctoral|doctorate|dissertation|thesis|master'?s|m\.?\s*s\.?|m\.?\s*sc\.?|bachelor'?s|b\.?\s*s\.?|b\.?\s*sc\.?|undergraduate|undergrad|studied|graduated|alumn(?:us|a|i)|degree|advised|advisor|advise[rd])\b/i;
const EMPLOYMENT_CUE =
  /\b(?:professor|faculty|lecturer|instructor|postdoc|post-doc|postdoctoral|teaches|teaching|joined|appointment|adjunct|researcher at|scientist at|fellow at)\b/i;

/** "MIT" as a university, never the MIT license. */
const MIT_TOKEN = /(?<![A-Za-z])MIT(?![A-Za-z])(?![- ]licen)/gi;

function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function isMitLicenseContext(text: string, index: number): boolean {
  const after = text.slice(index, index + 16).toLowerCase();
  return /^-?licen/.test(after) || /^ license/.test(after);
}

export function findSchoolMentions(text: string): { school: PeopleSchool; index: number; alias: string }[] {
  const hay = normalize(text);
  const found: { school: PeopleSchool; index: number; alias: string }[] = [];
  const taken = new Set<string>();
  for (const { alias, school } of ALIAS_INDEX) {
    if (taken.has(school.slug)) continue;
    if (alias === "mit") {
      MIT_TOKEN.lastIndex = 0;
      const raw = text;
      let m: RegExpExecArray | null;
      while ((m = MIT_TOKEN.exec(raw))) {
        if (isMitLicenseContext(raw, m.index + 3)) continue;
        found.push({ school, index: m.index, alias });
        taken.add(school.slug);
        break;
      }
      continue;
    }
    const idx = hay.indexOf(alias);
    if (idx === -1) continue;
    const before = hay[idx - 1] ?? " ";
    const after = hay[idx + alias.length] ?? " ";
    if (/[a-z0-9]/.test(before) || /[a-z0-9]/.test(after)) continue;
    found.push({ school, index: idx, alias });
    taken.add(school.slug);
  }
  return found;
}

function kindFromContext(text: string, index: number): SchoolKind | null {
  const start = Math.max(0, index - 110);
  const end = Math.min(text.length, index + 50);
  const window = text.slice(start, end);
  if (EDUCATION_CUE.test(window)) return "education";
  if (EMPLOYMENT_CUE.test(window)) return "affiliation";
  return null;
}

/** Schools the person's own prose clearly ties them to (education or an academic role). */
export function schoolsFromPersonText(person: Pick<Person, "headline" | "bio" | "sections" | "timeline">): PersonSchoolLink[] {
  const chunks = [person.headline, person.bio.text, ...person.sections.flatMap((s) => s.paragraphs.map((p) => p.text)), ...person.timeline.map((t) => t.text)];
  const bySlug = new Map<string, PersonSchoolLink>();
  for (const chunk of chunks) {
    for (const mention of findSchoolMentions(chunk)) {
      const kind = kindFromContext(chunk, mention.index);
      if (!kind) continue;
      const prev = bySlug.get(mention.school.slug);
      if (!prev) bySlug.set(mention.school.slug, { slug: mention.school.slug, name: mention.school.name, kind, evidence: "bio" });
      else if (prev.kind !== "education" && kind === "education") prev.kind = "education";
    }
  }
  return [...bySlug.values()];
}

const ACADEMIC_ROLE = /\b(?:professor|faculty|lecturer|instructor|postdoc|post-doc|postdoctoral|adjunct|dean|chair)\b/i;

/** Schools named as a sourced affiliation (faculty, researcher, or the org itself). */
export function schoolsFromAffiliations(person: Pick<Person, "affiliations">): PersonSchoolLink[] {
  const out: PersonSchoolLink[] = [];
  const seen = new Set<string>();
  for (const a of person.affiliations) {
    const mentions = findSchoolMentions(a.name);
    const orgMatch = PEOPLE_SCHOOLS.find((s) => s.organizationSlug && s.organizationSlug === a.organization_slug);
    const school = orgMatch ?? mentions[0]?.school;
    if (!school || seen.has(school.slug)) continue;
    // An affiliation named for the school, or a role that is clearly academic there.
    if (!mentions.length && !orgMatch) continue;
    if (!mentions.length && orgMatch && !ACADEMIC_ROLE.test(a.role) && !/universit|college|institute of technology/i.test(a.name)) continue;
    seen.add(school.slug);
    out.push({ slug: school.slug, name: school.name, kind: "affiliation", evidence: "affiliation" });
  }
  return out;
}

export function schoolsFromWikidataEducation(educatedAt: { qid?: string | null; name: string }[]): PersonSchoolLink[] {
  const out: PersonSchoolLink[] = [];
  const seen = new Set<string>();
  for (const row of educatedAt) {
    const byQid = row.qid ? schoolByQid(row.qid) : undefined;
    const byName = findSchoolMentions(row.name)[0]?.school;
    const school = byQid ?? byName;
    if (!school || seen.has(school.slug)) continue;
    seen.add(school.slug);
    out.push({ slug: school.slug, name: school.name, kind: "education", evidence: "wikidata-p69" });
  }
  return out;
}

/** Merge bio, affiliation, and Wikidata P69 links; education wins over affiliation for the same school. */
export function mergeSchoolLinks(...groups: PersonSchoolLink[][]): PersonSchoolLink[] {
  const bySlug = new Map<string, PersonSchoolLink>();
  for (const group of groups) {
    for (const link of group) {
      const prev = bySlug.get(link.slug);
      if (!prev) {
        bySlug.set(link.slug, { ...link });
        continue;
      }
      if (prev.kind !== "education" && link.kind === "education") prev.kind = "education";
      if (link.evidence === "wikidata-p69" && prev.evidence !== "wikidata-p69") prev.evidence = "wikidata-p69";
      else if (link.evidence === "affiliation" && prev.evidence === "bio" && prev.kind !== "education") prev.evidence = "affiliation";
    }
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function personSchoolLinks(person: Person): PersonSchoolLink[] {
  const extra = personEnrichment(person.slug);
  return mergeSchoolLinks(schoolsFromPersonText(person), schoolsFromAffiliations(person), extra?.schools ?? []);
}

export type SchoolPeopleList = {
  slug: string;
  name: string;
  shortName: string;
  path: string;
  items: PeopleListItem[];
  organizationSlug: string | null;
};

const listMemo = new WeakMap<Catalog, SchoolPeopleList[]>();

/** School list pages with enough people, largest first, then by name. */
export function schoolPeopleLists(catalog: Catalog): SchoolPeopleList[] {
  const hit = listMemo.get(catalog);
  if (hit) return hit;
  const items = peopleListItems(catalog);
  const bySlug = new Map<string, PeopleListItem[]>();
  const peopleByHref = new Map(items.map((i) => [i.href, i]));
  for (const p of catalog.people) {
    const row = peopleByHref.get(`/people/${p.slug}/`);
    if (!row) continue;
    for (const school of personSchoolLinks(p)) {
      const list = bySlug.get(school.slug) ?? [];
      list.push(row);
      bySlug.set(school.slug, list);
    }
  }
  const lists = PEOPLE_SCHOOLS.map((school) => {
    const rows = [...new Map((bySlug.get(school.slug) ?? []).map((i) => [i.href, i])).values()].sort((a, b) =>
      a.name.localeCompare(b.name, "en"),
    );
    return {
      slug: school.slug,
      name: school.name,
      shortName: school.shortName,
      path: peopleSchoolHref(school.slug),
      items: rows,
      organizationSlug: school.organizationSlug,
    };
  })
    .filter((l) => l.items.length >= MIN_SCHOOL_PEOPLE)
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name, "en"));
  listMemo.set(catalog, lists);
  return lists;
}

export function personSchoolPages(catalog: Catalog, person: Person): { href: string; label: string; kind: SchoolKind }[] {
  const published = new Map(schoolPeopleLists(catalog).map((l) => [l.slug, l]));
  return personSchoolLinks(person)
    .filter((s) => published.has(s.slug))
    .map((s) => ({ href: peopleSchoolHref(s.slug), label: schoolBySlug(s.slug)?.shortName ?? s.name, kind: s.kind }));
}
