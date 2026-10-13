# N1 fact-check — 2026-10-13

I checked all 29 files in `news/`. I fetched every cited source today with unauthenticated
`curl -A "USASI-factcheck/0.3"`, and all 44 URLs returned HTTP 200. I also used unauthenticated
public JSON endpoints for metadata: `api.github.com` for repository creation and release dates, and
`huggingface.co/api/models` for creation dates, gating and licenses. No browser tools, logins or
personal identifiers were used.

Every event date falls between 2026-07-01 and 2026-10-12. None duplicates an item in `EXISTING.txt`
(Sonnet 5.5, Haiku 5.5, GPT-6.1 Sol, Gemini 4 Argon, AMD–World Labs, Character.AI–Disney and the
SpaceXSI docs are all separate events) or a file in `news/N2`–`N5`. N5's METR item on Opus 5.5 is
a separate evaluation event.

## Corrected (9)

- **character-ai-begins-chapter-11-sale-process**
  - Title: "files for Chapter 11 to pursue…" → "begins a voluntary Chapter 11 process to pursue…".
    This matches the company's wording: "initiated a voluntary Chapter 11 bankruptcy process".
  - Petition sentence now follows the Stretto case page exactly: "Character Technologies, Inc.
    d/b/a Character.AI filed a voluntary petition for relief under Chapter 11… administered under
    Case No. 26-11603".
  - "end of November or early December" → "currently expects… end of November or perhaps early
    December 2026", as in the blog FAQ.
  - "for now" → "at this time".
  - Sources: blog.character.ai/an-update-on-character-ai (the company's own announcement) and
    cases.stretto.com/chartech.
- **midjourney-announces-first-acquisition**: removed the gendered pronoun and the founder's first
  name. The text now reads "Co–Star's founder and team… under its founder's control and direction".
  The facts are unchanged (updates.midjourney.com).
- **anthropic-releases-claude-opus-5**
  - "flagged by its safety classifiers" → "flagged by its cybersecurity classifiers". The fallback
    to Opus 4.8 in Claude.ai, Claude Code and Cowork appears in the announcement's cybersecurity
    section.
  - The beta sentence now reads "mid-conversation tool changes on the Claude Platform and automatic
    fallbacks on the API", following anthropic.com/news/claude-opus-5.
- **xai-releases-grok-4-5**: "available in the API console for EU customers" → "in the EU". The
  source says "EU users".
- **google-releases-gemini-3-8-flash-and-flash-cyber**: "a general model aimed at…" → "which Google
  says improves on 3.7 Flash in software engineering, agentic tasks, and multi-step reasoning". The
  source does not call it a general model.
- **google-deepmind-launches-alphagenome-atlas**
  - Cut two counts ("about 9 billion" variants, "more than 2,500" motifs). Scope is now stated as
    "every possible single-letter change".
  - Availability now matches the source: a free portal for non-commercial academic research, the
    AlphaGenome API and an Antigravity skill, with commercial use on Google Cloud planned. The
    earlier draft merged these into "available for academic research through… the API".
- **google-deepmind-releases-synthid-bio**
  - The ProteinMPNN sentence was attributed to the announcement, but it comes from the README. It
    is now attributed to the README.
  - Licensing was overstated: the draft said "repository is licensed under Apache 2.0 and contains…
    the data". The README says software is under Apache 2.0, in vitro validation data under
    CC BY 4.0, and AlphaFold 3 parameters under AF3 terms. The text now says this.
- **cartesia-releases-sonic-3-6**: cut the marketing counts ("61 locales, 11 of them Indic, and more
  than 500 preset voices"). The Odia/Urdu sentence stays (cartesia.ai/blog/sonic-3.6).
- **google-introduces-weathernext-3**: title "trained on live satellite data" → "that uses live
  satellite data". The post says the model ingests live satellite data and trains on station
  observations.

## Checked OK, no change (20)

- **anthropic-releases-claude-fable-5-1-and-mythos-5-1**: release notes dated September 1, 2026;
  announcement confirms same model, trusted access, U.S. organizations only and watermark detection
  API.
- **anthropic-releases-claude-opus-5-5**: announcement dated September 22; release notes confirm
  thinking and tool_choice 400 errors and later Sonnet/Haiku 5.5.
- **cartesia-releases-ink-2**: date July 9; endpointing events, entities and availability confirmed.
- **google-deepmind-introduces-gemini-robotics-2**: datePublished July 30; three models,
  availability and ASIMOV-Agentic confirmed.
- **google-deepmind-releases-alphaprotein-novo**
  - Repo created October 5 per the GitHub API, with commits on October 5–6.
  - README confirms the pipeline, LigandMPNN, AF3 and the bioRxiv link.
  - Software is Apache 2.0. The weights terms say "Last Modified: 2026-10-05", non-commercial.
- **inception-releases-mercury-2-5**: blog index dates Mercury 2.5 to September 8 and Mercury Voice
  GA to September 29; capabilities and channels confirmed.
- **midjourney-releases-version-8-2**: July 24 post and August 27 edit-model post confirmed.
- **openai-releases-gpt-5-6-model-family**: API changelog, July 9 under "July, 2026".
- **openai-releases-gpt-6-astra**: changelog September 3. OpenAI RSS "Safety overview: GPT-6 Astra"
  (September 3) confirms the Critical cybersecurity level. The article page itself returns 403.
- **openai-releases-gpt-6-sol-and-gpt-6-luna**: changelog September 22 and the September 25 fix; RSS
  description confirmed.
- **openai-releases-mcp-extensions**
  - GitHub API shows python-v0.1.0 and node-v0.1.0 on September 29 and v0.2.0 on October 10.
  - README headings, Apache 2.0 and the CHANGELOG 0.2.0 text confirmed.
- **perplexity-releases-pplx-decider-v1-27b**
  - Model card base is Qwen3.8-27B; the HF API shows created October 1, ungated, apache-2.0.
  - Changelog entries are both under "October 2026", which supports month precision.
  - v1.1 card wording confirmed.
- **perplexity-releases-pplx-embed-v2-late**
  - Card text and MIT license confirmed; the citation is dated 2026-10-07.
  - The Perplexity blog itself returns 403, and the item already says the date comes from the
    card's citation.
- **reflection-ai-announces-beam-open-weight-model**: post dated October 5, 2026; specs, red-teaming,
  early access and the Apache 2.0 plan for later in October confirmed. No Reflection weights are on
  Hugging Face yet, so the item is still accurate.
- **runway-releases-ruby-color-grading-model**: changelog entry dated August 20; product page
  confirms 30 s / 4K, formats and video_to_hdr with model ruby.
- **thinking-machines-lab-releases-inkling-open-weights**: datePublished July 15; specs,
  different-checkpoint note confirmed; HF ungated, apache-2.0.
- **thinking-machines-lab-releases-inkling-small**: datePublished July 30; specs, GB300 NVL72 and
  on-policy distillation confirmed; HF ungated, apache-2.0.
- **world-labs-acquires-scenix**: post dated July 21, 2026, with title and quotes confirmed; blog
  index shows "World Labs is Joining AMD" on September 28.
- **world-labs-introduces-atlas-world-model**: September 1; capabilities, Marble and the
  early-access request confirmed.
- **xai-releases-grok-4-7**: release notes September 21 (Grok 4.7, Fast only in Cursor and Grok
  Build) and August 12 (Grok 4.6) confirmed.

Source titles are kept verbatim, including two that carry the publisher's own ranking or
superlative wording (Cartesia Ink-2, WeatherNext 3). This follows existing repo practice, and no
summary repeats them.

## Drafted: 0 · Deleted: 0

## Process notes for the caller

- NOTES.md records that the writer ran `gh api` early in the session. That command sends the
  locally stored GitHub token, which the brief forbids. The writer reports that no email or
  personal data was sent. I did not use `gh` or any authenticated tool.
- `git status` in `/tmp/claude-1000/usasi-wt/people` shows `data/jobs/current.json` modified. I did
  not touch the repository.

## Totals

29 checked · 9 corrected · 0 drafted · 0 deleted · 20 unchanged.

Validator: `29 batch file(s): 0 error(s), 0 warning(s)`.
