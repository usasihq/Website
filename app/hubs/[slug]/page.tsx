import Link from "next/link";
import { notFound } from "next/navigation";
import { Monogram } from "@/components/Badges";
import { ExternalLink } from "@/components/ExternalLink";
import { InitialsTile } from "@/components/LocalCorner";
import { PageHeader } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { artifactHref, orgHref } from "@/lib/routes";

export function generateStaticParams() {
  return getCatalog().hubs.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const hub = getCatalog().hub((await params).slug);
  return pageMetadata({ title: hub?.title ?? "Hub", description: hub?.summary ?? "", path: `/hubs/${(await params).slug}/` });
}

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const catalog = getCatalog();
  const hub = catalog.hub((await params).slug);
  if (!hub) notFound();
  const orgs = hub.organizations.map((s) => catalog.organization(s)).filter((o) => o !== undefined);
  const arts = hub.artifacts.map((s) => catalog.artifact(s)).filter((a) => a !== undefined);
  const people = hub.people.map((s) => catalog.people.find((p) => p.slug === s)).filter((p) => p !== undefined);
  return (
    <>
      <PageHeader
        eyebrow="Hub"
        title={hub.title}
        crumbs={[{ href: "/hubs/", label: "Hubs" }, { href: `/hubs/${hub.slug}/`, label: hub.title }]}
        description={<p>{hub.summary}</p>}
      />
      <div className="container-page grid gap-12 py-10">
        <section aria-label="Introduction" className="prose-usasi serif max-w-3xl">
          {hub.intro.map((c, i) => (
            <p key={i}>
              {c.text}
              <SourceRefs ids={c.source_ids} sources={hub.sources} />
            </p>
          ))}
        </section>

        <section aria-labelledby="scope-heading" className="max-w-3xl rounded-xl border border-line p-5 text-[0.9375rem] text-muted">
          <h2 id="scope-heading" className="font-semibold text-text">What this hub covers</h2>
          <p className="mt-2">{hub.scope}</p>
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="path-heading">
            <h2 id="path-heading" className="text-xl font-semibold text-text">Reading path</h2>
            <ol className="mt-4 space-y-3">
              {hub.reading_path.map((l, i) => (
                <li key={l.href + i} className="grid grid-cols-[1.75rem_1fr] gap-2">
                  <span className="meta pt-0.5 text-right">{i + 1}.</span>
                  <span>
                    <Link prefetch={false} href={l.href} className="link font-medium">{l.label}</Link>
                    {l.note ? <span className="block text-sm text-muted">{l.note}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="directory-heading">
            <h2 id="directory-heading" className="text-xl font-semibold text-text">In the catalog</h2>
            <ul className="mt-4 space-y-3">
              {hub.directory_links.map((l, i) => (
                <li key={l.href + i}>
                  <Link prefetch={false} href={l.href} className="link font-medium">{l.label}</Link>
                  {l.note ? <span className="block text-sm text-muted">{l.note}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {orgs.length || arts.length || people.length ? (
          <section aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="text-xl font-semibold text-text">Featured records</h2>
            <p className="mt-1 text-sm text-muted">Examples chosen to cover the subject; not a ranking or a complete list.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orgs.map((o) => (
                <li key={`o-${o.slug}`}>
                  <Link prefetch={false} href={orgHref(o.slug)} className="card flex h-full items-start gap-3 p-4 hover:border-cyan">
                    <Monogram text={o.logo_text} size="sm" />
                    <span className="min-w-0"><span className="block font-medium text-text">{o.name}</span><span className="block text-sm text-muted">Organization</span></span>
                  </Link>
                </li>
              ))}
              {arts.map((a) => (
                <li key={`a-${a.slug}`}>
                  <Link prefetch={false} href={artifactHref(a.slug)} className="card flex h-full flex-col p-4 hover:border-cyan">
                    <span className="font-medium text-text">{a.name}</span>
                    <span className="text-sm text-muted">Open model or tool</span>
                  </Link>
                </li>
              ))}
              {people.map((p) => (
                <li key={`p-${p.slug}`}>
                  <Link prefetch={false} href={`/local/#${p.slug}`} className="card flex h-full items-start gap-3 p-4 hover:border-cyan">
                    <InitialsTile initials={p.initials} />
                    <span className="min-w-0"><span className="block font-medium text-text">{p.name}</span><span className="block text-sm text-muted">People Behind Local AI</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="documents-heading" className="max-w-3xl">
          <h2 id="documents-heading" className="text-xl font-semibold text-text">Primary documents</h2>
          <ul className="mt-4 space-y-4">
            {hub.primary_documents.map((d) => {
              const src = hub.sources.find((s) => s.id === d.source_id)!;
              return (
                <li key={d.source_id}>
                  <ExternalLink href={src.url}>{src.title}</ExternalLink>
                  <span className="block text-sm text-muted">{src.publisher}</span>
                  <span className="mt-1 block text-[0.9375rem] text-text">{d.note}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="sources-heading" className="border-t border-line pt-6">
          <h2 id="sources-heading" className="eyebrow">Sources · reviewed {formatDate(hub.last_reviewed)}</h2>
          <div className="mt-3"><SourcesList sources={hub.sources} /></div>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
