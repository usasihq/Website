# Jobs: operations and editorial policy

## Architecture audit

Jobs extends the existing Next.js App Router static export (`next.config.ts`) and
Cloudflare static-assets deployment (`wrangler.jsonc`). It adds no server, database,
account system, external runtime scripts, application tracking, or CSP permissions.
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
4. Only `greenhouse` and `ashby` have implemented adapters. `manual` and `unsupported`
   require an explanatory note and `enabled: false`; they display a careers link,
   not a zero count. No Workday/HTML scraping/aggregator adapters are claimed.
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
an unrestricted content license. We retain brief factual fields and outbound links,
not full descriptions, applicant questions, benefits prose, contacts, or resumes.
Employer material is not relicensed under USASI's original-prose license. Review
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
Department/team facets use actual source fields. Greenhouse's basic public listing
endpoint avoids downloading full descriptions; it may not supply departments or salary.
Greenhouse custom `Location Type` is mapped only for exact supported values. Ashby
salary components retain each tier/label, currency and period. Equity/bonus is not
misrepresented as salary; hidden compensation is omitted. No annualization, FX, or
salary sorting. Minimum filters require currency + period and compare disclosed minima.

## Reconciliation and health

Every six-hour check is a complete source snapshot and performs full reconciliation;
there is no separate daily incremental path that could mistake a partial response for
absence. This costs only one request per currently configured employer. Calls are
serial, spaced by one second, time-limited to 30 seconds, bounded to 32 MiB decompressed
JSON and 20,000 jobs per source. No source-controlled URL is fetched. Fetching uses only
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
commit. A queued older event cannot redeploy its older event revision. It reuses existing Cloudflare secrets;
no new long-lived credentials or services are required. Do not expose token values.
The release integrator activates only after merging and verifying the combined site.

State restores from an immutable GitHub Actions cache key scoped to this main-branch
workflow family. Validation, type checking, lint, unit tests, production build and
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
Only currently open records are sent to the directory. Company routes receive counts,
not full feeds. Company links preserve catalog context. Home has a restrained entry point.
No individual job pages, JobPosting structured data, or indexable facet routes are created.
Every query view canonicals to `/jobs/`; only that path enters the sitemap. Static hosts
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
