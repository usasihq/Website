/**
 * Shared props for Jobs landing routes (page 1 and /page/n/).
 */
import type { Catalog } from "../catalog";
import { DEFAULT_PEOPLE_FILTERS, serializePeopleFilters } from "../people";
import { peopleAtOrganization } from "../people-index";
import { organizationsByState } from "../place-index";
import { stateSlug } from "../places";
import { cityLinks, companyLinks, roleLinksForEmployer, roleStateLinksForRole, roleStateLinksForState, topicAndStateLinks } from "./landing-links";
import { stateDisplayName, type LandingPage } from "./landing";
import { payEmployer, payRole } from "./pay";

const OTHER_EMPLOYERS = 24;

export function landingExtras(catalog: Catalog, page: LandingPage) {
  const hq = page.state ? organizationsByState(catalog).states.find((s) => s.code === page.state) : undefined;
  const people = page.organization ? peopleAtOrganization(catalog, page.organization.slug) : [];
  return {
    others: topicAndStateLinks(catalog, page.path),
    cities:
      page.kind === "city" && page.state
        ? cityLinks(catalog, page.state).filter((l) => l.path !== page.basePath)
        : page.kind === "state" && page.state
          ? cityLinks(catalog, page.state)
          : [],
    parent:
      page.kind === "city" && page.state
        ? { href: `/jobs/in/${stateSlug(page.state)}/`, label: `Jobs in ${stateDisplayName(page.state)}` }
        : page.kind === "role-state" && page.filters.role
          ? { href: `/jobs/role/${page.filters.role}/`, label: page.name.replace(/ in .+$/, "") }
          : null,
    companies: page.kind === "company" ? companyLinks(catalog, page.basePath).slice(0, OTHER_EMPLOYERS) : [],
    roles: page.organization ? roleLinksForEmployer(catalog, page.organization.slug) : [],
    roleStates:
      page.kind === "role"
        ? roleStateLinksForRole(catalog, page.id)
        : page.kind === "state" && page.state
          ? roleStateLinksForState(catalog, page.state)
          : [],
    people: people.map((p) => ({ href: p.href, name: p.name })),
    peopleHref: page.organization && people.length ? `/people/?${serializePeopleFilters({ ...DEFAULT_PEOPLE_FILTERS, org: page.organization.slug })}` : null,
    headquartersHref: hq ? `/places/${stateSlug(hq.code)}/` : null,
    headquartersCount: hq?.organizations.length ?? 0,
    pay: page.kind === "company" && page.organization ? payEmployer(catalog, page.organization.slug) ?? null : page.kind === "role" ? payRole(catalog, page.id) ?? null : null,
  };
}
