# Round 5 verification: finder configurations (`round5-verify-finder`)

Checked on 2026-10-08 against `research/notes/round5-finder.md`, the `FinderConfig` schema in
`lib/schema.ts`, and the matching logic in `lib/finder.ts`. I fetched all 90 distinct URLs cited
in `content/finder/*.yml` today with curl (`-A "USASI-factcheck/0.3"`). All returned HTTP 200.
Where a docs site also serves Markdown (docs.ollama.com, docs.cline.bot, lmstudio.ai,
developers.openai.com, code.visualstudio.com), I read that copy as well. I used one web search,
restricted to support.microsoft.com, to look for a page about signed-out file upload in Copilot.
It found none. I sent no email address, name, or other identifier in any request, did not use the
Browser pane, did not sign in, and did not get around any gate or bot check.

Validator after edits: `npx tsx scripts/validate.ts` gives 0 errors and 1 warning. The warning
is the existing continue-extension one.

## Summary

| File | Result |
| --- | --- |
| cline-ollama-gpt-oss-20b | 1 addition (Intel caveat in `unverified`) |
| goose-ollama-granite-4-2-8b | 1 correction (summary), 1 addition (Intel caveat) |
| open-webui-ollama-granite-4-2-8b | 1 addition (Intel caveat) |
| anythingllm-ollama-gemma-4-12b | 1 addition (Intel caveat) |
| ollama-app-gpt-oss-20b | 1 addition (Intel caveat) |
| llamafile-gpt-oss-20b | 5 changes (Intel added, memory set to null, skill_note, getting_started, unverified) |
| codex-cli-openai | 3 corrections (cost_basis value and note, getting_started step, limitation) |
| gemini-cli-google | 1 narrowing (limitation wording) |
| lm-studio-gemma-4-12b-qat | verified, no changes |
| whisper-turbo-local | verified, no changes |
| parakeet-tdt-0-6b-v3-nemo | verified, no changes |
| github-copilot-vscode | verified, no changes |
| claude-apps-file-uploads | verified, no changes |
| gemini-apps-file-uploads | verified, no changes |
| microsoft-copilot-file-upload | verified, no changes (one point for the editor, below) |
| openai-speech-to-text-api | verified, no changes |
| google-cloud-speech-to-text | verified, no changes |

## The two hardware questions from the brief

### Ollama and `intel`

`docs.ollama.com/gpu` has sections for NVIDIA, AMD Radeon (ROCm), Metal (Apple GPUs), and
"Vulkan GPU Support". The Vulkan section says "Additional GPU support on Windows and Linux is
provided via Vulkan." It says most GPU vendors' Windows drivers bundle Vulkan, and it links
"Linux Intel GPU Instructions" for installing Intel's driver. That is Ollama naming Intel GPUs as
a Vulkan path, so I kept `intel` in all five Ollama configurations. The basis is narrow, though:
Ollama lists no supported Intel GPU models, names Intel only in the Linux instructions, and says
Intel-based Macs (`docs.ollama.com/macos`, "x86 (CPU only)") run on the CPU only. `lib/finder.ts`
does not combine the operating system with the graphics answer. A Windows or macOS visitor who
picks Intel therefore sees "Documented to support Intel graphics." I added the same caveat to
`unverified` in all five files:

- Added: "Ollama names Intel GPUs only in its Linux Vulkan driver instructions and lists no
  supported Intel models; Intel GPU acceleration on Windows is not established here, and
  Intel-based Macs run on the CPU only." (source: docs.ollama.com/gpu, docs.ollama.com/macos)

### LM Studio accelerators

I confirmed the writer's reading. `lmstudio.ai/docs/app/system-requirements` (HTML and `.md`)
names Apple Silicon (M1 to M4) and asks for "at least 4GB of dedicated VRAM" on Windows. It names
no GPU vendor, and neither do any of the other LM Studio pages cited. `cpu-only` rests on
Google's Gemma 4 page: the QAT GGUF for "llama.cpp / LM Studio (Local)" is for "Zero-setup local
deployment on CPU, Apple Silicon, or consumer GPUs". Keeping `[apple-silicon, cpu-only]` and the
`unverified` note is correct. No change.

### llamafile and `intel` (writer's note was wrong)

The writer's notes say llamafile "names no Intel backend (only Vulkan)". The GPU table on
`docs.mozilla.ai/llamafile/reference/support` has a row "Any (incl. Intel) | Vulkan | Linux,
Windows, macOS | Supported". It also says there is no Intel oneAPI/SYCL backend. llamafile
therefore documents Intel graphics through Vulkan by name, and more directly than Ollama does.

## Memory figures

| Claimed | Source text today | Result |
| --- | --- | --- |
| gpt-oss-20b 16 GB (Cline, Ollama app) | OpenAI card: "run within 16GB of memory"; Ollama library: "as little as 16GB memory", MXFP4 "natively without additional quantizations" | Exact. Kept as `system_gb: 16`. |
| gpt-oss-20b 16 GB (llamafile) | Mozilla.ai lists `gpt-oss-20b-mxfp4.llamafile` as 12 GB and states no memory figure | Not a publisher figure for the named variant. Removed (see below). |
| Gemma 4 12B Q4_0 6.7 GB | ai.google.dev/gemma/docs/core Table 1: "Gemma 4 12B … 6.7 GB" (Q4_0), GPU or TPU memory, weights plus 20% overhead, excludes supporting software and context | Exact. Statement matches. |
| Whisper turbo 6 GB | Whisper README table: turbo, "Required VRAM ~6 GB"; `__init__.py` maps `turbo` to the large-v3-turbo checkpoint | Exact. |
| Parakeet 2 GB | Card: "At least 2GB RAM for model to load. The bigger the RAM, the larger audio input it supports." | Exact (`system_gb: 2`). |

## Changes, file by file

### goose-ollama-granite-4-2-8b

- `summary.text`. Before: "Its Ollama provider runs a local model that supports tool calling;
  …" After: "Its Ollama provider uses a model you download and run locally, and goose relies
  heavily on tool calling; …". The old wording said goose's provider runs the model and that it
  needs tool calling. goose's providers page says the Ollama provider "runs locally, you must
  first download and run a model", and separately that goose "relies heavily on tool calling".
  (source: goose-docs.ai/docs/getting-started/providers)
- `unverified`: Intel caveat added (above).

### cline-ollama-gpt-oss-20b, open-webui-ollama-granite-4-2-8b, anythingllm-ollama-gemma-4-12b, ollama-app-gpt-oss-20b

- `unverified`: Intel caveat added (above). Every other field checked and supported.

### llamafile-gpt-oss-20b

- `accelerators.values`. Before: `[nvidia, amd, apple-silicon, cpu-only]`. After:
  `[nvidia, amd, apple-silicon, intel, cpu-only]`. (source: llamafile Supported Systems, GPU
  table "Any (incl. Intel) … Vulkan … Supported")
- `memory`. Before: `system_gb: 16` for "gpt-oss-20b with MXFP4-quantized MoE weights
  (gpt-oss-20b-mxfp4.llamafile)", with OpenAI's statement. After: `memory: null`. The finder
  would have said "the publisher's figure for … (gpt-oss-20b-mxfp4.llamafile) is about 16 GB".
  No publisher states a figure for that build. OpenAI's figure is for its own MXFP4 release, and
  Mozilla.ai gives only the 12 GB download size. Ollama's entries keep the figure because Ollama
  states it for its own tag. OpenAI's statement is still shown, now as a new limitation: "OpenAI's
  model card says MXFP4 quantization of the MoE weights lets gpt-oss-20b "run within 16GB of
  memory", but Mozilla.ai states no memory figure for its 12 GB MXFP4 llamafile, so USASI does
  not compare this build with your memory." (sources: gpt-oss-20b card, pre-built llamafiles
  page)
- `skill_note`. Before: "…on Windows the 12 GB file must be run as external weights with the
  llamafile program, or inside WSL." After: "…on Windows, files over 4GB need the separate
  llamafile program with external GGUF weights, or WSL." The README says to run the llamafile
  binary "with any external weights/models(GGUF)". It does not say the 12 GB llamafile itself can
  be used as external weights. (sources: llamafile README, Supported Systems)
- `getting_started[3]`. Before: "For NVIDIA or AMD graphics, pass `-ngl 999` …" After: "For
  NVIDIA, AMD, or other Vulkan graphics such as Intel, pass `-ngl 999` to offload to the GPU
  (`--gpu vulkan` selects Vulkan); on Apple Silicon, Metal offload is on by default." (source:
  Supported Systems GPU table, Vulkan row: "Pass -ngl 999 to offload; select with --gpu vulkan")
- `unverified`. Two items replaced. Before: "The 16 GB figure is OpenAI's statement … Mozilla.ai
  does not state memory needs for this build." After: "Mozilla.ai does not state memory needs for
  this llamafile build, so memory fit is not established." Before: "llamafile lists a Vulkan
  backend but no Intel oneAPI backend; whether a given Intel GPU works through Vulkan is not
  documented." After: "llamafile supports Intel GPUs only through its Vulkan backend (it has no
  Intel oneAPI or SYCL backend) and lists no specific Intel models; whether a given Intel GPU
  works is not documented."

### codex-cli-openai

- `cost_basis`. Before: `mixed`, "Codex is included in ChatGPT plans from Free through
  Enterprise, within each plan's usage limits. Signing in with an API key instead bills usage …"
  After: `subscription`, "OpenAI lists Codex CLI with ChatGPT Plus, Pro, Business, Edu, and
  Enterprise plans, within plan limits, or with an API key billed at standard API rates. Its
  pricing page describes Free and Go access only in the desktop app." The pricing page
  (developers.openai.com/codex/pricing, now served from learn.chatgpt.com) gives the Free and Go
  plans one bullet, "GPT-6 Luna at Standard speed in the desktop app, subject to rollout". "Codex
  on the web, in the CLI, in the IDE extension" first appears under Plus. The availability table
  lists Codex CLI for Plus, Pro, Business, Enterprise, and API key. The README recommends signing
  in "as part of your Plus, Pro, Business, Edu, or Enterprise plan". So no free path to the CLI
  is documented. With `mixed`, a visitor asking for no charges got a non-blocking "Billing
  depends on how you use it" note and could see the entry as a match. `subscription` turns that
  into a blocker, and still gives a non-blocking note to visitors who accept a subscription or
  usage billing. The badge now reads "Subscription", and the note mentions API-key billing.
  (sources: Codex pricing, Codex auth, Codex README)
- `getting_started[2]`. Before: "Choose Sign in with ChatGPT, or sign in with an API key, and
  complete the browser flow." After: "Choose Sign in with ChatGPT and complete the browser flow,
  or sign in with an API key." The auth page describes the browser flow only for ChatGPT sign-in.
  The CLI takes an API key through `codex login --with-api-key`. (source: Codex auth)
- `limitations[2]`. Before: "…which you can check with /status during a session; image
  generation is not available on the Free plan." After: "…which you can check with /status
  during a session." The Free-plan clause is true, but next to the corrected cost note it implied
  that the Free plan applies to the CLI. (source: Codex pricing)

### gemini-cli-google

- `limitations[0]`. Before: "…, and requires an internet connection and a Gemini Code Assist
  supported location." After: "…; it also lists a Gemini Code Assist supported location and says
  an internet connection is required." On the installation page, location is an item under
  "Recommended system specifications", and only the internet connection is marked "required".
  (source: geminicli.com/docs/get-started/installation)

## Verified without changes (main points)

- **LM Studio**: platforms; macOS (Apple Silicon, macOS 14+, Intel Macs unsupported) and Windows
  (AVX2, Snapdragon X Elite, 16GB RAM and 4GB VRAM recommended) requirements; offline guide
  (chats and documents stay on the device, search and download need internet); RAG page (.docx,
  .pdf, .txt; "sometimes requires some tuning and experimentation"); terms ("personal and / or
  internal business purposes", no modifying, distributing, or reverse engineering); pricing
  (Free plan "Run local LLMs using llama.cpp and MLX"; paid plans add US-hosted models and more
  usage); the Q4_0 QAT GGUF is not gated and is Apache 2.0.
- **Whisper**: MIT License; Python 3.8–3.11; ffmpeg package managers; Rust for tiktoken; turbo
  not trained for translation; speeds measured on an A100; device defaults to CUDA, otherwise CPU
  with FP16 falling back to FP32. `accelerators: [nvidia, cpu-only]` follows `transcribe.py`.
- **Parakeet**: 600M parameters, 25 European languages, timestamps, CC BY 4.0, commercial and
  non-commercial use; Linux; Ampere, Blackwell, Hopper, and Volta; 24 minutes with full attention
  (A100 80GB) and 3 hours with local attention; NeMo Speech needs Python 3.12+ and PyTorch 2.7+,
  with GPU "recommended for inference" (basis for `cpu-only`). The card now also documents
  Transformers and NeMo-Speech.cpp paths. These are outside this configuration, so they were not
  added.
- **GitHub Copilot in VS Code**: setup steps, Copilot Free enrollment, telemetry and public-code
  defaults, `/init`; the plans page has "Limited to 2000 completions per month on Copilot Free",
  auto model selection only, "not currently available for GitHub Enterprise Server"; the FAQ has
  the rate limits and the budget for extra usage. The source URL `/docs/copilot/setup` redirects
  to `/docs/setup/copilot`, which is the same page.
- **Claude, Gemini Apps, Microsoft Copilot, OpenAI STT, Google Cloud STT**: every limit, retention
  period, platform, sign-in method, and data statement matched the pages as read today (500MB, 20
  files, 1000 pages, 100-page visual analysis; 10 files, 2 GB, 100 MB, 10 and 5 minutes, 3 years,
  72 hours; 20 files, 50 MB, 18 months; 25 MB and formats, diarization chunking over 30 seconds,
  30-day abuse logs, approval for ZDR and MAM; 1 minute sync, 480 minutes async, 16000 Hz,
  data-logging deletion form). No prices are stored anywhere.
- **Component `record_slug`s**: all 22 resolve to published records describing the same thing
  (artifacts: cline-extension, ollama, gpt-oss-20b, goose, granite-4-2-8b, open-webui,
  anythingllm, gemma-4-12b, llama-cpp, llamafile, whisper, whisper-large-v3-turbo,
  parakeet-tdt-0-6b-v3, nemo-framework, codex-cli, gemini-cli; organizations: element-labs,
  anthropic, google, microsoft, github, openai).
- **`runs`**: local for the 8 on-device entries, hybrid for Codex CLI, Copilot, and Gemini CLI,
  hosted for the other 6. All correct.
- **Tone**: no rankings or superlatives, no prices or amounts. Every file says USASI has not
  tested it.

## Scenario check (`npx tsx -e`, findConfigs + loadCatalog)

Inputs run: (1) write-code, local, Linux, NVIDIA, 16 GB VRAM, no charges; (2) transcribe-audio,
local, macOS, Apple silicon, 16 GB RAM; (3) write-code, either, Windows, Intel, no charges, no
account; (4) chat-and-write, local, Windows, Intel, beginner; (5) work-with-documents, either,
macOS, 8 GB RAM, no account, beginner; (6) transcribe-audio, hosted, subscription OK; plus two
extra Linux runs (AMD for documents, Intel for chat).

- (1) Cline and goose match. Every reason holds: Linux and NVIDIA documented, Apache 2.0 with
  local use unlimited, no key for local runtimes. The 16 GB gpt-oss figure is compared with the
  16 GB of VRAM entered (`lib/finder.ts` falls back to VRAM when no RAM is entered); the
  publishers' "16GB of memory" does not specify the type. The hybrid tools are correctly blocked.
  After the fix, Codex shows "Involves ongoing charges" (previously "Billing depends on how you
  use it").
- (2) Whisper matches. "Documented for macOS" (README Homebrew step) holds, and "Apple silicon
  graphics are not listed" plus "Memory fit is not established" (6 GB is a VRAM figure) are
  accurate. Parakeet is correctly "Not documented for macOS". The hosted services are blocked.
- (3)/(4) Before the fix, llamafile reported "fits" against a figure no publisher gave for that
  build. It now reports insufficient evidence and "Documented to support Intel graphics". On
  Windows, the Ollama entries say "Documented to support Intel graphics"; see the editor point
  below.
- (5) Microsoft Copilot matches with "No account needed."; see the editor point below. LM Studio
  "Documented to support Apple silicon graphics" holds.
- (6) Both hosted APIs are correctly blocked as "Billed by usage". Whisper and Parakeet are
  blocked as local.

## For the editor (not changed)

1. **Microsoft Copilot `account_required: false`.** Microsoft says "Sign in isn't required", so
   the value matches the documentation for chat. None of the pages reviewed says whether file
   upload works signed out, and the one web search found no page that does. For "work with my
   documents" plus "I do not want to create an account", the entry is therefore a match with "No
   account needed.", and only the collapsed "Not verified" list carries the caveat. Setting
   `true` would contradict Microsoft's statement for chat. The Gemini entry uses `true`, but there
   Google documents that upload needs sign-in. One account flag per entry cannot express this.
2. **Open WebUI `account_required: false`.** The default setup creates a local admin account
   that "stays in your own volume" (no provider account), and single-user mode needs no login.
   The finder's "No account needed." sits next to a skill note that says "create the local admin
   account". This is accurate if "account" means a provider account. A wording decision.
3. **lib/ (outside this assignment).** (a) The graphics answer is not checked against the
   operating system, so macOS + Intel or NVIDIA shows "Documented to support … graphics" for the
   Ollama entries even though Ollama documents CPU only for Intel Macs. (b) `system_gb` figures
   are compared with VRAM when the visitor gives no RAM. (c) The insufficient-evidence message
   ("the publisher does not state a memory figure for a specific variant") now applies to
   llamafile, even though OpenAI states one for its own release; the limitation explains why.
4. **Redirects, not errors.** developers.openai.com/codex/* now redirects to learn.chatgpt.com
   (OpenAI). The cloud.google.com Speech-to-Text pages redirect to docs.cloud.google.com (the
   data-logging and console pages to their `/v1/` versions). The content matches what is cited.
5. The Ollama download page includes a block of instructions addressed to AI agents. I treated it
   as page content and did not act on it.
