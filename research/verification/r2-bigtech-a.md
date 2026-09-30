# Verification log: r2-bigtech-a

Checked on 2026-09-29 against the cited sources. I read raw files with
`curl -A "USASI-factcheck/0.1"`. These included GitHub READMEs, LICENSE, governance and config files, Hugging Face
READMEs, HF API metadata (`gated`, license tags, `createdAt`), the PyPI JSON API, arXiv abstract and
HTML pages, and the CLIP paper PDF. Rendered pages were read with WebFetch: Meta blogs, the PyTorch Foundation pages,
the LF AI & Data blog, SEC cover pages and exhibits, the Hugging Face privacy policy, HF cards for
gated repos, and the LinkedIn blog. No personal data was sent in any request.

After the edits, `npx tsx scripts/validate.ts` reports **0 errors** and 1 warning. The warning is
about `continue-extension`, which is not in this batch.

Tiers computed with `computeTier()` after the edits:

| Release | Tier |
| --- | --- |
| whisper-large-v3-turbo, whisper-large-v3, clip-vit-large-patch14, sam-2-1-hiera-large, v-jepa-2-1-vit-gigantic-384, apriel-1-6-15b-thinker, superapriel-15b-instruct, starcoder2-15b, starcoder2-3b | open-weight |
| v-jepa-2-vitg-384 | open-stack |
| sam-3-1, dinov3-vit7b16 | restricted-weights |

No edit changed any tier.

Gating from the HF API: `manual` for facebook/sam3, facebook/sam3.1, and
facebook/dinov3-vit7b16-pretrain-lvd1689m. It is `false` for Whisper large-v3 and turbo,
CLIP ViT-L/14, SAM 2.1 Hiera-L, V-JEPA 2 ViT-g-384, all Apriel/SuperApriel repos, and StarCoder2 3B/15B. It is `auto`
(terms click-through) for the bigcode/the-stack-v2 dataset.

## Whisper

### whisper (family): verified, no changes
- Model card: release timeline (Sept 2022, large-v2 Dec 2022, large-v3 Nov 2023, turbo Sept 2024),
  39M–1550M sizes, intended users, and cautions.
- README: tasks.
- arXiv 2212.04356: submitted 2022-12-06.
- SEC Exhibit 10.1: OpenAI Group PBC at 1455 3rd Street, San Francisco, dated 2026-02-27.

### whisper-large-v3-turbo
- `checklist.training_data_information.note`
  - Before: said turbo was fine-tuned on "the same multilingual transcription data", and then
    called "that data" the 1M + 4M hour mixture.
  - After: turbo used "the same amount of" transcription data, excluding translation data. The
    1M + 4M figure is now attributed to the large-v3 training mixture.
  - Reason: the 1M + 4M figure describes the whole large-v3 mixture, which includes translation
    data. Sources: discussion #2363 and the large-v3 HF card.
- Verified:
  - MIT license (README says "code and model weights", HF `license: mit`).
  - 809M params (README, HF card) vs 798M (repo model card).
  - Decoder cut from 32 to 4 layers, trained 2 more epochs.
  - Not trained for translation.
  - Default model in the package.
  - Checkpoint URLs in `__init__.py`.
- `released_at: 2024-09`: supported by the model card ("September 2024") and CHANGELOG v20240930
  ("large-v3-turbo model"; PyPI upload 2024-09-30). The release discussion is dated 2024-10-01. I did
  not add CHANGELOG as a source because `released_at` has no source field.

### whisper-large-v3: verified, no changes
- **License conflict confirmed and correctly recorded.** The README says Whisper's "code and model
  weights" are MIT. The HF card metadata and API tag for openai/whisper-large-v3 say `apache-2.0`. Both
  licenses stay recorded.
- Also verified:
  - 128 Mel bins and the Cantonese token.
  - 1M + 4M hours and 2.0 epochs.
  - Release on 2023-11-06 (discussion #1762).
  - "large" is an alias of large-v3.
  - CV15/FLEURS results.

## CLIP

### clip (family): verified, no changes
- Model card: staged releases from Jan 2021 to Apr 2022, research-only intended use, and out-of-scope
  uses.
- Paper: 400M pairs.
- arXiv 2103.00020: v1 dated 2021-02-26.

### clip-vit-large-patch14: verified, no changes
- **Weights license:** the repo LICENSE (MIT, 2021 OpenAI) covers "the Software". The README has no
  license section, the model card has none, and the HF API `cardData` has no license field. The record
  correctly lists no weights license.
- ViT-L/14 was released in January 2022 and @336px in April 2022 (model card). The paper describes
  the 336px variant as one extra epoch at higher resolution.
- Paper recipe verified: 32 epochs, Adam with decoupled weight decay, cosine schedule, 32,768
  minibatch, and 12 days on 256 V100s for the largest ViT.
- `data/prompts.md` and the ImageNet notebook support `evaluation_materials: public`.

## Triton

### triton (draft, pending_review): verified, no changes
- LICENSE: MIT, © 2018–2020 an individual developer and © 2020–2022 OpenAI.
- CONTRIBUTING.md: individual-maintainer governance and a core-maintainer list dated 09/18/2026.
- README: Linux; NVIDIA CC 8.0+; AMD ROCm 6.2+; CPUs under development; wheels for CPython
  3.10–3.14.
- PyPI 3.8.0 uploaded 2026-08-28.
- A web search found no foundation or company governance. Draft status stays appropriate.

## Segment Anything

### segment-anything (family): verified, no changes
- SAM 1 and SAM 2 LICENSE files are Apache 2.0 (identical files).
- SAM 3 uses the custom SAM License dated 2025-11-19.
- Credits: SAM 1 is "Meta AI Research, FAIR", SAM 2 is "AI at Meta, FAIR", and SAM 3 is "Meta
  Superintelligence Labs".
- Dates: SAM 2 released 07/29/2024; SAM 2.1 released 09/29/2024 (README; the release-notes
  heading says 09/30); SAM 3.1 released 2026-03-27.
- arXiv dates: 2304.02643 on 2023-04-05 and 2511.16719 on 2025-11-20.
- Meta 10-K: 1 Meta Way, Menlo Park.

### sam-3-1
- `checklist.training_code`
  - Before: `partial` ("publishes fine-tuning code…").
  - After: `unknown`. The note now explains that only fine-tuning code is published.
  - Reason: OPENNESS.md §6 says "Fine-tuning code does not count as training code for the base
    model". README_TRAIN.md describes `train.py` only for finetuning on custom datasets, and
    Meta's blog calls it "fine-tuning code".
- `checklist.training_data_information.note`
  - Before: "the training data is not [released]".
  - After: "this review did not find the training set itself released".
  - Reason: no source states the training set is withheld.
- Verified:
  - SAM License terms: grant, redistribution, acknowledgment requirement, trade controls,
    ITAR/military exclusions, no reverse engineering, IP-litigation termination, California law,
    Meta may modify, and Ireland/Inc. licensor split.
  - HF gating is `manual` with contact-info fields.
  - The card says the repo holds checkpoints only and has no Transformers integration.
  - Object Multiplex (paper Appendix H).
  - Prerequisites: Python 3.12, PyTorch 2.7, CUDA 12.6.
  - The tracker inherits the SAM 2 encoder-decoder.
- `evaluation_materials` stays `partial`. SA-Co evaluators and SAM 3 configs are published, but no
  SAM 3.1-specific evaluation instructions were found.

### sam-2-1-hiera-large
- `checklist.evaluation_materials`
  - Before: `partial`.
  - After: `public`. Added source `sam2-tools-readme` (tools/README.md).
  - Reason: the repo publishes `tools/vos_inference.py`, documented with the sam2.1 configs and
    checkpoints for DAVIS/MOSE/SA-V, with a flag for LVOS-style datasets. It also publishes the
    SA-V evaluator (`sav_evaluator.py`) for the released val/test splits. This meets "evaluation
    code … that let others re-run the reported evaluations … for this release".
- Verified:
  - Apache 2.0 covers "model checkpoints, demo code, training code". The fonts are OFL. The
    cc_torch LICENSE is BSD 3-Clause.
  - 224.4M params.
  - Training/fine-tuning code was released with 2.1.
  - The paper footnote says its results use SAM 2.1.
  - The internal dataset is not released.
  - Python ≥3.10, torch ≥2.5.1, torchvision ≥0.20.1, WSL recommended.

## DINOv3

### dinov3 (family): verified, no changes
- README model table: 21M–840M distilled ViTs, 6,716M ViT-7B, ConvNeXt T/S/B/L, and two SAT-493M
  backbones.
- Heads: classification, depth, detection, segmentation.
- Emailed download URLs.
- Blog dated 2025-08-14: "commercial license", 1.7B images.
- arXiv 2508.10104: dated 2025-08-13.

### dinov3-vit7b16: verified, no changes
- **Gating:** HF `gated: manual`, license `dinov3-license`. Meta's download page requires an access
  request, and URLs arrive by e-mail once the request is accepted.
- DINOv3 License (2025-08-19) terms match the note. The README applies it to "code and model
  weights".
- HF card (read via WebFetch because the raw file is gated):
  - "Developed by Meta AI", 6.7B.
  - DINO + iBOT (+ KoLeo, Gram anchoring).
  - LVD-1689M from 17B public Instagram images.
  - Uses; fine-tuning "as a last resort"; income/region fairness.
  - AutoModel with `device_map="auto"`.
- README: exact ViT-7B/16 three-stage configs, "trained on a private dataset", and eval commands.

## V-JEPA 2

### v-jepa-2 (family): verified, no changes
- README credits "Meta FAIR".
- V-JEPA 2 checkpoints: ViT-L 300M, H 600M, g 1B.
- V-JEPA 2.1 checkpoints: B 80M, L 300M, g 1B, G 2B.
- V-JEPA 2-AC is post-trained from V-JEPA 2.
- Blog (2025-06-11) says code and checkpoints are available "for commercial and research
  applications".
- **Open item:** the README news line says "[2025-06-25] V-JEPA 2 is released", but the blog and
  arXiv 2506.09985 are dated 2025-06-11. `released_at: 2025-06-11` is kept, as in the research notes.

### v-jepa-2-vitg-384: verified, no changes
- **License conflict confirmed and correctly recorded.** The repo LICENSE is MIT (© Meta Platforms).
  The README says "the majority … is licensed under MIT" and three files are Apache 2.0. The HF
  card and API say `apache-2.0` for this checkpoint.
- Configs confirmed:
  - `configs/train/vitg16/` has pretrain-256px-16f and cooldown-384px-64f.
  - `configs/eval/vitg-384/` has ssv2, diving48, ek100, k400, in1k, coin, and jester.
- VideoMix22M: the paper says the sources are publicly available and that YT1B was curated.
- decord and macOS note verified.

### v-jepa-2-1-vit-gigantic-384
- `checklist.evaluation_materials`
  - Before: `partial` ("no V-JEPA 2.1-specific evaluation configs were located").
  - After: `public`.
  - Reason: the repo has `configs/eval_2_1/vitG-384/` with ssv2, diving48, ek100, k400, in1k, coin,
    and jester. One config (ssv2.yaml) was read; its tag is `ssv2-vitG16-384-64x2x3`.
  - The note says configs for depth and grasping tasks were not confirmed.
  - Source `vjepa2-configs-eval` (configs/eval) was replaced by `vjepa21-configs-eval-vitgg384`.
- Verified:
  - 2B ViT-G.
  - Dense Predictive Loss, Deep Self-Supervision, multi-modal tokenizers.
  - VisionMix-163M replaces ImageNet-1M with LVD-142M and reweights SSv2.
  - 135k pretraining iterations plus a 12k cooldown at 384px/64 frames.
  - The first author is affiliated with FAIR and Zaragoza, with the work done at Meta.
  - Released 2026-03-16 (README).
  - No HF repo (HF search of the facebook org).
  - The published vitG cooldown config uses `crop_size: 256`, so `training_recipe: partial` is kept.

## Microsoft and foundation-hosted software

### deepspeed: verified, no changes
- **Current hosting:** the PyTorch Foundation page (updated 2026-09-03) lists DeepSpeed among its
  projects and calls the Foundation "hosted by the Linux Foundation".
- The PTF welcome post (2025-05-07) says DeepSpeed was "Contributed by Microsoft" and that hosted
  projects are "governed and administered under the PyTorch Foundation's … governance model".
- LF AI & Data post (2025-02-03): DeepSpeed joined as an incubation project, contributed by
  Microsoft.
- GOVERNANCE.md still names "AI & Data, a directed fund of The Linux Foundation". It requires
  Apache-2.0 plus DCO and CC BY 4.0 for docs.
- Addresses: the LF privacy policy gives 548 Market St, San Francisco. The MSFT 10-K cover gives
  Redmond.
- PyPI 0.19.7 uploaded 2026-09-16.

### onnx-runtime
- `checklist.supported_platforms.source_ids`
  - Before: `[ort-install]`.
  - After: `[ort-install, ort-compat]`. Added source `ort-compat`
    (onnxruntime.ai/docs/reference/compatibility.html).
  - Reason: the install page never mentions macOS. The compatibility page lists Windows, Linux,
    Mac, Android, and iOS.
- Verified:
  - MIT (© Microsoft).
  - PyPI 1.30.0 (2026-09-10), author Microsoft Corporation.
  - README training claim and telemetry notice.
  - Install page: packages, language bindings, and execution providers.

### autogen
- `maintainers[0].source_ids`
  - Before: `[autogen-readme, autogen-pypi]`.
  - After: `[autogen-readme, autogen-license-code]`.
- `eligibility.explanation`
  - Removed "PyPI lists Microsoft among the package maintainers". Replaced it with "the README
    says AutoGen originated in Microsoft Research" (README: "Pioneered in Microsoft Research").
  - Removed `autogen-pypi` from `eligibility.source_ids`.
  - Reason: the PyPI HTML page is behind a JavaScript challenge for both WebFetch and curl. The PyPI
    JSON API has no maintainer list and `author` is null, so the claim could not be verified.
- **Maintenance status confirmed.** The README says AutoGen is "now in maintenance mode", will get
  no new features, and is "community managed going forward". New users are pointed to Microsoft
  Agent Framework. The GitHub repo is not archived.
- Latest autogen-agentchat release: 0.7.5 on 2025-09-30 (PyPI JSON; the GitHub releases list
  agrees). Python ≥3.10, OS Independent.
- Licenses: MIT (LICENSE-CODE) and CC BY 4.0 (LICENSE).
- The stable docs page shows no maintenance banner; the README carries that claim.

## ServiceNow Apriel

### apriel (family)
- `provenance.text`: added "(using a copy hosted by Unsloth)". The Apriel 1.5 report says "We used
  a version from Unsloth, which is no longer available". This is a base-model provenance detail;
  source `apriel-1-5-paper`.
- **Base-model provenance verified.** The 1.5 report says it builds on Pixtral-12B-Base-2409 (HF
  mistralai, Apache-2.0) and depth-upscales from 40 to 48 layers. The Super Apriel paper also says
  Apriel 1.6 is "derived from Pixtral-12B via depth upscaling".
- The Apriel-Nemotron-15b-Thinker card says it builds on an "Apriel-15b-base" checkpoint. The
  family record does not describe that base's origin. **Open item for an editor.**
- Apriel-5B-Base: the card calls it "first release in the Apriel model family".
- ServiceNow 10-K cover: Delaware; 2225 Lawson Lane, Santa Clara.
- `basis: us-governed-project` on a model record matches ELIGIBILITY.md (that basis applies to
  "Artifacts … software, dataset, or model"). The catalog uses both bases on artifacts.

### apriel-1-6-15b-thinker
- `checklist.training_code.note`
  - Before: said Fast-LLM and VERL are "both … public".
  - After: only Fast-LLM is described as public (ServiceNow, Apache 2.0, per the cited repo).
  - Reason: VERL's availability had no cited source.
- `provenance.text`: added the same Unsloth-copy clause as the family record.
- Verified:
  - MIT (card metadata and License section; no LICENSE file in the repo).
  - Ungated.
  - The GGUF repo exists.
  - Blog dated 2025-12-09: depth-upscaling corpus includes 15% NVIDIA Nemotron data; 2.4M SFT
    samples; GSPO with VeRL.
  - Card inference: vLLM command with a 131072 max length and the custom Docker image;
    temperature 0.6; Together AI and Ollama.
  - Scores come from Artificial Analysis and internal evaluations.

### superapriel-15b-instruct: verified, no changes
- 48 layers × 4 mixers (FA, SWA, GDN, KDA).
- Distilled from a frozen Apriel 1.6 teacher, then targeted SFT.
- MIT; ungated.
- Memory: ~27 GiB and ~46 GiB bf16 weights (card).
- causal-conv1d and mamba-ssm are needed for GDN/KDA presets.
- The paper (2026-04-21) says: "We release the supernet weights, Fast-LLM training code…". It uses
  the Apriel pretraining corpus and SFT data, lm-eval-harness defaults, and a Pixtral vision
  encoder.
- Fast-LLM LICENSE is Apache 2.0 ("applies to all files unless otherwise noted").
  `fast_llm_external_models/apriel2` exists.

## BigCode StarCoder2

### starcoder2 (family): verified, no changes
- **Governance.** The report (arXiv 2402.19173, 2024-02-29) says "BigCode is stewarded by ServiceNow
  and Hugging Face in the spirit of open governance". The HF blog (2024-02-28) says "led jointly by
  Hugging Face and ServiceNow". The BigCode site today lists both as supporters. No newer governance
  change was found.
- Training attribution (blog): 3B by ServiceNow, 7B by Hugging Face, 15B by NVIDIA.
- The Stack v2 was built "in partnership with Software Heritage".
- HF privacy policy: Hugging Face, Inc.; "The Company and its servers are located in the United
  States"; Hugging Face SAS in Paris.
- The bigcode HF org lists starcoder2-15b-instruct-v0.1.

### starcoder2-15b
- `checklist.training_code.note`
  - Rewritten. `partial` now rests on the NeMo framework being public (Apache 2.0, per the
    NVIDIA-NeMo/Speech README and LICENSE). Github.com/NVIDIA/NeMo now 301-redirects to that repo,
    which keeps the final pre-split release v2.7.3.
  - The note states that the repo's LoRA script is fine-tuning code and is not counted.
  - Added source `nemo-speech-repo`.
- `checklist.evaluation_materials`
  - Before: `partial`. After: `public`. Added `starcoder2-paper-html`.
  - Reason: the repo README says "To evaluate StarCoder2 and its derivatives, you can use the
    BigCode-Evaluation-Harness". The report documents its prompts and says "The evaluation code is
    available via" the harness.
  - The note keeps the caveat that full coverage was not confirmed.
- **License verified.** The BigCode Open RAIL-M v1 text was read from the space's `app.py`:
  - Royalty-free use, modification, and commercial sharing.
  - §4 makes Attachment A compliance a condition of the grant.
  - §5 carries the restrictions downstream.
  - Source code and Data are "not licensed under this License Agreement".
- Other licensing: HF tag `bigcode-openrail-m`. The repo LICENSE is Apache 2.0.
- Card: 4+T tokens, 600+ languages, GQA, 16,384 context with a 4,096 sliding window, FIM,
  1M steps, 1,024 H100, NeMo on Eos, 8-bit/4-bit footprints.
- The Stack v2 terms say bulk download requires an agreement with Software Heritage and Inria.

### starcoder2-3b
- `checklist.training_code`
  - Before: `partial`. After: `unknown`.
  - Reason: the only code cited is the repo's LoRA fine-tuning script, which does not count under
    OPENNESS.md §6. The card lists "Framework: TODO".
- `checklist.evaluation_materials`
  - Before: `partial`. After: `public`, with the same reasoning and sources as the 15B.
- Verified:
  - 17 languages, 3+T tokens, 1.2M steps, 160 A100.
  - Four memory footprints (fp32 12,624.81 MB; bf16 6,312.41; int8 3,434.07; int4 1,994.90).
  - Trained by ServiceNow (blog).

## Liger Kernel

### liger-kernel
- `sources[liger-docs].title`: "Liger Kernel: Efficient Triton Kernels for LLM Training
  (documentation)" → "Liger-Kernel Docs", which is the page's actual `<title>`.
- Verified:
  - BSD 2-Clause (© 2024 LinkedIn Corporation).
  - README kernels, losses, integrations, and dependency lists (CUDA, ROCm, Ascend, cuTile,
    CuTe DSL for Hopper/Blackwell).
  - PyPI 0.8.3 uploaded 2026-09-16; first upload 2024-08-08.
  - LinkedIn blog dated 2024-12-05: initially released August 2024.
  - MSFT Exhibit 21 lists "LinkedIn Corporation — United States".

## Could not verify / follow-ups for an editor

- **PyPI HTML pages** (e.g. pypi.org/project/autogen-agentchat/) are blocked by a JavaScript
  challenge. Release versions, dates, authors, and classifiers were verified through the PyPI JSON
  API instead, which serves the same project data. Maintainer lists could not be checked.
- **GitHub REST API** was rate-limited. Directory listings (V-JEPA configs, Fast-LLM, SAM 2 tools)
  were read from GitHub's HTML tree pages.
- **Gated HF cards** (sam3.1, dinov3-vit7b16) were read with WebFetch on the rendered page. The raw
  README requires login.
- **V-JEPA 2 release date:** README says 2025-06-25; blog and arXiv say 2025-06-11 (kept).
- **SAM 3.1 evaluation_materials** stays `partial`. The generic SA-Co offline evaluators could
  probably score SAM 3.1 predictions, but no 3.1-specific instructions were found. An editor may
  reconsider.
- **Apriel-Nemotron-15b-Thinker's "Apriel-15b-base"** origin is undocumented in the records.
- **Triton** stays draft. There is still no official statement of a governing organization.
