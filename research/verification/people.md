# Fact-check log: Local corner people (2026-09-29)

Scope: all 12 files in `content/people/`, both published and draft. Rules applied: `research/PEOPLE_BRIEF.md`, `research/VERIFIER_BRIEF.md`, and the editor's four rulings: (1) a published profile needs a current role tied to local or open-weight AI work; (2) job titles must come from allowed sources, which rules out Jeffrey Morgan's MotherDuck author page; (3) Joshua Lochner's own GitHub bio is allowed; (4) Teknium's name and role may come only from Nous Research or Teknium's own profile.

Method: I fetched every cited source today with WebFetch or `curl -A "USASI-factcheck/0.1"`. That covers the GitHub profile pages and profile READMEs, the raw README, CITATION and governance files, the arXiv abstract pages (author lists and dates), and the PDFs of the Nomic Embed, Hermes 3 and Hermes 4 reports. No request included an email address or any personal identifier. Search results that surfaced LinkedIn, Wikipedia, YC, Tracxn and news pages were not used. `npx tsx scripts/validate.ts` gives 0 errors and no warnings for `content/people/`.

## Summary

| Profile | Status | Result |
| --- | --- | --- |
| andriy-mulyar | published → **draft** | Claims verified. Drafted under editor rule 1: no current documented tie to local or open-weight work. |
| awni-hannun | draft (kept) | Verified, no changes |
| brandon-duderstadt | draft (kept) | Verified, no changes |
| jeffrey-morgan | published | **Changed.** The title and founder claims rested only on MotherDuck pages. The role is now "Building Ollama", from his own GitHub bio. |
| joshua-lochner | published | Verified, no changes |
| luca-soldaini | draft (kept) | Verified, no changes |
| maxime-labonne | published | One wording fix |
| omar-sanseviero | published | Two wording fixes, both on the Gemma 4 12B guide |
| stella-biderman | published | Verified, no changes |
| teknium | published | One wording fix |
| tim-dettmers | published | Verified, no changes |
| woosuk-kwon | published | Verified, no changes |

## Per profile

### andriy-mulyar: changed (drafted)
- Verified:
  - Headline and bio. Nomic news bylines read "Andriy Mulyar, CEO, Nomic" (2025-11-03) and "Andriy, CEO" (2026-09-03).
  - The GPT4All README says it "runs large language models (LLMs) privately on everyday desktops & laptops" and is MIT-licensed.
  - He is an author of arXiv 2311.04931 and appears in the README citation block.
  - The Nomic Embed report's Contributions section says he "set early project direction, reviewed code implementations, and made several model design and dataset curation contributions". He is also an author of arXiv 2402.01613.
  - GitHub profile: company field "Nomic AI".
- Change: `publication_status: published → draft` (editor rule 1). Current Nomic pages do not connect his CEO role to local or open-weight AI work:
  - The 2025-11-03 CEO post says "Nomic is now focused on engineering AI systems that will accelerate the adoption of AI in Built World industries."
  - The 2026-09-03 post and the home page ("The domain-specific AI platform for architecture, engineering, and construction firms") do not mention GPT4All, Nomic Embed, or open or local models.
  - The last commit to nomic-ai/gpt4all is dated 2025-05-27. Nomic's newest Hugging Face models date from 2025-04-30.
  - nomic.ai/gpt4all still loads, but it gives no maintenance status.
  - His documented relevant work (the 2023 and 2024 reports) is therefore past only, as with Brandon Duderstadt.
- Editor may revisit: republish if Nomic documents ongoing GPT4All or open-weight work under his leadership.

### awni-hannun: verified, no changes (kept draft)
- His site says "I am currently a Member of the Technical Staff at Anthropic" and "I was a Research Scientist at Apple where I co-created MLX". His GitHub bio says "Research at Anthropic. Prev: co-created MLX at Apple".
- The MLX README calls MLX "an array framework for machine learning on Apple silicon, brought to you by Apple machine learning research". It says the MLX software suite "was initially developed with equal contribution by Awni Hannun, Jagrit Digani, Angelos Katharopoulos, and Ronan Collobert".
- The draft is correct under editor rule 1, because his MLX work is past.

### brandon-duderstadt: verified, no changes (kept draft)
- His home page says "I cofounded Nomic" and describes Calcifer as "an organization I founded". His bio page says "founding CEO of Nomic AI" and "He is building Calcifer Computing, a long-term oriented AI research and development company."
- He is an author of the GPT4All paper and appears in the README citation.
- The Nomic Embed Contributions section says he "made several design contributions across the entire stack and wrote the base implementation of the data curation pipeline".
- The draft is correct under editor rule 1.

### jeffrey-morgan: changed (stays published)
- No allowed source states a title. I checked:
  - the Ollama blog index (no bylines);
  - the "all aboard open models" post (2026-07-09), which is signed "Jeff & Michael" with no surnames or titles. Linking that signature to him would be inference;
  - ollama.com/about (404);
  - ollama.com/jmorganca (404);
  - the ollama repo, which has no CODEOWNERS, MAINTAINERS or GOVERNANCE file;
  - the ollama GitHub org page (no titles).

  Every "CEO" source found (MotherDuck author page, LinkedIn, aggregators and news) is disallowed.
- His own GitHub profile has the bio "Building @ollama" and company "@ollama". The repository commit list shows commits by jmorganca through 2026-09-08, including:
  - "server: context shift for context windows larger than 8k…" (2026-06-15);
  - "models: add cohere2_moe (Command A / North) to the MLX engine" (2026-06-17).
- Changes:
  - `headline`: "Co-founder and CEO of Ollama, an open-source tool for running language models on your own machine" → "Works on Ollama, an open-source tool for running open models on your own machine". Reason: title unsupported (editor rule 2). The description now follows the README ("Start building with open models") and the MIT LICENSE.
  - `bio.text`: removed "is a co-founder and the CEO of Ollama" and "described as one of the founders". Removed the 2024 talk sentence. Now reads: he works on Ollama, his GitHub profile says he is building Ollama, and the commit history shows recent changes to context-window handling and MLX engine model support.
  - `affiliations[0].role`: "Co-founder and CEO" → "Building Ollama", worded as in his GitHub bio. `source_ids`: [motherduck-author, github-profile] → [github-profile].
  - `work[0].contribution`: removed "Described as one of the founders…". That wording came from a MotherDuck video page, which is another company's page and not a rule-2 source. The commit-history clause is kept. `source_ids` → [ollama-commits].
  - Removed `work[1]`, the MotherDuck talk. Its only source is a third-party company's video page, which is not a rule-2 source, and it covers 2024 work.
  - Sources: removed `motherduck-author` and `motherduck-talk`. Added `ollama-repo` (github.com/ollama/ollama README and LICENSE, fetched today).
- Editor note: if an official Ollama page later states his title, the role can be updated.

### joshua-lochner: verified, no changes
- GitHub bio: "Bringing the power of machine learning to the web. Currently working on Transformers.js". Company: "@huggingface". The role "Working on Transformers.js" follows that wording, with no invented title (editor rule 3).
- The Transformers.js README says "Run 🤗 Transformers directly in your browser, with no need for a server!"
- The HF blog post on v3 (2024-10-22, "WebGPU Support…") has the byline Joshua (Xenova) as sole author. The v4 post (2026-02-09) has the byline Joshua (Xenova) and Nico Martin.
- `artifact_slug` is null, which is correct because Transformers.js is not the `transformers` record.

### luca-soldaini: verified, no changes (kept draft)
- His site says:
  - "Currently, I am a member of the technical staff at Microsoft AI working on MAI-Thinking models";
  - "From 2022 to early 2026, I was a lead research scientist at Ai2, co-leading the Olmo project";
  - Olmo released "three generations of dense, mixture-of-experts, hybrid, and multimodal variants, alongside the data, code, recipes, and checkpoints";
  - he works on "scalable data methods for language models, from pre-training to post-training".
- He is first author of the Dolma paper (arXiv 2402.00159, 2024-01-31).
- The site links github.com/soldni.
- The draft is correct under editor rule 1.

### maxime-labonne: changed (one wording fix)
- Verified:
  - GitHub bio "Head of Post-Training @ Liquid AI". The Substack about page says "Maxime Labonne is Head of Post-Training at Liquid AI."
  - His profile README says "My work at Liquid AI is to post-train our own pre-trained LLMs" (LFM2/LFM2.5).
  - He appears in the LFM2 report author list (arXiv 2511.23404). The abstract says "All models are released with open weights and deployment packages for ExecuTorch, llama.cpp, and vLLM".
  - The LLM Course quantization section links his GGUF/llama.cpp, 4-bit GPTQ and ExLlamaV2 tutorials.
- Change: `work[1].contribution` said the quantization section links "plus the AutoQuant notebook". AutoQuant is actually in the course's Tools table, so the wording is now "…ExLlamaV2; its tools section links his AutoQuant notebook."

### omar-sanseviero: changed (two wording fixes)
- Verified:
  - His site says "I Lead Developer Experience at Google DeepMind" and "As the Developer Experience Lead…". It names AI Studio, the Gemini API and Gemma, and says "Leading the developer experience and launches for major models including Gemini 3, Gemma, and Nano Banana".
  - The site also says he is "very involved in GDM open model efforts, such as MedGemma, EmbeddingGemma", and gives the past HF titles "Chief Llama Officer" and "Head of Platform and Community".
  - The Gemma 3n guide (2025-06-26) is co-authored with him and describes a "mobile-first architecture" for "on-device applications".
  - The Gemma 4 12B guide (2026-06-03) is also co-authored with him.
  - Both Google Developers Blog bylines give his title as "Member of the Technical Staff". The role field keeps his own site's title.
- Changes:
  - `bio.text`: "which the guide says can run locally through tools such as LM Studio and Ollama" → "which the guide says is small enough to run locally on laptops with a dedicated GPU". The guide says "Small enough to run locally on dedicated GPU laptops…". It lists LM Studio and Ollama only under "Try it yourself".
  - `work[1].contribution`: "covers running the model locally with tools such as LM Studio and Ollama" → "covers local inference with tools such as llama.cpp and MLX and points to LM Studio and Ollama for trying the model". Source quotes: "Implement local inference pipelines with … llama.cpp, MLX…" and "Experiment with a couple of clicks in LM Studio, Ollama…".

### stella-biderman: verified, no changes
- The EleutherAI staff page lists her as "Executive Director".
- She is first author of the Pythia paper (arXiv 2304.01373). The paper describes 16 models from 70M to 12B parameters, trained on public data in the same order, with 154 checkpoints each. She is also first in the Pythia README citation.
- She is listed in the lm-evaluation-harness README and CITATION.bib author lists.

### teknium: changed (one wording fix)
- Name and role come only from Teknium's own GitHub profile and Nous Research pages (editor rule 4):
  - The profile README says "a Co-founder of NousResearch" and "My current focus is Hermes Agent…". It describes Hermes Agent as "A terminal-native, extensible AI coding & personal agent with persistent memory" and says it "Runs locally".
  - The README lists the Hermes-4, Hermes-3 and Nous-Hermes-2 models under work at Nous Research.
- nousresearch.com has no team or about page that names people. /releases lists the Hermes 1–4 releases and Hermes Agent, with no names.
- The Hermes 3 report (nousresearch.com) lists "teknium, Nous Research" first. The Hermes 4 report lists as first author a credit that includes "Teknium" and the same handle.
- Neither report is used for anything beyond the name "Teknium". No further identification was attempted, and no other name was recorded.
- Both reports state that the weights are publicly released.
- Change: `bio.text`: "works on its Hermes series of post-trained language models" → "has contributed to its Hermes series of fine-tuned language models". The README says "I've contributed significantly to the development of…", and its current focus is Hermes Agent. The Hermes 3 report describes the models as "created by fine-tuning Llama 3.1".

### tim-dettmers: verified, no changes
- His about page says "I am an Assistant Professor at Carnegie Mellon University (CMU) and a Research Scientist at the Allen Institute for Artificial Intelligence (Ai2)" and "I am the creator and maintainer of bitsandbytes."
- The CMU CSD page lists him as "Assistant Professor" and says he developed bitsandbytes. The Ai2 team page lists him by name only.
- The bitsandbytes README describes "k-bit quantization for PyTorch" with 8-bit optimizers, LLM.int8() and QLoRA, and cites his three papers.
- He is first author of the QLoRA paper (arXiv 2305.14314), which reports finetuning "a 65B parameter model on a single 48GB GPU".

### woosuk-kwon: verified, no changes
- His site says "I am the co-founder and CTO of Inferact, a startup advancing the frontier of AI inference" and "I co-created and now co-lead the vLLM project… open-source inference engine for LLMs".
- The vLLM governance doc lists him under "Lead Maintainers", which are "responsible for the overall direction and strategy of the project".
- He is first author of arXiv 2309.06180 (PagedAttention/vLLM). The README asks users to cite that paper.

## Could not verify / follow-up
- Jeffrey Morgan's title: no rule-2 source exists. See above.
- Nomic's GPT4All maintenance status is not stated anywhere official. The drafting decision relies on the absence of current documentation, which the editor may want to confirm.
