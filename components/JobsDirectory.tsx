"use client";
import Link from "next/link";
import { useJobsClock } from "./useJobsClock";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { JOB_SOURCE_LABELS, type FeedHealth, type Job } from "@/lib/jobs/schema";
import { checkedLabel, currentJobs, postedTime, DEFAULT_JOB_FILTERS, filterJobs, isDefaultJobView, parseJobFilters, serializeJobFilters, type JobFilters, type JobItem } from "@/lib/jobs/search";
import { JOB_ROLES, jobRole } from "@/lib/jobs/roles";
import { annualUsdTop, jobCategory, jobLevel, JOB_CATEGORIES, JOB_LEVELS, PAY_THRESHOLDS } from "@/lib/jobs/levels";
import { parseWhere, whereText } from "@/lib/jobs/where";
import { isExpressionOfInterest, jobTrack, JOB_TRACKS } from "@/lib/jobs/tracks";
import { cityKey, cityLabel, jobGeography, LOCATION_SCOPE_LABELS, LOCATION_SCOPES, stateDisplayName, type LocationScope } from "@/lib/jobs/geo";
import { US_STATES } from "@/lib/places";
import { orgHref } from "@/lib/routes";
import { siteConfig, mailtoHref } from "@/lib/site-config";
import { ExternalLink } from "./ExternalLink";
import { jobHref } from "@/lib/jobs/job-url";
import { asset } from "@/lib/paths";
import { FilterChip, SearchField, SelectField, ResultSummary } from "./FilterControls";
import { useDebounced, useQueryState } from "./useQueryState";
export type CareerCoverage = { slug: string; name: string; url: string | null; mode: "automated" | "manual" | "unsupported" | "not-configured"; note: string | null };
function salaryText(s: Job["salaries"][number]): string {
  const number = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${s.currency} ${s.min !== null ? number(s.min) : "up to"}${s.min !== null && s.max !== null ? "–" : " "}${s.max !== null ? number(s.max) : "and above"} / ${s.period}${s.label ? ` · ${s.label}` : ""}`;
}
/** "$180K–$250K a year" for U.S.-dollar ranges; other currencies keep the full form. */
function payText(s: Job["salaries"][number]): string {
  if (s.currency !== "USD") return salaryText(s);
  const k = (n: number) => (s.period === "year" && n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`);
  const per = { year: "a year", hour: "an hour", month: "a month", week: "a week", day: "a day" }[s.period] ?? `/ ${s.period}`;
  const range = s.min !== null && s.max !== null && s.min !== s.max ? `${k(s.min)}–${k(s.max)}` : s.min !== null ? `${k(s.min)}${s.max === null ? "+" : ""}` : `up to ${k(s.max!)}`;
  return `${range} ${per}`;
}
/** "Today", "3 days ago", "2 weeks ago", or the date. */
function ageText(t: number, now: number): string {
  const days = Math.floor((now - t) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
function JobCard({ job, unverified, now }: { job: JobItem; unverified: boolean; now: number }) {
  const posted = postedTime(job);
  const fresh = now - posted <= 3 * 86400000 && now >= posted;
  const level = jobLevel(job.title);
  const remote = job.workplace === "remote" || job.locations.some(l => /\bremote\b/i.test(l));
  const applyOn = job.source_type === "usajobs" ? "USAJOBS.gov" : "the employer's site";
  const sourceLine = job.source_type === "usajobs"
    ? "Collected from USAJOBS.gov."
    : `Collected from the employer’s ${JOB_SOURCE_LABELS[job.source_type]} feed.`;
  return <article className="card flex h-full flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between" data-testid="job-card">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <Link prefetch={false} href={`/jobs/at/${job.organization_slug}/`} className="link font-medium">{job.organization_name}</Link>
        {fresh ? <span className="rounded-full bg-[rgba(52,211,153,0.15)] px-2 py-0.5 text-xs font-semibold text-[#6ee7b7]">New</span> : null}
      </div>
      {/* Current listings have their own page; older, unverified ones only the employer's posting. */}
      <h2 className="mt-1.5 text-lg font-semibold leading-snug text-text break-words">{unverified ? job.title : <a href={asset(jobHref(job))} className="hover:underline hover:decoration-cyan hover:underline-offset-4">{job.title}</a>}</h2>
      {isExpressionOfInterest(job.title) ? <p className="mt-1 text-sm text-ice">The employer&apos;s title presents this as a general expression of interest, not a specific vacancy.</p> : null}
      <p className="mt-2 text-[0.9375rem] text-muted [overflow-wrap:anywhere]">{job.locations.length ? job.locations.slice(0, 3).join(" · ") + (job.locations.length > 3 ? ` · +${job.locations.length - 3} more` : "") : "Location not supplied"}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5 text-xs" aria-label="Details">
        {remote ? <li className="badge">Remote</li> : job.workplace !== "unknown" ? <li className="badge capitalize">{job.workplace}</li> : null}
        {job.employment_type !== "unknown" && job.employment_type !== "full-time" ? <li className="badge capitalize">{job.employment_type}</li> : null}
        {level !== "not-stated" ? <li className="badge">{JOB_LEVELS.find(l => l.id === level)!.label}</li> : null}
        {job.department ? <li className="badge max-w-full truncate">{job.department}</li> : null}
      </ul>
      {job.salaries.length ? <p className="mt-2.5 text-[0.9375rem] font-medium text-text">{job.salaries.slice(0, 2).map(payText).join(" · ")}<span className="sr-only"> (employer-disclosed base pay range)</span></p> : null}
      {unverified ? <p className="mt-2 text-sm text-ice">Not recently confirmed. Check the employer’s posting for availability.</p> : null}
      <details className="mt-2 text-xs text-muted"><summary className="min-h-8 cursor-pointer">Source and corrections</summary><p className="mt-2">{sourceLine} Posting ID: {job.source_job_id}. Last seen in the feed: <time dateTime={job.last_seen}>{checkedLabel(job.last_seen)}</time>. {job.salaries.length ? "Pay is the employer-disclosed base range; compensation is not guaranteed. " : ""}Unknown fields are not inferred.</p><ExternalLink href={job.source_url}>Source feed</ExternalLink>{siteConfig.contact.email ? <p className="mt-2"><a className="link" href={mailtoHref(siteConfig.contact.email, `Job correction: ${job.title}`, `Job: ${job.id}\nOfficial posting: ${job.official_url}\nDisputed field:\nProposed correction:\nSupporting source:\n`)}>Suggest a correction</a></p> : null}</details>
    </div>
    <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
      <p className="text-sm text-muted"><time dateTime={new Date(posted).toISOString()} title={job.posted_at ? (job.posted_date_kind === "last-published" ? "Last published by the employer" : "Published by the employer") : "First seen in the employer's feed"}>{ageText(posted, now)}</time></p>
      <a href={job.official_url} className="btn btn-primary min-h-10 px-4 text-sm" rel="noopener noreferrer" data-external="true">Apply<span aria-hidden="true">&nbsp;↗</span><span className="sr-only"> for {job.title} at {job.organization_name} on {applyOn} (external site)</span></a>
    </div>
  </article>;
}
/** One-tap searches for common roles; each runs the same text search as the box above. */
const POPULAR = ["Machine learning", "Software engineer", "Research", "Product manager", "Data center", "Sales", "Security", "Internship", "Policy", "Design"];
const STATE_OPTIONS = Object.keys(US_STATES).map(value => ({ value, label: stateDisplayName(value) })).sort((a,b) => a.label.localeCompare(b.label,"en"));
const SCOPE_OPTIONS = LOCATION_SCOPES.map(value => ({ value, label: LOCATION_SCOPE_LABELS[value] }));
const options = (values: string[]) => [...new Set(values)].sort((a,b) => a.localeCompare(b,"en")).map(value => ({ value, label: value }));
export type JobsSummary = { currentCount: number; organizationCount: number; departments: string[]; currencies: string[]; periods: string[] };
export function JobsDirectory({ initial, summary, dataUrl, feeds, coverage, asOf, browse = null }: { initial: JobItem[]; summary: JobsSummary; dataUrl: string; feeds: FeedHealth[]; coverage: CareerCoverage[]; asOf: string; browse?: ReactNode }) {
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
  // Facet counts: each list counts the listings that match every other filter.
  const tally = (rows: JobItem[], key: (j: JobItem) => string) => { const m = new Map<string, number>(); for (const j of rows) { const k = key(j); m.set(k, (m.get(k) ?? 0) + 1); } return m; };
  const levelCounts = useMemo(() => (all ? tally(filterJobs(items, feeds, { ...f, level: "" }, now), j => jobLevel(j.title)) : null), [all, items, feeds, f, now]);
  const categoryCounts = useMemo(() => (all ? tally(filterJobs(items, feeds, { ...f, category: "" }, now), j => jobCategory(j.title)) : null), [all, items, feeds, f, now]);
  const withPay = useMemo(() => results.filter(j => annualUsdTop(j.salaries) !== null).length, [results]);
  // The "Where" box keeps what is typed until it is applied (Enter, Search, or leaving the box).
  const [whereInput, setWhereInput] = useState<string | null>(null);
  const whereValue = whereInput ?? whereText(f, cityName);
  const applyWhere = () => { if (whereInput === null) return; const w = parseWhere(whereInput); setWhereInput(null); set({ where: w.where, state: w.state, city: w.city, location: w.location }); };
  const [showFilters, setShowFilters] = useState(false);
  const quick: { label: string; on: boolean; toggle: Partial<JobFilters> }[] = [
    { label: "Remote (U.S.)", on: f.where === "remote-us", toggle: { where: f.where === "remote-us" ? "" : "remote-us", state: "", city: "", location: "" } },
    { label: "Entry level & new grad", on: f.level === "entry", toggle: { level: f.level === "entry" ? "" : "entry" } },
    { label: "Internships", on: f.level === "intern", toggle: { level: f.level === "intern" ? "" : "intern" } },
    { label: "Shows pay", on: f.salary, toggle: { salary: !f.salary } },
    { label: "$200K+", on: f.pay === "200000", toggle: { pay: f.pay === "200000" ? "" : "200000" } },
    { label: "Posted this week", on: f.posted === "7", toggle: { posted: f.posted === "7" ? "" : "7" } },
  ];
  const chip = (on: boolean) => `inline-flex min-h-9 items-center rounded-full border px-3 text-sm ${on ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-line-strong hover:text-text"}`;
  const levelLabel = (id: string) => JOB_LEVELS.find(l => l.id === id)?.label ?? "Level not stated";
  const categoryLabel = (id: string) => JOB_CATEGORIES.find(c => c.id === id)?.label ?? "Other";
  const companyName = (slug: string) => coverage.find(c => c.slug === slug)?.name ?? slug;
  type Active = { label: string; clear: Partial<JobFilters> } | null;
  const active = ([
    f.q ? { label: `“${f.q}”`, clear: { q: "" } } : null,
    f.where || f.state || f.location ? { label: whereText(f, cityName), clear: { where: "", state: "", city: "", location: "" } } : null,
    f.category ? { label: categoryLabel(f.category), clear: { category: "" } } : null,
    f.level ? { label: levelLabel(f.level), clear: { level: "" } } : null,
    f.pay ? { label: `Pay reaches $${Number(f.pay) / 1000}K+`, clear: { pay: "" } } : null,
    f.salary ? { label: "Shows pay", clear: { salary: false } } : null,
    f.posted ? { label: f.posted === "1" ? "Last 24 hours" : `Last ${f.posted} days`, clear: { posted: "" } } : null,
    f.company ? { label: companyName(f.company), clear: { company: "" } } : null,
    f.role && jobRole(f.role) ? { label: jobRole(f.role)!.name, clear: { role: "" } } : null,
    f.track && jobTrack(f.track) ? { label: jobTrack(f.track)!.title, clear: { track: "" } } : null,
    f.workplace ? { label: `Workplace: ${f.workplace}`, clear: { workplace: "" } } : null,
    f.employment ? { label: f.employment, clear: { employment: "" } } : null,
    f.department ? { label: f.department, clear: { department: "" } } : null,
  ] as Active[]).filter((v): v is NonNullable<Active> => v !== null);
  const facet = (title: string, entries: { id: string; label: string }[], value: string, counts: Map<string, number> | null, key: "level" | "category") =>
    <fieldset className="min-w-0"><legend className="mb-2 text-sm font-medium text-text">{title}</legend>
      <ul className="space-y-1">{entries.map(e => { const n = counts?.get(e.id) ?? null; if (counts && !n && value !== e.id) return null; return <li key={e.id}>
        <button type="button" aria-pressed={value === e.id} onClick={() => set({ [key]: value === e.id ? "" : e.id } as Partial<JobFilters>)} className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 text-left text-sm ${value === e.id ? "bg-cyan/10 text-text ring-1 ring-cyan" : "text-muted hover:bg-white/5 hover:text-text"}`}>
          <span>{e.label}</span>{n !== null ? <span className="tabular-nums text-xs">{n.toLocaleString("en-US")}</span> : null}</button></li>; })}</ul></fieldset>;
  return <>
    <form role="search" aria-label="Job search" className="card p-4 sm:p-6" onSubmit={e => { e.preventDefault(); applyWhere(); (document.activeElement as HTMLElement | null)?.blur(); document.getElementById("job-results")?.scrollIntoView({ block: "start" }); }}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-end">
        <SearchField label="Search jobs" value={f.q} onChange={q => set({ q }, "replace")} placeholder="Job title, skill, or company (ML, SWE, PM work too)" />
        <div><label htmlFor="jobs-where" className="mb-1.5 block text-sm font-medium text-text">Where</label>
          <input id="jobs-where" type="search" className="field" value={whereValue} list="jobs-where-options" autoComplete="off" spellCheck={false} placeholder="City, state, or “Remote”" onChange={e => setWhereInput(e.target.value)} onBlur={applyWhere} />
          <datalist id="jobs-where-options">{["Remote", "Remote (U.S.)", "San Francisco, CA", "New York, NY", "Seattle, WA", "Mountain View, CA", "Austin, TX", "Boston, MA", "California", "New York", "Washington", "Texas"].map(v => <option key={v} value={v} />)}</datalist></div>
        <button type="submit" className="btn btn-primary min-h-11 px-6">Search</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Quick filters">
        {quick.map(q => <button key={q.label} type="button" aria-pressed={q.on} onClick={() => set(q.toggle)} className={chip(q.on)}>{q.label}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Popular searches" role="group">
        <span className="text-sm text-muted">Popular:</span>
        {POPULAR.map(q => <button key={q} type="button" aria-pressed={f.q.toLowerCase() === q.toLowerCase()} onClick={() => set({ q: f.q.toLowerCase() === q.toLowerCase() ? "" : q })} className={chip(f.q.toLowerCase() === q.toLowerCase())}>{q}</button>)}
      </div>
      <noscript><p className="mt-3 text-sm text-muted">Filtering and paging require JavaScript. The first 30 recently confirmed listings as of {checkedLabel(asOf)} appear below. Employer career links in Coverage & source health show all available opportunities.</p></noscript>
    </form>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-3"><p className="text-[0.9375rem] text-muted"><strong className="text-text">{currentCount.toLocaleString("en-US")}</strong> open jobs at <strong className="text-text">{count}</strong> U.S. AI companies and labs, each checked against the employer&rsquo;s own job board twice a day.</p><a href="#job-sources" className="link text-sm">Coverage & source health</a></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside aria-label="Job filters" className="min-w-0">
        <button type="button" className="btn btn-secondary w-full lg:hidden" aria-expanded={showFilters} aria-controls="job-filter-panel" onClick={() => setShowFilters(v => !v)}>{showFilters ? "Hide filters" : `Filters${active.length ? ` (${active.length})` : ""}`}</button>
        <div id="job-filter-panel" className={`${showFilters ? "mt-4 block" : "hidden"} space-y-6 lg:sticky lg:top-20 lg:mt-0 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1`}>
          {facet("Job category", [...JOB_CATEGORIES, { id: "other", label: "Other" }], f.category, categoryCounts, "category")}
          {facet("Experience level", [...JOB_LEVELS, { id: "not-stated", label: "Level not stated" }], f.level, levelCounts, "level")}
          <SelectField label="Pay range reaches" value={f.pay} options={PAY_THRESHOLDS.map(v => ({ value: v, label: `$${Number(v) / 1000}K+ a year` }))} onChange={pay => set({ pay })} allLabel="Any pay" />
          <SelectField label="Date posted" value={f.posted} options={[{ value: "1", label: "Last 24 hours" }, { value: "3", label: "Last 3 days" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }]} onChange={posted => set({ posted })} allLabel="Any time" />
          <SelectField label="Workplace type" value={f.workplace} options={options(["remote", "hybrid", "on-site", "unknown"])} onChange={workplace => set({ workplace })} />
          <SelectField label="Company or lab" value={f.company} options={coverage.map(c => ({ value: c.slug, label: c.name }))} onChange={company => set({ company })} allLabel="All organizations" />
          {JOB_ROLES.length ? <SelectField label="Role" value={f.role} options={JOB_ROLES.map(r => ({ value: r.slug, label: r.name }))} onChange={role => set({ role })} allLabel="All roles" /> : null}
          <SelectField label="Career track" value={f.track} options={JOB_TRACKS.map(t => ({ value: t.id, label: t.title }))} onChange={track => set({ track })} allLabel="All tracks" />
          <SelectField label="U.S. state named in location" value={f.state} options={STATE_OPTIONS} onChange={state => set({ state, city: "" })} allLabel="Any location" />
          {f.state && cityOptions.length ? <SelectField label="City" value={f.city} options={cityOptions} onChange={city => set({ city })} allLabel={`Anywhere in ${stateDisplayName(f.state)}`} /> : null}
          <SelectField<LocationScope> label="Remote and U.S. locations" value={f.where} options={SCOPE_OPTIONS} onChange={where => set({ where })} allLabel="All listings" />
          <SelectField label="Employment type" value={f.employment} options={options(["full-time", "part-time", "contract", "temporary", "internship", "unknown"])} onChange={employment => set({ employment })} />
          <SelectField label="Department" value={f.department} options={departments} onChange={department => set({ department })} allLabel="All supplied departments" />
          <details><summary className="min-h-11 cursor-pointer text-sm text-ice">Salary and date filters</summary><div className="mt-3 grid gap-4">
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={f.salary} onChange={e => set({ salary: e.target.checked })} className="h-6 w-6" />Employer supplies salary</label>
            <SelectField label="Salary currency" value={f.currency} options={options(summary.currencies)} onChange={currency => set({ currency, salary_min: "" })} />
            <SelectField label="Salary period" value={f.period} options={options(summary.periods)} onChange={period => set({ period, salary_min: "" })} />
            <label className="text-sm">Minimum of disclosed range<input className="field mt-1.5" type="number" min="0" max="999999999" step="0.01" disabled={!f.currency || !f.period} value={f.salary_min} onChange={e => set({ salary_min: e.target.value }, "replace")} /><span className="mt-1 block text-xs text-muted">Choose a currency and period first. No conversion.</span></label>
            <SelectField label="Seen within" value={f.verified} options={[{value:"24",label:"24 hours"},{value:"48",label:"48 hours"}]} onChange={verified => set({verified})} />
            <SelectField label="Listing verification" value={f.view === "current" ? "" : f.view} options={[{value:"unverified",label:"Older listings / source needs attention"}]} onChange={view => set({view: view || "current"})} allLabel="Recently confirmed only" />
          </div></details>
          <details className="text-xs text-muted"><summary className="min-h-9 cursor-pointer">How category, level, and pay are read</summary><div className="mt-2 space-y-2"><p>Category and experience level come from the employer&rsquo;s job title only; a title that names no level shows as &ldquo;Level not stated&rdquo;. Levels: {JOB_LEVELS.map(l => `${l.label}: ${l.rule}`).join("; ")}.</p><p>&ldquo;Pay range reaches&rdquo; uses U.S.-dollar base ranges the employer discloses (hourly × 2,080). {all ? `${withPay.toLocaleString("en-US")} of these ${results.length.toLocaleString("en-US")} listings disclose U.S.-dollar pay.` : ""}</p></div></details>
          <button type="button" className="link min-h-11 text-sm" onClick={() => { setWhereInput(null); update({...DEFAULT_JOB_FILTERS}); }}>Clear job filters</button>
        </div>
      </aside>
      <section id="job-results" aria-label="Job results" className="min-w-0 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ResultSummary visible={visible.length} total={total} pending={waiting} noun={["matching position","matching positions"]} announce={announce} />
          <div className="w-full sm:w-60"><SelectField label="Sort jobs" value={f.sort === "verified" || f.sort === "newest" ? "" : f.sort} options={[{value:"pay",label:"Highest pay first"},{value:"company",label:"Company (A–Z)"},{value:"title",label:"Title (A–Z)"}]} onChange={sort => set({sort: sort || "verified"})} allLabel={f.q ? "Best match, then newest" : "Newest first"} /></div>
        </div>
        {active.length ? <div className="mt-3 flex flex-wrap items-center gap-2"><ul aria-label="Active filters" className="flex flex-wrap gap-2">{active.map(a => <FilterChip key={a.label} label={a.label} onRemove={() => { if ("where" in a.clear) setWhereInput(null); set(a.clear); }} />)}</ul><button type="button" className="link min-h-9 text-sm" onClick={() => { setWhereInput(null); update({...DEFAULT_JOB_FILTERS}); }}>Clear all</button></div> : null}
        {f.company && coverage.some(c => c.slug === f.company && c.mode === "automated") ? <p className="mt-3 text-sm text-muted" data-testid="jobs-company-page">Shareable page for this employer: <Link href={`/jobs/at/${f.company}/`} className="link">Jobs at {companyName(f.company)}</Link></p> : null}
        {f.role && jobRole(f.role) ? <p className="mt-3 max-w-3xl text-sm text-muted" data-testid="jobs-role-filter"><span className="badge mr-2 border-[rgba(76,201,255,0.45)]">Role: {jobRole(f.role)!.name}</span>Shareable page: <Link href={`/jobs/role/${f.role}/`} className="link">{jobRole(f.role)!.h1}</Link>. {jobRole(f.role)!.rule} <button type="button" className="link min-h-11" onClick={() => set({ role: "" })}>Clear role</button></p> : null}
        {f.track && jobTrack(f.track) ? <p className="mt-3 max-w-3xl text-sm text-muted"><strong className="text-text">How this track is selected:</strong> {jobTrack(f.track)!.rule} It uses only what employers supply; listings with unclear titles may be missed.</p> : null}
        {f.city ? <p className="mt-3 text-sm text-text" data-testid="jobs-city-filter"><span className="badge mr-2 border-[rgba(76,201,255,0.45)]">City: {cityName}, {f.state}</span><button type="button" className="link min-h-11" onClick={() => set({ city: "" })}>Show all of {stateDisplayName(f.state)}</button></p> : null}
        {f.state || f.where ? <details className="mt-3 max-w-3xl text-sm text-muted"><summary className="min-h-9 cursor-pointer text-ice">How locations are read</summary><p className="mt-2">{f.state ? `A listing matches ${f.city ? `${cityName}, ${stateDisplayName(f.state)}` : stateDisplayName(f.state)} when one of its employer-supplied locations names it, for example “Atlanta, GA”, “Atlanta, Georgia, United States”, or a city on its own that has only one well-known U.S. match, such as “Atlanta” or “SF Office”; “Remote - US” names no state. ` : ""}{f.where && f.where !== "us" ? "Remote means the employer marks the workplace as remote or a listed location says “Remote”. " : ""}{f.where === "us" || f.where === "remote-us" ? "U.S. locations only means the listing names the United States or a U.S. state and no place outside it. " : ""}It uses only what employers supply. <Link href="/jobs/remote-us/" className="link">About remote jobs with U.S. locations</Link></p></details> : null}
        {failed ? <p className="mt-4 text-sm text-muted">The full list could not be loaded, so only the first 30 recently confirmed positions are shown. Official careers links under Coverage & source health list every opening.</p> : null}
        <div className="mt-4">{waiting ? <div className="card p-8 text-muted" aria-busy="true">Loading all positions…</div> : visible.length ? <ul className="grid gap-3">{visible.map(job => <li key={job.id}><JobCard job={job} unverified={f.view === "unverified"} now={now} /></li>)}</ul> : <div className="card p-8"><h2 className="text-xl text-text">No positions match this view</h2><p className="mt-3 text-muted">This does not mean the organization has no openings. It may have no automated source, a source needing attention, or no matching listings. Try removing a filter, or use the official careers links below.</p></div>}</div>
        {pageCount > 1 ? <nav aria-label="Job results pages" className="my-6 flex flex-wrap items-center justify-center gap-4"><button className="btn btn-secondary" disabled={page === 1} onClick={() => { set({page: page-1}); document.getElementById("job-results")?.scrollIntoView({ block: "start" }); }}>Previous</button><span className="text-sm text-muted">Page {page} of {pageCount}</span><button className="btn btn-secondary" disabled={page === pageCount} onClick={() => { set({page: page+1}); document.getElementById("job-results")?.scrollIntoView({ block: "start" }); }}>Next</button></nav> : null}
      </section>
    </div>
    {browse}
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
