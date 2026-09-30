import { SupportPanel } from "@/components/SupportPanel";
import { PageHeader } from "@/components/PageHeader";
import { JobsDirectory } from "@/components/JobsDirectory";
import { getCatalog } from "@/lib/catalog";
import { readJobs } from "@/lib/jobs/load";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({ title: "Jobs", description: "Current positions at companies and labs documented by USASI, collected from authoritative employer career sources. Explore listings and apply directly with the employer.", path: "/jobs/" });
export default function JobsPage() {
  const catalog = getCatalog(), data = readJobs(catalog.organizations);
  const names = new Map(catalog.organizations.map(o => [o.slug, o.name]));
  return <><PageHeader eyebrow="The USASI catalog" title="Jobs" description="Current positions from organizations in the USASI catalog. Listings are collected from employer career sources and link to the employer for application." /><div className="container-page py-10 sm:py-12"><JobsDirectory
    items={data.jobs.filter(j => j.status === "open").map(j => ({ ...j, organization_name: names.get(j.organization_slug)! }))}
    feeds={data.feeds} asOf={catalog.buildAt}
    coverage={catalog.organizations.map(o => ({ slug: o.slug, name: o.name, url: o.careers?.url ?? o.hiring_url,
      mode: o.careers?.enabled ? "automated" : o.careers?.source.type === "manual" ? "manual" : o.careers?.source.type === "unsupported" ? "unsupported" : "not-configured",
      note: o.careers && "note" in o.careers.source ? o.careers.source.note : null }))} />
  </div><SupportPanel variant="compact" /></>;
}
