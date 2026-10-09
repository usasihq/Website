# Round 5: catalog records (`round5-records`), 2026-10-08

Validator: `npx tsx scripts/validate.ts` gives 0 errors and 1 warning (the existing
continue-extension warning). All primary sources were fetched on 2026-10-08 with WebFetch or
curl using the generic UA `USASI-catalog-research/0.3`. No identifiers were sent. I did not use
the Browser pane or sign in anywhere. I could not read gated Hugging Face cards (Llama Guard 4,
Llama 3.1 8B), so those records rely on Meta's public GitHub copies and the public Hugging Face
API metadata.

## Files

Created (all `published`):
`content/artifacts/{embeddinggemma-2, llama-guard-4-12b, synthid-text, llama-3-1-8b, olmo-core, tiktoken, rocm, sentence-transformers}.yml`,
`content/changelog/2026-10-08-records.yml`.

Edited:
- `content/artifacts/embeddinggemma-300m.yml`: added one run note and two new source entries,
  and set `updated_at` to 2026-10-08. The schema has no `notable` or `status_note` field for
  artifacts, so the note went in `run_notes`. No other claim was changed, and `last_reviewed`
  stays at 2026-10-01.
- `content/hubs/safety-and-security.yml`: appended `llama-guard-4-12b` and `synthid-text` to
  `artifacts:`.
- `content/hubs/speech-vision-and-multimodal.yml`: appended `embeddinggemma-2` to `artifacts:`.
  I chose this hub because the model is multimodal; data-and-datasets lists only datasets.

## Required candidates

| Candidate | Decision | Eligibility basis | License source | Gaps |
| --- | --- | --- | --- | --- |
| EmbeddingGemma 2 (`embeddinggemma-2`, family `gemma`) | published | us-control: the card names Google DeepMind; the 2023 Google blog; Alphabet's FY2025 10-K cover (R1) and Ex. 21.01 | HF card `license: apache-2.0`, linking to ai.google.dev/gemma/docs/gemma_4_license, which is the full Apache 2.0 text. The HF repo has no LICENSE file. The Gemma Terms appendix (last modified 2026-04-01) lists EmbeddingGemma but not EmbeddingGemma 2. | The card's ethics section says deployments "must adhere" to the Gemma Prohibited Use Policy, which the Apache text does not mention. I recorded both facts and did not interpret them. No technical report was found (recipe unknown). Kaggle availability is taken from the launch post only. |
| Llama Guard 4 (`llama-guard-4-12b`, family `llama`) | published | us-headquarters: Meta's card and blog; Meta FY2025 10-K cover (R1) | `Llama-Guard4/12B/LICENSE` in PurpleLlama (Llama 4 Community License); HF metadata `license_name: llama4` | Family link: Meta's docs list it among its Llama model cards ("designed to work with the Llama 4 line"). Meta calls it one of its "Llama protection tools". It is pruned from Llama 4 Scout and distributed as Llama 4 Materials. I could not read the gated HF card. The Llama 4 AUP clause excluding EU-domiciled individuals and companies from multimodal models ships with the model; the record says the catalog has not confirmed how Meta applies it to Llama Guard 4. I did not check whether the Llama API moderations endpoint is still offered; the record attributes that claim to Meta's page. |
| SynthID Text (`synthid-text`, framework) | published | us-control: written assessment. The README and pyproject name **DeepMind Technologies Limited (UK)** as copyright holder and author. Companies House PSC registers show DeepMind Technologies Ltd (07386350) ← DeepMind Holdings Ltd (12181850, ≥75%) ← Alphabet Inc. (Delaware, ≥75%). Alphabet 10-K cover. | `LICENSE` (Apache-2.0) and the README license section (other materials CC-BY 4.0) | The README calls this a reference implementation "not intended for production use". The latest tagged release is 0.2.1 (Nov 2024). Detection limits come from the 2024 HF/Google DeepMind announcement. |

## Gap finding (hubs, learn pages, glossary)

I counted pages that name U.S.-led items with no record:

| Candidate | Pages naming it | Decision | Eligibility basis | License source | Notes / gaps |
| --- | --- | --- | --- | --- | --- |
| OLMo-core | learn-ecosystem, learn-open-weight, glossary | published | us-governed-project (allenai GitHub org, PyPI `ai2-olmo-core`, Ai2 about page) | LICENSE (Apache-2.0); PyPI | The repo is now named `allenai/Olmo-core`; the old URLs redirect. The docs site shows v2.6.0 while the latest release is v3.0.0 (2026-10-01). `released_at` is null. |
| Llama 3.1 8B (`llama-3-1-8b`, family `llama`) | learn-pretraining-and-post-training, learn-quantization, glossary | published | us-headquarters (card; Meta 10-K cover) | `models/llama3_1/LICENSE` (Llama 3.1 Community License); HF `llama3.1` | Gated HF card not read. Weights are partial (manual gate). Evaluation datasets are gated, and I did not check the eval recipe. I did not assess the Llama 3 paper (recipe partial). The quantize sizes come from llama.cpp's README. |
| ROCm | glossary, learn-inference-hardware | published | us-governed-project (license page: "released by Advanced Micro Devices, Inc."; AMD 10-Q cover) | rocm.docs.amd.com/en/latest/about/license.html, a per-component table | Nine license entries come from that table. GPL entries have spdx null because the page does not say "only" or "or later". Two components are binary-only (source_code partial). Surprise: ROCm jumped from 7.14 to 10.0/10.1 (10.1.0 released 2026-10-05). Builds now go through TheRock, and the old `ROCm/ROCm` repo appears as `ROCm/legacy-rocm-build`. |
| tiktoken | learn-tokens-and-context-windows (central, with code) | published | us-headquarters (openai org; LICENSE names OpenAI; SEC exhibit for OpenAI Group PBC) | LICENSE (MIT) | The MIT copyright line also names an individual developer; the record does not name them. The library downloads encoding files at run time from `openaipublic.blob.core.windows.net`, and I found no separate terms for those files in the README. |
| Sentence Transformers | learn-retrieval-augmented-generation; also the run path for both EmbeddingGemma records | published | us-governed-project, with a written two-organization assessment: UKP Lab, TU Darmstadt (2019–2025) → Hugging Face, Inc. (2025–), per NOTICE.txt; HF ToS gives Hugging Face, Inc. as a Delaware corporation | LICENSE (Apache-2.0) + NOTICE.txt | Relies on the hugging-face org record's dual-country assessment (which notes a pending NVIDIA acquisition). The README still carries an old "experimental software" disclaimer, which I left out. |
| HarmBench (CAIS) | glossary | not created (slot limit) | Verified: repo in centerforaisafety org, LICENSE MIT ("Copyright (c) 2024 centerforaisafety"), CAIS donate page (501(c)(3), EIN), CAIS research page lists it | MIT | Good next candidate for an eval record. The repo was last pushed 2024-08. The classifier models are separate Llama-2/Mistral fine-tunes whose licenses would need their own review. |
| SigLIP 2 | speech-vision hub, learn-multimodal | not created | — | — | Would need a new family plus release record; out of scope this round. |
| bitsandbytes, safetensors, GGUF/GGML | 1 page each | not created | — | — | bitsandbytes governance (its own GitHub org vs. Hugging Face) is unclear. GGUF/GGML are covered by llama.cpp per the glossary's policy. |
| LM Studio | local-ai hub, learn-quantization | not created | — | — | It was already decided in round 3 that this is a product on `element-labs`, not an open artifact. |
| Inspect AI, Qwen, GPTQ | various | not eligible | UK AISI / Alibaba / IST Austria | — | Not U.S.-governed. |

## Suggestions for other owners (not edited)

- `synthid-bio.yml` provenance lists "SynthID Text" with `artifact_slug: null`. It could now
  point to `synthid-text`.
- `gemma.yml` summary lists EmbeddingGemma among variants, and could mention EmbeddingGemma 2.
- The explainers that mention OLMo-core, tiktoken, ROCm, Sentence Transformers, and Llama 3.1 8B
  could link to the new `/open/<slug>/` pages.
- `llama-3-1-tulu-3-1-8b.yml` provenance could point to `llama-3-1-8b`. I did not check that
  file.
