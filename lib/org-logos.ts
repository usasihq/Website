/**
 * One crawlable square logo per catalog organization.
 *
 * Checked-in company-site marks live in assets/org-logos/<slug>.png.
 * `scripts/generate-org-logos.ts` copies those (or draws a 128×128 monogram)
 * into public/images/orgs/<slug>.png at prepare:data, so the static export
 * always has a ≥112×112 PNG Google can fetch. The build never downloads logos.
 */
import { absoluteUrl } from "./paths";
import type { Organization } from "./schema";

export const ORG_LOGO_SIZE = 128;
export const ORG_LOGO_PUBLIC_DIR = "/images/orgs";

export function orgLogoHref(slug: string): string {
  return `${ORG_LOGO_PUBLIC_DIR}/${slug}.png`;
}

export function orgLogoAbsoluteUrl(slug: string): string {
  return absoluteUrl(orgLogoHref(slug));
}

/** hiringOrganization / Organization logo fields from a catalog record. */
export function organizationLogoFields(org: Pick<Organization, "slug" | "name" | "website">): {
  url: string;
  sameAs: string;
  logo: string;
} {
  return { url: org.website, sameAs: org.website, logo: orgLogoAbsoluteUrl(org.slug) };
}
