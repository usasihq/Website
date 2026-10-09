# Round 4 notes: making models (label `round4-making-models`)

Written 2026-10-08. All sources were fetched on 2026-10-08 with curl using
`-A "USASI-catalog-research/0.3"`, plus one web search restricted to docs.nvidia.com to find
the current Transformer Engine URL. No identifiers were sent in any request.

## Explainer 1

```
slug: pretraining-and-post-training
title: Pretraining, fine-tuning, and post-training
question: How does a raw model become an assistant, and what does it mean when one model is built on another?
topic: models-and-licenses
level: Intermediate
takeaways:
  - A base model is pretrained to predict the next token; post-training stages such as SFT, preference tuning, and RLVR then shape how it responds.
  - The Llama 3.1 license sets conditions on distributed derivatives, such as a name starting with "Llama"; Apache 2.0 lets you license your changes differently.
  - A card's base_model field may name only the previous stage, so follow the chain and confirm the base in the technical report.
sources fetched: 18 (16 cited)
```

File: content/pages/learn-pretraining-and-post-training.mdx (1,499 words in the file;
1,404 before the Sources section). MDX compile check: ok.

Cited: InstructGPT (arXiv 2203.02155, abstract page and PDF); DPO (arXiv 2305.18290, abstract
and PDF); Tülu 3 report (arXiv 2411.15124, abstract and HTML); Olmo 3 report (arXiv
2512.13961, abstract and HTML); Hermes 4 Technical Report (arXiv 2508.18255, abstract and PDF);
Hermes-4-70B model card; Llama 3.1 Community License (llama-models repo); Llama 3.1
MODEL_CARD.md; Llama 2 MODEL_CARD.md; Llama-3.1-Tulu-3.1-8B card; Olmo-3-7B-Instruct card;
Olmo-3-1025-7B card; Apache License 2.0; Hugging Face model cards docs (specifying a base
model); TRL SFT Trainer; TRL DPO Trainer. Also read, not cited: Olmo-3-7B-Think card, TRL
index page.

Could not reach or did not use:
- Hermes 4 arXiv HTML returned 404; the PDF was used instead.
- meta-llama/Llama-3.1-8B on Hugging Face returned 401 (gated); Meta's MODEL_CARD.md in the
  llama-models GitHub repository was used instead.
- Ai2's Tülu 3 blog was not needed; the report covers every claim.

Uncertain or deliberately left out:
- The Hermes 4 70B card says the post-training corpus is about 60B tokens; the report says
  about 19 billion tokens. The page gives only the sample count (about 5 million), which both
  agree on, and no token figure.
- The Hermes 4 70B card's license field reads `llama3` although the base is Llama 3.1. The
  page states the field as written and does not interpret it or assess compliance with the
  Llama naming clause.
- The page does not say whether trained weights are "derivative works" in a legal sense; it
  reports what each license text says and carries the "not legal advice" line.
- Olmo 3 RL-Zero was cut for length.

## Explainer 2

```
slug: quantization
title: Quantization: fitting models on smaller hardware
question: How can a large model run on a laptop, and what do you give up?
topic: running-ai
level: Intermediate
takeaways:
  - Quantization stores weights in fewer bits, so a 4-bit file is about a quarter to a third the size of the 16-bit original.
  - llama.cpp says quantization may introduce some accuracy loss, usually measured with perplexity and KL divergence; test a quantized model on your own tasks.
  - Prefer quantized files from the publisher or a source that documents how they were made, and files made from the 16- or 32-bit original, not requantized.
sources fetched: 23 (19 cited)
```

File: content/pages/learn-quantization.mdx (1,500 words in the file; 1,395 before the Sources
section). MDX compile check: ok.

Cited: llama.cpp quantize, imatrix, and perplexity READMEs; Hugging Face Hub GGUF docs;
Transformers quantization overview; bitsandbytes docs; Hugging Face model cards docs; NVIDIA
Transformer Engine "Using FP8 and FP4" guide (v2.20.2); OCP Microscaling Formats (MX) spec
v1.0 (PDF); gpt-oss model card (arXiv 2508.10925, abstract and HTML); gpt-oss-20b Hugging Face
card; AWQ paper (arXiv 2306.00978, abstract and PDF) and llm-awq README; GPTQ paper (arXiv
2210.17323, abstract and PDF); MLX `mlx.core.quantize` docs and MLX README; Hermes-4-70B card;
Olmo-3-7B-Instruct card; Ollama context-length page. Also read, not cited: Hermes-4-70B-FP8
card, mlx-lm README, bitsandbytes GitHub README, Hugging Face perplexity guide.

Could not reach: the old Transformer Engine URL
(docs.nvidia.com/deeplearning/transformer-engine/user-guide/examples/fp8_primer.html) returned
404; the current page at docs.nvidia.com/deeplearning/transformer-engine/examples/fp8_primer.html
was used.

Uncertain or deliberately left out:
- The 8-billion-weight size list is labelled on the page as arithmetic about weight files, not a
  hardware requirement. It uses decimal GB; llama.cpp's measured figures are GiB, and the page
  explains the difference.
- The 4.25 bits for MXFP4 is computed from the MX spec (32 four-bit values plus one 8-bit
  scale) and matches the figure in OpenAI's gpt-oss card.
- No primary source fetched defines the S, M, and L suffixes in llama.cpp type names, so the
  page only says the variants differ in size and gives the README's bits-per-weight figures.
- bitsandbytes' "without performance degradation" is the project's own description and is
  attributed as such. No speed (tokens per second) or quality scores are given; the README's
  speed columns were not used.
- GPTQ's authors are at IST Austria, ETH Zurich, and Neural Magic (not U.S. institutions); it is
  described as a method only, with no catalog link.
- NVFP4 and the multimodal-projector advice in the quantize README were cut for length.

## Self-check

I re-read every factual sentence in both pages against the passage that supports it and
changed these:

- Explainer 1: "usually" in the opening list of stages became "such as" (the stages vary by
  developer). "Pretraining uses the most data" was cut (not stated generally by a source). The
  Hermes 4 sentence now says the 5 million examples were "mostly newly synthesized," since the
  report says a significant portion of the Hermes 3 dataset was kept. The Llama 3.1
  redistribution sentence now follows the license's own structure (materials, a derivative, or
  a product or service that contains them, including another AI model). "Says to set" became
  "says you can set" for the optional `base_model` field. The opening's "not at following
  instructions" became "not tuned to follow instructions."
- Explainer 2: "a little over a quarter" became "about a quarter to a third," matching the
  README's Q4_K_M and IQ4_XS sizes against F16. The MLX bit widths now list 2, 3, 4, 5, 6, or 8
  (there is no 7-bit option). The LLM.int8() sentence was reworded to match the docs (most of
  the matrix math in 8 bits, outliers in 16-bit). W4A16 is now attributed to the AWQ paper,
  which defines it, rather than the repository, which only uses the label. "Small calibration
  set" is backed by the AWQ paper's own wording. The gpt-oss sentence no longer says the MXFP4
  file is what "ships"; it now cites the card's 12.8 GiB checkpoint size instead. The importance
  matrix is described as computed "from the model and a sample text file," as the imatrix
  README says.
- Both pages: one short direct quote each (the Llama naming clause; llama.cpp's "may introduce
  some accuracy loss"); everything else is paraphrased. Scanned for superlatives, prices,
  funding, and counts; none remain. All internal links checked: every /open/ and /companies/
  target has `publication_status: published`, every glossary anchor exists, and /learn/ links
  use slugs from the brief.

## Suggested glossary terms

base model; post-training; supervised fine-tuning (instruction tuning); preference tuning
(RLHF, DPO); reinforcement learning with verifiable rewards (RLVR); precision / bits per
weight; activations; calibration data; perplexity; importance matrix (imatrix).
