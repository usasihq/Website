"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import {
  AUTHOR_TYPE_LABELS,
  DEFAULT_HF_FILTERS,
  activeHfFilters,
  filterHf,
  hfLicenseLabel,
  isDefaultHfView,
  parseHfFilters,
  serializeHfFilters,
  taskLabel,
  type HfFilters,
  type HfListItem,
} from "@/lib/huggingface/directory";
import { FilterChip, ResultSummary, SearchField, SelectField, ShowMore } from "./FilterControls";
import { HfRow } from "./HfList";
import { useLazyList } from "./useLazyList";
import { useDebounced, useQueryState, useShowMore } from "./useQueryState";

const PAGE_SIZE = 100;
type Option = { value: string; count: number };

/**
 * The ranked list on /huggingface/ (models) and /huggingface/datasets/. The
 * page embeds the first 100 items; the full list (public/data/huggingface-*.json,
 * from this site only) loads when someone searches, filters, or shows more.
 * Filter state lives in the address bar; nothing is stored in the browser.
 */
export function HfDirectory({
  kind,
  initial,
  total,
  dataUrl,
  tasks,
  libraries,
  licenses,
  modalities,
}: {
  kind: "model" | "dataset";
  initial: HfListItem[];
  total: number;
  dataUrl: string;
  tasks: Option[];
  libraries: Option[];
  licenses: Option[];
  modalities: Option[];
}) {
  const { state: f, update } = useQueryState<HfFilters>(parseHfFilters, serializeHfFilters);
  const [wanted, setWanted] = useState(false);
  const { limit, showMore } = useShowMore(PAGE_SIZE);
  const needed = wanted || !isDefaultHfView(f) || (Number.isFinite(limit) && limit > PAGE_SIZE);
  const { all, failed } = useLazyList<HfListItem>(dataUrl, needed, (d) => (d as { items: HfListItem[] }).items);
  const items = all ?? initial;
  const waiting = all === null && !failed && !isDefaultHfView(f);
  const results = useMemo(() => filterHf(items, f), [items, f]);
  const shownTotal = all || failed || !isDefaultHfView(f) ? results.length : total;
  const listRef = useRef<HTMLOListElement>(null);
  const noun: [string, string] = kind === "model" ? ["model", "models"] : ["dataset", "datasets"];
  const announce = useDebounced(waiting ? `Loading all ${noun[1]}.` : `${shownTotal.toLocaleString("en-US")} of ${total.toLocaleString("en-US")} ${noun[1]} shown`);

  const set = (patch: Partial<HfFilters>, mode: "push" | "replace" = "push") => update({ ...f, ...patch }, mode);
  const chips: Array<{ label: string; clear: Partial<HfFilters> }> = [];
  if (f.q) chips.push({ label: `Search: “${f.q}”`, clear: { q: "" } });
  if (f.task) chips.push({ label: `Task: ${taskLabel(f.task)}`, clear: { task: "" } });
  if (f.lib) chips.push({ label: `Library: ${f.lib}`, clear: { lib: "" } });
  if (f.modality) chips.push({ label: `Modality: ${f.modality}`, clear: { modality: "" } });
  if (f.license) chips.push({ label: `License: ${hfLicenseLabel(f.license)}`, clear: { license: "" } });
  if (f.author) chips.push({ label: `Author: ${AUTHOR_TYPE_LABELS[f.author]}`, clear: { author: "" } });
  if (f.gated) chips.push({ label: f.gated === "yes" ? "Gated only" : "Not gated", clear: { gated: "" } });
  if (f.quant) chips.push({ label: f.quant === "yes" ? "Quantized versions only" : "No quantized versions", clear: { quant: "" } });
  const withSelected = (opts: Option[], v: string) => (v && !opts.some((o) => o.value === v) ? [{ value: v, count: 0 }, ...opts] : opts);
  const counted = (label: string, n: number) => (n ? `${label} (${n.toLocaleString("en-US")})` : label);

  return (
    <div>
      <div className="card p-4 sm:p-5" role="search" aria-label={`Filter ${noun[1]}`}>
        <SearchField
          label={`Search ${noun[1]}`}
          value={f.q}
          placeholder={kind === "model" ? "Name, author, task, library, base model…" : "Name, author, task, description…"}
          onChange={(q) => set({ q }, "replace")}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <SelectField
            label="Task"
            value={f.task}
            options={withSelected(tasks, f.task).map((o) => ({ value: o.value, label: counted(taskLabel(o.value), o.count) }))}
            onChange={(task) => set({ task })}
            allLabel="Any task"
          />
          {kind === "model" ? (
            <SelectField
              label="Library"
              value={f.lib}
              options={withSelected(libraries, f.lib).map((o) => ({ value: o.value, label: counted(o.value, o.count) }))}
              onChange={(lib) => set({ lib })}
              allLabel="Any library"
            />
          ) : (
            <SelectField
              label="Modality"
              value={f.modality}
              options={withSelected(modalities, f.modality).map((o) => ({ value: o.value, label: counted(o.value, o.count) }))}
              onChange={(modality) => set({ modality })}
              allLabel="Any modality"
            />
          )}
          <SelectField
            label="License"
            value={f.license}
            options={withSelected(licenses, f.license).map((o) => ({ value: o.value, label: counted(hfLicenseLabel(o.value), o.count) }))}
            onChange={(license) => set({ license })}
            allLabel="Any license"
          />
          <SelectField
            label="Author"
            value={f.author}
            options={(["org", "user"] as const).map((v) => ({ value: v, label: AUTHOR_TYPE_LABELS[v] }))}
            onChange={(author) => set({ author })}
            allLabel="Any author"
          />
          <SelectField
            label="Access"
            value={f.gated}
            options={[
              { value: "no" as const, label: "Open download" },
              { value: "yes" as const, label: "Gated (accept terms)" },
            ]}
            onChange={(gated) => set({ gated })}
            allLabel="Any access"
          />
          {kind === "model" ? (
            <SelectField
              label="Quantized"
              value={f.quant}
              options={[
                { value: "no" as const, label: "Not quantized" },
                { value: "yes" as const, label: "Quantized versions" },
              ]}
              onChange={(quant) => set({ quant })}
              allLabel="Either"
            />
          ) : null}
        </div>
        <noscript>
          <p className="mt-3 text-sm text-muted">Filtering needs JavaScript. The full ranking is in the pages linked below the list.</p>
        </noscript>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ResultSummary visible={Math.min(limit, results.length)} total={shownTotal} noun={noun} announce={announce} pending={waiting} />
        {activeHfFilters(f) > 0 ? (
          <button type="button" className="link min-h-11 text-sm" onClick={() => update({ ...DEFAULT_HF_FILTERS })}>
            Clear all filters
          </button>
        ) : null}
      </div>
      {failed ? (
        <p className="mt-2 text-sm text-muted">
          The full list could not be loaded; filters apply to the first {initial.length} {noun[1]}.
        </p>
      ) : null}
      {chips.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <FilterChip key={c.label} label={c.label} onRemove={() => set(c.clear)} />
          ))}
        </ul>
      ) : null}

      {waiting ? null : results.length > 0 ? (
        <>
          <ol ref={listRef} className="mt-4 grid gap-3" data-testid="hf-list">
            {results.slice(0, limit).map((item) => (
              <li key={item.slug}>
                <HfRow item={item} />
              </li>
            ))}
          </ol>
          <ShowMore
            shown={Math.min(limit, results.length)}
            total={shownTotal}
            step={PAGE_SIZE}
            noun={noun}
            listRef={listRef as unknown as RefObject<HTMLUListElement | null>}
            onMore={() => {
              setWanted(true);
              showMore(shownTotal);
            }}
          />
        </>
      ) : (
        <div className="card mt-4 p-6 text-muted">
          No {noun[0]} matches these filters.{" "}
          <button type="button" className="link" onClick={() => update({ ...DEFAULT_HF_FILTERS })}>
            Show all {noun[1]}
          </button>
          .
        </div>
      )}
    </div>
  );
}
