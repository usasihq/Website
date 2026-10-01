# Round 3 — open agent protocols and foundations (reviewed 2026-10-01)

I created six files, all published. None of the slugs existed before. Every cited page
was fetched and read on 2026-10-01. Raw LICENSE, GOVERNANCE, README and charter PDFs
were read with curl using a generic UA. SEC filings were read with WebFetch, because
EDGAR rejects a generic UA and no personal identifier was sent. `npx tsx
scripts/validate.ts`: 0 errors. The 2 warnings both belong to other agents' files
(vercel, continue-extension).

## Organizations

### agentic-ai-foundation: published
- **Decision:** It gets its own organization record, with `parent_org_slug: linux-foundation`,
  `parent_relationship: hosted-project`, `ownership_category: foundation-hosted` and basis `us-control`.
- **Why a separate record:** The AAIF charter (Exhibit B, "The Agentic AI Foundation Charter,
  The Linux Foundation, amended July 29, 2026", in github.com/aaif/foundation) defines AAIF as a
  **Directed Fund of The Linux Foundation**. It is not a separate legal entity. The AGENTS.md
  technical charter, the MCP blog and Anthropic's announcement also call it "a directed fund
  under the Linux Foundation". This is the same structure as `pytorch-foundation` and `lf-ai-data`,
  which already have their own records under `linux-foundation`. AAIF also has its own governing
  board, Technical Committee, website and six hosted projects, so it meets the CONTENT_FORMAT
  rule that a unit gets a record when it has distinct artifacts. `legal_name` and HQ are null
  because no separate entity or address is documented.
- **Projects (aaif.io/projects):** MCP, goose and AGENTS.md (Impact Stage); agentgateway, A2A and
  Agent Router (Growth Stage), per the aaif/technical-committee README. Each project keeps its
  own charter and TSC (charter §1a, §4).
- **Gaps:** I found no founding legal date apart from the 2025-12-09 announcement. I did not
  read the participation agreement (Exhibit A). I named no board or TC members (individuals).

### block: published
- **Basis:** `us-headquarters`. The FY2025 10-K cover lists the principal executive office at
  1955 Broadway, Suite 600, Oakland, CA, and Delaware incorporation. The Q2 2026 10-Q repeats both.
- **Surprise:** Both filings say Block "has no formal headquarters" because it uses a distributed
  work model. Oakland is its SEC-required principal executive office. ELIGIBILITY.md accepts a
  principal executive office, and the HQ label says this explicitly.
- **Products:** Managerbot (Square; `enterprise-software`) and Moneybot (Cash App;
  `assistant-app`). Moneybot's only dated availability source is a November 2025 pilot
  announcement, and the record says so. goose is **not** listed as a Block product, because it is
  now AAIF-stewarded. Buzz and Berd are mentioned in notable_facts only, since details are thin.
- **Gaps:** `founded` is null; I verified no incorporation year. No careers block was added.

## Artifacts (all `record_level: project`)

| Slug | Kind | Status | Governing entity (eligibility) | License (from LICENSE file) |
| --- | --- | --- | --- | --- |
| model-context-protocol | framework | published | MCP a Series of LF Projects, LLC / AAIF | Apache-2.0 + MIT (legacy) + CC-BY-4.0 (docs) |
| a2a-protocol | framework | published | Linux Foundation project / AAIF (Growth, Aug 2026) | Apache-2.0 |
| agents-md | framework | published | AGENTS.md a Series of LF Projects, LLC / AAIF | MIT (© 2025 OpenAI) |
| goose | runtime | published | goose, a Series of LF Projects, LLC / AAIF | Apache-2.0 (© 2024 Block, Inc.) |

**Kind choice.** No enum value fits a protocol or file convention well. I used `framework`, as the
existing `onnx` record (a format spec plus package) does, because MCP and A2A ship SDKs. AGENTS.md
is only a Markdown convention, so its installation, supported_platforms and release_status are
`not_applicable`, with notes. goose is `runtime`, like openclaw and hermes-agent. A future
`protocol`/`specification` kind would fit better; that is the owner's call.

**MCP.** Anthropic introduced it on 2024-11-25 and donated it on 2025-12-09. The governance page
says it is a Series of LF Projects and that maintainer roles are individual, not company seats.
- **Licensing is in transition:** the spec repo LICENSE puts new code and spec contributions
  under Apache-2.0, keeps un-relicensed contributions under MIT, and puts docs under CC-BY-4.0.
- **Discrepancy:** the spec README still says "MIT License".
- **SDKs differ:** TS, C#, Go, Rust, Ruby, Swift, PHP and Kotlin use the transition text; the
  Python SDK (© 2024 Anthropic, PBC) and Java SDK LICENSE files are plain MIT.
- Current protocol version is 2026-07-28. version/released_at are null, following the
  openclaw model.

**A2A.** Google launched it in April 2025 and transferred it to the LF on 2025-06-23. It joined
AAIF in August 2026: the AAIF blog is dated 08-17 and the A2A blog 08-27. The TSC has eight
**company** seats (AWS, Cisco, Google, IBM, Microsoft, Salesforce, SAP, ServiceNow). That is
multi-organization governance, assessed in writing: eligibility rests on LF stewardship, not on
TSC composition. Spec 1.0.0; latest tag v1.0.1 (2026-05-28). All six SDK repos are Apache-2.0
(the Rust SDK's file is LICENSE.md); only the Python one is cited.

**AGENTS.md.** OpenAI released it in August 2025 (per the LF press release), so `released_at: 2025-08`.
The technical charter (adopted 2025-12-08) says docs are CC-BY-4.0. No such LICENSE file exists,
so that is noted, not recorded. There is no versioning or releases.

**goose.** The repo **moved to github.com/aaif-goose/goose on 2026-04-07**; block/goose redirects
there. Docs are now at goose-docs.ai (© AAIF). License is unchanged (Apache-2.0). Reviewed
v1.52.0 (2026-09-23).

## Suggested edits to existing files (not made)
- `anthropic.yml`: a notable fact that Anthropic introduced MCP (2024-11-25) and donated it to
  AAIF (2025-12-09). Link `model-context-protocol`.
- `linux-foundation.yml`: summary and notable_facts could name AAIF (directed fund, Dec 2025) and
  A2A (LF project since June 2025).
- `google.yml`: a fact on originating A2A and transferring it to the LF.
- `openai.yml`: a fact on releasing AGENTS.md (Aug 2025) and contributing it to AAIF.

## Not used
openai.com/index/agentic-ai-foundation returned 403 and is not cited. Third-party wikis and news
were used only as search leads.
