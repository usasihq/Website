import { MEMORY_PAGES } from "./hardware";
import { KID_LESSONS } from "./kids";

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
  "/people/",
  "/news/",
  "/newsletter/",
  "/badges/",
  "/feeds/",
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
  "/find/memory/",
  "/kids/",
  "/kids/words/",
  "/kids/grown-ups/",
  "/kids/packet/",
  "/big-si/",
  "/report/",
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
  /** Published policy documents, each with a page at /policy/<slug>/. */
  policy?: Set<string>;
  /** Published People profiles, each at /people/<slug>/. */
  people?: Set<string>;
  /** Published editions of The State of American AI, each at /report/<YYYY-MM>/. */
  reports?: Set<string>;
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
  if (p) return slugs.paths.has(p[1]);
  const pol = path.match(/^\/policy\/([a-z0-9-]+)\/$/);
  if (pol) return Boolean(slugs.policy?.has(pol[1]));
  const per = path.match(/^\/people\/([a-z0-9-]+)\/$/);
  if (per) return Boolean(slugs.people?.has(per[1]));
  const rep = path.match(/^\/report\/(\d{4}-\d{2})\/$/);
  if (rep) return Boolean(slugs.reports?.has(rep[1]));
  const mem = path.match(/^\/find\/memory\/([a-z0-9-]+)\/$/);
  if (mem) return MEMORY_PAGES.some((x) => x.slug === mem[1]);
  const k = path.match(/^\/kids\/([a-z0-9-]+)\/$/);
  return Boolean(k && KID_LESSONS.some((l) => l.slug === k[1]));
}
