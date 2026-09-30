# Research notes — group: r2-bigtech-artifacts-b

Reviewed 2026-09-29. I created 21 artifact records. I did not create or edit any organization files.
`npx tsx scripts/validate.ts` gives 0 errors across all content. The one remaining warning is in another group's file (`continue-extension`). An earlier run also showed an error in `mochi-1-preview`, another group's file; it had cleared by the final run.

**Method notes**
- The GitHub REST API rate limit was used up early on the shared IP. After that I read repositories through `raw.githubusercontent.com` (READMEs and LICENSE files) and through WebFetch of github.com pages.
- `curl` to sec.gov is blocked without a contact User-Agent, so I read the SEC filings with WebFetch.
- Only the TensorFlow repo metadata came from `api.github.com`, from one successful call.
- For filings and last-updated pages whose publication date I could not confirm, `published_at` is set to `null`.

**Eligibility sources**
- Google artifacts:
  - Alphabet FY2025 10-K cover: Mountain View, CA.
  - Exhibit 21.01: Google LLC, Delaware.
- NVIDIA: 10-Q for the quarter ended 2026-07-26 (Santa Clara, CA).
- Amazon: FY2025 10-K (Seattle, WA).
- Apple: FY2025 10-K (Cupertino, CA).

## Google

### `tensorflow` (framework): published
- Eligibility: `us-governed-project`. Evidence:
  - The PyPI author is Google Inc.
  - CONTRIBUTING requires the Google CLA and describes copying PRs into Google's internal codebase.
  - Google's developer blog sets the maintenance plan.
- **Material change:** the "What's new in TensorFlow 2.21" post (2026-03-06) says Google will now focus only on security and bug fixes, dependency updates, and community contributions. It points new GenAI work to Keras 3, JAX, and PyTorch. TF Lite has become LiteRT. This is in the summary.
- Latest release: 2.21.0 (PyPI, 2026-03-06).
- License: Apache-2.0 (LICENSE file plus GitHub metadata).

### `keras` (framework): published. The maintainer was the item to verify.
- The Google for Developers blog (2024-11-13) says "The Keras team at Google will continue" development and that the original creator continues to oversee the roadmap.
- CONTRIBUTING runs a `cla/google` check.
- Maintainer set to `google`, basis `us-governed-project`.
- The repo sits under the `keras-team` GitHub org, not `google`. The PyPI contact is a Google Group.
- The source title for the blog post is shortened so that it omits the individual's name, which appears in the published title and the URL.
- Latest release: 3.15.1 (PyPI, 2026-07-29).

### `timesfm` (family), `timesfm-3-0`, `timesfm-2-5-200m`: all published, `us-control`
- Developer: Google Research. The TimesFM 3.0 license is issued by Google LLC.
- **Material license change:** TimesFM 3.0 weights (Aug 2026) are under the **TimesFM Non-Commercial License v1.0**:
  - non-commercial and non-production use only
  - no distribution of the model or derivatives
  - personal and revocable
- Weights up to 2.5 remain Apache-2.0, and the code is Apache-2.0.
- Commercial use of TimesFM 3.0 is offered through BigQuery ML and Vertex.
- Neither checkpoint is gated. The tier is computed as open-weight for both. The 3.0 non-commercial terms appear in the license and availability notes.
- The 330M parameter count for 3.0 comes from the Google Research blog (2026-08-31). The model card gives only layer and width settings.
- Gaps:
  - No 3.0 technical report was found.
  - The README's "July 2, 2026: Updated PyPI to timesfm=2.0.2" conflicts with PyPI, which shows 3.0.2 uploaded 2026-09-09. Neither version is used as a catalog fact.

### `medgemma` (family), `medgemma-1-5-4b-it`, `medgemma-27b-it`: all published, `us-control`
- **License verified:** the **Health AI Developer Foundations Terms of Use**, not the Gemma Terms and not Apache. The licensor is Google LLC; the page was last modified 2024-11-15. The terms include:
  - use restrictions: the HAI-DEF Prohibited Use Policy, and no use that could make Google a "manufacturer" of a medical device
  - redistribution conditions, including a NOTICE file and seeking regulatory authorization
  - indemnity, and California law
- Hugging Face gating is `auto`: click-through acknowledgment that is processed immediately. I treated weights as `public` with the conditions stated.
- Author on both model cards: "Google". The Google Research blog credits Research together with the Health AI, Gemma, and Kaggle teams and Google DeepMind. I kept the maintainer as `google` only.
- Releases:
  - MedGemma 1.5 4B: 2026-01-13. This is the current version, and no MedGemma 2 exists.
  - MedGemma 27B multimodal: 2025-07-09.
  - Both dates come from Google's Gemma releases page.
- The 27B base is `google/gemma-3-27b-pt` per HF metadata. Provenance links to the `gemma` family record.
- Gaps:
  - No training code; only fine-tuning notebooks are published.
  - Several evaluation datasets are internal.
  - I read the two arXiv technical reports at abstract level only.

## NVIDIA

### `nemo-framework` (framework): published, `us-governed-project`
- **Material restructuring:**
  - NeMo Framework is now a set of libraries in the `NVIDIA-NeMo` GitHub org: Megatron Bridge, AutoModel, NeMo RL, Curator, Evaluator, Export-Deploy, Run, Gym, and others.
  - The original `NVIDIA-NeMo/NeMo` repo now resolves to `NVIDIA-NeMo/Speech` and has "pivoted" to speech. NeMo Speech 3.0.0 is out; v2.7.3 was the last pre-split release.
  - From the 26.02 container onward, NVIDIA's docs point to Megatron Bridge docs. The latest container listed is 26.06.
- Licenses: Apache-2.0, checked for the Megatron-Bridge, Automodel, RL, Curator, Evaluator, and Speech LICENSE files. The NGC **container** is under the NVIDIA AI Product Agreement and includes Llama 3 materials.
- Open question: the scope of "NeMo Framework" is fuzzy. NVIDIA's docs use the name both for the whole library set and, on the user-guide overview page, with a speech focus. The record describes the library set.

### `megatron-lm` (research-stack): published, `us-governed-project`
- **License discrepancy:** the LICENSE file applies **BSD-3-Clause**, with NVIDIA as copyright holder, to all files unless otherwise noted. Third-party code in the repo is Apache-2.0 or MIT.
  - The README badge says "Apache".
  - PyPI `megatron-core` shows "Apache 2.0" in the license field but a BSD classifier.
  - I followed the LICENSE file and recorded the conflict in `license_notes`.
- The README says development moved fully to GitHub in December 2025.
- Python requirement conflict: the docs say ≥3.10, while the README says 0.17 dropped 3.10 and PyPI 0.19.2 requires ≥3.12. This is noted in `run_notes`.

### `cosmos` (family), `cosmos3-super`, `cosmos3-nano`: all published, `us-headquarters`
- **Material license change:**
  - Cosmos 3 (released 2026-05-31) uses **OpenMDW-1.1** for weights and for the cosmos and cosmos-framework code. The technical report calls it "the Linux Foundation's OpenMDW-1.1 License".
  - Earlier Cosmos models (Predict2.5, Reason2) use the NVIDIA Open Model License, which is click-through gated on HF.
  - `spdx` is set to null because I did not verify an SPDX ID for 1.1. OpenMDW-1.1 is not on the rubric's OSI list.
- **Provenance (important):** the technical report says Nano and Super are **initialized from Qwen3-VL-8B and Qwen3-VL-32B weights**. The QwenLM/Qwen3-VL README identifies these as developed by the "Qwen team, Alibaba Cloud". Visual generation uses the **Wan2.2-TI2V-5B VAE encoder**. Eligibility rests on NVIDIA as developer, and the foreign base is recorded explicitly.
- Checklist:
  - Training recipe: `public`. The report details stages, optimizers, learning rates, token counts, and GPU counts.
  - Training code: `partial`. Cosmos-Framework publishes the trainer, but its documented recipes are SFT only.
  - Evaluation: `partial`. One released benchmark (Cosmos-HUE).
- Sizes: Super 64B, Nano 16B, and Edge 4B, listed later on HF. I did not create an Edge record.
- The NVIDIA press release calls Cosmos 3 "fully open". The catalog does not repeat that claim; its computed tier is open-weight.

### `gr00t` (family), `gr00t-n1-7-3b`: both published, `us-headquarters`
- Weights: NVIDIA Open Model License (version dated 2025-10-24 on NVIDIA's page). Code: Apache-2.0.
- **README inconsistency:** the overview says N1.7 is "fully commercially licensable under Apache 2.0". The README's License section and the model card assign Apache to the code and the NVIDIA Open Model License to the weights. I recorded the latter and noted the conflict.
- Release history:
  - Early access: 2026-04-17, per the HF blog.
  - The README now says "General Availability"; the GA date is not verified.
  - `released_at` uses the early-access date.
- **Provenance:** the backbone is Cosmos-Reason2-2B. Its HF metadata lists `Qwen/Qwen3-VL-2B-Instruct` as base. The N1.7 card's link text says "Cosmos-Reason2-2B" but the link points to the 8B repo.
- Some GR00T checkpoints on HF use other NVIDIA licenses; for example, GR00T-H links the NVIDIA OneWay Noncommercial License.
- Gaps:
  - No pre-training code; only fine-tuning code is published.
  - The GitHub releases page, read via WebFetch, returned implausible years, so it was not used.

## Amazon

### `chronos` (family), `chronos-2`: both published, `us-control`
- Attribution to AWS comes from the Chronos-2 arXiv HTML author affiliations and the Amazon Science blog (2025-10-20). The 10-K lists AWS as a segment of Amazon.com, Inc.
- Chronos-2 (120M, released 2025-10-20):
  - Weights and code are Apache-2.0, ungated.
  - Training code: `unknown`. The repo's training scripts are documented only for the March 2024 Chronos.
- Also published by AutoGluon on HF, not covered here: `autogluon/chronos-2-small` (28M) and `chronos-2-synth`.

## Apple

### `openelm` (family), `openelm-3b-instruct`: both published, `us-headquarters`
- **Material license change:**
  - The LICENSE file now in the HF repos (copyright 2025; repo last modified 2025-02-28) is the **Apple Machine Learning Research Model License**. It covers non-commercial research only, with derivatives limited to the same, and grants no patent rights.
  - The card's YAML metadata still says `license_name: apple-sample-code-license`, with the HF tag `apple-amlr`.
  - CoreNet code is under an Apple sample-code-style license (`spdx` null).
- Computed tier: **open-stack**. Training code (CoreNet pre-training plus the Alignment Handbook instruct recipe), the recipe, and evaluation commands are all published.
- Training data is marked `partial`, not `public`:
  - The sources are public datasets (RefinedWeb, deduplicated PILE, and subsets of RedPajama and Dolma v1.6).
  - Current availability of each, especially PILE, was not verified.
- The models use Meta's Llama tokenizer, which is downloaded separately.

### `fastvlm` (family), `fastvlm-7b`: both published, `us-headquarters`
- Verified Apple release: CVPR 2025 paper, the `apple/ml-fastvlm` repo, and the Apple ML Research article (2025-07-23).
- Licenses:
  - Weights: Apple Machine Learning Research Model License, research-only. The HF LICENSE and the repo LICENSE_MODEL have the same text.
  - Code: Apple software license.
- **Provenance:** the language model is **Qwen2-7B**. The README says "using Qwen2-7B LLM", and the config gives `LlavaQwen2ForCausalLM`. Qwen2-7B is Apache-2.0 on HF.
- `released_at` is null. HF repos were created 2025-08-25, but the GitHub checkpoints are earlier, and no release date is stated.
- Training uses the LLaVA codebase, and no FastVLM-specific training scripts were found, so training code is `unknown`.

### DCLM: not created
- `apple/DCLM-7B` is under the Apple Sample Code License. Its card is dated June 2024, and the HF repo was created in July 2024.
- Its card says "Developed by: DataComp for Language Models (DCLM) Team", a multi-institution effort with its repository at `mlfoundations/dclm`.
- A record would need a separate governance assessment, so none was created.

## Surprising or ambiguous items
1. Three license moves toward restriction, and one toward openness:
   - TimesFM 3.0: Apache → non-commercial.
   - OpenELM: sample-code license → research-only.
   - GR00T: the README's "Apache 2.0" claim conflicts with the weight license.
   - Cosmos 3 went the other way, from the NVIDIA Open Model License to OpenMDW-1.1.
2. Cosmos 3 Nano and Super, GR00T N1.7 (through Cosmos-Reason2), and FastVLM all build on Qwen (Alibaba) weights. I recorded this in provenance and in the eligibility explanations.
3. TensorFlow has effectively moved to maintenance mode as of 2.21.
4. The Megatron-LM license conflicts across LICENSE (BSD-3-Clause), the README badge, and PyPI.
