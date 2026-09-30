import Link from "next/link";
import { notFound } from "next/navigation";
import { Monogram, EntryTypeBadge, TierBadge, StatusBadge } from "@/components/Badges";
import { ArchivedNotice, ClaimText, EligibilityBlock, FactList, ReviewDates } from "@/components/DetailParts";
import { EntryActions } from "@/components/EntryActions";
import { ExternalLink } from "@/components/ExternalLink";
import { Breadcrumbs, Section } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { NewsCard } from "@/components/NewsList";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { entryTypeFor, KIND_PLURAL, OWNERSHIP_LABELS, PRODUCT_KIND_LABELS, RELATIONSHIP_LABELS, ROLE_LABELS, SECTOR_LABELS } from "@/lib/labels";
import { pageMetadata } from "@/lib/metadata";
import { computeTier } from "@/lib/openness";
import { artifactHref, orgHref } from "@/lib/routes";
import { HOSTED_MODEL_PRODUCT_KINDS, type Artifact, type Product } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  const catalog = getCatalog();
  return [...catalog.organizations, ...catalog.archivedOrganizations].map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getCatalog().organization(slug);
  if (!org) return {};
  return pageMetadata({
    title: org.name,
    description: org.summary.text.slice(0, 200),
    path: orgHref(org.slug),
    noindex: org.publication_status === "archived",
  });
}

function ProductsTable({ products, sources, caption }: { products: Product[]; sources: Parameters<typeof SourceRefs>[0]["sources"]; caption: string }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Kind</th>
            <th scope="col">Documented delivery and access</th>
            <th scope="col">Reviewed</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} id={`product-${p.id}`} data-product={p.id}>
              <th scope="row" className="min-w-[10rem] font-medium">
                <ExternalLink href={p.url}>{p.name}</ExternalLink>
              </th>
              <td className="whitespace-nowrap text-muted">{PRODUCT_KIND_LABELS[p.kind]}</td>
              <td className="min-w-[16rem] text-[#d5def2]">
                {p.access}
                <SourceRefs ids={p.source_ids} sources={sources} />
              </td>
              <td className="meta whitespace-nowrap">{formatDate(p.last_reviewed)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const GROUPS: Array<{ key: string; label: string; test: (a: Artifact) => boolean }> = [
  { key: "families", label: "Model families", test: (a) => a.kind === "model" && a.record_level === "family" },
  { key: "releases", label: "Model releases", test: (a) => a.kind === "model" && a.record_level === "release" },
  ...(["framework", "runtime", "research-stack", "dataset", "eval"] as const).map((kind) => ({
    key: kind,
    label: KIND_PLURAL[kind],
    test: (a: Artifact) => a.kind === kind,
  })),
];

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const org = catalog.organization(slug);
  if (!org) notFound();

  const s = org.sources;
  const parent = catalog.parentOrganization(org);
  const children = catalog.childOrganizations(org.slug);
  const related = catalog.artifactsForOrganization(org.slug);
  const hosted = org.products.filter((p) => HOSTED_MODEL_PRODUCT_KINDS.includes(p.kind));
  const other = org.products.filter((p) => !HOSTED_MODEL_PRODUCT_KINDS.includes(p.kind));

  return (
    <>
      {org.publication_status === "archived" && org.archive_note ? <ArchivedNotice note={org.archive_note} /> : null}
      <article>
        <header className="border-b border-line bg-[linear-gradient(180deg,rgba(11,18,36,0.6),transparent)]">
          <div className="container-page pb-10 pt-10 sm:pt-12">
            <Breadcrumbs items={[{ href: "/companies/", label: "Companies & Labs" }]} />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Monogram text={org.logo_text} size="lg" />
              <div className="min-w-0">
                <p className="eyebrow">Organization</p>
                <h1 className="mt-1 text-3xl font-semibold text-text sm:text-4xl">{org.name}</h1>
                <p className="mt-2 text-[0.9375rem] text-muted">
                  {org.organization_roles.map((r) => ROLE_LABELS[r]).join(" · ")}
                  {org.headquarters ? ` · ${org.headquarters.label}` : ""}
                </p>
                {org.parent_org_slug && org.parent_relationship ? (
                  <p className="mt-2 text-[0.9375rem] text-ice">
                    {RELATIONSHIP_LABELS[org.parent_relationship]} of{" "}
                    {parent ? (
                      <Link prefetch={false} href={orgHref(parent.slug)} className="link">
                        {parent.name}
                      </Link>
                    ) : (
                      "an organization not currently listed in this catalog"
                    )}
                  </p>
                ) : null}
              </div>
            </div>
            <ClaimText claim={org.summary} sources={s} className="mt-6 max-w-3xl text-lg text-[#d5def2]" />
            <nav aria-label="On this company page" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {["overview", "facts", "products", "artifacts", "sources"].map(id => <a key={id} href={`#${id}`} className="link capitalize">{id}</a>)}
            </nav>
            <div className="mt-6">
              <ReviewDates lastReviewed={org.last_reviewed} updatedAt={org.updated_at} />
            </div>
          </div>
        </header>

        <div className="container-page grid gap-12 py-12">
          {org.status_note ? (
            <div className="rounded-xl border border-[rgba(183,215,255,0.35)] bg-[rgba(183,215,255,0.05)] p-4" role="note">
              <p className="text-[0.9375rem]">
                <strong className="font-semibold text-text">Status: </strong>
                {org.status_note.text}
                <SourceRefs ids={org.status_note.source_ids} sources={s} />
              </p>
            </div>
          ) : null}

          <Section id="overview" title="Using this organization’s offerings" description="Ownership, delivery, and openness answer different questions. Publicly traded does not mean open source; privately held does not mean closed.">
            {org.profile ? <div className="grid gap-5 sm:grid-cols-2">
              <div><h3 className="font-semibold">Intended users</h3><ClaimText claim={org.profile.intended_users} sources={s} className="mt-2 text-muted" /></div>
              <div><h3 className="font-semibold">Hosted and self-hosted access</h3><ClaimText claim={org.profile.access_overview} sources={s} className="mt-2 text-muted" /></div>
              <div><h3 className="font-semibold">Restrictions and review limits</h3><ClaimText claim={org.profile.limitations} sources={s} className="mt-2 text-muted" /></div>
              <div><h3 className="font-semibold">Documentation and pricing</h3><ul className="mt-2 space-y-2">{org.profile.resources.map(r => <li key={r.url}><ExternalLink href={r.url}>{r.label}</ExternalLink><SourceRefs ids={r.source_ids} sources={s} /><span className="meta block text-xs">Reviewed {formatDate(r.reviewed_at)}</span></li>)}</ul></div>
            </div> : <p className="text-muted">The detailed audience, self-hosting, pricing, and restrictions review has not yet been completed. Consult the sourced product records below and the publisher’s current terms. Missing detail means unknown, not unavailable.</p>}
          </Section>

          <Section id="facts" title="Key facts">
            <FactList
              facts={[
                { label: "Website", value: <ExternalLink href={org.website}>{new URL(org.website).hostname.replace(/^www\./, "")}</ExternalLink> },
                org.legal_name
                  ? { label: "Legal name", value: <>{org.legal_name.text}<SourceRefs ids={org.legal_name.source_ids} sources={s} /></> }
                  : null,
                { label: "Ownership (separate from openness)", value: <>{OWNERSHIP_LABELS[org.ownership_category]}{org.ownership_evidence ? <ClaimText claim={org.ownership_evidence} sources={s} className="mt-1 text-sm text-muted" /> : <p className="mt-1 text-xs text-muted">Recorded classification; fact-level ownership verification pending.</p>}</> },
                { label: "Legal form", value: org.legal_form ? <>{org.legal_form.text}<SourceRefs ids={org.legal_form.source_ids} sources={s} /></> : "Unknown" },
                {
                  label: "Headquarters",
                  value: org.headquarters ? <>{org.headquarters.label}<SourceRefs ids={org.headquarters.source_ids} sources={s} /></> : "Not documented",
                },
                org.other_locations.length
                  ? {
                      label: "Other documented locations",
                      value: org.other_locations.map((l, i) => (
                        <span key={l.label}>
                          {i > 0 ? "; " : ""}
                          {l.label}
                          <SourceRefs ids={l.source_ids} sources={s} />
                        </span>
                      )),
                    }
                  : null,
                { label: "Founded", value: org.founded ? <>{org.founded.year}<SourceRefs ids={org.founded.source_ids} sources={s} /></> : "Unknown" },
                org.sectors.length ? { label: "Sectors", value: org.sectors.map((x) => SECTOR_LABELS[x]).join(", ") } : null,
                org.hiring_url ? { label: "Careers", value: <ExternalLink href={org.hiring_url}>Careers page</ExternalLink> } : null,
              ]}
            />
          </Section>

          <Section
            id="openness"
            title="What is and isn’t public"
            description="An evidence-based summary of what this catalog has documented. It is not a verdict on the organization as a whole."
          >
            {org.openness_summary ? (
              <ClaimText claim={org.openness_summary} sources={s} className="max-w-3xl text-[#d5def2]" />
            ) : (
              <p className="text-muted">No openness summary has been written for this organization yet.</p>
            )}
          </Section>

          <Section id="products" title="Products" description="Documented products and how they are delivered. Each row links to the official page.">
            {org.products.length === 0 ? <p className="text-muted">No product records yet.</p> : null}
            <div id="hosted-model-products" className="scroll-mt-24">
              {hosted.length > 0 ? (
                <>
                  <h3 className="mb-2 text-lg font-semibold text-text">Hosted model products</h3>
                  <p className="mb-3 max-w-3xl text-sm text-muted">
                    Labeled <span className="badge">Hosted product/API</span> — this describes how a documented product is delivered (hosted access). It does not determine whether underlying weights or code are open; assess the specific release and its licenses.
                  </p>
                  <ProductsTable products={hosted} sources={s} caption={`${org.name}: hosted model products`} />
                </>
              ) : org.products.length > 0 ? (
                <p className="text-sm text-muted">No hosted model products are recorded for this organization.</p>
              ) : null}
            </div>
            {other.length > 0 ? (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-text">Other products</h3>
                <ProductsTable products={other} sources={s} caption={`${org.name}: other products`} />
              </div>
            ) : null}
          </Section>

          <Section
            id="artifacts"
            title="Cataloged artifacts"
            description="Records in the Open Models & Tools directory that list this organization as a maintainer or publisher."
          >
            {related.length === 0 ? (
              <p className="text-muted">
                No artifact records in this catalog list {org.name}. That is not evidence that none exist — only that none have been reviewed here.
              </p>
            ) : (
              <div className="grid gap-8">
                {GROUPS.map((group) => {
                  const list = related.filter(group.test);
                  if (list.length === 0) return null;
                  return (
                    <div key={group.key}>
                      <h3 className="text-lg font-semibold text-text">
                        {group.label} <span className="meta">({list.length})</span>
                      </h3>
                      <ul className="mt-3 divide-y divide-[rgba(120,180,255,0.12)] border-y border-line">
                        {list.map((a) => {
                          const tier = computeTier(a);
                          return (
                            <li key={a.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                              <Link prefetch={false} href={artifactHref(a.slug)} className="link font-medium">
                                {a.name}
                              </Link>
                              <span className="flex flex-wrap items-center gap-1.5">
                                <EntryTypeBadge type={entryTypeFor(a.kind, a.record_level)} />
                                {a.record_level !== "family" ? <StatusBadge status={a.availability.status} label="Availability" /> : null}
                                {tier ? <TierBadge tier={tier} withRubric /> : null}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {parent || children.length > 0 ? (
            <Section id="relationships" title="Organizational relationships">
              <ul className="space-y-2">
                {parent ? (
                  <li>
                    Parent organization:{" "}
                    <Link prefetch={false} href={orgHref(parent.slug)} className="link">
                      {parent.name}
                    </Link>{" "}
                    <span className="text-muted">({RELATIONSHIP_LABELS[org.parent_relationship!]})</span>
                    {org.parent_evidence ? <ClaimText claim={org.parent_evidence} sources={s} /> : <p className="text-xs text-muted">Fact-level relationship verification pending.</p>}
                  </li>
                ) : null}
                {children.map((c) => (
                  <li key={c.slug}>
                    {RELATIONSHIP_LABELS[c.parent_relationship!]}:{" "}
                    <Link prefetch={false} href={orgHref(c.slug)} className="link">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">Units and subsidiaries have their own records and are counted separately from their parent.</p>
            </Section>
          ) : null}

          {org.notable_facts.length > 0 ? (
            <Section id="notable" title="Notable documented facts">
              <ul className="max-w-3xl list-disc space-y-2 pl-5 text-[#d5def2] marker:text-muted">
                {org.notable_facts.map((fact) => (
                  <li key={fact.text}>
                    {fact.text}
                    <SourceRefs ids={fact.source_ids} sources={s} />
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {catalog.newsForOrganization(org.slug).length > 0 ? (
            <Section id="news" title="In the news" description="Dated, sourced updates in this catalog's news that mention this entry.">
              <ol className="border-t border-line">
                {catalog.newsForOrganization(org.slug).slice(0, 5).map((item) => (
                  <li key={item.slug}>
                    <NewsCard item={item} catalog={catalog} />
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          <Section id="eligibility" title="U.S. eligibility" description="How this record meets the catalog’s published eligibility policy.">
            <EligibilityBlock eligibility={org.eligibility} sources={s} />
            <p className="mt-3 text-sm">
              <Link prefetch={false} href="/methodology/#eligibility" className="link">
                Eligibility policy
              </Link>
            </p>
          </Section>

          <Section id="sources" title="Sources">
            <SourcesList sources={s} />
          </Section>

          <div className="grid gap-4 border-t border-line pt-8">
            <EntryActions contentPath={`content/organizations/${org.slug}.yml`} title={org.name} />
            <p className="text-[0.9375rem] text-muted">This listing is not an endorsement or a federal approval.</p>
          </div>
        </div>
      </article>
      <SupportPanel variant="compact" />
    </>
  );
}
