"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  DEFAULT_GITHUB_FILTERS,
  OWNER_TYPE_LABELS,
  activeGithubFilters,
  filterGithub,
  isDefaultGithubView,
  licenseLabel,
  parseGithubFilters,
  serializeGithubFilters,
  type GithubFilters,
  type GithubListItem,
} from "@/lib/github/directory";
import { FilterChip, ResultSummary, SearchField, SelectField, ShowMore } from "./FilterControls";
import { GithubRow } from "./GithubList";
import { useDebounced, useQueryState, useShowMore } from "./useQueryState";

const PAGE_SIZE = 100;
type Option = { value: string; count: number };

/**
 * The ranked list on /github/. The page embeds the first 100 projects; the
 * full list (public/data/github.json, from this site only) loads when someone
 * searches, filters, or shows more. Filter state lives in the address bar; nothing is stored in the browser.
 */
export function GithubDirectory({
  initial,
  total,
  dataUrl,
  topics,
  languages,
  licenses,
}: {
  initial: GithubListItem[];
  total: number;
  dataUrl: string;
  topics: Option[];
  languages: Option[];
  licenses: Option[];
}) {
  const { state: f, update } = useQueryState<GithubFilters>(parseGithubFilters, serializeGithubFilters);
  const [all, setAll] = useState<GithubListItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  // The full list is fetched only once someone filters, searches, or asks for more.
  const [wanted, setWanted] = useState(false);
  const { limit, showMore } = useShowMore(PAGE_SIZE);
  const needed = wanted || !isDefaultGithubView(f) || (Number.isFinite(limit) && limit > PAGE_SIZE);
  useEffect(() => {
    if (!needed) return;
    let live = true;
    fetch(dataUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { projects: GithubListItem[] }) => {
        if (live) setAll(d.projects);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [dataUrl, needed]);
  const items = all ?? initial;
  const waiting = all === null && !failed && !isDefaultGithubView(f);
  const results = useMemo(() => filterGithub(items, f), [items, f]);
  const shownTotal = all || failed || !isDefaultGithubView(f) ? results.length : total;
  const listRef = useRef<HTMLOListElement>(null);
  const announce = useDebounced(waiting ? "Loading all projects." : `${shownTotal.toLocaleString("en-US")} of ${total.toLocaleString("en-US")} projects shown`);

  const set = (patch: Partial<GithubFilters>, mode: "push" | "replace" = "push") => update({ ...f, ...patch }, mode);
  const chips: Array<{ label: string; clear: Partial<GithubFilters> }> = [];
  if (f.q) chips.push({ label: `Search: “${f.q}”`, clear: { q: "" } });
  if (f.topic) chips.push({ label: `Topic: ${f.topic}`, clear: { topic: "" } });
  if (f.lang) chips.push({ label: `Language: ${f.lang}`, clear: { lang: "" } });
  if (f.license) chips.push({ label: `License: ${licenseLabel(f.license)}`, clear: { license: "" } });
  if (f.owner) chips.push({ label: `Owner: ${OWNER_TYPE_LABELS[f.owner]}`, clear: { owner: "" } });
  const withSelected = (opts: Option[], v: string) => (v && !opts.some((o) => o.value === v) ? [{ value: v, count: 0 }, ...opts] : opts);

  return (
    <div>
      <div className="card p-4 sm:p-5" role="search" aria-label="Filter projects">
        <SearchField label="Search projects" value={f.q} placeholder="Name, owner, description, topic…" onChange={(q) => set({ q }, "replace")} />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <SelectField
            label="Topic"
            value={f.topic}
            options={withSelected(topics, f.topic).map((o) => ({ value: o.value, label: o.count ? `${o.value} (${o.count})` : o.value }))}
            onChange={(topic) => set({ topic })}
            allLabel="Any topic"
          />
          <SelectField
            label="Language"
            value={f.lang}
            options={withSelected(languages, f.lang).map((o) => ({ value: o.value, label: o.count ? `${o.value} (${o.count})` : o.value }))}
            onChange={(lang) => set({ lang })}
            allLabel="Any language"
          />
          <SelectField
            label="License"
            value={f.license}
            options={withSelected(licenses, f.license).map((o) => ({ value: o.value, label: `${licenseLabel(o.value)}${o.count ? ` (${o.count})` : ""}` }))}
            onChange={(license) => set({ license })}
            allLabel="Any license"
          />
          <SelectField
            label="Owner"
            value={f.owner}
            options={(["Organization", "User"] as const).map((v) => ({ value: v, label: OWNER_TYPE_LABELS[v] }))}
            onChange={(owner) => set({ owner })}
            allLabel="Any owner"
          />
        </div>
        <noscript>
          <p className="mt-3 text-sm text-muted">Filtering needs JavaScript. The full ranking is in the pages linked below the list.</p>
        </noscript>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ResultSummary visible={Math.min(limit, results.length)} total={shownTotal} noun={["project", "projects"]} announce={announce} pending={waiting} />
        {activeGithubFilters(f) > 0 ? (
          <button type="button" className="link min-h-11 text-sm" onClick={() => update({ ...DEFAULT_GITHUB_FILTERS })}>
            Clear all filters
          </button>
        ) : null}
      </div>
      {failed ? <p className="mt-2 text-sm text-muted">The full list could not be loaded; filters apply to the first {initial.length} projects.</p> : null}
      {chips.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <FilterChip key={c.label} label={c.label} onRemove={() => set(c.clear)} />
          ))}
        </ul>
      ) : null}

      {waiting ? null : results.length > 0 ? (
        <>
          <ol ref={listRef} className="mt-4 grid gap-3" data-testid="github-list">
            {results.slice(0, limit).map((item) => (
              <li key={item.slug}>
                <GithubRow item={item} />
              </li>
            ))}
          </ol>
          <ShowMore
            shown={Math.min(limit, results.length)}
            total={shownTotal}
            step={PAGE_SIZE}
            noun={["project", "projects"]}
            listRef={listRef as unknown as RefObject<HTMLUListElement | null>}
            onMore={() => {
              setWanted(true);
              showMore(shownTotal);
            }}
          />
        </>
      ) : (
        <div className="card mt-4 p-6 text-muted">
          No project matches these filters.{" "}
          <button type="button" className="link" onClick={() => update({ ...DEFAULT_GITHUB_FILTERS })}>
            Show all projects
          </button>
          .
        </div>
      )}
    </div>
  );
}
