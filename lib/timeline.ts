/**
 * A restrained timeline built only from dates already documented in the catalog:
 * release dates on open-model and tool records, and event dates on news items.
 * Each event links to the record or news item that cites its sources.
 */
import type { Catalog } from "./catalog";
import { KIND_LABELS } from "./labels";
import { artifactHref } from "./routes";

export type TimelineEvent = {
  date: string; // YYYY, YYYY-MM, or YYYY-MM-DD as documented
  type: "release" | "news";
  label: string; // "Open release" or the news category
  title: string;
  href: string;
};

const sortKey = (d: string) => (d.length === 4 ? `${d}-00-00` : d.length === 7 ? `${d}-00` : d);

export function timelineEvents(catalog: Catalog): TimelineEvent[] {
  const releases: TimelineEvent[] = catalog.artifacts
    .filter((a) => a.released_at && a.record_level !== "family")
    .map((a) => ({ date: a.released_at!, type: "release", label: `Released · ${KIND_LABELS[a.kind]}`, title: a.name, href: artifactHref(a.slug) }));
  const news: TimelineEvent[] = catalog.news.map((n) => ({
    date: n.event_date,
    type: "news",
    label: `News · ${n.category[0].toUpperCase()}${n.category.slice(1)}`,
    title: n.title,
    href: `/news/${n.slug}/`,
  }));
  return [...releases, ...news].sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)) || a.title.localeCompare(b.title));
}

/** Group by year, then by month ("" for dates documented only to the year). */
export function groupTimeline(events: TimelineEvent[]): Array<{ year: string; months: Array<{ month: string; events: TimelineEvent[] }> }> {
  const years = new Map<string, Map<string, TimelineEvent[]>>();
  for (const e of events) {
    const y = e.date.slice(0, 4);
    const m = e.date.length >= 7 ? e.date.slice(0, 7) : "";
    if (!years.has(y)) years.set(y, new Map());
    const months = years.get(y)!;
    months.set(m, [...(months.get(m) ?? []), e]);
  }
  return [...years.entries()].map(([year, months]) => ({
    year,
    months: [...months.entries()].sort((a, b) => (a[0] === "" ? 1 : b[0] === "" ? -1 : b[0].localeCompare(a[0]))).map(([month, events]) => ({ month, events })),
  }));
}
