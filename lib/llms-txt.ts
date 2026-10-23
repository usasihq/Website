/**
 * /llms.txt at the site root (https://llmstxt.org): a short, current map of the
 * catalog for agents. Built from the same sections and routes as app/sitemap.ts,
 * without the thousands of GitHub/Hugging Face item URLs. Written at build time
 * by app/llms.txt/route.ts.
 */
import type { Catalog } from "./catalog";
import { absoluteUrl } from "./paths";
import { artifactHref, orgHref } from "./routes";
import { siteConfig } from "./site-config";
import { STATIC_ROUTES } from "./site-routes";

export type LlmsTxtLink = { name: string; path: string; note?: string };

const n = (v: number) => v.toLocaleString("en-US");

function item(name: string, path: string, note?: string): LlmsTxtLink {
  return note ? { name, path, note } : { name, path };
}

function renderSection(title: string, items: LlmsTxtLink[]): string {
  if (items.length === 0) return "";
  const lines = items.map((entry) => {
    const url = entry.path.startsWith("https://") ? entry.path : absoluteUrl(entry.path);
    return entry.note ? `- [${entry.name}](${url}): ${entry.note}` : `- [${entry.name}](${url})`;
  });
  return `## ${title}\n\n${lines.join("\n")}\n`;
}

/** Remaining fixed routes after the named sections have claimed theirs. */
const CLAIMED_STATIC = new Set(["/", "/companies/", "/open/", "/github/", "/huggingface/"]);

const RESOURCE_ROUTES: { path: string; name: string; note?: string }[] = [
  { path: "/", name: "Home" },
  { path: "/learn/", name: "Learn", note: "Explainers and learning paths" },
  { path: "/glossary/", name: "Glossary" },
  { path: "/faq/", name: "FAQ" },
  { path: "/sources/", name: "Sources" },
  { path: "/licenses/", name: "Licenses" },
  { path: "/methodology/", name: "Methodology" },
  { path: "/policy/", name: "Policy documents" },
  { path: "/report/", name: "The State of American AI" },
  { path: "/news/", name: "Latest news" },
  { path: "/newsletter/", name: "Weekly newsletter archive" },
  { path: "/reuse/", name: "Reuse and licensing" },
  { path: "/contribute/", name: "Contribute" },
  { path: "/about/", name: "About" },
  { path: "/start/", name: "Start here" },
  { path: "/feeds/", name: "Feeds" },
  { path: "/hubs/", name: "Hubs" },
  { path: "/places/", name: "Places" },
  { path: "/timeline/", name: "Timeline" },
  { path: "/find/", name: "Finder" },
  { path: "/compact/", name: "USASI Compact" },
  { path: "/changelog/", name: "Changelog" },
  { path: "/matrix/", name: "Compare" },
  { path: "/support/", name: "Support Us" },
  { path: "/privacy/", name: "Privacy" },
  { path: "/disclaimer/", name: "Disclaimer" },
  { path: "/badges/", name: "Badges" },
  { path: "/kids/", name: "For kids" },
  { path: "/kids/words/", name: "Kids glossary" },
  { path: "/kids/grown-ups/", name: "Kids: for grown-ups" },
  { path: "/kids/packet/", name: "Kids packet" },
  { path: "/learn/tools/model-size/", name: "Model size tool" },
  { path: "/find/memory/", name: "Local-model memory finder" },
];

export function llmsTxtSections(catalog: Catalog): { title: string; items: LlmsTxtLink[] }[] {
  const companies = [
    item("Companies & Labs", "/companies/", `${n(catalog.organizations.length)} published organizations`),
    ...catalog.organizations.map((o) => item(o.name, orgHref(o.slug))),
  ];
  const open = [
    item("Open Models & Tools", "/open/", `${n(catalog.artifacts.length)} published artifacts`),
    ...catalog.artifacts.map((a) => item(a.name, artifactHref(a.slug), a.kind.replace(/-/g, " "))),
    item("AI on GitHub", "/github/"),
    item("AI on Hugging Face", "/huggingface/"),
    item("AI datasets on Hugging Face", "/huggingface/datasets/"),
  ];
  const resources = RESOURCE_ROUTES.filter((r) => STATIC_ROUTES.includes(r.path)).map((r) => item(r.name, r.path, r.note));
  const claimed = new Set<string>([...CLAIMED_STATIC, ...RESOURCE_ROUTES.map((r) => r.path)]);
  const other = STATIC_ROUTES.filter((path) => !claimed.has(path)).map((path) => item(path, path));
  return [
    { title: "Companies & Labs", items: companies },
    { title: "Open Models & Tools", items: open },
    { title: "Resources", items: resources },
    { title: "Other", items: other },
  ].filter((section) => section.items.length > 0);
}

export function renderLlmsTxt(catalog: Catalog): string {
  const sections = llmsTxtSections(catalog)
    .map((section) => renderSection(section.title, section.items))
    .filter(Boolean)
    .join("\n");
  return `# ${siteConfig.name}

> Independent, unofficial catalog of U.S. AI organizations and U.S.-led open models, software, datasets, and evaluation tools. ${siteConfig.disclaimer}

The site is a static reference: every public claim cites a source. This file lists the main areas; the full URL list is [the sitemap](${absoluteUrl("/sitemap.xml")}).

${sections}`.trim() + "\n";
}
