# Watch list

Claims the catalog has seen but cannot publish yet, because no official source
confirms them. The daily update checks each item under "Watching" on every run,
using only the official sources listed for it. Social media posts (including
official accounts), news coverage, and domain registrations never count.

When an official source confirms an item, the daily run makes the update the
item describes, cites that source, writes a news item, and moves the item to
"Resolved" with the date and source URL. If nothing is confirmed, the item stays
as it is.

## Watching

### xAI (SpaceXAI) renamed SpaceXSI

- Added: 2026-10-04
- Claim to confirm: xAI, the SpaceX subsidiary listed as "xAI (SpaceXAI)", has
  been renamed SpaceXSI.
- Status on 2026-10-04: the claim comes from a social media post saying the
  company "will" be renamed. spacex.com shows no rename, and the company's own
  job board is still named "SpaceXAI". spacexsi.com is a parked domain listed
  for sale and is not an official source.
- Official sources to check:
  - the company's job board name: https://boards-api.greenhouse.io/v1/boards/xai
    (the `name` field read "SpaceXAI" on 2026-10-04)
  - https://docs.x.ai
  - https://x.ai (home page, footer, and legal pages); it refused automated
    requests on 2026-10-04, so skip it if it still does
  - https://www.spacex.com
  - SpaceX filings on SEC EDGAR, if any
- A job board name change alone is enough to watch closely but not to rename
  the record: confirm it on docs.x.ai, x.ai, spacex.com, or a filing.
- Update when confirmed:
  - content/organizations/xai.yml: `name`, `legal_name` (only if a legal page or
    filing states it), `website` (only if the official site moves),
    `status_note` explaining the rename, the new source, `updated_at`
  - content/organizations/spacex.yml: check how it names its AI business and
    update that wording if the same source supports it
  - one news item

### "Super Intelligence Force" and a "White House Accord on Super Intelligence"

- Added: 2026-10-04
- Claim to confirm: the President announced a Super Intelligence Force (SIF)
  after a White House Accord on Super Intelligence.
- Status on 2026-10-04: the only source seen is a social media post.
  whitehouse.gov and the Federal Register have no page for either. The official
  September 29, 2026 pages (the executive order "Inaugurating the Era of Super
  Intelligence", its fact sheet, and the luncheon on Super Intelligence) do not
  mention a Force or an accord. The order itself is already covered by the
  news item nist-renames-ai-center-caissi and the explainer
  /learn/policy-sources/.
- Official sources to check:
  - https://www.whitehouse.gov/presidential-actions/
  - https://www.whitehouse.gov/fact-sheets/
  - https://www.whitehouse.gov/briefings-statements/
  - https://www.whitehouse.gov/releases/
  - https://www.federalregister.gov (search "Super Intelligence")
- Update when confirmed:
  - one neutral policy news item that describes only what the official page
    says (what was created or signed, by whom, and what it directs)
  - list an organization in `related_organizations` only if the official page
    names it and its catalog record is published. News items must relate to at
    least one catalog record, so if the page names none, write no news item and
    move this item to "Resolved" with the source URL and the note "confirmed;
    no catalog record named"
  - do not edit organization records for this item

## Resolved

None yet.
