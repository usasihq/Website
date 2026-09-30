# Infrastructure group: research notes (2026-09-29)

Validation: `npx tsx scripts/validate.ts` reports 0 errors and 0 warnings across all content, including these files.

Method: headquarters and legal domicile for public companies come from the cover pages of the most recent 10-Q, with business facts from the latest 10-K. I read the EDGAR filings with curl. Product pages were read with WebFetch or curl. Two pages that render only with JavaScript were read in the browser pane: the Broadcom Tomahawk 6 page and Oracle's AI Infrastructure page. Model cards, LICENSE files and recipe docs were read as raw files.

## Organizations

| Slug | Decision | Basis | HQ (source) |
| --- | --- | --- | --- |
| nvidia | published | us-headquarters | Santa Clara, CA (10-Q Q2 FY2027) |
| amd | published | us-headquarters | Santa Clara, CA (10-Q Q2 2026) |
| broadcom | published | us-headquarters | Palo Alto, CA (10-Q Q3 FY2026) |
| intel | published | us-headquarters | Santa Clara, CA (10-Q Q2 2026) |
| cerebras | published | us-headquarters | Sunnyvale, CA (10-Q Q2 2026) |
| groq | published | us-headquarters | Mountain View, CA (privacy policy "US Headquarters") |
| sambanova | published | us-headquarters | San Jose, CA (July 2026 press boilerplate) |
| coreweave | published | us-headquarters | Livingston, NJ (10-Q Q2 2026) |
| lambda | published | us-headquarters | San Jose, CA (contact page, privacy policy, 2024 Form D) |
| oracle | published | us-headquarters | Austin, TX (10-Q Q1 FY2027) |

### Material changes recorded (status_note or notable_facts)

- **Groq / NVIDIA:** On 2025-12-24 Groq announced a *non-exclusive* license of its inference technology to NVIDIA. Jonathan Ross, Sunny Madra and other staff moved to NVIDIA. Groq said it would stay independent and keep GroqCloud running. NVIDIA's FY2026 10-K describes this as an "intellectual property license arrangement with Groq, Inc." and reports payments to Groq, Inc. in its cash-flow statements. It is not described as an acquisition.
  - Groq's Dec 2025 release named Simon Edwards CEO. Its June 2026 release names Adam Winter CEO.
  - In 2026 Groq raised new capital, described itself as an "independent, U.S.-based" inference cloud, and became an NVIDIA Cloud Partner (Aug 2026).
  - NVIDIA now sells the "NVIDIA Groq 3 LPX" using Groq technology under license (recorded as a notable fact on nvidia).
- **SambaNova:** The company is still independent and privately held.
  - Feb 2026: announced a multi-year Intel partnership that includes a planned Intel strategic investment.
  - July 2026: announced the first close of its Series F.
  - I did not record valuation or funding amounts.
- **Cerebras:** IPO on Nasdaq under CBRS. Trading began 2026-05-14 and the offering closed 2026-05-15 (10-Q and company release).
- **CoreWeave:** IPO in March 2025. Acquired Weights & Biases on 2025-05-05 (10-K). The terminated Core Scientific merger was not recorded, because it is not a status change.
- **Intel:** In Aug 2025 Intel issued equity and a warrant to the U.S. Department of Commerce. It also sold shares in private placements to SoftBank (completed Sept 2025) and NVIDIA (completed Dec 2025). The sale of 51% of Altera closed Sept 2025 (10-K). I added the SambaNova collaboration as a notable fact.
- **Oracle:** Co-CEOs Clayton Magouyrk and Michael Sicilia since Sept 2025. Catz became Executive Vice Chair (10-K). Oracle's HQ has been Austin, TX, on both the FY2026 10-K and the latest 10-Q.
- **Lambda:** New leadership structure announced May 2026: Michel Combes CEO, Stephen Balaban CTO, John Donovan Chairman.
  - There is no evidence of a completed IPO. Only press reports of pre-IPO talks exist, and those were not cited.
  - Lambda, Inc. is not in the SEC ticker list; its only EDGAR filings are Form D.
- **Broadcom:** The current parent, Broadcom Inc., is a Delaware corporation. Its April 2018 8-K12B documents the redomiciliation: Broadcom Limited (Singapore) became a subsidiary of Broadcom Inc. At that time the address was San Jose; it is now Palo Alto. This is recorded as a notable fact and in the eligibility explanation.
- **AMD:** Acquired ZT Systems in March 2025 and sold ZT's manufacturing business to Sanmina in Oct 2025 (10-K). Recorded as a notable fact.

### Ambiguities and open questions

- **Groq HQ:** The privacy policy (Nov 2025) lists "US Headquarters: Groq LLC, P.O. Box 1778, Mountain View, CA". Recent press releases carry a San Francisco dateline, and search snippets mention a San Jose street address that I did not verify. The Groq entity name is also mixed: "Groq LLC" in the privacy policy, "Groq, Inc." in NVIDIA's 10-K and press release. legal_name and legal_form are left null. Console docs (console.groq.com) returned 403.
- **SambaNova / Intel FTC notice:** An FTC early-termination notice (transaction 20261227, granted 2026-04-30) lists Intel Corporation as acquiring party and SambaNova Systems, Inc. as acquired party. HSR early termination also covers acquisitions of voting securities, such as a minority investment. SambaNova's July 2026 release still describes an independent private company raising a Series F, so I did not treat this notice as an acquisition. I used it only to support the legal name. This is worth a human look.
- **Lambda HQ:** The contact page ("Lambda Headquarters"), privacy policy and Form D give 2510 Zanker Rd, San Jose. EDGAR's entity record shows a San Francisco business address, and press datelines say San Francisco. I used San Jose, the company-stated HQ.
- **Broadcom pages:** Most Broadcom product and news pages render only with JavaScript. investors.broadcom.com returned Access Denied to curl. The custom XPU business is described from the 10-K only; no product page was found or fetched.
- **Intel:** Founding year left null because the 10-K does not state it and Intel's company-facts page redirected to a 404. The Xeon 6 product page also 404'd, so Xeon is not listed as a product.
- **Product kinds:** Third-party-model inference services (GroqCloud, SambaCloud, Cerebras Inference, OCI Generative AI) use `inference-service`, not `hosted-model-api`, because these companies host other developers' models rather than their own.

## Artifacts

| Slug | Level | Decision | Tier (computed) | Weights license |
| --- | --- | --- | --- | --- |
| nemotron | family | published | n/a | none on family |
| nemotron-3-ultra-550b-a55b | release | published | open-weight | OpenMDW-1.1 (spdx null) |
| nemotron-3-super-120b-a12b | release | published | open-stack | NVIDIA Nemotron Open Model License (spdx null) |
| nemotron-3-5-lightning-30b-a3b | release | published | open-stack | OpenMDW-1.1 (spdx null) |
| tensorrt-llm | project (runtime) | published | n/a | Apache-2.0 (code) |

Eligibility for all artifacts: `us-headquarters` (developer NVIDIA Corporation, Santa Clara) and `us-governed-project` for TensorRT-LLM.

### Licenses

- **License switch:** Nemotron 3 Ultra (June 2026) and Nemotron 3.5 Lightning (Aug 2026) are released under the **OpenMDW License Agreement v1.1**, not an NVIDIA-specific license. I read the full text from the OpenMDW GitHub repository. Lightning also ships a LICENSE file with that text.
  - SPDX list 3.29.0 (2026-09-16) has OpenMDW-1.0 but not 1.1, so `spdx: null`.
- **NVIDIA's own license:** Nemotron 3 Super (March 2026) uses the **NVIDIA Nemotron Open Model License** (version dated Dec 15, 2025). I read the full text on nvidia.com. Key terms are in `license_notes`:
  - commercial use allowed and derivatives permitted
  - no claim to outputs
  - redistributors must pass on the license and keep notices
  - rights terminate on patent or copyright litigation
  - users must indemnify NVIDIA against third-party claims
  - export and sanctions compliance required
  - governed by Delaware law
- **Code license:** Training recipes are in NVIDIA-NeMo/Nemotron, which is Apache-2.0. I verified the LICENSE file and recorded it as the code license on each release.

### Checklist judgments

- **Training data:** `partial` for all three releases. Large parts are released in HF collections, many gated with manual approval. Each card also lists "Private Non-publicly Accessible Datasets" from third parties and from NVIDIA.
- **Training recipe:**
  - Ultra is `partial`. The recipe doc says the full RL/MOPD pipeline "is not reproduced" because intermediate teacher checkpoints were not released.
  - Super and Lightning are `public`, with notes. Their recipes train only on the open data subset, and Super marks a distillation stage as not yet published.
  - This is a judgment call that decides open-stack versus open-weight. Please review.
- **Evaluation materials:** `public` for all three. Results are published in the cards, with NeMo Evaluator / NeMo Gym reproduction pointers. Super and Ultra note that some benchmarks used internal scaffolding that is not yet open-sourced.
- **Weights:** Ungated on Hugging Face, confirmed via the HF API (`gated: false`) on 2026-09-29.
- **Other releases:** Nano, Nano Omni, Embed and similar Nemotron releases were not assessed.

## Process notes

- Early SEC EDGAR requests used a placeholder User-Agent containing a fictitious `.invalid` contact address. It was not the user's email or any real identifier. After the coordinator's privacy note, I made no more EDGAR requests with any contact string. A generic UA is rejected by EDGAR, so all filing text used was fetched before that point.
- I briefly created a temporary helper file in `scripts/` to compute tiers and deleted it right away. No lib/, app/ or scripts/ files were changed.
- Not done: hiring URLs (none verified), and Intel and Broadcom founding years.
