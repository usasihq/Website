# Verification log: r2-open-labs-b

Checked on 2026-09-29 against the cited sources.

- **How sources were read.**
  - Raw files were read with `curl -A "USASI-factcheck/0.2"`: Hugging Face READMEs, HF API model metadata (`gated`, `cardData`, base-model tags, safetensors parameter counts), GitHub READMEs and LICENSE files, and the arXiv HTML of the Zamba2-VL and Essential-Web papers.
  - Rendered pages were read with WebFetch.
  - The GitHub REST API hit its unauthenticated rate limit partway through. After that, the GPT4All releases, commits and repo pages were read with WebFetch. No token or personal identifier was sent in any request.
- **Validator.** `npx tsx scripts/validate.ts` reports 0 errors. There is 1 warning, and it is in `continue-extension.yml`, which belongs to another group.
- **Computed tiers after the edits.** Every model release in this batch is **open-weight**, and no tier changed:
  - zamba2-7b and zamba2-vl-7b
  - rnj-1-instruct and rnj-1-5-instruct
  - palmyra-mini and palmyra-mini-thinking-b
  - mochi-1-preview
  - nomic-embed-text-v2-moe and nomic-embed-text-v1-5
- **Why the Nomic Embed releases are not open-stack.** Both have training code `public`. Both have training_recipe `partial`, which keeps them below open-stack.
- **HF gating (`gated` field):**

  | Value | Repositories |
  | --- | --- |
  | `false` | Zamba2-VL-7B, rnj-1/-instruct/-1.5-instruct, palmyra-mini, palmyra-mini-thinking-b, mochi-1-preview, nomic-embed-text-v1.5, nomic-embed-text-v2-moe |
  | `"auto"` | Zyphra/Zamba2-7B |
  | `"manual"` | Writer/Palmyra-X-4.3-73B (no release record; mentioned in the palmyra family) |

## Editorial-rule removal

### essential-ai
- **`status_note`**
  - Before: a note saying that Ground Level AI (2026-06-20) reported that NVIDIA had hired Essential AI's founder and several team members for Nemotron, and that neither company had confirmed.
  - After: `null`.
  - Reason: editorial rule. The claim rests only on news reporting of an unconfirmed event.
  - What I checked: Essential AI's homepage and about page (read today) say nothing about NVIDIA or any change of status. A web search found no NVIDIA or Essential AI statement confirming it.
- **`eligibility.explanation`**: removed the sentence "A June 2026 report that NVIDIA hired members of the team does not change the U.S. basis." Also removed `groundlevel-nvidia-eai` from its `source_ids`.
- **`sources`**: removed the now-uncited `groundlevel-nvidia-eai` entry (news).
- **Other files:** a repo-wide grep for "groundlevel", "acquihire" and "Essential AI's founder" found no other references.
- **Verified with no change:**
  - The San Francisco location (homepage, about page, Essential-Web paper affiliation).
  - The Rnj-1 and Rnj-1.5 Apache 2.0 licenses.
  - The Essential-Web ODC-By license.
  - The Together AI and OpenRouter links on the Rnj-1 card.
  - The research index (Rnj-1 in December 2025, Essential-Web in June 2025).
- **Note for editors:** the Ashby board `essentialai` currently lists 0 jobs, and the site footer still reads © 2025. These are not published; they are signals only.

## Zyphra

### zyphra (organization)
- **`eligibility.explanation`**
  - Before: "The about page mentions hiring in London as well".
  - After: "The about page describes the company as based in San Francisco and London".
  - Reason: the about page says Zyphra is "based in San Francisco and London". Source: zyphra-about.
  - The U.S. basis still rests on the terms and privacy policy (Zyphra Technologies, Inc., 415 Mission St, San Francisco) and the ZAYA1-8B post ("headquartered in San Francisco").
- **Verified:**
  - Terms of use (May 4, 2026) and privacy policy (Aug 20, 2026): company name, address, and California law with San Francisco County venue.
  - The PR Newswire dateline (San Francisco).
  - Cloud page: serverless inference for open-weight models, dedicated capacity, GPU clusters, and cloud.zyphra.com.
  - MAIA page: language, audio and vision; Gmail, Calendar and Drive integrations; no pricing shown.
  - Research index: Zamba from April 2024 to June 2026; ZAYA1 from November 24, 2025, described as trained end to end on AMD.
  - HF org: Zonos (text-to-speech), ZUNA, and the Zyda datasets.
  - The Ashby board lists 14 roles, all in San Francisco.

### zamba (family)
- **`provenance.text`**
  - Before: "The Zamba language models use the Mistral v0.1 tokenizer and were pretrained…"
  - After: "The Zamba language models were pretrained by Zyphra on open web text and code, including its own Zyda dataset; the Zamba2 models use the Mistral v0.1 tokenizer."
  - Reason: the cited HF Transformers doc supports the tokenizer claim only for Zamba2. The Zamba-7B-v1 card also says Mistral v0.1, but it is not cited.
- **Verified:**
  - The Zyda card: ODC-BY; seven component datasets; an early version was used for Zamba phase 1.
  - Release dates.
  - Qwen2.5-VL encoder attribution. The HF Qwen org page says Qwen is "built by Alibaba Cloud".

### zamba2-7b
- **`availability`: added the gating mode.**
  - The access conditions now also say the HF metadata lists gating as automatic approval, under which access is granted as soon as the request is sent.
  - Sources added: `zamba2-7b-hf-api` (https://huggingface.co/api/models/Zyphra/Zamba2-7B, `gated: "auto"`) and `hf-gated-docs` (HF Hub gated-models documentation).
- **`checklist.weights.note`**: now notes that approval is automatic, citing the same sources.
- **Status kept as `public`.** Per the brief, a simple click-through contact-information form is `public` with the access conditions stated; `partial` would apply only if access required approval.
- **Verified:**
  - Card:
    - Apache 2.0.
    - Architecture (Mamba2, two shared attention blocks, LoRA projectors).
    - "fits on the majority of consumer hardware".
    - The mamba-ssm 2.1.0 and causal-conv1d quick start in bf16 on CUDA, and the warning against running without the kernels.
    - "not fine-tuned for instruction following or chat", with no moderation.
  - Announcement:
    - October 14, 2024.
    - Internal framework "developed atop Megatron-LM".
    - The Zamba2-7B-Instruct and pure-PyTorch GitHub links.
  - HF docs: Transformers 4.48.0 or later.
  - Zamba2 LICENSE: Apache-2.0.
- **Discrepancy, unchanged:** the card says 2T pretraining tokens, while the announcement says a 3T-token dataset. The record avoids token counts.
- **For the editor:** the Zamba2 GitHub README documents only Zamba2-2.7B. The repo description says "models from the Zamba2 series", and the 7B announcement links it as the PyTorch implementation.

### zamba2-vl-7b
- **`useful_for.text`**
  - Before: "…generalist model for on-device use, covering visual question answering, OCR, document understanding, and multimodal reasoning."
  - After: "…generalist model for on-device applications and reports results on visual question answering, OCR, chart and document understanding, and multimodal reasoning benchmarks."
  - Reason: the card's prose says only "ideal generalist model for on-device applications". The task areas come from its evaluation table.
- **`provenance.derived_from` (Qwen2.5-VL encoder note):** added that the model card and technical report do not say which Qwen2.5-VL checkpoint supplied the encoder.
  - This is a provenance and licensing gap. Qwen2.5-VL checkpoints carry different licenses: HF metadata shows Qwen2.5-VL-7B-Instruct as `apache-2.0` and Qwen2.5-VL-3B-Instruct as `qwen-research`.
  - For that reason I did not assert the encoder's license or any mismatch.
- **Verified:**
  - Card:
    - Apache-2.0 metadata.
    - base_model Zamba2-7B.
    - Mistral v0.1 tokenizer.
    - Fork of Transformers 4.57.1, plus qwen-vl-utils, flash_attn, and the mamba and causal-conv1d forks.
    - bf16 with FlashAttention 2, and the warning about running without the kernels.
    - A VLMEvalKit-based harness that is not linked.
  - HF safetensors metadata: 8.03B parameters, which supports "about 8B".
  - Report (arXiv 2606.00390v1, May 29, 2026):
    - Affiliation "Zyphra, San Francisco, CA".
    - Three stages: adapter-only alignment with the encoder and LLM frozen, full pretraining, then SFT.
    - Named datasets: LLaVA-ReCap-558K, FineVision, PixMo, The Cauldron, DocMatix.
    - Document and OCR data upsampled.
    - Only checkpoints and inference code are released.
  - Blog: June 2, 2026; Apache 2.0; constant-size recurrent state, which lowers TTFT.
  - The fork's LICENSE is Apache-2.0.

## Essential AI artifacts

### rnj (family): verified, no changes
- The Rnj-1 card: 8B dense, trained from scratch, "similar to Gemma 3" with global attention only and YaRN, "deliberately kept post-training limited".
- The Rnj-1.5 card: 32K → 160K context and a block-local/global attention pattern.
- The blog is dated December 5, 2025.

### rnj-1-instruct
- **`run_notes[0].text`**
  - Before: "recommends temperatures between 0 and 0.6 and a system prompt, because the model tends to write code…"
  - After: "recommends always using a system prompt and temperatures from 0 to 0.2, and warns that without them the model can truncate outputs or write code for non-code tasks."
  - Reason: the cited rnj-1-instruct card (updated December 20, 2025) says "temperatures in the range [0, 0.2]".
  - For the editor: the separate rnj-1 base card still says [0, 0.6].
- **Verified:**
  - 8.3B total parameters (card table).
  - Token budgets: 8.4T at 8K, 380B mid-training to 32K, 150B SFT.
  - Muon and WSD schedule, and batch sizes.
  - Transformers 4.51.2 or later, vLLM with the hermes parser, SGLang, and GGUF.
  - "not optimized for factual recovery".
  - Apache 2.0.
- **evaluation_materials `public` kept.** The rnj-1-instruct-evals dataset contains the input prompts, the model predictions, and the scores for each benchmark. That meets "prompts that let others re-run".

### rnj-1-5-instruct: verified, no changes
- The card:
  - base_model is EssentialAI/rnj-1.
  - Attention-layer pattern.
  - olmOCR 2 science PDFs and repository-level code with FIM.
  - Synthetic long-context tasks.
  - About 600k trajectories from three teacher models it does not name.
  - vLLM v0.20.0 and Triton.
  - "optimized … for long-context comprehension and not long-context generation".
  - Apache 2.0, linked to the rnj-1-instruct LICENSE.
  - Citation year 2026.

### essential-web: verified, no changes
- **Dataset card:**
  - 24T tokens and 23.6B documents.
  - Snapshots: 89 from the DCLM pool plus 12 more, 101 in total.
  - Pipeline: dedup, MinHash, RPv2 signals, and the DCLM fastText classifier.
  - "EAI-Taxonomy-0.5b" labeling model.
  - ODC-By plus Common Crawl terms, with "We do not alter the license of any of the underlying data".
  - Math, code, medical and STEM subsets.
- **Paper:**
  - "twelve-category taxonomy covering topic, format, content complexity, and quality".
  - EAI-Distill-0.5b was fine-tuned from Qwen2.5-0.5B-Instruct with Qwen2.5-32B-Instruct as teacher; the eai-distill card confirms this.
  - The student is weaker on Extraction Artifacts, Missing Content and Education Level.
  - There is no limitations section: only "Broader impact" and "Possible next steps".

## Writer

### writer (organization): verified, no changes
- Company page: HQ at 111 Maiden Ln, San Francisco; founded 2020; offices in NY, London, Chicago and Austin.
- PSA (August 5, 2026): Writer, Inc., same address, California law.
- Models page: X6 is the default; administrators can enable Anthropic, Google and others.
- Developer docs:
  - X6, X5 and X4 via an API key.
  - A free account is suggested for getting started.
  - X5 and X4 are to be retired December 14, 2026, and Med, Fin, Creative and Vision are deprecated. This is not recorded; an editor may want to add it.
- The OML (May 31, 2024) is non-commercial unless a separate license is obtained.
- The HF org listing (29 models) matches the openness summary.

### palmyra (family)
- **`availability.access_conditions`**
  - Before: "Palmyra-X-4.3-73B can be downloaded only after agreeing to the Writer Open Model License and sharing contact information."
  - After: the same, plus "the repository is set to manual approval, so Writer reviews each request."
  - Sources added: `palmyra-x43-hf-api` (`gated: "manual"`) and `hf-gated-docs`.
- **`useful_for.text`**
  - Before: "…research and development on math, coding, and reasoning tasks."
  - After: "…research and development, particularly on tasks that need mathematical and logical reasoning."
  - Reason: this matches the cited palmyra-mini card. Coding is not in that card's intended use.
- **Verified:**
  - The Qwen2.5-1.5B base for palmyra-mini and thinking-a.
  - The OpenReasoning-Nemotron-1.5B base for thinking-b.
  - Palmyra-Med-70B-32K "builds upon" Palmyra-Med-70B, under the OML.
  - The Fin card says "Writer open model license".

### palmyra-mini: verified, no changes
- The card:
  - base_model is Qwen/Qwen2.5-1.5B.
  - Apache-2.0.
  - 1.7B parameters and 131,072 context.
  - Intended for R&D in mathematical and logical reasoning.
  - Transformers and vLLM.
- The base model is also Apache-2.0 (HF metadata), so there is no license mismatch.
- The engineering post (September 19, 2025) describes running it locally on an iPhone with llama.cpp.

### palmyra-mini-thinking-b
- **`license_notes.text`: narrowed and made the mismatch explicit.**
  - Writer's card lists Apache 2.0 and does not mention the base model's license.
  - NVIDIA's card says CC-BY-4.0 governs the base model, and links an Apache 2.0 license from a Qwen repository as "additional information".
  - The old text had said this was "for the underlying Qwen model", which the card does not say.
  - The note now states that the two licenses differ and that Writer's card does not explain how the CC-BY-4.0 terms apply.
- **Verified:**
  - Writer's card: "Finetuned from model: nvidia/OpenReasoning-Nemotron-1.5B"; lm_eval, lighteval and nemoskills.
  - Blog (September 11, 2025): chain-of-thought training and "RL fine tuning" for thinking-b; aimed at math.
  - NVIDIA's card: derived from Qwen2.5-1.5B; responses generated by DeepSeek-R1-0528.
- **Open item:** parameter count. The card and HF metadata give 1.7B (1.78B), while Writer's engineering post says 1.5B. The record states no count.

## Genmo

### genmo (organization)
- **`summary.source_ids`**: added `genmo-terms`, because the "San Francisco" in the summary was not supported by the pages cited for it.
- **`eligibility.explanation`**
  - Before: "under California law with San Francisco County venue."
  - After: "apply California law, with San Francisco County courts as the venue where arbitration does not apply."
  - Reason: the terms (September 16, 2024) make binding AAA arbitration the primary route. The court venue applies only if arbitration is unenforceable or the user opts out.
- **Verified:**
  - The address: 2261 Market St STE 5329, SF.
  - The Ashby board: 5 roles, all "San Francisco HQ".
  - The footer: "© Genmo, Inc 2026".
  - The about page: "research lab … world models".
  - The playground: titled "Mochi 1.1 Playground", login required, no pricing.
  - HF: the only model is mochi-1-preview.
  - The blog has only the Mochi 1 post.

### mochi (family), mochi-1-preview: verified, no changes
- **Blog (October 22, 2024):**
  - 10B parameters, AsymmDiT, a single T5-XXL, 480p.
  - "Mochi 1 HD coming later this year".
  - Apache 2.0 "for personal and commercial use".
  - "Trained entirely from scratch".
  - No description of the training data.
- **README:**
  - AsymmVAE with 362M parameters.
  - LoRA trainer added November 26, 2024.
  - About 60GB VRAM on a single GPU, with at least one H100 recommended.
  - The NSFW/safety caution.
  - Limitations: photorealistic styles, warping, and 480p.
  - Magnet link.
- **LICENSE:** Apache-2.0.
- **Diffusers docs:**
  - google/t5-v1_1-xxl.
  - The original implementation runs the text encoder and VAE in fp32 and the DiT in bf16.
  - 42GB full precision and 22GB for the bf16 variant, both with CPU offload and VAE tiling.
  - 8-bit bitsandbytes.
  - Two 24GB GPUs.

## Nomic

### nomic-ai (organization)
- **`summary.text` now uses Nomic's own wording.**
  - Before: "a New York City company that builds AI agents and APIs for architecture, engineering, and construction firms."
  - After: "a New York City company that offers what it calls a domain-specific AI platform for architecture, engineering, and construction firms, including agents and an Agent API."
  - Source: the nomic-home headline "The domain-specific AI platform for architecture, engineering, and construction firms". The homepage also names the Agent API.
- **`status_note.text`**
  - Before: "In November 2025 Nomic announced a rebuilt platform aimed at architecture, engineering, and construction (AEC) firms, and its website now presents the company in those terms."
  - After: "…announced a new Nomic Platform for what it calls the Built World industries (energy, engineering, architecture, and construction). Its homepage now presents Nomic as 'the domain-specific AI platform for architecture, engineering, and construction firms'."
  - Reason: the announcement ("Announcing a new Nomic Platform", November 3, 2025) never says "rebuilt" or "pivot". It frames the platform around "Built World industries" with a focus on "Energy, Engineering, Architecture and Construction".
- **`openness_summary.text`**
  - Before: "Nomic has published Nomic Embed model weights under Apache 2.0".
  - After: "Nomic Embed text model weights, including nomic-embed-text-v1.5 and nomic-embed-text-v2-moe, under Apache 2.0".
  - Reason: not every Nomic Embed release carries Apache 2.0. The HF metadata for nomic-embed-multimodal-3b and colnomic-embed-multimodal-3b has no license tag, and their base, Qwen2.5-VL-3B-Instruct, is `qwen-research`.
- **Verified:**
  - Careers: "headquarters in New York City".
  - Terms (April 20, 2026): "Nomic, Inc., a Delaware corporation", Delaware law.
  - Platform page: drawing and submittal review, code compliance, RFI research, project search, a free tier at app.nomic.ai, paid plans and demos.
  - Developer page: Parse, Extract, Embed and Datasets APIs.
  - Atlas embedding docs: v1, v1.5 and gte-multilingual-base, with four task types.
  - Research page: every item listed in notable_facts.
  - News page: no Nomic Embed post after April 2, 2025; the v2 release has no news post.
  - The September 3, 2026 post does not mention GPT4All or Nomic Embed.

### nomic-embed (family)
- **`summary.source_ids`**: added `nomic-embed-v2-paper` (arXiv 2502.07972, submitted February 11, 2025) as a new source.
  - Reason: the family summary dates v2-moe to February 2025, but none of the cited sources carried that date. The v2 card is undated, and the news page does not list v2.
- **Verified:**
  - v1: February 1, 2024; 8,192 context; Apache-2; data and code released; nomic-bert-2048.
  - v1.5: February 14, 2024.
  - Vision: June 5, 2024 (news page).
  - Code: March 27, 2025. The HF metadata gives the base as Qwen2.5-Coder-7B-Instruct, which is Apache-2.0.
  - Multimodal: April 2, 2025, starting from "Qwen2.5-VL 3B Instruct".
- **Note for editors, not recorded:** the Nomic Embed Multimodal 3B models build on Qwen2.5-VL-3B-Instruct, whose HF license is `qwen-research`, and Nomic's 3B repos carry no license tag. This matters if a release record for them is added later.

### nomic-embed-text-v2-moe: verified, no changes
- **Card:**
  - 475M total and 305M active parameters; 8 experts with top-2 routing.
  - About 100 languages.
  - Embeddings of 768 dimensions, truncatable to 256; 512-token maximum input.
  - Task prefixes.
  - megablocks fork and trust_remote_code.
  - 1.6B training pairs, with the data "released" per the card.
  - Recipe summary.
  - Apache-2.0.
- **arXiv:** "open-source all code, models, and evaluation data".
- **contrastors README:** documents access only to the v1 dataset, which needs an Atlas account. That supports training_data `partial`.
- **nomic-xlm-2048 card:** XLM-R Base with RoPE, trained for 10k steps on CC100.
- **Willison post:** February 12, 2025; labeled news. It is used only for the release timing; the arXiv paper corroborates it.

### nomic-embed-text-v1-5
- **`summary.text`**
  - Before: "embeddings can be cut to any size from 64 to 768 dimensions".
  - After: "its 768-dimension embeddings can be shortened to as few as 64 dimensions".
  - Reason: the v1.5 post says "ranging from 64 to 768". The Atlas docs list the sizes 768, 512, 256, 128 and 64. "Any size" was overstated.
- **Verified:**
  - Task prefixes.
  - Layer-norm-then-truncate.
  - Dynamic RoPE scaling past 2,048 tokens.
  - trust_remote_code is unnecessary from Transformers 5.5.0 and Sentence Transformers 5.3.0.
  - "Training data … released in its entirety".
  - The contrastors repo and its Apache-2.0 LICENSE.

### gpt4all
- **`checklist.supported_platforms.note`**: added that the system requirements page says Windows and Linux PCs with ARM CPUs are not currently supported. That conflicts with the README's Windows ARM build.
  - The page was already cited, but the conflict was hidden.
- **Maintenance wording is factual.**
  - The latest release is v3.10.0 (February 25, 2025, marked "Latest").
  - The last commit to main was May 27, 2025 ("ci: update path-filtering orb to 1.3.0").
  - The repo is not archived.
  - Nothing speculative was added.
- **Verified:**
  - MIT license, "Copyright (c) 2023 Nomic, Inc.".
  - README:
    - "No API calls or GPUs required".
    - Installers for Windows, Windows ARM, macOS and Ubuntu.
    - Snapdragon and SQ1/SQ2; macOS 12.6 or later.
    - x86-64-only Linux.
    - Flathub is community maintained.
    - The Python client wraps llama.cpp.
    - The 2023 citation on GPT-3.5-Turbo distillation.
  - Docs sections: Desktop, LocalDocs, API Server and Python SDK.

## Could not verify / follow-ups for an editor
1. **Essential AI's operating status.** It cannot be confirmed from official sources. If NVIDIA or Essential AI later publishes a statement, a status_note could be restored with that official source.
2. **Zamba2-VL vision encoder.** Neither Zyphra source identifies which Qwen2.5-VL checkpoint's encoder was used, so any license inheritance is unresolved.
3. **Palmyra-mini-thinking-b.** The Apache-2.0 release sits on a CC-BY-4.0 base; this is recorded neutrally. It is a question for Writer, not something the catalog can resolve.
4. **Nomic Embed training_recipe.** Both releases keep `partial`. The technical reports (arXiv 2402.01613 for v1/v1.5 and 2502.07972 for v2) may document the recipe fully enough for `public`, which would move a release to open-stack. I did not read the v1 report in full, so I did not upgrade either.
5. **Writer retirements.** Palmyra X5/X4 are to be retired December 14, 2026, per the developer docs. This is not yet reflected; consider it at the next review.
