# Verification log: orgs-a

Batch: **orgs-a**. Checked 2026-09-29 by an independent fact-checker under `research/VERIFIER_BRIEF.md`. The 20 organization records are listed below.

Every cited source was opened today, using WebFetch or `curl -A "USASI-factcheck/0.1"`. `last_reviewed` was not changed on any record. `updated_at` is 2026-09-29 on every record, and was already that value before editing.

After edits, `npx tsx scripts/validate.ts` reports 0 errors and 0 warnings.

## Summary

- **Verified with no changes (4):** adobe, coreweave, google, google-deepmind.
- **Changed (16):** ai2, amazon, amd, anthropic, anyscale, apple, arcee-ai, broadcom, cerebras, databricks, eleutherai, figure, fireworks-ai, groq, hugging-face, ibm. All changes narrow wording, add a supporting official source, or both.
- **Eligibility and publication status:** no record's eligibility status or `publication_status` changed.

### Material status claims (special attention)

- **Anyscale–Nscale.** Pending. The definitive agreement was announced 2026-07-30. Nscale's S-1 (filed 2026-09-18) describes closing as expected at or concurrent with Nscale's IPO. No closing is documented, and the record already says pending.
- **Hugging Face–NVIDIA.** Confirmed from official NVIDIA sources: the blogs.nvidia.com post of 2026-09-03 by Jensen Huang, and NVIDIA's Form 8-K (agreement dated 2026-09-02; closing expected in the first half of 2027, subject to regulatory approvals). The claim is kept, and the status note now records the pending status and expected timing from the 8-K. No Hugging Face-authored announcement was found.
- **Groq–NVIDIA.** The non-exclusive licensing deal is confirmed by Groq's release (2025-12-24) and NVIDIA's FY2026 10-K. Personnel moves were reworded as announced ("would join"), not as completed.
- **Cerebras listing.** Confirmed by the IPO-closing release (trading from 2026-05-14 as CBRS; closing 2026-05-15) and the Q2 2026 10-Q.
- **CoreWeave events.** The March 2025 IPO and the 2025-05-05 Weights & Biases acquisition are confirmed from 10-K notes. The Q2 2026 10-Q shows no 2026 acquisitions.
- **Google DeepMind.** Its relationship to Google/Alphabet is confirmed: the April 2023 announcement by Google's CEO, and the Alphabet FY2024 10-K text on consolidating AI teams into Google DeepMind within Alphabet-level activities.
- **Headquarters.**
  - All public-company HQs match SEC cover pages.
  - Groq's HQ was corrected: the cited source gives only a P.O. box mailing address, so only the country is now recorded.
  - Anthropic's HQ now cites the Transparency Hub's explicit statement.
  - Arcee AI and Fireworks AI HQ cities rest on datelines, notice addresses or news. They are flagged for an editor.

### Method notes

- **SEC access.** sec.gov refuses `curl` with a generic User-Agent ("Undeclared Automated Tool"). No contact email was sent in any request. Filings were read through WebFetch, which truncates long 10-Ks.
  - Where a claim sat in the truncated part, the same filing text was read from the company's own hosted copy: Alphabet annual-report PDFs, IBM, and Adobe's EDGAR PDF.
  - EDGAR XBRL "R" note pages were also used (CoreWeave).
  - Citations still point to the SEC filing.
- **Parallel work.** Records were checked in four parallel groups. Per-record notes for adobe, ai2, amazon, amd, anthropic, apple, arcee-ai, broadcom, databricks, eleutherai, figure, fireworks-ai and ibm come from those checks. The lead verifier reviewed their logs and spot-checked the Anthropic HQ source and the IBM 1911 claim.

## Records

### adobe

Verified — no changes.

- Checked `legal_name`, `legal_form` (Delaware, Nasdaq: ADBE) and `headquarters` against the 10-K cover page for FY2025 (principal executive offices at 345 Park Avenue, San Jose, CA): https://www.sec.gov/Archives/edgar/data/796343/000079634326000003/adbe-20251128.htm
- Checked the eligibility explanation's statement that the corporate headquarters is in San Jose. Item 2 of the 10-K says the corporate headquarters is located in San Jose, California (read from adbe10kfy25unofficialpdf.pdf in the same EDGAR accession).
- The 10-Q for the quarter ended 2026-08-28 (filed 2026-09-22) lists the same San Jose principal executive offices. It shows no HQ move and no acquisition of Adobe; Adobe was the acquirer of Semrush.
- `founded` 1982: the About Adobe page carries the heading "Making history since 1982."
- The summary and the segments (Digital Media and Digital Experience; Photoshop, Acrobat) match the 10-K Item 1.
- The notable fact on Firefly training data is supported. The Firefly page says the models are trained on licensed Adobe Stock content and public domain content, and that Adobe does not train on users' personal or generated content. The 10-K separately says licensed content and public domain assets.
- Products:
  - Firefly app: web, iOS and Android, a free plan and paid plans, and partner models from Google, OpenAI and others, per https://www.adobe.com/products/firefly.html
  - Firefly Services: a set of APIs including the Firefly API, per the developer docs and the 10-K ("available for enterprises").
  - Acrobat AI Assistant: an add-on or included in Acrobat Studio; desktop, web and mobile.
- `hiring_url` resolves to Adobe's careers page.

Could not verify: nothing outstanding.


### ai2

- **notable_facts[0]**
  - Before: "…points users who want hosted API access to Olmo models to third-party providers (OpenRouter, Cirrascale, and Parasail) rather than an Ai2-operated API."
  - After: "…directs users who want hosted API access to Olmo models to OpenRouter and to Ai2's inference providers Cirrascale and Parasail."
  - Reason: the page says "Ai2 models are available on OpenRouter, or directly through our inference providers Cirrascale and Parasail." It does not say that Ai2 operates no API of its own, so the "rather than an Ai2-operated API" clause was an inference. I removed it.
  - Source: https://docs.allenai.org/quick_start/apis/index.html
- `updated_at` was already 2026-09-29, so no change was needed.

Verified, unchanged:
- Summary, `founded` (2014, Paul Allen) and the Seattle non-profit description, per https://allenai.org/about
- Headquarters: the contact page lists 3800 Latona Ave NE, Suite 300, Seattle, WA 98105.
- `legal_name` and `legal_form`, from the IRS EO BMF extract eo_wa.csv. It has EIN 824083177 as "THE ALLEN INSTITUTE FOR ARTIFICIAL INTELLIGENCE", Seattle, with subsection 03, organization code 1 and foundation code 03. The IRS eo-info.pdf decodes those codes as Charitable Organization under 501(c)(3), Corporation, and "Private operating foundation (other)".
- Eligibility explanation.
- Products:
  - Playground: the Olmo 3 blog (2025-11-20) documents the Playground and OlmoTrace, and https://playground.allenai.org returns 200.
  - Asta: the page names it an agentic research assistant for scholarly tasks and covers AstaBench, developer resources and "Sign up" for Asta Preview.
  - Semantic Scholar: the About page describes a free, AI-powered research tool with the S2AG datasets and APIs.
- `openness_summary`: the docs intro says "we provide our training code, training data, our model weights, and our recipes." The record scopes this to "flagship models", which the same page uses for the models the guide covers. That is narrower than the source, so I left it.

Could not verify: nothing outstanding.


### amazon

- **products[amazon-bedrock].access**
  - Before: "…used through an AWS account with pay-as-you-go pricing."
  - After: "…used through an AWS account; pricing depends on the model, provider, and modality."
  - Reason: "pay-as-you-go" does not appear on the cited Bedrock page, nor on the pricing page as fetched. The pricing page says pricing "is dependent on the modality, provider, and model". It also lists Amazon among the model providers, which supports "from Amazon and other providers".
  - Source IDs: `[bedrock-page]` → `[bedrock-page, bedrock-pricing]`.
  - Added source `bedrock-pricing`: https://aws.amazon.com/bedrock/pricing/
- **products[amazon-nova].access**
  - Before: "Amazon's own foundation models (…) and related services such as Nova Act, mainly accessed through Amazon Bedrock."
  - After: "Amazon's own foundation models (…), which AWS documents as accessed through Amazon Bedrock, and related services such as Nova Act."
  - Reason: the cited Nova page never states the Bedrock access path in text; it only links "Try it today" to the Bedrock console. "Mainly" was unsupported. The Nova 2 developer guide states "Amazon Nova models are foundation models that you access through Amazon Bedrock."
  - Source IDs: `[nova-page]` → `[nova-page, nova2-userguide]`.
  - Added source `nova2-userguide`: https://docs.aws.amazon.com/nova/latest/nova2-userguide/what-is-nova-2.html
- `updated_at` was already 2026-09-29.

Verified, unchanged:
- The 10-K (FY ended 2025-12-31; EDGAR filing date 2026-02-06, accepted 2026-02-05 18:44) confirms the following. Source: https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm
  - `legal_name`, and `legal_form` as a Delaware corporation.
  - Headquarters and eligibility: the cover page gives principal executive offices at 410 Terry Avenue North, Seattle, WA 98109-5210.
  - `founded` 1994: "Mr. Bezos founded Amazon.com in 1994".
  - The three segments.
  - Matthew S. Garman listed as "CEO Amazon Web Services".
  - The summary's advertising, retail and cloud description.
- The Nova notable fact (Alexa+, Amazon Ads, Amazon Stores) matches the Nova page.
- `openness_summary`: the Nova page has no mention of open weights.

Could not verify: nothing outstanding. The 10-K Item 2 (Properties) could not be read because WebFetch truncates it; the cover page is sufficient for the HQ claim.


### amd

- **notable_facts[0]**
  - Before: "AMD acquired ZT Systems in March 2025, keeping its design operations, and sold…"
  - After: "AMD acquired ZT Systems in March 2025, retaining certain intellectual property and employees associated with its design operations, and sold…"
  - Reason: the 10-K says AMD "retained certain intellectual property and employees associated with the design operations". "Keeping its design operations" overstated this slightly.
  - Source: https://www.sec.gov/Archives/edgar/data/2488/000000248826000018/amd-20251227.htm
- `updated_at` was already 2026-09-29.

Verified, unchanged:
- The 10-K (filed 2026-02-04) confirms:
  - `legal_name` and `legal_form`: "AMD was incorporated under the laws of Delaware on May 1, 1969".
  - `founded` 1969.
  - The summary's products: EPYC, Instinct, adaptive SoCs and FPGAs, Pensando networking, ROCm.
  - The Sanmina sale in October 2025.
- The 10-Q for the quarter ended 2026-06-27 (filed 2026-08-05) confirms the headquarters and eligibility: principal executive offices at 2485 Augustine Drive, Santa Clara, CA 95054, with no relocation mentioned. Source: https://www.sec.gov/Archives/edgar/data/2488/000000248826000123/amd-20260627.htm
- Instinct product: the page names the MI400, MI350 and MI300 series (and also MI200), ROCm, OEM partners, the Helios rackscale solution and cloud service providers.
- ROCm product: the page says "ROCm is an open software stack that includes programming models, tools, compilers, libraries, and runtimes for AI and HPC solution development on AMD GPUs". Its FAQ lists PyTorch, TensorFlow and JAX.
- `openness_summary` is supported.

Could not verify: nothing outstanding.


### anthropic

Changes:
- `summary.text`: "through the Claude Developer Platform API" → "through the Claude Platform API". The cited docs page (title "Documentation - Claude Platform Docs") and the site navigation call it "Claude Platform". The string "Claude Developer Platform" does not appear on any cited page. Source: https://platform.claude.com/docs/en/home
- `products[claude-developer-platform].name`: "Claude Developer Platform (Claude API)" → "Claude Platform (Claude API)". Same reason and source. The product id is unchanged.
- `products[claude-apps].source_ids`: added `claude-pricing`. The overview page lists Pro, Max, Team, and Enterprise but never mentions a free plan. The pricing page lists "Free" ("$0 / Free for everyone") plus Pro, Max, and Team & Enterprise. New source: https://claude.com/pricing (published_at null).
- `headquarters.source_ids`: [anthropic-privacy] → [anthropic-transparency, anthropic-privacy]. The privacy policy only gives a "registered address" (548 Market St, PMB 90375, San Francisco) and says "headquartered in the United States", and that sentence is in its Brazil supplement. The Transparency Hub says Anthropic "is a public benefit corporation (PBC) headquartered in San Francisco, California". New source: https://www.anthropic.com/transparency/voluntary-commitments (published_at 2026-07-23, from the page's "Last updated July 23, 2026").
- `eligibility.explanation` / `source_ids`: added the Transparency Hub HQ statement and the `anthropic-transparency` source. The rest of the text is unchanged and supported by the privacy policy.
- `openness_summary.text`: "offers its Claude models only as hosted services" → "offers its Claude models as hosted services". No cited source supports the absolute "only". The next sentence already records the absence of public weights in the catalog's own voice.

Verified as written: legal_name "Anthropic PBC" (privacy policy; the consumer terms say "Anthropic, PBC"). legal_form "Delaware public benefit corporation" (LTBT post: "Anthropic is a Delaware Public Benefit Corporation"; company page). Dublin other_location (privacy policy gives Anthropic Ireland, Limited's registered address in Dublin 4). LTBT notable fact (Class T stock; the Trust elects and removes board members; the company page says the board is elected by stockholders and the LTBT; LTBT post dated Sep 19, 2023). Claude apps on web, desktop, and mobile. Claude API access: Console, API keys, and availability on Amazon Bedrock, Google Cloud, and Microsoft Foundry. Claude Code surfaces: terminal, VS Code/JetBrains, desktop, web, iOS/Android, Slack. Claude Code billing: FAQ says access is via a Pro/Max, Team/Enterprise plan or a Claude Console account, billed at standard API pricing. HF org shows 0 public models and 14 datasets (HF API confirms). Careers URL works. Privacy policy effective 2026-09-10 and consumer terms effective 2025-10-08 match the published_at values.

Could not verify / editor follow-up:
- Not a fetch failure, just a status item. Anthropic's official post of Jun 1, 2026 (https://www.anthropic.com/news/confidential-draft-s1-sec) says it confidentially submitted a draft Form S-1 for a proposed IPO. I found no evidence of a completed listing as of today, so `ownership_category: privately-held` is still correct. I did not add a `status_note`, since this is a pending event, not a completed change. The editor may want to add one or re-check after any listing.


### anyscale

Changes:
- **products[anyscale-platform].source_ids**
  - Before: `[anyscale-platform]`. After: `[anyscale-platform, anyscale-pricing]`.
  - Reason: the access text says "pay-as-you-go", which does not appear on the platform page. The pricing page says "Anyscale offers you a pay-as-you-go approach" and "Get started with $100 credit".
  - Added source `anyscale-pricing`: https://www.anyscale.com/pricing

Verified, unchanged:
- **Status note (Nscale acquisition).** The wording says pending, and the sources support that.
  - Anyscale's press release of 2026-07-30 says Nscale "has entered into a definitive agreement to acquire" Anyscale, with closing expected in the second half of 2026. It also says Ray "remains open source and community governed".
  - Nscale's Form S-1 was filed 2026-09-18 (read via WebFetch, since SEC blocks curl). It records Nscale Limited as registered in England and Wales, with principal executive offices at 16 New Burlington Place, London. It calls the acquisition pending, subject to customary closing conditions, with "closing expected at the time of or concurrent with this offering". The S-1 dates the definitive agreement July 28, 2026; the public announcement was July 30.
  - A web search and a search restricted to nscale.com, anyscale.com and sec.gov found no announcement that the deal has closed or that the IPO has priced.
- **Headquarters.** The About page reads "San Francisco HQ, 600 Harrison Street, 4th Floor". It lists Anyscale India Pvt Ltd in Bellandur, Bengaluru, and gives "2019: Founding Anyscale". It also says Ray was developed at the UC Berkeley RISELab.
- **Terms.** They name Anyscale, Inc. at 600 Harrison St., San Francisco, and were last updated April 17, 2026.
- **PyTorch Foundation post** (2025-10-22). It names Ray as a foundation-hosted project and says Anyscale contributed it.
- **Ray LICENSE.** Apache License 2.0.
- **Platform page.** Data processing, model training and online inference, deployed on any cloud on Kubernetes or VMs.

Could not verify: nothing outstanding. Re-check the status once Nscale's IPO prices or the deal closes. After closing, Anyscale would have a UK-registered parent, and eligibility must be reassessed.


### apple

Changes:
- `products[apple-intelligence].access`: "Most features run on-device, with server-based models on Private Cloud Compute for more complex requests. Some features are not initially available in the EU." → "Uses on-device processing and can draw on larger server-based models through Private Cloud Compute. Siri AI is not initially available in the EU on iOS, iPadOS, and watchOS."
  - The page never says "most features" or "more complex requests". It says Apple Intelligence uses on-device processing and "can draw on larger server-based models" via Private Cloud Compute.
  - The EU footnote applies only to Siri AI on iOS, iPadOS, and watchOS.
  - Source: https://www.apple.com/apple-intelligence/

Verified as written:
- Form 10-K cover page, via WebFetch: registrant "Apple Inc.", incorporated in California, principal executive offices at One Apple Park Way, Cupertino, California 95014, fiscal year ended September 27, 2025. The EDGAR filing index shows a filing date of Oct 31, 2025, which matches published_at.
- The Item 1 business description supports the summary's first sentence.
- Apple Intelligence device list includes iPhone, iPad, Mac, and Apple Vision Pro models.
- Foundation Models docs JSON: abstract says "language understanding, structured output, and tool calling"; platforms iOS/iPadOS/macOS/visionOS 26.0 and watchOS 27.0; gives access to the on-device and Private Cloud Compute models.
- MLX README says "brought to you by Apple machine learning research". The LICENSE file is the MIT License, © 2023 Apple Inc.

Could not verify / editor follow-up:
- SEC EDGAR returned 403 to curl with the generic UA. I read the 10-K and its filing index through WebFetch instead, and they confirm the claims.


### arcee-ai

Changes:
- `products[arcee-platform].access`: "alongside open-weight models from other developers" → "alongside models from other developers". The pricing page lists third-party models (DeepSeek, Z.ai, Moonshot, Thinking Machines) but does not say they are open-weight. The Quick Start only says "open models", and I did not check each model's weights. Source: https://docs.arcee.ai/get-started/pricing
- `openness_summary.text`: "Trinity releases were announced under Apache 2.0" → "Trinity Nano Preview and Trinity Mini were announced under Apache 2.0". The cited manifesto (Dec 1, 2025) says only that Nano Preview and Mini were "released under Apache 2.0". I added "which the Hugging Face model cards now list" after checking the cards.
- `openness_summary.source_ids`: added `trinity-mini-card`, `trinity-large-thinking-card`, and `arcee-pricing`. The pricing source supports "The hosted API is a paid service", which previously cited no pricing source.
  - I read the model cards and LICENSE files directly. Trinity-Mini, Trinity-Large-Thinking, Trinity-Nano-Preview, and Trinity-Large-Preview all have `license: other` with `license_name: openmdw-1.1` and a LICENSE file headed "OpenMDW License Agreement, version 1.1".
  - The HF API shows every arcee-ai Trinity repo (31) tagged `license:other`, last modified 2026-05-28.
  - New sources: https://huggingface.co/arcee-ai/Trinity-Mini and https://huggingface.co/arcee-ai/Trinity-Large-Thinking

Verified as written:
- legal_name "Arcee AI, Inc." (privacy policy says the site is "owned by Arcee AI, Inc."; the terms say the same).
- Summary: Nano is on-device and Large is 400B total / 13B active MoE (Trinity page and arXiv abstract). The hosted endpoint is OpenAI-compatible (Trinity page FAQ; Quick Start uses the OpenAI SDK).
- Eligibility explanation:
  - GlobeNewswire release (WebFetch): dateline "SAN FRANCISCO, Sept. 16, 2026", describes Arcee as "a U.S. artificial intelligence company".
  - About page: "a U.S. model lab".
  - SiliconANGLE: "San Francisco-based Arcee".
  - Terms: Delaware governing law and consent to state and federal courts in Miami, Florida.
- OpenMDW blog (May 29, 2026) moves the whole family, including earlier releases, to OpenMDW-1.1.
- arXiv 2602.17004 (submitted Feb 19, 2026) has a pretraining-data section (data curated by DatologyAI; the mixes are described).
- chat.arcee.ai loads (the page title is "Arcee Platform"). The Trinity page links "Try in Chat" and "Chat for Free" to it.
- Quick Start URL returns a 307 to https://docs.arcee.ai/, which serves the Quick Start page. The canonical path in llms.txt is /get-started/quick-start, so I left the URL.
- Careers URL works.

Could not verify / editor follow-up:
- The GlobeNewswire release failed with curl (no response). I read it through WebFetch, which returned the dateline and description quoted above.
- HQ city: no official Arcee page states a headquarters address. San Francisco rests on the press-release dateline plus SiliconANGLE (news). The terms set venue in Miami, Florida. U.S. eligibility is not affected, but the editor may want an official HQ statement.
- Inconsistency on Arcee's own site: the About page (https://www.arcee.ai/about) still says the Trinity family "is released under Apache-2.0", while the model cards and LICENSE files say OpenMDW-1.1. The record follows the model cards and the May 2026 blog.


**Lead verifier note.** The San Francisco label rests on a press-release dateline and SiliconANGLE's "San Francisco-based" (kind: news). The site terms set venue in Miami, Florida. It was left unchanged, but this should be followed up with an official statement.


### broadcom

Changes:
- `products[tomahawk-6].access`: "purchased through Broadcom's sales contact" → "the product page directs inquiries to Broadcom's Contact Sales page". The page's only call to action is "Contact Sales" (/company/contact/sales). It says nothing about how the product is purchased. Source: https://www.broadcom.com/products/ethernet-connectivity/switching/strataxgs/bcm78910-series (the HTML is JS-rendered, so I read the content through Broadcom's page JSON at /api/getjson?url=products/...bcm78910-series).
- `products[vmware-private-ai-foundation].access`: removed "customer-operated", and changed "GPU-enabled Kubernetes clusters, and model serving" → "GPU-accelerated Kubernetes clusters, and Private AI Services for delivering generative AI applications in a model-as-a-service way". The docs say the solution runs "on systems with NVIDIA GPU devices" without saying who operates them. They describe VKS clusters "accelerated with NVIDIA GPUs" and Private AI Services "in a model-as-a-service way". Source: https://techdocs.broadcom.com/us/en/vmware-cis/private-ai/foundation-with-nvidia/9-1.html

Verified as written:
- 10-Q for the quarter ended Aug 2, 2026 (WebFetch): "Broadcom Inc.", Delaware, 3421 Hillview Ave, Palo Alto, CA 94304. The index shows a filing date of Sep 10, 2026, which matches.
- 10-K for FY ended Nov 2, 2025 (WebFetch): cover page is consistent. Item 1 lists "custom accelerators or XPUs, Ethernet switching and routing silicon, Ethernet NICs ... optical components, as well as racks and systems based on our XPUs" and describes VMware Cloud Foundation. The index shows a filing date of Dec 18, 2025, which matches.
- 8-K12B (WebFetch): Introductory Note describes the plan "to cause the publicly traded parent company of the Broadcom group to be a Delaware corporation". The High Court of Singapore approved the scheme of arrangement on Apr 2, 2018. Broadcom-Singapore became a subsidiary of Broadcom-Delaware, and Broadcom-Delaware is the successor issuer. The index shows a filing date of Apr 4, 2018, which matches. The notable fact and eligibility text are supported.
- Tomahawk 6 page: "Highly optimized for scale-up and scale-out AI networks used for training and inference". Applications include "Data center fixed and chassis/modular switches".

Could not verify / editor follow-up:
- SEC EDGAR returned 403 to curl with the generic UA. I read all three filings and their indexes through WebFetch, and they confirm the claims.
- The Tomahawk 6 HTML page is client-rendered, so WebFetch saw only the title. I verified the content from the page meta description and Broadcom's own page-JSON endpoint for the same URL.


### cerebras

Changes:
- **products[cs-4].access**
  - Before: "Rack-scale system built on WSE-3 Turbo processors for on-premises deployment, with a modular rack design intended for installation in hyperscale data centers."
  - After: "Rack-scale inference system with three WSE-3 Turbo processors per system, built on a modular rack design intended for deployment in hyperscale data centers."
  - Reason: the CS-4 page never says "on-premises". It says "Three WSE-3 Turbos per System", "a modular rack design", and "rapid deployment in hyperscale datacenters", and it presents the CS-4 as an inference system.
  - Source: https://www.cerebras.ai/cs4

Verified, unchanged:
- **Form 10-Q** (quarter ended 2026-06-30, via WebFetch):
  - Cerebras Systems Inc., Delaware, "incorporated in Delaware in April 2016".
  - Principal executive offices at 1237 E. Arques Avenue, Sunnyvale, CA 94085.
  - Class A stock trades as CBRS on Nasdaq.
  - It describes the WSE as a chip spanning an entire wafer, and systems for "our, and our customers' data centers".
- **IPO status.** The IPO closing release (Sunnyvale, 2026-05-15) says trading began on the Nasdaq Global Select Market on May 14, 2026 as CBRS, and the IPO closed May 15.
- **Inference docs.** An API key comes from cloud.cerebras.ai. There are Python and Node.js SDKs, and the API is "mostly compatible with OpenAI's client libraries".
- **Training Cloud page.** It offers training and fine-tuning, pay-per-hour, and a pay-per-model service in which Cerebras experts design and train a model.

Could not verify: nothing outstanding.


### coreweave

Verified — no changes.
- **Form 10-Q** (quarter ended 2026-06-30, via WebFetch):
  - CoreWeave, Inc., Delaware, principal executive offices at 290 W Mt. Pleasant Ave., Suite 4100, Livingston, NJ 07039.
  - Listed on Nasdaq as CRWV.
  - The Business Combinations note (R10) lists no 2026 acquisitions.
  - Subsequent events (R22) are financing items only.
- **Form 10-K** for FY2025 (read via EDGAR's R9 and R12 pages, because WebFetch truncates the main document):
  - "Originally formed as a Delaware limited liability company in 2017 … converted to a Delaware corporation in 2018 … headquartered in Livingston, New Jersey".
  - "In March 2025, the Company completed its initial public offering".
  - "On May 5, 2025, the Company acquired all of the outstanding equity interests of Weights and Biases, Inc."
  - The platform description covers GPU infrastructure, CKS managed Kubernetes, storage and networking.
- **Product pages.**
  - The GPU compute page lists Blackwell, Hopper and Ada Lovelace, with A100 (Ampere) among its accelerators, all on bare metal.
  - The docs name "reserved, on-demand, and spot plans".
  - The CKS page says managed Kubernetes on bare-metal nodes, pre-configured with GPU drivers, storage and network interfaces, Slurm-on-Kubernetes and observability plug-ins.
  - The Weights & Biases site lists Models, Weave, Inference, and "SaaS | Dedicated | Customer-managed" deployments.
- **Other events.** A web search turned up no pending 2026 acquisition or HQ change. The July 2025 Core Scientific deal is not mentioned in the record, and none was added.

Could not verify: nothing outstanding.


### databricks

- `products[data-ai-platform].access`: "Commercial lakehouse platform for data engineering, analytics, and AI, offered as a managed service on AWS, Azure, and Google Cloud." → "Commercial platform for data engineering, analytics, and AI built around a lakehouse architecture; Databricks lists it as available on AWS, Azure, and Google Cloud." Reason: the cited platform page does not use the words "managed service". It does name data engineering, analytics, AI, lakehouse and "Databricks on AWS, Azure and GCP". Source: https://www.databricks.com/product/data-intelligence-platform
- Verified with no change needed:
  - HQ San Francisco ("Headquartered in San Francisco"; 160 Spear St) and founded 2013, from the About page.
  - The creators-of-lakehouse/Spark/Delta Lake/MLflow/Unity Catalog statement, from the About page.
  - Agent Bricks: build, evaluate, govern, deploy, grounded in enterprise data.
  - FMAPI docs: "open models … hosted by Databricks"; pay-per-token and provisioned-throughput modes.
  - DBRX retirement dates: 2025-04-30 for pay-per-token and fine-tuning; 2025-12-19 for provisioned throughput.
  - The DBRX blog is dated 2024-03-27 and says both weights are on Hugging Face.
  - The Open Model License takes effect 2024-03-27 and covers DBRX.
  - The HF org lists 0 models (confirmed via the HF API) and 3 datasets, including databricks-dolly-15k.
  - The careers URL resolves.
  - The DBRX artifact records are `archived`.
  - A web search indicates Databricks is still private, with no IPO (not a cited claim).


### eleutherai

- `legal_name.text`: 'EleutherAI Institute (listed by the IRS as "Eleutherai Institute")' → 'EleutherAI Institute (listed in the IRS exempt-organization extract as "ELEUTHERAI INSTITUTE")'. Reason: the cited IRS extract uses all-caps "ELEUTHERAI INSTITUTE". The mixed-case form is ProPublica's rendering. Source: https://www.irs.gov/pub/irs-soi/eo_dc.csv
- Verified with no change needed:
  - IRS eo_dc.csv row, EIN 922215190: ELEUTHERAI INSTITUTE, 839 Kennedy St NW, Washington DC. Subsection 03 = 501(c)(3). Ruling 202311. Foundation code 15 = 170(b)(1)(A)(vi). Organization code 1 = Corporation. Codes checked against eo-info.pdf.
  - About page: non-profit AI research lab; began July 2020 as a Discord server; incorporated as a non-profit research institute in early 2023; "operates primarily through our public Discord server"; lists Common Pile, GPT-NeoX, and Pythia with checkpoints and data order; gives no location.
  - Year-two preface (2023-03-02): "forming a non-profit research institute … funded by a mix of charitable donations and grants".
  - ProPublica's FY2024 Executive Director matches the Executive Director on the eleuther.ai/staff page.
  - The lm-evaluation-harness artifact exists.


### figure

- `summary.source_ids`: added `figure-03-bmw`. Reason: "current robot generation is Figure 03" is supported by the June 2026 page ("our latest generation robot - Figure 03"). The Oct 2025 launch post alone does not show it is still current. Source: https://www.figure.ai/news/f-03-at-bmw
- `products[figure-03].access`: "…; Figure reports Figure 03 units working at a BMW plant." → "…; in June 2026 Figure described a demonstration of Figure 03 performing a logistics workflow at a BMW plant." Reason: the page describes "The first demonstration of Figure 03 performing a logistics workflow" at one plant. It does not report multiple units in ongoing work. Source: https://www.figure.ai/news/f-03-at-bmw
- `notable_facts[0]`: "…Figure 03 robots were doing logistics sequencing work at BMW Group Plant Spartanburg, succeeding Figure 02 there." → "…Figure 03 had arrived at BMW Group Plant Spartanburg, following Figure 02's 2025 deployment at BMW, and described a demonstration of Figure 03 performing a logistics sequencing workflow." Reason: the page supports neither the plural ongoing work nor a replacement of Figure 02. It says Figure 03 "arrived in Hall 52" following Figure 02's 2025 deployment, and calls the work a first demonstration. Source: same.
- `openness_summary`: "Figure calls its Index robot-training dataset Figure-exclusive." → "Figure describes Index, its app-based pipeline for collecting robot-training data, as a Figure-exclusive system." Reason: the page applies "Figure-exclusive" to the pipeline/system, not to the dataset as such. Source: https://www.figure.ai/news/introducing-index
- Verified with no change needed:
  - Careers page: "our headquarters in San Jose, CA".
  - Privacy policy address: 3960 N First St, San Jose CA 95134.
  - Terms: "Figure AI Inc." and California law.
  - Company page: "general purpose humanoid".
  - Figure 03 post (2025-10-09): "3rd generation"; home and commercial; no price or availability date.
  - Helix post (2025-02-20): VLA model running onboard embedded GPUs; no release of weights or code.
  - Helix 02 (2026-01-27) and Helix 2.5 (2026-09-17): no release of weights or code.


### fireworks-ai

- `eligibility.explanation`: "terms of service … give its notice address in San Mateo" → "give its DMCA notice address in San Mateo". Reason: the ToS address (900 Concar Drive, Floor 5, San Mateo, CA 94402) appears only under §19.5 "DMCA Notice". It is not a general notices address. Source: https://fireworks.ai/terms-of-service (308 redirect to a PDF on cdn.sanity.io; read via curl)
- Verified with no change needed:
  - ToS: "Last Updated: July 10, 2026"; entity "Fireworks.ai, Inc.".
  - The press release is datelined "SAN MATEO, CA, July 16, 2026 (EZ Newswire)".
  - Careers board (Ashby API linked from the careers page): 59 of 86 postings list San Mateo as primary location, which supports "most roles".
  - Inference page: per-token serverless; OpenAI- and Anthropic-compatible; On-Demand dedicated deployments; Reserved Capacity.
  - Training page: Training API, managed training, SFT, preference optimization (DPO/ORPO), RL; launched from UI, firectl, or API.
  - Team page: co-founders previously worked on PyTorch and other Meta infrastructure, and one led Google Vertex AI.
  - Ember-1 post (2026-09-23): "Fireworks' own model", "Built on Kimi K3", "Research Preview release on Serverless"; no mention of weights.
- Could not verify:
  - No official Fireworks page explicitly uses the word "headquarters". The San Mateo HQ is inferred from the DMCA address, the press-release dateline, and where careers postings are concentrated. Search results show third-party mentions of Redwood City. The CNBC article (July 2026) returned 403. An editor may want an explicit HQ statement.


**Lead verifier note.** The label was left as San Mateo. Unlike Groq's P.O. box, the San Mateo address is a street office address, and the dateline and job postings agree with it. Still, no official page uses the word "headquarters", so treat this as an open editorial item.


### google

Verified — no changes.
- **Method.** WebFetch truncates the fiscal 2025 Form 10-K on sec.gov after about a third of the document. It confirmed the cover page, but the full text was read from Alphabet's own 2025 Annual Report PDF, which contains the same 10-K: https://s206.q4cdn.com/479360582/files/doc_financials/2025/Alphabet-GOOG-_AR_2025_WO2_TRD_WR.pdf. Citations still point to the SEC filing.
- **Cover page.** Alphabet Inc., Delaware; 1600 Amphitheatre Parkway, Mountain View, CA 94043; Class A (GOOGL) and Class C (GOOG) on the "Nasdaq Global Select Market".
- **Item 1.** "Alphabet is a collection of businesses — the largest of which is Google". It reports the Google Services and Google Cloud segments, and says centralized AI research and frontier-model development is "reported in Alphabet-level activities".
- **Accelerators.** Customers can use GPUs and TPUs, "such as Ironwood, our seventh-generation TPU".
- **Note 1.** "Google was incorporated in California in September 1998 … In 2015, we implemented a holding company reorganization, and as a result, Alphabet Inc. … became the successor issuer to Google".
- **Exhibit 21.01.** Lists Google LLC as a Delaware subsidiary.
- **Products.**
  - Gemini API docs: API keys come from Google AI Studio; code samples are in Python, JavaScript, Java, Go and REST; the API covers Gemini, Veo and other models.
  - Gemini Enterprise Agent Platform page: "(formerly Vertex AI)". Model Garden offers Gemini, third-party models and "open models like Gemma".
  - Gemini app page: free and paid Google AI plans with higher usage limits. Its download link targets Android and iOS.
- **Gemma 4 model card.** Authors: Google DeepMind; License: Apache 2.0.
- **Careers URL.** Resolves.

Could not verify: nothing outstanding. Minor note: the Gemini app about page shows Android/iOS availability only through its mobile download link, not in body text.


### google-deepmind

Verified — no changes.
- **Relationship to Google/Alphabet.**
  - Sundar Pichai's post (2023-04-20) says Google DeepMind brings together "the Brain team from Google Research, and DeepMind" as a group within Google, led by Demis Hassabis.
  - The Google DeepMind announcement post agrees.
  - The fiscal 2024 Alphabet 10-K text, read from Alphabet's 2024 annual report PDF (https://s206.q4cdn.com/479360582/files/doc_downloads/annualreport2024-web.pdf) because the SEC HTML truncates, says: "As announced in April 2024, we consolidated teams that focus on building general AI models across Google Research and Google DeepMind … reported within Alphabet-level activities … in October 2024, the Gemini app team … joined Google DeepMind." The notable fact matches.
  - The fiscal 2025 10-K does not mention Google DeepMind by name. It still reports centralized AI research and development as Alphabet-level activities.
  - The `research-unit` relationship to `google` and the `us-control` basis are supported.
- **About page.** DeepMind was founded in 2010, and Google Brain started in 2011 at X; the two combined under CEO Demis Hassabis. No headquarters is named.
- **Careers page.** Lists exactly London, Bay Area, Bangalore, Cambridge (US), Montreal, New York City, Paris, Tokyo, Toronto and Zurich, with no headquarters.
- **Gemma 4.** The card says "Gemma is a family of open models built by Google DeepMind" and gives License: Apache 2.0.

Could not verify: nothing outstanding. The `gemma-4-license` URL (https://ai.google.dev/gemma/docs/gemma_4_license) redirects on the same host to https://ai.google.dev/gemma/apache_2, which shows the Apache License 2.0 text. It was left as is; an editor may prefer the final URL.


### groq

Changes:
- **headquarters**
  - Before: label "Mountain View, California", source_ids `[groq-privacy-policy]`.
  - After: label "United States (city not stated; legal mailing address is a P.O. box in Mountain View, California)", source_ids `[groq-650m-2026-06, groq-privacy-policy]`.
  - Reason: the privacy policy does not "list its U.S. headquarters in Mountain View". It names Groq LLC and gives "Groq LLC, P.O. Box 1778, Mountain View, CA 94042" as a contact and mailing address. The website terms use the same P.O. box. The policy states "Groq is located in the United States", and the June 2026 release says "An independent, U.S.-based company" under a San Francisco dateline.
  - Third-party directories variously list Mountain View and San Jose; these were not used.
  - No official page names a headquarters city, so only the country is recorded.
- **eligibility.explanation**
  - Before: "Groq's privacy policy lists its U.S. headquarters in Mountain View, California … the catalog uses the headquarters address the company states."
  - After: it now says what the sources actually show — U.S.-based per the June 2026 release, located in the United States per the privacy policy, Groq LLC with a Mountain View P.O. box, San Francisco datelines — and states that no headquarters city is named.
  - Eligibility stays `eligible` / `us-headquarters`, because the company documents itself as U.S.-based.
- **status_note**
  - Before: "…founder Jonathan Ross, president Sunny Madra, and other team members joined NVIDIA, while Groq said it would remain an independent company…"
  - After: "…Groq said founder Jonathan Ross, president Sunny Madra, and other team members would join NVIDIA, while Groq would continue as an independent company…"
  - Reason: the December 24, 2025 announcement states these moves as forthcoming ("will transition"). No cited source confirms that they happened.
  - Source: https://groq.com/newsroom/groq-and-nvidia-enter-non-exclusive-inference-technology-licensing-agreement-to-accelerate-ai-inference-at-global-scale

Verified, unchanged:
- **NVIDIA licensing deal.**
  - Groq's release of 2025-12-24 says "entered into a non-exclusive licensing agreement with Nvidia for Groq's inference technology". It says Groq "will continue to operate as an independent company with Simon Edwards stepping into the role of Chief Executive Officer" and that "GroqCloud will continue to operate without interruption".
  - NVIDIA's 10-K for FY2026 (filed 2026-02-25, per the EDGAR index) refers to "an intellectual property license arrangement with Groq, Inc.". Note that this names Groq, Inc., while Groq's current website policies name Groq LLC.
- **June 22, 2026 release.** Adam Winter, CEO; "Founded in 2016, the company pioneered the LPU and launched GroqCloud". Groq partners with data-center operators to deploy inference capacity.
- **August 12, 2026 release.** Groq "has joined the NVIDIA Cloud Partner (NCP) program".
- **Platform page.** Lists GroqMetal, GroqCore and GroqAssured, and links to console.groq.com.
- **Privacy policy.** Effective November 12, 2025.

Could not verify: no official Groq source states a headquarters city. An editor may want to add one if Groq publishes it.


### hugging-face

Changes:
- **status_note (NVIDIA acquisition)**
  - The official NVIDIA source was confirmed and the claim kept, with added precision.
  - The page https://blogs.nvidia.com/blog/nvidia-to-acquire-hugging-face/ returns HTTP 200 from blogs.nvidia.com. It is a post by Jensen Huang dated 2026-09-03 (article:published_time 2026-09-03T11:56:49Z): "NVIDIA has agreed to acquire Hugging Face". It gives no closing date.
  - NVIDIA's Form 8-K (Date of Report September 2, 2026; signed September 3, 2026; Item 8.01) states that "On September 2, 2026, NVIDIA Corporation entered into a definitive agreement to acquire Hugging Face, Inc." and that "The transaction is expected to close in the first half of 2027", "subject to the satisfaction or waiver of customary closing conditions, including receipt of required regulatory approvals".
  - Text before: "…The announcement does not give a closing date; as of 2026-09-29 this catalog has no source documenting that the deal has closed."
  - Text after: adds the 8-K's agreement date, expected first-half-2027 closing and closing conditions, and says the acquisition is pending.
  - Source IDs: `[nvidia-hf-blog]` → `[nvidia-hf-blog, nvidia-8k-hf-2026]`.
  - Added source `nvidia-8k-hf-2026`: https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000078/nvda-20260902.htm
  - Price and dollar figures were deliberately left out.
- **eligibility.explanation**
  - (a) "Hugging Face has substantial operations in both the United States and France" → "Hugging Face has entities in both the United States and France". No source supports "substantial".
  - (b) "use a Brooklyn, New York letterhead (2024) and describe it as a U.S. company (2025). Earlier submissions call it 'based in the U.S. and France'" → the 2024 NIST submission uses a Hugging Face, Inc. Brooklyn letterhead *while* describing the company as "based in the U.S. and France", and the 2025 OSTP submission calls it a U.S. company. The "based in the U.S. and France" wording is in the same 2024 NIST PDF (its "About Hugging Face" section), not in an earlier submission.
  - Also added `nvidia-8k-hf-2026` to source_ids.
- **products[inference-endpoints].access**
  - "dedicated, autoscaling infrastructure" → "production on fully managed, autoscaling infrastructure".
  - Reason: the cited Endpoints index page says "Fully managed infrastructure" and "Autoscaling". It does not say "dedicated".

Verified, unchanged:
- **Terms of service** (effective 2022-09-15). "Hugging Face, Inc. a Delaware corporation"; New York law; state or federal courts in the city of New York.
- **Privacy policy** (effective 2023-03-28). "The Company and its servers are located in the United States". It names Hugging Face SAS (9 rue des Colonnes, Paris) as the "main establishment in the European Union".
- **Headquarters.**
  - The 2024 NIST PDF letterhead reads "HUGGING FACE, INC. 20 Jay Street, Suite 620 Brooklyn, NY 11201".
  - The 2025 OSTP PDF says "community-driven U.S. company" and "Founded in 2016".
  - The AFP article (2026-09-03) says "even if its headquarters and many of its investors are American".
- **Products.** The Hub docs cover Git-based repositories for models, datasets and Spaces, private datasets, PRO and Team & Enterprise plans, and Hub API endpoints. The Inference Providers docs describe a single API with an OpenAI-compatible chat endpoint, HF Inference among the providers, and a free tier.
- **Transformers LICENSE.** Apache 2.0.
- **ggml.** The ggml blog (2026-02-20) says the ggml team is "joining HF". The ggml.ai site says "The company was acquired by Hugging Face in 2026."

Could not verify:
- No Hugging Face-published announcement of the NVIDIA deal was located on huggingface.co. The claim rests on NVIDIA's blog and SEC filing, both official NVIDIA sources, so it stays.
- The most recent official source for the Brooklyn address is the February 2024 NIST submission. No 2025–2026 official Hugging Face page giving a street address was found. The headquarters label is kept, but an editor may want a more current official address.


### ibm

- `products[watsonx-governance].access`: "…offered as a cloud service and for hybrid deployment; 14-day trial…" → "…for cloud and on-premises environments; 14-day trial…". Reason: the product page says "across cloud and on-prem environments" and does not use "hybrid" or "cloud service". Source: https://www.ibm.com/products/watsonx-governance
- `openness_summary`: "The Granite 4.2 model cards state the Apache License 2.0." → "The Granite 4.2 8B model card states the Apache License 2.0." Reason: only the 8B card is cited. For reference, the HF API shows apache-2.0 for 4.2-3b and 4.2-30b as well. Source: https://huggingface.co/ibm-granite/granite-4.2-8b
- Verified with no change needed:
  - SEC XBRL cover (R1.htm): registrant INTERNATIONAL BUSINESS MACHINES CORPORATION; incorporation state NY; One New Orchard Road, Armonk, NY 10504.
  - EDGAR filing index: Form 10-K filed 2026-02-24, period 2025-12-31, primary document ibm-20251231.htm.
  - Granite page: Language, Speech, Vision, Guardian, Embedding, and Time Series lines; available via Hugging Face, watsonx.ai, and others.
  - watsonx.ai page: trial, essentials, and standard plans.
  - watsonx.ai model docs: IBM, third-party, and custom models; Chat API; tool calling.
  - Orchestrate page: agent platform; IBM Cloud, AWS, or on-prem; 30-day trial and paid plans.
  - Granite 4.2 8B card: release date August 25, 2026.
- Could not verify:
  - SEC blocked `curl` with the generic UA ("Undeclared Automated Tool"). WebFetch of the primary 10-K document returned only the iXBRL header, so neither the cover-page text nor Item 1 was readable from sec.gov directly.
  - The cover page and the "incorporated in the State of New York on June 16, 1911" sentence (Item 1; `founded: 1911`) were confirmed from a PDF copy of the same 10-K: https://fortune.com/company-assets/1656/quartr/annual-report-10-k-3bb7f-2026-02-24-09-20-08.pdf. The citation still points to the SEC URL.
  - An editor may want to confirm the 1911 sentence directly on sec.gov.


**Lead verifier follow-up.** The incorporation sentence ("incorporated in the State of New York on June 16, 1911, as the Computing-Tabulating-Recording Co.") was also confirmed in an IBM-hosted copy of IBM's FY2023 Form 10-K: https://www.ibm.com/downloads/documents/us-en/10a9980400afd10d. `founded: 1911` is therefore supported. The FY2025 wording was read from the fortune.com-hosted copy, because WebFetch of sec.gov returns only the iXBRL header.


## Open items for an editor

- **groq:** no official source states a headquarters city. The record now gives the country only. Groq's website names Groq LLC, while NVIDIA's 10-K names Groq, Inc. The legal name was left null.
- **hugging-face:**
  - No Hugging Face-authored acquisition announcement was found.
  - The Brooklyn address is documented officially only as of February 2024.
  - Re-check closing status in 2027.
- **anyscale:** re-assess eligibility when the Nscale deal closes, since the parent would be UK-registered.
- **arcee-ai:**
  - The HQ city is not stated officially.
  - The About page still says Apache-2.0, while the model cards and LICENSE files say OpenMDW-1.1.
- **fireworks-ai:** the HQ city is not stated officially as "headquarters".
- **anthropic:** a confidential draft S-1 was submitted on 2026-06-01, so ownership may change after any listing.
- **google-deepmind:** the `gemma-4-license` source URL redirects to `/gemma/apache_2`.
