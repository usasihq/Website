/**
 * Static People list pages: everyone tied to one organization (/people/at/<org>/)
 * and everyone in one field (/people/field/<specialty>/). Alphabetical, never ranked.
 */
import type { Catalog } from "./catalog";
import { PERSON_SPECIALTY_LABELS, type PeopleListItem } from "./people";
import { peopleAtOrganization, peopleListItems } from "./people-index";
import { PERSON_SPECIALTIES, type PersonSpecialty } from "./schema";

/** A list page needs this many people, so thin one-name pages are not published. */
export const MIN_LIST_PEOPLE = 3;

export const peopleAtHref = (org: string) => `/people/at/${org}/`;
export const peopleFieldHref = (field: PersonSpecialty) => `/people/field/${field}/`;

export type PeopleList = { slug: string; name: string; path: string; items: PeopleListItem[]; current: number };

export function organizationPeopleLists(catalog: Catalog): PeopleList[] {
  const slugs = new Set(peopleListItems(catalog).flatMap((i) => i.organizations.map((o) => o.slug)).filter((s): s is string => s !== null));
  return catalog.organizations
    .filter((o) => slugs.has(o.slug))
    .map((o) => {
      const items = peopleAtOrganization(catalog, o.slug);
      const current = items.filter((i) => i.organizations.some((x) => x.slug === o.slug && x.current)).length;
      return { slug: o.slug, name: o.name, path: peopleAtHref(o.slug), items, current };
    })
    .filter((l) => l.items.length >= MIN_LIST_PEOPLE)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function fieldPeopleLists(catalog: Catalog): (PeopleList & { slug: PersonSpecialty })[] {
  const all = peopleListItems(catalog);
  return PERSON_SPECIALTIES.map((sp) => {
    const items = all.filter((i) => i.specialties.includes(sp));
    return { slug: sp, name: PERSON_SPECIALTY_LABELS[sp], path: peopleFieldHref(sp), items, current: items.length };
  }).filter((l) => l.items.length >= MIN_LIST_PEOPLE);
}
