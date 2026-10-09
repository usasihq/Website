# Round 4 glossary additions (label: round4-glossary, 2026-10-08)

File edited: `content/pages/glossary.mdx` only. 35 entries were added, so the page now has 69 instead of 34. The 34 existing entries are unchanged and stay in their original order. A diff against the pre-edit copy shows additions only. New entries were inserted alphabetically by term, ignoring case and punctuation. The existing Open* entries already use their own order, and no new term falls among them. The page has no Sources section. Sources are linked inline, as in the existing entries.

Each entry follows the existing format: an `<h2 id>` heading, a plain definition of 1 to 3 sentences that starts with a letter (as `parseGlossary` requires), an **In this catalog:** paragraph, and an **Example:** paragraph.

Checks run:
- The MDX compiles with `@mdx-js/mdx`.
- `tests/unit/reference.test.ts` passes. `parseGlossary` returns 69 terms for 69 headings.
- Ids are unique.
- Every `/open/` and `/companies/` link goes to a record with `publication_status: published`.
- Every `/glossary/#`, `/hubs/`, `/methodology/#`, and `/learn/` link exists, or is on the brief's list of round-4 explainers.
- No bare `<`, `>`, `{`, or `}` appears outside code spans.
- All 36 external URLs returned HTTP 200 today.

Requests were made with curl (User-Agent `USASI-catalog-research/0.3`), and no personal identifiers were sent. The Browser pane was not used. All sources below were read on 2026-10-08.

## Terms added

| Term | id | Definition sources (linked inline) | Example | Example checked against |
|---|---|---|---|---|
| Agent | `agent` | Anthropic, Building effective agents (Dec 19, 2024) | /open/goose/ | goose README |
| Attention | `attention` | Vaswani et al. 2017, arXiv 1706.03762 (abstract and PDF §3.2) | /open/rnj-1-5-instruct/ | EssentialAI/rnj-1.5-instruct model card |
| Base model | `base-model` | Hugging Face Transformers, Chat templates. Also read: Anthropic glossary (pretraining) | /open/starcoder2-15b/ | bigcode/starcoder2-15b model card ("not an instruction model") |
| Content credentials (C2PA) | `c2pa` | C2PA Specification 2.3 and C2PA Explainer 2.3. Also read: c2pa.org, contentcredentials.org | /learn/ai-content-provenance/ (no record fits) | lib/learn.ts note for that explainer |
| Diffusion model | `diffusion-model` | Ho et al. 2020, arXiv 2006.11239 (PDF §1–2). Also read: NIST AI 100-2 E2025 glossary | /open/diffusers/ | Diffusers README |
| Distillation | `distillation` | Hinton et al. 2015, arXiv 1503.02531 (PDF §1–2) | /open/muse-glimmer-30b/ | meta-models/Muse-Glimmer-30B model card |
| Embedding | `embedding` | Anthropic, Embeddings guide | /open/nomic-embed-text-v1-5/ | nomic-ai/nomic-embed-text-v1.5 model card |
| Function calling (tool calling) | `function-calling` | Anthropic, Tool use overview | /open/berkeley-function-calling-leaderboard/ | BFCL README (v1 AST; v3 multi-turn; V4 agentic) |
| GPU (graphics processing unit) | `gpu` | NVIDIA, CUDA Programming Guide v13.4.2 §1.1 | /companies/amd/ | AMD Instinct and ROCm product pages |
| Hallucination | `hallucination` | NIST AI 600-1 (July 2024) §2.2 Confabulation; Kalai et al. 2025, arXiv 2509.04664. Also read: Anthropic, Reduce hallucinations | /open/humanitys-last-exam/ | HLE paper (arXiv HTML) and lastexam.ai: calibration as a sign of confabulation/hallucination |
| High-bandwidth memory (HBM) | `hbm` | Micron HBM product page (FAQ); Google Cloud, Introduction to Cloud TPU | /companies/micron/ | Micron HBM product page |
| Instruction tuning | `instruction-tuning` | Wei et al. 2021, arXiv 2109.01652 | /open/medgemma-27b-it/ | Google MedGemma model card v1 (-pt/-it suffixes; 27B instruction-tuned only); HF API base_model gemma-3-27b-pt |
| Jailbreak | `jailbreak` | NIST AI 100-2 E2025 (March 2025) glossary and §3. Also read: Anthropic, Mitigate jailbreaks; OWASP LLM01 | /open/ailuminate/ | MLCommons AILuminate and AILuminate Jailbreak pages |
| Knowledge cutoff | `knowledge-cutoff` | Anthropic Transparency Hub; Anthropic models overview | /open/gpt-oss-120b/ | gpt-oss model card PDF ("knowledge cutoff of June 2024") |
| Latency and throughput | `latency-and-throughput` | NVIDIA NIM LLM benchmarking, Metrics. Also read: Anthropic glossary (latency, TTFT) | /open/sglang/ | docs.sglang.io ("low-latency and high-throughput inference") |
| Model Context Protocol (MCP) | `mcp` | MCP specification 2026-07-28. Also read: MCP intro | /open/model-context-protocol/ | modelcontextprotocol repo README; MCP blog, Dec 9, 2025 (donation to AAIF) |
| Multimodal model | `multimodal` | OpenAI, GPT-4o System Card, arXiv 2410.21276. Also read: NIST AI 100-2 glossary | /open/molmo2-o-7b/ | allenai/Molmo2-O-7B model card |
| Parameter (parameter count) | `parameter` | PyTorch, Build the Neural Network (updated Aug 25, 2026) | /open/embeddinggemma-300m/ | ai.google.dev EmbeddingGemma page (308M); HF card (300M; "0.3B params") |
| Post-training | `post-training` | Lambert et al., Tülu 3, arXiv 2411.15124 | /open/olmo-3-7b-instruct/ | allenai/Olmo-3-7B-Instruct model card (base Olmo-3-7B; SFT, DPO, RLVR checkpoints) |
| Preference tuning (RLHF and DPO) | `preference-tuning` | Ouyang et al. 2022, arXiv 2203.02155; Rafailov et al. 2023, arXiv 2305.18290. Also read: Anthropic glossary (RLHF) | /open/trl/ | TRL README |
| Pretraining | `pretraining` | Anthropic glossary. Also read: NIST AI 100-2 glossary (pre-training) | /open/dolma/ | allenai/dolma dataset card |
| Prompt | `prompt` | OpenAI, Prompt engineering guide | /open/dspy/ | DSPy README |
| Prompt injection | `prompt-injection` | NIST AI 100-2 E2025 glossary and §3.4; OWASP LLM01:2025 | /learn/how-models-use-tools/ (no record fits) | That explainer's "Risks and controls" section |
| Reasoning model | `reasoning-model` | OpenAI, Reasoning models guide. Also read: Anthropic extended thinking | /open/hermes-4-70b/ | NousResearch/Hermes-4-70B model card |
| Red teaming | `red-teaming` | NIST AI 100-2 E2025 glossary. Also read: NIST AI 600-1 | /companies/center-for-ai-safety/ | safe.ai research page (HarmBench title) |
| Retrieval-augmented generation (RAG) | `rag` | Lewis et al. 2020, arXiv 2005.11401; NIST AI 100-2 glossary. Also read: Anthropic glossary | /open/paper-qa/ | PaperQA README |
| Sampling temperature | `temperature` | Hugging Face Transformers, Generation (text_generation); Anthropic glossary. Also read: Anthropic Messages API (temperature) | /open/gemma-4-12b/ | google/gemma-4-12B-it model card (temperature 1.0, top_p 0.95, top_k 64) |
| Synthetic data | `synthetic-data` | Abdin et al., Phi-4 Technical Report, arXiv 2412.08905 (abstract and HTML) | /open/nemotron-cc/ | Common Crawl Nemotron-CC page; arXiv 2412.02595v2 Limitations |
| System card | `system-card` | Anthropic, Model system cards page; GPT-4o System Card | /learn/safety-testing-and-frameworks/ (no record fits) | That explainer's "What a system card contains" section |
| System prompt | `system-prompt` | NIST AI 100-2 glossary; Anthropic Messages API, create (system parameter) | /open/rnj-1-instruct/ | EssentialAI/rnj-1-instruct model card |
| Token | `token` | Anthropic glossary | /open/fineweb/ | HuggingFaceFW/fineweb dataset card ("more than 18.5T tokens"; gpt2 tokens) |
| TPU (tensor processing unit) | `tpu` | Google Cloud, Introduction to Cloud TPU (last updated 2026-10-07) | /companies/google/ | Google Cloud TPU7x (Ironwood) page |
| Transformer | `transformer` | Vaswani et al. 2017; NIST AI 100-2 glossary (GPT entry) | /open/transformer-explainer/ | Transformer Explainer README |
| Vector database | `vector-database` | Faiss README (GitHub). Also read: Chroma docs introduction | /open/chroma-db/ | Chroma docs introduction |
| Watermark (AI content) | `watermark` | Google, SynthID Text documentation (Responsible GenAI Toolkit). Also read: C2PA Explainer (soft bindings) | /open/synthid-bio/ | google-deepmind/synthidbio README |

## Skipped

No term from the suggested list was skipped. All 35 could be grounded in primary sources read today, and none were already on the page.

Sources tried but not used:
- JEDEC HBM4 standard page returned 403. It was not retried or bypassed. Micron's page was used instead.
- openai.com "Learning to reason with LLMs" returned 403. OpenAI's developer docs reasoning guide was used instead.

## Notes and uncertainties

- **Primary-source status.** The OWASP GenAI Security Project (LLM01:2025) is a nonprofit standards project, not a government or vendor source. It backs only one sentence, the one saying no fool-proof prevention is known. NIST AI 100-2 E2025 carries the definitions.
- **Superlative wording.** The transformer entry repeats NIST's own wording that GPT-style transformers are the "predominant" architecture for large language models. It is attributed to NIST.
- **"In this catalog" lines.** These describe current record content (run notes, training-recipe notes, provenance sections, hubs). For c2pa, prompt-injection, and system-card, no published record fits, so those Examples point to round-4 explainers. `ai-content-provenance` did not exist on disk at the time of writing. Its slug comes from the brief and lib/learn.ts.
- **Temperature on Claude.** Anthropic's Messages API reference marks `temperature` as deprecated for models released after Claude Opus 4.6. This is not in the entry. The entry cites only the glossary's statement on non-determinism.
- **Glossary-to-glossary links.** Some new entries link to other glossary anchors: accelerator, mixture-of-experts, tokenizer, model-card (existing) and c2pa (new). The brief's "link only these anchors" rule is meant for explainers. Within the glossary itself, links to the new c2pa anchor resolve.

## Self-check

Each new entry was re-read sentence by sentence against the fetched text. Corrections made during that pass:
- BFCL: AST evaluation is now attributed to the first version only, and later versions are described as adding multi-turn, multi-step, and agentic tasks.
- GPU: "repetitive calculations" became "highly parallel calculations", matching the CUDA guide.
- Hallucination: the paper is now cited by its authors rather than as "OpenAI researchers", because its affiliations were not checked.
- Pretraining: the causal "which is why" was replaced with the glossary's own wording.
- Hermes 4: the sentence now says "its model card says reasoning mode can be switched on".
- Faiss: "trade precision for speed" now reads "search precision for speed or memory", matching the README.
- Diffusion "In this catalog": narrowed from "images and video" after checking which published releases mention diffusion (video, multimodal generation, robot action heads, biomolecular structure).
