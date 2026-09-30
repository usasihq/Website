# Research notes: r2-ai-apps

Researcher group: r2-ai-apps. Research date: 2026-09-29. `npx tsx scripts/validate.ts`: no errors or warnings in this group's files. The one remaining error in the run is in another group's file.

Files created:
- `content/organizations/`: anysphere, cognition, runway, midjourney, luma-ai, character-ai, glean, sierra
- `content/artifacts/`: tau-bench

Every file is `published` and `eligible`. No funding, valuation, revenue, user-count, or staff-count figures were recorded. Several fetched pages contained them (Cursor/SpaceX deal value, Cognition run-rate, Luma/Humain round, Glean valuation, Runway users); all were left out on purpose.

## Organizations

### anysphere: published (subsidiary of spacex)
- **Material change:** SpaceX's Form 8-K (event date 2026-08-14) says its merger subsidiary merged into Anysphere, Inc., and Anysphere survived as a **wholly owned subsidiary** of Space Exploration Technologies Corp. SpaceX is a Texas corporation based in Starbase, TX. Cursor's own post of 2026-08-14 says "Cursor is now a part of SpaceX".
- **How the record reflects it:** `parent_org_slug: spacex`, `parent_relationship: subsidiary`, `ownership_category: unit-of-another-organization`. The spacex record now exists, from another group.
- **Eligibility basis:** us-headquarters. The ToS (2026-09-03) and MSA (2026-08-13) name Anysphere, Inc. at 2261 Market St STE 86466, San Francisco. The explanation also notes the U.S. parent.
- **Evidence gaps:**
  - The ToS address is a suite/mailbox-style address.
  - No official page says "headquarters".
  - Legal form (state of incorporation) and founding year were not found, so both are null.
- **Products:** Cursor (editor and agents), Cursor CLI, Bugbot. All are `developer-tool`.
- **Worth knowing:** Cursor's models page lists its own Composer models and "Grok" models "jointly trained by Cursor and SpaceXAI". No public weights were found.

### cognition: published
- **Windsurf, documented facts only:**
  - 2025-07-14: Cognition signed a definitive agreement to acquire Windsurf's "IP, product, trademark and brand" and its people.
  - A 2026-07-14 retrospective describes the Windsurf team as welcomed into Cognition.
  - 2026-06-02: Devin Desktop was introduced as "the next generation of Windsurf". devin.ai/desktop calls it "the new name for Windsurf", and windsurf.com now 308-redirects there.
  - The platform terms (2026-06-30) refer to "Devin Desktop (fka Windsurf)". Legacy users who enrolled under **Exafunction, Inc.** still contract with that entity unless their agreement is assigned.
  - I did **not** claim that Cognition acquired the Exafunction legal entity; no source says so.
- **Eligibility basis:** us-headquarters. The terms name Cognition AI, Inc. at 550 Third Street, San Francisco. The careers page shows a San Francisco office. No page uses the word "headquarters".
- **Products:** Devin, Devin Desktop, Devin CLI (all `developer-tool`).
- **Openness:**
  - SWE-2 (2026-09-10) is "post-trained from Kimi K3". The post does not name Kimi K3's developer. It is Moonshot AI's model (non-U.S.), but that is not stated in a source I cite, so the record does not say it.
  - The verified HF account `cognition-ai` has one model, Kevin-32B, fine-tuned from Qwen/QwQ-32B. Its license is not visible on the card, so no artifact was created.
- **Not included:** The Interaction Company (maker of Poke) "joining" Cognition (blog, 2026-07-23). The post says "welcoming", not "acquired", so the fact was omitted.
- **Domains:** cognition.ai now 301-redirects to cognition.com.

### runway: published
- **Eligibility basis:** us-headquarters.
  - The 2022 SEC Form D gives Runway AI Inc. as a Delaware corporation, incorporated 2018, with its principal place of business at 79 Walker St, New York.
  - The about page lists offices in New York, San Francisco, Seattle, London, Paris, Tel Aviv, and Tokyo.
  - The ToS (2026-09-15) applies New York law and venue. Its notice address is a registered-agent address in Dover, DE.
- **Evidence gaps:** The Form D is from 2022. No current official page says "headquarters". runwayml.com now redirects to runway.com.
- **Products:**
  - The Runway app is `other`, consistent with Adobe Firefly.
  - The Runway API (Runway Dev) is `hosted-model-api`. It also serves third-party models such as Seedance 2.5 and GPT Image 2.
- **Sectors:** left empty. Runway also shows a "Runway Robotics" toolkit and world models (GWM-1), but I did not assess these in depth.
- **Not recorded:** Runway co-released Stable Diffusion 1.5 in 2022. This was not researched, since no current public weights were verified.

### midjourney: published (weakest evidence in the group; reviewer may prefer draft)
- **Blocked sites:** midjourney.com, docs.midjourney.com (ToS/privacy), and nijijourney.com all return **403 / a Cloudflare challenge**. I did not try to get past it.
- **Identity and HQ:**
  - The App Store EU trader information (Ireland storefront) names Midjourney, Inc. at 611 Gateway Blvd Ste 120, South San Francisco, CA. This is a self-declaration.
  - The Disney/Universal complaint (C.D. Cal. 2:25-cv-05275, filed 2025-06-11, copy hosted by Variety) says Midjourney, Inc. is "duly incorporated in Delaware with its principal place of business in San Francisco". This is the plaintiffs' allegation, which is why legal_form cites it with that framing.
- **HQ label:** South San Francisco, taken from the company's own declaration.
- **Products and URLs:**
  - Product sources are updates.midjourney.com posts: the V1 video model (2025-06-18), V8.1 alpha (2026-04-14), and V8.1 as default (2026-06-11).
  - The Midjourney product URL points to updates.midjourney.com because midjourney.com could not be fetched.
  - Search snippets say V8.2 became the default on 2026-07-24. I could not fetch that post, so the record only says V8.1 became default in June 2026.
- **Openness:** The GitHub org holds only forks of third-party libraries plus a deprecated docs repo. No weights exist.
- **Not recorded:** The reported Meta–Midjourney licensing arrangement (2025, news) was not researched or recorded.

### luma-ai: published
- **HQ conflict:**
  - The careers page ("Headquarters: Redwood City, CA") and lumalabs.ai/llm-info (Headquarters: Redwood City) both say Redwood City.
  - The ToS (2026-05-14) gives 715 Alma St, Palo Alto. The homepage careers blurb says "team in Palo Alto". The 2023 Form D gives Palo Alto and Delaware, incorporated 2021.
  - The record uses Redwood City and explains the difference. Both cities are in California.
- **Eligibility basis:** us-headquarters.
- **Not recorded:** HUMAIN (Saudi, PIF-owned) led a 2025 round. News reports call its stake significant but undisclosed, and nothing documents control. It was not recorded, because funding is excluded and a minority stake is not control. A reviewer may want to watch this.
- **Also noted:** a Riyadh office appears on the careers page.
- **Products and URLs:**
  - "Dream Machine" branding is gone: /dream-machine redirects to /app, which is titled "Luma Agents". The SDK repos still say "Dream Machine SDK".
  - Products: Luma Agents (`other`) and the Luma API (`hosted-model-api`, Ray3.2 and Uni-1.1).
- **Openness:** Apache-2.0 SDKs. The IMM research repo links CIFAR-10/ImageNet-256 checkpoints on HF; GitHub reports its license as NOASSERTION and I did not verify it, so no artifact was created.

### character-ai: published
- **Google relationship (as asked, stated precisely):**
  - The 2024-08-02 official post "Our Next Phase of Growth" now returns 404 live. I read it via an Internet Archive snapshot fetched with curl today, and the record cites that snapshot.
  - It says Character.AI gave Google a **non-exclusive license for its current LLM technology**. The co-founders and certain research-team members joined Google, and most staff stayed.
  - The record says explicitly that this is a license-and-hiring arrangement, not an acquisition or ownership.
  - Funding amounts in news reports were not recorded.
- **New (2026-09-18):**
  - Character.AI's blog and Disney's release both say Character.AI's CEO is joining Disney as CTO, and that members of Character.AI's technical team are expected to follow.
  - Neither announcement mentions an acquisition, license, or investment. Character.AI says "The app is still live and online. We will continue to share more information."
  - Recorded in status_note without naming the executive, because leadership changes are not tracked. **Re-review soon**: the company's future is unclear.
- **HQ:** character.ai and policies.character.ai return 403. The App Store EU trader information names Character Technologies, Inc. at 301 High St, Palo Alto. Older lawsuits (not fetched) reportedly said Menlo Park.
- **Eligibility basis:** us-headquarters.
- **Founded:** left null. The 2024 post says "Back in 2022, we founded Character.AI", which conflicts with the commonly reported 2021.
- **Openness:**
  - CAI-Image models are post-trained from Qwen-Image. No weights are released.
  - The GitHub org includes Ovi (Apache-2.0 repo, with Yale co-authors, video branch initialized from Wan2.2). Its weights are hosted in a personal HF account and their license was not verified, so no artifact was created.
- **Hiring URL:** null, because the careers page is blocked.

### glean: published
- **HQ:** San Francisco.
  - The current ToS PDF (dated 2026-06-05; glean.com/legal/terms 301-redirects to it) says "Glean Technologies, Inc., a Delaware corporation, headquartered at 634 2nd Street, San Francisco".
  - The about-page footer shows the same address, and an Aug 2026 press release is datelined San Francisco.
  - The about page's JSON-LD structured data still gives 260 Sheridan Ave, Palo Alto. This is noted in the explanation.
- **Founded:** 2019, from the about page (foundingDate 2019-01, and the timeline says "Glean is founded").
- **Products:**
  - Glean Assistant is `assistant-app` (compare Adobe's Acrobat AI Assistant).
  - Glean Agents is `enterprise-software`.
  - The Developer Platform is `developer-tool`.
- **Openness:** The ToS says the platform supports multiple third-party LLMs. The MIT client libraries were verified via the LICENSE file.
- **Evidence gap:** The careers page displayed "no job posts" when fetched, though it is the official careers page.

### sierra: published
- **Eligibility basis:** us-headquarters.
  - The modern slavery statement (last updated 2026-02-04) says Sierra Technologies, Inc. "is a Delaware corporation, is headquartered in San Francisco". It also names the UK subsidiary Sierra Technologies Ltd.
  - The careers page says "headquartered in San Francisco". The website terms (2024) give 150 Sutter St.
- **Products:** Agent Studio, Ghostwriter, Channels (all `enterprise-software`).
- **Gaps:**
  - The pages reviewed do not say which LLMs Sierra uses.
  - No founding year appears on the about page.

## Artifacts

### tau-bench: published (eval, project)
- **Scope:** the sierra-research/tau2-bench repository, currently at τ³-bench, release **1.0.1** of 2026-07-22.
- **License:** MIT, from the LICENSE file (copyright "Sierra Research"). It covers code; domain data (tasks, policies, DBs) is in the same repo and is noted in license_notes.
- **Eligibility basis:** us-governed-project, via Sierra's GitHub org, the license holder, and Sierra's own τ²-bench blog post.
- **Checklist:** code, tasks_data, methodology, and reproducibility are `public`. limitations is `partial`: comparability break at 1.0.1 and the reference-trajectory caveat, with no general validity discussion found.
- **Not recorded:** No scores and no leaderboard content (taubench.com was not fetched).
- **Not covered:**
  - The original `sierra-research/tau-bench` repo.
  - τ^τ-bench (hyper-τ-bench, Sept 2026, news only).
  - A reviewer may prefer separate records for these.

## Surprising or ambiguous items for review
1. **Anysphere/Cursor is now owned by SpaceX** (closed 2026-08-14). SpaceX also owns xAI, so the xai and anysphere records now share a parent.
2. **Windsurf no longer exists as a brand.** It is Devin Desktop.
3. **Character.AI technical team moving to Disney** (announced 2026-09-18). This is a second "team departs, company continues" event after the 2024 Google deal. Status is unclear; re-review.
4. **Midjourney and Character.AI** rely on App Store EU trader addresses because their own sites block automated fetching. Midjourney additionally relies on a plaintiffs' complaint. A reviewer may prefer draft/pending_review for Midjourney.
5. **HQ conflicts:** Luma (Redwood City vs Palo Alto) and Glean (San Francisco vs Palo Alto in structured data). In both cases I used the newer, explicit "headquarters" statement.
