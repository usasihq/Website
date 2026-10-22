/**
 * Plain HTML for a listing URL that is no longer current. No JavaScript and
 * no JobPosting data. The Worker and the static preview server both render
 * this after a 410 so Google drops the URL and visitors still see open roles.
 */
import { documentTitle } from "../metadata";
import { asset } from "../paths";
import { siteConfig } from "../site-config";
import { closedJobView, parseJobListingPath, type ClosedJobCard, type ClosedJobIndex, type JobListingPath } from "./closed-job";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function cards(jobs: ClosedJobCard[], testId: string): string {
  return `<ul class="mt-4 grid gap-3 md:grid-cols-2" data-testid="${testId}">${jobs
    .map(
      (j) =>
        `<li class="card p-4"><p class="text-sm text-muted">${esc(j.orgName)}</p><p class="mt-1 font-semibold text-text"><a href="${esc(asset(j.path))}" class="hover:underline hover:decoration-cyan hover:underline-offset-4">${esc(j.title)}</a></p>${
          j.location ? `<p class="mt-1 text-sm text-muted [overflow-wrap:anywhere]">${esc(j.location)}</p>` : ""
        }</li>`,
    )
    .join("")}</ul>`;
}

export function renderClosedJobPage(index: ClosedJobIndex, hit: JobListingPath): string {
  const view = closedJobView(index, hit);
  const title = documentTitle("This role has closed");
  const who = view.titleGuess ? `${view.titleGuess} at ${view.companyName}` : `This role at ${view.companyName}`;
  const meta = `${who} is no longer listed. See open roles at ${view.companyName} and similar jobs at other U.S. AI employers.`;
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
  const socials = siteConfig.socials.map((s) => `<li><a href="${esc(s.url)}" class="link" rel="noopener noreferrer">${esc(s.label)}<span class="sr-only"> (external site)</span></a></li>`).join("");

  return `<!DOCTYPE html>
<html lang="en" class="${esc(index.shell.htmlClass)}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="theme-color" content="#f7f8fa" media="(prefers-color-scheme: light)"/>
<meta name="theme-color" content="#050816" media="(prefers-color-scheme: dark)"/>
<meta name="color-scheme" content="light dark"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}"/>
<meta name="robots" content="noindex, follow"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://upload.wikimedia.org; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"/>
${index.shell.links}
</head>
<body>
<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>
<header>
<div class="border-b border-t-4 border-b-line border-t-gold bg-fog/50"><div class="container-page flex h-7 items-center text-xs sm:text-[0.8125rem]"><p class="min-w-0 truncate text-muted" data-testid="header-disclaimer">Independent project. Not a U.S. government website.</p></div></div>
<div class="border-b border-line"><div class="container-page flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
<a href="${asset("/")}" class="text-lg font-semibold tracking-wide text-text">USASI</a>
<nav aria-label="Primary"><ul class="flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">${nav}</ul></nav>
</div></div>
</header>
<main id="main" data-testid="closed-job">
<header class="border-b border-line bg-[linear-gradient(180deg,var(--hero-tint),transparent)]"><div class="container-page pb-10 pt-10 sm:pt-14">
<nav aria-label="Breadcrumb" class="mb-5"><ol class="flex flex-wrap items-center gap-1 text-sm text-muted">
<li><a href="${asset("/")}" class="hover:text-text">Home</a></li>
<li class="flex items-center gap-1"><span aria-hidden="true">›</span><a href="${asset("/jobs/")}" class="hover:text-text">Jobs</a></li>
${view.jobsPath ? `<li class="flex items-center gap-1"><span aria-hidden="true">›</span><a href="${esc(asset(view.jobsPath))}" class="hover:text-text">Jobs at ${esc(view.companyName)}</a></li>` : ""}
</ol></nav>
<p class="eyebrow">410 · Listing closed</p>
<h1 class="mt-2 text-3xl font-semibold text-text sm:text-4xl">This role has closed</h1>
<p class="mt-4 max-w-2xl text-lg text-muted">${esc(who)} is no longer on the employer&rsquo;s job board. USASI removes a listing page once the posting leaves the current feed, so this address is not an open job.</p>
</div></header>
<div class="container-page grid gap-10 py-10 sm:py-12">
${
  view.companyJobs.length
    ? `<section aria-labelledby="closed-company-heading">
<h2 id="closed-company-heading" class="text-xl font-semibold text-text sm:text-2xl">Open roles at ${esc(view.companyName)}</h2>
<p class="mt-2 max-w-2xl text-muted">${esc(view.companyName)} still has current listings on USASI.</p>
${cards(view.companyJobs, "closed-job-company")}
</section>`
    : ""
}
${
  view.similarJobs.length
    ? `<section aria-labelledby="closed-similar-heading">
<h2 id="closed-similar-heading" class="text-xl font-semibold text-text sm:text-2xl">Similar open roles</h2>
<p class="mt-2 max-w-2xl text-muted">Same kind of work at other employers, matched from the title in this address.</p>
${cards(view.similarJobs, "closed-job-similar")}
</section>`
    : ""
}
<nav aria-labelledby="closed-more-heading" class="border-t border-line pt-6">
<h2 id="closed-more-heading" class="eyebrow">More jobs</h2>
<ul class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]" data-testid="closed-job-links">
${view.jobsPath ? `<li><a href="${esc(asset(view.jobsPath))}" class="link">All jobs at ${esc(view.companyName)}</a></li>` : ""}
${view.companyPath ? `<li><a href="${esc(asset(view.companyPath))}" class="link">About ${esc(view.companyName)}</a></li>` : ""}
<li><a href="${asset("/jobs/")}" class="link">Search all jobs</a></li>
<li><a href="${asset("/jobs/fellowships/")}" class="link">Fellowships and postdocs</a></li>
<li><a href="${asset("/methodology/#jobs")}" class="link">How jobs are collected</a></li>
</ul>
</nav>
</div>
</main>
<footer class="theme-dark border-t-4 border-gold bg-[var(--footer-bg)]"><div class="container-page grid gap-4 py-10 text-sm text-muted">
<p><strong class="text-text">${esc(siteConfig.name)}.</strong> Independent project. Not a United States government website.</p>
<ul class="flex flex-wrap gap-x-5 gap-y-2"><li><a href="${asset("/jobs/")}" class="link">Jobs</a></li><li><a href="${asset("/methodology/#jobs")}" class="link">Jobs methodology</a></li><li><a href="${asset("/privacy/")}" class="link">Privacy</a></li><li><a href="${asset("/disclaimer/")}" class="link">Disclaimer</a></li></ul>
<ul class="flex flex-wrap gap-x-5 gap-y-2" aria-label="USASI elsewhere">${socials}</ul>
</div></footer>
</body>
</html>
`;
}

export function closedJobResponse(index: ClosedJobIndex, pathname: string): { status: 410; html: string } | null {
  const hit = parseJobListingPath(pathname);
  if (!hit) return null;
  return { status: 410, html: renderClosedJobPage(index, hit) };
}
