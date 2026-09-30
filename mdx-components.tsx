import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";

/**
 * MDX is compiled at build time from trusted repository files only
 * (content/pages). Internal links use next/link so the base path applies;
 * external links are marked as external.
 */
function MdxLink({ href = "", children }: { href?: string; children?: React.ReactNode }) {
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  if (href.startsWith("#")) return <a href={href}>{children}</a>;
  if (href.startsWith("https://")) return <ExternalLink href={href} className="">{children}</ExternalLink>;
  return <span>{children}</span>;
}

/** Scrollable code blocks must be reachable by keyboard. */
function MdxPre(props: React.ComponentProps<"pre">) {
  return <pre tabIndex={0} {...props} />;
}

const components: MDXComponents = {
  a: MdxLink,
  pre: MdxPre,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
