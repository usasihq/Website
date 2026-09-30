# r2-robotics research notes

Researcher group: r2-robotics. Reviewed 2026-09-29.
Assigned orgs: skild-ai, agility-robotics, apptronik, boston-dynamics, waymo.
Assigned artifacts: waymo-open-dataset, plus an optional open code or model release (added `waymax`).

Validation: `npx tsx scripts/validate.ts` reports no errors or warnings for any file below. On the final run, the remaining errors and warnings were all in other groups' files: mochi-1-preview, slimpajama, and continue-extension.

## Files created

| File | Status | Eligibility |
| --- | --- | --- |
| content/organizations/skild-ai.yml | published | eligible, us-headquarters (explicit assessment) |
| content/organizations/agility-robotics.yml | published | eligible, us-headquarters |
| content/organizations/apptronik.yml | published | eligible, us-headquarters |
| content/organizations/boston-dynamics.yml | published | eligible, us-headquarters (explicit ownership assessment) |
| content/organizations/waymo.yml | published | eligible, us-headquarters; parent `google`, `subsidiary` |
| content/artifacts/waymo-open-dataset.yml (dataset project) | published | eligible, us-governed-project |
| content/artifacts/waymax.yml (framework project) | published | eligible, us-governed-project |

## Organizations

### Skild AI (`skild-ai`): published
- **Reason.** The Skild Brain and S1 are documented on Skild's own blog. The Zebra acquisition is documented by Zebra's press release and Skild's blog.
- **Eligibility.** us-headquarters, with an explicit assessment.
  - Business Wire releases (July 2025, via Yahoo syndication) and the April 2026 Zebra/Skild release are datelined Pittsburgh.
  - The 2025 boilerplate says the company has "offices in Pittsburgh and the San Francisco Bay Area".
  - Technical.ly calls it "East Liberty-based" (a Pittsburgh neighborhood).
  - The Bengaluru blog (Feb 2026) calls India "our first expansion beyond the US".
- **Ambiguity.**
  - No official page uses the word "headquarters".
  - The Greenhouse job board (skildai-careers API) lists most of its 46 roles in San Mateo, CA. Some are in Pittsburgh and Bengaluru, and one is remote (U.S.).
  - The HQ could be San Mateo rather than Pittsburgh. Both are in the U.S., so eligibility is unaffected, but the HQ label may need correcting.
- **Gaps.**
  - Legal name not verified: "Skild AI, Inc." appears only on D&B, which I did not cite.
  - EDGAR has no Form D for the operating company; only SPVs appear (e.g. "Skild AI Apr 2025 a Series of CGF2021 LLC").
  - businesswire.com returned 403, so the Series C release could not be read directly.
- **Material change.** In April 2026 Skild acquired Zebra Technologies' Robotics Automation business (formerly Fetch Robotics), including Symmetry Fulfillment. Zebra received cash plus an equity stake. This is recorded as a notable fact.
- **Openness.** The skild-ai GitHub organization has 0 public repositories. No open model or code release was found.
- **Excluded facts.** Funding amounts, valuation, and the "$100M ARR" post are left out under the round-2 rules.

### Agility Robotics (`agility-robotics`): published
- **Eligibility.** us-headquarters.
  - The Sept 15, 2026 press release says "Headquartered in Salem, Oregon".
  - The SEC EDGAR filer record and the S-4 filing index list Agility Robotics, Inc. (DE) at 4698 Truax Drive SE, Salem, OR.
- **Material change: pending SPAC merger.**
  - June 24, 2026: definitive agreement with Churchill Capital Corp XI (Nasdaq: CCXI). The combined company would trade as "AGLT".
  - July 14: confidential draft S-4 submitted.
  - Sept 4, 2026: public S-4 filed, with Agility Robotics, Inc. and Churchill XI as co-registrants.
  - The Sept 15 release and the investors page still describe the deal as pending. The investors page announces an Analyst & Investor Day on Oct 6, 2026.
  - The status note records the deal as pending. If it closes, the record needs an update: ownership becomes publicly traded and the legal entity may change.
- **Gaps.**
  - Founding year not recorded. The 2015/Oregon State University spin-off date appears only on Wikipedia.
  - The S-4 main document (16.8 MB) exceeded the WebFetch size limit, and sec.gov blocks generic user agents. I read only the filing index and the EDGAR company page.
- **Products.** Digit (robot) and Agility Arc (enterprise software). Digit 5 early access is expected in H1 2027, with general availability by the end of 2027.
- **Openness.** The GitHub organization mostly holds infrastructure tooling plus a Cassie documentation repo. No AI model release was found.

### Apptronik (`apptronik`): published
- **Eligibility.** us-headquarters.
  - The Form D (filed 2025-11-05) lists Apptronik, Inc., a Delaware corporation, with its principal place of business at 11701 Stonehollow Dr, Suite 150, Austin, TX.
  - Its terms of use name Apptronik, Inc., a Delaware corporation, with Texas law and Travis County venue.
  - Press releases are datelined Austin.
- **Surprise.** One WebFetch summary of the EDGAR search said the company was "incorporated in Texas". The EDGAR company page, the Form D, and the terms all say Delaware, so I used Delaware.
- **Gaps.** No official founding year, so it is null. The boilerplate says it "started out of the Human Centered Robotics Lab at the University of Texas at Austin".
- **Notable.**
  - Research partnership with Google DeepMind: data collected by Apollo 2 feeds Gemini Robotics.
  - Robot Park opened in Austin (June 2026).
  - Apollo 3 is in development.
- **Openness.** No public models or code found. The AI stack cited is Google DeepMind's.

### Boston Dynamics (`boston-dynamics`): published, with explicit ownership assessment
- **Eligibility.** us-headquarters.
  - A June 24, 2026 release datelined Waltham, MA refers to the company's "existing headquarters" in Waltham.
  - The site terms give Boston Dynamics, Inc., 200 Smith Street, Suite 4100, Waltham, MA 02451. The terms were last updated June 2022, so the street address may be dated, but the city is confirmed by the 2026 release.
  - The careers page lists most jobs in Waltham.
- **Ownership (recorded; does not affect the basis).**
  - June 2021 (Boston Dynamics release): Hyundai Motor Group acquired an 80% controlling interest, and a SoftBank affiliate kept 20%.
  - June 19, 2026 (The Next Web): SoftBank's remaining stake was 9.65%. Hyundai Motor Group affiliates (Hyundai Motor, Kia, Hyundai Mobis, Hyundai Glovis) plus the group's executive chair held just over 90%.
  - July 16, 2026 (Hyundai Motor Group statement, datelined Seoul): its shareholders are "pursuing the acquisition of SoftBank's entire stake" after SoftBank's put-option notice, subject to approvals and settlement.
  - I found no official confirmation that the purchase has closed. A letsdatascience.com headline claims completion, but it is not a reliable source and I did not use it.
  - `ownership_category: unit-of-another-organization` with no parent slug, because Hyundai has no catalog record. The record explicitly does not claim us-control.
- **Open question.** A coordinator may prefer `privately-held`, since Hyundai Motor Group is a group of affiliates, or may want `pending_review`. Under the stated policy, U.S. HQ is a sufficient basis.
- **Gaps.**
  - State of incorporation not verified, so `legal_form` is null.
  - A Korea Times article (July 2026) mentions IPO speculation. It is not recorded.
- **Notable.**
  - Large Behavior Model for Atlas with TRI (Aug 2025): a 450M-parameter diffusion transformer. No public release.
  - Orbit AIVI-Learning uses Gemini and Gemini Robotics ER 1.6 (Apr 2026).
  - Hyundai Motor Group plans to deploy Atlas at HMGMA from 2028.
  - The Waltham expansion was announced in June 2026. The quote from that release names an "Interim CEO", which suggests a leadership change; per the rules, it is not recorded.
- **Openness.**
  - The spot-sdk repo is under the custom "Boston Dynamics Software Development Kit License", limited to use with Boston Dynamics products and software simulators.
  - The boston-dynamics/mjlab repo is a fork of mujocolab/mjlab, not a Boston Dynamics project, so no artifact was created.

### Waymo (`waymo`): published; parent `google`, relationship `subsidiary`
- **Eligibility.** us-headquarters. The Waymo website terms (effective 2018) give "Waymo LLC ... located at 1600 Amphitheater Parkway, Mountain View, CA 94043".
- **Parent assessment.** The Alphabet 2025 Annual Report PDF, which includes the full Form 10-K, is hosted on Alphabet's IR CDN (s206.q4cdn.com). In it:
  - Waymo is "our fully autonomous driving technology company" in Other Bets.
  - Note 5 (Variable Interest Entities) calls Waymo "a consolidated VIE". Outside investment in the February 2026 round will be recognized as noncontrolling interests, and "the significant majority" of that round was funded by Alphabet.
  - Waymo's February 2026 blog calls Alphabet "our majority investor".
  - The Waymo about page says it was "established under Alphabet" in 2016.
  - Waymo is not listed in Exhibit 21, which names only Google LLC, XXVI Holdings, and Alphabet Capital US as significant subsidiaries.
- **Conclusion.** The subsidiary relationship is supported: Waymo is consolidated and majority-funded by Alphabet, not wholly owned.
  - The SEC-hosted 10-K HTML was truncated by WebFetch, so I cite the IR PDF.
  - I did not re-cite the SEC 10-K URL. The existing google record cites it.
- **Gaps.**
  - The service-city list conflicted between the homepage and the FAQ, so the record names no cities beyond the FAQ's Uber note (Austin and Atlanta).
  - Founding year recorded as 2016, when Waymo became a company under Alphabet. The 2009 Google project start is in the summary.
- **Excluded facts.** Funding amounts and valuation ($16B round, $126B valuation) are left out.

## Artifacts

### Waymo Open Dataset (`waymo-open-dataset`): published, dataset project
- **License.** Custom "Waymo Dataset License Agreement for Non-Commercial Use (March 2025)", read in full at waymo.com/open/terms/. Key terms:
  - A personal, royalty-free license for non-commercial purposes: research, teaching, publication, personal experimentation, and benchmarking.
  - No use of the data, or of models trained on it, in vehicle operation, production systems, or other primarily commercial purposes.
  - Redistribution only to other registered users who accepted the terms.
  - Trained models may be published only with a notice that carries the terms downstream.
  - Mandatory attribution, and a limited non-assert toward Waymo.
  - The FAQ states the license "should not be considered an open source license".
- **Code licenses.** Per the repo LICENSE and README, the code is Apache-2.0, except `src/waymo_open_dataset/wdl_limited`. Those folders are BSD 3-clause plus a limited patent license usable only with the dataset under the data license.
- **Access.** The download and data pages redirect to Google sign-in, so availability and access are `partial` (registration required). I did not sign in.
- **Discrepancy.** The repo README's schema.org metadata names the license "(August 2019)", while the terms page shows the March 2025 version.
- **Released.** 2019-08-21, per the Waymo blog.
- **Current components** (about page): Perception (2,030 segments; last updated March 2024, v1.4.3/v2.0.1), Motion (103,354 segments; last updated October 2025, v1.3.1 sdc_paths), and End-to-End Driving (5,000 segments; last updated March 2025).
- **Record fields.** No version field is set, because the three datasets are versioned separately. `derived_from` is empty: the data was collected by Waymo itself.

### Waymax (`waymax`): published, framework project (optional)
- **What it is.** A JAX-based driving simulator on top of the Waymo Open Motion Dataset, in waymo-research/waymax.
- **License.** Custom "Waymax License Agreement for Non-Commercial Use", headed October 17, 2023. It covers all materials.
  - The current text includes an "Artificial Intelligence Prohibition" (section 2.e) against using the code or docs to train or improve foundation models. It may have been added after the header date; I did not check the file history.
- **Releases.** No tagged releases; setup.py declares version 0.1.0 and Python 3.10 or later, so `release_status` is `partial`.
- **Record fields.** `released_at` is null. The repo was created on 2023-10-02 and the paper was submitted on 2023-10-12, but no release date is documented.

## Candidates considered and not created
- Skild Brain and S1 models: no public weights or code.
- Agility, Apptronik, and Boston Dynamics models: none released publicly.
- Boston Dynamics mjlab: a fork, not a Boston Dynamics project.
- Boston Dynamics spot-sdk: a robot SDK under a product-restricted license, not an AI model or tool; left out.
- Waymo Foundation Model: not released.

## Surprising or ambiguous items
- Agility's pending SPAC merger (CCXI → AGLT); the S-4 is on file.
- Boston Dynamics' move toward full Hyundai Motor Group ownership; closing is not confirmed.
- The Skild HQ label (Pittsburgh vs. San Mateo).
- The Waymo dataset license version mismatch between the README metadata and the terms page.
- The Waymax license's new clause against training AI foundation models.
