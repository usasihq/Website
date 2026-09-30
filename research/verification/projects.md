# Verification log: projects batch

Verifier pass on 2026-09-29. Every source cited in each record was reopened (WebFetch, or
`curl -A "USASI-factcheck/0.1"` for raw GitHub files, the GitHub API, PyPI JSON and the IRS CSV).
Licenses were checked against the actual LICENSE files and GitHub's license API. Latest-release
claims were checked against the GitHub releases API or PyPI JSON. Validator result after edits:
`0 error(s), 0 warning(s)`.

Summary: 13 records checked. 7 verified with no changes (dolma, jax, lm-evaluation-harness,
maxtext, mlx, openxla, tensorrt-llm). 6 edited (pytorch, vllm, ray, ollama, openpi, llama-cpp).
No eligibility status changed. llama-cpp stays `draft` / `pending_review`.

## Foundation-hosting claims (eligibility basis)

- The PyTorch Foundation page (https://pytorch.org/foundation/, fetched) says the foundation is
  hosted by the Linux Foundation and supports PyTorch "alongside ... vLLM, DeepSpeed, Ray,
  Helion, and Safetensors". That confirms PyTorch, vLLM and Ray as foundation projects.
- The PyTorch Foundation charter PDF (cdn.platform.linuxfoundation.org/agreements/pytorch.pdf,
  fetched and converted to text) says the foundation is a directed fund of The Linux Foundation.
  It also says the PyTorch code base is established as "PyTorch a Series of LF Projects, LLC".
- The vLLM welcome post (2025-05-06) says vLLM was contributed by UC Berkeley and that hosted
  projects are "governed and administered under the PyTorch Foundation's ... governance model".
- The Ray welcome post (dateline 2025-10-22) says Ray is a foundation-hosted project contributed
  by Anyscale.
- The Linux Foundation's about page says it is a 501(c)(6) non-profit. Its privacy policy (last
  updated 2024-09-11) gives a contact address of "Attn: Legal Department, 548 Market St, PMB
  57274, San Francisco, California". It is a mailing address, not a stated legal or registered
  address, so the wording was narrowed (see below).

## pytorch

The LICENSE file was checked against BSD-3-Clause. It has copyright notices for PyTorch and
Caffe2, followed by the three BSD clauses and the standard disclaimer. Clause 3 names "Facebook,
Deepmind Technologies, NYU, NEC Laboratories America and IDIAP Research Institute" instead of
"the copyright holder". The disclaimer says "COPYRIGHT OWNER" instead of "COPYRIGHT HOLDER".
Both differences are allowed by the variable text in the SPDX BSD-3-Clause matching template
(`organizationClause3` accepts "Neither the names? of .+ nor the names of its contributors may",
and `copyrightHolderLiability` accepts `.+`). The copyright preamble (about 1.5k characters) fits
the template's `.{0,5000}` allowance. **The BSD-3-Clause SPDX ID is correct.** GitHub's license
API returns `NOASSERTION` / "Other".

Changes:
- `eligibility.explanation`: "whose legal postal address is in San Francisco" → "whose privacy
  policy gives a contact mailing address in San Francisco". Reason: the privacy policy gives a
  contact mailing address, not a legal address. Source: lf-privacy.
- `license_notes.text`: added that GitHub reports "Other" and that the text fits the SPDX
  BSD-3-Clause matching template. Added `github-license-api` and `spdx-bsd3-template` to
  `source_ids` and `sources` (both fetched). Reason: the GitHub-detection claim was cited only to
  the LICENSE and README, which do not support it.

Verified with no change needed: summary (README; LF press release: "Since its release in 2016",
"led by Meta researchers", moved to the Linux Foundation / PyTorch Foundation, 2022-09-12);
governance (the governance page says technical governance is "strictly separated from business
governance"); v2.14.0 published 2026-09-02 (GitHub API; it is the latest release); stable docs
redirect to 2.14; get-started page (Python 3.10 or later, glibc 2.28 or later, macOS 10.15 or
later, Windows, CUDA/ROCm/CPU, LibTorch, source builds); released_at "2016".

## vllm

Changes:
- `eligibility.explanation`: "whose legal address is in San Francisco" → "whose privacy policy
  gives a contact mailing address in San Francisco". Source: lf-privacy.

Verified: Apache-2.0 (LICENSE file and GitHub API); README (Sky Computing Lab at UC Berkeley,
PagedAttention, OpenAI-compatible server, multimodal, distributed inference); governance
process.md (core maintainers are the TSC "as defined by Linux Foundation Project Governance";
"Committer status belongs to individuals, not companies"); install docs platforms (CUDA, ROCm,
XPU, x86, AArch64, Apple silicon, IBM Z, out-of-tree plugins); releases (latest v0.30.0,
2026-09-22).

## ray

Changes:
- `eligibility.explanation`: "whose legal address is in San Francisco" → privacy-policy mailing
  address wording (lf-privacy).
- `eligibility.explanation`: "pending acquisition by UK-registered Nscale" → "pending
  acquisition by Nscale Limited, a company incorporated in England and Wales". The cited
  Anyscale press release gives only a "LONDON, U.K. and SAN FRANCISCO" dateline, not the place of
  registration. Added source `nscale-s1` (Nscale Limited Form S-1, filed 2026-09-18). Its cover
  page lists England and Wales as the place of incorporation, a London principal office, and the
  Anyscale acquisition as still pending, "subject to customary closing conditions". A web search
  found no report of the deal closing.
- `eligibility.source_ids`: added `anyscale-about`. The explanation's "Anyscale (San Francisco)"
  was not supported by any cited source. The about page gives a San Francisco address.
- `checklist.installation.note`: "official Docker images" → "Docker images from the
  rayproject/ray Docker Hub repository". The install page does not call the images official.
- `license_notes`: null → a note that the LICENSE file appends notices for third-party code
  under other licenses (for example, MIT code from OpenAI). Checked in the LICENSE file.

Verified: Apache-2.0; RISELab origin (Anyscale about page); contribution to the PyTorch
Foundation in October 2025; the Nscale/Anyscale press release (2026-07-30: "definitive
agreement", expected to close in H2 2026, Ray "remains open source and community governed");
platform support (x86_64/aarch64 Linux, Apple silicon, Windows beta); conda packages are
community-maintained; releases (latest ray-2.58.0, 2026-08-23).

## ollama

Changes:
- `eligibility.explanation`: "July 2026 Series B press release" → "July 2026 press release
  (distributed by Business Wire)". Reason: this keeps a funding round out of catalog prose. The
  source title is left as published.

Verified: MIT (LICENSE and API); terms (services "provided by Ollama Inc.", California law,
arbitration in San Francisco, last updated May 2026); press release dateline "PALO ALTO, Calif.,
July 09, 2026" via Business Wire; the Ashby job board lists 8 roles, all in Palo Alto, United
States; GPU docs (NVIDIA compute capability 5.0 or later, ROCm, Metal, Vulkan); pricing page
(cloud models); download page; README (official Docker image, Python/JS libraries,
integrations, llama.cpp under "Supported backends"); the repo contains LLAMA_CPP_VERSION and
MLX_VERSION files; releases include pre-releases.

## openpi

Changes:
- `eligibility.explanation`: reworded. The old text said "documented as headquartered in San
  Francisco" and cited only the README and π0 paper. The π0 paper gives an affiliation ("Physical
  Intelligence, San Francisco, California, USA"), not a headquarters, and the README says
  "published by the Physical Intelligence team" (it does not say "maintained"). The new text
  states exactly that and adds `robotreport-openpi` ("the San Francisco-based startup").

Verified: Apache-2.0 LICENSE; LICENSE_GEMMA.txt added 2025-09-30 (commit "Added the Gemma
license"); the GCS bucket lists the checkpoints; README (10k+ hours, ALOHA/DROID/LIBERO
checkpoints, JAX and PyTorch, websocket remote inference, LeRobot format, GPU memory table,
precision settings, Ubuntu 22.04 only); π0 paper (PaliGemma 3B base, action expert, OXE /
Bridge v2 / DROID in the mixture); pi0.py (PaliGemma plus action expert); released_at 2025-02
(Robot Report, 2025-02-07).

## llama-cpp (draft; kept as draft / pending_review)

Changes:
- `eligibility.explanation`: "Hugging Face's own ownership is also changing (pending NVIDIA
  acquisition)" had no cited source. It now reads "on September 3, 2026 NVIDIA announced that it
  has agreed to acquire Hugging Face", with the new source `nvidia-hf-blog` (fetched; the post
  gives no closing date).

Verified: MIT (LICENSE "Copyright (c) 2023-2026 The ggml authors"; API MIT); README (LLM/VLM
inference in C/C++, ggml, integer quantization, backend table, llama.app / Docker / binaries /
source build, OpenAI-compatible server); releases (v0.5.0 on 2026-09-23 plus b-numbered builds;
binaries for macOS, Linux/Ubuntu, Windows, Android); the ggml announcement (2026-02-20) and HF
blog (projects remain community driven, community makes its own technical decisions, HF
provides resources); ggml.ai ("acquired by Hugging Face in 2026", no location given). The
eligibility question is still open: no document names a U.S. governing entity for llama.cpp.

## dolma — verified, no changes

Checked all five HF cards (raw README plus the API: `gated: false` and `license:odc-by` on all
five); the v1.x card (v1 2023-08-18, v1.7 2024-04-15, ODC-BY change 2024-04-15, users bound by
source terms, v1.7 source table); the Dolma 3 pool card (9.31T tokens; only CC and olmOCR PDFs
hosted, other sources linked); the dolma3 README (Mix, Dolmino mid-training, Longmino long
context); the 3.5 pool card; the 7B mix card (redacted PDFs); Apache-2.0 for the toolkit and
dolma3 repos; the Ai2 docs toolkit description; the Ai2 about page ("Seattle based non-profit
AI research institute"); the arXiv v2 limitations section (v2 dated 2024-06-06) and datasheet
appendix.

## jax — verified, no changes

Checked: Apache-2.0; README (XLA, research project, not an official Google product; supported
platforms table; pip commands for CPU, NVIDIA, TPU and AMD); about page ("led by the JAX core
team"); contributing page (Google community guidelines and CLA); PyPI (JAX team,
jax-dev@google.com, 0.11.2 uploaded 2026-09-17); Alphabet 10-K cover (Mountain View; filing
date 2026-02-05 per the EDGAR index).

## lm-evaluation-harness — verified, no changes

Checked: MIT (EleutherAI copyright); PyPI 0.4.13 (author EleutherAI, 2026-08-31); GitHub latest
release v0.4.13 (2026-08-31); README (60+ benchmarks, publicly available prompts, the 2025/12
lighter install, no native multi-node, MPS early stage, the priority list for prompting
decisions, caching); new-task guide (HF datasets API, local datasets, generative vs.
multiple-choice, metrics and aggregation); IRS BMF DC extract (ELEUTHERAI INSTITUTE, subsection
03, Washington DC).

## maxtext — verified, no changes

Checked: Apache-2.0; README (Google LLC copyright header, Python/JAX, TPUs and GPUs, model list,
SFT/GRPO/GSPO, fork guidance, the PyPI-or-container recommendation, Python 3.12); CONTRIBUTING
(Google CLA and community guidelines); AI-Hypercomputer org description; data pipeline docs
(Grain, HF, TFDS and their formats); PyPI 0.2.4 uploaded 2026-08-21; Alphabet 10-K and
Exhibit 21 (Google LLC, Delaware).

## mlx — verified, no changes

Checked: MIT (Copyright 2023 Apple Inc.; API MIT); README (Apple machine learning research,
APIs, lazy computation, unified memory, pip for macOS, `mlx[cuda]` and `mlx[cpu]` on Linux);
docs title "MLX 0.32.3 documentation" with Python and C++ API references; v0.32.3 published
2026-09-29T00:37Z; Apple 10-K (Cupertino; filed 2025-10-31).

## openxla — verified, no changes

Checked: Apache-2.0 for xla, stablehlo and shardy; the XLA repo has no GitHub releases;
openxla.org component list; XLA README (not needed unless contributing or integrating);
contributing.md (Google guidelines and CLA); StableHLO governance (Google technical leadership
in 2022, open governance as a goal); MEMBER-ORGS.md (Google listed as founding member). The
openxla/community `governance/` folder has only Maintainers.md. An interim steering committee
file was removed in 2023, so the claim that no multi-company governing body is documented
holds. The XLA README also says community spaces are "under TensorFlow governance", which is
consistent with Google as the maintaining entity.

## tensorrt-llm — verified, no changes

Checked: LICENSE (Apache 2.0, NVIDIA copyright, third-party portions listed; GitHub API reports
NOASSERTION); repo metadata; latest non-prerelease v1.2.1 (2026-04-20) with v1.3.0rc29
pre-releases through 2026-09-29; docs home; Linux install page (pip, NGC containers, link to
source build); support matrix (Linux x86_64/aarch64, Ampere through Blackwell); NVIDIA 10-Q
(Santa Clara; filed 2026-08-26).

## Not fully verified / editor follow-up

- The SEC pages (Alphabet, Apple and NVIDIA filings and the Nscale S-1) were read through
  WebFetch summaries, because EDGAR requires a contact User-Agent that this pass does not send.
  The cover-page values were confirmed with two separate prompts for the Nscale S-1.
- tensorrt-llm: the Linux install page only links to the source-build guide. The source-build
  page itself was not opened.
- ray: the Nscale/Anyscale acquisition is pending. Recheck the Ray and Anyscale records if it
  closes.
- llama-cpp: eligibility is still unresolved (editor decision needed).
