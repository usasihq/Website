/**
 * AI on GitHub: ranked entries, pages, hero cards, catalog cross-links,
 * related projects, search and sitemap entries. Server/build only (reads
 * data/github/projects.json through ./load).
 */
import type { Catalog } from "../catalog";
import { formatDate } from "../dates";
import { artifactHref } from "../routes";
import type { SearchEntry } from "../search";
import { absoluteUrl } from "../paths";
import type { JsonLdNode } from "../structured-data";
import { SCHEMA_CONTEXT } from "../structured-data";
import { assignSlugs } from "./filters";
import { heroAlt, type GithubHero } from "./hero";
import { readGithubDataset } from "./load";
import { licenseKey, licenseLabel, OWNER_TYPE_LABELS, type GithubListItem } from "./directory";
import type { GithubDataset, GithubProject } from "./schema";

export const GITHUB_INDEX = "/github/";
/** Projects per page on /github/ and /github/page/<n>/. */
export const GITHUB_PAGE_SIZE = 100;

export type GithubEntry = GithubProject & {
  rank: number;
  slug: string;
  href: string;
  image: string;
};

export const githubHref = (slug: string) => `/github/${slug}/`;
export const githubPageHref = (n: number) => (n <= 1 ? GITHUB_INDEX : `/github/page/${n}/`);

const entriesCache = new WeakMap<GithubDataset, GithubEntry[]>();

export function githubEntries(data: GithubDataset = readGithubDataset()): GithubEntry[] {
  const hit = entriesCache.get(data);
  if (hit) return hit;
  const slugs = assignSlugs(data.projects);
  const out = data.projects.map((p, i) => ({ ...p, rank: i + 1, slug: slugs[i], href: githubHref(slugs[i]), image: `/og/github/${slugs[i]}.jpg` }));
  entriesCache.set(data, out);
  return out;
}

export function githubEntry(slug: string, data?: GithubDataset): GithubEntry | undefined {
  return githubEntries(data).find((e) => e.slug === slug);
}

export function githubPageCount(data?: GithubDataset): number {
  return Math.max(1, Math.ceil(githubEntries(data).length / GITHUB_PAGE_SIZE));
}

export function githubPageEntries(n: number, data?: GithubDataset): GithubEntry[] {
  return githubEntries(data).slice((n - 1) * GITHUB_PAGE_SIZE, n * GITHUB_PAGE_SIZE);
}

/** The fetch date as shown on pages, e.g. "October 18, 2026". */
export function githubFetchedLabel(data: GithubDataset = readGithubDataset()): string {
  return formatDate(data.fetched_at.slice(0, 10));
}

export function toListItem(e: GithubEntry): GithubListItem {
  return {
    slug: e.slug,
    rank: e.rank,
    fullName: e.full_name,
    owner: e.owner,
    ownerType: e.owner_type,
    name: e.name,
    // Rows clamp to two lines, so the list carries a shorter copy (keeps public/data/github.json small).
    description: clip(e.description, 180),
    stars: e.stars,
    language: e.language,
    license: licenseKey(e),
    topics: e.topics.slice(0, 10),
    pushedAt: e.pushed_at.slice(0, 10),
  };
}

/** owner/repo (lowercase) from a GitHub repository URL, or null. */
export function repoKey(url: string): string | null {
  const m = url.match(/^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/?#].*)?$/i);
  if (!m) return null;
  const owner = m[1].toLowerCase();
  if (["orgs", "topics", "features", "apps", "marketplace", "sponsors", "collections", "settings"].includes(owner)) return null;
  return `${owner}/${m[2].toLowerCase()}`;
}

const catalogCache = new WeakMap<Catalog, Map<string, { slug: string; name: string }>>();

/**
 * Catalog artifacts by the repository they link to. A record's own
 * "repository" links win over its other links and its cited sources.
 */
export function catalogRepoIndex(catalog: Catalog): Map<string, { slug: string; name: string }> {
  const hit = catalogCache.get(catalog);
  if (hit) return hit;
  const strong = new Map<string, { slug: string; name: string }>();
  const weak = new Map<string, { slug: string; name: string }>();
  for (const a of catalog.artifacts) {
    for (const l of a.links) {
      const key = repoKey(l.url);
      if (!key) continue;
      const target = l.kind === "repository" ? strong : weak;
      if (!target.has(key)) target.set(key, { slug: a.slug, name: a.name });
    }
    for (const s of a.sources) {
      const key = repoKey(s.url);
      if (key && !weak.has(key)) weak.set(key, { slug: a.slug, name: a.name });
    }
  }
  const out = new Map(weak);
  for (const [k, v] of strong) out.set(k, v);
  catalogCache.set(catalog, out);
  return out;
}

export function catalogMatch(catalog: Catalog, e: Pick<GithubProject, "full_name">): { slug: string; name: string; href: string } | null {
  const hit = catalogRepoIndex(catalog).get(e.full_name.toLowerCase());
  return hit ? { ...hit, href: artifactHref(hit.slug) } : null;
}

/** Topics too broad to make two projects "related". */
const BROAD_TOPICS = new Set(["ai", "artificial-intelligence", "machine-learning", "deep-learning", "python", "hacktoberfest", "llm", "llms", "pytorch", "javascript", "typescript", "open-source", "opensource"]);

/** Up to `n` projects that share the most specific topics, ties by rank. */
export function relatedProjects(e: GithubEntry, n = 6, all: GithubEntry[] = githubEntries()): GithubEntry[] {
  const mine = new Set(e.topics);
  const freq = new Map<string, number>();
  for (const x of all) for (const t of x.topics) freq.set(t, (freq.get(t) ?? 0) + 1);
  const scored: [GithubEntry, number][] = [];
  for (const x of all) {
    if (x.slug === e.slug) continue;
    let score = 0;
    for (const t of x.topics) if (mine.has(t)) score += BROAD_TOPICS.has(t) ? 0.2 : 1 + 1 / Math.log2(1 + (freq.get(t) ?? 1));
    if (x.language && x.language === e.language) score += 0.1;
    if (score > 0.3) scored.push([x, score]);
  }
  scored.sort((a, b) => b[1] - a[1] || a[0].rank - b[0].rank);
  return scored.slice(0, n).map(([x]) => x);
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/**
 * The hero shows only fields that rarely change (name, owner, owner type,
 * language, license), never rank, stars, or dates, so a daily refresh
 * re-renders only new or changed projects. The page shows the current counts.
 */
export function projectHero(e: GithubEntry): GithubHero {
  const license = licenseKey(e);
  const facts = [OWNER_TYPE_LABELS[e.owner_type], ...(e.language ? [e.language] : []), ...(license === "None" ? [] : [licenseLabel(license)])];
  const base = { page: e.href, image: e.image, template: "project" as const, seed: e.full_name, owner: e.owner, title: e.name, subtitle: null, facts };
  return { ...base, alt: heroAlt(base) };
}

/** The /github/ card: no counts or dates, so it never needs rendering again. */
export function sectionHero(): GithubHero {
  const base = {
    page: GITHUB_INDEX,
    image: "/og/github/index.jpg",
    template: "section" as const,
    seed: "usasi/ai-on-github",
    owner: "USASI",
    title: "AI on GitHub",
    subtitle: "The most-starred open-source AI projects on GitHub, ranked by stars, each with its own page.",
    facts: ["Ranked by stars", "Data from the GitHub API", "Updated daily"],
  };
  return { ...base, alt: heroAlt(base) };
}

export function githubHeroes(data: GithubDataset = readGithubDataset()): GithubHero[] {
  return [sectionHero(), ...githubEntries(data).map(projectHero)];
}

/**
 * Site search covers the top projects only, so the shared search index stays
 * small; /github/ searches and filters every project. (The index page is in SITE_PAGES.)
 */
export const GITHUB_SEARCH_LIMIT = 1000;

export function githubSearchEntries(data: GithubDataset = readGithubDataset()): SearchEntry[] {
  return githubEntries(data).slice(0, GITHUB_SEARCH_LIMIT).map((e) => ({
    type: "github-project" as const,
    slug: e.slug,
    href: e.href,
    name: e.full_name,
    summary: e.description ? clip(e.description, 110) : `${e.full_name} on GitHub`,
    keywords: [e.name.replace(/[-_.]/g, " "), e.language ?? "", ...e.topics.slice(0, 4)].join(" "),
  }));
}

export function githubSitemap(data: GithubDataset = readGithubDataset()): { path: string; lastModified: string }[] {
  const day = data.fetched_at.slice(0, 10);
  const pages = Array.from({ length: githubPageCount(data) - 1 }, (_, i) => ({ path: githubPageHref(i + 2), lastModified: day }));
  return [...pages, ...githubEntries(data).map((e) => ({ path: e.href, lastModified: day }))];
}

export function githubProjectLd(e: GithubEntry): JsonLdNode {
  const page = absoluteUrl(e.href);
  const license = e.license_spdx && /^[A-Za-z0-9.+-]+$/.test(e.license_spdx) ? `https://spdx.org/licenses/${e.license_spdx}.html` : undefined;
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "SoftwareSourceCode",
    "@id": `${page}#software`,
    name: e.name,
    ...(e.description ? { description: e.description } : {}),
    mainEntityOfPage: page,
    codeRepository: e.html_url,
    ...(e.homepage ? { url: e.homepage } : {}),
    ...(license ? { license } : {}),
    ...(e.language ? { programmingLanguage: e.language } : {}),
    ...(e.topics.length ? { keywords: e.topics.join(", ") } : {}),
    dateCreated: e.created_at.slice(0, 10),
    dateModified: e.pushed_at.slice(0, 10),
    author: { "@type": e.owner_type === "Organization" ? "Organization" : "Person", name: e.owner, url: `https://github.com/${e.owner}` },
    image: absoluteUrl(e.image),
  };
}

export { licenseLabel };
