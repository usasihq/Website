import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/paths";
import { artifactHref, orgHref } from "@/lib/routes";

export const dynamic = "force-static";

const STATIC_ROUTES = [
  "/",
  "/companies/",
  "/open/",
  "/matrix/",
  "/methodology/",
  "/compact/",
  "/about/",
  "/disclaimer/",
  "/changelog/",
  "/contribute/",
  "/support/",
  "/privacy/",
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
  ];
}
