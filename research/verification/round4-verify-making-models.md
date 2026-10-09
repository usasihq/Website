# Verification log: round4-verify-making-models

Checked on 2026-10-08 under `research/VERIFIER_BRIEF_ROUND4.md` and `research/AGENT_BRIEF_ROUND4.md`.

**Files checked**
- `content/pages/learn-pretraining-and-post-training.mdx`
- `content/pages/learn-quantization.mdx`
- The six takeaways for both pages in `research/notes/round4-making-models.md`

**How sources were read**
- Every cited source was opened today with `curl -A "USASI-factcheck/0.3"`. Nothing was read through a browser.
- Raw files: Hugging Face model-card READMEs and the Hub API metadata (`cardData.license`, `base_model`, `gated`); the raw GitHub files for the Llama 3.1 LICENSE, the Llama 3.1 and Llama 2 MODEL_CARD.md, the llama.cpp quantize, imatrix and perplexity READMEs, the llm-awq README and the MLX README; the hub-docs, Transformers, TRL and bitsandbytes doc sources; and the Apache 2.0 text.
- Rendered pages were also fetched and converted to text locally. These were the Hugging Face docs pages (TRL SFT and DPO, bitsandbytes, Transformers quantization overview, GGUF, model cards), NVIDIA's Transformer Engine page, MLX `mlx.core.quantize`, and Ollama's context-length page.
- PDFs were read through `pdftotext`: the arXiv papers 2203.02155, 2305.18290, 2411.15124, 2512.13961, 2508.18255, 2508.10925, 2306.00978 and 2210.17323, plus the OCP MX v1.0 spec.
- No email address, name, or other identifier was sent in any request. No bot check, gate, or login was bypassed.

## Summary

- **Corrections:** 9 in total.
  - 4 in the pretraining page.
  - 4 in the quantization page.
  - 1 takeaway.
- **External links.** Every one returned HTTP 200 and is the page described.
  - The arXiv titles and dates match the papers.
  - The NVIDIA page title is "Using FP8 and FP4 with Transformer Engine" (v2.20.2).
- **Internal links** all resolve:
  - These records exist with `publication_status: published`: `hermes`, `hermes-4-70b`, `olmo`, `olmo-3-7b-instruct`, `tulu`, `llama`, `trl`, `llama-cpp`, `awq`, `mlx`, `gpt-oss-20b`, `nous-research`, and `ai2`.
  - Every `/learn/` slug is registered in `lib/learn.ts`.
  - The hub `local-ai` exists.
  - Every glossary anchor used exists as an `<h2 id>` in `content/pages/glossary.mdx`: weights, fine-tuning, checkpoint, model-card, license-scope, mixture-of-experts, gguf, quantization, and self-hosting.
- **Format.**
  - Both files compile with `@mdx-js/mdx` after the edits.
  - Both use `<h2 id>` headings, end with Sources, and have no Markdown tables.
  - Riley and Sam are labelled fictional.
  - The pretraining page keeps its "not legal advice" line.
  - Neither page has superlatives, prices, or counts of users or staff.
- **Word counts after the edits** (`wc -w`, whole file / body before Sources):
  - Pretraining page: 1,537 / 1,442.
  - Quantization page: 1,511 / 1,404.
  - Both bodies are within 1,000 to 1,500 words. Counted with Sources, both files are now slightly over 1,500 because of the license-precision edits. See the editor decisions.

## The points the writer flagged

1. **Hermes 4 report read as a PDF.**
   - Confirmed: `arxiv.org/html/2508.18255` returns 404, and the abstract page and PDF (v2, September 2, 2025) both work.
   - These claims match the report:
     - It began with "the 405B and 70B versions of Llama 3.1", and with the Qwen3 14B checkpoint for the 14B model.
     - The data is "primarily of newly synthesized" data, about 5 million samples.
     - Data was rejection-sampled against about a thousand task-specific verifiers.
     - Training was SFT, including a second SFT stage for the 14B model.
   - The token figures differ between the report (about 19 billion) and the card (about 60B). The page gives neither, which is correct.
2. **Meta's Llama-3.1-8B card on Hugging Face is gated.**
   - Confirmed: the Hub API reports `gated: "manual"`, and the raw README returns 401. I did not try to get past the gate.
   - Meta's own MODEL_CARD.md in `meta-llama/llama-models` on GitHub is a valid primary substitute. It supports these claims:
     - About 15 trillion tokens from publicly available sources.
     - The tuned versions use SFT and RLHF.
     - Pretrained and instruction-tuned models in 8B, 70B and 405B sizes.
     - The intended-use sentence.
3. **Transformer Engine FP8 page moved.**
   - Confirmed: the old `.../user-guide/examples/fp8_primer.html` URL returns 404, and the cited `.../examples/fp8_primer.html` returns 200.
   - The page states these, matching the explainer:
     - E4M3 is 1 sign, 4 exponent and 3 mantissa bits, up to ±448.
     - E5M2 reaches up to ±57,344 and has lower precision.
     - "H100 GPU introduced support for a new datatype, FP8".
4. **The Hermes-4-70B license field reads `llama3`.**
   - Confirmed in both the card YAML and the Hub API tag `license:llama3`.
   - The `base_model` is `meta-llama/Meta-Llama-3.1-70B`.
   - In Hugging Face's license list (`hub-docs/docs/hub/repositories-licenses.md`), `llama3` is the identifier for the **Llama 3** Community License Agreement. Llama 3.1 has its own identifier, `llama3.1`, which the Tülu 3.1 card uses.
   - On the page, the field had been placed right after "Post-training data can bring terms of its own," which suggested a reason the card does not give. I added the base model next to it (change P3). The page still does not interpret the field or judge whether the model complies.
5. **bitsandbytes' "without performance degradation".**
   - The docs say verbatim that LLM.int8() "enables large language model inference with only half the required memory and without any performance degradation."
   - The page attributes this to the documentation ("describes … as"), which is correct. It is the project's own claim, not a measured result.

## learn-pretraining-and-post-training.mdx

### Checked and accurate

- **InstructGPT.**
  - The objective is "predicting the next token on a webpage from the internet". The paper says this "is different from the objective 'follow the user's instructions helpfully and safely'."
  - The three steps: demonstrations from labelers; a reward model trained on comparisons to predict the preferred output; and PPO against that reward model.
  - "The last two steps are RLHF." The paper calls its whole method RLHF. The DPO abstract, cited in the next paragraph, defines RLHF as fitting a reward model and then fine-tuning with reinforcement learning. That supports the sentence, so it was left as written.
- **DPO.**
  - The paper calls RLHF "a complex and often unstable procedure".
  - DPO uses "only a simple classification loss", "eliminating the need for sampling from the LM during fine-tuning".
  - The authors are at Stanford University (and CZ Biohub).
- **TRL.**
  - The SFT conversational example ("What color is the sky?" / "It is blue.") matches.
  - So does the DPO record `{"prompt": "The sky is", "chosen": " blue.", "rejected": " green."}`. The docs label it the recommended "explicit prompt" form.
- **Olmo 3 report** (v2, April 14, 2026):
  - Pretraining for "up to 5.9T tokens", midtraining for 100 billion tokens, then a long-context extension.
  - "Every stage, checkpoint, data point, and dependency used to build it".
  - Think is trained "via SFT, DPO, and RLVR" to generate "a structured thinking trace before a final answer".
  - Instruct works "without generating internal thinking traces" and is "optimized for general chat and function calling".
- **Tülu 3 report.**
  - It introduces RLVR, which "replaces the reward model with a verification function".
  - The reward is "a constant reward value if a completion is successful".
  - The examples are math and precise instruction following.
  - The recipe is SFT, then DPO, then RLVR as the final stage.
  - It builds on Llama 3.1 base models.
- **Tülu 3.1 8B card.**
  - The stage table lists the base (`meta-llama/Llama-3.1-8B`), SFT, DPO, and final models.
  - `base_model` is `allenai/Llama-3.1-Tulu-3-8B-DPO`.
  - The card says "All Llama 3.1 Tülu3 models are released under Meta's Llama 3.1 Community License Agreement". It also says they are "subject to additional terms", the Gemma Terms of Use and the Qwen License Agreement, because the training mix included outputs of third-party models.
- **Olmo 3 cards.**
  - The 7B Instruct card links the base, SFT, DPO, and final RLVR models, and its `base_model` is `allenai/Olmo-3-7B-Instruct-DPO`.
  - The base card lists `stage1-stepXXX` revisions for pretraining checkpoints.
  - Both cards say "licensed under Apache 2.0", "intended for research and educational use in accordance with Ai2's Responsible Use Guidelines".
  - I also checked the Olmo-3-7B-Instruct-SFT card, the starting point in the worked example. It is Apache 2.0, and its `base_model` is `allenai/Olmo-3-1025-7B`. It lists no third-party terms, so the Olmo path in the worked example holds.
- **Llama 2 card.** "Our fine-tuned LLMs, called Llama-2-Chat, are optimized for dialogue use cases."
- **Hermes 4 70B card.**
  - `<think>…</think>` appears "when the model chooses to deliberate".
  - Reasoning mode is turned on with the chat-template flag `thinking=True` or a system prompt.
  - `base_model` is `meta-llama/Meta-Llama-3.1-70B`.
- **Hugging Face model card docs.**
  - `base_model` can be set for "a fine-tune, an adapter, or a quantized version", or for a merge.
  - The docs say "Users can also use this information to filter models by base model".
- **Apache 2.0 Section 4.** Conditions (a) to (c) and the clause on "additional or different license terms" for "Your modifications, or for any such Derivative Works as a whole, provided…" are paraphrased accurately.

### Changes

- **P1. Redistribution trigger.**
  - Before: "Anyone who distributes the Llama materials…"
  - After: "Anyone who distributes or makes available the Llama materials…"
  - Source: Llama 3.1 License §1.b.i, "If you distribute or make available the Llama Materials (or any derivative works thereof)…".
- **P2. Naming clause scope, plus the missing Notice requirement.**
  - Before: "Anyone who uses the materials or their outputs to train or fine-tune a model they distribute must…"
  - After: "Copies of the Llama materials must also carry Meta's attribution notice in a "Notice" text file. Anyone who uses the materials or their outputs to create, train, fine-tune, or otherwise improve an AI model that is distributed or made available must…"
  - Source: §1.b.i ("to create, train, fine tune, or otherwise improve an AI model, which is distributed or made available") and §1.b.iii (the "Notice" text file). The old wording narrowed both the trigger and the scope, and it left out a condition.
- **P3. Hermes license field.**
  - Before: "The Hermes 4 70B card lists `llama3` in its license field."
  - After: "…in its license field, although its `base_model` is Llama 3.1 70B."
  - Source: the Hermes-4-70B card YAML. This adds context only and makes no judgment.
- **P4. Worked example, step 3.**
  - Before: "(a copy of it, "Built with Llama," a name starting with "Llama," the acceptable use policy)"
  - After: "(a copy of it, the attribution notice, "Built with Llama," a name starting with "Llama," and the acceptable use policy)"
  - Source: Llama 3.1 License §1.b.iii. This keeps the list in step with P2.

## learn-quantization.mdx

### Arithmetic (recomputed)

- 2^4 = 16 and 2^16 = 65,536. ✔
- 8 billion weights × 32 / 16 / 8 / 4 bits ÷ 8 bits per byte = 32 / 16 / 8 / 4 GB. ✔
- Q4_K at 4.5 bits per weight (Hugging Face GGUF table): 8e9 × 4.5 / 8 = 4.5 GB. ✔
- MXFP4: 32 × 4 + 8 = 136 bits per 32 values = 4.25 bits. ✔
  - The MX spec table gives MXFP4 as FP4 (E2M1), 4 bits, block 32, with an E8M0 scale of 8 bits.
  - This matches the gpt-oss card's "4.25 bits per parameter".
- The quantize README for Llama 3.1 8B: F16 is 16.0005 bits per weight at 14.96 GiB; Q8_0 is 7.95 GiB; Q4_K_M is 4.8944 bits per weight at 4.58 GiB; Q4_K_S is 4.6672 bits per weight. ✔
- A GiB is 2^30 = 1,073,741,824 bytes, which is 7.37% more than 10^9. "About 7 percent" ✔
- "A quarter to a third":
  - 4-bit types against F16: IQ4_XS 4.17/14.96 = 0.28; Q4_K_S 0.29; IQ4_NL 0.29; Q4_K_M 0.31.
  - MXFP4 against 16-bit: 4.25/16 = 0.27.
  - All fall within 0.25 to 0.33. ✔
- Worked example:
  - 8e9 × 16 / 8 = 16 GB, about all of a 16 GB laptop. ✔
  - 8e9 × 4.9 / 8 = 4.9 GB, under 5 GB. ✔ The README's actual figure is 4.58 GiB, or 4.91 GB.

### Format names (checked)

- **FP8, E4M3 and E5M2:** NVIDIA Transformer Engine.
- **MXFP4 and E2M1:** the OCP MX v1.0 table; MLX also describes "E2M1 for fp4" with an E8M0 scale in its mx modes.
- **F16 and BF16:** the Hugging Face GGUF table ("16-bit standard IEEE 754 half-precision"; "16-bit shortened version of the 32-bit IEEE 754 single-precision").
- **Q4_K, Q4_K_S, Q4_K_M, Q8_0, F32 and BF16:** the quantize README and the Hugging Face GGUF table.
- **IQ types:** the Hugging Face GGUF table says each IQ type's weight "is obtained using `super_block_scale` & `importance matrix`".
- **W4A16, INT3 and INT4:** the AWQ paper and the llm-awq README ("low-bit weight quantization (INT3/4)").
- **LLM.int8():** the bitsandbytes docs.

### Checked and accurate

- **Transformers overview:** weights are typically stored in fp32, with fp16 and bf16 "increasingly popular". Some methods "work out of the box with on-the-fly quantization".
- **MLX affine mode:** group sizes 32, 64 and 128; bits 2, 3, 4, 5, 6 and 8; a scale and a bias per group.
- **bitsandbytes LLM.int8():** "quantize most features to 8-bits and separately treating outliers with 16-bit matrix multiplication". The page's "most of its matrix math" is a fair paraphrase.
- **gpt-oss model card (arXiv):**
  - MoE weights are "90+% of the total parameter count".
  - They were "post-trained … to MXFP4 format", at 4.25 bits per parameter.
  - gpt-oss-20b runs with "as little as 16GB memory".
  - The checkpoint is 12.8 GiB.
- **gpt-oss-20b Hugging Face card:** "All evals were performed with the same MXFP4 quantization."
- **GPTQ abstract:** "one-shot weight quantization method based on approximate second-order information", "175 billion parameters in approximately four GPU hours", "3 or 4 bits per weight".
- **AWQ:**
  - "not all weights in an LLM are equally important. Protecting only 1% salient weights can greatly reduce quantization error."
  - The scale comes from "activation statistics".
  - The paper says "a small calibration set".
  - Salient channels are scaled up.
- **Olmo 3 7B Instruct card:** `load_in_8bit=True  # Requires bitsandbytes`.
- **Hugging Face GGUF docs:**
  - GGUF is a binary format "designed for use with GGML and other executors" that "encodes both the tensors and a standardized set of metadata".
  - The viewer shows "name, shape, precision".
- **quantize README:**
  - Quantization "may introduce some accuracy loss which is usually measured in Perplexity … and/or Kullback–Leibler Divergence".
  - It works in two phases.
  - Input is "typically in a high-precision format like F32 or BF16".
  - The `llama-quantize … Q4_K_M` command matches exactly.
  - The `--allow-requantize` warning reads "can severely reduce quality compared to quantizing from 16bit or 32bit".
- **imatrix README:** it computes "an importance matrix for a model and given text dataset", which "can be used during quantization to enhance the quality".
- **perplexity README:**
  - Perplexity measures next-token prediction, "lower values being better", and is "not directly comparable between models".
  - For KL divergence, "a value of 0 indicating that the distribution are the same".
- **Ollama:** "Setting a larger context length will increase the amount of memory required to run a model."
- **Hermes 4 70B card:** "available as BF16 original weights as well as … FP8 variants and GGUF variants by LM Studio". The FP8 repository is under NousResearch.

### Changes

- **Q1. W4A16 wording.**
  - Before: "The AWQ paper calls this setting W4A16…"
  - After: "The AWQ paper gives W4A16 as an example of this setting…"
  - Source: AWQ §2, "Low-bit weight-only quantization (e.g., W4A16), where only weights are quantized into low-bit integers".
- **Q2. Which card gives 12.8 GiB.**
  - Before: "OpenAI's card lists a 12.8 GiB checkpoint…"
  - After: "OpenAI's gpt-oss model card lists…"
  - Source: arXiv 2508.10925, Table 1. The figure is in the arXiv model card, not the Hugging Face card mentioned just before, so the old wording was ambiguous.
- **Q3. `base_model` relation.**
  - Before: "lists "quantized" among the relations its `base_model` field records."
  - After: "lists "quantized" among the relationships the Hub infers from the `base_model` field."
  - Source: Hugging Face model-card docs, "The Hub will infer the type of relationship … ("adapter", "merge", "quantized", "finetune")". The relation is inferred, or set with `base_model_relation`. It is not recorded in `base_model` itself.
- **Q4. Sources attribution for GPTQ.**
  - Before: "IST Austria and ETH Zurich"
  - After: "IST Austria, ETH Zurich, and Neural Magic"
  - Source: the GPTQ paper's author list (Alistarh is listed at "IST Austria & NeuralMagic").

## Takeaways (`research/notes/round4-making-models.md`)

- **Pretraining 1 and 3, and all three quantization takeaways:** each restates the page, and each is at most 160 characters. No change.
- **Pretraining 2.**
  - Before: "…sets conditions for derivatives…"
  - After: "…sets conditions on distributed derivatives, such as a name starting with "Llama"; Apache 2.0 lets you license your changes differently." (157 characters)
  - The license's conditions apply on distribution or making available (§1.b.i). This matches P1 and P2.

## Could not verify / not used

- **meta-llama/Llama-3.1-8B on Hugging Face** is gated (401). I did not try to get past the gate. Meta's GitHub card was used instead.
- **The Hermes 4 arXiv HTML** returns 404. The PDF was used instead.
- **The Tülu 3.1 8B card** has a small error that does not affect the page: its "Final Models (RLVR)" 8B cell has the link text `allenai/Llama-3.1-Tulu-3.1-8B` but points to `allenai/Llama-3.1-Tulu-3-8B`. The card also says the 3.1 final RL stage switched from PPO to GRPO. The page's "SFT, DPO, and RLVR" is still correct.

## Editor decisions

1. **Word count.** The bodies are 1,442 and 1,404 words. Counted with Sources, the files are 1,537 and 1,511. The overage comes from the license-precision edits (P1, P2, P4). I did not cut accurate text to make room.
2. **Hermes `llama3` field.** The page now states the field and the base model side by side, without interpreting them. Whether to say outright that `llama3` is the Hub identifier for the Llama 3 (not 3.1) license is an editorial choice. If so, cite `huggingface.co/docs/hub/repositories-licenses`.
3. **Llama §2.** The page does not mention the 700-million-monthly-active-user clause in the Llama 3.1 license (§2). It is not relevant to the worked example, so I left it out.
