# Jobs: operations and editorial policy

## Architecture audit

Jobs extends the existing Next.js App Router static export (`next.config.ts`) and
Cloudflare static-assets deployment (`wrangler.jsonc`). A small Worker runs only
on `/jobs/at/*` so a listing that has left the feed returns HTTP 410 instead of
the catalog 404. It adds no database, account system, external runtime scripts,
application tracking, or CSP permissions.
The audit covered `app/`, `components/`, organization/artifact YAML, editorial MDX,
`lib/{schema,validate,catalog,search,routes,metadata,site-config,enums,labels}.ts`,
`useQueryState`, source/badge/filter/link components, home/company/directory routes,
sitemap/robots, `scripts/{generate-data,postbuild,check-links,test-basepath}`, headers,
CI/deployment workflows, unit/browser/accessibility tests, and content methodology.
No repository AGENTS.md was present in this checkout.

The organization catalog alone defines membership. `careers` extends, rather than
replaces, `hiring_url`. Existing career links remain useful when automation is not
configured. Every career config cites ordinary organization source IDs. Board IDs
cannot contain paths. A board cannot be assigned to multiple organizations (including
parent/subsidiary records). Reassigning a board requires review, not automatic sharing.

## Source onboarding

1. Start with a published, eligible organization, not a new job record.
2. Read the official employer careers directory and follow its application links.
   Verify the ATS board identity and public API, source behavior and applicable terms.
3. Record source evidence, actual review date, public HTTPS careers URL, provider and
   board identifier in the organization YAML. Do not change other editorial review
   dates merely because career configuration changed.
4. `greenhouse`, `ashby`, `lever`, and `usajobs` have implemented adapters (Lever: the documented public postings API, `https://api.lever.co/v0/postings/<company>?mode=json`, with `jobs.lever.co` posting links). `manual` and `unsupported`
   require an explanatory note and `enabled: false`; they display a careers link,
   not a zero count. No Workday/HTML scraping/aggregator adapters are claimed.
   USAJOBS uses the official Search API (`https://data.usajobs.gov/api/search`) with
   keyword queries, control-number de-duplication, a relevance filter, and the
   announcement close date. Requests send `Host: data.usajobs.gov`, `User-Agent`
   (registered email, default `usasi@usasihq.com`), and
   `Authorization-Key` from `USAJOBS_API_KEY`. If that env var is missing, refresh
   skips USAJOBS and does not fail. Never commit the key.
5. `posting_hosts` is an exact, editor-reviewed allowlist for employer-owned custom
   posting destinations. Normally keep it empty; ATS-hosted links must match the
   configured tenant path. A malicious feed cannot grant itself an allowed host.
6. Run `npm run jobs:refresh`, inspect output, run validation/tests/build, then review
   the source association and displayed fields before publishing.

Initial verified associations (2026-09-30):
- Anthropic: https://www.anthropic.com/careers/jobs links to its Greenhouse board.
- OpenAI: https://openai.com/careers/search/ links to its Ashby board.

Provider documentation read for this implementation:
- https://docs.greenhouse.io/job-board.html (public GET, post IDs vs internal IDs)
- https://developers.ashbyhq.com/docs/public-job-posting-api (listed flag, optional
  values, latest publication, compensation components and intervals)

These APIs are public reading endpoints; public availability is not an assertion of
an unrestricted content license. We retain factual fields, outbound links, and (since
2026-10-14, by the owner's decision) each posting's description as the employer
publishes it, so every current job can have its own page that qualifies for Google's
job search. We never keep applicant questions, contacts, or resumes. Employer material
is not relicensed under USASI's original-prose license; job pages say the description
is the employer's text and link to the employer to apply. Review
provider/employer terms again when expanding coverage; disable any disallowed source.

## Data and identity

`data/jobs/current.json` is a single versioned, Zod-validated atomic snapshot containing
normalized jobs and per-feed health. It is separate from editorial YAML. The committed
snapshot bootstraps production; operational updates do not create Git commits. No raw
responses, HTML, personal application data, or long-term historical snapshots are kept.

ID = organization slug + provider + board ID + source posting ID. The source post ID
is preferred to internal requisition IDs because distinct location-specific postings
can share a requisition. Preserve the requisition separately when provided. Ashby's
explicit ID is preferred; its canonical job URL's final path ID is the fallback.
Never hash titles. Identical repeated rows collapse; conflicting repeated IDs reject
the whole feed. Distinct post IDs remain distinct even when titles match. Multi-location
fields stay on one posting; no guessed city/country splitting.

URLs drop fragments and known tracking parameters but retain identity query parameters.
The adapter contracts return normalized fields; UI has no ATS parsing logic. Missing
remote, workplace, employment, salary, and date fields stay unknown. No categories,
skills, seniority, education, clearance, or visa flags are guessed from prose.
Department/team facets use actual source fields. The Greenhouse listing is requested
with `?content=true` so each posting's description arrives with it; it may not supply
departments or salary.

## Job pages and descriptions

Descriptions are reduced at refresh time (`lib/jobs/description.ts`) to a validated
structure: headings, paragraphs, and lists, with bold, italic, and HTTPS links. Scripts,
styles, images, frames, forms, attributes, and anything else are dropped; employer HTML
is never stored or rendered. They live in `data/jobs/descriptions.json` (operational,
never committed) and follow the listing: replaced on a successful check, kept while a
source fails, deleted when the posting closes.

`scripts/job-pages.ts` writes one plain-HTML page per current listing after `next build`
(`/jobs/at/<employer>/<title>-<code>/`), using the site's stylesheet and no JavaScript;
a React page per job would multiply the export's size. Each page shows the employer's
facts, the description, and links to apply on the employer's site, and carries
schema.org JobPosting data when the listing has a description and either a U.S. address
read from its location text or a remote location open to U.S. applicants; nothing else
is guessed. A page exists only while its listing is current. After the next refresh
and deploy, the old address is not in the sitemap and is not a JobPosting page: the
Worker (and `preview:static`) return HTTP 410 with a noindex “This role has closed”
page, links to open jobs at the same employer and similar titles elsewhere, and
`/jobs/` plus `/jobs/fellowships/`. `/jobs/at/<employer>/` lists every current
listing from one employer's board.
Greenhouse custom `Location Type` is mapped only for exact supported values. Ashby
salary components retain each tier/label, currency and period. Equity/bonus is not
misrepresented as salary; hidden compensation is omitted. No annualization, FX, or
salary sorting. Minimum filters require currency + period and compare disclosed minima.

## Reconciliation and health

Every six-hour check is a complete source snapshot and performs full reconciliation;
there is no separate daily incremental path that could mistake a partial response for
absence. Independent employers are fetched with bounded concurrency (default 4;
`JOBS_REFRESH_CONCURRENCY`). Each source has a time budget (default 180 seconds;
`JOBS_SOURCE_TIMEOUT_MS`): a timeout or network error keeps that employer's previous
listings, logs the failure, and does not fail the whole run. One retry is used only
for a short network error, never for a timeout, 429, HTTP error, or malformed payload.
Each HTTP request is still time-limited to 30 seconds, bounded to 64 MiB decompressed
JSON and 20,000 jobs per source. Progress (`current.json`, descriptions, Workday meta)
is written after each source so a later workflow timeout still leaves a usable snapshot.
No source-controlled URL is fetched. Fetching uses only
fixed HTTPS API hosts, refuses redirects, and sends no credentials/cookies. No retries
or bypass after rate limits, bot protection, authentication, or malformed responses.

- Present: open, update last_seen and last_successfully_checked; retain first_seen.
- Absent after successful accepted snapshot: possibly_closed, exclude from public UI.
- Still absent on another successful check >=24h after first absence: closed.
- Reappears: open, clear absence markers; preserve identity and first_seen.
- Failed source/adapter/schema: retain job states and last successful dates; update
  only sanitized health category, attempt date, and consecutive failure count.
- Unexpected zero after nonzero, or >50% drop when previous count >=10: quarantine as
  anomaly. Accept only the same normalized payload at least six hours later. An
  intervening request failure breaks this confirmation. An actual zero is then a
  confirmed source result, not an implied absence of all employment opportunities.
- Closed history: prune after 30 days from closure; never render/index closed records.

A feed-wide rejection avoids silently dropping poisoned individual rows and then
closing their previous postings. Cross-record/global dataset failures abort before
writing/deploying. One bad source does not discard healthy source updates. A total
outage preserves records and publishes honest health warnings. Job cards use last_seen
as their verification date (not a failed attempt or successful absence check).

Current view requires open state, last_seen <=48h old and a successful latest feed
result. Failed-source and older open records appear only in the explicitly unverified
view with a warning. Counts exclude them. Browser timers age the view every minute,
including already-open tabs. Static/no-JS content explicitly states the snapshot time;
users can follow official careers links for all roles. Company counts use the same
source health window. No coverage, source failure, and confirmed zero are distinct.

## Automation / release integration

`refresh-jobs.yml` is scheduled at minute 43 every six hours and has a manual trigger.
It is inactive until repository variable `JOBS_REFRESH=true` and the existing
`CLOUDFLARE_DEPLOY=true`. It runs only on main and shares the existing production
Cloudflare concurrency lock/environment. Both production workflows check out current
main only after acquiring that shared lock, then refuse publication and cache writes
if main advanced during validation. Deployment messages identify the actual checked-out
commit. A queued older event cannot redeploy its older event revision. It reuses existing Cloudflare secrets for deploy. USAJOBS needs an API key (never
commit it). Do not expose token values.
The release integrator activates only after merging and verifying the combined site.

### USAJOBS API key (where to add `USAJOBS_API_KEY`)

Refresh is a GitHub Actions job, not a Cloudflare Worker runtime fetch. Add the
secret here:

1. **GitHub Actions, production environment (required for live federal listings).**
   Both `refresh-jobs.yml` and `deploy-cloudflare.yml` use `environment: production`
   and pass `secrets.USAJOBS_API_KEY` into `npm run jobs:refresh`. In the GitHub
   repo: **Settings → Environments → production → Environment secrets →
   `USAJOBS_API_KEY`**. If environment secrets are not used, the same name can be a
   repository secret under **Settings → Secrets and variables → Actions**.
2. **Optional User-Agent.** Variable `USAJOBS_USER_AGENT` (registered email). If
   unset, refresh uses `usasi@usasihq.com`.
3. **Cloudflare dashboard / wrangler build env: not required.** The static site
   does not call USAJOBS at build or request time. Only the GitHub Actions refresh
   step needs the key. A missing key skips USAJOBS and leaves the rest of Jobs
   working.

Local `npm run jobs:refresh` reads the same env vars from the shell (see `.env.example`).

### Google Indexing API (`GOOGLE_INDEXING_SA_JSON`)

After refresh writes the new snapshot, `npm run jobs:index` diffs job-page URLs against
`data/jobs/previous.json` (copied from the restored cache) and publishes
`URL_UPDATED` / `URL_DELETED` to the Indexing API. Newest first; 200 calls per Pacific day.
If `GOOGLE_INDEXING_SA_JSON` is missing or empty, the step logs a skip and exits 0.

The service account JSON is a GitHub Actions secret (same production environment as
USAJOBS). The service account email must be an **Owner** of the Search Console property
or Google will reject every publish call. Do not commit the key. Ordinary Cloudflare
deploys preserve `data/jobs/indexing-quota.json` in the jobs cache so a same-day
refresh still sees the remaining quota.

`data/jobs/hiring-index.json` is a small weekly count file (open listings by
employer and by U.S. state named in a location). `npm run jobs:snapshot` writes
it from `current.json` in a few milliseconds and is a separate workflow step
before the slow feed refresh, then again after each source inside
`scripts/refresh-jobs.ts`, so a later timeout still leaves this week's bucket.
One ISO week (Monday UTC) per bucket; a later check in the same week replaces
it. The committed file is the bootstrap seed; operational history lives in the
same jobs cache as `current.json`. `/jobs/index/` reads that file at build time.
Since 2026-10-19 a bucket counts only *current* listings, by the directory's rule
(`isCurrent`: open, latest feed check ok, seen within 48 hours of the snapshot), and
records `checked`/`unchecked` employers and per-employer state counts
(`employer_states`); these fields are optional so older buckets still parse. The page
computes week-over-week change only over employers checked successfully in both
weeks, marks sources new this week as "New source", shows state change only when
both weeks have per-employer state counts, links no employer with zero current
listings, and notes any shown week counted under the earlier all-open-rows rule.

### Hugging Face jobs dataset and Space (`HF_TOKEN`)

After refresh writes the new snapshot, `npm run jobs:hf-dataset` builds a CSV of open listings (the same columns as `usasihq/usasi-ai-jobs`, plus a `page` URL on this site) and uploads it to that Hugging Face dataset. `scripts/automation/jobs-update.sh` runs the same command after a successful local publish. The static explorer in `hf-space/` (`sdk: static`, HTML/JS in the browser) reads the dataset; `.github/workflows/deploy-hf-space.yml` uploads that folder to the `usasihq/usasi-ai-jobs` Space when `hf-space/` changes. Static Spaces are free; Gradio and Docker Spaces on `cpu-basic` require a Hugging Face PRO subscription.

If `HF_TOKEN` is missing or empty, both commands log a skip and exit 0. A Hub outage during the jobs refresh is also a skip: the site deploy is not rolled back or delayed. Do not commit the token.

Add the secret here:

1. **GitHub Actions repository secret (required for the scheduled refresh and the Space deploy).** Repo **Settings → Secrets and variables → Actions → Repository secrets → `HF_TOKEN`**. A repository secret is visible to `refresh-jobs.yml` (which uses the `production` environment) and to `deploy-hf-space.yml` (which does not).
2. **Token.** A Hugging Face [access token](https://huggingface.co/settings/tokens) for an account that can write to the `usasihq` org. Fine-grained: write access to the `usasihq/usasi-ai-jobs` **dataset** and the `usasihq/usasi-ai-jobs` **Space**, plus permission to create a Space if it does not exist yet. A classic write token on that account also works.
3. **Local automation.** Put `HF_TOKEN=` in `.env.jobs` (git-ignored). `npm run jobs:hf-dataset` already reads that file.

State restores from an immutable GitHub Actions cache key scoped to this main-branch
workflow family (`current.json`, the hiring index, Indexing API quota, job
descriptions, and Workday detail meta). Production builds also restore the same
Chromium card cache as CI (`.cache` and `public/og`: about 15,000 GitHub and
Hugging Face heroes). Without that cache a cold `prepare:cards` takes about 50
minutes and a 30-minute job limit cancels the build before deploy. Both
production jobs allow 120 minutes so a cache miss still publishes. Validation, type checking, lint, unit tests, production build and
internal-link checks gate deployment. Validated state is cached and a seven-day artifact
supports recovery. The build contains real observation timestamps but does not commit
on timestamp changes. Each scheduled run intentionally republishes verification/health
metadata, which is meaningful to visitors even when postings are unchanged.

Ordinary Cloudflare releases also restore and refresh jobs when JOBS_REFRESH is enabled,
so a code deployment never silently replaces live observations with the older seed.
Cache is operational storage, not a durability guarantee: eviction falls back to the
committed seed; a fresh complete check re-establishes current state. This can extend
closure grace or reset first_seen for postings absent from the seed, never shorten
closure grace. Recover a validated state artifact if continuity is important. A new
provider/schema should bump the cache prefix and include an explicit migration.

Disable future refreshes by setting JOBS_REFRESH=false. To remove a source, disable its
career config and run refresh before building: retired source records are pruned as an
editorial scope change, not reclassified as closed. A configured source remains untrusted
until it has returned a validated response. GitHub Pages remains an alternate static host;
scheduled Jobs publication is wired only to the current Cloudflare production deployment.

## UI, accessibility and SEO

`/jobs/` uses existing page, card, field, external-link and URL-state patterns. Filters
survive reload/back/forward; malformed parameters are bounded and ignored safely.
Results page at 30 cards to bound DOM work while searching the full normalized dataset.
Only currently open records are sent to the directory. The page embeds the first 30 listings of the default
view, summary counts and filter options; the browser then loads the full open list from the site's own
`/data/jobs.json` (written by `prepare:data`, same validated fields, no bookkeeping such as closure state; since
2026-10-18 in the compact form of `lib/jobs/slim.ts`, with the one-object-per-listing file at `/data/jobs-full.json`).
Until it arrives, a filtered URL shows a loading state rather than a result computed from 30 rows. This kept
the page at about 270 KB of HTML with 30 employer feeds. Company routes receive counts,
not full feeds. Company links preserve catalog context. Home has a restrained entry point.
Each current listing has its own page (`/jobs/at/<employer>/<slug>/`) with JobPosting
JSON-LD when the listing has a description and a U.S. address or is fully remote and
U.S.-only; `employmentType` and `hiringOrganization.logo` are filled as described in
`reports/seo/jobs-structured-data.md`. Query views of `/jobs/` canonical
to `/jobs/` and never carry JobPosting. Static hosts
cannot vary metadata by query, so canonical consolidation is deliberate. No private job
history is exported as standalone public data. Source/job links follow existing same-tab
noopener/noreferrer conventions. React text rendering, strict URLs and existing CSP
avoid executing source HTML. Salary filters announce their unit prerequisite.

## Verification for the initial implementation (2026-09-30)

- Genuine initial refresh: 636 Anthropic Greenhouse postings + 832 OpenAI Ashby
  postings, 1,468 validated records; no fabricated seed data. All official source
  checks succeeded at the observation timestamps in the dataset.
- 141 unit tests pass (28 Jobs tests), TypeScript and ESLint clean.
- Production static export: 311 HTML pages; 23,479 internal references resolve.
- Broad desktop/mobile browser suite initially passed 152 checks, skipped eight
  device-inapplicable checks and found two failures caused by the omitted standard
  support panel on Jobs. The panel was added; all 22 affected/expanded Jobs and
  support-panel checks then passed, including both original failures.
- Added browser coverage: URL/filter reload/history, source-link safety, no browser
  ATS requests, axe WCAG A/AA rules, metadata/sitemap, company/no-source distinctions,
  malformed parameters, salary units, 72-hour aging without a rebuild, no-JavaScript
  official-careers fallback, and 320/768/1024px layout/card-count limits.
- Separate `/usasi/` build, link checks, and both base-path browser tests pass.
- Desktop, mobile and card screenshots were inspected locally. Automated axe passes
  are not a claim of complete WCAG conformance or manual screen-reader verification.
- A local 100-run filter benchmark over 1,468 records averaged 2.88 ms; initial Jobs
  HTML was about 129 KiB gzip, 1.8 MiB uncompressed. This is a local measurement,
  not a mobile network or Core Web Vitals guarantee. Rendering is capped at 30 cards.
- Existing content warning remains: continue-extension references an unpublished
  organization; unrelated to Jobs. No changes were made to that editorial decision.

Production workflow execution, GitHub CI, combined catalog-release integration, live
Cloudflare deployment and schedule activation still require the release integrator.
This branch does not independently publish or enable the schedule. Initial coverage is
only the two verified feeds; other employer sources are honestly unconfigured rather
than implied supported or empty. Full Workday/HTML integrations and speculative category,
seniority, skills, compensation conversions or applicant services are intentionally absent.

## Combined release validation (2026-09-30)

The Jobs change was integrated with the catalog evidence, search, Compare, branding,
homepage sponsorship policy, and existing Cloudflare analytics changes. Three text
conflicts were resolved without removing the reviewed OpenAI profile or its careers
source. The original contact address remains usasihq@gmail.com. Sponsor configuration
and newsletter signup remain null, with no ad placeholder or invented signup destination.

- All 160 combined unit tests, TypeScript and ESLint pass.
- Production build exports 311 pages; all 23,691 internal references resolve.
- The full desktop/mobile suite passes 189 checks, with eight device-specific skips.
  This includes Jobs URL/history/reset, stale-state aging, source-link safety, no browser
  ATS requests, axe checks, narrow layouts, and the catalog/Compare/sponsor checks.
- The separate /usasi/ production build, link checks, and both browser tests pass.
- Desktop/mobile Jobs screenshots were inspected. Automated semantic/keyboard and axe
  results do not replace a manual assistive-technology audit.
- A read-only check of existing production analytics observed one beacon before and
  after navigation, script HTTP 200, same-origin collection HTTP 204, no CSP violations,
  and no cookies. Combined local policies pass the isolated beacon fixture checks.
  Production has not yet received the combined release.

Both Cloudflare workflows now use a fixed production lock and check out latest main
inside it. They reject an obsolete revision before saving operational state or deploying,
and deployment messages use the actual checked-out revision. Ordinary releases also run
unit, type, lint, link and browser checks. Refresh activation remains gated until the
combined release succeeds; no GitHub repository variable was changed during integration.
GitHub write access, remote CI, full production publication, live Jobs verification and
schedule activation remain pending. Dashboard analytics counts and the Exclude Bots
setting have not been verified.

## Directory search (2026-10-16)

- The Jobs page leads with a "What" and "Where" search. "Where" accepts "Remote", "Remote (U.S.)", a state name or code, or "City, ST" (lib/jobs/where.ts); anything else matches the employer-supplied location text.
- Job category, experience level, and the role pages (lib/jobs/levels.ts, lib/jobs/roles.ts) are title rules only. The rules are listed on the page; "not stated" is never guessed.
- "Pay range reaches" and the highest-pay sort use the top of U.S.-dollar ranges (hourly × 2,080). Displayed pay is never converted.
- Each job page lists up to six similar jobs: same category from the title, preferring the same level, a shared state, and other employers (at most two per employer).
- Allow-listed employer posting hosts (`posting_hosts`) linked over plain http in a feed are upgraded to https (Block's Greenhouse feed does this).

## SpaceX and Anduril (2026-10-16)

- SpaceX: spacex.com/careers/jobs links each opening to `boards.greenhouse.io/spacex` (seen in the rendered page; the list loads with JavaScript). The feed had been configured but disabled with no recorded reason; the owner asked for it on 2026-10-16.
- Anduril: anduril.com renders its roles client-side from an endpoint that refuses outside requests, so its pages show no board link. Its Greenhouse board, `job-boards.greenhouse.io/andurilindustries` (board name "Anduril Industries"), redirects to `https://www.anduril.com/open-roles`, a setting only the board's owner controls; both pages are cited.
- The two boards add about 5,300 listings. Anduril's feed with descriptions is about 44 MB, so the feed limit is 64 MiB.

## Workable and SmartRecruiters (2026-10-16)

- Workable: `https://apply.workable.com/api/v1/widget/accounts/<account>?details=true`, one list with descriptions. Posting links are `apply.workable.com/j/<shortcode>` (no account in the path), so only that path shape is accepted. Hugging Face.
- SmartRecruiters: the documented Posting API, `https://api.smartrecruiters.com/v1/companies/<id>/postings`, 100 per page (at most 50 pages), without descriptions. Each description is one request to `/postings/<id>`, made only for postings with no stored description (at most 100 a company per run, 250 ms apart; `SMARTRECRUITERS_MAX_DETAILS` overrides); a posting whose description was not fetched keeps the stored one. Descriptions fill in over later runs. Public links are `jobs.smartrecruiters.com/<company>/<id>`. ServiceNow's careers site sends Apply to that host; LLNL's Find Your Job page links to it.
- Board identifiers may contain a period (Ashby `nomic.ai`, `far.ai`).
- Cloudflare: the account is on Workers Paid (100,000 files per deployment); `scripts/postbuild.mjs` enforces that limit.

## Workday (2026-10-16, owner approved)

- Workday has no documented job feed. Each employer's career site, `https://<tenant>.<wdN>.myworkdayjobs.com/<site>`, loads its openings from public JSON under `/wday/cxs/<tenant>/<site>/`; the sites' robots.txt does not disallow it. The owner approved reading it on 2026-10-16.
- Identifier `<tenant>.<wdN>.<site>`. The list (`POST .../jobs`, 20 per page, 400 ms apart, at most 250 pages) gives title and path; a detail (`GET .../job/...`, 300 ms apart, at most 100 a site and 1,500 in all per run; `WORKDAY_MAX_DETAILS_PER_SITE` and `WORKDAY_DETAIL_BUDGET` override) gives the description, locations, country, start date, and time type. Details are fetched only for postings with no stored description; what a detail returned is kept in `data/jobs/workday-meta.json` (local, never committed; cached in the GitHub Actions jobs cache), so later runs read only the list. Workday reports at most 2,000 as a site's total. When the reported total is at that cap, the unfiltered list is not paginated (those pages repeat); the list is split by a facet instead. A detail that fails with an HTTP error (a posting closed in between) is skipped, not the whole site. Until a posting's details arrive it has no location and no description (its page is noindex).
- Posting links must be on the source's own Workday host under `/<site>/job/`.
- Enabled: Adobe, Boston Dynamics, Broadcom, Intel, Marvell, Micron, NVIDIA, Red Hat, Salesforce, SiFive. Each site was matched to its company by the site's title or the hiring organization in a posting. Universities on Workday (CMU, Cornell, UT Austin, UW) are left out: their boards are mostly non-research campus staff roles.
- The USAJOBS User-Agent default is the site's public contact address, usasi@usasihq.com (it must match the address the API key is registered with).

## Workplace labels and capped Workday lists (2026-10-17)

- An unknown workplace is filled at refresh only from the employer: every location "Remote", Workday's own remote-type field ("Office - Flexible" is hybrid), or an explicit sentence in the description (lib/jobs/workplace-text.ts). Each pattern was checked against listings whose feed gives the workplace; loose ones (benefit lists, "remote-first", "hybrid role" describing duties) were dropped because they disagreed with the feeds. About three quarters of listings still give no workplace; nothing is guessed.
- Workday lists reported at 2,000 (Workday's cap) are read again split by a facet whose groups are each under the cap, job family first; a split that recovers less than 97% of the facet total fails the source. NVIDIA: 2,735 postings.
- Universities on Workday are now included: Carnegie Mellon (cmu.wd115.CMU), Cornell, UT Austin, and the University of Washington (uw.wd5site.UWHires, on myworkdaysite.com).

## Jobs board fixes (2026-10-18)

From an independent audit, each item checked against the code and the live site first.

- **U.S. by default.** `/jobs/` with no parameters shows `where=us-or-unstated`: listings that name a U.S. place (including ones that also name places abroad) or name no place that can be read ("Remote", "Hybrid"). Only listings located solely outside the United States are left out; "Include jobs outside the U.S." (`where=all`) shows them. The headline still counts every current listing and states how many the default view shows. Landing pages, the monthly report, and job-page links that mean "every listing" use `ALL_JOB_FILTERS` (`where=all`), so the default never narrows them. Typing a non-U.S. place in "Where" ("London") searches every country.
- **Pay from the description.** When a feed gives no salary, `lib/jobs/pay-text.ts` reads a U.S.-dollar range the employer's description states, stored with `source_status: "employer-description"` and shown with "(from the employer's job description)". Rules are in the file header: a pay word nearby, the period from the text (an unlabelled range counts as yearly only when its lower end is at least $20,000), other currencies, millions, spend/budget figures, and implausible spreads skipped, and nothing for listings located solely outside the U.S. (where "$" is often another dollar). Checked against 259 listings whose feed also gives a salary: 231 agree exactly; most of the rest are employers whose text and feed disagree, or Canadian-dollar ranges written with "$" (the reason for the non-U.S. rule). `npm run jobs:refresh` fills it for each listing it reads, using the stored description when a posting's details were not fetched again; `npm run jobs:backfill-pay` fills the current snapshot once without a network refresh. JobPosting `baseSalary` prefers the feed's salary.
- **validThrough** is stored (`valid_through`) and emitted only for USAJOBS, from `ApplicationCloseDate`.
- **Cards** link the employer's careers page ("Employer's job board"), not the feed endpoint (Workday's is POST-only, Greenhouse's is JSON); the feed type is plain text.
- **Company menu** lists only organizations with an automated source; `?company=<uncollected>` explains that and links its careers page. "unknown" reads "Not stated".
- **No-JS search:** the form is `GET /jobs/` with `q` and `w`; `w` is read like the Where box.
- **Federal:** `/jobs/at/federal/` was already noindex and out of the sitemap while empty; it is now also out of Browse, says listings aren't collected yet, and the coverage card says "Not configured (API key pending)" until USAJOBS succeeds once.
- **Compact jobs.json.** `/data/jobs.json` is the compact form the directory loads (tables of repeated text, arrays, epoch-ms timestamps, URL prefixes per feed, and each listing's geography computed at build); `/data/jobs-full.json` keeps the full format for reuse. `tests/unit/jobs-slim.test.ts` checks the round trip and that 24 filter URLs give identical results. Sorting computes its keys once per row, and facet counts skip sorting.
- **Sitemap index.** `app/sitemap.ts` lists every page except job pages; `scripts/job-pages.ts` renames Next's output to `/sitemap-pages.xml`, writes job pages (those with a description) to `/sitemaps/jobs-<n>.xml` in files of 10,000, and writes `/sitemap.xml` as the index, which `robots.txt` already names. `scripts/postbuild.mjs` reads every listed sitemap and checks the 50,000-URL / 50 MB limits.
- **Page layout.** h1 "Jobs at U.S. AI companies and labs"; a shortcuts row (topic pages, the three largest role pages, WARN Act layoffs, each with its count) before the first card; "Coverage & source health" shows a one-line summary with the per-source cards in a disclosure (card titles are no longer headings). "Skip to results" / "Skip to filters" are the first links in the page's main content. On a 390×844 phone the first job card starts within the first screen.
- **404 for closed jobs.** A missing `/jobs/at/<employer>/<title>-<code>/` shows that the posting is no longer listed, with "Jobs at <employer>", "Similar roles", and "Search all jobs" (client component; still a 404).
- **Not done here:** times stay in UTC (job pages have no JavaScript, so local times would differ between the directory and job pages); the usasihq.com redirect chain is a Cloudflare dashboard rule (owner).

## Feeds, titles, pay, and the quality gate (2026-10-19)

- **Job feeds (RSS 2.0).** `/jobs/feed.xml` (the directory's default view: a U.S. location or none that can be read) and `<page>/feed.xml` for every role, topic, state, and employer page (not city pages), built by `lib/jobs/feeds.ts`. Each lists the page's 100 most recently published current listings; title is the job page title, link and guid are the job page, pubDate is the employer's publication date or first_seen, and the description holds only listing facts (employer, locations, workplace, the first stated pay with its source, first listed date). `/feeds/#job-feeds` lists them all.
- **Follow this search** (`components/JobsFollow.tsx`, `lib/jobs/feed-match.ts`): on `/jobs/`, the feed whose page has exactly the current narrowing filters (sort, page, and the default/all-country scope are ignored), else the page feed with the most filters that are all part of the search, else `/jobs/feed.xml`; the box names the filters the feed does not apply. State lives only in the URL.
- **Job page titles**: "{Title} at {Employer} ({City, ST} | Remote | City, ST +N locations)", at most 70 characters. Parts drop in order (extra places, the place, the employer) before the title is cut, and a cut is only at a word with "…" (never inside an unfinished parenthesis). Same-titled postings at one employer first list every place; a requisition, posting ID, or page code is added only when they still collide.
- **JobPosting**: `validThrough` only from USAJOBS's close date; `jobLocationType: TELECOMMUTE` + `applicantLocationRequirements: US` only for 100% remote U.S. listings; `employmentType` from the feed or a conservative title/description inference; `hiringOrganization.logo` is the crawlable 128×128 PNG at `/images/orgs/<slug>.png`.
- **AI pay** (`lib/jobs/pay.ts`): `/jobs/pay/`, `/jobs/pay/<role>/`, and a pay section on `/jobs/at/<employer>/`, each only with at least 10 listings with pay. Yearly U.S.-dollar base ranges with both ends (feed first, else the description's, labelled), one per listing spanning its tiers, midpoint per listing; median and 25th–75th percentile; remote share; the listings behind it. Ranges labelled on-target earnings, commission, bonus, equity, or total compensation, and implausible ones (under $10,000 or over $2,000,000), are left out. No trend: no history is kept.
- **Quality gate**: employer pages with fewer than 5 current listings (`MIN_INDEX_LISTINGS`) are noindex and out of the sitemap; topic and role pages keep their threshold of 10; state and city pages exist only from 10. Landing-page sitemap `lastmod` is the newest `first_seen` among the page's listings, not the build or check time; pay pages use the newest first_seen among listings with pay.
