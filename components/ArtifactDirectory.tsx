"use client";

import { useMemo } from "react";
import { KIND_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { AVAILABILITY_LABELS, CHECKLISTS, TIER_LABELS, type TierFilter } from "@/lib/openness";
import {
  DEFAULT_ARTIFACT_FILTERS,
  LICENSE_COMPONENTS,
  matchedLicenses,
  activeFilterCount,
  filterArtifacts,
  parseArtifactFilters,
  serializeArtifactFilters,
  type ArtifactFilters,
  type ArtifactListItem,
  type ArtifactSort,
} from "@/lib/search";
import type { ArtifactKind, AvailabilityStatus, RecordLevel } from "@/lib/schema";
import { ArtifactCard } from "./Cards";
import { FilterChip, ResultSummary, SearchField, SelectField } from "./FilterControls";
import { useDebounced, useQueryState } from "./useQueryState";
import { DownloadResults } from "./DownloadResults";
import { artifactExport } from "@/lib/export";
import { siteConfig } from "@/lib/site-config";

const SORT_OPTIONS: Array<{ value: ArtifactSort; label: string }> = [
  { value: "reviewed", label: "Recently reviewed" },
  { value: "released", label: "Documented release date" },
];

const TIER_OPTIONS: Array<{ value: TierFilter; label: string }> = [
  { value: "open-weight", label: "Open-weight (incl. open-stack, reviewed open systems)" },
  { value: "open-stack", label: "Open-stack (incl. reviewed open systems)" },
  { value: "fully-open", label: "Open system (reviewed)" },
  { value: "restricted-weights", label: TIER_LABELS["restricted-weights"] },
  { value: "weights-not-public", label: TIER_LABELS["weights-not-public"] },
  { value: "unknown", label: "Weights unassessed" },
];

const CHECK_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(CHECKLISTS)
    .flat()
    .map((d) => [d.key, d.label]),
);

function describeCheck(check: string) {
  const [key, mode] = check.split(":");
  const label = CHECK_LABEL[key] ?? key;
  if (mode === "public") return `${label}: public`;
  if (mode === "documented") return `${label}: public or partial`;
  return `${label}: unknown`;
}

export function ArtifactDirectory({ items, asOf }: { items: ArtifactListItem[]; asOf?: string }) {
  const { state: f, update } = useQueryState<ArtifactFilters>(parseArtifactFilters, serializeArtifactFilters);
  const results = useMemo(() => filterArtifacts(items, f), [items, f]);
  const announce = useDebounced(`${results.length} of ${items.length} records shown`);

  const options = useMemo(() => {
    const kinds = [...new Set(items.map((i) => i.kind))].sort() as ArtifactKind[];
    const levels = [...new Set(items.map((i) => i.level))] as RecordLevel[];
    const availability = [...new Set(items.filter((i) => i.level !== "family").map((i) => i.availability))] as AvailabilityStatus[];
    const licenses = new Map<string, string>();
    items.forEach((i) => i.licenses.forEach((l) => licenses.set(l.key, l.label)));
    const orgs = new Map<string, string>();
    items.forEach((i) => i.organizations.forEach((o) => o.name && orgs.set(o.slug, o.name)));
    return {
      kinds: kinds.map((v) => ({ value: v, label: KIND_LABELS[v] })),
      levels: levels.sort().map((v) => ({ value: v, label: v === "project" ? "Project (software, data, evals)" : LEVEL_LABELS[v] })),
      availability: availability.sort().map((v) => ({ value: v, label: AVAILABILITY_LABELS[v] })),
      licenses: [...licenses.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label })),
      orgs: [...orgs.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label })),
      orgNames: orgs,
    };
  }, [items]);

  const set = (patch: Partial<ArtifactFilters>, mode: "push" | "replace" = "push") => update({ ...f, ...patch }, mode);

  const chips: Array<{ label: string; clear: Partial<ArtifactFilters> }> = [];
  if (f.q) chips.push({ label: `Search: “${f.q}”`, clear: { q: "" } });
  if (f.kind) chips.push({ label: `Kind: ${KIND_LABELS[f.kind]}`, clear: { kind: "" } });
  if (f.level) chips.push({ label: `Record: ${LEVEL_LABELS[f.level]}`, clear: { level: "" } });
  if (f.availability) chips.push({ label: `Availability: ${AVAILABILITY_LABELS[f.availability]}`, clear: { availability: "" } });
  if (f.licenseComponent) chips.push({ label: `License component: ${f.licenseComponent}`, clear: { licenseComponent: "" } });
  if (f.license) chips.push({ label: `License: ${f.license}`, clear: { license: "" } });
  if (f.tier) chips.push({ label: `Tier: ${TIER_OPTIONS.find((t) => t.value === f.tier)?.label}`, clear: { tier: "" } });
  if (f.org) chips.push({ label: `Organization: ${options.orgNames.get(f.org) ?? f.org}`, clear: { org: "" } });
  if (f.check) chips.push({ label: describeCheck(f.check), clear: { check: "" } });

  return (
    <div>
      <div className="card p-4 sm:p-5" role="search" aria-label="Filter open models and tools">
        <SearchField label="Search open models and tools" value={f.q} placeholder="Name, maintainer, license, tag…" onChange={(q) => set({ q }, "replace")} />
        <details className="mt-3">
          <summary className="min-h-9 cursor-pointer text-sm font-medium text-ice">Filters and sort ({Math.max(0, activeFilterCount(f) - (f.q ? 1 : 0))} active)</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <SelectField label="Kind" value={f.kind} options={options.kinds} onChange={(kind) => set({ kind })} allLabel="All kinds" />
            <SelectField label="Record level" value={f.level} options={options.levels} onChange={(level) => set({ level })} allLabel="All records" />
            <SelectField label="Availability" value={f.availability} options={options.availability} onChange={(availability) => set({ availability })} allLabel="Any availability" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SelectField label="License component" value={f.licenseComponent} options={LICENSE_COMPONENTS.map(value => ({ value, label: value === "documentation" ? "Documentation" : value[0].toUpperCase() + value.slice(1) }))} onChange={(licenseComponent) => set({ licenseComponent })} allLabel="Any component" />
            <SelectField label="License" value={f.license} options={options.licenses} onChange={(license) => set({ license })} allLabel="Any license" />
            <SelectField label="Model-disclosure tier (rubric v0.2)" value={f.tier} options={TIER_OPTIONS} onChange={(tier) => set({ tier })} allLabel="Any tier" />
            <SelectField label="Organization" value={f.org} options={options.orgs} onChange={(org) => set({ org })} allLabel="Any organization" />
            <SelectField
              label="Sort"
              value={f.sort === "name" ? "" : f.sort}
              options={SORT_OPTIONS}
              onChange={(sort) => set({ sort: (sort || "name") as ArtifactSort })}
              allLabel={f.q.trim() ? "Relevance, then name" : "Name (A–Z)"}
            />
          </div>
        </details>
        <noscript>
          <p className="mt-3 text-sm text-muted">Filtering needs JavaScript. Every record is listed below.</p>
        </noscript>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ResultSummary visible={results.length} total={items.length} noun={["record", "records"]} announce={announce} />
        <DownloadResults
          count={results.length}
          filename={`usasi-open-models-and-tools-${(asOf ?? "").slice(0, 10) || "export"}`}
          build={() => artifactExport(results, `https://${siteConfig.domain}`, serializeArtifactFilters(f), asOf ?? "")}
        />
        {activeFilterCount(f) > 0 ? (
          <button type="button" className="link min-h-11 text-sm" onClick={() => update({ ...DEFAULT_ARTIFACT_FILTERS, sort: f.sort })}>
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
              <ArtifactCard item={item} headingLevel={2} />
              {f.license || f.licenseComponent ? <p className="mt-2 px-2 text-sm text-muted" data-license-match>License match: {matchedLicenses(item, f).map(l => `${l.label} (${l.appliesTo})`).join("; ")}. A component match does not license the whole artifact.</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong p-8 text-center">
          <p className="text-lg text-text">No records match these filters.</p>
          <p className="mt-2 text-muted">A zero here means no matching published record in this catalog, not that none exist elsewhere.</p>
          <button type="button" className="btn btn-secondary mt-4" onClick={() => update({ ...DEFAULT_ARTIFACT_FILTERS })}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
