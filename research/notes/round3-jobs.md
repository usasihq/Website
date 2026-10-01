# Round 3 — Jobs source onboarding (2026-10-01)

Scope: published, eligible organizations whose official careers page links to or
embeds a public Greenhouse or Ashby board. 41 candidates checked. Careers pages
were fetched with curl (UA `USASI-catalog-research/0.3`) and, for JavaScript-rendered
pages, read in a browser pane (rendered links and the ATS requests the page itself
made). Each board identifier below was taken from the official page, not guessed.
Each board got exactly one public API request (Greenhouse
`boards-api.greenhouse.io/v1/boards/<id>/jobs`, Ashby
`api.ashbyhq.com/posting-api/job-board/<id>`), spaced more than 1 s apart, with no
credentials and no personal data. No individual job pages were fetched. I did not run
`jobs:refresh` and did not touch `data/`.

I also checked every configured board offline: I ran the repository's own
`lib/jobs/adapters.ts` normalizers against the saved API responses, using no network
(scratchpad script). This showed two adapter problems that would make some feeds fail
(see "Enabled: false" below).

Edits to each file: a `careers` block after `hiring_url`, one new source
`<slug>-careers-jobs` (accessed_at/reviewed_at 2026-10-01), and `updated_at: 2026-10-01`.
I made no other changes. `hiring_url` and `last_reviewed` are unchanged.

## Results

Key: **E** = configured with `enabled: true`. **D** = board verified but `enabled: false`
(reason given). **U** = `unsupported` with `enabled: false`. **—** = no edit.

| Org | Careers URL (official) | ATS | Identifier | Confirmed? | Notes |
|---|---|---|---|---|---|
| together-ai | https://www.together.ai/careers | Greenhouse | `togetherai` | Yes, 77 jobs, company "Together AI" | **E**. The page fetches the board API and links to job-boards.greenhouse.io/togetherai. |
| scale-ai | https://scale.com/careers | Greenhouse | `scaleai` | Yes, 192, "Scale AI" | **E**. The page loads the list from api.greenhouse.io/v1/boards/scaleai. The page links to scale.com/careers/<id>, but the API `absolute_url` is on job-boards.greenhouse.io/scaleai, so the adapter accepts it. |
| figure | https://www.figure.ai/careers | Greenhouse | `figureai` | Yes, 98, "Figure" | **E**. The page links to job-boards.greenhouse.io/figureai. |
| glean | https://www.glean.com/careers | Greenhouse | `gleanwork` | Yes, 130, "Glean" | **E**. The live script and links use `gleanwork`. The page also calls api.lever.co (an old script). |
| skild-ai | https://www.skild.ai/career | Greenhouse | `skildai-careers` | Yes, 46, "Skild AI" | **E**. The page fetches the boards-api for `skildai-careers`. |
| apptronik | https://apptronik.com/careers/job-listings | Greenhouse | `apptronik` | Yes, 77 (1 talent-pool post is filtered out), "Apptronik" | **E**. Greenhouse embed `for=apptronik`. `absolute_url` is on boards.greenhouse.io/apptronik, which the adapter accepts. |
| arcee-ai | https://www.arcee.ai/careers | Greenhouse | `arceeai` | Live (HTTP 200), **0 jobs** | **E**. Greenhouse embed `for=arceeai`. The API has no company name to match, so the identity rests on the official embed. |
| ai2 | https://allenai.org/careers | Greenhouse | `thealleninstitute` | Yes, 18, "The Allen Institute for Artificial Intelligence" | **E**. |
| anysphere | https://cursor.com/careers | Ashby | `cursor` | Yes, 131 | **E**. |
| cognition | https://cognition.com/careers | Ashby | `cognition` | Yes, 103 | **E**. |
| physical-intelligence | https://www.pi.website/join-us | Ashby | `physicalintelligence` | Yes, 35 | **E**. The page embeds the Ashby board. Note: the record's `website` (physicalintelligence.company) now redirects to www.pi.website (behind a Vercel checkpoint that cleared on its own). The `website` field should be updated in a separate edit. |
| reflection-ai | https://reflection.ai/careers | Ashby | `reflectionai` | Yes, 51 | **E**. |
| modal | https://modal.com/careers | Ashby | `modal` | Yes, 40 | **E**. The URL opens modal.com/company#careers, which links to jobs.ashbyhq.com/modal. |
| sierra | https://sierra.ai/careers | Ashby | `Sierra` | Yes, 195 | **E**. The identifier is case-sensitive and matches the API `jobUrl`. The page also links 20 times to a second board, `sierra-jp`, which is **not covered**: there is one source per org, and I sent no API request for it. |
| runway | https://runway.com/careers | Ashby | `runway-ml` | Yes, 45 | **E**. |
| lambda | https://lambda.ai/careers | Ashby | `lambda` | Yes, 90 | **E**. |
| writer | https://writer.com/company/careers/ | Ashby | `writer` | Yes, 47 | **E**. Its "Open positions" link points to the board. |
| langchain | https://www.langchain.com/careers | Ashby | `langchain` | Yes, 102 | **E**. Ashby embed script. |
| liquid-ai | https://www.liquid.ai/careers | Ashby | `liquid-ai` | Yes, 18 | **E**. |
| luma-ai | https://lumalabs.ai/careers | Ashby | `lumaai` | Yes, 29 | **E**. |
| essential-ai | https://www.essential.ai/careers | Ashby | `essentialai` | Live, **0 jobs** | **E**. Its "See open positions" button links to the board. The identity rests on that link. |
| zyphra | https://jobs.ashbyhq.com/zyphra | Ashby | `zyphra` | Yes, 14 | **E**. zyphra.com/careers returns 404, and the homepage "Careers" link goes straight to the board. The source cites the homepage. |
| lancedb | https://www.lancedb.com/careers | Ashby | `lancedb` | Yes, 11 | **E**. The homepage "Careers" link goes to lancedb.com/careers, which redirects to jobs.ashbyhq.com/lancedb. |
| thinking-machines-lab | https://jobs.ashbyhq.com/ThinkingMachines | Ashby | `ThinkingMachines` | Yes, 51 | **D**: adapter schema failure (A). The site's "Careers" and "See open roles" links go straight to the board, and the source cites thinkingmachines.ai. |
| baseten | https://www.baseten.co/resources/careers/ | Ashby | `baseten` | Yes, 104 | **D**: adapter schema failure (A). |
| cerebras | https://www.cerebras.ai/open-positions | Ashby | `cerebras` | Yes, 115 | **D**: adapter schema failure (A). /careers redirects to /join-us, which links to /open-positions. |
| coreweave | https://www.coreweave.com/careers | Greenhouse | `coreweave` | Yes, 312, "CoreWeave" | **D**: posting host (B). The page uses `data-board-id="coreweave"` and the boards-api. Note: Weights & Biases (a parallel slug) is part of CoreWeave. This board must not also be assigned to weights-and-biases. Another agent edited this file at the same time (Forge product). My block is intact. |
| agility-robotics | https://www.agilityrobotics.com/careers | Greenhouse | `agilityrobotics` | Yes, 77 (1 talent pool), "Agility Robotics" | **D**: posting host (B). The page calls the boards-api for `agilityrobotics`. |
| modular | https://www.modular.com/company/careers | Gem | (Gem `modular`) | n/a, no API call | **U**. The page loads api.gem.com/job_board/v0/modular. Modular is now owned by Qualcomm, per its existing status note. |
| nomic-ai | https://www.nomic.ai/careers | Ashby | `nomic.ai` | Yes, 9 | **U**. The careers schema identifier regex `^[A-Za-z0-9_-]{1,100}$` rejects the period. Enabling this board needs a code change. |
| databricks | https://www.databricks.com/company/careers/open-positions | Greenhouse-backed (gh_jid, `Greenhouse__Job` page data) | not published on page | No | **—**. The board token never appears, and I did not guess one. Its `absolute_url` points to databricks.com, so it would also need a posting host. |
| perplexity | https://www.perplexity.ai/careers | ? | — | No | **—**. Cloudflare "Just a moment" challenge for both curl and the browser. I did not try to get past it. |
| character-ai | https://character.ai/careers | ? | — | No | **—**. Cloudflare challenge. I did not try to get past it. |
| poolside | https://poolside.ai/careers | custom pages | — | No | **—**. Postings are at poolside.ai/careers/<slug>--<uuid>, with no ATS on the directory page. I did not fetch job pages. |
| prime-intellect | https://www.primeintellect.ai/careers | custom pages | — | No | **—**. Postings are at /careers/<uuid>, with no ATS reference. |
| chroma | https://www.trychroma.com/careers | custom pages | — | No | **—**. Postings are at /careers/<slug>, with no ATS reference. |
| llamaindex | https://www.llamaindex.ai/careers | custom pages | — | No | **—**. Postings are at /careers/<slug>, with no ATS reference. |
| waymo | https://careers.withwaymo.com/ | custom site (Greenhouse-related scripts) | — | No | **—**. No board token is exposed. Postings are on careers.withwaymo.com. |
| groq | (groq.com/careers redirects to the homepage) | — | — | No | **—**. I found no careers link on the homepage. |
| ssi | https://ssi.inc | Ashby | `ssi` | Live, **0 jobs** | **—**. The site links only to a single posting (jobs.ashbyhq.com/ssi/b91659e4-…). That posting is not in the public list, so automating would show "no postings" next to an active Apply link. I left `hiring_url` as the link. |
| xai | https://x.ai/careers | Greenhouse | `xai` | Yes, 296, company "SpaceXAI" | **Not edited (reserved file).** Evidence: the page links to job-boards.greenhouse.io/xai/jobs/… and "View Open Roles" goes to x.ai/careers/open-roles. The page title and API company name are "SpaceXAI". `spacex` is a separate catalog org, so the board needs parent/subsidiary review before assignment. |
| crewai | — | — | — | — | Skipped: draft / pending_review, so not eligible for Jobs. |

Totals: **23 enabled**, 5 verified but disabled, 2 unsupported, 12 not configured or skipped (including xai, which is reserved, and crewai, which is a draft).

### (A) Ashby adapter rejects `secondaryLocations[].address: null`
In the saved payloads, some jobs on the boards ThinkingMachines (1 job), baseten (21 jobs) and cerebras (3 jobs)
have `secondaryLocations` entries with `address: null`. In `lib/jobs/adapters.ts`, `address`
is `z.object(...).optional()`, which does not accept null, so the whole feed fails as
`payload`. Suggested owner fix: `.nullable().optional()` on that `address`. After the fix,
set these three to `enabled: true`. I can't edit `lib/`.

### (B) Employer-hosted posting URLs
In the Greenhouse API, CoreWeave's `absolute_url` values are on `coreweave.com`
(careers/job?gh_jid=…). Agility's are on `www.agilityrobotics.com` (about/job-post?gh_jid=…).
With `posting_hosts: []`, `postingUrl` throws `unsafe-url` and the feed is rejected. Enabling
either one needs an editor-approved `posting_hosts` entry (exactly `coreweave.com` /
`www.agilityrobotics.com`). That is allowed by docs/JOBS.md but was outside this assignment.

## Provider terms observations
- Greenhouse Job Board API docs (https://docs.greenhouse.io/job-board.html, read today;
  developers.greenhouse.io redirects there) state that job board data is public and that GET
  endpoints need no authentication. The page I read gives no rate limits, caching guidance
  or third-party usage terms. `absolute_url` is the posting link.
- Ashby public job posting API docs (https://developers.ashbyhq.com/docs/public-job-posting-api)
  describe the board name as the path segment of the hosted board URL. They describe
  `isListed` (false = direct link only). The summary I read named no rate limits or usage
  restrictions. Public availability is still not a content license (per docs/JOBS.md).
- I did not review each employer's site terms. Before release, the owner should spot-check
  the terms for the newly enabled employers.
- Two career sites block automated reading with Cloudflare challenges (Perplexity, Character.AI).
  I treated that as "do not collect".

## Anything surprising
- xAI careers and its Greenhouse company name now read "SpaceXAI".
- Physical Intelligence moved its site to pi.website.
- Several employers (Scale, Together, Glean, CoreWeave, Skild, Agility) show listings by
  calling the Greenhouse API from their own pages rather than linking to a hosted board.
- During validation, unrelated in-progress errors came from other agents' files
  (`news/coreweave-launches-forge-with-weights-and-biases.yml`, then `artifacts/boltz-2.yml`).
  My files had no errors.
