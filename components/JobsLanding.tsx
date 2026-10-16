import Link from "@/components/Link";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { JobsFreshness } from "@/components/JobsFreshness";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { formatDate } from "@/lib/dates";
import { jobHref } from "@/lib/jobs/job-url";
import { asset } from "@/lib/paths";
import { jobsLandingJsonLd } from "@/lib/jobs/jsonld";
import { MIN_CITY_LISTINGS, stateDisplayName, type LandingPage } from "@/lib/jobs/landing";
import type { LandingLink } from "@/lib/jobs/landing-links";
import { checkedLabel, DEFAULT_JOB_FILTERS, serializeJobFilters, type JobItem } from "@/lib/jobs/search";
import { isExpressionOfInterest } from "@/lib/jobs/tracks";
import { orgHref } from "@/lib/routes";

const n = (v: number) => v.toLocaleString("en-US");
const count = (v: number, one: string, many: string) => `${n(v)} ${v === 1 ? one : many}`;

/** The geography label every page carries, computed from the listings themselves. */
function GeographyNote({ page }: { page: LandingPage }) {
  const g = page.geography;
  if (page.scope === "city") {
    const name = `${page.city!.label}, ${stateDisplayName(page.state!)}`;
    return (
      <p className="mt-5 max-w-3xl text-base text-muted">
        <span className="badge mr-2 border-[rgba(76,201,255,0.45)]">Location named: {name}</span>
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
        <span className="badge mr-2 border-[rgba(76,201,255,0.45)]">Location named: {name}</span>
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
        <span className="badge mr-2 border-[rgba(76,201,255,0.45)]">U.S. locations only</span>
        Every listing here names the United States or a U.S. state and no place outside the United States.
      </p>
    );
  }
  return (
    <p className="mt-5 max-w-3xl text-base text-muted">
      <span className="badge mr-2 border-[rgba(255,196,77,0.45)]">
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
      <p className="mt-2 text-sm text-muted [overflow-wrap:anywhere]">{job.locations.length ? job.locations.join(" · ") : "Location not supplied"}</p>
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
  headquartersHref?: string | null;
  headquartersCount?: number;
};

export function JobsLanding({ page, others, cities = [], parent = null, companies = [], roles = [], headquartersHref, headquartersCount }: Props) {
  const shown = page.listings.length;
  const trail = [{ href: "/jobs/", label: "Jobs" }, ...(parent ? [parent] : []), { href: page.path, label: page.name }];
  const companyHref = (slug: string) => `/jobs/?${serializeJobFilters({ ...DEFAULT_JOB_FILTERS, ...page.filters, sort: "newest", company: slug })}`;
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

        <section id="listings" aria-labelledby="listings-heading" className="mt-12 scroll-mt-24">
          <h2 id="listings-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Listings
          </h2>
          <p className="mt-2 max-w-3xl text-muted" data-testid="landing-shown">
            {shown < page.count
              ? `Showing the ${n(shown)} most recently published of ${n(page.count)} listings. Each title opens the listing’s page, with the employer’s description and a link to apply.`
              : `All ${count(page.count, "listing", "listings")}, most recently published first. Each title opens the listing’s page, with the employer’s description and a link to apply.`}
          </p>
          <p className="mt-3">
            <Link prefetch={false} href={page.directoryHref} className="btn btn-secondary">
              {shown < page.count ? `See all ${n(page.count)} in the Jobs directory` : "Filter these in the Jobs directory"}
            </Link>
          </p>
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
          {shown < page.count ? (
            <p className="mt-6">
              <Link prefetch={false} href={page.directoryHref} className="link">
                See all {n(page.count)} listings in the Jobs directory
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
          </ul>
        </nav>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
