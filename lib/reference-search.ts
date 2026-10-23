/**
 * Search entries for reference pages, so site search covers hubs, explainers,
 * learning paths, kids lessons, glossary terms, news, weekly email issues,
 * headquarters states, and the site's own pages as
 * well as the two directories. Only published content is indexed.
 */
import type { Catalog } from "./catalog";
import { appleMac, MEMORY_PAGES, memoryPageHref, memoryPageTitle } from "./hardware";
import type { EntryType } from "./labels";
import { KID_LESSONS } from "./kids";
import { EXPLAINERS, LEARNING_PATHS } from "./learn";
import { organizationsByState } from "./place-index";
import { stateSlug } from "./places";
import { longIdentifier, policyHref } from "./policy";
import { editionHref, editionLabel } from "./report";
import { reportEditions } from "./report-editions";
import { stateTitle } from "./seo";
import type { SearchEntry } from "./search";
import { plainText } from "./plain-text";
import { githubSearchEntries } from "./github/projects";
import { hfSearchEntries } from "./huggingface/items";

export type GlossaryTerm = { id: string; term: string; definition: string };

/** Fixed pages worth finding by name, with words people might type for them. */
export const SITE_PAGES: { href: string; name: string; summary: string; keywords: string }[] = [
  { href: "/start/", name: "Start here", summary: "Four ways into the catalog, and a checklist before you use a model or tool.", keywords: "new begin intro overview guide tour" },
  { href: "/companies/", name: "Companies & Labs", summary: "Directory of U.S. AI organizations: labs, companies, universities, agencies, and nonprofits.", keywords: "organizations directory labs list" },
  { href: "/github/", name: "AI on GitHub", summary: "The most-starred open-source AI projects on GitHub, ranked by stars, each with its own page.", keywords: "github repositories repos open source projects stars popular llm agents frameworks code" },
  { href: "/huggingface/", name: "AI on Hugging Face", summary: "The most-liked open models on the Hugging Face Hub, ranked by likes, each with its own page.", keywords: "hugging face huggingface hub models open weights likes popular llm gguf quantized checkpoints" },
  { href: "/huggingface/datasets/", name: "AI on Hugging Face: datasets", summary: "The most-liked datasets on the Hugging Face Hub, ranked by likes, each with its own page.", keywords: "hugging face huggingface hub datasets training data benchmarks corpora likes" },
  { href: "/open/", name: "Open Models & Tools", summary: "Directory of U.S.-led open models, software, datasets, and evaluation tools.", keywords: "models tools directory open weights list" },
  { href: "/learn/", name: "Learn", summary: "Plain-language explainers, learning paths, and tools about how AI works.", keywords: "explainers guides education courses" },
  { href: "/kids/", name: "AI and Super Intelligence for kids", summary: "Seven short lessons for readers about 8 to 12, with activities and quizzes.", keywords: "children kids students school lessons classroom teachers parents" },
  { href: "/kids/words/", name: "Words to know (for kids)", summary: "Simple meanings of AI words for young readers.", keywords: "kids vocabulary words children" },
  { href: "/kids/packet/", name: "Printable classroom packet (kids lessons)", summary: "All seven kids lessons on one printable page, with paper quizzes and an answer key.", keywords: "print printable worksheet classroom teachers packet kids pdf" },
  { href: "/kids/grown-ups/", name: "For parents and teachers", summary: "How the kids lessons were made, their sources, and ideas for talking together.", keywords: "parents teachers classroom educators kids" },
  { href: "/matrix/", name: "Compare", summary: "Compare open models and tools side by side on documented facts.", keywords: "matrix comparison side by side" },
  { href: "/news/", name: "Latest news", summary: "Sourced news items about U.S. AI organizations, models, and policy.", keywords: "news updates announcements" },
  { href: "/newsletter/", name: "The USASI weekly", summary: "A free weekly email summarizing what changed in the catalog.", keywords: "newsletter email subscribe weekly digest" },
  { href: "/policy/", name: "Policy tracker", summary: "U.S. federal AI laws, executive orders, and standards, from official sources.", keywords: "policy law executive order regulation standards government" },
  { href: "/glossary/", name: "Glossary", summary: "Definitions of AI terms used across the site.", keywords: "definitions terms dictionary vocabulary" },
  { href: "/faq/", name: "FAQ", summary: "Answers to common questions about USASI and the catalog.", keywords: "questions answers help" },
  { href: "/hubs/", name: "Hubs", summary: "Topic hubs that gather records, explainers, and sources on one subject.", keywords: "topics subjects collections" },
  { href: "/places/", name: "Places", summary: "Organizations in the catalog by the U.S. state of their documented headquarters.", keywords: "states map locations geography headquarters" },
  { href: "/timeline/", name: "Timeline", summary: "Dated events from the catalog's records, in order.", keywords: "history dates chronology events" },
  { href: "/sources/", name: "Source library", summary: "Every source the catalog cites, with the records that cite it.", keywords: "sources citations references documents" },
  { href: "/licenses/", name: "License guide", summary: "Plain-language guides to the licenses open models and tools use.", keywords: "licenses apache mit llama terms legal" },
  { href: "/find/", name: "Model finder", summary: "Answer a few questions to find open models that fit your task and hardware.", keywords: "finder recommend choose pick gpu vram local" },
  { href: "/find/memory/", name: "Local AI by memory", summary: "Documented local configurations that fit 8 to 24 GB of VRAM or an Apple silicon Mac's unified memory.", keywords: "vram gpu graphics memory ram unified apple silicon mac local run hardware 8gb 12gb 16gb 24gb 32gb 64gb" },
  { href: "/learn/tools/model-size/", name: "Model size calculator", summary: "Estimate the memory a model needs at different precisions.", keywords: "calculator vram memory gpu quantization size" },
  { href: "/methodology/", name: "Methodology", summary: "Eligibility, openness ratings, source standards, review levels, and how counts work.", keywords: "method rubric criteria openness tiers how" },
  { href: "/compact/", name: "USASI Compact", summary: "What the project is, how it weighs American control and inspectability, and its draft editorial clauses.", keywords: "principles commitments compact editorial clauses" },
  { href: "/about/", name: "About", summary: "What USASI is and is not, who maintains it, and how to get in touch.", keywords: "about who contact project ownership" },
  { href: "/contribute/", name: "Contribute and corrections", summary: "Suggest a record or report an error.", keywords: "corrections errors suggest submit contribute report" },
  { href: "/report/", name: "The State of American AI", summary: "A dated, data-driven report on what the catalog records: organizations, open models and licenses, local AI, and policy, with CSV and JSON downloads.", keywords: "report state of american ai statistics numbers figures data research edition annual monthly cite journalists" },
  { href: "/reuse/", name: "Data & reuse", summary: "Download the catalog and reuse it under CC BY 4.0.", keywords: "data download csv json api dataset license reuse" },
  { href: "/feeds/", name: "RSS feeds", summary: "Subscribe to news, changes, and topics in a feed reader.", keywords: "rss atom feeds subscribe" },
  { href: "/badges/", name: "Badges for maintainers", summary: "Badges maintainers can add to a README: listed in the catalog, or a rank on AI on GitHub or Hugging Face.", keywords: "badge maintainers readme listed rank github huggingface" },
  { href: "/changelog/", name: "Changelog", summary: "What changed in the catalog and on the site, by date.", keywords: "changes updates history log" },
  { href: "/support/", name: "Support USASI", summary: "Optional tips, the sponsorship policy, and other ways to help.", keywords: "support tip donate help sponsorship" },
  { href: "/privacy/", name: "Privacy", summary: "What the site does with information: no cookies, no accounts.", keywords: "privacy cookies tracking analytics data" },
  { href: "/disclaimer/", name: "Disclaimer", summary: "USASI is an independent project, not a U.S. government website.", keywords: "disclaimer legal independent government" },
];

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

/** FAQ entries from content/pages/faq.mdx: each `<h3 id>` question and the first paragraph of its answer. */
export function parseFaq(mdx: string): GlossaryTerm[] {
  const out: GlossaryTerm[] = [];
  const re = /<h3 id="([a-z0-9-]+)">([^<]+)<\/h3>\s*\n+([^\n<][^\n]*)/g;
  for (const m of mdx.matchAll(re)) {
    const answer = m[3].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
    out.push({ id: m[1], term: m[2].trim(), definition: answer });
  }
  return out;
}

export function referenceSearchEntries(catalog: Catalog, glossary: GlossaryTerm[], faq: GlossaryTerm[] = []): SearchEntry[] {
  const e = (type: EntryType, slug: string, href: string, name: string, summary: string, keywords = ""): SearchEntry => ({ type, slug, href, name, summary, keywords });
  return [
    ...catalog.hubs.map((h) => e("hub", h.slug, `/hubs/${h.slug}/`, h.title, h.summary, h.scope)),
    ...EXPLAINERS.map((x) => e("explainer", x.slug, `/learn/${x.slug}/`, x.title, x.question)),
    ...glossary.map((g) => e("glossary-term", g.id, `/glossary/#${g.id}`, g.term, g.definition, "glossary term definition")),
    ...catalog.licenses.map((l) => e("license", l.slug, `/licenses/${l.slug}/`, l.name, l.summary.text, `license ${l.spdx ?? ""}`)),
    ...catalog.policy.map((d) =>
      e("policy", d.slug, policyHref(d.slug), d.short_title ?? d.title, d.summary.text, [d.identifier, longIdentifier(d), d.title, d.issuer, "policy"].filter(Boolean).join(" ")),
    ),
    ...faq.map((q) => e("faq", q.id, `/faq/#${q.id}`, q.term, q.definition, "question answer faq")),
    ...LEARNING_PATHS.map((p) => e("learning-path", p.id, `/learn/paths/${p.id}/`, p.title, p.description, `learning path ${p.audience}`)),
    ...KID_LESSONS.map((l) => e("kids-lesson", l.slug, `/kids/${l.slug}/`, l.title, l.question, `kids children lesson ${l.number}`)),
    ...catalog.news.map((n) => e("news", n.slug, `/news/${n.slug}/`, n.title, plainText(n.summary.text), `news ${n.category} ${n.event_date}`)),
    ...catalog.newsletter.map((i) => e("newsletter", i.slug, `/newsletter/${i.slug}/`, `Issue ${i.number}: ${i.subject.replace(/^Issue \d+:\s*/i, "")}`, i.preview, "weekly email newsletter issue")),
    ...reportEditions().map((r) =>
      e("page", `report-${r.edition}`, editionHref(r.edition), r.title, `${editionLabel(r.edition)} edition, data cutoff ${r.data_cutoff}. ${r.findings[0]?.text ?? ""}`.trim(), "report state of american ai edition statistics figures data"),
    ),
    ...SITE_PAGES.map((pg) => e("page", pg.href.replace(/^\/|\/$/g, "").replace(/\//g, "-"), pg.href, pg.name, pg.summary, pg.keywords)),
    ...MEMORY_PAGES.map((p) =>
      e(
        "page",
        `find-memory-${p.slug}`,
        memoryPageHref(p),
        memoryPageTitle(p).replace(/ \(documented\)$/, ""),
        p.kind === "vram" ? `Documented local configurations that fit ${p.gb} GB of graphics memory.` : `Documented local configurations that fit ${appleMac(p.gb)}.`,
        p.kind === "vram" ? `vram gpu graphics card memory local ${p.gb}gb ${p.gb} gb` : `apple silicon mac unified memory ram local ${p.gb}gb ${p.gb} gb`,
      ),
    ),
    ...githubSearchEntries(),
    ...hfSearchEntries(),
    ...organizationsByState(catalog).states.map((s) =>
      e("place", stateSlug(s.code), `/places/${stateSlug(s.code)}/`, s.name, `${stateTitle(s)}: organizations headquartered there`, "state headquarters place ai companies labs"),
    ),
  ];
}
