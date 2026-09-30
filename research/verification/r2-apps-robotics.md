# Verification log: r2-apps-robotics

Batch: **r2-apps-robotics**. Checked 2026-09-29 by an independent fact-checker under `research/VERIFIER_BRIEF.md` and `research/AGENT_BRIEF_ROUND2.md`.

Records:
- Organizations: anysphere, cognition, runway, midjourney, luma-ai, character-ai, glean, sierra, skild-ai, agility-robotics, apptronik, boston-dynamics, waymo
- Artifacts: tau-bench, waymo-open-dataset, waymax

Method:
- Every cited source was opened today. Tools were WebFetch and `curl -A "USASI-factcheck/0.2"` for raw files, PDFs and license texts.
- No email address or personal identifier was sent in any request.
- `last_reviewed` was not changed on any record, and `updated_at` stays 2026-09-29.
- Records were checked in four parallel groups:
  - The lead verifier checked anysphere, cognition, midjourney, character-ai, agility-robotics, boston-dynamics and waymo.
  - Three helper checks covered (a) runway, luma-ai and glean, (b) sierra, tau-bench, skild-ai and apptronik, and (c) waymo-open-dataset and waymax.
  - The lead verifier reviewed each helper's report and the resulting YAML.

Validator: after all edits, `npx tsx scripts/validate.ts` reports 0 errors. Its 1 warning is in `continue-extension.yml`, which belongs to another batch.

## Summary

- **Verified with no changes (2):** agility-robotics, waymo.
- **Changed (14):** anysphere, cognition, runway, midjourney, luma-ai, character-ai, glean, sierra, skild-ai, apptronik, boston-dynamics, tau-bench, waymo-open-dataset, waymax. The changes narrow wording to what the source says, state the evidence more exactly, correct source dates or titles, or record a license that had not been confirmed.
- **Eligibility and publication status:** no change on any record. All 16 remain `eligible` and `published`.
- **Claims removed:** none. The one claim flagged for possible removal, SpaceX's acquisition of Anysphere, was confirmed from the Form 8-K.

### Special-attention items

- **SpaceX acquisition of Anysphere: confirmed from an official source, so it is kept.**
  - SpaceX's Form 8-K was read directly on EDGAR (accession 0001628280-26-056945; the filing index confirms form type 8-K, filed and period of report 2026-08-14). Under Item 2.01, merger sub X67 Inc. merged "with and into Cursor, with Cursor surviving the merger as a wholly owned subsidiary of the Company", and the transaction closed on 2026-08-14.
  - The registrant is Space Exploration Technologies Corp., a Texas corporation at 1 Rocket Road, Starbase, Texas.
  - Cursor's post of 2026-08-14 says Cursor "has officially been acquired by SpaceX".
  - The parent link (`spacex`, `subsidiary`) and `unit-of-another-organization` stay.
- **Cognition and Windsurf: wording tightened.**
  - The July 2025 post says Cognition "signed a definitive agreement" to acquire Windsurf, including its IP, product, trademark and brand, and people. The record claims no closing and no acquisition of the Exafunction entity.
  - The Exafunction clause now matches the terms: the provider is Exafunction, Inc. unless the user was notified that the license was assigned to Cognition AI, Inc.
- **Character.AI, Google and Disney: no acquisition is claimed.**
  - Google, 2024: the archived 2024 post, read via the Internet Archive because the original now returns 404, describes a non-exclusive license for its then-current LLM technology, with the founders and certain research-team members joining Google.
  - Disney, 2026: Character.AI's post and Disney's release (both 2026-09-18) describe team members "expected to join Disney". Neither describes an acquisition, license or investment.
  - The eligibility explanation now also cites the Disney announcements.
- **Headquarters evidence from App Store trader addresses: now stated exactly.**
  - For Midjourney and Character.AI, the eligibility explanation now says the headquarters label rests on the EU trader information on the **Ireland App Store listing**: the niji・journey app for Midjourney and the Character.AI app for Character.AI.
  - Both explanations also state that the listing does not call the address a headquarters.
  - The Midjourney complaint is now described as the plaintiffs' allegation.
- **Boston Dynamics ownership: wording corrected.**
  - Hyundai Motor Group's 2026-07-16 statement says "Hyundai Motor Group shareholders" in Boston Dynamics are pursuing SoftBank's stake. The record had said "its shareholders", which could be read as the group's own shareholders.
  - "A South Korean group" was not stated by any cited source. It now says the statement is datelined Seoul.
  - No official source confirms that the purchase has closed; news coverage of the July announcement describes it as a planned purchase.
- **Waymo and Alphabet: confirmed.**
  - The Alphabet 2025 Annual Report PDF (which includes the FY2025 Form 10-K) describes Waymo in Other Bets as "our fully autonomous driving technology company".
  - Its Note 5 calls Waymo "a consolidated VIE", says the significant majority of the February 2026 round was funded by Alphabet, and says external investments will be recognized as noncontrolling interests.
  - Waymo's own post calls Alphabet its "majority investor".
  - Exhibit 21.01 lists only Google LLC, XXVI Holdings Inc. and Alphabet Capital US LLC.
  - `parent_org_slug: google`, `subsidiary` is supported as written.
- **Agility merger: still pending.**
  - The status note (pending) is accurate.
  - EDGAR shows Agility's S-4 filed 2026-09-04, with no S-4 amendment.
  - Churchill Capital Corp XI's filing list shows Form 425 communications through 2026-09-17 and no completion filing.
- **Waymo dataset and simulator licenses: checked against the full texts.** Changes are listed under each record below.
  - The data license is the custom "Waymo Dataset License Agreement for Non-Commercial Use (March 2025)".
  - Repository code is Apache-2.0 outside `wdl_limited`. The `wdl_limited` subfolders are BSD-3-Clause plus per-folder limited patent grants in PATENTS files.
  - Waymax is under the custom "Waymax License Agreement for Non-Commercial Use", headed October 17, 2023, and it applies to all materials. The file history shows the AI-training prohibition was present from the first commit (2023-10-18), not added later.

## Records

### anysphere: changed (1)

- **products[bugbot].access.** Before: "…offered on Cursor subscription plans with a free trial." After: "…the product page offers a 14-day free trial on all plans and does not list prices." Reason: the page says only "We offer a 14-day free trial for all plans" and shows no prices. Source: https://cursor.com/bugbot
- **Verified:**
  - SpaceX 8-K (see the special-attention item above). The spacex record also records the acquisition.
  - Terms of service, last updated 2026-09-03, and MSA, last updated 2026-08-13: both name Anysphere, Inc. at 2261 Market Street STE 86466, San Francisco. Both now choose Texas law and Texas venue.
  - Careers page: the most roles are in San Francisco and New York, and no page says "headquarters".
  - Models page:
    - Composer 2.5 is listed with provider "Cursor".
    - The Grok 4.5–4.7 notes read "Jointly trained by Cursor and SpaceXAI".
    - It says "Models are hosted by the model provider, a trusted partner, or Cursor."
  - Home page: a desktop editor, cloud agents ("Launch fleets of agents that work in parallel"), multiple model providers.
  - CLI page: installed with a curl shell script; covers terminal, GitHub Actions and scripts.
  - Bugbot: GitHub PR review.

### cognition: changed (1)

- **status_note.text, Exafunction clause.** Before: "noting that users who enrolled under Exafunction, Inc. contract with that entity unless their agreement is assigned". After: "say that for users who enrolled under Exafunction, Inc., the provider is Exafunction, Inc. unless they have been notified that their license was assigned to Cognition AI, Inc." Reason: this matches the terms' wording, which turns on notice of assignment. Source: https://cognition.com/legal/platform-terms-of-service (last updated 2026-06-30)
- **Verified:**
  - The Windsurf post (07.14.25): "signed a definitive agreement" to acquire Windsurf's IP, product, trademark and brand, and people. It does not mention Exafunction or a closing.
  - Devin Desktop (06.02.26): "the next generation of Windsurf". devin.ai/desktop says "the new name for Windsurf", and that the plan, pricing, extensions and settings "carry over automatically".
  - The terms give Cognition AI, Inc. at 550 Third Street, San Francisco.
  - Careers page: a San Francisco office tour, with the largest concentration of roles in San Francisco; no "headquarters".
  - Devin home: "runs in the cloud or on your machine".
  - Devin CLI (04.27.26): installed with a curl shell script; hands off to a cloud agent.
  - SWE-2 (09.10.26): "post-trained from Kimi K3, a 2.8T-parameter model"; available in Devin Desktop and CLI, rolling out on Devin Web. No weights are mentioned. It builds on SWE-1.7, which supports "SWE-series".
  - Hugging Face: a verified org, one model (Kevin-32B, fine-tuned from Qwen/QwQ-32B), and no license shown on the card.

### runway: changed (3 fields, 1 source added)

- **summary.text.** Before: "Runway develops generative models for video, images, and audio, including the Gen-4.5 video model and world models such as GWM-1. It offers them through…". After: "Runway develops generative AI models, including the Gen-4.5 video model and world models such as GWM-1. It offers its own and some third-party models for video, image, and audio work through…". Reason: the pages cited show no audio model of Runway's own. The product page lists third-party models such as Seedance, Kling and Eleven v3, and the home page says "models from Runway and other labs". Sources: https://runway.com/ and https://runway.com/product
- **products[runway-app].access.** "with a free trial and paid subscription tiers" → "with a free plan of one-time credits and paid subscription plans". Reason: neither cited page mentioned a free trial. Added source `runway-pricing` (https://runway.com/pricing), which shows a Free plan with one-time credits plus paid plans.
- **eligibility.explanation.** Two edits:
  - "lists New York first among its offices" → "lists offices in New York, San Francisco, Seattle, London, Paris, Tel Aviv, and Tokyo without naming a headquarters". Reason: listing order does not show a headquarters.
  - The venue clause was narrowed to "name state or federal courts in New York County as the exclusive venue for claims litigated in court". Reason: most disputes go to arbitration (terms §16; venue §18.5).
  - Sources: https://runway.com/about and https://runway.com/terms-of-use
- **Verified:**
  - Form D (the only one on EDGAR): Runway AI Inc., Delaware, incorporated 2018, 79 Walker Street, New York; filed 2022-12-15.
  - Terms: last updated 2026-09-15, New York law.
  - Gen-4.5 post (2025-12-01): does not mention weights.
  - Aleph 2.0 and GWM-1 appear on the product and home pages.
  - The iOS and Android listings resolve.
  - API docs and SDKs are confirmed.

### midjourney: changed (3)

- **eligibility.explanation.** It now states exactly what the evidence is.
  - Before: "Midjourney, Inc. identifies itself as a trader on its App Store listing…"
  - After: "The headquarters label rests on the EU trader information shown on the Ireland App Store listing for Midjourney's niji・journey app… the listing does not describe this address as a headquarters." The full suite address (Ste 120) is included, and the complaint is described as alleging, not stating.
  - Reason: this was the special-attention requirement. Sources: https://apps.apple.com/ie/app/niji-journey-ai-anime-art/id6446376937 and the complaint PDF.
- **legal_form.text.** "as described in" → "as alleged in". Reason: a complaint states the plaintiffs' allegations.
- **sources[disney-v-midjourney-complaint].publisher.** "U.S. District Court for the Central District of California (copy hosted by Variety)" → "Plaintiffs' complaint filed in the U.S. District Court for the Central District of California (copy hosted by Variety)".
- **Verified:**
  - Complaint PDF: fetched with curl, because WebFetch was redirected to a tollbit paywall host. Its caption reads Case 2:25-cv-05275, filed 06/11/25, C.D. Cal. It says "Defendant Midjourney, Inc. is a corporation duly incorporated in Delaware with its principal place of business in San Francisco, California."
  - The Ireland listing's trader address: 611 Gateway Blvd Ste 120, South San Francisco, CA.
  - The US listing: free with in-app purchases, and account/plan syncing with Midjourney.
  - The V1 video post (2025-06-18) describes image-to-video through "Animate", web-only.
  - The V8.1 Alpha post (2026-04-14) says V8 models are "only available on alpha.midjourney.com".
  - The V8.1 default post (2026-06-11) says "updated the default model from V7 to V8.1".
  - GitHub: a deprecated docs repo plus forks only.
- **Decision.** Publication and eligibility are unchanged. Two independent sources place the company in the San Francisco Bay Area: the company's own EU trader declaration and the complaint's allegation. The editor should note that the two differ on the city: South San Francisco versus San Francisco.

### luma-ai: changed (4 fields, 3 sources added)

- **products[luma-agents].access.** "using Luma's models" → "using Luma's own and third-party models". Reason: the /app page and its plans list third-party models (Veo, Kling, GPT Image, Seedance, ElevenLabs). Source: https://lumalabs.ai/app
- **products[luma-api].access and source_ids.**
  - Access: "with API keys issued from a developer console, … and client SDKs" → "authenticated with API keys, with pay-as-you-go and dedicated-capacity plans and official SDKs for Python, TypeScript, and Go". Reason: no fetched page says keys are issued from a console, and the cited lumaai-python repository is the older Dream Machine SDK.
  - Sources: now `luma-api`, `luma-llm-info` and the new `luma-agents-docs` (https://docs.agents.lumalabs.ai/).
- **sources[luma-llm-info].published_at.** null → 2026-07-13. Reason: the page states "Last updated July 13, 2026".
- **openness_summary.text** (lead verifier).
  - Before: the IMM checkpoints' license "was not confirmed for this record".
  - After: the IMM repository's code is under a CC BY-NC-SA 4.0 (non-commercial) license file. Its checkpoints on Hugging Face carry model-card metadata that says Apache-2.0, but a license file that is CC BY-NC-SA 4.0.
  - Reason: both license files were read today.
  - Added sources `luma-imm-license` (https://raw.githubusercontent.com/lumalabs/imm/main/LICENSE) and `luma-imm-hf` (https://huggingface.co/lumaai/imm; the raw README metadata and LICENSE were read too).
- **Verified:**
  - Careers page: "Headquarters: Redwood City, CA".
  - llm-info: Redwood City headquarters; founded 2021.
  - Terms (2026-05-14): 715 Alma Street, Palo Alto.
  - Form D: Delaware, incorporated 2021, principal place of business in Palo Alto; filed 2023-08-25.
  - Ray3.2 and Uni-1.1 are named.
  - The API page lists Build (pay per use) and Scale (dedicated capacity) plans.
  - The lumaai-python LICENSE is Apache 2.0.

### character-ai: changed (1 field, 2 edits)

- **eligibility.explanation, trader evidence.** It now states exactly what the evidence is.
  - Before: "Character Technologies, Inc., the developer of the Character.AI app, identifies itself as a trader on its App Store listing…"
  - After: "The headquarters label rests on the EU trader information shown on the Ireland App Store listing for the Character.AI app… the listing does not describe this address as a headquarters."
  - Source: https://apps.apple.com/ie/app/character-ai-chat-talk-text/id1671705818
- **eligibility.explanation, Disney.** Added that the September 2026 Character.AI and Disney announcements describe team members moving to Disney without describing an acquisition. `source_ids` gained `cai-next-chapter-2026` and `disney-cto-2026`. Sources:
  - https://blog.character.ai/the-next-chapter-of-entertainment-and-fandom/
  - https://thewaltdisneycompany.com/news/karandeep-anand-chief-technology-officer/
- **Verified:**
  - Archived 2024 post, fetched today with curl from the Internet Archive; the live URL returns 404. It says:
    - "non-exclusive license for its current LLM technology"
    - "Noam, Daniel, and certain members of our research team will also join Google"
    - Most of the team remains.
    - It will make "greater use of third-party LLMs alongside our own".
  - 2026 posts:
    - "Karan expects to be joined by members of Character's technical team".
    - "The app is still live and online".
    - Disney: "a number of Character.AI's technical team are expected to join Disney".
    - Neither mentions an acquisition, license or investment.
  - CAI-Image (2026-09-16): "post-trained versions of the open-source Qwen-Image", and "the same approach we take across our stack, including chat".
  - Ovi: the LICENSE is Apache 2.0, and the README says "Our video branch is initialized from the Wan2.2 repository", with Character AI and Yale affiliations.
  - App Store (US): seller Character Technologies, Inc., rated 18+, free with subscriptions, text and voice chat, character creation.
- **Status note:** accurate as written.

### glean: changed (1)

- **products[glean-developer-platform].access.** "Client, Platform, and Indexing APIs" → "Client and Indexing APIs, Platform APIs in experimental preview". Reason: the page says the Platform APIs are "now rolling out in experimental preview". Source: https://developers.glean.com/
- **Verified:**
  - Terms PDF (dated 2026-06-05): "Glean Technologies, Inc., a Delaware corporation, headquartered at 634 2nd Street, San Francisco" and "support for multiple third-party large language models".
  - About page: the footer gives the same address, and the JSON-LD gives 260 Sheridan Ave, Palo Alto, with foundingDate 2019-01.
  - Assistant and Agents pages: demo-based access.
  - Developer page: MCP server, OAuth or Glean-issued tokens, and Python, TypeScript, Java and Go libraries.
  - api-client-python LICENSE: MIT.

### sierra: changed (1)

- **openness_summary.text.** "a commercial hosted service" → "a commercial service". Reason: no page reviewed says "hosted". `sierra-home` was added to `source_ids`. Source: https://sierra.ai/
- **Verified:**
  - Modern slavery statement: last updated 2026-02-04; "a Delaware corporation, is headquartered in San Francisco, California, USA"; financial year ending 2026-01-31; UK subsidiary Sierra Technologies Ltd.
  - Careers page: "We're headquartered in San Francisco".
  - Terms (effective 2024-02-12): 150 Sutter St.
  - Agent Studio, Ghostwriter and Channels pages: the channel list matches, and no LLMs are named.

### skild-ai: changed (3 fields, 1 source added)

- **products[skild-brain].access.** "that Skild deploys in its own robot applications" → "Skild's website says the company is building robot applications with it". Reason: the home page says "we are building robot applications". Source: https://www.skild.ai/
- **eligibility.explanation.**
  - The Zebra release is datelined "PITTSBURGH and LINCOLNSHIRE, Ill.", so the explanation no longer calls it a Pittsburgh dateline.
  - The Technical.ly wording now matches the article: "Pittsburgh-based", "East Liberty-based", and offices in San Mateo and Bengaluru.
  - The unsourced statement about San Mateo job listings now cites a new source, `skild-jobs` (https://job-boards.greenhouse.io/skildai-careers), the board that Skild's careers page loads.
- **sources[skild-zebra].title.** Corrected to the full published title.
- **Verified:**
  - Business Wire release (via Yahoo): "PITTSBURGH, July 29, 2025"; founded 2023; "offices in Pittsburgh and the San Francisco Bay Area".
  - Series C post: robot types listed.
  - S1 post (2026-08-18): video prompting, commercial partners, early-access sign-up.
  - Bengaluru post: "first expansion beyond the US".
  - Zebra release (2026-04-15): cash plus an equity stake. The Symmetry Fulfillment detail comes from Skild's own post.
  - GitHub: no public repositories.
  - No funding figures appear in the record text.

### agility-robotics: verified — no changes

- **Digit 5 release** (SALEM, Ore., Sept. 15, 2026):
  - "Headquartered in Salem, Oregon, with offices in Pittsburgh, Pennsylvania and Fremont, California".
  - RoboFab is a 70,000-square-foot facility in Salem.
  - The Pittsburgh office "leads engineering testing, validation and skills development".
  - The Fremont facility "opened in July 2026" as the "hardware and physical AI development hub".
  - Safety: AI-based detection, and an independent safety controller that triggers avoiding, stopping or sitting.
  - Early access in H1 2027; general availability by the end of 2027.
  - Agility Arc: fleet metrics and WMS/MES integration.
  - The record's "less reliance on protective barriers" is softer than the source's "without the physical safety barriers required by traditional automation". It is left as a conservative paraphrase.
- **Churchill release** (2026-06-24): NASDAQ: CCXI, "blank check company", the combined company would trade as "AGLT", closing subject to shareholder vote, SEC S-4 review, regulatory approvals and listing approval.
- **Investors page:** the transaction is described as "expected", with no trading.
- **EDGAR:**
  - The company page shows Agility Robotics, Inc., DE, at 4698 Truax Drive SE, Salem, OR. Filings: S-4 on 2026-09-04, DRS/A on 2026-08-17, DRS on 2026-07-14.
  - The S-4 index lists Agility Robotics, Inc. (DE) and Churchill Capital Corp XI (E9) as co-registrants.
  - Churchill XI's filing list runs to Form 425 on 2026-09-17, with no completion 8-K.
- **Solutions page:** tote handling, palletizing/depalletizing, machine tending, kitting/sequencing; contact through sales.
- **GitHub:** infrastructure repos plus the archived cassie-doc; no AI models.

### apptronik: changed (4)

- **summary.text.** "data it collects feeds Google DeepMind's Gemini Robotics models under a research partnership" → "under a research partnership, data collected by Apollo 2 helps advance Google DeepMind's Gemini Robotics models". Reason: this follows the release's wording, "helps to advance Gemini Robotics".
- **openness_summary.text.** "describes … Gemini Robotics models … as the AI behind its future fleet" → the data "is used to train and refine" Gemini Robotics models, and the partnership is "building next-generation humanoid robots powered by Gemini Robotics". Reason: the old wording overstated the sources. Sources: the Robot Park release and the Series A release.
- **sources[apptronik-robot-park].title.** Corrected to the full published headline.
- **sources[apptronik-terms].published_at.** null → 2023-01-01. Reason: the page states "Effective Date: January 1st 2023".
- **Verified:**
  - Form D (filed 2025-11-05): Delaware, 11701 Stonehollow Dr Ste 150, Austin.
  - Terms: Delaware corporation, Texas law, Travis County courts.
  - Series A release: Austin dateline; UT Austin Human Centered Robotics Lab and NASA Valkyrie in the boilerplate.
  - Robot Park release (2026-06-30): nearly 90,000 sq ft, Google DeepMind and customer sites, Apollo 3.
  - Apollo 2 page: bipedal and wheeled versions, contact to buy, no price.

### boston-dynamics: changed (3)

- **status_note.text.** Before: "Hyundai Motor Group said its shareholders were pursuing the purchase of SoftBank's entire stake". After: "Hyundai Motor Group said that the group's shareholders in Boston Dynamics were pursuing the purchase of SoftBank's entire stake under the parties' existing agreements". Reason: the statement reads "Hyundai Motor Group shareholders are pursuing the acquisition of SoftBank's entire stake in Boston Dynamics pursuant to the parties' existing agreements"; "its shareholders" was ambiguous. Source: https://www.hyundai.com/worldwide/en/newsroom/detail/0000001225
- **eligibility.explanation.** Two edits:
  - "Hyundai Motor Group, a South Korean group" → "Hyundai Motor Group (whose July 2026 statement is datelined Seoul)". Reason: no cited source states the group's nationality; the only support is the "SEOUL, July 16, 2026" dateline.
  - The same "its shareholders" wording was also corrected.
- **sources[bd-aivi-gemini].published_at.** 2026-04-08 → 2026-04-14. Reason: the page shows no visible date. Its structured data gives datePublished 2026-04-14. "04/08/2026" in the text is the date the feature went live for customers, not the post date. Source: https://bostondynamics.com/blog/aivi-learning-now-powered-google-gemini-robotics/
- **Verified:**
  - 2021 release: "controlling interest", "Post-closing, the Group holds an 80 percent stake… SoftBank, through one of its affiliates, retains the remaining 20 percent".
  - The Next Web (2026-06-19): 9.65% remaining, with Hyundai affiliates plus the executive chair holding "just over 90%". It is labeled as news in the record.
  - HMG statement: Atlas at HMGMA from 2028 for parts sequencing.
  - Waltham release (2026-06-24): the "existing headquarters", 323,000 sq ft, and consolidation of three nearby locations.
  - Terms (2022-06-14): 200 Smith Street, Waltham.
  - Privacy policy (2025-03-20): names Boston Dynamics, Inc.
  - Careers: jobs are mostly in Waltham.
  - About page: 1992, spun off from the MIT Leg Lab.
  - Product pages:
    - Spot: payload capacity, API/SDK, contact sales.
    - Atlas: "select number of early adopters", Hyundai field testing.
    - Products page: Stretch's vision system, arm, case handling and trailer unloading.
    - Orbit: AWS-hosted cloud, Site Hub, VM.
  - AIVI blog: Gemini and Gemini Robotics ER 1.6.
  - LBM blog (datePublished 2025-08-20): TRI collaboration, 450M-parameter diffusion transformer, 30Hz; no release.
  - Spot SDK LICENSE: "licensed solely and exclusively for use with products offered for sale by Boston Dynamics", with software simulators allowed.
- **Ownership fields.** `ownership_category: unit-of-another-organization` with no parent slug is kept. It is consistent with a documented controlling interest, and Hyundai Motor Group has no catalog record. The record does not claim `us-control`; eligibility rests on the documented Waltham headquarters, which is a sufficient basis under ELIGIBILITY.md.

### waymo: verified — no changes

- **Terms** (effective 2018-02-20): "Waymo LLC … located at 1600 Amphitheater Parkway, Mountain View, CA 94043".
- **Privacy policy:** last updated 2026-09-17, Waymo LLC.
- **About page:** 2009, "The Google self-driving car project begins"; 2016, "Waymo was established under Alphabet".
- **Alphabet annual report PDF:** downloaded with curl and read in full text. See the special-attention item above for the Other Bets, consolidated VIE and noncontrolling-interest text. Exhibit 21.01 was also checked.
- **February 2026 post:** Alphabet is "our majority investor".
- **FAQ:**
  - "Anyone can take a fully autonomous ride…"
  - Service is available 24/7.
  - Uber is used in Austin and Atlanta.
  - Jaguar I-PACE vehicles run the fifth-generation Driver; the Ojai vehicle runs the sixth generation and is available in Phoenix, LA and SF, "with more cities to come".
- **Waymo Driver page:** lidar, cameras, radar, compute.
- **Business page:** commute, events and travel.
- **December 2025 foundation model post:** encoder, a driving VLM built with Gemini and fine-tuned on Waymo data, a world decoder, and the Driver/Simulator/Critic. No release is mentioned.
- **Other sources:** the 2019 dataset post (2019-08-21) and the research page, which lists publications.
- **Openness summary:** consistent with the license findings for the two artifact records.

### tau-bench: changed (4)

- **eligibility.explanation.** "Sierra's own blog presents τ-bench and τ²-bench as its open-source benchmarks" → "Sierra's own blog says Sierra introduced τ-bench, presents τ²-bench as building on it, and links to this repository". Reason: the cited post does not use the words "open source". Source: https://sierra.ai/blog/benchmarking-agents-in-collaborative-real-world-scenarios
- **license_notes.text.** Reworded to say that the domains README (src/tau2/domains/README.md) places each domain's data under data/tau2/domains/<domain_name>. Reason: the old text mixed up the two paths; both exist.
- **checklist.tasks_data.note.** Now says the README documents per-domain data files. Reason: file sets differ by domain; for example, telecom uses db.toml and banking_knowledge has no policy.md.
- **checklist.limitations.note.** The pre-1.0.1 non-comparability claim is narrowed to the banking_knowledge domain; other domains are unaffected. Sources: README and the v1.0.1 release notes.
- **Verified:**
  - Release v1.0.1 and its tag are both dated 2026-07-22, which matches `released_at`. pyproject version is 1.0.1, and a pre-v1.0.1 tag exists.
  - `requires-python` is ">=3.12,<3.14".
  - LICENSE: MIT, "Copyright (c) 2025 Sierra Research".
  - Domains: mock, airline, retail, telecom, banking_knowledge. Voice is full-duplex.
  - arXiv 2506.07982 is dated 2025-06-09.

### waymo-open-dataset: changed (5)

- **license_notes.text** (three edits; source https://waymo.com/open/terms/ and the per-folder PATENTS files):
  - Permitted uses: "research benchmarking only" → "benchmarking for academic or applied research publication only", which is the exact scope of the license's "Non-commercial Purposes" definition.
  - Redistribution: now notes the de minimis exception ("Apart from small extracts used as illustrations in publications…").
  - Patent license: "limited to use with the dataset under that agreement" → "Code in each wdl_limited subfolder also carries a limited patent license that covers only the use case that license sets out in connection with the dataset, in compliance with the data license". Reason: each subfolder's PATENTS file names a narrower use (camera, camera_segmentation, sim_agents_metrics).
- **checklist.provenance.note.** "the Motion maps cover …" → "the Motion dataset's map locations include …". Reason: the about page says "Locations include".
- **checklist.documentation.note.** Now says the site "notes its latest updates" and the repository holds "a release history". Reason: the site gives only last-updated notes; version history is in the repository's LOG.md.
- **Verified:**
  - License title and version: "…(March 2025)".
  - Repository LICENSE: "Copyright © 2023 Waymo LLC"; Apache-2.0 outside wdl_limited, with BSD-3-Clause text for the wdl_limited subfolders.
  - README metadata still names the "(August 2019)" license.
  - Segment counts 2,030 / 103,354 / 5,000.
  - FAQ: "should not be considered an open source license"; faces and license plates are blurred.
  - Download pages redirect to Google sign-in.
  - The 2019 post: 1,000 segments in Phoenix, Kirkland, Mountain View and San Francisco.
  - arXiv dates.
- **Availability status stays `partial`.** The reason is the sign-in and registration gate, not the non-commercial license; this matches OPENNESS.md, where `public` may still carry license terms.

### waymax: changed (3 fields, 1 source added)

- **summary.text.** "simple simulated agents" → "simulated agents". Reason: the README describes "intelligent sim agents" and the paper describes learned and hard-coded behavior models.
- **license_notes.text.** Two edits:
  - "The current text also forbids …" → "The license also forbids …". Reason: the file's commit history (commits of 2023-10-18, 2023-10-18/20 and 2024-03-22) shows the AI prohibition was present from the first version.
  - Added that setup.py's package metadata says `license='Apache-2.0'`, while setup.py's own header and the LICENSE file apply the non-commercial agreement. `waymax-setup` was added to `source_ids`.
- **checklist.release_status.** `partial` → `not_public`. Reason: the rubric asks "Are versioned releases published?" The GitHub releases page says "There aren't any releases here", the releases and tags API return empty lists, and no PyPI package exists for the project. The note is updated, and a new source `waymax-releases` (https://github.com/waymo-research/waymax/releases) was added. This is a judgment call; an editor may revert it to `partial` if a declared version number (0.1.0 in setup.py) should count.
- **Verified:**
  - License title and heading: October 17, 2023.
  - Restrictions in §2.b, §2.c and §2.e.
  - `applies_to: all`: the licensed materials include software, code, data and documentation.
  - README: JAX, Waymo Open Motion Dataset, bounding boxes, dm-env and Brax, GPU/TPU, pip install from main, WOSAC tutorial.
  - setup.py: 0.1.0, Python >=3.10, jax>=0.4.6, tensorflow>=2.11.0.
  - arXiv 2310.08710 (2023-10-12).
- **Availability stays `public`.** The code is on GitHub with no access gate, and the license terms are recorded separately.

## Could not verify / follow-up for an editor

- **Midjourney and Character.AI** rely on App Store EU trader addresses because their own sites return 403 to automated requests. That covers midjourney.com, docs.midjourney.com, character.ai and character.ai/tos (policies.character.ai redirects there).
  - The records now say exactly what the source is.
  - Midjourney's trader address (South San Francisco) differs from the city in the complaint's allegation (San Francisco).
  - An editor with browser access may want to confirm both companies' own terms pages.
- **Character.AI's future** is unclear after the September 2026 team move to Disney. The company says "The app is still live and online". Re-review soon.
- **Boston Dynamics:**
  - The purchase of SoftBank's remaining stake is not confirmed as closed; re-check for an official closing announcement.
  - `ownership_category: unit-of-another-organization` with no parent slug is kept. An editor may prefer `privately-held`.
  - The org publishes `spot-rl-example` (MIT, per GitHub), a demo for deploying reinforcement-learning policies on Spot. It is not mentioned in openness_summary. Its README runs a "Default Model 15k Steps" from an external models directory; whether policy weights are included was not confirmed, because the GitHub API rate limit was hit. The openness summary's statement ("this catalog has no record of public model weights") remains literally accurate.
- **Agility Robotics:** the merger with Churchill Capital Corp XI was still pending as of the latest EDGAR filings (Form 425 on 2026-09-17). Update ownership if it closes. The investors page mentions an investor day on 2026-10-06.
- **Skild AI:** the headquarters label (Pittsburgh) rests on datelines, the boilerplate and Technical.ly. Most job listings are in San Mateo, and no official page says "headquarters". Eligibility is unaffected, but the label may need revisiting.
- **Luma AI:**
  - The headquarters city conflicts: Redwood City on the careers and llm-info pages, Palo Alto in the terms and the 2023 Form D.
  - The IMM checkpoints' license conflicts: Hugging Face metadata says Apache-2.0, but the license file is CC BY-NC-SA 4.0.
  - It was not possible to see how API keys are issued, because the page is behind sign-up.
- **Runway:** the only Form D is from 2022, and no current Runway page says "headquarters".
- **Waymo Open Dataset:**
  - It was not possible to see whether registration is a click-through or needs approval (no sign-in was attempted). This affects whether `availability` could be `public` instead of `partial`.
  - The `wdl_limited` license entry links to the top-level LICENSE, which holds the BSD text; the patent grants are in the per-folder PATENTS files.
  - The `wod-home` source title is "Waymo Open Dataset", while the page's HTML title is "About – Waymo Open Dataset". Left unchanged.
- **Waymax:** the `release_status` change to `not_public` is a judgment call; see that record.
- **Tooling notes:**
  - The Variety-hosted complaint PDF redirects WebFetch to a paywall host (tollbit), but `curl` with a generic User-Agent retrieved the PDF directly.
  - The Character.AI 2024 post is cited from its Internet Archive snapshot, because the original URL returns 404.
  - The GitHub API unauthenticated rate limit was reached during checks; web pages were used instead.
- **Material status changes confirmed today:** Anysphere is a wholly owned subsidiary of SpaceX (8-K, 2026-08-14). Windsurf has been renamed Devin Desktop under Cognition. The Agility SPAC merger is pending. Hyundai Motor Group's shareholders in Boston Dynamics are pursuing SoftBank's remaining stake, and closing is not confirmed.
