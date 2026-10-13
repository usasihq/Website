"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import {
  DEFAULT_PEOPLE_FILTERS,
  PERSON_GROUP_LABELS,
  PERSON_SECTOR_LABELS,
  PERSON_SPECIALTY_LABELS,
  WORK_TYPE_LABELS,
  activePeopleFilters,
  filterPeople,
  parsePeopleFilters,
  serializePeopleFilters,
  type PeopleFilters,
  type PeopleListItem,
} from "@/lib/people";
import { PERSON_GROUPS, PERSON_SECTORS, PERSON_SPECIALTIES, WORK_TYPES } from "@/lib/schema";
import { FilterChip, ResultSummary, SearchField, SelectField, ShowMore } from "./FilterControls";
import { InitialsTile } from "./LocalCorner";
import { useDebounced, useQueryState, useShowMore } from "./useQueryState";

/** Profiles shown per "Show more" step once the page is interactive. */
const PAGE_SIZE = 48;

/** A profile card; with an organization filter, it shows the person's role there (current or earlier). */
function PersonCard({ item, org }: { item: PeopleListItem; org: string }) {
  const atOrg = org ? item.organizations.filter((o) => o.slug === org) : [];
  const current = item.organizations.filter((o) => o.current);
  const where = (atOrg.length ? atOrg : current.length ? current : item.organizations).slice(0, 2);
  const earlier = where.length > 0 && where.every((o) => !o.current);
  return (
    <article className="card card-link relative flex h-full flex-col p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <InitialsTile initials={item.initials} />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-snug text-text">
            <Link prefetch={false} href={item.href} className="after:absolute after:inset-0 after:content-['']">
              {item.name}
            </Link>
          </h2>
          {where.length ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">
              {where.map((o) => `${o.role}, ${o.name}`).join(" · ")}
              {earlier ? " (earlier)" : ""}
            </p>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-[0.9375rem] text-[#d5def2]">{item.headline}</p>
      <p className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {item.kind === "leader" ? <span className="badge border-[rgba(251,191,36,0.4)] text-xs">People Behind Big SI</span> : null}
        {item.groups.includes("local") ? <span className="badge text-xs">Local SI</span> : null}
        {item.specialties.slice(0, 2).map((s) => (
          <span key={s} className="badge text-xs">
            {PERSON_SPECIALTY_LABELS[s]}
          </span>
        ))}
      </p>
    </article>
  );
}

export function PeopleDirectory({ items, organizations }: { items: PeopleListItem[]; organizations: { slug: string; name: string }[] }) {
  const { state: f, update } = useQueryState<PeopleFilters>(parsePeopleFilters, serializePeopleFilters);
  const results = useMemo(() => filterPeople(items, f), [items, f]);
  const announce = useDebounced(`${results.length} of ${items.length} people shown`);
  const { limit, showMore } = useShowMore(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);
  const orgName = new Map(organizations.map((o) => [o.slug, o.name]));

  const present = useMemo(
    () => ({
      groups: PERSON_GROUPS.filter((g) => items.some((i) => i.groups.includes(g))),
      sectors: PERSON_SECTORS.filter((s) => items.some((i) => i.sector === s)),
      specialties: PERSON_SPECIALTIES.filter((s) => items.some((i) => i.specialties.includes(s))),
      types: WORK_TYPES.filter((t) => items.some((i) => i.workTypes.includes(t))),
    }),
    [items],
  );

  const set = (patch: Partial<PeopleFilters>, mode: "push" | "replace" = "push") => update({ ...f, ...patch }, mode);
  const chips: Array<{ label: string; clear: Partial<PeopleFilters> }> = [];
  if (f.q) chips.push({ label: `Search: “${f.q}”`, clear: { q: "" } });
  if (f.group) chips.push({ label: PERSON_GROUP_LABELS[f.group], clear: { group: "" } });
  if (f.sector) chips.push({ label: `Works at: ${PERSON_SECTOR_LABELS[f.sector]}`, clear: { sector: "" } });
  if (f.specialty) chips.push({ label: `Specialty: ${PERSON_SPECIALTY_LABELS[f.specialty]}`, clear: { specialty: "" } });
  if (f.org) chips.push({ label: `Organization: ${orgName.get(f.org) ?? f.org}`, clear: { org: "" } });
  if (f.type) chips.push({ label: `Contribution: ${WORK_TYPE_LABELS[f.type]}`, clear: { type: "" } });

  return (
    <div>
      <nav aria-label="People groups" className="mb-5">
        <ul className="flex flex-wrap gap-2">
          {[{ value: "" as const, label: "Everyone" }, ...present.groups.map((g) => ({ value: g, label: PERSON_GROUP_LABELS[g] }))].map((g) => (
            <li key={g.value || "all"}>
              <button
                type="button"
                aria-pressed={f.group === g.value}
                onClick={() => set({ group: g.value })}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] ${f.group === g.value ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-line-strong hover:text-text"}`}
              >
                {g.label}
                <span className="ml-1.5 text-sm text-muted">({(g.value ? items.filter((i) => i.groups.includes(g.value)) : items).length})</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="card p-4 sm:p-5" role="search" aria-label="Filter people">
        <SearchField label="Search people" value={f.q} placeholder="Name, organization, project…" onChange={(q) => set({ q }, "replace")} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Organization"
            value={f.org}
            options={organizations.map((o) => ({ value: o.slug, label: o.name }))}
            onChange={(org) => set({ org })}
            allLabel="Any organization"
          />
          <SelectField
            label="Specialty"
            value={f.specialty}
            options={present.specialties.map((s) => ({ value: s, label: PERSON_SPECIALTY_LABELS[s] }))}
            onChange={(specialty) => set({ specialty })}
            allLabel="Any specialty"
          />
          <SelectField
            label="Works at"
            value={f.sector}
            options={present.sectors.map((s) => ({ value: s, label: PERSON_SECTOR_LABELS[s] }))}
            onChange={(sector) => set({ sector })}
            allLabel="Any kind of organization"
          />
          <SelectField
            label="Contribution"
            value={f.type}
            options={present.types.map((t) => ({ value: t, label: WORK_TYPE_LABELS[t] }))}
            onChange={(type) => set({ type })}
            allLabel="Any contribution"
          />
        </div>
        <noscript>
          <p className="mt-3 text-sm text-muted">Filtering needs JavaScript. Everyone is listed below.</p>
        </noscript>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ResultSummary visible={results.length} total={items.length} noun={["person", "people"]} announce={announce} />
        {activePeopleFilters(f) > 0 ? (
          <button type="button" className="link min-h-11 text-sm" onClick={() => update({ ...DEFAULT_PEOPLE_FILTERS })}>
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
        <>
          <ul ref={listRef} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="people-list">
            {results.slice(0, limit).map((item) => (
              <li key={item.href}>
                <PersonCard item={item} org={f.org} />
              </li>
            ))}
          </ul>
          <ShowMore shown={Math.min(limit, results.length)} total={results.length} step={PAGE_SIZE} noun={["person", "people"]} listRef={listRef} onMore={() => showMore(results.length)} />
        </>
      ) : (
        <div className="card mt-4 p-6 text-muted">
          No one matches these filters.{" "}
          <button type="button" className="link" onClick={() => update({ ...DEFAULT_PEOPLE_FILTERS })}>
            Show everyone
          </button>
          .
        </div>
      )}
    </div>
  );
}
