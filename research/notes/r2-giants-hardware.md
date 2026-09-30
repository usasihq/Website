# r2-giants-hardware: research notes (2026-09-29)

Validation: `npx tsx scripts/validate.ts` reports no errors or warnings in this group's files. The run's
remaining error (`artifacts/mochi-1-preview.yml`) and warning (`continue-extension.yml`) belong
to other groups.

## Method

- **Headquarters and domicile:** taken from the cover pages of each company's latest 10-Q, or of the 10-K where that is the newest filing. The filing index came from `data.sec.gov` submissions JSON, fetched with the generic UA `USASI-catalog-research/0.2`. www.sec.gov blocks that UA ("undeclared automated tool"), so the filing documents themselves were read with WebFetch. No personal identifiers were sent.
- **Filing excerpts:** WebFetch returns only part of a long filing. Some facts (Tesla's 2003 incorporation and its 2024 move to Texas, HPE's 2015 separation) could not be found in the parts it returned, so they are left out.
- **Product pages:** read with WebFetch where it worked. Several sites block curl and WebFetch (403) or render only with JavaScript: tesla.com, qualcomm.com, marvell.com, and hpe.com (the HTTP/2 request hung). Those pages were read in the Browser pane (page text via JS).
- **GitHub, Hugging Face, PyPI:** read with curl, including the raw README and LICENSE files and the GitHub and PyPI APIs.

## Organizations

| Slug | Decision | Basis | HQ (source) | Legal form |
| --- | --- | --- | --- | --- |
| tesla | published | us-headquarters | Austin, TX (10-Q Q2 2026) | Texas corporation |
| qualcomm | published | us-headquarters | San Diego, CA (10-Q Q3 FY2026) | Delaware (CA 1985, reincorporated DE 1991) |
| micron | published | us-headquarters | Boise, ID (10-Q Q3 FY2026) | Delaware |
| marvell | published | us-headquarters | Wilmington, DE (10-Q + 10-K "corporate headquarters"); Santa Clara, CA in other_locations | Delaware (since Apr 2021; Bermuda parent before) |
| cisco | published | us-headquarters | San Jose, CA (10-K FY2026) | Delaware (CA 1984, reincorporated DE 2021) |
| dell-technologies | published | us-headquarters | Round Rock, TX (10-Q Q2 FY2027) | Texas (converted from Delaware effective 2026-07-01) |
| hpe | published | us-headquarters | Spring, TX (10-Q Q3 FY2026) | Delaware |
| supermicro | published | us-headquarters | San Jose, CA (10-K FY2026 + about page) | Delaware |

Products (all URLs fetched today):

- **tesla:** FSD (Supervised) and Robotaxi.
  - tesla.com/optimus returned a 404, and tesla.com/ai was "Access Denied" even in the browser. Optimus therefore appears only in the summary, sourced to the 10-K, and is not listed as a product.
- **qualcomm:** Dragonfly AI accelerators (AI200/AI250/AI300), Hexagon NPU, and Qualcomm AI Hub.
- **micron:** HBM (HBM3E/HBM4), SOCAMM2, and data center SSDs.
- **marvell:** custom ASICs, Teralynx switches, PAM4 optical DSPs, and Photonic Fabric.
- **cisco:** Silicon One, Secure AI Factory with NVIDIA, and AI Defense.
- **dell-technologies:** Dell AI Factory, PowerEdge XE AI servers, and Dell AI Data Platform.
- **hpe:** Private Cloud AI, HPE AI Factory, and HPE Cray Supercomputing.
- **supermicro:** GPU servers and DCBBS.

No performance, capacity, or price figures are recorded.

## Artifact

| Slug | Kind | Decision | License |
| --- | --- | --- | --- |
| qualcomm-ai-hub-models | framework / project | published | BSD-3-Clause (code). `license_notes` records that each packaged model keeps its upstream license (the per-model READMEs link to them). |

- **Eligibility:** `us-governed-project`. The LICENSE names Qualcomm Technologies, Inc. as copyright holder, and PyPI lists it as author. Qualcomm's press-release boilerplate describes Qualcomm Technologies, Inc. as a subsidiary of QUALCOMM Incorporated.
- **Kind:** there is no exact kind for a model-zoo-plus-export-tooling package. I used `framework` and noted in the summary and provenance that most packaged models come from other developers.
- **Cisco:** no artifact created. Cisco's Foundation-Sec-8B (Foundation AI at Cisco; card lists Apache-2.0; derived from Llama-3.1-8B) is recorded as a notable fact and in `openness_summary`. A proper record needs a family plus a release file, and a license assessment of an Apache-2.0 declaration on Llama-3.1-derived weights. That is worth a separate review.

## Material changes found (recorded)

- **Qualcomm / Modular:** Qualcomm completed its acquisition of Modular Inc.
  - The 10-Q gives July 28, 2026 as the completion date. The press release dated July 29, 2026 says Mojo, MAX, and Modular Cloud continue as products and brands.
  - This is recorded as a notable fact. The `modular` record from another group already sets `parent_org_slug: qualcomm` and cites the same sources, so the two records are consistent.
- **Qualcomm / Alphawave:** Qualcomm completed its acquisition of Alphawave IP Group plc on 2025-12-18 (10-Q). Recorded as a notable fact.
- **Dell:** Dell changed its jurisdiction of incorporation from Delaware to Texas effective 2026-07-01, by a plan of conversion (10-Q). This is recorded in `legal_form`, `notable_facts`, and the eligibility explanation. It was not put in `status_note`, because the company's identity, ownership, and HQ did not change.
- **Marvell:**
  - On 2021-04-20 the Bermuda parent (Marvell Technology Group Ltd.) became a subsidiary of Marvell Technology, Inc. (Delaware) in the Inphi transaction (8-K12B).
  - Celestial AI (2026-02-02) and XConn (2026-02-10) acquisitions were completed (10-Q).
- **HPE:**
  - Completed the Juniper Networks acquisition on 2025-07-02 (10-K and press release).
  - Merged segments into "Cloud & AI" effective 2025-11-01 (10-Q).
- **Tesla:** the entity is a Texas corporation per its cover pages. The 2024 move from Delaware is not recorded because I could not read a filing passage stating it.

## Ambiguities and open questions

- **Marvell HQ:** the SEC cover pages and the 10-K list Wilmington, DE as principal executive offices and "corporate headquarters". The IR "Company Contact" address, and the main California office on the offices page, is 5488 Marvell Lane, Santa Clara, CA. No Marvell page reviewed labels Santa Clara "headquarters". I used Wilmington as `headquarters` and Santa Clara in `other_locations`. Both are U.S., so eligibility is unaffected.
- **Founding years left null:**
  - Tesla, HPE, and Marvell: no passage in the fetched filing excerpts or official pages stated them.
  - Cisco (1984) and Qualcomm (1985) come from their 10-K incorporation sentences. Micron (1978), Dell (1984, as PC's Limited), and Supermicro (1993) come from the companies' own pages.
- **Tesla, not recorded:**
  - The Q2 2026 10-Q reports an asset acquisition of an unnamed "AI hardware company", paid in Tesla stock. The target is not named.
  - Tesla's relationship with xAI/SpaceX.
- **Micron:** the FY2026 10-K was not yet filed on 2026-09-29, so the latest 10-Q (quarter ended May 28, 2026) is used.
- **Dell founding:** the 10-K only implies 1984 through the CEO biography. The founding year is sourced to Dell's own timeline page.
- **Tesla FSD page:** it shows a monthly price, which I did not record. The page states that the enabled features require active driver supervision and do not make the vehicle autonomous. That statement is included in the product's `access` field.
- **Robotaxi cities:** the product entry lists the six cities shown on 2026-09-29. This will go stale and should be re-checked at the next review.
- **Roles and sectors:**
  - Cisco is tagged `chip-designer` + `enterprise-software`, not `model-developer`, despite Foundation-Sec. It is a reviewer's call whether to add it.
  - Dell, HPE, and Supermicro use sector `enterprise`, because no sector enum fits a server/infrastructure vendor more precisely.
