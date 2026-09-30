# frontier-1 research notes (2026-09-29)

Group: frontier-1. Every cited page was fetched on 2026-09-29, with WebFetch or with curl for
raw files (LICENSE, USAGE_POLICY, README, SEC HTML, PDFs, Hugging Face and GitHub API
JSON).

## Access problems that shaped sourcing

- **openai.com and chatgpt.com returned HTTP 403** to both WebFetch and curl on every page
  tried (about, our-structure, introducing-gpt-oss, careers). The Wayback Machine is also
  blocked for WebFetch. OpenAI facts therefore come from government sources (Delaware AG
  release, California AG MOU), an SEC-filed exhibit (Amazon 8-K Ex. 10.1), OpenAI's CDN
  model-card PDF, Hugging Face, GitHub, developers.openai.com, and learn.chatgpt.com. I did
  not cite any openai.com URL.
- **Most x.ai pages also returned 403.** Only `x.ai/news/xai-joins-spacex` and
  `x.ai/news/grok-os` loaded, so xAI careers, terms, and AUP pages could not be read. The
  xAI hiring_url is null.
- On my early SEC EDGAR requests I sent a made-up contact string in the User-Agent. It was
  not the user's email. After the coordinator's privacy note I switched to a generic UA
  with no email.

## Organizations

### openai: published
- Basis: us-headquarters. The SEC-filed agreement of Feb 27, 2026 lists "OpenAI Group PBC,
  a Delaware public benefit corporation" at 1455 3rd Street, San Francisco. The California
  AG MOU (Oct 27, 2025) commits to keeping the nonprofit and PBC headquarters in
  California.
- Legal form was checked against government sources only. The Delaware AG (Oct 28, 2025)
  calls OpenAI, Inc. a Delaware nonprofit corporation (incorporated 2015) and says the
  nonprofit keeps sole power to appoint and remove PBC directors.
- Material change recorded in status_note: the October 2025 recapitalization into a PBC
  under nonprofit control.
- Gaps:
  - I could not verify from an official page that the nonprofit is now named "OpenAI
    Foundation". The record says "OpenAI's nonprofit, OpenAI, Inc." instead.
  - Search results mention a confidential IPO filing and a later delay. I could not verify
    these officially, so they are omitted and ownership stays privately-held.
  - No careers URL (blocked).
- Products: ChatGPT (learn.chatgpt.com docs), OpenAI API (developers.openai.com), and Codex
  CLI (GitHub). ChatGPT is sourced from its docs site because chatgpt.com is blocked.

### anthropic: published
- Basis: us-headquarters. The privacy policy (Sept 10, 2026) says Anthropic is based and
  headquartered in the U.S. and gives Anthropic PBC's San Francisco address (548 Market St
  PMB, a mailing address). The Irish entity is listed as another location.
- Legal form comes from Anthropic's own LTBT page ("Delaware Public Benefit Corporation")
  and its company page.
- Gaps:
  - Founding year: no official page found, left null.
  - News reports a confidential draft S-1 (June 2026). EDGAR full-text search found no
    public Anthropic S-1, so ownership stays privately-held and the IPO is not mentioned.
- Openness: the Hugging Face org has 0 models and 14 datasets. No Anthropic artifacts were
  assigned to me.

### xai: published (material change)
- **Corporate structure, from SEC filings:**
  - SpaceX 10-Q (Q2 2026, filed Aug 4, 2026): on Feb 2, 2026, SpaceX completed its
    acquisition of X.AI Holdings Corp., which became a wholly owned subsidiary. xAI had
    acquired X Holdings Corp. on Mar 28, 2025. X.AI Corp began operations in March 2023.
  - SpaceX (Space Exploration Technologies Corp.) is a Texas corporation with principal
    executive offices at 1 Rocket Road, Starbase, TX. It completed its IPO in June 2026
    (Nasdaq: SPCX) and reports Grok, X, and AI infrastructure as its "AI segment".
  - The 424B4 prospectus (June 12, 2026) says the corporate headquarters for its AI
    operations after the acquisition is in Palo Alto, California. That is the source for
    the headquarters field. The COLOSSUS data centers are in Memphis, TN, and Southaven,
    MS.
- Branding: x.ai pages now read "SpaceXAI", with a "© 2026 SpaceXAI LLC" footer, and the
  GitHub org name is "SpaceXAI Org". The 10-Q still refers to X.AI Corp. and X.AI LLC as
  subsidiaries. I set the record name to "xAI (SpaceXAI)" and left legal_name null because
  the current legal entity name is unclear.
- Not verified: the Wikipedia/Musk claim that xAI "ceased to exist as a separate company"
  in May 2026, and the July 2026 rebrand date. Not written into the record.
- **Parent link:** SpaceX is not a canonical slug and has no catalog record, so
  `parent_org_slug` is null. The relationship is described in status_note, with
  ownership_category `unit-of-another-organization`. **Open question for editors:** should
  a `spacex` organization record be added so the parent can be linked?
- Also in the 10-Q, but not recorded: a June 16, 2026 merger agreement with Anysphere
  (Cursor), and lawsuits over Grok image generation.
- Products: Grok (grok.com), xAI API (docs.x.ai), Grok Build (GitHub).

### ssi: published (explicit dual-country assessment)
- ssi.inc states SSI is an American company with offices in Palo Alto and Tel Aviv, and
  names no headquarters.
- The joint NVIDIA–SSI release (GlobeNewswire, Jul 27, 2026) is datelined "SANTA CLARA,
  Calif. and PALO ALTO, Calif." and says SSI was founded in 2024.
- No SEC Form D filed by SSI itself was found on EDGAR.
- Assessment: I treated Palo Alto as the U.S. headquarters and Tel Aviv as a second
  location, with basis us-headquarters. This rests on the company's own statement plus the
  press-release dateline, not on a filing. **Reviewer may prefer pending_review** if a
  filing-grade HQ source is required.
- Recent changes recorded as notable_facts: Daniel Gross left (June 29, 2025), Sutskever
  became CEO and Levy President; NVIDIA partnership (Jul 26/27, 2026).
- Products: none, since SSI says its only product is safe superintelligence. No models or
  weights found.

### thinking-machines-lab: published
- Legal name "Thinking Machines Lab, Inc." comes from the privacy notice and model cards.
  The privacy notice (May 19, 2026) says the company is based in the U.S.
- The service terms (Jan 10, 2026) apply California law with arbitration in San
  Francisco. The Ashby job-board API lists 48 of 49 roles in San Francisco.
- No official page gives a street address. The HQ label "San Francisco, California" is
  an inference from these three sources, and the eligibility explanation says so.
- Not verified: Wikipedia's claims that TML is a public benefit corporation, the 2300
  Harrison St address, and the February 2025 founding. legal_form and founded are null.
- Product: Tinker (hosted LoRA fine-tuning API).

### reflection-ai: published (org only; no artifacts)
- Legal name "Reflection AI, Inc.". The privacy policy (Aug 28, 2026) gives 61 9th Ave,
  Floor 3, New York, NY. The older terms (Feb 19, 2025) gave 300 Kent Ave, Brooklyn, with
  New York governing law.
- The careers page lists New York, San Francisco, London, and Washington, D.C. These are
  not recorded as office locations because they are hiring locations.
- **No model weights verified:**
  - No Hugging Face org or models found.
  - reflection.ai pages describe weights only as a future commitment.
  - The Oct 9, 2025 post announces funding and plans, not a release.
  - A Sept 2026 search result says the first model is due "later this year". Not
    verified, not recorded.
- Products: none recorded. The Asimov agent's blog page rendered no content and
  asimov.reflection.ai returned 503. Third-party pages (Sequoia and others) describe
  Asimov as a code-research agent. **Open item:** add Asimov if an official page can be
  read.

## Artifacts

### gpt-oss (family) + gpt-oss-120b, gpt-oss-20b (releases): published
- License: I read the Hugging Face LICENSE files (standard Apache 2.0 text, identical for
  both sizes) and the GitHub repo LICENSE (Apache-2.0).
- USAGE_POLICY is a single sentence asking users to comply with applicable law, with no
  listed restrictions. The model card PDF (Aug 5, 2025) says the models are released
  "under the Apache 2.0 license and our gpt-oss usage policy".
- Checklist:
  - weights, inference code (PyTorch/Triton/Metal), and evals (repo `gpt_oss/evals`, plus
    model-card results): public.
  - training data: partial (text-only; STEM/code/general; CBRN-filtered; cutoff June
    2024).
  - recipe: partial.
  - training code: unknown.
- Hardware run notes are quoted from OpenAI with MXFP4 precision stated: 120b on a single
  80GB GPU, 20b in 16GB.
- released_at is 2025-08. The model card is dated Aug 5, 2025, but the release-day
  announcement on openai.com could not be read.
- Not created: records for the gpt-oss-safeguard-120b/20b fine-tunes (mentioned in the
  family summary) and for openai/privacy-filter and openai/circuit-sparsity. Candidates
  for later.

### grok (family) + grok-1, grok-2 (releases): published
- The xai-org Hugging Face org has only grok-1 and grok-2. The xai-org GitHub has grok-1
  but no grok-3.
- **Grok 3 open weights were promised (Aug 2025, "about 6 months") but are not
  published** as of 2026-09-29.
- Grok-1: Apache 2.0 for code and weights (read LICENSE.txt and README). Released Mar 17,
  2024. It is a raw base checkpoint that is not fine-tuned.
- Grok 2: the LICENSE file is titled **"xAI Community License Agreement", last updated
  Nov 4, 2025**, and names X.AI LLC as licensor. The README still calls it the "Grok 2
  Community License Agreement". The license:
  - grants a revocable non-commercial and research license;
  - allows commercial use only if xAI's AUP is followed;
  - bans using the materials or their outputs to train other foundation or general-purpose
    models;
  - requires "Powered by xAI" attribution when distributing;
  - is governed by Texas law.
- Grok 2 checklist: inference code marked public via third-party SGLang, with a note. The
  run note gives 8 GPUs with more than 40GB each and fp8 quantization, as the card says.
- Grok 2 released_at is 2025-08. That comes from the Hugging Face repo creation date
  (Aug 22) and TechCrunch (Aug 24, labeled kind: news).
- The prospectus describes Grok as proprietary, so the family availability is `partial`.

### Inkling (candidate name): real, so records created and published
- Inkling is Thinking Machines Lab's open-weight model family. Created:
  - `inkling` (family)
  - `inkling-975b`: Inkling, 975B total / 41B active, released Jul 15, 2026
  - `inkling-small`: 276B / 12B, released Jul 30, 2026
- The slug `inkling-975b` is my own disambiguation because the published name is just
  "Inkling". Editors may prefer a different slug.
- License: the Hugging Face metadata says `apache-2.0` and links to apache.org, but no
  repo contains a LICENSE file. The model cards list "License: Apache 2.0".
- TML's **Model Acceptable Use Policy** (Jul 15, 2026) says it binds anyone who accesses,
  downloads, or uses the model materials, and lists prohibited uses. It does not mention
  Apache 2.0. This is recorded in license_notes. **Ambiguity:** how that binding AUP
  interacts with the Apache grant is a question for editors.
- **Provenance flag:** the Inkling announcement says post-training was bootstrapped with
  SFT on synthetic data generated by open-weights models "including Kimi K2.5" (Moonshot
  AI). TML says it trained the model from scratch, and no foreign base weights are
  involved. Recorded in provenance text with an empty `derived_from`.
- Inkling-Small was post-trained by on-policy distillation from Inkling, recorded in
  `derived_from` with a note.
- The announcement says some reported results came from a checkpoint other than the one
  released. Noted in evaluation_materials.
- Run notes quote the model card's VRAM figures with BF16/NVFP4 precision.
- Also seen but not researched: TML's AUP footer mentions "Interaction" models, and TML
  previewed an interaction system. No released weights were found.

### Reflection AI artifacts: not created
- No verifiable weights (see the organization notes).

## Surprising or ambiguous items

1. The xAI/SpaceX consolidation and the SpaceXAI branding. The parent cannot be linked
   without a `spacex` record.
2. The Grok 2 license was renamed and re-dated (Nov 2025) after release, and the README
   name no longer matches the LICENSE file.
3. The Inkling post-training used synthetic data from a Chinese open-weights model (Kimi
   K2.5).
4. SSI's headquarters rests on its self-description plus a press-release dateline.
5. openai.com was unreachable, so OpenAI's own structure page could not be read.
   Government and SEC sources were used instead.
