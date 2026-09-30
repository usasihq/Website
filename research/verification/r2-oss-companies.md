# Verification log: r2-oss-companies

Verifier pass on 2026-09-29. I reopened the sources cited in each record and checked them against the claims. Tools used:

- WebFetch.
- `curl -A "USASI-factcheck/0.2"` for raw GitHub files, the PyPI JSON API, the GitHub HTML release pages, and PDFs.
- The browser pane, for pages that render only with JavaScript: lightning.ai, the Lightning docs, and unsloth.ai/terms.

License claims were checked against the actual LICENSE/COPYING files. Latest-release claims were checked against the PyPI JSON API and the GitHub release pages; the GitHub REST API was rate-limited.

Validator after edits (`npx tsx scripts/validate.ts`): **0 errors, 1 warning**. The warning is the expected one: `continue-extension` links to the archived `continue` org.

## Summary

- **Records checked:** 24 (12 organizations, 12 artifacts).
- **Verified with no changes (12):** langchain-framework, langgraph, llamaindex-framework, modular, mojo, baseten, lightning-ai, pytorch-lightning, chroma, chroma-db, unsloth, unsloth-library.
  - unsloth and unsloth-library were already draft and stay draft.
- **Edited (12):** langchain, llamaindex, crewai, crewai-framework, all-hands-ai, openhands, continue, continue-extension, max, modal, lancedb, lance.
- **Eligibility changed:**
  - `crewai` and `crewai-framework` moved from eligible/published to `pending_review` / `undetermined` / `draft`.
  - No other eligibility or publication status changed.
- **Editor follow-up:** ELIGIBILITY.md says pending_review records are listed in `CONTENT_REVIEW.md`. I did not edit that file because it is outside this assignment. The lead should add `crewai` and `crewai-framework`.

## Privacy disclosure

One probe command sent a placeholder email-format string in its User-Agent: `USASI-factcheck/0.2 admin@example.invalid`.

- It went to five EDGAR full-text-search requests (efts.sec.gov).
- `example.invalid` is a reserved, non-existent domain, so the string does not identify anyone. It still breaks the "no email address in any request" rule.
- Every later request used only `USASI-factcheck/0.2`, a generic browser-style UA containing that token, or WebFetch.
- No results from those probe requests were used; EDGAR checks were redone with WebFetch.

## langchain (org): edited

- **products[langsmith].access**
  - Before: "offered as a cloud service, in a hybrid setup, or self-hosted, with a free Developer tier and paid Plus and Enterprise plans."
  - After: all plans can use LangChain's cloud, and hybrid and self-hosted deployment are on the Enterprise plan.
  - Reason: the pricing page limits hybrid and self-hosted to Enterprise.
  - Sources: langchain-pricing, langsmith-page.
- **Verified:**
  - About page: "headquartered in San Francisco", offices in New York, Boston, and Amsterdam, side project late 2022, company formed early 2023, LangSmith described as an "independent commercial platform".
  - ToS (June 2, 2026): "LangChain Inc., a Delaware corporation", Delaware law and courts.
  - LangSmith Deployment docs: cloud, hybrid, self-hosted with control plane (Enterprise), standalone Agent Server, framework-agnostic.
  - Fleet: a no-code agent builder that works in Slack, Teams, and Gmail, with tool-level approval.

## langchain-framework: verified, no changes

- LICENSE: MIT, "Copyright (c) LangChain, Inc."; the GitHub blob URL returns 200.
- README: JS version is LangChain.js; LangSmith pointer.
- Docs overview: "LangChain's agents are built on top of LangGraph"; one interface across providers.
- Install page: Python 3.10+; provider packages installed separately; no OS restriction stated.
- Releases page: tagged per package; latest langchain==1.4.3 (Sep 28) and langchain-core==1.6.6 (Sep 29).

## langgraph: verified, no changes

- LICENSE: MIT, "Copyright (c) 2024 LangChain, Inc.".
- README: "built by LangChain Inc ... can be used without LangChain"; credits Pregel and Apache Beam; LangGraph.js.
- Install page: the Python 3.10+ note applies to LangChain. The record already says so.
- Releases: langgraph==1.2.12 (Sep 21), plus cli, sdk, and checkpoint packages.

## llamaindex (org): edited

- **eligibility.explanation**
  - Before: "under Delaware law with arbitration in Delaware".
  - After: "under Delaware law".
  - Reason: the ToS (Jun 7, 2024) puts arbitration in the user's U.S. county or Sussex County, Delaware.
  - Source: llamaindex-tos.
- **notable_facts[0]**
  - Before: "the open-source LiteParse parser".
  - After: "the free LiteParse text parser".
  - Reason: the README calls LiteParse a free text parser but does not state its license.
  - Source: llamaindex-readme.
- **Verified:**
  - PR Newswire (2025-03-04): dateline SAN FRANCISCO; "Based in San Francisco"; "founded in 2023".
  - Careers page: an office in San Francisco; SF hybrid roles plus one London role.
  - Privacy notice (Aug 24, 2026): "LlamaIndex Inc."; Prighter appointed as EU representative.
  - LlamaParse page: web UI, API, Python and TypeScript SDKs, Global and EU sign-in, free credits, enterprise through sales.

## llamaindex-framework: verified, no changes

- LICENSE: MIT. The copyright line names an individual, and the record correctly does not rely on it.
- README: "by LlamaIndex, the company behind LlamaParse"; "over 300" integration packages; primary focus shifted to LlamaParse.
- OSS page: "Python and Typescript SDKs".
- Docs: MIT-licensed; workflows with branching, retries, and human-in-the-loop review.
- Install page: OpenAI defaults and OPENAI_API_KEY; Ollama and Hugging Face alternatives; no Python version stated.
- Latest release: v0.14.25 on 2026-09-21. This is the latest on the releases page.

## crewai (org): edited, now DRAFT / pending_review

The lead asked for a documented U.S. basis. None was found that meets ELIGIBILITY.md ("official pages, terms of service naming the entity and address, or regulatory filings").

What the sources say:

- Terms of use (effective Sep 24, 2025):
  - "CrewAI, Inc., a Delaware corporation", New York law.
  - No address; notices go "to the address set forth on the Order Form".
- Privacy policy (Sep 24, 2025): no address; the only contact is by email.
- Homepage, AMP page, pricing page, and footer: no location statement. crewai.com/careers returns 404.
- Press releases:
  - Business Wire releases of 2025-11-19 and 2026-02-11 are datelined SAN FRANCISCO, and their boilerplate has no location.
  - The October 22, 2024 GlobeNewswire release is datelined "SAN FRANCISCO and SÃO PAULO".
- Workable job-board API: 2 on-site SF roles, 3 remote U.S. roles, 1 remote U.S. East Coast role, and 1 São Paulo role.
- SEC EDGAR (company search and full-text Form D search via WebFetch): no match for "CrewAI" or "crew ai".
- Third-party directories seen in search snippets disagree (San Francisco, São Paulo, Middletown DE). None was cited.

Delaware incorporation, datelines, and job listings do not document a headquarters under the policy. There is also a documented São Paulo co-dateline, which this assessment could not resolve. Changes:

- **headquarters**
  - Before: San Francisco, California (US), cited to press releases and the job board.
  - After: `null`.
  - Reason: the sources are datelines and job listings, not a headquarters statement.
- **other_locations labels**
  - Before: "South Korea (office)" and "Spain (office)".
  - After: "Seoul, South Korea (office)" and "Madrid, Spain (office)".
  - Reason: the Nov 2025 release names Seoul and Madrid.
- **eligibility**
  - Before: `eligible` / `us-headquarters`.
  - After: `pending_review` / `undetermined`.
  - The explanation was rewritten to set out the evidence and the gap.
- **publication_status**: `published` → `draft`.
- **sources**
  - Added `crewai-privacy` (crewai.com/privacy-policy, fetched).
  - Added `crewai-pr-2024-10` (Yahoo Finance syndication of the Oct 22, 2024 GlobeNewswire release, fetched).
- **What would resolve it:** a Form D, a terms or legal page with an address, or an official "headquartered in" statement.

Verified unchanged:

- legal_name "CrewAI, Inc." and legal_form "Delaware corporation" (ToS).
- CrewAI AMP product: pricing page lists "Studio (visual editor)", Basic free, Enterprise custom, and "Deploy on CrewAI cloud, your own VPC, or your own infrastructure". The AMP page covers tracing, governance, and a control plane.

## crewai-framework: edited, now DRAFT / pending_review

- **summary**
  - Before: "...standalone framework with its own primitives, not built on another agent framework."
  - After: "...standalone Python framework with its own primitives for agents, tasks, crews, flows, tools, and orchestration."
  - Reason: the README FAQ says the former and does not make the "not built on another framework" claim.
- **eligibility**
  - Before: `eligible` / `us-governed-project`.
  - After: `pending_review` / `undetermined`, with a rewritten explanation.
  - Reason: the maintaining entity is CrewAI, Inc., whose U.S. base is unresolved (see the org).
- **publication_status**: `published` → `draft`.
- **Verified:**
  - LICENSE: MIT text headed "Copyright (c) 2025 crewAI, Inc." with no title line; the README says "MIT License".
  - Python >=3.10,<3.14; `uv tool install crewai`.
  - Install docs cover macOS, Linux, and Windows, with the Visual Studio Build Tools note.
  - Telemetry section: OTEL_SDK_DISABLED opt-out; `share_crew` opt-in.
  - Latest release 1.15.23 (Sep 28); the "1.15.x series" wording is correct.

## all-hands-ai (org): edited

The rebrand evidence was verified:

- all-hands.dev and www.all-hands.dev return 301 to www.openhands.dev.
- github.com/All-Hands-AI/OpenHands returns 301 to OpenHands/OpenHands.
- The press page shows the Nov 18, 2025 and May 6, 2026 releases titled "OpenHands..."; the Sept 2024 releases say "All Hands AI".
- The ToS and privacy policy still say "All Hands AI".

Changes:

- **headquarters.label**
  - Before: "Cambridge, Massachusetts".
  - After: "Massachusetts".
  - Reason:
    - The ToS (Nov 25, 2025) says "All Hands AI is headquartered in the United States" and gives a Notice Address on Cady Avenue in Somerville, MA 02144.
    - The privacy policy (Sep 3, 2025) gives a mailing address in Cambridge, MA 02139.
    - Neither document calls its address the headquarters, and the two addresses differ. The ToS was also cited for Cambridge, which it does not support.
- **eligibility.explanation**
  - Added the Somerville notice address and the note that only the state is recorded.
  - The May 2026 Business Wire release (Yahoo syndication) is datelined BOSTON and calls OpenHands a "Boston-based project".
- **status_note.text**
  - Before: "Rebranded as OpenHands."
  - After: "The company now presents itself and its products under the OpenHands name."
  - Reason: no explicit rebrand announcement was found; the evidence is the redirects and naming.
- **Verified:**
  - Products: the pricing page shows the Individual plan (SaaS) free, bring-your-own-key or at-cost provider access, and Enterprise "SaaS or Self-hosted in your VPC".
  - The enterprise page describes "source-available", "self-hosted in your VPC via Kubernetes", RBAC, guardrails, reporting, observability, an LLM gateway, and budgeting.
  - The cloud docs give app.all-hands.dev with GitHub, GitLab, or Bitbucket login and a Slack app.
  - hiring_url returns 200.

## openhands: edited

- **eligibility.explanation**
  - Before: "terms of service call OpenHands All Hands AI's open-source software and link to the repository".
  - After: "describe the service as built on All Hands AI's own open-source software and point to the OpenHands GitHub repository for its license terms".
  - Reason: this is the ToS wording ("All Hands AI's proprietary open-source software"; open-source license terms "can be found at https://github.com/all-hands-ai/openhands").
- **license_notes**
  - Removed: "Models used with OpenHands carry their own terms."
  - Replaced with: the docs say each public OpenHands repository carries its own license.
  - Reason: no cited source made the model-terms claim; docs.openhands.dev makes the per-repository license statement.
- **checklist.supported_platforms.note**
  - Before: macOS, Linux, and Windows listed as "the primary supported targets".
  - After: the docs recommend these for "the most reliable local setup" and say mobile Linux (Termux) is "not a primary supported target"; an early preview desktop app exists for all three.
  - Reason: exact docs wording.
- **Verified:**
  - Both LICENSE files are MIT: "Copyright © 2025 OpenHands contributors" (OpenHands/OpenHands) and "Copyright (c) 2026 OpenHands contributors" (software-agent-sdk).
  - README: Agent Canvas with a beta badge; runs OpenHands, Claude Code, Codex, Gemini, or other ACP agents; the "full access to your filesystem" warning; Node.js 24+ and uv; SELF_HOSTING hardening.
  - The repository-boundaries table puts the SDK and Agent Server in software-agent-sdk.
  - Latest release: v1.24.0 on 2026-09-25 (v1.x).

## continue (org, archived): edited

Acquisition and archival status verified:

- The continue.dev title and text say "Continue (acquired by Cursor)" and "Continue has joined Cursor".
- The New Stack (2026-06-22, datePublished confirmed) reports:
  - the homepage changed "Around June 16";
  - data export was allowed until July 15;
  - recurring billing was disabled;
  - "Continue, it seems, has been discontinued".
- The README note says the repo "is no longer actively maintained and is read-only for all users"; there was a final 2.0.0 release.
- The repository is not GitHub-archived (the HTML has no archived banner).
- Cursor ToS (last updated Sep 3, 2026): "Anysphere, Inc.".

Changes:

- **New source `continue-tos`** (continue.dev/terms-conditions/, "Last Modified: October 13th, 2025", fetched). It gives:
  - "Continue Dev, Inc." as the provider;
  - a DMCA agent address at 577 Howard St, San Francisco, CA 94105;
  - "the Services will be deemed solely based in the State of California";
  - Delaware law, with San Francisco courts and JAMS arbitration in San Francisco.
- **headquarters.source_ids** and **legal_name.source_ids**: added `continue-tos`.
- **eligibility.explanation**
  - Before: "Gap: no Continue page states a headquarters or street address, and the location comes from Y Combinator's company directory."
  - After: rests on the ToS San Francisco address plus YC, and notes that the ToS does not use the word "headquarters".
  - Reason: an address-bearing official terms page now exists, which meets the policy's "terms naming the entity and address" test.
- **archive_note**
  - Before: "the hosted product was reported discontinued in June 2026".
  - After: "a June 2026 news report said the hosted product appeared to have been discontinued".
  - Reason: the source hedges ("it seems").
- **cursor-tos.published_at**: `null` → `2026-09-03` (the date stated on the page).
- **Not read:** the homepage FAQ answers are client-rendered and hidden in the static HTML, so the export and billing details rely on The New Stack, as the record states.

## continue-extension (archived): edited

- **eligibility**: added the Continue ToS San Francisco address and `continue-tos` to source_ids and sources.
- **checklist.release_status.note**
  - Added: a `v2.1.0-vscode` tag marked Pre-release was published on 2026-06-19, the same day as `v2.0.0-vscode`, which is marked Latest.
  - Reason: the releases page shows both. The README still calls 2.0.0 final.
- **cursor-tos.published_at**: `null` → `2026-09-03`.
- **Verified:**
  - LICENSE: Apache 2.0, "Copyright 2023 Continue Dev, Inc."; README: "Apache 2.0 © 2023-2026 Continue Dev, Inc.".
  - vscode package.json: license Apache-2.0, author "Continue Dev, Inc".
  - Docs home: create, share, and use custom AI code agents; no mention of the shutdown.

## modular (org): verified, no changes

- ToS (Aug 17, 2026): "Modular Inc", 199 1st Street, Los Altos, CA 94022; California law.
- About page:
  - "headquartered in Silicon Valley";
  - offices in San Francisco, Los Altos, Boston, and Edinburgh;
  - "acquired by Qualcomm in July 2026".
- Qualcomm 10-Q (period ended June 28, 2026):
  - Delaware, 5775 Morehouse Dr., San Diego;
  - "On July 28, 2026, we completed the acquisition of Modular Inc".
- Qualcomm release (read through the page's `.md` alternate, because the HTML renders with JavaScript): SAN DIEGO, Jul 29, 2026; "Mojo, MAX, and Modular Cloud will continue as products and brands".
- Modular blog (Jul 29, 2026): same statement.
- ModCon post (Aug 18, 2026): "The MAX license no longer contains device usage restrictions."
- 26.6 post (Sep 17, 2026): compiler open to external contributions.
- Modular Cloud page: per-token shared endpoints, per-minute dedicated endpoints, customer AWS/GCP/Azure option, console sign-up.

## mojo: verified, no changes

- Repo LICENSE: "The Modular repository is licensed under the Apache License v2.0 with LLVM Exceptions". `Apache-2.0 WITH LLVM-exception` is correct.
- README: "Mojo compiler: /Mojo" and stdlib; "We aren't accepting contributions to the Mojo compiler yet". The record notes the conflict with the 26.6 post.
- ModCon post: "Mojo 1.0 is now fully open source ... compiler and all tooling".
- Community License page:
  - Section 1.4 covers separately licensed Apache components.
  - The page ends with a Qualcomm + Modular ModCon FAQ that says the Mojo language, stdlib, compiler, and tooling are in GitHub under Apache 2.0 with LLVM exceptions. This supports the eligibility wording.
- PyPI mojo:
  - 1.0.0 uploaded 2026-08-11; 1.1.0 uploaded 2026-09-17 (latest).
  - License field: `LicenseRef-MAX-Platform-Software-License`.
- GitHub releases: "MAX 26.6 / Mojo 1.1.0" (Sep 17) and "MAX 26.5 / Mojo 1.0.0" (Aug 11).
- 26.5 post: "first release in 2023", so released_at "2023" is supported.
- Requirements page:
  - Linux with glibc 2.34+ on x86-64-v3 or Neoverse N1+;
  - macOS 15+ on Apple silicon;
  - Windows via WSL only;
  - GPU support optional (NVIDIA, AMD, Apple).

## max: edited

- **license_notes**
  - Before: "...it also says the earlier device-count limits on free production use were removed."
  - After: "Modular's ModCon post (August 18, 2026) says the MAX license no longer contains device usage restrictions."
  - Reason:
    - The Community License page says "removes usage restrictions" and does not mention device counts.
    - The ModCon post says "device usage restrictions".
    - "Device-count limits on free production use" was unsupported detail.
  - Added `modcon-2026` to source_ids and sources.
- **Verified:**
  - Two license entries: Apache-2.0 WITH LLVM-exception for the repo code, and the Community License with spdx null.
  - Community License terms:
    - attribution notice required;
    - trademark requirement for commercial hosted training or inference services;
    - no use of MAX as AI training input to produce a substitute.
  - Last Modified Aug 18, 2026.
  - PyPI max 26.6.0 uploaded 2026-09-17, `LicenseRef-MAX-Platform-Software-License`.
  - Quickstart: pixi/uv, Docker tutorial reference, Linux/WSL, data-center GPU recommendations, localhost:8000, benchmark step.
  - 26.6 post: "committed to making MAX source available" with no date, so `source_code: partial` is appropriate.

## modal (org): edited

- **summary**
  - Before: "operates a serverless cloud platform".
  - After: "operates a cloud platform".
  - Reason: none of the cited pages (home, company, sandboxes, pricing) uses "serverless". "Data" is supported by the company page ("applications for data, AI, and machine learning").
- **Verified:**
  - Form D: Modal Labs, Inc.; Delaware; principal place of business 233 Spring Street, New York, NY; filed 2026-08-31 (the index page shows Filing Date Aug 31, 2026).
  - ToS (May 2026): "Modal Labs, Inc., a Delaware corporation".
  - Company page offices: New York City, Stockholm, San Francisco, London.
  - Products and pricing: per-second billing and $30/month free compute on the Starter plan.
  - LICENSE files: modal-client is Apache 2.0; modal-examples is MIT.

## baseten (org): verified, no changes

- Form D: Baseten Labs, Inc.; Delaware; San Francisco; filed 2026-06-30.
- Privacy policy (Sep 23, 2026) and terms (Sep 15, 2026): 560 Davis St., Suite 250, San Francisco; California law.
- About page: "We started Baseten in 2019".
- Model APIs: OpenAI-compatible; DeepSeek, GLM, Kimi, Nemotron, and GPT OSS; billed per input, cached-input, and output token.
- Dedicated inference: Cloud, self-hosted, or hybrid.
- Training: Training Jobs are GA and the Loops SDK is in early access.
- Blaxel post (Sep 10, 2026): "Baseten has acquired Blaxel"; sandboxes and persistent storage.
- Truss LICENSE: MIT.

## lightning-ai (org): verified, no changes

Merger wording checked:

- Lightning blog (read in the browser): dated "January 21, 2026"; "Lightning AI and Voltage Park have merged".
- Voltage Park release (January 2026): "today announced the completion of a merger with Voltage Park ... operating under the Lightning AI name".
- About page:
  - "Lightning AI and Voltage Park are now one company";
  - "seven Tier 3+ data centers in the US";
  - "creators of PyTorch Lightning ... open sourced it in 2019".
- The status_note wording ("completed a merger announced on January 21, 2026 ... operates under the Lightning AI name ... GPU data centers in the United States") is supported.

Other checks:

- Form D (filed 2026-01-08): Lightning AI, Inc.; previous name Voltage Park, Inc.; Delaware; San Francisco; incorporated 2023; business combination "Yes".
- Privacy policy: effective Aug 20, 2023; "Grid.ai, Inc. dba 'Lightning AI'"; 50 West 23rd St, New York.
- Terms: New York law.
- Careers: office hubs in New York, San Francisco, Seattle, and London.
- Pricing: free tier; "Billed by the second"; Pro, Teams, and Enterprise plans; multi-cloud marketplace.
- LitServe, TorchMetrics, and lightning-thunder LICENSE files are Apache 2.0; LitGPT's LICENSE.md is Apache 2.0. This supports the "open-source projects" wording.

## pytorch-lightning: verified, no changes

Security advisory note checked:

- GHSA-w37p-236h-pfx3:
  - CVE-2026-44484, Critical, published Apr 30, 2026;
  - affected pytorch-lightning 2.6.2 and 2.6.3;
  - credential-harvesting payload; rotate credentials; versions quarantined.
- Lightning blog (Apr 30, 2026):
  - "an attacker captured PyPI credentials";
  - the payload ran "the moment the package was imported";
  - "GitHub source code repository was never compromised";
  - versions 2.6.2 and 2.6.3 retired and not re-published.
- PyPI (both `lightning` and `pytorch-lightning`): no 2.6.2 or 2.6.3; 2.6.4 uploaded 2026-05-20.
- The run note is accurate.

Latest release:

- Lightning 2.6.6 is marked Latest on GitHub (Sep 10).
- PyPI `lightning` 2.6.6 was uploaded 2026-09-10.
- The install docs show "Stable (2.6.6)", pip, conda-forge, and source installs.

Other checks:

- LICENSE: Apache 2.0.
- README: Fabric; `pip install lightning`; CPU, CUDA/MPS, and TPU; CI table covering Linux, OSX, and Windows.
- Governance page: BDFL makes "All final decisions"; maintainers decide what goes into a release.

## chroma (org): verified, no changes

- Terms (Oct 2, 2024): "Chroma Inc."; opt-out address 2261 Market Street #4728, San Francisco, CA 94114.
- Privacy policy: same address.
- Careers: all roles in San Francisco.
- Pricing: Starter $0 with $5 credits; Team $250; Enterprise with "Single tenant clusters"; write, storage, query, and network charges.
- OSS docs: "majority of our engineering effort is focused on distributed Chroma and the cloud offering".

## chroma-db: verified, no changes

- LICENSE: Apache 2.0.
- PyPI chromadb 1.5.9 uploaded 2026-05-05. This is still the latest stable release. The GitHub "Latest" tag is a dev pre-release (1.5.10.dev304).
- OSS docs:
  - "small core team";
  - telemetry stopped as of 1.5.4.
- Getting started: pip, npm, and cargo installs; `chroma run`; Docker; in-memory and persistent clients.

## lancedb (org): edited, kept published

The lead asked for headquarters evidence. What exists:

- An official page on the company's own site: an undated internship post that describes LanceDB as "an early-stage startup based in San Francisco".
- The Y Combinator directory (W22, founded 2022, San Francisco, Active).
- Customer terms PDF governed by California law.
- GitHub org location "United States of America".
- Ashby job board: U.S. and Canada remote roles and one San Francisco Bay Area role.

What was not found:

- No address on any legal page (the terms and privacy PDFs have none).
- No EDGAR match for "LanceDB".
- The entity name is inconsistent: the footer says "© 2026 LanceDB Inc." and the privacy PDF says "LanceDB Systems, Inc.".

I kept it published because the company's own site states where it is based and no conflicting location evidence was found. This is the thinnest published basis in the batch; an editor may prefer draft.

Changes:

- **eligibility.explanation**
  - Before: "a LanceDB blog post describes the company as a startup based in San Francisco".
  - After: "an undated internship post on LanceDB's own blog describes the company as an early-stage startup based in San Francisco".
  - Reason: precision about the nature of the source.
- **Verified:**
  - Docs: OSS is "an open-source embedded retrieval library, with client SDKs in Python, TypeScript and Rust"; Enterprise is a distributed multimodal lakehouse with `db://` connections, set up by contacting LanceDB.
  - Governance post dated November 18, 2025.
  - lancedb/lancedb LICENSE: Apache 2.0.

## lance (draft): edited, stays draft

- **eligibility.source_ids / sources**: added `lance-voting` (lance.org/community/voting/, fetched).
  - It supports "specification changes" as PMC vote matters and says "A -1 binding vote is considered a veto".
  - The claim had cited only the governance blog, which lists releases, maintainer and PMC changes, and governance changes.
- **Verified:**
  - PMC roster parsed from the HTML table: 19 members; 9 list LanceDB; 8 other companies (Netflix ×2, Runway AI ×2, Alibaba, Databricks, Jump Trading, Harvey.ai, Rerun.io, Bytedance).
  - The community page says governance is "inspired by" ASF, CNCF, and Substrait. It names no foundation or legal entity.
  - github.com/lancedb/lance returns 301 to lance-format/lance.
  - LICENSE: Apache 2.0.
  - README: lakehouse format with file, table, and catalog spec; `pip install pylance`; preview index; stable storage versions remain readable.
  - PyPI pylance 12.0.0 uploaded 2026-09-17.

## unsloth (org, draft): verified, no changes

- unsloth.ai/terms returns "404 Not Found" in the browser; curl and WebFetch get 403 from bot protection.
- YC lists San Francisco; the GitHub org lists "United States of America".
- README: three ways to use it (Desktop, Studio, Core); OpenAI-compatible API; Windows, Linux, WSL, and macOS.
- Draft status and the pending_review reasoning stand.

## unsloth-library (draft): verified, no changes

- LICENSE appendix:
  - "Files under unsloth/*, tests/*, scripts/* are Apache 2.0 licensed. Files under studio/*, unsloth_cli/* ... are AGPLv3 licensed."
  - Copyright line: "Unsloth AI. Inc team".
- COPYING: AGPL v3.
- studio/__init__.py: "SPDX-License-Identifier: AGPL-3.0-only".
- PyPI unsloth 2026.9.12 uploaded 2026-09-28; license expression Apache-2.0.
- README: LoRA, QLoRA, full fine-tuning, pretraining, GRPO, and DPO; GGUF export; Windows, Linux, WSL, and macOS; NVIDIA, AMD, and Intel; Vulkan; ROCm Docker image.
- Install docs: Conda and Docker sections.

## Could not verify directly / notes for an editor

- **Pages that render only with JavaScript** (WebFetch returned no content): lightning.ai pages (about, blog, pricing, careers, privacy, terms, docs), the Qualcomm release, and the unsloth.ai legal pages.
  - I read these in the browser pane in a separate tab, or through the page's `.md` alternate for Qualcomm.
- **businesswire.com** was not fetched. Business Wire releases were read through their Yahoo Finance syndications, as the records already cite.
- **GitHub REST API** was rate-limited. Releases and advisories were read from github.com HTML pages; package versions came from the PyPI JSON API.
- **Continue homepage FAQ answers** (data export and subscription) load client-side and were not read. The record relies on The New Stack for those details and says so.
- **CrewAI:** an address-bearing source (Form D, terms with an address, or an official HQ statement) would allow re-publication. The same applies to `crewai-framework`.
- **LanceDB:** consider asking for an address-bearing legal page. The published basis rests on the company's own blog statement plus corroborating directory and governing-law evidence.
