/**
 * Shared props for Jobs landing routes (page 1 and /page/n/).
 */
import type { Catalog } from "../catalog";
import { organizationsByState } from "../place-index";
import { stateSlug } from "../places";
import { hiringProcessFor } from "./hiring-process";
import { cityLinks, companyLinks, landingLinks, metroLinksForState, roleLinksForEmployer, roleStateLinksForRole, roleStateLinksForState, topicAndStateLinks } from "./landing-links";
import { stateDisplayName, type LandingPage } from "./landing";
import { payEmployer, payRole } from "./pay";

const OTHER_EMPLOYERS = 24;

export function landingExtras(catalog: Catalog, page: LandingPage) {
  const hq = page.state ? organizationsByState(catalog).states.find((s) => s.code === page.state) : undefined;
  const existing = new Set(landingLinks(catalog).map((l) => l.path));
  const parents =
    page.kind === "metro" && page.metro
      ? [...new Set(page.metro.places.map((p) => p.state))]
          .map((code) => ({ href: `/jobs/in/${stateSlug(code)}/`, label: `Jobs in ${stateDisplayName(code)}` }))
          .filter((s) => existing.has(s.href))
      : [];
  return {
    others: topicAndStateLinks(catalog, page.path),
    cities:
      page.kind === "city" && page.state
        ? cityLinks(catalog, page.state).filter((l) => l.path !== page.basePath)
        : page.kind === "state" && page.state
          ? [...metroLinksForState(catalog, page.state), ...cityLinks(catalog, page.state)]
          : page.kind === "metro" && page.metro
            ? page.metro.places.flatMap((p) =>
                cityLinks(catalog, p.state).filter((l) => l.path === `/jobs/in/${stateSlug(p.state)}/${p.slug}/`),
              )
            : [],
    parent:
      page.kind === "city" && page.state
        ? { href: `/jobs/in/${stateSlug(page.state)}/`, label: `Jobs in ${stateDisplayName(page.state)}` }
        : page.kind === "role-state" && page.filters.role
          ? { href: `/jobs/role/${page.filters.role}/`, label: page.name.replace(/ in .+$/, "") }
          : null,
    parents,
    companies: page.kind === "company" ? companyLinks(catalog, page.basePath).slice(0, OTHER_EMPLOYERS) : [],
    roles: page.organization ? roleLinksForEmployer(catalog, page.organization.slug) : [],
    roleStates:
      page.kind === "role"
        ? roleStateLinksForRole(catalog, page.id)
        : page.kind === "state" && page.state
          ? roleStateLinksForState(catalog, page.state)
          : [],
    headquartersHref: hq ? `/places/${stateSlug(hq.code)}/` : null,
    headquartersCount: hq?.organizations.length ?? 0,
    pay: page.kind === "company" && page.organization ? payEmployer(catalog, page.organization.slug) ?? null : page.kind === "role" ? payRole(catalog, page.id) ?? null : null,
    hiring: page.kind === "company" && page.organization ? hiringProcessFor(page.organization.slug) : null,
  };
}
