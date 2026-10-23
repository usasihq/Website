/**
 * Schema.org JSON-LD for search engines, built only from catalog fields.
 *
 * Every node carries "@context" and "@type"; every URL is absolute. Values
 * come from the records (names, official websites, license links, dates) and
 * nothing is added that a record does not state. scripts/postbuild.mjs parses
 * every block in the export and checks these rules.
 */
import type { Catalog } from "./catalog";
import { organizationLogoFields } from "./org-logos";
import { absoluteUrl } from "./paths";
import { stateFromHeadquarters, US_STATES } from "./places";
import { artifactHref, orgHref } from "./routes";
import { COVERS, makersOf } from "./seo";
import type { Artifact, LicenseRecord, NewsItem, Organization } from "./schema";
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
    logo: organizationLogoFields(org).logo,
    description: org.summary.text,
    mainEntityOfPage: page,
    ...(sameAs.length ? { sameAs } : {}),
    ...(org.founded ? { foundingDate: String(org.founded.year) } : {}),
    ...(address ? { address } : {}),
    ...(parent ? { parentOrganization: orgRef(parent) } : {}),
    ...(children.length ? { subOrganization: children.map(orgRef) } : {}),
  };
}

const SOFTWARE_KINDS: Artifact["kind"][] = ["framework", "runtime", "research-stack", "eval"];

/** A license as a URL: the record's license link, else the SPDX page for its identifier. */
function licenseUrl(l: LicenseRecord): string | undefined {
  if (l.url) return l.url;
  if (l.spdx && /^[A-Za-z0-9.+-]+$/.test(l.spdx)) return `https://spdx.org/licenses/${l.spdx}.html`;
  return undefined;
}

/** License URLs for the part of an artifact a node describes, falling back to all of its licenses. */
function licenseField(a: Artifact, primary: keyof typeof COVERS) {
  const scoped = a.licenses.filter((l) => COVERS[primary].includes(l.applies_to));
  const urls = [...new Set((scoped.length ? scoped : a.licenses).map(licenseUrl).filter((u): u is string => Boolean(u)))];
  return urls.length ? { license: urls.length === 1 ? urls[0] : urls } : {};
}

/**
 * Schema.org node for an Open Models & Tools page: SoftwareSourceCode for
 * software projects and evaluation tools, Dataset for datasets, and
 * CreativeWork for models (schema.org has no model type).
 */
export function artifactLd(catalog: Catalog, a: Artifact): JsonLdNode {
  const page = absoluteUrl(artifactHref(a.slug));
  const link = (kind: string) => a.links.find((l) => l.kind === kind)?.url;
  const repo = link("repository");
  const site = link("website");
  const hubs = [...new Set([link("model-hub"), link("dataset-hub"), repo].filter((u): u is string => Boolean(u)))];
  const orgs = a.organization_slugs.filter((s) => catalog.isActiveOrganization(s)).map((s) => catalog.organization(s)!);
  const makers = orgs.length ? orgs.map(orgRef) : makersOf(catalog, a).map((name) => ({ "@type": "Organization", name }));
  const common = {
    "@context": SCHEMA_CONTEXT,
    name: a.name,
    description: a.summary.text,
    mainEntityOfPage: page,
    ...(a.version ? { version: a.version } : {}),
    ...(a.released_at ? { datePublished: a.released_at } : {}),
    dateModified: a.updated_at,
    ...(a.tags.length ? { keywords: a.tags.join(", ") } : {}),
  };
  if (SOFTWARE_KINDS.includes(a.kind)) {
    return {
      ...common,
      "@type": "SoftwareSourceCode",
      "@id": `${page}#software`,
      ...(site ? { url: site } : {}),
      ...(repo ? { codeRepository: repo } : {}),
      ...licenseField(a, "code"),
      maintainer: makers,
    };
  }
  if (a.kind === "dataset") {
    return {
      ...common,
      "@type": "Dataset",
      "@id": `${page}#dataset`,
      url: site ?? link("dataset-hub") ?? page,
      ...(hubs.length ? { sameAs: hubs } : {}),
      ...licenseField(a, "data"),
      creator: makers,
      isAccessibleForFree: true,
    };
  }
  return {
    ...common,
    "@type": "CreativeWork",
    "@id": `${page}#model`,
    genre: "Machine learning model",
    url: site ?? link("model-hub") ?? repo ?? page,
    ...(hubs.length ? { sameAs: hubs } : {}),
    ...licenseField(a, "weights"),
    creator: makers,
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
