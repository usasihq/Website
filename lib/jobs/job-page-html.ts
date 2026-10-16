/**
 * The HTML of one job's page, written by scripts/job-pages.ts after `next
 * build`. Job pages are plain static HTML rather than Next.js routes: with
 * thousands of postings, a React page per job would add several files and
 * hundreds of kilobytes each. These pages need no JavaScript, use the site's
 * stylesheet and fonts, and carry the JobPosting data for Google's job search.
 *
 * Every value is escaped; the description comes from the validated structure
 * in description.ts, never from employer HTML.
 */
import { formatDate } from "../dates";
import { absoluteUrl, asset } from "../paths";
import { siteConfig, supportState } from "../site-config";
import type { Description, Run } from "./description";
import type { JobPage } from "./job-pages";
import { jobPostingLd, jobSnippet } from "./job-pages";
import { DEFAULT_JOB_FILTERS, serializeJobFilters } from "./search";
import { JOB_ROLES } from "./roles";

export type PageShell = {
  /** The <html> element's class (font variables), copied from a built page. */
  htmlClass: string;
  /** Stylesheet, font preload, and icon <link> tags, copied from a built page. */
  links: string;
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

const external = (href: string, label: string, cls = "link") =>
  `<a href="${esc(href)}" class="${cls} inline-flex max-w-full items-baseline gap-0.5 break-words" rel="noopener noreferrer" data-external="true"><span class="min-w-0 [overflow-wrap:anywhere]">${label}</span><span aria-hidden="true">&nbsp;↗</span><span class="sr-only"> (external site)</span></a>`;

function runs(rs: Run[]): string {
  return rs
    .map((r) => {
      let s = esc(r.t);
      if (r.i) s = `<em>${s}</em>`;
      if (r.b) s = `<strong class="font-semibold text-text">${s}</strong>`;
      if (r.href) s = external(r.href, s);
      return s;
    })
    .join("");
}

function description(d: Description): string {
  return d
    .map((b) =>
      b.type === "h"
        ? `<h3 class="pt-2 text-lg font-semibold text-text">${runs(b.runs)}</h3>`
        : b.type === "p"
          ? `<p>${runs(b.runs)}</p>`
          : `<${b.type} class="${b.type === "ul" ? "list-disc" : "list-decimal"} space-y-1.5 pl-6">${b.items.map((i) => `<li>${runs(i)}</li>`).join("")}</${b.type}>`,
    )
    .join("\n");
}

const PERIOD: Record<string, string> = { hour: "per hour", day: "per day", week: "per week", month: "per month", year: "per year" };
const money = (v: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
/** One pay line for a similar-job card: "$180K–$250K a year" for U.S. dollars, otherwise the full range. */
function payLine(s: JobPage["job"]["salaries"][number]): string {
  const per = PERIOD[s.period] ?? `per ${s.period}`;
  if (s.currency === "USD" && s.period === "year") {
    const k = (n: number) => `$${Math.round(n / 1000)}K`;
    return s.min !== null && s.max !== null ? `${k(s.min)}–${k(s.max)} a year` : `${k((s.min ?? s.max)!)} a year`;
  }
  return s.min !== null && s.max !== null ? `${money(s.min, s.currency)} to ${money(s.max, s.currency)} ${per}` : `${money((s.min ?? s.max)!, s.currency)} ${per}`;
}
const shortOrg = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, "").trim();

/** The page title: role, employer, and first location when it fits. */
export function jobPageTitle(p: JobPage): string {
  const org = shortOrg(p.org.name);
  const where = p.job.locations[0];
  return [`${p.job.title} at ${org}${where ? `, ${where}` : ""}`, `${p.job.title} at ${org}`, p.job.title].find((t) => t.length <= 70) ?? p.job.title.slice(0, 70);
}

/** The compact "Support Us" panel, as components/SupportPanel.tsx renders it. */
function supportPanel(): string {
  const config = siteConfig.support;
  if (!config.enabled) return "";
  const { active, amountLinks } = supportState(config);
  const heart =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>';
  const actions = active
    ? `<div class="flex flex-wrap gap-2 md:justify-end"><a href="${esc(config.tipUrl!)}" class="btn btn-primary" rel="noopener noreferrer">Leave a tip<span class="sr-only">${esc(config.providerLabel ? ` on ${config.providerLabel} (external site)` : " (external site)")}</span></a>${amountLinks
        .map((l) => `<a href="${esc(l.url)}" class="btn btn-secondary" rel="noopener noreferrer">${esc(l.label)}<span class="sr-only"> tip (external site)</span></a>`)
        .join("")}</div><p class="max-w-xs text-sm text-muted md:text-right">Optional. No USASI account required. Payment takes place on the linked provider&rsquo;s website${esc(config.providerLabel ? ` (${config.providerLabel})` : "")}.</p>`
    : `<p class="inline-flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-2.5 text-[0.9375rem] text-ice" data-testid="support-unavailable">Tips will be available here soon.</p>`;
  return `<section aria-labelledby="support-heading" class="print:hidden py-10" data-support-panel="${active ? "active" : "unconfigured"}"><div class="container-page"><div class="relative overflow-hidden rounded-2xl border border-[rgba(76,201,255,0.28)] bg-[linear-gradient(135deg,#0b1428_0%,#081022_60%,#0a1530_100%)] p-5 sm:p-6"><div aria-hidden="true" class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(76,201,255,0.14),transparent_70%)]"></div><div class="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8"><div class="flex gap-4"><span aria-hidden="true" class="mt-1 inline-flex shrink-0 items-center justify-center rounded-full border border-[rgba(76,201,255,0.35)] text-cyan h-9 w-9">${heart}</span><div class="min-w-0"><h2 id="support-heading" class="font-semibold text-text text-lg">${esc(config.heading)}</h2><p class="mt-1 text-ice text-[0.9375rem]">${esc(config.subheading)}</p>${
    active ? "" : `<p class="mt-3 max-w-2xl text-muted text-[0.9375rem]">${esc(config.body)}</p>`
  }</div></div><div class="flex flex-col gap-3 md:items-end">${actions}<a href="${asset("/support/")}" class="link inline-flex items-center gap-1 text-[0.9375rem]">About supporting this project<span aria-hidden="true">&nbsp;→</span></a></div></div></div></div></section>`;
}

export function renderJobPage(p: JobPage, shell: PageShell, similar: JobPage[] = []): string {
  const { job, org } = p;
  const name = shortOrg(org.name);
  const board = ({ greenhouse: "Greenhouse", ashby: "Ashby", lever: "Lever" } as const)[job.source_type];
  const apply = job.apply_url ?? job.official_url;
  const url = absoluteUrl(p.path);
  const title = `${jobPageTitle(p)} · ${siteConfig.shortName}`;
  const meta = jobSnippet(p) ?? `${job.title} at ${name}${job.locations[0] ? ` in ${job.locations[0]}` : ""}. Apply on ${name}'s own job board.`;
  const image = absoluteUrl(`/og/jobs/at-${org.slug}.jpg`);
  const ld = jobPostingLd(p);
  const crumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Jobs", item: absoluteUrl("/jobs/") },
    { name: `Jobs at ${name}`, item: absoluteUrl(`/jobs/at/${org.slug}/`) },
    { name: job.title, item: url },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  };

  const facts: [string, string][] = [
    ["Employer", `<a href="${asset(`/jobs/at/${esc(org.slug)}/`)}" class="link">${esc(org.name)}</a>`],
    ["Location", job.locations.length ? esc(job.locations.join(" · ")) : "Not supplied by the employer"],
    ["Workplace", job.workplace !== "unknown" ? esc(job.workplace) : "Not supplied"],
    ["Employment", job.employment_type !== "unknown" ? esc(job.employment_type) : "Not supplied"],
  ];
  if (job.department) facts.push(["Department", esc(job.department)]);
  if (job.team && job.team !== job.department) facts.push(["Team", esc(job.team)]);
  for (const s of job.salaries.slice(0, 4)) {
    const range = s.min !== null && s.max !== null ? `${money(s.min, s.currency)} to ${money(s.max, s.currency)}` : money((s.min ?? s.max)!, s.currency);
    facts.push([s.label ? `Salary (${esc(s.label)})` : "Salary", `${esc(range)} ${PERIOD[s.period]}, as the employer lists it`]);
  }
  if (job.posted_at) facts.push([job.posted_date_kind === "last-published" ? "Last published" : "Published", `<time datetime="${esc(job.posted_at)}">${formatDate(job.posted_at.slice(0, 10))}</time>`]);
  facts.push(["First listed on USASI", `<time datetime="${esc(job.first_seen)}">${formatDate(job.first_seen.slice(0, 10))}</time>`]);
  const sameDepartment = job.department
    ? `/jobs/?${serializeJobFilters({ ...DEFAULT_JOB_FILTERS, company: org.slug, department: job.department, sort: "newest" })}`
    : null;
  const socials = siteConfig.socials.map((s) => `<li>${external(s.url, esc(s.label))}</li>`).join("");
  const nav = [
    ["/companies/", "Companies &amp; Labs"],
    ["/open/", "Open Models &amp; Tools"],
    ["/learn/", "Learn"],
    ["/jobs/", "Jobs"],
    ["/news/", "News"],
    ["/people/", "People"],
    ["/about/", "About"],
  ]
    .map(([href, label]) => `<li><a href="${asset(href)}" class="text-muted hover:text-text${href === "/jobs/" ? " text-text" : ""}"${href === "/jobs/" ? ' aria-current="true"' : ""}>${label}</a></li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en" class="${esc(shell.htmlClass)}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="theme-color" content="#050816"/>
<meta name="color-scheme" content="dark"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}"/>
<meta name="robots" content="${p.description ? "index, follow, max-image-preview:large, max-snippet:-1" : "noindex, follow"}"/>
<link rel="canonical" href="${esc(url)}"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="${esc(jobPageTitle(p))}"/>
<meta property="og:description" content="${esc(meta)}"/>
<meta property="og:url" content="${esc(url)}"/>
<meta property="og:site_name" content="${esc(siteConfig.name)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta name="twitter:card" content="summary_large_image"/>
${shell.links}
${ld ? `<script type="application/ld+json">${json(ld)}</script>` : ""}
<script type="application/ld+json">${json(breadcrumbLd)}</script>
</head>
<body>
<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>
<div class="border-b border-line"><div class="container-page flex h-7 items-center text-xs sm:text-[0.8125rem]"><p class="min-w-0 truncate text-muted" data-testid="header-disclaimer">Independent project. Not a U.S. government website.</p></div></div>
<header class="border-b border-line"><div class="container-page flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
<a href="${asset("/")}" class="text-lg font-semibold tracking-wide text-text">USASI</a>
<nav aria-label="Primary"><ul class="flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">${nav}</ul></nav>
</div></header>
<main id="main">
<header class="border-b border-line bg-[linear-gradient(180deg,rgba(11,18,36,0.6),transparent)]"><div class="container-page pb-10 pt-10 sm:pt-14">
<nav aria-label="Breadcrumb" class="mb-5"><ol class="flex flex-wrap items-center gap-1 text-sm text-muted">${crumbs
    .slice(0, 3)
    .map((c, i) => `<li class="flex items-center gap-1">${i ? '<span aria-hidden="true">›</span>' : ""}<a href="${esc(c.item.replace(/^https?:\/\/[^/]+/, ""))}" class="hover:text-text">${esc(c.name)}</a></li>`)
    .join("")}</ol></nav>
<p class="eyebrow">Job at ${esc(name)}</p>
<h1 class="mt-2 text-3xl font-semibold text-text sm:text-4xl break-words">${esc(job.title)}</h1>
<dl class="mt-6 grid max-w-3xl gap-x-6 gap-y-2 text-[0.9375rem] sm:grid-cols-[auto_1fr]" data-testid="job-facts">${facts
    .map(([k, v]) => `<dt class="text-muted">${k}</dt><dd class="min-w-0 text-text [overflow-wrap:anywhere]">${v}</dd>`)
    .join("")}</dl>
<p class="mt-6 flex flex-wrap items-center gap-4" data-testid="job-apply">${external(apply, `Apply on ${esc(name)}&rsquo;s site`, "btn btn-primary")}${
    job.apply_url && job.apply_url !== job.official_url ? external(job.official_url, `View the posting on ${esc(name)}&rsquo;s job board`) : ""
  }</p>
</div></header>
<div class="container-page grid gap-10 py-10 sm:py-12">
<p class="max-w-3xl rounded-xl border border-line p-4 text-sm text-muted" role="note">This posting comes from ${esc(org.name)}&rsquo;s own ${board} job board. USASI checks that board twice a day and removes this page once the employer closes the posting. The description below is ${esc(name)}&rsquo;s text as published; USASI does not edit it, does not recruit, and does not take applications. <a href="${asset("/methodology/#jobs")}" class="link">How jobs are collected</a>.</p>
<section aria-labelledby="description-heading">
<h2 id="description-heading" class="text-xl font-semibold text-text sm:text-2xl">Job description</h2>
<div class="mt-4 max-w-3xl space-y-4 text-[1.0625rem] leading-relaxed text-[#d5def2]" data-testid="job-description">
${p.description ? description(p.description) : `<p class="text-muted">The full description is on ${external(job.official_url, `${esc(name)}&rsquo;s job board`)}.</p>`}
</div>
<p class="mt-8">${external(apply, `Apply on ${esc(name)}&rsquo;s site`, "btn btn-secondary")}</p>
</section>
${similar.length ? `<section aria-labelledby="similar-jobs-heading" class="border-t border-line pt-8" data-testid="similar-jobs">
<h2 id="similar-jobs-heading" class="text-xl font-semibold text-text sm:text-2xl">Similar jobs</h2>
<ul class="mt-4 grid gap-3 md:grid-cols-2">${similar
    .map((q) => `<li class="card p-4"><p class="text-sm text-muted">${esc(shortOrg(q.org.name))}</p><p class="mt-1 font-semibold text-text"><a href="${esc(asset(q.path))}" class="hover:underline hover:decoration-cyan hover:underline-offset-4">${esc(q.job.title)}</a></p><p class="mt-1 text-sm text-muted [overflow-wrap:anywhere]">${esc(q.job.locations.slice(0, 2).join(" · ") || "Location not supplied")}</p>${q.job.salaries[0] ? `<p class="mt-1 text-sm text-text">${esc(payLine(q.job.salaries[0]))}</p>` : ""}</li>`)
    .join("")}</ul>
</section>` : ""}
<nav aria-labelledby="more-jobs-heading" class="border-t border-line pt-6">
<h2 id="more-jobs-heading" class="eyebrow">More jobs</h2>
<ul class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
<li><a href="${asset(`/jobs/at/${esc(org.slug)}/`)}" class="link">All jobs at ${esc(name)}</a></li>
${sameDepartment ? `<li><a href="${esc(asset(sameDepartment))}" class="link">${esc(job.department!)} jobs at ${esc(name)}</a></li>` : ""}
${JOB_ROLES.filter((r) => r.test(job.title)).slice(0, 2).map((r) => `<li><a href="${asset(`/jobs/role/${r.slug}/`)}" class="link">All ${esc(r.h1)}</a></li>`).join("")}
<li><a href="${asset("/jobs/")}" class="link">Search all jobs</a></li>
<li><a href="${asset(`/companies/${esc(org.slug)}/`)}" class="link">About ${esc(name)}</a></li>
<li><a href="${asset("/contribute/#corrections")}" class="link">Report a problem with this listing</a></li>
</ul>
</nav>
</div>
${supportPanel()}
</main>
<footer class="border-t border-line"><div class="container-page grid gap-4 py-10 text-sm text-muted">
<p><strong class="text-text">${esc(siteConfig.name)}.</strong> Independent project. Not a United States government website.</p>
<ul class="flex flex-wrap gap-x-5 gap-y-2"><li><a href="${asset("/jobs/")}" class="link">Jobs</a></li><li><a href="${asset("/methodology/#jobs")}" class="link">Jobs methodology</a></li><li><a href="${asset("/privacy/")}" class="link">Privacy</a></li><li><a href="${asset("/disclaimer/")}" class="link">Disclaimer</a></li><li><a href="${asset("/contribute/#corrections")}" class="link">Corrections</a></li></ul>
<ul class="flex flex-wrap gap-x-5 gap-y-2" aria-label="USASI elsewhere">${socials}</ul>
<p>Job titles and descriptions are the employers&rsquo; own text, shown as published on their job boards; they are not covered by USASI&rsquo;s CC BY 4.0 license.</p>
</div></footer>
</body>
</html>
`;
}
