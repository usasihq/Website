# Round 4 verification: hubs (`round4-verify-hubs`)

Checked on 2026-10-08. Every source was fetched today with curl (`-A "USASI-factcheck/0.3"`)
or WebFetch; no browser was used and no identifiers were sent in any request. Files checked:

- `content/hubs/safety-and-security.yml`
- `content/hubs/developer-tools.yml`
- `content/hubs/speech-vision-and-multimodal.yml`

`npx tsx scripts/validate.ts` after the edits: **0 errors**, 1 warning (pre-existing:
`artifacts/continue-extension.yml`, not in these files).

## Records, links, and filters (all three hubs)

- **Featured organizations:** all 16 exist with `publication_status: published` (nist, metr,
  mlcommons, center-for-ai-safety, far-ai, pytorch-foundation, hugging-face, lmsys, vercel,
  langchain, weights-and-biases, ai2, meta, nvidia, openai, genmo). Each record's summary fits
  its hub.
- **Featured artifacts:** all 29 exist and are published (dioptra, petri, hawk, ailuminate,
  gpt-oss-safeguard, gpt-oss, synthid-bio; pytorch, transformers, vllm, sglang, ai-sdk,
  langchain-framework, dspy, gemini-cli, openhands, spec-kit, wandb-sdk, mlflow; clip,
  molmo2-o-7b, florence-2, gemma-4-12b, whisper, parakeet-tdt-0-6b-v3, sam-3-1, dinov3,
  diffusers, mochi-1-preview).
- **Featured people (developer-tools):** soumith-chintala, thomas-wolf, woosuk-kwon, and
  ying-sheng are published, and their records tie them to PyTorch, Transformers, vLLM, and SGLang.
- **Internal links:** every `/learn/` slug is an existing or round-4 explainer listed in the
  brief, and the MDX files exist (`learn-safety-testing-and-frameworks`,
  `learn-ai-content-provenance`, `learn-how-models-use-tools`, `learn-how-language-models-work`,
  `learn-retrieval-augmented-generation`, `learn-multimodal-models`). Every `/hubs/` link exists
  (evaluation, agents, open-source-foundations, local-ai, robotics). Every glossary anchor
  exists (acceptable-use-policy, inference, open-source-software, gated-download, license-scope).
- **Directory filters:** each parameter is one that `parseArtifactFilters` /
  `parseOrgFilters` in `lib/search.ts` accepts (`q`, `kind` in model|framework|eval|runtime,
  `role` in standards-body|nonprofit-research|developer-platform|open-source-steward). I ran
  each link against the catalog with `filterArtifacts` / `filterOrganizations`. All return
  records, and the records match the notes. For example, `?q=safety` returns gpt-oss-safeguard,
  petri, and ailuminate, and `role=standards-body` returns exactly nist and mlcommons.
  The one exception is `kind=runtime` (corrected below).
- **Tone:** there are no superlatives, funding, prices, or counts of users or downloads. The
  only hits from a scan were a quoted phrase from the CLIP README ("most relevant text"),
  "Most AI software" (changed), and "frank" (changed).

## safety-and-security.yml

### Claims checked

1. **NIST AI RMF, Dioptra, CAISSI.** The NIST RMF page says the framework was "Released on
   January 26, 2023", is "intended for voluntary use", and that "The AI RMF 1.0 is being
   revised as part of the White House AI Action Plan". AI 100-1 says the Core is composed of
   four functions: GOVERN, MAP, MEASURE, MANAGE. The Dioptra README says it "supports the
   Measure function" and lists the use "Red-Teaming: Expose models and resources to a red team
   in a controlled environment". The nist.gov/caissi page is headed with the CAISSI name and
   says the center will "assist industry to develop voluntary standards" and will "lead
   unclassified evaluations" that "focus on demonstrable risks, such as cybersecurity,
   biosecurity, and chemical weapons". All supported.
2. **Developer frameworks.** The Preparedness Framework PDF says "Version 2. Last updated:
   15th April, 2025". Its Tracked Categories are Biological and Chemical, Cybersecurity, and AI
   Self-improvement, and it "sets thresholds we can measure". The GDM post (dated Sept 22, 2025,
   updated April 17, 2026) defines CCLs as levels at which, "absent mitigation measures",
   models "may pose heightened risk of severe harm". The Anthropic RSP page lists "Version 3.4
   and redline (effective July 8, 2026)" as the latest. The gpt-oss model card says OpenAI
   "created internal, adversarially fine-tuned versions of the gpt-oss-120b model … which we
   are not releasing", motivated by the fact that malicious actors can fine-tune open-weight
   models. All supported.
3. **Testing tools.** The Petri README describes "multi-turn audits with an auditor model and
   a target model" and scoring "transcripts with a judge model". Anthropic's post of May 7, 2026
   says Petri has been part of its alignment assessment "for every Claude model since Claude
   Sonnet 4.5" and that development was handed to "Meridian Labs, an AI evaluation nonprofit".
   The Hawk README says Hawk runs Inspect AI evaluations, provisions "isolated Kubernetes pods",
   and that Inspect AI is "the open-source evaluation framework created by the UK AI Security
   Institute". The AILuminate page lists "12 hazard categories" and Jailbreak T2T and T+I2T
   benchmarks. All supported.
4. **Safety classifiers.** The Llama Guard 4 card describes a "natively multimodal safety
   classifier with 12 billion parameters" that outputs safe or unsafe and lists the violated
   categories, "based on the MLCommons safety taxonomy". The gpt-oss-safeguard README and the
   20b card say the models classify text "based on safety policies that you provide", are
   "intended for safety use cases", and must use harmony or "will not work correctly". All
   supported.
5. **Provenance.** AI 100-4 covers watermarking, metadata recording, and detection, and says
   "None of these techniques offer comprehensive solutions on their own". The C2PA 2.4
   explainer calls a Content Credential "a cryptographically bound structure". It says
   credentials do not judge whether provenance is "'true'", only whether it is well-formed,
   untampered, "valid and trusted". The SynthID Text README calls itself "a reference
   implementation … not intended for production use". SynthID Bio watermarks "AI-generated
   biological sequences and structures". All supported.
6. **Prompt injection.** AI 100-2 E2025 §3.3–3.5 defines direct and indirect injection,
   describes mitigations, and covers agent risks. The definition of "direct" was overstated
   (corrected below). The rest is supported: "current mitigations do not offer full
   protection"; designers may assume injection is possible "if a model is exposed to untrusted
   input sources"; agents can be hijacked "to execute arbitrary code or exfiltrate data".

The scope paragraph, reading-path notes, and primary-document notes were each checked against
the target page or source. The corrections are listed below.

### Changes (before → after)

1. **Intro 6, the definition of direct injection** (source: NIST AI 100-2 E2025 §3.3).
   NIST says the main user's instructions "are appended to higher-trust instructions". It does
   not say they are "meant to override" them.
   - Before: "calls it direct when a user adds instructions meant to override higher-trust ones such as the system prompt"
   - After: "calls it direct when the system's main user supplies instructions that are appended to higher-trust ones, such as the system prompt,"
2. **Primary documents, nist-ai-100-2 note.** "Frank" is an evaluative word, so I made the
   tone neutral.
   - Before: "a frank account of the limits of current mitigations"
   - After: "a statement of the limits of current mitigations"
3. **Primary documents, nist-caissi note.** This addresses the writer's CAISSI/CAISI flag. The
   page heading says CAISSI, but the evaluation items it lists say CAISI (for example "CAISI
   Evaluation of DeepSeek V4 Pro"; "CAISI's Assessment of Z.ai's GLM-5.3", dated
   Sept 17, 2026).
   - Before: "…links to its published evaluations of specific models."
   - After: "…links to its published evaluations of specific models. The evaluation items listed there use the name Center for AI Standards and Innovation (CAISI)."
   - The intro keeps "CAISSI" because it matches the page heading and the name the page uses
     for the center's stated responsibilities.
4. **Reading path, the acceptable-use-policy note.** The glossary entry says a license "can
   incorporate such a policy by reference, which makes following the policy one of the
   license's conditions", so "separate from its license" was misleading.
   - Before: "The terms that say what a model may not be used for, separate from its license."
   - After: "A publisher's list of prohibited uses, which a license can make binding by reference."

## developer-tools.yml

### Claims checked

1. **PyTorch.** The README describes "Tensor computation (like NumPy) with strong GPU
   acceleration", Tensors that "live either on the CPU or the GPU", and a "tape-based autograd
   system". **Transformers.** The README says it "works with Python 3.10+, and PyTorch 2.5+" and
   covers "text, computer vision, audio, video, and multimodal models, for both inference and
   training". It also says a supported model definition is compatible with "the majority of"
   training frameworks and inference engines "(vLLM, SGLang, TGI, ...)". The hub's "many" is
   narrower than that, which is fine. Supported.
2. **vLLM.** The README says it was "Originally developed in the Sky Computing Lab at UC
   Berkeley" and lists PagedAttention, continuous batching, an "OpenAI-compatible API server",
   and support for "NVIDIA GPUs, AMD GPUs, Intel GPUs, and x86/ARM/PowerPC CPUs" plus plugins.
   **SGLang.** The README calls it "an open-source inference framework for large language,
   vision-language, and diffusion models" and says "SGLang Diffusion is its built-in image and
   video generation engine". Supported.
3. **AI SDK.** The README says "provider-agnostic TypeScript toolkit", "unified API" for
   OpenAI, Anthropic, and Google, "By default, the AI SDK uses the Vercel AI Gateway", and "You
   can also connect to providers directly". **LangChain.** The README says "a standard
   interface for models, embeddings, vector stores". **DSPy.** The README says "write
   compositional Python code" and that DSPy offers "algorithms for optimizing their prompts and
   weights". Supported.
4. **Gemini CLI.** The README calls it an open-source AI agent in the terminal, "Apache 2.0
   licensed", with built-in tools "Google Search grounding, file operations, shell commands,
   web fetching". Google attribution comes from the `@google/gemini-cli` package and the catalog
   record. The sandbox doc says sandboxing "isolates potentially dangerous operations (such as
   shell commands or file modifications)" and is enabled by a flag, an environment variable, or
   settings. With Docker or Podman, the current working directory is mounted. The macOS default
   `permissive-open` profile "confines writes to the project directory while allowing broad
   file reads and network access". **OpenHands.** The README warns that without a sandbox "the
   agent will have full access to your filesystem". **Spec Kit.** The README says it "gives AI
   coding agents structured processes, reusable templates", and Spec-Driven Development is one
   of its processes. Supported.
5. **wandb.** The quickstart has you sign up for an account, create an API key, call
   `wandb.init()` and `run.log()`, and view results at wandb.ai/home. **MLflow.** The README
   lists observability/tracing, evaluation, and prompt management for agents and LLM apps. Its
   quickstart runs `uvx mlflow server`, sets the tracking URI to `http://localhost:5000`, and
   calls `mlflow.openai.autolog()`. Supported.

The scope and primary-document notes match their sources. The reading-path note for
open-source foundations is supported: the open-source-foundations hub says the PyTorch
Foundation supports PyTorch and vLLM.

### Changes (before → after)

1. **Intro framing sentences.** These were quantified generalizations with no source, so I
   softened them.
   - "Most AI software is built in layers." → "AI software is often built in layers."
   - "Serving a model to an application usually means running an inference server." → "…often means…"
   - "Application code usually reaches a model through an SDK or framework." → "…often reaches…"
2. **Reading path, the open-source-software note.** The glossary entry covers the OSI Open
   Source Definition. It says nothing about model terms.
   - Before: "What an open-source license allows, and why it is separate from a model's terms."
   - After: "What an open-source software license allows under the Open Source Definition."
3. **Directory link `/open/?kind=runtime`.** Running the filter returns 26 records. They
   include coding agents (gemini-cli, codex-cli, cline-extension, goose), apps (open-webui,
   anythingllm), and chroma-db, as well as inference servers and runtimes.
   - Before: "Software that loads and serves models, from local runtimes to multi-GPU servers."
   - After: "Records of the Runtime kind, mostly software that loads and serves models, from local runtimes to multi-GPU servers, plus some agents, apps, and related tools."

## speech-vision-and-multimodal.yml

### Claims checked

1. **CLIP.** The model card says encoders are "trained to maximize the similarity of (image,
   text) pairs". The README says CLIP can "predict the most relevant text snippet, given an
   image, without directly optimizing for the task". The card describes CLIP as "a research
   output", says "**Any** deployed use case … whether commercial or not - is currently out of
   scope", that certain surveillance and facial recognition uses "are always out-of-scope", and
   that use "should be limited to English". The "always" qualifier was lost in the hub
   (corrected below).
2. **Vision-language models.** The Molmo2-O-7B card says it is "based on Olmo3-7B-Instruct and
   uses SigLIP 2 as vision backbone" and supports "image, video and multi-image understanding
   and grounding". The card's metadata names `google/siglip-so400m-patch14-384`, but the Molmo2
   paper (arXiv 2601.10611) confirms "SigLIP 2 So400m/14 384px", so no change. The Florence-2
   card says it "can interpret simple text prompts to perform tasks like captioning, object
   detection, and segmentation". The Gemma 4 12B card says it "eliminates these encoders
   entirely, projecting raw image patches and audio waveforms directly into the LLM's embedding
   space through lightweight linear layers", that video is processed "as frames", and that the
   authors are Google DeepMind. Supported.
3. **Speech.** The Whisper README describes a "Transformer sequence-to-sequence model" for
   multilingual recognition, speech translation, and language identification. The parakeet card
   says "600-million-parameter", "25 European languages", that it "automatically detects the
   language", and lists punctuation and word-level timestamps. The Whisper card's limitations
   cover "texts that are not actually spoken", uneven accuracy across languages, accents, and
   dialects, and "we caution against using Whisper models to transcribe recordings of
   individuals taken without their consent". Supported.
4. **SAM 3 and DINOv3.** The SAM 3 README says it can "detect, segment, and track objects using
   text or visual prompts such as points, boxes, and masks". Its entry dated 03/27/2026 says
   SAM 3.1 introduced new checkpoints and "a shared-memory approach for joint multi-object
   tracking". The DINOv3 README describes "vision foundation models producing high-quality dense
   features" and includes semantic segmentation and depth estimation code. Supported.
5. **Generation.** The Diffusers README says it "offers three core components": pipelines,
   interchangeable noise schedulers, and pretrained models. The Mochi card describes a "10
   billion parameter diffusion model" under "Apache 2.0", says "The initial release generates
   videos at 480p", and that it needs "approximately 60GB VRAM when running on a single GPU".
   Supported.
6. **Terms.** The parakeet card says "license: cc-by-4.0". The Molmo2 card says "licensed under
   Apache 2.0. It is intended for research and educational use", and that its training data is
   "subject to academic and non-commercial research use only". SAM 3 says "request access to the
   checkpoints" and the project is "licensed under the SAM License" (LICENSE file "Last Updated:
   November 19, 2025", which matches the source's `published_at`). DINOv3 says "follow the link
   … to get access … once accepted" and "released under the DINOv3 License". Supported.

The scope, reading-path notes (including "Gemma 4 12B … documented for local use", which the
card supports with "streamlined local execution" and consumer GPUs and workstations), and
primary-document notes all match their sources.

### Changes (before → after)

1. **Intro 1, CLIP out-of-scope uses** (source: CLIP model card, "Out-of-Scope Use Cases").
   - Before: "any deployed use, commercial or not, is currently out of scope, as are surveillance and facial recognition, and use should be limited to English."
   - After: "any deployed use, commercial or not, is currently out of scope; certain surveillance and facial recognition uses are always out of scope; and use should be limited to English."

## Writer's flags

- **CAISSI vs CAISI:** handled in safety change 3 above.
- **NIST AI 100-4 landing page 404:** today the publication page at
  `https://www.nist.gov/publications/reducing-risks-posed-synthetic-content-overview-technical-approaches-digital-content`
  returned 200. The writer may have tried a different URL. The cited PDF on nvlpubs.nist.gov is
  the official document and supports the claim, so no change was needed.
- **OpenAI Preparedness blog 403:** `openai.com/index/updating-our-preparedness-framework/` and
  `openai.com/safety/preparedness/` both returned 403 to curl and WebFetch, and I did not try to
  get around this. The cited cdn.openai.com PDF is official and supports every claim as dated
  ("version 2, April 2025").
- **Llama Guard 4 and SynthID Text have no catalog records:** neither intro links them, and
  both claims are supported by their primary sources, so the hubs are accurate as written. The
  editor may want records for them.

## Could not verify

- I could not confirm from an OpenAI page that Preparedness Framework version 2 is still the
  current version as of 2026-10-08, because openai.com returned 403. The hub names the version
  and date explicitly, so the sentence stays accurate either way.
