# Verification log: round4-verify-foundations

Checked on 2026-10-08 under `research/VERIFIER_BRIEF_ROUND4.md` and `research/AGENT_BRIEF_ROUND4.md`.

**Files checked**
- `content/pages/learn-how-language-models-work.mdx`
- `content/pages/learn-tokens-and-context-windows.mdx`
- The takeaways for both pages in `research/notes/round4-foundations.md`

**How sources were read**
- Every cited source was opened today.
- Rendered pages were fetched with `curl -A "USASI-factcheck/0.3"` and converted to text locally.
- Raw files came from the same curl: the Hugging Face README, config.json, model.safetensors.index.json, and the Hub API file tree; the tiktoken README, `model.py`, and `openai_public.py`; the cookbook `.ipynb` JSON; the GitHub commits API for the notebook; and the arXiv PDFs and OpenAI PDF, read through `pdftotext`.
- WebFetch was used only to retry the two OpenAI pages that return 403.
- No email address, name, or other identifier was sent in any request. No bot check was bypassed.

## Summary

- **Corrections:** 8 in total.
  - 3 in the language-models page.
  - 5 in the tokens page.
  - 2 of the takeaways mirror tokens-page corrections.
- **Every external link** returned HTTP 200 and showed the page described. Page titles in the Sources sections match the live titles.
- **Internal links** all resolve:
  - These records exist and are `publication_status: published`: `olmo`, `olmo-3-1025-7b`, `olmo-3-7b-instruct`, `gpt-oss-20b`, `ollama`, and `ai2`.
  - The explainer slugs are registered in `lib/learn.ts` and imported in `app/learn/content.ts`.
  - The hubs `foundation-models` and `local-ai` exist.
  - The glossary anchors `weights`, `tokenizer`, `inference`, and `context-window` exist in `content/pages/glossary.mdx`.
- **Format.** Both files compile with `@mdx-js/mdx` after the edits.
  - Both use `<h2 id>` headings, end with Sources, and have no Markdown tables.
  - Each fictional reader (Dana, Ray) is labelled fictional.
  - Neither page has superlatives, prices, or counts of users or staff.
- **Word counts after the edits** (`wc -w`, whole file / body before Sources): 1,500 / 1,401 for the language-models page and 1,497 / 1,425 for the tokens page.

## The points the writer flagged

1. **OpenAI's "Why language models hallucinate" blog post** (`openai.com/index/why-language-models-hallucinate/`).
   - It still returns HTTP 403 to both curl and WebFetch, so it was skipped.
   - The page does not link or cite it. It cites arXiv 2509.04664 and the cdn.openai.com PDF, and both were read in full.
   - The two versions have the same title, the same four authors (three at OpenAI, one at Georgia Tech), and the same date (September 4, 2025). They differ only in small wording.
   - Every claim the page attributes to the paper appears in both versions:
     - the two training stages;
     - "post-training refines the base model";
     - the arbitrary-fact birthday argument;
     - 0-1 grading that gives no points for "I don't know."
2. **OpenAI Help Center "What are tokens and how to count them."**
   - It still returns HTTP 403 to both curl and WebFetch, so it was skipped.
   - The page does not cite it.
   - The rules of thumb on the page come from Google's Gemini token guide (last updated 2026-09-23) and the ML Crash Course LLM page (last updated 2026-01-09). Both were confirmed.
3. **The tokenizer comparisons from the cookbook notebook.**
   - All recorded outputs match the page: "tiktoken is great!" is 6 o200k_base tokens, split as `t / ikt / oken / is / great / !`; "antidisestablishmentarianism" is 5 / 6 / 6 tokens; "2 + 2 = 4" is 5 / 7 / 7; the Japanese phrase is 14 / 9 / 8.
   - The notebook was last committed on 2024-10-08 (GitHub commits API).
   - The notebook itself was not re-run. tiktoken 0.12.0 is installed locally, but the encoding files are not cached, and downloading them was out of scope.
   - The recorded outputs should still hold. tiktoken's `openai_public.py` pins each encoding file (r50k_base, cl100k_base, o200k_base) to a fixed SHA-256 `expected_hash`, so these encodings cannot change without a code change.
4. **Anthropic model names and context limits** were re-read today.
   - **Context windows page:**
     - It lists a 1M-token window for 14 named models (Claude Fable 5.1 through Claude Mythos Preview).
     - Any of those models can generate up to 128k output tokens per request.
     - Other Claude models, including Claude Sonnet 4.5 (deprecated), have 200k.
     - "Many of its models" and "the rest" are accurate.
   - **Token counting page:** "Claude 4.7 and later models and Claude Mythos Preview use a newer tokenizer", with about 30 percent more tokens than earlier models, and it advises recounting against the model you plan to use. The paraphrase "Claude models from version 4.7 onward" is accurate.
   - **Overflow behaviour:** a "prompt is too long" error on every model. `model_context_window_exceeded` applies on "Claude 4.5 models and newer", which the page calls "newer Claude models".
   - Both statements are true as of today. Re-check them at the next review.

## learn-how-language-models-work.mdx

### Claims checked and confirmed

- **Olmo 3 7B files:**
  - Three `.safetensors` shards (Hub API tree).
  - `total_parameters` is 7,298,011,136 (index file).
  - config.json gives `num_hidden_layers` 32, `vocab_size` 100278, and `max_position_embeddings` 65536.
  - Tokenizer files: tokenizer.json, vocab.json, and merges.txt.
- **Olmo 3 7B card:**
  - Model type: "a Transformer style autoregressive language model".
  - Stage 1 Initial Pretraining: 5.93T tokens.
  - Date cutoff: Dec 2024.
- **The 2017 paper** (arXiv 1706.03762):
  - The Transformer is "based solely on attention mechanisms".
  - Auto-regressive means "consuming the previously generated symbols as additional input when generating the next".
  - The softmax output gives "predicted next-token probabilities".
- **Google MLCC:**
  - The self-attention question and the animal/street example.
  - The token definition and the un/watch/ed example.
  - "cook soup" at 9.4% and "nap" at 2.5%.
  - Loss guides how backpropagation updates parameters.
  - A foundation LLM "know[s]" a remarkable amount about grammar, words, and idioms (tuning page).
  - "Prompt engineering doesn't alter the model's parameters."
  - Base, foundation, and pre-trained LLM are used as synonyms.
- **Hugging Face:**
  - A causal LM predicts the next token and attends only to the left.
  - Generation runs until an EOS token or a predefined length.
  - Greedy search "begins to repeat itself" on longer sequences.
  - Sampling selects at random from the probability distribution.
- **Gemini prompt design strategies:**
  - What temperature does, and the wording on lower and higher temperatures.
  - What topK and topP do.
  - "strongly recommend keeping them at their default values for Gemini 3.x models".
- **OpenAI text generation guide:** "the content generated from a model is non-deterministic".
- **Olmo 3 7B Instruct card:**
  - It starts from the Olmo-3-7B base and goes through SFT, then DPO, then RLVR ("reinforcement learning from verifiable rewards"), each stage with listed datasets.
  - The chat template uses `<|im_start|>user` markers.
  - Recommended temperature 0.6 and top_p 0.95.
- **Anthropic Context windows:**
  - All the text the model can reference, including the response.
  - A "working memory" that is different from the training corpus.
  - Each turn's input contains all previous history plus the new message.
- **Anthropic Reduce hallucinations:**
  - Allow "I don't know".
  - Extract word-for-word quotes first, for long documents.
  - Cite quotes for each claim.
  - With Best-of-N, inconsistencies across outputs "could indicate hallucinations".
  - The techniques reduce hallucinations but "don't eliminate them entirely"; it says to validate critical information.
- **Hallucination paper:**
  - Hallucinations are "plausible yet incorrect statements instead of admitting uncertainty".
  - Training has two stages, pretraining and post-training, and post-training "refines the base model".
  - Errors arise even with error-free training data.
  - Arbitrary facts and the birthday that appears once.
  - Most evaluations use 0-1 scoring, with no points for blanks or "I don't know".

### Changes

1. **Chat assistants section.**
   - Before: "Google's course calls instruction tuning an optional further step that improves a model's ability to follow instructions."
   - After: "...an optional step that can improve a model's ability..."
   - Source: MLCC "What's a large language model?": "An optional further training step called instruction tuning can improve an LLM's ability to follow instructions." The source says "can improve", not "improves". "further" was dropped to keep the page within 1,500 words; the preceding sentences already place this step after pretraining.
2. **Fluent-but-wrong section.**
   - Before: "...even if the training data contained none, especially for arbitrary facts with no pattern to learn..."
   - After: "...including on arbitrary facts with no pattern to learn..."
   - Source: arXiv 2509.04664, Section 1.1 and Figure 1. The paper names arbitrary facts as one of several error factors, alongside poor models and others in Section 3.3. It does not rank arbitrary facts as the main one.
3. **Fluent-but-wrong section.**
   - Before: "The Olmo 3 cards warn that statements from Olmo or any LLM are often inaccurate..."
   - After: "...warn that many statements from Olmo or any LLM are often inaccurate..."
   - Source: both Olmo 3 cards, Bias, Risks, and Limitations: "many statements from OLMo or any LLM are often inaccurate, so facts should be verified."

Takeaways for this page: all three restate the page accurately (each is 159 characters or fewer). No change.

## learn-tokens-and-context-windows.mdx

### Claims checked and confirmed

- **tiktoken README:**
  - Models "see a sequence of numbers (known as tokens)".
  - BPE is reversible.
  - "encoding" will often split into "encod" and "ing".
- **Cookbook:**
  - o200k_base is listed for gpt-4o.
  - The recorded outputs listed above.
  - "usage is priced by token".
- **tiktoken `model.py`:** `gpt-4` → cl100k_base, `gpt-4o` → o200k_base, and the `gpt-oss-` prefix → o200k_harmony.
- **gpt-oss card** (arXiv 2508.10925):
  - o200k_harmony "has a total of 201,088 tokens".
  - "extend the context length of dense layers to 131,072 tokens".
- **Gemini token guide:**
  - A token is about 4 characters, and 100 tokens are about 60-80 English words.
  - Images 384 pixels or smaller on both sides count as 258 tokens, and audio as 32 tokens per second.
  - The context window is "the combined limit of input and output tokens".
  - Cost depends "in part" on input and output tokens.
  - countTokens counts input only, before sending.
  - The usage data reports input, output, thinking, and other counts.
- **MLCC:** "Tokenization is language specific, so the number of characters per token differs across languages."
- **Olmo:** config.json `vocab_size` is 100278, and the card gives a context length of 65,536.
- **Anthropic token counting:**
  - The newer tokenizer gives about 30 percent more tokens, so recount.
  - The endpoint accepts the same structured inputs as a message, including system prompts, tools, images, and PDFs.
  - The count is an estimate that "might differ by a small amount".
- **OpenAI conversation state:**
  - The context window is defined as the maximum tokens in a single request, including input, output, and reasoning tokens.
  - gpt-4o-2024-08-06 has a 128k window and at most 16,384 output tokens.
  - Exceeding the window "might result in truncated outputs".
  - "all previous input tokens for responses in the chain are billed as input tokens".
- **OpenAI counting tokens:**
  - Local tokenizers work for plain text.
  - Images and files are not supported locally, and tools add tokens that are hard to count locally.
  - The endpoint returns the exact count, including the formatting tokens for message roles.
- **OpenAI compaction:** compaction runs when the rendered token count crosses `compact_threshold`, and the compaction item "carries forward key prior state".
- **Anthropic context windows:**
  - What counts toward the window: the system prompt, messages including tool results, images, and documents, tool definitions, and output including extended thinking.
  - Context rot.
  - claude.ai can manage the window first-in, first-out.
  - Server-side compaction summarizes earlier parts of the conversation.
  - Thinking tokens are billed as output.
  - The overflow behaviour covered in flagged point 4.
- **Gemini long context:**
  - Lists strategies: dropping old messages, summarizing, RAG, and filtering prompts.
  - Avoid tokens that are not needed.
  - Put the query at the end.
- **Ollama context length:**
  - Default 4k with less than 24 GiB of VRAM, 32k from 24 to 48 GiB, and 256k at 48 GiB or more.
  - A larger context needs more memory.
  - `ollama ps` shows the PROCESSOR and CONTEXT columns.
- **Worked example arithmetic:** 20,000 words ÷ 0.8 = 25,000 tokens, and ÷ 0.6 ≈ 33,333 tokens.

### Changes

1. **Opening paragraph.**
   - Before: "Each model family has its own tokenizer, so the same sentence can count differently on different models."
   - After: "Different models can use different tokenizers, so the same sentence can produce different counts."
   - Source: the tiktoken `model.py` and the cookbook encoding table. Several model families share one encoding: gpt-4, gpt-3.5-turbo, and text-embedding-3 all use cl100k_base. Anthropic's token counting page also says the Fable 5.x and Mythos 5.x models "share the tokenizer introduced with Claude Opus 4.7".
2. **Opening paragraph.**
   - Before: "...and chat tools drop or summarize older material..."
   - After: "...and some tools drop or summarize older material..."
   - Source: Anthropic's context windows page. It documents dropping (first-in, first-out) for chat interfaces such as claude.ai, and summarizing as an API feature (server-side compaction). No source says chat tools summarize.
3. **Why counts differ section.**
   - Before: "A count only means something for the model it was measured on."
   - After: "A count holds only for the tokenizer it was measured with."
   - Source: Anthropic token counting. Models that share a tokenizer give the same count ("A prompt counts the same on all four"). Counts differ across tokenizers, which is why Anthropic says to recount.
4. **What fills the window section.**
   - Before: "Google's guide likewise counts system instructions and tools as input."
   - After: "Google's guide likewise counts system instructions as input, and counts tools too."
   - Source: Gemini token guide. "System instructions are counted as part of the input tokens", but for tools it says only that they "are also counted", and its example reports them separately as `total_tool_use_tokens`.
5. **Billing section.**
   - Before: "Long chats cost more per turn because history is resent: OpenAI says all previous input tokens in a chained conversation are billed as input tokens."
   - After: "Long chats cost more per turn because earlier turns are counted again: OpenAI says..."
   - Source: OpenAI conversation state, "Even when using previous_response_id, all previous input tokens for responses in the chain are billed as input tokens". With chaining, the client does not resend the history, but the earlier input tokens are still billed.

### Takeaways (notes file)

- Takeaway 1 was edited to match correction 1.
  - Before: "...each model family has its own tokenizer, so the same text can count differently across models."
  - After: "...different models can use different tokenizers, so the same text can count differently."
- Takeaway 3 was edited to match correction 2: "chat tools drop or summarize" became "some tools drop or summarize".
- Takeaway 2 is accurate.
- All three are 155 characters or fewer.

## Could not verify

- **OpenAI blog post and Help Center article:** both return HTTP 403. Neither is cited, and no claim depends on them.
- **Cookbook tokenization outputs:** not reproduced locally, for the reasons in flagged point 3. They were confirmed as recorded in OpenAI's notebook, and the encodings are hash-pinned.

## For the editor

- The Anthropic model lists and the "Claude 4.7 and later" tokenizer statement are correct as of 2026-10-08. They are the details on these pages most likely to go stale.
- The language-models page is at exactly 1,500 words including Sources.
