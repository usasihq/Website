import Link from "@/components/Link";
import { Download, History, Info } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/lib/dates";
import { absoluteUrl, asset } from "@/lib/paths";
import { POLICY_STATUS_LABELS, POLICY_TYPE_LABELS } from "@/lib/policy";
import {
  compareFigures,
  editionDataHref,
  editionHref,
  editionLabel,
  nextEdition,
  hasChanges,
  REPORT_HREF,
  REPORT_NAME,
  REPORT_SECTIONS,
  type FigureComparison,
  type ReportSectionId,
  type ReportSnapshot,
} from "@/lib/report";
import type { ReportHref, SinceEdition } from "@/lib/report-editions";
import { citations, shareLinks } from "@/lib/share";
import type { PolicyDocumentType } from "@/lib/schema";
import { siteConfig } from "@/lib/site-config";
import { ReportFigure } from "./ReportFigure";

const nf = (v: number) => v.toLocaleString("en-US");
const timeUtc = (iso: string) => `${formatDate(iso.slice(0, 10))}, ${iso.slice(11, 16)} UTC`;

export type ReportNames = { organization: (slug: string) => string | null; artifact: (slug: string) => string | null; finder: (slug: string) => string | null };

/** The citation for an edition: always its permanent address and its publication date. */
export function editionCitations(s: ReportSnapshot) {
  return citations({ title: s.title, url: absoluteUrl(editionHref(s.edition)), date: s.published, key: `report_${s.edition}` });
}

/** The answer-first opening paragraph, also used (shortened) for the page description. */
export function editionSummary(s: ReportSnapshot): string {
  const t = (k: string) => nf(s.totals.find((x) => x.key === k)?.value ?? 0);
  const jobs = s.totals.some((x) => x.key === "job_listings") ? `, and a snapshot of ${t("job_listings")} job listings from employers' own feeds` : "";
  return `This edition counts what the USASI catalog recorded on ${formatDate(s.data_cutoff)}: ${t("organizations")} organization records, ${t("artifacts")} Open Models & Tools records (${t("model_releases")} of them model releases), ${t("finder_configurations")} documented configurations for using AI, ${t("policy_documents")} federal AI policy documents${jobs}. Every figure is computed from those records. Coverage is selective, so the numbers describe this catalog, not the whole field.`;
}

export function ReportEdition({
  snapshot: s,
  previous,
  latest,
  since,
  hrefFor,
  policyHrefFor,
  names,
  onLatestPage,
}: {
  snapshot: ReportSnapshot;
  previous: ReportSnapshot | undefined;
  latest: ReportSnapshot;
  since: SinceEdition;
  hrefFor: ReportHref;
  policyHrefFor: (slug: string) => string | null;
  names: ReportNames;
  /** Rendered at /report/ (the latest edition) rather than at its permanent address. */
  onLatestPage: boolean;
}) {
  const total = (k: string) => s.totals.find((x) => x.key === k)?.value ?? 0;
  const tablesIn = (section: ReportSectionId) => s.tables.filter((t) => t.section === section);
  const sections = REPORT_SECTIONS.filter((sec) => tablesIn(sec.id).length > 0);
  const permanent = editionHref(s.edition);
  const cite = editionCitations(s);
  const crumbs = onLatestPage ? [{ href: REPORT_HREF, label: REPORT_NAME }] : [{ href: REPORT_HREF, label: REPORT_NAME }, { href: permanent, label: editionLabel(s.edition) }];
  const intro: Record<ReportSectionId, React.ReactNode> = {
    organizations: (
      <p>
        <Link href="/companies/" className="link">Companies &amp; Labs</Link> holds {nf(total("organizations"))} organization records: companies, labs, universities,
        nonprofits, and public institutions with a documented U.S. basis under the <Link href="/methodology/#eligibility" className="link">eligibility rules</Link>.{" "}
        {nf(total("organization_units"))} of them are units of another organization in the catalog. <Link href="/places/" className="link">Places</Link> maps them by the state
        in their headquarters label.
      </p>
    ),
    artifacts: (
      <p>
        <Link href="/open/" className="link">Open Models &amp; Tools</Link> holds {nf(total("artifacts"))} records. Each model release carries its own license and
        public-materials checklist, and its openness tier is computed with the <Link href="/methodology/#tiers" className="link">published rubric</Link>. Open-weight means
        the weights can be downloaded; it does not mean the terms allow every use.
      </p>
    ),
    licenses: (
      <p>
        What the recorded license of each release or project is, grouped by family and by license. The <Link href="/licenses/" className="link">license guides</Link> restate
        each license&apos;s key terms in plain language. Non-commercial terms are the only commercial-use restriction this report counts, because it is the only one the
        catalog records in a structured way; custom licenses may set other conditions on use. This is a count of recorded licenses, not legal advice: read each license before
        relying on it.
      </p>
    ),
    local: (
      <p>
        The <Link href="/find/" className="link">finder</Link> lists documented ways to use AI, each with requirements restated from the publisher. <Link href="/find/memory/" className="link">Local AI by memory</Link>{" "}
        lists the local ones that fit a given amount of graphics or unified memory.
      </p>
    ),
    jobs: (
      <p>
        A frozen snapshot of job listings from employers&apos; own feeds as last checked{" "}
        {s.jobs_checked_at ? timeUtc(s.jobs_checked_at) : "before the cutoff"}. USASI no longer publishes a live job board; these figures stay as this edition recorded them. See the{" "}
        <Link href="/methodology/#jobs" className="link">jobs note in the methodology</Link>.
      </p>
    ),
    policy: (
      <p>
        The <Link href="/policy/" className="link">policy tracker</Link> records U.S. federal AI laws, executive orders, memoranda, standards, and plans from their official
        text. Each document has its own page with its summary, status, and sources.
      </p>
    ),
  };

  return (
    <>
      <PageHeader
        eyebrow={`Research report · ${editionLabel(s.edition)} edition`}
        title={s.title}
        crumbs={crumbs}
        description={<p data-testid="report-summary">{editionSummary(s)}</p>}
      >
        <dl className="mt-6 grid max-w-3xl gap-x-6 gap-y-2 text-[0.9375rem] sm:grid-cols-[auto_1fr]" data-testid="report-meta">
          <dt className="text-muted">Data cutoff</dt>
          <dd className="text-text">
            {formatDate(s.data_cutoff)} <span className="text-muted">(catalog as published that day)</span>
          </dd>
          <dt className="text-muted">Published</dt>
          <dd className="text-text">{formatDate(s.published)}</dd>
          {s.edition === latest.edition ? (
            <>
              <dt className="text-muted">Next edition</dt>
              <dd className="text-text" data-testid="report-next">
                Early {editionLabel(nextEdition(s.edition))} <span className="text-muted">(a new edition is published each month)</span>
              </dd>
            </>
          ) : null}
          <dt className="text-muted">Permanent link</dt>
          <dd className="min-w-0 break-words">
            <Link href={permanent} className="link">
              {absoluteUrl(permanent).replace(/^https?:\/\//, "")}
            </Link>
          </dd>
          <dt className="text-muted">Data</dt>
          <dd className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={asset(editionDataHref(s.edition, "csv"))} className="link" download>
              CSV
            </a>
            <a href={asset(editionDataHref(s.edition, "json"))} className="link" download>
              JSON
            </a>
            <span className="text-muted">
              <a href={s.license.url} className="link" rel="license noopener noreferrer">
                {s.license.name}
              </a>
            </span>
          </dd>
        </dl>
      </PageHeader>

      <div className="container-page grid gap-12 py-10">
        {s.edition !== latest.edition ? (
          <p className="card flex max-w-3xl items-start gap-3 p-4 text-[0.9375rem] text-muted" data-testid="report-newer">
            <History aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-cyan" />
            <span>
              This is the {editionLabel(s.edition)} edition, kept as published. The latest is{" "}
              <Link href={editionHref(latest.edition)} className="link">
                {latest.title}
              </Link>
              .
            </span>
          </p>
        ) : null}
        <SinceNote snapshot={s} since={since} names={names} />

        <section aria-labelledby="findings-heading" className="max-w-3xl">
          <h2 id="findings-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Headline findings
          </h2>
          <ol className="mt-4 grid gap-4" data-testid="report-findings">
            {s.findings.map((f) => (
              <li key={f.id} className="card p-4" data-finding={f.id}>
                <p className="font-medium text-text">{f.text}</p>
                <p className="mt-1 text-sm text-muted">
                  <span className="text-ice">Definition:</span> {f.definition}{" "}
                  <a href={`#fig-${f.table}`} className="link whitespace-nowrap">
                    See the figure
                  </a>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <nav aria-label="In this report" className="max-w-3xl">
          <h2 className="eyebrow">In this report</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {[...sections.map((sec) => ({ id: sec.id, title: sec.title })), { id: "changes", title: "What changed" }, { id: "methodology", title: "Methodology and limits" }, { id: "cite", title: "Cite and download" }].map(
              (x) => (
                <li key={x.id}>
                  <a href={`#${x.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-text hover:border-cyan">
                    {x.title}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        {sections.map((sec) => (
          <section key={sec.id} id={sec.id} aria-labelledby={`${sec.id}-heading`} className="scroll-mt-24 border-t border-line pt-10" data-report-section={sec.id}>
            <h2 id={`${sec.id}-heading`} className="text-2xl font-semibold text-text">
              {sec.title}
            </h2>
            <div className="mt-2 max-w-3xl text-muted">{intro[sec.id]}</div>
            <div className="mt-8 grid gap-x-10 gap-y-12 lg:grid-cols-2">
              {tablesIn(sec.id).map((t) => (
                <ReportFigure key={t.id} table={t} hrefFor={hrefFor} wide={Boolean(t.series)} />
              ))}
              {sec.id === "policy" ? <PolicyList snapshot={s} policyHrefFor={policyHrefFor} /> : null}
            </div>
          </section>
        ))}

        <section id="changes" aria-labelledby="changes-heading" className="max-w-3xl scroll-mt-24 border-t border-line pt-10">
          <h2 id="changes-heading" className="text-2xl font-semibold text-text">
            What changed since the previous edition
          </h2>
          {previous ? (
            <ChangeList comparison={compareFigures(previous, s)} names={names} intro={`Compared with the ${editionLabel(previous.edition)} edition (data cutoff ${formatDate(previous.data_cutoff)}).`} />
          ) : (
            <p className="mt-3 text-muted" data-testid="report-baseline">
              This is the first edition, so it is the baseline: there is no earlier edition to compare with. From the next edition on, this section lists the records added and
              removed since the previous edition and every catalog figure that changed. Jobs figures are not compared, because each edition freezes its own snapshot of a
              directory that changes daily.
            </p>
          )}
        </section>

        <section id="methodology" aria-labelledby="methodology-heading" className="max-w-3xl scroll-mt-24 border-t border-line pt-10">
          <h2 id="methodology-heading" className="text-2xl font-semibold text-text">
            Methodology and limits
          </h2>
          <ul className="mt-4 grid list-disc gap-3 pl-5 text-muted marker:text-cyan">
            <li>
              <strong className="text-text">Selective coverage, not a census.</strong> The catalog includes organizations and artifacts that editors have researched and could
              verify from sources. Many U.S. organizations and releases are not in it yet, so a count here describes records in this catalog, never the country or an industry,
              and no figure is a ranking or a measure of capability.
            </li>
            <li>
              <strong className="text-text">What is counted.</strong> Only published records whose U.S. eligibility is documented. Drafts, records under review, and archived
              records are excluded. Organization records include research units and subsidiaries, counted separately as units. A model family is an overview record; each
              assessed release is its own record. See <Link href="/methodology/#counts" className="link">how counts work</Link>.
            </li>
            <li>
              <strong className="text-text">Definitions.</strong> Openness tiers, weight availability, and checklists follow the{" "}
              <Link href="/methodology/#tiers" className="link">openness rubric</Link> (v{s.inputs.rubric_version}). License families and every other rule are stated under
              each figure, in &ldquo;How this is counted.&rdquo; Unknown stays unknown: a missing date, figure, or license is counted as not recorded, never estimated.
            </li>
            <li>
              <strong className="text-text">Data cutoff.</strong> Catalog figures use the records as published on {formatDate(s.data_cutoff)}. Jobs figures use the job
              listings that were current at {timeUtc(s.generated_at)}: open in the employer&apos;s own feed and confirmed within the previous 48 hours.
            </li>
            <li>
              <strong className="text-text">Frozen editions.</strong> The figures were computed once and saved with the text that defines them; later corrections and new
              records appear in the next edition and in the note at the top of this page, never by rewriting this one. Links in the tables open the current pages, which may
              have changed since.
            </li>
            <li>
              <strong className="text-text">Reproducible.</strong> The data file records the catalog commit ({s.inputs.git_commit ? <code className="font-mono text-[0.8125rem] text-ice">{s.inputs.git_commit.slice(0, 12)}</code> : "not recorded"}),
              a digest of the records read, and a digest of the jobs data. Running <code className="font-mono text-[0.8125rem] text-ice">npm run report:snapshot</code> on that
              catalog reproduces the catalog figures; the jobs data are refreshed daily and are kept only as frozen counts.
            </li>
          </ul>
        </section>

        <section id="cite" aria-labelledby="cite-heading" className="max-w-3xl scroll-mt-24 border-t border-line pt-10">
          <h2 id="cite-heading" className="text-2xl font-semibold text-text">
            Cite and download
          </h2>
          <p className="mt-3 text-muted">
            Cite the edition by its permanent address, so readers see the figures you saw. Text and figures are {s.license.name}; please credit &ldquo;USASI, {s.title}&rdquo;
            with a link. See <Link href="/reuse/" className="link">Data and reuse</Link> for the catalog&apos;s other files.
          </p>
          <div className="mt-5 grid gap-4">
            <CitationBlock label="APA style" text={cite.apa} />
            <CitationBlock label="BibTeX" text={cite.bibtex} />
          </div>
          <h3 className="mt-8 text-lg font-semibold text-text">This edition&apos;s data</h3>
          <ul className="mt-3 grid gap-3">
            <li className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <span>
                <span className="block font-medium text-text">CSV, one row per figure</span>
                <span className="block text-sm text-muted">Columns: edition, section, table, unit, universe, whether rows overlap, row key and label, count, share.</span>
              </span>
              <a href={asset(editionDataHref(s.edition, "csv"))} className="btn btn-secondary" download>
                <Download aria-hidden="true" className="h-4 w-4" />
                data.csv
              </a>
            </li>
            <li className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <span>
                <span className="block font-medium text-text">JSON, the complete edition</span>
                <span className="block text-sm text-muted">Every figure with its caption and counting note, the findings, the record lists, and the input digests.</span>
              </span>
              <a href={asset(editionDataHref(s.edition, "json"))} className="btn btn-secondary" download>
                <Download aria-hidden="true" className="h-4 w-4" />
                data.json
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted">{s.notice}</p>
          <h3 className="mt-8 text-lg font-semibold text-text">Share</h3>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Share this edition">
            {shareLinks(absoluteUrl(permanent), s.title).map((l) => (
              <li key={l.id}>
                <a href={l.href} className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-text hover:border-cyan" rel="noopener noreferrer">
                  {l.label}
                  <span className="sr-only">{l.id === "email" ? " (opens your email app)" : ` (opens ${l.label})`}</span>
                </a>
              </li>
            ))}
            <li>
              <CopyButton text={absoluteUrl(permanent)} label="Copy link" />
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted">
            {siteConfig.disclaimer} Found an error in a figure? <Link href="/contribute/#corrections" className="link">Report a correction</Link> with the figure and the record
            it concerns.
          </p>
        </section>
      </div>
    </>
  );
}

function CitationBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        <CopyButton text={text} label={`Copy ${label.split(" ")[0]}`} />
      </div>
      <pre tabIndex={0} className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-[var(--field-bg)] p-3 font-mono text-[0.8125rem] text-ice">
        {text}
      </pre>
    </div>
  );
}

function PolicyList({ snapshot, policyHrefFor }: { snapshot: ReportSnapshot; policyHrefFor: (slug: string) => string | null }) {
  const types = (Object.keys(POLICY_TYPE_LABELS) as PolicyDocumentType[]).filter((t) => snapshot.records.policy.some((d) => d.type === t));
  return (
    <section aria-labelledby="policy-documents-heading" className="grid min-w-0 content-start gap-3 lg:col-span-2" data-report-table="policy-documents">
      <h3 id="policy-documents-heading" className="text-lg font-semibold text-text">
        The documents counted
      </h3>
      <p className="text-[0.9375rem] text-muted">Every tracked document in this edition, by type, with its status at the cutoff. Each links to its page.</p>
      <details className="card p-4">
        <summary className="cursor-pointer font-medium text-ice hover:text-strong">Show all {snapshot.records.policy.length} documents</summary>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {types.map((t) => {
            const docs = snapshot.records.policy.filter((d) => d.type === t).sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
            return (
              <div key={t}>
                <h4 className="font-semibold text-text">
                  {POLICY_TYPE_LABELS[t]} <span className="meta">({docs.length})</span>
                </h4>
                <ul className="mt-2 grid gap-1.5 text-[0.9375rem]">
                  {docs.map((d) => {
                    const href = policyHrefFor(d.slug);
                    return (
                      <li key={d.slug}>
                        {href ? (
                          <Link prefetch={false} href={href} className="link">
                            {d.name}
                          </Link>
                        ) : (
                          <span className="text-text">{d.name}</span>
                        )}{" "}
                        <span className="text-sm text-muted">
                          · {POLICY_STATUS_LABELS[d.status]} · {formatDate(d.date)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </details>
    </section>
  );
}

function SinceNote({ snapshot, since, names }: { snapshot: ReportSnapshot; since: SinceEdition; names: ReportNames }) {
  if (since.status === "unchanged") return null;
  return (
    <aside aria-labelledby="since-heading" className="card max-w-3xl border-gold/35 p-5" data-testid="report-since">
      <h2 id="since-heading" className="flex items-center gap-2 text-lg font-semibold text-text">
        <Info aria-hidden="true" className="h-5 w-5 text-cyan" />
        Since this edition
      </h2>
      {since.status === "edited" ? (
        <p className="mt-2 text-[0.9375rem] text-muted">
          Records have been edited since the data cutoff ({formatDate(snapshot.data_cutoff)}), but none of this edition&apos;s catalog figures would change. The figures below
          stay as published.
        </p>
      ) : (
        <ChangeList
          comparison={since.comparison}
          names={names}
          intro={`The live catalog has changed since the data cutoff (${formatDate(snapshot.data_cutoff)}). The figures below stay as published; the next edition will include these changes.`}
        />
      )}
      <p className="mt-3 text-sm text-muted">
        Jobs figures are a snapshot and are not compared. USASI no longer publishes a live job board.
      </p>
    </aside>
  );
}

function ChangeList({ comparison: c, names, intro }: { comparison: FigureComparison; names: ReportNames; intro: string }) {
  if (!hasChanges(c)) return <p className="mt-3 text-muted">{intro} No catalog figure or record list changed.</p>;
  const groups = [
    { key: "organizations", label: "Organization records", diff: c.organizations, name: names.organization, href: (slug: string) => `/companies/${slug}/` },
    { key: "artifacts", label: "Open Models & Tools records", diff: c.artifacts, name: names.artifact, href: (slug: string) => `/open/${slug}/` },
    { key: "finder", label: "Documented configurations", diff: c.finder, name: names.finder, href: () => "/find/" },
  ];
  return (
    <div className="mt-3 grid gap-3 text-[0.9375rem] text-muted">
      <p>{intro}</p>
      {c.totals.length ? (
        <ul className="grid gap-1" data-testid="report-changed-totals">
          {c.totals.map((t) => (
            <li key={t.key}>
              <span className="text-text">{t.label}:</span> {nf(t.from)} <span aria-hidden="true">→</span>
              <span className="sr-only">to</span> {nf(t.to)} ({t.to > t.from ? "+" : "−"}
              {nf(Math.abs(t.to - t.from))})
            </li>
          ))}
        </ul>
      ) : null}
      {groups
        .filter((g) => g.diff.added.length || g.diff.removed.length)
        .map((g) => (
          <p key={g.key}>
            <span className="text-text">{g.label}:</span> {nf(g.diff.added.length)} added
            {g.diff.added.length ? (
              <>
                {" ("}
                {g.diff.added.slice(0, 8).map((slug, i) => {
                  const name = g.name(slug);
                  return (
                    <span key={slug}>
                      {i ? ", " : ""}
                      {name ? (
                        <Link prefetch={false} href={g.href(slug)} className="link">
                          {name}
                        </Link>
                      ) : (
                        slug
                      )}
                    </span>
                  );
                })}
                {g.diff.added.length > 8 ? `, and ${nf(g.diff.added.length - 8)} more` : ""}
                {")"}
              </>
            ) : null}
            , {nf(g.diff.removed.length)} no longer published.
          </p>
        ))}
      {c.policy.added.length || c.policy.removed.length ? (
        <p>
          <span className="text-text">Policy documents:</span> {nf(c.policy.added.length)} added, {nf(c.policy.removed.length)} no longer published.
        </p>
      ) : null}
      {c.tables.length ? (
        <p>
          <span className="text-text">Figures with different counts:</span> {c.tables.map((t) => t.title).join("; ")}.
        </p>
      ) : null}
    </div>
  );
}
