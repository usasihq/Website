import Link from "next/link";
import { CircleAlert, CircleCheck, Monitor } from "lucide-react";
import { ExternalLink } from "@/components/ExternalLink";
import type { Catalog } from "@/lib/catalog";
import { ACCELERATOR_LABELS, figureText, finderHref, MEMORY_PAGES, memoryPageHref, memoryShortLabel, PLATFORM_LABELS, type MemoryEntry, type MemoryPage } from "@/lib/hardware";
import { guideFor } from "@/lib/licenses";
import { artifactHref, orgHref } from "@/lib/routes";
import type { FinderConfig } from "@/lib/schema";

const SKILL_LABEL = { beginner: "Installer app", intermediate: "Command line or extension", advanced: "Developer setup" } as const;
const ROLE_LABEL: Record<string, string> = { runtime: "Runtime", app: "App", library: "Library", extension: "Extension", service: "Service" };

/** A component name linked to its catalog record when there is one, else to its documentation. */
export function ComponentLink({ catalog, comp }: { catalog: Catalog; comp: FinderConfig["components"][number] }) {
  const href = comp.record_slug
    ? catalog.isActiveArtifact(comp.record_slug)
      ? artifactHref(comp.record_slug)
      : catalog.isActiveOrganization(comp.record_slug)
        ? orgHref(comp.record_slug)
        : null
    : null;
  return href ? (
    <Link prefetch={false} href={href} className="link">
      {comp.name}
    </Link>
  ) : (
    <ExternalLink href={comp.url}>{comp.name}</ExternalLink>
  );
}

/** Links to every memory page, with the current one marked. */
export function AmountPicker({ current, counts }: { current?: MemoryPage; counts: Record<string, number> }) {
  const groups: { label: string; kind: MemoryPage["kind"] }[] = [
    { label: "Graphics card memory (VRAM)", kind: "vram" },
    { label: "Apple silicon unified memory", kind: "apple-silicon" },
  ];
  return (
    <nav aria-label="Choose another amount of memory" className="grid gap-4 sm:grid-cols-2">
      {groups.map((g) => (
        <div key={g.kind}>
          <h3 className="text-sm font-semibold text-text">{g.label}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {MEMORY_PAGES.filter((p) => p.kind === g.kind).map((p) => {
              const active = current?.slug === p.slug;
              return (
                <li key={p.slug}>
                  <Link
                    prefetch={false}
                    href={memoryPageHref(p)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${active ? "border-cyan bg-cyan/10 text-white" : "border-line-strong text-text hover:border-cyan"}`}
                  >
                    {p.gb} GB<span className="sr-only">{p.kind === "vram" ? " of VRAM" : " of Apple silicon unified memory"}</span>
                    <span className="text-xs text-muted">
                      ({counts[p.slug] ?? 0}
                      <span className="sr-only"> configurations</span>)
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const GRAPHICS_CARDS = ["nvidia", "amd", "intel"] as const;

/**
 * The finder's own "check before you start" notes for this input, plus, on a
 * graphics-card page, a plain warning when the configuration's documentation
 * names no graphics-card vendor (the memory figure may still be a GPU figure).
 */
function cardCaveats(entry: MemoryEntry, page: MemoryPage): string[] {
  const acc = entry.config.accelerators.values;
  const extra =
    page.kind === "vram" && acc.length > 0 && !acc.some((a) => (GRAPHICS_CARDS as readonly string[]).includes(a))
      ? ["The documentation for this configuration does not list NVIDIA, AMD, or Intel graphics cards, so running it on a graphics card is not established here."]
      : [];
  return [...extra, ...entry.checks];
}

/** One configuration that fits: what it is, the publisher's figure and its source, and where to go next. */
export function MemoryEntryCard({ entry, page, catalog }: { entry: MemoryEntry; page: MemoryPage; catalog: Catalog }) {
  const c = entry.config;
  const m = c.memory!;
  const model = c.components.find((x) => x.role === "model");
  const others = c.components.filter((x) => x.role !== "model");
  const modelRecord = model?.record_slug && catalog.isActiveArtifact(model.record_slug) ? catalog.artifact(model.record_slug) : undefined;
  const statementSources = m.statement.source_ids.map((id) => c.sources.find((s) => s.id === id)).filter((s) => s !== undefined);
  const recordHref = modelRecord ? artifactHref(modelRecord.slug) : null;
  return (
    <article id={c.slug} aria-labelledby={`${c.slug}-title`} className="card scroll-mt-28 p-5 sm:p-6" data-memory-entry={c.slug}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="badge gap-1.5 border-cyan/40 text-text">
          <CircleCheck aria-hidden="true" className="h-3.5 w-3.5 text-cyan" />
          {c.tested ? `Tested by USASI ${c.tested.date}` : "Estimated to fit, not tested"}
        </span>
        <span className="badge gap-1.5">
          <Monitor aria-hidden="true" className="h-3.5 w-3.5 text-cyan" />
          On your computer
        </span>
        <span className="badge">{SKILL_LABEL[c.skill]}</span>
      </div>
      <h3 id={`${c.slug}-title`} className="mt-3 text-lg font-semibold text-text">
        {c.title}
      </h3>
      <p className="mt-2 text-[0.9375rem] text-[#d5def2]">{c.summary.text}</p>

      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_minmax(0,1fr)]">
        {model ? (
          <>
            <dt className="font-semibold text-ice">Model</dt>
            <dd className="min-w-0 text-text">
              <ComponentLink catalog={catalog} comp={model} />
            </dd>
          </>
        ) : null}
        <dt className="font-semibold text-ice">Variant</dt>
        <dd className="min-w-0 text-text">{m.variant}</dd>
        <dt className="font-semibold text-ice">Documented memory</dt>
        <dd className="min-w-0 text-text">
          <span className="font-semibold">{figureText(entry).replace(/^about/, "About")}</span>
          <span className="block pt-1 text-muted">Publisher&apos;s statement: {m.statement.text}</span>
          <span className="block pt-1 text-muted">
            Source{statementSources.length === 1 ? "" : "s"}:{" "}
            {statementSources.map((s, i) => (
              <span key={s.id}>
                {i > 0 ? "; " : ""}
                <ExternalLink href={s.url}>{s.title}</ExternalLink>
                <span className="meta"> · {s.publisher}</span>
              </span>
            ))}
          </span>
        </dd>
        {others.length ? (
          <>
            <dt className="font-semibold text-ice">Runtime and tools</dt>
            <dd className="min-w-0 text-text">
              {others.map((comp, i) => (
                <span key={comp.name}>
                  {i > 0 ? "; " : ""}
                  <span className="text-muted">{ROLE_LABEL[comp.role] ?? comp.role}: </span>
                  <ComponentLink catalog={catalog} comp={comp} />
                </span>
              ))}
            </dd>
          </>
        ) : null}
        <dt className="font-semibold text-ice">License</dt>
        <dd className="min-w-0 text-text">
          {modelRecord && modelRecord.licenses.length ? (
            modelRecord.licenses.map((l, i) => {
              const guide = guideFor(catalog, l);
              const label = `${l.spdx ?? l.name} (${l.applies_to.replace(/-/g, " ")})`;
              return (
                <span key={`${l.name}-${l.applies_to}`}>
                  {i > 0 ? "; " : ""}
                  {guide ? (
                    <Link prefetch={false} href={`/licenses/${guide.slug}/`} className="link">
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                </span>
              );
            })
          ) : (
            <span className="text-muted">Not recorded in this catalog; check the publisher&apos;s terms.</span>
          )}
          {modelRecord ? <span className="block pt-1 text-xs text-muted">As recorded, with sources, on the model&apos;s catalog record.</span> : null}
        </dd>
        <dt className="font-semibold text-ice">Documented for</dt>
        <dd className="min-w-0 text-text">
          {c.platforms.values.map((v) => PLATFORM_LABELS[v] ?? v).join(", ")}
          {c.accelerators.values.length ? (
            <span className="block pt-1 text-muted">Graphics hardware: {c.accelerators.values.map((v) => ACCELERATOR_LABELS[v] ?? v).join(", ")}</span>
          ) : null}
        </dd>
      </dl>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-ice">Check before you start</h4>
      <ul className="mt-2 space-y-1.5 text-sm text-muted">
        {cardCaveats(entry, page).map((r) => (
          <li key={r} className="flex gap-2">
            <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-ice" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <h4 className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-ice">Not verified</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
        {c.unverified.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>

      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
        {recordHref ? (
          <Link prefetch={false} href={recordHref} className="link">
            Catalog record: {modelRecord!.name}
          </Link>
        ) : null}
        <Link prefetch={false} href={finderHref(page, c.tasks[0])} className="link">
          Open in the finder with {memoryShortLabel(page)}
        </Link>
      </p>
    </article>
  );
}
