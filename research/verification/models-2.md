# Verification log: models-2

Checked 2026-09-29 against the cited sources. Raw files (Hugging Face READMEs, LICENSE files,
HF API metadata, GitHub READMEs and trees, SPDX list) were fetched with `curl -A "USASI-factcheck/0.1"`.
HTML pages and SEC filings were read with WebFetch. SEC blocks curl (HTTP 403), but WebFetch read all four
filings (Meta 10-K FY2025, Microsoft 10-K FY2026, NVIDIA 10-Q Q2 FY2027, Snowflake 10-K FY2026). Each one
confirms the principal executive office recorded in these files.

Computed tiers after the edits below (`lib/openness.ts`):

| Release | Tier |
| --- | --- |
| muse-glimmer-30b | open-weight |
| wham-1-6b | open-weight (research-only license) |
| nemotron-3-5-lightning-30b-a3b | open-stack |
| nemotron-3-super-120b-a12b | open-stack |
| nemotron-3-ultra-550b-a55b | open-weight (training recipe partial) |
| olmo-3-1025-7b | open-stack (data partial: redacted olmOCR PDFs) |
| olmo-3-1-32b-think | fully-open |
| olmo-3-7b-instruct | open-stack (inherits the 7B pretraining-data redaction) |
| phi-4-mini-flash-reasoning | open-weight |
| phi-4-reasoning-vision-15b | open-weight |
| snowflake-arctic-base / -instruct | open-weight |
| trinity-large-thinking / trinity-mini | open-weight |
| dbrx-base / dbrx-instruct | weights-not-public (archived) |

## Muse naming

`meta-muse` is Meta Superintelligence Labs' Muse line (Muse Spark, Muse Glimmer). `microsoft-muse` is
Microsoft Research's gameplay model, also called WHAM. Nothing in any of the four records mixes the two
lines up. Names, maintainers, family links and sources are all separate.

## Records

### meta-muse — verified, no changes
- Muse Spark: announced 2026-04-08 on about.fb.com (HTML title matches). The ai.meta.com blog describes
  multimodal reasoning, tool use and multi-agent orchestration. The Meta Model API page lists paid Muse
  Spark 1.1–1.3, Muse Image and Muse Voice Transcribe. dev.meta.ai lists Muse Glimmer, Muse Image and
  Muse Voice Transcribe. The announcement only hopes to open-source *future* versions.

### muse-glimmer-30b — 1 change
- `checklist.weights.source_ids`: [model-card, hf-api] → [model-card, hf-api, muse-glimmer-collection].
  Added source `muse-glimmer-collection` (https://huggingface.co/api/collections/meta-models/muse-glimmer).
  Reason: the note says the quantized variants and the drafter are published without gating, but the
  cited API metadata covers only the main repo. The collection shows ungated `-GGUF` (two k-quants,
  DFlash, mmproj), `-assistant` (DFlash drafter) and `-ExecuTorch-PTE` repos.
- Verified: the LICENSE is the standard Apache-2.0 text with no reference to the Usage Policy. The Usage
  Policy lists military and weapons uses among its prohibitions. The card gives release month August 2026,
  29.6B parameters including a ~1.8B ViT-G/14 encoder, 131,072+ context, and a Jan 4 2026 knowledge
  cutoff. The card's 4-bit / 24–32 GB / 64 GB statements are quoted with precision. The HF blog
  (2026-08-10) documents Transformers, llama.cpp and vLLM. The dev blog (2026-08-12) points to the
  collection. The eval methodology PDF exists.

### microsoft-muse — verified, no changes
- The MSR blog (2025-02-19) names the Game Intelligence and Teachable AI Experiences (TaiX) teams with
  Ninja Theory, and says weights, the WHAM Demonstrator and sample data were released.

### wham-1-6b — verified, no changes
- The LICENSE.md (Microsoft Research License Terms) text matches `license_notes`. It allows
  non-commercial research use only, with no distribution of code, models or data, no hosting as a
  stand-alone service, no reverse engineering, publication limits, and U.S. arbitration. The repo is
  ungated and holds WHAM_1.6B_v1.ckpt and WHAM_200M.ckpt. Setup and test hardware, data scale and the
  evaluation measures match the card.

### nemotron (family) — 1 change
- `useful_for.source_ids`: [nemotron-dev-page] → [nemotron-dev-page, nemotron-repo-readme]. The phrase
  "high-volume task execution" comes from the repo README, not the developer page.

### nemotron-3-5-lightning-30b-a3b — 1 change
- `license_notes`: added that NVIDIA's Lightning recipe page (and the repo README) say "Weights, data,
  and recipes are released under OpenMDW-1.1", while the Nemotron repo's only LICENSE file is Apache-2.0.
  The code license entry stays Apache-2.0, taken from the LICENSE file. Added sources
  lightning-recipe-doc and nemotron-repo-license. The repo tree was checked through the GitHub API:
  there is one LICENSE, at the root.
- Verified: the HF LICENSE is OpenMDW-1.1 with an NVIDIA copyright line, otherwise identical to the
  OpenMDW 1.1 text. SPDX 3.29.0 has only OpenMDW-1.0, so `spdx: null` is right. Release date 2026-08-11
  and "GA" are verified. BF16, NVFP4, Base, DFlash and DSpark repos are all ungated. The training recipe
  covers pretrain (including MTP), SFT, RL, eval and quantization, and says it uses only the open data
  subset. Data partial is right: some datasets are gated and several are listed as private.

### nemotron-3-super-120b-a12b — verified, no changes
- The Nemotron Open Model License (Last Modified 2025-12-15) matches `license_notes`. That covers the
  grant, "commercially usable", no ownership claim on outputs, the NOTICE attribution, litigation
  termination covering outputs, indemnity, export compliance, and U.S. and Delaware law. The recipe
  marks "Distillation — Coming soon". The Super technical report (text extracted) describes no model
  distillation stage beyond synthetic-data distillation. So `training_recipe: public` stands, and the
  note already discloses the gap. BF16, FP8, NVFP4 and Base repos are ungated.

### nemotron-3-ultra-550b-a55b — 1 change
- `checklist.training_recipe.note`: added that the recipe also omits the 1M-token long-context
  pretraining phase because that data is not open-source (from the ultra3 recipe README). Status stays
  partial.
- Verified: OpenMDW-1.1, release date 2026-06-04, v1.0 GA, BF16/NVFP4/Base ungated, the test hardware
  list, and the minimum-GPU statement.

### olmo (family) — verified, no changes
- The release notes give Feb 1 2024, Apr 2024 (Dolma 1.7), OLMoE Sep 2024, and OLMo 2 Nov 2024–May 2025.
  The Olmo 3 blog is dated 2025-11-20, with a 3.1 update on 2025-12-12. Olmo Hybrid blog: 2026-03-05,
  7B, Gated DeltaNet plus attention. The about page says "Seattle based non-profit".

### olmo-3-1025-7b — verified, no changes
- The dataset card for dolma3_mix-6T-1025-7B confirms that some olmOCR PDFs are `[REMOVED]` and that this
  affects reproducibility, so `training_data_information: partial` is appropriately strict. The OLMo-core
  OLMo3 directory has the 7B pretrain-1, pretrain-2, midtrain and long-context scripts. The OLMES README
  has the Olmo 3 eval suite. The arXiv v2 is dated 2026-04-14.

### olmo-3-1-32b-think — verified, no changes (tier: fully-open)
- All six 32B data repos (dolma3_mix-6T, dolmino-100B-1125, longmino-100B-1125, Dolci-Think-SFT/DPO/RL-32B)
  are ungated and ODC-BY. The Dolci-Think-RL license is stated in the card body. The technical report
  confirms the RL run was continued from 750 to 2,300 steps over 21 more days on 224 GPUs. open-instruct
  lists the 32B Think SFT, DPO and RL scripts and a W&B report covering 3.1. Weights and code are
  Apache-2.0.

### olmo-3-7b-instruct — verified, no changes

### phi (family) — 3 changes
- `useful_for.text`: "cost-sensitive and on-device or edge deployments where running larger models is
  impractical" → "cost-constrained and low-latency tasks, and for local, on-device, or edge deployment as
  well as the cloud". Reason: the "larger models impractical" framing is not on the Phi page.
- `availability.access_conditions`: "Microsoft Foundry" → "Azure AI Foundry Models", which is the Phi
  page's wording. Also added "open source under the MIT License", as the page words it.
- `summary.text`: "Phi-4-mini-flash-reasoning (June 2025)" → "(July 2025)". Added source
  phi4-mfr-azure-blog. See the next record.

### phi-4-mini-flash-reasoning — 2 changes
- `released_at`: 2025-06 → 2025-07-09. The Azure blog "Reasoning reimagined: Introducing
  Phi-4-mini-flash-reasoning" (2025-07-09) says the model "is available on Azure AI Foundry, NVIDIA API
  Catalog, and Hugging Face today". The ArchScale README also dates the checkpoint release to July 2025.
  The model card's own "Release date: June 2025" matches the HF commits of 2025-06-19/22, which appear
  to predate public availability.
- `availability.access_conditions`: added the July 9 2025 availability statement and noted the card's
  June 2025 date. Added source `phi4-mfr-azure-blog`.
- Verified: the MIT LICENSE (Microsoft copyright), the ungated repo, and the ArchScale README (pretraining
  code released in July 2025, LightEval reasoning eval). The card's data and hardware statements match.

### phi-4-reasoning-vision-15b — 1 change
- `checklist.training_code.note`: added that the GitHub repository contains only the
  `huggingface-transformers` and `vllm` inference directories (repo tree checked through the GitHub API).
  The blog's "fine-tuning code" was not found. Status stays unknown. Added source phi4-rv-github-license.
- Verified: the card (release 2026-03-04, 15B, 16,384 context, 240 B200s for 4 days, MIT, SigLIP-2,
  Phi-4-Reasoning backbone). The DATACARD names MIOL as developer and was last updated 2026-08-31. The HF
  repo has no LICENSE file. The GitHub MIT LICENSE reads "Copyright (c) 2026 Microsoft". The blog
  mentions ~200B tokens and regeneration with GPT-4o/o4-mini.

### snowflake-arctic, snowflake-arctic-base, snowflake-arctic-instruct — verified, no changes
- The cards match on 10B dense plus 128x3.66B MoE, 480B total and 17B active, top-2 gating, release
  2024-04-24, Apache-2.0, trust_remote_code, Transformers ≥4.39, DeepSpeed ≥0.14.2, 8xH100, FP8/FP6, and
  150GiB. The repo `training/arctic` holds only lora_script.py and ds_to_hf_converter.py. The repo LICENSE
  is Apache-2.0.

### trinity (family) — 1 change
- `useful_for.text`: "cloud or on-premises servers (Mini and Large)" → Nano for edge and on-device use,
  Mini for cloud or on-prem, and Large offered through Arcee's cloud API. Reason: the Trinity page lists
  Large Preview and Large Thinking with deployment target "Cloud API", not on-premises.

### trinity-large-thinking, trinity-mini — verified, no changes
- The LICENSE files are OpenMDW-1.1, byte-identical to each other and matching the OpenMDW 1.1 text.
  Both repos have a commit "Adopt OpenMDW-1.1 license" on 2026-05-28. The Arcee blog of 2026-05-29 says
  previously released models moved to OpenMDW-1.1. The launch posts (2025-12-01 for Mini and 2026-04-01
  for Large-Thinking) state Apache 2.0. The technical report confirms the modified TorchTitan, the 10T
  three-phase mix for Nano and Mini, and 17T tokens for Large. The Large variant list (TrueBase =
  pre-anneal, Base, Preview, Thinking) is confirmed in the card.

### dbrx, dbrx-base, dbrx-instruct (archived) — verified; 1 edit on dbrx-instruct
- `dbrx-instruct.availability.access_conditions`: rewrote a run-on sentence. The facts are unchanged.
- Verified the archive notes. github.com/databricks/dbrx and the GitHub API returned 404 today. The HF
  API lists no models for author=databricks (the org page says "None public yet"), and
  databricks/dbrx-instruct and dbrx-base return 401. The Transformers doc says the original
  dbrx-instruct checkpoint "was closed". Retirement dates are pay-per-token and fine-tuning 2025-04-30,
  and provisioned throughput 2025-12-19. The license (2024-03-27) matches: no improving other LLMs, the
  700M MAU clause, and the AUP.

## Not verified / for editor follow-up
- **Nemotron 3 Ultra teachers:** the HF "NVIDIA Nemotron v3" collection now includes
  `NVIDIA-Nemotron-Labs-Teacher-*` checkpoints (STEM, Instruction-Following, Competition-Coding, Chat,
  General-Reasoning). The Ultra recipe still says the teacher checkpoints are not released. It is unclear
  whether these are the Ultra MOPD teachers. If they are, the recipe status may deserve re-review.
- **Nemotron 3.5 Lightning recipe:** the recipe names an internal release-candidate training container
  (`nvcr.io/nvidian/...rc2`) "until the public 26.08 tag ships". The code itself is public, so
  `training_code: public` stands, but the doc may be stale.
- **Snowflake Arctic cookbooks** (Medium) were not read. `training_data_information` and `training_recipe`
  stay unknown. They could become partial after review.
- **Phi-4-reasoning-vision-15B:** the fine-tuning code and benchmark logs that the blog says were
  released were not located.
- **Olmo 3.1 32B Think card:** the per-stage section lists 7B dataset names, a card inconsistency. The
  record's data claims rest on the 32B dataset cards and the technical report instead.
- **Consistency:** the `snowflake-arctic` family uses `availability.status: public`, while other
  families use `not_applicable`. The claim is accurate, so it was left as is.
- The Nature paper (WHAM) and the Nemotron 3 Ultra technical report were not opened. No claim relies on
  them alone.

Validator: `npx tsx scripts/validate.ts` → 0 errors, 0 warnings.
