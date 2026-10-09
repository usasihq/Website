# Round 4 notes: round4-context (2026-10-08)

Agent label: `round4-context`. Files written: `content/pages/learn-ai-history.mdx`, `content/pages/learn-multimodal-models.mdx`, and this notes file. Both MDX files compile with `@mdx-js/mdx`. All sources were fetched on 2026-10-08 with WebFetch or with curl using `-A "USASI-catalog-research/0.3"`; no email address, name, or other identifier was sent in any URL, header, or payload. No bot checks or logins were bypassed; blocked sources were skipped.

Word counts (`wc -w` on the raw MDX, including the Sources list): ai-history 1,495; multimodal-models 1,480. Without the Sources list and link URLs, about 1,330 and 1,370.

## Explainer 1

```
slug: ai-history
title: A short history of AI in the United States
question: Where did today's AI come from?
topic: basics
level: Beginner
takeaways:
  - A proposal dated August 31, 1955, used "artificial intelligence" in the title of a planned 1956 summer study at Dartmouth College.
  - Defense research agencies backed projects from the Shakey robot, which ARPA began supporting in 1966, to DARPA's driverless vehicle races of 2004 to 2007.
  - A 2021 federal law defines AI, and a September 29, 2026 executive order tells federal agencies to use "Super Intelligence" in its place in their own documents.
sources fetched: 26 fetched, 21 cited.
```

- Cited: Stanford-hosted Dartmouth proposal (www-formal.stanford.edu HTML); Dartmouth milestones page; Cornell Chronicle perceptron article (2019-09-25); DARPA pages: ARPA is born, ARPA becomes DARPA, Shakey the Robot, AI Next Campaign, Grand Challenge, Grand Challenge: Ten Years Later, Urban Challenge; ImageNet CVPR 2009 paper PDF and image-net.org/about.php; arXiv 1706.03762 (abstract and PDF); Google Gemma releases page; Meta Llama 4 MODEL_CARD.md; OpenAI gpt-oss model card (arXiv 2508.10925); govinfo 15 U.S.C. chapter 119 (2023 edition); Federal Register PDFs (govinfo) for EO 14110, EO 14148, EO 14434; NIST AI RMF page.
- Fetched, not cited: image-net.org home page (credits Stanford Vision Lab, Stanford, Princeton; cut for length); Federal Register API search results (used to find EO numbers and PDF links); Hugging Face API for openai/gpt-oss-20b and -120b (repos created 2025-08-04 UTC; page says "August 2025" from the arXiv v1 date of 2025-08-08); Google Gemma 4 launch blog (shows Apr 02, 2026; releases page says March 31, 2026, which the page uses).
- Could not reach: jmc.stanford.edu PDF of the proposal (TLS certificate mismatch; used the www-formal.stanford.edu HTML copy, same text); APA PsycNet record for Rosenblatt's 1958 Psychological Review paper (JavaScript-only page); Smithsonian NMAH Mark I Perceptron object page and collections.si.edu (HTTP 403); congress.gov bill pages (bot check, skipped); uscode.house.gov (under maintenance); federalregister.gov HTML document page (redirects to an "unblock" bot page, skipped; used the govinfo PDF of the same Federal Register text); openai.com blog pages (HTTP 403); darpa.mil/about/our-history (404).
- Uncertain or worth noting:
  - The brief asked for Rosenblatt's 1958 report or paper from an official archive. I could not read one, so the perceptron paragraph relies on Cornell's own news account (Cornell Chronicle) and attributes every perceptron claim to it. A later editor may want to add the Psychological Review citation (vol. 65, no. 6, 1958, doi 10.1037/h0042519) once it can be read directly.
  - The ImageNet paper header lists only Princeton University, Department of Computer Science, for all six authors; the page says "researchers at Princeton University", not "Princeton and Stanford researchers". The project's about page lists team members at Stanford and Princeton; the CVPR 2009 venue comes from the about page's news list.
  - Dartmouth's page title says AI was "coined" at Dartmouth and calls the project "the birth of this field of research"; the proposal itself makes no claim to be the first use. The page attributes the Dartmouth claim and uses the gap in the worked example.
  - The Cornell account says the 1969 *Perceptrons* book "essentially, sealed its fate"; the page attributes this.
  - DARPA's Shakey page says ARPA support began in 1966 and "six years later" the robot was rolled out; the start point of the six years is ambiguous, so the page gives no rollout year.
  - DARPA's Grand Challenge pages give prize amounts and a winner; the page omits prize money (brief rule 3) and names finishing entries rather than ranking them.
  - EO 14434's purpose section makes statements about where the field was born and calls U.S. companies "world-leading"; the page does not repeat them. It reports only what the order directs. The order's Sec. 2 applies to "non-statutory documents within the executive branch"; the page says "their own documents".
  - "NIST's site menu listed 'Super intelligence' as a topic" is an observation of the NIST AI RMF page navigation on 2026-10-08 and may change.
  - The Act's short title is "of 2020", but the Public Law is dated January 1, 2021; the page says "a 2021 federal law" and gives both.

## Explainer 2

```
slug: multimodal-models
title: Multimodal models: text, images, audio, and video
question: How do models that see and hear differ from text-only models?
topic: basics
level: Intermediate
takeaways:
  - A modality is a kind of data; a model that reads images or audio may still write only text, so check a card's input and output lists separately.
  - Images and audio are usually converted into tokens, often by a separate encoder, before the language model reads them alongside text.
  - Terms can differ by modality: Llama 4's use policy withholds license rights for its multimodal models from EU-based individuals and companies.
sources fetched: 21 fetched, 17 cited.
```

- Cited: Meta Llama 4 MODEL_CARD.md, Llama 4 Acceptable Use Policy (dev.meta.ai), Llama 4 announcement blog (2025-04-05); Google Gemma 4 model card (ai.google.dev); OpenAI Whisper model-card.md, Whisper paper (arXiv 2212.04356, PDF), text-to-speech guide and custom voices guide (developers.openai.com); NVIDIA parakeet-tdt-0.6b-v3 and magpie_tts_multilingual_357m model cards; Ai2 Molmo2 paper (arXiv 2601.10611, PDF) and Molmo2-O-7B card; Microsoft Florence-2-large card; Genmo mochi-1-preview card; Denoising Diffusion Probabilistic Models (arXiv 2006.11239, UC Berkeley authors); Creative Commons BY 4.0 legal code; Apple personal safety guide on photo location metadata.
- Fetched, not cited: openai/whisper-large-v3 Hugging Face card (128 Mel bins instead of 80; its metadata says apache-2.0 while the GitHub repository LICENSE is MIT; cut for length); Whisper GitHub LICENSE (MIT); Llama 4 LICENSE (no modality-specific clause; the EU clause is in the use policy); Hugging Face API search for NVIDIA Magpie models.
- Could not reach: none needed beyond the above.
- Uncertain or worth noting:
  - The Molmo2-O-7B card text says "SigLIP 2" but its base_model and link point to google/siglip-so400m-patch14-384; the page says "a SigLIP vision backbone published by Google" to avoid choosing.
  - The Whisper audio description (16,000 Hz, 80-channel log-Mel spectrogram, 25 ms windows, 10 ms stride) is from the 2022 paper; large-v3 changed to 128 bins. The page attributes the description to the paper.
  - "Hallucination" in the speech section is the Whisper card's term for Whisper models; the page does not claim Parakeet has the same failure mode, and the worked example cites the Whisper card's warning as the reason to review transcripts.
  - The Llama 4 use-policy EU clause applies to "any multimodal models included in Llama 4"; the page notes that the model card lists image input for Scout and Maverick but does not state a legal conclusion.
  - Image generation by diffusion is sourced to the DDPM paper (unconditional image generation) and to Genmo's text-to-video card. No U.S. text-to-image model record in the catalog had a fetched primary source, so text-to-image specifics are not claimed.
  - MagpieTTS's card names its built-in voices, including one real narrator; the page gives only the count.

## Self-check

I re-read every factual sentence in both pages against the fetched passages. Changes made during the check:

- History: "attacked Rosenblatt's work and essentially sealed its fate for decades" cut to "...sealed its fate" (the decades phrasing was not in the Cornell text). An early draft's "motor-driven wheels" for Shakey was removed; the sentence now lists only the TV camera, range finder, and radio communications named by DARPA, plus its "navigate on its own through a set of rooms" description. "Labeled by workers on Mechanical Turk" changed to "each image checked by people through Amazon Mechanical Turk, an online platform for paid tasks", matching the paper. "Shaped many current models" (unsupported) replaced with "a 2009 image database for training object-recognition models", which is the project's own description. The Transformer sentence now attributes "most such models then used" recurrent or convolutional networks to the paper. "From 2024 several U.S. companies published open-weight models" removed because earlier releases exist outside the sources read. "Defense research funding" changed to "agencies" (no funding language).
- Multimodal: Gemma 4 video limit restated as "60 seconds of video at one frame per second", matching the card's assumption. "Small square patches" changed to "small patches". The worked example's transcript step no longer generalizes hallucination to all ASR models. The last worked-example step now lists licenses stated on each card (CC BY 4.0, Apache 2.0, NVIDIA Open Model License) instead of an audio limit that did not apply to the chosen 31B model.
- Both: no bare angle or curly brackets outside code spans; no "first", "leading", "best", or "state-of-the-art" in prose (one "first" is a sequence word in a step); no prices, prize amounts, funding, download counts, or benchmark scores; no gendered pronouns. Every internal link was checked: /open/ and /companies/ slugs have `publication_status: published`, hubs exist, and glossary anchors are on the brief's list.

## Suggested glossary terms

modality, encoder (vision encoder, audio encoder), speech recognition (ASR), text-to-speech (TTS), diffusion model, spectrogram, attention / Transformer, executive order.
