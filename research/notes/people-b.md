# people-b research notes

Group: people-b (Local corner profiles). Reviewed 2026-09-29 under research/PEOPLE_BRIEF.md.
All sources were fetched on 2026-09-29. I used no Wikipedia, aggregator or social-media sources. Some search results
surfaced aggregator pages, contact details and personal details. I did not use any of them or copy them into files.

Validation: `npx tsx scripts/validate.ts` reports 0 errors. The only warning comes from another group's file
(`artifacts/continue-extension.yml`). A direct loader check confirms that all 6 people files parse with no issues.

## Summary

| Candidate | Result | File |
| --- | --- | --- |
| Tim Dettmers | created, published | content/people/tim-dettmers.yml |
| Nathan Lambert | **not created** | — |
| Luca Soldaini | created, published (see flag) | content/people/luca-soldaini.yml |
| Stella Biderman | created, published | content/people/stella-biderman.yml |
| Maxime Labonne | created, published | content/people/maxime-labonne.yml |
| Omar Sanseviero | created, published | content/people/omar-sanseviero.yml |
| Teknium | created, published | content/people/teknium.yml |

## Per candidate

### Tim Dettmers: published
- Current roles come from his own about page (timdettmers.com/about): "Assistant Professor at Carnegie Mellon University"
  and "Research Scientist at the Allen Institute for Artificial Intelligence (Ai2)". The page also says he is "the creator
  and maintainer of bitsandbytes".
- The CMU CSD faculty page confirms "Assistant Professor" and that he created bitsandbytes. The Ai2 team page
  (allenai.org/team) lists him but shows no title.
- The Ai2 tie is documented, so it links to `ai2`. It also links to `carnegie-mellon-university`.
- Contributions: bitsandbytes (the README describes k-bit quantization for PyTorch, 8-bit optimizers, LLM.int8() and
  QLoRA) and first authorship of the QLoRA paper (arXiv 2305.14314). Neither is a catalog artifact, so `artifact_slug`
  is null.
- The GitHub profile bio still shows an older university affiliation, so the profile does not link to it.

### Nathan Lambert: not created (current role not verifiable)
- His own homepage (natolambert.com) says: "He is currently doing something new. He was recently a post-training lead
  at Ai2." That means his current role is not documented.
- The Interconnects about page still calls him "a senior research scientist and post-training lead at the Allen
  Institute for AI (Ai2)". This contradicts his homepage and appears stale.
- The Ai2 team page does not list him.
- Under rule 8 (current role must be verified), I did not create a profile. Revisit when he publicly documents his new
  role.

### Luca Soldaini: published, flagged
- The caller's premise (currently at Ai2) is out of date. His own site (soldaini.net) says: "Currently, I am a member of
  the technical staff at Microsoft AI working on MAI-Thinking models." It also says: "From 2022 to early 2026, I was a
  lead research scientist at Ai2, co-leading the Olmo project."
- The profile records Microsoft AI as current (linked to the `microsoft` organization) and Ai2 as a past role
  (`current: false`).
- Open-model contributions: co-leading Olmo (`olmo`, from his site) and first authorship of the Dolma paper
  (`dolma`, arXiv 2402.00159).
- The brief's criteria are met: a documented current role and a documented open-model contribution.
- **Editorial flag:** his current work at Microsoft AI is not open-weight or local work, so his fit for the Local corner
  rests on past Ai2 work. Set the profile to draft if editors prefer current work only.

### Stella Biderman: published
- The EleutherAI staff page lists her as "Executive Director".
- She is first author of the Pythia paper (arXiv 2304.01373) and first-listed in the Pythia repository's citation.
- She is a credited author in the lm-evaluation-harness README citation and CITATION.bib.
- Links to `eleutherai`, `pythia` and `lm-evaluation-harness`.
- stellabiderman.com returned a TLS certificate for an unrelated domain, so I did not use or link it. I found no
  official source for her GitHub account, so it is not linked either.

### Maxime Labonne: published
- His own GitHub profile has the bio "Head of Post-Training @ Liquid AI". His profile README says: "My work at Liquid AI
  is to post-train our own pre-trained LLMs with a custom architecture" (LFM2/LFM2.5). His own blog's about page
  (maximelabonne.substack.com/about) gives the same title.
- He is listed among the contributors in the LFM2 Technical Report (arXiv 2511.23404, Section 10). That report says
  the models ship with open weights and llama.cpp/ExecuTorch deployment packages.
- The LLM Course README contains his quantization tutorials (GGUF/llama.cpp, GPTQ, ExLlamaV2) and AutoQuant.
- Links to `liquid-ai` and `lfm`. The X link from his profile is excluded because the brief forbids social media.

### Omar Sanseviero: published
- His own site (osanseviero.github.io/hackerllama) says: "I Lead Developer Experience at Google DeepMind" and "As the
  Developer Experience Lead". It names AI Studio, the Gemini API and Gemma. It says he leads "the developer experience
  and launches" for models including Gemma, and it mentions MedGemma and EmbeddingGemma.
- Past role, from the same site: "Chief Llama Officer / Head of Platform and Community" at Hugging Face.
- Google Developers Blog bylines give his title as "Member of the Technical Staff": the Gemma 3n developer guide
  (2025-06-26) and the Gemma 4 12B developer guide (2026-06-03). The Gemma 4 12B guide mentions local use through
  LM Studio and Ollama.
- The role field uses the title from his own site. The byline title is recorded here for reviewers.
- Links to `google-deepmind`, `gemma`, `gemma-4-12b` and `hugging-face` (past).
- I left out the location, contact and country details on his site.

### Teknium: published (pseudonymous)
- The profile uses only the name "Teknium", which is how the Nous Research-hosted Hermes 3 Technical Report credits the
  author (first author, Nous Research). The Hermes 4 Technical Report, also hosted on nousresearch.com, lists the
  first author with an additional name. I did not use that name anywhere in the profile, and I made no attempt to
  identify the person further.
- The role comes from Teknium's own GitHub profile README: "a Co-founder of NousResearch". The same README lists
  Hermes 2/3/4 and names Hermes Agent as the current focus, described as running locally.
- The nousresearch.com homepage has no team page, and I found no official Nous page that states a title. The co-founder
  role therefore rests on Teknium's own profile.
- Links to `nous-research` and `hermes`. No X handle or email is included.
