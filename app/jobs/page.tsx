import Link from "next/link";
import { SupportPanel } from "@/components/SupportPanel";
import { PageHeader } from "@/components/PageHeader";
import { JobsDirectory } from "@/components/JobsDirectory";
import { getCatalog } from "@/lib/catalog";
import { jobsDirectoryData } from "@/lib/jobs/directory-data";
import { landingLinks, type LandingLink } from "@/lib/jobs/landing-links";
import { MIN_CITY_LISTINGS, MIN_STATE_LISTINGS } from "@/lib/jobs/landing";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";
export const metadata = pageMetadata({ title: "Jobs at U.S. AI companies & labs", description: "Current positions at U.S. AI companies and labs documented by USASI, collected from authoritative employer career sources. Apply directly with the employer.", path: "/jobs/" });
function BrowseLinks({ links }: { links: LandingLink[] }) {
  return <ul className="mt-2 flex flex-wrap gap-2">{links.map(l => <li key={l.path}><Link prefetch={false} href={l.path} className="badge min-h-11 px-3 hover:border-cyan">{l.kind !== "topic" ? <><span className="sr-only">Jobs in </span>{l.name.replace(/^Jobs in /, "")}{l.kind === "city" ? <span className="text-muted">, {l.state}</span> : null}</> : l.name} <span className="text-muted">({l.count.toLocaleString("en-US")})</span></Link></li>)}</ul>;
}
export default function JobsPage() {
  const catalog = getCatalog(), data = jobsDirectoryData(catalog), pages = landingLinks(catalog);
  return <><PageHeader eyebrow="The USASI catalog" title="Jobs" description="Current positions from organizations in the USASI catalog. Listings are collected from employer career sources and link to the employer for application." /><div className="container-page py-10 sm:py-12">
    <nav aria-labelledby="browse-jobs-heading" className="mb-10">
      <h2 id="browse-jobs-heading" className="text-lg font-semibold text-text">Browse by</h2>
      <div className="mt-3 grid gap-5 lg:grid-cols-2">
        <div><h3 className="text-sm font-medium text-muted">Topic and remote work</h3><BrowseLinks links={pages.filter(p => p.kind === "topic")} /></div>
        <div><h3 className="text-sm font-medium text-muted">U.S. state named in the listing&rsquo;s location <span className="font-normal">(states with at least {MIN_STATE_LISTINGS} listings)</span></h3><BrowseLinks links={pages.filter(p => p.kind === "state")} /></div>
        <div className="lg:col-span-2"><h3 className="text-sm font-medium text-muted">U.S. city named in the listing&rsquo;s location <span className="font-normal">(cities with at least {MIN_CITY_LISTINGS} listings)</span></h3><BrowseLinks links={pages.filter(p => p.kind === "city").sort((a, b) => b.count - a.count)} /></div>
      </div>
    </nav>
    <JobsDirectory
    initial={data.initial} summary={data.summary} dataUrl={asset("/data/jobs.json")}
    feeds={data.feeds} asOf={catalog.buildAt}
    coverage={catalog.organizations.map(o => ({ slug: o.slug, name: o.name, url: o.careers?.url ?? o.hiring_url,
      mode: o.careers?.enabled ? "automated" : o.careers?.source.type === "manual" ? "manual" : o.careers?.source.type === "unsupported" ? "unsupported" : "not-configured",
      note: o.careers && "note" in o.careers.source ? o.careers.source.note : null }))} />
  </div><SupportPanel variant="compact" /></>;
}
