import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { EXPLAINERS, LEARNING_PATHS } from "@/lib/learn";
import { absoluteUrl } from "@/lib/paths";
import { organizationsByState } from "@/lib/place-index";
import { stateSlug } from "@/lib/places";
import { artifactHref, orgHref } from "@/lib/routes";

export const dynamic = "force-static";

const STATIC_ROUTES = [
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

/**
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
    ...catalog.hubs.map((h) => ({ url: absoluteUrl(`/hubs/${h.slug}/`), lastModified: h.updated_at })),
    ...catalog.licenses.map((l) => ({ url: absoluteUrl(`/licenses/${l.slug}/`), lastModified: l.updated_at })),
    ...organizationsByState(catalog).states.map((st) => ({ url: absoluteUrl(`/places/${stateSlug(st.code)}/`) })),
  ];
}
