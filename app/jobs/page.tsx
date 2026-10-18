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
import { layoffHref, layoffsIndex } from "@/lib/jobs/layoffs";
import { pageMetadata, socialImages } from "@/lib/metadata";
import { asset } from "@/lib/paths";
/** Federal roles are mentioned only while USAJOBS listings are actually on the board (the feed needs an API key). */
const hasFederal = (items: { source_type: string }[]) => items.some((j) => j.source_type === "usajobs");
export function generateMetadata() {
  const federal = hasFederal(jobsDirectoryData(getCatalog()).items);
  return pageMetadata({ title: "Jobs at U.S. AI companies & labs", description: federal
    ? "Current positions at U.S. AI companies, labs, and federal agencies via USAJOBS.gov. Collected from employer career sources. Apply with the employer."
    : "Current positions at U.S. AI companies, labs, and research universities. Collected from employer career sources. Apply with the employer.",
    path: "/jobs/", image: socialImages.jobs });
}
const SHORTCUT_LABELS: Record<string, string> = { "/jobs/remote-us/": "Remote (U.S.)", "/jobs/entry-level/": "Entry-level", "/jobs/no-programming/": "No programming", "/jobs/data-center-infrastructure/": "Data center" };
function BrowseLinks({ links }: { links: LandingLink[] }) {
  return <ul className="mt-2 flex flex-wrap gap-2">{links.map(l => <li key={l.path}><Link prefetch={false} href={l.path} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">{l.kind === "company" ? <><span className="sr-only">Jobs at </span>{l.name.replace(/^Jobs at /, "")}</> : l.kind === "state" || l.kind === "city" ? <><span className="sr-only">Jobs in </span>{l.name.replace(/^Jobs in /, "")}{l.kind === "city" ? <span className="text-muted">, {l.state}</span> : null}</> : l.name} <span className="text-muted">({l.count.toLocaleString("en-US")})</span></Link></li>)}</ul>;
}
export default function JobsPage() {
  const catalog = getCatalog(), data = jobsDirectoryData(catalog), pages = landingLinks(catalog), layoffs = layoffsIndex(catalog);
  // Shortcuts above the results: the topic pages and the three largest role pages, each with its own (all-country) count.
  const layoffCount = layoffs.states.reduce((s, p) => s + p.file.notices.length, 0);
  const shortcuts = [
    ...Object.keys(SHORTCUT_LABELS).map(path => pages.find(p => p.path === path)).filter(p => p && p.count > 0).map(p => ({ href: p!.path, label: SHORTCUT_LABELS[p!.path], count: p!.count })),
    ...pages.filter(p => p.kind === "role" && p.count > 0).sort((a, b) => b.count - a.count).slice(0, 3).map(p => ({ href: p.path, label: p.name.replace(/ jobs$/, ""), count: p.count })),
    ...(layoffs.states.length ? [{ href: "/jobs/layoffs/", label: "WARN Act layoffs", count: layoffCount }] : []),
  ];
  return <><JsonLd data={jobsIndexJsonLd(pages)} /><PageHeader eyebrow="The USASI catalog" compact title="Jobs at U.S. AI companies and labs" description={hasFederal(data.items) ? "Open jobs at U.S. AI companies and labs, plus federal AI roles from USAJOBS.gov. Search by title, skill, and place; apply on the employer’s site." : "Open jobs at U.S. AI companies, labs, and research universities. Search by title, skill, and place; apply on the employer’s site."} /><div className="container-page py-5 sm:py-10">
    <JobsDirectory
    initial={data.initial} summary={data.summary} dataUrl={asset("/data/jobs.json")}
    feeds={data.feeds} asOf={catalog.buildAt}
    coverage={catalog.organizations.map(o => ({ slug: o.slug, name: o.name, url: o.careers?.url ?? o.hiring_url,
      mode: o.careers?.enabled ? "automated" : o.careers?.source.type === "manual" ? "manual" : o.careers?.source.type === "unsupported" ? "unsupported" : "not-configured",
      note: o.careers && "note" in o.careers.source ? o.careers.source.note : null, source: o.careers?.source.type ?? null }))}
    shortcuts={shortcuts}
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
        {layoffs.states.length ? <div className="lg:col-span-2" data-testid="browse-layoffs"><h3 className="text-sm font-medium text-muted">WARN Act layoffs and nearby AI jobs</h3><ul className="mt-2 flex flex-wrap gap-2"><li><Link prefetch={false} href="/jobs/layoffs/" className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">All layoff pages <span className="text-muted">({layoffCount.toLocaleString("en-US")})</span></Link></li>{layoffs.states.map(s => <li key={s.meta.code}><Link prefetch={false} href={layoffHref(s.meta.code)} className="badge min-h-11 max-w-full whitespace-normal px-3 text-left hover:border-cyan">{s.meta.name} <span className="text-muted">({s.file.notices.length.toLocaleString("en-US")})</span></Link></li>)}</ul></div> : null}
      </div>
    </nav>
    </>} />
  </div><SupportPanel variant="compact" /></>;
}
