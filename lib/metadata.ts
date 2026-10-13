import type { Metadata } from "next";
import { absoluteUrl } from "./paths";
import { siteConfig } from "./site-config";

interface SocialImage {
  path: string;
  alt: string;
}

/** 1200×630 social preview cards. Alt text must describe what each card shows. */
export const socialImages = {
  /** Homepage artwork, from scripts/prepare-images.mjs. */
  site: {
    path: "/og.png",
    alt: "USASI artwork: night view of Earth, the Washington skyline, and an illustrative glowing network over a map of the United States.",
  },
  /** Open Models & Tools card, from scripts/social-cards.mjs. */
  open: {
    path: "/og-open.png",
    alt: "USASI Open Models & Tools: U.S.-led open models, software, datasets, and evaluation tools. Every entry records availability, license, maintainer, public materials, and sources.",
  },
} satisfies Record<string, SocialImage>;

interface PageMeta {
  /**
   * The page's own title. The " · USASI" suffix is added only while the whole
   * title stays within TITLE_MAX characters; longer titles stand alone so the
   * words people search for are not cut off in results.
   */
  title?: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: SocialImage;
  /** RSS feeds for this page, announced with <link rel="alternate">. */
  feeds?: { path: string; title: string }[];
}

/** Search results show about 60 characters of a title before cutting it off. */
export const TITLE_MAX = 60;
export const BRAND_SUFFIX = ` · ${siteConfig.shortName}`;

/** The title as it appears in the browser and in search results. */
export function documentTitle(title: string): string {
  return `${title}${BRAND_SUFFIX}`.length <= TITLE_MAX ? `${title}${BRAND_SUFFIX}` : title;
}

/**
 * Robots directives for every indexable page: allow large image previews and
 * full-length snippets. Pages marked noindex replace this entirely.
 */
export const INDEX_ROBOTS = {
  index: true,
  follow: true,
  "max-image-preview": "large",
  "max-snippet": -1,
  "max-video-preview": -1,
} as const satisfies NonNullable<Metadata["robots"]>;

export const NOINDEX_ROBOTS = { index: false, follow: true } as const satisfies NonNullable<Metadata["robots"]>;

/** Search engines show about 160 characters; longer descriptions are cut at a word boundary. */
export const DESCRIPTION_MAX = 160;

export function clipDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.\u2014-]+$/, "")}\u2026`;
}

/** Route-specific title, description, canonical URL, and social metadata. */
export function pageMetadata({ title, description: rawDescription, path, noindex, image = socialImages.site, feeds }: PageMeta): Metadata {
  const description = clipDescription(rawDescription);
  const fullTitle = title ? documentTitle(title) : `${siteConfig.name} (${siteConfig.shortName})`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image.path);
  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      ...(feeds?.length ? { types: { "application/rss+xml": feeds.map((f) => ({ url: absoluteUrl(f.path), title: f.title })) } } : {}),
    },
    robots: noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@Shadowfetch",
      title: fullTitle,
      description,
      images: [{ url: imageUrl, alt: image.alt }],
    },
  };
}
