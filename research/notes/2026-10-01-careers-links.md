# Careers links for organizations without one (2026-10-01)

Scope: published, eligible organizations that had no `careers` block and no `hiring_url`.
The task came from a review finding: large employers without an automated feed, such as NVIDIA,
showed no careers link at all.

Method: I fetched each homepage and careers page with curl (UA `USASI-catalog-research/0.3`,
no credentials, no personal data, requests spaced 1 s or more). I read JavaScript-rendered pages
(Cloudflare, Block, Lightmatter, Inception, Lightning AI, SpaceX, Broadcom, Qualcomm) in the
browser pane, using their rendered links and the ATS requests each page made itself. On Lightning AI I
declined the cookie banner. Each Greenhouse/Ashby board got exactly one public API request
(`boards-api.greenhouse.io/v1/boards/<id>/jobs` or
`api.ashbyhq.com/posting-api/job-board/<id>?includeCompensation=true`). I then ran each saved payload
offline through the repository's own `lib/jobs/adapters.ts` normalizers and the `Job` schema, using
no network. I did not get past any bot protection and did not run `jobs:refresh`. I did not touch `data/`.

Edits to each file: a `careers` block (placed after `hiring_url`, or replacing `careers: null`); one new
source `<slug>-careers-jobs` (kind official-page, accessed_at/reviewed_at 2026-10-01); and
`updated_at: 2026-10-01`. I made no other changes. `hiring_url` stays null.

`npx tsx scripts/validate.ts`: 0 errors, 1 pre-existing warning (continue-extension).
`npm run jobs:validate`: passes (3,994 records, 31 sources; the new feeds have no data until a refresh).

## Results

Type key: **E** = Greenhouse/Ashby, `enabled: true`. **D** = board confirmed but `enabled: false`
(reason given). **U** = `unsupported`, `enabled: false`.

| Org | Careers URL | System | Type set | Notes |
|---|---|---|---|---|
| anyscale | https://www.anyscale.com/careers | Ashby `anyscale` | E | 21 jobs, all listed. Page links 14x to the board. |
| arc-institute | https://arcinstitute.org/jobs | Greenhouse `arcinstitute` | E | 22 jobs, company "Arc Institute". Nonprofit research institute with its own jobs page. |
| cartesia | https://www.cartesia.ai/careers | Ashby `cartesia` | E | 30 jobs. |
| crusoe | https://www.crusoe.ai/about/careers | Ashby `Crusoe` | E | 349 jobs. The page source references the Ashby board and API for `Crusoe`. The identifier is case-sensitive. |
| d-matrix | https://www.d-matrix.ai/careers/ | Ashby `d-Matrix` | E | 33 jobs. The homepage links to /careers/. |
| etched | https://www.etched.com/join | Ashby `etched` | E | 108 jobs. The homepage "Join" link goes here. |
| world-labs | https://www.worldlabs.ai/careers | Ashby `worldlabs` | E | 11 jobs. Its record's status note already covers the pending AMD acquisition, and I changed nothing about it. |
| mozilla-ai | https://www.mozilla.ai/company/careers | Greenhouse `mozillaai` | E | Board live, **0 jobs**. The page's script sets `ghSlug = "mozillaai"` and shows "No open roles at the moment". The identity rests on the official script (as with arceeai). |
| cloudflare | https://www.cloudflare.com/careers/jobs/ | Greenhouse `cloudflare` | E | 402 jobs, company "Cloudflare". The page fetches the boards-api and links to boards.greenhouse.io/cloudflare. |
| lightmatter | https://lightmatter.co/people/careers/ | Greenhouse `lightmatter` | E | 68 jobs, "Lightmatter". The page fetches the boards-api. |
| lightning-ai | https://lightning.ai/careers | Greenhouse `lightningai` | E | 54 raw / 53 after the talent-pool filter, "Lightning AI". "Explore open roles" opens job-boards.greenhouse.io/lightningai. |
| spacex | https://www.spacex.com/careers/jobs | Greenhouse `spacex` | E | **2,635 jobs**, "SpaceX". The page links to three boards: `spacex` (2,595 links), `xai` (276, already configured on the xai record) and `spacexglobal` (20, **not covered**, no request sent). Title+location overlap with current xai records: 0. Editor check: this feed is large and mostly non-AI roles (see below). |
| sambanova | https://sambanova.ai/company/careers/job-openings | Greenhouse `sambanovasystems` | D | 63 jobs, "SambaNova". `absolute_url` is on `sambanova.ai`, so with `posting_hosts: []` the feed fails as `unsafe-url`. Enabling it needs an editor-approved `posting_hosts: ["sambanova.ai"]`. |
| weights-and-biases | https://wandb.ai/site/careers/ | Greenhouse `weights_and_biases` | D | "View all roles" goes to coreweave.com/careers/weights-biases, which uses `data-board-id="weights_and_biases"`. That is a separate board from CoreWeave's `coreweave`: 8 jobs, company "Weights & Biases", 0 title overlap with current coreweave records. `absolute_url` is on `coreweave.com`, so enabling it needs `posting_hosts: ["coreweave.com"]`. |
| nvidia | https://www.nvidia.com/en-us/about-nvidia/careers/ | Eightfold (jobs.nvidia.com), Workday apply | U | Linked from the nvidia.com homepage. |
| meta | https://www.metacareers.com/ | custom (metacareers.com) | U | meta.com/about nav "Careers" goes to metacareers.com. |
| microsoft | https://careers.microsoft.com/ | Eightfold (apply.careers.microsoft.com) | U | Linked from the microsoft.com homepage. |
| amazon | https://www.amazon.jobs/ | custom (amazon.jobs) | U | Linked from the aboutamazon.com footer. |
| apple | https://www.apple.com/careers/us/ | custom (jobs.apple.com) | U | Linked from the apple.com homepage. |
| hugging-face | https://apply.workable.com/huggingface/ | Workable | U | huggingface.co footer "Careers" goes here. huggingface.co/jobs is a compute-jobs feature, not careers. |
| ibm | https://www.ibm.com/careers | IBM job search (ibm.com/careers/search); underlying system not identified | U | |
| amd | https://www.amd.com/en/corporate/careers.html | Jibe front end with iCIMS (careers.amd.com) | U | Linked from the amd.com homepage. |
| qualcomm | https://www.qualcomm.com/company/careers | Eightfold (careers.qualcomm.com) | U | Rendered in the browser. The page links to careers.qualcomm.com for job search. |
| oracle | https://www.oracle.com/careers/ | Oracle Recruiting Cloud (careers.oracle.com) | U | The oracle.com homepage returned 403 to curl, but the careers page itself loaded (HTTP 200, "Oracle Careers"). |
| block | https://block.xyz/careers/jobs | custom job pages on block.xyz | U | No board identifier exposed ("220 open jobs" rendered). Linked from the homepage. |
| broadcom | https://www.broadcom.com/company/careers | Workday (broadcom.wd1) | U | Rendered in the browser. |
| common-crawl | https://commoncrawl.org/jobs | listed on page, email applications | U | The foundation's own jobs page, linked from its homepage. |
| dell-technologies | https://jobs.dell.com/en | Oracle Recruiting Cloud (enterpriseplatform.dell.com CandidateExperience) | U | dell.com footer "Careers" link. |
| evolutionaryscale | https://biohub.org/careers/ | Greenhouse `biohub` (Biohub's board) | U | evolutionaryscale.ai "Join the team" goes to Biohub's careers page (the team joined Biohub per the existing status note). I sent no API request and did not assign Biohub's board to this record. The separate biohub record has `hiring_url` only. |
| github | https://github.careers | iCIMS | U | github.com footer link. It redirects to www.github.careers/careers-home. |
| hpe | https://careers.hpe.com/us/en | Phenom | U | The homepage fetch failed (HTTP/2 stream error, not a block), but the careers page on hpe.com loaded. |
| inception-labs | https://www.inceptionlabs.ai/careers | Gem (jobs.gem.com/inception) | U | The page calls api.gem.com. No Gem adapter exists. |
| linkedin | https://careers.linkedin.com/ | LinkedIn job search | U | Openings link into linkedin.com/jobs searches. |
| linux-foundation | https://www.linuxfoundation.org/careers | Teamtailor (careers.linuxfoundation.org) | U | A foundation, but it has its own careers page, linked from its homepage. |
| micron | https://www.micron.com/about/careers | Eightfold (careers.micron.com), Workday apply | U | |
| mintplex-labs | https://www.ycombinator.com/companies/anythingllm/jobs | Y Combinator Work at a Startup | U | anythingllm.com "Careers" link goes here. **0 jobs** listed today. |
| mlcommons | https://mlcommons.org/jobs/ | listed on page, email applications | U | Linked from the homepage. |
| red-hat | https://www.redhat.com/en/jobs | Workday (redhat.wd5) | U | |
| sifive | https://www.sifive.com/careers | Workday (sifive.wd1) | U | |
| tiny-corp | https://tinygrad.org/#worktiny | homepage section and bounty spreadsheet | U | "Work at tiny corp" section. It has no job board. |

Totals: 40 records edited. 12 enabled, 2 confirmed but disabled, 26 unsupported.

## Not edited

- **Already had `hiring_url`, so outside the task criterion:** google, google-deepmind, adobe,
  databricks, chroma, llamaindex, waymo, poolside, prime-intellect, salesforce. modular already
  has a `careers` block.
- **Blocked by bot protection, and the homepage was also blocked, so the careers link could not be checked:**
  perplexity, character-ai, midjourney (Cloudflare 403). intel, cisco, marvell, supermicro, tesla
  (Akamai "Access Denied" 403). arista-networks ("Client Challenge"). servicenow (careers page
  Cloudflare "Just a moment"; the homepage timed out). I did not try other clients.
- **No careers page found:** groq (groq.com/careers redirects to the homepage, which has no careers link),
  eleutherai, lmsys.
- **Universities, government agency and foundations without their own careers page:**
  carnegie-mellon-university, mit, new-york-university, princeton-university, stanford-university,
  uc-berkeley, university-of-washington, nist, lf-ai-data, pytorch-foundation and agentic-ai-foundation. The
  last three homepages have no careers link.
- Drafts and archived records: crewai, unsloth, continue.

## Editor attention

- **SpaceX volume.** Enabling `spacex` adds about 2,635 postings, most of them rocket, Starlink and
  manufacturing roles. It would be the largest feed on the Jobs page. The catalog defines membership, so I
  followed the assignment, but an editor may prefer `enabled: false` here. Crusoe (349) and Cloudflare (402)
  are also large.
- **Posting hosts.** SambaNova and Weights & Biases need an editor-approved `posting_hosts` entry
  before they can be enabled (see the table).
- **New feeds have no data yet.** Until `jobs:refresh` runs, their company pages will say the source
  "has not been successfully verified recently". This is the expected state for a new source.
- **Zero-job boards.** mozilla-ai is enabled with 0 current jobs, so it will show as a confirmed zero.
