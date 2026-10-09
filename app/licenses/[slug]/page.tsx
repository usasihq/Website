import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimText } from "@/components/DetailParts";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader, Section } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { LICENSE_CATEGORY_LABELS, usesOfLicense } from "@/lib/licenses";
import { pageMetadata } from "@/lib/metadata";
import { artifactHref } from "@/lib/routes";

export const dynamicParams = false;

const APPLIES: Record<string, string> = {
  weights: "Weights",
  code: "Code",
  data: "Data",
  documentation: "Documentation",
  "weights-and-code": "Weights and code",
  all: "All components",
};

export function generateStaticParams() {
  return getCatalog().licenses.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const guide = getCatalog().licenses.find((x) => x.slug === slug);
  return pageMetadata({ title: guide ? `${guide.name}: a plain-language guide` : "License guide", description: guide?.summary.text.slice(0, 200) ?? "", path: `/licenses/${slug}/` });
}

export default async function LicenseGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const g = catalog.licenses.find((x) => x.slug === slug);
  if (!g) notFound();
  const uses = usesOfLicense(catalog, g);
  const s = g.sources;
  return (
    <>
      <PageHeader
        eyebrow={`License guide · ${LICENSE_CATEGORY_LABELS[g.category]}`}
        title={g.name}
        crumbs={[
          { href: "/licenses/", label: "License guide" },
          { href: `/licenses/${g.slug}/`, label: g.name },
        ]}
        description={<ClaimText claim={g.summary} sources={s} />}
      >
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="meta">{g.spdx ? `SPDX ${g.spdx}` : "Custom license (no SPDX identifier)"}</span>
          <ExternalLink href={g.official_url}>Read the full license text</ExternalLink>
          <span className="text-muted">Reviewed {formatDate(g.last_reviewed)}</span>
        </div>
      </PageHeader>
      <div className="container-page grid gap-12 py-10">
        <p className="max-w-3xl rounded-xl border border-line bg-elev/50 p-4 text-sm text-muted">
          These notes restate parts of the license text so you know what to look for. They are not complete, are not legal advice, and do not tell you whether
          a particular use is allowed. The license text governs.
        </p>
        <Section id="key-terms" title="What the license text says">
          <dl className="grid gap-4 md:grid-cols-2">
            {g.key_terms.map((k) => (
              <div key={k.label} className="card p-5">
                <dt className="text-sm font-semibold uppercase tracking-[0.06em] text-ice">{k.label}</dt>
                <dd className="mt-2 text-[0.9875rem] leading-relaxed text-text">
                  {k.text}
                  <SourceRefs ids={k.source_ids} sources={s} />
                </dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section
          id="records"
          title={`Records in the catalog that use it (${uses.length})`}
          description="Each row is one license entry on a record, with the component it covers. A record can use several licenses."
        >
          {uses.length === 0 ? (
            <p className="text-muted">No published record uses this license yet.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Record</th>
                    <th scope="col">Covers</th>
                    <th scope="col">License as recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {uses.map(({ artifact, license }) => (
                    <tr key={`${artifact.slug}-${license.name}-${license.applies_to}`}>
                      <th scope="row" className="font-medium">
                        <Link prefetch={false} href={artifactHref(artifact.slug)} className="link">
                          {artifact.name}
                        </Link>
                      </th>
                      <td className="text-muted">{APPLIES[license.applies_to] ?? license.applies_to}</td>
                      <td className="text-muted">{license.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
        <Section id="sources" title="Sources">
          <SourcesList sources={s} />
        </Section>
        <p className="text-sm text-muted">
          <Link href="/licenses/" className="link">
            All license guides
          </Link>{" "}
          ·{" "}
          <Link href="/learn/open-weight-vs-open-source/" className="link">
            What open weight and open source actually mean
          </Link>
        </p>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
