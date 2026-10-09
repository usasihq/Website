# Round 4 verification: context (`round4-verify-context`)

Checked on 2026-10-08. I fetched every source today with curl (`-A "USASI-factcheck/0.3"`).
WebSearch was used once to find another copy of the Cornell article; the query had no personal
names or identifiers in it. I used no browser and sent no email address, name, or other
identifier in any request. When a site showed a bot check, I skipped it.

Files checked:

- `content/pages/learn-ai-history.mdx`
- `content/pages/learn-multimodal-models.mdx`
- takeaways for both pages in `research/notes/round4-context.md`

After my edits, both files compile with `@mdx-js/mdx` (`ok`). Both use `<h2 id>` headings,
have no Markdown tables, and end with the Sources section. Prose word counts, without the
Sources list or URLs, are about 1,380 for each page. All 37 external links return HTTP 200 to
curl. Every internal link points to a published record (harvard-university, ibm,
stanford-university, carnegie-mellon-university, princeton-university, nist, uc-berkeley,
genmo; gemma-4-31b, llama-4-scout-17b-16e, gpt-oss-20b, parakeet, whisper, florence-2, molmo,
mochi-1-preview), an existing or round-4 explainer slug (mapped in `app/learn/content.ts`), a
listed hub, or a listed glossary anchor.

## learn-ai-history.mdx

### Claims checked against the source (correct as written unless listed under Changes)

- **Dartmouth proposal** (www-formal.stanford.edu HTML):
  - The proposal is dated August 31, 1955.
  - Its authors and affiliations are J. McCarthy (Dartmouth College), M. L. Minsky (Harvard
    University), N. Rochester (I.B.M. Corporation), and C. E. Shannon (Bell Telephone
    Laboratories).
  - It proposes a "2 month, 10 man study … during the summer of 1956 at Dartmouth College in
    Hanover, New Hampshire".
  - The page's paraphrase of the conjecture is accurate.
  - Its topics include language, "Neuron Nets", self-improvement, and abstractions.
  - The proposal makes no claim about whether anyone used the term earlier.
- **Dartmouth milestones page:**
  - The title is "Artificial Intelligence (AI) Coined at Dartmouth".
  - It calls the project "the birth of this field of research". The page attributes this to
    Dartmouth.
- **Perceptron.** Checked against Cornell's own copy of the Cornell Chronicle story of
  September 25, 2019 on as.cornell.edu (see Changes):
  - The U.S. Office of Naval Research unveiled the demonstration in July 1958.
  - The machine was an IBM 704. After 50 trials it learned to tell cards marked on the left
    from cards marked on the right.
  - Rosenblatt was then "a research psychologist and project engineer at the Cornell
    Aeronautical Laboratory in Buffalo, New York".
  - In 1969 Minsky and Seymour Papert published *Perceptrons*, which "assailed Rosenblatt's
    work and, essentially, sealed its fate".
  - The article describes the perceptron as a network that classifies input into two
    categories and adjusts itself when it is wrong.
- **DARPA pages:**
  - Directive 5105.15 established ARPA on Feb. 7, 1958.
  - ARPA was renamed DARPA in 1972.
  - Charles Rosen of the Stanford Research Institute (now SRI International) wrote the Shakey
    proposal in 1964, and ARPA support began in 1966.
  - Shakey had a TV camera, a range finder, and radio communications, and could navigate "on
    its own through a set of rooms". The page leaves out DARPA's word "first".
  - The AI Next page describes "more than five decades" of work on "rule-based and
    statistical-learning based AI".
- **Grand Challenges:**
  - March 13, 2004: 15 vehicles left from outside Barstow on a 142-mile course to Primm. None
    finished, and the top vehicle traveled 7.5 miles.
  - Oct. 8, 2005: five vehicles completed a 132-mile course, including Stanford's "Stanley".
  - 2007 Urban Challenge: a staged city course in Victorville, Calif. Vehicles drove among
    other traffic while obeying traffic rules. Six of 11 teams finished, including Carnegie
    Mellon's Boss and Stanford's Junior.
- **ImageNet paper** (image-net.org PDF):
  - All six authors are listed at the Dept. of Computer Science, Princeton University.
  - At that point the database held 5,247 synsets and 3.2 million images.
  - People verified each image through Amazon Mechanical Turk, "an online platform on which one
    can put up tasks for users to complete and to get paid".
  - The project's goal was "tens of millions" of images.
  - About page: the publications list gives the venue as CVPR 2009. It describes the project as
    image data "for training large-scale object recognition models". The footer credits
    Stanford and Princeton.
- **"Attention Is All You Need"** (arXiv abstract and PDF):
  - It was submitted June 12, 2017.
  - It has eight authors: six at Google Brain or Google Research, one at the University of
    Toronto, and one with no listed affiliation.
  - The PDF footer reads "NIPS 2017".
  - The paper says the Transformer is "based solely on attention mechanisms".
- **gpt-oss model card** (arXiv 2508.10925):
  - It was submitted August 8, 2025. The card itself is dated August 5, 2025.
  - It describes "mixture-of-expert transformer" and "Mixture-of-Experts (MoE) transformers".
  - The weights are released "under an Apache 2.0 license".
- **Gemma releases page:**
  - February 21, 2024: "Initial release of Gemma in 2B and 7B sizes."
  - March 31, 2026: Gemma 4 release.
- **Llama 4 model card:** "Model Release Date: April 5, 2025", which applies to Scout and
  Maverick.
- **Law** (govinfo, 15 U.S.C. ch. 119, 2023 edition):
  - The Act is division E of Pub. L. 116–283, Jan. 1, 2021.
  - Its short title is the "National Artificial Intelligence Initiative Act of 2020".
  - Under §9411, "The President shall establish and implement" the National Artificial
    Intelligence Initiative.
  - The §9401(3) definition is quoted exactly.
- **NIST AI RMF page:**
  - The framework was released January 26, 2023 and is "intended for voluntary use".
  - The site's Topics menu includes "Super intelligence", which links to /super-intelligence.
- **EO 14110 and EO 14148** (govinfo Federal Register PDFs):
  - EO 14110 is "of October 30, 2023".
  - EO 14148 is "of January 20, 2025". Its Sec. 2(ggg) revokes EO 14110.
- **EO 14434** (govinfo, Federal Register Vol. 91, No. 190, Oct. 2, 2026, FR Doc. 2026-20321):
  - The heading reads "Executive Order 14434 of September 29, 2026" and the title is
    "Inaugurating the Era of Super Intelligence".
  - Sec. 2(a): to the maximum extent permitted by law, agencies are to use "Super Intelligence"
    and "SI" in correspondence, public communications, websites, reports, policy documents, and
    other non-statutory documents.
  - Sec. 2(b): nothing in that section requires changing previously issued regulations,
    Presidential actions, contracts, grants, or other historical documents.
  - Sec. 3(a): the new terms take their definition from 15 U.S.C. 9401(3).
  - Sec. 3(b): within 60 days, the Assistant to the President for Science and Technology "shall
    submit" proposed legislative language.
  - The page does not repeat the order's Sec. 1 claims ("born in the United States", "first
    gave the field its name", "world-leading").
- **Worked example:** each step matches the proposal and the Dartmouth page.

### Changes (before → after, with the source)

1. **Neuron-net credit** (Dartmouth proposal, item 3).
   - Before: "it credits earlier neuron-net research by others"
   - After: "it lists earlier neuron-net research by several researchers, including Pitts and
     McCulloch and two of the proposal's own authors"
   - Why: the proposal's list includes Minsky and Rochester, who are two of its authors.
2. **Perceptron link and Sources entry.**
   - news.cornell.edu returned a Cloudflare "Just a moment… Enable JavaScript and cookies"
     challenge, so I skipped it.
   - I replaced the link with Cornell's own copy of the same story on the College of Arts and
     Sciences site:
     https://as.cornell.edu/news/professors-perceptron-paved-way-ai-60-years-too-soon
   - That page shows "Cornell Chronicle 9/25/2019" and "This story also appeared in the Cornell
     Chronicle". I verified every perceptron sentence against it.
   - The Sources entry now reads "(Cornell Chronicle story of September 25, 2019, on the
     College of Arts and Sciences site)".
3. **Grand Challenge sentence** (DARPA Grand Challenge page: "DARPA ran its … Grand Challenge").
   - Before: "One visible part was a set of races…"
   - After: "DARPA also ran a set of races…"
   - Why: the AI Next page does not describe the races as part of its AI work.
4. **WordNet definition** (ImageNet paper and about page).
   - Before: "a dictionary-like database that groups English nouns into sets of synonyms"
   - After: "a database that groups the words for each concept into a set of synonyms called a
     synset"
   - Why: the sources say each concept, "possibly described by multiple words or word phrases",
     is a synset. WordNet also has synsets that are not nouns.
5. **ImageNet news list** (about.php).
   - Before: "a 2019 update filtering the 'person' categories and a 2021 paper on privacy"
   - After: "a 2019 research update on filtering and balancing its 'person' subtree and a 2021
     paper on privacy preservation"
   - Why: this matches the wording of the news items.
6. **Transformer comparison** (paper abstract: "The dominant sequence transduction models are
   based on complex recurrent or convolutional neural networks").
   - Before: "the recurrent or convolutional networks the paper says most such models then
     used"
   - After: "the recurrent or convolutional networks that, the paper says, the dominant models
     for tasks such as translation were then based on"
7. **Gemma as open-weight.** The Gemma releases page does not use the term "open-weight".
   - Added: "the [Gemma 4 model card] says that release includes open-weights models", from the
     card ("This release includes open-weights models").
   - Added the Gemma 4 model card under Google in Sources.
8. **gpt-oss wording.**
   - Before: "model card … releases the weights"
   - After: "model card … says the weights … are released under the Apache 2.0 license"
   - Sources title changed to the exact "gpt-oss-120b &amp; gpt-oss-20b Model Card".
9. **EO 14110 title.**
   - Before: "on safe, secure, and trustworthy AI"
   - After: the exact title, "Safe, Secure, and Trustworthy Development and Use of Artificial
     Intelligence"
10. **EO 14434 wording** (to match the Federal Register text).
    - "signed September 29, 2026" → "of September 29, 2026"
    - "to the extent the law allows" → "to the maximum extent permitted by law"
    - "asks the Assistant … to propose legislative language" → "directs the Assistant … to
      submit proposed legislative language"
11. **Heading.**
    - Before: "1955–1956: A proposal names a field"
    - After: "1955–1956: A proposal uses the term"
    - Why: the old heading stated as fact the same "naming" claim that the page's worked example
      says to attribute. The `id` is unchanged.

### Could not verify, or for the editor

- **news.cornell.edu:** this is the canonical Chronicle URL, and it showed a bot check. If the
  editor prefers it, it can be restored; the text matches the as.cornell.edu copy I read.
- **Rosenblatt's 1958 Psychological Review paper:** I did not try to read it. The page does not
  cite it.
- **Single source for EO 14434:** I read the order only in the govinfo Federal Register PDF. I
  did not try federalregister.gov or congress.gov, which the writer reported as bot-checked.
- **NIST menu entry:** the "Super intelligence" item is an observation from October 8, 2026 and
  may change.

## learn-multimodal-models.mdx

### Claims checked against the source (correct as written unless listed under Changes)

- **Llama 4 model card:**
  - Input is "Multilingual text and image" and output is "Multilingual text and code", for both
    Scout and Maverick.
  - It says the model was "tested for image understanding up to 5 input images".
- **Gemma 4 model card:**
  - All five sizes take text and image input. Audio is supported on E2B, E4B, and 12B. All
    sizes output text.
  - Limits: audio up to 30 seconds; video up to 60 seconds at one frame per second.
  - The 31B vision encoder has about 550M parameters.
  - The 12B Unified model is encoder-free and uses "lightweight linear layers".
  - Its capabilities include handwriting recognition. It recommends "higher budgets for … reading
    small text".
  - The license is Apache 2.0.
- **Whisper model card:**
  - It covers ASR plus translation into English.
  - Training data was 680,000 hours of internet audio with transcripts.
  - It notes uneven performance across languages, accents, and dialects.
  - It warns that output may include "texts that are not actually spoken … (i.e.
    hallucination)".
  - It cautions against transcribing recordings "taken without their consent".
  - It says the models "may have some capabilities to recognize specific individuals".
- **Whisper paper:** audio is resampled to 16,000 Hz and turned into a log-Mel spectrogram using
  25 ms windows with a 10 ms stride, then read by an encoder-decoder Transformer.
- **parakeet-tdt-0.6b-v3:**
  - It has 600 million parameters and covers 25 European languages, including English.
  - Its output includes punctuation, capitalization, and timestamps.
  - Input is 16 kHz monochannel audio.
  - The license is CC-BY-4.0.
- **magpie_tts_multilingual_357m:**
  - Input is text and output is WAV audio at 22.05 kHz.
  - It predicts discrete audio codec tokens, which a codec model decodes into waveforms.
  - It has 5 voices and supports 12 languages.
  - It is "not intended for zero-shot voice cloning".
  - The license is the NVIDIA Open Model License.
- **Florence-2-large:** it takes an image plus a task prompt such as `<CAPTION>` or `<OD>`, and
  object detection returns bboxes.
- **Molmo2 paper:**
  - It "follows the common design".
  - Images are split or resized into crops, and a ViT produces patch-level features.
  - The connector pools and projects them into "visual tokens" that go to the LLM alongside
    text.
- **Molmo2-O-7B card:** it is based on Olmo-3-7B-Instruct, and its SigLIP backbone is
  `google/siglip-so400m-patch14-384`.
- **Llama 4 blog** (April 5, 2025): it describes "early fusion" into "a unified model backbone"
  and a vision encoder "based on MetaCLIP".
- **DDPM paper:** the authors are at UC Berkeley, and the paper describes a process that
  "gradually adds noise to the data … until signal is destroyed".
- **Mochi 1 preview card:**
  - It is tagged text-to-video.
  - It is a 10B-parameter diffusion model with a single T5-XXL text encoder and the AsymmVAE
    video compression model.
  - Listed limits: 480p output, warping with extreme motion, and poor results on animated
    content.
- **Llama 4 Acceptable Use Policy:**
  - Section 1(a) rights are not granted to EU-domiciled individuals or EU-based companies for
    multimodal models.
  - There is an exception for end users of a product or service.
  - It prohibits collecting or inferring private or sensitive information about individuals
    (identity, health, or demographic information) without the legal right to do so.
- **CC BY 4.0, Section 3(a):** attribution is required "If You Share the Licensed Material".
- **OpenAI:**
  - The TTS guide says its usage policies require telling end users that the voice is
    AI-generated.
  - The custom voices guide says the feature is "limited to eligible customers" and requires a
    consent recording from the voice actor.
- **Apple:**
  - With Location Services on for Camera, location coordinates are embedded in photos and
    videos.
  - People you share them with "may be able to access" the location.
  - The guide explains how to remove it.

### Changes (before → after, with the source)

1. **Gemma 4 image token budget** (Gemma 4 card: "The supported token budgets are: 70, 140, 280,
   560, and 1120").
   - Before: "from 70 to 1,120"
   - After: "with budgets of 70, 140, 280, 560, or 1,120"
2. **Gemma 4 12B Unified** (card: "directly into the LLM's embedding space").
   - Before: "directly into the language model"
   - After: "directly into the language model's embedding space"
3. **Diffusion claim.**
   - Before: "Many image and video generators use diffusion."
   - After: "Some image and video generators use diffusion."
   - Why: no cited source supports "many".
4. **NVIDIA license example.**
   - Before: "One publisher may use different terms for different modalities."
   - After: "One publisher may use different terms for models with different inputs and
     outputs."
   - Why: the two cards show different licenses. They do not say the difference is due to
     modality.

### Could not verify, or for the editor

- **Molmo2-O-7B backbone:** the card text says "SigLIP 2", but it links and lists
  `google/siglip-so400m-patch14-384`. The page's "a SigLIP vision backbone published by Google"
  covers both, so I made no change.

## Takeaways (`research/notes/round4-context.md`)

- **ai-history:** all three restate the page and are within 160 characters. No change.
- **multimodal-models, takeaways 1–2:** faithful. No change.
- **multimodal-models, takeaway 3.**
  - Before: "…withholds multimodal license rights from EU-based licensees; NVIDIA's speech cards use
    different licenses."
  - After: "…withholds license rights for its multimodal models from EU-based individuals and
    companies." (142 characters)
  - Why: the people the policy covers are not licensees of those rights. The NVIDIA clause was
    dropped because, after correction 4 above, the page no longer frames that license difference
    as a modality difference.

## Totals

- Corrections in `learn-ai-history.mdx`: 11
- Corrections in `learn-multimodal-models.mdx`: 4
- Takeaway corrections: 1
