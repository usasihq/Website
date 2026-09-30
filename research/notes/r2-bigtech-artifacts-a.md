# Research notes: r2-bigtech-artifacts-a

Reviewed 2026-09-29. This group created artifact records only; no organization files were edited. `npx tsx scripts/validate.ts` reports no errors or warnings in these files. The remaining errors belong to other groups (uc-berkeley, modular, dclm, fineweb, nemotron-cc, slimpajama).

Access notes:
- openai.com (the /index/whisper, /index/clip, and /index/triton pages) returned 403 to both WebFetch and curl, and web.archive.org is blocked for WebFetch. OpenAI facts therefore come from GitHub, Hugging Face, arXiv, and the SEC-filed agreement, and no openai.com page is cited.
- The GitHub REST API was rate-limited, so repositories were read through raw files and WebFetch of repo pages.
- ai.meta.com blog pages could be fetched.

## Decisions

| Slug | Level | Decision | Basis | Reason |
| --- | --- | --- | --- | --- |
| whisper | family | published | us-headquarters | OpenAI repo, model card, and SEC-filed agreement (OpenAI Group PBC, San Francisco). |
| whisper-large-v3-turbo | release | published | us-headquarters | MIT per the README (code and weights) and the HF card. Released September 2024. |
| whisper-large-v3 | release | published | us-headquarters | Released 2023-11-06. **License conflict:** the README says MIT, the HF card metadata says Apache-2.0. Both are recorded. |
| clip | family | published | us-headquarters | Model card says it was developed by researchers at OpenAI. |
| clip-vit-large-patch14 | release | published | us-headquarters | Code is MIT. **No weights license found** (README, model card, and HF card are silent). Weights are public and ungated. |
| triton | project (framework) | **draft** | pending_review / undetermined | No documented maintaining organization; see below. |
| segment-anything | family | published | us-headquarters | Covers SAM (Apr 2023), SAM 2/2.1, SAM 3/3.1. |
| sam-3-1 | release | published | us-headquarters | Custom **SAM License**. HF gating is manual approval, so weights are `partial`. Released 2026-03-27. |
| sam-2-1-hiera-large | release | published | us-headquarters | **Apache 2.0** for checkpoints and training code. Ungated. Released 2024-09-29. |
| dinov3 | family | published | us-headquarters | DINOv3 is still the current DINO generation. No DINOv4 found on HF or in the repo. |
| dinov3-vit7b16 | release | published | us-headquarters | Custom **DINOv3 License** (weights and code). Weights are approval-gated (`partial`). Training code and recipe are public. |
| v-jepa-2 | family | published | us-headquarters | Covers V-JEPA 2 (June 2025) and V-JEPA 2.1 (March 2026). |
| v-jepa-2-vitg-384 | release | published | us-headquarters | Code is MIT (repo) and HF says Apache-2.0 for weights. Training code, recipe, and eval are public. Computes to at least open-stack. |
| v-jepa-2-1-vit-gigantic-384 | release | published | us-headquarters | 2B ViT-G. Code is MIT and no weights license is stated. Not on HF. Weights are a direct download. |
| deepspeed | project (framework) | published | us-governed-project | Now a **PyTorch Foundation-hosted project** (see below). |
| onnx-runtime | project (runtime) | published | us-headquarters | Microsoft copyright and repo. MIT. |
| autogen | project (framework) | published | us-headquarters | **Maintenance mode.** Successor is Microsoft Agent Framework. |

## Material changes and surprises

- **DeepSpeed governance changed twice.** Microsoft contributed it to LF AI & Data as an incubation project on 2025-02-03. On 2025-05-07 it became a PyTorch Foundation-hosted project, "contributed by Microsoft". The PyTorch Foundation page (updated 2026-09-03) still lists DeepSpeed. The LF AI & Data projects page no longer lists it, and its old LF AI & Data project URL returns 404. I set `organization_slugs: [pytorch-foundation, linux-foundation, microsoft]` and left out `lf-ai-data`, because the brief's condition ("if hosted by LF AI & Data") no longer holds. The LF AI & Data history is in the summary. GOVERNANCE.md still names "AI & Data, a directed fund of The Linux Foundation" as the TSC's contact, which looks stale; this is noted in license_notes. The repo moved from microsoft/DeepSpeed to deepspeedai/DeepSpeed.
- **AutoGen is in maintenance mode.** The README says it gets no new features, is "community managed going forward", and that new users should use Microsoft Agent Framework (github.com/microsoft/agent-framework, MIT). The last autogen-agentchat release was 0.7.5 on 2025-09-30. Eligibility still rests on Microsoft's GitHub org, its code copyright, and PyPI maintainers. An editor may want to add a record for Microsoft Agent Framework (not researched beyond its README and LICENSE).
- **SAM licenses differ by generation.** SAM 1 and SAM 2/2.1 use Apache 2.0. SAM 3/3.1 use the custom SAM License (last updated 2025-11-19): licensor is Meta Platforms Ireland for EEA/CH users, otherwise Meta Platforms, Inc.; it has trade-control, ITAR, and military-use exclusions, a no-reverse-engineering clause, and a publication acknowledgment requirement. The SAM 3 README credits **Meta Superintelligence Labs**. SAM 2 is credited to FAIR.
- **DINOv3 License** closely mirrors the SAM License (same structure, dated 2025-08-19). Meta's blog calls it a "commercial license".
- **Whisper large-v3 license mismatch:** GitHub README (MIT) vs HF card (Apache-2.0). Turbo is MIT in both places.
- **Whisper turbo parameter count mismatch:** 809M in the README and HF card, 798M in the repo model-card.md. Both figures are stated in the summary.
- **V-JEPA 2 license mismatch:** the GitHub README says "the majority of V-JEPA 2 is licensed under MIT" (three files Apache 2.0) and names no checkpoint license. The HF cards say Apache-2.0. For 2.1 (no HF repo), only the code license is recorded.
- **V-JEPA 2 release date conflict:** the Meta blog and arXiv give 2025-06-11, but the README news line says "[2025-06-25] V-JEPA 2 is released". I used 2025-06-11.
- **SAM 2.1 date:** the README table says "released on September 29, 2024", while the news/release-notes heading says 09/30/2024. I used 2024-09-29.
- **CLIP:** the paper says its headline results use ViT-L/14@336px (April 2022). I chose ViT-L/14 (January 2022) as the release because its HF card is complete; the @336px card is minimal.

## Triton (draft): open questions

- The LICENSE (MIT) names Philippe Tillet (2018–2020) and OpenAI (2020–2022) as copyright holders. PyPI lists Philippe Tillet as author (v3.8.0, 2026-08-28).
- `github.com/openai/triton` 301-redirects to `triton-lang/triton`, which shows the repo was transferred from OpenAI's org. The redirect is not cited as a source.
- CONTRIBUTING.md ("Governance Structure") gives control to individual core maintainers and a lead core maintainer. It names no company or foundation. The docs footer says "© Copyright 2020, Philippe Tillet". The triton-lang org page names no organization.
- The OpenAI announcement page could not be fetched (403).
- Under the round-2 rule (no eligibility from individuals), the record is `pending_review` + `draft` with `organization_slugs: [openai]`. An editor needs an official statement of who maintains or governs Triton today (OpenAI, a foundation, or a multi-company community) before publishing.

## Checklist judgment calls

- **SAM 3.1 training_code = partial.** Only fine-tuning code is published (README_TRAIN.md, and Meta's blog says "fine-tuning code"). OPENNESS.md says fine-tuning code does not count as base-model training code.
- **SAM 3.1 evaluation_materials = partial.** SA-Co evaluation code reproduces SAM 3, but I found no 3.1-specific eval configs.
- **V-JEPA 2.1 training_recipe = partial.** The published ViT-G/16 cooldown config is named `cooldown-256px-64f.yaml`, while the released checkpoint is 384 px, so I could not confirm that the configs reproduce it. V-JEPA 2 ViT-g has a `cooldown-384px-64f.yaml`, so its recipe is `public`.
- **V-JEPA 2 training_data_information = partial.** The paper says all VideoMix22M sources are publicly available, but the YT-Temporal-1B portion was retrieval-curated and I found no published curated list. An editor could argue for `public`.
- **CLIP training_recipe = partial.** The paper gives epochs, optimizer, batch size, and compute, but there are no configs or training code.
- **Whisper and CLIP training_code = unknown.** No training code was found, but no source explicitly says it is not public.
- **Run notes** have no memory or VRAM figures. The Whisper README's VRAM column states no precision, so it is omitted.

## Not researched / out of scope
- SAM 3D, SAM Audio, and the CHMv2 DINOv3 head were not recorded. They are separate Meta releases that could become future candidates.
- No organization records were edited.
