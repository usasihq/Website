# Verification log: models-1

Checked on 2026-09-29 against the cited sources. Raw files (Hugging Face READMEs, LICENSE and
USAGE_POLICY files, HF API metadata, GitHub READMEs and license files, PDFs) were read with
`curl -A "USASI-factcheck/0.1"`. Rendered pages were read with WebFetch. For SEC filings I used the
XBRL cover page (`R1.htm`) or a full-text download, because EDGAR blocks generic user agents.
`npx tsx scripts/validate.ts` reports 0 errors and 0 warnings after the edits.

Computed tiers after the edits: every release in this batch is **open-weight**, except the two
Llama 4 releases, which are **restricted-weights**. No release has `training_code: public`, so
none reaches open-stack or fully-open.

Gating status from the HF API (`gated` field): false for all Gemma 4, gpt-oss, Granite 4.2, Grok,
Inkling and Laguna repos. It is `"manual"` for all Llama 4 repos.

## Gemma

### gemma (family)
- `license_notes.text`: before, the Terms of Use "state that they do not cover Gemma 4". After,
  the Terms "apply to the models listed in their appendix, and direct readers to the separate
  Gemma 4 license for Gemma 4". Reason: the Terms page says "The terms below apply to Gemma models
  listed in the Appendix… For Gemma 4 terms, see the Gemma 4 license". It never says outright that
  it excludes Gemma 4. Source: gemma-terms (last modified April 1, 2026).
- Everything else checks out: the release list and dates, the specialized variants, Google
  DeepMind authorship (GDM page, Gemma 3/4 cards), the 2023 GDM announcement, and the Alphabet
  10-K address (Mountain View, per EDGAR).

### gemma-4-12b, gemma-4-26b-a4b, gemma-4-31b
- `license_notes.text` in all three: the same narrowing as the family record.
- Checked and found accurate:
  - License: the Gemma 4 license page is the verbatim Apache License 2.0, and the HF metadata
    says `license: apache-2.0`.
  - Repos are ungated.
  - Parameter counts: 11.95B; 25.2B total / 3.8B active with 8 of 128 experts plus 1 shared;
    30.7B.
  - 256K context. The 12B is encoder-free with audio input.
  - Sampling settings, Transformers class, and intended uses.
  - Tech report (arXiv 2607.02770, v1 July 2, 2026): TPUv4/TPUv6e, JAX/Pathways, data filtering,
    "similar pre-training/post-training as Gemma 3", January 2025 cutoff.
  - The gemma JAX library is Apache-2.0, supports Gemma 4, and has fine-tuning code.
  - The 12B blog is dated June 3, 2026.
- Open item for the editor: the Gemma releases page dates the initial Gemma 4 release to
  **March 31, 2026**, but Google's launch blog is dated **April 2, 2026**. I kept `released_at:
  2026-03-31` because the summaries explicitly attribute that date to the release-notes page.

## gpt-oss

### gpt-oss, gpt-oss-120b, gpt-oss-20b: verified, no changes
- The HF LICENSE files and the GitHub LICENSE are Apache 2.0.
- USAGE_POLICY is the one-sentence "comply with all applicable law" statement.
- Repos are ungated and include `original/` checkpoints.
- Model card PDF (August 5, 2025), checked items:
  - Layers, parameters, experts, and top-4 routing.
  - 131,072-token context, MXFP4 at 4.25 bits, and checkpoint sizes of 60.8/12.8 GiB.
  - 2.1M H100-hours, and "almost 10x fewer" for 20b.
  - Data description and the June 2024 cutoff.
  - CoT RL post-training.
- The GitHub README lists torch, triton, metal, tools and the responses_api server. The evals
  README covers GPQA and HealthBench and is adapted from simple-evals.
- The safeguard HF card lists `base_model_relation: finetune`.
- The SEC exhibit shows OpenAI Group PBC at 1455 3rd Street, San Francisco.
- I could not fetch the OpenAI blog (HTTP 403), so `released_at` stays at month precision
  (2025-08).

## Granite

### granite (family): verified, no changes
IBM's Granite page lists six lines and Granite 4.2. The Granite 4.2 blog is dated August 25,
2026. The IBM 10-K cover page gives One New Orchard Road, Armonk, NY.

### granite-4-2-3b, granite-4-2-8b, granite-4-2-30b
- `checklist.training_recipe.note`: the old note said the SFT/GRPO/RLHF pipeline was described
  "at a high level. Full hyperparameters are not given." The new note says the technical blog
  documents the post-training procedure, including SFT configuration and per-stage RL/RLHF
  settings. It adds that Granite 4.1 base pre-training is covered in a separate blog I did not
  assess, and that no training code or configs were found. Reason: the blog has an SFT
  configuration table (LR 1.0e-5, global batch 128, 2.5% warm-up, about 2 epochs) and a
  per-stage RL table (prompts/step, generations, KL, LR). The old note was inaccurate. Status
  stays `partial`: pre-training is not assessed here and training code is `unknown`. Source:
  tech-blog.
- Everything else checks out:
  - Card fields: Apache 2.0, "Granite Team, IBM", 128K native / 512K extension, 12 tested
    languages, release date August 25, 2026.
  - Serving: vLLM v0.20+ and SGLang v0.5.18+, temperature 1.0 / top_p 0.95.
  - The 30B's second SFT phase.
  - `granite_thinking_parser.py` and the chat template are in the HF repos.
  - GGUF/FP8/MXFP4/NVFP4/MLX variants exist for every size.
  - The repo LICENSE is Apache 2.0, and the disclosures README says CDLA Permissive v2.
  - The disclosure JSON lists 94 datasets, 74 with URLs, and includes private third-party
    entries.
- Open item for the editor: the disclosure JSONs carry an internal `timestamp` of 2026-09-03,
  which is used as `published_at`. GitHub shows they were committed on **2026-09-15**. I left
  this unchanged, but the editor may prefer 2026-09-15 or null.
- Open item for the editor: `evaluation_materials` is `partial` here (results table only), while
  Gemma, gpt-oss, Inkling and Laguna mark results-only as `public`. This is a consistency
  question. It does not affect any tier.

## Grok

### grok, grok-1: verified, no changes
- xAI's Grok-1 post is dated March 17, 2024 and published by "SpaceXAI LLC". It covers the
  314B MoE, the October 2023 base checkpoint, Apache 2.0, and JAX/Rust training from scratch.
- The GitHub README covers 8 experts with 2 per token, 64 layers, 48/8 heads, a 131,072-token
  SentencePiece vocabulary, an 8,192-token context, the torrent download, and the license
  scope. The HF card describes an int8 checkpoint on multi-GPU hardware. The HF repo is
  ungated.
- The SpaceX 424B4 prospectus supports the following:
  - Texas corporation.
  - AI HQ in Palo Alto after the February 2026 acquisition.
  - "Since launching Grok-1 in November 2023".
  - "Grok, our proprietary frontier AI model".
  - Access through grok.com, apps, X, and the xAI API.
- The HF org lists only grok-1 and grok-2.

### grok-2
- `availability.access_conditions`: before, the license "restricts commercial use and model
  training". After, it "conditions commercial use on following xAI's Acceptable Use Policy and
  bars using the materials or outputs to train other general-purpose models". Reason: the
  license grants commercial use provided the AUP guardrails are followed, so "restricts" was
  imprecise. Source: grok-2-license (xAI Community License Agreement, last updated November 4,
  2025).
- Everything else checks out: the card text (trained and used in 2024, 42 files, about 500 GB,
  SGLang ≥0.5.1, TP=8 with more than 40GB per GPU, fp8/triton, chat template), the license
  terms summarized in `license_notes`, and TechCrunch (August 24, 2025, "Grok 2.5").

## Inkling

### inkling (family), inkling-975b: verified, no changes
- TML model card: July 15, 2026, Apache 2.0, "Thinking Machines Lab, Inc.", 66 layers, 6 of
  256 experts plus 2 shared, 975B/41B, 1M context, the hardware figures, the deployment
  frameworks, and the training-data text.
- The announcement covers training from scratch, 45T tokens, Muon/Adam, weight decay tied to
  LR², the SFT bootstrap on Kimi K2.5 synthetic data, and large-scale RL. It says HLE and
  forecasting results come from an earlier or different checkpoint.
- HF metadata: `apache-2.0`, no LICENSE file, `.eval_results` present, ungated.
- The Model AUP (July 15, 2026) binds anyone who uses the model and does not mention Apache.
- The privacy notice (May 19, 2026) says "We are based in the United States".

### inkling-small
- `checklist.training_recipe.note` and `provenance.text`: added "in part" to the on-policy
  distillation claim, and noted the pre-training data-mix and recipe changes. Reason: the
  release post says the earlier checkpoint was post-trained "in part using on-policy
  distillation with Inkling as the teacher". Source: tml-inkling-small-news (July 30, 2026).
- Everything else checks out: the card (42 layers, 276B/12B, 1M context, 600 GB / 180 GB
  hardware figures) and the HF metadata.

## Laguna

### laguna (family): verified, no changes
- Release notes: XS.2 and M.1 in April 2026 (the S 2.1 blog timeline gives April 28), S 2.1 in
  July 2026.
- The XS 2.1 blog is dated 2026-07-02 and says "Today we're releasing".
- The GlobeNewswire release says Poolside is headquartered in San Francisco and "trains its
  models from scratch".
- The tech report is dated May 25, 2026 and says both models were "trained from scratch".

### laguna-s-2-1
- `checklist.training_data_information`: unknown → **partial**. Before, the note said the model
  card does not describe the data. After, the note says the release blog states S 2.1 was
  pre-trained on exactly the same data as XS 2.1 and describes post-training task sources
  (open-source repositories, internal synthesis, external data vendors); the data is not
  released. Source: poolside-laguna-s-2-1-blog (newly added to `sources`).
- `checklist.training_recipe`: unknown → **partial**. The old note said "no training details for
  this release were found", which was incorrect. The blog describes a scale-up of the XS family
  with code fixes and small recipe changes, an SFT stage partly on synthetic data, and RL in
  FP8. It gives no hyperparameters. Source: poolside-laguna-s-2-1-blog.
- Everything else checks out:
  - OpenMDW-1.1 LICENSE.md, read in full; the summary in `license_notes` is accurate. SPDX
    stays null.
  - Card specifications: 118B/8B, 48 layers (12 global / 36 SWA), 256 experts plus 1 shared,
    1,048,576-token context, BF16 at about 236GB, TP=4 examples, the llama.cpp fork.
  - The repo is ungated and includes `modeling_laguna.py`.
  - `released_at` 2026-07-21.

### laguna-xs-2-1
- `summary.text`: before, "It updates Laguna XS.2 with native reasoning between tool calls and
  an FP8 KV cache". After, "Poolside describes it as an upgraded version of Laguna XS.2 with the
  same architecture. It supports interleaved reasoning between tool calls…". Reason: the release
  notes list native reasoning and the FP8 KV cache as XS 2.1 improvements, but the Laguna XS.2
  model card already lists both, and the XS 2.1 blog says it is "the same architecture as XS.2".
  The sources conflict, so I removed the "added in 2.1" framing. Sources: hf-laguna-xs-2-1,
  poolside-laguna-xs-2-1-blog. I replaced poolside-model-release-notes in this summary's
  `source_ids`; it is still cited elsewhere in the record.
- `checklist.training_data_information.note`: "Data added for XS 2.1 is not described" → "Any
  data changes for XS 2.1 are not described". Reason: the sources do not say data was added.
- Everything else checks out: OpenMDW-1.1 (identical to the S 2.1 file), XS.2 under Apache 2.0,
  the card specifications, the evaluation harness details, the Ollama/Apple Silicon note, the
  FP8/NVFP4/INT4 variants, and ungated access.
- Open item for the editor: Poolside's model release notes place XS 2.1 under **June 2026**,
  while the blog announces it on **2026-07-02**. I kept 2026-07-02.

## Llama

### llama (family): verified, no changes
The llama-models README table (Llama 2 on 7/18/2023 through Llama 4 on 4/5/2025) and its download
steps match the record. The Meta 10-K cover page gives 1 Meta Way, Menlo Park, CA.

### llama-4-maverick-17b-128e, llama-4-scout-17b-16e
- The editor's `weights: partial` is **confirmed** from primary sources:
  - Meta's README says "Read and accept the license. Once your request is approved you will
    receive a signed URL via email."
  - For Hugging Face, the README says "Once your request is approved, you'll be granted access".
  - The HF API reports `gated: "manual"` for all four Llama 4 repos checked.
  - The HF pages require name, date of birth and organization.
- `availability.status`: **public → partial**. Reason: access requires an approved request,
  which matches the schema's definition of `partial`. This also makes availability consistent
  with `weights: partial`. Sources: llama-models-readme, hf-*-instruct.
- `license_notes.text`: before, the license ends "for anyone who sues Meta alleging that Llama
  infringes their IP". After, "sues Meta or any other entity alleging that the Llama materials
  or their outputs infringe their IP". Reason: Section 5(c) covers litigation against "Meta or
  any entity" and covers outputs. Source: llama4-license.
- Everything else checks out:
  - Llama 4 license text: effective April 5, 2025; attribution rules; "Llama" name prefix;
    700M MAU clause; California law.
  - AUP EU multimodal clause, at both the GitHub USE_POLICY.md and the dev.meta.ai page
    (llama.com redirects there).
  - Model card: 17B/109B/16E and 17B/400B/128E, 10M/1M context, ~40T/~22T tokens, August 2024
    cutoff, custom training libraries, quantization statements.
  - Transformers v4.51.0 on the HF cards.
  - The blog (April 5, 2025) mentions MoE, early fusion, MetaP and FP8.
  - The README's "at least 4 GPUs" statement.

## Summary
- 23 records checked. 10 verified with no changes: gpt-oss ×3, granite, grok, grok-1, inkling,
  inkling-975b, laguna, llama. 13 edited: gemma ×4, granite-4-2 ×3, grok-2, inkling-small,
  laguna-s-2-1, laguna-xs-2-1, llama-4 ×2.
- Items that could not be verified: the OpenAI gpt-oss blog (403), so month precision was kept.
  I relied on the SEC R1.htm cover pages for the IBM and Meta 10-Ks because the full documents
  exceed WebFetch limits.
