import type { AnchorHTMLAttributes, Ref } from "react";
import { asset } from "@/lib/paths";

/**
 * The site's internal link: a plain <a>. Every page is a complete static HTML
 * file, so following a link is an ordinary page load. Next.js's <Link> would
 * instead fetch a per-page RSC payload (index.txt and __next.*.txt files) for
 * client-side navigation and prefetching; the export drops those ~7,000 files
 * to stay inside Cloudflare's per-deployment file limit (scripts/postbuild.mjs).
 * Like next/link, a site-relative href gets the base path.
 */
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  /** Accepted for compatibility with next/link call sites; plain links never prefetch. */
  prefetch?: boolean;
  ref?: Ref<HTMLAnchorElement>;
};

export default function Link({ href, prefetch: _prefetch, ...rest }: Props) {
  void _prefetch;
  return <a href={href.startsWith("/") && !href.startsWith("//") ? asset(href) : href} {...rest} />;
}
