import Link from "@/components/Link";
import { JobsSectionNav } from "@/components/JobsSectionNav";
import { PayFigures, PayMethod } from "@/components/JobsPay";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { JsonLd } from "@/components/JsonLd";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { kUsd, MIN_PAY_LISTINGS, PAY_INDEX, payData, pct, type PayGroup } from "@/lib/jobs/pay";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { collectionPage } from "@/lib/structured-data";

const n = (v: number) => v.toLocaleString("en-US");

export function generateMetadata() {
  const d = payData(getCatalog());
  const s = d.all.stats;
  return pageMetadata({
    title: "AI pay: disclosed salary ranges by role and employer",
    description: s.count
      ? `Median and middle range of ${n(s.count)} disclosed yearly base-pay ranges at U.S. AI companies and labs, by role and employer. From employers' own listings.`
      : "Disclosed yearly base-pay ranges at U.S. AI companies and labs, by role and employer, from employers' own listings.",
    path: PAY_INDEX,
    image: socialImages.jobs,
  });
}

function GroupTable({ groups, label, caption }: { groups: PayGroup[]; label: string; caption: string }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line" tabIndex={0} role="region" aria-label={caption}>
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-fog/60 text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">{label}</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Listings with pay</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Median</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Middle range</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Remote</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {groups.map((g) => (
            <tr key={g.slug}>
              <th scope="row" className="px-3 py-2 font-medium text-text">
                <Link prefetch={false} href={g.kind === "employer" ? `${g.path}#pay` : g.path} className="link">
                  {g.name}
                </Link>
              </th>
              <td className="px-3 py-2 text-right tabular-nums text-text">{n(g.stats.count)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-text">{kUsd(g.stats.median)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-text">
                {kUsd(g.stats.p25)}–{kUsd(g.stats.p75)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-muted">{pct(g.stats.remote, g.stats.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function JobsPayPage() {
  const d = payData(getCatalog());
  const s = d.all.stats;
  return (
    <>
      <JsonLd
        data={collectionPage({
          name: "AI pay by role",
          path: PAY_INDEX,
          items: d.roles.map((g) => ({ name: `${g.name} pay`, href: g.path })),
        })}
      />
      <PageHeader
        eyebrow="Jobs"
        title="AI pay, from disclosed salary ranges"
        crumbs={[{ href: "/jobs/", label: "Jobs" }, { href: PAY_INDEX, label: "AI pay" }]}
        description={
          <p>
            What U.S. AI companies and labs say they pay, summarized from the base-pay ranges in their own current job listings. Every figure is computed from
            the listings below it; nothing is estimated or self-reported.
          </p>
        }
      >
        <JobsSectionNav current="/jobs/pay/" />
      </PageHeader>
      <div className="container-page grid gap-12 py-10">
        <section aria-labelledby="pay-all-heading">
          <h2 id="pay-all-heading" className="text-xl font-semibold text-text sm:text-2xl">
            All current AI listings with pay
          </h2>
          <p className="mt-2 max-w-3xl text-muted">
            {s.count
              ? `${n(s.count)} of ${n(s.listings)} current listings (${pct(s.count, s.listings)}) disclose a yearly U.S.-dollar base range${s.fromDescription ? `, ${n(s.fromDescription)} of them only in the job description` : ""}. Listings last checked ${s.lastChecked ? formatDate(s.lastChecked.slice(0, 10)) : "not yet"}.`
              : "No current listing discloses a yearly U.S.-dollar base range."}
          </p>
          {s.count ? <PayFigures group={d.all} /> : null}
          {s.count ? (
            <p className="mt-3 text-sm">
              <Link prefetch={false} href={d.all.directoryHref} className="link">
                Every listing with pay in the Jobs directory, highest pay first
              </Link>
            </p>
          ) : null}
        </section>

        <section aria-labelledby="pay-roles-heading">
          <h2 id="pay-roles-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Pay by role
          </h2>
          <p className="mt-2 max-w-3xl text-muted">
            Roles with at least {MIN_PAY_LISTINGS} listings with pay, highest median first. Each role page lists the jobs behind its figures. Roles come from the
            title rules on each role&rsquo;s jobs page.
          </p>
          {d.roles.length ? (
            <GroupTable groups={d.roles} label="Role" caption="Disclosed yearly base pay by role" />
          ) : (
            <p className="mt-3 text-muted">No role has enough listings with pay today.</p>
          )}
        </section>

        <section aria-labelledby="pay-employers-heading">
          <h2 id="pay-employers-heading" className="text-xl font-semibold text-text sm:text-2xl">
            Pay by employer
          </h2>
          <p className="mt-2 max-w-3xl text-muted">
            Employers with at least {MIN_PAY_LISTINGS} listings with pay, highest median first. A median compares the roles each employer is hiring for right now,
            not what the same job pays at each one. Each employer&rsquo;s jobs page has its own pay section.
          </p>
          {d.employers.length ? (
            <GroupTable groups={d.employers} label="Employer" caption="Disclosed yearly base pay by employer" />
          ) : (
            <p className="mt-3 text-muted">No employer has enough listings with pay today.</p>
          )}
        </section>

        <section aria-labelledby="pay-method-heading">
          <h2 id="pay-method-heading" className="text-xl font-semibold text-text sm:text-2xl">
            How these figures are computed
          </h2>
          <div className="mt-3">
            <PayMethod />
          </div>
          <p className="mt-3 max-w-3xl text-sm text-muted">
            <Link href="/methodology/#jobs" className="link">
              Jobs methodology
            </Link>{" "}
            · <Link href="/jobs/" className="link">All jobs</Link>
          </p>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
