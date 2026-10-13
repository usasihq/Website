# Round 6 verification: 13 new finder configurations (`round6-verify-finder`)

- Checked: 2026-10-13, independent pass over commit `28500b5` on `growth/finder` (12 files under
  `content/finder/` plus `content/changelog/2026-10-13-finder-memory-configs.yml`).
- Method: the writer's claim table (`claims.md`) was not used. Every cited URL was fetched again today
  with GET requests only. The schema (`FinderConfig` in `lib/schema.ts`), the fit rule (`memoryVerdict`
  and `assess` in `lib/finder.ts`) and the page rule (`memoryPageResults` and `memoryPageIndexable` in
  `lib/hardware.ts`) were read first. That way each memory figure is judged by how the finder uses it,
  not only by whether the number appears in a source.
- How the finder uses a figure: a VRAM page compares `gpu_gb` with graphics memory only. A
  `system_gb` figure never counts as fitting a VRAM page. An Apple silicon page compares either figure
  with the Mac's unified memory. A figure equal to or below the amount is shown as "Estimated to fit,
  not tested", and the record's `memory.statement` text appears next to it.
- After the fixes: `npm run validate` gives 0 errors and 1 warning (the existing continue-extension
  one). `npm run typecheck` is clean. `npx vitest run --no-cache` passes 29 files and 390 tests.

## Totals

| Verdict | Count |
|---|---|
| SUPPORTED | 83 |
| NEEDS FIX | 21 (all fixed) |
| UNSUPPORTED | 1 (record removed) |

| File | Result |
|---|---|
| ollama-gpt-oss-120b | **Removed** (editor ruling 1): no source gives a requirement of 64 GB or less |
| llama-cpp-llama-3-1-8b-q4-k-m | 4 fixes (ruling 4): figure now described as a file size, plus the README's RAM note |
| starcoder2-3b-transformers | 1 fix (ruling 2): footprint wording, `gpu_gb` 6.3 → 6.32 |
| starcoder2-15b-transformers-4bit | 2 fixes (ruling 2, and an unsupported "largest"), `gpu_gb` 9.2 → 9.23 |
| lm-studio-gemma-4-31b-qat | 3 fixes (ruling 3: the catalog entry is a different download; file-size caveat) |
| lm-studio-gpt-oss-20b | 1 fix (ruling 3: names the catalog entry and its two builds) |
| lm-studio-olmo-3-7b-instruct | 1 fix (minimum cannot cover the Q8_0 file; source URL now gives file sizes) |
| lm-studio-rnj-1-instruct | 1 fix (minimum cannot cover the Q6_K or Q8_0 files; source URL now gives file sizes) |
| llama-cpp-gemma-4-12b-qat | 2 fixes (mmproj omission, file-size caveat) |
| llama-cpp-gemma-4-26b-a4b-qat | 2 fixes (multimodal wording narrowed, file-size caveat) |
| whisper-large-v3-local | 1 fix (VRAM figure versus a Mac, which runs it on the CPU) |
| lm-studio-muse-glimmer-30b | verified, no changes |
| llama-cpp-muse-glimmer-30b | verified, no changes |
| changelog 2026-10-13-finder-memory-configs | 3 fixes (count, Ollama and 120b, claim about the Apple silicon pages) |

The counts above cover distinct claims. A claim that is shared word for word across records (the LM
Studio and llama.cpp boilerplate) is counted once, in the shared sections.

## Fetching

- Tool: `curl -sL` with curl's default User-Agent. No custom headers. No email address, name, or other
  identifier in any header, URL, or payload. No browser-pane tools. No sign-in. No gate or bot check was
  bypassed.
- All 78 distinct cited URLs returned HTTP 200. `cookbook.openai.com/articles/gpt-oss/*` now redirects to
  `developers.openai.com/cookbook/articles/gpt-oss/*`, which is the same article.
- Extra GETs, for evidence only:
  - The `.md` copies of the six LM Studio docs pages.
  - `lmstudio.ai/models/openai/gpt-oss-120b`, `ollama.com/blog/gpt-oss`, and `ollama.com/library/gpt-oss/tags`.
  - The Hugging Face API with `?blobs=true` (per-file sizes) for the three Google Gemma QAT GGUF repos,
    `meta-models/Muse-Glimmer-30B-GGUF`, and these lmstudio-community repos: Muse, Olmo (GGUF, MLX 4-bit,
    MLX 8-bit), rnj-1, gpt-oss-20b-GGUF, and gemma-4-31B-it-QAT-GGUF. Also `mlx-community/gpt-oss-20b-MXFP4-Q8`.
- One 404: `lmstudio.ai/docs/app/advanced/lm-runtimes.md`. It is not cited and was only checked for a
  CPU-backend statement.
- Nothing was blocked.

## Editor rulings

### 1. ollama-gpt-oss-120b: removed (UNSUPPORTED)

| Claim | Verdict | Evidence | Fix |
|---|---|---|---|
| `memory.gpu_gb: 60` for gpt-oss:120b, stated as "best with 60GB or more of VRAM or unified memory" | UNSUPPORTED as a requirement | OpenAI's guide: "Best with ≥60GB VRAM or unified memory", which is a recommendation (https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama). Ollama lists the tag `gpt-oss:120b` at "65GB · 128K context window" (https://ollama.com/library/gpt-oss and /tags). OpenAI's model card says the model is for use cases "that fit into a single 80GB GPU" (https://huggingface.co/openai/gpt-oss-120b/raw/main/README.md). Ollama's library page and blog say MXFP4 lets "the larger model to fit on a single 80GB GPU". LM Studio's "Minimum system memory 65 GB" is for its own `openai/gpt-oss-120b` catalog build, not Ollama's tag (https://lmstudio.ai/models/openai/gpt-oss-120b). | No primary source states a requirement of 64 GB or less for this setup. The only stricter number (80 GB) describes a GPU the model fits on, not a minimum, so it is not "clearly a requirement" either. Before the fix, the 64 GB Apple silicon page listed this entry as fitting (60 ≤ 64) with a 65 GB download. **File deleted.** The only other reference, the changelog entry, was corrected (see below). Nothing in `lib/`, `app/`, tests, or other content referenced the slug. |

The record's other claims were spot-checked while gathering the evidence above (MXFP4 with "no other
quantization", the Apache 2.0 license, and the `gpt-oss:120b-cloud` tag), but they were not carried
forward because the record was removed.

### 2. StarCoder2-3B and StarCoder2-15B: kept, wording fixed

Both cards print `model.get_memory_footprint()` after loading. They state no minimum or requirement.
Evidence for 3B (https://huggingface.co/bigcode/starcoder2-3b/raw/main/README.md): the bf16 example
prints "Memory footprint: 6312.41 MB". Full precision prints 12624.81 MB, `load_in_8bit` 3434.07 MB, and
`load_in_4bit` 1994.90 MB. Evidence for 15B (https://huggingface.co/bigcode/starcoder2-15b/raw/main/README.md):
"# load_in_4bit … Memory footprint: 9224.60 MB", with 16900.18 MB at 8-bit and 32251.33 MB at bf16.

| Record | Claim | Verdict | Fix |
|---|---|---|---|
| starcoder2-3b | `memory.statement` "reports a memory footprint of 6,312.41 MB … for the model loaded in torch.bfloat16 for a CUDA GPU" | NEEDS FIX | Now reads "reports a memory footprint of 6,312.41 MB (about 6.3 GB) after loading the model in torch.bfloat16 … This is a footprint the card printed, not a stated minimum; the card states no memory requirement." "for a CUDA GPU" was dropped because the printed footprint does not name a device. For a conservative comparison, `gpu_gb` 6.3 → **6.32**. 6.3 was rounded below the printed 6.312 GB, and a footprint is a lower bound, so the finder should never compare against less than the printed value. |
| starcoder2-15b | `memory.statement` "reports a memory footprint of 9,224.60 MB … for the model loaded with bitsandbytes 4-bit" | NEEDS FIX | Same wording fix. `gpu_gb` 9.2 → **9.23** (printed value 9.2246 GB). |

Both figures are `gpu_gb` (graphics memory). That is correct: the examples load to CUDA, and both
records list only `nvidia` and only Linux and Windows. They therefore never appear on an Apple silicon
page. On the VRAM pages, 3B is listed from 8 GB and 15B from 12 GB. The "Not verified" line saying that
generation memory "is not stated" was already accurate and is kept.

### 3. LM Studio catalog minimums

| Record | Catalog entry and what it is built from (https://lmstudio.ai/models/…) | Verdict | Fix |
|---|---|---|---|
| lm-studio-gemma-4-31b-qat | `google/gemma-4-31b-qat`, "Minimum system memory 19 GB", "Based on lmstudio-community/gemma-4-31B-it-QAT-GGUF" | NEEDS FIX (limitation) | The record runs Google's own repo `google/gemma-4-31B-it-qat-q4_0-gguf`, not this catalog entry. The limitation called the entry "a QAT build of this model" and did not say it is a different download. It now names the entry, says it is "based on a different download (lmstudio-community/gemma-4-31B-it-QAT-GGUF)", and compares the 19 GB with "Google's weights-only figure for its own GGUF". |
| lm-studio-gemma-4-31b-qat | Getting-started step: "search for google/gemma-4-31B-it-qat-q4_0-gguf … Download it." | NEEDS FIX | The catalog entry `google/gemma-4-31b-qat` has a near-identical name. The step now says to download "that repository, not the catalog entry google/gemma-4-31b-qat". The search behaviour is supported by https://lmstudio.ai/docs/app/basics/download-model.md: "by providing a specific `user/model` string. You can even insert full Hugging Face URLs". |
| lm-studio-gpt-oss-20b | `openai/gpt-oss-20b`, "Minimum system memory 12 GB", based on "lmstudio-community/gpt-oss-20b-GGUF" and "mlx-community/gpt-oss-20b-MXFP4-Q8" | NEEDS FIX (variant) | The variant was "gpt-oss-20b with MXFP4-quantized MoE weights (LM Studio model openai/gpt-oss-20b)". It is now "LM Studio's openai/gpt-oss-20b entry (lmstudio-community gpt-oss-20b-MXFP4.gguf, or mlx-community MXFP4-Q8)", and the statement names both underlying repos. The figure stays at 16 GB of graphics memory. OpenAI's LM Studio guide says "openai/gpt-oss-20b … Only requires at least 16GB of VRAM" (https://cookbook.openai.com/articles/gpt-oss/run-locally-lmstudio), which is a stated minimum for this exact entry and stricter than LM Studio's 12 GB. The HF file listing shows the GGUF is `gpt-oss-20b-MXFP4.gguf`, so "MXFP4" holds. |
| lm-studio-muse-glimmer-30b | `meta/muse-glimmer`, "Minimum system memory 26 GB", based on "lmstudio-community/Muse-Glimmer-30B-GGUF" | SUPPORTED | The variant already names the entry and its only text file, `Muse-Glimmer-30B-KQuant-17GB-Q4_K_M.gguf`, plus the mmproj. `system_gb` is correct for a "system memory" figure. |
| lm-studio-olmo-3-7b-instruct | `allenai/olmo-3-7b`, "Minimum system memory 6 GB", based on lmstudio-community Olmo-3-7B-Instruct GGUF and MLX-4bit, 6bit, and 8bit | SUPPORTED (figure and variant); NEEDS FIX (caveat) | The HF file listing gives `Olmo-3-7B-Instruct-Q8_0.gguf` as 7,759,251,776 bytes, so the 6 GB minimum cannot apply to that file. The "Not verified" line ("may need more memory") now says so with the size. The cited source URL now has `?blobs=true`, so the cited page shows the sizes. |
| lm-studio-rnj-1-instruct | `essentialai/rnj-1`, "Minimum system memory 6 GB", based on "lmstudio-community/rnj-1-instruct-GGUF" | SUPPORTED (figure and variant); NEEDS FIX (caveat) | Q6_K is 6,826,763,264 bytes and Q8_0 is 8,839,332,864 bytes, both above 6 GB. The caveat now gives the sizes, and the cited URL now has `?blobs=true`. |

### 4. llama-cpp-llama-3-1-8b-q4-k-m: kept, with the figure described as what it is

Source: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/quantize/README.md, section
"Memory/Disk Requirements". It says: "As the models are currently fully loaded into memory, you will
need adequate disk space to save them and sufficient RAM to load them. At the moment, memory and disk
requirements are the same." Its table has the columns "Original size" and "Quantized size (Q4_K_M)", with
the row "8B | 32.1 GB | 4.9 GB". The detailed table, measured on meta-llama/Llama-3.1-8B, gives Q4_K_M
"size (GiB) 4.58". The source therefore gives a file size plus "memory and disk requirements are the
same", and no measured or stated memory figure for running the file. This is the case the ruling
describes.

| Claim | Verdict | Fix |
|---|---|---|
| `memory.statement` "Its example table gives 4.9 GB for Llama 3.1 8B quantized to Q4_K_M" | NEEDS FIX | Now says the README "gives no memory figure of its own for running this file", that the table "lists 4.9 GB as the quantized size (Q4_K_M) of Llama 3.1 8B, a file size", and that "because models are currently fully loaded into memory, memory and disk requirements are the same". `system_gb: 4.9` is kept. It is system memory (the README says "RAM"). |
| `memory.variant` "Llama 3.1 8B quantized to Q4_K_M with llama-quantize" | NEEDS FIX | Now names the Instruct model and the output file, `llama-3.1-8b-instruct-Q4_K_M.gguf`. |
| Limitation: disk space for intermediate files | NEEDS FIX (incomplete) | The same README paragraph asks for "sufficient RAM to load them", and the setup converts and quantizes the unquantized model itself. The limitation now adds that the README gives no memory figure for the conversion and quantization steps, which start from the unquantized model. |
| Not verified: "4.9 GB is given for Llama 3.1 8B in general" | NEEDS FIX | Now says it is "a file size … not a measured memory use" and cites the detailed table's 4.58 GiB, measured on the pretrained model. |

The editor may still prefer `memory: null` here (see "For the editor" below).

## Record-by-record claims

### Shared llama.cpp claims (gemma-4-12b, gemma-4-26b-a4b, llama-3-1-8b, muse-glimmer-30b)

| Claim | Verdict | Evidence |
|---|---|---|
| llama-server serves a built-in web chat UI and an OpenAI-compatible API | SUPPORTED | "[OpenAI API] compatible chat completions, responses, and embeddings routes"; "Easy-to-use web UI" (raw …/tools/server/README.md) |
| Listens on 127.0.0.1 by default; http://127.0.0.1:9931 | SUPPORTED | "`--host HOST` … (default: 127.0.0.1)"; "`--port PORT` | port to listen (default: 9931)" (server README) |
| By default adjusts unset settings to fit device memory, minimum context 4,096 | SUPPORTED | "`-fit` … whether to adjust unset arguments to fit in device memory … default: 'on'"; "`-fitc` … minimum ctx size that can be set by --fit option, default: 4096" |
| Recommends an API key and a reverse proxy before exposing publicly | SUPPORTED | "Public | set an API key, put the server behind a reverse proxy" |
| Web UI keeps conversations in IndexedDB; accepts PDF, text, and image attachments and extracts PDF text | SUPPORTED | "IndexedDB: Conversations and messages"; "Documents - PDF (text extraction or image conversion for vision models)" (raw …/tools/ui/README.md) |
| Install via Homebrew (macOS and Linux), Winget (Windows), conda-forge, or a release; platforms Windows, macOS, and Linux | SUPPORTED | Install table and sections "Winget (Windows)", "Homebrew (Mac and Linux)", "conda-forge (Windows, Mac and Linux)" (raw …/docs/install.md) |
| conda-forge builds CUDA and Vulkan (Windows, Linux) and Metal (macOS); README lists AMD (HIP) and Intel (SYCL) backends | SUPPORTED | "CUDA (Windows and Linux) / Vulkan (Windows and Linux) / Apple Metal (macOS)"; README backend table "HIP | AMD GPU", "SYCL | Intel GPU" |
| Accelerators nvidia, amd, apple-silicon, intel, cpu-only | SUPPORTED | README: "CUDA | Nvidia GPU", "HIP | AMD GPU", "Metal | Apple Silicon", "SYCL | Intel GPU", "AVX, AVX2, AVX512 and AMX support for x86" |
| llama.cpp is MIT-licensed (matches catalog `llama-cpp`: MIT) | SUPPORTED | LICENSE: "MIT License" |
| Not verified: which pre-built packages include AMD or Intel GPU support | SUPPORTED | The install page names only CUDA, Vulkan, and Metal builds |

### llama-cpp-gemma-4-12b-qat

| Claim | Verdict | Evidence / fix |
|---|---|---|
| Google publishes Gemma 4 12B as a QAT Q4_0 GGUF and names this format for llama.cpp | SUPPORTED | ai.google.dev/gemma/docs/core: "llama.cpp / LM Studio (Local) | {model-name}-qat-q4_0-gguf"; GGUF "Available for Gemma 4 E2B, E4B, 12B, 26B A4B, and 31B" |
| File `gemma-4-12b-it-qat-q4_0.gguf` in google/gemma-4-12B-it-qat-q4_0-gguf | SUPPORTED | HF API siblings |
| `gpu_gb: 6.7`, GPU or TPU memory, weights plus 20% overhead, excludes supporting software and context | SUPPORTED | Table 1, Q4_0 column, "Gemma 4 12B … 6.7 GB"; "Approximate GPU or TPU memory required to load … 20% overhead"; "They don't include the additional VRAM needed for supporting software or the context window" |
| Figure applies "as in Google's gemma-4-12B-it-qat-q4_0-gguf" | NEEDS FIX (caveat) | The table gives one figure per size and precision and does not name the file. The GGUF itself is 6,975,879,296 bytes (HF API `gguf.totalFileSize`). Added a "Not verified" line with the size. |
| Not verified: multimodal page omits 12B, "so image input with this file is not established" | NEEDS FIX (incomplete) | Google's repo also holds `mmproj-gemma-4-12b-it-qat-q4_0.gguf` (HF API). The line now says so, while keeping the accurate point that llama.cpp's multimodal page lists E2B, E4B, 26B A4B, and 31B and not 12B. |
| Apache 2.0, not gated (matches catalog `gemma-4-12b`: Apache-2.0); no account needed | SUPPORTED | Card `license: apache-2.0`; API `gated: false` |
| Getting started (download, `llama-server -m …`, `-c`) | SUPPORTED | HF API file name; server README `-c, --ctx-size` |
| Not verified: Google's figure excludes context | SUPPORTED | As above |

### llama-cpp-gemma-4-26b-a4b-qat

| Claim | Verdict | Evidence / fix |
|---|---|---|
| MoE with about 3.8B of 25.2B parameters active; projector file for images | SUPPORTED | Card: "Total Parameters 25.2B", "Active Parameters 3.8B"; HF API file `gemma-4-26B-it-mmproj.gguf` |
| File names `gemma-4-26B_q4_0-it.gguf`, `gemma-4-26B-it-mmproj.gguf`; `--mmproj` usage | SUPPORTED | HF API siblings; multimodal.md: "Use `-m model.gguf` option with `--mmproj file.gguf`" |
| `gpu_gb: 14.4`; all 26B parameters must be loaded | SUPPORTED | Table 1 "14.4 GB"; "While it only activates 4 billion parameters per token … all 26 billion parameters must be loaded into memory" |
| Figure tied to Google's QAT GGUF | NEEDS FIX (caveat) | File is 14,439,363,584 bytes (HF API). Added a "Not verified" line. |
| Limitation: multimodal page "lists Gemma 4 26B A4B among the supported vision models" | NEEDS FIX | The page lists ready-to-use pre-quantized builds: "(tool_name) -hf ggml-org/gemma-4-26B-A4B-it-GGUF". Narrowed to "lists ggml-org's Gemma 4 26B A4B GGUF among its pre-quantized vision models, not Google's QAT build used here." |
| Multimodal support "is currently an experimental feature" | SUPPORTED | Server README |
| Not verified: weights-only figure; "numbers may change" | SUPPORTED | "These numbers may change based on your specific inference tool and environment." |
| Apache 2.0, not gated (catalog: Apache-2.0) | SUPPORTED | Card and API |

### llama-cpp-llama-3-1-8b-q4-k-m (memory: see ruling 4)

| Claim | Verdict | Evidence |
|---|---|---|
| Summary: convert script, llama-quantize, llama-server; Instruct model "intended for assistant-like chat" | SUPPORTED | Quantize README; MODEL_CARD.md: "Instruction tuned text only models are intended for assistant-like chat" |
| Gated, approval manual; form asks name, date of birth, country, affiliation, job title; account required | SUPPORTED | HF API `gated: "manual"`; `extra_gated_fields`: First Name, Last Name, Date of birth, Country, Affiliation, Job title |
| Commands `convert_hf_to_gguf.py --outfile … --outtype bf16` on the local directory; `llama-quantize … Q4_K_M` | SUPPORTED | "If you have previously downloaded the model locally, specify the directory and remove the `--remote` flag"; "llama-quantize gemma-4-E2B-it-bf16.gguf gemma-4-E2B-it-Q4_K_M.gguf Q4_K_M" |
| Royalty-free license; agreement copy and "Built with Llama"; acceptable use policy; terms above 700M MAU (matches catalog `llama-3-1-8b`) | SUPPORTED | LICENSE: "royalty-free limited license"; "(A) provide a copy of this Agreement … (B) prominently display "Built with Llama""; "greater than 700 million monthly active users" |
| Languages beyond the eight are out of scope unless fine-tuned per license and AUP | SUPPORTED | "Developers may fine-tune Llama 3.1 models for languages beyond the 8 supported languages provided they comply…" |
| Not verified: README does not say how much the context adds | SUPPORTED | No such statement in the quantize README |

### llama-cpp-muse-glimmer-30b (no changes)

| Claim | Verdict | Evidence |
|---|---|---|
| Open-weight 30B model for agentic work on consumer hardware; coding agents, tool use, screenshots, charts, documents | SUPPORTED | GGUF card: "purpose-built for autonomous agentic tasks on consumer hardware"; intended uses "Coding agents", "Tool use", "Interpreting screenshots, charts, documents" |
| `gpu_gb: 24` graphics memory: "fits 24 GB VRAM", target hardware 24GB VRAM; rough totals ~17, ~19, ~20 GB | SUPPORTED | GGUF card file table: "Text model — **start here**, fits 24 GB VRAM"; base card: "Target Hardware | 64GB VRAM | 32GB VRAM | 24GB VRAM"; "Rough total memory (weights plus a working context)" |
| Accelerators nvidia, apple-silicon, cpu-only | SUPPORTED | "`-DGGML_CUDA=ON` … Drop … for CPU-only. On Apple Metal omit it as well — Metal is on by default." |
| Build b10353 or newer; b10344 and older refuse to load | SUPPORTED | "Releases **`b10344` and older do not register the architecture at all** and will refuse to load these files." |
| `hf download` of the two files; `-ngl 99 --jinja`; temp 1.0, top-p 0.95, top-k 64 | SUPPORTED | GGUF card "Download the weights" and "Run" |
| Reasoning cannot be switched off (low to xhigh, or a budget); `-c` split across slots, can run out without an error | SUPPORTED | "Reasoning cannot be switched off"; "a single request gets `-c / -np`"; "Nothing errors when a generation runs out of context" |
| mmproj 1.4 GB needed for images; drafter ~1.6 GB; no audio | SUPPORTED | File table; "~1.6 GB extra"; "Audio input/output is not supported." |
| Not intended for under-18s; quantized quality differences | SUPPORTED | Base card limitations |
| No API key, no request leaving the machine; no account; Apache 2.0 (catalog `muse-glimmer-30b`: Apache-2.0) | SUPPORTED | Blog: "No API key, no quota and no request leaving your machine."; API `gated: false`; card license |
| Not verified items (context in the 131,072 × 4 example; AMD and Intel not documented) | SUPPORTED | The card gives rough totals only "plus a working context" and builds for CUDA, Metal, and CPU only |

### Shared LM Studio claims (gemma-4-31b, gpt-oss-20b, muse-glimmer, olmo-3-7b, rnj-1)

| Claim | Verdict | Evidence (lmstudio.ai/docs/app/*.md) |
|---|---|---|
| Desktop app with chat, document attachments, and a local OpenAI-compatible server | SUPPORTED | "Use a simple and flexible chat interface"; "Serve local models on OpenAI-like endpoints" |
| Platforms Windows, macOS, Linux | SUPPORTED | "LM Studio is available for macOS, Windows, and Linux." |
| Accelerators `[apple-silicon, cpu-only]` | SUPPORTED | System requirements: "Chip: Apple Silicon (M1/M2/M3/M4)"; on Windows a GPU is only "recommended" and CPU requirements are given ("AVX2 instruction set support is required"). For the 31B entry, also Google's "Zero-setup local deployment on CPU, Apple Silicon, or consumer GPUs". |
| macOS 14+, Apple Silicon only, no Intel Macs; Windows x64 AVX2 or Snapdragon X Elite; 16GB RAM and 4GB VRAM recommended | SUPPORTED | System requirements page |
| Free plan runs local models with llama.cpp and MLX; paid plans add hosted open models and more usage | SUPPORTED | Pricing: "Run local LLMs using llama.cpp and MLX"; "US-hosted open source models"; "More included usage." |
| Terms: personal or internal business use; no modifying, distributing, or reverse engineering | SUPPORTED | Terms: "solely for Your personal and / or internal business purposes"; "(a) modify … (d) … distribute … (e) reverse engineer" |
| Data stays local; search and download need internet; local server stays local | SUPPORTED | Offline: "Nothing you enter into LM Studio when chatting with LLMs leaves your device"; "All document processing is done locally"; "Search will not work without internet connection" |
| No account needed | SUPPORTED | The offline and basics guides describe no sign-in; "The Free plan includes … local model support" |
| Discover, then Chat model loader; attach .docx, .pdf, .txt; RAG "sometimes requires some tuning and experimentation" | SUPPORTED | basics.md; rag.md |
| Not verified: pages name no NVIDIA, AMD, or Intel graphics | SUPPORTED | No vendor named on any cited LM Studio page |

### lm-studio-gemma-4-31b-qat (fixes under ruling 3)

| Claim | Verdict | Evidence / fix |
|---|---|---|
| `gpu_gb: 17.5` GPU or TPU memory, weights only | SUPPORTED | Table 1 "Gemma 4 31B … 17.5 GB" |
| Figure tied to Google's GGUF | NEEDS FIX (caveat) | `gemma-4-31B_q4_0-it.gguf` is 17,651,001,568 bytes (HF API), slightly more than 17.5 GB. Added a "Not verified" line. |
| Apache 2.0, not gated (catalog `gemma-4-31b`: Apache-2.0) | SUPPORTED | Card; API |
| Not verified: projector loading not documented | SUPPORTED | No LM Studio page reviewed mentions it |

### lm-studio-gpt-oss-20b

| Claim | Verdict | Evidence |
|---|---|---|
| `gpu_gb: 16` graphics memory | SUPPORTED | "Only requires at least 16GB of VRAM" for `openai/gpt-oss-20b` (OpenAI cookbook, LM Studio guide); card: "the `gpt-oss-20b` model run within 16GB of memory" |
| `lms get` and `lms load openai/gpt-oss-20b`; MCP; Harmony with llama.cpp and MLX | SUPPORTED | Guide: "LM Studio utilizes OpenAI's Harmony library to construct the input to gpt-oss models, both when running via llama.cpp and MLX." |
| Guide is archived | SUPPORTED | "This recipe is archived and may reference outdated models or APIs." |
| Harmony format only | SUPPORTED | Card: "should only be used with the harmony format as it will not work correctly otherwise" |
| Apache 2.0, not gated (catalog `gpt-oss-20b`: Apache-2.0) | SUPPORTED | Card; API |

### lm-studio-muse-glimmer-30b (no changes)

| Claim | Verdict | Evidence |
|---|---|---|
| Catalog entry `meta/muse-glimmer` with vision input, tool use, and reasoning, built from the KQuant-17GB GGUF | SUPPORTED | Catalog "Capabilities: Vision Input, Trained for tool use, Reasoning"; "Based on lmstudio-community/Muse-Glimmer-30B-GGUF"; HF files `Muse-Glimmer-30B-KQuant-17GB-Q4_K_M.gguf`, `mmproj-…` |
| `system_gb: 26` | SUPPORTED | "Minimum system memory 26 GB" |
| Under-18 and quantization limitations; Apache 2.0 | SUPPORTED | Base card |
| Not verified: context length and image encoder in the 26 GB not stated | SUPPORTED | The catalog page states neither |

### lm-studio-olmo-3-7b-instruct

| Claim | Verdict | Evidence |
|---|---|---|
| Catalog entry `allenai/olmo-3-7b` built from Olmo-3-7B-Instruct; Apache 2.0 (catalog `olmo-3-7b-instruct`: Apache-2.0) | SUPPORTED | "Based on lmstudio-community/Olmo-3-7B-Instruct-GGUF … MLX-4bit … MLX-6bit … MLX-8bit"; card: "This model is licensed under Apache 2.0" |
| "a chat model" | SUPPORTED | The card documents a "Chat template" and "Chat Format" for this Instruct model |
| `system_gb: 6`; GGUF in Q4_K_M, Q6_K, Q8_0; MLX 4-, 6-, and 8-bit | SUPPORTED | Catalog "Minimum system memory 6 GB"; HF siblings |
| Intended for research and educational use per Ai2's Responsible Use Guidelines | SUPPORTED | Card, License line |

### lm-studio-rnj-1-instruct

| Claim | Verdict | Evidence |
|---|---|---|
| 8B; optimized for code and STEM; tool calling and agentic coding | SUPPORTED | Card: "8B parameter … optimized for code and STEM"; "excelling at tool-calling"; "agentic coding, one of our target abilities" |
| `system_gb: 6`; GGUF in Q4_K_M, Q6_K, Q8_0 | SUPPORTED | Catalog; HF siblings |
| System prompt "You are a helpful assistant."; temperature 0 to 0.2; truncation and unprompted code otherwise | SUPPORTED | "We recommend using temperatures in the range [0, 0.2]"; "Failure to follow these recommendations can result in a) truncated outputs, b) code outputs even for non-code prompts." |
| Apache 2.0 (catalog `rnj-1-instruct`: Apache-2.0) | SUPPORTED | Card `license: apache-2.0` |

### starcoder2-3b-transformers and starcoder2-15b-transformers-4bit (memory: see ruling 2)

| Claim | Verdict | Evidence / fix |
|---|---|---|
| 15B summary: "the largest StarCoder2 code model" | NEEDS FIX | The cited card does not say "largest", and it is a superlative. Now "a 15-billion-parameter code model". |
| 3B: 3B parameters, 17 languages; 15B: 600+ languages; Fill-in-the-Middle | SUPPORTED | Card Model Summary sections |
| Not an instruction model; code may be inefficient, buggy, or contain exploits; verbatim reproduction and the search index | SUPPORTED | "it is _not_ an instruction model and commands like "Write a function that computes the square root." do not work well" |
| Install Transformers from source; accelerate; 4-bit via `load_in_4bit=True` | SUPPORTED | "pip install git+https://github.com/huggingface/transformers.git"; "# to use 4bit use `load_in_4bit=True` instead" |
| Platforms Linux and Windows; nvidia only | SUPPORTED | PyTorch selector offers CUDA builds for Linux and Windows. The card's examples load to "cuda". The card also shows "cpu" for its full-precision example only, not for these variants. |
| bitsandbytes: glibc 2.24+, Windows 11 / Server 2022+, CUDA wheels for Linux and Windows, compute capability 6.0+, MIT | SUPPORTED | "The Linux build has a minimum glibc version of 2.24."; "Windows 11 / Windows Server 2022+"; "Compute Capability 6.0+"; "`bitsandbytes` is MIT licensed." |
| BigCode OpenRAIL-M v1 with use restrictions; not gated; Transformers Apache 2.0 (catalog `starcoder2-*`: BigCode OpenRAIL-M v1; `transformers`: Apache-2.0) | SUPPORTED | app.py: "Use restrictions are included to prevent misuse of the Model."; API `gated: false`; Transformers LICENSE |

### whisper-large-v3-local

| Claim | Verdict | Evidence / fix |
|---|---|---|
| `large` maps to the large-v3 checkpoint | SUPPORTED | `__init__.py`: `"large": ".../large-v3.pt"` |
| `gpu_gb: 10` graphics memory | SUPPORTED | README: "approximate memory requirements", "large | 1550 M | … | ~10 GB" in the "Required VRAM" column |
| Use of that figure on Apple silicon pages | NEEDS FIX (caveat) | The finder compares it with unified memory, so the entry is listed as fitting 16 GB Macs and larger. On a Mac the package uses `"cuda" if torch.cuda.is_available() else "cpu"` and "FP16 is not supported on CPU; using FP32 instead". Added: "The ~10 GB figure is stated as VRAM; on a Mac the package picks the CPU (it checks only for CUDA) and uses FP32, and memory use there is not documented." See "For the editor" for the lib-level issue. |
| MIT for code and weights | SUPPORTED | "Whisper's code and model weights are released under the MIT License." This matches catalog `whisper-large-v3`'s MIT entry (openai/whisper repository, weights and code). The catalog also records Apache-2.0 from HF metadata, but this setup downloads from the package's own links. |
| Python 3.8–3.11; ffmpeg via apt, pacman, Homebrew, Chocolatey, Scoop; Rust for tiktoken | SUPPORTED | README Setup |
| turbo ~8× large on an A100; performance varies by language; medium and large best for translation | SUPPORTED | "~8x"; "Whisper's performance varies widely depending on the language."; "Use `medium` or `large` for the best translation results." |
| Platforms and accelerators `[nvidia, cpu-only]`; CPU FP32 fallback | SUPPORTED | `transcribe.py` |

### Changelog `2026-10-13-finder-memory-configs.yml`

| Claim | Verdict | Fix |
|---|---|---|
| "Thirteen more …", "gpt-oss-120b", "Ollama" | NEEDS FIX | Now twelve, and gpt-oss-120b and Ollama are removed |
| "each with a memory figure stated by the model or runtime publisher" | NEEDS FIX | Now "from the model or runtime publisher's documentation", plus "Each entry quotes what its figure measures, such as a minimum, a loaded-model footprint, or a file size." |
| "for each Apple silicon amount now list different sets" | NEEDS FIX | Without the 120b record, the 64 GB page lists the same 14 entries as 32 GB. Now "for 8, 16, 24, and 32 GB of Apple silicon memory". |

## Memory pages after the fixes (`memoryPageIndexable`, run with `npx tsx`)

| Page | Indexable | Listed |
|---|---|---|
| 8gb-vram | yes | 4 |
| 12gb-vram | yes | 6 |
| 16gb-vram | yes | 8 |
| 24gb-vram | yes | 10 |
| 8gb-apple-silicon | yes | 6 |
| 16gb-apple-silicon | yes | 11 |
| 24gb-apple-silicon | yes | 13 |
| 32gb-apple-silicon | yes | 14 |
| 64gb-apple-silicon | **no**: same 14 as 32 GB (the removed gpt-oss-120b was the only difference) | 14 |

The commit message for `28500b5` says "All nine memory pages now pass memoryPageIndexable". That is no
longer true after the required removal. The 64 GB page stays reachable but is marked noindex and left out
of the sitemap, as `lib/hardware.ts` intends.

## For the editor (not changed: outside these 13 files, or a judgment call)

1. **VRAM pages do not check the graphics vendor.** `memoryPageInput` for a VRAM page leaves `gpu`
   empty, so `assess` never checks `accelerators`. The LM Studio entries list only
   `[apple-silicon, cpu-only]`, and each says NVIDIA, AMD, and Intel acceleration "is not established
   here". Even so, `lm-studio-gpt-oss-20b` (16 and 24 GB) and `lm-studio-gemma-4-31b-qat` (24 GB) are
   listed on the VRAM pages, as is the existing `lm-studio-gemma-4-12b-qat`. A fix belongs in `lib/hardware.ts`.
2. **Apple silicon pages compare a VRAM figure even when Apple graphics are not used.**
   `whisper-large-v3-local` and the existing `whisper-turbo-local` list `[nvidia, cpu-only]`. They appear
   as fitting on Apple silicon pages by a "Required VRAM" figure, although the package runs on the CPU in
   FP32 there. A caveat was added to the new record. The rule itself is in `lib/finder.ts` and `lib/hardware.ts`.
3. **Equal-to-capacity matches on unified memory.** `llama-cpp-muse-glimmer-30b` (24 GB VRAM target)
   fits the 24 GB Apple silicon page at exactly 24 ≤ 24, which leaves nothing for macOS. This is the same
   concern as ruling 1, though Meta's own rough total with vision is about 19 GB. Consider requiring
   headroom for unified memory in `memoryVerdict`.
4. **llama-cpp-llama-3-1-8b-q4-k-m on the 8 GB Apple silicon page.** The record now says exactly what
   the 4.9 GB is: a file size plus "memory and disk requirements are the same". The same README paragraph
   asks for RAM to load the models during conversion and quantization, which this setup does itself. If
   the editor prefers that only run-time figures stated as memory be compared, set `memory: null`. The
   entry then moves to "no memory figure published".
5. **Google's Gemma table versus the QAT GGUF files.** The 12B and 31B GGUFs are slightly larger than
   the table's "approximate" figures (6.98 GB vs 6.7; 17.65 GB vs 17.5). The table does not name these
   files. Caveats were added and the figures kept, since Google's routing table names this download for
   llama.cpp and LM Studio. The existing `lm-studio-gemma-4-12b-qat` (round 5) has the same gap.
