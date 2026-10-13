# N2 verification: big tech and enterprise software (2026-10-13)

I fetched every cited source today with curl (`-A "USASI-factcheck/0.3"`), and all of them returned HTTP 200. I then read each summary sentence against its source. I also checked the Hugging Face Hub API and the GitHub release pages and commit feeds for dates. I checked repository links named in the summaries (harvey-labs firm-knowledge, cloudflare-os, cloudflare-os-starter, hyper-tau-bench, amazon-science/ALoDLM, agent-plugins.org), and all of them resolve. No browser tools were used, and no email address or personal identifier was sent.

**Duplicates:** none of the 26 items repeats an event in EXISTING.txt or in N1, N3, N4 or N5. Related items I checked and found to be separate events:
- N1 `openai-releases-mcp-extensions`
- N4 `mcp-specification-2026-07-28-released`
- the existing Muse Glimmer, Muse Wonder, Strands Decider, MAI-Transcribe and ONNX Runtime 1.31 items

**Window:** every event date falls between 2026-07-07 and 2026-10-08.

## Per file

### Checked OK (17)
- `amazon-releases-alodlm-diffusion-language-models`: card text, CC BY-NC 4.0 license and arXiv date (3 Oct 2026) confirmed. The Hub shows the 8B weights committed on 2026-10-02, so the month-level date `2026-10` is right.
- `apple-releases-lensvlm-9b`: card text, base model Qwen3.5-9B, the AMLR model license and the Apple Sample Code License confirmed. The Hub's first commit and the ml-lensvlm GitHub commits are both dated 2026-09-22, which supports `2026-09`. The paper itself (arXiv 2605.07019) is from May 2026, and the item only says the model accompanies it.
- `faiss-1-15-0-released`: published 2026-08-03T17:10Z, with the changelog dated 2026-07-31. Every listed addition and optimization appears in the notes.
- `harvey-open-sources-lab-law-firm-knowledge-tasks`: date (Aug 7, 2026), the "open-sourcing" wording, the dataset size (266 matters, 46 clients, 15 practice areas, 250 tasks), the LLM judge with per-task rubrics, and the repository path all confirmed. These are dataset sizes, not user or staff counts.
- `ibm-releases-granite-speech-5-0-turboctc`: date, 470M size, both licenses, the NC model's extra GigaSpeech and SPGI Speech data, 16 Conformer blocks with CTC, the earlier design with LoRA adapters, and the dropped translation and keyword biasing all confirmed.
- `ibm-releases-granite-time-series-patchtst-fm-r2`: date, ~385M parameters, 8,192-step context, 99-quantile head, the Apache 2.0 / OpenMDW 1.0 choice, and the granite-tsfm repository all confirmed. Rankings were correctly left out.
- `llm-d-0-10-0-released`: published 2026-09-29T00:00Z. The themes, the ghcr/quay signing split, both deprecations, the OffloadingConnector, and the autoscaler rename all confirmed.
- `meta-launches-muse-image-and-previews-muse-video`: dated July 7, 2026. Capabilities, availability, Content Seal, and "coming soon" all confirmed. The post makes no mention of an API, weights or license.
- `meta-releases-muse-spark-1-1-and-meta-model-api`: dated July 9, 2026. The Thinking mode, Model API public preview, 1M-token context, computer use and subagents all confirmed. Weights and license are not mentioned.
- `microsoft-ai-opens-consultation-on-mai-code-of-conduct`: dated Sept 14, 2026. The first draft, the "training manual" wording, Absolute Constraints, the six-week consultation, the summary to follow, the revised version "later this year", and the absence of a closing date all confirmed.
- `microsoft-ai-releases-mai-thinking-1`: dated Aug 12, 2026. The Superintelligence team byline, Foundry public preview, 35B active / ~1T total MoE, 256k context, function calling, Chat Completions, no distillation, and safety trained in the same RL loop all confirmed. Benchmark scores were correctly left out.
- `microsoft-releases-vibevoice-asr-streaming`: the README news entry dated 2026-09-03, the card's 10 languages, the MIT license, and the arXiv v1 dated 2 Sep 2026 all confirmed.
- `onnx-runtime-1-30-0-released`: published 2026-09-10T16:55Z. Highlights, FP4 QMoE on by default, and the hardening work all confirmed.
- `sierra-open-sources-hyper-tau-bench`: dated Sept 8, 2026. The setup description and "open-sourcing" confirmed. The Paper (arXiv 2609.04611), Codebase and Leaderboard links are present. No license is stated.
- `spec-kit-1-0-0-released`: published 2026-08-21T11:40Z. The install instructions, the Security Review extension at v2.0.0, the duplicate-template fix, and the earlier 0.16.5 release all confirmed.
- `strands-agents-releases-strands-harness`: dated Sept 21, 2026. "General-purpose rather than a coding agent", Apache 2.0, Harness SDK, Python/TypeScript, the ~1500-token truncation and 85% compaction, and the providers plus Ollama all confirmed.
- `writer-releases-palmyra-x6`: Aug 13 dateline, with the page published Aug 14. GLM 5.2 post-training (the source's superlative was correctly left out), the harness features, and bring-your-own-model all confirmed. Weights are not mentioned.

### Corrected (9)
- **`agent-plugins-1-0-0-specification-published`**
  - Before: "AWS, Anysphere, GitHub, Microsoft, OpenAI, and Vercel helped refine it"
  - After: "representatives from AWS, Anysphere, GitHub, Microsoft, OpenAI, and Vercel refined it into version 1.0.0"
  - Source: vercel.com/blog/introducing-agent-plugins
- **`cloudflare-open-sources-cloudflare-os`**
  - Before: "A fully managed version in the Cloudflare dashboard is listed as coming later"
  - After: "Cloudflare says it is working on bringing Cloudflare OS to the Cloudflare dashboard as a fully managed product"
  - Source: blog.cloudflare.com/cloudflare-os
- **`github-mcp-server-2-0-0-released`**
  - Before: "add typed inputs and outputs across …"
  - After: "add typed outputs, and for some tools typed inputs, across …"
  - Reason: most of the PRs in the change list type outputs only.
- **`meta-releases-metaencoder-30b`**
  - Added: "with use also subject to the base model's Usage Policy"
  - Reason: the card's license section says this.
  - Kept: event date 2026-10-08, the arXiv submission date. The repo is gated, so its commit history can't be seen. The Hub shows it was created 2026-09-30, and the summary already says the card gives no release date.
- **`microsoft-announces-genesis-mission-commitment-spark`**
  - Before: "and is meant to support DOE's American Science Cloud"
  - After: "Microsoft says Azure capabilities will help extend DOE's American Science Cloud". The post says this about Azure, not Discovery.
  - Before: "names four initial projects"
  - After: "describes four of the first projects under the partnership"
  - Source: blogs.microsoft.com, 2026-07-22. The dollar figure is still left out.
- **`red-hat-ai-3-5-generally-available`**
  - Before: NeMo Guardrails "block" malicious tool calls
  - After: "intercept", the press release's word.
- **`salesforce-agrees-to-acquire-listen-labs`**
  - Before: "customer research and simulation platform whose agents plan studies, run research, and summarize findings"
  - After: "customer research and human simulation platform whose AI agents design studies, conduct research, and synthesize insights", the source's wording.
  - Still accurate: the deal is agreed and not closed, closing is expected in Q4 of FY2027, and terms were not disclosed.
- **`salesforce-announces-koa-crm-reasoning-model`**
  - Before: "Salesforce announced Koa"
  - After: "Salesforce and NVIDIA announced Koa", in both the summary and the title. The release says "Salesforce and NVIDIA today announced Koa".
  - Before: "does not say that Koa's weights will be released"
  - After: Salesforce says it controls the weights and runs Koa within its own infrastructure as a Salesforce-hosted option, and does not say the weights will be released.
  - Source: salesforce.com press release, 2026-09-15.
- **`vercel-acquires-better-auth`**
  - Before: "Vercel … plans to bring the team's Agent Auth work … to Vercel Connect"
  - After: the team will continue its Agent Auth work, "bringing agent identity to Vercel Connect and eve", as the post says.
  - Still accurate: the deal is described as "is acquiring", with no closing stated and no financial terms.

### Set to draft (0)

### Deleted (0)

## Totals
- 26 files checked: 17 OK, 9 corrected, 0 set to draft, 0 deleted.
- Validator: `26 batch file(s): 0 error(s), 0 warning(s)`
