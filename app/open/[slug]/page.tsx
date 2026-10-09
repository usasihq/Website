import Link from "next/link";
import { RecordContext } from "@/components/RecordContext";
import { artifactRelated, artifactUnknowns } from "@/lib/record-context";
import { notFound } from "next/navigation";
import { GitBranch, Info } from "lucide-react";
import { EntryTypeBadge, StatusBadge, TierBadge } from "@/components/Badges";
import { ArchivedNotice, ClaimText, EligibilityBlock, ReviewDates } from "@/components/DetailParts";
import { EntryActions } from "@/components/EntryActions";
import { ExternalLink } from "@/components/ExternalLink";
import { Breadcrumbs, Section } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { NewsCard } from "@/components/NewsList";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { guideFor } from "@/lib/licenses";
import { entryTypeFor, KIND_LABELS } from "@/lib/labels";
import { pageMetadata, socialImages } from "@/lib/metadata";
import {
  AVAILABILITY_DESCRIPTIONS,
  checklistFor,
  computeTier,
  componentRights,
  isOsiApproved,
  licenseCaveats,
  RUBRIC_LABEL,
  TIER_DESCRIPTIONS,
} from "@/lib/openness";
import { artifactHref, orgHref } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  const catalog = getCatalog();
  return [...catalog.artifacts, ...catalog.archivedArtifacts].map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getCatalog().artifact(slug);
  if (!a) return {};
  return pageMetadata({
    title: a.name,
    description: a.summary.text.slice(0, 200),
    path: artifactHref(a.slug),
    noindex: a.publication_status === "archived",
    image: socialImages.open,
  });
}

const LINK_KIND_LABELS: Record<string, string> = {
  website: "Website",
  repository: "Repository",
  "model-hub": "Model hub",
  "dataset-hub": "Dataset hub",
  documentation: "Documentation",
  paper: "Paper",
  license: "License",
  "release-notes": "Release notes",
};

const APPLIES_LABELS: Record<string, string> = {
  weights: "Weights",
  code: "Code",
  data: "Data",
  documentation: "Documentation",
  "weights-and-code": "Weights and code",
  all: "Everything in the release",
};

export default async function ArtifactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const a = catalog.artifact(slug);
  if (!a) notFound();

  const s = a.sources;
  const type = entryTypeFor(a.kind, a.record_level);
  const family = catalog.familyOf(a);
  const releases = a.record_level === "family" ? catalog.releasesOf(a.slug) : [];
  const siblings = family ? catalog.releasesOf(family.slug).filter((r) => r.slug !== a.slug) : [];
  const derivatives = catalog.derivativesOf(a.slug);
  const tier = computeTier(a);
  const caveats = tier === "open-weight" || tier === "open-stack" || tier === "fully-open" ? licenseCaveats(a) : [];
  const crumbs = [{ href: "/open/", label: "Open Models & Tools" }];
  if (family) crumbs.push({ href: artifactHref(family.slug), label: family.name });

  return (
    <>
      {a.publication_status === "archived" && a.archive_note ? <ArchivedNotice note={a.archive_note} /> : null}
      <article>
        <header className="border-b border-line bg-[linear-gradient(180deg,rgba(11,18,36,0.6),transparent)]">
          <div className="container-page pb-10 pt-10 sm:pt-12">
            <Breadcrumbs items={crumbs} />
            <div className="flex flex-wrap items-center gap-2">
              <EntryTypeBadge type={type} />
              {a.kind !== "model" ? <span className="text-sm text-muted">{KIND_LABELS[a.kind]}</span> : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">{a.name}</h1>
            <p className="mt-2 text-[0.9375rem] text-muted">
              {a.record_level === "family"
                ? "Family overview — summarizes releases; licenses and availability belong to each release."
                : a.record_level === "release"
                  ? `Release${family ? ` in the ${family.name} family` : ""}${a.version ? ` · version ${a.version}` : ""}`
                  : a.version
                    ? `Version ${a.version}`
                    : "Project record"}
            </p>
            <p className="mt-2 text-[0.9375rem]">
              <span className="text-muted">Maintained by </span>
              {a.maintainers.map((m, i) => (
                <span key={m.name}>
                  {i > 0 ? ", " : ""}
                  {m.organization_slug && catalog.isActiveOrganization(m.organization_slug) ? (
                    <Link prefetch={false} href={orgHref(m.organization_slug)} className="link">
                      {m.name}
                    </Link>
                  ) : (
                    <span className="text-text">{m.name}</span>
                  )}
                  <SourceRefs ids={m.source_ids} sources={s} />
                </span>
              ))}
            </p>
            <ClaimText claim={a.summary} sources={s} className="mt-6 max-w-3xl text-lg text-[#d5def2]" />
            {a.links.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]" aria-label="Official links">
                {a.links.map((l) => (
                  <li key={l.url}>
                    <span className="text-muted">{LINK_KIND_LABELS[l.kind]}: </span>
                    <ExternalLink href={l.url}>{l.label}</ExternalLink>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-6">
              <ReviewDates lastReviewed={a.last_reviewed} updatedAt={a.updated_at} releasedAt={a.released_at} />
            </div>
          </div>
        </header>

        <div className="container-page grid gap-12 py-12">
          {a.record_level === "family" ? (
            <Section
              id="releases"
              title="Releases assessed"
              description="Each release is assessed on its own. This family has no family-wide openness label."
            >
              {releases.length === 0 ? (
                <p className="text-muted">No individual releases in this family have been assessed yet.</p>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <caption className="sr-only">Releases in the {a.name} family</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="sticky-col">
                          Release
                        </th>
                        <th scope="col">Weights</th>
                        <th scope="col">Tier ({RUBRIC_LABEL})</th>
                        <th scope="col">License</th>
                        <th scope="col">Released</th>
                      </tr>
                    </thead>
                    <tbody>
                      {releases.map((r) => {
                        const rt = computeTier(r);
                        return (
                          <tr key={r.slug}>
                            <th scope="row" className="sticky-col font-medium">
                              <Link prefetch={false} href={artifactHref(r.slug)} className="link">
                                {r.name}
                              </Link>
                            </th>
                            <td>
                              <StatusBadge status={r.checklist.weights?.status ?? "unknown"} label="Weights" />
                            </td>
                            <td>{rt ? <TierBadge tier={rt} /> : "—"}</td>
                            <td className="text-muted">{r.licenses.map((l) => l.spdx ?? l.name).join(", ") || "Not recorded"}</td>
                            <td className="meta whitespace-nowrap">{formatDate(r.released_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          ) : (
            <>
              <Section id="availability" title="Availability and license">
                <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
                  <div className="card p-5">
                    <p className="text-sm text-muted">Overall availability</p>
                    <div className="mt-2">
                      <StatusBadge status={a.availability.status} />
                    </div>
                    <p className="mt-3 text-[0.9375rem] text-[#d5def2]">
                      {a.availability.access_conditions ?? AVAILABILITY_DESCRIPTIONS[a.availability.status]}
                      <SourceRefs ids={a.availability.source_ids} sources={s} />
                    </p>
                    <p className="meta mt-2 text-xs">Availability fact review: {a.availability.reviewed_at ? formatDate(a.availability.reviewed_at) : "not separately recorded"}{a.availability.effective_at ? ` · effective ${formatDate(a.availability.effective_at)}` : ""}</p>
                    <p className="mt-3 text-sm text-muted">Availability is separate from permission: read the license before using or redistributing.</p>
                  </div>
                  <div>
                    {a.licenses.length === 0 ? (
                      <p className="text-muted">No license has been recorded for this entry. Unknown is not the same as unrestricted.</p>
                    ) : (
                      <ul className="grid gap-3">
                        {a.licenses.map((l) => (
                          <li key={`${l.name}-${l.applies_to}`} className="card p-4">
                            <p className="font-medium text-text">
                              {l.url ? <ExternalLink href={l.url}>{l.name}</ExternalLink> : l.name}
                              <SourceRefs ids={l.source_ids} sources={s} />
                            </p>
                            <p className="meta mt-1 text-[0.8125rem]">
                              Applies to: {APPLIES_LABELS[l.applies_to]}
                              {l.spdx ? ` · SPDX ${l.spdx}` : " · custom license (no SPDX identifier)"}
                              {isOsiApproved(l.spdx) ? " · on the rubric’s OSI-approved software-license list" : ""}
                              {l.reviewed_at ? ` · fact reviewed ${formatDate(l.reviewed_at)}` : " · fact-level rights review not recorded"}
                              {l.effective_at ? ` · effective ${formatDate(l.effective_at)}` : ""}
                            </p>
                            {(() => {
                              const guide = guideFor(catalog, l);
                              return guide ? (
                                <Link prefetch={false} href={`/licenses/${guide.slug}/`} className="link mt-2 inline-block text-sm">
                                  Plain-language guide to the {guide.name}
                                </Link>
                              ) : null;
                            })()}
                          </li>
                        ))}
                      </ul>
                    )}
                    {a.license_notes ? <ClaimText claim={a.license_notes} sources={s} className="mt-4 text-[0.9375rem] text-[#d5def2]" /> : null}
                  </div>
                </div>
              </Section>

              <Section id="component-rights" title="Component reuse rights" description="A readable or downloadable component is not automatically reusable. These indicators concern recorded license evidence, not system certification.">
                <dl className="grid gap-3 sm:grid-cols-2">{(["weights", "code", "data", "documentation"] as const).map(component => {
                  const status = componentRights(a.licenses, component);
                  return <div key={component} className="card p-3"><dt className="font-semibold capitalize">{component}</dt><dd className="mt-1 text-sm text-muted">{status === "qualifying-license" ? "Reviewed qualifying license recorded — check scope and conditions" : status === "review-required" ? "Terms or license combinations require review" : "Unknown — no complete fact-level rights review"}</dd></div>;
                })}</dl>
                {a.system_openness_review ? <p className="mt-4 text-sm">System review: {a.system_openness_review.status}. {a.system_openness_review.rationale}<SourceRefs ids={a.system_openness_review.source_ids} sources={s} /> Reviewed {formatDate(a.system_openness_review.reviewed_at)}.</p> : <p className="mt-4 text-sm text-muted">No complete system-rights review is recorded for this release.</p>}
              </Section>

              {tier ? (
                <Section id="tier" title="Model-disclosure tier" description={`Computed from the checklist below using ${RUBRIC_LABEL}. An editorial category, not a certification.`}>
                  <div className="card p-5">
                    <TierBadge tier={tier} withRubric />
                    <p className="mt-3 max-w-3xl text-[0.9375rem] text-[#d5def2]">{TIER_DESCRIPTIONS[tier]}</p>
                    {caveats.map((c) => (
                      <p key={c} className="mt-3 flex gap-2 text-[0.9375rem] text-ice">
                        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                        {c}
                      </p>
                    ))}
                    <p className="mt-3 text-sm">
                      <Link prefetch={false} href="/methodology/#openness" className="link">
                        How tiers are computed
                      </Link>
                    </p>
                  </div>
                </Section>
              ) : null}

              <Section id="checklist" title="Public materials checklist" description={`Items for a ${KIND_LABELS[a.kind].toLowerCase()} under ${RUBRIC_LABEL}. Unknown means unassessed or insufficient evidence.`}>
                <div className="table-scroll">
                  <table className="data-table">
                    <caption className="sr-only">Public materials checklist for {a.name}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col">Status</th>
                        <th scope="col">Notes and evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checklistFor(a).map((row) => (
                        <tr key={row.key} data-check={row.key}>
                          <th scope="row" className="min-w-[10rem] font-medium">
                            {row.label}
                            <span className="mt-0.5 block text-sm font-normal text-muted">{row.question}</span>
                          </th>
                          <td>
                            <StatusBadge status={row.item.status} />
                          </td>
                          <td className="min-w-[14rem] text-[0.9375rem] text-[#d5def2]">
                            {row.item.note ?? (row.item.status === "unknown" ? <span className="text-muted">Not assessed.</span> : null)}
                            <SourceRefs ids={row.item.source_ids} sources={s} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          )}

          {a.useful_for ? (
            <Section id="use" title="What it is useful for">
              <ClaimText claim={a.useful_for} sources={s} className="max-w-3xl text-[#d5def2]" />
            </Section>
          ) : null}

          {a.run_notes.length > 0 ? (
            <Section id="run-notes" title="Run and use notes" description="Documented facts only. No hardware or performance claims are made without a cited source and stated assumptions.">
              <ul className="max-w-3xl list-disc space-y-2 pl-5 text-[#d5def2] marker:text-muted">
                {a.run_notes.map((n) => (
                  <li key={n.text}>
                    {n.text}
                    <SourceRefs ids={n.source_ids} sources={s} />
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section id="context" title="Organization context">
            {a.organization_slugs.length === 0 ? (
              <p className="text-[#d5def2]">Independent project: no organization record is linked to this entry.</p>
            ) : (
              <ul className="space-y-2">
                {a.organization_slugs.map((slug) => {
                  const org = catalog.organization(slug);
                  return (
                    <li key={slug}>
                      {org && catalog.isActiveOrganization(slug) ? (
                        <Link prefetch={false} href={orgHref(slug)} className="link">
                          {org.name}
                        </Link>
                      ) : (
                        <span className="text-muted">An organization not currently listed in this catalog</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          {a.provenance || derivatives.length > 0 ? (
            <Section id="provenance" title="Provenance and derivatives">
              {a.provenance ? (
                <div className="card flex gap-3 p-5">
                  <GitBranch aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-cyan" />
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] text-[#d5def2]">
                      {a.provenance.text}
                      <SourceRefs ids={a.provenance.source_ids} sources={s} />
                    </p>
                    {a.provenance.derived_from.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-[0.9375rem]">
                        {a.provenance.derived_from.map((d) => (
                          <li key={d.name}>
                            <span className="text-muted">Derived from: </span>
                            {d.artifact_slug && catalog.isActiveArtifact(d.artifact_slug) ? (
                              <Link prefetch={false} href={artifactHref(d.artifact_slug)} className="link">
                                {d.name}
                              </Link>
                            ) : d.url ? (
                              <ExternalLink href={d.url}>{d.name}</ExternalLink>
                            ) : (
                              d.name
                            )}
                            {d.note ? <span className="text-muted"> — {d.note}</span> : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {derivatives.length > 0 ? (
                <div className="mt-4">
                  <p className="text-sm text-muted">Catalog records that name this entry in their provenance:</p>
                  <ul className="mt-2 space-y-1">
                    {derivatives.map((d) => (
                      <li key={d.slug}>
                        <Link prefetch={false} href={artifactHref(d.slug)} className="link">
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Section>
          ) : null}

          {family ? (
            <Section id="siblings" title={`Other releases in the ${family.name} family`}>
              {siblings.length === 0 ? (
                <p className="text-muted">No other releases in this family have been assessed.</p>
              ) : (
                <ul className="divide-y divide-[rgba(120,180,255,0.12)] border-y border-line">
                  {siblings.map((r) => {
                    const rt = computeTier(r);
                    return (
                      <li key={r.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <Link prefetch={false} href={artifactHref(r.slug)} className="link font-medium">
                          {r.name}
                        </Link>
                        {rt ? <TierBadge tier={rt} withRubric /> : null}
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-3 text-sm">
                <Link prefetch={false} href={artifactHref(family.slug)} className="link">
                  {family.name} family overview
                </Link>
              </p>
            </Section>
          ) : null}

          {catalog.newsForArtifact(a.slug).length > 0 ? (
            <Section id="news" title="In the news" description="Dated, sourced updates in this catalog's news that mention this entry.">
              <ol className="border-t border-line">
                {catalog.newsForArtifact(a.slug).slice(0, 5).map((item) => (
                  <li key={item.slug}>
                    <NewsCard item={item} catalog={catalog} />
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          <RecordContext unknowns={artifactUnknowns(a)} related={artifactRelated(catalog, a)} />

          <Section id="eligibility" title="U.S. eligibility" description="Project eligibility rests on documented governing or maintaining entities, not on contributors.">
            <EligibilityBlock eligibility={a.eligibility} sources={s} />
          </Section>

          <Section id="sources" title="Sources">
            <SourcesList sources={s} />
          </Section>

          <div className="grid gap-4 border-t border-line pt-8">
            <EntryActions contentPath={`content/artifacts/${a.slug}.yml`} title={a.name} />
            <p className="text-[0.9375rem] text-muted">This listing is not an endorsement, a safety assessment, or a federal approval.</p>
          </div>
        </div>
      </article>
      <SupportPanel variant="compact" />
    </>
  );
}
