import Link from "@/components/Link";
import { JobsDirectory } from "@/components/JobsDirectory";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { jobsDirectoryData } from "@/lib/jobs/directory-data";
import { jobsIndexJsonLd } from "@/lib/jobs/jsonld";
import { MIN_CITY_LISTINGS, MIN_STATE_LISTINGS } from "@/lib/jobs/landing";
import { employerBrowseLinks, landingLinks, type LandingLink } from "@/lib/jobs/landing-links";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";
export const metadata = pageMetadata({ title: "Jobs at U.S. AI companies & labs", description: "Current positions at U.S. AI companies, labs, and federal agencies via USAJOBS.gov. Collected from employer career sources. Apply with the employer.", path: "/jobs/" });
function BrowseLinks({ links }: { links: LandingLink[] }) {
  return <ul className="mt-2 flex flex-wrap gap-2">{links.map(l => <li key={l.path}><Link prefetch={false} href={l.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">{l.kind === "company" ? <><span className="sr-only">Jobs at </span>{l.name.replace(/^Jobs at /, "")}</> : l.kind === "state" || l.kind === "city" ? <><span className="sr-only">Jobs in </span>{l.name.replace(/^Jobs in /, "")}{l.kind === "city" ? <span className="text-muted">, {l.state}</span> : null}</> : l.name} <span className="text-muted">({l.count.toLocaleString("en-US")})</span></Link></li>)}</ul>;
}
export default function JobsPage() {
  const catalog = getCatalog(), data = jobsDirectoryData(catalog), pages = landingLinks(catalog);
  return <><JsonLd data={jobsIndexJsonLd(pages)} /><PageHeader eyebrow="The USASI catalog" title="Jobs" description="Open jobs at U.S. AI companies and labs, plus federal AI roles from USAJOBS.gov. Search by title, skill, and place; apply on the employer’s site." /><div className="container-page py-10 sm:py-12">
    <JobsDirectory
    initial={data.initial} summary={data.summary} dataUrl={asset("/data/jobs.json")}
    feeds={data.feeds} asOf={catalog.buildAt}
    coverage={catalog.organizations.map(o => ({ slug: o.slug, name: o.name, url: o.careers?.url ?? o.hiring_url,
      mode: o.careers?.enabled ? "automated" : o.careers?.source.type === "manual" ? "manual" : o.careers?.source.type === "unsupported" ? "unsupported" : "not-configured",
      note: o.careers && "note" in o.careers.source ? o.careers.source.note : null }))}
    browse={<>
    <nav aria-labelledby="browse-jobs-heading" className="mt-14 border-t border-line pt-10">
      <h2 id="browse-jobs-heading" className="text-lg font-semibold text-text">Browse by</h2>
      <p className="mt-1 text-sm text-muted">Every page below is a shareable list that stays up to date.</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div data-testid="browse-roles"><h3 className="text-sm font-medium text-muted">Role</h3><BrowseLinks links={pages.filter(p => p.kind === "role")} /></div>
        <div><h3 className="text-sm font-medium text-muted">Topic and remote work</h3><BrowseLinks links={pages.filter(p => p.kind === "topic")} /></div>
        <div><h3 className="text-sm font-medium text-muted">U.S. state named in the listing&rsquo;s location <span className="font-normal">(states with at least {MIN_STATE_LISTINGS} listings)</span></h3><BrowseLinks links={pages.filter(p => p.kind === "state")} /></div>
        <div className="lg:col-span-2"><h3 className="text-sm font-medium text-muted">U.S. city named in the listing&rsquo;s location <span className="font-normal">(cities with at least {MIN_CITY_LISTINGS} listings)</span></h3><BrowseLinks links={pages.filter(p => p.kind === "city").sort((a, b) => b.count - a.count)} /></div>
        <div className="lg:col-span-2" data-testid="browse-employers"><h3 className="text-sm font-medium text-muted">Employer <span className="font-normal">(each page has a shareable link)</span></h3><BrowseLinks links={employerBrowseLinks(catalog)} /></div>
      </div>
    </nav>
    </>} />
  </div><SupportPanel variant="compact" /></>;
}
