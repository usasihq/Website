"use client";

import Link from "@/components/Link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ENTRY_TYPE_LABELS } from "@/lib/labels";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { SearchField } from "./FilterControls";
import { SEARCH_GROUPS, groupOf, highlightParts, loadSearchIndex } from "./site-search-data";
import { useDebounced, useQueryState } from "./useQueryState";

type State = { q: string; group: string };
const parse = (p: URLSearchParams): State => {
  const group = p.get("in") ?? "";
  return { q: p.get("q") ?? "", group: SEARCH_GROUPS.some((g) => g.id === group) ? group : "" };
};
const serialize = (s: State) => {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (s.group) p.set("in", s.group);
  return p.toString();
};

const PAGE = 40;

/**
 * Full results for site search at /search/?q=…&in=…, so a search can be
 * bookmarked or shared. State lives only in the address.
 */
export function SearchResults({ indexUrl }: { indexUrl: string }) {
  const { state, update } = useQueryState(parse, serialize);
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    let live = true;
    loadSearchIndex(indexUrl).then(
      (e) => live && setEntries(e),
      () => live && setLoadError(true),
    );
    return () => {
      live = false;
    };
  }, [indexUrl]);

  const q = state.q.trim();
  const all = useMemo(() => (entries && q ? searchEntries(entries, q, 2000) : []), [entries, q]);
  const closeOnly = useMemo(() => Boolean(entries && q && all.length && searchEntries(entries, q, 1, { fuzzy: false }).length === 0), [entries, q, all]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of all) c[groupOf(e.type)] = (c[groupOf(e.type)] ?? 0) + 1;
    return c;
  }, [all]);
  const filtered = state.group ? all.filter((e) => groupOf(e.type) === state.group) : all;
  const shown = filtered.slice(0, limit);
  const setGroup = useCallback(
    (group: string) => {
      setLimit(PAGE);
      update({ ...state, group });
    },
    [state, update],
  );
  const announced = useDebounced(q && entries ? `${filtered.length} ${filtered.length === 1 ? "result" : "results"}` : "", 600);

  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <SearchField
          label="Search organizations, models and tools, explainers, news, and more"
          value={state.q}
          placeholder="Try “speech”, “Apache 2.0”, or “executive order”"
          onChange={(value) => {
            setLimit(PAGE);
            update({ ...state, q: value }, "replace");
          }}
        />
      </div>

      {q ? (
        <div role="group" aria-label="Show results in" className="flex flex-wrap gap-2">
          {[{ id: "", label: "All" }, ...SEARCH_GROUPS].map((g) => {
            const n = g.id ? (counts[g.id] ?? 0) : all.length;
            const pressed = state.group === g.id;
            return (
              <button
                key={g.id || "all"}
                type="button"
                aria-pressed={pressed}
                disabled={!pressed && n === 0 && g.id !== ""}
                onClick={() => setGroup(g.id)}
                className={`badge gap-1.5 px-3 py-1.5 text-sm disabled:opacity-45 ${pressed ? "border-cyan text-text" : "hover:border-cyan"}`}
              >
                {g.label} <span className="font-mono text-muted tabular-nums">{entries ? n : "…"}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        {announced}
      </p>

      {!q ? (
        <p className="text-muted">Type a word or two above. Results come from published records and pages only.</p>
      ) : !entries ? (
        <p className="text-muted">{loadError ? "Search could not load. Check your connection and reload the page." : "Loading search…"}</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">
          Nothing published matches “{q}”. Try fewer or different words, or browse{" "}
          <Link prefetch={false} href="/companies/" className="link">
            Companies &amp; Labs
          </Link>{" "}
          and{" "}
          <Link prefetch={false} href="/open/" className="link">
            Open Models &amp; Tools
          </Link>
          .
        </p>
      ) : (
        <>
          {closeOnly ? (
            <p className="mb-3 text-muted" data-testid="close-matches">
              No exact match for “{q}”. These are the closest matches; check the spelling or try other words.
            </p>
          ) : null}
          <ol className="grid gap-3" data-testid="search-results">
            {shown.map((r) => (
              <li key={`${r.type}:${r.slug}`}>
                <Link prefetch={false} href={r.href} className="card card-link group flex items-start justify-between gap-4 p-4">
                  <span className="min-w-0">
                    <span className="block font-semibold text-text group-hover:text-strong">
                      {highlightParts(r.name, q).map((p, i) =>
                        p.hit ? (
                          <mark key={i} className="bg-transparent text-cyan">
                            {p.text}
                          </mark>
                        ) : (
                          <span key={i}>{p.text}</span>
                        ),
                      )}
                    </span>
                    <span className="mt-1 line-clamp-2 text-sm text-muted">{r.summary}</span>
                  </span>
                  <span className="badge shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.06em] text-ice">{ENTRY_TYPE_LABELS[r.type]}</span>
                </Link>
              </li>
            ))}
          </ol>
          {filtered.length > shown.length ? (
            <button type="button" className="btn btn-secondary justify-self-start" onClick={() => setLimit(limit + PAGE)}>
              Show more ({filtered.length - shown.length} left)
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
