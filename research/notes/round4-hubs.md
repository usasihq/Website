# Round 4 hubs (label: round4-hubs, 2026-10-08)

Assignment: three new reference hubs in `content/hubs/`. The catalog had enough published records
for all three, so all three were created and set to `publication_status: published`, with
`updated_at` and `last_reviewed` set to 2026-10-08. I created only these three hub files and this notes
file. I edited no existing files.

`npx tsx scripts/validate.ts` reports 0 errors. Its only warning is the existing one about
`artifacts/continue-extension.yml`.

Every cited source was fetched and read on 2026-10-08 with curl, using the generic User-Agent
`USASI-catalog-research/0.3`. No email address, name, or other identifier was put in any URL,
header, or payload. No CAPTCHA, login, or bot check was met or bypassed. Each source has
`accessed_at: 2026-10-08`, and each intro claim has `reviewed_at: 2026-10-08`.

| Hub | Intro claims | Reading path | Directory links | Featured (orgs / artifacts / people) | Primary docs | Sources |
| --- | --- | --- | --- | --- | --- | --- |
| safety-and-security | 6 | 9 | 5 | 5 / 7 / 0 | 10 | 20 |
| developer-tools | 5 | 9 | 5 | 6 / 12 / 4 | 10 | 13 |
| speech-vision-and-multimodal | 6 | 9 | 4 | 5 / 10 / 0 | 9 | 13 |

The site already expects these three slugs. `components/learn/HubIcon.tsx` has icons for them, and
`lib/learn.ts` links `developer-tools` from a learning path.

## 1. safety-and-security: "AI safety, security, and trust"

**Featured organizations:** nist, metr, mlcommons, center-for-ai-safety, far-ai.

**Featured artifacts:** dioptra, petri, hawk, ailuminate, gpt-oss-safeguard, gpt-oss, synthid-bio.

**Intro topics, in order:**
1. NIST AI RMF: the four functions, voluntary use, and the revision under the AI Action Plan. Also
   Dioptra and CAISSI.
2. Developer frameworks: OpenAI Preparedness Framework v2, Google DeepMind Frontier Safety
   Framework, and Anthropic RSP v3.4. Also the gpt-oss model card's adversarial fine-tuning tests.
3. Testing tools: Petri, Inspect-Hawk, and AILuminate.
4. Safety classifiers: Llama Guard 4 and gpt-oss-safeguard.
5. Provenance: NIST AI 100-4, C2PA Content Credentials, SynthID Text, and SynthID Bio.
6. Prompt injection, direct and indirect, per NIST AI 100-2 E2025, with the added risks for agents.

**Sources (20):**
- NIST: AI RMF page, NIST AI 100-1 PDF, CAISSI page, NIST AI 100-2 E2025 PDF, NIST AI 100-4 PDF.
- Dioptra README.
- OpenAI: Preparedness Framework v2 PDF, gpt-oss model card PDF (Aug 5, 2025), gpt-oss-safeguard
  README, gpt-oss-safeguard-20b HF card.
- Google DeepMind: FSF blog post (Sep 22, 2025, updated Apr 17, 2026), SynthID Text README,
  SynthID Bio README.
- Anthropic: RSP page, Petri donation post (May 7, 2026).
- Inspect Petri README, Inspect-Hawk README, MLCommons AILuminate page.
- Llama Guard 4 model card (PurpleLlama).
- C2PA explainer v2.4.

**Notes:**
- NIST's center is named "Center for Advancing Innovation and Standards for Super Intelligence
  (CAISSI)" on nist.gov/caissi today. That matches the `nist` org record. Some news items on the same
  page still use "Center for AI Standards and Innovation (CAISI)". The hub uses only the CAISSI name.
  It describes only what the page says the center "will" do and does not characterize its mission
  beyond that.
- The AI RMF is not a separate catalog record. It is covered through the `nist` org record and
  cited directly.
- Llama Guard 4 is mentioned in the intro with its own model card, but it has no catalog record, so
  it is not featured.
- The only SynthID record in the catalog is `synthid-bio`. SynthID Text is cited but not featured.
- The gpt-oss card says OpenAI's Safety Advisory Group concluded that the adversarially fine-tuned
  model did not reach "High" capability. I left that conclusion out and kept only the description of
  the testing method, so the hub does not repeat a developer's self-assessment as fact.

## 2. developer-tools: "Building software with AI"

**Featured organizations:** pytorch-foundation, hugging-face, lmsys, vercel, langchain,
weights-and-biases.

**Featured artifacts:** pytorch, transformers, vllm, sglang, ai-sdk, langchain-framework, dspy,
gemini-cli, openhands, spec-kit, wandb-sdk, mlflow.

**Featured people:** soumith-chintala, thomas-wolf, woosuk-kwon, ying-sheng. All are published.

**Intro topics, in order:**
1. Layers: PyTorch, then Transformers.
2. Inference servers: vLLM and SGLang.
3. SDKs and frameworks: the AI SDK's default routing through the Vercel AI Gateway, LangChain, and
   DSPy.
4. Coding agents: the Gemini CLI tools and sandbox options, the OpenHands no-sandbox warning, and
   Spec Kit.
5. Experiment tracking: wandb (account and API key, results on wandb.ai) and MLflow (local server
   quickstart).

**Sources (13):** READMEs for PyTorch, Transformers, vLLM, SGLang, AI SDK (`packages/ai/README.md`,
because the root README is a pointer), LangChain, DSPy, Gemini CLI, OpenHands, Spec Kit, wandb, and
MLflow. Also the Gemini CLI sandboxing doc (`docs/cli/sandbox.md`).

**Notes:**
- The scope note sends readers to the agents hub for agent protocols and to the local-ai hub for
  local runtimes, to avoid repeating them.
- Records I considered but did not feature: keras, jax, trl, unsloth-library, tensorrt-llm,
  llamaindex-framework, codex-cli, cline-extension, and vet. codex-cli and cline are already featured
  in the agents hub.
- vLLM is described as "originally developed" at Berkeley so that the word "first" does not read as
  a superlative.

## 3. speech-vision-and-multimodal: "Speech, vision, and multimodal AI"

**Featured organizations:** ai2, meta, nvidia, openai, genmo.

**Featured artifacts:** clip, molmo2-o-7b, florence-2, gemma-4-12b, whisper,
parakeet-tdt-0-6b-v3, sam-3-1, dinov3, diffusers, mochi-1-preview.

**Intro topics, in order:**
1. CLIP's paired encoders and the out-of-scope uses on its card.
2. Vision-language models: Molmo2-O-7B, Florence-2, and Gemma 4 12B Unified's encoder-free design.
3. Speech: Whisper and Parakeet v3, with the limitations and consent caution on the Whisper card.
4. Building blocks: SAM 3 and SAM 3.1, and DINOv3.
5. Generation: Diffusers and Mochi 1 preview.
6. Terms differ by release: CC BY 4.0, Apache 2.0 with research-use data terms, and gated SAM and
   DINOv3 licenses.

**Sources (13):**
- OpenAI: CLIP README and model card, Whisper README and model card.
- Hugging Face cards: Molmo2-O-7B, Florence-2-large, Gemma 4 12B-it, parakeet-tdt-0.6b-v3, Mochi 1
  preview.
- Meta: SAM 3 README and SAM License, DINOv3 README.
- Diffusers README.

**Notes:**
- Records I considered but did not feature: v-jepa-2, fastvlm, phi-4-reasoning-vision-15b,
  zamba2-vl-7b, medgemma, cosmos, and segment-anything (the family record; I featured `sam-3-1`
  instead).
- I did not call DINOv3 "self-supervised". The README I read does not use that word. The catalog
  record's tag rests on other sources.
- The Molmo2 card and the Mochi card include promotional "state-of-the-art" wording. I did not
  repeat it.

## Fetched but not used, or failed

- The csrc.nist.gov page for NIST AI 100-4 returned 404. I used the nvlpubs PDF instead.
- openai.com/index/updating-our-preparedness-framework/ returned 403. I used the Preparedness
  Framework v2 PDF on cdn.openai.com instead.
- These were fetched but not cited:
  - Safety: NIST AI 600-1 PDF (the GenAI Profile was cut for length), the csrc.nist.gov AI 100-2
    landing page (the PDF is cited), the gpt-oss arXiv abstract, the Google DeepMind
    responsibility page, the C2PA v2.2 explainer (v2.4 is cited), the PurpleLlama README, and the
    Granite Guardian README.
  - Developer tools: READMEs for Keras, TRL, vet, and LlamaIndex.
  - Multimodal: the Gemma 4 model card on ai.google.dev, the V-JEPA 2 README, and the
    Phi-4-reasoning-vision card.

## Suggestions for later rounds (not done; outside my files)

- These new catalog records would let the safety hub feature what it now only mentions:
  - `llama-guard-4` (Meta).
  - `synthid-text` (Google DeepMind, Apache 2.0 reference implementation).
  - IBM Granite Guardian, which the `granite` family record already lists as a line.
- `tests/unit/learn.test.ts` currently fails on `new-to-ai: how-language-models-work`, because the
  round-4 explainers are not yet in `EXPLAINERS`. The hub-step assertions pass now that
  `content/hubs/developer-tools.yml` exists.
- The `nist` org record could mention that NIST says the AI RMF 1.0 is being revised under the
  White House AI Action Plan.

## Self-check

I re-read every intro sentence against the passage that supports it and made these corrections:

- **Removed an opening sentence:** "Federal standards work on AI risk is centered at NIST." No
  source supports it.
- **Rewrote "first developed"** (vLLM) as "originally developed".
- **Rewrote "one early design"** (CLIP) as "some designs".
- **Added "currently"** to the CLIP out-of-scope sentence, to match the card exactly.
- **Narrowed the Gemini CLI sandbox sentence.** It now describes the container mount and the
  default macOS profile separately, because the doc says the Seatbelt profile allows broad reads.
- **Changed "Google's Gemma"** to "Google DeepMind's Gemma", which is how the card names it.
- **Fixed reading-path notes that made unsourced general claims.** For example, "several speech and
  vision models are small enough to run locally" became "Some multimodal models, such as Gemma 4
  12B, are documented for local use", which the Gemma card supports.
- **Fixed a line-wrap problem.** Rewrapping had split "red-teaming" across a YAML line break, which
  would have rendered as "red- teaming". All intro text was rewrapped with hyphen breaking turned
  off and then scanned again.

A script confirmed the following:

- Every `/learn/` slug I link is in `lib/learn.ts`.
- Every glossary anchor exists in `glossary.mdx`.
- Every `/hubs/` target exists.
- Every `kind=` and `role=` filter value is in `lib/enums.ts`.
- Every featured slug exists and is published.

I also checked each `q=` search against published record text. Matches: `safety` 9, `security` 5,
`coding` 20, `vision` 41, `speech` 12, `video` 20.

A word scan found no "users", "leading", "best", "largest", "state-of-the-art", or other words the
validator forbids in the validated fields.
