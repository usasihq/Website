/**
 * /llms.txt at the site root (https://llmstxt.org): a short, current map of the
 * catalog for agents. Built from the same sections and routes as app/sitemap.ts,
 * without individual job-posting pages or the thousands of GitHub/Hugging Face
 * item URLs. Written at build time by app/llms.txt/route.ts and scripts/job-pages.ts.
 */
import type { Catalog } from "./catalog";
import { HIRING_INDEX_HREF } from "./jobs/hiring-index";
import { jobsLandingData } from "./jobs/landing";
import { LAYOFF_STATES, layoffHref } from "./jobs/layoffs";
import { absoluteUrl } from "./paths";
import { artifactHref, leaderHref, orgHref, personHref } from "./routes";
import { siteConfig } from "./site-config";
import { STATIC_ROUTES } from "./site-routes";

export type LlmsTxtLink = { name: string; path: string; note?: string };

const n = (v: number) => v.toLocaleString("en-US");

function listingsNote(count: number): string {
  return `${n(count)} open ${count === 1 ? "listing" : "listings"}`;
}

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
const CLAIMED_STATIC = new Set([
  "/",
  "/jobs/",
  "/jobs/index/",
  "/jobs/layoffs/",
  "/companies/",
  "/open/",
  "/people/",
  "/people/school/",
  "/big-si/",
  "/voices/",
  "/local/",
  "/github/",
  "/huggingface/",
]);

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
  const landings = jobsLandingData(catalog);
  const jobs = [
    item("Jobs at U.S. AI companies and labs", "/jobs/", "Current openings from employer job boards"),
    item("Weekly AI Hiring Index", HIRING_INDEX_HREF, "Open listings by employer and U.S. state, week by week"),
    ...landings.topics.filter((p) => p.indexable).map((p) => item(p.name, p.path, listingsNote(p.count))),
    item("WARN Act layoff notices", "/jobs/layoffs/"),
    ...LAYOFF_STATES.map((s) => item(`WARN Act notices in ${s.name}`, layoffHref(s.code))),
  ];
  const byState = landings.states.filter((p) => p.indexable).map((p) => item(p.name, p.path, listingsNote(p.count)));
  const byRole = landings.roles.filter((p) => p.indexable).map((p) => item(p.name, p.path, listingsNote(p.count)));
  const byCompany = landings.companies.filter((p) => p.indexable).map((p) => item(p.name, p.path, listingsNote(p.count)));
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
  const bigSi = [
    item("People Behind Big SI", "/big-si/", "Leaders of the large U.S. AI labs"),
    ...catalog.leaders.map((l) => item(l.name, leaderHref(l.slug), l.headline)),
  ];
  const openSourcePeople = catalog.people.filter((p) => p.groups.includes("open-source"));
  const openSource = [
    item("People", "/people/", "Every published profile"),
    item("People by school", "/people/school/", "Alumni and faculty by university"),
    item("People Behind Local SI", "/local/"),
    ...openSourcePeople.map((p) => item(p.name, personHref(p.slug), p.headline)),
  ];
  const voicesPeople = catalog.people.filter((p) => p.groups.includes("creators"));
  const voices = [
    item("Voices of SI", "/voices/", "Tech creators and communicators"),
    ...voicesPeople.map((p) => item(p.name, personHref(p.slug), p.headline)),
  ];
  const resources = RESOURCE_ROUTES.filter((r) => STATIC_ROUTES.includes(r.path)).map((r) => item(r.name, r.path, r.note));
  const claimed = new Set<string>([
    ...CLAIMED_STATIC,
    ...RESOURCE_ROUTES.map((r) => r.path),
    ...jobs.map((i) => i.path),
    ...byState.map((i) => i.path),
    ...byRole.map((i) => i.path),
    ...byCompany.map((i) => i.path),
  ]);
  const other = STATIC_ROUTES.filter((path) => !claimed.has(path)).map((path) => item(path, path));
  return [
    { title: "Jobs", items: jobs },
    { title: "Jobs by state", items: byState },
    { title: "Jobs by role", items: byRole },
    { title: "Jobs by company", items: byCompany },
    { title: "Companies & Labs", items: companies },
    { title: "Open Models & Tools", items: open },
    { title: "People Behind Big SI", items: bigSi },
    { title: "Open-source people", items: openSource },
    { title: "Voices of SI", items: voices },
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

The site is a static reference: every public claim cites a source. Job applications stay on the employer's site. This file lists the main areas; the full URL list is [the sitemap](${absoluteUrl("/sitemap.xml")}).

${sections}`.trim() + "\n";
}
