import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ExternalLink } from "@/components/ExternalLink";
import { PageHeader } from "@/components/PageHeader";
import { ShareCite } from "@/components/ShareCite";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { breadcrumbList, ldJson } from "@/lib/page-jsonld";
import { absoluteUrl } from "@/lib/paths";
import {
  DATE_LABEL_VERBS,
  isInactive,
  isLegislation,
  longIdentifier,
  policyAnchorHref,
  policyFilterFor,
  policyHeading,
  policyHref,
  policyPageTitle,
  policyShortName,
  POLICY_STATUS_LABELS,
  POLICY_TYPE_LABELS,
  relatedPolicies,
  summarySentences,
} from "@/lib/policy";
import { orgHref } from "@/lib/routes";
import type { PolicyDocument } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().policy.map((d) => ({ slug: d.slug }));
}

const doc = (slug: string) => getCatalog().policy.find((d) => d.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const d = doc((await params).slug);
  if (!d) return {};
  const path = policyHref(d.slug);
  return pageMetadata({
    title: policyPageTitle(d),
    description: `${DATE_LABEL_VERBS[d.date_label] ?? "Dated"} ${formatDate(d.date)}. ${summarySentences(d.summary.text)[0] ?? d.summary.text}`,
    path,
    image: cardImage(getCatalog(), path),
  });
}

/** The issuer as recorded; "President of the United States (Name)" becomes a person with that title. */
function issuerLd(issuer: string) {
  const president = issuer.match(/^President of the United States \((.+)\)$/);
  return president ? { "@type": "Person", name: president[1], jobTitle: "President of the United States" } : { "@type": "GovernmentOrganization", name: issuer };
}

const LEGAL_FORCE: Partial<Record<PolicyDocument["status"], string>> = {
  "in-effect": "https://schema.org/InForce",
  revoked: "https://schema.org/NotInForce",
  rescinded: "https://schema.org/NotInForce",
  superseded: "https://schema.org/NotInForce",
};

function documentLd(d: PolicyDocument) {
  const url = absoluteUrl(policyHref(d.slug));
  const alternateName = [...new Set([d.short_title, longIdentifier(d)].filter((x): x is string => Boolean(x && x !== d.title)))];
  if (isLegislation(d)) {
    return {
      "@type": "Legislation",
      "@id": `${url}#document`,
      name: d.title,
      ...(alternateName.length ? { alternateName } : {}),
      ...(d.identifier ? { legislationIdentifier: d.identifier } : {}),
      legislationType: POLICY_TYPE_LABELS[d.document_type],
      legislationDate: d.date,
      legislationJurisdiction: "US",
      legislationPassedBy: issuerLd(d.issuer),
      author: issuerLd(d.issuer),
      ...(LEGAL_FORCE[d.status] ? { legislationLegalForce: LEGAL_FORCE[d.status] } : {}),
      abstract: d.summary.text,
      url: d.official_url,
      mainEntityOfPage: url,
    };
  }
  return {
    "@type": "Article",
    "@id": `${url}#summary`,
    headline: policyHeading(d).slice(0, 110),
    description: d.summary.text,
    url,
    dateModified: d.updated_at,
    author: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    isAccessibleForFree: true,
    about: {
      "@type": d.document_type === "report" ? "Report" : "CreativeWork",
      name: d.title,
      ...(alternateName.length ? { alternateName } : {}),
      ...(d.identifier ? { identifier: d.identifier } : {}),
      datePublished: d.date,
      author: issuerLd(d.issuer),
      url: d.official_url,
    },
  };
}

export default async function PolicyDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = doc((await params).slug);
  if (!d) notFound();
  const catalog = getCatalog();
  const all = catalog.policy;
  const path = policyHref(d.slug);
  const heading = policyHeading(d);
  const related = relatedPolicies(d, all);
  // Answer first: the summary's opening sentence leads the page; the rest are listed as provisions.
  const [lead, ...rest] = summarySentences(d.summary.text);
  const inactive = isInactive(d.status);
  const group = policyFilterFor(d);
  const i = all.findIndex((x) => x.slug === d.slug);
  // The tracker lists newest first: "newer" is the previous entry in that list.
  const newer = i > 0 ? all[i - 1] : undefined;
  const older = i < all.length - 1 ? all[i + 1] : undefined;
  const orgs = [...new Set([...(d.issuer_org_slug ? [d.issuer_org_slug] : []), ...d.related_organizations])].filter((s) => catalog.isActiveOrganization(s));
  const crumbs = [
    { href: "/policy/", label: "Policy tracker" },
    { href: path, label: policyShortName(d) },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": [documentLd(d), breadcrumbList(crumbs)] };
  const verb = DATE_LABEL_VERBS[d.date_label] ?? "Dated";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-2">
            {POLICY_TYPE_LABELS[d.document_type]}
            <span
              className={`badge normal-case tracking-normal ${inactive ? "border-arc/40 text-tone-rose-2" : d.status === "in-effect" || d.status === "final" ? "border-cyan/40 text-cyan" : ""}`}
            >
              {POLICY_STATUS_LABELS[d.status]}
            </span>
          </span>
        }
        title={heading}
        crumbs={crumbs}
        description={
          <>
            <p className="text-body" data-testid="policy-answer">
              {lead}
              <SourceRefs ids={d.summary.source_ids} sources={d.sources} />
            </p>
            <p className="meta mt-4 text-sm">
              {verb} <time dateTime={d.date}>{formatDate(d.date)}</time> · {d.issuer} · {POLICY_STATUS_LABELS[d.status]}
              {d.short_title && d.document_type === "law" && d.short_title !== d.title ? <> · Full title: {d.title}</> : null}
            </p>
          </>
        }
      />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 gap-10">
          {rest.length ? (
            <section aria-labelledby="provisions-heading" className="max-w-3xl">
              <h2 id="provisions-heading" className="text-xl font-semibold text-text sm:text-2xl">
                {isLegislation(d) ? "Key provisions" : "More on what it covers"}
              </h2>
              <p className="mt-1 text-sm text-muted">The rest of this tracker&apos;s summary, one point per line, with its source.</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-[1.0625rem] leading-relaxed text-body">
                {rest.map((s, k) => (
                  <li key={k}>
                    {s}
                    {k === rest.length - 1 ? <SourceRefs ids={d.summary.source_ids} sources={d.sources} /> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="status-heading" className="max-w-3xl">
            <h2 id="status-heading" className="text-xl font-semibold text-text sm:text-2xl">
              Status: {POLICY_STATUS_LABELS[d.status]}
            </h2>
            {d.status_note ? (
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-body">
                {d.status_note.text}
                <SourceRefs ids={d.status_note.source_ids} sources={d.sources} />
              </p>
            ) : (
              <p className="mt-3 text-muted">No status note is recorded beyond the status above.</p>
            )}
          </section>

          {related.length ? (
            <section aria-labelledby="related-heading" className="max-w-3xl">
              <h2 id="related-heading" className="text-xl font-semibold text-text sm:text-2xl">
                Related documents
              </h2>
              <p className="mt-1 text-sm text-muted">Connected by what the records say: a replacement, or a mention by name or number.</p>
              <ul className="mt-4 space-y-3">
                {related.map(({ doc: r, relation }) => (
                  <li key={r.slug} className="rounded-xl border border-line p-4">
                    <p className="text-xs uppercase tracking-[0.06em] text-ice">{relation}</p>
                    <Link prefetch={false} href={policyHref(r.slug)} className="link mt-1 inline-block font-medium">
                      {policyHeading(r)}
                    </Link>
                    <p className="meta mt-1 text-sm">
                      {DATE_LABEL_VERBS[r.date_label] ?? "Dated"} {formatDate(r.date)} · {POLICY_STATUS_LABELS[r.status]}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="sources-heading" className="max-w-3xl">
            <h2 id="sources-heading" className="text-xl font-semibold text-text sm:text-2xl">
              Sources
            </h2>
            <p className="mt-1 text-sm text-muted">Read on the dates shown. Last reviewed {formatDate(d.last_reviewed)}.</p>
            <div className="mt-4">
              <SourcesList sources={d.sources} />
            </div>
          </section>

          <p className="max-w-3xl rounded-xl border border-line bg-elev/50 p-4 text-sm text-muted">
            This page describes what the document says, not whether it is good policy, and it is not legal advice. Status comes from official sources read on the
            dates shown. To check a document yourself, see{" "}
            <Link href="/learn/policy-and-standards-sources/" className="link">
              finding AI policy and standards sources
            </Link>
            .
          </p>

          <nav aria-label="Other documents in the tracker" className="grid gap-3 sm:grid-cols-2">
            {older ? (
              <Link prefetch={false} href={policyHref(older.slug)} className="card flex items-start gap-2 p-4 hover:border-cyan">
                <ArrowLeft aria-hidden="true" className="mt-1 h-4 w-4 flex-none text-cyan" />
                <span>
                  <span className="block text-xs uppercase tracking-[0.06em] text-muted">Earlier</span>
                  <span className="text-text">{policyShortName(older)}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link prefetch={false} href={policyHref(newer.slug)} className="card flex items-start justify-end gap-2 p-4 text-right hover:border-cyan">
                <span>
                  <span className="block text-xs uppercase tracking-[0.06em] text-muted">Later</span>
                  <span className="text-text">{policyShortName(newer)}</span>
                </span>
                <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 flex-none text-cyan" />
              </Link>
            ) : null}
          </nav>
        </div>

        <aside className="grid h-fit gap-6" aria-label="Document facts">
          <dl className="card grid gap-3 p-5 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">Type</dt>
              <dd className="text-text">{POLICY_TYPE_LABELS[d.document_type]}</dd>
            </div>
            {d.identifier ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.06em] text-muted">Identifier</dt>
                <dd className="font-mono text-text">{d.identifier}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">Issued by</dt>
              <dd className="text-text">{d.issuer}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">Key dates</dt>
              <dd className="text-text">
                <ul className="space-y-0.5">
                  <li>
                    {verb} <time dateTime={d.date}>{formatDate(d.date)}</time>
                  </li>
                  {d.status_note ? <li className="text-muted">Status checked {formatDate(d.status_note.reviewed_at)}</li> : null}
                  <li className="text-muted">Record reviewed {formatDate(d.last_reviewed)}</li>
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">Status</dt>
              <dd className="text-text">{POLICY_STATUS_LABELS[d.status]}</dd>
            </div>
            {orgs.length ? (
              <div>
                <dt className="text-xs uppercase tracking-[0.06em] text-muted">Organizations in this catalog</dt>
                <dd>
                  {orgs.map((s, k) => (
                    <span key={s}>
                      {k > 0 ? ", " : ""}
                      <Link prefetch={false} href={orgHref(s)} className="link">
                        {catalog.organization(s)!.name}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-[0.06em] text-muted">Official text</dt>
              <dd>
                <ExternalLink href={d.official_url} showHost>
                  Read the document
                </ExternalLink>
              </dd>
            </div>
          </dl>
          <p className="text-sm text-muted">
            <Link href={policyAnchorHref(d.slug)} className="link">
              See this entry in the policy tracker
            </Link>
            {group ? (
              <>
                {" "}
                ·{" "}
                <Link href={`/policy/?type=${group.id}`} className="link">
                  All {group.label.toLowerCase()}
                </Link>
              </>
            ) : null}
          </p>
          <ShareCite path={path} title={heading} date={d.updated_at} citeKey={`policy_${d.slug.replace(/-/g, "_")}`} />
        </aside>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
