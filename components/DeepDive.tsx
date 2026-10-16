import Link from "@/components/Link";
import { ArrowUpRight, CalendarDays, Layers, ListTree, UserRound } from "lucide-react";
import { formatDate } from "@/lib/dates";
import type { DeepDive as DeepDiveT, Leader, Source } from "@/lib/schema";
import { ExternalLink } from "./ExternalLink";
import { Section } from "./PageHeader";
import { SourceRefs } from "./Sources";

const KIND_LABELS: Record<DeepDiveT["lineup"][number]["kind"], string> = {
  model: "Model",
  app: "App",
  api: "API",
  agent: "Agent",
  platform: "Platform",
  hardware: "Hardware",
  robot: "Robot",
  service: "Service",
  research: "Research",
};

const STATUS_LABELS: Record<DeepDiveT["lineup"][number]["status"], { label: string; className: string }> = {
  current: { label: "Current", className: "border-[rgba(52,211,153,0.5)] text-[#6ee7b7]" },
  preview: { label: "Preview", className: "border-[rgba(76,201,255,0.5)] text-cyan" },
  limited: { label: "Limited access", className: "border-[rgba(251,191,36,0.5)] text-[#fcd34d]" },
  announced: { label: "Announced", className: "border-[rgba(167,139,250,0.5)] text-[#c4b5fd]" },
  legacy: { label: "Legacy", className: "border-line-strong text-muted" },
  retired: { label: "Retired", className: "border-line text-muted" },
};

/** Newest first; undated entries last. */
const byReleaseDesc = (a: { released: string | null }, b: { released: string | null }) =>
  (b.released ?? "").localeCompare(a.released ?? "");

/**
 * The in-depth guide on an organization page: overview, themed sections, a
 * lineup of models and products, a dated timeline, and leadership. Every line
 * carries its sources.
 */
export function DeepDive({ name, deep, sources, leaders }: { name: string; deep: DeepDiveT; sources: Source[]; leaders: Leader[] }) {
  const leaderByName = new Map(leaders.map((l) => [l.name.toLowerCase(), l]));
  const lineup = [...deep.lineup].sort(byReleaseDesc);
  const nav = [
    ...deep.sections.map((s) => ({ href: `#dd-${s.id}`, label: s.title })),
    ...(lineup.length ? [{ href: "#dd-lineup", label: "Lineup" }] : []),
    ...(deep.timeline.length ? [{ href: "#dd-timeline", label: "Timeline" }] : []),
    ...(deep.leadership.length ? [{ href: "#dd-leadership", label: "Leadership" }] : []),
  ];
  return (
    <Section
      id="in-depth"
      title={`${name} in depth`}
      description={
        <>
          A sourced guide to what {name} does, its models and products over time, key dates, and who leads it. Every statement links to the official
          document it comes from. Reviewed {formatDate(deep.reviewed_at)}.
        </>
      }
    >
      <nav aria-label={`${name} in depth: contents`} className="mb-8">
        <ul className="flex flex-wrap gap-2">
          {nav.map((n) => (
            <li key={n.href}>
              <a href={n.href} className="badge whitespace-normal px-3 py-1 text-left text-sm hover:border-cyan">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="max-w-3xl space-y-4 text-[1.0625rem] leading-relaxed text-[#d5def2]" data-testid="deep-dive-overview">
        {deep.overview.map((c, i) => (
          <p key={i}>
            {c.text}
            <SourceRefs ids={c.source_ids} sources={sources} />
          </p>
        ))}
      </div>

      <div className="mt-10 grid gap-10">
        {deep.sections.map((sec) => (
          <section key={sec.id} id={`dd-${sec.id}`} aria-labelledby={`dd-${sec.id}-h`} className="scroll-mt-24">
            <h3 id={`dd-${sec.id}-h`} className="flex items-center gap-2 text-xl font-semibold text-text">
              <ListTree aria-hidden="true" className="h-5 w-5 text-cyan" />
              {sec.title}
            </h3>
            {sec.intro ? (
              <p className="mt-2 max-w-3xl text-muted">
                {sec.intro.text}
                <SourceRefs ids={sec.intro.source_ids} sources={sources} />
              </p>
            ) : null}
            <ul className="mt-4 grid max-w-3xl gap-3">
              {sec.items.map((item, i) => (
                <li key={i} className="flex gap-3 text-[#d5def2]">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-cyan" />
                  <span>
                    {item.text}
                    <SourceRefs ids={item.source_ids} sources={sources} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {lineup.length ? (
          <section id="dd-lineup" aria-labelledby="dd-lineup-h" className="scroll-mt-24">
            <h3 id="dd-lineup-h" className="flex items-center gap-2 text-xl font-semibold text-text">
              <Layers aria-hidden="true" className="h-5 w-5 text-cyan" />
              Models and products lineup
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              Newest first. Status is as the official source describes it; “Legacy” and “Retired” entries stay listed for history.
            </p>
            <div className="table-scroll mt-4">
              <table className="data-table" data-testid="deep-dive-lineup">
                <caption className="sr-only">{name}: models and products lineup</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Kind</th>
                    <th scope="col">Status</th>
                    <th scope="col">Released</th>
                    <th scope="col">What it is</th>
                  </tr>
                </thead>
                <tbody>
                  {lineup.map((l, i) => (
                    <tr key={`${l.name}-${i}`}>
                      <th scope="row" className="min-w-[9rem] font-medium">
                        {l.url ? <ExternalLink href={l.url}>{l.name}</ExternalLink> : l.name}
                      </th>
                      <td className="whitespace-nowrap text-muted">{KIND_LABELS[l.kind]}</td>
                      <td className="whitespace-nowrap">
                        <span className={`badge ${STATUS_LABELS[l.status].className}`}>{STATUS_LABELS[l.status].label}</span>
                      </td>
                      <td className="meta whitespace-nowrap">{l.released ? formatDate(l.released) : "Not stated"}</td>
                      <td className="min-w-[18rem] text-[#d5def2]">
                        {l.description}
                        <SourceRefs ids={l.source_ids} sources={sources} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {deep.timeline.length ? (
          <section id="dd-timeline" aria-labelledby="dd-timeline-h" className="scroll-mt-24">
            <h3 id="dd-timeline-h" className="flex items-center gap-2 text-xl font-semibold text-text">
              <CalendarDays aria-hidden="true" className="h-5 w-5 text-cyan" />
              Timeline
            </h3>
            <ol className="mt-5 max-w-3xl border-l border-line-strong pl-6" data-testid="deep-dive-timeline">
              {deep.timeline.map((t, i) => (
                <li key={i} className="relative pb-5 last:pb-0">
                  <span aria-hidden="true" className="absolute -left-[1.86rem] top-1.5 h-3 w-3 rounded-full border-2 border-cyan bg-bg" />
                  <p className="font-mono text-sm text-cyan">{formatDate(t.date)}</p>
                  <p className="mt-0.5 text-[#d5def2]">
                    {t.text}
                    <SourceRefs ids={t.source_ids} sources={sources} />
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {deep.leadership.length ? (
          <section id="dd-leadership" aria-labelledby="dd-leadership-h" className="scroll-mt-24">
            <h3 id="dd-leadership-h" className="flex items-center gap-2 text-xl font-semibold text-text">
              <UserRound aria-hidden="true" className="h-5 w-5 text-cyan" />
              Leadership
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-muted">Titles as the official source lists them.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {deep.leadership.map((p) => {
                const profile = leaderByName.get(p.name.toLowerCase());
                return (
                  <li key={p.name} className="card p-4">
                    <p className="font-semibold text-text">
                      {profile ? (
                        <Link prefetch={false} href={`/big-si/${profile.slug}/`} className="link inline-flex items-center gap-1">
                          {p.name} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        p.name
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {p.role}
                      <SourceRefs ids={p.source_ids} sources={sources} />
                    </p>
                    {profile ? <p className="mt-2 text-xs text-ice">Full profile in People Behind Big SI</p> : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </Section>
  );
}
