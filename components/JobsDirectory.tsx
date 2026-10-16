"use client";
import Link from "next/link";
import { useJobsClock } from "./useJobsClock";
import { useEffect, useMemo, useState } from "react";
import type { FeedHealth, Job } from "@/lib/jobs/schema";
import { checkedLabel, currentJobs, DEFAULT_JOB_FILTERS, filterJobs, isDefaultJobView, parseJobFilters, serializeJobFilters, type JobFilters, type JobItem } from "@/lib/jobs/search";
import { JOB_ROLES, jobRole } from "@/lib/jobs/roles";
import { isExpressionOfInterest, jobTrack, JOB_TRACKS } from "@/lib/jobs/tracks";
import { cityKey, cityLabel, jobGeography, LOCATION_SCOPE_LABELS, LOCATION_SCOPES, stateDisplayName, type LocationScope } from "@/lib/jobs/geo";
import { US_STATES } from "@/lib/places";
import { orgHref } from "@/lib/routes";
import { siteConfig, mailtoHref } from "@/lib/site-config";
import { ExternalLink } from "./ExternalLink";
import { jobHref } from "@/lib/jobs/job-url";
import { asset } from "@/lib/paths";
import { SearchField, SelectField, ResultSummary } from "./FilterControls";
import { useDebounced, useQueryState } from "./useQueryState";
export type CareerCoverage = { slug: string; name: string; url: string | null; mode: "automated" | "manual" | "unsupported" | "not-configured"; note: string | null };
function salaryText(s: Job["salaries"][number]): string {
  const number = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${s.currency} ${s.min !== null ? number(s.min) : "up to"}${s.min !== null && s.max !== null ? "–" : " "}${s.max !== null ? number(s.max) : "and above"} / ${s.period}${s.label ? ` · ${s.label}` : ""}`;
}
function JobCard({ job, unverified }: { job: JobItem; unverified: boolean }) {
  return <article className="card h-full p-5">
    <Link prefetch={false} href={`/jobs/at/${job.organization_slug}/`} className="link text-sm">{job.organization_name}</Link>
    {/* Current listings have their own page; older, unverified ones only the employer's posting. */}
    <h2 className="mt-2 text-lg font-semibold text-text break-words">{unverified ? job.title : <a href={asset(jobHref(job))} className="hover:underline hover:decoration-cyan hover:underline-offset-4">{job.title}</a>}</h2>
    {isExpressionOfInterest(job.title) ? <p className="mt-2 text-sm text-ice">The employer&apos;s title presents this as a general expression of interest, not a specific vacancy.</p> : null}
    <p className="mt-3 text-sm text-muted">{job.locations.length ? job.locations.join(" · ") : "Location not supplied"}</p>
    <p className="mt-2 text-sm text-muted">{[job.employment_type !== "unknown" ? job.employment_type : null, job.workplace !== "unknown" ? job.workplace : "Workplace type not supplied"].filter(Boolean).join(" · ")}</p>
    {job.department || job.team ? <p className="mt-2 text-sm text-muted">{[job.department, job.team !== job.department ? job.team : null].filter(Boolean).join(" · ")}</p> : null}
    {job.salaries.length ? <div className="mt-3 text-sm text-text"><ul>{job.salaries.map((s,i) => <li key={i}>{salaryText(s)}</li>)}</ul><p className="mt-1 text-xs text-muted">Employer-disclosed base salary range; compensation is not guaranteed.</p></div> : null}
    <p className="mt-4 text-xs text-muted">Last seen in employer feed: <time dateTime={job.last_seen}>{checkedLabel(job.last_seen)}</time></p>
    {job.posted_at ? <p className="mt-1 text-xs text-muted">{job.posted_date_kind === "last-published" ? "Last published" : "First published"}: <time dateTime={job.posted_at}>{job.posted_at.slice(0,10)}</time></p> : null}
    {unverified ? <p className="mt-3 text-sm text-ice">Not recently confirmed. Check the employer’s posting for availability.</p> : null}
    <div className="mt-4"><ExternalLink href={job.official_url}>View official posting<span className="sr-only">: {job.title} at {job.organization_name}</span></ExternalLink></div>
    <details className="mt-3 text-xs text-muted"><summary className="min-h-8 cursor-pointer">Source and corrections</summary><p className="mt-2">Collected from the employer’s {job.source_type === "ashby" ? "Ashby" : "Greenhouse"} feed. Posting ID: {job.source_job_id}. Unknown fields are not inferred.</p><ExternalLink href={job.source_url}>Source feed</ExternalLink>{siteConfig.contact.email ? <p className="mt-2"><a className="link" href={mailtoHref(siteConfig.contact.email, `Job correction: ${job.title}`, `Job: ${job.id}\nOfficial posting: ${job.official_url}\nDisputed field:\nProposed correction:\nSupporting source:\n`)}>Suggest a correction</a></p> : null}</details>
  </article>;
}
/** One-tap searches for common roles; each runs the same text search as the box above. */
const POPULAR = ["Machine learning", "Software engineer", "Research", "Product manager", "Data center", "Sales", "Security", "Internship", "Policy", "Design"];
const STATE_OPTIONS = Object.keys(US_STATES).map(value => ({ value, label: stateDisplayName(value) })).sort((a,b) => a.label.localeCompare(b.label,"en"));
const SCOPE_OPTIONS = LOCATION_SCOPES.map(value => ({ value, label: LOCATION_SCOPE_LABELS[value] }));
const options = (values: string[]) => [...new Set(values)].sort((a,b) => a.localeCompare(b,"en")).map(value => ({ value, label: value }));
export type JobsSummary = { currentCount: number; organizationCount: number; departments: string[]; currencies: string[]; periods: string[] };
export function JobsDirectory({ initial, summary, dataUrl, feeds, coverage, asOf }: { initial: JobItem[]; summary: JobsSummary; dataUrl: string; feeds: FeedHealth[]; coverage: CareerCoverage[]; asOf: string }) {
  const now = useJobsClock(asOf);
  const { state: f, update } = useQueryState(parseJobFilters, serializeJobFilters);
  // The page embeds the first 30 listings; the full list loads after first paint.
  const [all, setAll] = useState<JobItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(dataUrl).then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { jobs: JobItem[] }) => { if (live) setAll(d.jobs); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [dataUrl]);
  const items = all ?? initial;
  const loading = all === null && !failed;
  const results = useMemo(() => filterJobs(items, feeds, f, now), [items, feeds, f, now]);
  const current = useMemo(() => currentJobs(items, feeds, now), [items, feeds, now]);
  const currentCount = all ? current.length : summary.currentCount;
  const count = all ? new Set(current.map(j => j.organization_slug)).size : summary.organizationCount;
  // Until the full list arrives, a filtered view would be computed from 30 rows, so it waits instead.
  const waiting = loading && !isDefaultJobView(f);
  const total = all || failed ? results.length : summary.currentCount;
  const pageCount = all ? Math.max(1, Math.ceil(results.length / 30)) : 1, page = Math.min(f.page, pageCount);
  const visible = results.slice((page - 1) * 30, page * 30);
  const announce = useDebounced(waiting ? "Loading all positions." : `${total} matching positions. Page ${page} of ${pageCount}.`);
  const set = (patch: Partial<JobFilters>, mode: "push" | "replace" = "push") => update({ ...f, page: 1, ...patch }, mode);
  const departments = useMemo(() => summary.departments.map(value => ({ value, label: value })), [summary.departments]);
  // Cities named by current listings in the chosen state, most listings first, for the city menu.
  const cityOptions = useMemo(() => {
    if (!f.state) return [];
    const counts = new Map<string, { label: string; count: number }>();
    for (const j of current) {
      for (const c of jobGeography(j).cities) {
        if (!c.startsWith(`${f.state}|`)) continue;
        const key = cityKey(c).slice(3);
        const hit = counts.get(key);
        counts.set(key, { label: hit?.label ?? cityLabel(c), count: (hit?.count ?? 0) + 1 });
      }
    }
    return [...counts].sort((a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label, "en")).slice(0, 60)
      .map(([value, v]) => ({ value, label: `${v.label} (${v.count.toLocaleString("en-US")})` }));
  }, [current, f.state]);
  // The city's name comes from the listings that match it (city pages link here before the menu exists).
  const cityName = useMemo(() => {
    if (!f.city) return "";
    const key = `${f.state}|${f.city}`;
    for (const j of results) { const c = jobGeography(j).cities.find(c => cityKey(c) === key); if (c) return cityLabel(c); }
    return f.city.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }, [f.city, f.state, results]);
  return <>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><p className="text-lg text-text"><strong>{currentCount.toLocaleString("en-US")}</strong> recently confirmed positions across <strong>{count}</strong> organizations</p><a href="#job-sources" className="link text-sm">Coverage & source health</a></div>
    <p className="mb-6 max-w-3xl text-sm text-muted">Coverage is limited to configured employer feeds. A current listing was present at its last successful check within 48 hours; the employer may have changed it since. USASI does not recruit, endorse employers, or collect applications.</p>
    <nav aria-label="Job tracks" className="mb-6">
      <h2 className="text-lg font-semibold text-text">Browse by track</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{JOB_TRACKS.map(t => <li key={t.id}><button type="button" aria-pressed={f.track === t.id} onClick={() => set({ track: f.track === t.id ? "" : t.id })} className={`card card-link flex h-full w-full flex-col p-4 text-left ${f.track === t.id ? "border-cyan bg-cyan/10" : ""}`}><span className="font-semibold text-text">{t.title}</span><span className="mt-1 text-sm text-muted">{t.description}</span></button></li>)}</ul>
      {f.track && jobTrack(f.track) ? <p className="mt-3 max-w-3xl text-sm text-muted"><strong className="text-text">How this track is selected:</strong> {jobTrack(f.track)!.rule} It uses only what employers supply; listings with unclear titles may be missed. <button type="button" className="link" onClick={() => set({ track: "" })}>Clear track</button></p> : null}
    </nav>
    <div role="search" aria-label="Filter jobs" className="card p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SearchField label="Search jobs" value={f.q} onChange={q => set({ q }, "replace")} placeholder="Title, company, skill, city… (ML, SWE, PM work too)" />
        <SelectField label="Company or lab" value={f.company} options={coverage.map(c => ({ value: c.slug, label: c.name }))} onChange={company => set({ company })} allLabel="All organizations" />
        {JOB_ROLES.length ? <SelectField label="Role" value={f.role} options={JOB_ROLES.map(r => ({ value: r.slug, label: r.name }))} onChange={role => set({ role })} allLabel="All roles" /> : null}
        <SearchField label="Location" value={f.location} onChange={location => set({ location }, "replace")} placeholder="Employer-supplied location…" />
        <SelectField label="U.S. state named in location" value={f.state} options={STATE_OPTIONS} onChange={state => set({ state, city: "" })} allLabel="Any location" />
        {f.state && cityOptions.length ? <SelectField label="City" value={f.city} options={cityOptions} onChange={city => set({ city })} allLabel={`Anywhere in ${stateDisplayName(f.state)}`} /> : null}
        <SelectField<LocationScope> label="Remote and U.S. locations" value={f.where} options={SCOPE_OPTIONS} onChange={where => set({ where })} allLabel="All listings" />
        <SelectField label="Department" value={f.department} options={departments} onChange={department => set({ department })} allLabel="All supplied departments" />
        <SelectField label="Workplace type" value={f.workplace} options={options(["remote", "hybrid", "on-site", "unknown"])} onChange={workplace => set({ workplace })} />
        <SelectField label="Employment type" value={f.employment} options={options(["full-time", "part-time", "contract", "temporary", "internship", "unknown"])} onChange={employment => set({ employment })} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Popular searches" role="group">
        <span className="text-sm text-muted">Popular:</span>
        {POPULAR.map(q => <button key={q} type="button" aria-pressed={f.q.toLowerCase() === q.toLowerCase()} onClick={() => set({ q: f.q.toLowerCase() === q.toLowerCase() ? "" : q })} className={`inline-flex min-h-9 items-center rounded-full border px-3 text-sm ${f.q.toLowerCase() === q.toLowerCase() ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-line-strong hover:text-text"}`}>{q}</button>)}
      </div>
      {f.company && coverage.some(c => c.slug === f.company && c.mode === "automated") ? <p className="mt-4 text-sm text-muted" data-testid="jobs-company-page">Shareable page for this employer: <Link href={`/jobs/at/${f.company}/`} className="link">Jobs at {coverage.find(c => c.slug === f.company)!.name}</Link></p> : null}
      {f.role && jobRole(f.role) ? <p className="mt-4 max-w-3xl text-sm text-muted" data-testid="jobs-role-filter"><span className="badge mr-2 border-[rgba(76,201,255,0.45)]">Role: {jobRole(f.role)!.name}</span>Shareable page: <Link href={`/jobs/role/${f.role}/`} className="link">{jobRole(f.role)!.h1}</Link>. {jobRole(f.role)!.rule} <button type="button" className="link min-h-11" onClick={() => set({ role: "" })}>Clear role</button></p> : null}
      {f.city ? <p className="mt-4 text-sm text-text" data-testid="jobs-city-filter"><span className="badge mr-2 border-[rgba(76,201,255,0.45)]">City: {cityName}, {f.state}</span><button type="button" className="link min-h-11" onClick={() => set({ city: "" })}>Show all of {stateDisplayName(f.state)}</button></p> : null}
      {f.state || f.where ? <p className="mt-4 max-w-3xl text-sm text-muted"><strong className="text-text">How locations are read:</strong> {f.state ? `A listing matches ${f.city ? `${cityName}, ${stateDisplayName(f.state)}` : stateDisplayName(f.state)} when one of its employer-supplied locations names it, for example “Atlanta, GA”, “Atlanta, Georgia, United States”, or a city on its own that has only one well-known U.S. match, such as “Atlanta” or “SF Office”; “Remote - US” names no state. ` : ""}{f.where && f.where !== "us" ? "Remote means the employer marks the workplace as remote or a listed location says “Remote”. " : ""}{f.where === "us" || f.where === "remote-us" ? "U.S. locations only means the listing names the United States or a U.S. state and no place outside it. " : ""}It uses only what employers supply. <Link href="/jobs/remote-us/" className="link">About remote jobs with U.S. locations</Link></p> : null}
      <details className="mt-4"><summary className="min-h-11 cursor-pointer text-sm text-ice">Salary and date filters</summary><div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={f.salary} onChange={e => set({ salary: e.target.checked })} className="h-5 w-5" />Employer supplies salary</label>
        <SelectField label="Salary currency" value={f.currency} options={options(summary.currencies)} onChange={currency => set({ currency, salary_min: "" })} />
        <SelectField label="Salary period" value={f.period} options={options(summary.periods)} onChange={period => set({ period, salary_min: "" })} />
        <label className="text-sm">Minimum of disclosed range<input className="field mt-1.5" type="number" min="0" max="999999999" step="0.01" disabled={!f.currency || !f.period} value={f.salary_min} onChange={e => set({ salary_min: e.target.value }, "replace")} /><span className="mt-1 block text-xs text-muted">Choose a currency and period first. No conversion.</span></label>
        <SelectField label="Published within" value={f.posted} options={[{value:"7",label:"7 days"},{value:"30",label:"30 days"}]} onChange={posted => set({posted})} allLabel="Any supplied date" />
        <SelectField label="Seen within" value={f.verified} options={[{value:"24",label:"24 hours"},{value:"48",label:"48 hours"}]} onChange={verified => set({verified})} />
      </div></details>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><SelectField label="Listing verification" value={f.view === "current" ? "" : f.view} options={[{value:"unverified",label:"Older listings / source needs attention"}]} onChange={view => set({view: view || "current"})} allLabel="Recently confirmed only" /><SelectField label="Sort jobs" value={f.sort === "verified" ? "" : f.sort} options={[{value:"newest",label:"Newest supplied publication date"},{value:"company",label:"Company (A–Z)"},{value:"title",label:"Title (A–Z)"}]} onChange={sort => set({sort: sort || "verified"})} allLabel="Recently verified" /></div>
      <button type="button" className="link mt-3 min-h-11 text-sm" onClick={() => update({...DEFAULT_JOB_FILTERS})}>Clear job filters</button>
      <noscript><p className="text-sm text-muted">Filtering and paging require JavaScript. The first 30 recently confirmed listings as of {checkedLabel(asOf)} appear below. Employer career links in Coverage & source health show all available opportunities.</p></noscript>
    </div>
    {failed ? <p className="mt-6 text-sm text-muted">The full list could not be loaded, so only the first 30 recently confirmed positions are shown. Official careers links under Coverage & source health list every opening.</p> : null}
    <div className="my-6"><ResultSummary visible={visible.length} total={total} pending={waiting} noun={["matching position","matching positions"]} announce={announce} /></div>
    {waiting ? <div className="card p-8 text-muted" aria-busy="true">Loading all positions…</div> : visible.length ? <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(job => <li key={job.id}><JobCard job={job} unverified={f.view === "unverified"} /></li>)}</ul> : <div className="card p-8"><h2 className="text-xl text-text">No positions match this view</h2><p className="mt-3 text-muted">This does not mean the organization has no openings. It may have no automated source, a source needing attention, or no matching listings. Use the official careers links below.</p></div>}
    {pageCount > 1 ? <nav aria-label="Job results pages" className="my-6 flex flex-wrap items-center justify-center gap-4"><button className="btn btn-secondary" disabled={page === 1} onClick={() => set({page: page-1})}>Previous</button><span className="text-sm text-muted">Page {page} of {pageCount}</span><button className="btn btn-secondary" disabled={page === pageCount} onClick={() => set({page: page+1})}>Next</button></nav> : null}
    <section id="job-sources" className="mt-14 scroll-mt-24"><h2 className="text-2xl font-semibold text-text">Coverage & source health</h2><p className="mt-3 max-w-3xl text-muted">Only organizations already published in USASI can appear. Automated coverage begins with verified, supported employer feeds and is not a complete employment census. No count is supplied for an unconfigured source.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">{coverage.filter(c => c.mode === "automated").map(c => {
        const h = feeds.find(v => v.organization_slug === c.slug);
        return <div key={c.slug} className="card p-4"><h3 className="font-semibold text-text">{c.name}</h3><p className="mt-2 text-sm text-muted">{h?.result === "ok" && h.last_successful && now - Date.parse(h.last_successful) <= 48 * 3600000 ? "Source checked successfully" : "Source needs attention; listings are not currently confirmed"}</p><p className="mt-1 text-xs text-muted">Last successful check: {checkedLabel(h?.last_successful ?? null)}</p>{c.url ? <ExternalLink href={c.url}>Official careers</ExternalLink> : null}</div>;
      })}</div>
      <details className="mt-6"><summary className="min-h-11 cursor-pointer text-ice">Other catalog organizations and official careers links</summary><ul className="mt-4 grid gap-3 md:grid-cols-2">{coverage.filter(c => c.mode !== "automated").map(c => <li key={c.slug} className="card p-4"><Link href={orgHref(c.slug)} className="link">{c.name}</Link><p className="mt-1 text-sm text-muted">{c.note ?? "Automated job source not configured."}</p>{c.url ? <ExternalLink href={c.url}>Official careers</ExternalLink> : null}</li>)}</ul></details>
      <p className="mt-6 text-sm text-muted">A failed request never closes a listing. Missing postings leave the current view after a successful check, and are treated as closed only after another successful check at least 24 hours later. Exceptional feed drops require confirmation first. <Link href="/methodology/#jobs" className="link">Read the Jobs methodology</Link>.</p>
    </section>
  </>;
}
