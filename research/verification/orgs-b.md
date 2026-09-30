# Verification log: orgs-b

Checker run on 2026-09-29. There are 22 organization records in this batch. 8 were verified with no changes and 14 were corrected. No record changed eligibility status or publication status. `npx tsx scripts/validate.ts` reports 0 errors and 0 warnings after the edits.

Method: I opened every cited source with WebFetch, or with curl when WebFetch hit a 403 or a size limit and the site allowed a generic client. SEC EDGAR refuses curl without a contact User-Agent. I did not send one, so every SEC document was read through WebFetch. WebFetch truncates very long filings, and those cases are listed under "Could not verify" below.

---

## intel: changed

- **summary**
  - Before: "x86 CPUs for PCs, data centers, and edge systems".
  - After: "CPUs used in PCs and data centers".
  - Reason: the 10-K overview supports CPUs for client and data-center markets. "Edge systems" was not supported by the text I could read.
  - Source: intel-10k-2025.
- **status_note** (U.S. government stake, SoftBank, NVIDIA, Altera)
  - The facts are confirmed. The Department of Commerce agreement was signed on Aug 22, 2025 and closed on Aug 27, 2025: common stock plus a warrant, $5.7B of accelerated CHIPS Act disbursements, and $3.2B for Secure Enclave. The SoftBank placement closed on Sep 26, 2025. The 51% Altera divestiture closed on Sep 12, 2025. The NVIDIA sale closed on Dec 26, 2025.
  - Wording before: "converted CHIPS Act grant funding into equity".
  - Wording after: "tied to accelerated CHIPS Act grant disbursements and Secure Enclave program funding".
  - Sources before: `[intel-10k-2025]`. WebFetch truncates the 10-K before these passages.
  - Sources after: `[intel-10q-q3-2025, intel-8k-2025-12-26]`. Both are new sources and both were fetched.
- **notable_facts[0]** (SambaNova)
  - Before: "…that includes a strategic investment by Intel".
  - After: "…said Intel plans to make a strategic investment in SambaNova". The collaboration scope was also narrowed to AI cloud and AI infrastructure.
  - Reason: the release says Intel *plans* to invest.
- **eligibility.source_ids**: intel-10k-2025 replaced by intel-10q-q3-2025, which covers the government-stake sentence.

## lambda: verified, no changes

The following all match the cited sources: HQ at 2510 Zanker Rd, San Jose (contact page, privacy policy, Form D); Lambda, Inc., a Delaware corporation (Form D, terms of service); founded 2012 by ML engineers (about page); the May 2026 leadership post (Combes as CEO, Balaban as CTO, Donovan as Chair, San Francisco dateline); and all three product pages.

## linux-foundation: verified, no changes

- The about page supports 501(c)(6).
- The privacy policy gives 548 Market St, San Francisco, and names Linux Foundation Europe in Brussels.
- The press release boilerplate supports "founded in 2000" and "software, hardware, standards, and data".
- The PyTorch Foundation charter supports "directed fund".
- Note for the editor: the charter also describes the Linux Foundation as an "Oregon nonprofit mutual benefit corporation". The current `legal_form` is still supported.

## meta: verified, no changes

- The FY2025 10-K supports: Delaware; 1 Meta Way, Menlo Park; founded July 2004; the apps; Meta AI availability; VR headsets and AI glasses.
- Muse Spark: announced Apr 8, 2026; the first model in the Muse family, from MSL; weights not released; Meta says it "hopes to open-source future versions".
- The Meta Model API is self-serve, paid, in public preview, and OpenAI SDK compatible.
- The Muse agent was announced Sep 8, 2026: US only; iOS, Android, and web; free tier plus subscriptions.
- The Llama 4 release date (Apr 5, 2025) and the fact that it is the latest model in the llama-models README table are confirmed. The Llama 4 Community License was checked.
- Muse Glimmer: about 30B parameters, Apache-2.0 (Hugging Face card), August 2026.
- The MSL unit description is supported by the ai.meta.com blog.

## microsoft: changed

- **products[microsoft-copilot].access**
  - Before: "…on the web, in a mobile app, and inside Microsoft 365 apps; a free tier is offered, with higher usage in paid Microsoft 365 plans."
  - After: "…through the Copilot mobile app and inside Microsoft 365 apps; Microsoft 365 individual subscription plans include Copilot features, with usage limits that vary by plan."
  - Reason: the cited page lists only paid plans (Personal, Family, Premium, Pro) and one-month trials. It does not state a free tier.
- **notable_facts[1]** (MAI)
  - Before: "announced its first in-house models … without public weights".
  - After: "announced two in-house models … describing MAI-1-preview as its first foundation model trained end-to-end … Copilot Labs … the announcement did not include downloadable weights".
  - Reason: the page's own wording is "our first highly expressive … speech generation model" and "MAI's first foundation model trained end-to-end".
- **openness_summary**
  - Before: "Its MAI models".
  - After: "The MAI models announced in August 2025".
  - Reason: the source covers only those two models.
- Everything else is verified: the 10-K (Washington; One Microsoft Way, Redmond; 1975), the Foundry page, the Phi page (MIT; Hugging Face and Foundry), the Muse/WHAM blog, and the WHAM license (non-commercial research).

## nvidia: changed (citation only)

- **notable_facts[0]**: added nvidia-10q-q2fy2027 to `source_ids`. The 10-K says "intellectual property license arrangement with Groq". The word "non-exclusive" comes from the 10-Q.
- Everything else is verified:
  - 10-K: incorporated in California in April 1993, reincorporated in Delaware in 1998; two segments.
  - 10-Q cover: 2788 San Tomas Expressway, Santa Clara.
  - LPX news (Aug 24, 2026): full production, and "used under license from Groq, Inc."
  - Product pages: Rubin, DGX, NIM, CUDA.
  - Nemotron page.
  - TensorRT-LLM license: Apache 2.0.

## openai: changed

- **legal_form**
  - Before: "…controlled by OpenAI's nonprofit, OpenAI, Inc., a Delaware nonprofit corporation."
  - After: "…controlled by OpenAI's nonprofit, which the Delaware attorney general identified in October 2025 as OpenAI, Inc., a Delaware nonprofit corporation."
  - Reason: the February 2026 SEC exhibit refers to "OpenAI Foundation" as an affiliate of OpenAI Group PBC. openai.com/our-structure returns 403, so I could not confirm the nonprofit's current legal name. The claim is now dated to its source.
- **eligibility.explanation**: the nonprofit sentence was re-dated the same way.
- **products[chatgpt].access**
  - Before: "…web and in desktop and mobile apps, with free and paid plans".
  - After: "…web and in a desktop app, with a Free plan and paid Go, Plus, Pro, Business, and Enterprise/Edu plans".
  - Reason: the cited docs page shows web and desktop availability only. Plan names come from a new source, `chatgpt-pricing` (learn.chatgpt.com/codex/pricing), which I fetched.
- **openness_summary.source_ids**: added gpt-oss-model-card. The Hugging Face org page does not show the license. The model card PDF and the Hugging Face license field both say Apache 2.0.
- Everything else is verified:
  - SEC Exhibit 10.1: "OpenAI Group PBC, a Delaware public benefit corporation", 1455 3rd Street, San Francisco, Feb 27, 2026.
  - Delaware AG release (Oct 28, 2025): no objection; the nonprofit has sole power to appoint and remove PBC directors; incorporated 2015.
  - California AG MOU (Oct 27, 2025): nonprofit and PBC headquarters stay in California; the AG shall not object.
  - Codex repo: Apache-2.0; sign in with a ChatGPT plan or an API key.
  - API docs.

## oracle: changed

- **founded.source_ids**
  - Before: `[oracle-10k-fy2026]`. The text WebFetch could reach does not contain the year.
  - After: `[oracle-10k-fy2025]`. This is the FY2025 10-K PDF on Oracle's investor site: "successor to operations originally begun in June 1977". New source, fetched.
- **status_note**
  - Before: "Since September 2025 Oracle has had two CEOs… Catz, CEO from September 2014 to September 2025, became Executive Vice Chair, and Lawrence J. Ellison remains Executive Chair and Chief Technology Officer."
  - After: "In September 2025 Magouyrk and Sicilia were promoted to CEO, succeeding Catz, who had been CEO since September 2014 and became Executive Vice Chair of the Board. The announcement identified Ellison as Chairman of the Board and CTO."
  - Sources before: `[oracle-10k-fy2026]`. Its executive-officer section could not be reached.
  - Sources after: `[oracle-8k-2025-09-22, oracle-ceo-release-2025-09-22, oracle-10k-fy2025]`. All new and fetched.
  - Reason: I could not verify the "Executive Chair" title or the "remains" wording.
- Everything else is verified: the Q1 FY2027 10-Q (Delaware; 2300 Oracle Way, Austin), the FY2026 10-K's descriptions of OCA/OCI and GPU/bare-metal compute, the OCI Generative AI docs, and the AI infrastructure page (read via curl because WebFetch got a 403).

## palantir: verified, no changes

The headquarters move is confirmed by three sources:
- **FY2025 10-K cover** (PDF on Palantir's investor site): principal executive offices at 19505 Biscayne Blvd, Aventura, Florida. The "former address" line is 518 17th St, Denver.
- **10-K Item 2**: Denver "was the location of our corporate headquarters".
- **Q2 2026 10-Q cover** (SEC): Aventura.

The 10-K also supports: incorporated in Delaware on May 6, 2003; Nasdaq: PLTR; the platform descriptions; the intelligence-community origin; "all of our commercial customers" use Foundry. The AIP docs name AIP Logic and AIP Evals.

## perplexity: verified, no changes

- **2023 Form D**: Perplexity AI, Inc.; Delaware; incorporated 2022; 341 Moultrie St, San Francisco. This is the only Form D under that CIK.
- **GSA eLibrary listing** (contract 47QTCA26D000N): 181 Fremont St FL 11, San Francisco.
- **Other sources**: App Store developer name, API docs (Agent, Search, Embeddings, Router; pay-as-you-go; OpenAI/Anthropic/Google/xAI models), and the pplx-embed card (MIT; built on continued pretraining of Qwen3).
- perplexity.ai returns 403 to both WebFetch and curl. The explanation in the record already says this.

## physical-intelligence: verified, no changes

- openpi README: π0, π0-FAST, π0.5 and their checkpoints. Code is Apache-2.0 per GitHub.
- π0 paper PDF: affiliation "Physical Intelligence, San Francisco, California, USA".
- TechCrunch (Jan 30, 2026): "headquarters in San Francisco".
- The Robot Report: "San Francisco-based".
- Ashby job board: 33 roles in San Francisco and 2 in Fremont.

## poolside: changed

- **products[poolside-api].access**
  - Before: "the models are also listed on OpenRouter".
  - After: "the documentation also describes access through OpenRouter".
  - Reason: the docs show an OpenRouter base URL. They do not state that the models are listed there.
- **eligibility.explanation**
  - Before: French Tech Journal and Fortune both "described the company as having moved its headquarters to Paris".
  - After: French Tech Journal said it moved its headquarters to Paris. Fortune (Sept 2024) described it as "Paris-based" after relocating to France.
- **openness_summary.source_ids**: added hf-laguna-xs-2-1 and hf-laguna-s-2-1 (new, fetched). The claim that XS 2.1 uses OpenMDW-1.1 previously had no source. The Hugging Face metadata confirms it.
- Everything else is verified:
  - Terms of use (Jul 21, 2026): Poolside, Inc., a Delaware corporation; 548 Market St PMB, San Francisco; California law.
  - Privacy policy and DPA.
  - Press release: "Founded in 2023 and headquartered in San Francisco".
  - French registry: POOLSIDE AI SAS, created Jul 10, 2023, Paris, active.
  - Docs: API, CLI with free developer access, self-managed and air-gapped deployment.
  - Hugging Face: XS.2 and M.1 are Apache-2.0.
  - Technical report dated May 25, 2026.

## pytorch-foundation: verified, no changes

- The PyTorch Foundation page names vLLM, DeepSpeed, Ray, Helion, and Safetensors, and describes the Governing Board and technical governance.
- The charter: directed fund; "PyTorch a Series of LF Projects, LLC"; members must be LF members; charter amendments need LF approval.
- The governance doc: "for individuals, not companies".
- The LF press release lists the founding board members.
- PyTorch has a BSD-style license.

## reflection-ai: changed

- **eligibility.explanation**
  - Before: "its earlier terms of service gave a Brooklyn … address".
  - After: "its terms of service (dated February 2025) give a Brooklyn … address".
  - Reason: that version is the one currently posted.
- Everything else is verified:
  - Privacy policy (Aug 28, 2026): 61 9th Ave, New York.
  - Terms: Reflection AI, Inc., New York governing law.
  - Careers: New York, San Francisco, London, D.C.
  - About and solutions pages.
  - Oct 9, 2025 post: pretraining plus RL, no weights.
  - Hugging Face returned no model repositories under the Reflection org names I tried (reflection-ai, ReflectionAI, reflectionai, reflection).

## salesforce: changed

- **products[data-360].access**
  - Before: "supplies context to Agentforce agents".
  - After: "supplies business context to AI agents".
  - Reason: the page says "every human and AI agent".
- Everything else is verified:
  - 10-K and 10-Q covers: Salesforce Tower, San Francisco; Delaware; NYSE: CRM.
  - 10-K: founded 1999; Agentforce 360 Platform.
  - Agentforce pricing options.
  - Slack AI: paid plans; "Slack Technologies, LLC, a Salesforce company".
  - Hugging Face licenses: BLIP is BSD-3-Clause; moirai-agent is CC-BY-NC-4.0.

## sambanova: changed

- **status_note**
  - Before: "SambaNova remains a privately held company. … partnership … including a strategic investment by Intel …"
  - After: the first sentence is removed. The Intel part now says SambaNova "said Intel plans to make a strategic investment in the company". The July 2026 Series F first close is kept.
  - Reason: no source states "remains privately held".
- Other checks:
  - The FTC early termination notice 20261227 (granted Apr 30, 2026) lists Intel as acquiring person and SambaNova as acquired entity. HSR notices do not show how large the stake is.
  - SambaNova's own press list through Aug 4, 2026, and the July 2026 Series F release (Founded 2017, San Jose), show it still operating.
  - I found no official source reporting a completed acquisition.
  - Product pages checked: SambaCloud (OpenAI-compatible endpoints, API key, cloud.sambanova.ai dashboard), SambaStack (on-premises or cloud), and SambaRack (SN50, on-premises or hosted).

## scale-ai: verified, no changes

- About page: "Headquarters: San Francisco, CA" and founded 2016.
- The June 12, 2025 release supports the status note as written: Meta "will hold a minority of Scale's outstanding equity", Scale "remains an independent" company, and Wang joined Meta and stays a director. The record contains no stake percentage or valuation.
- The product pages support the claims.
- Note for the editor: scale.com now shows a banner saying "Scale appoints Francis deSouza as the new CEO". This is not in the record and was not added.

## snowflake: changed

- **headquarters.label**
  - Before: "(designated principal executive office)".
  - After: "(principal executive offices)".
  - Reason: the FY2026 10-K and Q2 10-Q covers simply list 135 Constitution Drive, Menlo Park as the principal executive offices.
- **status_note**
  - Before: "Snowflake's filings through fiscal 2025 described…".
  - After: "Snowflake's Form 10-K for fiscal 2025 described…".
  - Reason: I read only the FY2025 10-K. It gives Bozeman and the "globally distributed workforce and no corporate headquarters" footnote.
- **eligibility.explanation**
  - Before: "Earlier filings".
  - After: "Its Form 10-K for fiscal 2025".
- Everything else is verified: incorporated in Delaware Jul 23, 2012; NYSE: SNOW; AI Data Cloud; Cortex AI Functions providers, SQL/Python access, and privileges; CoWork (web plus the "Snowflake Intelligence" iOS app); the Arctic card (Apache-2.0, Apr 24, 2024, 480B dense-MoE hybrid); the Arctic GitHub license (Apache 2.0).

## ssi: changed

- **eligibility.explanation**
  - Before: "…carries a Palo Alto, California dateline for SSI…".
  - After: "…carries a dual Santa Clara and Palo Alto, California dateline, Palo Alto being SSI's only U.S. office named on its site…".
  - Reason: the release dateline is "SANTA CLARA, Calif. and PALO ALTO, Calif."
- The headquarters reasoning is otherwise sound and explicit. ssi.inc says: "We are an American company with offices in Palo Alto and Tel Aviv".
- Everything else is verified: the updates page (Jul 3, 2025 message on Gross, CEO, and President; Jul 26, 2026 NVIDIA partnership) and the release ("Founded in 2024"; NVIDIA "has … made an investment").

## thinking-machines-lab: changed

- **summary**
  - Before: "released its first open-weight models, Inkling and Inkling-Small".
  - After: "released the open-weight models Inkling and Inkling-Small".
  - Reason: no source says "first".
- The headquarters reasoning holds:
  - Privacy notice (May 19, 2026): "We are based in the United States".
  - Terms: California law, arbitration in San Francisco.
  - Job board: 48 San Francisco roles and 1 New York role.
  - The record correctly says no official street address was found.
- Everything else is verified: Tinker (LoRA, sign-up, usage pricing, Inkling supported); the Mar 10, 2026 NVIDIA partnership; the Inkling card (Thinking Machines Lab, Inc., Jul 15, 2026, Apache 2.0); Hugging Face (Inkling and Inkling-Small are apache-2.0); the Model AUP ("you agree to be bound").

## together-ai: changed

- **founded.source_ids**
  - Before: `[together-about]`. The about page shows no founding year.
  - After: `[together-pr-genesis]`. The release boilerplate says "Founded in 2022".
  - The uncited `together-about` source was removed.
- **products[serverless-inference].access**
  - Before: "more than 200 open-source models across chat, …".
  - After: "hundreds of open-source models across text, …".
  - Reason: the page says "hundreds".
- Everything else is verified:
  - Terms (May 19, 2026): Together Computer, Inc., a Delaware corporation; 251 Rhode Island St, San Francisco.
  - Genesis Mission release (San Francisco, Apr 27, 2026).
  - Bisnow: new HQ lease at 2 Henry Adams St.
  - Fine-tuning: LoRA or full, UI or CLI cost estimates.
  - GPU clusters: console/CLI/SDK/API/Terraform, Kubernetes/Slurm, hourly or reserved.

## xai: changed (material status re-sourced)

**Verified from SEC filings and kept.** The SpaceX Form 10-Q for the quarter ended Jun 30, 2026 confirms:
- On Feb 2, 2026 SpaceX "completed its acquisition of X.AI Holdings Corp." and xAI became a wholly owned subsidiary.
- "In June 2026, the Company completed its initial public offering". Class A common stock is listed on Nasdaq as SPCX.
- SpaceX is a Texas corporation at 1 Rocket Road, Starbase, TX.
- X.AI Corp began operations in March 2023.
- xAI completed its acquisition of X Holdings Corp. on Mar 28, 2025.
- The AI segment covers Grok, X, and AI computational infrastructure.

On x.ai, "xAI joins SpaceX" (Feb 2, 2026) and the footer "© 2026 SpaceXAI LLC" are confirmed.

**Not verifiable.** The 424(b)(4) prospectus is 11.95 MB. That is over WebFetch's 10 MB limit, and SEC blocks curl without a contact User-Agent. Nothing that was cited only to the prospectus could be confirmed. Changes:

- **headquarters.source_ids**
  - Before: `[spacex-424b4]`.
  - After: `[xai-holdings-form-d-2026]`. This is the X.AI Holdings Corp. Form D (Jan 6, 2026), principal place of business 1450 Page Mill Road, Palo Alto. New source, fetched.
- **other_locations[Memphis]**
  - Source before: spacex-424b4.
  - Source after: spacex-drs-2026-03, SpaceX DRS No. 1 (Mar 30, 2026): "COLOSSUS … located on Paul R. Lowry Road in Memphis, Tennessee". New source, fetched.
  - Label before: "COLOSSUS data centers". Label after: "COLOSSUS data center".
- **status_note.source_ids**: removed spacex-424b4. Every statement is supported by the 10-Q and the x.ai post.
- **notable_facts**: removed the only entry, which was sourced only to the prospectus: "Grok is SpaceX's proprietary frontier model; its engineers are based at the Palo Alto AI headquarters".
- **eligibility.explanation**: rewritten to rest on the Form D (Palo Alto) and the 10-Q (wholly owned by a Texas corporation in Starbase).
- **openness_summary**
  - Removed: "SpaceX's prospectus calls Grok proprietary".
  - Sources after: `[xai-api-docs, hf-xai-org, xai-grok-os, hf-grok-2-license]`. Grok-1 is under Apache 2.0 per the x.ai post and Hugging Face. Grok 2 is under the "xAI Community License Agreement" (new source, fetched).
- **sources**: removed spacex-424b4. Added xai-holdings-form-d-2026, spacex-drs-2026-03, and hf-grok-2-license.

The products are verified:
- grok.com: sign-in, App Store, Google Play, @grok.
- docs.x.ai: API keys, api.x.ai, pricing, text/code/voice/image/video.
- grok-build README: binaries for macOS, Linux, and Windows; browser authentication on first launch; first-party code under Apache-2.0.

---

## Could not verify / editor follow-up

1. **SpaceX 424(b)(4) prospectus**: too large for WebFetch, and SEC blocks undeclared tools. An editor with an SEC-compliant User-Agent should read it. If it confirms that Palo Alto is the AI-operations HQ and that Grok is "proprietary", the removed xAI notable fact could be restored with that citation.
2. **OpenAI nonprofit name**: openai.com (our-structure and other pages) returns 403. The Feb 2026 SEC exhibit names "OpenAI Foundation" as an affiliate. Confirm whether OpenAI, Inc. was renamed and update `legal_form` if so.
3. **Oracle**: oracle.com newsroom and executives pages return 403. The FY2026 10-K's executive-officer section and founding sentence could not be reached. Confirm Ellison's current title ("Executive Chair"?) if the editor wants it back in the record.
4. **Intel FY2025 10-K**: WebFetch truncates it. The status claims were moved to the Q3 2025 10-Q and the Dec 2025 8-K, which I fully confirmed.
5. **Perplexity**: perplexity.ai returns 403 to all clients. The HQ rests on the 2023 Form D and the GSA eLibrary listing.
6. **xAI site**: x.ai company, colossus, memphis, careers, and legal pages return 403. Only /news/* pages were readable.
7. **SambaNova and Intel**: the meaning of the Apr 30, 2026 HSR early-termination notice (Intel acquiring SambaNova voting securities) is unclear. No acquisition was found, but an editor may want to watch this.
8. **Scale AI**: the site banner reports a new CEO (Francis deSouza). This is not in the record and was not added.
9. **SEC filing dates**: several `published_at` values could not be confirmed from the fetched text (e.g., Intel 10-K 2026-01-23, Meta 10-K 2026-01-29, Salesforce 10-K 2026-03-02, SpaceX 10-Q 2026-08-04, Oracle 10-Q 2026-09-11). They are metadata only and were left unchanged.
