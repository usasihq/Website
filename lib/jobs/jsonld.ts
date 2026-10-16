/**
 * JSON-LD for Jobs collection pages (/jobs/, /jobs/remote/, /jobs/in/<state>/,
 * /jobs/at/<employer>/, /jobs/role/<slug>/, …). These pages list many openings,
 * so they never emit JobPosting (Google allows that type only on a page for one
 * job).
 *
 * ItemList entries are same-site URLs for pages that exist: job detail pages
 * on a landing page, and browse destinations on /jobs/. numberOfItems is the
 * number of entries in the list, not a larger unpublished total.
 */
import { formatDate } from "../dates";
import { absoluteUrl } from "../paths";
import { orgHref } from "../routes";
import { SCHEMA_CONTEXT } from "../structured-data";
import { jobHref } from "./job-url";
import { MIN_TOPIC_LISTINGS, type LandingPage } from "./landing";
import type { LandingLink } from "./landing-links";

const listItem = (position: number, name: string, href: string) => ({
  "@type": "ListItem" as const,
  position,
  name,
  url: absoluteUrl(href),
});

/** /jobs/: the directory itself, plus the topic / role / state / city pages it links to. */
export function jobsIndexJsonLd(links: LandingLink[]): object {
  const items = links.filter((l) =>
    (l.kind === "topic" || l.kind === "role" ? l.count >= MIN_TOPIC_LISTINGS : l.kind === "state" || l.kind === "city"),
  );
  const url = absoluteUrl("/jobs/");
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Jobs at U.S. AI companies & labs",
        url,
        description:
          "Current positions at U.S. AI companies and labs documented by USASI, collected from authoritative employer career sources. Apply directly with the employer.",
        mainEntity: { "@id": `${url}#browse` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#browse`,
        name: "Jobs by topic, role, U.S. state, and city",
        url,
        numberOfItems: items.length,
        itemListElement: items.map((l, i) => listItem(i + 1, l.name, l.path)),
      },
    ],
  };
}

/** A topic, state, city, or employer landing page: the listings shown, and the employers. */
export function jobsLandingJsonLd(page: LandingPage): object {
  const url = absoluteUrl(page.path);
  const checked = formatDate((page.lastChecked ?? page.buildAt).slice(0, 10));
  const graph: object[] = [
    {
      "@type": "CollectionPage",
      name: page.h1,
      url,
      description: page.description,
    },
  ];
  if (page.listings.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#listings`,
      name: page.h1,
      description:
        page.count > page.listings.length
          ? `The ${page.listings.length.toLocaleString("en-US")} listings shown on this page, of ${page.count.toLocaleString("en-US")} current openings as of ${checked}.`
          : `Current openings on this page, as of ${checked}.`,
      url,
      numberOfItems: page.listings.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: page.listings.map((j, i) =>
        listItem(i + 1, `${j.title} at ${j.source_type === "usajobs" && j.department ? j.department : j.organization_name}`, jobHref(j)),
      ),
    });
  }
  if (page.employers.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#employers`,
      name: `Employers with listings on “${page.h1}”`,
      description: `Organizations in the USASI catalog with current listings on this page, as of ${checked}.`,
      url,
      numberOfItems: page.employers.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: page.employers.map((e, i) => listItem(i + 1, e.name, orgHref(e.slug))),
    });
  }
  return { "@context": SCHEMA_CONTEXT, "@graph": graph };
}
