/**
 * Search entries for reference pages, so site search covers hubs, explainers,
 * glossary terms, People Behind Local AI, and headquarters states as well as
 * the two directories. Only published content is indexed.
 */
import type { Catalog } from "./catalog";
import type { EntryType } from "./labels";
import { EXPLAINERS } from "./learn";
import { organizationsByState } from "./place-index";
import { stateSlug } from "./places";
import type { SearchEntry } from "./search";

export type GlossaryTerm = { id: string; term: string; definition: string };

/** Glossary entries from content/pages/glossary.mdx: each `<h2 id>` heading and its first paragraph. */
export function parseGlossary(mdx: string): GlossaryTerm[] {
  const out: GlossaryTerm[] = [];
  const re = /<h2 id="([a-z0-9-]+)">([^<]+)<\/h2>\s*\n+([^\n<][^\n]*)/g;
  for (const m of mdx.matchAll(re)) {
    const definition = m[3].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
    out.push({ id: m[1], term: m[2].trim(), definition });
  }
  return out;
}

export function referenceSearchEntries(catalog: Catalog, glossary: GlossaryTerm[]): SearchEntry[] {
  const e = (type: EntryType, slug: string, href: string, name: string, summary: string, keywords = ""): SearchEntry => ({ type, slug, href, name, summary, keywords });
  return [
    ...catalog.hubs.map((h) => e("hub", h.slug, `/hubs/${h.slug}/`, h.title, h.summary, h.scope)),
    ...EXPLAINERS.map((x) => e("explainer", x.slug, `/learn/${x.slug}/`, x.title, x.question)),
    ...glossary.map((g) => e("glossary-term", g.id, `/glossary/#${g.id}`, g.term, g.definition, "glossary term definition")),
    ...catalog.people.map((p) => e("person", p.slug, `/local/#${p.slug}`, p.name, p.headline, p.affiliations.map((a) => a.name).join(" "))),
    ...organizationsByState(catalog).states.map((s) =>
      e("place", stateSlug(s.code), `/places/${stateSlug(s.code)}/`, s.name, `Organizations headquartered in ${s.name}`, "state headquarters place"),
    ),
  ];
}
