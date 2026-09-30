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
        eyebrow="Directory"
        title="Companies & Labs"
        description={
          <p>
            U.S. AI organizations covering both closed and open offerings: frontier-model developers, chip and cloud providers, enterprise and
            data platforms, nonprofit labs, robotics companies, and open-source foundations.
          </p>
        }
      >
        <p className="meta mt-4">
          {counts.organizations} organization records: {counts.independentOrganizations} top-level organizations and {counts.organizationUnits} research
          units or subsidiaries listed separately.{" "}
          <Link href="/methodology/#counts" className="link">
            How counts work
          </Link>
        </p>
        <OrgQuickViews items={items} />
      </PageHeader>
      <div className="container-page py-10">
        <OrgDirectory items={items} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
