/**
 * Schema.org JSON-LD for search engines, built only from catalog fields.
 *
 * Every node carries "@context" and "@type"; every URL is absolute. Values
 * come from the records (names, official websites, license links, dates) and
 * nothing is added that a record does not state. scripts/postbuild.mjs parses
 * every block in the export and checks these rules.
 */
import type { Catalog } from "./catalog";
import { absoluteUrl } from "./paths";
import { stateFromHeadquarters, US_STATES } from "./places";
import { organizationSector } from "./people-index";
import { PERSON_SPECIALTY_LABELS } from "./people";
import { findSchoolMentions, personSchoolLinks, schoolBySlug } from "./people-schools";
import { personEnrichment, wikidataUrl } from "./people-wikidata";
import { artifactHref, orgHref } from "./routes";
import { COVERS, makersOf } from "./seo";
import type { Artifact, Leader, LicenseRecord, NewsItem, Organization, Person } from "./schema";
import { siteConfig } from "./site-config";

export const SCHEMA_CONTEXT = "https://schema.org";

export type JsonLdNode = { "@context"?: string; "@type": string; [key: string]: unknown };

export type Trail = { href: string; label: string }[];

/** Home, then each crumb, then (if different from the last crumb) the current page. */
export function breadcrumbTrail(items: Trail, current?: { href: string; label: string }): Trail {
  const trail = [{ href: "/", label: "Home" }, ...items];
  if (current && trail[trail.length - 1].href !== current.href) trail.push(current);
  return trail;
}

export function breadcrumbList(trail: Trail): JsonLdNode {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
  };
}

/** A list page: each entry links to its own page on this site. */
export function itemList({ name, path, items }: { name: string; path: string; items: { name: string; href: string }[] }): JsonLdNode {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: items.length,
    itemListElement: items.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, url: absoluteUrl(x.href) })),
  };
}

/** A directory page whose main entity is the list of items on it. */
export function collectionPage({ name, path, items }: { name: string; path: string; items: { name: string; href: string }[] }): JsonLdNode {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: itemList({ name, path, items }),
  };
}

const siteOrganization = () => ({ "@type": "Organization", "@id": `${absoluteUrl("/")}#organization`, name: siteConfig.name, url: absoluteUrl("/") });

/** Organization profile pages on hubs the record itself links: github.com/<org> or huggingface.co/<org>. */
function profileLinks(org: Organization): string[] {
  const urls = (org.profile?.resources ?? []).filter((r) => r.kind === "model-hub" || r.kind === "repository").map((r) => r.url);
  return [
    ...new Set(
      urls.filter((u) => {
        const url = new URL(u);
        return ["github.com", "huggingface.co"].includes(url.hostname) && url.pathname.split("/").filter(Boolean).length === 1;
      }),
    ),
  ];
}

/** The headquarters label as a postal address, split only where the label itself names "City, State". */
function postalAddress(org: Organization) {
  const hq = org.headquarters;
  if (!hq) return undefined;
  const code = stateFromHeadquarters(hq.label, hq.country);
  const parts = hq.label.split("(")[0].trim().split(",").map((p) => p.trim()).filter(Boolean);
  const locality = code && code !== "DC" && parts.length === 2 ? parts[0] : code === "DC" ? "Washington" : undefined;
  return {
    "@type": "PostalAddress",
    ...(locality ? { addressLocality: locality } : {}),
    ...(code && code !== "DC" ? { addressRegion: US_STATES[code] } : code === "DC" ? { addressRegion: "DC" } : {}),
    addressCountry: hq.country,
  };
}

const orgRef = (o: Organization) => ({ "@type": "Organization", name: o.name, url: o.website });

export function organizationLd(catalog: Catalog, org: Organization): JsonLdNode {
  const page = absoluteUrl(orgHref(org.slug));
  const parent = catalog.parentOrganization(org);
  const children = catalog.childOrganizations(org.slug);
  const sameAs = profileLinks(org);
  const address = postalAddress(org);
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    "@id": `${page}#organization`,
    name: org.name,
    ...(org.legal_name ? { legalName: org.legal_name.text } : {}),
    url: org.website,
    description: org.summary.text,
    mainEntityOfPage: page,
    ...(sameAs.length ? { sameAs } : {}),
    ...(org.founded ? { foundingDate: String(org.founded.year) } : {}),
    ...(address ? { address } : {}),
    ...(parent ? { parentOrganization: orgRef(parent) } : {}),
    ...(children.length ? { subOrganization: children.map(orgRef) } : {}),
  };
}

const SOFTWARE_KINDS: Artifact["kind"][] = ["framework", "runtime", "research-stack"];

/** A license as a URL: the record's license link, else the SPDX page for its identifier. */
function licenseUrl(l: LicenseRecord): string | undefined {
  if (l.url) return l.url;
  if (l.spdx && /^[A-Za-z0-9.+-]+$/.test(l.spdx)) return `https://spdx.org/licenses/${l.spdx}.html`;
  return undefined;
}

/** SoftwareSourceCode for software projects (frameworks, runtimes, research stacks); null for anything else. */
export function softwareSourceCodeLd(catalog: Catalog, a: Artifact): JsonLdNode | null {
  if (!SOFTWARE_KINDS.includes(a.kind)) return null;
  const page = absoluteUrl(artifactHref(a.slug));
  const repo = a.links.find((l) => l.kind === "repository")?.url;
  const site = a.links.find((l) => l.kind === "website")?.url;
  const codeLicenses = a.licenses.filter((l) => COVERS.code.includes(l.applies_to));
  const licenses = [...new Set((codeLicenses.length ? codeLicenses : a.licenses).map(licenseUrl).filter((u): u is string => Boolean(u)))];
  const orgs = a.organization_slugs.filter((s) => catalog.isActiveOrganization(s)).map((s) => catalog.organization(s)!);
  const maintainers = orgs.length ? orgs.map(orgRef) : makersOf(catalog, a).map((name) => ({ "@type": "Organization", name }));
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "SoftwareSourceCode",
    "@id": `${page}#software`,
    name: a.name,
    description: a.summary.text,
    mainEntityOfPage: page,
    ...(site ? { url: site } : {}),
    ...(repo ? { codeRepository: repo } : {}),
    ...(licenses.length ? { license: licenses.length === 1 ? licenses[0] : licenses } : {}),
    ...(a.version ? { version: a.version } : {}),
    ...(a.released_at ? { datePublished: a.released_at } : {}),
    maintainer: maintainers,
  };
}

/** Person (inside a ProfilePage) for a People Behind Big SI profile. */
export function leaderLd(catalog: Catalog, l: Leader): JsonLdNode {
  const page = absoluteUrl(`/big-si/${l.slug}/`);
  const worksFor = l.current_roles.map((r) => {
    const org = r.organization_slug && catalog.isActiveOrganization(r.organization_slug) ? catalog.organization(r.organization_slug) : undefined;
    return { "@type": "Organization", name: r.organization, ...(org ? { url: org.website } : {}) };
  });
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ProfilePage",
    url: page,
    dateModified: l.updated_at,
    mainEntity: {
      "@type": "Person",
      "@id": `${page}#person`,
      name: l.name,
      description: l.summary.text,
      ...(l.current_roles[0] ? { jobTitle: l.current_roles[0].role } : {}),
      worksFor,
      ...(l.links.length ? { sameAs: l.links.map((x) => x.url) } : {}),
    },
  };
}

function orgNode(catalog: Catalog, name: string, slug: string | null | undefined, type = "Organization") {
  const org = slug && catalog.isActiveOrganization(slug) ? catalog.organization(slug) : undefined;
  return { "@type": type, name: org?.name ?? name, ...(org ? { url: org.website } : {}) };
}

function isAcademicEmployer(catalog: Catalog, name: string, slug: string | null): boolean {
  if (organizationSector(catalog, slug) === "academic") return true;
  if (findSchoolMentions(name).length) return true;
  return /universit|college|institute of technology/i.test(name);
}

/** A People directory profile as a ProfilePage about a Person, from the profile's own fields. */
export function personLd(catalog: Catalog, p: Person): JsonLdNode {
  const page = absoluteUrl(`/people/${p.slug}/`);
  const current = p.affiliations.filter((a) => a.current);
  const worksFor = current.map((a) => orgNode(catalog, a.name, a.organization_slug));
  const extra = personEnrichment(p.slug);
  const sameAs = [...p.links.map((x) => x.url), extra?.qid ? wikidataUrl(extra.qid) : null, extra?.wikipedia].filter((u): u is string => Boolean(u));
  const alumni = personSchoolLinks(p)
    .filter((s) => s.kind === "education")
    .map((s) => orgNode(catalog, s.name, schoolBySlug(s.slug)?.organizationSlug ?? null, "CollegeOrUniversity"));
  const affiliation = current
    .filter((a) => isAcademicEmployer(catalog, a.name, a.organization_slug))
    .map((a) => orgNode(catalog, a.name, a.organization_slug, "CollegeOrUniversity"));
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ProfilePage",
    url: page,
    dateModified: p.updated_at,
    mainEntity: {
      "@type": "Person",
      "@id": `${page}#person`,
      name: p.name,
      description: p.headline,
      ...(current[0] ? { jobTitle: current[0].role } : {}),
      ...(worksFor.length ? { worksFor } : {}),
      ...(affiliation.length ? { affiliation } : {}),
      ...(alumni.length ? { alumniOf: alumni } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      ...(extra?.image ? { image: extra.image.thumb_url } : {}),
      ...(p.specialties.length ? { knowsAbout: p.specialties.map((sp) => PERSON_SPECIALTY_LABELS[sp]) } : {}),
      ...(p.honors.length ? { award: p.honors.map((h) => (h.year ? `${h.name} (${h.year})` : h.name)) } : {}),
    },
  };
}

/** Where the catalog's CSV tables are published, from scripts/hf-dataset.ts. */
export const HF_DATASET_URL = "https://huggingface.co/datasets/usasihq/usasi-catalog";
const HF_CSV_FILES = ["organizations.csv", "artifacts.csv", "news.csv"];
export const CATALOG_DATASET_ID = () => `${absoluteUrl("/reuse/")}#dataset`;

/** The catalog itself as a Dataset: the site's JSON export and the CSV tables on Hugging Face, under CC BY 4.0. */
export function catalogDatasetLd(catalog: Catalog): JsonLdNode {
  const lastUpdated = [...catalog.organizations, ...catalog.artifacts].map((r) => r.updated_at).sort().at(-1);
  const counts = catalog.counts();
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Dataset",
    "@id": CATALOG_DATASET_ID(),
    name: "USASI catalog",
    description: `Published USASI records of ${counts.organizations} U.S. AI organizations and ${catalog.artifacts.length} U.S.-led open models, software projects, datasets, and evaluation tools, with a cited source for every claim.`,
    url: absoluteUrl("/reuse/"),
    sameAs: HF_DATASET_URL,
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    inLanguage: "en-US",
    creator: siteOrganization(),
    ...(lastUpdated ? { dateModified: lastUpdated } : {}),
    distribution: [
      { "@type": "DataDownload", name: "catalog.json", encodingFormat: "application/json", contentUrl: absoluteUrl("/data/catalog.json") },
      ...HF_CSV_FILES.map((f) => ({ "@type": "DataDownload", name: f, encodingFormat: "text/csv", contentUrl: `${HF_DATASET_URL}/resolve/main/${f}` })),
    ],
  };
}

/** A dated news item as NewsArticle: headline, dates, and the page URL. */
export function newsArticleLd(item: NewsItem): JsonLdNode {
  const page = absoluteUrl(`/news/${item.slug}/`);
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "NewsArticle",
    headline: item.title,
    datePublished: item.published_at.slice(0, 10),
    dateModified: item.updated_at.slice(0, 10),
    description: item.summary.text,
    mainEntityOfPage: page,
    url: page,
    author: siteOrganization(),
    publisher: siteOrganization(),
  };
}

/** Serialized for a <script type="application/ld+json">, with "<" escaped so content can never close the element. */
export const serializeJsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
