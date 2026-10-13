/** Small schema.org builders shared by the memory and policy pages. */
import { absoluteUrl } from "./paths";

export type LdCrumb = { href: string; label: string };

/** BreadcrumbList for a page, starting at Home and ending with the page itself. */
export function breadcrumbList(crumbs: LdCrumb[]) {
  const items = [{ href: "/", label: "Home" }, ...crumbs];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
  };
}

/** JSON for an inline ld+json script; "<" is escaped so the text can never close the tag. */
export const ldJson = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
