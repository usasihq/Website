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

### xAI (SpaceXAI) renamed SpaceXSI

- Added: 2026-10-04. Resolved: 2026-10-11.
- Prompted again on 2026-10-11 by a screenshot of the company's X profile,
  which is not a source.
- Confirmed by: https://docs.x.ai/overview, accessed 2026-10-11. The page is
  titled "Grok API Documentation | SpaceXSI Docs", its description reads
  "Official SpaceXSI API documentation", and its heading reads "Get started
  with SpaceX Super Intelligence".
- Not yet changed on 2026-10-11:
  - the Greenhouse job board `name` still read "SpaceXAI";
  - the page's structured data still named the organization xAI;
  - x.ai still refused automated requests, so its footer could not be checked.
- What changed:
  - content/organizations/xai.yml: `name` is now "xAI (SpaceXSI)", with a
    `status_note` and two new sources. `legal_name` and `website` are unchanged
    because no legal page or filing states a new name.
  - content/organizations/spacex.yml: the cross-reference wording.
  - The maintainer name on content/artifacts/grok.yml, grok-1.yml, and
    grok-2.yml.
  - News item: content/news/xai-developer-docs-adopt-spacexsi-name.yml.
- Still worth checking: a legal name in a SpaceX filing or on x.ai's legal
  pages. If one appears, set `legal_name` in xai.yml with that source.
