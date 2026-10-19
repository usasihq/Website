/**
 * "New this week" (/new/ and /new/feed.xml): what the site added in the seven
 * days ending on the build date. Build-time only. Every entry is dated and
 * comes from a record the site already keeps:
 * - catalog organizations and open models/tools: changelog entries of type
 *   "added" (records carry no separate "added" date);
 * - other additions (for example people profiles): the changelog's own notes;
 * - news: items published on USASI in the window;
 * - AI on GitHub / AI on Hugging Face: items whose `first_seen` (when they
 *   first entered the snapshot) falls in the window. Snapshots record
 *   first_seen only since `tracking_since`; before that nothing is "new";
 * - jobs: current listings first seen in the window, counted by employer.
 */
import type { Catalog } from "./catalog";
import { githubEntries, type GithubEntry } from "./github/projects";
import { readGithubDataset } from "./github/load";
import { hfDatasetEntries, hfModelEntries, type HfEntry } from "./huggingface/items";
import { readHfDatasets, readHfModels } from "./huggingface/load";
import { jobPages } from "./jobs/job-pages";
import { artifactHref, orgHref } from "./routes";
import { plainText } from "./plain-text";
import type { RssItem } from "./rss";
import type { ChangelogEntry, NewsItem } from "./schema";

export const NEW_DAYS = 7;
export const NEW_HREF = "/new/";

export type NewRecord = { kind: "organization" | "artifact"; slug: string; name: string; href: string; date: string; note: string | null };
export type NewSiteNote = { date: string; note: string; entry: string };
export type Tracked<T> = { trackingSince: string | null; items: T[] };
export type NewJobs = { total: number; employers: { slug: string; name: string; count: number }[] };

export type NewThisWeek = {
  from: string;
  to: string;
  changelog: ChangelogEntry[];
  records: NewRecord[];
  siteNotes: NewSiteNote[];
  news: NewsItem[];
  github: Tracked<GithubEntry>;
  hfModels: Tracked<HfEntry>;
  hfDatasets: Tracked<HfEntry>;
  jobs: NewJobs;
};

/** The window's first and last dates (UTC, inclusive) for a build time. */
export function newWindow(buildAt: string, days = NEW_DAYS): { from: string; to: string } {
  const to = buildAt.slice(0, 10);
  const from = new Date(Date.parse(`${to}T00:00:00Z`) - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

const inWindow = (date: string | null | undefined, w: { from: string; to: string }) => Boolean(date) && date!.slice(0, 10) >= w.from && date!.slice(0, 10) <= w.to;

/** Catalog records the changelog marks as added in the window (newest first), and the other "added" notes. */
export function catalogAdditions(catalog: Pick<Catalog, "changelog" | "organization" | "artifact">, w: { from: string; to: string }) {
  const entries = catalog.changelog.filter((c) => inWindow(c.date, w)).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  const records: NewRecord[] = [];
  const siteNotes: NewSiteNote[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    for (const ch of e.changes) {
      if (ch.type !== "added") continue;
      if ((ch.record_type === "organization" || ch.record_type === "artifact") && ch.slug) {
        const key = `${ch.record_type}:${ch.slug}`;
        if (seen.has(key)) continue;
        const rec = ch.record_type === "organization" ? catalog.organization(ch.slug) : catalog.artifact(ch.slug);
        if (!rec) continue;
        seen.add(key);
        records.push({ kind: ch.record_type, slug: ch.slug, name: rec.name, href: ch.record_type === "organization" ? orgHref(ch.slug) : artifactHref(ch.slug), date: e.date, note: ch.note });
      } else if (ch.record_type === "site" && ch.note) {
        siteNotes.push({ date: e.date, note: ch.note, entry: e.title });
      }
    }
  }
  return { entries, records, siteNotes };
}

function tracked<T extends { first_seen?: string }>(trackingSince: string | undefined, items: T[], w: { from: string; to: string }): Tracked<T> {
  return { trackingSince: trackingSince ?? null, items: trackingSince ? items.filter((i) => inWindow(i.first_seen, w)) : [] };
}

export function newJobs(catalog: Catalog, w: { from: string; to: string }): NewJobs {
  const counts = new Map<string, number>();
  let total = 0;
  for (const p of jobPages(catalog)) {
    if (!inWindow(p.job.first_seen, w)) continue;
    total++;
    counts.set(p.org.slug, (counts.get(p.org.slug) ?? 0) + 1);
  }
  const employers = [...counts]
    .map(([slug, count]) => ({ slug, name: catalog.organization(slug)?.name ?? slug, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
  return { total, employers };
}

const memo = new WeakMap<Catalog, NewThisWeek>();

export function newThisWeek(catalog: Catalog): NewThisWeek {
  const hit = memo.get(catalog);
  if (hit) return hit;
  const w = newWindow(catalog.buildAt);
  const { entries, records, siteNotes } = catalogAdditions(catalog, w);
  const gh = readGithubDataset();
  const models = readHfModels();
  const datasets = readHfDatasets();
  const result: NewThisWeek = {
    ...w,
    changelog: entries,
    records,
    siteNotes,
    news: catalog.news.filter((n) => inWindow(n.published_at, w)).sort((a, b) => b.published_at.localeCompare(a.published_at) || a.title.localeCompare(b.title)),
    github: tracked(gh.tracking_since, githubEntries(gh), w),
    hfModels: tracked(models.tracking_since, hfModelEntries(models), w),
    hfDatasets: tracked(datasets.tracking_since, hfDatasetEntries(datasets), w),
    jobs: newJobs(catalog, w),
  };
  memo.set(catalog, result);
  return result;
}


/** RSS items for /new/feed.xml: catalog additions, news, and newly ranked GitHub and Hugging Face items, newest first. */
export function newFeedItems(w: NewThisWeek): RssItem[] {
  const items: RssItem[] = [
    ...w.records.map((r) => ({
      title: `New in the catalog: ${r.name}`,
      path: r.href,
      date: r.date,
      category: r.kind === "organization" ? "Organization" : "Open model or tool",
      description: r.note ? `${r.note}.`.replace(/\.\.$/, ".") : `${r.name} was added to the USASI catalog.`,
    })),
    ...w.news.map((n) => ({ title: n.title, path: `/news/${n.slug}/`, date: n.published_at, category: "News", description: plainText(n.summary.text) })),
    ...w.github.items.map((e) => ({
      title: `New on AI on GitHub: ${e.full_name}`,
      path: e.href,
      date: e.first_seen!,
      exact: true,
      category: "AI on GitHub",
      description: `${e.full_name} entered USASI's ranking of open-source AI projects at the ${e.first_seen!.slice(0, 10)} fetch, with ${e.stars.toLocaleString("en-US")} GitHub stars.`,
    })),
    ...[...w.hfModels.items, ...w.hfDatasets.items].map((e) => ({
      title: `New on AI on Hugging Face: ${e.id}`,
      path: e.href,
      date: e.first_seen!,
      exact: true,
      category: "AI on Hugging Face",
      description: `The ${e.kind} ${e.id} entered USASI's Hugging Face ranking at the ${e.first_seen!.slice(0, 10)} fetch, with ${e.likes.toLocaleString("en-US")} likes.`,
    })),
  ];
  const time = (i: RssItem) => Date.parse(i.exact ? i.date : `${i.date.slice(0, 10)}T12:00:00Z`);
  return items.sort((a, b) => time(b) - time(a) || a.title.localeCompare(b.title)).slice(0, 100);
}
