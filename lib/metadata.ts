import type { Metadata } from "next";
import { absoluteUrl } from "./paths";
import { siteConfig } from "./site-config";

interface PageMeta {
  title?: string;
  description: string;
  path: string;
  noindex?: boolean;
}

/** Route-specific title, description, canonical URL, and social metadata. */
export function pageMetadata({ title, description, path, noindex }: PageMeta): Metadata {
  const fullTitle = title ? `${title} · ${siteConfig.shortName}` : `${siteConfig.name} (${siteConfig.shortName})`;
  const url = absoluteUrl(path);
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
      images: [
        {
          url: absoluteUrl("/og.png"),
          width: 1200,
          height: 630,
          alt: "USASI artwork: night view of Earth, the Washington skyline, and an illustrative glowing network over a map of the United States.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@usasihq",
      title: fullTitle,
      description,
      images: [absoluteUrl("/og.png")],
    },
  };
}
