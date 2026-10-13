/**
 * Builds the People directory rows from the catalog (build time). Persons keep
 * their own groups, sector, and specialties; Big SI leaders are listed as
 * founders and executives, with the sector of their current organization.
 */
import type { Catalog } from "./catalog";
import type { PeopleListItem } from "./people";
import { leaderHref, personHref } from "./routes";
import type { Leader, Person, PersonSector, WorkType } from "./schema";

/** The kind of organization behind a catalog record, for people whose profile does not state a sector. */
export function organizationSector(catalog: Catalog, slug: string | null): PersonSector | null {
  const org = slug ? catalog.organization(slug) : undefined;
  if (!org) return null;
  if (org.ownership_category === "publicly-traded" || org.ownership_category === "privately-held" || org.ownership_category === "unit-of-another-organization") return "corporate";
  if (/universit|college|institute of technology/i.test(org.name)) return "academic";
  if (/national laborator|national institute of standards/i.test(org.name)) return "government";
  if (org.ownership_category === "nonprofit" || org.ownership_category === "foundation-hosted") return "nonprofit";
  return null;
}

export function personListItem(catalog: Catalog, p: Person): PeopleListItem {
  const affiliations = [...p.affiliations].sort((a, b) => Number(b.current) - Number(a.current));
  const firstCurrent = affiliations.find((a) => a.current && a.organization_slug);
  return {
    slug: p.slug,
    name: p.name,
    initials: p.initials,
    href: personHref(p.slug),
    headline: p.headline,
    kind: "person",
    groups: p.groups,
    sector: p.sector ?? organizationSector(catalog, firstCurrent?.organization_slug ?? null),
    specialties: p.specialties,
    organizations: affiliations.map((a) => ({
      slug: a.organization_slug && catalog.isActiveOrganization(a.organization_slug) ? a.organization_slug : null,
      name: a.name,
      role: a.role,
      current: a.current,
    })),
    workTypes: [...new Set(p.work.map((w) => w.type).filter((t): t is WorkType => t !== null))],
    work: p.work.map((w) => w.name),
  };
}

export function leaderListItem(catalog: Catalog, l: Leader): PeopleListItem {
  const roles = [...l.current_roles.map((r) => ({ ...r, current: true })), ...l.past_roles.map((r) => ({ ...r, current: false }))];
  return {
    slug: l.slug,
    name: l.name,
    initials: l.initials,
    href: leaderHref(l.slug),
    headline: l.headline,
    kind: "leader",
    groups: ["leadership"],
    sector: organizationSector(catalog, l.current_roles.find((r) => r.organization_slug)?.organization_slug ?? null),
    specialties: [],
    organizations: roles.map((r) => ({
      slug: r.organization_slug && catalog.isActiveOrganization(r.organization_slug) ? r.organization_slug : null,
      name: r.organization,
      role: r.role,
      current: r.current,
    })),
    workTypes: [],
    work: [],
  };
}

const memo = new WeakMap<Catalog, PeopleListItem[]>();

/** Everyone in the directory, alphabetically by name. A person with both kinds of profile is listed once, as the leader profile. */
export function peopleListItems(catalog: Catalog): PeopleListItem[] {
  const hit = memo.get(catalog);
  if (hit) return hit;
  const leaders = new Set(catalog.leaders.map((l) => l.slug));
  const items = [
    ...catalog.leaders.map((l) => leaderListItem(catalog, l)),
    ...catalog.people.filter((p) => !leaders.has(p.slug)).map((p) => personListItem(catalog, p)),
  ].sort((a, b) => a.name.localeCompare(b.name, "en"));
  memo.set(catalog, items);
  return items;
}

/** People tied to an organization (current roles first), for organization pages. */
export function peopleAtOrganization(catalog: Catalog, slug: string): PeopleListItem[] {
  return peopleListItems(catalog)
    .filter((i) => i.organizations.some((o) => o.slug === slug))
    .sort((a, b) => {
      const cur = (i: PeopleListItem) => Number(i.organizations.some((o) => o.slug === slug && o.current));
      return cur(b) - cur(a) || a.name.localeCompare(b.name, "en");
    });
}
