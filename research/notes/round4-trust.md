# Round 4 notes: round4-trust (2026-10-08)

Two explainers for the Learn section. All sources were fetched and read on 2026-10-08 with
curl (`-A "USASI-catalog-research/0.3"`) or WebFetch; no personal identifiers were sent.

---

slug: safety-testing-and-frameworks
title: How AI developers test models for safety
question: What are system cards, red teaming, and frontier safety frameworks, and how should I read them?
topic: evidence
level: Intermediate
takeaways:
  - System cards, red-team results, and safety frameworks are written by the developer about its own work, so read them as the developer's account.
  - Anthropic, OpenAI, Google DeepMind, and Meta each publish a framework setting capability thresholds and what the company will do when a model reaches one.
  - Signs of an independent check include named outside testers and their access, reviewers publishing in their own words, and methods others can re-run.
sources fetched: 21 fetched and read (16 cited on the page).
  Cited: OpenAI gpt-oss-120b/20b model card (deploymentsafety.openai.com/gpt-oss, all
  sections); Preparedness Framework v2 PDF; GPT-6 Sol/Luna October 2026 system card PDF
  (used to confirm which framework version OpenAI currently links); gpt-oss-safeguard
  README; Anthropic RSP page and RSP v3.4 PDF; Google DeepMind frontier-safety page and
  FSF v3.1 PDF; Meta Advanced AI Scaling Framework v2 PDF; NIST AI RMF page; NIST AI 100-1
  PDF; NIST AI 600-1 PDF; NIST CAISSI page; CAISSI blog "Cheating On AI Agent Evaluations";
  Dioptra README; Inspect Petri documentation.
  Read but not cited: OpenAI Deployment Safety Hub index; Google DeepMind "Strengthening our
  Frontier Safety Framework" blog (links v3.1 as latest); Meta "Our Approach to Frontier AI"
  (2025 newsroom post); CAISSI Guidelines page; gpt-oss-safeguard-20b Hugging Face card.
  Could not reach: openai.com/index/updating-our-preparedness-framework/ and openai.com/safety/
  (HTTP 403 to both curl and WebFetch); ai.meta.com/static-resource/meta-frontier-ai-framework/
  (HTTP 500).
  Uncertain:
  - OpenAI framework version: openai.com is blocked, so "current" rests on OpenAI's
    October 7, 2026 system card linking the Version 2 PDF (last updated April 15, 2025).
  - Meta: no Meta landing page listing versions was reachable. The page describes the
    "Advanced AI Scaling Framework, Version 2" from the PDF itself; its change log says it was
    renamed from the Frontier AI Framework (Feb 3, 2025) on April 7, 2026. The PDF has no date
    on its cover, only in the change log, so the page says "dated April 7, 2026 in its change log."
  - The gpt-oss card names one external reviewer as an individual; the page says "outside
    experts" without naming people.
  - A `safety-and-security` hub file exists (untracked, `publication_status: published`) but is
    not in the brief's hub list, so it is not linked. The editor may want to add it to "What you
    can do next."
  - No catalog record exists for `/open/ai-rmf/` (no content/artifacts/ai-rmf.yml), so it is not
    linked; the AI RMF is linked to NIST's own pages instead.

---

slug: ai-content-provenance
title: Labels, watermarks, and content credentials
question: How can you tell whether an image, video, audio clip, or text was made with AI?
topic: evidence
level: Beginner
takeaways:
  - No single test reliably shows whether content was made with AI; Content Credentials, watermarks, and detectors can each miss.
  - Content Credentials record how a file was made and edited, but they can be stripped, so a file without them proves nothing either way.
  - Watermark checks find only marks from tools that add them, and AI detectors make errors, especially on short text and writing by non-native English speakers.
sources fetched: 20 fetched and read (12 cited on the page).
  Cited: C2PA Technical Specification 2.4 (HTML); C2PA and Content Credentials Explainer 2.2
  (HTML; the 2.4 index links this as the current explainer); Content Credentials Deployment
  Guidance 1.0 (July 8, 2026, PDF on c2pa.org); verify.contentauthenticity.org (reached via the
  contentcredentials.org "Verify" link); contentcredentials.org home; Google DeepMind SynthID
  page; SynthID Text documentation (ai.google.dev); Gemini Apps Help "Verify AI-generated
  images, videos, and audio"; OpenAI ChatGPT Images 2.5 System Card, Image Provenance section;
  NIST AI 100-4 PDF and NIST publication page; SynthID Bio README.
  Read but not cited: C2PA 2.4 specifications index; Explainer PDF labelled 2.3 (its header reads
  "2.2, 2025-12-11: Release"); C2PA Security Considerations 2.4; C2PA AI/ML guidance 2.3;
  contentcredentials.org About page; CAI "Getting started" and "How it works" pages; synthid.com
  (JavaScript app, no readable text).
  Could not reach: help.openai.com/en/articles/8912793-c2pa-in-chatgpt-images (HTTP 403 to curl
  and WebFetch; replaced by OpenAI's Images 2.5 system card, which covers C2PA and SynthID);
  csrc.nist.gov/pubs/ai/100/4/final (404; used the nist.gov publication page instead);
  opensource.contentauthenticity.org/docs/verify (404).
  Uncertain:
  - The Verify tool is a JavaScript app with no readable text; its upload steps and its three
    result types are taken from C2PA's Deployment Guidance, not from the tool itself.
  - C2PA's two documents differ in tone on missing credentials: the Explainer answers "Maybe" to
    whether to distrust media without them; the Deployment Guidance says to treat content with
    missing or invalid credentials "cautiously." The page quotes the Explainer's "Maybe."
  - Google's two pages differ in scope: the Gemini Help page says Gemini's check recognizes only
    Google AI content; the SynthID page says SynthID Detector checks content from Google and
    partners (OpenAI, NVIDIA, Kakao). Both are reported as stated. The SynthID page also says
    Apple will join "soon"; omitted as a forward-looking claim.
  - NIST AI 100-4 gives percentage figures for human and detector performance; they are left
    out under the no-benchmark-scores rule and described qualitatively.
  - `/learn/tokens-and-context-windows/` is linked per the brief's round-4 list but did not yet
    exist in content/pages when this was written.

---

## Self-check

I re-read every factual sentence in both files against the passage that supports it and made
these corrections before finishing:

- Safety testing: narrowed "lists the recommendations OpenAI did not adopt" to "the high-urgency
  recommendations" (the card's Appendix 2 covers only the three high-urgency items not adopted).
- Safety testing: CAISSI's focus now reads "focusing on demonstrable risks such as cybersecurity,
  biosecurity, and chemical weapons," matching the page's "such as."
- Safety testing: the Google DeepMind entry now says Tracked Capability Levels apply to "some" of
  the four risk domains (v3.1 sets TCLs for CBRN and for ML R&D and misalignment only), and the
  alert-threshold wording follows section 1.3.2.
- Safety testing: "published" changed to "released" for the AI RMF date (NIST's wording); the
  gpt-oss-safeguard description now says "classify text" (README) and quotes "intended for
  safety use cases"; the jailbreak definition follows the card's wording; the Meta uplift-study
  sentence now links the Meta framework.
- Safety testing: the system-card sentence citing Anthropic now links the RSP v3.4 PDF, which is
  where the comparison with system cards appears.
- Provenance: NIST AI 100-4 is described as a survey ("surveys these techniques"), not as "the
  federal government's overview"; "classifies content after the fact" changed to "classifies
  whether content is synthetic" (detection also includes reading watermarks and metadata).
- Provenance: the hash is no longer called a "fingerprint," to avoid confusion with C2PA's
  separate fingerprinting soft binding.
- Provenance: the limits sentence now follows the Explainer exactly: provenance alone cannot
  tell you whether content is true, accurate, or factual; credentials show integrity and whether
  the signer is on a known trust list.
- Provenance: removed "across Google's generative AI consumer products" (the SynthID page does
  not say "Google's" there); Google ownership is attributed to the Gemini Help page instead.
- Provenance: metadata stripping now includes "either to deceive or for benign reasons such as
  privacy," as NIST states; detector generalization follows NIST's "often tied to, and may only
  perform well on, specific generators"; the false-positive quote keeps "in many contexts."
- Provenance: the human-detection sentence now reflects NIST's mixed findings rather than only
  near-chance results.

Both files compile with `@mdx-js/mdx` ("ok"). Prose word counts, excluding the Sources section:
learn-safety-testing-and-frameworks.mdx 1,463; learn-ai-content-provenance.mdx 1,468.
