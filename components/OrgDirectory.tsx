"use client";

import { useMemo } from "react";
import { OWNERSHIP_LABELS, ROLE_LABELS, SECTOR_LABELS } from "@/lib/labels";
import {
  DEFAULT_ORG_FILTERS,
  activeFilterCount,
  filterOrganizations,
  parseOrgFilters,
  serializeOrgFilters,
  type OrgFilters,
  type OrgListItem,
  type OrgSort,
} from "@/lib/search";
import { OrgCard } from "./Cards";
import { FilterChip, ResultSummary, SearchField, SelectField } from "./FilterControls";
import { useDebounced, useQueryState } from "./useQueryState";

const SORT_LABELS: Record<OrgSort, string> = {
  name: "Name (A–Z)",
  reviewed: "Recently reviewed",
  artifacts: "Most open-artifact records in this catalog",
};

export function OrgDirectory({ items }: { items: OrgListItem[] }) {
  const { state: f, update } = useQueryState<OrgFilters>(parseOrgFilters, serializeOrgFilters);
  const results = useMemo(() => filterOrganizations(items, f), [items, f]);
  const announce = useDebounced(`${results.length} of ${items.length} organizations shown`);

  const options = useMemo(() => {
    const uniq = <T extends string>(values: T[]) => [...new Set(values)].sort();
    return {
      sectors: uniq(items.flatMap((i) => i.sectors)).map((v) => ({ value: v, label: SECTOR_LABELS[v] })),
      roles: uniq(items.flatMap((i) => i.roles)).map((v) => ({ value: v, label: ROLE_LABELS[v] })),
      ownership: uniq(items.map((i) => i.ownership)).map((v) => ({ value: v, label: OWNERSHIP_LABELS[v] })),
    };
  }, [items]);

  const set = (patch: Partial<OrgFilters>, mode: "push" | "replace" = "push") => update({ ...f, ...patch }, mode);
  const chips: Array<{ label: string; clear: Partial<OrgFilters> }> = [];
  if (f.q) chips.push({ label: `Search: “${f.q}”`, clear: { q: "" } });
  if (f.sector) chips.push({ label: `Sector: ${SECTOR_LABELS[f.sector]}`, clear: { sector: "" } });
  if (f.role) chips.push({ label: `Role: ${ROLE_LABELS[f.role]}`, clear: { role: "" } });
  if (f.ownership) chips.push({ label: `Ownership: ${OWNERSHIP_LABELS[f.ownership]}`, clear: { ownership: "" } });
  if (f.structure) chips.push({ label: f.structure === "unit" ? "Units and subsidiaries only" : "Top-level organizations only", clear: { structure: "" } });
  if (f.open) chips.push({ label: "Has cataloged artifact records", clear: { open: false } });

  return (
    <div>
      <div className="card p-4 sm:p-5" role="search" aria-label="Filter organizations">
        <SearchField label="Search organizations" value={f.q} placeholder="Name, product, location…" onChange={(q) => set({ q }, "replace")} />
        <details className="mt-3">
          <summary className="min-h-9 cursor-pointer text-sm font-medium text-ice">Filters and sort ({Math.max(0, activeFilterCount(f) - (f.q ? 1 : 0))} active)</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <SelectField label="Sector" value={f.sector} options={options.sectors} onChange={(sector) => set({ sector })} allLabel="All sectors" />
            <SelectField label="Role" value={f.role} options={options.roles} onChange={(role) => set({ role })} allLabel="All roles" />
            <SelectField label="Ownership" value={f.ownership} options={options.ownership} onChange={(ownership) => set({ ownership })} allLabel="Any ownership" />
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[0.9375rem]">
                <input type="checkbox" className="h-5 w-5 accent-[#4cc9ff]" checked={f.open} onChange={(e) => set({ open: e.target.checked })} />
                Has cataloged artifact records
              </label>
              <SelectField
                label="Structure"
                value={f.structure}
                options={[
                  { value: "independent", label: "Top-level organizations" },
                  { value: "unit", label: "Units and subsidiaries" },
                ]}
                onChange={(structure) => set({ structure })}
                allLabel="All records"
              />
            </div>
            <SelectField
              label="Sort"
              value={f.sort === "name" ? "" : f.sort}
              options={[
                { value: "reviewed" as OrgSort, label: SORT_LABELS.reviewed },
                { value: "artifacts" as OrgSort, label: SORT_LABELS.artifacts },
              ]}
              onChange={(sort) => set({ sort: (sort || "name") as OrgSort })}
              allLabel={f.q.trim() ? "Relevance, then name" : SORT_LABELS.name}
            />
          </div>
        </details>
        <noscript>
          <p className="mt-3 text-sm text-muted">Filtering needs JavaScript. Every organization is listed below.</p>
        </noscript>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ResultSummary visible={results.length} total={items.length} noun={["organization", "organizations"]} announce={announce} />
        {activeFilterCount(f) > 0 ? (
          <button type="button" className="link min-h-11 text-sm" onClick={() => update({ ...DEFAULT_ORG_FILTERS, sort: f.sort })}>
            Clear all filters
          </button>
        ) : null}
      </div>
      {chips.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <FilterChip key={c.label} label={c.label} onRemove={() => set(c.clear)} />
          ))}
        </ul>
      ) : null}

      {results.length > 0 ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <li key={item.slug}>
              <OrgCard item={item} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong p-8 text-center">
          <p className="text-lg text-text">No organizations match these filters.</p>
          <p className="mt-2 text-muted">A zero here means no matching published record in this catalog, not that none exist.</p>
          <button type="button" className="btn btn-secondary mt-4" onClick={() => update({ ...DEFAULT_ORG_FILTERS })}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
