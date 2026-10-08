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
  title?: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: SocialImage;
}

/** Route-specific title, description, canonical URL, and social metadata. */
export function pageMetadata({ title, description, path, noindex, image = socialImages.site }: PageMeta): Metadata {
  const fullTitle = title ? `${title} · ${siteConfig.shortName}` : `${siteConfig.name} (${siteConfig.shortName})`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image.path);
  return {
    title: title ? title : { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
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
      site: "@usasihq",
      title: fullTitle,
      description,
      images: [{ url: imageUrl, alt: image.alt }],
    },
  };
}
