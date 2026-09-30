# open-research-2 research notes

Researcher group: open-research-2. Reviewed 2026-09-29.
Assigned orgs: arcee-ai, poolside, physical-intelligence, figure.
Assigned artifacts: Trinity, "Laguna", "Coda".

Validation: `npx tsx scripts/validate.ts` reports 0 errors and 0 warnings with all files below in place.

## Files created

| File | Status | Eligibility |
| --- | --- | --- |
| content/organizations/arcee-ai.yml | published | eligible, us-headquarters |
| content/organizations/poolside.yml | published | eligible, us-headquarters (explicit assessment) |
| content/organizations/physical-intelligence.yml | published | eligible, us-headquarters |
| content/organizations/figure.yml | published | eligible, us-headquarters |
| content/artifacts/trinity.yml (family) | published | eligible, us-headquarters |
| content/artifacts/trinity-large-thinking.yml (release) | published | eligible, us-headquarters |
| content/artifacts/trinity-mini.yml (release) | published | eligible, us-headquarters |
| content/artifacts/laguna.yml (family) | published | eligible, us-headquarters |
| content/artifacts/laguna-s-2-1.yml (release) | published | eligible, us-headquarters |
| content/artifacts/laguna-xs-2-1.yml (release) | published | eligible, us-headquarters |
| content/artifacts/openpi.yml (research-stack project) | published | eligible, us-governed-project |

## Organizations

### Arcee AI (`arcee-ai`): published
- Reason: legal name "Arcee AI, Inc." appears in the privacy policy and terms. The September 2026 Series B press release (GlobeNewswire, issued by Arcee) has a SAN FRANCISCO dateline and calls it "a U.S. artificial intelligence company". The about page says "U.S. model lab", and SiliconANGLE calls it San Francisco-based.
- Eligibility basis: us-headquarters.
- Evidence gaps: no official page states a street address or uses the word "headquarters". The site terms apply Delaware law with venue in **Miami, Florida** courts, which may reflect an earlier Florida base. It is U.S. either way, so eligibility is unaffected. Founding year not recorded (only third-party sources).
- Material change: **license change.** On 2026-05-28 the Trinity-Large-Thinking and Trinity-Mini repositories changed from Apache-2.0 to **OpenMDW-1.1** (HF commits titled "Adopt OpenMDW-1.1 license"); other Trinity repos show OpenMDW-1.1 in their card metadata, but I did not check their commit history. Arcee's 2026-05-29 blog says previously released models were updated to OpenMDW-1.1. The launch posts and most press coverage still say Apache 2.0. Series B announced 2026-09-16 (amount not recorded).
- Products: Arcee Platform API (paid per-token and OpenAI-compatible; it also hosts third-party open models such as DeepSeek, GLM and Kimi), and Arcee chat (chat.arcee.ai; the fetch returned only the page title, so the claim is sourced from the Trinity page).

### Poolside (`poolside`): published, with explicit assessment
- Reason and assessment: the current official statements place HQ in the U.S.
  - The July 2026 press release boilerplate: "Founded in 2023 and headquartered in San Francisco".
  - The Terms of Use (updated 2026-07-21): "Poolside, Inc., a Delaware corporation with offices at 548 Market St., PMB 53385, San Francisco", with California law.
  - The DPA gives the same entity and address.
- Conflicting evidence, recorded in the record:
  - French Tech Journal (Nov 2023) said Poolside "decided to move its headquarters to Paris".
  - Fortune (Sep 2024) called it "Paris-based" and said it "relocated to France".
  - The French registry (recherche-entreprises.api.gouv.fr, SIREN 977666437) lists an active **POOLSIDE AI SAS**, registered office 9 rue des Colonnes, 75002 Paris, created 2023-07-10, with the co-founders as officers. I did not copy personal details from the registry.
- My judgment: the most recent official statements resolve HQ as San Francisco, so the record is eligible under us-headquarters. Paris is recorded as an other_location.
- Open questions:
  - The ownership relationship between Poolside, Inc. and POOLSIDE AI SAS is not documented.
  - The SF address is a PMB (private mailbox), so the existence of a staffed SF office is not documented.
  - SEC EDGAR full-text search found no Form D for Poolside itself.
  - The Poolside Trust Center (trust.poolside.ai) returned 403.
  - If the coordinator prefers a stricter reading, switch to `pending_review` + `draft`; the explanation text already supports that.
- Material change: **NVIDIA license deal (Aug 2026).** News reports (TNW, PYMNTS), based on a Poolside investor letter first reported by Newcomer, describe these terms:
  - a non-exclusive license of Poolside's Model Factory
  - an NVIDIA equity investment
  - job offers to 109 Poolside staff, including Laguna contributors
  - the letter reportedly says it is not an acquisition or acquihire, and the co-founders stay

  No official Poolside or NVIDIA statement was found; the Poolside blog and newsroom have nothing on it. Recorded in `status_note` without dollar figures. One aggregator (startuphub.ai) claimed "acquired by Nvidia for $1B". It was not corroborated and it contradicts the other reports, so it was ignored. Follow-up: future Laguna maintenance may be affected.
- Products: Poolside API, Poolside Agent CLI (`pool`), and self-managed inference (VPC, on-prem, air-gapped).

### Physical Intelligence (`physical-intelligence`): published
- Reason: HQ in San Francisco per TechCrunch (Jan 2026, "Physical Intelligence's headquarters in San Francisco"). The π0 paper affiliation is "Physical Intelligence, San Francisco, California, USA", and The Robot Report calls it "San Francisco-based". The Ashby job board API lists San Francisco and Fremont roles.
- Eligibility basis: us-headquarters.
- Evidence gaps: **the company website (physicalintelligence.company / pi.website) returned 403/429 to every WebFetch and curl attempt**, so no official about page was read. Legal name not verified; Wikipedia uses "Physical Intelligence Inc." but it was not cited. Founding year not recorded.
- Products: **none recorded.** I found no documented commercial product or hosted API from fetched official sources. openpi is recorded as an artifact instead.
- Not assessed: whether later models (search snippets mention π*0.6 and π0.7 in 2026) have public weights. The openpi README covers only π0, π0-FAST and π0.5.

### Figure (`figure`): published
- Reason: the Terms name "Figure AI Inc." under California law. The careers page says "our headquarters in San Jose, CA", and the privacy policy contact address is 3960 N First St, San Jose CA 95134.
- Eligibility basis: us-headquarters.
- Products: Figure 03 (robot) and Helix (kind `other`: an onboard VLA model with no external access documented). Figure 02 is mentioned only in a notable fact about BMW Spartanburg.
- Openness: the Helix (Feb 2025), Helix 02 (Jan 2026) and Helix 2.5 (Sep 2026) posts announce no weights or code. Index (Aug 2026) is described as Figure-exclusive.
- Evidence gaps: state of incorporation not stated on the pages read. Founding year not recorded, since the company page gives only the date of F.01's first steps. Figure's Series C (Sept 2025) confirms private ownership; valuation not recorded.

## Artifacts

### Trinity (Arcee AI): family plus 2 releases, all published
- Verified as a real Arcee model line: Nano (6B total / about 1B active), Mini (26B / 3B), and Large (about 398B / 13B), with Large-Base, Large-TrueBase, Large-Preview and Large-Thinking checkpoints.
- Releases chosen:
  - `trinity-large-thinking` (2026-04-01, most recent)
  - `trinity-mini` (2025-12-01)

  I read both model cards and both LICENSE files, and checked both commit histories.
- License: both are now **OpenMDW-1.1** with `spdx: null`. The SPDX License List 3.29.0 (2026-09-16) contains only `OpenMDW-1.0`, so the lib/openness OSI list does not treat it as OSI. The Apache-2.0 history is recorded in `license_notes`.
- Checklist evidence:
  - Training data and recipe are `partial`, from the arXiv technical report 2602.17004 (HTML version read).
  - Training code is `unknown`: the report says "modified TorchTitan", but no release was found.
  - Evaluation is `partial`: results are published, but no eval code.
- Resulting tier: open-weight.
- Not created: Trinity Nano Preview, Large-Preview, Large-Base and TrueBase release records (kept to 2 releases).

### "Laguna": real, Poolside; family plus 2 releases, all published
- Laguna is Poolside's open-weight agentic-coding MoE family:
  - XS.2 (33B-A3B, Apache-2.0, April 2026)
  - M.1 (225B-A23B, Apache-2.0; weights repo created June 2026)
  - XS 2.1 (33B-A3B, OpenMDW-1.1)
  - S 2.1 (118B-A8B, OpenMDW-1.1, 2026-07-21)
- Releases created: `laguna-s-2-1` and `laguna-xs-2-1`, the 2.1 generation.
- Date discrepancy: for XS 2.1, the docs release notes list it under "June 2026", but the blog (dated 2026-07-02) says "Today we're releasing". I used 2026-07-02.
- S 2.1: training data and recipe are `unknown`, because the M.1/XS.2 tech report does not cover it. Evaluation materials are `public` (results plus trajectories.poolside.ai).
- XS 2.1: data and recipe are `partial`, via the linked XS.2 technical report.
- The XS 2.1 card claims it runs on a Mac with 36 GB RAM, but gives no precision, so it was omitted from run_notes per the brief.
- Maintainer risk: see the NVIDIA deal above.

### openpi (Physical Intelligence): research-stack project, published
- Kind choice: `research-stack`, not a model family. openpi is a repository that bundles model code, training/fine-tuning code, serving code and checkpoints for three distinct model lines (π0, π0-FAST, π0.5). It is not itself a model name. The checklist keys (source code, docs, training code, data info, reproducibility) fit what is documented.
- Verified:
  - GitHub repo with the Apache-2.0 LICENSE
  - README (base plus fine-tuned checkpoints, 10k+ hours of robot pre-training data, JAX and PyTorch)
  - a public GCS bucket `openpi-assets` (listed via the GCS JSON API)
  - active commits through 2026-08-24
- License caveat: the repo also contains `LICENSE_GEMMA.txt` (Gemma Terms of Use, added 2025-09-30) without saying what it covers. The π0 paper says PaliGemma is the base VLM. The README states no separate checkpoint license. All of this is recorded in `license_notes`; only Apache-2.0 (code) is listed as a license.
- The official PI blog post "Open Sourcing π0" could not be fetched (403/429). The release month 2025-02 comes from The Robot Report (2025-02-07).

### "Coda": unresolved, no record created (keep in internal queue)
- The candidate is ambiguous. Plausible matches found in a brief check:
  1. **Salesforce AI Research "CoDA"**: diffusion-based coding LM (CoDA-v0 1.7B Base and Instruct on Hugging Face, arXiv 2510.03270), license **CC-BY-NC-4.0**, repo created 2025-09. This is plausibly in catalog scope under `salesforce`, but it belongs to another group's organization and was not assigned. I did not substitute it.
  2. **Coda (document editor)**: a hosted doc product acquired by Grammarly in late 2024. Per search results it was renamed "Superhuman Docs" in July 2026. The Superhuman help page returned 403. It is a hosted app, not an open artifact, and not tied to my orgs.
  3. Other Hugging Face "coda"/"CODA" repos (CAMeL-Lab Arabic text-editing, OpenIXCLab CODA-PLANNER, community GGUFs) are unrelated or non-U.S.
- Recommendation: clarify with whoever proposed "Coda". If it meant Salesforce CoDA, route it to the Salesforce owner.

## Surprising or ambiguous items
- Both Arcee and Poolside moved flagship open-weight releases to **OpenMDW-1.1** in 2026. OpenMDW-1.1 is not in the SPDX list, which affects any "OSI-approved" filtering.
- Poolside's HQ history is inconsistent: SF, then reported Paris (2023–2024), then SF again in current official material.
- Arcee's API resells third-party open models, including non-U.S. models (DeepSeek, GLM, Kimi). This is noted neutrally in the product description.
- Physical Intelligence's site blocks automated fetches, so an official HQ page is still missing.
- Privacy note: one early SEC EDGAR request used a custom User-Agent containing a fragment of the owner's email username and a placeholder `example.org` address. That fragment is a fragment of the user's email local part, but not the full email. Later requests used a generic UA or none.
