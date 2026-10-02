/**
 * The source library: every source cited by a published record, news item, hub,
 * or People Behind Local AI profile, deduplicated by URL, with the records that
 * cite it. Built from existing citations only; nothing is added by hand.
 */
import type { Catalog } from "./catalog";
import { artifactHref, orgHref } from "./routes";
import type { Source } from "./schema";

export type LibraryEntry = {
  url: string;
  title: string;
  publisher: string;
  kind: string | null;
  published_at: string | null;
  accessed_at: string;
  cited_by: Array<{ name: string; href: string }>;
};

export function sourceLibrary(catalog: Catalog): LibraryEntry[] {
  const byUrl = new Map<string, LibraryEntry>();
  const add = (s: Source, name: string, href: string) => {
    const e = byUrl.get(s.url);
    if (!e) {
      byUrl.set(s.url, { url: s.url, title: s.title, publisher: s.publisher, kind: s.kind ?? null, published_at: s.published_at ?? null, accessed_at: s.accessed_at, cited_by: [{ name, href }] });
      return;
    }
    if (s.accessed_at > e.accessed_at) e.accessed_at = s.accessed_at;
    if (!e.cited_by.some((c) => c.href === href)) e.cited_by.push({ name, href });
  };
  for (const o of catalog.organizations) for (const s of o.sources) add(s, o.name, orgHref(o.slug));
  for (const a of catalog.artifacts) for (const s of a.sources) add(s, a.name, artifactHref(a.slug));
  for (const p of catalog.people) for (const s of p.sources) add(s, p.name, `/local/#${p.slug}`);
  for (const n of catalog.news) for (const s of n.sources) add(s, n.title, `/news/${n.slug}/`);
  for (const h of catalog.hubs) for (const s of h.sources) add(s, h.title, `/hubs/${h.slug}/`);
  return [...byUrl.values()].sort((a, b) => a.title.localeCompare(b.title, "en"));
}
