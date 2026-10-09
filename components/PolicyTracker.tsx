"use client";

import { ExternalLink } from "@/components/ExternalLink";
import { useQueryState } from "@/components/useQueryState";
import { DATE_LABEL_VERBS, isInactive, POLICY_FILTERS, POLICY_STATUS_LABELS, POLICY_TYPE_LABELS } from "@/lib/policy";
import type { PolicyDocument } from "@/lib/schema";

type Filters = { group: string; current: boolean };

const parse = (p: URLSearchParams): Filters => ({ group: p.get("type") ?? "", current: p.get("status") === "current" });
const serialize = (f: Filters) => {
  const p = new URLSearchParams();
  if (f.group) p.set("type", f.group);
  if (f.current) p.set("status", "current");
  return p.toString();
};

function formatLongDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** Chronological list of policy documents with type and status filters kept in the URL. */
export function PolicyTracker({ docs }: { docs: PolicyDocument[] }) {
  const { state, update } = useQueryState(parse, serialize);
  const group = POLICY_FILTERS.find((g) => g.id === state.group);
  const shown = docs.filter((d) => (!group || group.types.includes(d.document_type)) && (!state.current || !isInactive(d.status)));
  const titles = new Map(docs.map((d) => [d.slug, d.short_title ?? d.title]));
  const years = [...new Set(shown.map((d) => d.date.slice(0, 4)))];

  const chip = (active: boolean) =>
    `badge px-3 py-1.5 text-[0.875rem] ${active ? "border-cyan bg-cyan/10 text-white" : "hover:border-cyan hover:text-white"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by document type">
        <button type="button" className={chip(!group)} aria-pressed={!group} onClick={() => update({ ...state, group: "" })}>
          All types
        </button>
        {POLICY_FILTERS.map((g) => (
          <button key={g.id} type="button" className={chip(group?.id === g.id)} aria-pressed={group?.id === g.id} onClick={() => update({ ...state, group: g.id })}>
            {g.label}
          </button>
        ))}
      </div>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-[var(--cyan)]" checked={state.current} onChange={(e) => update({ ...state, current: e.target.checked })} />
        Hide revoked, rescinded, and superseded documents
      </label>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        Showing {shown.length} of {docs.length} documents
      </p>

      {years.map((year) => (
        <section key={year} aria-labelledby={`year-${year}`} className="mt-10">
          <h2 id={`year-${year}`} className="sticky top-[5.5rem] z-10 -mx-1 bg-bg/90 px-1 py-2 font-mono text-lg text-ice backdrop-blur sm:top-[6rem]">
            {year}
          </h2>
          <ol className="mt-3 space-y-4 border-l border-line pl-5">
            {shown
              .filter((d) => d.date.startsWith(year))
              .map((d) => {
                const inactive = isInactive(d.status);
                return (
                  <li key={d.slug} id={d.slug} className="relative scroll-mt-32">
                    <span aria-hidden="true" className={`absolute -left-[1.6rem] top-6 h-2.5 w-2.5 rounded-full ${inactive ? "bg-muted/60" : "bg-cyan"}`} />
                    <article className={`card p-5 ${inactive ? "opacity-85" : ""}`}>
                      <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.06em] text-muted">
                        <span className="text-ice">{POLICY_TYPE_LABELS[d.document_type]}</span>
                        {d.identifier ? <span className="badge max-w-full whitespace-normal font-mono normal-case tracking-normal">{d.identifier}</span> : null}
                        <span className={`badge normal-case tracking-normal ${inactive ? "border-arc/40 text-[#ffb3c0]" : d.status === "in-effect" || d.status === "final" ? "border-cyan/40 text-cyan" : ""}`}>
                          {POLICY_STATUS_LABELS[d.status]}
                        </span>
                      </p>
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-text">
                        <ExternalLink href={d.official_url}>{d.title}</ExternalLink>
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {DATE_LABEL_VERBS[d.date_label] ?? "Dated"} {formatLongDate(d.date)} · {d.issuer}
                      </p>
                      <p className="mt-3 text-[0.9875rem] leading-relaxed text-[#d5def2]">{d.summary.text}</p>
                      {d.status_note ? <p className="mt-2 text-sm text-muted">{d.status_note.text}</p> : null}
                      {d.superseded_by && titles.has(d.superseded_by) ? (
                        <p className="mt-2 text-sm">
                          <a href={`#${d.superseded_by}`} className="link">
                            See {titles.get(d.superseded_by)}
                          </a>
                        </p>
                      ) : null}
                      <details className="mt-3 text-sm text-muted">
                        <summary className="cursor-pointer">Sources ({d.sources.length}) · reviewed {formatLongDate(d.last_reviewed)}</summary>
                        <ul className="mt-2 space-y-1">
                          {d.sources.map((s) => (
                            <li key={s.id}>
                              <ExternalLink href={s.url}>{s.title}</ExternalLink> <span className="meta">· {s.publisher}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </article>
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
      {shown.length === 0 ? <p className="mt-8 text-muted">No documents match these filters.</p> : null}
    </div>
  );
}
