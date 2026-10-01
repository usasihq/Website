# Research notes: round3-bigtech-releases-2

Reviewed 2026-10-01. I created 1 organization and 8 artifact records and did not edit any existing file.
`npx tsx scripts/validate.ts` reports 0 errors. The one warning is in another group's file (`continue-extension`).

**Method notes**
- sec.gov blocks `curl` unless the User-Agent carries contact details, so all SEC pages were read with WebFetch. The cover pages came from the XBRL `R1.htm` viewer pages: IBM, Meta, and Alphabet fiscal 2025.
- The GitHub REST API was rate-limited. I read GitHub through `raw.githubusercontent.com` and the HTML pages, using the generic UA `USASI-catalog-research/0.3`.
- openai.com returned 403, so the gpt-oss-safeguard blog post was **not** read. I relied on the technical report PDF on cdn.openai.com, the Hugging Face cards and metadata, the GitHub README, and the user guide on developers.openai.com.
- LICENSE files were compared, after whitespace normalization, with the canonical Apache-2.0 text from apache.org. llm-d, InstructLab, the gpt-oss-safeguard Hugging Face repos, and the gpt-oss-safeguard GitHub repo all match exactly.
- No benchmark numbers, download counts, or funding figures were recorded. The safeguard report and the EmbeddingGemma card both contain scores; I left them out.

## Organization

### `red-hat`: published, `us-headquarters`, parent `ibm` (subsidiary)
- **Headquarters:** Red Hat's office-locations page lists "Corporate headquarters" at 100 East Davie Street, Raleigh, NC.
- **Ownership:** Exhibit 21 to IBM's FY2025 10-K lists "Red Hat, Inc." as USA (Delaware) with 100% voting interest. IBM's investor news item (2019-07-09) and the Red Hat closing press release say Red Hat operates as a "distinct unit within IBM" with its headquarters kept in Raleigh.
- **IBM cover page:** Armonk, NY; New York corporation.
- **Fields:** `ownership_evidence`, `parent_evidence`, and `profile` are filled. Products: Red Hat AI Inference, OpenShift AI, and RHEL AI, all `enterprise-software`.
- **Gaps and caveats:**
  - No careers URL was added.
  - The WebFetch summary of the Red Hat company page wrongly said "Red Hat is not owned by IBM". The page itself says "Joined with IBM since 2019", so I relied on the raw page text and on IBM's filing.

## Artifacts

### `faiss` (framework): published, `us-governed-project` via Meta
- README: "developed primarily at Meta's Fundamental AI Research group" and © Meta Platforms, Inc. The MIT LICENSE names Facebook, Inc. and its affiliates.
- Meta's FY2025 10-K cover: Menlo Park, CA.
- Latest release v1.15.1 (2026-09-16). First released March 2017, per the Engineering at Meta post.

### `gpt-oss-safeguard` (family) plus `gpt-oss-safeguard-120b` and `gpt-oss-safeguard-20b` (releases): all published, `us-headquarters`
- I made this a family because the official materials present two sizes. The technical report is dated 2025-10-29, so `released_at` is 2025-10.
- Both weight repos are ungated and use Apache-2.0. The USAGE_POLICY asks only for compliance with applicable law.
- The GitHub repo has docs and an example spam policy with a golden set, but **no code**. Its Apache-2.0 license is therefore recorded as `applies_to: documentation`.
- Parameter counts come from the cards. Layers, experts, context, and MXFP4 come from `config.json`.
- Memory/GPU-fit claims were left out because the sources do not state the precision assumptions.
- Gaps:
  - The training data and recipe are not described beyond "fine-tunes of gpt-oss … without any additional biological or cybersecurity data", so those items are `unknown`.
  - No training code was found.

### `petri` (eval): published, `us-governed-project` via **Meridian Labs**
- **Material change:** Anthropic handed Petri to Meridian Labs on 2026-05-07, and Petri 3.0 was released the same day.
- `github.com/safety-research/petri` now redirects to `meridianlabs-ai/inspect_petri`, and the PyPI package is `inspect-petri` (3.1.1).
- The LICENSE copyright holders are one individual (2025, not named in the record) and Meridian Labs (2026).
- Meridian Labs' site describes it as a 501(c)(3) at 501 Boylston St, Boston, MA.
- `anthropic` stays in `organization_slugs` because it originated the project. Meridian says Anthropic will continue to support it.
- Gaps:
  - Meridian Labs has no catalog organization (maintainer `organization_slug: null`). It could become a future org record.
  - Its 501(c)(3) status was not checked in the IRS listing.
  - The docs call Petri a collaboration with the UK AISI Red Team. This is described in the record, but eligibility rests on Meridian.

### `embeddinggemma-300m` (release, `family_slug: gemma`): published, `us-control`
- Google's docs, the release page, and the Gemma Terms appendix all present it as part of Gemma.
- **License:** the Gemma Terms of Use (spdx null), **not** Apache-2.0. EmbeddingGemma is in the Terms' Appendix, and the Terms send readers to the separate Gemma 4 license only for Gemma 4.
- **Parameter count discrepancy:** Google's docs and release page say 308M, while the HF card says 300M. Both are stated in the record.
- **Gating:** the HF metadata says `gated: manual`, but the gate text says requests are "processed immediately". I followed the MedGemma precedent (`public`) and disclosed the discrepancy in `access_conditions`.
- Released 2025-09-04, per the Gemma releases page.

### `llm-d` (runtime): published, `us-governed-project`
- It became a **CNCF Sandbox** project, accepted 2026-03-12 and announced 2026-03-24. The CNCF says it is part of the Linux Foundation, and the LF postal address is in San Francisco.
- Red Hat launched it on 2025-05-20. The founding contributors were CoreWeave, Google Cloud, IBM Research, and NVIDIA.
- MAINTAINERS.md lists project leadership from Google, IBM, and Red Hat. I recorded the employers only, not personal names.
- License: Apache-2.0. Latest release v0.10.0 (2026-09-29).
- Maintainers recorded: `linux-foundation`, `red-hat`, `google`, and `ibm`. `coreweave` and `nvidia` are listed as related organizations.

### `instructlab` (framework): **archived**, `us-governed-project`
- The README and docs carry a community announcement dated 2025-09-02 that refactors the project into separate repositories, with sdg_hub and training_hub in the Red Hat AI Innovation Team GitHub org.
- **Org verification:** that org's verified domain is `ai-innovation.team`, not redhat.com. Its own description says it is a team "within Red Hat", and the record words this accordingly.
- The main repo was archived 2026-04-23. Most org repos are archived. Exceptions: `training` and `eval`, which were unarchived and updated in 2026-08.
- Last release v0.26.1 (2025-05-05).
- Artifacts have no `status_note` field, so the sunset is recorded in `summary` and `archive_note`, with `publication_status: archived` (the continue-extension precedent).
- **License discrepancy:** the LICENSE is Apache-2.0, but the PyPI metadata says "Apache-2.0 AND MIT".

**Surprising:** two assigned items had changed hands or shut down. Petri moved from Anthropic to Meridian Labs, and InstructLab was split up and archived. llm-d is now governed by the CNCF rather than by Red Hat alone.
