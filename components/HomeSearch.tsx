"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { ENTRY_TYPE_LABELS } from "@/lib/labels";
import { companiesHref, openHref } from "@/lib/routes";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { useDebounced } from "./useQueryState";

/**
 * Search across both directories. Results are plain links (no custom
 * combobox), labeled by entry type, with hand-offs to each directory's full
 * filtered view.
 */
export function HomeSearch({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const hintId = useId();
  const all = useMemo(() => searchEntries(entries, query, 200), [entries, query]);
  const results = all.slice(0, 8);
  const orgCount = all.filter((r) => r.type === "organization").length;
  const artifactCount = all.length - orgCount;
  const trimmed = query.trim();
  const announce = useDebounced(trimmed ? `${all.length} matching entr${all.length === 1 ? "y" : "ies"}` : "");
  const q = encodeURIComponent(trimmed);

  return (
    <div role="search" aria-label="Search the catalog">
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={inputId} className="mb-2 block text-[0.9375rem] font-medium text-text">
          Search both directories
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            id={inputId}
            type="search"
            className="field min-h-14 pl-12 text-lg"
            placeholder="Name, maintainer, license, or tag"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-describedby={hintId}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <p id={hintId} className="mt-2 text-sm text-muted">
          Searches names, summaries, maintainers, licenses, and tags across organizations and open artifacts.
        </p>
        <noscript>
          <p className="mt-2 text-sm text-muted">Search needs JavaScript. You can browse both directories with the links below.</p>
        </noscript>
      </form>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announce}
      </p>

      {trimmed ? (
        <div className="mt-4 rounded-xl border border-line bg-[rgba(5,8,22,0.85)]">
          {results.length > 0 ? (
            <ul className="divide-y divide-[rgba(120,180,255,0.12)]" aria-label="Search results">
              {results.map((r) => (
                <li key={`${r.type}-${r.slug}`}>
                  <Link prefetch={false} href={r.href} className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-[rgba(76,201,255,0.06)]">
                    <span className="min-w-0">
                      <span className="block font-medium text-text">{r.name}</span>
                      <span className="line-clamp-1 block text-sm text-muted">{r.summary}</span>
                    </span>
                    <span className="badge shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.06em] text-ice">{ENTRY_TYPE_LABELS[r.type]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-muted">No published entries match “{trimmed}”.</p>
          )}
          <div className="flex flex-col gap-2 border-t border-line px-4 py-3 text-sm sm:flex-row sm:gap-6">
            <Link prefetch={false} href={companiesHref(`q=${q}`)} className="link inline-flex items-center gap-1">
              {orgCount} in Companies &amp; Labs <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <Link prefetch={false} href={openHref(`q=${q}`)} className="link inline-flex items-center gap-1">
              {artifactCount} in Open Models &amp; Tools <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
