# Glossary and open-weight explainer — notes (2026-10-01)

Files created:

- `content/pages/glossary.mdx`: 22 entries, alphabetical, each `<h2 id>` plus definition, "In this catalog" note, and one example linked to a published record.
- `content/pages/learn-open-weight.mdx`: explainer "What open weight and open source actually mean". About 1,020 words before the Sources list, about 1,100 including it.

No routes, code, or records were edited. Both files compile with `@mdx-js/mdx` (checked with a scratch script). They contain no imports, components, GFM tables, or strikethrough. Every methodology anchor they link to exists: eligibility, openness, tiers, sources, families, dates, uncertainty, counts.

Requests: all fetches used WebFetch or curl with User-Agent `USASI-catalog-research/0.3`. No personal identifiers were sent.

## External sources (all read 2026-10-01)

| # | Source | URL | Used by |
|---|---|---|---|
| 1 | Open Source Initiative, The Open Source AI Definition, version 1.0 (page gives no date) | https://opensource.org/ai/open-source-ai-definition | Glossary: open-source-ai, weights. Explainer: rubric-and-osaid, Sources |
| 2 | Open Source Initiative, "Open Weights" explainer | https://opensource.org/ai/open-weights | Glossary: open-weight |
| 3 | Open Source Initiative, The Open Source Definition 1.9 | https://opensource.org/osd | Glossary: open-source-software |
| 4 | Hugging Face Hub docs, Gated models | https://huggingface.co/docs/hub/models-gated | Glossary: gated-download |
| 5 | Hugging Face Hub docs, Model Cards | https://huggingface.co/docs/hub/model-cards | Glossary: model-card |
| 6 | Mitchell et al., Model Cards for Model Reporting (arXiv 1810.03993, submitted 2018-10-05) | https://arxiv.org/abs/1810.03993 | Glossary: model-card |
| 7 | openai/gpt-oss-20b model card, raw README, and API metadata (gated: false) | https://huggingface.co/openai/gpt-oss-20b | Explainer: gpt-oss-20b example |
| 8 | openai/gpt-oss-20b LICENSE (Apache 2.0) | https://huggingface.co/openai/gpt-oss-20b/blob/main/LICENSE | Explainer: gpt-oss-20b example |
| 9 | openai/gpt-oss-20b USAGE_POLICY | https://huggingface.co/openai/gpt-oss-20b/blob/main/USAGE_POLICY | Explainer: gpt-oss-20b example |
| 10 | openai/gpt-oss repository LICENSE (Apache 2.0) | https://github.com/openai/gpt-oss/blob/main/LICENSE | Explainer: gpt-oss-20b example |
| 11 | Google, Gemma 4 license (Apache License 2.0) | https://ai.google.dev/gemma/apache_2 (redirect target, see below) | Explainer: Gemma example. Glossary: model-family |
| 12 | Google, Gemma Terms of Use (last modified April 1, 2026) | https://ai.google.dev/gemma/terms | Explainer: Gemma example. Glossary: acceptable-use-policy, model-family |
| 13 | google/gemma-4-31B-it model card, plus API metadata for gemma-4-31B-it and gemma-4-31B (gated: false) | https://huggingface.co/google/gemma-4-31B-it | Explainer: Gemma example. Glossary: context-window (256K) |
| 14 | google/embeddinggemma-300m model card and API metadata (gated: manual; gate text says requests are processed immediately) | https://huggingface.co/google/embeddinggemma-300m | Explainer: Gemma example. Glossary: acceptable-use-policy |
| 15 | allenai/Olmo-3-1025-7B model card, raw README, and API metadata (gated: false) | https://huggingface.co/allenai/Olmo-3-1025-7B | Explainer: Olmo example. Glossary: open-source-ai |
| 16 | allenai/OLMo-core LICENSE (Apache 2.0) | https://github.com/allenai/OLMo-core/blob/main/LICENSE | Explainer: Olmo example |
| 17 | allenai/dolma3_mix-6T-1025-7B dataset card (ODC-BY; notes redacted documents) | https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025-7B | Explainer: Olmo example |
| 18 | Ai2, Responsible Use Guidelines | https://allenai.org/responsible-use | Explainer: Olmo example |
| 19 | Meta, Llama 4 Community License Agreement (effective April 5, 2025) | https://github.com/meta-llama/llama-models/blob/main/models/llama4/LICENSE | Explainer: Llama example |
| 20 | Meta, Llama 4 Acceptable Use Policy | https://dev.meta.ai/llama/llama4/use-policy/ | Explainer: Llama example |
| 21 | meta-llama/llama-models README | https://github.com/meta-llama/llama-models/blob/main/README.md | Explainer: Llama example (access request, signed URL) |
| 22 | meta-llama/Llama-4-Scout-17B-16E-Instruct page and API metadata (gated: manual) | https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct | Explainer: Llama example |
| 23 | google/timesfm-3.0-pytorch LICENSE (TimesFM Non-Commercial License v1.0) and API metadata; google-research/timesfm LICENSE (Apache 2.0) | https://huggingface.co/google/timesfm-3.0-pytorch/raw/main/LICENSE and https://raw.githubusercontent.com/google-research/timesfm/master/LICENSE | Glossary: license-scope (checks the record) |
| 24 | facebook/sam3.1 API metadata (gated: manual) | https://huggingface.co/api/models/facebook/sam3.1 | Glossary: gated-download (checks the record) |

Several glossary examples rely only on the published catalog record they link to and use no external source: benchmark (HumanEval), evaluation-harness (LM Evaluation Harness), fine-tuning (Tülu 3.1 8B), hosted-api (OpenAI), inference (vLLM), maintainer (PyTorch), model-release (Olmo 3.1 32B Think), open-source-software (llama.cpp), quantization (AWQ), reviewed-date (gpt-oss-20b), self-hosting (Ollama), subsidiary (Red Hat), unknown (Gemma 4 31B), and weights (Pythia 12B).

## Computed tiers used in the explainer

These come from `computeTier()` in `lib/openness.ts`, run on 2026-10-01 against the validated content:

- gpt-oss-20b: Open-weight
- gemma-4-31b: Open-weight
- embeddinggemma-300m: Open-weight
- olmo-3-1025-7b: Open-stack
- llama-4-scout-17b-16e: Restricted weights

## Findings for editors (not fixed; outside this assignment)

1. **Gemma 4 license URL redirects.** `https://ai.google.dev/gemma/docs/gemma_4_license`, cited by `gemma-4-31b` (and probably the other Gemma 4 releases), now returns 301 to `https://ai.google.dev/gemma/apache_2`. That page contains the Apache License 2.0 text and is linked in the site navigation as "Gemma 4 license." The substance is unchanged, but the record URLs could be updated.
2. **Llama 4 AUP URL chain.** The license links `https://www.llama.com/llama4/use-policy`. That redirects (301) to `developer.meta.com/ai/llama4/use-policy/`, which redirects (302) to `dev.meta.ai/llama/llama4/use-policy/`. The record already cites the final URL.
3. **No release has a `system_openness_review`**, so no release currently carries Open system (reviewed). The explainer does not claim any release does.
4. **Olmo releases compute different tiers.** `olmo-3-1-32b-think` and `olmo-3-7b-instruct` compute Open-weight, while `olmo-3-1025-7b` computes Open-stack. The difference is that only the 7B base record has a v0.2 `training_data_information` assessment; the other two have only `legacy_training_data_information`. Readers may find this confusing. A v0.2 data-information review of those two records would resolve it.
5. **Gated with automatic approval vs manual approval.** `embeddinggemma-300m` records weights as public because the gate says requests are processed immediately, even though the HF API reports `gated: manual`. SAM 3.1 and Llama 4 are recorded as partial. This is consistent with the rubric ("approval" makes access partial), but the gate mode in the metadata and the gate text disagree. It may be worth re-checking.
6. **Cross-links.** The explainer links to `/glossary/`. The glossary intro links to `/learn/open-weight-vs-open-source/`, the route that `app/learn/open-weight-vs-open-source/page.tsx` (built by someone else) uses to render `learn-open-weight.mdx`. If that route changes, update this link.
