import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { OrgDirectory } from "@/components/OrgDirectory";
import { PageHeader } from "@/components/PageHeader";
import { OrgQuickViews } from "@/components/QuickViews";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { orgHref } from "@/lib/routes";
import { itemList } from "@/lib/structured-data";

const COUNTS = getCatalog().counts();

export const metadata = pageMetadata({
  title: "U.S. AI companies & labs directory",
  description: `Directory of ${COUNTS.organizations} U.S. AI companies, labs, research units, and foundations: products, open models, headquarters, and eligibility, each with sources.`,
  path: "/companies/",
});

export default function CompaniesPage() {
  const catalog = getCatalog();
  const counts = catalog.counts();
  const items = catalog.organizations.map((o) => catalog.toOrgListItem(o));
  return (
    <>
      <JsonLd data={itemList({ name: "U.S. AI companies & labs", path: "/companies/", items: items.map((o) => ({ name: o.name, href: orgHref(o.slug) })) })} />
      <PageHeader
        compact
        eyebrow="Directory · Companies & Labs"
        title="U.S. AI companies & labs"
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
        <OrgDirectory items={items} asOf={catalog.buildAt} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
