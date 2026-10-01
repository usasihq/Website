import Link from "next/link";
import { StatusBadge } from "@/components/Badges";
import { ModelComparison } from "@/components/ModelComparison";
import { CoverageTable } from "@/components/CoverageTable";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { buildCoverage, buildModelMatrix, checklistColumnsFor, MODEL_COLUMNS, PROJECT_GROUPS } from "@/lib/matrix";
import { pageMetadata } from "@/lib/metadata";
import { RUBRIC_LABEL } from "@/lib/openness";
import { artifactHref } from "@/lib/routes";
import type { AvailabilityStatus } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Compare",
  description:
    "Comparison workspace for the USASI catalog: documented hosted products, public-weight model releases, training materials, and software, dataset, and evaluation-tool checklists. Not a leaderboard.",
  path: "/matrix/",
});

export default function MatrixPage() {
  const catalog = getCatalog();
  const orgItems = catalog.organizations.map((o) => catalog.toOrgListItem(o));
  const artifactItems = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
  const hostedIds = Object.fromEntries(catalog.organizations.map((o) => [o.slug, catalog.hostedModelProducts(o).map((p) => p.id)]));
  const rows = buildModelMatrix(orgItems, artifactItems, hostedIds);
  const coverage = buildCoverage(orgItems, artifactItems);

  return (
    <>
      <PageHeader
        compact
        eyebrow="Comparison workspace"
        title="Compare"
        description={
          <p>
            Side-by-side evidence from this catalog. This is not a leaderboard: no column measures capability, safety, or which organization is
            “ahead.” Every number links to exactly the records it counts.
          </p>
        }
      >
        <nav aria-label="Views" className="mt-6 flex flex-wrap gap-3">
          <a href="#models" className="btn btn-secondary">
            Model releases view
          </a>
          <a href="#projects" className="btn btn-secondary">
            Software, data &amp; evaluation view
          </a>
          <a href="#coverage" className="btn btn-secondary">
            Catalog coverage
          </a>
        </nav>
      </PageHeader>

      <div className="container-page grid gap-10 py-6">
        <section id="models" aria-labelledby="models-heading" className="scroll-mt-24">
          <h2 id="models-heading" className="text-2xl font-semibold text-text">
            Model releases view
          </h2>
          <details className="mt-3 max-w-3xl text-[0.9375rem] text-muted">
            <summary className="cursor-pointer text-ice">How to read this comparison</summary>
            <div className="mt-3 space-y-3">
            <p>
              Rows are organization records with a documented hosted-model product or at least one model record. <strong className="text-text">Hosted model
              products</strong> come from sourced product records on each organization page (a product indicator, not a release count). All other columns
              count model records in the Open Models &amp; Tools directory.
            </p>
            <p>
              Tier columns use {RUBRIC_LABEL} and are <strong className="text-text">cumulative, so they overlap</strong>: every reviewed open systems release is also counted as
              open-stack and open-weight. Do not add them together. A release listing two organizations appears in both rows, so columns are not summed.
            </p>
            </div>
          </details>
          <p className="mt-2 text-sm text-muted">Counts describe catalog coverage, not capability. Open-weight means publicly downloadable weights, not unrestricted use. Select a count to inspect its records.</p>

          <ModelComparison rows={rows} />

          <details className="mt-5">
            <summary className="cursor-pointer font-medium text-ice">Column definitions and counting rules</summary>
          <dl className="mt-6 grid gap-4 text-[0.9375rem] md:grid-cols-2">
            {MODEL_COLUMNS.map((c) => (
              <div key={c.key} className="border-t border-line pt-3">
                <dt className="font-medium text-text">{c.label}</dt>
                <dd className="mt-1 text-muted">{c.description}</dd>
              </div>
            ))}
            <div className="border-t border-line pt-3">
              <dt className="font-medium text-text">Zero versus unknown</dt>
              <dd className="mt-1 text-muted">
                0 means no matching published record in this catalog — not proof that nothing exists. “Weights unassessed” counts releases whose
                weight availability is Unknown.
              </dd>
            </div>
            <div className="border-t border-line pt-3">
              <dt className="font-medium text-text">What is excluded</dt>
              <dd className="mt-1 text-muted">Drafts and archived historical records are excluded from every count.</dd>
            </div>
          </dl>
          </details>
        </section>

        <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-24">
          <h2 id="projects-heading" className="text-2xl font-semibold text-text">
            Software, data &amp; evaluation view
          </h2>
          <p className="mt-3 max-w-3xl text-[0.9375rem] text-muted">
            Each kind of artifact is compared on its own checklist. Status is shown with an icon and text; Unknown means unassessed or insufficient
            evidence.
          </p>
          <div className="mt-6 grid gap-10">
            {PROJECT_GROUPS.map((group) => {
              const items = catalog.artifacts.filter((a) => group.kinds.includes(a.kind));
              if (items.length === 0) return null;
              const columns = checklistColumnsFor(group.kinds);
              return (
                <details key={group.key} className="card p-4">
                  <summary className="cursor-pointer text-lg font-semibold text-text">
                    {group.label} <span className="meta">({items.length})</span>
                  </summary>
                  <div className="table-scroll mt-3" tabIndex={0} role="region" aria-label={`${group.label} comparison table`}>
                    <table className="data-table">
                      <caption className="sr-only">{group.label}: public-materials checklist comparison</caption>
                      <thead>
                        <tr>
                          <th scope="col" className="sticky-col min-w-[11rem]">
                            Name
                          </th>
                          <th scope="col" className="min-w-[9rem]">
                            Maintainer
                          </th>
                          <th scope="col">Availability</th>
                          <th scope="col" className="min-w-[8rem]">
                            License
                          </th>
                          {columns.map((c) => (
                            <th key={c.key} scope="col" className="min-w-[8rem]">
                              {c.label}
                            </th>
                          ))}
                          <th scope="col">Reviewed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((a) => (
                          <tr key={a.slug} data-artifact={a.slug}>
                            <th scope="row" className="sticky-col font-medium">
                              <Link prefetch={false} href={artifactHref(a.slug)} className="link">
                                {a.name}
                              </Link>
                            </th>
                            <td className="text-muted">{a.maintainers.map((m) => m.name).join(", ")}</td>
                            <td>
                              <StatusBadge status={a.availability.status} />
                            </td>
                            <td className="text-muted">{[...new Set(a.licenses.map((l) => l.spdx ?? l.name))].join(", ") || "Not recorded"}</td>
                            {columns.map((c) => (
                              <td key={c.key}>
                                <StatusBadge status={(a.checklist[c.key]?.status ?? "unknown") as AvailabilityStatus} label={c.label} />
                              </td>
                            ))}
                            <td className="meta whitespace-nowrap">{formatDate(a.last_reviewed)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <section id="coverage" aria-labelledby="coverage-heading" className="scroll-mt-24">
          <h2 id="coverage-heading" className="text-2xl font-semibold text-text">
            Catalog coverage
          </h2>
          <p className="mt-3 max-w-3xl text-[0.9375rem] text-muted">
            Totals of published records. Organization records include research units and subsidiaries, which are also shown separately so a parent and
            its unit are never presented as two independent companies. Model families are counted separately from releases.
          </p>
          <div className="mt-6 max-w-3xl">
            <CoverageTable rows={coverage} caption="Catalog coverage totals. Each number links to the records it counts." />
          </div>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
