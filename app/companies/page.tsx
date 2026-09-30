import Link from "next/link";
import { OrgDirectory } from "@/components/OrgDirectory";
import { PageHeader } from "@/components/PageHeader";
import { OrgQuickViews } from "@/components/QuickViews";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Companies & Labs",
  description:
    "Directory of U.S. AI companies, laboratories, research units, and foundations, with documented products, roles, eligibility, and sources.",
  path: "/companies/",
});

export default function CompaniesPage() {
  const catalog = getCatalog();
  const counts = catalog.counts();
  const items = catalog.organizations.map((o) => catalog.toOrgListItem(o));
  return (
    <>
      <PageHeader
        compact
        eyebrow="Directory"
        title="Companies & Labs"
        description={
          <p>
            Search U.S. AI companies, labs, research units, and foundations, covering both closed and open offerings.
          </p>
        }
      >
        <p className="meta mt-2">
          {counts.organizations} records · {counts.independentOrganizations} top-level organizations · {counts.organizationUnits} units or subsidiaries.{" "}
          <Link href="/methodology/#counts" className="link">
            How counts work
          </Link>
        </p>
        <details className="mt-3"><summary className="cursor-pointer text-sm text-ice">Browse quick views</summary><OrgQuickViews items={items} /></details>
      </PageHeader>
      <div className="container-page py-6">
        <OrgDirectory items={items} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
