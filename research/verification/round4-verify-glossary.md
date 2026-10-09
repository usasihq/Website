# Verification: round-4 glossary additions (label: round4-verify-glossary, 2026-10-08)

File checked: `content/pages/glossary.mdx`, the 35 entries added today (writer's notes: `research/notes/round4-glossary.md`). The 34 older entries were not changed. `git diff` against HEAD still shows additions only.

Method: I fetched every external source today with curl (User-Agent `USASI-factcheck/0.3`), converted it to text, and compared each factual sentence with the passage it relies on. No personal data was sent in any request, and the Browser pane was not used. For each Example, I compared the text with the record's YAML (`publication_status: published`), and with the model card or README where the Example goes beyond the YAML. I checked each "In this catalog" paragraph by searching the published records' summary, useful_for, provenance, run_notes, and checklist notes for the term, and against `content/pages/methodology.mdx` and `content/hubs/*.yml`.

## Entries checked (35)

agent, attention, base-model, c2pa, diffusion-model, distillation, embedding, function-calling, gpu, hallucination, hbm, instruction-tuning, jailbreak, knowledge-cutoff, latency-and-throughput, mcp, multimodal, parameter, post-training, preference-tuning, pretraining, prompt, prompt-injection, reasoning-model, red-teaming, rag, temperature, synthetic-data, system-card, system-prompt, token, tpu, transformer, vector-database, watermark.

### Structural checks
- **Order.** All 69 headings are in alphabetical order by term, ignoring case and punctuation. "Content credentials (C2PA)" is filed under C and "Sampling temperature" under S.
- **Headings and ids.** Every entry uses `<h2 id="...">`, and the ids are unique. The first paragraph after each heading is one plain paragraph, so `parseGlossary` extracts it cleanly. `parseGlossary` returns 69 terms for 69 headings.
- **External links.** All 36 return HTTP 200 and lead to the page described. The two replacement C2PA 2.4 URLs also return 200.
- **Internal links.**
  - Every `/open/` and `/companies/` target exists and is published.
  - `/hubs/agents/` and `/hubs/chips-and-compute/` are published.
  - `/learn/ai-content-provenance/`, `/learn/how-models-use-tools/`, `/learn/safety-testing-and-frameworks/`, and `/learn/retrieval-augmented-generation/` exist on disk and are registered in `lib/learn.ts`.
  - Every `/glossary/#` anchor exists.
  - The `/methodology/#families`, `#sources`, `#tiers`, and `#openness` anchors exist.
- **Tone.** No promotional language. The one superlative-like word is "predominant" in the transformer entry. It is NIST's own wording in the GPT glossary entry of AI 100-2 E2025 and is attributed to NIST, so I left it.
- **Build checks.** The MDX compiles with the brief's `@mdx-js/mdx` command. `npx vitest run tests/unit/reference.test.ts` passes (3/3).

### Claims confirmed against sources (no change needed)
- **Agent:** Anthropic, "Building effective agents" (workflows use predefined code paths; agents dynamically direct their own processes and tool usage; stopping conditions). goose README and record.
- **Attention:** Vaswani et al., PDF §3.2 (query, key-value pairs, weighted sum, compatibility function) and the self-attention definition. Rnj-1.5 card: block-local layers carry "fixed compute and storage cost per position", global layers are lumped in the middle, and the change eases costs that grow with sequence length.
- **Base model:** HF chat-templating guide ("pre-training" on a huge corpus creates a "base" model, often fine-tuned for chat). StarCoder2-15B card ("not an instruction model", the quoted square-root example).
- **C2PA:**
  - The explainer says Content Credentials do not judge whether provenance is "true", only whether it is well-formed, free from tampering, and signed by a party on a trust list.
  - The manifest is "commonly embedded directly within the asset".
  - AI/ML actions are identified through digitalSourceType.
  - Soft bindings (watermarks or fingerprints) let a removed credential be found again, which supports the watermark entry's cross-reference.
- **Diffusion model:** Ho et al. abstract and §2 (forward process gradually adds Gaussian noise; image synthesis). Diffusers README (pretrained diffusion models for images, audio, and more; "Interchangeable noise schedulers for different diffusion speeds and output quality").
- **Distillation:** Hinton et al., abstract and §1 ("soft targets", ensembles). Muse Glimmer card ("distilled from Muse Spark ... agentic tasks on consumer hardware"), consistent with the record's training_recipe note.
- **Embedding:** Anthropic embeddings guide ("numerical representations of text that enable measuring semantic similarity"; search and recommendations). nomic-embed-text-v1.5 card (task prefix required; `search_document` and `search_query`) and record (768 dimensions, shortenable to 64).
- **Function calling:** Anthropic tool-use overview ("Claude determines when to call a tool based on the user's request and the tool's description"; structured call; client and server tools). BFCL README (v1 "Simple, Parallel, and Multiple Function Call eval with AST"; v3 multi-turn and multi-step; V4 agentic).
- **GPU:** CUDA Programming Guide §1.1 (born as a processor for 3D graphics; thousands of threads; trades single-thread performance for total throughput). AMD ROCm page ("programming models, tools, compilers, libraries, and runtimes for AI and HPC ... on AMD GPUs") and the AMD record.
- **Hallucination:**
  - NIST AI 600-1 §2.2: confabulation is erroneous or false content presented confidently, including output that diverges from the input or contradicts earlier statements. It is a natural result of approximating the statistical distribution of training data.
  - Kalai et al. abstract: training and evaluation reward guessing over acknowledging uncertainty.
  - HLE paper (arXiv HTML): models are asked for a confidence from 0% to 100%, and confidently wrong answers are described as "indicative of confabulation/hallucination".
- **HBM:** Micron HBM page (3D-stacked DRAM for AI, HPC, and data-intensive workloads; a single Micron HBM cube has a 1024-bit interface, "16 times wider" than a DDR5 module; HBM4 and HBM3E listed). Google Cloud TPU intro (on-chip HBM allows larger models and batch sizes). The chips-and-compute hub covers memory makers, including Micron.
- **Instruction tuning:** Wei et al. abstract. MedGemma model card v1 (-pt and -it suffixes; "Both MedGemma 27B variants are only available in instruction-tuned versions").
- **Jailbreak:** NIST AI 100-2 E2025 glossary (jailbreak is a direct prompting attack to circumvent restrictions on model outputs). §3.3 says direct prompting attacks come from the primary user. AILuminate Jailbreak page (T2T and T+I2T inputs; the Resilience Gap metric captures how performance degrades under attack).
- **Knowledge cutoff:** Anthropic Transparency Hub ("most extensive and reliable" up to the cutoff date). Models overview ("Reliable knowledge cutoff" and a separate "Training data cutoff"). gpt-oss model card PDF ("knowledge cutoff of June 2024").
- **Latency and throughput:** NVIDIA NIM metrics page (TTFT and ITL; total TPS rises until GPU compute saturates while TPS per user falls; "compare results only when definitions align"). SGLang docs ("low-latency and high-throughput inference ... from a single GPU to large distributed clusters").
- **MCP:** Specification 2026-07-28 overview (JSON-RPC 2.0 between hosts, clients, and servers; resources, prompts, and tools as quoted). modelcontextprotocol repo README (specification, schema defined in TypeScript and also made available as JSON Schema, documentation). MCP blog, Dec 9, 2025 (donation to AAIF under the Linux Foundation).
- **Multimodal:** GPT-4o System Card abstract (any combination of text, audio, image, and video in; text, audio, and image out; same neural network). Molmo2-O-7B card ("image, video and multi-image understanding and grounding").
- **Parameter:** PyTorch "Build the Neural Network" (weights and biases optimized during training; `parameters()` and `named_parameters()`; last updated Aug 25, 2026). EmbeddingGemma:
  - Google's page says EmbeddingGemma 1 is "a 308M parameter" model.
  - The HF README, read publicly via `/resolve/main/README.md`, says "a 300M parameter" model.
  - The HF API safetensors total of 302,863,104 is shown as 0.3B.
- **Post-training:** Tülu 3 abstract (refine behaviors and unlock new skills; SFT, DPO, RLVR). Olmo-3-7B-Instruct card (stage table linking base, SFT, DPO, and final RLVR checkpoints).
- **Preference tuning:** Ouyang et al. abstract (rankings of model outputs, then RL from human feedback). Rafailov et al. abstract ("only a simple classification loss"). TRL README (SFTTrainer, GRPOTrainer, DPOTrainer, KTOTrainer).
- **Pretraining:** Anthropic glossary (pretrained models "are not inherently good at answering questions or following instructions"; fine-tuning and RLHF refine them). NIST pre-training glossary entry. Dolma card ("web content, academic publications, code, books, and encyclopedic materials"; v1.7 used for OLMo 7B-v1.7).
- **Prompt:** OpenAI prompt-engineering guide ("non-deterministic ... a mix of art and science"). DSPy README.
- **Prompt injection:** NIST AI 100-2 glossary (concatenation of untrusted input with a prompt built by a higher-trust party; indirect injection works through resource control). OWASP LLM01:2025 ("unclear if there are fool-proof methods of prevention"). The how-models-use-tools "Risks and controls" section covers least privilege and human approval.
- **Reasoning model:** OpenAI reasoning guide (reasoning tokens break down the prompt and consider multiple approaches; not visible via the API but occupy context-window space). Hermes-4-70B card (hybrid mode; `thinking=True` flag or a system prompt).
- **Red teaming:** NIST AI 100-2 glossary definition, quoted accurately. safe.ai research page ("HarmBench: A Standardized Evaluation Framework for Automated Red Teaming and Robust Refusal") and the CAIS record's notable fact.
- **RAG:** Lewis et al. abstract. NIST glossary (lets a model's knowledge be modified without retraining). PaperQA README (PDFs, text, Office documents, and source code; in-text citations).
- **Temperature:** HF generation docs (default 1.0 if not set in generation_config.json). Anthropic glossary (even at 0, results are not fully deterministic). Gemma-4-12B-it card (`temperature=1.0`, `top_p=0.95`, `top_k=64`).
- **Synthetic data:** Phi-4 report abstract and HTML (Microsoft Research; organic data such as web content or code; multi-agent prompting, self-revision workflows, instruction reversal). Common Crawl Nemotron-CC page (6.3T = 4.4T original + 1.9T synthetic). arXiv 2412.02595v2 Limitations ("did not verify the factual accuracy or fidelity").
- **System card:** Anthropic system-cards page ("capabilities, safety evaluations, and responsible deployment decisions"). GPT-4o System Card abstract (capabilities, limitations, safety evaluations; "third-party assessments"). The safety-testing explainer has a "What a system card contains" section.
- **System prompt:** NIST AI 100-2 glossary (application-specific, typically prepended, may be higher-trust). Messages API (top-level `system` parameter; no "system" role). Rnj-1-instruct card ("always" add a system prompt; strong inclination to write code, "especially true ... if the system prompt is omitted").
- **Token:** Anthropic glossary (words, subwords, characters, or bytes; about 3.5 English characters per token for Claude; varies by language). FineWeb card (more than 18.5T tokens; counts use the gpt2 tokenizer).
- **TPU:** Cloud TPU intro (ASICs; large matrix operations; on-chip HBM; slices; XLA; last updated 2026-10-07). TPU7x page ("first release within the Ironwood family, Google Cloud's seventh generation TPU"). The Google record notes TPUs alongside GPUs for Cloud customers.
- **Transformer:** Vaswani et al. (machine translation; no recurrence). NIST GPT glossary entry ("current predominant architecture for large language models"). Transformer Explainer README (live GPT-2 in the browser).
- **Vector database:** Faiss README (L2 distances or dot products; compressed methods give less precise search but scale to billions of vectors in memory). Chroma docs introduction (dense, sparse, and hybrid search; keyword and regex search; metadata filtering; self-hosted or cloud).
- **Watermark:** Google SynthID Text docs (imperceptible watermarks; detectors score the likelihood of watermarking; confidence "greatly reduced" after thorough rewriting or translation). SynthID Bio README and record.

## Changes made (11 edits in 9 entries, all in `content/pages/glossary.mdx`)

1. **c2pa, definition (spec link).** The link went to the superseded version 2.3. Version 2.4 (April 2026) is current: its version history lists "2.4 - April 2026", 2.5 returns 404, and the round-4 provenance explainer already cites 2.4.
   - Before: `.../specifications/2.3/specs/C2PA_Specification.html`
   - After: `.../specifications/2.4/specs/C2PA_Specification.html`
2. **c2pa, definition (explainer link).** The 2.4 explainer contains the same "do not provide value judgments about whether a given set of provenance data is 'true'" passage.
   - Before: `.../2.3/explainer/Explainer.html`
   - After: `.../2.4/explainer/Explainer.html`
3. **c2pa, Example.** The explainer's title mentions labels, but its body does not cover labels. Its sections cover content credentials, inspecting a file, watermarks, text, and detectors (source: `content/pages/learn-ai-content-provenance.mdx` section headings).
   - Before: "covers labels, watermarks, and content credentials."
   - After: "covers what content credentials record, how to inspect a file for them, invisible watermarks, and what AI detectors can and cannot do."
4. **distillation, In this catalog.** Published model records note distillation in provenance as often as in training_recipe. For example, phi-4-mini-flash-reasoning, apriel, and cogito have it in provenance only.
   - Before: "the release's training-recipe note records it."
   - After: "the release's provenance or training-recipe note records it."
5. **function-calling, In this catalog.** In 27 of 29 model records that mention function or tool calling, it appears in `useful_for` ("What it is useful for"), not in the summary or run notes. Tool-call parsers are recorded in run notes (olmo-3-7b-instruct) or inference_code checklist notes (hermes-4-70b, rnj-1-instruct).
   - Before: "the release's summary or run notes say so, including any parser or chat format the card requires."
   - After: "the release's "What it is useful for" section says so, and its run notes or checklist notes record any tool-call parser or chat format the card requires."
6. **preference-tuning, In this catalog.** DPO and RLHF stages appear in provenance (7 records), training_recipe (5), and summary (4).
   - Before: "described in the training-recipe notes of releases that document them"
   - After: "described in the summary, provenance, or training-recipe notes of releases that document them"
7. **prompt, In this catalog.** Most prompt-format requirements are in run notes (11 records). The nomic-embed prefix requirement is in `useful_for`, and the Granite chat-template notes are in inference_code notes.
   - Before: "the release's run notes say so."
   - After: "the release's run notes usually say so."
8. **prompt-injection, In this catalog.** The agents hub's scope covers agent software, not retrieval systems (`content/hubs/agents.yml` scope).
   - Before: "retrieval systems that read outside content, which are gathered in the agents hub."
   - After: "retrieval systems that read outside content; agent software is gathered in the agents hub."
9. **synthetic-data, In this catalog.** The models used to generate synthetic data are often recorded in provenance. Nemotron-CC, Rnj-1.5, and the Nemotron 3 models are examples.
   - Before: "training-data notes say when ..."
   - After: "training-data and provenance notes say when ..."
10. **synthetic-data, Example.** The record says 6.3T describes the original December 2024 release, while v2 and v2.1 add more data. Sources: the record's summary and the Common Crawl Nemotron-CC page.
    - Before: "NVIDIA's Nemotron-CC pretraining dataset has 6.3 trillion tokens"
    - After: "The original release of NVIDIA's Nemotron-CC pretraining dataset has 6.3 trillion tokens"
11. **watermark, definition.** SynthID marks content from Google's AI tools generally, not one model (SynthID docs; Gemini help page as cited in the provenance explainer).
    - Before: "to estimate whether the content came from a particular model."
    - After: "to estimate whether the content came from a particular model or service."

## Unverifiable or for the editor

- **Google's EmbeddingGemma page.** It now presents EmbeddingGemma 2 (740M) as current and describes the 308M model under "Previous Versions" as EmbeddingGemma 1. The parameter Example is still accurate. The EmbeddingGemma 300M record may need a note about the newer version; I left it alone because records are out of scope.
- **"predominant" in the transformer entry.** This is NIST's attributed wording. The editor may prefer to drop it under the no-superlatives rule.
- **OWASP LLM01:2025.** This is a nonprofit project page, not a government or vendor source. It supports only the "no fool-proof prevention" sentence, which matches the page exactly.
- **Muse Glimmer card byline.** The card's author line reads "Meta Superintelligence Lab" (singular). The glossary follows the record's "Meta Superintelligence Labs".
- **Takeaways.** The notes file has none for the glossary, so there was nothing to check there.
