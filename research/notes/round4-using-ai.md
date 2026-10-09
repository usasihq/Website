# Round 4: using AI explainers (label `round4-using-ai`, 2026-10-08)

Files created (no other files edited):

- `content/pages/learn-how-models-use-tools.mdx`: about 1,430 words of prose before Sources, about 1,470 counting the two short JSON code blocks.
- `content/pages/learn-retrieval-augmented-generation.mdx`: about 1,465 words before Sources.
- `research/notes/round4-using-ai.md` (this file).

Both files compile with `@mdx-js/mdx`. Both use `<h2 id>` headings only (7 and 8 content sections, plus `next` and `sources`), have no front matter, H1, tables, imports, components, or images, and contain no bare `<`, `>`, `{`, or `}` outside code. Internal links were checked with a script. Every `/open/` link points to a record with `publication_status: published` (model-context-protocol, openai-agents-sdk, agent-development-kit, faiss, embeddinggemma-300m). Both hubs exist and are published. Every `/learn/` slug appears in `lib/learn.ts`, and every glossary anchor is on the brief's list. All 30 cited external URLs returned HTTP 200 on 2026-10-08.

Requests went through curl with User-Agent `USASI-catalog-research/0.3`, and three pages also went through WebFetch. No email address, name, or other identifier was sent in any URL, header, or payload.

## Explainer 1

```
slug: how-models-use-tools
title: How AI models use tools
question: What actually happens when a chatbot searches the web, runs code, or calls an app?
topic: running-ai
level: Intermediate
takeaways:
  - A model never runs a tool itself: it returns a structured request, and the application, or the provider for hosted tools, runs it and returns the result.
  - Web pages, files, and other tool results can carry prompt injection, and OWASP says it is unclear whether any method fully prevents it.
  - MCP's security principles say hosts must get user consent before invoking any tool, but the protocol cannot enforce this, so implementors should build it in.
sources fetched: 16 (15 cited). Unreached: none.
```

Sources cited (all read 2026-10-08):

- OpenAI: Function calling guide, Using tools guide, File search guide, OpenAI Agents SDK docs (openai.github.io).
- Anthropic: Tool use overview and How tool use works (platform.claude.com; docs.claude.com redirects there).
- Google: Gemini function calling, Grounding with Google Search, and Code execution docs. The ADK docs (google.github.io/adk-docs) now redirect to https://adk.dev/, which is the URL cited.
- MCP: specification 2026-07-28 overview and security principles, Tools page, and Versioning page (current version 2026-07-28).
- OWASP Gen AI Security Project: LLM01:2025 Prompt Injection and LLM06:2025 Excessive Agency. The LLMRisks archive page was fetched only to confirm the list's name and is not cited.

Uncertain or worth noting:

- The page calls OWASP's list "its 2025 Top 10 for LLM and generative AI security", because the pages read today label it "LLM Top 10 for 2025" within "OWASP Top 10 for LLM & Generative AI Security". The brief's name, "Top 10 for LLM Applications", does not appear on those pages.
- The Gemini code execution page does not say outright where the code runs. The page lists it under "Tools the provider runs" because the request only enables the tool and the API returns the execution steps, but it does not claim a location.
- Both JSON blocks reproduce the `get_weather` example from Anthropic's overview. The model's reply is simplified (ID omitted), and the page says so.
- The MCP record's history (introduced by Anthropic, donated to the Agentic AI Foundation) was not restated, because no page read today covered it. Readers are pointed to the record instead.

## Explainer 2

```
slug: retrieval-augmented-generation
title: Retrieval-augmented generation (RAG)
question: How do AI systems answer questions about documents they were never trained on?
topic: running-ai
level: Intermediate
takeaways:
  - RAG searches your documents for passages related to a question and adds them to the prompt, so the model can answer from them without retraining.
  - Retrieval can miss the right passage or return conflicting versions, and the model can still misread them, so test retrieval and answers separately.
  - An index is another copy of your documents: check a hosted provider's retention terms, or run embeddings and search on your own hardware.
sources fetched: 19 (17 cited). Unreached: Hugging Face raw README for google/embeddinggemma-300m (HTTP 401, gated); Google's ai.google.dev model card was used instead.
```

Sources cited (all read 2026-10-08):

- Lewis et al., arXiv 2005.11401: abstract page plus the v4 PDF. Used for the provenance quote, Wikipedia in 100-word chunks (21M), the FAISS index, and index hot-swapping.
- Anthropic: Introducing Contextual Retrieval (2024-09-19), Models overview (reliable knowledge cutoff Jun 2026; the URL now resolves to /docs/en/models/overview), Prompting best practices (long context section), and Citations.
- OpenAI: Vector embeddings (definition, and text-embedding-3 knowledge ending September 2021), Retrieval (moon example, chunking settings, query rewriting, attribute filters, "department" attribute, expiration policy), File search, Data controls (vector stores row: not used for training, 30-day abuse monitoring, application state "until deleted", not ZDR-eligible), and Evaluation best practices.
- Google: EmbeddingGemma model card (ai.google.dev) and EmbeddingGemma overview.
- Meta: Faiss README, fetched raw and cited as the GitHub blob URL. faiss.ai was also fetched but is not cited.
- Sentence Transformers: Semantic Search page and Evaluation reference (InformationRetrievalEvaluator). The sbert.net home page was also fetched but is not cited.
- OWASP: LLM01:2025 Prompt Injection (RAG does not fully mitigate injection, scenario #4, RAG Triad).

Uncertain or worth noting:

- **For catalog maintainers:** Google's EmbeddingGemma overview (last updated 2026-10-06) now leads with **EmbeddingGemma 2**. It describes a 740M-parameter multimodal model under Apache 2.0, with a 270M text-and-code base. The catalog record `embeddinggemma-300m` covers version 1. The overview gives version 1 as 308M parameters, while the model card says 300M; the page follows the card. The quote "works without internet connection" comes from the overview's EmbeddingGemma 1 section.
- Contextual Retrieval results are Anthropic's own tests. Under rule 3 the page gives no percentages and says only that Anthropic reports fewer failed retrievals. The 150-to-20 reranking setup is described as a later step the post adds, not as part of Contextual Retrieval itself.
- OpenAI's evaluation guide says the hosted Evals platform is being deprecated (read-only on 2026-10-31, shutdown on 2026-11-30). The page cites only the guide's design advice, not the platform.
- The OpenAI evaluation example's numeric targets (context recall and precision thresholds) were left out on purpose. They are one example, not a standard.
- "Use one embedding model for both" (queries and documents) is an inference from Sentence Transformers' statement that the query is embedded "into the same vector space". It is not a direct quote.

## Self-check

I re-read every factual sentence against the saved source text and made these changes:

- Tools: cut an unsupported claim that one provider's connector "does not automatically work" in another app.
- Tools: changed "MCP treats tool descriptions as untrusted" to the spec's wording, "descriptions of tool behavior should be considered untrusted unless obtained from a trusted server".
- Tools: renamed the OWASP list to match the pages read.
- Tools: dropped the claim that Gemini's tools run on Google's servers.
- Tools: cut the context-window sentence (OpenAI) to save length. It was accurate.
- RAG: separated reranking from Contextual Retrieval, as the post does.
- RAG: credited the expiration policy to the Retrieval guide, not the Data controls page.
- RAG: changed "Anthropic's 500-page guide" to the post's actual statement (under 200,000 tokens, about 500 pages, can go into the prompt).
- RAG: credited the groundedness check to OWASP's prompt injection entry.

Remaining paraphrases were checked against the source passages: the five-step flow, strict mode, the "New York, NY" guess, server versus client tools, agentic loop, MCP roles, features, and security principles, OWASP mitigations, the moon example, chunk sizes, FAISS comparisons, ANN misses, BM25 and "TS-999", citations, the vector-store retention row, and the evaluation advice.

Suggested glossary terms: embedding, vector search (or vector index), chunk, retrieval-augmented generation, function calling / tool calling, prompt injection, agent, Model Context Protocol, JSON Schema, reranking, and recall at k.
