# r2-foundations-science notes (2026-09-29)

Assigned organizations: `common-crawl`, `mlcommons`, `lf-ai-data`, `arc-institute`,
`evolutionaryscale`, `center-for-ai-safety`.
Assigned artifacts: `common-crawl-corpus`, `mlperf`, `ailuminate`, `onnx`, `evo-2`,
`esm3` (or the current ESM releases), `humanitys-last-exam`, `mmlu`.

Every cited source was read today, either with WebFetch or with curl (a generic
`USASI-catalog-research/0.2` User-Agent) for raw files: LICENSE files, raw READMEs, Hugging Face
API JSON, PyPI JSON, IRS CSV extracts, the IRS information-sheet PDF, and the LF AI & Data charter
PDF. No personal identifiers were sent in any request. `npx tsx scripts/validate.ts` reports
0 errors and 0 warnings for these files. The one warning left in the run is in
`continue-extension.yml`, which another group owns.

## Summary table

| Candidate | File | Decision | Eligibility basis | Computed tier |
| --- | --- | --- | --- | --- |
| Common Crawl | organizations/common-crawl.yml | published | us-nonprofit-or-lab | n/a |
| MLCommons | organizations/mlcommons.yml | published | us-nonprofit-or-lab | n/a |
| LF AI & Data Foundation | organizations/lf-ai-data.yml | published | us-control (LF directed fund) | n/a |
| Arc Institute | organizations/arc-institute.yml | published | us-nonprofit-or-lab | n/a |
| EvolutionaryScale | organizations/evolutionaryscale.yml | published, with status_note | us-control (now part of Biohub) | n/a |
| Center for AI Safety | organizations/center-for-ai-safety.yml | published | us-nonprofit-or-lab | n/a |
| Common Crawl corpus | artifacts/common-crawl-corpus.yml | published | us-governed-project | n/a (dataset) |
| MLPerf | artifacts/mlperf.yml | published | us-governed-project | n/a (eval) |
| AILuminate | artifacts/ailuminate.yml | published | us-governed-project | n/a (eval) |
| ONNX | artifacts/onnx.yml | published | us-governed-project | n/a (framework) |
| Evo 2 (family) | artifacts/evo-2.yml | published | us-governed-project | n/a (family) |
| Evo 2 40B | artifacts/evo-2-40b.yml | published | us-governed-project | open-weight |
| Evo 2 20B | artifacts/evo-2-20b.yml | published | us-governed-project | open-weight |
| ESM (family) | artifacts/esm.yml | published | us-governed-project | n/a (family) |
| ESM3 open small | artifacts/esm3-sm-open-v1.yml | published | us-governed-project | open-weight |
| ESMC 6B | artifacts/esmc-6b.yml | published | us-governed-project | open-weight |
| Humanity's Last Exam | artifacts/humanitys-last-exam.yml | published | us-governed-project | n/a (eval) |
| MMLU | artifacts/mmlu.yml | **draft** (pending_review / undetermined) | not established | n/a (eval) |

Slug note: I used the family slug `esm`, not `esm3`. The current open ESM releases span two
model lines, ESM3 and ESM C, so one `esm` family with releases `esm3-sm-open-v1` and `esmc-6b`
fits better than an `esm3` family, which could not hold ESMC 6B.

## Organizations

### Common Crawl (`common-crawl`): published
- The about page describes a 501(c)(3) nonprofit founded in 2007 that has collected data since
  2008.
- The Terms of Use (last updated 2024-03-07) name "The Common Crawl Foundation" with an address
  at 9663 Santa Monica Blvd, Beverly Hills, CA. The IRS CA extract lists EIN 26-1635908
  "COMMONCRAWL FOUNDATION" at the same address: subsection 03, organization code 1, foundation
  code 03 (private operating foundation).
- Products: none. The corpus is the artifact, and the index server was not treated as a separate
  product.
- Notable facts: CCBot respects robots.txt and there is an opt-out registry. The ToU has an
  indemnity clause covering AI/ML/LLM use of crawled content.

### MLCommons (`mlcommons`): published
- The about page footer names "MLCommons Association" and lists 8 The Green #20930, Dover, DE.
  It says the organization launched in December 2020.
- The IRS DE extract lists EIN 85-0546914 "MLCOMMONS ASSOCIATION" at that address: subsection 06
  (501(c)(6)), classification 2 (business league), ruling 2023-10.
- The in-care-of name in the IRS row is a person, so I did not reproduce it.
- The Dover address looks like a registered/virtual-office address. The HQ label says it is the
  mailing address listed on the About page. No other HQ is documented.
- Roles: `standards-body` and `open-source-steward`.

### LF AI & Data Foundation (`lf-ai-data`): published
- Its charter, linked from the Governance Documents page (PDF file dated June 2024, effective
  October 6, 2020), defines it as a "Directed Fund" of The Linux Foundation.
- Charter amendments require LF approval, and trademarks are held by LF Projects, LLC.
- I modeled it the same way as `pytorch-foundation`: `ownership_category: foundation-hosted`,
  `parent_org_slug: linux-foundation`, `parent_relationship: hosted-project`, basis `us-control`.
- Founded year was left null. The charter date is not a founding date, and I did not source the
  2018 LF AI or 2020 LF AI + ODPi merger history.
- Recent activity (2026 press: DocLang working group, AIRSEAI and RWKV joining) is not in the
  record. I only saw it in search results and did not use it.

### Arc Institute (`arc-institute`): published
- The about page says it is "an independent nonprofit research organization based in Palo Alto,
  California", founded in 2021, and partnered with Stanford, UC Berkeley, and UCSF.
- The contact page gives 3181 Porter Dr, Palo Alto. The IRS CA extract lists EIN 87-1920284 "ARC
  RESEARCH INSTITUTE" at 3181 Porter Dr: 501(c)(3), foundation code 12 (hospital or medical
  research organization). I used that as the legal name.
- Products: none recorded. Candidates seen but not added: Evo Designer and the Virtual Cell
  Atlas/Challenge.

### EvolutionaryScale (`evolutionaryscale`): published, with status_note — material change
- **Biohub has absorbed it.** On 2025-11-06, Biohub (Chan Zuckerberg Biohub) announced that the
  EvolutionaryScale team would join Biohub.
- evolutionaryscale.ai now says "EvolutionaryScale is now part of Biohub". It says current ESM
  models, APIs, and services are at biohub.ai under Biohub's terms. The old Terms of Use and
  Privacy Policy are marked historical.
- The GitHub repo `evolutionaryscale/esm` now redirects to `Biohub/esm`. All ESM model repos on
  Hugging Face are under the `biohub` org, and the `EvolutionaryScale` HF org lists no models.
- The Forge API has migrated to biohub.ai.
- Legal name: EvolutionaryScale, PBC, per the historical ToS and the Community License.
- Historical addresses: 853 Broadway, New York (ToS) and 33 Irving Pl, New York (privacy
  policy). Governing law was New York.
- Chan Zuckerberg Biohub Inc: IRS CA extract, EIN 81-1669175, Redwood City, 501(c)(3),
  foundation code 12.
- I set `ownership_category: unit-of-another-organization` with no parent slug, because the
  catalog has no Biohub record and I was not assigned one. `headquarters: null`, because the
  current HQ is undocumented; the NY address is described in a notable fact and in the
  eligibility text. Basis is `us-control`.
- **Open question:** the legal form of the combination is undocumented. It could be an
  acquisition of the PBC or only the team joining; Gunderson's page calls it a "strategic
  transaction" with CZI, and the team "will join Biohub". Consider creating a `biohub`
  organization record. Biohub now maintains the ESM models and other open models (VSCyto2D,
  DecoderTCR, and others on HF). With that record in place, evolutionaryscale could get
  `parent_org_slug` or be archived.
- Gunderson's news page was read but is not cited. The official Biohub and EvolutionaryScale
  pages were sufficient.

### Center for AI Safety (`center-for-ai-safety`): published
- The homepage says "a San Francisco-based research and field-building nonprofit". The donate page
  says "The Center for Artificial Intelligence Safety is a US federally recognized 501c(3)" with
  EIN 88-1751310.
- The IRS CA extract lists EIN 88-1751310 "CENTER FOR ARTIFICIAL INTELLIGENCE SAFETY INC" at 555
  Montgomery St Ste 1501, San Francisco: 501(c)(3), foundation code 15.
- The website ToS names the operator "Center for AI Safety, Inc".
- Founded year: not documented on pages read. Left null.
- Not recorded: the IRS lists a separate "CENTER FOR AI SAFETY ACTION FUND INC", a 501(c)(4) in
  SF. No CAIS page read today links the two, so it is not in the record.

## Artifacts

### Common Crawl corpus (`common-crawl-corpus`): published
- Version is the latest crawl in the index at review, CC-MAIN-2026-39 ("September 2026 Index"),
  from index.commoncrawl.org/collinfo.json. released_at is 2026-09, matching that version.
- Licensing: there is no named open license. The ToU grant a limited, non-transferable,
  non-sublicensable license to the "Service", which is defined to include the Crawled Content.
  - The content stays the responsibility of its originators and may be subject to third-party
    terms.
  - Users must indemnify Common Crawl for AI/ML/LLM use.
  - Disputes go to JAMS arbitration under California law.
- I recorded it as a custom license (`spdx: null`, `applies_to: data`) and set checklist
  `licensing: partial`.

### MLPerf (`mlperf`): published
- What is public:
  - Reference implementations: inference and training repos under Apache 2.0.
  - Rules repos: the policies repo is Apache 2.0.
  - Benchmark papers.
  - Results, published simultaneously after peer review among submitters. The submission rules
    say code and results are "free for use under the MLPerf Terms of Use".
- MLPerf is a registered trademark, and submitting requires a CLA.
- Dataset terms vary by benchmark and were not reviewed individually. This is stated in the
  record.
- Rounds at review: Inference v6.1 (submission deadline 2026-07-31, per the inference README) and
  Training v6.0 (results page).
- `version` and `released_at` are null because the project is an ongoing suite.

### AILuminate (`ailuminate`): published
- Safety v1.0 was released 2024-12-04. The site also lists Jailbreak v0.5. A 2026-02 jailbreak
  "v0.7" methodology paper was explicitly "not a Benchmark release".
- Public:
  - A 1,200-prompt demo set, licensed CC BY 4.0 per its README.
  - ModelBench, Apache 2.0.
- Not public:
  - The practice sets of 12k prompts per language are for members only.
  - The official test prompts are hidden.
- Discrepancy: the `mlcommons/ailuminate` repo's LICENSE.md file is Apache 2.0, while the README
  licenses the data under CC BY 4.0. Both are recorded in `license_notes`.

### ONNX (`onnx`): published
- Governance:
  - LF AI announced ONNX as a graduate project on 2019-11-14. The LF AI & Data project page says
    it was contributed "by ONNX Community and their representative companies in October 2019"
    and was created by Facebook and Microsoft.
  - Technical governance sits with an elected 5-person Steering Committee, with no more than one
    seat per company.
  - The PyPI contact is on the lists.lfaidata.foundation domain, and the README points to LF
    trademark rules.
- License: Apache-2.0, from the LICENSE file and the SPDX headers.
- Version: 1.23.1, uploaded to PyPI on 2026-09-29, the day of review.
- `organization_slugs` includes `microsoft` and `meta` as originators, based on the LF AI & Data
  statement that Facebook and Microsoft created it.
- Graduation status: WebFetch's summary of the LF project page said "Graduated", but I could not
  confirm that in the page text. The record relies on the 2019 announcement.

### Evo 2 (`evo-2` family; `evo-2-40b`, `evo-2-20b`): published
- Developers: Arc's 2026-03-04 "One Year Later" post says it was developed by "Arc and NVIDIA
  scientists" with collaborators at Stanford, UCSF, UC Berkeley, Goodfire, and the University
  of Washington. It was published in Nature on 2026-03-04 (doi:10.1038/s41586-026-10176-5).
- Cross-references: `organization_slugs` lists `arc-institute` and `nvidia`. I did not add
  `stanford-university` or `uc-berkeley`, to avoid dangling cross-references if those records
  are not created. They are named in the summaries.
- Licenses: all Apache-2.0 — weights (HF cards), evo2 code (LICENSE), Savanna training code
  (LICENSE), and the OpenGenome2 data (HF card).
- Savanna is hosted in a personal GitHub account (`Zymrael`). Its README says it is maintained by
  "a small team". This is recorded as a license note, not as eligibility evidence.
- The Nature article redirected to an auth page and the bioRxiv preprint returned 429, so neither
  was read.
  - Consequence: `training_recipe` is `partial` for both releases, so both compute as
    open-weight rather than open-stack.
  - If an editor reads the Nature or bioRxiv methods and confirms the Savanna 40B configs, 40B
    could move to `public`, which would make it open-stack.
- Evo 2 20B: released 2026-02-28 (v0.5.0). It was made by "model surgery" on 40B (layer
  removal, no additional training). `training_code` is `partial` because the layer-removal code
  was not identified.
- Other checkpoints not recorded: 7B, 7B-262k, 7B-base, 1B-base, 40B-base, and a
  microviridae-finetuned 7B.
- The release notes give a memory figure ("38GB on GPU"). I left it out because precision was
  not stated clearly.

### ESM (`esm` family; `esm3-sm-open-v1`, `esmc-6b`): published — license change found
- **Current licenses are MIT.**
  - The Biohub/esm LICENSE.md reads "Copyright 2026 Chan Zuckerberg Biohub, Inc." with MIT
    text.
  - The model cards say MIT. biohub/ESMC-6B lists "mit" and "other", where "other" links to the
    third-party notice of code dependency licenses.
  - The README asks users to follow Biohub's Acceptable Use Policy. I did not read the AUP
    itself.
- **Historical non-commercial license:** evolutionaryscale.ai still hosts a "Community License
  Agreement" from EvolutionaryScale, PBC that limited the ESM-3 open model to non-commercial
  purposes. This is recorded in the license notes.
- **Surprising:** the EvolutionaryScale blog posts appear to have been edited to match the new
  terms.
  - The ESM3 post now says the 1.4B open model was released "under MIT license".
  - The ESM C post now says ESM C 300M, 600M, and 6B were all released as open weights under
    MIT in December 2024.
  - This conflicts with the Community License page. I recall that 600M was originally
    non-commercial and 6B was API-only, but I could not verify that, so the records do not claim
    it.
  - The Biohub README says Biohub is "releasing the source code and model weights for ESMC 6B,
    ESMFold2, and ESMC SAEs". biohub/ESMC-6B was created on HF 2026-05-19, and the Biohub
    announcement is dated 2026-05-27. So `esmc-6b` has `released_at: 2026-05`.
- Maintainers: "Biohub (Chan Zuckerberg Biohub, Inc.)" with a null slug, because there is no
  catalog record, plus `evolutionaryscale` as original developer.
- Eligibility basis is `us-governed-project`: Biohub is a U.S. 501(c)(3), and EvolutionaryScale
  was a New York PBC.
- Not recorded as releases: ESMFold2 (MIT, May 2026), ESMC 300M/600M, the ESMC SAEs, and ESM
  Atlas. They are mentioned in the family summary.
- The ESM3 Science paper and the 2026 bioRxiv preprint were not read. Training code, training
  recipe, and evaluation items are `unknown` or `partial` accordingly.

### Humanity's Last Exam (`humanitys-last-exam`): published
- Maintainers, exactly as documented:
  - The lastexam.ai "Organizing Team" lists affiliations "1 Center for AI Safety, 2 Scale AI".
  - The GitHub repo is `centerforaisafety/hle`, with MIT "Copyright (c) 2025 centerforaisafety".
  - The dataset is `cais/hle` under the HF org whose full name is "Center for AI Safety". It is
    not verified on HF.
  - Both CAIS and `scale-ai` are maintainers.
- Access: the dataset is MIT with `gated: auto`, meaning users must agree to share contact info.
  A private held-out set exists. Availability and `tasks_data` are therefore `partial`.
- Timeline: finalized at 2,500 questions on 2025-04-03; published in Nature in Jan 2026 (Nature
  649, 1139–1146, per the site); HLE-Rolling released 2025-10-08; HLE-Diamond (1,000 questions,
  `cais/hle-diamond`) released 2026-09-22. The HLE-Diamond license was not stated on the release
  page.
- No scores were recorded. The site and the HLE-Diamond page show model accuracies.

### MMLU (`mmlu`): draft, pending_review / undetermined
- Authors: seven researchers (ICLR 2021, arXiv 2009.03300).
- Maintenance evidence found:
  - The repo is `hendrycks/test`, a personal GitHub account. The MIT license reads "Copyright
    (c) 2020" and names an individual.
  - The data archive is linked from a personal UC Berkeley web page.
  - The HF copy `cais/mmlu` is under the "Center for AI Safety" HF org. Its card lists no
    curators ("More Information Needed") and credits an individual contributor for adding it.
  - CAIS's research page does not list MMLU. MMLU (2020) predates CAIS's IRS ruling (2023-01).
- Only individuals are documented, so per the brief the record is `pending_review` + `draft`.
- Open question: would CAIS confirm that it maintains `cais/mmlu`? If so, the record could
  become eligible with basis `us-governed-project`.

## Other things worth flagging
- The GitHub REST API rate limit (60/hour, unauthenticated) ran out mid-session. Later GitHub
  reads used raw.githubusercontent.com or WebFetch.
- Common Crawl's Terms of Use indemnity clause for AI/LLM use may interest readers of dataset
  records that derive from Common Crawl, such as `dolma`. Nothing was changed outside my files.
- The LF AI & Data charter file is named "JUNE-2024" but its text says "Effective October 6,
  2020". The separate September 2024 charter PDF (lfaidata_charter_091224.pdf) was also read.
  Its opening, directed-fund, and amendment clauses are the same, apart from formatting.
