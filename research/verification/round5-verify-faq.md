# Round 5 verification: FAQ (`round5-verify-faq`)

Checked on 2026-10-08. I fetched every source myself today with curl
(`-A "USASI-factcheck/0.3"`). No email address, name, or other identifier went into any
URL, header, or payload. I used no browser tools and did not try to get past any bot check.

File checked: `content/pages/faq.mdx` (writer's notes: `research/notes/round5-faq.md`).
I edited only `faq.mdx`.

## Result

- 28 questions in 5 groups. I checked each sentence against its linked source, the
  explainer it points to, and the site's own pages (about, methodology, contribute,
  disclaimer, reuse, privacy, `ELIGIBILITY.md`).
- **8 corrections**, listed below. Everything else was already correct as written.
- After the edits the page compiles with `@mdx-js/mdx` (`ok`).
  `npx tsx scripts/validate.ts` gives 0 errors and 1 warning that was already there.
- **Extraction check.** I ran the same regex that `parseFaq` in `lib/reference-search.ts`
  uses. Every first paragraph after an `<h3 id>` is one line of plain prose with 2 to 4
  sentences. None has an in-page `#` link or depends on another answer. After the fixes,
  no extracted answer contains a stray backslash or a stripped character.
- **External links.** All 36 unique external links returned HTTP 200 today.
- **Internal links.** All of these resolve:
  - every `/learn/<slug>/` is in `lib/learn.ts` (22 explainers), and `/learn/paths/new-to-ai/`
    is a path id there. Each explainer's link text matches its title.
  - `/open/gpt-oss/`, `/open/ollama/`, `/open/llama-cpp/`, `/open/model-context-protocol/`,
    `/companies/openai/`, and `/companies/nist/` are all `publication_status: published`.
  - the hubs local-ai, evaluation, and safety-and-security are published, and the link text
    matches each hub title.
  - all 14 glossary anchors exist in `glossary.mdx`.
  - these site anchors exist: about#what-it-is-not, #contact, #licenses;
    methodology#eligibility, #uncertainty, #counts, #news, #jobs; contribute#corrections,
    #new-entries; disclaimer#independence, #not-certification, #not-advice;
    learn-ai-history#federal-policy; learn-policy-sources#names-and-dates.
  - routes exist for /start/, /changelog/, /jobs/, /news/, /reuse/, /privacy/, and
    /learn/paths/[id]/.
  - The FAQ does not link to /find/, /licenses/, or /policy/. Those routes exist now, so
    there is nothing broken.
- **Tone.** No predictions, superlatives, prices, or counts of users or staff. Numbers that
  appear are technical (16GB, 80GB), dates, or version numbers.
- **Site claims.** No answer says that any page was reviewed by a person. The FAQ does not
  mention the newsletter or give explainer or path counts, so the beehiiv change and the
  22 explainers / 5 paths need no edits.

## Blocked sources (retried once today)

| Host | Result today | Effect on the FAQ |
| --- | --- | --- |
| openai.com (introducing-gpt-oss, chatgpt/overview) | 403 bot-check page | "Is ChatGPT open source?" now rests only on the gpt-oss model card (arXiv) and its Hugging Face card. I rewrote two sentences that claimed more than those documents support (see changes 2 and 3). |
| help.openai.com | 403 bot-check page | Not used. |
| www.ftc.gov (homepage) | 404 to this client | No FTC claim in "Who regulates AI". The answer lists document types with "such as" and does not claim to be complete. |
| www.bls.gov OOH (data-scientists) | 403 Access Denied | The jobs answer makes no BLS claim. It only describes the careers explainer and cites O*NET and Apprenticeship.gov. |

## Changes (before → after, with source)

1. **what-is-an-llm** (the token definition was too absolute)
   - Before: "a token is a word, part of a word, or a single character."
   - After: "a token can be a word, part of a word, or a single character."
   - Source: Google MLCC ("a token can be a word, a subword ... or even a single
     character"). The glossary `#token` entry also lists bytes.

2. **is-chatgpt-open-source**, sentence 1 (overclaim). The old wording implied gpt-oss is
   OpenAI's only open model. The catalog itself publishes OpenAI's Whisper and CLIP as open
   models, and the model card does not say gpt-oss is the only one.
   - Before: "...ChatGPT is a product OpenAI runs, and OpenAI's open models are a separate
     line called gpt-oss."
   - After: "...ChatGPT is a product OpenAI runs, and gpt-oss is a separate line of OpenAI
     models that can be downloaded."
   - Source: gpt-oss model card, arXiv 2508.10925 (the models' personality is "similar to
     models served in our first-party products like ChatGPT"). The HF gpt-oss-20b card has
     the downloadable weights. The catalog has `content/artifacts/whisper.yml` and
     `clip.yml` (OpenAI, published).

3. **is-chatgpt-open-source**, sentence 3 (the same overclaim)
   - Before: "The models OpenAI does publish for download, [gpt-oss-120b and gpt-oss-20b],
     are what it calls open-weight models, released under..."
   - After: "OpenAI calls [gpt-oss-120b and gpt-oss-20b] open-weight models, released
     under..."
   - Source: gpt-oss model card, introduction ("two open-weight reasoning models available
     under the Apache 2.0 license and our gpt-oss usage policy").

4. **spot-ai-content**, SynthID wording
   - Before: "adds invisible watermarks"
   - After: "adds imperceptible watermarks"
   - Source: the SynthID page says watermarks go into images, audio, text, or video and are
     "imperceptible to humans". The audio ones are inaudible, not invisible.

5. **spot-ai-content**, last sentence (overstated)
   - Before: "A credential or watermark you find is real evidence, but finding none proves
     nothing."
   - After: "A valid credential or a detected watermark is real evidence about a file's
     origin, but finding none proves nothing."
   - Sources: the explainer `learn-ai-content-provenance` opening, which says "A valid
     credential or a detected watermark is real evidence about a file's origin". The C2PA
     Explainer 2.2 says Content Credentials do not judge whether provenance data is "true".

6. **agi-and-superintelligence**, scope of EO 14434
   - Before: "In U.S. federal documents, "Super Intelligence" has a separate, official
     meaning:"
   - After: "In U.S. executive-branch documents, "Super Intelligence" has a separate,
     official meaning:"
   - Source: EO 14434 (Federal Register PDF, govinfo).
     - Sec. 2(a) applies to "nonstatutory documents within the executive branch".
     - Sec. 3(a) defines the terms "For purposes of this order".
     - Statutes and other branches are not covered.

7. **ai-jobs**, extraction defect
   - Problem: `parseFaq` strips `*` and turned "O\*NET OnLine" into "O\NET OnLine" in the
     search index and the FAQPage structured data.
   - Before: "The Department of Labor's O\*NET OnLine, for example, describes [data
     scientists] ... and its Apprenticeship.gov site has..."
   - After: "A Department of Labor occupational profile, for example, describes [data
     scientists] ... and the Department's Apprenticeship.gov site has..."
   - Source: the O*NET 15-2051.00 page says "by U.S. Department of Labor, Employment and
     Training Administration". The Apprenticeship.gov page footer says "U.S. Department of
     Labor". The Sources list still names O\*NET OnLine; that list is not extracted.

8. **what-gets-included** (wording now matches the site page)
   - Before: "documented control by a U.S. entity"
   - After: "documented primary control by a U.S. entity"
   - Source: methodology#eligibility ("documented as primarily controlled by a U.S.
     entity") and `ELIGIBILITY.md` (`us-control`).

## Claims confirmed as written (summary)

### AI basics

- 15 U.S.C. 9401(3): the definition is quoted exactly. Pub. L. 116-283, div. E, short
  title "National Artificial Intelligence Initiative Act of 2020". The same page defines
  "Initiative" as the one "established under section 9411(a)".
- Dartmouth proposal: dated August 31, 1955, with "artificial intelligence" in its title;
  it proposes a study in summer 1956 at Dartmouth College.
- Google MLCC: "predict a token or sequence of tokens, sometimes many paragraphs worth of
  predicted tokens". The page summary says training on massive datasets lets models learn
  patterns and generate text based on probabilities. "LLMs hallucinate, meaning their
  predictions often contain mistakes."
- Anthropic context windows: the quote is exact. A 400 error is returned when the input
  alone exceeds the window. Compaction summarizes earlier parts of a conversation and is
  in beta.
- arXiv 2509.04664: submitted September 4, 2025. Authors are from OpenAI (3) and Georgia
  Tech (1), per the OpenAI PDF. The abstract says training and evaluation "reward guessing
  over acknowledging uncertainty".
- Anthropic, Reduce hallucinations: "don't eliminate them entirely" and "Always validate
  critical information".
- Anthropic, Building effective agents (Dec 19, 2024): "dynamically direct their own
  processes and tool usage"; workflows use "predefined code paths".
- MCP spec, Version 2026-07-28: "Hosts must obtain explicit user consent before invoking
  any tool". MCP "cannot enforce these security principles at the protocol level".

### Open models

- OSAID 1.0: the four freedoms; the preferred form as a precondition; Data Information,
  Code, and Parameters under OSI-approved terms.
- gpt-oss model card (PDF dated August 5, 2025; arXiv submitted August 8):
  - the "different risk profile" passage and the "revoke access" passage;
  - "model card, rather than a system card" ... "wide range of systems";
  - Preparedness Framework evaluations.
- HF gpt-oss-20b card: 20b runs "within 16GB of memory"; 120b runs on "a single 80GB GPU".
  The LICENSE (Apache) and USAGE_POLICY files are present.
- Ollama FAQ: "We don't see your prompts or data when you run locally"; cloud models
  "we process your prompts and responses". The Ollama and llama.cpp READMEs describe
  downloading and running models.

### Privacy, evidence, and safety

- Anthropic privacy policy (effective September 10, 2026): it may train on inputs and
  outputs "unless you opt out through your account settings", with exceptions for
  conversations flagged for safety review.
- Gemini Apps Privacy Hub (last updated Sept 24, 2026): with Keep Activity on, activity is
  used "including training generative AI models".
- OpenAI data controls: API data is not used to train "unless you explicitly opt in".
- NIST AI 100-4:
  - "no silver bullet";
  - metadata "often stripped when content is disseminated";
  - false positives "can be extremely damaging" in many contexts.
- C2PA Explainer 2.2: a "cryptographically bound structure that records an asset's
  provenance"; no value judgments on whether provenance is "true".
- SynthID: its detector checks content "made with AI from Google or our partners".
- NIST CAISSI blog (December 2, 2025): models cheated on "agentic coding and cyber
  benchmarks", including by using the internet to find walkthroughs and answers for CTF
  challenges.
- DeepMind Frontier Safety page: Version 3.1 (17 Apr 2026); identify capability levels;
  prepare mitigation plans.
- Anthropic RSP page: last updated Aug 14, 2026; Version 3.4 effective July 8, 2026.

### Policy, terms, and careers

- Levels of AGI (v5, Google DeepMind affiliations): "Many AI researchers and organizations
  have proposed definitions"; "nine prominent examples"; levels by depth and breadth; ASI
  is "able to do a wide range of tasks at a level that no human can match".
- EO 14434: Secs. 2(a), 2(b), 3(a), 3(b) and the September 29, 2026 date match. The White
  House page matches. The NIST super-intelligence page says NIST is "working to update its
  communications ... as directed".
- M-25-21: dated April 3, 2025, and addressed to agency heads on federal use of AI.
- NIST AI RMF page: "intended for voluntary use"; "being revised".
- O*NET Data Scientists: description paraphrased closely.
- Apprenticeship.gov: an AI in Registered Apprenticeship portal exists.

### Consistency and USASI answers

- The answers match their explainers: how-language-models-work, tokens-and-context-windows,
  how-models-use-tools, agents-and-robotics, open-weight-vs-open-source, hosted-or-local,
  how-to-read-a-model-card, ai-and-your-data, ai-content-provenance, reading-evaluations,
  safety-testing-and-frameworks, ai-history#federal-policy,
  policy-and-standards-sources#names-and-dates, and careers-in-ai.
- All ten USASI answers match about, methodology, contribute, disclaimer, reuse, privacy,
  and `ELIGIBILITY.md`. That covers eligibility, review levels, news since Oct 1, 2026,
  rubric v0.2 (`lib/openness.ts`), the contact email on /about/#contact, CC BY 4.0 and MIT,
  and no cookies or storage. A grep of app/, components/, and lib/ found no storage APIs.

## For the editor

- "Is ChatGPT open source?" still does not say outright that ChatGPT's models are closed.
  OpenAI's own product pages, which would be needed for that, were blocked. If they become
  reachable, a direct sentence could be added.
- The /policy/ and /licenses/ routes now exist. "Who regulates AI" and "What does open
  source mean" could add them to their "Read more" lines. I did not add them because they
  are optional, not corrections.
