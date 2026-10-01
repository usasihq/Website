# Round 3 — Latest news (2026-10-01)

Window: events from roughly 2026-09-15 to 2026-10-01 involving published catalog records.
All sources were fetched and read on 2026-10-01. Discovery used web search and the Hugging Face
model API (sorted by creation date, generic User-Agent); every item cites only the
organization's own pages, repositories, model cards, or package metadata.
Validator: `npx tsx scripts/validate.ts` gives 0 errors. The 1 warning is pre-existing and is
not in my files.

## Items created (all `publication_status: published`, `published_at: 2026-10-01`)

| File (slug) | Event date | Category | Related records | Sources |
|---|---|---|---|---|
| `nvidia-releases-nemotron-3-diarization` | 2026-09-23 | release | nvidia; nemotron | HF model card (states release date 2026-09-23, OpenMDW-1.1, 100M params, up to 8 speakers); NVIDIA HF blog 2026-09-23 |
| `nvidia-releases-kumo-tabular` | 2026-09-29 | release | nvidia | NVIDIA HF blog 2026-09-29 (3 sizes 28M–215M, artificial-table pretraining, OpenMDW-1.1); HF model card |
| `liquid-ai-releases-lfm2-5-vl-3b-dspark` | 2026-09-24 | release | liquid-ai; lfm | Liquid AI blog 2026-09-24; HF model card (279.5M draft params, target LFM2.5-VL-3B); LICENSE file (LFM Open License v1.0) |
| `mlcommons-publishes-mlperf-inference-v6-1` | 2026-09-16 | release | mlcommons; mlperf | MLCommons announcement 2026-09-16 (new end-to-end RAG and Edge Agentic Inference tests; speculative decoding allowed in interactive scenario) |
| `databricks-acquires-row-zero` | 2026-09-24 | acquisition | databricks | Databricks press release 2026-09-24 ("has acquired"; no financial terms) |
| `ai2-releases-olmo-core-3` | 2026-10-01 | release | ai2; olmo | Ai2 HF blog 2026-10-01; GitHub repo (Apache-2.0, OLMo 3 official training scripts); PyPI ai2-olmo-core 3.0.0 uploaded 2026-10-01 |
| `microsoft-releases-rho-robot-models` | 2026-09-29 | research | microsoft | arXiv 2609.38164 v1 2026-09-29; Microsoft Research project page; microsoft/rhobotics repo (MIT); microsoft/rho-base card (MIT) |
| `cloudflare-releases-clef-decision-models` | 2026-10-01 | release | cloudflare | Cloudflare blog 2026-10-01 (Apache 2.0; bases Qwen3.8-27B and Qwen3.5-9B); HF cards for clef and clef-flash |

Editorial notes:
- I left out benchmark results, speed-up multiples, leaderboard ranks, and participation
  counts on purpose, even though the sources include them (the Nemotron diarization ranking, the
  DSpark speed-ups, the MLPerf participant count and improvement multiples, the Clef latency
  comparisons, and the Kumo accuracy claims).
- **Rho:** the Hugging Face repositories were created earlier (June and August) and last
  modified on September 17 and 18. The date they became public is not documented, so
  `event_date` is the arXiv v1 date of the technical report, and the summary is worded to match.
  I linked only `microsoft`, not `phi`: Rho uses a Phi-family backbone ("Phi-Phy") but is not
  itself a Phi release.
- **Kumo Tabular:** NVIDIA publishes it as its own model. I did not research or state any
  relationship between NVIDIA and any company named Kumo.
- **OLMo-core 3:** the GitHub page view still showed an older release tag, but PyPI shows 3.0.0
  uploaded on 2026-10-01. I left out Ai2's statement about the architecture of the next Olmo
  generation, because the catalog does not publish speculative versions.
- **Liquid DSpark:** the blog describes the weights as deployable "without restrictions," but
  the LICENSE file is the LFM Open License v1.0, which has a revenue threshold for commercial
  use. The summary follows the license text, as the LFM2.5 artifact records do.

## Candidates skipped

| Candidate | Reason |
|---|---|
| Ollama v0.40.0 (MLX by default on Apple Silicon), Sept 25 | Only `v0.40.0-rc0`, a prerelease, exists on GitHub; it is not a final release. |
| vLLM v0.30.0, Sept 22 | A routine version release. The fetched release page also showed a mismatched year. Not selected. |
| PyTorch 2.14 | Released Sept 2, before the window. |
| Ray native sandboxing (Ray 2.58) | Anyscale post dated Aug 25, before the window. |
| IBM Granite TSFM PatchTST-FM-r2 (Sept 9); Granite Speech 5.0 (Aug 25) | Before the window. |
| Hugging Face tokenizers v1 (Sept 21) | Only a release candidate on crates.io; 1.0.0 is not released yet. |
| Transformers running llama.cpp/GGUF quants (Sept 22) | Only on `main` until the next release, and only on Apple Silicon. Not yet released. |
| Together AI Tev1 experimental models (Sept 23) | The model card says the license for the weights is "being finalized." |
| Apple LensVLM-9B (HF repo created Sept 21) | No Apple announcement and no documented release date. The base model is Qwen3.5-9B. |
| Arcee AI announcement, Sept 16 | A funding round, which the catalog excludes. |
| Thinking Machines Lab and Crusoe inference agreement, Sept 23 | A commercial deal described with a dollar figure. Not a covered category. |
| Meta Muse Spark 1.2 open weights | In August Meta said the weights would follow "in the coming weeks." I found no primary evidence they were released by Oct 1, so this would be speculative. |
| xAI Grok 3 open weights | Promised, but no release found. |
| Prime Intellect INTELLECT-3 "late Sept 2026" | The search snippet was wrong: INTELLECT-3 is an earlier release and is already in the catalog. |
| MLPerf Storage v3.0 (Sept 1) | Before the window. |
| Salesforce completing the Fin acquisition (Sept 10); ServiceNow and Sweep (Sept 1) | Before the window. |
| PyTorch Foundation new members (Sept 7–9) | Before the window. The members are foreign companies, and the event is membership, not an artifact. |
| Open Secure AI Alliance joining the Linux Foundation (Sept 14); LF AI & Data AIRSEAI and Monocle | These involve projects that are not in the catalog. Not pursued at primary sources. |
| Other Cloudflare Birthday Week items (Forge, EmDash 1.0, and others) | Not AI model or artifact releases. Clef was the relevant item. |
| Claude Sonnet 5.5, GPT-6 models, Grok 4.7 | Proprietary launches, seen only on aggregators. Not open artifacts. |
| OpenHands Enterprise update (Sept 24) | A proprietary enterprise product update. |
| Hermes Agent v0.21.x, LangChain 1.4.2, LlamaIndex 0.14.25 | Routine patch releases. |
| Hugging Face Open TTS Leaderboard (Sept 30) | Not selected. The post is a multi-author community post and not clearly an organization release. |
