# Jobs pages and structured data

Updated 2026-10-22. Source: Google Search Central, "Job posting (JobPosting)
structured data"
(https://developers.google.com/search/docs/appearance/structured-data/job-posting).
Re-check that page before changing the markup.

## What the site emits

| Page | JSON-LD |
| --- | --- |
| `/jobs/at/<employer>/<slug>/` (one opening) | `JobPosting` when the listing qualifies, plus `BreadcrumbList` |
| `/jobs/` | `CollectionPage` + `ItemList` of topic, role, state, and city landing pages. Query strings (`?company=`) canonicalise here and do not add `JobPosting`. |
| `/jobs/remote/`, `/jobs/in/<state>/`, `/jobs/at/<employer>/`, `/jobs/role/<slug>/`, other landings | `CollectionPage`, `ItemList` of the listings **shown on the page** (each URL is that job's USASI page), `ItemList` of employers, `BreadcrumbList`. Never `JobPosting`. |

A listing qualifies for `JobPosting` only when it is current (`isCurrent`: open,
feed healthy, seen within 48 hours at build time), has a stored description, is
not an expression of interest, and has either a U.S. postal address read from
its location text or `workplace: "remote"` with U.S.-only geography.

## Fields

Populated from the employer feed and catalog. `employmentType` may be inferred
from the title and description when the feed omits it (`lib/jobs/employment.ts`);
other fields are never guessed:

- `title`, `description` (HTML rebuilt from the sanitized description), `datePosted`
- `hiringOrganization.name`, `url`, `sameAs` (the organization's official website),
  and `logo` (a crawlable 128×128 PNG at `/images/orgs/<slug>.png`)
- `directApply: false` (USASI does not take applications; the page links out)
- `url` (this site's job page)
- `identifier` (requisition id, else the source job id)
- `employmentType` from the feed when mapped, otherwise intern / part-time /
  contractor / temporary / full-time inferred conservatively (full-time only for
  an explicit mention, a yearly salary, or a standard salaried role title)
- `jobLocation` for addresses the location text actually names
- `jobLocationType: TELECOMMUTE` and `applicantLocationRequirements` only when
  the listing is 100% remote and open to U.S. applicants
- `baseSalary` when the employer disclosed a range: the feed's salary first; when
  the feed gives none, a U.S.-dollar range stated in the employer's description
  (`source_status: "employer-description"`, `lib/jobs/pay-text.ts`; the page says
  so next to the figure)
- `validThrough` only for USAJOBS listings, from the announcement's
  `ApplicationCloseDate` (stored as `valid_through`)

Omitted because the feeds do not supply them:

- `validThrough` for employer feeds (no expiration date). Stale jobs are dropped:
  their pages are not generated, so the markup is gone after the next refresh and
  deploy, and the Indexing API gets `URL_DELETED`.
- Street address and postal code (location text is city/state, not a street)
- `educationRequirements` / `experienceRequirements` (not structured in feeds)
- `TELECOMMUTE` for hybrid or "remote-friendly" listings
- `JobPosting` on expressions of interest (`isExpressionOfInterest`)

Logos are generated at `prepare:data` (`scripts/generate-org-logos.ts`). A
checked-in file in `assets/org-logos/<slug>.png` (from the company's own site via
`npm run org-logos:fetch`) is preferred; otherwise a 128×128 monogram is drawn
from `logo_text`. The same image is shown on the job page and the company page.

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

## Coverage (committed snapshot, 2026-10-22)

Among 3,680 current listing pages, 3,601 qualify for `JobPosting` (the rest are
expressions of interest or lack a postal address / fully-remote U.S. context).
Required Google fields are present on every qualifying posting (`invalid = 0`).

| Field | Before | After |
| --- | ---: | ---: |
| `employmentType` | 55.5% (feed only) | 98.6% (feed + conservative inference) |
| `hiringOrganization.logo` | 0% | 100% |
| `hiringOrganization.url` / `sameAs` | sameAs only | 100% both |
| `identifier`, `directApply`, `datePosted`, `title`, `hiringOrganization.name` | 100% | 100% |
| `baseSalary` | 32.8% (employer-stated only) | 32.8% (unchanged; never fabricated) |
| `jobLocationType` + `applicantLocationRequirements` | 5.6% (100% remote + U.S. applicants) | 5.6% |
| `validThrough` | 0% in this snapshot (no USAJOBS rows) | 0% |

A live sample of 146 production pages (before this change) had **no**
`hiringOrganization.logo` and 98/146 missing `employmentType`. After deploy,
those pages pick up a logo and an inferred or feed employment type, shown on
the page as well as in JSON-LD.

Sample paths: `/jobs/at/anthropic/research-engineer-chip-design-rl-1exp7gm/`
(inferred Full-time), `/jobs/at/together-ai/software-engineer-intern-winter-2027-1vl6ixa/`
(inferred Internship), `/companies/anthropic/`.

The test needs a publicly crawlable URL (production or a deployed preview).
Local `out/` HTML can be uploaded as a code snippet instead of a URL.

After a production deploy, Search Console's Job postings rich-result report is
the ongoing check; new markup can take days to be recrawled.
