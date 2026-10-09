# Verification: round 4 "using AI" explainers (label `round4-verify-using-ai`, 2026-10-08)

Files checked:

- `content/pages/learn-how-models-use-tools.mdx`
- `content/pages/learn-retrieval-augmented-generation.mdx`
- Takeaways for both in `research/notes/round4-using-ai.md`

Method: each of the 30 external URLs cited across the two pages was fetched on 2026-10-08 with curl (`-A "USASI-factcheck/0.3"`, no other headers, no identifiers in any URL or payload). All returned HTTP 200, and each page title matched the page described. Text was extracted locally and every quoted phrase was searched for verbatim. Two extra official pages were fetched for checks: `https://genai.owasp.org/llm-top-10/` (now cited) and the Hugging Face model API for `google/embeddinggemma-300m` (gating status only, not cited). No browser was used, and no bot check or login was met or bypassed.

Both pages compile with `@mdx-js/mdx` after the edits. They use `<h2 id>` headings, end with Sources, and contain no tables or bare `<`, `>`, `{`, or `}` in prose. Prose word counts before Sources (headings and code excluded) are 1,478 for tools and 1,494 for RAG. Every internal link resolves. The `/open/` records model-context-protocol, openai-agents-sdk, agent-development-kit, faiss, and embeddinggemma-300m are all `publication_status: published`. The agents and data-and-datasets hubs are published. Each `/learn/` slug is in `lib/learn.ts`: agents-and-robotics maps to `learn-agents-robotics.mdx`, and the rest have matching MDX files. All glossary anchors are on the brief's list. Both fictional people (Riley and Priya) are labelled fictional.

## learn-how-models-use-tools.mdx

### Claims confirmed as written

- OpenAI function calling: "also known as tool calling"; strict mode makes calls "reliably adhere to the function schema, instead of being best effort"; function tools are defined by a JSON schema; outputs are referenced by `call_id`.
- Anthropic overview: "also called function calling". Client tools run in your application. Server tools (`web_search`, `web_fetch`, `code_execution`, `tool_search`) "run on Anthropic's infrastructure", and web search "returns the cited results in the same response". `strict: true` guarantees schema conformance. The "New York, NY" guess for "What's the weather?" is shown. The MCP connector is listed.
- Anthropic "How tool use works": "The model never executes anything on its own." The "agentic loop" is named and described as a while loop keyed on `stop_reason`.
- Gemini: the model "doesn't execute the function itself" and the application extracts the name and arguments and runs it. Best practices include "Validate function calls before executing." The Interactions API supports remote MCP servers. Google Search grounding: the model "generates one or multiple search queries and executes them". Code execution: the tool "enables the model to generate and run Python code".
- OpenAI tools guide: lists web search, file search, and remote MCP servers. File search guide: "a hosted tool managed by OpenAI".
- OpenAI Agents SDK docs: "a built-in loop that continues until the task is complete", plus built-in tracing. ADK (google.github.io/adk-docs returns 301 to https://adk.dev/): "the open-source agent development framework".
- MCP specification 2026-07-28:
  - Overview: "a standardized way to connect LLMs with the context they need"; host, client, and server roles; JSON-RPC 2.0; tools, resources, and prompts.
  - Security principles: hosts must obtain explicit user consent before invoking any tool; tool behavior descriptions are untrusted unless from a trusted server; MCP "cannot enforce these security principles at the protocol level".
  - Tools page: `name` and `inputSchema`; "SHOULD always be a human in the loop with the ability to deny tool invocations"; clients SHOULD show tool inputs, validate tool results before passing them to the LLM, and log tool usage for audit purposes.
  - Versioning page: "The current protocol version is 2026-07-28."
- OWASP LLM01:2025:
  - Definition: "in unintended ways".
  - Indirect injection: "accepts input from external sources, such as websites or files".
  - Scenario #2: hidden instructions lead to an image link that exfiltrates the conversation.
  - Prevention: "it is unclear if there are fool-proof methods of prevention".
  - Mitigations: least privilege, human approval, marking untrusted content, and adversarial testing.
- OWASP LLM06:2025: "make repeated calls to an LLM using output from previous invocations". The email summarizer needs only read access. Authorization belongs in downstream systems "rather than relying on an LLM to decide". Logging does not prevent excessive agency but helps find undesirable actions.
- JSON examples: both parse as valid JSON. The tool definition matches Anthropic's overview exactly: name, description, `input_schema`, the `location` property and its description, and `required`. The `tool_use` block matches the overview's printed result (`get_weather` with `{"location": "San Francisco, CA"}`) and the `tool_use` block structure that the overview shows elsewhere (type, id, name, input). The page notes that the ID is omitted.

### Changes made

1. Five-step list (step-by-step section). OpenAI's five steps are: make a request with tools, receive a tool call, execute code, make a second request with the tool output, and receive a final response or more tool calls. The page's list split step 1 in two and merged steps 3 and 4. It also said every tool gets "a JSON Schema", but Gemini documents "a subset of the OpenAPI schema", and the Anthropic pages read do not use the term.
   - Before: 1 Describe the tools / 2 Send the request / 3 Receive a tool call / 4 Run the tool and return the result / 5 Repeat or finish, with "a JSON Schema for its inputs".
   - After: 1 Send the request with tools (name, description, and a schema for inputs; "OpenAI defines function tools with JSON Schema, a standard format for this; Google's Gemini API supports a subset of the OpenAPI schema format.") / 2 Receive a tool call / 3 Run the tool / 4 Send the result back / 5 Receive the answer or more tool calls.
   - Sources: OpenAI function calling guide; Gemini function calling "Notes and limitations".
2. OWASP list name. No page uses the name "2025 Top 10 for LLM and generative AI security". The list's landing page heading is "2025 Top 10 Risk & Mitigations for LLMs and Gen AI Apps", and the entry pages' navigation shows "LLM TOP 10 FOR 2025" and "Top 10 for LLM and GenAI".
   - Before: "an entry in its 2025 Top 10 for LLM and generative AI security."
   - After: "an entry in its [2025 Top 10 Risk & Mitigations for LLMs and Gen AI Apps](https://genai.owasp.org/llm-top-10/)."
   - The landing page was added to Sources.
3. Overstatement.
   - Before: "which is exactly what tool results are."
   - After: "which is what many tool results are."
   - Not every tool result comes from an external website or file.
4. Ranking claim.
   - Before: "The central risk is **prompt injection**".
   - After: "A key risk is **prompt injection**".
   - No source read ranks the risks this way.
5. Logging.
   - Before: "logging does not prevent harm but helps find undesirable actions."
   - After: "logging will not prevent excessive agency but can help identify where undesirable actions are taking place."
   - Source: OWASP LLM06 ("will not prevent Excessive Agency, but can limit the level of damage").
6. MCP normative level.
   - Before: "so each application must build consent and authorization itself."
   - After: "so it says implementors should build consent and authorization flows into their applications."
   - Source: MCP spec Implementation Guidelines, where implementors "SHOULD" build them.

## learn-retrieval-augmented-generation.mdx

### Claims confirmed as written

- Anthropic models overview: "Reliable knowledge cutoff Jun 2026" for all four current models.
- OpenAI embeddings guide: text-embedding-3-large and -small "lack knowledge of events that occurred after September 2021". An embedding is "a vector (list) of floating point numbers". "The distance between two vectors measures their relatedness."
- Lewis et al. (arXiv 2005.11401, submitted 22 May 2020; v4 PDF): the provenance quote is verbatim in the abstract. The paper uses a seq2seq generator with a dense vector index of Wikipedia. The index "can be hot-swapped to update the model without requiring any retraining". Wikipedia was split into "disjoint 100-word chunks" (21M documents) and indexed with FAISS.
- Anthropic Contextual Retrieval (published Sep 19, 2024):
  - Definition of RAG, verbatim.
  - Under 200,000 tokens ("about 500 pages of material") can go in the prompt.
  - Chunks are "usually no more than a few hundred tokens".
  - Embeddings "can miss crucial exact matches", as in the "TS-999" example; BM25 uses lexical matching.
  - Traditional RAG can "remove context when encoding information", shown with a revenue chunk that does not name its company.
  - Added context is "usually 50-100 tokens", prepended before both embedding and BM25 indexing.
  - Reranking (top 150 to top 20) is a separate later step.
  - Domains tested: codebases, fiction, ArXiv and science papers.
  - "more information can be distracting for models"; "1 minus recall@20".
- OpenAI retrieval guide:
  - The moon example: 0% keyword similarity and the highest semantic similarity (65%).
  - Vector stores chunk files automatically, with `max_chunk_size_tokens` and `chunk_overlap_tokens`.
  - Attribute filtering can restrict a search "to a specific date range".
  - Example attribute `department: "finance"`.
  - Vector stores can have an expiration policy.
- OpenAI file search: "semantic and keyword search"; answers carry file citations.
- OpenAI data controls, `/v1/vector_stores` row: Data used for training "No"; Application state retention "Until deleted"; Zero Data Retention eligible "No".
- EmbeddingGemma model card (ai.google.dev, last updated 2025-09-25): "300M parameter"; "Maximum input context length of 2K"; 768 dimensions with 512, 256, or 128 via MRL; "on-device focus" for "mobile phones, laptops, or desktops"; separate query and document prompts.
- Sentence Transformers semantic search page:
  - Asymmetric search: a short query must find a longer paragraph; `encode_query` and `encode_document` are recommended.
  - The query is embedded "into the same vector space".
  - Approximate nearest neighbor search on millions of vectors: "results are not necessarily exact" and some similar vectors may be missed.
- InformationRetrievalEvaluator: takes queries, corpus, and relevant_docs, and measures Recall@k.
- FAISS README: "efficient similarity search and clustering of dense vectors"; index types trade off search time, search quality, and memory; developed primarily at Meta's FAIR.
- Anthropic prompting best practices (anchor `#long-context-prompting` exists): put long documents above the query, wrap each in tags with a `<source>`, and ask Claude to "quote relevant parts of the documents first".
- Anthropic citations: "valid pointers to the provided documents".
- OpenAI evaluation guide: typical, edge, and adversarial cases. The "Q&A over docs" example sets targets for context recall, context precision, and positively rated answers. "Vibe-based evals" are an anti-pattern. The guide recommends running evals on every change.
- OWASP LLM01: RAG does "not fully mitigate" prompt injection. Scenario #4 is a modified document in a RAG repository. The RAG Triad includes groundedness.

### Changes made

1. Term origin.
   - Before: "The term comes from a 2020 paper by Lewis and colleagues, [...]."
   - After: "A 2020 paper by Lewis and colleagues, [...], introduced models it called RAG."
   - The paper says "We introduce RAG models" but does not claim to have coined the term.
2. EmbeddingGemma version.
   - Before: "Google says [EmbeddingGemma](overview) generates embeddings on your hardware and "works without internet connection,""
   - After: "Google says the first version of [EmbeddingGemma](overview) generates embeddings directly on your hardware and "works without internet connection,""
   - The overview (last updated 2026-10-06) now leads with EmbeddingGemma 2, and the quote is in its "EmbeddingGemma 1" section.
3. Evaluation dataset.
   - Before: "suggests mixing real user questions, expert-written answers, and logs, with typical, edge, and adversarial cases."
   - After: "suggests mixing production data from users, correct answers written by domain experts, and historical logs, and including typical, edge, and adversarial cases."
   - Source wording: "production data (collected from users' satisfaction with answers...), hard-coded correct answers to questions created by domain experts, and historical data from logs".
4. Disclaimer added to the privacy section, which quotes a provider's retention terms. It follows the brief's tone rule and the model explainers:
   - Added: "Terms change; this is general information, not legal advice."

## Notes file takeaways

- Tools takeaway 3.
  - Before: "MCP's security principles require user consent before any tool runs, but the protocol cannot enforce them, so each application must build consent itself."
  - After: "MCP's security principles say hosts must get user consent before invoking any tool, but the protocol cannot enforce this, so implementors should build it in." (157 characters)
  - The change follows correction 6 above.
- Tools takeaways 1 and 2 and all three RAG takeaways restate the pages accurately. No change.

## Writer's flags re-checked

- The EmbeddingGemma Hugging Face card is gated: confirmed (raw README HTTP 401; model API `gated: manual`). Using Google's ai.google.dev model card is appropriate.
- The overview leads with EmbeddingGemma 2 and gives version 1 as 308M, while the card gives 300M: confirmed. The overview's own EmbeddingGemma 2 section also says the base was reduced "from 300M parameters down to 270M", so Google uses both figures. The page follows the card, and the catalog record already notes the 308M vs 300M difference.
- OWASP list name: the writer's phrase was not verbatim. It is now the landing page's own heading (see correction 2).

## Could not verify, or for the editor

- No claim is left unverified.
- "Use one embedding model for both" (queries and documents) is the writer's inference from "the query is embedded into the same vector space". I kept it as reasonable advice.
- The page states that hosted tools pass data through the provider, so its data policy applies. This is an inference and is supported by the internal hosted-or-local page.
- Editor decision: Google now presents EmbeddingGemma 2 (740M, multimodal, Apache 2.0) as the current model. The catalog covers only `embeddinggemma-300m` (version 1). Consider whether the catalog or this page should mention version 2.
