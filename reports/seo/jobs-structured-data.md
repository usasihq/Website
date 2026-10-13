# Jobs pages and structured data

Written 2026-10-13 alongside the Jobs landing pages (`/jobs/in/<state>/`,
`/jobs/data-center-infrastructure/`, `/jobs/no-programming/`, `/jobs/entry-level/`,
`/jobs/remote-us/`, `/jobs/remote/`). Source checked: Google Search Central,
"Job posting (JobPosting) structured data"
(https://developers.google.com/search/docs/appearance/structured-data/job-posting),
read on 2026-10-13. Re-check that page before acting on this note.

## What the site emits today

| Page | JSON-LD | Why |
| --- | --- | --- |
| `/jobs/` | none | A filterable list of listings. |
| Landing pages | `BreadcrumbList` (Home → Jobs → page) and `ItemList` of the **employers** on the page, each linking to its `/companies/<slug>/` profile | Describes the page honestly. The list items are same-site URLs, as Google expects for list markup, and each is a real page with sourced content. |
| `/companies/<slug>/` | unchanged | Organization profiles, not job pages. |

No page emits `JobPosting`. The e2e specs (`tests/e2e/jobs.spec.ts`,
`tests/e2e/landing-jobs.spec.ts`) fail if one does.

## Why USASI is not eligible for JobPosting rich results

Google's guidelines say to put the markup "on the most specific page for one
job" and not "on pages that list jobs, such as search results pages". Every
USASI jobs page is a list: the landing pages are lists by state or topic, and
`/jobs/` is a filtered list. USASI has no page per job.

Even a page per job would not qualify with the data the site keeps:

- **`description` (required)** must be the full job description, in HTML,
  matching what the page shows. The jobs pipeline deliberately stores no
  description copies (`lib/jobs/schema.ts`: "No inferred categories, skills,
  seniority or description copies"), and copying employers' descriptions would
  also need a licensing decision (see `CONTENT_LICENSE.md`).
- **Freshness.** Google does not allow expired postings: a closed job must get a
  past `validThrough`, a 404/410, or lose its markup. The site is rebuilt from a
  daily snapshot; a listing can close between builds. Google recommends the
  Indexing API for job URLs, which the site does not use (and the site has no
  server to call it from).
- **Application path.** Postings must offer a way to apply. USASI links to the
  employer's posting and does not take applications, so each page would only
  duplicate the employer's own page, which already carries the original listing.
- **Remote jobs** need `jobLocationType: "TELECOMMUTE"` only when the job is
  fully remote (not "occasional work-from-home") and `applicantLocationRequirements`
  naming at least one country. Feeds often say "Remote-Friendly" or "Remote" with
  no country (see `lib/jobs/geo.ts`), so this could not be filled truthfully for
  many listings.

## What individual job pages would require, if the owner ever wants them

One static page per open listing (for example `/jobs/<organization>/<source id>/`),
each with exactly one `JobPosting` matching the visible text:

Required by Google:

- `title`: the job title only, as the employer gives it (no codes, dates, salary,
  or company name).
- `description`: the complete description in HTML; it cannot equal the title.
  Needs a new stored field, a sanitizer, and an owner decision on copying.
- `datePosted`: from `posted_at` (Ashby gives last-published, Greenhouse
  first-published; the page would need to say which).
- `hiringOrganization`: the organization's name (and `sameAs`/`logo` if wanted;
  the site uses monograms, not logos).
- `jobLocation`: a `Place` with a `PostalAddress` (at least a country). Not
  required for fully remote jobs that set `applicantLocationRequirements`.

Recommended by Google: `validThrough` (omit if unknown, which is the usual case
for these feeds), `employmentType` (FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY,
INTERN, …), `identifier` (the employer's job ID), `baseSalary` (only the
employer's own disclosed range, which the Ashby adapter already keeps),
`directApply`, `jobLocationType`, `applicantLocationRequirements`.

Operational requirements:

- Remove the page (404/410) or its markup as soon as a listing closes, which
  means rebuilding and deploying at least as often as the feeds are checked.
- Notify Google of new, changed, and removed job URLs (Indexing API), and keep
  the sitemap's `lastmod` accurate.
- Keep "expression of interest" and talent-pool posts out of the markup; they are
  not specific vacancies (`isExpressionOfInterest` in `lib/jobs/tracks.ts`).
- No login wall, no applicant fees, no promotional content in the posting.

Until all of that exists, list pages with `ItemList` and `BreadcrumbList` are the
accurate choice, and each listing links to the employer's own posting, which is
where Google expects the original job to be marked up.
