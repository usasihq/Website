import Link from "@/components/Link";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { JobsFreshness } from "@/components/JobsFreshness";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { jobHref } from "@/lib/jobs/job-url";
import { displayLocation } from "@/lib/jobs/geo";
import { asset } from "@/lib/paths";
import { jobsLandingJsonLd } from "@/lib/jobs/jsonld";
import { LISTINGS_SHOWN, MIN_CITY_LISTINGS, stateDisplayName, type LandingPage } from "@/lib/jobs/landing";
import type { LandingLink } from "@/lib/jobs/landing-links";
import { landingPageHref, landingView, pageWindow } from "@/lib/jobs/pagination";
import { layoffHref, layoffStatePage } from "@/lib/jobs/layoffs";
import { stateSlug } from "@/lib/places";
import { ALL_JOB_FILTERS, checkedLabel, DEFAULT_JOB_FILTERS, serializeJobFilters, type JobItem } from "@/lib/jobs/search";
import { isExpressionOfInterest } from "@/lib/jobs/tracks";
import { orgHref } from "@/lib/routes";
import { Rss } from "lucide-react";
import { EmployerPaySection } from "@/components/JobsPay";
import { HiringProcessSection } from "@/components/HiringProcess";
import { hasJobFeed, landingFeedPath } from "@/lib/jobs/feeds";
import type { HiringProcess } from "@/lib/jobs/hiring-process";
import { kUsd, type PayGroup } from "@/lib/jobs/pay";

const n = (v: number) => v.toLocaleString("en-US");
const count = (v: number, one: string, many: string) => `${n(v)} ${v === 1 ? one : many}`;

/** The geography label every page carries, computed from the listings themselves. */
function GeographyNote({ page }: { page: LandingPage }) {
  const g = page.geography;
  if (page.scope === "city") {
    const name = `${page.city!.label}, ${stateDisplayName(page.state!)}`;
    return (
      <p className="mt-5 max-w-3xl text-base text-muted">
        <span className="badge mr-2 border-cyan/45">Location named: {name}</span>
        Every listing here names {name}.{" "}
        {g.alsoElsewhere
          ? `${count(g.alsoElsewhere, "listing also names", "listings also name")} other places, and ${g.outside ? `${count(g.outside, "names", "name")} a place outside the United States` : "none names a place outside the United States"}.`
          : "None names another location."}
      </p>
    );
  }
  if (page.scope === "state") {
    const name = stateDisplayName(page.state!);
    return (
      <p className="mt-5 max-w-3xl text-base text-muted">
        <span className="badge mr-2 border-cyan/45">Location named: {name}</span>
        Every listing here names a location in {name}.{" "}
        {g.alsoElsewhere
          ? `${count(g.alsoElsewhere, "listing also names", "listings also name")} other places, and ${g.outside ? `${count(g.outside, "names", "name")} a place outside the United States` : "none names a place outside the United States"}.`
          : "None names another location."}
      </p>
    );
  }
  if (page.scope === "us-only") {
    return (
      <p className="mt-5 max-w-3xl text-base text-muted">
        <span className="badge mr-2 border-cyan/45">U.S. locations only</span>
        Every listing here names the United States or a U.S. state and no place outside the United States.
      </p>
    );
  }
  return (
    <p className="mt-5 max-w-3xl text-base text-muted">
      <span className="badge mr-2 border-tone-amber/45">
        {g.outside ? "Includes positions outside the United States" : "No positions outside the United States listed today"}
      </span>
      {count(g.usOnly, "listing names", "listings name")} U.S. locations only; {count(g.outside, "names", "name")} a place outside the United States
      {g.outside - g.outsideOnly > 0 ? ` (${n(g.outside - g.outsideOnly)} of them alongside U.S. locations)` : ""}; {count(g.unclear, "names", "name")} no
      country or state that can be read, such as &ldquo;Remote&rdquo; or &ldquo;Hybrid&rdquo;.
    </p>
  );
}

function Listing({ job }: { job: JobItem }) {
  const details = [
    job.workplace !== "unknown" ? `Workplace: ${job.workplace}` : "Workplace type not supplied",
    job.employment_type !== "unknown" ? job.employment_type : null,
  ].filter(Boolean);
  return (
    <li className="card flex h-full flex-col p-4 sm:p-5">
      <h3 className="text-base font-semibold text-text break-words">
        {/* Job pages are plain HTML (scripts/job-pages.ts), so this is an ordinary link, not a client-side route. asset() adds the deployment base path. */}
        <a href={asset(jobHref(job))} className="hover:underline hover:decoration-cyan hover:underline-offset-4">
          {job.title}
          <span className="sr-only"> at {job.organization_name}</span>
        </a>
      </h3>
      {job.source_type === "usajobs" && job.department ? (
        <>
          <p className="mt-1 text-sm font-medium text-text">{job.department}</p>
          <p className="text-sm">
            <Link prefetch={false} href={orgHref(job.organization_slug)} className="link">
              {job.organization_name}
            </Link>
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm">
          <Link prefetch={false} href={orgHref(job.organization_slug)} className="link">
            {job.organization_name}
          </Link>
        </p>
      )}
      {isExpressionOfInterest(job.title) ? (
        <p className="mt-2 text-sm text-ice">The employer&rsquo;s title presents this as a general expression of interest, not a specific vacancy.</p>
      ) : null}
      <p className="mt-2 text-sm text-muted [overflow-wrap:anywhere]">{job.locations.length ? job.locations.map(displayLocation).join(" · ") : "Location not supplied"}</p>
      <p className="mt-1 text-sm text-muted">{details.join(" · ")}</p>
      <p className="mt-auto pt-2 text-xs text-muted">
        {job.posted_at ? (
          <>
            {job.posted_date_kind === "last-published" ? "Last published" : "Published"} <time dateTime={job.posted_at}>{formatDate(job.posted_at.slice(0, 10))}</time> ·{" "}
          </>
        ) : null}
        Last seen <time dateTime={job.last_seen}>{formatDate(job.last_seen.slice(0, 10))}</time>
      </p>
      <p className="mt-2 text-sm">
        <ExternalLink href={job.official_url}>
          {job.source_type === "usajobs" ? "Apply on USAJOBS.gov" : "Apply on the employer\u2019s site"}
          <span className="sr-only">: {job.title} at {job.source_type === "usajobs" && job.department ? job.department : job.organization_name}</span>
        </ExternalLink>
      </p>
    </li>
  );
}


type Props = {
  page: LandingPage;
  others: LandingLink[];
  /** City pages in the page's state (state pages: all of them; city pages: the other ones). */
  cities?: LandingLink[];
  /** The state page, for city pages. */
  parent?: { href: string; label: string } | null;
  /** Other employers' pages (employer pages list them). */
  companies?: LandingLink[];
  /** Role pages this employer has listings on (employer pages list them). */
  roles?: LandingLink[];
  /** Role × state pages (role and state landings list them). */
  roleStates?: LandingLink[];
  /** People profiles tied to this employer (employer pages list them). */
  people?: { href: string; name: string }[];
  peopleHref?: string | null;
  headquartersHref?: string | null;
  headquartersCount?: number;
  /** Employer pages: the pay summary, when the employer has enough listings with pay. Role pages: the role's pay page. */
  pay?: PayGroup | null;
  /** Employer pages: a short, sourced hiring-process note when one exists. */
  hiring?: HiringProcess | null;
};

function PaginationNav({ page }: { page: LandingPage }) {
  if (page.pageCount <= 1) return null;
  const prev = page.pageNumber > 1 ? landingPageHref(page.basePath, page.pageNumber - 1) : null;
  const next = page.pageNumber < page.pageCount ? landingPageHref(page.basePath, page.pageNumber + 1) : null;
  return (
    <nav aria-label="Listing pages" className="mt-6 flex flex-wrap items-center justify-center gap-2" data-testid="landing-pagination">
      {prev ? (
        <Link prefetch={false} href={prev} rel="prev" className="btn btn-secondary">
          Previous
        </Link>
      ) : (
        <span className="btn btn-inactive" aria-disabled="true">Previous</span>
      )}
      {pageWindow(page.pageNumber, page.pageCount).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            prefetch={false}
            href={landingPageHref(page.basePath, item)}
            aria-current={item === page.pageNumber ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm ${item === page.pageNumber ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-cyan"}`}
          >
            {item}
          </Link>
        ),
      )}
      {next ? (
        <Link prefetch={false} href={next} rel="next" className="btn btn-secondary">
          Next
        </Link>
      ) : (
        <span className="btn btn-inactive" aria-disabled="true">Next</span>
      )}
    </nav>
  );
}

export function JobsLanding({ page: raw, others, cities = [], parent = null, companies = [], roles = [], roleStates = [], people = [], peopleHref = null, headquartersHref, headquartersCount, pay = null, hiring = null }: Props) {
  const page = landingView(raw);
  const shown = page.listings.length;
  const from = (page.pageNumber - 1) * LISTINGS_SHOWN + (shown ? 1 : 0);
  const to = (page.pageNumber - 1) * LISTINGS_SHOWN + shown;
  const trail = [
    { href: "/jobs/", label: "Jobs" },
    ...(parent ? [parent] : []),
    { href: page.basePath, label: page.name },
    ...(page.pageNumber > 1 ? [{ href: page.path, label: `Page ${page.pageNumber}` }] : []),
  ];
  const companyHref = (slug: string) => `/jobs/?${serializeJobFilters({ ...(page.filters.state ? DEFAULT_JOB_FILTERS : ALL_JOB_FILTERS), ...page.filters, sort: "newest", company: slug })}`;
  const layoffs = page.kind === "state" && page.state ? layoffStatePage(getCatalog(), stateSlug(page.state)) : undefined;
  // BreadcrumbList comes from PageHeader; CollectionPage / ItemList from jobsLandingJsonLd (never JobPosting).
  return (
    <>
      <JsonLd data={jobsLandingJsonLd(page)} />
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.h1}
        crumbs={trail}
        description={<p>{page.intro}</p>}
      >
        <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="card p-4">
            <dt className="text-sm text-muted">Open listings</dt>
            <dd className="mt-1 text-2xl font-semibold text-text" data-testid="landing-count">
              {n(page.count)}
            </dd>
          </div>
          {page.kind === "company" ? (
            <div className="card p-4">
              <dt className="text-sm text-muted">U.S. locations only</dt>
              <dd className="mt-1 text-2xl font-semibold text-text">{n(page.geography.usOnly)}</dd>
            </div>
          ) : (
            <div className="card p-4">
              <dt className="text-sm text-muted">Employers</dt>
              <dd className="mt-1 text-2xl font-semibold text-text">{n(page.employers.length)}</dd>
            </div>
          )}
          <div className="card col-span-2 p-4 sm:col-span-1">
            <dt className="text-sm text-muted">Listings last checked</dt>
            <dd className="mt-1 text-base font-semibold text-text">
              {page.lastChecked ? <time dateTime={page.lastChecked}>{checkedLabel(page.lastChecked)}</time> : "Not yet checked"}
            </dd>
          </div>
        </dl>
        <GeographyNote page={page} />
        {page.organization?.sourceType === "usajobs" && page.count === 0 && !page.lastChecked ? (
          <p className="mt-5 max-w-3xl rounded-xl border border-line p-4 text-base text-muted" role="note" data-testid="federal-not-collected">
            Federal listings aren&rsquo;t being collected yet: the USAJOBS source needs an API key that hasn&rsquo;t been configured. This page is kept out of search
            engines until it has listings. Search{" "}
            <ExternalLink href="https://www.usajobs.gov/">USAJOBS.gov</ExternalLink> directly for federal AI roles.
          </p>
        ) : null}
        {layoffs ? (
          <p className="mt-5 max-w-3xl text-base text-muted">
            Recent official WARN Act notices in this state:{" "}
            <Link prefetch={false} href={layoffHref(layoffs.meta.code)} className="link">
              layoffs in {layoffs.meta.name} ({n(layoffs.file.notices.length)} notices)
            </Link>
            , with open AI-job counts on that page.
          </p>
        ) : null}
      </PageHeader>

      <div className="container-page py-10 sm:py-12">
        <JobsFreshness asOf={page.buildAt} lastChecked={page.lastChecked} />

        <section id="how-this-list-is-made" aria-labelledby="how-heading" className="max-w-3xl scroll-mt-24">
          <h2 id="how-heading" className="text-xl font-semibold text-text sm:text-2xl">
            How this list is made
          </h2>
          <p className="mt-3 text-muted">{page.rule}</p>
          <p className="mt-3 text-muted">
            {page.kind === "company"
              ? ""
              : page.kind === "role"
                ? "This is a best-effort match on the employer-supplied title, not a reading of the full job description: check the listing. "
                : "This is a best-effort match on what employers supply (title, department, team, and location), not a reading of the full job description: check the listing. "}
            {page.organization?.sourceType === "usajobs"
              ? "Listing data comes from USAJOBS.gov. "
              : "Listings come from employers\u2019 own job feeds and count as current when their feed was checked successfully and the listing was present within the last 48 hours. "}
            {page.organization?.sourceType === "usajobs"
              ? "They count as current when this source was checked successfully and the listing was present within the last 48 hours. "
              : null}
            Counts were computed when this page was built
            {page.oldestChecked && page.lastChecked && page.oldestChecked.slice(0, 10) !== page.lastChecked.slice(0, 10)
              ? `, from checks between ${formatDate(page.oldestChecked.slice(0, 10))} and ${formatDate(page.lastChecked.slice(0, 10))}`
              : ""}
            . USASI does not recruit, endorse employers, or collect applications.{" "}
            <Link href="/methodology/#jobs" className="link">
              Jobs methodology
            </Link>
            .
          </p>
          {page.usOnlyHref && page.scope === "includes-outside" ? (
            <p className="mt-3 text-muted">
              <Link prefetch={false} href={page.usOnlyHref} className="link">
                Show only the {count(page.usOnlyCount, "listing", "listings")} with U.S. locations only
              </Link>{" "}
              in the Jobs directory.
            </p>
          ) : null}
        </section>

        {cities.length || parent ? (
          <nav aria-labelledby="cities-heading" className="mt-12" data-testid="landing-cities">
            <h2 id="cities-heading" className="text-xl font-semibold text-text sm:text-2xl">
              {page.kind === "city" ? `Other cities in ${stateDisplayName(page.state!)}` : `Cities in ${stateDisplayName(page.state!)}`}
            </h2>
            <p className="mt-2 max-w-3xl text-muted">
              {page.kind === "city"
                ? cities.length
                  ? "Other cities in the state with their own page, by number of listings."
                  : "No other city in the state has enough listings for its own page."
                : `Cities with at least ${MIN_CITY_LISTINGS} current listings, by number of listings. A listing that names several cities counts in each.`}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {parent ? (
                <li>
                  <Link prefetch={false} href={parent.href} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                    All of {stateDisplayName(page.state!)}
                  </Link>
                </li>
              ) : null}
              {cities.map((c) => (
                <li key={c.path}>
                  <Link prefetch={false} href={c.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                    {c.name} <span className="text-muted">({n(c.count)})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {page.kind === "company" && page.organization ? (
          <section id="employer" aria-labelledby="employer-heading" className="mt-12 scroll-mt-24" data-testid="landing-employer">
            <h2 id="employer-heading" className="text-xl font-semibold text-text sm:text-2xl">
              About {page.organization.name}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link prefetch={false} href={orgHref(page.organization.slug)} className="link">
                  {page.organization.name}&rsquo;s sourced profile
                </Link>
              </li>
              {page.organization.careersUrl ? (
                <li>
                  <ExternalLink href={page.organization.careersUrl}>Official careers page</ExternalLink>
                </li>
              ) : null}
            </ul>
            {page.departments.length ? (
              <>
                <h3 className="mt-6 text-base font-semibold text-text">{page.organization.sourceType === "usajobs" ? "Agencies" : "Departments"}</h3>
                <p className="mt-1 max-w-3xl text-sm text-muted">
                  {page.organization.sourceType === "usajobs"
                    ? "Hiring agencies as USAJOBS names them, by number of listings. Each opens the directory filtered to that agency."
                    : `As ${page.organization.name} labels them, by number of listings. Each opens the directory filtered to that department.`}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {page.departments.slice(0, 24).map((d) => (
                    <li key={d.name}>
                      <Link prefetch={false} href={d.href} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                        {d.name} <span className="text-muted">({n(d.count)})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        ) : (
          <section id="employers" aria-labelledby="employers-heading" className="mt-12 scroll-mt-24">
            <h2 id="employers-heading" className="text-xl font-semibold text-text sm:text-2xl">
              Employers
            </h2>
            <p className="mt-2 max-w-3xl text-muted">
              {count(page.employers.length, "organization", "organizations")} in the USASI catalog, by number of listings here. Each profile cites its
              sources.
              {headquartersHref && page.state ? (
                <>
                  {" "}
                  Where an organization is headquartered is a different question:{" "}
                  <Link prefetch={false} href={headquartersHref} className="link">
                    {count(headquartersCount ?? 0, "organization", "organizations")} in the catalog are headquartered in {stateDisplayName(page.state)}
                  </Link>
                  .
                </>
              ) : null}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {page.employers.map((e) => (
                <li key={e.slug} className="card flex h-full flex-col p-4">
                  <Link prefetch={false} href={orgHref(e.slug)} className="link font-medium">
                    {e.name}
                  </Link>
                  {e.headquarters ? <span className="mt-1 text-sm text-muted">Headquarters: {e.headquarters}</span> : null}
                  <span className="mt-1 text-sm text-text">{count(e.count, "listing", "listings")} here</span>
                  <Link prefetch={false} href={companyHref(e.slug)} className="link mt-auto pt-2 text-sm">
                    See {e.name}&rsquo;s listings in the directory<span className="sr-only"> for {page.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {people.length && page.organization ? (
          <nav aria-labelledby="people-heading" className="mt-12" data-testid="landing-people">
            <h2 id="people-heading" className="text-xl font-semibold text-text sm:text-2xl">
              People at {page.organization.name}
            </h2>
            <p className="mt-2 max-w-3xl text-muted">
              Sourced profiles in the catalog tied to this employer.
              {peopleHref ? (
                <>
                  {" "}
                  <Link prefetch={false} href={peopleHref} className="link">
                    People at {page.organization.name} ({n(people.length)})
                  </Link>
                </>
              ) : null}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {people.slice(0, 12).map((p) => (
                <li key={p.href}>
                  <Link prefetch={false} href={p.href} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {roleStates.length ? (
          <nav aria-labelledby="role-states-heading" className="mt-12" data-testid="landing-role-states">
            <h2 id="role-states-heading" className="text-xl font-semibold text-text sm:text-2xl">
              {page.kind === "role" ? `${page.name} by state` : page.kind === "state" ? `Roles in ${stateDisplayName(page.state!)}` : "Jobs by role and state"}
            </h2>
            <p className="mt-2 max-w-3xl text-muted">Pages with at least 10 current listings, by number of listings.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {roleStates.map((r) => (
                <li key={r.path}>
                  <Link prefetch={false} href={r.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                    {r.name} <span className="text-muted">({n(r.count)})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {roles.length ? (
          <nav aria-labelledby="roles-heading" className="mt-12" data-testid="landing-roles">
            <h2 id="roles-heading" className="text-xl font-semibold text-text sm:text-2xl">
              Roles at {page.organization?.name}
            </h2>
            <p className="mt-2 max-w-3xl text-muted">Current listings at this employer that match a role page, by number of listings here.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {roles.map((r) => (
                <li key={r.path}>
                  <Link prefetch={false} href={r.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                    {r.name} <span className="text-muted">({n(r.count)})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {pay && page.kind === "company" && page.organization ? <EmployerPaySection group={pay} name={page.organization.name} /> : null}

        {pay && page.kind === "role" ? (
          <p className="mt-12 max-w-3xl rounded-xl border border-line p-4 text-muted" data-testid="landing-pay">
            <strong className="text-text">Pay:</strong> {pay.stats.count.toLocaleString("en-US")} of these listings with a U.S. or unstated location disclose a
            yearly U.S.-dollar base range; the median of their midpoints is {kUsd(pay.stats.median)}.{" "}
            <Link prefetch={false} href={pay.path} className="link">
              {pay.name} pay, with the listings behind it
            </Link>
          </p>
        ) : null}

        {hiring && page.organization ? <HiringProcessSection name={page.organization.name} note={hiring} /> : null}

        <section id="listings" aria-labelledby="listings-heading" className="mt-12 scroll-mt-24">
          <h2 id="listings-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Listings
          </h2>
          <p className="mt-2 max-w-3xl text-muted" data-testid="landing-shown">
            {page.pageCount > 1
              ? `Showing listings ${n(from)}–${n(to)} of ${n(page.count)}, most recently published first. Each title opens the listing’s page, with the employer’s description and a link to apply.`
              : `All ${count(page.count, "listing", "listings")}, most recently published first. Each title opens the listing’s page, with the employer’s description and a link to apply.`}
          </p>
          <p className="mt-3">
            <Link prefetch={false} href={page.directoryHref} className="btn btn-secondary">
              {shown < page.count ? `See all ${n(page.count)} in the Jobs directory` : "Filter these in the Jobs directory"}
            </Link>
          </p>
          {hasJobFeed(page) ? (
            <p className="mt-3 text-sm text-muted" data-testid="landing-feed">
              <a href={asset(landingFeedPath(page))} className="link inline-flex items-center gap-1" type="application/rss+xml">
                <Rss aria-hidden="true" className="h-3.5 w-3.5" />
                Follow this page by RSS
              </a>{" "}
              (the 100 newest listings; no account needed).{" "}
              <Link prefetch={false} href="/feeds/#job-feeds" className="link">
                What RSS is, and every job feed
              </Link>
            </p>
          ) : null}
          {shown ? (
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {page.listings.map((job) => (
                <Listing key={job.id} job={job} />
              ))}
            </ul>
          ) : (
            <div className="card mt-6 p-6 text-muted">
              No current listings match today. This does not mean these employers have no openings; their careers pages list every opening.
            </div>
          )}
          <PaginationNav page={page} />
          {page.pageCount > 1 ? (
            <p className="mt-6">
              <Link prefetch={false} href={page.directoryHref} className="link">
                Filter all {n(page.count)} listings in the Jobs directory
              </Link>
            </p>
          ) : null}
        </section>

        {companies.length ? (
          <nav aria-labelledby="companies-heading" className="mt-12" data-testid="landing-companies">
            <h2 id="companies-heading" className="text-xl font-semibold text-text sm:text-2xl">
              More employers hiring
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {companies.map((c) => (
                <li key={c.path}>
                  <Link prefetch={false} href={c.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                    {c.name.replace(/^Jobs at /, "")} <span className="text-muted">({n(c.count)})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <nav aria-labelledby="more-heading" className="mt-12">
          <h2 id="more-heading" className="text-xl font-semibold text-text sm:text-2xl">
            More job pages
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.path}>
                <Link prefetch={false} href={o.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                  {o.name} <span className="text-muted">({n(o.count)})</span>
                </Link>
              </li>
            ))}
            <li>
              <Link prefetch={false} href="/jobs/" className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                All jobs
              </Link>
            </li>
            {page.related?.map((r) => (
              <li key={r.href}>
                <Link prefetch={false} href={r.href} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
