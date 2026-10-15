# Jobs pages and structured data

Updated 2026-10-15. Source: Google Search Central, "Job posting (JobPosting)
structured data"
(https://developers.google.com/search/docs/appearance/structured-data/job-posting).
Re-check that page before changing the markup.

## What the site emits

| Page | JSON-LD |
| --- | --- |
| `/jobs/at/<employer>/<slug>/` (one opening) | `JobPosting` when the listing qualifies, plus `BreadcrumbList` |
| `/jobs/` | `CollectionPage` + `ItemList` of topic, state, and city landing pages. Query strings (`?company=`) canonicalise here and do not add `JobPosting`. |
| `/jobs/remote/`, `/jobs/in/<state>/`, `/jobs/at/<employer>/`, other landings | `CollectionPage`, `ItemList` of the listings **shown on the page** (each URL is that job's USASI page), `ItemList` of employers, `BreadcrumbList`. Never `JobPosting`. |

A listing qualifies for `JobPosting` only when it is current (`isCurrent`: open,
feed healthy, seen within 48 hours at build time), has a stored description, is
not an expression of interest, and has either a U.S. postal address read from
its location text or `workplace: "remote"` with U.S.-only geography.

## Fields

Populated from the employer feed and catalog, never guessed:

- `title`, `description` (HTML rebuilt from the sanitized description), `datePosted`
- `hiringOrganization.name` and `sameAs` (the organization's official website)
- `directApply: false` (USASI does not take applications; the page links out)
- `url` (this site's job page)
- `identifier` (requisition id, else the source job id)
- `employmentType` when the feed supplies a mapped type
- `jobLocation` for U.S. city/state addresses the location text actually names
- `jobLocationType: TELECOMMUTE` and `applicantLocationRequirements` only when
  `workplace` is `remote` (100% remote) and the listing is U.S.-only
- `baseSalary` when the employer disclosed a range

Omitted because the feeds do not supply them:

- `validThrough` (no expiration date). Stale jobs are dropped: their pages are
  not generated, so the markup is gone after the next refresh and deploy.
- `hiringOrganization.logo` (the site uses monograms, not employer logos)
- Street address and postal code (location text is city/state, not a street)
- `educationRequirements` / `experienceRequirements` (not structured in feeds)
- `TELECOMMUTE` for hybrid or "remote-friendly" listings
- `JobPosting` on expressions of interest (`isExpressionOfInterest`)

## How to verify with Google's Rich Results Test

1. Open a current job detail page, for example from
   [Jobs at Anthropic](https://unitedstatesofamericasuperintelligence.com/jobs/at/anthropic/)
   → any listing. Confirm the HTML contains
   `<script type="application/ld+json">` with `"@type":"JobPosting"`.
2. Paste that URL into Google's Rich Results Test:
   https://search.google.com/test/rich-results
3. Choose **Job posting** (or let the tool detect it). A valid page reports
   **Job posting** as a detected rich result, with title, hiring organization,
   and location (or TELECOMMUTE) present and no errors on required properties.
4. Confirm a list page such as `/jobs/` or `/jobs/remote/` reports **no** Job
   posting result — only CollectionPage/ItemList/BreadcrumbList. Google forbids
   `JobPosting` on pages that list more than one job.

The test needs a publicly crawlable URL (production or a deployed preview).
Local `out/` HTML can be uploaded as a code snippet instead of a URL.

After a production deploy, Search Console's Job postings rich-result report is
the ongoing check; new markup can take days to be recrawled.
