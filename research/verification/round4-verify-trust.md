# Round 4 verification: trust (`round4-verify-trust`)

Checked on 2026-10-08. I fetched every source today with curl (`-A "USASI-factcheck/0.3"`).
I did not use a browser or the Browser pane. No request contained an email address, name, or
other identifier. When a site returned 403 or 500, I did not retry it another way.

Files checked:

- `content/pages/learn-safety-testing-and-frameworks.mdx`
- `content/pages/learn-ai-content-provenance.mdx`
- takeaways for both pages in `research/notes/round4-trust.md`

After my edits, both files compile with `@mdx-js/mdx` (`ok`). Both use `<h2 id>` headings,
have no Markdown tables, and end with the Sources section. Prose word counts (without the
Sources list or URLs) are about 1,485 and 1,489, so both are still within 1,500. All 29
external links return HTTP 200, including the Dioptra documentation link I added.
Every internal link resolves to one of these:

- a published record: gpt-oss-20b, dioptra, petri, gpt-oss-safeguard, synthid-bio, nist,
  google-deepmind
- an explainer slug mapped in `app/learn/content.ts`: how-to-read-a-model-card,
  reading-evaluations, policy-and-standards-sources, how-language-models-work,
  tokens-and-context-windows, and the two pages themselves
- the published hubs `evaluation` and `safety-and-security`
- a glossary anchor on the brief's list

Neither page links `/open/ai-rmf/`.

Blocked or unreachable sources (I did not retry them another way):

- `openai.com/index/updating-our-preparedness-framework/`: 403
- `help.openai.com/en/articles/8912793-c2pa-in-chatgpt-images`: 403
- `ai.meta.com/static-resource/meta-frontier-ai-framework/`: 500
- `ai.meta.com/static-resource/Meta_Advanced-AI-Scaling-Framework-v1`: 500
- `ai.meta.com/advanced-ai-scaling-framework/` and `ai.meta.com/frontier-ai-framework/`: 404

## Flagged items re-checked

- **OpenAI Preparedness Framework, Version 2.** I could not reach openai.com (403). The v2 PDF
  says "Version 2. Last updated: 15th April, 2025". These OpenAI pages link to it:
  - page 21 of the October 7, 2026 system card PDF (`cdn.openai.com/pdf/gpt-6-october.pdf`,
    title "GPT-6 Sol and GPT-6 Luna: October 2026 update", dated 2026-10-07)
  - the matching Deployment Safety Hub page `/gpt-6-october`
  - the GPT-6 Astra page `/gpt-6-astra` (September 3, 2026)

  The page's wording says what that evidence supports: the October 7 card links this
  version. I also changed the section's opening line (see below) so the page does not claim
  more than that. I could not check whether openai.com lists a newer version.
- **Meta Advanced AI Scaling Framework, Version 2.**
  - The PDF's title page reads "Advanced AI Scaling Framework / Version 2".
  - The change log (Appendix II) lists "February 3, 2025 (Frontier AI Framework) Initial
    version" and "April 7, 2026 (Advanced AI Scaling Framework v2.0) Renamed from 'Frontier
    AI Framework' to 'Advanced AI Scaling Framework'". The PDF has no other date.
  - The old Frontier AI Framework URL returns 500.
  - Further evidence: Meta's newsroom post "Our Approach to Frontier AI" (about.fb.com,
    February 2025) now links its "Frontier AI Framework" text to the v2 PDF.

  The page's description is accurate.
- **OpenAI C2PA help article replaced with the ChatGPT Images 2.5 system card.** The help
  article still returns 403. The system card's Image Provenance section (published September
  8, 2026) is a primary OpenAI source. It supports the page's three statements: the quote
  "no single solution to provenance", a "continued commitment to C2PA metadata", and SynthID
  watermarking "through ChatGPT, Codex, and the OpenAI API". I narrowed the SynthID statement
  (below).
- **Verify tool steps.** `verify.contentauthenticity.org` returns 200, but it is a JavaScript
  app with no readable text. `contentcredentials.org` links to it.
  - The upload steps and the Valid, Trusted, and "No Content Credentials found" results match
    section 5.4 of C2PA's Content Credentials Deployment Guidance 1.0 ("1.0, 2026-07-08:
    Release").
  - The page correctly attributes these to the guidance, not to the tool.

## learn-safety-testing-and-frameworks.mdx

### Claims checked and correct as written

- **gpt-oss card** (deploymentsafety.openai.com/gpt-oss):
  - "Published August 5, 2025".
  - The model-card-not-system-card reasoning.
  - The section list: model, capability evaluations, safety evaluations, Preparedness
    results, and Appendix 2 on reviewers' recommendations.
  - The jailbreak definition ("circumvent model refusals").
  - The adversarially fine-tuned versions: "internal ... which we are not releasing", with
    helpful-only RL plus bio and cyber training, and SAG's conclusion that they "did not reach
    High capability".
  - The named external reviewers and their "non-public details".
  - The three high-urgency recommendations not adopted, each with a stated decision.
- **NIST AI 600-1:**
  - The red-teaming definition quote.
  - "often in a controlled environment".
  - The general public, expert, combination, and human/AI types of red teaming.
- **OpenAI Preparedness Framework v2:**
  - Scalable evaluations with "indicative thresholds" and deep dives that include expert
    red-teaming and third-party evaluations.
  - The phrase "a lower bound, rather than a ceiling".
  - The three Tracked Categories, and High and Critical thresholds.
  - The rule that models are not deployed until risks are "sufficiently minimized".
  - The SAG recommends, and OpenAI Leadership can "approve or reject".
  - Third-party evaluation "when available and feasible".
  - Annual review of the framework.
- **Meta framework:**
  - Uplift studies are defined against a control group.
  - The three risk areas.
  - The Critical, High, and Moderate-or-lower thresholds.
  - A preparedness report "for each closed or open Frontier AI release".
  - Review "at least annually".
- **NIST CAISSI blog** "Cheating On AI Agent Evaluations": dated December 2, 2025. Its
  examples include models searching the internet for capture-the-flag answers, and it
  recommends reviewing transcripts.
- **Anthropic RSP v3.4:**
  - The RSP page ("Last updated Aug 14, 2026") lists v3.4 "effective July 8, 2026" as
    current and links this PDF.
  - The quote "voluntary framework for managing catastrophic risks".
  - The three-column table, and the statement that Anthropic cannot "unilaterally and
    unconditionally commit" to the industry-wide recommendations.
  - "Note that unlike system cards, Risk Reports will not be published with each new model
    release".
  - External review: Anthropic will "work toward" it, reviewers may not have a "financial
    interest in Anthropic", and the quote "there are no well-established organizations or
    procedures".
  - The annual procedural review focuses on procedure, "not substantive outcomes".
- **Google DeepMind Frontier Safety Framework v3.1:**
  - The Frontier safety page lists "Version 3.1 (17 Apr 2026)", and the PDF says "Published:
    April 17, 2026".
  - Four domains.
  - TCLs only for CBRN and for ML R&D and misalignment.
  - Early warning evaluations and alert thresholds.
  - Periodic review.
- **NIST AI RMF:**
  - The page says "Released on January 26, 2023", "intended for voluntary use", and "The AI
    RMF 1.0 is being revised as part of the White House AI Action Plan".
  - AI 100-1 describes the four functions and contains the independent-review quote.
  - It shows NIST under the U.S. Department of Commerce.
- **CAISSI page:**
  - The new name.
  - Items still use CAISI.
  - The demonstrable risks it names: cybersecurity, biosecurity, and chemical weapons.
  - A joint UK AISI / CAISI preliminary assessment.
- **Dioptra README:** it supports the Measure function, and its use cases include third-party
  audits and red-teaming in a controlled environment.
- **Petri docs:** auditor, target, and judge models; seeds; "a collaboration between
  Meridian Labs and the UK AISI Red Team ... based on work originally done by the Alignment
  team at Anthropic".
- **gpt-oss-safeguard README:** "classify text content based on safety policies that you
  provide" and "intended for safety use cases".
- **Neutrality:** the page judges no framework adequate or inadequate, and the worked-example
  person is labelled fictional.

### Changes (before → after, source)

1. Framework section intro.
   - Before: "Each is described from its current version as read on October 8, 2026."
   - After: "Each is described from the version its developer currently publishes or links,
     as read on October 8, 2026."
   - Why: OpenAI's and Meta's "current" status rests on links, not on a versions page that
     I could reach.
2. Anthropic RSP thresholds.
   - Before: "... and automated AI research, ..."
   - After: "... and automated research and development in key domains, including AI
     itself, ..."
   - Source: RSP v3.4 table row "Automated R&D in key domains", whose examples include
     "energy, robotics, weapons development, and AI itself". Its evaluations focus on AI R&D
     for now.
3. Anthropic RSP requirements.
   - Before: "It also requires a Frontier Safety Roadmap and Risk Reports every three to six
     months."
   - After: "It also requires Anthropic to maintain a Frontier Safety Roadmap and to publish
     a Risk Report every three to six months."
   - Source: RSP v3.4 section 3.1, "We will publish a Risk Report every 3-6 months". The
     Roadmap (section 2) has no fixed cadence, and the old wording could be read as giving
     it one.
4. Google DeepMind domain name.
   - Before: "machine-learning research and misalignment"
   - After: "machine-learning research and development (R&D) and misalignment"
   - Source: FSF v3.1, "Machine Learning R&D and Misalignment".
5. CAISSI description.
   - Before: "... with private-sector developers and evaluators and lead unclassified
     evaluations of capabilities that may pose national-security risks, ..."
   - After: "... with private-sector developers and evaluators of what it calls SI (super
     intelligence) systems and lead unclassified evaluations of SI capabilities that may pose
     risks to national security, ..."
   - Source: nist.gov/caissi, "Establish voluntary agreements with private sector SI
     developers and evaluators, and lead unclassified evaluations of SI capabilities that may
     pose risks to national security."
6. Dioptra "open-source".
   - The README does not use the term, so I linked "open-source" to NIST's Dioptra
     documentation, which says "Dioptra is open-source software developed by the National
     Institute of Standards and Technology (NIST)".
   - I added "and [documentation](https://pages.nist.gov/dioptra/)" to the NIST line in
     Sources.
7. "What you can do next", first bullet.
   - Added the published hub: "Browse the [AI safety, security, and trust
     hub](/hubs/safety-and-security/) and the [evaluation hub](/hubs/evaluation/), and read
     ..."

## learn-ai-content-provenance.mdx

### Claims checked and correct as written

- **NIST AI 100-4:**
  - The publication page says "Published November 20, 2024".
  - Its two categories are provenance data tracking and synthetic content detection.
  - "None of these techniques offer comprehensive solutions on their own".
  - Transparency can create a false sense of trust, with the out-of-context example.
  - Content can be partly synthetic: an "inpainted" object removal.
  - Metadata is often stripped when files are shared, "to deceive ... or for benign reasons
    such as privacy protection".
  - Watermark detection "always comes with some probability of error".
  - Metadata generally cannot travel with raw text.
  - Detectors look for pixel regularities, in "a constant cat-and-mouse game", and are
    "often tied to and may only perform well on specific generators".
  - Detectors are little better than chance on short texts. Most are built for English, and
    they misclassify non-native writers more often.
  - People with the weights can fine-tune a model to evade a detector.
  - False positives "can be extremely damaging" in many contexts.
  - Human performance was mixed: one 2023 study found reliable classification, while others
    found results near chance.
- **C2PA Technical Specification 2.4:**
  - The version history reads "2.4 - April 2026". The 2.4 index lists 2.4 as the newest
    version.
  - The `c2pa.created` / `trainedAlgorithmicMedia` example.
  - The new "AI Disclosure Assertion (c2pa.ai-disclosure) for machine-readable AI
    transparency info".
- **C2PA Explainer 2.2** (linked as the Explainer from the 2.4 index):
  - Manifest assertions cover origin, modifications, and use of AI.
  - The manifest contains a cryptographic hash and signature, and the result is
    "tamper-evident".
  - Provenance "alone cannot tell you whether the digital content is true, accurate or
    factual".
  - Content Credentials show whether the data is valid and whether its signer is on a trust
    list.
  - A crop made in a tool without Content Credentials support may go unrecorded.
  - "Yes it can" (asked whether metadata can be removed).
  - Durable credentials use soft bindings: watermarking or fingerprinting, with lookup in
    cloud storage.
  - The answer "Maybe", because adding credentials is optional.
- **Deployment Guidance 1.0:** the Verify steps and the three results (see above).
- **ChatGPT Images 2.5 system card:** see above.
- **SynthID page:**
  - Watermarks are imperceptible, in images, audio, text, and video.
  - Image and video watermarks are designed to stand up to cropping, filters, frame-rate
    changes, and lossy compression.
  - Text watermarking covers the Gemini app and web experience, and works by adjusting
    probability scores.
  - SynthID Detector covers Google "or our partners, including OpenAI, NVIDIA, Kakao".
    Apple is listed as "soon", and the page leaves it out.
- **Gemini Apps Help:**
  - SynthID marks content from Google's AI models.
  - "Gemini can currently only recognize content created by Google AI tools".
  - If no watermark is found, the content was not made or edited by Google AI but could
    come from other AI systems.
  - After many alterations, a watermark may not be detected.
  - It suggests reverse image search.
- **SynthID Text docs** ("Last updated 2025-04-09 UTC"):
  - The method is open sourced.
  - It is in Transformers v4.46.0+.
  - Detection is probabilistic, with watermarked, not watermarked, or uncertain results.
  - It is less effective on factual responses.
  - Confidence is greatly reduced by thorough rewriting or translation.
  - "is not designed to directly stop motivated adversaries".
- **SynthID Bio README:** Google DeepMind watermarking for AI-generated biological sequences
  and structures.
- **Neutrality and format:** the worked-example person (Lee) is labelled fictional, and the
  page uses no superlatives.

### Changes (before → after, source)

1. OpenAI SynthID scope.
   - Before: "OpenAI's Images 2.5 system card says OpenAI also adds SynthID watermarks
     through ChatGPT, Codex, and the OpenAI API."
   - After: "... says that, for Images 2.5, OpenAI also adds SynthID watermarks through
     ChatGPT, Codex, and the OpenAI API."
   - Source: the Image Provenance section, which says "For ChatGPT Images 2.5, our expanded
     provenance safety tooling includes ... watermarking through Google DeepMind's SynthID
     through ChatGPT, Codex, and the OpenAI API". It does not describe all OpenAI outputs.
2. Missing credentials.
   - Before: the page reported only the Explainer's "Maybe".
   - After: I added "The deployment guidance says to treat content with missing or invalid
     credentials 'cautiously.'"
   - Source: Deployment Guidance 1.0, section 5.4, "You should treat content with missing or
     invalid Content Credentials cautiously." Without it, the page gave only one of C2PA's
     two stated positions (the writer flagged this).
3. Human detection.
   - Before: "Human judgment is no reliable fallback:"
   - After: "Human judgment varies:"
   - Source: NIST AI 100-4 says humans "may be able to distinguish AI-generated text with
     some reliability" in some contexts and found near-chance results in others. The rest of
     the sentence already reports this.
4. Tokens link.
   - Before: "Read [how language models work] and [tokens and context windows] to see the
     token probabilities that text watermarks adjust."
   - After: "Read [how language models work] to see the token probabilities that text
     watermarks adjust, and [tokens and context windows] for what a token is."
   - Why: the tokens explainer, which now exists, does not discuss probabilities. The
     language-models explainer does.
5. "What you can do next".
   - Added the published hub to the third bullet: "..., and browse the [AI safety, security,
     and trust hub](/hubs/safety-and-security/)."

## Takeaways (research/notes/round4-trust.md)

All six takeaways restate what the pages say and are at most 160 characters each. No edits
were needed. The provenance takeaway "a file without them proves nothing either way" stays
consistent with the added "cautiously" sentence, since caution is not proof.

## Not verified or for the editor

- I could not check from openai.com whether OpenAI lists a Preparedness Framework newer than
  Version 2 (403). Its own October 2026 system cards link Version 2.
- Meta has no reachable page that lists versions. "Current" for v2 rests on the PDF's change
  log and on the newsroom post that links it.
- I could not read the Verify tool itself (a JavaScript app). Its behavior is described from
  C2PA's guidance, and the page attributes it that way.
