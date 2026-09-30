# Verification log: r2-open-labs-a

Checked on 2026-09-29 against the cited sources.

- Raw files were read with `curl -A "USASI-factcheck/0.2"`: Hugging Face READMEs, `config.json`, LICENSE files, HF API metadata (`gated`, `cardData`, `siblings`, `safetensors`), GitHub raw READMEs and LICENSE files, and the Hermes 4 and INTELLECT-3 report PDFs (via `pdftotext`).
- Rendered pages (company sites, blogs, EDGAR pages, arXiv abstracts) were read with WebFetch.
- No personal identifiers were sent in any request.
- `npx tsx scripts/validate.ts` reports 0 errors. The only warning is in another group's file (`continue-extension.yml`).

Computed tiers after the edits: all eight releases are **open-weight**. None has `training_code: public`.

- The weights of lfm2-5-8b-a1b, lfm2-5-2-6b, hermes-4-70b and cogito-v2-preview-llama-405b are under non-OSI licenses, so their pages show the license caveat.
- Every HF repo in this batch reports `gated: false`.

## Cross-cutting checks requested

- **LFM Open License threshold wording.** The LICENSE files of LFM2.5-8B-A1B and LFM2.5-2.6B are identical, byte for byte after whitespace normalization.
  - §1 defines "Threshold" as "annual revenue of 10 million United States dollars ($10,000,000) or more".
  - §5(a) conditions commercial-use rights on the licensee's Legal Entity "not exceeding the Threshold".
  - §5(b) says Commercial Use "by a Legal Entity that exceeds the Threshold is not licensed".
  - §5(c) exempts a Qualified Non-Profit Organization's use for Non-Commercial or Research Purposes.
  - Every record now uses this construction: "not exceeding a Threshold defined as annual revenue of US$10,000,000 or more".
  - Before, the wording varied: "exceeds its US$10 million threshold", "above a US$10 million annual revenue threshold", "limits commercial use by larger companies", and "commercial use above it".
  - Note for the editor: Liquid's own summaries phrase it differently from the license text. The license page says rights end "if your company's annual revenue exceeds $10 million USD", and the models page says "until your company passes $10M". The records follow the license text.
- **Licenses taken from card metadata, with no LICENSE file** (confirmed from the HF file listings). Every record says this accurately.
  - Hermes 4.3 36B: `apache-2.0`, metadata only.
  - Hermes 4 70B: `llama3`, metadata only. The base model is Llama 3.1, and the notes say so.
  - INTELLECT-3 and INTELLECT-3.1: `mit` in the metadata, plus the card's "MIT and Apache 2.0" sentence.
  - Cogito v2.1 671B: `mit` in the metadata, plus a card "License" section that says "This repository and the model weights are licensed under MIT License". The companion GitHub repo has an MIT LICENSE file.
  - Cogito v2 Preview 405B: `llama3.1` in the metadata, plus a card License section naming the Llama 3.1 Community License.
- **Fine-tune provenance.** Each base model matches the card metadata and the card or report text:
  - Hermes 4.3 36B: `ByteDance-Seed/Seed-OSS-36B-Base`. Its card says "We are ByteDance Seed Team" and Apache-2.0.
  - Hermes 4 70B: the card metadata gives `meta-llama/Meta-Llama-3.1-70B`, which now 307-redirects to `meta-llama/Llama-3.1-70B`. The report says "the 405B and 70B versions of Llama 3.1".
  - Hermes 4 14B: `Qwen/Qwen3-14B`.
  - INTELLECT-3 and 3.1: `zai-org/GLM-4.5-Air-Base`, which is MIT, 106B total and 12B active. The 3.1 card text says it continues INTELLECT-3.
  - INTELLECT-2: `Qwen/QwQ-32B`.
  - Cogito v2.1: `deepseek-ai/DeepSeek-V3-Base`. The blog says "open-licensed Deepseek base model from November 2024".
  - Cogito v2 405B: `meta-llama/Llama-3.1-405B`.
  - Cogito v2 109B: Llama-4-Scout-17B-16E.
  - Cogito v2 70B: Llama-3.1-70B.
- **Fine-tune checklist rule.** Consistent across the batch:
  - Hermes 4.3, Hermes 4 70B, INTELLECT-3 and INTELLECT-3.1 publish only post-training code, data description or recipe, so they have `training_code`, `training_data_information` and `training_recipe` all set to `partial`, never `public`.
  - Cogito publishes no code or data. Its code and data items stay `unknown`, and its recipe is `partial` (a conceptual description).
  - No changes were needed.
- **HQ labels.** See nous-research and prime-intellect below.

## Organizations

### liquid-ai
- `notable_facts[0].text`
  - Before: "does not cover commercial use by entities whose annual revenue exceeds its US$10 million threshold; qualified non-profits may use the models … regardless of the threshold".
  - After: the license's own construction ("conditions commercial-use rights on the licensee's legal entity not exceeding a 'Threshold' … US$10,000,000 or more … commercial use by a legal entity that exceeds the Threshold is not licensed … does not apply to a qualified non-profit organization's use for non-commercial or research purposes").
  - Reason: match the license text exactly. Source: lfm25-8b-license-file.
- `openness_summary.text`
  - Before: "which limits commercial use by larger companies".
  - After: "which conditions commercial use on the licensee's legal entity not exceeding a threshold defined as annual revenue of US$10,000,000 or more".
  - Added `lfm25-8b-license-file` to its `source_ids`.
- Verified with no change:
  - Legal name: "Liquid AI, Inc." appears in the privacy policy and the about-page footer.
  - HQ: the privacy policy (updated July 14, 2025) gives the address 314 Main Street, Cambridge, MA 02142, and the press release dateline reads "CAMBRIDGE, Mass. — JUL 15, 2025".
  - EDGAR: incorporated in DE, located in MA.
  - Careers page: "Primarily San Francisco and Boston, with a Tokyo presence".
  - About page: "Est. 2023" and "Spun out of MIT CSAIL".
  - LEAP: an Android/iOS SDK, "models built by Liquid AI and other open-source providers", and a fine-tuning CLI with bundles.
  - Apollo: App Store and Google Play, "cloud-free".
  - LFM2 report: arXiv 2511.23404, v1 dated 2025-11-28.

### nous-research
- `headquarters.label`
  - Before: "Austin, Texas".
  - After: "United States (city not stated; the store privacy policy gives a contact address in Austin, Texas)".
  - Reason: the only source is the shop privacy policy. It gives "NOUS RESEARCH, INC., 600 Congress Avenue, Fl 14, Austin TX 78701" as a contact address and does not use "headquarters" or "principal place of business".
  - Nothing else corroborates Austin. The careers page lists one New York office role, and all other roles are remote. The homepage names no location. The Portal terms and privacy policy give no address. EDGAR has no match.
  - This follows the Groq precedent in orgs-a. Eligibility is unchanged; it rests on a Delaware corporation with only U.S. addresses documented.
- `eligibility.explanation`: reworded to match. The Austin address is now described as a contact address, other roles are noted as remote, and the explanation says only the country is recorded.
- `products[hermes-agent].access`
  - Before: "a terminal install, desktop apps, or a server".
  - After: "a terminal install, desktop apps, or cloud hosting through Nous Portal".
  - Reason: this matches the cited Hermes Agent site.
- `openness_summary.text`
  - Before: "their licenses follow the base model (… a Llama license for Llama-based Hermes 4 models)".
  - After: "the model cards declare, for example, Apache 2.0 for the Seed-OSS-based Hermes 4.3 36B and a Llama license ('llama3') for the Llama-based Hermes 4 70B".
  - Reason: "follow the base model" is an inference. Hermes 4 70B's card declares `llama3`, while its base is under Llama 3.1.
- Verified with no change:
  - Legal name and Delaware legal form: Portal terms updated 2026-09-28.
  - The New York office.
  - Portal features: credits, the inference API, 300+ models, hosted tools, and Hermes Agent hosting.
  - Hermes Agent and Atropos are MIT (raw LICENSE files).
  - Notable facts, checked against the Hermes 4.3 card and blog and against the Hermes 4 report §4 ("we log all the samples generated at evaluation time and release them").

### prime-intellect
- `headquarters.label`
  - Before: "Dover, Delaware".
  - After: "Dover, Delaware (principal place of business listed in its SEC Form D)".
  - Reason: the Form D (accession 0001231919-26-000720, filed 2026-07-01, signed 2026-06-03) does give the principal place of business as "1111B S GOVERNORS AVENUE, DOVER, DE 19904". The city is supported as written, but the source says "principal place of business", not "headquarters", so the label now says that.
  - The terms of service and privacy policy (both dated Feb 23, 2024) use the same Dover address (STE 7703).
  - Operating roles on the careers page are in San Francisco, New York City, and remote. The homepage says to join "in San Francisco or remotely".
  - Editor may still prefer San Francisco. Eligibility is U.S. either way.
- `eligibility.source_ids`: added `prime-privacy`, a new source fetched today (https://www.primeintellect.ai/privacy-policy, dated 2024-02-23). The explanation already cited the privacy policy's address without a source.
- `products[prime-compute].access`
  - Before: "provisioned through the Prime Intellect dashboard or the prime CLI with an account API key".
  - After: "the CLI reference documents provisioning instances with the prime CLI and an account API key".
  - Reason: no cited page documents dashboard provisioning. The docs home does support single GPU instances, 64+ H100 clusters, and reserved clusters.
- Verified with no change:
  - Legal name and legal form: Delaware corporation, incorporated 2024.
  - Products: the Lab docs, and the inference docs (OpenAI-compatible, per input/output token, account balance, API keys).
  - INTELLECT-1 notable fact: the card says "10 billion … from scratch on 1 trillion tokens", "up to 14 concurrent nodes distributed across 3 continents", and "30 independent community contributors".
  - Licenses: prime-rl is Apache-2.0 and verifiers is MIT (raw LICENSE files).

### deep-cogito
- Verified, no changes.
  - Homepage: "We're headquartered in San Francisco".
  - Form D/A (accession 0002128259-26-000002, EDGAR timestamp 2026-04-24, signed 2026-04-23): Deep Cogito Inc., Delaware corporation, incorporated 2024, principal place of business 28 Geary Street, San Francisco.
  - v2.1 blog: API platforms, Ollama/Unsloth, and chat.deepcogito.com ("we don't store any chats").
  - Bases: Llama/Qwen (v1 blog), DeepSeek (v2.1 blog), and "post-training in-house".
  - IDA wording appears in the v1 and v2 blogs.
  - Careers URL returns 200.

## Artifacts

### lfm (family)
- `summary.source_ids`: added a new source, `lfm25-vl-3b-blog` (https://www.liquid.ai/blog/lfm2-5-vl-3b, published Aug 12, 2026). The summary's "LFM2.5-VL-3B (August)" was not supported by any cited source; the models page shows no date.
- `provenance.text`
  - Before: "LFM models are pretrained by Liquid AI itself; …".
  - After: it now applies that statement to the language models, and adds that the LFM2.5-VL-3B card says it pairs the LFM2.5-2.6B backbone with a SigLIP2 NaFlex vision encoder.
  - Reason: the family includes vision-language models whose vision encoder is not a Liquid-pretrained LFM. Added source `mc-lfm25-vl-3b`, fetched today.
- Verified:
  - LFM2 blog: July 10, 2025, 0.35B/0.7B/1.2B, and the LFM1-7B teacher.
  - Tech report abstract: 350M–8.3B, with an 8.3B MoE.
  - LFM2.5 blog: Jan 5, 2026, "10T to 28T tokens", scaled RL.

### lfm2-5-8b-a1b
- `availability.access_conditions` and `license_notes.text`: threshold wording changed to the license's construction; see the cross-cutting section.
- `license_notes.text`
  - Before: "hosting platforms may redistribute the models for free download".
  - After: "hosting platforms may host and distribute the models".
  - Reason: the FAQ says platforms "can host and distribute LFM models freely" and says nothing about free download.
- Verified:
  - Card: 8.3B total / 1.5B active; 24 layers (18 double-gated conv + 6 GQA); 38T tokens; 128,000 context.
  - Recommended uses, and the sampling parameters 0.2 / 80 / 1.05.
  - Six inference frameworks, `transformers>=5.0.0`, and the 328M DSpark drafter.
  - Base: LFM2.5-8B-A1B-Base.
  - Blog: May 28, 2026. Stages: 12T→38T, 32K through a 2T-token midtraining phase, then 128K through 400B tokens, a doom-loop preference optimization stage, and an avg@k reward RL stage. The blog also mentions the Playground.

### lfm2-5-2-6b
- `availability.access_conditions` and `license_notes.text`: threshold wording changed to the license's construction.
- Verified:
  - Card: 2.69B; 30 layers (22 + 8); 34T tokens; 131,072 context; 16 languages.
  - The four post-training stages.
  - Agent-harness examples (Hermes, OpenClaw, Pi), sampling 0.1 / 50 / 1.1, and the DSpark drafter.
  - Blog: Aug 4, 2026.

### hermes (family)
- Verified, no changes.
  - Releases page: Nous-Hermes-Llama2-13b 07/21/23; Hermes 2 on Mistral, Mixtral and Yi, 2023–24; Hermes 3 405B 08/24/24; the three Hermes 4 releases 08/26/25; Hermes-4.3 12/03/25.
  - The HF listing confirms the Hermes-2-Pro/Theta Llama-3 bases.
  - Report and card bases as listed above.

### hermes-4-3-36b
- `useful_for.text`
  - Removed: "and says it comes close to Hermes 4 70B at about half the parameter count".
  - Removed `hermes-4-3-blog` from its `source_ids`.
  - Reason: this is a performance comparison. CONTENT_FORMAT allows no performance claims in `useful_for`.
- Verified:
  - Base and license, as covered in the cross-cutting section.
  - The card's "first Hermes model trained in a decentralized manner over the internet using Psyche".
  - Blog ("December 2025"): up to 512K context, 24 Psyche nodes, DisTrO, "twice as large as Hermes 4", the custom TorchTitan fork (BSD-3-Clause at main and at 856a0ec), and the Psyche GitHub repo (Apache-2.0).
  - The centralized version, and the eval datasets `eval-Hermes-4.3-36B` and `-centralized`, both public and ungated.
  - No Hermes 4 or 4.3 training dataset is on HF; only the Hermes-3-Dataset is.
  - Weights are BF16.
  - The blog page footer says "MIT License · 2026". That is the site footer, not a model license; it was ignored.

### hermes-4-70b
- `checklist.inference_code`: replaced the unsourced "the model uses the standard Llama architecture" with "the repository's config declares the standard LlamaForCausalLM architecture". Added source `hermes-4-70b-config` (raw config.json, fetched today).
- `license_notes.text`
  - Before: "requires a separate license from Meta for licensees whose products had more than 700 million monthly active users …".
  - After: "requires licensees whose products had more than 700 million monthly active users … to request a license from Meta".
  - Reason: this matches Llama 3.1 license §2 ("you must request a license from Meta").
- `provenance.derived_from[0].note`: added that the card's `base_model` field gives `meta-llama/Meta-Llama-3.1-70B`, which now redirects to `meta-llama/Llama-3.1-70B`. Added `llama31-70b-api` to the provenance sources.
- Verified:
  - Report: about 5M samples and 19B tokens; DCLM/FineWeb seed data; Hermes 3 data retained; Atropos environments "available open-source".
  - Report Table 1 (70B): FSDP+TP, 56B tokens, LR 1e-5, 12,864 B200 hours. Also 9,000 steps with 300 warmup, batch 384 × 16,384, packing, and loss masking to the assistant role.
  - Eval harness: lighteval on the nous branch, EQBench, Atropos.
  - The `eval-Hermes-4-70B-reasoning` and `-nonreasoning` datasets are public.
  - Inference providers: Nous Portal, Chutes, Nebius, Luminal.
  - Llama 3.1 license terms, checked against the raw text.

### intellect (family)
- Verified, no changes. Checked the INTELLECT-1, 2, 3 and 3.1 cards, the GLM-4.5-Air-Base card, the blog (Nov 26, 2025), and arXiv 2512.16144 (v1, Dec 18, 2025).

### intellect-3
- Verified, no changes.
  - Report: "Both stages … on a 512 H200 cluster over the course of two months".
  - Two SFT stages, with Table 1 sources and token counts.
  - Muon: LR 5e-5 (stage 1) and 5e-8 (stage 2); 65K and 98K context with CP; FSDP.
  - RL: 256 prompts × 16 rollouts, 65,536 context, LR 1e-6, 60 nodes (16 training / 44 inference), masked token-level importance sampling.
  - "Our model always reasons".
  - Blog: chat.primeintellect.ai, the Inference API, and Parasail/Nebius as providers.
- `evaluation_materials` stays `partial`.
  - The Environments Hub pages (e.g. `/dashboard/environments/primeintellect/i3-math`) still show only a signed-in dashboard.
  - The public `PrimeIntellect-ai/prime-envs` repo has no `i3-*` directories; it has generic `math`, `code`, `science` and others.
  - So public access to the exact evaluation environments is still unconfirmed.

### intellect-3-1
- Verified, no changes.
  - The card says continued RL from INTELLECT-3 on math, coding, SWE and agentic tasks. The metadata is MIT and gives GLM-4.5-Air-Base.
  - BF16 per the HF API.
  - No evaluation results, and no dedicated blog post or report was found (web search).
  - `released_at: null` is appropriate.

### prime-rl
- `checklist.data_information.note`
  - Before: "The README explains that training data and rewards come from verifiers environments, installed from the Environments Hub or as optional workspace packages".
  - After: "The README describes training on verifiers environments, installed from the Environments Hub or as opt-in workspace packages".
  - Reason: the README does not say "rewards", and it calls environments "opt-in uv workspace members".
- Verified:
  - README: FSDP2 plus vLLM; Slurm and Kubernetes; SFT, RL and evals; the GPU list; Python 3.12 via uv.
  - The example tasks.
  - The Apache-2.0 LICENSE and the citation author "Prime Intellect".
  - The docs site lists prime-rl.
  - The INTELLECT-2 card names prime-rl as its training code.

### cogito (family)
- Verified, no changes.
  - v1 blog: Apr 8, 2025; 3B/8B/14B/32B/70B; "pretrained Llama / Qwen base checkpoints".
  - v2 blog: Jul 31, 2025; four hybrid models; IDA.
  - v2.1 blog: Nov 19, 2025.
  - The research index lists nothing after v2.1.
  - Card base-model metadata as listed above.
- Note: `released_at: 2025-04-08` gives the first release. Family records across the catalog are inconsistent on this (some are null), but the date is sourced.

### cogito-v2-1-671b
- Verified, no changes.
  - Card: hybrid reasoning; IDA; over 30 languages; 128k context.
  - Memory: "BF16 … approximately 1.3 TB for parameters"; 8 B200 or 16 H200 GPUs; FP8 on 8 H200.
  - The FP8 repo is public.
  - The README gives 37B active.
  - The blog lists repeats per example (AIME 32, GPQA 8, and so on) and links no eval code.
  - The DeepSeek-V3-Base card says the code is MIT and that the Base/Chat models are "subject to the Model License".

### cogito-v2-preview-llama-405b
- `checklist.inference_code`: replaced the unsourced "the model uses the Llama architecture" with "the repository's config declares the LlamaForCausalLM architecture". Added source `cogito-v2-405b-config` (raw config.json, fetched today).
- `license_notes.text`: the same "request a license from Meta" wording fix as for hermes-4-70b.
- Verified:
  - Card: `llama3.1` metadata plus the License section; base Llama-3.1-405B; BF16.
  - `enable_thinking`, or the system prompt with a `<think>\n` prefill.
  - The README lists OpenRouter and TogetherAI.

## Could not verify / for the editor

1. **Prime Intellect Environments Hub** requires sign-in, and the public GitHub env repos do not contain the `i3-*` environments by name. So the INTELLECT-3 evaluation environments cannot be confirmed as public, and `evaluation_materials` stays partial.
2. **Nous Research HQ city**: no official page names one. The label is now country-only, following the Groq precedent.
3. **Prime Intellect HQ**: the Dover address comes from the Form D, the terms and the privacy policy. Operating roles are in SF and NYC. The label now says "principal place of business", but an editor may prefer SF if an official HQ statement appears.
4. GitHub API calls were rate-limited, so directory listings were read through WebFetch or raw.githubusercontent.com.
5. Possible provenance addition, not made: the INTELLECT-3 report says both main SFT sources "contain synthetically generated reasoning traces from DeepSeek-R1-0528". This could be noted under provenance, as other records do for distilled data.
6. Deep Cogito's chat product was not re-fetched. No product entry exists, so nothing depends on it.
