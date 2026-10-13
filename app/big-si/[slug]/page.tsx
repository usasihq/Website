import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Award, Briefcase, CalendarDays, Sparkles } from "lucide-react";
import { ExternalLink } from "@/components/ExternalLink";
import { InitialsTile } from "@/components/LocalCorner";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { leaderSeo } from "@/lib/seo";
import { leaderLd } from "@/lib/structured-data";
import { orgHref } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().leaders.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const catalog = getCatalog();
  const l = catalog.leader((await params).slug);
  if (!l) return {};
  const path = `/big-si/${l.slug}/`;
  const seo = leaderSeo(catalog, l);
  return pageMetadata({ title: seo.title, description: seo.description, path, image: cardImage(catalog, path) });
}

const span = (from: string | null, to: string | null) =>
  from && to ? ` (${formatDate(from)} to ${formatDate(to)})` : from ? ` (from ${formatDate(from)})` : to ? ` (until ${formatDate(to)})` : "";

export default async function LeaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const catalog = getCatalog();
  const l = catalog.leader((await params).slug);
  if (!l) notFound();
  const s = l.sources;
  const all = catalog.leaders;
  const i = all.findIndex((x) => x.slug === l.slug);
  const prev = i > 0 ? all[i - 1] : undefined;
  const next = i < all.length - 1 ? all[i + 1] : undefined;
  const orgLink = (slug: string | null, name: string) =>
    slug && catalog.isActiveOrganization(slug) ? (
      <Link prefetch={false} href={orgHref(slug)} className="link">
        {name}
      </Link>
    ) : (
      <span className="text-text">{name}</span>
    );

  return (
    <>
      <JsonLd data={leaderLd(catalog, l)} />
      <article>
        <header className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgba(76,201,255,0.14),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(167,139,250,0.1),transparent_55%)]">
          <div className="container-page pb-10 pt-10 sm:pt-12">
            <Breadcrumbs items={[{ href: "/big-si/", label: "People Behind Big SI" }]} current={{ href: `/big-si/${l.slug}/`, label: l.name }} />
            <div className="flex flex-wrap items-center gap-5">
              <InitialsTile initials={l.initials} size="lg" />
              <div className="min-w-0">
                <h1 className="text-4xl font-semibold leading-tight text-text sm:text-5xl">{l.name}</h1>
                <p className="mt-2 max-w-3xl text-lg text-ice">{l.headline}</p>
              </div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Current roles">
              {l.current_roles.map((r) => (
                <li key={`${r.organization}-${r.role}`} className="max-w-full rounded-2xl border border-line bg-[rgba(11,22,44,0.6)] px-3 py-1.5 text-sm text-text">
                  {r.role}, {orgLink(r.organization_slug, r.organization)}
                  {r.since ? <span className="text-muted"> since {formatDate(r.since)}</span> : null}
                  <SourceRefs ids={r.source_ids} sources={s} />
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-[#d5def2]">
              {l.summary.text}
              <SourceRefs ids={l.summary.source_ids} sources={s} />
            </p>
          </div>
        </header>

        <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid min-w-0 gap-12">
            {l.highlights.length ? (
              <section aria-labelledby="highlights-h">
                <h2 id="highlights-h" className="flex items-center gap-2 text-2xl font-semibold text-text">
                  <Sparkles aria-hidden="true" className="h-6 w-6 text-[#fcd34d]" />
                  Accomplishments
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2" data-testid="leader-highlights">
                  {l.highlights.map((h, hi) => (
                    <li key={hi} className="rounded-2xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)] p-4 text-[#d5def2]">
                      {h.text}
                      <SourceRefs ids={h.source_ids} sources={s} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {l.bio_sections.map((sec, si) => (
              <section key={sec.heading} aria-labelledby={`bio-${si}`} className="max-w-3xl">
                <h2 id={`bio-${si}`} className="text-2xl font-semibold text-text">
                  {sec.heading}
                </h2>
                <div className="mt-3 space-y-4 text-[1.0625rem] leading-relaxed text-[#d5def2]">
                  {sec.paragraphs.map((p, pi) => (
                    <p key={pi}>
                      {p.text}
                      <SourceRefs ids={p.source_ids} sources={s} />
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {l.timeline.length ? (
              <section aria-labelledby="timeline-h">
                <h2 id="timeline-h" className="flex items-center gap-2 text-2xl font-semibold text-text">
                  <CalendarDays aria-hidden="true" className="h-6 w-6 text-cyan" />
                  Career timeline
                </h2>
                <ol className="mt-5 max-w-3xl border-l border-line-strong pl-6">
                  {l.timeline.map((t, ti) => (
                    <li key={ti} className="relative pb-5 last:pb-0">
                      <span aria-hidden="true" className="absolute -left-[1.86rem] top-1.5 h-3 w-3 rounded-full border-2 border-cyan bg-bg" />
                      <p className="font-mono text-sm text-cyan">{formatDate(t.date)}</p>
                      <p className="mt-0.5 text-[#d5def2]">
                        {t.text}
                        <SourceRefs ids={t.source_ids} sources={s} />
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          <aside className="grid content-start gap-6" aria-label={`${l.name} at a glance`}>
            {l.past_roles.length ? (
              <div className="card p-5">
                <h2 className="flex items-center gap-2 font-semibold text-text">
                  <Briefcase aria-hidden="true" className="h-4 w-4 text-cyan" />
                  Earlier roles
                </h2>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  {l.past_roles.map((r) => (
                    <li key={`${r.organization}-${r.role}`}>
                      <span className="text-text">{r.role}</span>
                      <span className="text-muted">, </span>
                      {orgLink(r.organization_slug, r.organization)}
                      <span className="text-muted">{span(r.from, r.to)}</span>
                      <SourceRefs ids={r.source_ids} sources={s} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {l.honors.length ? (
              <div className="card p-5">
                <h2 className="flex items-center gap-2 font-semibold text-text">
                  <Award aria-hidden="true" className="h-4 w-4 text-[#fcd34d]" />
                  Honors and recognition
                </h2>
                <ul className="mt-3 space-y-2.5 text-[0.9375rem]" data-testid="leader-honors">
                  {l.honors.map((h) => (
                    <li key={`${h.name}-${h.year}`}>
                      <span className="text-text">{h.name}</span>
                      <span className="block text-sm text-muted">
                        {h.awarded_by}
                        {h.year ? `, ${h.year}` : ""}
                        <SourceRefs ids={h.source_ids} sources={s} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {l.links.length ? (
              <div className="card p-5">
                <h2 className="font-semibold text-text">Official pages</h2>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  {l.links.map((x) => (
                    <li key={x.url}>
                      <ExternalLink href={x.url}>{x.label}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="container-page grid gap-10 pb-14">
          <nav aria-label="More profiles" className="grid max-w-3xl gap-4 sm:grid-cols-2">
            {prev ? (
              <Link prefetch={false} href={`/big-si/${prev.slug}/`} className="card card-link flex flex-col rounded-2xl p-5">
                <span className="flex items-center gap-1.5 text-sm uppercase tracking-[0.08em] text-muted">
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Previous
                </span>
                <span className="mt-1.5 text-lg font-semibold text-text">{prev.name}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link prefetch={false} href={`/big-si/${next.slug}/`} className="card card-link flex flex-col rounded-2xl p-5 text-right">
                <span className="flex items-center justify-end gap-1.5 text-sm uppercase tracking-[0.08em] text-muted">
                  Next <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="mt-1.5 text-lg font-semibold text-text">{next.name}</span>
              </Link>
            ) : null}
          </nav>
          <section aria-labelledby="sources-h" className="border-t border-line pt-6">
            <h2 id="sources-h" className="eyebrow">
              Sources · reviewed {formatDate(l.last_reviewed)}
            </h2>
            <div className="mt-3 text-[0.9375rem]">
              <SourcesList sources={s} />
            </div>
          </section>
        </div>
      </article>
      <SupportPanel variant="compact" />
    </>
  );
}
