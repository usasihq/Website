import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { Briefcase, Code2 } from "lucide-react";
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
import { PERSON_GROUP_LABELS, PERSON_SPECIALTY_LABELS, WORK_TYPE_LABELS } from "@/lib/people";
import { peopleAtOrganization } from "@/lib/people-index";
import { artifactHref, orgHref, personHref } from "@/lib/routes";
import { personSeo } from "@/lib/seo";
import { personLd } from "@/lib/structured-data";

export const dynamicParams = false;

/** How many colleagues the "More people at …" box lists before linking to the filtered directory. */
const COLLEAGUES = 6;

export function generateStaticParams() {
  return getCatalog().people.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const catalog = getCatalog();
  const p = catalog.person((await params).slug);
  if (!p) return {};
  const path = personHref(p.slug);
  const seo = personSeo(catalog, p);
  return pageMetadata({ title: seo.title, description: seo.description, path, image: cardImage(catalog, path) });
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const catalog = getCatalog();
  const found = catalog.person((await params).slug);
  if (!found) notFound();
  const p = catalog.publicPerson(found);
  const s = p.sources;
  const current = p.affiliations.filter((a) => a.current);
  const earlier = p.affiliations.filter((a) => !a.current);
  const orgLink = (slug: string | null, name: string) =>
    slug ? (
      <Link prefetch={false} href={orgHref(slug)} className="link">
        {name}
      </Link>
    ) : (
      <span className="text-text">{name}</span>
    );
  const home = current.find((a) => a.organization_slug) ?? earlier.find((a) => a.organization_slug);
  const colleagues = home?.organization_slug ? peopleAtOrganization(catalog, home.organization_slug).filter((x) => x.href !== personHref(p.slug)) : [];
  const catalogLinks = [
    ...p.affiliations.filter((a) => a.organization_slug).map((a) => ({ href: orgHref(a.organization_slug!), label: a.name, kind: "Organization" })),
    ...p.work.filter((w) => w.artifact_slug).map((w) => ({ href: artifactHref(w.artifact_slug!), label: catalog.artifact(w.artifact_slug!)?.name ?? w.name, kind: "Open model or tool" })),
  ].filter((l, i, all) => all.findIndex((x) => x.href === l.href) === i);

  return (
    <>
      <JsonLd data={personLd(catalog, p)} />
      <article>
        <header className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgba(76,201,255,0.12),transparent_60%)]">
          <div className="container-page pb-10 pt-10 sm:pt-12">
            <Breadcrumbs items={[{ href: "/people/", label: "People" }]} current={{ href: personHref(p.slug), label: p.name }} />
            <div className="flex flex-wrap items-center gap-5">
              <InitialsTile initials={p.initials} size="lg" />
              <div className="min-w-0">
                <h1 className="text-4xl font-semibold leading-tight text-text sm:text-5xl">{p.name}</h1>
                <p className="mt-2 max-w-3xl text-lg text-ice">{p.headline}</p>
              </div>
            </div>
            {current.length ? (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Current roles">
                {current.map((a) => (
                  <li key={`${a.name}-${a.role}`} className="max-w-full rounded-2xl border border-line bg-[rgba(11,22,44,0.6)] px-3 py-1.5 text-sm text-text">
                    {a.role}, {orgLink(a.organization_slug, a.name)}
                    <SourceRefs ids={a.source_ids} sources={s} />
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-[#d5def2]" data-testid="person-bio">
              {p.bio.text}
              <SourceRefs ids={p.bio.source_ids} sources={s} />
            </p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Listed under">
              {p.groups.map((g) => (
                <li key={g}>
                  <Link prefetch={false} href={g === "local" ? "/local/" : g === "creators" ? "/voices/" : `/people/?group=${g}`} className="badge min-h-9 hover:border-cyan">
                    {PERSON_GROUP_LABELS[g]}
                  </Link>
                </li>
              ))}
              {p.specialties.map((sp) => (
                <li key={sp}>
                  <Link prefetch={false} href={`/people/?specialty=${sp}`} className="badge min-h-9 border-[rgba(167,139,250,0.4)] hover:border-cyan">
                    {PERSON_SPECIALTY_LABELS[sp]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid min-w-0 content-start gap-12">
            <section aria-labelledby="work-h">
              <h2 id="work-h" className="flex items-center gap-2 text-2xl font-semibold text-text">
                <Code2 aria-hidden="true" className="h-6 w-6 text-cyan" />
                Work
              </h2>
              <ul className="mt-5 grid gap-4" data-testid="person-work">
                {p.work.map((w) => (
                  <li key={w.name} className="card p-5">
                    <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-text">
                      {w.artifact_slug ? (
                        <Link prefetch={false} href={artifactHref(w.artifact_slug)} className="link">
                          {w.name}
                        </Link>
                      ) : w.url ? (
                        <ExternalLink href={w.url}>{w.name}</ExternalLink>
                      ) : (
                        w.name
                      )}
                      {w.type ? <span className="badge text-xs font-normal">{WORK_TYPE_LABELS[w.type]}</span> : null}
                    </h3>
                    <p className="mt-2 text-[#d5def2]">
                      {w.contribution}
                      <SourceRefs ids={w.source_ids} sources={s} />
                    </p>
                    {w.artifact_slug && w.url ? (
                      <p className="mt-2 text-sm">
                        <ExternalLink href={w.url}>Project page</ExternalLink>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>

            {earlier.length ? (
              <section aria-labelledby="earlier-h">
                <h2 id="earlier-h" className="flex items-center gap-2 text-2xl font-semibold text-text">
                  <Briefcase aria-hidden="true" className="h-6 w-6 text-cyan" />
                  Other documented roles
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-muted">Roles the sources document but that are not confirmed as current.</p>
                <ul className="mt-4 max-w-3xl space-y-2 text-[1.0625rem]">
                  {earlier.map((a) => (
                    <li key={`${a.name}-${a.role}`}>
                      <span className="text-text">{a.role}</span>
                      <span className="text-muted">, </span>
                      {orgLink(a.organization_slug, a.name)}
                      <SourceRefs ids={a.source_ids} sources={s} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="grid content-start gap-6" aria-label={`${p.name} at a glance`}>
            {catalogLinks.length ? (
              <div className="card p-5">
                <h2 className="font-semibold text-text">In the catalog</h2>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  {catalogLinks.map((l) => (
                    <li key={l.href}>
                      <Link prefetch={false} href={l.href} className="link">
                        {l.label}
                      </Link>
                      <span className="block text-xs text-muted">{l.kind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {p.links.length ? (
              <div className="card p-5">
                <h2 className="font-semibold text-text">Their pages</h2>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  {p.links.map((x) => (
                    <li key={x.url}>
                      <ExternalLink href={x.url}>{x.label}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {colleagues.length && home ? (
              <div className="card p-5" data-testid="person-colleagues">
                <h2 className="font-semibold text-text">More people at {home.name}</h2>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  {colleagues.slice(0, COLLEAGUES).map((c) => (
                    <li key={c.href}>
                      <Link prefetch={false} href={c.href} className="link">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                {colleagues.length > COLLEAGUES ? (
                  <p className="mt-3 text-sm">
                    <Link prefetch={false} href={`/people/?org=${home.organization_slug}`} className="link">
                      All {colleagues.length + 1} people tied to {home.name}
                    </Link>
                  </p>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>

        <div className="container-page grid gap-6 pb-14">
          <p className="max-w-3xl text-sm text-muted">
            This profile covers public professional work only, from the sources below. It is not an endorsement or a ranking. To correct or remove
            it,{" "}
            <Link prefetch={false} href="/contribute/#corrections" className="link">
              use the correction form
            </Link>
            .
          </p>
          <section aria-labelledby="sources-h" className="border-t border-line pt-6">
            <h2 id="sources-h" className="eyebrow">
              Sources · reviewed {formatDate(p.last_reviewed ?? p.updated_at)}
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
