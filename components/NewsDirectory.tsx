"use client";

import Link from "@/components/Link";
import { useMemo, useRef } from "react";
import { formatDate } from "@/lib/dates";
import { NEWS_CATEGORY_LABELS } from "@/lib/labels";
import { DEFAULT_NEWS_FILTERS, eventMonth, filterNews, parseNewsFilters, serializeNewsFilters, type NewsFilters, type NewsListItem } from "@/lib/news-list";
import { NEWS_CATEGORIES } from "@/lib/schema";
import { CodeText } from "./CodeText";
import { FilterChip, ResultSummary, SearchField, SelectField, ShowMore } from "./FilterControls";
import { useDebounced, useQueryState, useShowMore } from "./useQueryState";

/** Items shown per "Show more" step once the page is interactive. */
const PAGE_SIZE = 30;

const monthLabel = (month: string) => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));

function NewsRow({ item }: { item: NewsListItem }) {
  return (
    <article className="border-b border-line py-5" data-news={item.slug}>
      <p className="meta text-[0.8125rem]">
        <time dateTime={item.event_date}>{formatDate(item.event_date)}</time> · {NEWS_CATEGORY_LABELS[item.category]}
      </p>
      <h3 className="mt-1 text-lg font-semibold leading-snug text-text">
        <Link prefetch={false} href={`/news/${item.slug}/`} className="hover:underline hover:decoration-cyan hover:underline-offset-4">
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 max-w-[68ch] text-base text-[#c7d2ea]">
        <CodeText text={item.summary} />
      </p>
      {item.related.length ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Related catalog entries">
          {item.related.map((r) => (
            <li key={r.href}>
              <Link prefetch={false} href={r.href} className="badge hover:border-cyan">
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function NewsDirectory({ items, organizations }: { items: NewsListItem[]; organizations: { slug: string; name: string }[] }) {
  const { state: f, update } = useQueryState<NewsFilters>(parseNewsFilters, serializeNewsFilters);
  const results = useMemo(() => filterNews(items, f), [items, f]);
  const announce = useDebounced(`${results.length} of ${items.length} news items shown`);
  const { limit, showMore } = useShowMore(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);
  const orgName = new Map(organizations.map((o) => [o.slug, o.name]));
  const months = useMemo(() => [...new Set(items.map((i) => eventMonth(i.event_date)))].sort().reverse(), [items]);
  const categories = NEWS_CATEGORIES.filter((c) => items.some((i) => i.category === c));

  const set = (patch: Partial<NewsFilters>, mode: "push" | "replace" = "push") => update({ ...f, ...patch }, mode);
  const chips: Array<{ label: string; clear: Partial<NewsFilters> }> = [];
  if (f.q) chips.push({ label: `Search: “${f.q}”`, clear: { q: "" } });
  if (f.org) chips.push({ label: `About: ${orgName.get(f.org) ?? f.org}`, clear: { org: "" } });
  if (f.month) chips.push({ label: `Month: ${monthLabel(f.month)}`, clear: { month: "" } });
  const shown = results.slice(0, limit);

  return (
    <div>
      <nav aria-label="News categories" className="mb-5">
        <ul className="flex flex-wrap gap-2">
          {[{ value: "" as const, label: "All news" }, ...categories.map((c) => ({ value: c, label: NEWS_CATEGORY_LABELS[c] }))].map((c) => (
            <li key={c.value || "all"}>
              <button
                type="button"
                aria-pressed={f.category === c.value}
                onClick={() => set({ category: c.value })}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] ${f.category === c.value ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-line-strong hover:text-text"}`}
              >
                {c.label}
                <span className="ml-1.5 text-sm text-muted">({(c.value ? items.filter((i) => i.category === c.value) : items).length})</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="card p-4 sm:p-5" role="search" aria-label="Filter news">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <SearchField label="Search news" value={f.q} placeholder="Model, project, organization…" onChange={(q) => set({ q }, "replace")} />
          <SelectField label="About" value={f.org} options={organizations.map((o) => ({ value: o.slug, label: o.name }))} onChange={(org) => set({ org })} allLabel="Any organization" />
          <SelectField label="Month" value={f.month} options={months.map((m) => ({ value: m, label: monthLabel(m) }))} onChange={(month) => set({ month })} allLabel="Any month" />
        </div>
        <noscript>
          <p className="mt-3 text-sm text-muted">Filtering needs JavaScript. Every item is listed below.</p>
        </noscript>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ResultSummary visible={results.length} total={items.length} noun={["news item", "news items"]} announce={announce} />
        {Object.values(f).some(Boolean) ? (
          <button type="button" className="link min-h-11 text-sm" onClick={() => update({ ...DEFAULT_NEWS_FILTERS })}>
            Clear all filters
          </button>
        ) : null}
      </div>
      {chips.length ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <FilterChip key={c.label} label={c.label} onRemove={() => set(c.clear)} />
          ))}
        </ul>
      ) : null}

      {results.length ? (
        <>
          <ul ref={listRef} className="mt-4" data-testid="news-list">
            {shown.map((item, i) => {
              const month = eventMonth(item.event_date);
              const first = i === 0 || eventMonth(shown[i - 1].event_date) !== month;
              return (
                <li key={item.slug}>
                  {first ? <h2 className={`eyebrow border-b border-line pb-2 ${i === 0 ? "" : "pt-8"}`}>{monthLabel(month)}</h2> : null}
                  <NewsRow item={item} />
                </li>
              );
            })}
          </ul>
          <ShowMore shown={shown.length} total={results.length} step={PAGE_SIZE} noun={["news item", "news items"]} listRef={listRef} onMore={() => showMore(results.length)} />
        </>
      ) : (
        <div className="card mt-4 p-6 text-muted">
          No news items match these filters.{" "}
          <button type="button" className="link" onClick={() => update({ ...DEFAULT_NEWS_FILTERS })}>
            Show all news
          </button>
          .
        </div>
      )}
    </div>
  );
}
