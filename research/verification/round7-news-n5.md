# N5 verification (2026-10-13)

Independent fact-check of the 25 items in `news/`. Every cited URL was fetched today with curl (UA `USASI-factcheck/0.3`). JS-rendered pages were read from their embedded page data (Anduril, Figure, Skild) or checked with WebFetch (PyPI history, Anduril, Figure). The DistressBench arXiv PDF was also fetched to confirm the Scale AI affiliation. No email addresses or personal identifiers were sent in any request. No browser tools were used, and the repository was not edited.

The checks covered dates in the 2026-07-01..2026-10-12 window, duplicates against EXISTING.txt and N1–N4, sources being primary, and the rule against scores, rankings, money or superlatives.

## Per file

| File | Result | Notes |
|---|---|---|
| agility-robotics-unveils-digit-5 | Corrected | "The announcement is tied to Agility's proposed business combination … and these timelines are forward-looking" → "The press release carries forward-looking-statement disclosures for Agility's proposed business combination with Churchill Capital Corp XI." The rest matches the Sep 15 press release. |
| anduril-acquires-popoto-modem | OK | The page JSON-LD gives datePublished 2026-10-02. The body says "Anduril today announced the acquisition of Popoto Modem". The Copperhead and Lattice claims match, and no deal terms are disclosed. |
| arc-institute-describes-data-for-2026-virtual-cell-challenge | Corrected + **draft** | "receive transcriptional profiles only from unperturbed cells and must predict … in cell lines they have not seen perturbed" → the source's framing: last year was a single context after a few perturbation profiles; this year is zero-shot across six cell lines, with unperturbed profiles given as input. Added that the post does not say the data are publicly released. Set to draft: the event is a descriptive blog post, with no release of code, weights or data and no competition dates. The Arc news index has no 2026 challenge launch post, so its significance is doubtful. |
| arc-institute-releases-pie-perturbation-model | OK | The Oct 5 post ("Today, we're releasing PIE") confirms the GitHub code, Hugging Face checkpoints/data and bioRxiv preprint. The README confirms CC BY-NC-SA 4.0. The source's "state-of-the-art" wording was not used. |
| arc-prize-names-first-arc-agi-3-milestone-prize-winners | Corrected | "rewards the top mid-competition…" → "rewards mid-competition…", and "led by Tufa Labs' 'The Duck'" → "including Tufa Labs' 'The Duck'", to remove the ranking and 1st-place order. The prize amount was already omitted. Dates (Jul 6; Jun 30; Sep 30) are confirmed. |
| biohub-esm-3-4-0-adds-esmc-and-esmfold2-support | Corrected | "describes ESMC as a 6-billion-parameter protein language model" → "describes ESMC as a protein language model, says the ESMC 6B model has 6 billion parameters" (ESMC also has 300M/600M variants). The v3.4.0 release (2026-08-27T21:41Z) and PyPI 3.4.0 (Aug 27, confirmed via WebFetch and the PyPI JSON API; curl gets a JS wall) are confirmed, as is the README's MIT license. |
| cais-and-scale-ai-release-hle-diamond | OK | The release notes (Sep 22), the lastexam.ai news entry (09/22/2026) and the HF card (MIT, contact-info gate, no re-upload) match. The release notes' model scores were correctly left out. |
| caisi-assesses-glm-5-3-cyber-capabilities | Corrected | Removed the comparative result "concludes that GLM-5.3's cyber capabilities are significantly lower than those of current U.S. frontier models" (a ranking). It now says the assessment compares GLM-5.3 with the U.S. and PRC models CAISI has evaluated, using per-benchmark results and an IRT-based aggregate index. The dates (Aug 14 release, weights two weeks later, Sep 17 post) and the four benchmarks are confirmed. |
| common-crawl-releases-web-graph-embeddings | OK | The Sep 7 blog post confirms the 128-dim host embeddings, the Nov 2025–Jan 2026 graph, the ≥8-link filter, no text, metadata or hostnames, S3 + HF Parquet, and the GitHub code. The HF card says use is "subject to the Common Crawl Terms of Use". |
| far-ai-launches-ai-security-leaderboard | OK | The Jul 29 post matches. The item correctly leaves out the per-model results, dollar figures and ordering. |
| fastvideo-releases-fasth3-preview-v1-open-weights | Corrected | "trained with data-free DMD2 and Video Sparse Attention … is also published as LoRA adapters" → "trained with data-free DMD2 and VSA-H3 sparse attention … is also offered as a matching LoRA adapter" (the card's wording). The README news entry (2026/08/27), the Hao AI Lab blog (Aug 27) and the card (MiniMax H3 Community License) are confirmed. |
| figure-announces-helix-2-5 | OK | The page date is 2026-09-17. Confirmed: pretrained "from random initialization entirely on Index", the three behaviors, "30 Bay Area homes with zero data collected", and no statement on releasing weights or code. Superlatives were left out. |
| marin-begins-pretraining-535b-a23b-model | Corrected | "the Marin project published a launch note … after the run was ported from Google TPUs to NVIDIA GPUs" → "launch note dated September 3, 2026, first published on the Open Athena blog and mirrored by Marin … had started pretraining … a couple of weeks earlier … the team ported its infrastructure and training stack from Google TPUs on GCP to NVIDIA GPUs on CoreWeave before launch". Dropped the unsupported "about"/"per token" from the parameter counts. The grant and "largest" wording were left out. |
| metr-summarizes-predeployment-evaluation-of-claude-opus-5-5 | OK | The Sep 22 post confirms each claim (10 business days, five tasks, Anthropic review, system-card text, conclusions, scope limits). It is not a duplicate of N1's Opus 5.5 release item. |
| metr-testifies-to-senate-on-ai-agent-incidents | Corrected | "recommends better public visibility…" → "describes better public visibility into the capabilities of frontier AI agents as valuable under almost any policy choice" (the testimony's wording). The HSGAC hearing page confirms the Sep 30 date, the subcommittee and Painter as a witness. |
| mlcommons-publishes-mlperf-storage-v3-0-results | OK | The Sep 1 post confirms the KV Cache and VDB tests and the S3 layer scope. Results counts and power figures were left out. |
| mlcommons-releases-mlperf-client-v2-0 | OK | The Aug 18 post confirms each workload change and the GitHub downloads for Windows, macOS and Linux. |
| mlcommons-releases-mlperf-endpoints-v0-7 | OK | The Jul 28 post matches. The body text says "mlcommons.endpoints.com", but the link target is endpoints.mlcommons.org, as the item says. |
| mlperf-training-adds-llm-post-training-benchmark | OK | The Sep 24 post confirms v6.1 in Oct 2026, Qwen3.5-397B-A17B, RLVR/GRPO, R2E-Gym, the Linux containers and the mlcommons/training link. |
| nist-joins-genesis-mission-through-doe-agreement | OK | The Aug 4 NIST release matches each sentence. |
| scale-ai-releases-distressbench | Corrected | "places long-horizon red-team transcripts in a separate annex for safety researchers" → "places full long-horizon transcripts, including the assistant turns, in a separate annex released for safety research". The card says the long-horizon user turns are in the main repository. arXiv v1 (Oct 8), the Scale AI affiliation in the PDF, 359/718 public, CC BY 4.0 and the gate are confirmed. Model scores were left out. |
| sglang-0-5-21-released | Corrected | "many deprecated endpoints, environment variables, and legacy radix cache implementations were removed" → "deprecated endpoints, environment variables, and aliases, along with legacy radix cache implementations, were removed". The release time is 2026-10-02T01:09Z. Highlights, breaking changes and new models are confirmed. |
| skild-ai-introduces-s1 | Corrected | "early access is available by sign-up" → "the post invites sign-ups for early access". Source `published_at` 2026-08 → 2026-08-18 (the page meta gives article:published_time "Aug 18, 2026"). The funding and ARR posts on the blog index were correctly left out. |
| uk-aisi-and-caisi-assess-kimi-k3-cyber-capabilities | Corrected | Removed the ranking and score claims ("performs significantly below the most recent frontier cyber-capable models and failed to develop exploits that achieved arbitrary code execution"). It now describes what was published: results on ExploitBench (public, from CMU) and "The Last Ones" cyber range, compared with U.S. and PRC models, and the finding that Kimi K3's safeguards did not prevent attempted exploit development or offensive cyber operations. The dates (Jul 16 release, Jul 23 post) are confirmed. |
| waymo-publishes-av-incident-management-exercise-framework | OK | The Oct 7 blog post links arXiv 2609.04777 (v1 Sep 4, 2026; Waymo authors). It confirms FEMA HSEEP, the four exercise categories and the intended audiences. "First-of-its-kind" was left out. |

## Duplicates and window

All event dates fall between 2026-07-06 and 2026-10-08. None of the items duplicates EXISTING.txt or N1–N4. The closest overlaps are a different event:
- N1 `anthropic-releases-claude-opus-5-5` is the model release, not METR's evaluation.
- The Genesis Mission items in N2 and N4 involve different organizations.
- The existing Agility S-4 item covers a filing, not the Digit 5 unveiling.

## Totals

- Files checked: 25
- Checked OK: 13
- Corrected: 12. Of these, 11 remain published and 1 was also set to draft.
- Set to draft: 1 (arc-institute-describes-data-for-2026-virtual-cell-challenge)
- Deleted: 0
- Validator: `25 batch file(s): 0 error(s), 0 warning(s)`
