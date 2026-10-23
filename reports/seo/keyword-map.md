# Keyword map

Which searches each USASI page is written to answer, and what it shows in results.
Titles, H1s, and descriptions below are copied from the built pages (`out/`), not
typed by hand; regenerate the tables after a content change rather than editing them.

How titles are made (see `lib/seo.ts`):

- Titles name the record first and then what people search for about it, from the
  record's own fields: `{model}: license, openness & downloads` (open-weight
  releases), `… license, access & openness` (gated weights), `{family} models:
  releases, licenses & openness`, `{tool}: license, openness & source code`,
  `{dataset} dataset: license & access`, `{organization}: open models, products & key
  facts` (wording follows what the record has), `AI companies & labs in {State}`,
  `{license}: what it allows for AI models`, `{person}: career and role at {org}`.
- Each builder tries longer to shorter forms; the first that fits in 60 characters
  wins. ` · USASI` is added only when the whole title still fits in 60.
- Descriptions are at most 160 characters and lead with the answer: maker, openness
  tier, license, and release date as recorded, then the summary's first sentence if
  it fits. Nothing is stated that the record does not already say with a source.
- H1s keep the entity name on record pages. Directory and state pages, whose H1s were
  bare labels, now match their titles.

"Difficulty" is a judgment of competition, not a measured value: no keyword tool was
used. Long-tail record queries (`<model> license`, `AI companies in <state>`) are the
first targets; head terms (`open source AI models`) are listed so the directories
have a clear job, not because they are expected to rank soon.

## Model releases, families, and tools: `<name> license`

Difficulty: low (long-tail, one record per query).

| Target query | URL | Title | H1 | Meta description | Notes |
| --- | --- | --- | --- | --- | --- |
| llama 3.1 8b license | `/open/llama-3-1-8b/` | Llama 3.1 8B: license, access & openness · USASI | Llama 3.1 8B | Llama 3.1 8B is a model from Meta, released Jul 23, 2024. Its weights are gated: access by request or approval. License: Llama 3.1 Community License Agreement. | Gated weights per the record, so the title says access, not downloads |
| gpt-oss-20b license | `/open/gpt-oss-20b/` | gpt-oss-20b: license, openness & downloads · USASI | gpt-oss-20b | gpt-oss-20b is an open-weight model from OpenAI, released Aug 2025. License: Apache-2.0. |  |
| gpt-oss license / openai open weights models | `/open/gpt-oss/` | gpt-oss models: releases, licenses & openness · USASI | gpt-oss | gpt-oss is a model family from OpenAI. USASI assesses 2 releases: gpt-oss-120b and gpt-oss-20b. Weights licenses: Apache-2.0. | Family page lists both releases |
| gemma 4 31b license | `/open/gemma-4-31b/` | Gemma 4 31B: license, openness & downloads · USASI | Gemma 4 31B | Gemma 4 31B is an open-weight model from Google DeepMind and Google (Alphabet), released Mar 31, 2026. License: Apache-2.0. |  |
| olmo 3 license / olmo open source | `/open/olmo/` | OLMo models: releases, licenses & openness · USASI | OLMo | OLMo is a model family from Ai2 (Allen Institute for AI). USASI assesses 3 releases: Olmo 3 7B (base), Olmo 3 7B Instruct, and Olmo 3.1 32B Think. |  |
| granite 4.2 8b license | `/open/granite-4-2-8b/` | Granite 4.2 8B: license, openness & downloads · USASI | Granite 4.2 8B | Granite 4.2 8B is an open-weight model from IBM, released Aug 25, 2026. Licenses: Apache-2.0 (weights and code) and CDLA-Permissive-2.0 (docs). |  |
| nemotron 3 super license | `/open/nemotron-3-super-120b-a12b/` | NVIDIA Nemotron 3 Super 120B-A12B: license & downloads | NVIDIA Nemotron 3 Super 120B-A12B | NVIDIA Nemotron 3 Super 120B-A12B is an open-weight model from NVIDIA, released Mar 11, 2026. Licenses: NVIDIA Nemotron Open Model License (weights) and… | Name too long for the full pattern; shorter form used |
| phi-4 license | `/open/phi/` | Phi models: releases, licenses & openness · USASI | Phi | Phi is a model family from Microsoft. USASI assesses 2 releases: Phi-4-mini-flash-reasoning and Phi-4-reasoning-vision-15B. Weights licenses: MIT. |  |
| whisper large v3 license | `/open/whisper-large-v3/` | Whisper large-v3: license, openness & downloads · USASI | Whisper large-v3 | Whisper large-v3 is an open-weight model from OpenAI, released Nov 6, 2023. Licenses: MIT (weights and code) and Apache-2.0 (weights). |  |
| vllm license | `/open/vllm/` | vLLM: license, openness & source code · USASI | vLLM | vLLM is a runtime from PyTorch Foundation and The Linux Foundation. License: Apache-2.0. Its source code is public. |  |
| ollama license / ollama open source | `/open/ollama/` | Ollama: license, openness & source code · USASI | Ollama | Ollama is a runtime from Ollama Inc. License: MIT. Its source code is public. |  |
| llama.cpp license | `/open/llama-cpp/` | llama.cpp: license, openness & source code · USASI | llama.cpp | llama.cpp is a runtime from Hugging Face. License: MIT. Its source code is public. |  |
| model context protocol license | `/open/model-context-protocol/` | Model Context Protocol: license, openness & source code | Model Context Protocol (MCP) | Model Context Protocol (MCP) is a framework from Agentic AI Foundation (AAIF), The Linux Foundation, and others. Licenses: Apache-2.0 (code), MIT (code), and… |  |
| dolma dataset license | `/open/dolma/` | Dolma dataset: license & access · USASI | Dolma | Dolma is a dataset from Ai2 (Allen Institute for AI), released Aug 18, 2023. Licenses: ODC-By-1.0 (data) and Apache-2.0 (code). The data is publicly available. |  |

## Organizations: `<company> open weights`, `<company> open source models`

Difficulty: low to medium. Titles say "open models" only when the catalog lists model records for the organization, "open-source tools" when it lists no models but at least one tool under an OSI-approved license (otherwise "open tools" or "open datasets"), and "AI products" when it lists no open records.

| Target query | URL | Title | H1 | Meta description | Notes |
| --- | --- | --- | --- | --- | --- |
| meta open weights / meta open source models | `/companies/meta/` | Meta: open models, products & key facts · USASI | Meta | Meta is an AI model developer and research lab. In the catalog: 10 open model releases, 4 software projects, and 1 evaluation tool. |  |
| openai open weights models | `/companies/openai/` | OpenAI: open models, products & key facts · USASI | OpenAI | OpenAI is an AI model developer and research lab. In the catalog: 7 open model releases, 5 software projects, and 2 evaluation tools. |  |
| nvidia open models | `/companies/nvidia/` | NVIDIA: open models, products & key facts · USASI | NVIDIA | NVIDIA is a chip designer and AI model developer. In the catalog: 11 open model releases, 7 software projects, and 1 dataset. |  |
| google open models | `/companies/google/` | Google (Alphabet): open models, products & key facts · USASI | Google (Alphabet) | Google (Alphabet) is an AI model developer and research lab. In the catalog: 9 open model releases and 10 software projects. |  |
| microsoft open source ai models | `/companies/microsoft/` | Microsoft: open models, products & key facts · USASI | Microsoft | Microsoft develops and sells software, cloud services, and devices. In the catalog: 4 open model releases and 6 software projects. |  |
| ai2 open models | `/companies/ai2/` | Ai2 (Allen Institute for AI): open models & key facts | Ai2 (Allen Institute for AI) | Ai2 is a non-profit AI research institute in Seattle, founded in 2014 by Paul Allen. In the catalog: 5 open model releases, 1 software project, and 1 dataset. |  |
| ibm open source ai models | `/companies/ibm/` | IBM: open models, products & key facts · USASI | IBM | IBM is a publicly traded technology company. In the catalog: 3 open model releases and 2 software projects. Headquarters: Armonk, New York. |  |
| apple open source ai models | `/companies/apple/` | Apple: open models, products & key facts · USASI | Apple | Apple is a consumer products company and hardware maker headquartered in Cupertino, California. In the catalog: 2 open model releases and 2 software projects. |  |
| anthropic open source | `/companies/anthropic/` | Anthropic: open-source tools, products & key facts · USASI | Anthropic | Anthropic is an AI model developer and research lab headquartered in San Francisco, California. In the catalog: 1 software project and 1 evaluation tool. | No model weights in the catalog; title says open-source tools |

## Directories, places, and data

Difficulty: `AI companies in <state>` low; directory head terms (`open source AI models US`, `US AI companies directory`) medium to high.

| Target query | URL | Title | H1 | Meta description | Notes |
| --- | --- | --- | --- | --- | --- |
| open source ai models us / american open weight models | `/open/` | U.S. open-source & open-weight AI models and tools · USASI | U.S. open models & tools | Directory of 96 model releases, 95 software projects, 9 datasets, and 16 evaluation tools from U.S. organizations: licenses, openness tiers, and sources. |  |
| us ai companies directory / american ai companies list | `/companies/` | U.S. AI companies & labs directory · USASI | U.S. AI companies & labs | Directory of 150 U.S. AI companies, labs, research units, and foundations: products, open models, headquarters, and eligibility, each with sources. |  |
| ai companies in california | `/places/california/` | AI companies & labs in California · USASI | AI companies & labs in California | 95 AI companies, labs, and research organizations in the USASI catalog are headquartered in California. They include NVIDIA, Google (Alphabet), and Meta. |  |
| ai companies in georgia | `/places/georgia/` | AI companies & labs in Georgia · USASI | AI companies & labs in Georgia | One AI organization in the USASI catalog is headquartered in Georgia: Georgia Institute of Technology. |  |
| ai companies in texas | `/places/texas/` | AI companies & labs in Texas · USASI | AI companies & labs in Texas | 7 AI companies, labs, and research organizations in the USASI catalog are headquartered in Texas. They include Apptronik and Dell Technologies. |  |
| ai companies in new york | `/places/new-york/` | AI companies & labs in New York · USASI | AI companies & labs in New York | 9 AI companies, labs, and research organizations in the USASI catalog are headquartered in New York. They include Hugging Face, IBM, and Nomic AI. |  |
| ai companies in washington dc | `/places/district-of-columbia/` | AI companies & labs in Washington, D.C. · USASI | AI companies & labs in Washington, D.C. | One AI organization in the USASI catalog is headquartered in Washington, D.C.: EleutherAI. |  |
| ai companies by state | `/places/` | AI companies & labs by U.S. state · USASI | AI companies & labs by U.S. state | Find AI companies, labs, and research organizations by the U.S. state of their documented headquarters: 19 states and 140 organizations, with sources. |  |
| compare ai labs openness | `/matrix/` | Compare U.S. AI labs: open-weight models & openness · USASI | Compare | Comparison workspace for the USASI catalog: documented hosted products, public-weight model releases, training materials, and software, dataset, and… |  |
| us ai timeline / open model release timeline | `/timeline/` | U.S. AI timeline: open model releases & news by date · USASI | Timeline | Model, software, dataset, and evaluation-tool releases and news events in the USASI catalog, by documented date. A navigation aid, not a ranking of importance. |  |
| jobs at ai companies / ai lab jobs | `/jobs/` | Jobs at U.S. AI companies & labs · USASI | Jobs | Current positions at U.S. AI companies and labs documented by USASI, collected from authoritative employer career sources. Apply directly with the employer. | Title only; /jobs/* landing pages are being built by another agent |
| ai companies dataset csv / ai models dataset download | `/reuse/` | USASI catalog data: JSON & CSV downloads (CC BY 4.0) · USASI | Data and reuse | Download the USASI catalog of U.S. AI organizations and open models as JSON or CSV, see what the files contain and how dates work, and reuse it under CC BY 4.0. |  |

## Licenses: `<license> commercial use`

Difficulty: low to medium. The guides restate the license text and say they are not legal advice; titles say "what it allows" rather than promising a yes/no answer.

| Target query | URL | Title | H1 | Meta description | Notes |
| --- | --- | --- | --- | --- | --- |
| llama 3.1 license commercial use | `/licenses/llama-3-1-community/` | Llama 3.1 Community License: what it allows for AI models | Llama 3.1 Community License Agreement | The Llama 3.1 Community License Agreement is Meta's license for the Llama 3.1 models, code, weights, and documentation, which it calls the "Llama Materials." |  |
| llama 4 license commercial use | `/licenses/llama-4-community/` | Llama 4 Community License: what it allows for AI models | Llama 4 Community License Agreement | The Llama 4 Community License Agreement is Meta's license for the Llama 4 models, code, weights, and documentation, which it calls the "Llama Materials." |  |
| gemma terms of use commercial use | `/licenses/gemma-terms-of-use/` | Gemma Terms of Use: what it allows for AI models · USASI | Gemma Terms of Use | The Gemma Terms of Use are Google's terms for the Gemma models listed in the appendix of the terms page, among them Gemma 1 through Gemma 3, Gemma 3n… |  |
| apache 2.0 commercial use ai model | `/licenses/apache-2-0/` | Apache License 2.0: what it allows for AI models & code | Apache License 2.0 | The Apache License, Version 2.0, dated January 2004, is a permissive license published by the Apache Software Foundation for software and other works of… |  |
| mit license ai model commercial use | `/licenses/mit/` | MIT License: what it allows for AI models & code · USASI | MIT License | The MIT License is a short permissive license for software. Permissive open-source license (SPDX MIT). Used by 60 records in the catalog. |  |
| cc by-nc-sa 4.0 commercial use | `/licenses/cc-by-nc-sa-4-0/` | CC-BY-NC-SA-4.0: what it allows for AI models · USASI | Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International | Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) is a public license published by Creative Commons. |  |
| nvidia open model license commercial use | `/licenses/nvidia-open-model-license/` | NVIDIA Open Model License: what it allows for AI models | NVIDIA Open Model License Agreement | The NVIDIA Open Model License Agreement is NVIDIA Corporation's license for models it releases under it; the version on NVIDIA's agreements page was last… |  |
| openmdw license | `/licenses/openmdw-1-1/` | OpenMDW License, version 1.1: what it allows for AI models | OpenMDW License Agreement, version 1.1 | The OpenMDW License Agreement, version 1.1 (OpenMDW-1.1) is a license for "Model Materials": one or more machine learning models, including architecture and… |  |
| ai model licenses explained | `/licenses/` | AI licenses explained: model, software & data licenses | License guide | Plain-language guides to the licenses on U.S.-led open models, software, and datasets: what each says about use, attribution, restrictions, and derivatives. |  |

## Explainers, hubs, glossary, FAQ

Difficulty: medium (general questions with many answers). Explainer H1s keep their own titles; only the `<title>` is phrased as the question.

| Target query | URL | Title | H1 | Meta description | Notes |
| --- | --- | --- | --- | --- | --- |
| open weight vs open source | `/learn/open-weight-vs-open-source/` | Open weight vs. open source AI: what's the difference? | What open weight and open source actually mean | If I can download a model, what am I allowed to do with it? A download link shows that the files are available, not what you may do with them. |  |
| how to read a model card | `/learn/how-to-read-a-model-card/` | How to read an AI model card · USASI | How to read a model card | What should I check before relying on a model? A model card is the publisher's own account of what a model is, how it was made, and where it falls short. |  |
| what is rag | `/learn/retrieval-augmented-generation/` | What is RAG? Retrieval-augmented generation explained | Retrieval-augmented generation (RAG) | How do AI systems answer questions about documents they were never trained on? |  |
| quantization explained | `/learn/quantization/` | Quantization: running AI models on smaller hardware · USASI | Quantization: fitting models on smaller hardware | How can a large model run on a laptop, and what do you give up? |  |
| what hardware do i need to run an llm | `/learn/inference-hardware/` | What hardware do you need to run an AI model? · USASI | Understanding inference hardware | What determines whether a model can run on my hardware? Fitting is not the same as running well: treat any single memory figure as a starting point, then test. | Per-VRAM pages are planned by another agent |
| hosted api vs local llm | `/learn/hosted-or-local/` | Hosted AI API or local model: how to choose · USASI | Choosing hosted access or local inference | Should I use an API or run a model on my own machine? With hosted access, the provider's data policy sets the privacy boundary, so read its current version. |  |
| function calling explained | `/learn/how-models-use-tools/` | How AI models use tools: function calling explained · USASI | How AI models use tools | What actually happens when a chatbot searches the web, runs code, or calls an app? |  |
| do ai chatbots train on my data | `/learn/ai-and-your-data/` | Do AI services keep or train on what you type? · USASI | What happens to what you type into an AI service | Does an AI service keep my conversations or use them to train its models? |  |
| local ai tools list / run ai locally | `/hubs/local-ai/` | Running AI on your own hardware · USASI | Running AI on your own hardware | How running AI models on your own computer or device works: local runtimes, on-device frameworks, quantization, and what to check about an open-weight model… | Hub, not a list page; see gaps |
| ai agent frameworks open source | `/hubs/agents/` | AI agents and agent tooling: U.S. organizations & open tools | AI agents and agent tooling | What separates an agent from a model, and the open protocols, SDKs, and coding agents used to build agents, including the Model Context Protocol, A2A, and… |  |
| ai glossary | `/glossary/` | AI glossary: open weights, quantization, RAG & more · USASI | Glossary | Plain-language definitions of AI terms, from open weights and model cards to quantization and RAG, each with how the catalog uses it and a real example. |  |
| ai faq / is chatgpt open source | `/faq/` | AI FAQ: open-source models, running AI locally & more | Frequently asked questions | Short, sourced answers to common questions about AI and about USASI, each linking to a longer explainer or the original documents. |  |

## Planned elsewhere (other work in progress, not built here)

| Target queries | Planned URL | Owner / status |
| --- | --- | --- |
| `AI jobs`, `machine learning engineer jobs at AI labs`, `AI jobs in <city>`, `remote AI jobs` | `/jobs/*` landing pages | Being built by another agent. `/jobs/` itself now has the title "Jobs at U.S. AI companies & labs"; its H1 was left as "Jobs" so that work can set it. |
| `models you can run on 8 GB VRAM`, `LLM for 12 GB / 16 GB / 24 GB GPU`, `<model> VRAM requirements` | hardware pages ("models you can run on N GB VRAM") | Being built by another agent. Until then, `/learn/inference-hardware/` ("What hardware do you need to run an AI model?") and `/learn/quantization/` answer the general question. |
| `<executive order / policy> full text`, `<policy> summary` | `/policy/<slug>/` per document | Being built by another agent. `/policy/` was not changed here. |
| `what is super intelligence`, `superintelligence meaning` | a "super intelligence" explainer | Owned by another agent. The FAQ already answers "What do 'AGI' and 'superintelligence' mean?". |

## Gaps (no page matches the query well yet)

| Target queries | Why it is a gap | Possible page |
| --- | --- | --- |
| `local AI tools list`, `open source LLM runtimes`, `run LLM locally tools` | `/hubs/local-ai/` explains local AI and features some runtimes, but the full list exists only as a filtered directory view (`/open/?kind=runtime`), whose canonical URL is `/open/`. | An indexable list page per kind (runtimes, datasets, evaluation tools), built from the same filters. |
| `open source AI datasets`, `AI benchmark list` | Same: filtered views only. | As above. |
| `AI companies in San Francisco`, `AI startups in Boston` | Place pages stop at the state. Headquarters labels do name cities, so city pages could be built from the same sourced field. | `/places/<state>/<city>/` for cities with several records. |
| `<license> commercial use` for licenses without a guide | `/licenses/` lists licenses used in the catalog that have no guide yet. | More guides, written from the license text. |
| `<model A> vs <model B>` | The comparison workspace compares organizations, not individual releases. | A release-to-release comparison view (facts side by side, no scores). |
| `<company> headquarters`, `<company> founded` | Answered on organization pages ("At a glance" and the first paragraph), but not in their titles, which focus on open models and products. | None needed; watch Search Console queries before changing titles. |

## Structured data now on each page type

| Page type | JSON-LD |
| --- | --- |
| Home | Organization (USASI), WebSite with SearchAction, Dataset (same `@id` as /reuse/) |
| Organization pages | Organization (official website, legal name, founding year, address from the headquarters label, parent/units, `sameAs` only for the record's own GitHub or Hugging Face profile links), BreadcrumbList |
| Open model & tool pages | BreadcrumbList; SoftwareSourceCode for frameworks, runtimes, and research stacks (repository, license URL, maintainers) |
| Directories, places, state pages, license guide index, hubs | ItemList (every entry with position, name, and URL) |
| Job detail pages (`/jobs/at/<employer>/<slug>/`) | JobPosting (when the listing qualifies) and BreadcrumbList |
| Jobs directory (`/jobs/`) and landing pages | CollectionPage and ItemList; never JobPosting |
| Hub, license guide, explainer, news, kids, newsletter pages | BreadcrumbList (plus existing Article / LearningResource / Course where present) |
| Glossary | DefinedTermSet (existing) |
| FAQ | FAQPage (existing) |
| Data and reuse | Dataset: catalog.json and the three Hugging Face CSV tables, CC BY 4.0 |

`npm run build` fails if any block is invalid JSON, lacks `@context`/`@type`, has a
list entry without position, name, and absolute link, or if a detail page has no
BreadcrumbList (`scripts/postbuild.mjs`, section 3).
