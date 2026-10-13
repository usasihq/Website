/**
 * Page metadata, structured data, and preview cards for report editions.
 * Build-time only.
 */
import type { Catalog } from "./catalog";
import { pageMetadata } from "./metadata";
import { reportCard } from "./page-cards";
import { absoluteUrl } from "./paths";
import { editionDataHref, editionHref, editionLabel, REPORT_HREF, REPORT_NAME, type ReportSnapshot } from "./report";
import { breadcrumbList, breadcrumbTrail, CATALOG_DATASET_ID, SCHEMA_CONTEXT } from "./structured-data";
import { composeDescription, fitTitle } from "./seo";
import { siteConfig } from "./site-config";

const nf = (v: number) => v.toLocaleString("en-US");
const total = (s: ReportSnapshot, k: string) => s.totals.find((t) => t.key === k)?.value ?? 0;

export function reportDescription(s: ReportSnapshot): string {
  const jobs = s.totals.some((t) => t.key === "job_listings") ? `${nf(total(s, "job_listings"))} job listings, ` : "";
  return composeDescription(
    [
      `${editionLabel(s.edition)}: ${nf(total(s, "organizations"))} U.S. AI organization records, ${nf(total(s, "model_releases"))} model releases (${nf(total(s, "open_weight_releases"))} open-weight), licenses, local AI, ${jobs}and ${nf(total(s, "policy_documents"))} policy documents.`,
    ],
    ["Counted from the USASI catalog, with data downloads."],
  );
}

export function reportMetadata(s: ReportSnapshot, onLatestPage: boolean) {
  const card = reportCard(s);
  return pageMetadata({
    title: onLatestPage ? fitTitle([`${REPORT_NAME}: latest edition (${editionLabel(s.edition)})`, `${REPORT_NAME}: latest edition`]) : s.title,
    description: reportDescription(s),
    path: onLatestPage ? REPORT_HREF : editionHref(s.edition),
    image: { path: card.image, alt: card.alt },
  });
}

const siteOrg = () => ({ "@type": "Organization", "@id": `${absoluteUrl("/")}#organization`, name: siteConfig.name, url: absoluteUrl("/") });

/** Report (the article), Dataset (the downloads), and the breadcrumb trail. */
export function reportJsonLd(s: ReportSnapshot, onLatestPage: boolean, summary: string) {
  const page = absoluteUrl(onLatestPage ? REPORT_HREF : editionHref(s.edition));
  const permanent = absoluteUrl(editionHref(s.edition));
  const report = {
    "@type": "Report",
    "@id": `${permanent}#report`,
    name: s.title,
    headline: s.title,
    description: summary,
    url: permanent,
    mainEntityOfPage: page,
    datePublished: s.published,
    dateModified: s.published,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    license: s.license.url,
    author: siteOrg(),
    publisher: siteOrg(),
    isPartOf: { "@type": "CreativeWorkSeries", name: REPORT_NAME, url: absoluteUrl(REPORT_HREF) },
    isBasedOn: { "@id": CATALOG_DATASET_ID() },
    abstract: s.findings.map((f) => f.text).join(" "),
  };
  const dataset = {
    "@type": "Dataset",
    "@id": `${permanent}#data`,
    name: `${s.title}: figures`,
    description: `Every figure in ${s.title}, computed from published records in the USASI catalog on ${s.data_cutoff}: organizations by ownership, role, sector, headquarters state, and founding decade; open models and tools by kind, openness tier, weight availability, license, and release quarter; local AI configurations and memory figures; job listings by location and employer; and policy documents by type and status. Coverage is selective; counts describe the catalog, not a census.`,
    url: permanent,
    license: s.license.url,
    isAccessibleForFree: true,
    creator: siteOrg(),
    publisher: siteOrg(),
    datePublished: s.published,
    temporalCoverage: s.data_cutoff,
    isBasedOn: { "@id": CATALOG_DATASET_ID() },
    variableMeasured: s.tables.map((t) => t.title),
    distribution: [
      { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: absoluteUrl(editionDataHref(s.edition, "csv")) },
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: absoluteUrl(editionDataHref(s.edition, "json")) },
    ],
  };
  const trail = onLatestPage
    ? breadcrumbTrail([{ href: REPORT_HREF, label: REPORT_NAME }])
    : breadcrumbTrail([{ href: REPORT_HREF, label: REPORT_NAME }], { href: editionHref(s.edition), label: editionLabel(s.edition) });
  return { "@context": SCHEMA_CONTEXT, "@graph": [report, dataset, breadcrumbList(trail)] };
}

/** Names for records an edition lists, from the live catalog (null once a record is gone). */
export function reportNames(catalog: Catalog) {
  return {
    organization: (slug: string) => (catalog.isActiveOrganization(slug) ? catalog.organization(slug)!.name : null),
    artifact: (slug: string) => (catalog.isActiveArtifact(slug) ? catalog.artifact(slug)!.name : null),
    finder: (slug: string) => catalog.finder.find((c) => c.slug === slug)?.title ?? null,
  };
}
