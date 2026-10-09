# Round 5 verification: catalog records (`round5-verify-records`)

Checked on 2026-10-08 against the researcher's notes in `research/notes/round5-records.md`.
I fetched every source today with curl (`-A "USASI-factcheck/0.3"`). Five SEC EDGAR pages
(Alphabet 10-K cover and Exhibit 21.01, Meta 10-K cover, AMD 10-Q cover, and the OpenAI
Group PBC exhibit) block curl without a declared contact User-Agent, so I read them with
WebFetch. I sent no email address, name, or other identifier in any request, did not use the
Browser pane, did not sign in, and did not get around any gate or bot check. The gated Hugging
Face cards for Llama Guard 4 and Llama 3.1 8B were not read. I checked Meta's GitHub copies and
the public Hugging Face API metadata instead, the same sources the records cite.

Validator after edits: `npx tsx scripts/validate.ts` gives 0 errors and 1 warning. The warning
is the existing continue-extension one.

## Summary

| Record | Result |
| --- | --- |
| embeddinggemma-2 | 1 correction (license_notes wording) |
| llama-guard-4-12b | 1 narrowing (evaluation_materials note) |
| synthid-text | eligibility aligned with google-deepmind record; release_status note extended |
| olmo-core | eligibility evidence strengthened (docs statement added) |
| llama-3-1-8b | verified, no changes |
| rocm | verified, no changes |
| tiktoken | 2 narrowings (useful_for, license_notes) |
| sentence-transformers | verified, no changes |
| embeddinggemma-300m (diff) | verified, no changes |
| changelog 2026-10-08-records | verified, no changes |
| hubs (safety-and-security, speech-vision-and-multimodal) | verified, no changes (git diff shows only the appended `artifacts:` lines) |

## embeddinggemma-2

Verified against the HF card (raw README), the HF API, the ai.google.dev v2 model card, the
EmbeddingGemma overview, the Gemma releases page, the launch post, the Gemma 4 license page,
the Gemma Terms of Use, the Gemma Prohibited Use Policy, the 2023 Google blog, and the Alphabet
10-K cover and Ex. 21.01 (WebFetch).

- **License.** The card's front matter says `license: apache-2.0`. Its header links "Apache
  2.0" to `ai.google.dev/gemma/docs/gemma_4_license`, and that page is only the Apache License
  2.0 text (last updated 2026-04-01). It does not mention the Prohibited Use Policy. The HF repo
  has no LICENSE file. SPDX `Apache-2.0` and `applies_to: weights` are correct and match the
  catalog's Gemma 4 records.
- **Prohibited Use Policy statement.** The card's "Ethics & Safety" section says that
  deployments "must adhere to the Gemma Prohibited Use Policy", and the ai.google.dev copy of
  the card says the same. The record reports this without interpreting it, which is correct.
  For context (not added to the record): the policy page (last modified February 21, 2024)
  is written for "Gemma or Model Derivatives". The Gemma Terms (last modified April 1, 2026)
  say they apply to the models in their Appendix, and for Gemma 4 terms they point to the Gemma
  4 license. The Appendix lists EmbeddingGemma but not EmbeddingGemma 2. This matches the record.
- **Family link (`gemma`).** The releases page says it "documents releases for the Gemma family
  of models". It lists "Release of EmbeddingGemma 2 in 740M parameter size" on October 6,
  2026. The card refers to "other Gemma-family models". The link is supported.
- Eligibility (us-control, same sources as embeddinggemma-300m), parameter figures, context,
  MRL dimensions, prefixes, token budgets, bf16/fp32 note, ungated status, 744,371,512 BF16
  parameters, Kaggle and serving tools (launch post), the fine-tuning guide (it is for
  EmbeddingGemma 2 and uses SentenceTransformerTrainer), and provenance ("Built on the Gemma 4
  architecture"; overview calls the 308M model EmbeddingGemma 1): all verified.

Change:
- `license_notes.text`: "The model card and the repository metadata give Apache 2.0 and link to
  Google's Gemma 4 license page" → "The model card and the repository metadata give Apache 2.0,
  and the card links to Google's Gemma 4 license page". Reason: the HF API metadata only gives
  `license: apache-2.0`. It has no license link. Source: `eg2-hf-api`, `eg2-hf-card`.

## llama-guard-4-12b

Verified against `PurpleLlama/Llama-Guard4/12B/{MODEL_CARD.md, LICENSE, USE_POLICY.md}`, the HF
API, HF gated-models docs, Meta's Llama Guard 4 docs page, the Llama Protections page, the
April 29, 2025 Meta blog, and the Meta 10-K cover (WebFetch: Delaware; 1 Meta Way, Menlo Park,
CA).

- **License.** The LICENSE file is the Llama 4 Community License Agreement, effective April 5,
  2025. HF metadata gives `license: other`, `license_name: llama4`. `spdx: null` and
  `applies_to: weights` are correct. Each term in license_notes matches the text: royalty-free,
  non-exclusive grant; "Built with Llama"; "Llama" name prefix; Notice file; incorporated AUP;
  the 700M MAU clause; termination on litigation; California law.
- **EU clause.** The AUP's multimodal clause is quoted correctly. The wording matches the Llama
  4 Scout and Maverick records.
- **Family link (`llama`).** Meta's Llama docs list Llama Guard 4 among their model cards
  (Llama 3.3, Llama 4, Llama Guard 4, other models), and describe it as designed for "the Llama
  4 line". It is distributed as Llama 4 materials under the Llama 4 license, and the card calls
  it "an LLM fine-tuned on Llama 4". It is not in the `llama-models` README table. I kept the
  link because Meta documents and licenses it as part of its Llama line. An editor may revisit
  this if the `llama` family is meant to cover only the `llama-models` generations.
- Gate (manual; name, date of birth, country, affiliation, job title), 12,001,097,216 BF16
  parameters, Llama4ForConditionalGeneration, 336×336 tiles, "single GPU", drop-in replacement
  for Llama Guard 3 8B/11B, /moderations endpoint, release date, hazard categories, pruning
  recipe, training data mix, and limitations: all verified.

Change:
- `checklist.evaluation_materials.note`: "...on an in-house test set, which is not released." →
  "...on an in-house test set that the card does not make available." Reason: the card says
  "in-house test set" but says nothing about whether it is released. Source: `lg4-card`.

## synthid-text

Verified against the README, LICENSE, pyproject.toml, PyPI JSON, the GitHub releases API, the
GitHub repo API (created 2024-10-23), the Nature paper (published 23 October 2024; abstract
says it "modifies only the sampling procedure" and detection works "without using the
underlying LLM"), the HF announcement (Transformers v4.46.0; limits on factual responses and
rewritten or translated text), the Companies House PSC registers, and the Alphabet 10-K cover.

- **Licenses.** The LICENSE file is Apache 2.0. The README says "All software is licensed under
  the Apache License, Version 2.0" and "All other materials are licensed under the Creative
  Commons Attribution 4.0 International License", with "Copyright 2024 DeepMind Technologies
  Limited". `Apache-2.0` (code) and `CC-BY-4.0` are correct. The CC-BY entry uses
  `applies_to: data`, and its name says "materials other than software". The schema allows one
  value per entry, so I kept this. Note that it also covers non-software documentation.
- **Eligibility.** Companies House shows that DeepMind Technologies Limited (07386350) has one
  active PSC, DeepMind Holdings Limited (12181850, England and Wales). It holds 75% or more of
  shares and voting rights and has the right to appoint directors. DeepMind Holdings Limited's
  active PSC is Alphabet Inc. (Delaware, reg. 5786925), also at 75% or more. The Alphabet 10-K
  cover gives Mountain View, California. The google-deepmind organization record uses
  `us-control`, based on Google DeepMind being part of Google (the 2023 Google blog and Alphabet
  10-Ks). The basis matches and the sources hold, so the record stays `eligible`/`published`.

Changes:
- `eligibility.explanation`: appended "This is the same us-control basis as the catalog's
  google-deepmind record, which treats Google DeepMind as part of Google: Google's CEO announced
  it in April 2023 as a unit combining DeepMind and Google Research's Brain team. This review did
  not examine which entities employ the repository's maintainers." `source_ids`: added
  `google-blog-gdm-2023`, and added that source entry (accessed 2026-10-08). Reason: to align
  with the org record's basis and sources as instructed, and to state the missing evidence as
  ELIGIBILITY.md requires. Source: blog.google April 20, 2023 post ("we're creating a unit ...
  This group, called Google DeepMind").
- `checklist.release_status.note`: added "all marked as pre-releases on GitHub". Reason: the
  GitHub releases API shows `prerelease: true` for v0.1, v0.1.1, v0.2, and v0.2.1. Source:
  `st-releases`.

## olmo-core

Verified against the README, LICENSE (Apache 2.0), the v3.0.0 release (published 2026-10-01; it
removed `olmo_core.model_ladder`, and "Existing ladder orchestration configs and commands
require an earlier revision"), PyPI (3.0.0 uploaded 2026-10-01; `requires_python >=3.10`;
Apache license text), the docs (show v2.6.0), and the Ai2 about page ("Seattle based non-profit
AI research institute founded in 2014").

Change:
- `eligibility.explanation` and `source_ids`: added "the documentation says OLMo-core is
  developed and maintained at the Allen Institute for Artificial Intelligence (AI2)", with
  `oc-docs`. Reason: the original basis rested only on the GitHub organization name and the PyPI
  package prefix. The docs name the maintaining entity directly. Source:
  olmo-core.readthedocs.io ("OLMo-core is developed and maintained at the Allen Institute for
  Artificial Intelligence (AI2)").

## llama-3-1-8b — verified, no changes

The model card (GitHub copy) gives release date July 23, 2024; sizes 8B/70B/405B; GQA; 128k;
eight languages; 15T+ tokens with a December 2023 cutoff; SFT and RLHF; custom training
libraries; over 25M synthetic examples; and an out-of-scope note on languages. The LICENSE is
the Llama 3.1 Community License (Version Release Date July 23, 2024). Every license_notes term
matches. `spdx: null` and `applies_to: weights` are correct. The HF API for both repos shows
manual gating, `license: llama3.1`, the same gate fields, 8,030,261,248 BF16 parameters,
LlamaForCausalLM, and `original/consolidated.00.pth`. The evals dataset is manual-gated.
eval_details.md links the evals collection and an lm-evaluation-harness reproduction recipe.
The llama3 code directory has model.py, generation.py, tokenizer.py, quantization/, and
scripts/. The llama.cpp quantize README sizes for Llama-3.1-8B (F16 14.96 GiB; Q8_0 7.95 GiB
at 8.5008 bpw; Q4_K_M 4.58 GiB at 4.8944 bpw) and its memory/disk note are correct. The Tülu
3.1 8B card lists `meta-llama/Llama-3.1-8B` as its base model. The family link is correct:
the llama-models README lists Llama 3.1.

## rocm — verified, no changes

The license page says "ROCm is released by Advanced Micro Devices, Inc. (AMD) and is licensed
per component separately". All nine license entries match its table, including the SPDX ids
(MIT, Apache-2.0, Apache-2.0 WITH LLVM-exception, NCSA, BSD-2-Clause). The GPL entries are
recorded with null SPDX because the page gives no only/or-later. The MIT license covers the
ROCm repository, which "primarily contains documentation". The page's binary-only and
repo.radeon.com statements also match the record. The release notes (2026-10-05) support the
framework versions, the TensorFlow 2.19.1 drop, Ubuntu 26.04.1/24.04.5, SR-IOV, and "Since ROCm
7.14". TheRock README supports the CMake super-project, about 200 GB, and multiple hours. The
therock-10.1 release was published 2026-10-05. The `ROCm/ROCm` API resolves to
`ROCm/legacy-rocm-build`. The install page supports package manager, amdgpu-install (Radeon and
Ryzen only), pip, tarball, runfile, the distro list, Windows 11 25H2, and the WSL "Technical
Preview". The AMD 10-Q cover (WebFetch) gives Delaware and Santa Clara, CA, for the period
ended June 27, 2026.

## tiktoken

Verified: README, LICENSE ("Copyright (c) 2022 OpenAI" plus one individual), pyproject (Rust
core through setuptools-rust; `>=3.9`), openai_public.py (encodings at
openaipublic.blob.core.windows.net), load.py (`TIKTOKEN_CACHE_DIR`; temp-dir default), the
repository tree (no encoding files), the CHANGELOG, PyPI (0.14.0 uploaded 2026-08-17; the wheel
platforms listed), and the SEC exhibit (WebFetch: "OpenAI Group PBC, a Delaware public benefit
corporation", 1455 3rd Street, San Francisco, dated February 27, 2026). Eligibility matches
gpt-oss and the openai record.

Changes:
- `useful_for.text`: "...for an OpenAI model, for example to see how much of a context window
  it uses, and learning how BPE tokenization works. The README links an OpenAI Cookbook notebook
  with worked examples." → "...for an OpenAI model, and learning how BPE tokenization works. The
  README links an OpenAI Cookbook notebook on counting tokens with tiktoken." Reason: the README
  does not mention context windows. The linked notebook is "How_to_count_tokens_with_tiktoken".
  Source: `tk-readme`.
- `license_notes.text`: "names OpenAI and the project's original developer" → "names OpenAI and
  an individual developer". Reason: the license names an individual but does not call them the
  original developer. Source: `tk-license`.

## sentence-transformers — verified, no changes

The NOTICE.txt credits UKP Lab, TU Darmstadt (2019–2025) and Hugging Face, Inc. (2025–present).
The README names a Hugging Face maintainer and says the project "was originally developed by"
UKP Lab. The LICENSE is Apache 2.0, and PyPI gives `license_expression: Apache-2.0`. PyPI also
shows 6.1.0 uploaded 2026-09-18, Production/Stable, Python 3.10–3.13, and dependencies
`torch>=2.2` and `transformers>=5.0.0`. The GitHub release v6.1.0 was published 2026-09-18.
The installation page covers uv, pip, conda-forge, and source, plus the image, audio, video,
train, ONNX, and OpenVINO extras. The HF terms say "Hugging Face, Inc. a Delaware corporation".
The eligibility basis matches the hugging-face org record, which is a dual-country assessment
treating the U.S. entity as headquarters.

## embeddinggemma-300m (diff) — verified, no changes

The only diff is one added run note, two new source entries, and `updated_at` 2026-10-08.
`last_reviewed` is unchanged at 2026-10-01. The overview leads with EmbeddingGemma 2 (740M,
Apache 2.0) and lists "EmbeddingGemma 1 is a 308M parameter multilingual text embedding model".
The releases page gives October 6, 2026.

## Changelog and hubs — verified, no changes

Each changelog note matches its record as corrected. The explainer pages named in the summary
(learn-ecosystem, learn-tokens-and-context-windows, learn-inference-hardware,
learn-retrieval-augmented-generation, learn-quantization, learn-pretraining-and-post-training,
learn-open-weight, and the glossary) do mention these items. `git diff` on the two hub files
shows only the appended slugs (`llama-guard-4-12b`, `synthid-text`; `embeddinggemma-2`). All
three are published records, and the validator accepts them.

## Not verified / for an editor

- I did not read the gated Hugging Face cards for Llama Guard 4 and Llama 3.1 8B (the records
  say so).
- Llama Guard 4's `family_slug: llama` is a judgment call (see above).
- synthid-text's CC-BY entry uses `applies_to: data`, although the README applies CC-BY to all
  non-software materials.
- Meta's Llama Guard 4 docs say the text part of image prompts should be in English, while the
  card describes multilingual text support. The record mentions neither. No change was made.
