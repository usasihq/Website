# Verification log: r2-giants

Batch: **r2-giants**. Checked 2026-09-29 by an independent fact-checker under `research/VERIFIER_BRIEF.md` and `research/AGENT_BRIEF_ROUND2.md`.

Records: organizations tesla, qualcomm, micron, marvell, cisco, dell-technologies, hpe, supermicro, spacex, cloudflare, servicenow, linkedin; xai (parent/status consistency only); artifact qualcomm-ai-hub-models.

`last_reviewed` was not changed. `updated_at` stays 2026-09-29 on every edited record. After edits, `npx tsx scripts/validate.ts` reports **0 errors, 1 warning**; the warning is `artifacts/continue-extension.yml`, which belongs to another group.

## Summary

- **Verified, no changes (7):** qualcomm, micron, dell-technologies, hpe, servicenow, xai (scope: parent and status note), qualcomm-ai-hub-models.
- **Changed (7):** tesla, marvell, cisco, supermicro, spacex, cloudflare, linkedin. Each change either narrows wording, adds a supporting official source, or fills a detail I verified from a filing.
- **Eligibility and publication status:** unchanged on every record.

### Special-attention claims (all confirmed against filings or company statements opened today)

| Claim | Result | Source read |
| --- | --- | --- |
| SpaceX–xAI | Confirmed. Completed 2026-02-02; X.AI Holdings Corp. became a wholly owned subsidiary. Before that, xAI completed its acquisition of X Holdings Corp. and X.AI Corp. on 2025-03-28. | SpaceX 10-Q, Q2 2026 (Note 1, "Common Control Mergers") |
| SpaceX IPO | Confirmed. The IPO completed in June 2026. Class A shares trade on Nasdaq as SPCX, and the cover also lists Nasdaq Texas. | SpaceX 10-Q |
| SpaceX–Anysphere (Cursor) | Confirmed. The merger took effect 2026-08-14 and Cursor survives as a wholly owned subsidiary. | 8-K, Item 2.01 |
| SpaceX domicile and HQ | Texas corporation; 1 Rocket Road, Starbase, TX. | 10-Q and 8-K cover pages |
| Qualcomm–Modular | Confirmed. Completed 2026-07-28, per the 10-Q, which gives Modular's description. The release dated 2026-07-29 says Mojo, MAX and Modular Cloud continue as products and brands. | Qualcomm 10-Q; Qualcomm release |
| Qualcomm–Alphawave | Confirmed. Completed 2025-12-18, and the 10-Q links it to Qualcomm's data center expansion. | Qualcomm 10-Q |
| Cloudflare–Replicate | Confirmed. Announced 2025-11-17. Cloudflare acquired all outstanding shares on 2025-12-01. Replicate's post says the API isn't changing. | Cloudflare release; 10-K Note 13 (also R21); Replicate blog |
| Dell reincorporation | Confirmed. After shareholder approval at the 2026 annual meeting, Dell changed from Delaware to Texas effective 2026-07-01 under a plan of conversion. | Dell Q2 FY2027 10-Q cover and Note 1 |
| HPE–Juniper | Confirmed. Completed 2025-07-02. Rami Rahim leads the combined HPE Networking business. | HPE FY2025 10-K; HPE release |
| HPE segments | Confirmed. The Cloud & AI segment is effective 2025-11-01. | HPE Q3 FY2026 10-Q |
| Marvell domicile | Confirmed. Delaware corporation. The 10-Q and 10-K cover pages give principal executive offices in Wilmington, DE, and the 10-K calls that address its "corporate headquarters". Before April 2021 the parent was the Bermuda company (see marvell below). | Marvell 10-Q, 10-K; 8-K12B; Marvell Technology Group Ltd. FY2021 10-K |
| Headquarters | Every public-company HQ matches the latest 10-Q or 10-K cover page. | Filing cover pages |

Other HQ notes:

- **LinkedIn** is a Microsoft subsidiary and has no filing of its own. Its HQ citation is strengthened with LinkedIn's own careers page (see linkedin below).
- **xai:** consistent with spacex. It has `parent_org_slug: spacex` and `parent_relationship: subsidiary`. Its status note agrees with the SpaceX filings: acquisition 2026-02-02, the X Holdings acquisition in March 2025, a Texas corporation in Starbase, and the June 2026 IPO. The stale sentence about SpaceX having no catalog record is gone. The x.ai announcement page shows "© 2026 SpaceXAI LLC" and the title "xAI joins SpaceX | SpaceXAI".

### Method

- **Filing documents.** www.sec.gov returns 403 to `curl` with the generic User-Agent `USASI-factcheck/0.2`.
  - I opened each filing in the Browser pane, a standard browser request with no personal identifiers. I searched its full text with in-page JavaScript, so claims deep inside long 10-Ks were checked in full.
  - Filing dates came from the `data.sec.gov` submissions JSON, fetched with curl and the same generic UA.
- **Company pages.**
  - Read with WebFetch: Micron, Cisco, Dell, Supermicro, Cloudflare, Replicate, ServiceNow newsroom, LinkedIn, Hugging Face, arXiv.
  - Read in the Browser pane, because they block or render poorly for WebFetch: Qualcomm, Marvell, HPE, Tesla, x.ai.
- **Raw files.** GitHub raw files, PyPI JSON, the Hugging Face API and the StarCoder2 PDF were read with curl.
- **Privacy.** No email address or personal identifier was sent in any request.

## Records

### tesla — changed

- **summary:**
  - Before: "focused on bringing AI into real-world products such as Full Self-Driving (Supervised) and its Robotaxi service"
  - After: "focused on bringing AI into the real world through products and services such as Full Self-Driving (Supervised) and Robotaxi"
  - Reason: this matches the 10-K and 10-Q wording more exactly.
- **legal_form:**
  - Before: "Texas corporation"
  - After: "Texas corporation (incorporated in Delaware in 2003 and converted to a Texas corporation in June 2024)"
  - Source: FY2025 10-K, Note 1, which says Tesla "was incorporated in the State of Delaware on July 1, 2003 and converted to a Texas corporation on June 13, 2024".
  - The researcher could not reach this passage through WebFetch.
- **Verified:**
  - legal_name, and HQ at 1 Tesla Road, Austin (10-Q cover).
  - Optimus is described as a general purpose, autonomous humanoid robot (10-K and 10-Q).
  - Robotaxi launched June 2025, currently operates with Model Y, and will in time include Cybercab (10-K).
  - Cortex is Tesla's training cluster at Gigafactory Texas. It was expanded in 2025, and Cortex 2 is being built (10-K).
  - The 2025 Samsung collaboration on AI inference and training semiconductors in the U.S. (10-K).
  - FSD page: sold as a monthly subscription, available in select markets in North America, Europe and Asia Pacific, and the supervision disclaimer.
  - Robotaxi page: rides are offered in Austin, Dallas, Houston, Miami, Orlando and Tampa through the Robotaxi app for iOS and Android. Cybercab is described as designed without a steering wheel or pedals.
- **Noted, not added:**
  - The Q2 2026 10-Q reports that Tesla holds a SpaceX equity investment. It is accounted for under the fair value option, with significant influence but no control.
  - Tesla's 8-K filed 2026-09-29 covers new credit facilities, which are not relevant.
  - An editor may want to mention the SpaceX relationship. It is a financial investment, not control.

### qualcomm — verified, no changes

- Cover page: legal name, Delaware, and 5775 Morehouse Dr., San Diego.
- 10-K: "incorporated in California in 1985 and reincorporated in Delaware in 1991". It also lists "foundational technologies, including on-device artificial intelligence (AI)" and calls the Hexagon NPU a key processor in the AI Engine used in Snapdragon.
- Modular and Alphawave: confirmed (see the table above).
- The Qualcomm Technologies, Inc. structure matches the release boilerplate.
- Products:
  - Data center page: Dragonfly AI200, AI250 and AI300 rack-scale inference platforms, plus the CPU, connectivity DSPs, custom silicon, the management suite and the Cloud AI SDK. The page has a "Contact sales" link.
  - Hexagon page.
  - aihub.qualcomm.com: convert, quantize, profile and run on hosted devices, plus the model library.
- openness_summary: checked against the LICENSE (BSD-3-Clause) and the per-model README license links.
- `founded: 1985` is the incorporation year. That is acceptable, and the Cisco record uses the same convention.

### micron — verified, no changes

- 10-Q cover: Delaware, and 8000 S. Federal Way, Boise.
- CMBU definition: memory for large hyperscale cloud customers, and HBM for all data center customers.
- 10-K: DRAM, NAND and NOR. It says cloud servers for AI require "significantly increasing quantities of DRAM, including HBM, and NAND". It also reports 2025 volume production of LPDDR5 in the SOCAMM form factor for servers.
- Company page: "We began in 1978".
- Product pages:
  - HBM: HBM4 and HBM3E, "3D-stacked DRAM".
  - SOCAMM2: LPDDR5X in a data-center-class CAMM module, for AI data centers.
  - Data center SSDs: NVMe and SATA; the 9650 and 6600 ION lines.
- Micron's FY2026 10-K was not yet on EDGAR on 2026-09-29, so the latest 10-Q is the correct cover source.

### marvell — changed

- **notable_facts[0] and eligibility.source_ids:** added a new source, `mrvl-group-10k-fy2021`, the Marvell Technology Group Ltd. Form 10-K for FY ended 2021-01-30, filed 2021-03-16.
  - Reason: the cited 8-K12B describes a "Bermuda Merger" but never states that Marvell Technology Group Ltd. was incorporated in Bermuda.
  - The old parent's 10-K cover gives "Bermuda" as its jurisdiction and Hamilton, Bermuda as its principal executive offices, and its text says "We currently are incorporated in Bermuda".
  - The 8-K12B does confirm the rest: on 2021-04-20 the old parent became a wholly owned subsidiary of Marvell Technology, Inc. (Delaware), Inphi was acquired, and MTI became the successor issuer.
- **products.teralynx.access:**
  - Before: "used in switch systems built by customers"
  - After: "for use in fixed or modular switch systems"
  - Reason: the product page says "for use in fixed switch systems" and "fixed and modular switch systems". It does not say who builds the systems.
- **Verified:**
  - Cover page: Delaware, and 1000 N. West Street, Suite 1200, Wilmington, DE.
  - The 10-K says "corporate headquarters is 1000 N. West Street … Wilmington, Delaware".
  - The IR page lists the company contact at 5488 Marvell Lane, Santa Clara, and the offices page lists the Santa Clara office.
  - Celestial AI (2026-02-02) and XConn (2026-02-10), per the 10-Q.
  - All four product pages: custom ASIC and custom HBM compute architecture; PAM4 DSPs, including Spica, Nova and Ara, with Ethernet and, on select products, InfiniBand; and Photonic Fabric "gained through the acquisition of Celestial AI", with in-network memory.
- The 8-K of 2026-03-31, Item 5.03, is a preferred-stock designation for an NVIDIA investment. It is not a domicile change and was not added, because it is a funding matter.

### cisco — changed

- **summary:**
  - Before: "Cisco AI Defense for securing AI applications and agents"
  - After: "… securing AI applications and models"
- **products.ai-defense.access:**
  - Before: "Security product for AI applications and agents … red-teams AI applications …"
  - After: "Security product for AI applications and models … red-teams AI models …"
- Reason for both changes:
  - The AI Defense page describes discovering AI workloads, applications, models, data and users, and algorithmically assessing models. It mentions agents only in passing, in the Explorer Edition line "AI red teaming for your models and agents".
  - The 10-K's description of AI Defense does not mention agents.
- **Verified:**
  - The 10-K cover: Delaware, and 170 West Tasman Drive, San Jose.
  - The 10-K text: "incorporated in California in 1984 and reincorporated in Delaware in 2021", and "Our headquarters are in San Jose".
  - The Silicon One page: routing and switching, AI scale-out and scale-across networks, and hyperscalers, service providers and enterprises.
  - The Secure AI Factory page: a modular reference design; AI PODs; NVIDIA-based servers; Silicon One or Spectrum-X switching; AI Defense, Hybrid Mesh Firewall and Splunk Observability; CVD-backed PODs or build-your-own.
  - The Foundation-Sec-8B card: Foundation AI at Cisco; continued pretraining of Llama-3.1-8B; Apache 2.0; release date April 28, 2025.

### dell-technologies — verified, no changes

- 10-Q cover: Texas, and One Dell Way, Round Rock.
- Note 1: incorporated in Delaware in January 2013, then converted to Texas effective 2026-07-01 after shareholder approval. Consistent with the 8-Ks filed 2026-07-01 and 2026-07-06 (Items 3.03 and 5.03).
- 10-K: ISG and CSG segments, with AI-optimized servers as an ISG product category.
- Timeline page: PC's Limited, 1984.
- AI Factory page: a framework spanning on-premises, edge and cloud, with NVIDIA and AMD-based options.
- PowerEdge AI page: XE series; NVIDIA, AMD and Intel Gaudi 3; air and direct liquid cooling.
- AI Data Platform page: PowerScale and ObjectScale, plus the orchestration, transformation, analytics, processing and search engines.
- The "validated designs" wording in the AI Factory access text rests on the page's "pre-tested solution" language. This is acceptable, but an editor could soften it.

### hpe — verified, no changes

- 10-Q cover: Delaware, and 1701 East Mossy Oaks Road, Spring, TX.
- 10-Q: the segment realignment effective 2025-11-01.
- 10-K and release: Juniper completed 2025-07-02.
- Product pages:
  - Private Cloud AI: turnkey private AI infrastructure; build, run and govern AI agents; model and tool freedom; listed under HPE AI Factory solutions.
  - AI Factory page: three paths — Private Cloud AI, Sovereign AI Factory, and AI Factory at-scale.
  - Cray page: GX5000 and EX4000, converged HPC/AI, and direct liquid cooling.

### supermicro — changed

- **legal_form:**
  - Before: "Delaware corporation"
  - After: "Delaware corporation (incorporated in California in 1993 and reincorporated in Delaware in 2007)"
  - Source: FY2026 10-K, "We were incorporated in California in September 1993 and subsequently reincorporated in Delaware in March 2007".
- **founded.source_ids:** added `smci-10k-fy2026` alongside the about page. The 10-K says "We were founded and maintain our worldwide headquarters in San Jose".
- **Verified:**
  - Cover: Delaware, and 980 Rock Avenue, San Jose.
  - Rack-scale solutions for AI and HPC, and DCBBS as "complete, modular AI infrastructure from validated components" (10-K).
  - About page: founded 1993 in San Jose.
  - GPU, NVIDIA AI factory and DCBBS pages.
- **Note for editors:** EDGAR's company metadata still shows the state of incorporation as "CA". The 10-K cover says Delaware, and the record follows the filing. The 8-K of 2026-06-15, Item 5.03, is a preferred-stock certificate of designations, not a reincorporation.

### spacex — changed

- **openness_summary.source_ids:** added a new source, `hf-xai-org` (https://huggingface.co/xai-org).
  - Reason: the summary says xAI published Grok-1 and Grok 2 weights, but it cited only the 10-Q, which does not support that.
  - The Hugging Face org page and API list `xai-org/grok-1`, tagged apache-2.0, and `xai-org/grok-2`.
- **Verified:**
  - All acquisition, IPO and domicile claims (see the table above).
  - The three segments, with the AI segment covering Grok, AI solutions, X and AI compute infrastructure (10-Q Note 1).
  - The Q2 release: "Founded in 2002". It also says SpaceX entered Cloud Services Agreements to provide customers with access to compute capacity and continued the Colossus II build-out. The record correctly leaves out the GW and dollar figures.
  - Filing dates: 10-Q and release 2026-08-04; 8-K 2026-08-14.

### cloudflare — changed

- **sources.cf-10q-2026q2.published_at:**
  - Before: null
  - After: 2026-08-06
  - Source: EDGAR filing date, from the submissions JSON; accession 0001477333-26-000054.
- **Verified:**
  - Cover pages: Delaware, and 101 Townsend Street, San Francisco (10-K and 10-Q).
  - 10-K: "incorporated in the state of Delaware in July 2009".
  - Workers AI and AI Gateway are described in the 10-K.
  - Replicate acquisition (see the table above).
  - The release boilerplate calls Cloudflare "the leading connectivity cloud company". The record's neutral "describes itself as a connectivity cloud company" is fine.
  - Workers AI docs: serverless GPUs; open-source models via Workers, Pages or the API; Free and Paid plans; usage-based pricing.
  - AI Gateway docs: the providers listed include Workers AI, OpenAI, Anthropic, Google and Replicate; analytics, logging, caching, rate limiting, retries and fallback; available on all plans.
  - Replicate homepage: run, fine-tune and deploy; Cog; billed for the time code runs.
- `founded: 2009` is the incorporation year, which the researcher already flagged.

### servicenow — verified, no changes

- 10-K cover: Delaware, and 2225 Lawson Lane, Santa Clara. The Q2 2026 10-Q cover, filed 2026-07-23, is unchanged.
- 10-K: Now Assist customers can use ServiceNow's language models or integrate third-party or proprietary models. The 10-K also covers the Moveworks acquisition (consummated 2025-12-15) and describes AI Control Tower as a dashboard.
- April 9, 2026 release: AI "included by default", "model agnostic by design", and a Santa Clara dateline.
- May 5, 2026 release: AI Control Tower discovery, observability, governance and spend.
- Apriel and Fast-LLM:
  - The Apriel-1.6 card: SLAM lab, MIT, and "Training stack: Fast-LLM, VERL".
  - The Hugging Face API shows every ServiceNow-AI Apriel repository tagged `license:mit`.
  - The Fast-LLM repository is Apache 2.0.
- StarCoder2:
  - The arXiv PDF, read in full, says "BigCode is stewarded by ServiceNow and Hugging Face" and mentions the BigCode OpenRAIL-M license.
  - The Hugging Face blog says the 3B model was trained by ServiceNow.
  - The starcoder2-15b card license is `bigcode-openrail-m`.
- **Minor, not changed:** `now-10k-2025.published_at` is 2026-01-28, which matches the signature date on the document. EDGAR's official filing date is 2026-01-29; the filing was accepted 2026-01-29 00:16 UTC, which is the evening of Jan 28 Eastern time. Either date is defensible, so it was left as is.

### linkedin — changed

- **headquarters.source_ids and eligibility:** added a new source, `li-careers-sunnyvale-hq` (https://careers.linkedin.com/Locations/SunnyvaleHQ1). The eligibility explanation now says LinkedIn's careers site describes its global headquarters campus as being in Sunnyvale.
  - Reason: the existing HQ sources, the legal mailing-address page and the pressroom's list of U.S. offices, never use the word "headquarters".
  - The careers page says "our global HQ campus in Sunnyvale, California" and lists 1000 W Maude among the campus addresses.
  - LinkedIn files no SEC reports of its own, so no filing-based HQ is available.
  - The page also gives an employee count, which was not used.
- **Verified:**
  - Microsoft's FY2026 10-K lists LinkedIn, with Talent, Marketing, Premium and Sales Solutions, in the Productivity and Business Processes segment.
  - Exhibit 21 lists LinkedIn Corporation (United States) and LinkedIn Ireland Unlimited Company.
  - The acquisition closed on Dec 8, 2016 (pressroom post).
  - Mailing address: 1000 W. Maude Ave, Sunnyvale.
  - Privacy policy, effective Nov 3, 2025: LinkedIn Ireland is the controller for the Designated Countries.
  - Liger-Kernel: the LICENSE is BSD 2-Clause, © 2024 LinkedIn Corporation. The Dec 5, 2024 LinkedIn Engineering blog confirms the use of FlashAttention, Liger-Kernel and Flyte on Kubernetes.

### xai — verified (scope: parent and status_note consistency with spacex), no changes

See the xai note in the Summary. The parent fields, status note and summary all agree with the SpaceX 10-Q and with the spacex record.

- **Out of scope, flagged for the xai owner:** EDGAR metadata gives X.AI Holdings Corp.'s state of incorporation as NV, while the record's `legal_form` is null. The Hugging Face API returns no license in `cardData` for xai-org/grok-2; the xai record relies on the LICENSE file itself.

### qualcomm-ai-hub-models — verified, no changes

- **License.** The LICENSE text is standard BSD-3-Clause, © 2025 Qualcomm Technologies, Inc. and/or its subsidiaries. PyPI's license expression is BSD-3-Clause. The PyPI author field is "Qualcomm® Technologies, Inc".
- **README.** It confirms:
  - export: compile, quantize where applicable, profile, and run on cloud-hosted devices, comparing results with PyTorch;
  - demos for most models, which can also run locally via PyTorch;
  - Python apps, plus the ai-hub-apps repository;
  - Qualcomm ID and API-token setup;
  - the qai-hub-models CLI;
  - the runtimes table: QAIRT on Android, Linux and Windows; LiteRT on Android and Linux; ONNX on Android, Linux and Windows;
  - YOLO, Llama, Mistral, Phi and Qwen models in the directory.
- **Per-model READMEs.** Qwen3-4B links to Qwen's Hugging Face LICENSE, and YOLOv7 links to WongKinYiu/yolov7 LICENSE.md.
- **Python versions.** PyPI requires Python ≥3.10, <3.14, with classifiers for 3.10 through 3.13.
- **Release v0.63.0:** GitHub shows Sep 23, and it was uploaded to PyPI 2026-09-23.
- **`released_at: "2024-02"`:** consistent with the first PyPI uploads, starting 2024-02-16.
- The README calls its models "state-of-the-art"; the record correctly does not repeat that.

## Could not verify / follow-ups for an editor

- **Founding years that are really incorporation years:** Qualcomm (1985), Cisco (1984) and Cloudflare (2009) use the incorporation year from the 10-K as `founded`. This is a convention, not an error.
- **Relationships not recorded:**
  - Tesla's equity investment in SpaceX, from the Q2 2026 10-Q. It is not control.
  - The 2026 business combinations in ServiceNow's Q2 10-Q, which I did not review.
  - Neither is needed for the current records.
- **Pages that will go stale:** the Tesla Robotaxi city list, and the HPE, Marvell and Qualcomm product pages, which render with JavaScript. Re-check them at the next review.
- No page I needed was inaccessible. All sources were fetched successfully today, in some cases through the Browser pane.
