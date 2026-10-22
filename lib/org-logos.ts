/**
 * One crawlable square logo per catalog organization.
 *
 * Checked-in company-site marks live in assets/org-logos/<slug>.png.
 * `scripts/generate-org-logos.ts` copies those (or draws a 128×128 monogram)
 * into public/images/orgs/<slug>.png at prepare:data, so the static export
 * always has a ≥112×112 PNG Google can fetch. The build never downloads logos.
 */
import { absoluteUrl } from "./paths";
import { orgHref } from "./routes";
import type { Organization } from "./schema";

export const ORG_LOGO_SIZE = 128;
export const ORG_LOGO_PUBLIC_DIR = "/images/orgs";

export function orgLogoHref(slug: string): string {
  return `${ORG_LOGO_PUBLIC_DIR}/${slug}.png`;
}

export function orgLogoAbsoluteUrl(slug: string): string {
  return absoluteUrl(orgLogoHref(slug));
}

/** Official employer site only. Empty, relative, or non-https values are unknown. */
export function officialWebsite(website: string | null | undefined): string | null {
  const value = website?.trim() ?? "";
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.includes(".")) return null;
    return value;
  } catch {
    return null;
  }
}

/**
 * hiringOrganization fields from a catalog record.
 * `url` is the official website, or this site's company page when none is known.
 * `sameAs` is only the official website — never a USASI URL or an invented domain.
 */
export function organizationLogoFields(org: Pick<Organization, "slug" | "name"> & { website?: string | null }): {
  url: string;
  sameAs?: string;
  logo: string;
} {
  const official = officialWebsite(org.website);
  return {
    url: official ?? absoluteUrl(orgHref(org.slug)),
    ...(official ? { sameAs: official } : {}),
    logo: orgLogoAbsoluteUrl(org.slug),
  };
}
