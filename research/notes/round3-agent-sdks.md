# Round 3: open-source agent SDKs and coding agents — reviewed 2026-10-01

Assignment: organization `cline`; artifacts `codex-cli`, `openai-agents-sdk`,
`gemini-cli`, `agent-development-kit`, `strands-agents`, `smolagents`,
`cline-extension`. None of these slugs existed before this round. No existing file
was edited.

All licenses were read from the actual LICENSE files (fetched raw from GitHub with a
generic `USASI-catalog-research/0.3` User-Agent; no personal data in any request).
Every cited page was fetched today. No software was installed or run, no accounts
were created, and no forms were submitted.

## Decisions

| Slug | Decision | Kind | License (file read) | Eligibility basis |
| --- | --- | --- | --- | --- |
| `cline` (org) | Published | — | — | `us-headquarters` (country only; see below) |
| `cline-extension` | Published | runtime | Apache-2.0, "Copyright 2026 Cline Bot Inc." | `us-governed-project` via Cline Bot Inc. |
| `codex-cli` | Published | runtime | Apache-2.0, "Copyright 2025 OpenAI" (+ NOTICE: Ratatui-derived code, MIT) | `us-governed-project` via OpenAI |
| `openai-agents-sdk` | Published | framework | MIT, "Copyright (c) 2025 OpenAI" (Python and JS repos) | `us-governed-project` via OpenAI |
| `gemini-cli` | Published | runtime | Apache-2.0 (template copyright line) | `us-governed-project` via Google |
| `agent-development-kit` | Published | framework | Apache-2.0 (adk-python; Java/Go/JS/Kotlin repos also Apache-2.0) | `us-governed-project` via Google |
| `strands-agents` | Published | framework | Apache-2.0 (`LICENSE.APACHE`; NOTICE: Amazon.com, Inc. or its affiliates) | `us-governed-project` via AWS/Amazon |
| `smolagents` | Published | framework | Apache-2.0 | `us-governed-project` via Hugging Face, Inc. |

Kind choice: end-user agent applications (Codex CLI, Gemini CLI, Cline) follow the
owner's `openclaw` / `hermes-agent` models (`runtime`); libraries for building agents
(Agents SDK, ADK, Strands, smolagents) use `framework`, like `langgraph` and `autogen`.
Note that the archived `continue-extension` record used `framework` for a comparable
coding agent; the owner may want to harmonize.

## Hosted-model dependence (stated plainly in each record)

Each record says the repository is client code and contains no model weights, in
`useful_for`, `availability.access_conditions` and the `source_code` checklist note.

- **Codex CLI**: by default it calls OpenAI's hosted models through a ChatGPT plan
  sign-in or an API key billed via the OpenAI Platform. Its docs describe an `--oss`
  mode that uses a local Ollama or LM Studio server (`--local-provider` /
  `oss_provider`).
- **Gemini CLI**: Google-hosted Gemini only (Google account, Gemini API key, or Vertex
  AI); internet required. README, install guide, terms page and FAQ document no
  local provider. The run note says so.
- **OpenAI Agents SDK**: OpenAI models by default; other providers through
  OpenAI-compatible base URLs, custom ModelProvider, and beta LiteLLM / any-llm
  adapters. No local runtime is documented on the models page. Tracing is on by
  default and sends traces to OpenAI's Traces dashboard; this is recorded.
- **ADK**: "optimized for Gemini" but model-agnostic; docs cover Ollama and vLLM (via
  LiteLLM, Python) and LiteRT-LM (Python, Kotlin).
- **Strands**: Amazon Bedrock is the default (AWS credentials plus Bedrock model
  access); Ollama and llama.cpp providers are documented for Python.
- **smolagents**: the least hosted-dependent. It runs local models via Transformers or
  Ollama, and hosted ones via HF Inference Providers, LiteLLM, or OpenAI-compatible
  servers.
- **Cline**: bring-your-own provider, the hosted Cline Provider (credits), or local
  Ollama / LM Studio / Atomic Chat. "Use Compact Prompt" is recommended for local
  models.

## Cline: organization eligibility (needs owner attention)

Evidence (all fetched 2026-10-01):
- Terms of Service (last modified 2025-09-25): provider is Cline Bot Inc. The service
  is "deemed solely based in the State of Delaware" and Delaware law applies. No
  address is given.
- Privacy notice (2025-09-24): operator is Cline Bot Inc. No address.
- LICENSE / README: "Copyright 2026 Cline Bot Inc."
- USPTO TSDR record for the CLINE mark (Serial 98795282, Reg. 8258729, registered
  2026-05-19): owner Cline Bot Inc., CORPORATION, organized in DELAWARE, owner
  address 1007 N Orange St., 4th Floor, Suite #3771, Wilmington, Delaware. (Attorney
  and correspondent details on that page were not used.)
- Careers page (https://cline.bot/careers; the Greenhouse board `cline` redirects
  there): open roles listed in San Francisco. The page's job card template shows
  "Location: San Francisco, CA (On-site)".

No official page names a "headquarters". The Wilmington address looks like an address
of record (suite number), so the record does **not** call it the headquarters. I
followed the published `nous-research` precedent: `headquarters.country: US` with a
label explaining that no city is stated, and San Francisco recorded under
`other_locations`. No non-U.S. office or parent was found.
**If the owner reads the assignment's "verify U.S. headquarters" strictly (an
explicit HQ statement), change `cline` and `cline-extension` to `pending_review` +
`draft`.** The cline-extension eligibility does not depend on the HQ city: the
maintainer is a Delaware corporation.

Not used: third-party databases (Crunchbase, Tracxn, PitchBook, job aggregators),
which all say "San Francisco HQ", and Cline's funding blog post. No funding,
valuation, star, install, or user counts were recorded.

Careers: Cline uses Greenhouse (identifier `cline`), and its postings'
`absolute_url` host is `cline.bot`. I set only `hiring_url` and did **not** add a
`careers` block, because enabling feed collection is an editorial/config decision. To
enable it, add `careers` with `source: {type: greenhouse, identifier: cline}` and
`posting_hosts: [cline.bot]`.

Cline's JetBrains plugin is **not open source** (README: "Currently we are not
open-sourcing JetBrains plugins"). This is recorded in the org, product, and artifact
license notes.

## Per-artifact evidence gaps / observations

- **codex-cli**: `developers.openai.com/codex/*` now 308-redirects to
  `learn.chatgpt.com/docs/*`, so the docs links use the new host. The contributing
  guide says external code contributions are not accepted. Reviewed release
  `rust-v0.159.3` (Latest, 2026-09-30). Many `rust-v0.161.0-alpha.*` pre-releases
  appeared the same day. The Windows docs page describes the ChatGPT desktop app
  sandbox, so it was not cited for CLI platform claims; the README's PowerShell
  installer was cited instead.
- **openai-agents-sdk**: the record covers both the Python (v0.22.3, 2026-09-17) and
  JS/TS (v0.18.0, 2026-09-10) SDKs. Only the Python docs site was read; JS-specific
  docs were not reviewed.
- **gemini-cli**: the LICENSE uses the Apache template copyright line (no named
  holder). Maintainer evidence comes from the README ("Built with ❤️ by Google…"), the
  `@google/gemini-cli` npm name, and the Google CLA requirement. The README's free-tier
  request quotas were deliberately not recorded. Reviewed v0.62.0 (2026-09-29).
- **agent-development-kit**: the docs moved from `google.github.io/adk-docs/` (301)
  to `adk.dev`. The footer reads "Copyright Google 2026". The README title is "ADK 2.0".
  Reviewed adk-python v2.10.0 (2026-09-25). Licenses for the other language repos were
  read but get no separate license entries (noted in `license_notes`).
- **strands-agents**: **material change**. `github.com/strands-agents/sdk-python` now
  301-redirects to **`strands-agents/harness-sdk`**, a monorepo with the Python/TS SDKs,
  "Strands harness", a CLI, an MCP server, and the docs site. The repo page shows no
  rename notice; I saw the redirect myself, and the record links only the current
  repo. The root license file is `LICENSE.APACHE` (no plain `LICENSE`).
  CONTRIBUTING.md mentions a `LICENSE.MIT` that does not exist at the root
  (404). This is a repo inconsistency and was not recorded as a license. The docs site
  does not name AWS. AWS maintainership rests on the AWS Open Source Blog announcement
  (2025-05-16), the NOTICE (Amazon copyright), and CONTRIBUTING (Amazon CoC, AWS
  security reporting). The repo is in the separate `strands-agents` GitHub org, and no
  foundation is documented. The old README docs URLs
  (`/docs/user-guide/concepts/model-providers/`, `/quickstart/overview/`) return 404,
  so current `/docs/user-guide/sdk/...` pages were used. The Python quickstart names a
  default Bedrock model; it was not recorded. Reviewed python/v1.57.2 (Latest,
  published 2026-10-01).
- **smolagents**: latest release v1.26.0 is from 2026-05-29, about four months old,
  but commits continued through 2026-09-30, so the project is not archived. The
  Hugging Face eligibility mirrors the existing `transformers`/`trl` records, plus a
  pointer to the pending NVIDIA acquisition (announced 2026-09-03; not relied on; no
  deal value recorded).
- **Eligibility sources fetched today for parents**: OpenAI SEC Exhibit 10.1 (OpenAI
  Group PBC, Delaware PBC, 1455 3rd Street, San Francisco). Google Terms of Service
  (Google LLC, Delaware, Mountain View; effective 2026-07-30). AWS Customer Agreement
  (Amazon Web Services, Inc., 410 Terry Avenue North, Seattle; updated 2026-08-14).
  Hugging Face terms (Hugging Face, Inc., Delaware corp., New York law) and privacy
  policy (company and servers in the U.S.). `openai.com/policies/terms-of-use` returned
  403 and was not cited.

## Not done / out of scope

- No `system_openness_review` (not applicable to software projects).
- No products were added to the existing `openai`, `google`, `amazon` or
  `hugging-face` records (no edits to existing files). Note: `openai.yml` already lists
  a `codex-cli` product with the GitHub repo URL. The owner may want to link it to
  this new artifact record.

## Validation

`npx tsx scripts/validate.ts` (final run): 0 errors, 1 warning. The warning is the
existing Continue warning, not mine. No issues in any of my eight files. An earlier
run showed one error in another agent's file (`artifacts/boltz-2.yml`); it had been
fixed by the final run.
