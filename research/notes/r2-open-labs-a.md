# r2-open-labs-a research notes

Researcher group: r2-open-labs-a. Reviewed 2026-09-29.
Assigned orgs: liquid-ai, nous-research, prime-intellect, deep-cogito.
Assigned artifacts: LFM family (`lfm`), Hermes family (`hermes`), INTELLECT family (`intellect`) and prime-rl, Cogito family (`cogito`).

Validation: `npx tsx scripts/validate.ts` reports 0 errors. The only warning belongs to another group's file (`continue-extension.yml`).

## Files created

| File | Status | Eligibility |
| --- | --- | --- |
| content/organizations/liquid-ai.yml | published | eligible, us-headquarters |
| content/organizations/nous-research.yml | published | eligible, us-headquarters (explicit assessment) |
| content/organizations/prime-intellect.yml | published | eligible, us-headquarters (explicit assessment) |
| content/organizations/deep-cogito.yml | published | eligible, us-headquarters |
| content/artifacts/lfm.yml (family) | published | eligible, us-headquarters |
| content/artifacts/lfm2-5-8b-a1b.yml (release) | published | eligible, us-headquarters |
| content/artifacts/lfm2-5-2-6b.yml (release) | published | eligible, us-headquarters |
| content/artifacts/hermes.yml (family) | published | eligible, us-headquarters |
| content/artifacts/hermes-4-3-36b.yml (release) | published | eligible, us-headquarters |
| content/artifacts/hermes-4-70b.yml (release) | published | eligible, us-headquarters |
| content/artifacts/intellect.yml (family) | published | eligible, us-headquarters |
| content/artifacts/intellect-3.yml (release) | published | eligible, us-headquarters |
| content/artifacts/intellect-3-1.yml (release) | published | eligible, us-headquarters |
| content/artifacts/prime-rl.yml (research-stack project) | published | eligible, us-governed-project |
| content/artifacts/cogito.yml (family) | published | eligible, us-headquarters |
| content/artifacts/cogito-v2-1-671b.yml (release) | published | eligible, us-headquarters |
| content/artifacts/cogito-v2-preview-llama-405b.yml (release) | published | eligible, us-headquarters |

## Editorial choice applied to all fine-tunes (please review)

Hermes, INTELLECT-3/3.1, and Cogito are post-trained from other developers' base models. When the developer publishes only its post-training code, recipe, or data, I set `training_code`, `training_recipe`, and `training_data_information` to **partial**, never public. The notes say that the base model's pretraining is not covered. This follows OPENNESS.md §6 ("fine-tuning code does not count as training code for the base model"). It also keeps these releases out of the "open-stack" tier, which would overstate what is open. If the editor prefers to assess only the post-training step, the Hermes 4 70B and INTELLECT-3 recipe items could move to public. Both technical reports give detailed hyperparameters.

## Organizations

### Liquid AI (`liquid-ai`): published
- Basis: us-headquarters.
  - The privacy policy (updated 2025-07-14) gives the contact address as "Liquid AI, Inc., 314 Main Street, Cambridge, Massachusetts 02142".
  - The July 2025 LEAP press release has a CAMBRIDGE, Mass. dateline.
  - SEC EDGAR lists Liquid AI, Inc. as incorporated in Delaware and located in MA.
- Privacy note: the EDGAR business address from the company's 2023 Form D appears to be a residential apartment in Brookline. I did not copy it into the record. The record cites the EDGAR search page only for the state of incorporation.
- Other locations: the careers page says "Primarily San Francisco and Boston, with a Tokyo presence". San Francisco and Tokyo are recorded.
- Founded: 2023, from "Est. 2023" on the about page, which also says Liquid AI was spun out of MIT CSAIL.
- Products:
  - LEAP (developer-tool).
  - Liquid Apollo (kind `other`, because it runs models on the device and is not a hosted assistant).
  - The Playground (playground.liquid.ai) returned only a sign-in page, so it is not listed.
- No acquisition or change of control found. The press page lists only partnerships and launches through April 2026, and I recorded no partnerships.

### Nous Research (`nous-research`): published, with explicit assessment
- Legal entity: Nous Portal terms of service (updated 2026-09-28): "Nous Research, Inc., a corporation established under the laws of the State of Delaware".
- HQ evidence:
  - The only postal address in Nous's own documents is **600 Congress Avenue, Fl 14, Austin TX 78701**, listed for NOUS RESEARCH, INC. in the shop.nousresearch.com privacy policy (updated 2026-07-05). It is recorded as the HQ label.
  - The careers page refers to a **New York office**, recorded as another location.
  - No official page uses the word "headquarters".
  - Third-party profiles disagree: some say New York City, some Austin.
  - EDGAR has no filings for Nous Research.
- Judgment: every documented location is in the U.S., so the record is eligible. If an editor wants a stricter HQ standard, relabel HQ to New York or add a note; eligibility is not affected.
- Oddity: the terms of service choose California law, with arbitration in Cupertino.
- Material/product change: **chat.nousresearch.com (Nous Chat) now redirects (307) to hermes-agent.nousresearch.com**. The Hermes models' cards still say "Chat with Hermes in Nous Chat". Nous Chat is not listed as a product.
  - Current products: Nous Portal (credit subscriptions covering inference, including 300+ third-party models, tools, and agent hosting) and Hermes Agent (MIT, launched 2026-02-25 per the releases page).
- News: TechCrunch (2026-07-13) reports funding talks. Not recorded, per the policy on funding and valuations.

### Prime Intellect (`prime-intellect`): published, with explicit assessment
- Legal entity: Prime Intellect, Inc., a Delaware corporation incorporated in 2024. Source: SEC Form D filed 2026-07-01 (accession 0001231919-26-000720).
- HQ: the Form D gives the principal place of business as **1111B S Governors Avenue, Dover, DE**. The terms of service and privacy policy (both 2024-02-23) use the same Dover address. I recorded HQ as "Dover, Delaware" because that is what the filing says.
- Operating offices: the careers page lists San Francisco and New York City roles, and the homepage invites applicants to join "in San Francisco or remotely". Both cities are recorded as other_locations.
- Third-party sources (Wikipedia, press) call the company San Francisco-based. An editor may prefer to relabel HQ as San Francisco. Eligibility is U.S. either way.
- Material news: a $130M Series A was announced 2026-07-08 on the company blog. Not recorded as a fact, per policy.
- Products:
  - Compute (GPU instances and clusters).
  - Lab (hosted RL training, with the Environments Hub and evaluations).
  - Inference API. It is OpenAI-compatible, but its docs do not mention INTELLECT-3; the homepage says it hosts GLM-5.3 plus third-party models.
- The product URL for compute is the docs page. The dashboard URL requires sign-in.

### Deep Cogito (`deep-cogito`): published
- Basis: the homepage says "We're headquartered in San Francisco".
- The Form D/A filed 2026-04-24 names Deep Cogito Inc., a Delaware corporation incorporated in 2024, with its principal place of business at 28 Geary St, San Francisco.
- Products: **none recorded**. chat.deepcogito.com returned HTTP 429 through a Vercel security checkpoint on both WebFetch and curl, so I could not fetch it. The chat and the third-party API availability are mentioned only as a notable fact sourced to the v2.1 announcement.
- News: SiliconANGLE (2026-08-26) reports a Series A. Not recorded. No acquisition found; search hits for "Cogito" acquisitions concern the unrelated Cogito Corp (Verint).
- No Cogito release after v2.1 (2025-11-19) was found on Hugging Face or the research page.

## Artifacts

### LFM (`lfm`, `lfm2-5-8b-a1b`, `lfm2-5-2-6b`)
- License: **LFM Open License v1.0** (card field `license: other`, `license_name: lfm1.0`). I read the LICENSE file in the repos of LFM2.5-2.6B, LFM2.5-8B-A1B, LFM2.5-VL-3B, and LFM2-24B-A2B. The text is identical apart from whitespace.
- Key terms of the license:
  - It is Apache-2.0-style, with Liquid AI, Inc. as licensor.
  - §5 makes commercial rights conditional on the licensee's legal entity not exceeding the "Threshold", defined as annual revenue of US$10,000,000 or more. Commercial use above it "is not licensed".
  - The threshold does not apply to 501(c)(3)-type qualified non-profits using the model for non-commercial or research purposes.
  - It has Apache-style redistribution notices and patent-litigation termination.
  - §11 terminates the license automatically on any breach.
- The FAQ at liquid.ai/lfm-license adds that fine-tuned models can stay proprietary and that hosting platforms may redistribute the models.
- Discrepancies:
  - The blog posts say the weights can be deployed "without restrictions", which the license text qualifies. This is noted in the 8B record.
  - The LFM2 arXiv abstract (via WebFetch) mentioned "CC-BY-4.0". That is most likely the paper's license, not the models', so I did not use it.
- Checklist: training code and data are **unknown**. No release was found; the cards give only token budgets (38T and ~34T). The recipe is partial (stage outlines only), and evaluation is partial (result tables only).
- Release dates come from the blog posts: 8B-A1B on 2026-05-28 and 2.6B on 2026-08-04. The HF repo for 2.6B was created 2026-07-28.
- Not created: LFM2.5-VL-3B (Aug 2026) and LFM2-24B-A2B (Feb 2026) are verified candidates if more releases are wanted. VL-3B uses a SigLIP2 NaFlex vision encoder, which needs provenance.

### Hermes (`hermes`, `hermes-4-3-36b`, `hermes-4-70b`)
- Hermes 4.3 36B:
  - Base: ByteDance-Seed/Seed-OSS-36B-Base (ByteDance Seed Team, Apache-2.0).
  - Weights: Apache-2.0, from card metadata only; the repo has **no LICENSE file**.
  - Release date: 2025-12-03, per the nousresearch.com/releases page. The blog shows only "December 2025".
  - Training: on Psyche with DisTrO across 24 nodes. Nous's TorchTitan fork is BSD-3-Clause; the Psyche code at PsycheFoundation/psyche is Apache-2.0.
  - Evaluation samples are public: the eval-Hermes-4.3-36B dataset.
- Hermes 4 70B:
  - Base: meta-llama/Llama-3.1-70B.
  - The card license field is **`llama3`** (Meta Llama 3 Community License), but the base is under the Llama 3.1 Community License. There is no LICENSE file in the repo. Both points are recorded in license_notes.
  - The technical report (arXiv 2508.18255v2, read as PDF) gives full post-training hyperparameters and links TorchTitan commit 856a0ec, which has a BSD-3-Clause LICENSE.
  - Evaluation samples are public (the eval-Hermes-4-70B-* datasets). Evaluation materials are marked public.
- Discrepancy: the Hermes 4 report gives the post-training set as about 5M samples and **19B tokens**, and Table 1 gives 56B training tokens. The model cards say "~5M samples / ~60B tokens". I used the report figures in the 70B record and only "about 5 million samples" in the 4.3 record.
- Another discrepancy: the Hermes 4 report says Hermes 4 14B started from "the Qwen3 14B checkpoint" and, in another passage, "Qwen3 14B-base". The HF metadata says Qwen/Qwen3-14B. The family record says only "Qwen3 14B".
- Hermes Agent (MIT) is not a model and is recorded only as an org product. A separate project record could be added.

### INTELLECT (`intellect`, `intellect-3`, `intellect-3-1`) and prime-rl
- Base for INTELLECT-3 and 3.1: zai-org/GLM-4.5-Air-Base (Z.ai, MIT on its card).
- Licenses: MIT, from card metadata. There is no LICENSE file in either HF repo.
- The prime-rl LICENSE is Apache-2.0 (read raw). The verifiers LICENSE is MIT (read raw).
- INTELLECT-3 technical report: I read the full PDF from storage.googleapis.com, and arXiv 2512.16144 v1 is dated 2025-12-18. The report lists the SFT data sources with token counts and gives the SFT and RL hyperparameters.
- **Evaluation environments could not be verified.** The Environments Hub pages (app.primeintellect.ai/dashboard/environments/...) load only a sign-in dashboard. The environment names cited in the report (aime2025, i3-math, and others) are not in the community-environments GitHub repo. The evaluation item is therefore partial, not public.
- INTELLECT-3.1:
  - `released_at: null`. The HF repo was created 2026-01-20 (API `createdAt`), but its commit history is squashed to a single commit dated 2026-02-18.
  - No blog post or report for 3.1 was found. The Prime Intellect blog has no 3.1 entry, and the card's citation block says "INTELLECT-3.1: Technical Report", year 2025, but links the INTELLECT-3 report.
  - The card gives no evaluation results, so evaluation materials are unknown.
- prime-rl is recorded as kind **research-stack**, matching how the catalog treats MaxText. The `framework` kind would also fit if the editor prefers it.
  - GitHub API calls were rate-limited, so I read the README and LICENSE through raw.githubusercontent.com and the repo page through WebFetch.
  - No tagged releases were visible, so `released_at` is null.
- INTELLECT-1 and INTELLECT-2 are summarized in the family record only. INTELLECT-1 was trained from scratch, Apache-2.0. INTELLECT-2 was built from QwQ-32B, Apache-2.0.

### Cogito (`cogito`, `cogito-v2-1-671b`, `cogito-v2-preview-llama-405b`)
- v2.1 671B:
  - Base: deepseek-ai/DeepSeek-V3-Base.
  - License: MIT per the card's metadata and license section, and the GitHub repo has an MIT LICENSE file.
  - Note: the DeepSeek-V3-Base card says use of the base model "is subject to the Model License" (DeepSeek's LICENSE-MODEL), while Deep Cogito calls it "open-licensed". This is recorded neutrally in license_notes; I did not read DeepSeek's LICENSE-MODEL text.
  - Active parameters (37B) come from the GitHub README.
- v2 Preview 405B:
  - Base: meta-llama/Llama-3.1-405B.
  - The card license field (`llama3.1`) and license section (Llama 3.1 Community License) agree.
- **Inconsistency, not recorded in a release record:** the cogito-v2-preview-llama-70B card has metadata `license: llama3.1` and base Llama-3.1-70B, but its License section says "Llama 3.3 Community License Agreement". This is why I chose 405B over 70B. The 109B MoE card is tagged llama4 with a Llama-4-Scout base.
- Training code and data: unknown. The v2.1 announcement says the post-training is done "in-house", and no code or data is linked. The recipe is partial (the IDA and process-supervision description is conceptual).

## Open questions / follow-ups
1. Nous Research and Prime Intellect HQ labels: see the org notes above. Eligibility is not affected in either case.
2. Deep Cogito's chat product could not be fetched (Vercel checkpoint). Re-check later if a product entry is wanted.
3. The Prime Intellect Environments Hub needs sign-in to view, so the public availability of the INTELLECT-3 evaluation and RL environments is unconfirmed.
4. A LICENSE file was missing from the HF repos of Hermes 4.3 36B, Hermes 4 70B, INTELLECT-3, INTELLECT-3.1, and Cogito v2.1. Every license there rests on card metadata or the card's text.
