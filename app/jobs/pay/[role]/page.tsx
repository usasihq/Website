import { notFound } from "next/navigation";
import Link from "@/components/Link";
import { JobsSectionNav } from "@/components/JobsSectionNav";
import { PayFigures, PayMethod, PayTable } from "@/components/JobsPay";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { atLeastOneParam } from "@/lib/jobs/landing";
import { kUsd, PAY_INDEX, payData, payRole, pct } from "@/lib/jobs/pay";
import { pageMetadata, socialImages } from "@/lib/metadata";

export const dynamicParams = false;

const n = (v: number) => v.toLocaleString("en-US");

/** Only roles with enough listings with pay (MIN_PAY_LISTINGS); the set is recomputed on every build. */
export function generateStaticParams() {
  return atLeastOneParam(
    payData(getCatalog()).roles.map((g) => ({ role: g.slug })),
    { role: "_" },
  );
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const g = payRole(getCatalog(), (await params).role);
  if (!g) return {};
  return pageMetadata({
    title: `${g.name} pay at U.S. AI companies: median ${kUsd(g.stats.median)}`,
    description: `Median ${kUsd(g.stats.median)} and middle range ${kUsd(g.stats.p25)}–${kUsd(g.stats.p75)} a year, from ${n(g.stats.count)} disclosed base-pay ranges in current ${g.name} listings at U.S. AI companies and labs.`,
    path: g.path,
    image: socialImages.jobs,
  });
}

export default async function JobsPayRolePage({ params }: { params: Promise<{ role: string }> }) {
  const catalog = getCatalog();
  const g = payRole(catalog, (await params).role);
  if (!g) notFound();
  const s = g.stats;
  const others = payData(catalog).roles.filter((r) => r.slug !== g.slug);
  return (
    <>
      <PageHeader
        eyebrow="AI pay"
        title={`${g.name} pay`}
        crumbs={[{ href: "/jobs/", label: "Jobs" }, { href: PAY_INDEX, label: "AI pay" }, { href: g.path, label: g.name }]}
        description={
          <p>
            Disclosed yearly base-pay ranges in current {g.name} listings at U.S. AI companies and labs, from the employers&rsquo; own job listings.{" "}
            {n(s.count)} of {n(s.listings)} current listings ({pct(s.count, s.listings)}) disclose one
            {s.fromDescription ? `; ${n(s.fromDescription)} of those appear only in the job description` : ""}. Listings last checked{" "}
            {s.lastChecked ? formatDate(s.lastChecked.slice(0, 10)) : "not yet"}.
          </p>
        }
      >
        <JobsSectionNav current="/jobs/pay/" />
      </PageHeader>
      <div className="container-page grid gap-12 py-10">
        <section aria-labelledby="pay-figures-heading">
          <h2 id="pay-figures-heading" className="text-xl font-semibold text-text sm:text-2xl">
            The figures
          </h2>
          <PayFigures group={g} />
          {g.role ? <p className="mt-4 max-w-3xl text-sm text-muted"><strong className="text-text">Which titles count:</strong> {g.role.rule}</p> : null}
          <p className="mt-3 text-sm">
            <Link prefetch={false} href={`/jobs/role/${g.slug}/`} className="link">
              All current {g.name} jobs
            </Link>
            , with or without pay
          </p>
        </section>
        <section aria-labelledby="pay-jobs-heading">
          <h2 id="pay-jobs-heading" className="text-xl font-semibold text-text sm:text-2xl">
            The listings behind these figures
          </h2>
          <PayTable group={g} caption={`${g.name} listings with disclosed pay, highest midpoint first`} />
        </section>
        <section aria-labelledby="pay-method-heading">
          <h2 id="pay-method-heading" className="text-xl font-semibold text-text sm:text-2xl">
            How these figures are computed
          </h2>
          <div className="mt-3">
            <PayMethod />
          </div>
        </section>
        {others.length ? (
          <nav aria-labelledby="pay-others-heading">
            <h2 id="pay-others-heading" className="text-xl font-semibold text-text sm:text-2xl">
              Pay for other roles
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((r) => (
                <li key={r.slug}>
                  <Link prefetch={false} href={r.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">
                    {r.name} <span className="text-muted">({kUsd(r.stats.median)} median)</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link prefetch={false} href={PAY_INDEX} className="badge min-h-11 px-3 hover:border-cyan">
                  All AI pay
                </Link>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
