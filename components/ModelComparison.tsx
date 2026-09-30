"use client";

import Link from "next/link";
import { MODEL_COLUMNS, type MatrixCell, type ModelMatrixRow } from "@/lib/matrix";
import { orgHref } from "@/lib/routes";
import { SelectField } from "./FilterControls";
import { useQueryState } from "./useQueryState";

export interface ComparisonState { orgs: string[]; detail: boolean }
export function parseComparison(params: URLSearchParams): ComparisonState {
  return {
    orgs: [...new Set((params.get("orgs") ?? "").split(",").filter((s) => /^[a-z0-9-]{1,80}$/.test(s)))].slice(0, 4),
    detail: params.get("detail") === "1",
  };
}
export function serializeComparison(state: ComparisonState): string {
  const params = new URLSearchParams();
  if (state.orgs.length) params.set("orgs", state.orgs.join(","));
  if (state.detail) params.set("detail", "1");
  return params.toString();
}

function CountLink({ cell, label }: { cell: MatrixCell; label: string }) {
  return <Link prefetch={false} href={cell.href}
    className={`inline-flex min-h-11 min-w-11 items-center justify-end rounded px-1 underline-offset-4 hover:underline ${cell.count === 0 ? "text-muted" : "text-ice"}`}
    aria-label={`${cell.count} — ${label}. View the records counted.`} data-count={cell.count}>{cell.count}</Link>;
}

export function ModelComparison({ rows }: { rows: ModelMatrixRow[] }) {
  const { state, update } = useQueryState(parseComparison, serializeComparison);
  const selected = state.orgs.filter((slug) => rows.some((r) => r.org.slug === slug));
  const visible = state.orgs.length ? rows.filter((r) => selected.includes(r.org.slug)) : rows;
  const columns = state.detail ? MODEL_COLUMNS : MODEL_COLUMNS.filter((c) => ["releases", "open-weight"].includes(c.key));
  return <div className="mt-4">
    <div className="card p-4">
      <p id="comparison-help" className="mb-3 text-sm text-muted">Choose up to four organizations for a focused comparison. With none selected, all organizations are shown in name order.</p>
      <div className="grid items-end gap-3 sm:grid-cols-2">
        <SelectField label="Add organization to compare" value="" allLabel={selected.length < 4 ? "Choose an organization…" : "Four selected — remove one first"}
          options={selected.length < 4 ? rows.filter((r) => !selected.includes(r.org.slug)).map((r) => ({ value: r.org.slug, label: r.org.name })) : []}
          onChange={(slug) => { if (slug && selected.length < 4) update({ ...state, orgs: [...selected, slug] }); }} />
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="h-5 w-5 accent-[#4cc9ff]" checked={state.detail}
            onChange={(e) => update({ ...state, detail: e.target.checked })} />Show all comparison columns
        </label>
      </div>
      {selected.length > 0 && <ul aria-label="Selected organizations" className="mt-3 flex flex-wrap gap-2">
        {selected.map((slug) => <li key={slug}><button type="button" className="btn btn-secondary text-sm"
          onClick={() => update({ ...state, orgs: selected.filter((s) => s !== slug) })}>
          Remove {rows.find((r) => r.org.slug === slug)!.org.name}
        </button></li>)}
      </ul>}
      {(state.orgs.length > 0 || state.detail) && <button type="button" className="link mt-2 min-h-11 text-sm" onClick={() => update({ orgs: [], detail: false })}>Reset comparison</button>}
      <noscript><p className="mt-2 text-sm text-muted">Selection needs JavaScript. All organizations appear below; their record pages contain the full evidence.</p></noscript>
    </div>
    <p role="status" aria-live="polite" aria-atomic="true" className="meta my-3">Showing {visible.length} of {rows.length} organizations · {state.detail ? "All columns" : "Summary columns"}</p>
    {visible.length ? <div className="table-scroll lg:max-h-[65vh]" tabIndex={0} role="region" aria-label="Organization comparison table; scroll horizontally for more columns">
      <table className="data-table">
        <caption className="sr-only">Model releases view: documented hosted-model products and model records. Counts describe catalog coverage, not capability.</caption>
        <thead><tr>
          <th scope="col" className="sticky-col min-w-[10rem]">Organization</th>
          <th scope="col" className="num min-w-[7rem]">Hosted model products</th>
          {columns.map((c) => <th key={c.key} scope="col" className="num min-w-[7rem]" title={c.description}>{c.label}</th>)}
        </tr></thead>
        <tbody>{visible.map((row) => <tr key={row.org.slug} data-org={row.org.slug}>
          <th scope="row" className="sticky-col"><Link prefetch={false} href={orgHref(row.org.slug)} className="link font-medium">{row.org.name}</Link></th>
          <td className="num" data-col="hosted"><CountLink cell={row.hosted} label={`hosted model products documented for ${row.org.name}`} /></td>
          {columns.map((c) => <td key={c.key} className="num" data-col={c.key}><CountLink cell={row.cells[c.key]} label={`${c.label} for ${row.org.name}`} /></td>)}
        </tr>)}</tbody>
      </table>
    </div> : <p className="mt-4 text-muted">No published organizations match this selection. Reset comparison to see all organizations.</p>}
  </div>;
}
