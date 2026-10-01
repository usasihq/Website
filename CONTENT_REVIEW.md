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

## F. Round 2 expansion (2026-09-29)

Fourteen research passes added tech giants, AI application companies, open-model
labs, robotics companies, open-source tool makers, foundations, universities,
and big-tech open releases; eleven fact-check passes then re-read every new
record against its sources (logs in `research/verification/r2-*.md`). Two more
passes researched and fact-checked the Local corner profiles
(`research/verification/people.md`).

### F1. Decisions that need the owner

| # | Item | Current state | Options |
| --- | --- | --- | --- |
| F1a | **CrewAI** (org + framework): no official page, terms, or filing gives a headquarters; the only dated release is datelined "San Francisco and São Paulo". | Draft, pending_review | Keep draft, or publish if CrewAI documents a U.S. headquarters. |
| F1b | **Unsloth** (org + library): "Unsloth AI Inc." appears in notices, but incorporation and headquarters are undocumented. | Draft | Same as above. |
| F1c | **Community-governed projects**: Lance (multi-company committee, no legal entity), MLC LLM (multi-institution community), DCLM (unnamed multi-institution team), BigCodeBench (community working groups; archived repo), GPQA and MMLU (individual accounts only), Triton (individual maintainers), llama.cpp (see A1). | Draft | Adopt a policy for projects without a documented governing entity, or keep them out. (SWE-bench now also falls here; see F1d.) The LanceDB company's own Apache-2.0 library would qualify cleanly as a separate record. |
| F1d | **SWE-bench** moved from Princeton NLP to a standalone GitHub org; no current source names Princeton or another institution as maintainer. **Berkeley Function Calling Leaderboard** keeps documented UC Berkeley hosting (code under an individual account). | SWE-bench: draft, pending_review. BFCL: published | Publish SWE-bench if an institutional maintainer is documented; decide whether BFCL should follow the stricter reading. |
| F1e | **The Pile**: takedowns documented; the old download host fails; EleutherAI still hosts derived copies. | Published, availability partial | Keep, or archive. |
| F1f | **Continue** (acquired by Cursor/Anysphere in June 2026; repo read-only). | Archived (org + extension) | Keep archived, or publish with a status note. |
| F1g | **Boston Dynamics** ownership category (Hyundai majority; SoftBank stake purchase unconfirmed). | unit-of-another-organization, no parent link | Keep, or `privately-held`. |
| F1h | **ARC Prize Foundation**: its Form 990 checks 501(c)(3) and a public-charity category in Schedule A Part I but "Private foundation" in Part II; it is absent from the IRS exempt-organization extract and Pub 78; site legal pages name "ARC Prize, Inc." (California). The record states exactly this. | Published | Keep, or switch basis to us-headquarters. |
| F1i | **Nemotron-CC v2 / v2.1**: Hugging Face gates require manual approval; NVIDIA's data agreement allows internal model training only, no redistribution. | Resolved: access and availability `partial` | — |
| F1j | **Fine-tune rule**: releases that publish only post-training code/recipe get `partial` for training code/recipe (never open-stack). | Applied consistently | Confirm. |
| F1k | **Local corner policy**: a published profile needs a current, documented role connected to local or open-weight AI. Luca Soldaini, Awni Hannun, Brandon Duderstadt, and Andriy Mulyar are therefore drafts; Michael Chiang and Nathan Lambert have no profile (no allowed source for a current role). | Applied | Confirm, or allow profiles based on past contributions. |

### F2. Pending events to re-review

- Agility Robotics' merger with Churchill Capital Corp XI (S-4 filed 2026-09-04; pending).
- Character.AI: members of its technical team expected to join Disney (announced 2026-09-18); no acquisition described.
- Hyundai's pursuit of SoftBank's remaining Boston Dynamics stake (announced 2026-07-16).
- EvolutionaryScale's team joined Chan Zuckerberg Biohub (Nov 2025); ESM now maintained by Biohub; no acquisition documented.
- Reported NVIDIA hiring of Essential AI's founder and team (news only; **not published**).
- SpaceX (Anysphere, xAI) and Qualcomm (Modular) acquisitions are completed and recorded.

### F3. Evidence gaps (round 2)

- Headquarters from weaker evidence, stated as such on each record: Midjourney and Character.AI (EU App Store trader addresses), LanceDB (company blog), LinkedIn (careers page), Nous Research (country only), Prime Intellect (Form D "principal place of business" in Dover, DE), All Hands AI (state only), Skild AI and Luma AI (city conflicts), Marvell (filings say Wilmington, DE; investor page says Santa Clara).
- Sites that blocked automated reading: midjourney.com, character.ai, tesla.com/ai, servicenow.com, oracle.com, princeton.edu, parts of x.ai.
- Releases with conflicting license statements, recorded as conflicts: Whisper large-v3 and V-JEPA 2 (MIT vs Apache-2.0), GR00T N1.7 (README vs license section), Megatron-LM (LICENSE vs metadata), Nemotron 3.5 Lightning (docs vs LICENSE), Palmyra-mini-thinking-b (Apache-2.0 on a CC-BY-4.0 base).
- Unverified or missing: CLIP weights license (none stated), Zamba2-VL vision-encoder checkpoint, OpenMDW-1.1 SPDX identifier, several founding years, INTELLECT-3 evaluation environments (sign-in required).

### F4. Candidates not yet covered

Microsoft Agent Framework (AutoGen's successor), Laude Institute (Terminal-Bench host), the LanceDB open-source library, LM Studio, Answer.AI, Cisco Foundation-Sec-8B (Llama-based; license review needed), Kevin-32B (Cognition), Luma IMM checkpoints, Character.AI Ovi weights, Writer's larger Palmyra models (non-commercial), Mochi 1.1 (hosted only), Olmo Hybrid, Gemma 4 E2B/E4B.

### F5. Process notes

- Round-2 agents operated under an explicit no-personal-data rule. One fact-check probe sent a fictitious placeholder address (`admin@example.invalid`) in a User-Agent on five requests; no real address or identifier was sent.
- Several agents read pages that block scripted clients (including SEC filings) through the in-app browser; no sign-ins were used and no personal information was entered.

## G. Routine review

Run `npm run report:reviews` monthly. Re-check `status_note` events above first,
then records whose `last_reviewed` is older than 180 days.

## 2026-09-30: rubric v0.2 and profile review coverage

This release does not claim a fresh audit of all 99 organizations or all artifact records. Deeper profile sections were added and checked against primary pages for OpenAI, IBM, and Ai2. The claims/resources in those sections have their own reviewed dates. Their record-wide `last_reviewed` remains unchanged because unrelated historic facts were not re-audited.

For gpt-oss-20b, weights availability and the weights/code licenses were checked against its official Hugging Face card/license and the OpenAI repository license. Olmo 3 7B's model card was reviewed for partial data-information disclosure; this is not a completeness certification. Other new completeness and component-rights assessments remain unknown until reviewed. Prior training-data statuses are retained as legacy evidence; no review dates are advanced by schema migration.

### Manual source-change proposals

`npm run review:sources -- --limit 10` fetches a bounded set of existing cited HTTPS sources and saves snapshots and proposals under `reports/source-review/`. Each run prioritizes the least recently fetched URLs. It never edits `content/`, license terms, claims or editorial review dates. There is no new schedule or external notification. Redirects, blocked responses and errors become manual-review tasks; changed bytes can be cosmetic and unchanged bytes do not prove a claim remains correct.

An editor must inspect the source, identify the disputed field and effective date, revise only supported claims, attach fact-level `reviewed_at` and citations, update `updated_at` for substantive edits, and record material changes in the changelog. Do not advance a whole record's `last_reviewed` unless the whole record was checked. Use the account-free email correction link to submit an entry URL, disputed field, proposed correction and supporting primary source.

The system-openness review requires an explicit status, parameter/code/data-information permission assessments, rationale, citations and review date. `verified` does not by itself produce a badge if a permission remains unknown or the new completeness checks are not satisfied. No current release has been granted this highest review solely from migrated data.

## 2026-10-01: owner-delegated decisions

The owner asked for these open items to be resolved. Each rests on primary
sources re-read on 2026-10-01 and is explained in the record's eligibility text.

| Item | Decision | Deciding evidence |
|---|---|---|
| A1 llama.cpp | Published, `us-governed-project` | ggml.ai (founded to support ggml) says Hugging Face acquired it in 2026; Hugging Face's 2026-02-20 announcement says the ggml team joined, maintains llama.cpp full time, and leads its technical direction. Maintaining entity: the ggml team within Hugging Face (U.S.). |
| F1c MLC LLM | Published, `us-governed-project` | CMU Catalyst lists MLC LLM as its own research project; all supporting/contributing organizations on mlc.ai are U.S.-based. The 2023 multi-institution origin is recorded. Other F1c projects (Lance, DCLM, BigCodeBench, GPQA, MMLU, Triton, SWE-bench) remain draft. |
| Lemonade | Published, `us-governed-project` | README: sponsored by AMD, amd.com contact; AMD's developer article calls it backed by AMD and links "our GitHub". |
| xAI jobs | Greenhouse board `xai` (named "SpaceXAI") assigned to `xai` | x.ai/careers links to the board (round-3 jobs notes); the catalog already records xAI as SpaceX's wholly owned subsidiary using the SpaceXAI name. SpaceX's own `spacex` board (mostly non-AI roles) is not added. |
