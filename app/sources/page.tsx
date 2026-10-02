import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
import { SourceLibrary } from "@/components/SourceLibrary";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";
import { sourceLibrary } from "@/lib/source-library";

export const metadata = pageMetadata({
  title: "Source library",
  description: "Every primary source cited in the USASI catalog, searchable, with the records that cite it, plus annotated key documents.",
  path: "/sources/",
});

export default function SourcesPage() {
  const catalog = getCatalog();
  const total = sourceLibrary(catalog).length;
  const seen = new Set<string>();
  const key = catalog.hubs.flatMap((h) =>
    h.primary_documents.map((d) => ({ hub: h, doc: d, src: h.sources.find((s) => s.id === d.source_id)! })),
  ).filter(({ src }) => (seen.has(src.url) ? false : (seen.add(src.url), true)));
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Source library"
        description={
          <p>
            Every source cited on this site, in one place: official pages, license files, model cards, repositories, papers, and filings. Each entry
            links to the original and lists the records that cite it. Links go to the original publisher; documents are not copied here.
          </p>
        }
      />
      <div className="container-page grid gap-12 py-10">
        {key.length ? (
          <section aria-labelledby="key-heading">
            <h2 id="key-heading" className="text-xl font-semibold text-text">Key documents</h2>
            <p className="mt-1 text-sm text-muted">Annotated primary documents from the subject hubs.</p>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {key.map(({ hub, doc, src }) => (
                <li key={src.url} className="card p-4">
                  <ExternalLink href={src.url}>{src.title}</ExternalLink>
                  <span className="meta mt-1 block text-[0.8125rem]">{src.publisher} · from the hub <Link prefetch={false} href={`/hubs/${hub.slug}/`} className="link">{hub.title}</Link></span>
                  <span className="mt-2 block text-[0.9375rem] text-text">{doc.note}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section aria-labelledby="all-heading">
          <h2 id="all-heading" className="text-xl font-semibold text-text">All cited sources</h2>
          <div className="mt-4">
            <SourceLibrary dataUrl={asset("/data/sources.json")} total={total} />
          </div>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
