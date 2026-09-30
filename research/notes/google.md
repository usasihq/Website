# Research notes — group: google

Reviewed 2026-09-29. `npx tsx scripts/validate.ts` gives 0 errors and 0 warnings across all content at the time of writing.

## Organizations

### `google` — Google (Alphabet) — **published**
- Decision: one record covers both Google and its parent Alphabet. The name is "Google (Alphabet)". `legal_name` gives Alphabet Inc. as parent/registrant and Google LLC as subsidiary. Reason: Alphabet's FY2025 10-K calls Google the largest of Alphabet's businesses, and Exhibit 21.01 lists Google LLC (Delaware) as a subsidiary. Other Bets are out of scope and get no separate records.
- Eligibility: `us-headquarters`. Principal executive offices are at 1600 Amphitheatre Parkway, Mountain View, CA, per the FY2025 10-K cover page (filed 2026-02-05). Alphabet is incorporated in Delaware.
- Products (3):
  - Gemini API (hosted-model-api)
  - Gemini app (assistant-app)
  - Gemini Enterprise Agent Platform (cloud-platform)
- **Material change:** Vertex AI has been renamed **Gemini Enterprise Agent Platform**. Its page title says "(formerly Vertex AI)", and cloud.google.com/vertex-ai redirects to /products/gemini-enterprise-agent-platform. This is recorded as a notable fact.
- Founded 1998: Google was incorporated in California in September 1998, per 10-K Note 1.
- Gaps:
  - The FY2025 10-K does not name Google DeepMind. It refers only to centralized AI R&D reported as "Alphabet-level activities". The FY2024 10-K does name it and is used in the google-deepmind record.
  - Google AI Studio and Cloud TPU are not listed as separate products. This keeps the list to 3.
  - Subscription prices and model version numbers on product pages were left out on purpose because they change often. The pages currently show Gemini 3.x model names.

### `google-deepmind` — Google DeepMind — **published**
- `parent_org_slug: google`, `parent_relationship: research-unit`, `ownership_category: unit-of-another-organization`.
- Eligibility: `us-control`, with a written assessment. Sources:
  - Sundar Pichai's 2023-04-20 Google blog post announcing Google DeepMind as a group combining DeepMind and Google Research's Brain team
  - Demis Hassabis's announcement post
  - Alphabet's FY2024 10-K. It says AI model teams across Google Research and Google DeepMind were consolidated in 2024 and reported within Alphabet-level activities, and that the Gemini app team joined Google DeepMind in October 2024.
  - The FY2025 10-K for Alphabet's HQ
- Headquarters is left `null`. The official pages I read (about, careers, announcement) do not name a headquarters. Search snippets and Wikipedia say London (King's Cross), but I did not use them. `other_locations` lists the 10 offices on the careers page (London, Bay Area, NYC, Cambridge (US), Bangalore, Montreal, Toronto, Paris, Zurich, Tokyo), using the page's own labels.
- Products: none. This avoids double-listing Gemini products that are already on `google`. The FY2024 10-K says the Gemini app team is now in Google DeepMind, but its costs stay in Google Services. The Gemini app is therefore listed only under `google`.
- Open question: the legal entities that employ GDM staff in each country were not reviewed. Nothing found suggests GDM is anything other than a unit of Google/Alphabet.

## Artifacts

### `gemma` (family) — **published**
- Maintainer: Google DeepMind. Every model card I read (Gemma 4, Gemma 3) says "Authors: Google DeepMind". `organization_slugs` lists google-deepmind and google, because models are published under the `google` Hugging Face org and ai.google.dev.
- No licenses and no checklist on the family. The `license_notes` claim records that **licensing changed across generations**:
  - Gemma 4: Apache 2.0.
  - Gemma 1–3, 3n and variants: Gemma Terms of Use, which incorporate a Prohibited Use Policy. The Terms page, last modified 2026-04-01, excludes Gemma 4 and points to the Gemma 4 license.
- `released_at: null`. The date of the first Gemma release was not verified.

### Gemma 4 releases (all **published**, eligibility `us-control`)

| Slug | Version | Released | Source for date |
| --- | --- | --- | --- |
| `gemma-4-31b` | "4 (31B)" | 2026-03-31 | Gemma releases page |
| `gemma-4-26b-a4b` | "4 (26B A4B)" | 2026-03-31 | Gemma releases page |
| `gemma-4-12b` | "4 (12B Unified)" | 2026-06-03 | Gemma releases page + 12B launch blog |

- **License, checked for each release:** the Hugging Face card metadata says `license: apache-2.0`, with `license_link` pointing to ai.google.dev/gemma/docs/gemma_4_license. That page holds the full Apache License 2.0 text (last updated 2026-04-01). The Hugging Face API reports `gated: false` for all six repos (pre-trained and -it). Gemma 3, for comparison, is `gated: manual` and `license:gemma`.
- Checklist:

  | Item | Status | Basis |
  | --- | --- | --- |
  | weights | public | |
  | inference_code | public | Transformers in the card; the google-deepmind/gemma JAX library supports Gemma 4 |
  | training_code | unknown | Fine-tuning code exists in the gemma library; no pre-training code found |
  | training_data_information | partial | Data types and a January 2025 cutoff are described |
  | training_recipe | partial | The tech report (arXiv 2607.02770 v2) gives TPUv4/v6e, JAX, Pathways, and says the recipe is "similar to Gemma 3" |
  | evaluation_materials | public | Benchmark tables |

- Date discrepancy: the Google releases page dates Gemma 4 to **March 31, 2026**, but the launch blog post is dated **April 2, 2026**. I used the releases page date.
- Not covered: E2B and E4B (the on-device sizes), and the Gemma 4 MTP drafters released 2026-04-16. The 12B launch blog mentions running in "16GB of RAM". I left this out because it states no precision or assumptions.
- The model card also includes a hard-coded benchmark table comparing against other models. No benchmark numbers were copied.

### `jax` (framework) — **published**
- Repo: github.com/jax-ml/jax. The LICENSE is Apache 2.0. The latest release is 0.11.2 (PyPI, 2026-09-17).
- Maintainer and governance: docs.jax.dev "About the project" says JAX is "led by the JAX core team", with contributions from Google DeepMind, Alphabet more broadly, NVIDIA and others.
- Eligibility: `us-governed-project`, with Google as the maintaining entity. Evidence:
  - The contributing guide says JAX follows Google's Open Source Community Guidelines and requires the Google CLA ("All submissions to Google Open Source projects…").
  - The PyPI author is "JAX team", jax-dev@google.com.
- Ambiguity: the README calls JAX "a research project, not an official Google product". This is Google's standard disclaimer and does not contradict Google stewardship, but it is noted in the eligibility explanation. Which Google unit hosts the core team (Google vs. GDM) is not documented, so the maintainer is set to `google`.

### `openxla` (framework) — **published** (the most judgment-dependent decision)
- Identity: an ecosystem of ML compiler and infrastructure components. openxla.org lists XLA, StableHLO, Shardy, PJRT, XProf, and Tokamax.
- Licenses: Apache 2.0, verified from the LICENSE files for xla, stablehlo, and shardy only. The other components were not checked, and `license_notes` says so.
- Governance: multi-company membership, with 14 member orgs in MEMBER-ORGS.md, including Alibaba, Arm, Graphcore, and SiFive. Google is listed as the "Founding" member. No project-wide governance charter was found. The documented evidence of the maintaining entity:
  - The XLA contribution guide requires the Google CLA and follows Google's Open Source Community Guidelines.
  - The StableHLO governance page says Google engineers assumed technical leadership during the 2022 bootstrapping phase, with open governance described as a future aim.
  - The XLA README says community spaces are under TensorFlow governance.
- I decided `eligible` / `us-governed-project`, with the caveats written into the explanation. **A reviewer may reasonably prefer pending_review + draft**, because:
  - the only governance text is component-level and dated to the 2022 bootstrapping phase;
  - openxla/community, which holds MEMBER-ORGS.md and the maintainers list, is archived;
  - the maintainers list gives names only, with no affiliations, and I did not use it for eligibility.
- The archived community README lists IREE as an OpenXLA repo, but the current website does not list IREE. IREE was left out of the record.
- `release_status: unknown`: xla and shardy have no GitHub releases, and stablehlo's last GitHub release is v1.0.0 (2024).

### `maxtext` (research-stack) — **published**
- Repo: github.com/AI-Hypercomputer/maxtext. **github.com/google/maxtext now 301-redirects there.** The repo moved to the AI-Hypercomputer org, whose profile says "all things Google Cloud AI Hypercomputer".
- Ownership evidence:
  - README copyright "2023–2025 Google LLC"
  - CONTRIBUTING requires the Google CLA
  - The PyPI maintainers include "cloud-tpu-team"
- License: Apache 2.0 (LICENSE file). The latest PyPI release is 0.2.4 (2026-08-21).
- `reproducibility_instructions` is left unknown. Tutorials exist, but I did not check whether they reproduce reported performance numbers.
- MaxText supports many non-U.S. model architectures (Qwen, DeepSeek, Kimi). This does not affect MaxText's eligibility, and this record assesses no model weights.

## Surprising or ambiguous items
1. Gemma 4 moved from the custom Gemma Terms of Use to **Apache 2.0**, and the Hugging Face repos are **no longer gated**.
2. Vertex AI was renamed **Gemini Enterprise Agent Platform**.
3. Gemma 4 has two launch dates: March 31 (releases page) and April 2 (blog). A 12B "Unified" encoder-free model was added on June 3, 2026.
4. Alphabet's FY2025 10-K does not mention "Google DeepMind" by name, although the FY2024 10-K does.
5. OpenXLA governance documentation is sparse and partly archived (see above).
6. The SEC 10-K pages were read via WebFetch and also downloaded with curl (with a User-Agent header) to read the full text, because the WebFetch summaries were truncated for these long documents. Gemma 4 tech-report details came from the arXiv HTML version, read via WebFetch and curl.
