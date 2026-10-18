import Link from "@/components/Link";
import { JobsSectionNav } from "@/components/JobsSectionNav";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { formatDate } from "@/lib/dates";
import {
  HIRING_INDEX_HREF,
  hiringIndexJsonLd,
  weekLabel,
  type ChangeRow,
  type HiringIndexPage,
  type WarnPairing,
} from "@/lib/jobs/hiring-index";

const n = (v: number) => v.toLocaleString("en-US");
const count = (v: number, one: string, many: string) => `${n(v)} ${v === 1 ? one : many}`;

function signed(delta: number | null): string {
  if (delta === null) return "—";
  if (delta === 0) return "0";
  return `${delta > 0 ? "+" : "−"}${n(Math.abs(delta))}`;
}

function Change({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted">—</span>;
  if (delta === 0) return <span className="text-muted">0</span>;
  return <span className={delta > 0 ? "text-tone-green" : "text-muted"}>{signed(delta)}</span>;
}

function WeekChart({ page }: { page: HiringIndexPage }) {
  const rows = page.weeks.map((w) => ({ key: w.week_start, label: weekLabel(w.week_start), count: w.open_count }));
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div aria-hidden="true" className="rounded-[0.875rem] border border-line bg-surface/70 px-3 pb-3 pt-5 sm:px-4 sm:pb-4" data-testid="hiring-week-chart">
      <div className="flex items-end gap-2">
        <div className="relative h-40 min-w-0 flex-1">
          <span className="absolute inset-x-0 bottom-0 border-t border-line" />
          <div className="absolute inset-0 flex items-end gap-1.5">
            {rows.map((r) => (
              <div key={r.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <span className="mb-1 font-mono text-[0.6875rem] text-muted">{n(r.count)}</span>
                <span className="block w-full max-w-10 rounded-t-[4px] bg-cyan" style={{ height: `${Math.max(4, (100 * r.count) / max)}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5 font-mono text-[0.6875rem] text-muted">
        {rows.map((r) => (
          <span key={r.key} className="min-w-0 flex-1 text-center leading-tight">
            {rows.length === 1 ? r.label : r.label.replace(/, \d{4}$/, "")}
          </span>
        ))}
      </div>
    </div>
  );
}

function CountTable({
  rows,
  caption,
  coldStart,
  nameHeader,
  testId,
}: {
  rows: ChangeRow[];
  caption: string;
  coldStart: boolean;
  nameHeader: string;
  testId: string;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="table-scroll mt-6">
      <table className="data-table" data-testid={testId}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{nameHeader}</th>
            <th scope="col" className="num">
              This week
            </th>
            <th scope="col" className="num">
              {coldStart ? "Change" : "vs last week"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="w-full font-normal text-text">
                <Link prefetch={false} href={r.href} className="link">
                  {r.name}
                </Link>
                <span aria-hidden="true" className="mt-1.5 block h-1.5 w-full rounded-r-[3px] bg-cyan/10">
                  <span className="block h-full rounded-r-[3px] bg-cyan" style={{ width: `${r.count > 0 ? Math.max((100 * r.count) / max, 0.8).toFixed(2) : 0}%` }} />
                </span>
              </th>
              <td className="num whitespace-nowrap">{n(r.count)}</td>
              <td className="num whitespace-nowrap">
                <Change delta={r.delta} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Movers({ title, rows, empty, testId }: { title: string; rows: ChangeRow[]; empty: string; testId: string }) {
  return (
    <section aria-labelledby={`${testId}-heading`} data-testid={testId}>
      <h3 id={`${testId}-heading`} className="text-lg font-semibold text-text">
        {title}
      </h3>
      {rows.length ? (
        <ol className="mt-3 divide-y divide-line">
          {rows.map((r) => (
            <li key={r.key} className="flex items-baseline justify-between gap-3 py-2.5">
              <Link prefetch={false} href={r.href} className="link min-w-0">
                {r.name}
              </Link>
              <span className="shrink-0 font-mono text-sm">
                <Change delta={r.delta} />
                <span className="text-muted"> · {n(r.count)}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-muted">{empty}</p>
      )}
    </section>
  );
}

function WarnTable({ rows, coldStart }: { rows: WarnPairing[]; coldStart: boolean }) {
  return (
    <div className="table-scroll mt-6">
      <table className="data-table" data-testid="hiring-warn">
        <caption className="sr-only">Open AI jobs and recent WARN Act notices by state</caption>
        <thead>
          <tr>
            <th scope="col">State</th>
            <th scope="col" className="num">
              Open AI jobs
            </th>
            <th scope="col" className="num">
              {coldStart ? "Change" : "vs last week"}
            </th>
            <th scope="col" className="num">
              WARN notices
            </th>
            <th scope="col" className="num">
              Employees on filings
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <th scope="row" className="font-medium text-text">
                <Link prefetch={false} href={r.layoffHref} className="link">
                  {r.name}
                </Link>
              </th>
              <td className="num whitespace-nowrap">
                {r.jobsHref ? (
                  <Link prefetch={false} href={r.jobsHref} className="link">
                    {n(r.jobs)}
                  </Link>
                ) : (
                  n(r.jobs)
                )}
              </td>
              <td className="num whitespace-nowrap">
                <Change delta={r.delta} />
              </td>
              <td className="num whitespace-nowrap">{n(r.notices)}</td>
              <td className="num whitespace-nowrap">{r.employees === null ? "—" : n(r.employees)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JobsHiringIndex({ page }: { page: HiringIndexPage }) {
  const employers = page.current?.companies.length ?? 0;
  const states = page.current?.states.length ?? 0;
  return (
    <>
      <JsonLd data={hiringIndexJsonLd(page)} />
      <PageHeader
        eyebrow="Jobs · Weekly index"
        title="AI Hiring Index"
        crumbs={[{ href: "/jobs/", label: "Jobs" }, { href: HIRING_INDEX_HREF, label: "Hiring Index" }]}
        description={
          <p>
            Open AI jobs at U.S. companies and labs, counted each week from employer career pages, shown next to official
            WARN Act layoff notices. Listings are openings, not headcount.
          </p>
        }
      >
        <JobsSectionNav current={HIRING_INDEX_HREF} />
      </PageHeader>
      <div className="container-page py-10 sm:py-12">
        {page.current ? (
          <>
            <p className="max-w-3xl text-muted" data-testid="hiring-summary">
              {page.coldStart
                ? `The index begins the week of ${page.weekLabel}: ${count(page.openCount, "open listing", "open listings")} at ${count(employers, "employer", "employers")}, naming ${count(states, "U.S. state", "U.S. states")}. Week-over-week change starts next week.`
                : `${count(page.openCount, "open listing", "open listings")} the week of ${page.weekLabel} (${signed(page.openDelta)} from the week of ${page.previousLabel}) at ${count(employers, "employer", "employers")}, naming ${count(states, "U.S. state", "U.S. states")}.`}
            </p>
            {page.capturedAt ? (
              <p className="mt-2 text-sm text-muted">
                Latest count {formatDate(page.capturedAt.slice(0, 10))}
                {page.current ? `, ${new Date(page.capturedAt).toISOString().slice(11, 16)} UTC` : ""}.
              </p>
            ) : null}

            <section aria-labelledby="week-heading" className="mt-10">
              <h2 id="week-heading" className="text-xl font-semibold text-text sm:text-2xl">
                Open listings by week
              </h2>
              <p className="mt-2 max-w-3xl text-muted">
                {page.coldStart
                  ? "One week is on file so far. The next refresh in a later week will add the first comparison."
                  : "Each bar is one Monday-to-Sunday week (UTC). A later refresh in the same week updates that bar."}
              </p>
              <div className="mt-6">
                <WeekChart page={page} />
              </div>
            </section>

            <section aria-labelledby="employers-heading" className="mt-14">
              <h2 id="employers-heading" className="text-xl font-semibold text-text sm:text-2xl">
                Employers
              </h2>
              <p className="mt-2 max-w-3xl text-muted">
                {page.coldStart
                  ? "Employers with the most open listings this first week. Change columns stay blank until next week."
                  : "Employers with the most open listings this week, and how that count moved from last week."}{" "}
                Each name opens that employer&rsquo;s jobs page.
              </p>
              <CountTable
                rows={page.companies}
                caption="Open AI listings by employer this week"
                coldStart={page.coldStart}
                nameHeader="Employer"
                testId="hiring-companies"
              />
            </section>

            {page.coldStart ? null : (
              <div className="mt-10 grid gap-10 md:grid-cols-2">
                <Movers
                  title="More listings this week"
                  rows={page.rising}
                  empty="No employer added listings this week."
                  testId="hiring-rising"
                />
                <Movers
                  title="Fewer listings this week"
                  rows={page.fewer}
                  empty="No employer posted fewer listings this week."
                  testId="hiring-fewer"
                />
              </div>
            )}

            <section aria-labelledby="states-heading" className="mt-14">
              <h2 id="states-heading" className="text-xl font-semibold text-text sm:text-2xl">
                U.S. states
              </h2>
              <p className="mt-2 max-w-3xl text-muted">
                A listing counts for a state when the employer-supplied location names that state. One posting can count
                in more than one state. Remote-only or country-only locations are not assigned a state.
              </p>
              <CountTable
                rows={page.states}
                caption="Open AI listings by U.S. state named in the location"
                coldStart={page.coldStart}
                nameHeader="State"
                testId="hiring-states"
              />
            </section>

            {page.coldStart ? null : (
              <div className="mt-10 grid gap-10 md:grid-cols-2">
                <Movers
                  title="States with more listings"
                  rows={page.risingStates}
                  empty="No state gained listings this week."
                  testId="hiring-rising-states"
                />
                <Movers
                  title="States with fewer listings"
                  rows={page.fewerStates}
                  empty="No state had fewer listings this week."
                  testId="hiring-fewer-states"
                />
              </div>
            )}

            <section aria-labelledby="warn-heading" className="mt-14">
              <h2 id="warn-heading" className="text-xl font-semibold text-text sm:text-2xl">
                Next to official layoff notices
              </h2>
              <p className="mt-2 max-w-3xl text-muted">
                Recent WARN Act filings in California, Washington, New York, and Texas sit beside this week&rsquo;s open
                AI-job counts for those states. Notices cover every industry the states publish, not only AI employers.
                Employee figures are what the filing stated.
              </p>
              {page.warn.length ? (
                <WarnTable rows={page.warn} coldStart={page.coldStart} />
              ) : (
                <p className="card mt-6 p-6 text-muted">No recent WARN notices are in this snapshot.</p>
              )}
              <p className="mt-4">
                <Link prefetch={false} href="/jobs/layoffs/" className="link">
                  All WARN Act layoff pages
                </Link>
              </p>
            </section>
          </>
        ) : (
          <p className="card p-6 text-muted" data-testid="hiring-summary">
            The first weekly count will appear after the next Jobs refresh. The page is ready; week-over-week change
            starts the week after that.
          </p>
        )}

        <section aria-labelledby="counted-heading" className="mt-14">
          <h2 id="counted-heading" className="text-xl font-semibold text-text sm:text-2xl">
            How this is counted
          </h2>
          <p className="mt-2 max-w-3xl text-muted">
            Every six hours the Jobs refresh reads each employer&rsquo;s official career feed. This index stores the
            number of <em>open</em> listings per employer and per U.S. state named in a location, then keeps one bucket
            per Monday-to-Sunday week (UTC). A later check in the same week replaces that bucket, so the bar is the
            latest count for the week, not a daily average. Closed or unconfirmed postings are not counted. USASI does
            not collect applications and does not infer layoffs from a falling job count.
          </p>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
