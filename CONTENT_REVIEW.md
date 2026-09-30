# Content review queue (internal)

Internal editorial queue: unresolved candidates, evidence gaps, judgment calls
to revisit, and pending events. Nothing here is published on the site. The
detailed research notes and fact-check logs this summarizes are in
`research/notes/` and `research/verification/`.

Launch review date: **2026-09-29**. Records were researched by eight research
passes and then independently fact-checked record by record against their cited
sources by five verification passes; every cited URL was also requested by
`npm run check:sources` (507 unique URLs at research time; none returned 404;
six timed out on two slow hosts and were confirmed through WebFetch during
research). The fact-check passes re-read 102 records (including drafts and
archived records); 58 needed at least one correction — mostly narrowing wording
to what a source says, re-sourcing, or removing unsupported claims. No
correction changed a record's eligibility or publication status. Per-record
changes are logged in `research/verification/*.md`.

## A. Decisions that need the owner

| # | Item | Current state | Options |
| --- | --- | --- | --- |
| A1 | **llama.cpp eligibility.** The ggml team joined Hugging Face in Feb 2026 and ggml.ai says Hugging Face acquired it; the same announcements say the community governs the project autonomously. No document names a U.S. entity as governing the project. | Draft, `pending_review` | Keep as draft (current), or decide that Hugging Face's acquisition of ggml.ai makes it the documented maintaining entity and publish under `us-governed-project`. |
| A2 | **xAI's parent.** SpaceX filings show SpaceX acquired xAI (Feb 2026). There is no `spacex` record, so the parent is explained in `status_note` rather than linked. | xAI published, no parent link | Research and add a `spacex` organization record, or leave as is. |
| A3 | **OpenXLA governance.** Eligible as `us-governed-project` because the documented maintaining practices (Google CLA, Google open-source guidelines, Google technical leadership) point to Google; no multi-company governing body is documented and the community repo is archived. | Published | Keep, or move to `pending_review` + draft under a stricter reading. |
| A4 | **SSI headquarters.** SSI describes itself as "an American company with offices in Palo Alto and Tel Aviv" and names no headquarters; the record relies on that statement plus a Palo Alto press dateline. | Published | Keep, or move to `pending_review`. |
| A5 | **Poolside dual presence.** Official July 2026 release says headquartered in San Francisco; terms name Poolside, Inc. (Delaware); a Paris SAS exists and 2023–24 reporting described a Paris HQ. | Published | Keep, or move to `pending_review`. |
| A6 | **Rubric call — approval-gated weights.** Llama 4 downloads require Meta's approval, so weights are `partial` and the tier is **Restricted weights** (added in rubric v0.1 for exactly this case). | Applied | Confirm, or treat approval-gated downloads as public. |
| A7 | **Rubric call — evaluation materials.** `public` now means runnable evaluation code or prompts; results-only is `partial`. Seven releases (Gemma 4 ×3, Inkling ×2, Laguna ×2) were normalized to `partial`. No tier changed. | Applied | Confirm. |
| A8 | **pytorch-foundation basis.** Recorded as `us-control` (a directed fund of the Linux Foundation); `us-nonprofit-or-lab` is also arguable. | Published | Either is acceptable; confirm. |

## B. Research backlog: candidates not published

| Candidate | Status | Notes |
| --- | --- | --- |
| **Coda** | Unresolved — no record | Ambiguous. Plausible matches: Salesforce AI Research's **CoDA** coding model (CC-BY-NC-4.0) or the Coda document editor (hosted app, reportedly renamed Superhuman Docs). Do not substitute an organization; ask whoever proposed it. |
| **ae2-eval** | Rejected | Web, GitHub, Hugging Face, and PyPI searches found no project with this identity. Nothing was invented. |
| **HellaSwag** | Not created | `rowanz/hellaswag` is blocked on GitHub under a DMCA notice (dated 2026-09-14), so the repository and license cannot be read; it sits in a personal account, so no maintaining institution is documented. Revisit if an institutional copy with a readable license appears. Kind would be `dataset`. |
| **llama.cpp** | Draft | See A1. Facts were fact-checked; only eligibility is open. |
| Reflection AI artifacts | None exist | No publicly released weights found. The organization is published. |
| Grok 3 weights | None exist | Promised in Aug 2025; not published as of review. |
| Meta Superintelligence Labs (unit record) | Not created | Structure documented only in news; covered in Meta's notable facts. |
| Olmo Hybrid (Mar 2026) | Not created | License not verified. |
| Gemma 4 E2B / E4B | Not created | Could be added as releases. |
| gpt-oss-safeguard-120b / 20b | Not created | Fine-tunes mentioned in the gpt-oss research. |
| Amazon Chronos, Strands Agents SDK | Not researched | Possible Amazon artifacts. |
| Perplexity open-weight models (pplx-embed etc.) | Not created | Derived from Qwen3 (non-U.S. base) — would need provenance labeling. |
| Salesforce AI Research models | Not created | ~185 models on Hugging Face with varied licenses. |
| Snowflake Arctic embedding models | Not created | The `snowflake-arctic` family covers only the 480B language model. |
| IREE | Not included in OpenXLA | Listed in the archived OpenXLA community README but not on the current site. |

## C. Pending events to re-review

| Event | Record(s) | What to check |
| --- | --- | --- |
| NVIDIA's agreement to acquire Hugging Face (announced 2026-09-02/03; expected close H1 2027, subject to approvals) | hugging-face, llama-cpp | Closing; parent relationship; eligibility unchanged (U.S. buyer). |
| Nscale (England and Wales) agreement to acquire Anyscale; pending, expected with Nscale's IPO | anyscale, ray | On closing, re-assess Anyscale's eligibility (`us-control` would no longer hold via a U.S. parent). Ray's eligibility rests on the PyTorch Foundation and is unaffected. |
| Intel/SambaNova FTC early-termination notice (2026-04-30) naming Intel as acquiring party | sambanova, intel | Whether an acquisition or investment completed; SambaNova still describes itself as independent. |
| Groq–NVIDIA licensing arrangement (Dec 2025) | groq | Recorded as licensing, not acquisition. |
| Reported NVIDIA–Poolside licensing deal (Aug 2026, news only, based on an investor letter) | poolside | **Removed from the public record** — no official statement. Re-add only with an official source; no staffing figures. |
| OpenAI and Anthropic IPO reports | openai, anthropic | News only; not published. |

## D. Evidence gaps by record

Sites that blocked automated fetching (need a manual browser check): openai.com,
chatgpt.com, perplexity.ai, meta.ai / about.meta.com / ai.meta.com,
physicalintelligence.company, parts of broadcom.com and investors.broadcom.com,
Palantir product pages (JavaScript-only), x.ai careers/terms.

- **openai** — a Feb 2026 SEC exhibit names an affiliate "OpenAI Foundation"; whether OpenAI, Inc. was renamed is not confirmed (openai.com blocks fetching), so the record uses "OpenAI, Inc." as identified by the Delaware Attorney General (Oct 2025). No careers URL.
- **xai** — SpaceX's 424(b)(4) IPO prospectus (≈12 MB) could not be read; claims that rested only on it (Grok described as "proprietary"; Palo Alto as AI headquarters) were removed or re-sourced to the X.AI Holdings Form D and SpaceX's 10-Q / draft registration. Re-read the prospectus with an SEC-compliant client before restoring anything.
- **oracle** — oracle.com newsroom and executive pages block fetching; Larry Ellison's current title was removed pending verification.
- **scale-ai** — scale.com shows a banner announcing a new CEO; not added (leadership is not tracked unless material and officially documented).
- **SEC filing dates** — several `published_at` values on filings (Intel, Meta, Salesforce 10-Ks; SpaceX and Oracle 10-Qs) could not be confirmed from fetched text. They are citation metadata only.
- **perplexity** — headquarters city from government records (2023 Form D, GSA listing), not a first-party page; Comet not listed.
- **physical-intelligence** — headquarters from reporting and paper affiliation; no products listed.
- **thinking-machines-lab** — San Francisco inferred from privacy notice, terms venue, and job listings; no official address.
- **groq** — headquarters recorded only as "United States" (the privacy policy gives a Mountain View P.O. box; press datelines say San Francisco); legal entity name unclear.
- **lambda** — company pages say San Jose, press datelines say San Francisco; San Jose used.
- **linux-foundation** — headquarters from a postal address in the privacy policy.
- **arcee-ai, fireworks-ai** — no official statement naming the headquarters city (datelines and terms used). Arcee's About page still says Apache-2.0 while model cards say OpenMDW-1.1; records follow the model cards.
- **databricks, scale-ai** — legal names not verified; Databricks's private status has no first-party source.
- **intel, broadcom, apple** — founding year not recorded (not stated in the documents read).
- **snowflake-arctic-*** — training data and recipe unknown (cookbook posts not read).
- **phi-4-reasoning-vision-15b** — fine-tuning code and benchmark logs the announcement mentions were not located.
- **nemotron-3-ultra-550b-a55b** — recipe marked partial because teacher checkpoints were described as unreleased; new "Nemotron-Labs-Teacher" checkpoints on Hugging Face may change that.
- **nemotron-3-5-lightning-30b-a3b** — recipe docs say OpenMDW-1.1 while the repo LICENSE is Apache-2.0 (recorded in license notes).
- **openpi** — repository includes Gemma terms without saying what they cover (recorded in license notes); the official launch post could not be fetched.
- **tensorrt-llm** — source-build page not opened.

Date conflicts resolved by choosing the primary release page, recorded in the notes:
Gemma 4 (Mar 31 releases page vs Apr 2 blog → Mar 31); Laguna XS 2.1 (June docs
vs Jul 2 blog → Jul 2); Phi-4-mini-flash-reasoning (model card "June 2025" vs
Azure availability 2025-07-09 → 2025-07-09); gpt-oss kept at month precision
(2025-08) because the announcement page was blocked.

## E. Process notes

- Some early research requests to SEC EDGAR carried contact strings in the
  HTTP User-Agent header before a no-personal-data rule was issued to all
  agents; this included the owner's email address in about ten requests and a
  fragment of it in one. All later requests used a generic User-Agent. No
  catalog content depends on those requests.
- WebFetch summaries were occasionally wrong about dates and licenses; where it
  mattered, raw files (LICENSE files, model card READMEs, GitHub API) were read
  directly and records rely only on confirmed content.

## F. Routine review

Run `npm run report:reviews` monthly. Re-check `status_note` events above first,
then records whose `last_reviewed` is older than 180 days.
