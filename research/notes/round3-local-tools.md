# Round 3 — tools for running AI models locally (2026-10-01)

Scope: element-labs, mozilla-ai, mintplex-labs, tiny-corp (organizations); lm-studio,
llamafile, open-webui, anythingllm, lemonade, openvino, executorch, litert, bitnet,
bitnet-b1-58-2b-4t (optional), tinygrad (artifacts). None of these slugs existed before.
All sources were read on 2026-10-01. LICENSE files were read raw from GitHub/Hugging Face.
Requests used WebFetch or curl with the generic UA `USASI-catalog-research/0.3`; no personal
identifiers were sent. The unauthenticated GitHub API rate limit was reached mid-session; later
GitHub checks used raw files and HTML pages. `npx tsx scripts/validate.ts`: 0 errors. The one
warning is about `continue-extension.yml`, which is not my file.

## Organizations

| Slug | Decision | Eligibility basis | Notes / gaps |
| --- | --- | --- | --- |
| element-labs | published | us-headquarters | Careers page: "LM Studio is built by Element Labs in New York, USA." Privacy policy: Element Labs, Inc., a Delaware corporation, with a registered address in Wilmington, DE (a registered-agent address, not recorded as HQ). App terms: New York law, New York County courts. Founding year not found. |
| mozilla-ai | published | us-control (plus SF address) | Mozilla Foundation's audited FY2024 statements list MZL.AI as a wholly owned for-profit subsidiary. The foundation is a California nonprofit HQ'd in San Francisco. The site footer reads "MZL.AI, PBC, 1875 Mission Street, San Francisco". About page: "backed by the Mozilla Foundation" and a team "based across nine countries". The financials describe ownership as of 2024-12-31. The PBC's state of incorporation was not found. The Mozilla Foundation has no catalog record, so `parent_org_slug` is null and the relationship sits in `ownership_evidence`. |
| mintplex-labs | published | us-headquarters (state only) | Desktop terms: Mintplex Labs, Inc., with a notice address at a numbered suite in Anaheim, CA, and Orange County courts. Cloud terms: "located in California, United States", California law. Neither calls the address HQ, so only "California" is recorded (same approach as All Hands AI). Incorporation state unknown. |
| tiny-corp | published | us-headquarters | tinygrad.org links a company Form W-9: "tinygrad, Corp.", C corporation, San Diego, CA. The FAQ offers tinybox pickup in San Diego. Only city and state are recorded, not the street address or TIN. A W-9 is a tax form, not an HQ statement; this is flagged in the explanation. A California SOS bizfile document turned up in search, but the site's bot protection blocked it, and I did not try to get around it. |

## Artifacts

| Slug | Decision | Basis | Notes / gaps |
| --- | --- | --- | --- |
| lm-studio | **not created** | — | See "LM Studio decision" below. The app is a product on `element-labs`. |
| llamafile | published | us-governed-project (Mozilla.ai) | Moved to the mozilla-ai GitHub org; announced 2025-10-29 ("llamafile Returns"). The LICENSE (Apache-2.0) names the **Mozilla Foundation** as copyright holder. The README says changes to llama.cpp and whisper.cpp are MIT. Reviewed release v0.10.6 (2026-09-15). The docs say the 0.10 series is not yet tested on every GPU or platform. |
| open-webui | published | us-governed-project (Open WebUI, Inc.) | **License change:** MIT before commit a76068d (2025-01-10), BSD-3-Clause through commit 60d84a3 (2025-04-18), then the custom "Open WebUI License". That license is BSD-3 plus a branding clause: Open WebUI branding may not be removed except for deployments of 50 or fewer end users per rolling 30 days, with written permission, or under an enterprise license. The docs say it is not OSI-approved (from v0.6.6). There is also a CLA. All three licenses are recorded (custom one with `spdx: null`). Maintainer evidence: LICENSE copyright "Open WebUI Inc.", careers page "Open WebUI Inc. is an equal opportunity employer", and site terms naming Open WebUI, Inc. with a San Francisco contact address (2261 Market St #22911). Gaps: incorporation state unknown, and the address looks like a mailing address. Precedents (Nous Research, All Hands AI) accept a terms-of-service contact address. Downgrade to draft if the editor wants stronger evidence. `supported_platforms` is `partial` because no OS matrix was found. |
| anythingllm | published | us-governed-project (mintplex-labs) | MIT; LICENSE copyright "Mintplex Labs Inc.". The desktop app has separate terms of use. Telemetry is on by default and can be opted out (recorded in run_notes). Reviewed v1.16.2 (2026-09-22). I left out the hardware figures from the system-requirements page (RAM/CPU) because the brief's precision/assumption rule can't be met. |
| lemonade | **draft**, pending_review | undetermined | The README calls it "a community project with many maintainers… sponsored by AMD", "with optimizations by AMD engineers". AMD's developer article (2025-11-13) says "an open-source project backed by AMD". But the LICENSE says "Copyright 2026 Lemonade Community", the maintainer table lists individual GitHub accounts, and the lemonade-sdk org lists no organization. No document names AMD as governing or maintaining entity, so I treated it like the llama.cpp/Hugging Face precedent: sponsorship is not governance. AMD is kept in `organization_slugs` as a relationship. Apache-2.0; reviewed v2026.40.0 (2026-09-30). To publish, an editor would need a statement that AMD governs or maintains the project (for example a governance doc or an AMD page saying it maintains Lemonade). |
| openvino | published | us-governed-project (intel) | Apache-2.0. Source headers read "Copyright (C) 2018-2026 Intel Corporation", and Intel's developer page describes it as an open-source toolkit. Reviewed 2026.4.1 (released 2026-10-01, today). Telemetry with opt-out is recorded. intel.com returns 403 to curl, but WebFetch read it. |
| executorch | published | us-governed-project (meta; pytorch-foundation relationship) | The LICENSE is 3-clause BSD with copyright held by Meta plus Arm, Qualcomm Innovation Center, Apple, MediaTek, NXP, Samsung, and Intel. GitHub's API reports NOASSERTION, but the text matches BSD-3-Clause, the same as the pytorch record. The CONTRIBUTING CLA is "any of Meta's open source projects". The pytorch.org Projects menu lists ExecuTorch, but the foundation's prose list (vLLM, DeepSpeed, Ray, Helion, Safetensors) does not, so the PTF hosting status is ambiguous and the record stays on Meta. Reviewed v1.5.1 (2026-09-23). |
| litert | published | us-governed-project (google) | Apache-2.0; source headers say "Copyright 2024 Google LLC"; Google CLA required. Google announced the TensorFlow Lite to LiteRT rename on 2024-09-04 (recorded as provenance to `tensorflow`). **LiteRT-LM** is a separate repo (google-ai-edge/LiteRT-LM, Apache-2.0, latest v0.17.1). It is the "orchestration layer built on the LiteRT Runtime" (Google docs). I covered it in summary, run_notes, links, and license_notes, not as its own record. Reviewed LiteRT v2.2.0 (2026-08-13). |
| bitnet | published | us-governed-project (microsoft) | Recorded as a runtime project for bitnet.cpp. MIT, copyright Microsoft Corporation. The repo has **no GitHub releases**; the README announces "bitnet.cpp 1.0" (2024-10-17), so `release_status` is `partial`. I left out the performance/energy claims in the README. |
| bitnet-b1-58-2b-4t | **not created** | — | See "BitNet model release" below. |
| tinygrad | published | us-governed-project (tiny-corp) | MIT, copyright "the tiny corp"; the README says "Maintained by tiny corp". Kind `framework`. Reviewed v0.14.0 (2026-08-24). The docs say it is not yet 1.0. |

## LM Studio decision

- The LM Studio desktop app is proprietary. Its app terms (updated 2026-08-23) license it "solely for Your personal and / or internal business purposes" and call "the Software and its structure, organization, and source code" trade secrets. They also mention paid features. Every runtime/framework record in the catalog is `availability: public` open source, and `/open/` is described as the open models and tools directory, so the app does not belong there.
- I recorded the app as a `developer-tool` product on `element-labs`, along with llmster/lms and the SDKs. The openness summary records which parts are MIT.
- **MIT parts I considered** (all official, in the verified `lmstudio-ai` GitHub org with domain lmstudio.ai):
  - `lms` CLI: MIT, "Copyright (c) 2024 LM Studio".
  - `lmstudio-js`: MIT, "Copyright (c) 2025 Element Labs Inc".
  - `lmstudio-python`: MIT, "Copyright (c) 2025 LM Studio".
  - `mlx-engine`: MIT, "Copyright (c) 2024 LM Studio".
- **Why I made no record for them:**
  - The SDK announcement says SDK apps need a computer "that has LM Studio running (either in the foreground or in headless mode)". The CLI drives the same runtime. A directory entry for them would point users to a closed runtime.
  - mlx-engine is the only standalone open engine. It has no tags or releases and its own README calls its standalone use a demo.
  - Putting any of these under the slug `lm-studio` would make the open directory suggest LM Studio is open source.
- **If the editor wants them in the directory:** assign a dedicated slug such as `lmstudio-mlx-engine` (runtime, maintainer element-labs, MIT). The evidence is already gathered in the element-labs sources.
- Any other agent that cross-references the artifact slug `lm-studio` needs to remove that reference.
- **Surprise:** lmstudio.ai's homepage now leads with "LM Studio Bionic", which the docs call "a new, separate app from LM Studio". It is an agent that runs local models, models on other devices via "LM Link", or cloud-hosted open models paid with credits. The download page shows it for Windows x64 only. The docs I read did not document platforms, account rules, or billing, so I did not add it as a product.

## BitNet model release (bitnet-b1-58-2b-4t), not created

- **Blocker:** the validator requires a release to name a `family_slug` that points to an existing family record of the same kind. No BitNet family record exists. My only BitNet file is the runtime project `bitnet`, which cannot serve as a family. Creating a family file was not in my assignment.
- **Verified for a future record:**
  - Model card: `license: mit`. The LICENSE file reads "MIT License, Copyright (c) Microsoft Corporation". The card says "The model weights and code are released under the MIT License."
  - Card: "developed by Microsoft Research"; ~2 billion parameters (the BitNet README says 2.4B, so the figures differ); 4 trillion training tokens; context length 4096.
  - Native W1.58A8, trained from scratch (not post-training quantized); LLaMA 3 tokenizer.
  - Training stages: pre-training, SFT, DPO.
  - Weight repos: packed 1.58-bit, BF16 master, and GGUF.
- **Data summary card** (`data_summary_card.md`, v1.0, updated 16-Dec-2025):
  - Names SmolLM-Corpus, dclm-baseline-1.0, and open-web-math.
  - Says "Model release date: 01-May-2025". The BitNet README news line dates the Hugging Face release to 04/14/2025, so the dates conflict.
  - Says no synthetic AI-generated data was used. The model card says pre-training used "synthetic math data". This also conflicts.
- I left the benchmark tables out. The technical report (arXiv 2504.12285) was not fetched.
- **Suggested setup:** a `bitnet-b1-58` model family plus this release. The checklist would likely be: weights public; inference_code public (bitnet.cpp); training_code unknown; training_data_information partial.

## Other observations

- ExecuTorch's LICENSE lists many corporate copyright holders. Eligibility rests on Meta's documented role (CLA, LICENSE order, pytorch org), not on the other contributors.
- The Open WebUI site terms (effective 2026-07-07) cover the website. The software terms are in the repo LICENSE files.
- Mozilla.ai's homepage lists the commercial products Otari ("AI Gateway & Hosted Platform") and Octonous. Too little detail was readable to record them.
