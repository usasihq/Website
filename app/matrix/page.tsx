import Link from "next/link";
import { Monogram, StatusBadge } from "@/components/Badges";
import { CoverageTable } from "@/components/CoverageTable";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { buildCoverage, buildModelMatrix, checklistColumnsFor, MODEL_COLUMNS, PROJECT_GROUPS, type MatrixCell } from "@/lib/matrix";
import { pageMetadata } from "@/lib/metadata";
import { RUBRIC_LABEL } from "@/lib/openness";
import { artifactHref, orgHref } from "@/lib/routes";
import type { AvailabilityStatus } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Compare",
  description:
    "Comparison workspace for the USASI catalog: documented hosted products, public-weight model releases, training materials, and software, dataset, and evaluation-tool checklists. Not a leaderboard.",
  path: "/matrix/",
});

const GROUP_LABELS: Record<string, string> = {
  records: "Catalog records",
  tiers: "Tiers — cumulative",
  materials: "Release materials",
  gaps: "Not open-weight or unassessed",
};

function CountLink({ cell, label }: { cell: MatrixCell; label: string }) {
  return (
    <Link prefetch={false}
      href={cell.href}
      className={`inline-flex min-h-8 min-w-8 items-center justify-end rounded px-1 underline-offset-4 hover:underline ${cell.count === 0 ? "text-muted" : "text-ice"}`}
      aria-label={`${cell.count} — ${label}. View the records counted.`}
      data-count={cell.count}
    >
      {cell.count}
    </Link>
  );
}

export default function MatrixPage() {
  const catalog = getCatalog();
  const orgItems = catalog.organizations.map((o) => catalog.toOrgListItem(o));
  const artifactItems = catalog.artifacts.map((a) => catalog.toArtifactListItem(a));
  const hostedIds = Object.fromEntries(catalog.organizations.map((o) => [o.slug, catalog.hostedModelProducts(o).map((p) => p.id)]));
  const rows = buildModelMatrix(orgItems, artifactItems, hostedIds);
  const coverage = buildCoverage(orgItems, artifactItems);
  const groups = MODEL_COLUMNS.reduce<Array<{ group: string; span: number }>>((acc, c) => {
    const last = acc[acc.length - 1];
    if (last && last.group === c.group) last.span += 1;
    else acc.push({ group: c.group, span: 1 });
    return acc;
  }, []);

  return (
    <>
      <PageHeader
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

      <div className="container-page grid gap-16 py-12">
        <section id="models" aria-labelledby="models-heading" className="scroll-mt-24">
          <h2 id="models-heading" className="text-2xl font-semibold text-text">
            Model releases view
          </h2>
          <div className="mt-3 max-w-3xl space-y-3 text-[0.9375rem] text-muted">
            <p>
              Rows are organization records with a documented hosted-model product or at least one model record. <strong className="text-text">Hosted model
              products</strong> come from sourced product records on each organization page (a product indicator, not a release count). All other columns
              count model records in the Open Models &amp; Tools directory.
            </p>
            <p>
              Tier columns use {RUBRIC_LABEL} and are <strong className="text-text">cumulative, so they overlap</strong>: every fully open release is also counted as
              open-stack and open-weight. Do not add them together. A release listing two organizations appears in both rows, so columns are not summed.
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="mt-6 text-muted">No organization records with model products or model records have been published yet.</p>
          ) : (
            <div className="table-scroll mt-6 lg:max-h-[75vh]">
              <table className="data-table">
                <caption className="sr-only">
                  Model releases view: for each organization, counts of documented hosted-model products and of model records by tier and published materials.
                </caption>
                <thead>
                  <tr>
                    <td className="sticky-col" />
                    <th scope="colgroup" className="text-center">
                      Products
                    </th>
                    {groups.map((g) => (
                      <th key={g.group} scope="colgroup" colSpan={g.span} className="border-l border-line text-center">
                        {GROUP_LABELS[g.group]}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th scope="col" className="sticky-col min-w-[12rem]">
                      Organization
                    </th>
                    <th scope="col" className="num min-w-[7rem]">
                      Hosted model products
                    </th>
                    {MODEL_COLUMNS.map((c) => (
                      <th key={c.key} scope="col" className="num min-w-[7rem]" title={c.description}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.org.slug} data-org={row.org.slug}>
                      <th scope="row" className="sticky-col">
                        <span className="flex items-center gap-2">
                          <Monogram text={row.org.logoText} size="sm" />
                          <Link prefetch={false} href={orgHref(row.org.slug)} className="link font-medium">
                            {row.org.name}
                          </Link>
                        </span>
                      </th>
                      <td className="num" data-col="hosted">
                        <CountLink cell={row.hosted} label={`hosted model products documented for ${row.org.name}`} />
                      </td>
                      {MODEL_COLUMNS.map((c) => (
                        <td key={c.key} className="num" data-col={c.key}>
                          <CountLink cell={row.cells[c.key]} label={`${c.label} for ${row.org.name}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                <div key={group.key}>
                  <h3 className="text-lg font-semibold text-text">
                    {group.label} <span className="meta">({items.length})</span>
                  </h3>
                  <div className="table-scroll mt-3">
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
                            <td className="text-muted">{a.licenses.map((l) => l.spdx ?? l.name).join(", ") || "Not recorded"}</td>
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
                </div>
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
