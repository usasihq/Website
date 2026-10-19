import Link from "@/components/Link";
import { formatDate } from "@/lib/dates";
import { displayLocation } from "@/lib/jobs/geo";
import { kUsd, MIN_PAY_LISTINGS, PAY_INDEX, PAY_TABLE_ROWS, pct, type PayGroup } from "@/lib/jobs/pay";
import { asset } from "@/lib/paths";

const n = (v: number) => v.toLocaleString("en-US");
const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

/** The headline figures for one group: listings with pay, median, middle range, and remote share. */
export function PayFigures({ group, idPrefix = "pay" }: { group: PayGroup; idPrefix?: string }) {
  const s = group.stats;
  return (
    <dl className="mt-4 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4" data-testid={`${idPrefix}-figures`}>
      <div className="card p-4">
        <dt className="text-sm text-muted">Listings with disclosed pay</dt>
        <dd className="mt-1 text-2xl font-semibold text-text">{n(s.count)}</dd>
        <dd className="text-xs text-muted">of {n(s.listings)} current listings</dd>
      </div>
      <div className="card p-4">
        <dt className="text-sm text-muted">Median of range midpoints</dt>
        <dd className="mt-1 text-2xl font-semibold text-text" data-testid={`${idPrefix}-median`}>
          {kUsd(s.median)}
        </dd>
        <dd className="text-xs text-muted">a year, base pay</dd>
      </div>
      <div className="card p-4">
        <dt className="text-sm text-muted">Middle range (25th–75th percentile)</dt>
        <dd className="mt-1 text-2xl font-semibold text-text">
          {kUsd(s.p25)}–{kUsd(s.p75)}
        </dd>
        <dd className="text-xs text-muted">half of the midpoints fall here</dd>
      </div>
      <div className="card p-4">
        <dt className="text-sm text-muted">Remote</dt>
        <dd className="mt-1 text-2xl font-semibold text-text">{pct(s.remote, s.count)}</dd>
        <dd className="text-xs text-muted">{n(s.remote)} of the listings with pay</dd>
      </div>
    </dl>
  );
}

/** How the figures are computed and what they are not. */
export function PayMethod({ compact = false }: { compact?: boolean }) {
  return (
    <div className="max-w-3xl space-y-2 text-sm text-muted" data-testid="pay-method">
      <p>
        <strong className="text-text">Method.</strong> Only pay employers disclose: the yearly U.S.-dollar base range in the employer&rsquo;s job feed, or, when the
        feed gives none, a range stated in the employer&rsquo;s own job description (labelled &ldquo;description&rdquo;). Each listing counts once, at the midpoint
        of its range (a listing with several location tiers spans its lowest to its highest figure). The median and the middle range (25th to 75th percentile)
        are of those midpoints. Listings are the current ones in the Jobs directory&rsquo;s default view: a U.S. location, or no location that can be read.
      </p>
      {compact ? null : (
        <p>
          <strong className="text-text">Left out.</strong> Hourly, monthly, open-ended (&ldquo;up to&rdquo;), and non-dollar pay; ranges the employer labels as on-target earnings
          (base plus commission), bonus, equity, or total compensation; ranges with a
          lower end under $10,000 or an upper end over $2,000,000 a year (not plausible as a yearly base). Nothing is converted, annualized, or estimated. A group
          is shown only with at least {MIN_PAY_LISTINGS} listings with pay.
        </p>
      )}
      <p>
        <strong className="text-text">Caveats.</strong> Posted ranges are what employers advertise, not what anyone is paid; many employers (and many states) post
        wide ranges, and listings without pay are not represented. Sales roles often state on-target earnings (base plus commission) without
        labelling them, so their figures may include commission. Role groups come from title rules, not job descriptions. There is no trend yet: USASI keeps no
        history of listings or pay, so each figure is for the listings current when this page was built.
      </p>
    </div>
  );
}

/** The listings behind a group's figures, highest midpoint first. */
export function PayTable({ group, limit = PAY_TABLE_ROWS, caption }: { group: PayGroup; limit?: number; caption: string }) {
  const rows = group.stats.rows.slice(0, limit);
  const hidden = group.stats.rows.length - rows.length;
  const showEmployer = group.kind !== "employer";
  return (
    <>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label={caption}>
        <table className="w-full min-w-[40rem] text-left text-sm" data-testid="pay-table">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-fog/60 text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                Job
              </th>
              {showEmployer ? (
                <th scope="col" className="px-3 py-2 font-medium">
                  Employer
                </th>
              ) : null}
              <th scope="col" className="px-3 py-2 font-medium">
                Location
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Yearly range
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Midpoint
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Pay from
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.job.id}>
                <td className="px-3 py-2 text-text [overflow-wrap:anywhere]">
                  {r.path ? (
                    <a href={asset(r.path)} className="link">
                      {r.job.title}
                    </a>
                  ) : (
                    r.job.title
                  )}
                </td>
                {showEmployer ? <td className="px-3 py-2 text-muted">{r.job.organization_name}</td> : null}
                <td className="px-3 py-2 text-muted [overflow-wrap:anywhere]">
                  {r.remote ? "Remote" : r.job.locations.length ? displayLocation(r.job.locations[0]) : "Not stated"}
                  {r.job.locations.length > 1 ? ` +${r.job.locations.length - 1}` : ""}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-text">
                  {usd(r.range.min)}–{usd(r.range.max)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-text">{kUsd(r.range.mid)}</td>
                <td className="px-3 py-2 text-muted">{r.range.source === "employer-description" ? "Description" : "Feed"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">
        {hidden > 0 ? `Showing the ${n(rows.length)} highest midpoints of ${n(group.stats.rows.length)}. ` : `All ${n(rows.length)} listings with pay. `}
        <Link prefetch={false} href={group.directoryHref} className="link">
          Every listing with pay in the Jobs directory
        </Link>{" "}
        (the directory&rsquo;s &ldquo;shows pay&rdquo; also includes hourly and other pay).
      </p>
    </>
  );
}

/** The pay section of an employer's jobs page (only with at least MIN_PAY_LISTINGS listings with pay). */
export function EmployerPaySection({ group, name }: { group: PayGroup; name: string }) {
  const s = group.stats;
  return (
    <section id="pay" aria-labelledby="pay-heading" className="mt-12 scroll-mt-24" data-testid="employer-pay">
      <h2 id="pay-heading" className="text-xl font-semibold text-text sm:text-2xl">
        Pay at {name}, from disclosed ranges
      </h2>
      <p className="mt-2 max-w-3xl text-muted">
        {n(s.count)} of {name}&rsquo;s {n(s.listings)} current listings with a U.S. or unstated location disclose a yearly U.S.-dollar base range
        {s.fromDescription ? ` (${n(s.fromDescription)} of them stated only in the job description)` : ""}. Listings last checked{" "}
        {s.lastChecked ? formatDate(s.lastChecked.slice(0, 10)) : "not yet"}.
      </p>
      <PayFigures group={group} idPrefix="employer-pay" />
      <details className="mt-4 max-w-3xl">
        <summary className="min-h-11 cursor-pointer text-ice">How these figures are computed</summary>
        <div className="mt-2">
          <PayMethod compact />
        </div>
      </details>
      <PayTable group={group} limit={50} caption={`${name} listings with disclosed pay, highest midpoint first`} />
      <p className="mt-2 text-sm">
        <Link prefetch={false} href={PAY_INDEX} className="link">
          Compare pay across AI employers and roles
        </Link>
      </p>
    </section>
  );
}
