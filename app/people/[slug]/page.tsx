import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { Award, Briefcase, CalendarDays, Code2, Newspaper } from "lucide-react";
import { ExternalLink } from "@/components/ExternalLink";
import { InitialsTile } from "@/components/LocalCorner";
import { JsonLd } from "@/components/JsonLd";
import { PersonClaimBox } from "@/components/PersonClaimBox";
import { Breadcrumbs } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { PERSON_GROUP_LABELS, PERSON_SPECIALTY_LABELS, WORK_TYPE_LABELS } from "@/lib/people";
import { companyJobsLink } from "@/lib/jobs/landing-links";
import { peopleAtOrganization } from "@/lib/people-index";
import { fieldPeopleLists, peopleAtHref, peopleFieldHref } from "@/lib/people-lists";
import { personSchoolPages } from "@/lib/people-schools";
import { personEnrichment, wikidataUrl } from "@/lib/people-wikidata";
import { artifactHref, orgHref, personHref } from "@/lib/routes";
import { personNews, personPageSeo } from "@/lib/people-seo";
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
  const seo = personPageSeo(catalog, p);
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
  const jobLinks: { path: string; count: number; orgName: string }[] = [];
  const seenJobs = new Set<string>();
  for (const a of p.affiliations) {
    if (!a.organization_slug) continue;
    const jobs = companyJobsLink(catalog, a.organization_slug);
    if (!jobs || seenJobs.has(jobs.path)) continue;
    seenJobs.add(jobs.path);
    jobLinks.push({ path: jobs.path, count: jobs.count, orgName: a.name });
  }
  const news = personNews(catalog, found, 5);
  const fieldPages = new Set(fieldPeopleLists(catalog).map((l) => l.slug));
  const known = p.work.slice(0, 3);
  const extra = personEnrichment(p.slug);
  const schoolLinks = personSchoolPages(catalog, found);
  // Wiki-style contents: only sections that render on this profile.
  const contents = [
    ...p.sections.map((sec, i) => ({ id: `sec-${i}`, label: sec.heading })),
    { id: "work-h", label: "Work" },
    ...(p.timeline.length ? [{ id: "timeline-h", label: "Career timeline" }] : []),
    ...(earlier.length ? [{ id: "earlier-h", label: "Other documented roles" }] : []),
    ...(p.honors.length ? [{ id: "honors-h", label: "Honors and recognition" }] : []),
    ...(news.length ? [{ id: "news-h", label: "In the news" }] : []),
    { id: "sources-h", label: "References" },
  ];

  return (
    <>
      <JsonLd data={personLd(catalog, p)} />
      <article>
        <header className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgb(var(--cyan-rgb)/0.12),transparent_60%)]">
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
                  <li key={`${a.name}-${a.role}`} className="max-w-full rounded-2xl border border-line bg-surface/60 px-3 py-1.5 text-sm text-text">
                    {a.role}, {orgLink(a.organization_slug, a.name)}
                    <SourceRefs ids={a.source_ids} sources={s} />
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-body" data-testid="person-bio">
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
                  <Link prefetch={false} href={fieldPages.has(sp) ? peopleFieldHref(sp) : `/people/?specialty=${sp}`} className="badge min-h-9 border-tone-violet/40 hover:border-cyan">
                    {PERSON_SPECIALTY_LABELS[sp]}
                  </Link>
                </li>
              ))}
              {schoolLinks.map((s) => (
                <li key={s.href}>
                  <Link prefetch={false} href={s.href} className="badge min-h-9 hover:border-cyan">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid min-w-0 content-start gap-12">
            {contents.length >= 4 ? (
              <nav aria-labelledby="contents-h" className="max-w-md rounded-2xl border border-line bg-surface/60 p-5" data-testid="person-contents">
                <h2 id="contents-h" className="eyebrow">
                  Contents
                </h2>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[0.9375rem]">
                  {contents.map((c) => (
                    <li key={c.id}>
                      <a href={`#${c.id}`} className="link">
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            {p.sections.map((sec, si) => (
              <section key={sec.heading} aria-labelledby={`sec-${si}`} className="max-w-3xl" data-testid="person-section">
                <h2 id={`sec-${si}`} className="scroll-mt-24 text-2xl font-semibold text-text">
                  {sec.heading}
                </h2>
                <div className="mt-3 space-y-4 text-[1.0625rem] leading-relaxed text-body">
                  {sec.paragraphs.map((para, pi) => (
                    <p key={pi}>
                      {para.text}
                      <SourceRefs ids={para.source_ids} sources={s} />
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section aria-labelledby="work-h">
              <h2 id="work-h" className="flex scroll-mt-24 items-center gap-2 text-2xl font-semibold text-text">
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
                    <p className="mt-2 text-body">
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

            {p.timeline.length ? (
              <section aria-labelledby="timeline-h">
                <h2 id="timeline-h" className="flex scroll-mt-24 items-center gap-2 text-2xl font-semibold text-text">
                  <CalendarDays aria-hidden="true" className="h-6 w-6 text-cyan" />
                  Career timeline
                </h2>
                <ol className="mt-5 max-w-3xl border-l border-line-strong pl-6" data-testid="person-timeline">
                  {[...p.timeline]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((t, ti) => (
                      <li key={ti} className="relative pb-5 last:pb-0">
                        <span aria-hidden="true" className="absolute -left-[1.86rem] top-1.5 h-3 w-3 rounded-full border-2 border-cyan bg-bg" />
                        <p className="font-mono text-sm text-cyan">{formatDate(t.date)}</p>
                        <p className="mt-0.5 text-body">
                          {t.text}
                          <SourceRefs ids={t.source_ids} sources={s} />
                        </p>
                      </li>
                    ))}
                </ol>
              </section>
            ) : null}

            {earlier.length ? (
              <section aria-labelledby="earlier-h">
                <h2 id="earlier-h" className="flex scroll-mt-24 items-center gap-2 text-2xl font-semibold text-text">
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

            {p.honors.length ? (
              <section aria-labelledby="honors-h">
                <h2 id="honors-h" className="flex scroll-mt-24 items-center gap-2 text-2xl font-semibold text-text">
                  <Award aria-hidden="true" className="h-6 w-6 text-tone-amber" />
                  Honors and recognition
                </h2>
                <ul className="mt-4 max-w-3xl space-y-2.5 text-[1.0625rem]" data-testid="person-honors">
                  {p.honors.map((h) => (
                    <li key={`${h.name}-${h.year}`}>
                      <span className="text-text">{h.name}</span>
                      <span className="text-muted">
                        {" "}
                        · {h.awarded_by}
                        {h.year ? `, ${h.year}` : ""}
                      </span>
                      <SourceRefs ids={h.source_ids} sources={s} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {news.length ? (
              <section aria-labelledby="news-h">
                <h2 id="news-h" className="flex scroll-mt-24 items-center gap-2 text-2xl font-semibold text-text">
                  <Newspaper aria-hidden="true" className="h-6 w-6 text-cyan" />
                  In the news
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-muted">USASI news stories that name {p.name}.</p>
                <ul className="mt-4 max-w-3xl space-y-3" data-testid="person-news">
                  {news.map((n) => (
                    <li key={n.slug}>
                      <Link prefetch={false} href={`/news/${n.slug}/`} className="link">
                        {n.title}
                      </Link>
                      <span className="block text-sm text-muted">{formatDate(n.event_date)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="grid content-start gap-6" aria-label={`${p.name} at a glance`}>
            <div className="card p-5" data-testid="person-infobox">
              <h2 className="font-semibold text-text">{p.name}</h2>
              {extra?.image ? (
                <figure className="mt-3" data-testid="person-photo">
                  <img
                    src={extra.image.thumb_url}
                    alt=""
                    width={400}
                    height={400}
                    className="w-full rounded-xl border border-line object-cover"
                  />
                  <figcaption className="mt-2 text-xs leading-relaxed text-muted">
                    Photo: {extra.image.author}.{" "}
                    <ExternalLink href={extra.image.commons_url}>{extra.image.license}</ExternalLink>
                    {extra.image.license_url ? (
                      <>
                        {" "}
                        · <ExternalLink href={extra.image.license_url}>license</ExternalLink>
                      </>
                    ) : null}
                    . Wikimedia Commons.
                  </figcaption>
                </figure>
              ) : null}
              <dl className="mt-3 grid gap-3 text-[0.9375rem]">
                {current.length ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted">{current.length > 1 ? "Current roles" : "Current role"}</dt>
                    {current.map((a) => (
                      <dd key={`${a.name}-${a.role}`} className="text-text">
                        {a.role}, {orgLink(a.organization_slug, a.name)}
                      </dd>
                    ))}
                  </div>
                ) : null}
                {known.length ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted">Known for</dt>
                    <dd className="text-text">
                      {known.map((w, i) => (
                        <span key={w.name}>
                          {i ? ", " : ""}
                          {w.artifact_slug ? (
                            <Link prefetch={false} href={artifactHref(w.artifact_slug)} className="link">
                              {w.name}
                            </Link>
                          ) : (
                            w.name
                          )}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {schoolLinks.length ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted">{schoolLinks.some((s) => s.kind === "education") ? "Education" : "School"}</dt>
                    <dd className="text-text">
                      {schoolLinks.map((s, i) => (
                        <span key={s.href}>
                          {i ? ", " : ""}
                          <Link prefetch={false} href={s.href} className="link">
                            {s.label}
                          </Link>
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {p.specialties.length ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted">Fields</dt>
                    <dd className="text-text">
                      {p.specialties.map((sp, i) => (
                        <span key={sp}>
                          {i ? ", " : ""}
                          {fieldPages.has(sp) ? (
                            <Link prefetch={false} href={peopleFieldHref(sp)} className="link">
                              {PERSON_SPECIALTY_LABELS[sp]}
                            </Link>
                          ) : (
                            PERSON_SPECIALTY_LABELS[sp]
                          )}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {extra?.qid || extra?.wikipedia ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted">Identifiers</dt>
                    <dd className="flex flex-wrap gap-x-3 text-text" data-testid="person-wikidata">
                      {extra.qid ? <ExternalLink href={wikidataUrl(extra.qid)}>Wikidata</ExternalLink> : null}
                      {extra.wikipedia ? <ExternalLink href={extra.wikipedia}>Wikipedia</ExternalLink> : null}
                    </dd>
                  </div>
                ) : null}
                {p.honors.length ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted">Honors</dt>
                    <dd className="text-text">{p.honors.length}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Profile reviewed</dt>
                  <dd className="text-text">{formatDate(p.last_reviewed ?? p.updated_at)}</dd>
                </div>
              </dl>
            </div>
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
            {jobLinks.length ? (
              <div className="card p-5" data-testid="person-jobs">
                <h2 className="font-semibold text-text">Open jobs</h2>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  {jobLinks.map((j) => (
                    <li key={j.path}>
                      <Link prefetch={false} href={j.path} className="link">
                        Open jobs at {j.orgName} ({j.count.toLocaleString("en-US")})
                      </Link>
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
                    <Link prefetch={false} href={peopleAtHref(home.organization_slug!)} className="link">
                      All {colleagues.length + 1} people tied to {home.name}
                    </Link>
                  </p>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>

        <div className="container-page grid gap-6 pb-14">
          <PersonClaimBox name={p.name} pagePath={personHref(p.slug)} />
          <p className="max-w-3xl text-sm text-muted">
            This profile covers public professional work only, from the sources below. It is not an endorsement or a ranking. To correct or remove
            it,{" "}
            <Link prefetch={false} href="/contribute/#corrections" className="link">
              use the correction form
            </Link>
            .
          </p>
          <section aria-labelledby="sources-h" className="border-t border-line pt-6">
            <h2 id="sources-h" className="eyebrow scroll-mt-24">
              References · reviewed {formatDate(p.last_reviewed ?? p.updated_at)}
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
