/**
 * Related people for a profile page: colleagues at the same organization,
 * others in the same field, and others from the same school. Selection is
 * deterministic (stable sorts) so static builds do not shuffle.
 */
import type { Catalog } from "./catalog";
import { PERSON_SPECIALTY_LABELS, type PeopleListItem } from "./people";
import { peopleAtOrganization, peopleListItems } from "./people-index";
import { fieldPeopleLists, organizationPeopleLists } from "./people-lists";
import { personSchoolLinks, personSchoolPages, schoolPeopleLists } from "./people-schools";
import { personHref } from "./routes";
import type { Person } from "./schema";
import { shortName } from "./seo";

/** Upper bound for person-to-person links on a bio. */
export const RELATED_PEOPLE_MAX = 12;

export type RelatedPersonLink = {
  href: string;
  name: string;
  /** Why this person is related: same org, field, or school. */
  note: string;
};

export type RelatedPeopleHub = { href: string; label: string };

export type RelatedPeople = {
  people: RelatedPersonLink[];
  hubs: RelatedPeopleHub[];
};

function uniqueByHref(items: PeopleListItem[]): PeopleListItem[] {
  const seen = new Set<string>();
  const out: PeopleListItem[] = [];
  for (const item of items) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    out.push(item);
  }
  return out;
}

/** Round-robin from org, then field, then school lists so a huge lab does not crowd out other ties. */
function pickRoundRobin(lists: PeopleListItem[][], max: number, selfHref: string): PeopleListItem[] {
  const seen = new Set<string>([selfHref]);
  const out: PeopleListItem[] = [];
  const next = lists.map(() => 0);
  let added = true;
  while (out.length < max && added) {
    added = false;
    for (let i = 0; i < lists.length && out.length < max; i++) {
      const list = lists[i]!;
      while (next[i]! < list.length) {
        const item = list[next[i]++]!;
        if (seen.has(item.href)) continue;
        seen.add(item.href);
        out.push(item);
        added = true;
        break;
      }
    }
  }
  return out;
}

function orgSlugsOf(person: Person, currentOnly = false): string[] {
  return [...new Set(person.affiliations.filter((a) => a.organization_slug && (!currentOnly || a.current)).map((a) => a.organization_slug!))];
}

function orgMates(catalog: Catalog, person: Person, selfHref: string): PeopleListItem[] {
  const slugs = orgSlugsOf(person);
  const current = new Set(orgSlugsOf(person, true));
  const rows = uniqueByHref(slugs.flatMap((slug) => peopleAtOrganization(catalog, slug))).filter((i) => i.href !== selfHref);
  return rows.sort((a, b) => {
    const cur = (i: PeopleListItem) => Number(i.organizations.some((o) => o.slug && current.has(o.slug) && o.current));
    return cur(b) - cur(a) || a.name.localeCompare(b.name, "en");
  });
}

function fieldMates(catalog: Catalog, person: Person, selfHref: string): PeopleListItem[] {
  const fields = new Set(person.specialties);
  if (fields.size === 0) return [];
  return peopleListItems(catalog)
    .filter((i) => i.href !== selfHref && i.specialties.some((s) => fields.has(s)))
    .sort((a, b) => {
      const shared = (i: PeopleListItem) => i.specialties.filter((s) => fields.has(s)).length;
      return shared(b) - shared(a) || a.name.localeCompare(b.name, "en");
    });
}

function schoolMates(catalog: Catalog, person: Person, selfHref: string): PeopleListItem[] {
  const mine = new Set(personSchoolLinks(person).map((s) => s.slug));
  if (mine.size === 0) return [];
  const published = new Map(schoolPeopleLists(catalog).map((l) => [l.slug, l]));
  return uniqueByHref(
    [...mine].flatMap((slug) => published.get(slug)?.items ?? []).filter((i) => i.href !== selfHref),
  ).sort((a, b) => a.name.localeCompare(b.name, "en"));
}

function relatedNote(
  item: PeopleListItem,
  person: Person,
  catalog: Catalog,
): string {
  const currentOrg = new Set(orgSlugsOf(person, true));
  const anyOrg = new Set(orgSlugsOf(person));
  const sharedOrg = item.organizations.find((o) => o.slug && currentOrg.has(o.slug) && o.current) ?? item.organizations.find((o) => o.slug && anyOrg.has(o.slug));
  if (sharedOrg) return `Also at ${shortName(sharedOrg.name)}`;
  const mine = new Set(personSchoolLinks(person).map((s) => s.slug));
  const sharedSchool = schoolPeopleLists(catalog).find((l) => mine.has(l.slug) && l.items.some((i) => i.href === item.href));
  if (sharedSchool) return `Also from ${sharedSchool.shortName}`;
  const fields = new Set(person.specialties);
  const sharedField = item.specialties.find((s) => fields.has(s));
  if (sharedField) return PERSON_SPECIALTY_LABELS[sharedField];
  return "Related profile";
}

export function relatedPeopleHubs(catalog: Catalog, person: Person): RelatedPeopleHub[] {
  const hubs: RelatedPeopleHub[] = [];
  const seen = new Set<string>();
  const add = (href: string, label: string) => {
    if (seen.has(href)) return;
    seen.add(href);
    hubs.push({ href, label });
  };
  const orgLists = new Map(organizationPeopleLists(catalog).map((l) => [l.slug, l]));
  for (const slug of orgSlugsOf(person)) {
    const list = orgLists.get(slug);
    if (list) add(list.path, `People at ${shortName(list.name)}`);
  }
  const fieldLists = new Map(fieldPeopleLists(catalog).map((l) => [l.slug, l]));
  for (const field of person.specialties) {
    const list = fieldLists.get(field);
    if (list) add(list.path, list.name);
  }
  for (const school of personSchoolPages(catalog, person)) add(school.href, `People from ${school.label}`);
  return hubs;
}

/**
 * Other people this profile can link to from org, field, or school ties.
 * Empty only when the catalog has no one else sharing those ties.
 */
export function relatedPeopleCandidates(catalog: Catalog, person: Person): { org: PeopleListItem[]; field: PeopleListItem[]; school: PeopleListItem[] } {
  const selfHref = personHref(person.slug);
  return {
    org: orgMates(catalog, person, selfHref),
    field: fieldMates(catalog, person, selfHref),
    school: schoolMates(catalog, person, selfHref),
  };
}

export function relatedPeople(catalog: Catalog, person: Person, max = RELATED_PEOPLE_MAX): RelatedPeople {
  const selfHref = personHref(person.slug);
  const candidates = relatedPeopleCandidates(catalog, person);
  const picked = pickRoundRobin([candidates.org, candidates.field, candidates.school], max, selfHref);
  return {
    people: picked.map((item) => ({ href: item.href, name: item.name, note: relatedNote(item, person, catalog) })),
    hubs: relatedPeopleHubs(catalog, person),
  };
}

/** True when at least one other person shares an org, field, or school. */
export function canLinkRelatedPeople(catalog: Catalog, person: Person): boolean {
  const { org, field, school } = relatedPeopleCandidates(catalog, person);
  return org.length + field.length + school.length > 0;
}
