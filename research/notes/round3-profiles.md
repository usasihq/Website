# Round 3: organization profile blocks (2026-10-01)

Scope: added a `profile` block (intended_users, access_overview, limitations,
resources) to 10 existing organization records, following `openai.yml`. Every
profile claim and resource cites a new `review-*` source fetched and read on
2026-10-01 (`accessed_at` and `reviewed_at` 2026-10-01). Each file's
`updated_at` is now 2026-10-01. `last_reviewed` is unchanged (2026-09-29)
because the rest of each record was not re-audited. No other existing content,
careers blocks, or sources were changed. A diff against pre-edit copies shows
that the only removed line in each file is the old `updated_at`.

Validation: `npx tsx scripts/validate.ts` gives 0 errors. There is 1 warning,
which predates this work and is outside these files
(`artifacts/continue-extension.yml`).

Every limitations text ends with "This profile is not a complete product or
rights audit."

---

## anthropic.yml

- **Added:** profile with intended users (Free/Pro/Max, Team/Enterprise, API
  developers), hosted-only access (apps, Claude API/Console, Bedrock, Google
  Cloud, Microsoft Foundry), and limitations (no public models on Hugging Face;
  Usage Policy; Claude Mythos invitation-only; Bedrock/Google Cloud set their
  own pricing and retirement dates). 4 resources.
- **Sources:** review-claude-pricing (claude.com/pricing),
  review-platform-docs (platform.claude.com/docs/en/home),
  review-models-overview (platform.claude.com/docs/en/models/overview),
  review-api-pricing (platform.claude.com/docs/en/about-claude/pricing),
  review-usage-policy (anthropic.com/legal/aup, effective 2025-09-15),
  review-hf-anthropic (huggingface.co/Anthropic: 0 public models, 14 datasets).
- **Possibly outdated existing claims:** none found. The API product text
  lists Bedrock, Google Cloud, and Foundry. The docs now also list an
  Anthropic-operated "Claude Platform on AWS"
  (https://platform.claude.com/docs/en/models/overview). That is an omission,
  not an error.

## google.yml

- **Added:** profile covering the Gemini API audience (developers; enterprise
  routed to Gemini Enterprise Agent Platform; terms require age 18+ and
  professional/business use), hosted access (Gemini app, AI Studio, Gemini API
  free/paid tiers, Enterprise Agent Platform), and limitations (free-tier data
  may be used for product improvement and human review, paid tier not; paid
  services required for EEA/CH/UK; Prohibited Use Policy). Gemma is pointed to
  the Google DeepMind record. 3 resources.
- **Sources:** review-gemini-docs, review-gemini-pricing,
  review-gemini-terms (last modified 2026-03-23), review-gdm-models
  (deepmind.google/models/).
- **Possibly outdated existing claims:** none found.

## google-deepmind.yml

- **Added:** profile covering Gemma for developers, Gemma download routes
  (Kaggle, Hugging Face, local, Google Cloud), and hosted families (Gemini,
  Veo, Lyria via the Gemini app, AI Studio, and Enterprise Agent Platform).
  Limitations: Gemma 4 is Apache 2.0, while earlier Gemma models and variants
  (EmbeddingGemma, ShieldGemma, etc.) are under the Gemma Terms of Use
  (last modified 2026-04-01) with a prohibited use policy. 4 resources.
- **Sources:** review-gdm-models, review-gemma-docs, review-gemma-4-card,
  review-gemma-4-license, review-gemma-terms, review-hf-google.
- **Possibly outdated existing claims:** none found. Note that `products: []`
  remains, although https://deepmind.google/models/ lists many hosted
  families, and the existing record says the Gemini app team joined Google
  DeepMind. This is a scope choice to revisit, not an error.

## meta.yml

- **Added:** profile covering the Meta Model API (self-serve, usage-priced,
  public preview) and Muse Glimmer (commercial and research use, on-device
  agents). Access: no Muse Spark weights in the meta-models Hugging Face
  organization; Glimmer downloads are ungated; Llama downloads need license
  acceptance and approval. Limitations: Apache 2.0 for Glimmer versus custom
  Llama licenses with acceptable use policies; the Llama 4 license requires
  "Built with Llama" attribution and a separate license above 700M MAU.
  4 resources.
- **Sources:** review-model-api, review-model-api-docs, review-glimmer-card,
  review-hf-meta-models, review-llama-models, review-llama4-license.
- **Notes and possibly outdated items:**
  - https://www.llama.com/ now redirects (301) to https://developer.meta.com/ai/,
    which redirects (302) to https://dev.meta.ai/. meta.yml does not cite
    llama.com, but any other record that does should be checked. A grep found
    no llama.com citations in content; the only match was "ollama.com".
  - https://dev.meta.ai/ lists a "Muse Code" terminal agent, and
    https://dev.meta.ai/docs/ lists Muse Spark 1.3/1.2/1.1, Muse Image, Muse
    Voice Transcribe, and SAM 3.1. It also says the API is compatible with the
    Anthropic SDK as well as the OpenAI SDK. The existing product text
    ("compatible with the OpenAI SDK") is incomplete but not wrong.
  - The pricing page https://dev.meta.ai/docs/pricing requires sign-in, so
    the product page is used as the pricing resource.

## microsoft.yml

- **Added:** profile covering Foundry's audience (start-ups through IT and
  security teams) and Phi for on-device developers. Access: Foundry can be
  explored without an account, building needs an Azure subscription, and each
  service is billed separately; MAI models (e.g. MAI-Thinking-1) are listed
  as preview models sold by Azure; Phi is also on Hugging Face and Ollama.
  Limitations: models sold by Azure (Microsoft-supported, Azure SLAs) versus
  partner and community models; the Phi-4 card states MIT and advises
  evaluation before high-risk use. 4 resources.
- **Sources:** review-foundry, review-foundry-pricing, review-foundry-docs
  (canonical learn.microsoft.com/en-us/azure/foundry/), review-foundry-models-azure,
  review-phi, review-phi-4-card.
- **Possibly outdated existing claims:**
  - The notable fact and openness_summary describe MAI models only as the
    August 2025 MAI-Voice-1 and MAI-1-preview. The MAI lineup has since
    expanded. https://microsoft.ai/models/ lists MAI-Voice-2.1,
    MAI-Transcribe-2, MAI-Thinking-1, MAI-Code-1.1-Flash, MAI-Image-2.6, and
    MAI-Cyber-1-Flash. Foundry docs list MAI-Thinking-1 and MAI-Image-2.x as
    preview models sold by Azure
    (https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure).
    The existing text is historically accurate but no longer current.

## nvidia.yml

- **Added:** profile covering Nemotron (agent developers) and NIM (developers
  and enterprises). Access: Nemotron is on Hugging Face and on
  build.nvidia.com hosted endpoints, with some datasets and recipes; NIM can
  be tried free through the Developer Program and self-hosted. Limitations:
  Nemotron 3 Super uses the NVIDIA Nemotron Open Model License and
  Nemotron 3.5 Lightning uses OpenMDW-1.1; production NIM needs NVIDIA AI
  Enterprise. 4 resources.
- **Sources:** review-nemotron, review-nim, review-build, review-hf-nvidia,
  review-nemotron-super-card, review-nemotron-lightning-card.
- **Possibly outdated existing claims:** none found. The Hugging Face org page
  confirmed verification, but its rendered summary did not give a model
  count. No count is used.

## amazon.yml

- **Added:** profile covering Bedrock (startups to enterprises building
  generative AI apps and agents) and Nova (organizations of all sizes).
  Access: Bedrock is fully managed, with models from Amazon, Anthropic,
  DeepSeek, OpenAI, xAI, and others via AWS APIs; Nova 2 is accessed through
  Bedrock and supports fine-tuning. Limitations: pricing depends on modality,
  provider, model, and Region; Amazon's Hugging Face org lists Chronos and
  other models but no Nova weights. 3 resources.
- **Sources:** review-bedrock, review-bedrock-docs, review-bedrock-pricing,
  review-nova, review-nova2-guide, review-hf-amazon.
- **Possibly outdated existing claims:** none found. The Nova 2 guide also
  lists Nova Multimodal Embeddings, which the product text omits; that is not
  an error.

## apple.yml

- **Added:** profile covering the Foundation Models framework (Swift API for
  app developers) and MLX (for ML researchers). Access: the framework
  documents on-device and Private Cloud Compute models from OS 26 / watchOS
  27; Small Business Program apps under 2M first-time downloads get PCC
  models at no cloud API cost; research weights (FastVLM, OpenELM) are on
  Hugging Face. Limitations: requires an Apple Intelligence-capable device,
  with language and region limits; FastVLM-7B uses the Apple ML Research Model
  License (non-commercial research only); MLX is MIT. 4 resources.
- **Sources:** review-apple-dev-intelligence, review-fm-docs (the JSON data
  form of the docs page, because the HTML page does not render for fetch),
  review-apple-intelligence, review-mlx, review-hf-apple,
  review-fastvlm-license.
- **Caveat:** the "Foundation Models framework documentation" resource links
  to the human-readable https://developer.apple.com/documentation/foundationmodels
  but cites the JSON source that was actually read. The existing product entry
  uses the same pattern.
- **Possibly outdated existing claims:**
  - The summary says developers "can reach Apple's on-device model through the
    Foundation Models framework". The framework docs now also cover Private
    Cloud Compute models
    (https://developer.apple.com/tutorials/data/documentation/foundationmodels.json;
    https://developer.apple.com/apple-intelligence/).
  - The openness_summary says "This catalog has not assessed Apple model
    weight releases", but the catalog now has published Apple artifacts
    (`fastvlm`, `fastvlm-7b`, `openelm`, `openelm-3b-instruct`). That
    statement is stale.
  - `sectors: [research]` may be narrow given the products; this is an
    editorial choice, not a factual error.

## xai.yml

- **Added:** profile covering the API audience (code, text, voice, image, and
  video developers) and access (current Grok models such as grok-4.7 via the
  xAI API with keys and OpenAI-compatible SDKs, billed per token, image, or
  second of video; Hugging Face lists only Grok-1 and Grok 2). Limitations:
  Grok-1 is Apache 2.0; the Grok 2 xAI Community License (updated 2025-11-04)
  ties commercial use to the AUP and bars training other general-purpose
  models on the materials or outputs. 3 resources.
- **Sources:** review-xai-docs, review-xai-models, review-xai-pricing,
  review-hf-xai, review-grok-1-card, review-grok-2-license.
- **Possibly outdated existing claims:** none found. Bedrock docs
  (https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
  say Grok 4.6 is available on Amazon Bedrock, which is a third-party access
  route the record does not mention. This is an omission only.

## hugging-face.yml

- **Added:** profile covering plans (free Hub, PRO, Team, Enterprise) and paid
  compute. Access: Git-based model, dataset, and Spaces repositories;
  Inference Providers passes provider rates through with plan-based monthly
  credits; Transformers is Apache 2.0. Limitations: repository owners set
  licenses in card metadata, and the Hub docs ask users to respect each
  project's license; hosting is not authorship. 4 resources.
- **Sources:** review-hf-pricing, review-hub-docs, review-hub-licenses,
  review-ip-pricing, review-transformers.
- **Possibly outdated existing claims:** none found. The NVIDIA acquisition is
  still described as pending, expected to close in the first half of 2027. A
  2026-10-01 search found no closing announcement. The profile does not
  repeat the acquisition (status_note covers it), so no new acquisition
  source was cited.

---

## Cross-cutting

- No funding, valuation, user, download, or benchmark figures were added.
  Pages that showed such figures (Bedrock customer count, Hugging Face model
  counts, Phi-4 downloads) were not used for them.
- No new artifact, organization, or other files were created besides this
  notes file.
