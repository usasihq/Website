import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { MEMORY_PAGES, memoryPageHref, memoryPageIndexable } from "@/lib/hardware";
import { githubSitemap } from "@/lib/github/projects";
import { hfSitemap } from "@/lib/huggingface/items";
import { jobLandingSitemap } from "@/lib/jobs/landing-links";
import { layoffSitemap } from "@/lib/jobs/layoffs";
import { paySitemap } from "@/lib/jobs/pay";
import { KID_LESSONS, KIDS_REVIEWED } from "@/lib/kids";
import { EXPLAINERS, LEARNING_PATHS } from "@/lib/learn";
import { absoluteUrl } from "@/lib/paths";
import { organizationsByState } from "@/lib/place-index";
import { stateSlug } from "@/lib/places";
import { policyHref } from "@/lib/policy";
import { editionHref } from "@/lib/report";
import { reportEditions } from "@/lib/report-editions";
import { artifactHref, orgHref } from "@/lib/routes";
import { STATIC_ROUTES } from "@/lib/site-routes";

export const dynamic = "force-static";

/**
 * The site's pages except individual job pages. The build renames this file to
 * /sitemap-pages.xml and writes /sitemap.xml as a sitemap index of it and the
 * job-page sitemaps (/sitemaps/jobs-<n>.xml, 10,000 URLs each; see
 * scripts/job-pages.ts), so no file nears the 50,000-URL limit. AI on GitHub's
 * project pages (about 9,500) and AI on Hugging Face's model and dataset pages
 * (about 5,700) stay in this file, which keeps it near 17,000 URLs; give them
 * their own chunk under /sitemaps/ if the total ever passes about 30,000.
 *
 * Only active (published + eligible) records. Drafts never exist as pages;
 * archived pages exist but are noindex and excluded here. Record entries use
 * `updated_at`, the date of the last substantive edit — never the build date.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = getCatalog();
  return [
    ...STATIC_ROUTES.map((path) => ({ url: absoluteUrl(path) })),
    ...catalog.organizations.map((o) => ({ url: absoluteUrl(orgHref(o.slug)), lastModified: o.updated_at })),
    ...catalog.artifacts.map((a) => ({ url: absoluteUrl(artifactHref(a.slug)), lastModified: a.updated_at })),
    ...catalog.news.map((n) => ({ url: absoluteUrl(`/news/${n.slug}/`), lastModified: n.updated_at })),
    ...EXPLAINERS.map((e) => ({ url: absoluteUrl(`/learn/${e.slug}/`), lastModified: e.reviewed })),
    ...LEARNING_PATHS.map((p) => ({ url: absoluteUrl(`/learn/paths/${p.id}/`) })),
    ...KID_LESSONS.map((l) => ({ url: absoluteUrl(`/kids/${l.slug}/`), lastModified: KIDS_REVIEWED })),
    ...catalog.hubs.map((h) => ({ url: absoluteUrl(`/hubs/${h.slug}/`), lastModified: h.updated_at })),
    ...catalog.licenses.map((l) => ({ url: absoluteUrl(`/licenses/${l.slug}/`), lastModified: l.updated_at })),
    ...catalog.leaders.map((l) => ({ url: absoluteUrl(`/big-si/${l.slug}/`), lastModified: l.updated_at })),
    ...catalog.people.map((p) => ({ url: absoluteUrl(`/people/${p.slug}/`), lastModified: p.updated_at })),
    ...catalog.newsletter.map((n) => ({ url: absoluteUrl(`/newsletter/${n.slug}/`), lastModified: n.sent_at })),
    ...organizationsByState(catalog).states.map((st) => ({ url: absoluteUrl(`/places/${stateSlug(st.code)}/`) })),
    ...catalog.policy.map((d) => ({ url: absoluteUrl(policyHref(d.slug)), lastModified: d.updated_at })),
    // Report editions are permanent; each is dated by its publication.
    ...reportEditions().map((e) => ({ url: absoluteUrl(editionHref(e.edition)), lastModified: e.published })),
    ...MEMORY_PAGES.filter((p) => memoryPageIndexable(catalog.finder, p)).map((p) => ({ url: absoluteUrl(memoryPageHref(p)) })),
    // AI on GitHub ranking pages and project pages, dated by the last GitHub API fetch.
    ...githubSitemap().map((p) => ({ url: absoluteUrl(p.path), lastModified: p.lastModified })),
    // AI on Hugging Face: the datasets index, ranking pages, and item pages, dated by the last Hub API fetch.
    ...hfSitemap().map((p) => ({ url: absoluteUrl(p.path), lastModified: p.lastModified })),
    // Jobs landing pages (only those with enough listings to index), dated by the newest listing they gained.
    ...jobLandingSitemap(catalog).map((p) => ({ url: absoluteUrl(p.path), lastModified: p.lastModified })),
    // AI pay role pages, dated by the newest listing with pay.
    ...paySitemap(catalog).map((p) => ({ url: absoluteUrl(p.path), lastModified: p.lastModified })),
    // WARN Act layoff pages, dated by the last successful fetch of that state's notices.
    ...layoffSitemap(catalog).map((p) => ({ url: absoluteUrl(p.path), lastModified: p.lastModified })),
  ];
}
