import Link from "@/components/Link";
import { ExternalLink } from "@/components/ExternalLink";
import { JobsSectionNav } from "@/components/JobsSectionNav";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { formatDate } from "@/lib/dates";
import { layoffHref, type LayoffStatePage, type LayoffsIndex, type WarnNotice } from "@/lib/jobs/layoffs";

const n = (v: number) => v.toLocaleString("en-US");
const count = (v: number, one: string, many: string) => `${n(v)} ${v === 1 ? one : many}`;

function Sources({ page }: { page: LayoffStatePage | LayoffsIndex }) {
  const states = "states" in page ? page.states : [page];
  const fetched = "dataset" in page ? page.dataset.fetched_at : page.file.fetched_at;
  const collector = "dataset" in page ? page.dataset.collector : { name: "Big Local News warn-scraper", url: "https://github.com/biglocalnews/warn-scraper" };
  return (
    <section aria-labelledby="sources-heading" className="mt-12">
      <h2 id="sources-heading" className="text-xl font-semibold text-text sm:text-2xl">
        Sources
      </h2>
      <p className="mt-2 max-w-3xl text-muted">
        Every notice is an official WARN Act filing. Collection uses{" "}
        <ExternalLink href={collector.url}>{collector.name}</ExternalLink>
        , which reads the state labor-department lists below. USASI does not invent notices or employee counts. Snapshot{" "}
        {formatDate(fetched.slice(0, 10))}.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {states.map((s) => (
          <li key={s.meta.code}>
            <ExternalLink href={s.file.source_url}>{s.file.source_name}</ExternalLink>
            <span className="text-muted"> — official {s.meta.name} WARN list</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function JobLinks({ page }: { page: LayoffStatePage }) {
  return (
    <nav aria-labelledby="nearby-jobs-heading" className="mt-10" data-testid="layoff-jobs">
      <h2 id="nearby-jobs-heading" className="text-xl font-semibold text-text sm:text-2xl">
        Open AI jobs nearby
      </h2>
      <p className="mt-2 max-w-3xl text-muted">
        These are current listings in the USASI catalog whose employer-supplied location names {page.meta.name} or a city
        that also appears in a recent notice. Counts are open AI jobs, not layoff headcounts.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {page.jobState ? (
          <li>
            <Link prefetch={false} href={page.jobState.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
              Jobs in {page.jobState.name} <span className="text-muted">({n(page.jobState.count)})</span>
            </Link>
          </li>
        ) : null}
        {page.jobCities.map((c) => (
          <li key={c.path}>
            <Link prefetch={false} href={c.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
              Jobs in {c.name} <span className="text-muted">({n(c.count)})</span>
            </Link>
          </li>
        ))}
      </ul>
      {!page.jobState && page.jobCities.length === 0 ? (
        <p className="mt-3 text-muted">No state or city job page currently meets the catalog&rsquo;s listing threshold for this geography.</p>
      ) : null}
    </nav>
  );
}

function NoticeTable({ notices, caption }: { notices: WarnNotice[]; caption: string }) {
  return (
    <div className="table-scroll mt-6">
      <table className="data-table" data-testid="layoff-notices">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">City</th>
            <th scope="col">Date</th>
            <th scope="col" className="num">
              Count
            </th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => (
            <tr key={notice.id}>
              <th scope="row" className="font-medium text-text">
                {notice.company}
              </th>
              <td>{notice.city || "Not stated"}</td>
              <td className="whitespace-nowrap">{notice.notice_date ? formatDate(notice.notice_date) : "Not stated"}</td>
              <td className="num">{notice.employees === null ? "—" : n(notice.employees)}</td>
              <td>
                <ExternalLink href={notice.source_url}>Official filing list</ExternalLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JobsLayoffsIndex({ index }: { index: LayoffsIndex }) {
  const total = index.states.reduce((sum, s) => sum + s.file.notices.length, 0);
  return (
    <>
      <PageHeader
        eyebrow="Jobs · WARN Act"
        title="Layoffs and nearby AI jobs"
        crumbs={[{ href: "/jobs/", label: "Jobs" }, { href: "/jobs/layoffs/", label: "Layoffs" }]}
        description={
          <p>
            Recent official WARN Act notices of plant closings and mass layoffs in California, Washington, New York, and
            Texas, next to open AI jobs in those places from the USASI catalog. Notices cover every industry the states
            publish, not only AI employers.
          </p>
        }
      >
        <JobsSectionNav current="/jobs/layoffs/" />
      </PageHeader>
      <div className="container-page py-10 sm:py-12">
        <p className="max-w-3xl text-muted">
          {total
            ? `${count(total, "recent notice", "recent notices")} across ${count(index.states.length, "state", "states")}. Each state page lists company, city, date, employee count, and a link to the official list.`
            : "No recent notices are in this snapshot. A failed fetch keeps the last successful state file or skips that state."}
        </p>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {index.states.map((s) => (
            <li key={s.meta.code} className="card flex h-full flex-col p-5">
              <Link prefetch={false} href={layoffHref(s.meta.code)} className="link text-lg font-semibold">
                {s.meta.name}
              </Link>
              <p className="mt-2 text-muted">
                {count(s.file.notices.length, "recent notice", "recent notices")}
                {s.jobState ? (
                  <>
                    {" · "}
                    <Link prefetch={false} href={s.jobState.path} className="link">
                      {count(s.jobState.count, "open AI job", "open AI jobs")} in {s.meta.name}
                    </Link>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link prefetch={false} href="/jobs/index/" className="link">
            Weekly AI Hiring Index
          </Link>
          <span className="text-muted"> — open listings by employer and state, week over week</span>
        </p>
        <Sources page={index} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}

export function JobsLayoffsState({ page }: { page: LayoffStatePage }) {
  return (
    <>
      <PageHeader
        eyebrow={`Jobs · WARN Act · ${page.meta.code}`}
        title={`Layoffs in ${page.meta.name}`}
        crumbs={[
          { href: "/jobs/", label: "Jobs" },
          { href: "/jobs/layoffs/", label: "Layoffs" },
          { href: layoffHref(page.meta.code), label: page.meta.name },
        ]}
        description={
          <p>
            {count(page.file.notices.length, "recent official WARN Act notice", "recent official WARN Act notices")} in{" "}
            {page.meta.name}, as published by the {page.file.source_name}. Employee counts are the figures on the filing,
            not USASI estimates.
          </p>
        }
      />
      <div className="container-page py-10 sm:py-12">
        <JobLinks page={page} />
        <section aria-labelledby="notices-heading" className="mt-12">
          <h2 id="notices-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Recent notices
          </h2>
          <p className="mt-2 max-w-3xl text-muted">Newest filing date first. A missing city or count means the state list did not supply one.</p>
          {page.file.notices.length ? (
            <NoticeTable notices={page.file.notices} caption={`WARN Act notices in ${page.meta.name}`} />
          ) : (
            <p className="card mt-6 p-6 text-muted">No recent notices are in this snapshot for {page.meta.name}.</p>
          )}
        </section>
        <Sources page={page} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
