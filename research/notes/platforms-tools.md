# Research notes: platforms-tools

Researcher group: platforms-tools. Research date: 2026-09-29. `npx tsx scripts/validate.ts`: 0 errors and no warnings in this group's files.

## Organizations

### together-ai: published
- **Why:** U.S. HQ is documented. The operating entity is Together Computer, Inc., a Delaware corporation (ToS, updated 2026-05-19), with a San Francisco address.
- **Eligibility basis:** us-headquarters. Sources: ToS, PR Newswire releases datelined San Francisco, and Bisnow (news, 2026-04-16) on the new HQ lease at 2 Henry Adams St.
- **Evidence gaps:**
  - No official page says "headquarters" outright. The ToS address is a DMCA notice address, and the explicit HQ wording comes from the news source.
  - The founding year (2022) comes from the about page.
- **Products:** Serverless Inference (hosted-model-api), Fine-Tuning, GPU Clusters.
- **Not included:** funding and valuation figures (these appear in search snippets and press, but were left out on purpose). The Refuel.ai and CodeSandbox acquisitions were seen in the press list but not assessed.

### fireworks-ai: published
- **Why:** The ToS (updated 2026-07-10) names Fireworks.ai, Inc. with a notice address at 900 Concar Drive, San Mateo, CA. The July 2026 Series D release is datelined San Mateo, and the careers page lists most roles in San Mateo.
- **Eligibility basis:** us-headquarters.
- **Evidence gaps:**
  - No official page says "headquarters" outright.
  - Older third-party profiles say Redwood City. This looks like an office move; it was not documented officially, so HQ is recorded as San Mateo.
  - No legal form or founding year was found on an official page, so both are left null.
- **Worth knowing:** Fireworks announced "Ember-1" (2026-09-23), its own model built on Kimi K3, as a hosted research preview. The post does not mention a weights release. The base-model provenance is non-U.S. and is recorded only as a notable fact; no artifact record was made.

### anyscale: published (with status note; re-review needed)
- **Why:** The about page lists a "San Francisco HQ" (600 Harrison St). The platform terms name Anyscale, Inc. with the same address. The about page gives 2019 as the founding year.
- **Eligibility basis:** us-headquarters.
- **Material change:**
  - On 2026-07-30, Nscale (Nscale Limited, registered in England and Wales, principal executive office in London per its S-1) announced a definitive agreement to acquire Anyscale.
  - The S-1 filed 2026-09-18 still calls the deal pending, with closing expected at the time of, or concurrent with, Nscale's IPO.
  - As of today there is no evidence of closing, so Anyscale is assessed as an independent U.S. company. This is recorded in `status_note`.
- **Action:** Once the deal closes, Anyscale becomes a U.S.-HQ subsidiary of a UK parent. It should then be re-assessed, probably to pending_review/draft under the parent/subsidiary rule.
- **Not included:** The deal price was reported (~$1.65B, news) but deliberately left out.

### hugging-face: published (dual-country assessment written)
- **Incorporation:** Hugging Face, Inc. is a Delaware corporation (ToS). The ToS uses New York law and New York courts.
- **Location:** The privacy policy says "The Company and its servers are located in the United States". It names Hugging Face SAS (Paris, RCS 822 168 043) only as the "main establishment in the European Union" for GDPR purposes. The SAS is single-shareholder, but the source does not say who the shareholder is.
- **Self-description:**
  - 2024 NIST submission: Brooklyn letterhead (20 Jay St), and "based in the U.S. and France".
  - 2025 OSTP submission: "community-driven U.S. company".
- **Reporting:** AFP (2026-09-03) says its headquarters are American.
- **Assessment:** us-headquarters, eligible. No source makes the French entity the parent or principal place of business.
- **Material change:** NVIDIA announced on 2026-09-03 that it "has agreed to acquire Hugging Face". No closing date is stated; news reports say H1 next year. This is recorded in `status_note` and not relied on for eligibility. TechCrunch's wording ("has acquired") conflicts with NVIDIA's own "agreed to acquire", so the official wording is used.
- **Other change:** ggml.ai says it was "acquired by Hugging Face in 2026". The ggml team joined HF in February 2026. This is recorded as a notable fact.
- **Evidence gaps:**
  - No official HF page uses the word "headquarters".
  - The Brooklyn letterhead dates from 2024. It is hosted in an HF staff member's policy-materials dataset repo (a letter authored by Hugging Face, Inc.).
  - A reviewer may want a stronger primary source, such as a NY DOS or Delaware registry entry.
- **Products:** Hub, Inference Providers (hosted-model-api), Inference Endpoints.

### ibm: published
- **Why:** The FY2025 10-K (filed 2026-02-24) gives the principal executive offices as One New Orchard Road, Armonk, NY, and the state of incorporation as New York. The 10-K says IBM was incorporated on 1911-06-16.
- **Eligibility basis:** us-headquarters.
- **Products:** watsonx.ai (hosted-model-api; the docs confirm IBM Granite and third-party models with chat and tool-calling APIs), watsonx Orchestrate, and watsonx.governance.
- **Not assessed:** IBM's other 2025–26 acquisitions, since they don't affect eligibility.

## Artifacts

### granite (family): published
- The summary comes from ibm.com/granite, which lists six model lines, with Granite 4.2 as the latest language generation.
- No licenses or checklist, per the rules. Availability is `not_applicable`.

### granite-4-2-8b, granite-4-2-30b, granite-4-2-3b (releases): published
- **Release facts:**
  - Model card release date: 2026-08-25. The disclosure JSON gives the same date.
  - License: Apache-2.0, per the card metadata and summary table, and the repo LICENSE file.
  - Disclosures are licensed CDLA-Permissive-2.0.
  - Weights are not gated (HF API `gated: False`).
- **Provenance:** post-trained from IBM's own Granite 4.1 base models, so there is no foreign base model.
- **Checklist:**
  - training_data_information is `partial`. The disclosure JSON lists 94 datasets; 20 have no URL (internal, acquired, or synthetic).
  - training_recipe is `partial`.
  - evaluation_materials is `partial`: a results table is published, but no IBM eval configs.
  - training_code is `unknown`. RL used NVIDIA NeMo RL and NeMo Gym, but no IBM training code or configs were found.
- **Oddity:** The model card source still has HTML-comment TODO placeholders in the training section. They are not rendered and don't affect the facts used.
- **Not created:** Other recent Granite lines (Speech 5.0, Vision 4.1, Guardian 4.1, Embedding r2, "granite-switch", "granite-swash") were not assessed.

### ray (framework): published
- **Governance:** A PyTorch Foundation-hosted project since 2025-10-22, contributed by Anyscale. The PyTorch Foundation is hosted by the Linux Foundation, whose legal address is in San Francisco per the LF privacy policy.
- **License:** Apache-2.0 (LICENSE file).
- **Eligibility basis:** us-governed-project.
- **Nscale:** The Anyscale/Nscale release says Ray "was donated to the PyTorch Foundation and remains open source and community governed." The Nscale S-1 speaks of "acquiring the team behind Ray", but governance stays with the foundation.
- **Origin:** Ray began at UC Berkeley RISELab (Anyscale about page). The PyTorch blog says "originally developed by Anyscale", so the two official sources differ slightly on origin.

### vllm (runtime): published
- **Governance:**
  - PyTorch Foundation-hosted since the 2025-05-06 announcement, contributed by UC Berkeley. The Sky Computing Lab origin is stated in the README.
  - The vLLM governance doc names its core maintainers as the TSC under Linux Foundation project governance, and says "committer status belongs to individuals, not companies".
- **License:** Apache-2.0.
- **Eligibility basis:** us-governed-project, resting on the foundation hosting and the LF, not on contributors.
- **Seen but not verified officially:** Search results say vLLM's creators founded Inferact (January 2026). This was not used. The records name no individuals.

### llama-cpp (runtime, "llama.cpp"): draft, pending_review / undetermined
- **What is documented:**
  - The ggml team joined Hugging Face (ggml-org discussion #19759 and the HF blog, both 2026-02-20).
  - ggml.ai says the company "was acquired by Hugging Face in 2026".
  - The same announcements say the projects remain community driven, the community "will continue to operate fully autonomously and make technical and architectural decisions", and HF provides resources.
- **Why draft:**
  - No governance document names HF, or any U.S. entity, as the governing or maintaining organization.
  - ggml.ai's location is not stated in any source reviewed.
  - HF's own ownership is changing (the NVIDIA deal is pending).
  - Treating it as eligible would rest on the maintainers' employer, which is close to the "contributors" reasoning the policy rules out.
- **License:** MIT ("Copyright (c) 2023-2026 The ggml authors").
- **Other changes:** The project now has a website (llama.app), a unified `llama` CLI, and v0.x versioned releases (v0.5.0 on 2026-09-23) alongside b-numbered nightly builds.
- **Open question:** Should HF's acquisition of ggml.ai plus its employment of the core team count as "documented maintaining entity"? This is an editorial policy call.

### ollama (runtime): published
- **Maintainer:** Ollama Inc. The ToS (May 2026) says the website, software, and APIs are provided by Ollama Inc. The ToS uses California law, with arbitration in San Francisco.
- **Location:** The Business Wire Series B release (2026-07-09) is datelined Palo Alto. All postings on the Ashby job board are in Palo Alto.
- **License:** MIT.
- **Eligibility basis:** us-governed-project.
- **Evidence gaps:** No official page says "headquarters", and the state of incorporation is not documented.
- **Provenance:** The README lists llama.cpp as a supported backend, and the repo pins a llama.cpp build (LLAMA_CPP_VERSION b11232) and MLX.

## Surprising or ambiguous items
1. Three pending acquisitions touch this group:
   - NVIDIA–Hugging Face (U.S. buyer).
   - Nscale–Anyscale (UK buyer; this one could change Anyscale's eligibility).
   - Hugging Face–ggml.ai (completed per ggml.ai).
   All three need follow-up re-review once they close.
2. Hugging Face's own policy letters describe it as "based in the U.S. and France" (2023–2024) but as a "U.S. company" (2025).
3. WebFetch summaries sometimes gave wrong years for GitHub release dates (for example, Ray 2.58.0 shown as 2024). The GitHub API gives 2026-08-23. No release dates were recorded for the software projects.
4. Privacy: two early sec.gov curl requests used a User-Agent with a placeholder address (research@example.org / research@usasi.invalid). The user's email was never sent. Later requests follow the generic-UA rule.
