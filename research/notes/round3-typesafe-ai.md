# Round 3: "Typesafe AI" (owner request) — reviewed 2026-10-01

Owner request: "also add typesafe ai if its eligible for the website".

## What it is

**TypeSafe AI, Inc.** (https://typesafe.ai) is a San Francisco company that builds
"System One" models. These are hosted AI models that take a state (text or JSON)
plus typed questions (Choice, Score, Noul) and return structured answers with
probabilities, not generated text. Its first model, **Jev** (current `jev-1.13.0`),
launched in early access on 2026-09-15 through a hosted API
(`POST https://api.typesafe.ai/v1/systemone`), a console playground, and MIT-licensed
Python/JS SDKs. No weights are published: the HF org `typesafe` has 0 models, and the
docs say the same weights serve every account.

The spellings "TypeSafe AI", "Typesafe AI", "Typesafe.ai" and "typesafeai" (X handle
@typesafeai) all resolve to this company. The GitHub org is `typesafe-ai` and the HF
org is `typesafe`.

## Other entities sharing the name (not picked by guesswork; listed for the owner)

| Entity | Official URL | Relation | Decision |
| --- | --- | --- | --- |
| TypeSafe AI, Inc. | https://typesafe.ai | The AI model company above | **Created (published)** |
| Typesafe (Scala/Akka company) | https://typesafe.com now 301-redirects to an akka.io blog post; akka.io footer: "Lightbend, Inc. dba Akka" | Widely reported as Lightbend's former name (2016 rename). I could not fetch an official rename page today: the old lightbend.com blog URL redirects to a broken path. It is a JVM software company, not the AI company the owner meant. | Not created |
| OpenJEV | https://openjev.sh | Third-party site offering Jev access via OpenRouter, funded by a "$JEV" token. Its FAQ says it is "an independent project, not affiliated with or endorsed by TypeSafe AI." The many "OpenJev"/"Jev-style" Hugging Face models are third-party, not TypeSafe's. | Not created; not cited in records |

TypeSafe AI is clearly the AI organization: it builds and serves an AI model and
publishes AI evals. The owner's spelling "typesafe ai" matches its name.

Caution: the akka.io post (from Lightbend, Inc. dba Akka) mentions self-hosting "an
OpenJev open-weight model … via Typesafe.ai's portal". Nothing on TypeSafe's own pages
supports this, so it was not used.

## Eligibility reasoning

- **Basis: `us-headquarters`, eligible.** The Terms of Use (last updated 2026-09-19)
  say "The Site is offered by TypeSafe AI, Inc., located at 255 California St, Suite
  1300, San Francisco, CA". The same address is given for arbitration/legal notices.
  ELIGIBILITY.md explicitly accepts "terms of service naming the entity and address".
- Corroboration (official pages only):
  - The Team page says staff work in person five days a week at the San Francisco office.
  - The home page footer says "Made in SF".
  - The privacy policy says the services are hosted in the U.S.
  - The GitHub org profile location is "United States of America".
- AI organization: builds AI models (Jev), a hosted model API, SDKs and eval tooling.
- No foreign parent or dual-HQ indication on any page read.
- Not inferred from founders' names or backgrounds; the team page was used only for
  the office location and the investor/equity statement.

### Evidence gaps (do not block publication)

- **State of incorporation unknown.** The terms choose Delaware governing law, which
  does not establish incorporation, so `legal_form: null`.
- **No registry corroboration.** EDGAR full-text search (generic UA) returned no
  filings for "TypeSafe AI". California/Delaware registries were not checked (they
  need interactive search / bot checks).
- **ZIP inconsistency.** The terms give ZIP 94117 for 255 California St, which is in
  the Financial District. I did not repeat the ZIP in the record.
- **Legal-name capitalization differs.** The privacy policy (dated 2025-11-19) writes
  "Typesafe AI, Inc."; the terms write "TypeSafe AI, Inc.". The record uses the terms.
- **No founding year.** None is stated on official pages; the launch post says "after
  two years in stealth". Press says 2024, but press was not used, so `founded: null`.
- Funding and valuation are widely reported in press. Omitted per policy.

## Files created

1. `content/organizations/typesafe-ai.yml` — **published**, eligible
   (`us-headquarters`).
   - Roles: model-developer and developer-platform. `research-lab` was not used
     because TypeSafe does not describe itself as a lab.
   - Products: System One API (Jev) and the client SDKs.
   - Also included: a profile block, notable facts (RLCD/no customer-data training,
     the known-failure-modes page, WorkflowEvals), and `hiring_url` (Ashby board,
     returns 200).
   - `careers` (automated feed) was deliberately not added. The Ashby identifier
     `typesafe-ai` exists if the owner wants it.
2. `content/artifacts/typesafe-ai-workflowevals.yml` — **published**, `kind: eval`,
   eligible (`us-governed-project`).
   - Code: Apache-2.0, read from LICENSE (no copyright holder named) and
     `pyproject.toml`.
   - Data: the README says datasets are licensed separately on HF.
     `evalsafe-invoice-processing` has an Apache-2.0 LICENSE file.
     `evalsafe-customer-service`, `evalsafe-security-incidents` and
     `evalsafe-agent-trace-observability` have **no license** (no LICENSE file, no
     card field). So `licenses` lists code only, and the data situation is in
     `license_notes`.
   - Limitations: `partial`. Labels are model-generated (consensus of other
     providers' large models), scores measure agreement with those labels, and the
     harness defaults to the maintainer's own model.
   - No benchmark scores recorded.

## Candidates considered, not created

- **typesafe-sdk-python / typesafe-sdk-js** (MIT): thin clients for a proprietary API.
  They are covered as an org product instead. The Python LICENSE still has the
  template line "Copyright (c) [year] [fullname]"; the JS one says "Copyright (c) 2026
  TypeSafe".
- **system-one-adapter-python** (MIT, © 2026 TypeSafe AI; releases up to v0.2.1,
  2026-09-22): a shim that runs the System One interface on OpenAI/Anthropic/Gemini
  for comparison with TypeSafe. It is a reasonable candidate for a later round, but
  narrow.
- **typesafe/evalsafe-onet** (HF dataset, Apache-2.0, snapshot 2026-09-29): 150
  synthetic workplace documents with model-generated labels. It is not part of
  WorkflowEvals and has no published code, so it was deferred.
- Forks in the org (vllm, LLaDA, pulumi-clickhouse) and infrastructure repos
  (daggerverse, n8n nodes, skills): out of scope.

## URLs checked (all fetched 2026-10-01)

- typesafe.ai: `/`, `/team`, `/manifesto`, `/blog/introducing-system-one-models-and-jev`,
  `/legal/terms`, `/legal/privacy-policy`, `/legal/acceptable-use-policy`
- docs.typesafe.ai: `/introduction`, `/introduction/quickstart`, `/models`,
  `/model-jaggedness/jev-1.13`, `/sdk`, `/llms.txt`
- https://evals.typesafe.ai/
- GitHub: org `typesafe-ai` (profile and repo list via API).
  - WorkflowEvals: README, LICENSE, pyproject.toml, .env.example
  - system-one-adapter-python: README, LICENSE
  - typesafe-sdk-python: README, LICENSE
  - typesafe-sdk-js: LICENSE
- Hugging Face: org `typesafe` (overview API), the WorkflowEvals collection, and the
  dataset cards and file trees for all five `evalsafe-*` datasets
- https://jobs.ashbyhq.com/typesafe-ai and its posting API (existence only)
- SEC EDGAR full-text search (no hits)
- Namesakes: typesafe.com (redirect), akka.io/blog/fast-cheap-agent-decisions,
  akka.io/about-us, openjev.sh
- Search-result pages (news, Wikipedia, PitchBook, Bloomberg, Tracxn) were used only to
  find official pages. None is cited.

## Validation

`npx tsx scripts/validate.ts`: 0 errors. The only warning is the pre-existing
`continue-extension.yml` one, which is not my file. No existing files were edited.
