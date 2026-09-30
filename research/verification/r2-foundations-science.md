# Verification log: r2-foundations-science

Batch **r2-foundations-science**. An independent fact-checker checked it on 2026-09-29 under
`research/VERIFIER_BRIEF.md`, applying `research/AGENT_BRIEF.md` and `research/AGENT_BRIEF_ROUND2.md`.

**Scope.** 18 assigned records (6 organizations, 12 artifacts), plus one new organization record, `biohub`, created under the special task.

**How sources were read.**
- Every cited source was opened today. Rendered pages were read with WebFetch. Raw files were read with `curl -A "USASI-factcheck/0.2"`: LICENSE files, READMEs, Hugging Face API JSON, PyPI JSON, IRS CSV extracts, and PDFs via `pdftotext`.
- No email address, name, or other personal identifier was sent in any request.
- The IRS EO BMF extracts were streamed and grepped, not saved. In-care-of names (individuals) are not reproduced anywhere.

**How the work was split.** Records were checked in four parallel groups; the lead verifier took the last group.
- Group A: Common Crawl and MLCommons records.
- Group B: LF AI & Data, ONNX, CAIS, HLE, MMLU.
- Group C: Arc Institute and Evo 2.
- Lead verifier: EvolutionaryScale, ESM, Biohub. The lead also spot-checked the other groups' most significant findings:
  - Evo 2 Supplementary Information tables.
  - Common Crawl's 2022 notice disabling unsigned S3 access.
  - The IRS rows for Common Crawl and MLCommons.
  - The AILuminate README's CC BY 4.0 data license and Apache-2.0 LICENSE.md.

**Validation.** `npx tsx scripts/validate.ts` reports 0 errors and 1 warning. The warning is in `artifacts/continue-extension.yml`, which is outside this batch.

**Dates.** `last_reviewed` was not changed on any record. `updated_at` is 2026-09-29 on every record.

**Correction.** The IRS field-layout PDF sometimes cited as `irs-soi/eo_info.pdf` returns 404. The working URL is https://www.irs.gov/pub/foia/ig/tege/eo-info.pdf (January 2026 edition). All records in this batch cite the working URL.

## Summary

- **Verified with no changes:** none. All 18 records needed at least one edit. Most edits narrow wording or add a supporting source.
- **New record:** `content/organizations/biohub.yml`, published, eligible, basis `us-nonprofit-or-lab`.
- **Eligibility and publication status:** no changes. `mmlu` stays **draft / pending_review / undetermined**, because no official source documents an organizational maintainer.
- **Computed tier change:** `evo-2-40b` moves from open-weight to **open-stack**. `training_recipe` went from partial to public after the Nature Supplementary Information (Methods, Tables 2–3) and the Savanna 40B configs were read. `evo-2-20b`, `esm3-sm-open-v1`, and `esmc-6b` remain open-weight.

### Special-attention findings

- **Nonprofit status.** All claims were confirmed against IRS EO BMF rows, with codes decoded from eo-info.pdf:

  | Organization | EIN | Subsection | Code |
  | --- | --- | --- | --- |
  | Common Crawl | 26-1635908 | 501(c)(3) | foundation 03, private operating foundation |
  | MLCommons Association | 85-0546914 | 501(c)(6) | classification 2, business league |
  | Arc Research Institute | 87-1920284 | 501(c)(3) | foundation 12, 170(b)(1)(A)(iii) |
  | Center for Artificial Intelligence Safety Inc | 88-1751310 | 501(c)(3) | foundation 15, 170(b)(1)(A)(vi) |
  | Chan Zuckerberg Biohub Inc | 81-1669175 | 501(c)(3) | foundation 12 |

  The official pages match these rows.
- **LF AI & Data.** The charter PDF linked from the governance-documents page defines it as a "Directed Fund" of The Linux Foundation. It is effective October 6, 2020; the file is labeled June 2024. The charter supports:
  - The Governing Board manages the fund under LF guidance.
  - LF has custody of the funds.
  - Charter amendments are subject to LF approval.
  - Trademarks are held by LF Projects, LLC.

  So the current modeling is supported: `foundation-hosted`, parent `linux-foundation`, relationship `hosted-project`, basis `us-control`.
- **ESM licensing.** Current Biohub materials state MIT:
  - Biohub/esm LICENSE.md: MIT, "Copyright 2026 Chan Zuckerberg Biohub, Inc."
  - The README and ESM3 README.
  - The ESMC-6B card: `license: [mit, other]`.
  - The esm3-sm-open-v1 card text. Its metadata has no license field.

  EvolutionaryScale's site still hosts a Community License Agreement from EvolutionaryScale, PBC. It covers the ESM-3 open model code and weights and limits use to non-commercial purposes; the page is undated.

  EvolutionaryScale's blog posts have been edited since release:
  - The Internet Archive snapshot of the ESM C post from 2024-12-05 says 300M/600M were released as open weights and 6B was offered via Forge and AWS SageMaker. The current post says all three are open weights under MIT.
  - The June 2024 ESM3 post named no license; the current one says MIT.

  The records now describe only what these sources show. No source dates the license change.
- **Evo 2 co-developers and license.**
  - Arc's 2026-03-04 post: "Arc and NVIDIA scientists" with collaborators at Stanford, UCSF, UC Berkeley, Goodfire, and the University of Washington.
  - NVIDIA's blog: the collaboration was led by Arc Institute and Stanford.
  - Nature affiliations also include Liquid AI, Columbia, and Johns Hopkins.
  - The family summary is narrowed to "collaborators at institutions including…". Arc is the sole maintainer: it owns the GitHub and HF organizations.
  - Licenses are all Apache-2.0: the HF weights, the evo2 code, Savanna, Vortex, and OpenGenome2. Third-party notices bundled in the LICENSE files are now mentioned.
- **AILuminate code vs data.**
  - `mlcommons/ailuminate` LICENSE.md is Apache-2.0, while its README licenses the demo data under CC BY 4.0. ModelBench is Apache-2.0.
  - Public: two 1,200-prompt demo sets, English and French. The records previously listed one.
  - Members only: the 12,000-prompt practice sets.
  - Hidden: the official test prompts.
  - Safety v1.1 (French, 2025-02-11) was added to `version`.
- **Humanity's Last Exam maintainers.** Center for AI Safety and Scale AI:
  - The lastexam.ai organizing team lists CAIS and Scale AI affiliations.
  - The HLE-Diamond release notes are bylined "Center for AI Safety and Scale AI".
  - The repo is `centerforaisafety/hle`, MIT, "Copyright (c) 2025 centerforaisafety".
  - The dataset is `cais/hle`, MIT, `gated: auto`, with a private held-out set.
  - Scale AI's maintainer citation was re-sourced from the README to the HLE-Diamond notes; the README shows only a logo.
- **EvolutionaryScale → Biohub (special task).** Verified from official sources:
  - Biohub announced on 2025-11-06 that "the team at EvolutionaryScale … will join Biohub".
  - EvolutionaryScale's site states "EvolutionaryScale is now part of Biohub".
  - ESM code, models, and API have moved to Biohub accounts and biohub.ai.

  **No acquisition or organizational merger is documented** by Biohub or EvolutionaryScale. EvolutionaryScale's law firm calls it "a strategic transaction with the Chan Zuckerberg Initiative whereby the EvolutionaryScale team will join Biohub".

  So `evolutionaryscale.parent_org_slug` stays **null**, and `status_note` states exactly what is documented. The ESM records (family, esm3-sm-open-v1, esmc-6b) now list `biohub` in `organization_slugs` and in the Biohub maintainer entry.

### Other significant corrections

- **"Pre-2025 terms of use" was wrong.** EvolutionaryScale's legacy ToS gives "Effective Date: 2025-01-15". Corrected in `esm`, `esm3-sm-open-v1`, `esmc-6b`, and `evolutionaryscale`.
- **Common Crawl S3 access.** Anonymous S3 access was claimed, but Common Crawl disabled unsigned S3 access in 2022; S3 API access requires authenticated AWS users. HTTPS needs no account. Fixed in `common-crawl` and `common-crawl-corpus`.
- **Common Crawl crawler history and indemnity.**
  - CCBot has run since 2013; a Hadoop crawler was used from 2008.
  - The indemnity clause was narrowed to third-party claims arising from use, including AI/LLM use.
- **MLPerf round status.** Inference v6.1's deadline has passed and its results are linked. Training v6.1 is open, with a 2026-10-16 deadline.
- **ONNX governance.** The claim that "technical decisions rest with the Steering Committee" overstated its role. Corrected per the governance doc: the committee sets direction, policy, and releases, and SIGs own specific areas.
- **CAIS openness summary.** "Publishes benchmarks and their code" and a "public" HLE set were narrowed. The research page links papers, and the HLE set sits behind an automatic HF access gate.

## Records

## Organizations and artifacts: Common Crawl and MLCommons

### common-crawl

Changes:
- **headquarters.label**: "Beverly Hills, California" → "Beverly Hills, California (address given in the Terms of Use and the IRS listing)". The Terms give the address as a notice and copyright-agent address, not explicitly as a headquarters. Sources: https://commoncrawl.org/terms-of-use, https://www.irs.gov/pub/irs-soi/eo_ca.csv
- **notable_facts[1]** (indemnity): "require users to indemnify Common Crawl for use of crawled content in connection with AI…" → "…indemnify Common Crawl against third-party claims arising from their use of the service or crawled content, expressly including use in connection with AI and machine learning systems such as large language models". Section 9 of the Terms covers third-party claims. Source: Terms of Use.
- **openness_summary**: "for download without an AWS account" → "for download over HTTPS without an AWS account". S3 API access requires authentication. Source: https://commoncrawl.org/get-started
- **sources.irs-eo-info**: title changed to the published title ("Exempt Organizations Business Master File Extract (EO BMF)"). published_at null → 2026-01, the date on the PDF.

Checked:
- About page: 501(c)(3) nonprofit, founded 2007, data collected since 2008, hosted through the AWS Open Data Sponsorship Program.
- Terms of Use (last updated 2024-03-07): "The Common Crawl Foundation", Beverly Hills address.
- IRS CA row, EIN 261635908, "COMMONCRAWL FOUNDATION", Beverly Hills: subsection 03, classification 1, foundation code 03 ("Private operating foundation (other)"), organization code 1 (corporation), ruling 2009-09. The lead verifier re-checked this row.
- CCBot page: robots.txt blocking and the opt-out registry.
- FAQ: robots.txt, Crawl-delay, nofollow.
- Also supported: legal_form, legal_name, founded, summary, eligibility, and tone.

Sources:
- https://commoncrawl.org/about
- https://commoncrawl.org/terms-of-use
- https://commoncrawl.org/get-started
- https://commoncrawl.org/ccbot
- https://commoncrawl.org/faq
- https://www.irs.gov/pub/foia/ig/tege/eo-info.pdf

Could not verify: nothing outstanding.

### common-crawl-corpus

Changes:
- **summary**: "collected by Common Crawl's CCBot crawler since 2008" → "collected by Common Crawl's crawlers since 2008". The About page says a custom Hadoop crawler ran from 2008 and was replaced by the Nutch-based CCBot in 2013.
- **availability.access_conditions**: removed the claim of access "from the s3://commoncrawl bucket … without an AWS account". The field now says HTTPS needs no account and S3 API access is limited to authenticated AWS users. Added source `cc-cloudfront-blog` (2022-03-01). That post says unsigned access to s3://commoncrawl "will be disabled".
  - The get-started page still contains `--no-sign-request` examples. They sit inside a `<div class="hide">` block, while the visible text says S3 API access "is only allowed for authenticated users".
  - Sources: https://commoncrawl.org/get-started, https://commoncrawl.org/blog/introducing-cloudfront-access-to-common-crawl-data
- **checklist.access.note**: "HTTPS or anonymous S3 access; no AWS account is required" → "HTTPS without an AWS account; S3 API access requires an authenticated AWS account".
- **license_notes** (indemnity): narrowed to third-party claims, as in the org record.
- **checklist.licensing.note**: "rights in that content stay with its original publishers" → the Terms say that content may be subject to its owners' separate terms and require users to respect third parties' copyrights. This now matches the Terms' wording.
- **checklist.stated_limitations.note**:
  - Removed "applies as few restrictions as possible", which is not a limitation.
  - Added "generally" to match the FAQ.
  - Added the Terms' statement that accuracy, quality, and lawfulness of crawled content are not guaranteed, with source `cc-terms`.
- **provenance.text**: now states that a custom Hadoop crawler ran from 2008 and the Nutch-based CCBot since 2013. Dropped the unsourced "publicly accessible". Added `cc-about`.

Checked:
- Version CC-MAIN-2026-39: collinfo.json ("September 2026 Index", crawled 2026-09-04 to 09-17) and /latest-crawl. released_at 2026-09 is appropriate.
- Earliest index: CC-MAIN-2008-2009.
- WARC/WAT/WET descriptions.
- The Dolma card lists Common Crawl as a source.
- License entry (`spdx: null`, `applies_to: data`) is accurate. The Terms grant a limited, non-transferable, non-sublicensable license to the "Service", which includes the Crawled Content. California law applies, with JAMS arbitration. `licensing: partial` stays.

Could not verify:
- The `.hide` CSS rule itself, which lives in an external stylesheet. The conclusion rests on the class name plus the 2022 announcement.

### mlcommons

Changes:
- **headquarters.label**: "(mailing address listed on the About page)" → "(address listed on the About page)". The page labels it only "Address".
- **openness_summary**: "a 1,200-prompt AILuminate demo set" → "1,200-prompt AILuminate demo sets in English and French". The repo has 1,200-row `…demo_en_us…` and `…demo_fr_fr…` CSVs. Source: https://github.com/mlcommons/ailuminate
- **sources.irs-eo-info**: same title and date fix as common-crawl.

Checked:
- About page: "AI engineering consortium", launched 2020-12-03, address 8 The Green #20930, Dover, DE. The footer says MLCommons, MLPerf, and MLCube are registered trademarks of MLCommons Association.
- IRS DE row, EIN 850546914, "MLCOMMONS ASSOCIATION", Dover: subsection 06 (501(c)(6)), classification 2 (business league), foundation 00, organization code 1, ruling 2023-10. The lead verifier re-checked this row. The AILuminate page also calls MLCommons a "501c6 non-profit organization".
- Benchmarks page: CLA requirement.
- Submission rules: peer review, simultaneous publication, "free for use under the MLPerf Terms of Use".
- The four LICENSE files are all Apache-2.0.

Sources:
- https://mlcommons.org/about-us/
- https://mlcommons.org/benchmarks/
- https://raw.githubusercontent.com/mlcommons/policies/master/submission_rules.adoc
- https://mlcommons.org/2024/12/mlcommons-ailuminate-v1-0-release/
- https://www.irs.gov/pub/irs-soi/eo_de.csv

Could not verify:
- The page lists Croissant and MLCube only as working groups. Calling them "tools" in the summary is loose but was left.

### mlperf

Changes:
- **run_notes[0]**: "lists the round open for submissions at review time as MLPerf Inference v6.1 (deadline July 31, 2026); Training results page lists 6.0" → new wording:
  - The Inference README's most recent round is v6.1 (deadline July 31, 2026), and the Inference: Datacenter page links to v6.1 results.
  - The Training README lists Training v6.1 (deadline October 16, 2026), while the Training results page shows v6.0.
  - source_ids: added `mlperf-inference-dc-page` and `mlperf-training-repo`.
- **availability.source_ids**: added `mlperf-policies-license` to support "rules … under Apache 2.0". The inference_policies and training_policies LICENSE.md files are also Apache-2.0.

Checked:
- Suite list.
- Closed and open divisions.
- Results that are modified or invalidated.
- Reference implementations are "not intended for 'real' performance measurements" (Training README).
- The replication README requirement.
- The three Apache-2.0 license entries.
- version and released_at null (ongoing suite).

Sources:
- https://github.com/mlcommons/inference
- https://github.com/mlcommons/training
- https://mlcommons.org/benchmarks/training/
- https://mlcommons.org/benchmarks/inference-datacenter/

Could not verify:
- Individual benchmark dataset terms. The record already says these were not reviewed.

### ailuminate

Changes:
- **version**: "Safety v1.0; Jailbreak v0.5" → "Safety v1.0 and v1.1; Jailbreak v0.5". MLCommons announced v1.1, adding French, on 2025-02-11, and the repo description says "v1.1 benchmark suite".
- **run_notes**: added a note on the v1.1 announcement. It records that the Safety page still labels the English and French official results "v1.0". New sources:
  - https://mlcommons.org/2025/02/ailumiate-v1-1-fr/
  - https://mlcommons.org/ailuminate/safety/
- **useful_for**: "using a public practice test" → "using practice prompts". The README offers full practice sets only to members; only the 10% demo sets are public.
- **availability.access_conditions**: now describes two 1,200-prompt demo sets, English and French, each 10% of a 12,000-prompt practice set. New source `ailuminate-fr-datasets` (https://mlcommons.org/2025/04/ailuminate-french-datasets/).
- **checklist.tasks_data.note** and the CC BY license entry name: plural "demo sets".
- **sources.ailuminate-paper.publisher**: removed an individual author name.

License checks (special attention):
- `mlcommons/ailuminate` LICENSE.md is Apache 2.0, and the GitHub sidebar says Apache-2.0.
- The README says "MLCommons licenses this data under" CC BY 4.0. The lead verifier re-read both.
- ModelBench LICENSE.md is Apache 2.0 and contains modelgauge.
- The existing license entries (Apache-2.0 for code, CC-BY-4.0 for data) and license_notes describe the difference correctly.
- Access tiers:
  - Public: the demo CSVs only.
  - Members, after a membership check: the practice sets.
  - Hidden: the official test prompts (methodology page, January 2025 post).

Other checks:
- The evaluator ensemble.
- arXiv 2503.05731: five-tier scale and limitations. v1 is 2025-02-19 and v2 is 2025-04-18.
- Jailbreak page: v0.5 and v0.7 white papers. The February 2026 post says "This is not a Benchmark release".
- released_at 2024-12-04 matches the v1.0 announcement.

Could not verify:
- The GitHub REST API was rate-limited, so the repo listing was read through WebFetch.
- Official sources disagree on whether French is v1.0 or v1.1 (noted in the run note).
- The `version` field has no source_ids, and the jailbreak page supporting "Jailbreak v0.5" is not in the record's sources. An editor may want to add it.

## LF AI & Data, ONNX, Center for AI Safety, HLE, MMLU

### lf-ai-data

Changes:
- **summary.source_ids**: added `lfai-onnx-page`, with a matching sources entry. The 2019 announcement alone does not show that ONNX is still hosted; the project page does ("Contributed by: ONNX Community… October 2019"). Source: https://lfaidata.foundation/projects/onnx/
- **openness_summary.text**: "Hosts open-source projects whose licenses are set per project; ONNX, for example, is published under the Apache License 2.0." → "Hosts open-source AI and data projects. ONNX, for example, kept its existing open-source license when it joined LF AI in 2019 and is published under the Apache License 2.0."
  - Reason: no source states that licenses are set per project. The 2019 announcement says ONNX keeps its existing OSI-approved license.
  - source_ids → [lfai-about, lfai-onnx-announcement, onnx-license].

Checked (special attention: charter and directed fund):
- The charter PDF is linked from the governance-documents page, read with curl and pdftotext. Its file name says June 2024; its text says "Effective October 6, 2020". It shows:
  - The entity is the "Directed Fund".
  - It operates under the guidance of its Governing Board and The Linux Foundation, and the Governing Board manages it.
  - The TAC facilitates collaboration among Technical Projects, and each project is governed by its own charter.
  - Trademarks are held by LF Projects, LLC.
  - LF has custody of and final authority over the fund's money (§14a).
  - Amendments need a two-thirds Governing Board vote, subject to LF approval.
- Together these support `legal_form`, `ownership_category: foundation-hosted`, `parent_org_slug: linux-foundation`, `parent_relationship: hosted-project`, and basis `us-control`. This is consistent with `pytorch-foundation`.
- Linux Foundation: "a 501(c)(6) non-profit", with a legal postal address in San Francisco (privacy policy).

Sources:
- https://lfaidata.foundation/about/governance-documents/
- https://lfaidata.foundation/wp-content/uploads/sites/3/2026/04/LF-AI-Data-Foundation-Participation-Agreement-Charter-JUNE-2024.docx.pdf
- https://lfaidata.foundation/about/
- https://lfaidata.foundation/blog/2019/11/14/lf-ai-welcomes-onnx/
- https://www.linuxfoundation.org/about
- https://www.linuxfoundation.org/legal/privacy-policy

Could not verify:
- Nothing was blocked. The About page does not itself say "directed fund"; the charter does.

### onnx

Changes:
- **eligibility.explanation**: "Technical decisions rest with an elected Steering Committee under the project's open governance, in which no single company may hold more than one seat." → the new wording says:
  - A five-member Steering Committee elected by community vote sets project direction, governance policy, and releases.
  - No single member company may have more than one representative.
  - Special Interest Groups are responsible for specific parts of the project.
  - Source: https://raw.githubusercontent.com/onnx/onnx/main/community/readme.md

Checked:
- LICENSE is Apache-2.0. The README has an SPDX header ("Apache-2.0", "ONNX Project Contributors") and points to the LF trademark rules.
- README supports summary and useful_for.
- PyPI JSON:
  - Latest 1.23.1, uploaded 2026-09-29 (UTC), so `version`, `released_at`, and `release_status` are correct.
  - Python >=3.10.
  - Wheels for Linux x86_64/aarch64, macOS universal2, Windows win32/amd64/arm64, and wasm32, plus an sdist. This matches `supported_platforms`.
  - The author contact is on the lists.lfaidata.foundation domain.
- LF AI & Data project page: "created by Facebook and Microsoft" and contributed October 2019. The page states no project stage; the record relies on the 2019 "graduate" announcement.

Sources:
- https://github.com/onnx/onnx
- https://raw.githubusercontent.com/onnx/onnx/main/LICENSE
- https://pypi.org/pypi/onnx/json
- https://lfaidata.foundation/projects/onnx/

Could not verify:
- Current LF AI & Data stage ("graduated") is not stated on the project page. The record does not claim it.

### center-for-ai-safety

Changes:
- **openness_summary.text**:
  - Before: "Publishes research benchmarks and their code; … a public question set on Hugging Face…"
  - After: "Publishes research papers and benchmarks. Humanity's Last Exam, for example, has MIT-licensed evaluation code on GitHub and a question set on Hugging Face that can be downloaded after an automatic access prompt, with a private held-out set kept back…"
  - Reason: the research page links papers and benchmark sites, not code repositories, and the HF dataset is `gated: auto`.
  - Added source `hle-hf-api`: https://huggingface.co/api/datasets/cais/hle

Checked (special attention: nonprofit status):
- IRS CA row, EIN 881751310, "CENTER FOR ARTIFICIAL INTELLIGENCE SAFETY INC", 555 Montgomery St Ste 1501, San Francisco.
  - Subsection 03 = 501(c)(3).
  - Organization code 1 = corporation.
  - Foundation code 15 = 170(b)(1)(A)(vi).
  - Deductibility 1, status 01, ruling 2023-01.
  - Codes confirmed against eo-info.pdf.
- CAIS pages:
  - Donate page: "US federally recognized 501c(3)", EIN 88-1751310.
  - Homepage: "San Francisco-based research and field-building nonprofit".
  - About page.
  - Research page: lists HLE, WMDP, and HarmBench; does not list MMLU.
  - Careers page.
- lastexam.ai: CAIS / Scale AI organizing team.
- `founded` stays null.

Sources:
- https://safe.ai/
- https://safe.ai/about
- https://safe.ai/donate
- https://safe.ai/work/research
- https://safe.ai/careers
- https://lastexam.ai/

Could not verify: nothing blocked.

### humanitys-last-exam

Changes:
- **maintainers[Center for AI Safety].source_ids**: added `hle-diamond`. The HLE-Diamond release notes are bylined "Center for AI Safety and Scale AI".
- **maintainers[Scale AI].source_ids**: [hle-site, hle-repo] → [hle-site, hle-diamond].
  - Reason: the README shows only a Scale logo and does not name Scale AI.
  - Scale AI is supported by the site's organizing-team affiliations and by the Diamond byline and citation (CAIS, Scale AI, HLE Contributors Consortium).
  - Source: https://lastexam.ai/blog/hle-diamond
- **checklist.limitations.note**: "Question corrections are tracked in the public HLE-Rolling change log" → "Changes to the question set (removals, re-additions, updates, and additions) are listed…". The log's entries are remove, readd, update, and add. Source: https://raw.githubusercontent.com/centerforaisafety/hle/main/hle-rolling-changes.txt
- **license_notes**: added that `cais/hle-diamond` metadata also lists MIT and uses the same automatic access gate. New source `hle-diamond-hf-api`: https://huggingface.co/api/datasets/cais/hle-diamond (created 2026-09-23 UTC).

Checked (special attention: maintainers):
- lastexam.ai:
  - 2,500 questions, over a hundred subjects, multimodal and closed-ended.
  - The questions are public, with a private held-out set.
  - Nearly 1,000 contributors.
  - News dates: finalized 2025-04-03; Nature 649, 1139–1146 on 2026-01-28; HLE-Rolling 2025-10-08; HLE-Diamond 2026-09-22.
  - Calibration method and limitations text.
- GitHub README: canary string, eval scripts, temperature 0.
- LICENSE: MIT, "Copyright (c) 2025 centerforaisafety".
- HF API for `cais/hle`: `gated: auto`, license MIT, created 2025-01-23. The `cais` org's full name is "Center for AI Safety", and the org is not verified on HF. The record makes no verification claim.
- arXiv 2501.14249: v1 on 2025-01-24, so `released_at: 2025-01` fits.
- HLE-Diamond: 1,000 questions (500 reasoning, 500 knowledge).
- No scores are recorded.

Could not verify:
- The Nature article text; the site's own citation supports volume, pages, and DOI.
- The raw HF card is gated, so it was read through the rendered page and the API.

### mmlu (stays draft / pending_review / undetermined)

Changes:
- **checklist.tasks_data.note**: "All 57 task splits are downloadable…" → "All 57 tasks, each with dev, validation, and test splits, are downloadable from Hugging Face without gating". Source: https://huggingface.co/api/datasets/cais/mmlu
- **checklist.limitations.source_ids**: [] → [mmlu-hf-card]. The status stays unknown; the note's "More Information Needed" statement is confirmed by the card.

Checked:
- Repo README: evaluation code, and a data archive on a personal university page (live).
- LICENSE: MIT (2020), naming an individual. The name is not reproduced here.
- HF card: 57 tasks, curators "More Information Needed". HF API: `gated: False`, MIT.
- arXiv 2009.03300: v1 2020-09-07, "ICLR 2021".
- The CAIS research page does not list MMLU.
- No official source states that CAIS or any other organization maintains MMLU. The record therefore stays draft, as instructed.

Sources:
- https://github.com/hendrycks/test
- https://huggingface.co/datasets/cais/mmlu
- https://arxiv.org/abs/2009.03300
- https://safe.ai/work/research

Could not verify:
- Whether CAIS maintains `cais/mmlu`. This is an editor follow-up.

## Arc Institute and Evo 2

### arc-institute

Changes:
- **summary.source_ids**: `[arc-about, arc-evo-tool]` → added `arc-evo2-one-year`. Neither of the original sources calls Evo 2 a "DNA language model"; the news post does. Source: https://arcinstitute.org/news/evo-2-one-year-later
- **notable_facts[1].source_ids** and **openness_summary.source_ids**: added `hf-api-arc-models` (new source). The cited repo and dataset card do not state the checkpoint licenses. The HF API shows `license:apache-2.0` on all 13 evo2 / savanna_evo2 repos. Source: https://huggingface.co/api/models?author=arcinstitute&limit=100
- **sources.irs-eo-info.published_at**: null → 2026-01 (the date on the PDF).

Checked (special attention: nonprofit status):
- About page: "independent nonprofit research organization based in Palo Alto", founded 2021, partners Stanford, UC Berkeley and UCSF.
- Contact page: 3181 Porter Dr, Palo Alto.
- IRS CA row, EIN 871920284, "ARC RESEARCH INSTITUTE", 3181 Porter Dr, Palo Alto:
  - Subsection 03 = 501(c)(3).
  - Foundation 12 = hospital or medical research organization, 170(b)(1)(A)(iii).
  - Organization code 1 = corporation.
  - Status 01, ruling 2022-01.
- These support `legal_name`, `legal_form`, and eligibility.
- Preprint (Feb 2025) and Nature publication (2026-03-04): confirmed.

Sources:
- https://arcinstitute.org/about
- https://arcinstitute.org/contact
- https://www.irs.gov/pub/irs-soi/eo_ca.csv
- https://www.irs.gov/pub/foia/ig/tege/eo-info.pdf

Could not verify:
- No Arc page states the legal name. It rests on the IRS row matching the contact-page address.

### evo-2 (family)

Changes:
- **summary**: "collaborators at Stanford University, UCSF, UC Berkeley, Goodfire, and the University of Washington" → "collaborators at institutions including …".
  - The Nature affiliations also include Liquid AI, Columbia, Johns Hopkins, and an independent researcher.
  - NVIDIA's blog (2025-02-19) describes a collaboration led by Arc Institute and Stanford, with NVIDIA researchers working on scaling and optimization.
  - Sources: https://www.nature.com/articles/s41586-026-10176-5, https://blogs.nvidia.com/blog/evo-2-biomolecular-ai/

Checked:
- README: StripedHyena 2, 1M context, OpenGenome2 at 8.8T tokens, checkpoints from 1B to 40B, NIM/hosted API, BioNeMo, Savanna.
- OpenGenome2 card: 8.8T base pairs.
- `released_at` 2025-02: Arc post; the 40B HF repo was created 2025-02-16.
- Maintainer is Arc only (GitHub and HF organizations).

Sources:
- https://raw.githubusercontent.com/ArcInstitute/evo2/main/README.md
- https://huggingface.co/datasets/arcinstitute/opengenome2
- https://arcinstitute.org/news/evo-2-one-year-later

Editor option:
- `stanford-university`, `uc-berkeley`, and `liquid-ai` now exist in the catalog and could be added to `organization_slugs`. They were not added here.

### evo-2-40b

Changes:
- **eligibility.explanation**: "with academic collaborators" → "with collaborators at several universities and at Goodfire". Goodfire is a company.
- **checklist.training_recipe**: partial → **public**.
  - The Nature Supplementary Information documents:
    - Pretraining at 1,024 then 8,192 tokens.
    - Multi-stage context extension to 1M.
    - Learning rates, batch sizes, iterations and tokens, and AdamW settings (SI Tables 2–3).
  - Savanna publishes the 40B pretrain, extension, and data configs.
  - The OpenGenome2 card lists per-phase data weights.
  - source_ids → [nature-evo2, nature-evo2-si, savanna-configs-40b, opengenome2-card]; the Nature article and the SI are new sources.
  - The lead verifier re-read the SI PDF and confirmed Tables 2 and 3.
  - SI: https://media.springernature.com/original/springer-static/esm/art%3A10.1038%2Fs41586-026-10176-5/MediaObjects/41586_2026_10176_MOESM1_ESM.pdf
  - Configs: https://github.com/Zymrael/savanna/tree/main/configs/40b
  - **Computed tier: open-weight → open-stack.**
- **license_notes**: added that the evo2 and Savanna LICENSE files also carry notices for bundled third-party code (a BSD-style NVIDIA license, and MIT for Fairseq). Added `evo2-license` and `savanna-license` to source_ids.

Checked (special attention: license):
- HF card and API: `license: apache-2.0`, not gated, 40B, 50 layers.
- evo2, Savanna, and Vortex LICENSE files: all Apache-2.0.
- PyPI `evo2` 0.6.0: Apache text.
- Nature "Code availability" section names Savanna as the training code.
- run_notes on FP8/Hopper requirements.
- OpenGenome2 files are not gated.

Could not verify:
- Which Savanna config maps to which training stage. `40b_train_8K.yml` has lr 2e-4, which matches SI Table 2.
- Evaluation notebooks were not run, so `evaluation_materials` stays partial.
- The GitHub REST API was rate-limited, so HTML pages were used.
- An editor may want to review whether the sourced "2,048 GPUs" training-scale figure fits the catalog's tone rules.

### evo-2-20b

Changes:
- **license_notes**: null → a note on the third-party notices in the evo2 LICENSE (source `evo2-license`).

Checked:
- v0.5.0 release notes: "model surgery" on 40B using logit-lens analysis, no additional training, 1× H100 vs 2× H100. Source: https://github.com/ArcInstitute/evo2/releases/tag/v0.5.0
- HF card and API: apache-2.0, not gated, `datasets: opengenome2`. savanna_evo2_20b is public.
- README: FP8/Hopper requirement.
- Partial statuses for `training_code`, `training_recipe`, and `evaluation_materials` are supported as written.

Could not verify:
- **released_at** 2026-02-28 is kept. The release timestamp is 2026-02-28T02:36Z, which is still Feb 27 in U.S. Pacific time. An editor may prefer 2026-02.
- **Layer count:** the 20B card says "50 layers" but its config has `num_layers: 24`. The record makes no layer claim.
- **NVIDIA link:** `nvidia` in `organization_slugs` rests on the 20B being derived from the 40B. No 20B-specific source mentions NVIDIA.
- **Layer-removal code** was not found.

## EvolutionaryScale, ESM, and Biohub

### evolutionaryscale

Changes:
- **summary.text**: "In November 2025 its team joined Biohub" → "In November 2025 Biohub announced that the EvolutionaryScale team would join Biohub, and EvolutionaryScale's website now states that it is part of Biohub".
  - Reason: the Biohub announcement of 2025-11-06 says the team "will join Biohub". No source gives the date the move was completed.
  - Source: https://biohub.org/news/ai-biology-cure-disease/
- **status_note.text**: "This catalog has no separate Biohub record, so no parent is linked" → a statement that the sources describe the team joining Biohub but do not document an acquisition of, or merger with, EvolutionaryScale, PBC, so no parent organization is linked. Two supporting points were added:
  - The legacy terms are marked "Historical Terms — No Longer in Effect" and refer to the period "before EvolutionaryScale joined Biohub".
  - A law firm's client note calls the deal a "strategic transaction with the Chan Zuckerberg Initiative".
  - `source_ids`: added `es-terms-legacy` and the new source `gunderson-note` (kind: news).
  - Reason: a `biohub` record now exists, so the old reason for leaving the parent empty no longer applied. See the Biohub section below.
- **notable_facts[0]**: "The ESM-3 open model was previously offered under … Community License Agreement that limited use to non-commercial purposes" → the site "hosts" a Community License Agreement "covering the ESM-3 open model code and weights that limits use to non-commercial purposes"; the current Biohub license and card state MIT; "the sources reviewed do not say when the terms changed".
  - Reason: the agreement page is undated. It defines the AI Model as the ESM-3 Open Model code and weights, and it restricts use to Non-Commercial Purposes. No source dates the switch to MIT, so "previously offered" was an inference.
- **notable_facts[2]**: "Before joining Biohub, EvolutionaryScale's terms of use …" → "EvolutionaryScale's former terms of use (effective January 15, 2025) …; the site marks those terms as no longer in effect."
  - Reason: this gives the effective date stated on the page.
- **openness_summary.text**: "the larger ESM3 models are available only through the Biohub Platform API" → "the ESM3 README lists the larger ESM3 models as accessed through Biohub, with only the small open model's weights on Hugging Face".
  - Reason: the ESM3 README says only that the other weights "are available when the model is accessed through Biohub". The word "only" was an overstatement.
- **eligibility.explanation**: "Before the change, EvolutionaryScale, PBC's terms of use gave a New York address" → "EvolutionaryScale, PBC's former terms of use (effective January 15, 2025) gave a New York address".

Checked and kept:
- **legal_name** "EvolutionaryScale, PBC": legacy ToS header and Community License.
- **legal_form**: public benefit corporation. The ESM3 post says "EvolutionaryScale is a public benefit company", and the name carries the PBC suffix.
- **Status claims** (Forge migration, repositories now under Biohub):
  - github.com/evolutionaryscale/esm returns HTTP 301 to github.com/Biohub/esm.
  - The Hugging Face `EvolutionaryScale` author has no models. All ESM repositories are under `biohub`.
  - The Biohub/esm README says the API "migrated from forge.evolutionaryscale.ai to biohub.ai".
- **Legacy address** 853 Broadway, New York, and New York governing law: legacy ToS.
- **ownership_category** `unit-of-another-organization`: kept, based on EvolutionaryScale's own statement "EvolutionaryScale is now part of Biohub".

Parent decision (special task):
- **parent_org_slug / parent_relationship left null.**
- **What the official sources say:**
  - Biohub: "the team at EvolutionaryScale … will join Biohub".
  - EvolutionaryScale: "EvolutionaryScale is now part of Biohub".
  - The legacy ToS: "before EvolutionaryScale joined Biohub".
- None of these uses acquisition or merger language.
- The only "acquired" wording found was in third-party aggregator and newsletter pages in search results (startuphub.ai, a Substack post). They were not used.
- The lawyers for EvolutionaryScale describe "a strategic transaction with the Chan Zuckerberg Initiative whereby the EvolutionaryScale team will join Biohub". That names CZI, not Biohub, as the counterparty and gives no form.
- An editor may want to revisit this if a Biohub Form 990 or an official statement documents the transaction form.

Sources opened today:
- https://www.evolutionaryscale.ai/
- https://www.evolutionaryscale.ai/policies/terms-of-use
- https://www.evolutionaryscale.ai/policies/community-license-agreement
- https://www.evolutionaryscale.ai/blog/esm3-release
- https://www.evolutionaryscale.ai/blog/esm-cambrian
- https://biohub.org/news/ai-biology-cure-disease/
- https://github.com/Biohub/esm (README via raw.githubusercontent.com)
- https://raw.githubusercontent.com/Biohub/esm/main/LICENSE.md
- https://raw.githubusercontent.com/Biohub/esm/main/_assets/ESM3_README.md
- https://huggingface.co/biohub/esm3-sm-open-v1
- https://www.irs.gov/pub/irs-soi/eo_ca.csv (streamed and grepped)
- https://www.gunder.com/en/news-insights/client-news/gunderson-client-evolutionaryscale-team-joins-biohub-in-strategic-transaction-with-chan-zuckerberg-initiative

Could not verify:
- The legal form of the EvolutionaryScale–Biohub/CZI transaction, and whether EvolutionaryScale, PBC still exists as an entity.
- The GitHub REST API was rate-limited, so the redirect was confirmed with an HTTP HEAD request.

### esm (family)

Changes:
- **maintainers[Biohub].organization_slug**: null → `biohub`. **organization_slugs**: [evolutionaryscale] → [biohub, evolutionaryscale]. Reason: new `biohub` record. The Biohub/esm LICENSE names Chan Zuckerberg Biohub, Inc.
- **eligibility.explanation**: "pre-2025 terms of use" → "former terms of use (effective January 15, 2025)". Reason: the legacy ToS states "Effective Date: 2025-01-15", so "pre-2025" was wrong. Source: https://www.evolutionaryscale.ai/policies/terms-of-use
- **run_notes[0]**: "Larger ESM3 models (medium 7B and large 98B) are available only through the Biohub Platform API" → "The ESM3 README lists medium (7B) and large (98B) ESM3 models that are accessed through Biohub, with only the esm3-sm-open-v1 weights on Hugging Face". Reason: the README does not use "only"; the wording now matches it.
- **provenance.text**: "ESMFold2 is trained on top of a frozen ESMC 6B model" → "ESMFold2 is built on ESMC 6B language model embeddings". `source_ids`: `mc-esmfold2` → `biohub-esm-repo`.
  - Reason: the cited ESMFold2 card does not mention ESMC or freezing.
  - The Biohub/esm README says ESMFold2 is "built on the ESMC 6B model" and "combines ESMC (6B parameter) language model embeddings". `mc-esmfold2` stays cited under useful_for.

Checked and kept:
- **Summary facts:**
  - ESM3 post dated 25.06.2024.
  - 98B largest ESM3: ESM3 README.
  - ESM C post dated 12.4.24, with 300M/600M/6B sizes.
  - May 2026 ESMFold2 and SAEs: Biohub world-model announcement of 2026-05-27 and the README.
- **useful_for:** ESMFold2 predicts structures for "all biomolecules, including small molecules, DNA, RNA": ESMFold2 card.
- **provenance:** 2.78B proteins and 771B tokens: ESM3 README. UniRef/MGnify/JGI: ESM C post.
- **released_at** 2024-06-25: date of the ESM3 post. An Internet Archive snapshot of 2024-06-25 confirms it.

### esm3-sm-open-v1

Changes:
- **maintainers[Biohub].organization_slug**: null → `biohub`. **organization_slugs**: [evolutionaryscale] → [biohub, evolutionaryscale].
- **eligibility.explanation**: "pre-2025 terms of use" → "former terms of use, effective January 15, 2025". Same reason as above.
- **license_notes.text**: now says that it is the model card's text that states MIT, and that the card's metadata has no license field (HF API `cardData.license` is empty). The Community License wording was narrowed as in the evolutionaryscale record, adding "the sources reviewed do not say when the terms changed". `source_ids`: added `hf-api-esm3-open`.
- **Licensing history (for the editor; not added to the record):**
  - The current ESM3 blog post says the 1.4B open model was released "under MIT license".
  - The Internet Archive snapshot of the same post from 2024-06-25 says only "releasing the weights and code for an ESM3 1.4B open model", with no license named.
  - The post has therefore been edited since release. The record describes only the current Biohub terms and the hosted Community License page.

Checked and kept:
- **License:** MIT, weights-and-code.
  - Card: "This repository is under a MIT license", linking to LICENSE.md.
  - LICENSE.md is MIT text, "Copyright 2026 Chan Zuckerberg Biohub, Inc."
  - The ESM3 README "Licenses" section says MIT.
- **Availability and weights:** public. HF API `gated: false`; the weights file `data/weights/esm3_sm_open_v1.pth` is present.
- **Summary (1.4B):** the ESM3 blog post and the README table (esm3-small 1.4B).
- **Run note:** the `ESM3.from_pretrained("esm3-sm-open-v1").to("cuda") # or "cpu"` example is in the ESM3 README.
- **training_data_information: partial.** The card gives the figures and the safety filtering.
- **released_at** 2024-06-25.

### esmc-6b

Changes:
- **maintainers[Biohub].organization_slug**: null → `biohub`. **organization_slugs**: [evolutionaryscale] → [biohub, evolutionaryscale].
- **eligibility.explanation**: "pre-2025 terms of use" → "former terms of use, effective January 15, 2025".
- **summary.text**: "Biohub released the 6B weights in May 2026 alongside ESMFold2, which is trained on top of a frozen ESMC 6B" → "Biohub's May 2026 release of ESMC, ESMFold2, and ESM Atlas included the 6B weights, and ESMFold2 is trained on top of a frozen ESMC 6B".
  - Reason: narrowed to what the Biohub announcement of 2026-05-27 and the README state ("we are releasing the source code and model weights for ESMC 6B, ESMFold2, and ESMC SAEs").
  - "Frozen ESMC 6B" is stated on the ESMC-6B card.
- **license_notes.text**: added a description of the conflicting EvolutionaryScale ESM C post.
  - As archived on 2024-12-05 (Internet Archive), the post released the 300M and 600M weights and offered ESM C 6B through Forge (academic use) and AWS SageMaker (commercial use).
  - The current version of the same post says all three sizes were released as open weights under MIT.
  - Added source `es-esmc-blog-archived`: https://web.archive.org/web/20241205001649/https://www.evolutionaryscale.ai/blog/esm-cambrian
  - Reason: the record cites the current ESM C post, and without this context that post contradicts `released_at: 2026-05`. The archived official text supports the May 2026 date for public 6B weights.

Checked and kept:
- **Card facts:** 6B parameters, 80 layers, 2.37e23 FLOPs, two-stage training, UniRef/MGnify/JGI clusters (83M/372M/2B), Transformers usage, GPU recommended, flash attention requiring bfloat16, 2048-token context, AUP out-of-scope clause, token and sequence classification heads, SAE links.
- **License:** card metadata `license: [mit, other]`; `license_link` points to THIRD_PARTY_NOTICE.md, which lists flash-attn, PyTorch, xformers and others. The README "Licenses" section says MIT. HF `gated: false`.
- **version:** "esmc-6b-2024-12" appears as the Biohub Platform model name in the README's `ESMCForgeInferenceClient` example.
- **released_at** 2026-05: HF `biohub/ESMC-6B` was created 2026-05-19, and the Biohub release announcement is dated 2026-05-27.

For the editor:
- A second HF repository, `biohub/esmc-6b-2024-12`, uses the esm-package format and is "kept for backwards compatibility".
- Its commit history shows weight uploads from 2025-12-01. When that repository became public is not documented.
- If an earlier public date is documented, `released_at` may need revisiting.
- The bioRxiv preprint (10.64898/2026.06.03.729735) was not read, so `evaluation_materials` and `training_code` remain unknown.

### biohub (new record, created under the special task)

Official sources support the record, so I created it (`content/organizations/biohub.yml`, published).
- **name / legal_name:**
  - Biohub calls itself "Biohub" on its site and in its announcements.
  - The Terms of Use (last updated 2026-05-27) and the Privacy Policy name "Chan Zuckerberg Biohub, Inc.", with a mailing address at 2682 Middlefield Road, Redwood City, CA 94063.
  - The IRS California extract lists EIN 81-1669175, "CHAN ZUCKERBERG BIOHUB INC", at the same address.
  - Record name: "Biohub (Chan Zuckerberg Biohub)". Legal name: "Chan Zuckerberg Biohub, Inc."
- **Nonprofit status:**
  - IRS row: subsection 03 = 501(c)(3); organization code 1 = corporation; foundation code 12 = hospital or medical research organization, 170(b)(1)(A)(iii); ruling 2016-09. Codes were checked against https://www.irs.gov/pub/foia/ig/tege/eo-info.pdf.
  - Biohub's own pages say "its 501c3 medical research organization" (Nov 2025) and "a 501(c)(3) biomedical research organization" (May 2026).
  - The in-care-of name in the IRS row is a person and is not reproduced. No financial fields were used.
- **Headquarters:** Redwood City, California. Evidence: the ToS mailing address, the "REDWOOD CITY, Calif." datelines on both announcements, and the IRS address.
- **other_locations:** left empty. Job listings mention New York, but no official page describing sites was read.
- **founded:** 2016 ("Since its founding in 2016", Nov 2025 announcement).
- **Fields set as assigned:**
  - Roles: research-lab, nonprofit-research.
  - Sectors: science, research.
  - Ownership: nonprofit.
  - Eligibility: eligible, us-nonprofit-or-lab.
  - Not added: `model-developer` would also be supported (Biohub releases ESMC and ESMFold2), but the assignment specified the two roles above.
- **Product (1):** Biohub Platform (https://biohub.ai, page title "ESM Protein Models, Atlas, and API"). It offers web tools and an API for ESMC, ESMFold2 and ESM3, plus the ESM Atlas. API tokens come from a developer console. The README describes a "freely accessible platform" with guardrails for controlled pathogen and toxin sequences.
- **notable_facts:**
  - The EvolutionaryScale team joining, with ESM repositories now under Biohub accounts.
  - Three models (VariantFormer, CryoLens, scLDM) announced as freely available in November 2025.
- **hiring_url:** https://biohub.org/careers/ (HTTP 200).
- **Sources opened:**
  - https://biohub.org/ and https://biohub.org/llms.txt
  - https://biohub.org/ai-models/
  - https://biohub.org/terms-of-use/
  - https://biohub.org/privacy-policy/
  - https://biohub.org/contact/ (no address given)
  - https://biohub.org/careers/
  - https://biohub.org/acceptable-use-policy/
  - https://biohub.org/news/ai-biology-cure-disease/
  - https://biohub.org/news/world-model-of-protein-biology/
  - https://biohub.ai/
  - the IRS CA extract and the eo-info.pdf information sheet
- **Could not verify:** https://biohub.org/about/ returns 404. No official page states the relationship to CZI beyond "with the support of the Chan Zuckerberg Initiative", so no parent or control relationship to CZI is recorded.

## Follow-ups for an editor

- **evolutionaryscale:** revisit `parent_org_slug` if Biohub or CZI documents the transaction form, for example in a Form 990 or an official statement. Consider whether the record should eventually be archived.
- **esmc-6b:** the esm-format HF repository `biohub/esmc-6b-2024-12` shows weight uploads from 2025-12-01. If an earlier public date is documented, `released_at` (2026-05) may need revisiting.
- **ESM releases:** read the bioRxiv preprint (10.64898/2026.06.03.729735) and the ESM3 Science paper. `training_recipe`, `training_code` and `evaluation_materials` are unknown or partial because these were not read.
- **biohub:**
  - Consider adding role `model-developer`. It is supported, but was not in the assignment.
  - Consider additional Biohub model records: ESMFold2, ESMC 300M/600M, and the virtual-cell models.
  - No changelog entry was created for the new record; the assignment allowed only one new file.
- **evo-2 family:** `stanford-university`, `uc-berkeley` and `liquid-ai` records now exist and could be cross-linked.
- **evo-2-20b:**
  - `released_at` precision: the release is UTC 2026-02-28, which is Pacific 2026-02-27.
  - The card's 50-layer figure conflicts with `num_layers: 24` in its config.
- **ailuminate:** decide on the French version label (v1.0 or v1.1), and add a source for "Jailbreak v0.5".
- **mmlu:** stays draft until an organizational maintainer is documented.
