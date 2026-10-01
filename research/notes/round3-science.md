# Round 3 notes: open AI models for science (2026-10-01)

Assignment: organizations `futurehouse`, `boltz`, `chai-discovery`, `profluent`; artifacts
`ether0`, `paper-qa`, `boltz-2`, `chai-1`, and one Profluent artifact (chose `profluent-e1`).

I read every cited source today, with WebFetch or with curl using the generic User-Agent
`USASI-catalog-research/0.3`. Raw files read this way: LICENSE and README files, Hugging Face API
JSON, PyPI JSON, the IRS CA extract, and the IRS info PDF. No email address, name, or other
identifier was sent in any request. The GitHub REST API rate-limited me, so I read repository
facts from raw files and GitHub web pages instead.

`npx tsx scripts/validate.ts` reports **0 errors**. The one warning is in
`continue-extension.yml`, which another group owns.

## Structural issue the lead needs to decide

A `record_level: release` record needs an existing `family_slug` record. My assignment allowed
only the listed files, so no family files could be created. I therefore wrote the four model
artifacts (`ether0`, `boltz-2`, `chai-1`, `profluent-e1`) as **family overview records**. This
keeps the build valid, but it has costs:

- Families cannot carry `licenses` or a `checklist`, so these records have no computed tier.
- The family page does not render `availability` or `license_notes`. To keep the key facts
  visible, I stated the license briefly in each summary (with sources). The full license detail
  and access conditions are kept in `license_notes` and `availability` in the YAML.

Recommendation: authorize one release file per model. The release-level facts below are
already verified, so they can be pasted in. Suggested release slugs: `ether0-24b`,
`boltz-2-v2` (or rename the family to `boltz` and make `boltz-2` the release), `chai-1-v0-6`,
and `e1-600m` / `e1-300m` / `e1-150m`.

### Verified release-level facts (for future release files)

| Model | Weights | Weight license | Code license | Training code | Data |
| --- | --- | --- | --- | --- | --- |
| ether0 (24B) | public, HF ungated | Apache-2.0 (card field + licensing text, (c) 2025 FutureHouse) | Apache-2.0 (reward functions, ether0 repo) | not public (README says the repo has no training code) | partial: card and preprint describe the stages; only the 325-question benchmark test set is public (CC BY 4.0) |
| Boltz-2 | public (HF boltz-community/boltz-2, MIT, ungated; boltz.bio gateway) | MIT (README: "all the code and weights"; HF tag mit) | MIT (LICENSE (c) 2024, three individuals) | partial: Boltz-1 training docs and configs; Boltz-2 training info marked "coming soon"; the announcement says the training pipeline is MIT | partial: Boltz-1 preprocessed data URLs in training.md; Boltz-2 data not described in the repo |
| Chai-1 | public (HF chaidiscovery/chai-1 ungated; chaiassets.com) | Apache-2.0 since 2024-11-27 (was the non-commercial Chai Discovery Community License) | Apache-2.0 | not public (README covers inference only) | unknown |
| Profluent-E1 (150M/300M/600M) | public, HF ungated, clickthrough-by-download | custom: Profluent-E1 Clickthrough License + Attribution Guidelines (spdx null) | Apache-2.0 (model code used separately from the weights, per LICENSE section 4) | unknown | not public (Profluent Protein Atlas) |

Evaluation materials:
- ether0: public benchmark plus reward functions.
- Boltz-2: Boltz-2 evaluation scripts are "coming soon"; Boltz-1 evaluation files exist.
- Chai-1: unknown.
- E1: the README reports results; scripts were not checked.

## Organizations

### FutureHouse (`futurehouse`): published
- **Eligibility:** `us-nonprofit-or-lab`. The about page says it is a 501(c)(3) nonprofit
  AI-for-science lab in San Francisco, founded in 2023.
- **IRS record:** the CA extract has FUTURE HOUSE INC, 1405 Minnesota St, San Francisco, with
  subsection 03, classification 2800, foundation code 15 (170(b)(1)(A)(vi)), and a 2022-11
  ruling. The IRS sort-name field holds a person's name, so I did not reproduce it.
- **Spinout:** Edison Scientific was announced on 2025-11-05 as a commercial spinout, and part
  of the team moved to it. The about page calls the two organizations independent, with
  separate governance and shared office space. I recorded this in notable_facts, not
  status_note, because FutureHouse itself did not change status.
- **Gaps:** Edison's location was not verified, so Edison is not cataloged. I also did not
  confirm whether the FutureHouse platform is now run by Edison (search snippets suggest so),
  so products is left empty.
- **Removed:** one notable fact about the funding model, under the no-funding rule.

### Boltz (`boltz`): published
- **Entity:** Boltz PBC, a public benefit corporation, per its terms and launch post (Jan 8,
  2026). The GSK release uses "Boltz, PBC".
- **Eligibility:** `us-headquarters`. The terms (updated 2026-05-06) give a Boston, MA notice
  address and choose Delaware law. Press releases are datelined Cambridge, MA. The HQ label is
  "Boston area, Massachusetts".
- **Privacy:** the street address in the terms is an apartment unit, so it is deliberately not
  reproduced.
- **Stewardship (the assignment asked about this):**
  - The company's website calls Boltz-1, Boltz-2, and BoltzGen "our models" and links its
    GitHub to `jwohlwend/boltz`. That is an individual developer's account, not a company org.
  - The MIT LICENSE copyright is held by three individuals (2024).
  - Boltz-2 itself was released (2025-06-06) by "the Boltz team at MIT Jameel Clinic alongside
    Recursion", before the company existed.
  - I recorded Boltz PBC as the current maintainer, with MIT as a related organization
    (`mit` exists and is published).
- **Not legal advice:** whether the copyright holders have assigned or licensed the work to the
  PBC is not documented.
- **Products:** Boltz API (hosted-model-api) and Boltz Lab. Newer models (BoltzMol-1,
  BoltzProt-1) are hosted only, and pharma collaborations mention proprietary models.

### Chai Discovery (`chai-discovery`): published
- **Eligibility:** `us-headquarters`. The careers page says "We work in person in San
  Francisco, California". The terms (2025-06-30) choose California law and San Francisco
  courts. The original Chai-1 license names "Chai Discovery, Inc." as the legal entity.
- **Gaps:** no filing or principal-office address was found. The about, privacy, and AUP pages
  return 404, and the Business Wire release was blocked (403).
- **Open vs. hosted:** Chai-2 is offered through an access form. Chai-3 is named on the news
  page in connection with a Pfizer license. No public weights exist for either.
- **Funding:** the homepage and news page are full of funding items, none of which were used.

### Profluent (`profluent`): published
- **Eligibility:** `us-headquarters`. The website terms name Profluent Bio Inc. as operator,
  with a notice address in Emeryville, CA, and California law with venue in Alameda County.
  The E1 license agrees.
- **Open releases verified:**
  - **ProGen3:** code under Apache 2.0, weights for 6 sizes under CC BY-NC-SA 4.0.
  - **protein2pam:** checkpoints under CC BY-NC 4.0 (HF API tags only; cards not read).
  - **Profluent-E1:** custom permissive clickthrough license.
  - **OpenCRISPR-1:** a protein sequence, "freely available to license for ethical research
    and commercial uses" through a Google Form. The license text itself was not reachable
    without the form, so its excluded uses are not recorded.

## Artifacts

### paper-qa: published (framework / project)
- **Maintainer:** FutureHouse. The repo is under the Future-House GitHub org, the LICENSE says
  "Copyright 2024 FutureHouse", and the PyPI author is "FutureHouse technical staff".
- **License:** Apache-2.0 for code.
- **Edison's role:** Edison hosts PaperQA2 docs (docs.edisonscientific.com/paperqa) and calls
  the repo the open algorithm behind its literature agent. PaperQA3 is not open: maintainers
  said in July 2026 there were "no plans" to open-source it. No source says maintenance moved
  to Edison.
- **Latest release:** 2026.8.12 on PyPI (CalVer since December 2025).
- **Gap:** the package was on PyPI from 2023-02, before the 2023 FutureHouse founding. Its early
  provenance (whether it started as an individual project) was not checked, so
  `released_at: null`.

### ether0: published (family overview; see the structural issue above)
- **Provenance:** fine-tuned from Mistral AI's Mistral-Small-24B-Instruct-2501 (Apache-2.0,
  per its card), using DeepSeek-R1 reasoning traces for the first SFT stage. Both are
  non-U.S. inputs, recorded in provenance. The eligible maintainer is FutureHouse.
- **Safety:** refusal post-training for OPCW Schedule 1/2 compounds and for
  explosives/poisons. There is no gating or access restriction.
- **Release date:** card created 2025-06-04 on HF; announcement 2025-06-05. `released_at` is set
  to 2025-06.

### boltz-2: published (family overview)
- The license facts are listed above.
- **Access conditions:** none biosecurity-specific. The default MSA option sends sequences to
  the public ColabFold server.
- **Affiliations:** the technical report also lists Valence Labs and ETH Zurich. This
  international collaboration is described, not hidden.

### chai-1: published (family overview)
- **License change (the assignment asked to note changes):**
  - Initial release on 2024-09-09 under the "Chai Discovery Community License Agreement".
    It covered code, weights, and outputs for non-commercial use only, excluded commercial
    entities, and incorporated an AUP.
  - Commit #186 on 2024-11-27 replaced LICENSE.md with the Apache 2.0 text.
  - Commit #187 renamed the file to LICENSE and bumped the version to 0.4.2.
  - The README now says Apache 2.0 for both code and weights.
- **Release:** the latest PyPI release is 0.6.1 (2025-03-18), with no release since then.

### profluent-e1: published (family overview)
- **Why this one:** it is the most open Profluent model release, with commercial use allowed.
- **License:**
  - `spdx: null` (custom).
  - Code used apart from the weights is under Apache 2.0.
  - The weights and the full release are under the Clickthrough License: perpetual,
    royalty-free copyright and patent grants, redistribution conditions, termination on
    breach, and amendment by Profluent.
  - The Attribution Guidelines require commercial entities to display "Profluent-E1".
  - Any drug, target, hit, or lead found using E1 must be labeled "Built with Profluent-E1",
    including in FDA disclosures.
- **Not chosen:** ProGen3, because its weights are non-commercial. It is recorded in the
  org's notable_facts instead.

## Surprising or ambiguous
- **Boltz:** the open repository and its copyright remain with individuals, not with Boltz
  PBC. The company is also moving its newest models to hosted-only access.
- **Chai-1:** the license moved from non-commercial to Apache 2.0 within about 11 weeks of
  release.
- **Profluent:** the E1 "permissive" license carries unusual attribution duties that reach
  regulatory filings.
- **FutureHouse:** its IRS ruling date (2022-11) predates the "founded in 2023" on its about
  page. I used the about page for the founding year.

## Follow-up (2026-10-01): release records created after the lead approved them

The coordinator approved release files. The four existing files remain `record_level: family`
overviews. No slug collided with an existing file.

| Release slug | Family | Weights license | Code license | Computed tier |
| --- | --- | --- | --- | --- |
| `ether0-24b` | ether0 | Apache-2.0 | Apache-2.0 (reward-function repo) | open-weight |
| `boltz-2-v2` | boltz-2 | MIT (one `weights-and-code` record) | MIT | open-weight |
| `chai-1-v0-6` | chai-1 | Apache-2.0 (`weights-and-code`, effective 2024-11-27) | Apache-2.0 | open-weight |
| `e1-600m` | profluent-e1 | Profluent-E1 Clickthrough License (custom, spdx null) | Apache-2.0 (code used apart from the weights) | open-weight; the weights rights indicator shows "unknown" because the license is custom |
| `e1-300m` | profluent-e1 | same as e1-600m | same as e1-600m | same as e1-600m |
| `e1-150m` | profluent-e1 | same as e1-600m | same as e1-600m | same as e1-600m |

### What changed
- **Release records:** each now carries its licenses, the v0.2 checklist (new keys
  `training_data_information`, `training_data_access`, `training_pipeline`; no legacy key),
  availability details, license notes, run notes, and provenance. The ether0 provenance records
  the Mistral-Small-24B-Instruct-2501 base and the DeepSeek-R1 traces.
- **Family records:**
  - Availability is now `not_applicable` with a pointer to the releases.
  - `license_notes`, `run_notes`, and `provenance` were moved to the releases, leaving the
    families with no licenses and no checklist.
  - License sentences were trimmed from the summaries; chai-1 now only says its license changed
    in November 2024.
  - Sources that were no longer cited were removed.
- **Validation:** `npx tsx scripts/validate.ts` reports 0 errors. The only warning is the
  existing one in `continue-extension.yml`.

### Judgment calls
- **Boltz-2:** one release covers both checkpoints, `boltz2_conf.ckpt` and `boltz2_aff.ckpt`.
  They were published together in one Hugging Face repository and serve one prediction
  pipeline, so I treated them as one release, not two. The approved slug `boltz-2-v2` is kept,
  even though the name shows the checkpoint files rather than a version number.
- **Chai-1:**
  - The release is the weights used by chai_lab 0.6.1. `__init__.py` on main says 0.6.1, and
    `paths.py` downloads `models_v2` components.
  - The six component file names match the Hugging Face repository, which was last modified
    2025-02-18.
  - `released_at` is null because the sources do not show which earlier package versions used
    the same files.
- **ether0 training code:** left `unknown`. The README says only that this repository has no
  training code, which does not show that the code is unpublished everywhere.
- **E1 parameter counts:** the README calls the models 150M, 300M, and 600M. The Hugging Face
  safetensors metadata counts 154,423,330 / 274,317,346 / 641,438,754 BF16 parameters, and the
  release summaries record those counts.
- **Boltz-2 training code:** marked `partial`. The repo's provided `structure.yaml` training
  config targets the `Boltz1` model class, and the Boltz-2 training documentation is still
  "coming soon".
