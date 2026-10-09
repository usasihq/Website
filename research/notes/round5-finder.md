# Round 5: finder configurations (`round5-finder`)

Date: 2026-10-08. All sources were fetched today with `curl -A "USASI-catalog-research/0.3"`
(no identifiers in any request). The shared Browser pane was not used. Web search was used only
to find the URLs of Microsoft support pages; every cited page was fetched and read directly.

Created 17 files under `content/finder/`, all `publication_status: published`, all `tested: null`.
`npx tsx scripts/validate.ts`: 0 errors. The only warning is the existing continue-extension one.
A scratch check through `lib/finder.ts` parsed all 17 and produced matches for every task.

## Configurations

| Slug | Tasks | Runs | Skill | Memory | Main sources |
| --- | --- | --- | --- | --- | --- |
| cline-ollama-gpt-oss-20b | write-code | local | intermediate | 16 GB (system) | Cline local-models, install, auth docs and README; Ollama Windows/macOS/Linux/GPU/context/FAQ/quickstart/pricing docs; Ollama's Cline integration; gpt-oss library page; gpt-oss-20b card; VS Code requirements |
| goose-ollama-granite-4-2-8b | write-code | local | intermediate | null | goose quickstart, install, providers, README; Ollama granite4.2 page and goose integration; Ollama docs |
| codex-cli-openai | write-code | hybrid | intermediate | null | Codex README, docs/install.md, developers.openai.com Codex CLI, auth, and pricing pages |
| github-copilot-vscode | write-code | hybrid | intermediate | null | VS Code requirements, Copilot setup, agents FAQ; GitHub Copilot plans |
| gemini-cli-google | write-code | hybrid | intermediate | null | Gemini CLI README, installation page, tos-privacy.md |
| anythingllm-ollama-gemma-4-12b | work-with-documents, chat-and-write | local | intermediate | null | AnythingLLM desktop overview, system requirements, Ollama setup, README (telemetry); Ollama gemma4 page; Gemma 4 QAT card (license); Ollama docs |
| open-webui-ollama-granite-4-2-8b | work-with-documents, chat-and-write | local | intermediate | null | Open WebUI README, LICENSE, quick start; Ollama granite4.2 page; Ollama docs |
| lm-studio-gemma-4-12b-qat | chat-and-write, work-with-documents | local | beginner | 6.7 GB (GPU) | LM Studio docs (welcome, get started, system requirements, RAG, offline), pricing, terms; Gemma 4 core docs (memory table); Gemma 4 12B QAT GGUF card; HF API metadata (not gated) |
| ollama-app-gpt-oss-20b | chat-and-write, work-with-documents | local | beginner | 16 GB (system) | Ollama "new app" announcement (2025-07-30); Ollama docs, pricing; gpt-oss library page and card |
| llamafile-gpt-oss-20b | chat-and-write | local | intermediate | 16 GB (system) | llamafile README, pre-built llamafiles, supported systems; gpt-oss-20b card |
| claude-apps-file-uploads | chat-and-write, work-with-documents | hosted | beginner | n/a | support.claude.com: get started, upload files, log in; privacy.claude.com model-training article |
| gemini-apps-file-uploads | chat-and-write, work-with-documents | hosted | beginner | n/a | support.google.com/gemini: Use Gemini Apps, upload files, Privacy Hub |
| microsoft-copilot-file-upload | chat-and-write, work-with-documents | hosted | beginner | n/a | support.microsoft.com: Copilot app, free vs Microsoft 365, file upload, Copilot for individuals privacy overview |
| whisper-turbo-local | transcribe-audio | local | intermediate | 6 GB (GPU) | Whisper README; whisper/transcribe.py (CUDA or CPU device default); whisper/__init__.py (turbo = large-v3-turbo checkpoint) |
| parakeet-tdt-0-6b-v3-nemo | transcribe-audio | local | advanced | 2 GB (system) | parakeet-tdt-0.6b-v3 card; NeMo Speech README; HF API metadata (not gated) |
| openai-speech-to-text-api | transcribe-audio | hosted | advanced | n/a | developers.openai.com: speech-to-text guide, quickstart, pricing (billing basis only), data controls |
| google-cloud-speech-to-text | transcribe-audio | hosted | advanced | n/a | cloud.google.com: STT overview, console quickstart, pricing (billing basis only), data logging |

Task coverage: write-code 5, work-with-documents 7, transcribe-audio 4, chat-and-write 8.

## Memory statements (only where the publisher states a figure for the exact variant)

- gpt-oss-20b, MXFP4 MoE weights: OpenAI's card says it can "run within 16GB of memory"; Ollama's
  library page says it supports MXFP4 natively and the smaller model runs on systems with as little
  as 16GB. Stored as `system_gb: 16` because neither says GPU memory. The llamafile entry uses the
  same OpenAI figure for Mozilla.ai's MXFP4 build; Mozilla.ai states no figure of its own (said in
  the entry).
- Gemma 4 12B at Q4_0: Google's table gives about 6.7 GB of GPU or TPU memory, weights plus 20%
  overhead, excluding context. Stored as `gpu_gb: 6.7` and used only with the Q4_0 QAT GGUF in
  LM Studio. It is not used for Ollama's gemma4:12b, because Ollama does not state that tag's
  quantization.
- Whisper turbo: the README lists about 6 GB of required VRAM.
- Parakeet TDT 0.6B v3: the card says at least 2GB of RAM to load the model.
- Granite 4.2 8B: no figure from IBM or Ollama, so memory is null.

## Judgment calls and gaps

- **ChatGPT skipped.** help.openai.com (file uploads FAQ), chatgpt.com/pricing, and
  openai.com/chatgpt/pricing all returned 403, so there is no ChatGPT hosted-assistant entry.
  The OpenAI API and Codex pages on developers.openai.com did load.
- **Continue skipped**: its catalog record is archived.
- **Whisperfile (llamafile) skipped**: its getting-started guide builds from source and uses
  whisper.cpp-converted weights from a third-party repository.
- **Ollama and `intel`**: Ollama's hardware page says extra GPU support on Windows and Linux
  comes through Vulkan and links Intel GPU driver instructions. I recorded `intel` for the Ollama
  configurations on that basis. llamafile names no Intel backend (only Vulkan), so it does not
  list `intel`.
- **LM Studio accelerators**: its documentation names Apple Silicon but no NVIDIA, AMD, or Intel
  graphics vendors, so only `apple-silicon` and `cpu-only` are recorded (`cpu-only` per Google's
  Gemma docs: "CPU, Apple Silicon, or consumer GPUs" for llama.cpp/LM Studio). This is stated in
  `unverified`.
- **LM Studio `account_required: false`** rests on the offline-operation page (it works entirely
  offline once models are downloaded) and on the model repository not being gated. No page says
  "no account" in so many words.
- **Microsoft Copilot `account_required: false`**: the support page says sign-in "isn't
  required", but the pages do not say whether file upload works signed out. This is listed in
  `unverified`. The older privacy FAQ applies only to the pre-August-2026 app, so I cited only
  the file upload page and the new privacy overview.
- **Gemini Apps `account_required: true`**: some Gemini features work signed out, but file
  upload needs sign-in, and this entry covers both tasks. This is recorded as a limitation.
- **Codex CLI on Windows**: the README has a native PowerShell installer, while docs/install.md
  still lists Windows 11 via WSL2. Both are cited, and the difference is noted in `unverified`.
- **Parakeet `cpu-only`**: this comes from the NeMo Speech README (PyTorch CPU or CUDA; a GPU is
  recommended for inference), not from the model card. The card lists only NVIDIA Ampere,
  Blackwell, Hopper, and Volta, on Linux.
- **Org records as `record_slug`** for hosted services (anthropic, google, microsoft, github,
  openai) and for LM Studio (element-labs), because no product records exist. VS Code has none.
- **Billing**: no amounts are recorded anywhere. Pricing pages are cited only for the billing
  basis (per-minute API billing, free monthly allowance, local use unlimited).

## Suggestion for the lead (not changed; lib/ is outside this assignment)

`lib/finder.ts` `memoryVerdict` returns "insufficient evidence" for `runs: hybrid` entries
(Codex CLI, Copilot in VS Code, Gemini CLI) that have no memory field. These tools run the model
remotely, so the hosted "not applicable" message may fit them better.
