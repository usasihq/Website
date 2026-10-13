# N4 fact-check (2026-10-13)

All 29 files in `news/` were checked against their cited sources, fetched today with
`curl -A "USASI-factcheck/0.3"` (unauthenticated, no personal identifiers in any request). For
GitHub release dates I also cross-checked the tag commit date shown on the release page, the public
releases atom feed, PyPI upload times (torch, sentence-transformers) and Docker Hub tag push times
(Ollama). The GitHub API was rate-limited, so I did not use it.

Duplicate check: none of the 29 events is in `EXISTING.txt` or in `N1`, `N2`, `N3` or `N5`. The
nearest matches are different events: Open WebUI 0.12.0, Unsloth Browser use, the LFM2.5-VL-3B-DSpark
release, the Prime Agent Rust rewrite, llama.cpp decision models, and the SpaceX–Anysphere
acquisition. EXISTING has no Hermes item. All event dates fall between 2026-07-02 and 2026-10-07,
inside the window.

## Per file

| File | Result |
|---|---|
| ai2-bolmo-research-published-in-nature | OK. Blog (Oct 7) confirms the Nature publication, Bwen 8B/Blama 8B and the Stage 1 checkpoints; the Bwen-8B card confirms "Qwen3 8B Base retrofitted… over bytes" and Apache 2.0. |
| ai2-releases-benchmirt | **Corrected.** "estimate which capabilities drive performance on each question" → "estimate which underlying capabilities are most closely associated with getting each question right" (allenai.org/blog/benchmirt). The tech report, GitHub code and HF collection links are confirmed on the page, and the page states no license. |
| arcee-ai-and-doe-announce-genesis-science-1 | **Corrected.** "Arcee AI announced GS1" → "Arcee AI wrote… that it and the U.S. Department of Energy had announced the development of GS1" (the post says "Today the Department of Energy (DOE) and Arcee AI announced…"). "calls it a trillion-parameter-class language model" → "will be a trillion-parameter-class language model" (the post says "GS1 will be…"). Date confirmed as 2026-07-22. |
| cline-introduces-cline-desktop | OK. Post dated 2026-09-14. Confirms the early version, parallel sessions, scheduled tasks, Marketplace, the Mac/Windows beta, that the Mac app is fully open source, and the CLI/extension handoff. |
| cognition-releases-swe-2 | OK. Post dated 2026-09-10. Confirms post-training from Kimi K3 (2.8T), Devin Desktop/CLI first, and the rollout to Web/Fusion. No weights are mentioned. The item quotes no benchmark scores. |
| cognition-signs-doe-mou-to-join-genesis-mission | **Corrected.** "expanding workforce capacity" → "expanding scientific workforce capacity", the source's exact wording. Everything else is confirmed (2026-07-22). |
| dioxus-team-joins-cognition | OK. The post (09.10.26) says the team "joins" and never says "acquires". The item says so, and the wording on Dioxus, Blitz, Taffy and Subsecond plus the Devin VM work is confirmed. |
| firetiger-team-joins-cursor | **Corrected.** Cut the closing sentence about SpaceX acquiring Cursor and its source (cursor.com/blog/joining-spacex). It is a separate event, already covered by EXISTING `spacex-completes-anysphere-acquisition`. The Firetiger claims are confirmed (2026-08-13). |
| hermes-agent-0-20-0-adds-voice-and-a2a | OK. Release v2026.8.3 was published 2026-08-03T16:57Z. "The Herald Release", barge-in, wake words, the A2A v1.0 plugin, signed webhooks, grounded citations and the desktop plugin SDK are all in the notes. |
| hugging-face-adds-rl-environments-to-the-hub | **Corrected.** "The post registers four framework tags" → "The post says four environment frameworks are registered as dataset libraries, each with its own tag: Harbor, Verifiers, OpenEnv, and NeMo Gym" (the source's wording and table). |
| linux-foundation-launches-x402-foundation | OK. The press release (July 14, 2026) confirms the operational launch, the Coinbase contribution, "fully active under formal, open governance", and the premier members listed. |
| liquid-ai-releases-lfm2-5-2-6b | OK. The blog (Aug 4) confirms the base and post-trained models on HF. The card confirms 131,072 tokens and "not recommended for agentic coding and knowledge-heavy tasks". The LICENSE file is the LFM Open License v1.0. |
| liquid-ai-releases-lfm2-5-vl-3b | OK. The blog (Aug 12) confirms "non-reasoning model that answers directly". The card confirms the LFM2.5-2.6B backbone, SigLIP2 NaFlex, 32,768 tokens and the GGUF/ONNX/MLX exports. The license is LFM Open License v1.0. |
| lm-studio-introduces-bionic-agent-app | OK. The post (2026-07-16) confirms a separate app, the LM Studio runtime, Secure Cloud needing an account with billing, and no open-source claim for the app. |
| mcp-specification-2026-07-28-released | OK. The GitHub release (2026-07-28) says "stable release". The changelog confirms every listed change, including the "minimum twelve-month deprecation window". |
| mozilla-ai-introduces-otari | **Corrected.** "cost tracking and spending limits, centralized API key management and access permissions" → "budgets and usage visibility for LLM spend, centralized API keys and access controls" (the post's wording). The repo's Apache-2.0 license and "OpenAI-compatible LLM gateway you run yourself" are confirmed (post dated 2026-07-06). |
| ollama-0-35-0-adds-decision-models | OK. The notes confirm `/v1/systemone`, the TypeSafe Jev API, Nimble/Tev1, and choice/noul/score. The release page shows 28 Sep, rc1 and the final tag share a commit from 2026-09-28 20:31 UTC, and the Docker image was pushed 2026-09-29 01:49 UTC (Sep 28, U.S. time). Date kept. |
| ollama-0-40-0-runs-models-on-mlx-by-default | **Corrected (date).** 2026-09-25 → **2026-10-06**. The release page shows "25 Sep", but that is when the release entry was created alongside v0.40.0-rc0. Several sources show the final release came later: the v0.40.0 tag commit is dated 2026-10-06 17:46 UTC; the releases atom feed dates v0.40.0 to 2026-10-06T18:47Z; Docker `ollama/ollama:0.40.0` was pushed 2026-10-06T18:05Z; rc6 was tagged 2026-10-06; the notes compare against v0.35.1, which was tagged Oct 2; and embeddinggemma-2 launched Oct 6. The summary now says it was published Oct 6, after release candidates that began on Sep 25. I added the source `ollama-v0-40-0-rc0` (github.com/ollama/ollama/releases/tag/v0.40.0-rc0). The feature claims are unchanged and confirmed. |
| openclaw-2026-8-1-released | OK. The release (2026-08-31T03:30Z) confirms conversation search, paired-device/cloud-worker sessions, pinned widgets, masked credential requests and the backup advice. |
| open-webui-0-11-0-redesigns-interface-adds-sub-agents | OK. Release 2026-07-27. The redesign, `ENABLE_SUBAGENTS`, forking, timers, webhook notification targets and LDAP group sync are all in the notes. |
| poolside-releases-laguna-s-2-1 | OK. The blog (2026-07-21) confirms "scale-up of the Laguna XS family". The card confirms 118B/~8B, agentic coding and long-horizon work, 1,048,576 tokens, OpenMDW-1.1, FP8/NVFP4/INT4/GGUF and the DFlash draft. |
| poolside-releases-laguna-xs-2-1 | OK. The blog (2026-07-02) and the card confirm 33B/3B, "upgraded version of our Laguna XS.2 model", OpenMDW-1.1, BF16/FP8/NVFP4/INT4, the API and OpenRouter. |
| prime-rl-0-8-0-adds-multi-agent-rl | OK. Release 2026-08-07. Confirms verifiers 0.3.0 multi-agent (single-policy) training, RAE, Hierarchical GRPO, vLLM 0.26.0, NIXL + ModelExpress, and ZMQ as the default. |
| pytorch-2-13-0-released | OK. Release page 2026-07-08 (PyPI upload the same day). Every highlight in the item is in the notes. |
| pytorch-2-14-0-released | OK. Release page 2026-09-02 (PyPI the same day). Every highlight is confirmed, including Rubin (sm_107). |
| reka-releases-inverse-dynamics-model | OK. Post date is Oct 2, 2026; the Oct 5 date on the page belongs to another post. The card confirms two models (flow and pixel) trained on game renders, Apache 2.0, RAFT-small weights from torchvision kept out of the repo, and "Status: preliminary release". |
| sentence-transformers-6-0-0-adds-multivectorencoder | OK. Release 2026-08-18 (PyPI the same day). The notes confirm the fourth model type, PyLate and Stanford-NLP ColBERT loading, the transformers v5 floor and the migration guide. |
| unsloth-introduces-unsloth-desktop | OK. Release "Introducing Unsloth Desktop" (v0.1.70-beta) was published 2026-08-11. The listed features and hardware are confirmed; the item leaves out the release's "first desktop app" superlative. |
| zyphra-releases-zuna1-1-eeg-model | OK. The post (dated Aug 3, 2026) says it is "an update to Zyphra's ZUNA1.1 release July 16, 2026". It confirms 380M parameters, 0.5–30 s inputs, Apache 2.0, GitHub code, `pip install zuna` and the research-only disclaimer. The HF card confirms the same. |

## Totals

- Files checked: 29
- Checked OK: 22
- Corrected: 7 (ai2-releases-benchmirt, arcee-ai-and-doe-announce-genesis-science-1,
  cognition-signs-doe-mou-to-join-genesis-mission, firetiger-team-joins-cursor,
  hugging-face-adds-rl-environments-to-the-hub, mozilla-ai-introduces-otari,
  ollama-0-40-0-runs-models-on-mlx-by-default)
- Set to draft: 0
- Deleted: 0
- Validator: `29 batch file(s): 0 error(s), 0 warning(s)`

Note: `NOTES.md` still lists the Ollama 0.40.0 date as 2026-09-25. The item file has the
corrected date, 2026-10-06.
