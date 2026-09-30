# Research notes: r2-oss-apps

Researcher group: r2-oss-apps (round 2). Research date: 2026-09-29.
Validator (`npx tsx scripts/validate.ts`): 0 errors in this group's files. One expected warning:
`continue-extension` links to the archived `continue` org, so it is shown without a link.

Files created:

- organizations: `langchain`, `llamaindex`, `crewai`, `all-hands-ai`, `continue`
- artifacts: `langchain-framework`, `langgraph`, `llamaindex-framework`, `crewai-framework`,
  `openhands`, `continue-extension`

The GitHub REST API hit its unauthenticated rate limit partway through (the IP is shared). Later
checks used github.com pages and raw.githubusercontent.com. Every cited GitHub URL returned
HTTP 200 on 2026-09-29.

## Organizations

### langchain: published
- **Why:** The about page says "headquartered in San Francisco", with offices in New York,
  Boston, and Amsterdam. The ToS (updated 2026-06-02) names LangChain Inc., a Delaware
  corporation, with Delaware law.
- **Eligibility basis:** us-headquarters.
- **Other details:**
  - Founded 2023: per the about page, the company began in early 2023 after a late-2022 side project.
  - Products: LangSmith (observability and evals), LangSmith Deployment, and LangSmith Fleet
    (no-code agent builder).
- **Evidence gaps:** None material. The Amsterdam office is recorded as an `other_locations`
  entry (NL).
- **Not included:** Funding, valuation, and customer and download counts from the about page
  and search results.

### llamaindex: published
- **Why:**
  - The ToS names LlamaIndex, Inc. as the provider, under Delaware law.
  - The March 2025 PR Newswire release is datelined San Francisco, and its boilerplate says
    "Based in San Francisco".
  - The careers page lists San Francisco roles and an SF office.
  - The privacy notice (2026-08-24) appoints an EU representative.
- **Eligibility basis:** us-headquarters.
- **Evidence gaps:** No current official page says "headquarters". The clearest statement is
  from 2025. The legal form (e.g. Delaware corporation) is not stated, so `legal_form` is null.
- **Material change:** The framework README now says the company's primary focus has shifted to
  LlamaParse, LiteParse, and parsing benchmarks. The OSS framework "remains available". This is
  recorded as a notable fact and in the artifact summary. It is not treated as a status change.
- **Not included:** Databricks/KPMG minority investments (funding).

### crewai: published (weakest HQ evidence in this group; worth a reviewer look)
- **Why:**
  - The ToS (effective 2025-09-24) names CrewAI, Inc., a Delaware corporation, under New York law.
  - Business Wire releases dated 2025-11-19 and 2026-02-11 (read via Yahoo Finance syndication;
    businesswire.com returned 403) are datelined San Francisco.
  - The official Workable job board, linked from the crewai.com footer, lists on-site SF roles,
    remote U.S. roles, and one São Paulo role.
- **Eligibility basis:** us-headquarters.
- **Evidence gaps:**
  - No official page states a headquarters or street address.
  - No SEC Form D was found in EDGAR.
  - Third-party profiles give a Middletown, DE address. That looks like a registered-agent
    address, so it was not used.
  - The 2024 GlobeNewswire release had a dual "San Francisco and São Paulo" dateline.
  - The Nov 2025 release reports new offices in South Korea and Spain; both are recorded as
    other_locations.
  - Nothing indicates a foreign parent or a foreign HQ.
  - If a reviewer wants an explicit HQ statement, this record should move to
    pending_review/draft.
- **Founded:** left null. No official founding year was found.
- **Product:** CrewAI AMP (Basic free, Enterprise custom; cloud, customer VPC, or customer
  infrastructure).

### all-hands-ai: published
- **Why:**
  - The ToS (revised 2025-11-25) says "All Hands AI is headquartered in the United States", with
    Delaware law and courts.
  - The privacy policy (2025-09-03) gives a mailing address in Cambridge, MA.
  - The May 2026 Business Wire release (via Yahoo) is datelined Boston.
- **Eligibility basis:** us-headquarters.
- **Material change (status_note):** The company now brands itself as OpenHands.
  - all-hands.dev returns a 301 redirect to openhands.dev.
  - github.com/All-Hands-AI/OpenHands returns a 301 redirect to github.com/OpenHands/OpenHands.
  - Press releases since November 2025 use "OpenHands".
  - The ToS and privacy policy still say "All Hands AI".
  - The record name is "All Hands AI (OpenHands)", and the slug stays `all-hands-ai`.
- **Evidence gaps:** The exact legal entity name (Inc.?) and the founding year are not stated
  on the pages read, so `legal_name`, `legal_form`, and `founded` are null.
- **Products:** OpenHands Cloud (hosted; free individual tier) and OpenHands Enterprise (Agent
  Control Plane). The enterprise page calls it "source-available" and self-hosted in the
  customer's VPC; the pricing page also lists SaaS.
- **Not included:** Staff names on the about page, and the Series A amount.

### continue: ARCHIVED (historical record)
- **Material change:**
  - The continue.dev homepage now reads "Continue (acquired by Cursor)" and "Continue has joined
    Cursor".
  - The New Stack (2026-06-22, news) reports these points:
    - the homepage changed around June 16;
    - users had until July 15 to export data;
    - recurring billing was disabled;
    - the product was discontinued.
  - The repository README says the repo "is no longer actively maintained and is read-only for
    all users" after a "final 2.0.0 release".
  - Cursor's terms name Anysphere, Inc. as the provider.
- **Eligibility:** eligible, us-headquarters, based on the pre-acquisition company.
  - The Y Combinator directory lists Continue as founded in 2023 (Summer 2023 batch), located in
    San Francisco, and with status "Acquired".
  - The privacy notice (2026-02-05) names Continue Dev, Inc.
  - Gap: no Continue page gives an HQ address. The location rests on the YC directory (kind: other).
- **Why archived and not published:**
  - The company no longer operates its product independently.
  - The hosted service was reported shut down.
  - The OSS project is unmaintained.
  - The lead may prefer `published` with a status_note instead; that is a one-line change.
- **Ownership:** `ownership_category: unit-of-another-organization`, with no `parent_org_slug`.
  - The `anysphere` record (another group) exists and records that SpaceX completed its
    acquisition of Anysphere on 2026-08-14.
  - Whether Continue Dev, Inc. survives as an Anysphere subsidiary (versus an acqui-hire or asset
    deal) is undocumented, so no parent link was set.
- **Not included:** Founders' names and funding (both appear in the news article).

## Artifacts

### langchain-framework: published
- **License:** MIT. The LICENSE file says "Copyright (c) LangChain, Inc.".
- **Maintainer:** LangChain Inc. The LICENSE file and the about page (which lists LangChain
  among the company's OSS frameworks) support this.
- **Other details:**
  - The default branch is `master`.
  - Docs: docs.langchain.com (install guide requires Python 3.10+).
  - Releases are tagged per package on GitHub.
- **Out of scope:** The JS version (langchainjs) is mentioned only, not assessed.

### langgraph: published
- **License:** MIT, "Copyright (c) 2024 LangChain, Inc.".
- **Maintainer:** The README says "LangGraph is built by LangChain Inc" and that it can be used
  without LangChain.
- **Evidence gap:** The install page's Python 3.10+ note applies to LangChain, which the page
  recommends installing with LangGraph. The note says so.

### llamaindex-framework: published
- **License:** MIT.
- **LICENSE copyright:** The copyright line names an individual, not the company.
  - Eligibility rests on company attribution instead: the README says "by LlamaIndex, the company
    behind LlamaParse", the repo sits in the run-llama org, and the docs describe the framework
    as built by the makers of LlamaParse.
  - The individual's name is deliberately not in the record.
- **Supported platforms:** Left `unknown`. The installation guide does not state Python versions
  or operating systems.
- **Latest release seen:** v0.14.25 (2026-09-21).
- **Out of scope:** The TypeScript SDK (LlamaIndex.TS) is mentioned only, not assessed.

### crewai-framework: published
- **License:** MIT. The LICENSE file says "Copyright (c) 2025 crewAI, Inc." and omits the
  "MIT License" title line; the README states the MIT License.
- **Standalone status:** The README FAQ says it is a standalone framework, not built on another
  agent framework.
- **Telemetry:** Anonymous telemetry is on by default, with an OTEL_SDK_DISABLED opt-out. This
  is recorded in run_notes.
- **Requirements:** Python >=3.10,<3.14. The CLI is installed via `uv tool install crewai`.

### openhands: published
- **Material change:** The repository moved from All-Hands-AI/OpenHands to OpenHands/OpenHands.
  - That repo now holds "Agent Canvas", a TypeScript/React control center.
  - The agent, the Python SDK, and the Agent Server moved to OpenHands/software-agent-sdk.
  - Both repos use the MIT license, and both LICENSE files name "OpenHands contributors" as the
    copyright holder.
  - Two license entries are recorded.
- **Maintainer:** All Hands AI. The ToS calls OpenHands the company's open-source software and
  links to the repo, and the README calls OpenHands Cloud "our commercial offering".
- **Status:** The README badge marks Agent Canvas as beta.
- **Enterprise edition:** Described as source-available and commercially licensed. This is noted
  in license_notes and is not counted as open.
- **Kind:** `framework` (SDK plus agent application). The schema has no "application" kind.

### continue-extension: ARCHIVED
- **License:** Apache-2.0. The LICENSE says "Copyright 2023 Continue Dev, Inc.", and the README
  says "Apache 2.0 © 2023-2026 Continue Dev, Inc.".
- **Status:** The repository is not GitHub-archived, but the README says it is read-only and not
  maintained. The final VS Code v2.0.0 tag is dated 2026-06-19.
- **Docs:** docs.continue.dev is still online and does not mention the shutdown.
- **Kind:** `framework`, for lack of an application kind.

## Surprising or ambiguous items
- Continue was acquired by Cursor (June 2026) and discontinued. Cursor/Anysphere was in turn
  acquired by SpaceX (per the anysphere record), so Continue is indirectly SpaceX-owned. The
  New Stack notes this too.
- OpenHands' main repo is no longer the Python agent. It is now a TypeScript control center that
  can also run third-party agents (Claude Code, Codex, Gemini via ACP).
- LlamaIndex has publicly de-prioritized its OSS framework in favor of LlamaParse.
- The SEC EDGAR company search (via WebFetch) returned "No matching companies" for "crewai",
  "langchain", and "all hands ai", so there is no Form D principal-place-of-business evidence.
  LlamaIndex and Continue were not checked in EDGAR because direct requests were blocked (403).
- Neither CrewAI nor Continue publishes an HQ street address.
