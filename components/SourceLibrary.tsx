"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LibraryEntry } from "@/lib/source-library";
import { ExternalLink } from "./ExternalLink";
import { SearchField, SelectField } from "./FilterControls";
import { SOURCE_KIND_LABELS } from "./Sources";

const PAGE = 25;
const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** Searchable index of every cited source; loads /data/sources.json after first paint. */
export function SourceLibrary({ dataUrl, total }: { dataUrl: string; total: number }) {
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    let live = true;
    fetch(dataUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { entries: LibraryEntry[] }) => { if (live) setEntries(d.entries); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [dataUrl]);
  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return (entries ?? []).filter((e) => {
      if (kind && e.kind !== kind) return false;
      const text = `${e.title} ${e.publisher} ${host(e.url)} ${e.cited_by.map((c) => c.name).join(" ")}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  }, [entries, q, kind]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const current = Math.min(page, pages);
  const visible = results.slice((current - 1) * PAGE, current * PAGE);
  return (
    <div>
      <div role="search" aria-label="Search cited sources" className="card grid gap-4 p-4 sm:grid-cols-2">
        <SearchField label="Search sources" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Title, publisher, website, or record…" />
        <SelectField label="Source type" value={kind} options={Object.entries(SOURCE_KIND_LABELS).map(([value, label]) => ({ value, label }))} onChange={(v) => { setKind(v); setPage(1); }} allLabel="All types" />
      </div>
      <p role="status" aria-live="polite" className="meta my-4">
        {entries ? `${results.length.toLocaleString("en-US")} of ${entries.length.toLocaleString("en-US")} sources` : failed ? "The source index could not be loaded." : `Loading ${total.toLocaleString("en-US")} sources…`}
      </p>
      <noscript>
        <p className="text-sm text-muted">Searching needs JavaScript. The full list is available as data from the <Link href="/reuse/" className="link">data and reuse page</Link>.</p>
      </noscript>
      <ul className="space-y-4">
        {visible.map((e) => (
          <li key={e.url} className="card p-4">
            <ExternalLink href={e.url}>{e.title}</ExternalLink>
            <p className="meta mt-1 text-[0.8125rem]">
              {e.publisher}
              {e.kind ? ` · ${SOURCE_KIND_LABELS[e.kind]}` : ""}
              {e.published_at ? ` · published ${e.published_at}` : ""} · accessed {e.accessed_at}
            </p>
            <p className="mt-2 text-sm text-muted">
              Cited by{" "}
              {e.cited_by.slice(0, 4).map((c, i) => (
                <span key={c.href}>
                  {i > 0 ? ", " : ""}
                  <Link prefetch={false} href={c.href} className="link">{c.name}</Link>
                </span>
              ))}
              {e.cited_by.length > 4 ? ` and ${e.cited_by.length - 4} more` : ""}
            </p>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <nav aria-label="Source pages" className="my-6 flex flex-wrap items-center justify-center gap-4">
          <button type="button" className="btn btn-secondary" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
          <span className="text-sm text-muted">Page {current} of {pages}</span>
          <button type="button" className="btn btn-secondary" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
        </nav>
      ) : null}
    </div>
  );
}
