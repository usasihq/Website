/**
 * Fixed site pages (no slug). Shared by the sitemap and by validation of
 * internal links in weekly email issues.
 */
export const STATIC_ROUTES = [
  "/",
  "/companies/",
  "/open/",
  "/jobs/",
  "/matrix/",
  "/methodology/",
  "/compact/",
  "/about/",
  "/disclaimer/",
  "/changelog/",
  "/contribute/",
  "/support/",
  "/privacy/",
  "/local/",
  "/news/",
  "/newsletter/",
  "/badges/",
  "/start/",
  "/glossary/",
  "/reuse/",
  "/learn/",
  "/hubs/",
  "/places/",
  "/timeline/",
  "/sources/",
  "/licenses/",
  "/policy/",
  "/learn/tools/model-size/",
  "/faq/",
  "/find/",
];

/** Sets of slugs that make up the slugged sections of the site. */
export type SiteSlugs = {
  organizations: Set<string>;
  artifacts: Set<string>;
  news: Set<string>;
  hubs: Set<string>;
  licenses: Set<string>;
  explainers: Set<string>;
  paths: Set<string>;
  issues: Set<string>;
};

/** Whether an internal path (query and fragment ignored) names a page the site builds. */
export function isKnownSitePath(href: string, slugs: SiteSlugs): boolean {
  const path = href.split(/[?#]/)[0];
  if (STATIC_ROUTES.includes(path)) return true;
  const m = path.match(/^\/(companies|open|news|hubs|licenses|learn|newsletter)\/([a-z0-9-]+)\/$/);
  if (m) {
    const [, section, slug] = m;
    const set = { companies: slugs.organizations, open: slugs.artifacts, news: slugs.news, hubs: slugs.hubs, licenses: slugs.licenses, learn: slugs.explainers, newsletter: slugs.issues }[section]!;
    return set.has(slug);
  }
  const p = path.match(/^\/learn\/paths\/([a-z0-9-]+)\/$/);
  return Boolean(p && slugs.paths.has(p[1]));
}
