# Verification log: r2-bigtech-b

Checked on 2026-09-29 against the cited sources. I read raw files with
`curl -A "USASI-factcheck/0.1"`: Hugging Face READMEs, LICENSE files, HF API metadata, GitHub
READMEs and license files, PyPI JSON, and the Cosmos 3 technical report PDF (read with
pdftotext). I read rendered pages with curl plus HTML stripping, or with WebFetch. SEC cover
pages (Alphabet 10-K and Exhibit 21.01, NVIDIA 10-Q, Amazon 10-K, Apple 10-K) were read with
WebFetch. No personal identifiers were sent in any request.

`npx tsx scripts/validate.ts` reports 0 errors after the edits. The one warning is about
`continue-extension`, which is not in this batch.

Computed tiers after the edits:
- **Open-weight:** timesfm-3-0, timesfm-2-5-200m, medgemma-1-5-4b-it, medgemma-27b-it,
  cosmos3-super, cosmos3-nano, gr00t-n1-7-3b, chronos-2, fastvlm-7b.
- **Open-stack:** openelm-3b-instruct. It has public training code and recipe and partial
  data information. It is not fully open, because its weight and code licenses are not
  OSI-approved.

Gating, from the HF API `gated` field:
- `"auto"` (click-through, processed immediately) for all MedGemma repos. OPENNESS.md treats a
  click-through license as `public`, so `weights: public` stands.
- `false` for TimesFM 3.0 and 2.5, both Cosmos 3 repos, GR00T-N1.7-3B, chronos-2,
  OpenELM-3B-Instruct, and FastVLM-7B.

## Google

### tensorflow
- `useful_for.text`: before, "Its on-device inference runtime, formerly TensorFlow Lite, now
  continues as LiteRT". After, "Google's 2.21 announcement says the TensorFlow Lite project has
  been renamed LiteRT and is developed separately". Reason: the blog says TF Lite was renamed
  and "is in active development separately". Source: tf-221-blog.
- `eligibility.explanation`: before, "announced the project's 2026 maintenance plan". After,
  "announced, with the 2.21 release, the work TensorFlow would focus on going forward".
  Reason: the blog never uses the word "maintenance". It says "we will exclusively focus on"
  three things: security and bug fixes, dependency updates, and community contributions.
  Source: tf-221-blog.
- The summary's "limit TensorFlow work to…" is a fair paraphrase of "exclusively focus on",
  so I kept it.
- Checked and found accurate:
  - The blog is dated March 6, 2026.
  - PyPI 2.21.0 was uploaded 2026-03-06 and lists author Google Inc.
  - The LICENSE is Apache-2.0, and the GitHub API reports `spdx_id: Apache-2.0`.
  - The CLA and copybara internal-merge text in CONTRIBUTING.
  - The install requirements: Ubuntu 16.04+, macOS 12+ CPU-only, Windows native without GPU
    after 2.10, WSL2 with GPU, and Python 3.10–3.13 as of 2.21.
  - Alphabet's 10-K address is Mountain View.

### keras
- `eligibility.explanation`: before, "states that the Keras team at Google continues to develop
  the project and describes Keras 3 as a continuing Google investment". After, "states that the
  Keras team at Google will continue to collaborate on the project in the open-source community
  and describes Google's continued investment in Keras 3". Reason: that is what the November
  13, 2024 post actually says. Source: google-blog-keras-2024.
- Checked and found accurate:
  - The README text on multi-backend support and OpenVINO being inference-only.
  - The README's Linux/macOS support, WSL2 advice, and CUDA requirement files.
  - The `cla/google` check.
  - Keras 3.15.1 was uploaded 2026-07-29.
  - The KerasHub description on keras.io.
  - The LICENSE is Apache-2.0.

### timesfm (family)
- `summary.text`: before, "version 3.0 adds native multivariate forecasting and covariate
  support". After, "…and native support for past-only and past-and-future covariates". Reason:
  the README shows that 2.5 already had covariate support through XReg (October 2025).
  Source: timesfm-readme.
- Checked and found accurate:
  - Versions 1.0/2.0/2.5/3.0 and their dates.
  - ICML 2024.
  - BigQuery ML, Sheets, and Vertex.
  - The license notice in the README.
  - Exhibit 21.01 lists Google LLC as a Delaware subsidiary.

### timesfm-3-0
- `license_notes.text`: added "but the restrictions also bar using outputs for commercial or
  production purposes". Reason: the Restrictions section covers "any Outputs and data produced
  by the TimesFM Model" for commercial or production purposes. Without this, "outputs are not
  derivatives" could be misread as leaving outputs unrestricted. Source: timesfm3-license.
- `provenance.text`: removed "(Salesforce)" after GiftEvalPretrain. Reason: the 3.0 card does
  not name or link Salesforce. Source: timesfm3-card.
- `checklist.training_code.note`: added that the LoRA fine-tuning example was added in April
  2026, before the 3.0 release. Reason: the README update log dates it Apr. 9, 2026, which
  places it in the 2.5 era. Status stays `unknown`. Source: timesfm-readme.
- Checked and found accurate:
  - Special attention (license): the weights are under the TimesFM Non-Commercial License
    v1.0 (Google LLC). The HF metadata reads `license: other` /
    `timesfm-non-commercial-license-v1.0`, and the repo is ungated.
  - The README says code and weights up to 2.5 are Apache-2.0, and that commercial use is
    through Google Cloud (BigQuery ML).
  - The blog (August 31, 2026) gives 330M parameters, 9 quantiles, and past-only and
    past-and-future covariates.
  - The card lists 20 layers.
  - PyPI `timesfm` 3.0.2 is Apache-2.0 with an `mlx` extra.
  - Contexts over 15,360 points are truncated.

### timesfm-2-5-200m
- `checklist.weights.source_ids`: added `timesfm25-flax-hf-api`, and added that source.
  Reason: the note claims a Flax checkpoint, but no cited source showed it. I fetched
  `google/timesfm-2.5-200m-flax`: it is ungated and Apache-2.0.
- Checked and found accurate:
  - The README's 2.5 changes: 200M, 16k context, 30M quantile head, 1k horizon, no frequency
    indicator.
  - Released Sept. 15, 2025, with XReg added Oct. 29, 2025.
  - The card's data list and cutoffs. The card links Salesforce/GiftEvalPretrain, so
    "(Salesforce)" is supported here.
  - The card says "not an officially supported Google product".
  - The weights metadata is apache-2.0.

### medgemma (family)
- `license_notes.text`: before, "governed by the HAI-DEF Terms of Use rather than the Gemma
  Terms of Use or Apache 2.0". After, "The model cards state that use of MedGemma is governed by
  the HAI-DEF Terms of Use". Reason: no source makes the "rather than" comparison.
  Sources: mg15-model-card, mg1-model-card.
- Checked and found accurate:
  - Release dates on the Gemma releases page: May 20, 2025 (4B and 27B), July 9, 2025 (27B
    multimodal), and January 13, 2026 (1.5 4B).
  - The v1 card's "Model created" dates.
  - The HAI-DEF terms, last modified Nov 15, 2024:
    - licensor Google LLC;
    - the Prohibited Use Policy is incorporated;
    - the medical-device-manufacturer restriction;
    - an Apache 2.0 grant for source-code deliverables;
    - the distillation clause in "Model Derivatives";
    - a notice file;
    - indemnity;
    - termination;
    - California law.

### medgemma-1-5-4b-it
- `provenance.text`: removed "Gemma 3 is credited to Google DeepMind", which no cited source
  says. Changed "SigLIP image encoder pre-trained by Google on de-identified medical images" to
  "…pre-trained on de-identified medical data", matching the card's wording.
  Source: mg15-model-card.
- Checked and found accurate:
  - Gating: HF `gated: "auto"` with the prompt "Requests are processed immediately", so
    `public` is consistent with OPENNESS.md.
  - The card: 128K input, 8192 output, 896×896 images at 256 tokens each, JAX training, the
    dataset list, "licensed datasets or datasets collected internally at Google", evaluations
    on internal datasets, and "life sciences and healthcare".
  - The HF page shows vLLM and SGLang snippets.
  - The repo README says everything in the repo is Apache 2.0.
  - arXiv 2604.05081 (April 6, 2026) covers the new training data, 3D volume slicing, and WSI
    sampling.
  - The blog is dated January 13, 2026.

### medgemma-27b-it
- `summary.text`: before, "the largest MedGemma 1 variant". After, "the 27B multimodal variant
  of MedGemma 1". Reason: this is a superlative, and the text-only variant is also 27B.
- `provenance.text`: removed the unsupported "Gemma 3 is credited to Google DeepMind".
- Checked and found accurate:
  - The HF `base_model` is google/gemma-3-27b-pt.
  - Gating is auto.
  - Only the instruction-tuned model was released: the v1 card marks the 27B multimodal
    pre-trained checkpoint "Not released".
  - The card notes test-time scaling for the 27B results.
  - The MedGemma Technical Report (arXiv 2507.05201) has a Modeling Methodology section, so
    recipe `partial` is supported. Its Appendix B also publishes evaluation prompts. I kept
    `evaluation_materials: partial` because several evaluation datasets are internal.

## NVIDIA

### nemo-framework
- `summary.text`: before, "the original NeMo repository was narrowed to speech models (NeMo
  Speech 3.0), and from the 26.02 framework container onward NVIDIA points to Megatron Bridge
  documentation for large-model training". After, "…was split and now focuses on audio, speech,
  and multimodal LLMs as NeMo Speech (version 3.0), and for the framework container from 26.02
  onward NVIDIA points to Megatron Bridge's documentation and release notes". Reason: the
  README says the repo "pivoted to focus on audio, speech, and multimodal LLMs". The overview
  says only "starting with 26.02, refer to Megatron-Bridge's documentation and release notes".
  Sources: nemo-speech-readme, nemo-fw-overview.
- `license_notes.text`: added that Curator's LICENSE file also includes an MIT notice for
  Microsoft code. Source: curator-license.
- The `nemo-speech-readme` URL changed from `NVIDIA-NeMo/NeMo/main/README.md` to
  `NVIDIA-NeMo/Speech/main/README.md`. The GitHub repo `NVIDIA-NeMo/NeMo` now redirects (301)
  to `NVIDIA-NeMo/Speech`, and the content is identical.
- Checked and found accurate:
  - The docs landing page lists Megatron Bridge, AutoModel, RL, Curator, Evaluator,
    Export-Deploy, Run, and Speech.
  - The container is under the NVIDIA AI Product Agreement and contains Llama 3 materials.
  - The component-versions page runs through 26.06.
  - PyPI: `nemo-toolkit` 3.0.0 lists author NVIDIA, and `megatron-bridge` has an NVIDIA
    author_email.
  - All six repository LICENSE files are Apache 2.0.
  - NeMo Speech requires Python ≥3.12 and PyTorch ≥2.7, with a GPU needed for training.
  - The NVIDIA 10-Q address is Santa Clara.

### megatron-lm
- `summary.text`: "moved fully to GitHub" became "moved to GitHub in December 2025, with all
  development and CI now happening in the open". Reason: this matches the README's wording.
- `run_notes`: "the 0.17.0 release dropped" became "drops", matching the README's forward
  wording.
- Special attention (LICENSE vs metadata): the LICENSE applies BSD 3-Clause (NVIDIA,
  2019–2025) "to all files unless otherwise noted". It adds Apache-2.0 and MIT texts for
  third-party code. The README badge says "Apache". PyPI megatron-core 0.19.2 has
  `license: "Apache 2.0"`, a BSD classifier, and requires Python ≥3.12. The existing note
  describes all of this correctly.
- The installation and quickstart docs match the checklist: Turing+, FP8 on Hopper/Ada/
  Blackwell, Python ≥3.10 (3.12 recommended), PyTorch ≥2.6, the Llama-3 8B FP8 script, and
  JSONL → .bin/.idx.

### cosmos (family)
- `summary.text`: before, "Cosmos 3, released on May 31, 2026, … with Super (64B), Nano (16B),
  and Edge (4B) sizes". After, "its Super (64B) and Nano (16B) models were released on May 31,
  2026, and the Edge (4B) model followed in July 2026". Reason: the press release says "Cosmos
  3 Edge, coming soon", the report says Edge "will be included in a later release", and the
  repo's What's New section dates the Edge release to July 2026.
- Added source `transfer25-hf-api` (nvidia/Cosmos-Transfer2.5-2B, NVIDIA Open Model License).
  Reason: it supports the summary's mention of earlier Transfer models, which had no source.
- Checked and found accurate:
  - Special attention (license): the NVIDIA/cosmos LICENSE is verbatim OpenMDW-1.1, and the
    README says "Source code and models are released under OpenMDW-1.1".
  - OpenMDW-1.1 is not on the SPDX list (list 3.29.0 has only OpenMDW-1.0), so `spdx: null`
    is correct.
  - Predict2.5 and Reason2 use the NVIDIA Open Model License. The "Built on NVIDIA Cosmos"
    clause is confirmed (OML last modified October 24, 2025).
  - Provenance: the report says Nano and Super "are initialized from pre-trained Qwen3-VL
    weights", and the Qwen3-VL GitHub page describes it as "developed by Qwen team, Alibaba
    Cloud".

### cosmos3-super
- `checklist.inference_code.note`: now lists vLLM-Omni, vLLM, Diffusers, and SGLang Diffusion,
  with Cosmos-Framework used for prompt upsampling. Reason: these are the card's actual
  sections.
- `checklist.training_code.note`: removed "which the report says was used for both towers".
  Reason: the report describes a "custom infrastructure platform" used for both towers but
  never identifies it as the public Cosmos-Framework repo. Status stays `partial`: SFT and
  LoRA recipes are public, and pre-training configurations were not found.
- `provenance`:
  - Added HiDream-I1 to the synthetic-data generators; the card lists it next to
    Qwen-Image-2512 and Qwen3-VL.
  - Added the Wan2.2-TI2V-5B URL (huggingface.co/Wan-AI/Wan2.2-TI2V-5B) and identified it as
    "published on Hugging Face by Wan-AI" (Apache-2.0).
  - Added source `wan22-card`.
  - I did not add "Alibaba" for Wan. Neither the Wan card nor the Wan arXiv abstract page
    names Alibaba, so an editor should confirm this before adding it.
- Checked and found accurate:
  - Qwen3-VL-32B initialization.
  - The Wan2.2 VAE.
  - 64B parameters.
  - The MoT design.
  - Ungated.
  - "ready for commercial and non-commercial use" and global geography.
  - The 1.3B data points and 393 entries.
  - The five synthetic datasets and Cosmos-HUE.
  - AdamW, learning rates, token counts, and GB200 counts in the report, which supports
    recipe `public`.
  - BF16-only testing, Linux, and 8×H200/H100/A100 for vLLM-Omni.
  - The press release positions Super "for post-training robotics and AV models".

### cosmos3-nano
- The same `inference_code` and `training_code` corrections as Super. For Nano, vLLM runs
  through the `vllm-cosmos3` package from cosmos-framework.
- `provenance`:
  - Added the card's synthetic-data generators: HiDream-I1, Qwen-Image-2512, and Qwen3-VL.
  - Added the Wan-AI URL and source.
  - Added `nano-card` to `source_ids`.
- Checked and found accurate:
  - Qwen3-VL-8B initialization.
  - 16B parameters.
  - Ungated.
  - OpenMDW-1.1.
  - The H200 vLLM-Omni command.
  - Linux.

### gr00t (family)
- `license_notes.text`: added that the README overview also calls N1.7 "fully commercially
  licensable under Apache 2.0". Also named GR00T-H's NVIDIA non-commercial license as the
  example. Reason (special attention): this is the README-vs-license-section conflict. The
  license section says code is Apache 2.0 and weights are under the NVIDIA Open Model License.
  GR00T-H's HF metadata links NVIDIA-OneWay-Noncommercial-License-22Mar2022.
- Everything else checks out: the N1.5 and N1.6 previous-release links and the VLA
  description.

### gr00t-n1-7-3b: verified, no changes
- Early access April 17, 2026, per the HF blog. The README now says General Availability,
  while the card still says "GR00T N1.7 EA".
- Eagle (nvidia/Eagle-Block2A-2B-v2) was replaced by Cosmos-Reason2-2B. The HF metadata for
  Cosmos-Reason2-2B gives `base_model: Qwen/Qwen3-VL-2B-Instruct` and `model_type: qwen3_vl`,
  and Qwen3-VL is "developed by Qwen team, Alibaba Cloud".
- The card lists the NVIDIA Open Model License. The HF YAML has no license field; the
  license appears in the card body.
- Checked and found accurate: 13 datasets and 21.6M points; the 20,854 EgoScale hours; the
  README's "Reproducing Benchmark Results" table (LIBERO, SimplerEnv, SO100); the latency
  table; and the OML terms.
- Open item for the editor: the card's architecture text still mentions SigLip2 and T5
  encoders, which conflicts with the Cosmos-Reason2-2B backbone. The record does not repeat
  that text.

## Amazon

### chronos (family)
- `summary.source_ids`: added `chronos2-card`. Reason: "encoder-only" is stated in the
  Chronos-2 card, not the README.
- Checked and found accurate:
  - The README dates: 13 Mar 2024, 26 Nov 2024 (Bolt), and 20 Oct 2025 (Chronos-2).
  - The 8M–710M T5 sizes.
  - The repo is Apache-2.0.
  - The Amazon 10-K address is Seattle, and it lists AWS as a segment.

### chronos-2: verified, no changes
- Checked and found accurate:
  - The card: 120M, encoder-only, T5-inspired, group attention, 8192/1024, GPU and CPU
    support, `chronos-forecasting>=2.0`, and the training data list.
  - HF metadata: apache-2.0 and ungated.
  - The report's affiliation is Amazon Web Services, and it describes synthetic data
    generation without learning rates or batch sizes, so recipe `partial` fits.
  - The blog is dated Oct 20, 2025.
  - The scripts README says it was written for the March 2024 models.
  - PyPI 2.0.0 was released 2025-10-20.

## Apple

### openelm (family)
- `license_notes.text`: the HF metadata's `license` tag is `apple-amlr`, and only
  `license_name` is "apple-sample-code-license". The note now states both.
  Source: openelm-hf-api.
- Checked and found accurate (special attention, research-only): the LICENSE is the Apple
  Machine Learning Research Model License (© 2025). It covers non-commercial "Research
  Purposes" only, grants no patent rights, and is under California law. Also confirmed: the
  April 2024 release, the four sizes in pretrained and instruct versions, and the arXiv
  abstract (training logs, checkpoints, pre-training configs).

### openelm-3b-instruct
- `summary.text`: "the largest instruction-tuned model" became "the 3B-parameter
  instruction-tuned model". Reason: avoid a superlative.
- `license_notes.text`: the same metadata clarification as the family record.
- Checked and found accurate:
  - The ~1.8T tokens and the dataset list.
  - The Alignment Handbook recipe on UltraFeedback, with per-size hyperparameters.
  - lm-eval-harness commit dc90fec.
  - The Llama-2 tokenizer is not shipped, since there are no tokenizer files in the repo.
  - The CoreNet MLX conversion link.
- Open item for the editor: the CoreNet LICENSE text matches SPDX `AML` (Apple MIT License)
  in substance; only "Apple Inc." differs from "Apple Computer, Inc.". I left `spdx: null`
  conservatively. The same applies to the ml-fastvlm code license.

### fastvlm (family)
- `eligibility.explanation`: now names the origin of the language models as "third-party Qwen2
  models from the Qwen Team at Alibaba Group… not U.S.-developed". Added source `qwen2-report`
  (arXiv 2407.10671, whose byline is "Qwen Team, Alibaba Group").
- Checked and found accurate:
  - CVPR 2025.
  - FastViTHD is a hybrid conv-transformer encoder that outputs fewer tokens.
  - The 0.5B, 1.5B, and 7B variants use Qwen2 LLMs (paper Figure 1 shows Qwen2-0.5B; the
    README names Qwen2-7B).
  - The iOS/macOS app.
  - The Apple ML article (July 23, 2025).
  - The LICENSE_MODEL matches the HF LICENSE, which is the research-only AMLR.

### fastvlm-7b
- `summary.text`: "the largest FastVLM variant" became "the 7B variant of Apple's FastVLM
  release".
- `provenance.text`: before, the origin of the Qwen2-7B maintainer rested on the *Qwen3-VL*
  GitHub page. After, "developed by the Qwen Team at Alibaba Group (per the Qwen2 Technical
  Report)". Replaced source `qwen3-vl-github` with `qwen2-report`, and removed the uncited
  `qwen3-vl-github` source entry.
- Checked and found accurate:
  - The config gives `LlavaQwen2ForCausalLM`.
  - Ungated.
  - `license: apple-amlr`.
  - The stage 2/3 CDN checkpoints and the 7B int4 Apple silicon export.
  - "We use LLaVA codebase to train", with no FastVLM training scripts.
  - The paper's LLaVA-558K/665K, DataCompDR-1B, and Stage 3 details.
  - Qwen2-7B is Apache-2.0 on HF.

## Could not verify / follow-ups
- The origin of Wan2.2-TI2V-5B, which is a component used by Cosmos 3. The sources I fetched
  show only the "Wan-AI" organization, so the records do not say Alibaba.
- SPDX `AML` for the CoreNet and ml-fastvlm code licenses, as noted above.
- The GR00T N1.7 card's stale SigLip2/T5 architecture text, as noted above.
- Nothing was blocked. The GitHub REST API was rate-limited at first, but the
  tensorflow/tensorflow metadata was fetched successfully later.
