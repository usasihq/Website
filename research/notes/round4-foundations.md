# Round 4 notes: round4-foundations (2026-10-08)

Agent label: `round4-foundations`. Files written: `content/pages/learn-how-language-models-work.mdx`, `content/pages/learn-tokens-and-context-windows.mdx`, and this notes file. Both MDX files compile with `@mdx-js/mdx`. All sources were fetched on 2026-10-08 with WebFetch or with curl using `-A "USASI-catalog-research/0.3"`; no personal identifiers were sent.

## Explainer 1

```
slug: how-language-models-work
title: How large language models work
question: What happens between typing a prompt and getting an answer?
topic: basics
level: Beginner
takeaways:
  - A model is a file of learned numbers, called weights, plus an architecture; training adjusts the weights so the model gets better at predicting the next token.
  - A reply is built one token at a time: the model scores every possible next token, a setting such as temperature shapes the pick, and the loop repeats.
  - Fluent output can still be wrong; Anthropic's guide says its techniques reduce hallucinations but do not eliminate them, so validate critical information.
sources fetched: 21 fetched, 18 cited.
```

- Cited: Ai2 Olmo-3-1025-7B model card, file list, config.json, model.safetensors.index.json; Olmo-3-7B-Instruct model card; Anthropic "Context windows" and "Reduce hallucinations"; arXiv 1706.03762 (abstract and PDF); arXiv 2509.04664 and the matching OpenAI-hosted PDF; Google ML Crash Course LLM pages (intro, "What's a large language model?", "Fine-tuning, distillation, and prompt engineering"); Gemini API "Prompt design strategies"; Hugging Face Transformers "Causal language modeling", "Text generation", "Generation strategies"; OpenAI "Text generation" guide.
- Fetched, not cited: OpenAI Responses API reference (temperature range 0 to 2; sentence cut for length); Olmo 3 technical report (arXiv 2512.13961; its abstract uses superlatives, so not quoted); Anthropic Messages API reference (no temperature text found on the fetched page).
- Could not reach: OpenAI blog post `openai.com/index/why-language-models-hallucinate/` (HTTP 403 to both curl and WebFetch). Used the paper itself (arXiv and the cdn.openai.com PDF) instead. A guessed MLCC URL for an n-gram page returned 404; not needed.
- Uncertain or worth noting:
  - Google's course describes LLM training with masked-token prediction in general terms. The page cites Hugging Face's causal language modeling and text generation guides for the next-token objective, and cites Google only for the error-guided backpropagation step and the grammar/words/idioms statement.
  - The hallucination paper has four authors, three at OpenAI and one at Georgia Tech; the page says "researchers at OpenAI and Georgia Tech" rather than "OpenAI's paper".
  - "Autoregressive" is defined in plain words following the 2017 paper's description (each step consumes previously generated symbols); that paper concerns an encoder-decoder translation model, while Olmo is a decoder-style causal model per its config (`Olmo3ForCausalLM`).
  - Parameter count (7,298,011,136) comes from the `total_parameters` field of the published safetensors index, not from prose in the model card.

## Explainer 2

```
slug: tokens-and-context-windows
title: Tokens and context windows
question: Why do AI tools count tokens, and what happens when a conversation gets too long?
topic: basics
level: Beginner
takeaways:
  - A token is a chunk of text, often a word or part of one; different models can use different tokenizers, so the same text can count differently.
  - In a chat, the context window must hold the system prompt, the whole conversation, attached files, tool definitions, and the reply being generated.
  - When a conversation outgrows the window, APIs may refuse or truncate, and some tools drop or summarize older turns, so early material may drop out of view.
sources fetched: 20 fetched, 15 cited.
```

- Cited: Ai2 Olmo-3-1025-7B model card and config.json; Anthropic "Context windows" and "Token counting"; Gemini API "Understand and count tokens" (last updated 2026-09-23) and "Long context" (last updated 2026-06-22); Google ML Crash Course LLM intro; Ollama "Context length"; OpenAI tiktoken README and `tiktoken/model.py`; OpenAI Cookbook "How to count tokens with tiktoken"; OpenAI "Conversation state", "Counting tokens", and "Compaction" guides; gpt-oss-120b and gpt-oss-20b model card (arXiv 2508.10925).
- Fetched, not cited: tiktoken `openai_public.py`; gpt-oss-20b Hugging Face README and config.json (README does not state a context length; config has 131072 positions, consistent with the arXiv card); Gemini models page (no per-model token limits in the fetched HTML); OpenAI reasoning guide.
- Could not reach: OpenAI Help Center "What are tokens and how to count them" (HTTP 403 to curl and WebFetch). Rules of thumb were taken from Google's Gemini token guide and ML Crash Course instead.
- Uncertain or worth noting:
  - The tokenization examples ("tiktoken is great!" as six o200k_base tokens; "antidisestablishmentarianism", "2 + 2 = 4", and a Japanese phrase across encodings) are the recorded outputs in OpenAI's cookbook notebook, last committed 2024-10-08 per the GitHub API. They were not re-run locally.
  - Anthropic's page says "Claude 4.7 and later models" use the newer tokenizer (about 30 percent more tokens); the explainer paraphrases this as "Claude models from version 4.7 onward". Model names on these pages change often; re-check before the next review.
  - Anthropic lists a 1M-token window for a named set of models and 200k for "other Claude models"; the explainer says "many of its models" and "the rest" rather than naming them.
  - The gpt-oss card says the context length of dense attention layers was extended to 131,072 tokens (its other layers use a 128-token band); the explainer keeps the "dense attention layers" qualifier.
  - Ollama's defaults (4k below 24 GiB VRAM, 32k from 24 to 48 GiB, 256k at 48 GiB or more) are as published today; the page does not say what Ollama does with input that exceeds the configured context, so the worked example says only that the transcript would not fit.
  - No prices appear. Billing is described only as "by tokens", with OpenAI's note that earlier input tokens in a chained conversation are billed again as input, and Anthropic's note that thinking tokens are billed as output.

## Self-check

Every factual sentence in both files was re-read against the downloaded source text. Changes made during the check:

- Explainer 1: removed "largest" from "first and largest phase" (not documented as a comparison); added "long" to Anthropic's quote-extraction advice (the guide scopes it to long documents); credited the hallucination paper to researchers at OpenAI and Georgia Tech; dropped a sentence describing base models as "a platform rather than a solution" to stay under 1,500 words; removed the OpenAI temperature-range sentence for length.
- Explainer 2: changed the four-characters rule to "a Gemini token" (Google's guide states it for Gemini models, and the 60 to 80 words figure for English); qualified the gpt-oss context length to dense attention layers; replaced "newer models" with "many of its models" for Anthropic's 1M-token list; reworded tiktoken limits to match OpenAI's "Counting tokens" guide (images and files unsupported, tools hard to count locally); corrected the OpenAI guide's title to "Counting tokens" in Sources; changed "the README's example splits" to "will often split" to match the README.
- Checked both files for bare `<`, `>`, `{`, `}` in prose (only the backticked chat-template marker remains), for superlatives (the only "first" uses are ordinal), for prices, and that every internal record link has `publication_status: published` (olmo, olmo-3-1025-7b, olmo-3-7b-instruct, gpt-oss-20b, ollama, ai2). Glossary anchors used: weights, tokenizer, inference, context-window.
- Word counts (`wc -w`, including Sources): learn-how-language-models-work.mdx 1,499; learn-tokens-and-context-windows.mdx 1,497.

## Suggested glossary terms

token, hallucination, temperature (sampling), base model, pretraining, post-training, system prompt, compaction.
