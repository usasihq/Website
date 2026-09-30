# Verification log: r2-oss-artifacts

Verifier pass on 2026-09-29. I reopened every cited source with WebFetch, or with
`curl -A "USASI-factcheck/0.1"` for raw GitHub files, Hugging Face raw cards and the Hub API,
PyPI JSON, the arXiv export API and the IRS CSV. No personal data was sent in any request.

The GitHub REST API was rate-limited, so I checked releases a different way:
- The latest release came from the `github.com/<repo>/releases/latest` redirect.
- The publication time came from the `datetime` attribute on the release page.
- PyPI JSON gave the current version and upload time.

I compared each Apache-2.0 LICENSE with the apache.org text after normalizing whitespace. Each
matched, apart from trivial differences such as capitalization or an `https` URL. The MIT
LICENSE files were read directly.

Validator after edits: `0 error(s), 1 warning(s)`. The warning is in
`continue-extension.yml`, which is not in this batch.

Summary: I checked 17 records. 10 are verified with no changes: transformers, diffusers,
smollm, smollm3-3b, molmo, molmo2-o-7b, tulu, pythia, pythia-12b and mlflow. 7 were edited:
trl, fineweb, llama-3-1-tulu-3-1-8b, gpt-neox, the-pile, docling and redpajama. No eligibility
or publication status changed.

Computed tiers (from `lib/openness.ts`, unchanged by this pass):
- smollm3-3b: fully-open
- pythia-12b: fully-open
- molmo2-o-7b: open-stack (training data is partial)
- llama-3-1-tulu-3-1-8b: open-stack (training data is partial, and the Llama 3.1 license is
  not OSI)

## Latest versions checked

| Record | Version in record | Latest found today | Date |
| --- | --- | --- | --- |
| transformers | 5.17.0 | v5.17.0 (GitHub latest, PyPI) | 2026-09-09 |
| diffusers | 0.40.0 | v0.40.0 | 2026-08-20 |
| trl | 1.14.1 | v1.14.1 | 2026-09-29 (13:41 UTC) |
| docling | 2.131.0 | v2.131.0 | 2026-09-29 (07:58 UTC) |
| mlflow | 3.16.1 | v3.16.1 | PyPI 2026-09-16 23:14 UTC; GitHub release 2026-09-17 02:40 UTC |
| gpt-neox | null (links v2.0) | v2.0 is still the latest release | 2023-03-10 |
| fineweb | v1.4.0 | v1.4.0 is the top changelog entry; `v1.4.0` branch exists | 11-07-2025 |
| redpajama | V2 | V2 (no newer version found) | 2023-10-30 |

## Shared eligibility sources

- **Hugging Face terms of service** (fetched): "Hugging Face, Inc. a Delaware corporation". The
  terms use New York law and New York courts.
- **Hugging Face privacy policy** (fetched): "The Company and its servers are located in the
  United States". It names Hugging Face SAS in Paris as the EU main establishment.
- **HuggingFaceTB page**: display name "Hugging Face Smol Models Research".
- **HuggingFaceFW page**: "FineData", which describes itself as a branch of the Hugging Face
  Science Team.
- **Ai2 about page**: "a Seattle based non-profit AI research institute".
- **EleutherAI about page**: "In early 2023 EleutherAI incorporated as a non-profit research
  institute".
- **IRS `eo_dc.csv`**: ELEUTHERAI INSTITUTE, Washington DC, subsection 03, ruling 202311.
- **Linux Foundation privacy policy** (last updated September 11, 2024): gives the mailing
  address 548 Market St, PMB 57274, San Francisco, California.

## transformers — verified, no changes

- **LICENSE**: Apache-2.0. Copyright "The Hugging Face team", 2018.
- **README**: model-definition framework for text, vision, audio, video and multimodal
  models, for inference and training. Supports the Pipeline API, `transformers chat` and
  `transformers serve`.
- **Install page**:
  - Tested on Python 3.10+ and PyTorch 2.5+.
  - Install with pip or uv, from source, as an editable install, or from conda-forge.
  - Setups documented for CUDA, Intel XPU, CPU-only, and NVIDIA ARM64 ("Spark") devices.
  - Offline use with `HF_HUB_OFFLINE=1` or `local_files_only=True`.

## diffusers — verified, no changes

- **LICENSE**: Apache-2.0. The only difference from the apache.org text is one capitalized
  word.
- **Docs index**: generates videos, images and audio. Built around DiffusionPipeline, with
  adapters such as LoRA, and offloading and quantization options.
- **Install page**:
  - Tested on Python 3.8+ and PyTorch 2.6+.
  - Documents a setup for NVIDIA ARM64 devices.
  - Telemetry text matches the record; opt out with `HF_HUB_DISABLE_TELEMETRY`.
  - Offline use with `HF_HUB_OFFLINE`.
- **README**: the conda package is "maintained by the community"; there is an Apple Silicon
  guide.
- **v0.40.0 release notes**:
  - JAX/Flax support was removed (#14169).
  - Tensor-parallel inference on CUDA and AWS Neuron.
  - WebFetch's summary gave the year as 2024. The page's own `datetime` attribute is
  2026-08-20T14:53Z, which matches the record.

## trl — 1 change

- `name`: "TRL (Transformer Reinforcement Learning)" → "TRL (Transformers Reinforcement
  Learning)". Reason: the README title and the docs index both say "TRL - Transformers
  Reinforcement Learning". Sources: trl-readme, trl-docs.
- Verified:
  - Apache-2.0 LICENSE.
  - The docs taxonomy lists SFT, GRPO, DPO, KTO, RewardTrainer and others, plus an
    "Experimental" section.
  - Docs sections: Getting Started, Conceptual Guides, How-to, Integrations (DeepSpeed, Liger
    Kernel, PEFT), Examples, API.
  - Install with pip, uv or from source.
  - README: trainers wrap the Transformers trainer, with DDP, DeepSpeed ZeRO and FSDP; PEFT
    LoRA/QLoRA; a CLI.
  - v1.14.1 was published 2026-09-29 and is the latest release.

## smollm (family) — verified, no changes

- **SmolLM blog** (2024-07-16):
  - Sizes 135M, 360M and 1.7B.
  - SmolLM-Corpus: Cosmopedia v2 (generated with Mixtral-8x7B-Instruct), FineWeb-Edu, and
    Python-Edu (filtered from The Stack).
- **SmolLM2 paper** (v1 2025-02-04): about 11T tokens; introduces FineMath, Stack-Edu and
  SmolTalk. The text README gives the three SmolLM2 sizes.
- **SmolLM3 blog** (2025-07-08).
- **Pretraining collection** lists fineweb-edu, dclm-baseline, FineWeb2-HQ, fineweb-2,
  finemath, stack-edu and others.
- **Repo README**: on-device use; SmolVLM lives in `vision/`.
- The HuggingFaceTB page lists no release newer than SmolLM3.

## smollm3-3b — verified, no changes

- **Card**:
  - `license: apache-2.0`; not gated (Hub API); created 2025-07-08.
  - Decoder-only; 11.2T tokens with staged curriculum; mid-training on 140B reasoning
    tokens; SFT and APO.
  - Six native languages; `/think` and `/no_think`; `xml_tools` and `python_tools`.
  - Transformers v4.53.0, vLLM and SGLang; llama.cpp, ONNX, MLX, MLC and ExecuTorch.
  - `config.json` set to 65,536 tokens; YaRN factor 2.0; temperature 0.6 and top_p 0.95.
  - Evaluated with lighteval; "training and evaluation configs and code" are in
    huggingface/smollm; intermediate checkpoints include mid-training and SFT.
- **huggingface/smollm repo**:
  - `text/pretraining/smollm3/` holds the stage1, stage2 and stage3 configs and two
    long-context configs.
  - smollm LICENSE is Apache-2.0.
- **alignment-handbook**:
  - The SmolLM3 recipe covers mid-training, SFT and `dpo/apo.yaml`.
  - LICENSE is Apache-2.0.
- **SmolTalk2 card**:
  - Mid-training data: Llama-Nemotron-Post-Training-Dataset and OpenThoughts3.
  - Some subsets were generated with Qwen3-32B or DeepSeek-V3-0324.
  - New subsets are Apache 2.0; existing datasets keep their own licenses.
- **Blog**: says the nanotron configs include "exact data weights".

## fineweb — 1 change

- `checklist.stated_limitations.note`: removed "but phone numbers were not". Also changed "code
  is underrepresented" → "code content is likely not prevalent" to match the card's wording.
  - Reason: the card never mentions phone numbers. It says only that email and public IP
    addresses are anonymized. Source: fineweb-card.
- Verified:
  - The card says "more than 18.5T tokens (originally 15T tokens)"; the table total is
    18,527.0B gpt2 tokens.
  - Changelog: v1.0.0 21-04-2024 (initial) through v1.4.0 11-07-2025, which added six 2025
    snapshots (January to June).
  - v1.3.0 removed domains after a cease-and-desist notice. The branches `v1.0.0` to `v1.4.0`
    exist.
  - Samples of 10BT, 100BT and 350BT; not gated.
  - License is ODC-By 1.0, and use is also subject to Common Crawl's Terms of Use.
  - Pipeline: URL filter, Trafilatura, fastText (0.65), Gopher/C4/FineWeb filters, per-dump
    MinHash, PII formatting.
  - The card's citation gives NeurIPS 2024 Datasets and Benchmarks. The arXiv abstract page
    shows no comments field, so this rests on the card.
  - Stated limitations: toxic content, PII, and code not prevalent.
  - The datatrove `examples/fineweb.py` exists; datatrove LICENSE is Apache-2.0.
  - Scope stays English-only, from Common Crawl snapshots since 2013.

## molmo (family) — verified, no changes

- **Molmo blog** (2024-09-25):
  - Models: MolmoE-1B, Molmo-7B-O, Molmo-7B-D and Molmo-72B.
  - Data: PixMo. Vision encoder: CLIP. Several base LLMs.
- **Molmo 2 blog** (December 11, 2025):
  - 8B and 4B models on Qwen3; O-7B on Olmo.
  - Adds video, multi-image, pointing and tracking.
- **MolmoAct 2 blog** (May 5, 2026): built from Molmo 2-ER, "a specialized embodied-reasoning
  variant of Molmo 2".
- **Molmo2-8B card**: based on Qwen3-8B with SigLIP 2. The repo maps Molmo2-4B to
  `qwen3_4b_instruct`.
- **Qwen3-8B card**: `license: apache-2.0` (Qwen team).

## molmo2-o-7b — verified, no changes (training-code status checked)

- **Card**:
  - `license: apache-2.0`; not gated; `base_model` is google/siglip-so400m-patch14-384 and
    allenai/Olmo-3-7B-Instruct.
  - Intended for research and educational use under Ai2's Responsible Use Guidelines;
    third-party data is limited to academic and non-commercial research use.
  - Transformers 4.57.1 with `trust_remote_code`.
  - Reports an average over 15 academic benchmarks.
  - Still says training code, evaluations and intermediate checkpoints "will be made available
    at a later date".
- **Training-code status**:
  - The Molmo 2 blog now has an "Update 3/3" saying "We've released the full codebase behind
    Molmo 2" (github.com/allenai/molmo2), covering pretraining, SFT, long-context SFT,
    evaluation and inference.
  - The repo README lists Pretrain, SFT and Long-Context SFT checkpoints for Molmo2-O-7B, and
    the `olmo3_7b_instruct` setting.
  - It gives download scripts, and some datasets must be downloaded manually because of
    licensing agreements.
  - It covers vLLM and `launch_scripts/eval.py`.
  - So `training_code: public` stands, and the record's note already explains the card/repo
    discrepancy.
- The blog says Molmo 2-O offers "a fully open end-to-end model flow including the underlying
  LLM", which supports the summary.
- The molmo2 LICENSE is Apache-2.0, with the https URL variant.
- **Molmo2-Cap card**: ODC-BY; includes captions from GPT-4.1 and GPT-5 under OpenAI's terms.
- **Paper abstract** (v1 2026-01-15): the new datasets were "all collected without the use of
  closed VLMs".

## tulu (family) — verified, no changes

- **Tulu page**: Tülu 3 releases open data, code and recipes. No version newer than 3.x is
  shown.
- **Tülu 3 blog**: 2024-11-21; SFT, DPO and RLVR.
- **405B blog**: 2025-01-30.
- **Paper**: v1 2024-11-22; built on Llama 3.1 base models.
- **Tülu 3.1 card**:
  - Only the final RL stage changed, from PPO to GRPO.
  - It is "one step of a bigger process" toward OLMo.
  - The Llama 3.1 pretraining corpus is unknown.

## llama-3-1-tulu-3-1-8b — 2 changes (license and provenance checked)

- **License**:
  - The card's metadata has `license: llama3.1` and its text names the "Llama 3.1 Community
    License Agreement".
  - The SFT card says all Llama 3.1 Tülu3 models are under Meta's Llama 3.1 license.
  - The Llama 3.1 LICENSE (release date July 23, 2024) confirms "Built with Llama", the
    "Llama" name prefix, and the Acceptable Use Policy.
  - The open-instruct LICENSE is Apache-2.0.
- **Provenance**:
  - The card's `base_model` is Llama-3.1-Tulu-3-8B-DPO; the SFT card's `base_model` is
    meta-llama/Llama-3.1-8B.
  - The paper names allenai/llama-3.1-tulu-3-8b-preference-mixture as the 8B DPO data.
  - The card's `datasets` field lists RLVR-GSM-MATH-IF-Mixed-Constraints.
  - The card gives the exact open-instruct commit.
  - Not gated.
- Changes:
  - `license_notes.text`: "a separate license from Meta for licensees with more than 700
    million monthly active users" → "for licensees whose products had more than 700 million
    monthly active users on the Llama 3.1 release date". Reason: the license measures monthly
    active users as of the Llama 3.1 version release date. Source: llama31-license.
  - `checklist.training_data_information.source_ids`: added `tulu3-paper`. Reason: the "8B
    preference mixture" is named in the paper, not in the cited cards.
- `released_at` stays null. The card gives no date; the Hub repo was created 2025-02-07, but
    that is not a documented release date.

## pythia (family) — verified, no changes

- **Repo README**:
  - April 3, 2023 re-release; v0 models remain available.
  - November 2, 2023: 14M and 31M models added.
  - Extra random-seed runs.
  - 154 checkpoints per model.
  - The Apache-2.0 license covers the code and the Pythia models.
- **Paper**: v1 2023-04-03.

## pythia-12b — verified, no changes

- **Card**:
  - 11,846,072,320 total parameters; English; trained on the Pile, not deduplicated.
  - 299,892,736,000 tokens; batch size 2M.
  - 154 branches; `step143000` equals `main`.
  - Not for deployment.
  - Uses the GPT-NeoX-20B tokenizer.
  - Evaluated with the LM Evaluation Harness; results are in `results/json`.
  - Not gated.
- **Repo**:
  - Notes the different initialization for 6.9B and 12B.
  - Gives reproduction instructions and the preshuffled data.
  - `EleutherAI/pile-standard-pythia-preshuffled` is public and ungated (Hub API).
- Pythia LICENSE is Apache-2.0.

## gpt-neox — 1 change

- `license_notes.text`: appended that, after the Apache 2.0 text, the LICENSE file also
  reproduces three more licenses:
  - a BSD-style license for NVIDIA code
  - Apache 2.0 for Hugging Face and Google Research code
  - the MIT license for Facebook Fairseq code

  Added `gpt-neox-license` to `source_ids`. Reason: the record showed only Apache-2.0, but
  the LICENSE file (467 lines, read in full) bundles these third-party licenses. The main
  Apache text is standard; its header says "January 2024", a typo for 2004.
- Verified from the README:
  - Built on Megatron-LM and DeepSpeed; ZeRO and 3D parallelism.
  - Rotary/ALiBi positional embeddings and flash attention; MoE via megablocks.
  - Configs for Pythia, PaLM, Falcon and LLaMA 1 & 2.
  - DPO, KTO and reward modeling.
  - Slurm and MPI launchers; `eval.py` with the LM Evaluation Harness; HF export.
  - Python 3.8–3.10 and PyTorch 1.8–2.0; DeeperSpeed; AMD MI100 and MI250X.
  - v1.0 is the snapshot used for GPT-NeoX-20B and Pythia; v2.0 moved to upstream DeepSpeed.
  - Files without an NVIDIA header are EleutherAI copyright.

## the-pile — 2 edits to availability and license notes (hosting status checked)

**What EleutherAI still hosts** (checked through the Hugging Face API; the record's wording is
correct and was kept):
- `EleutherAI/the_pile_deduplicated`: public, 1,650 parquet shards, no README (no card).
- `EleutherAI/pile-standard-pythia-preshuffled` and `EleutherAI/pile-deduped-pythia-preshuffled`:
  public, no card.
- `EleutherAI/pile_val_test`: `license: mit`, val and test jsonl files.
- `EleutherAI/pile`: only `.gitattributes`, `README.md` and `pile.py`. The loader's
  `_HOST_URL` is `https://the-eye.eu`.

**The Eye host**:
- pile.eleuther.ai still says "The Pile is hosted by the Eye" and links
  `the-eye.eu/public/AI/pile/`. The-pile README links the same path.
- Today the-eye.eu presented an expired TLS certificate.
- Ignoring the certificate, `/public/AI/pile/` returned nginx 404 Not Found.

**Common Pile paper** (arXiv 2506.05209, v1 2025-06-05):
- Says the use of unlicensed training data "has previously resulted in DMCA takedowns of
  datasets such as the Pile".
- Its first authors are affiliated with the University of Toronto and the Vector Institute.
  EleutherAI researchers are co-authors.

Changes:
- `availability.access_conditions`:
  - "this catalog could not reach that host on 2026-09-29" → the host presented an expired
    certificate, and the Pile download path returned a not-found error. Reason: this is
    more precise; the host responds.
  - "contains only a loading script" → "contains only a dataset card and a loading script".
  - "EleutherAI's 2025 Common Pile paper states that unlicensed training data led to DMCA
    takedowns" → "The 2025 Common Pile paper, whose authors include EleutherAI researchers,
    states that the use of unlicensed training data has resulted in DMCA takedowns". Reason:
    the paper is multi-institution and not an EleutherAI publication as such.
  - Added `pile-hf-card` to `source_ids`.
- `license_notes.text`: "the loading script lists the licenses of most components as
  'Unknown'" → "lists 'Unknown' as the license of every individual component it offers".
  Reason: `pile.py` covers only 10 of the 22 components, and marks all 10 "Unknown".

Verified:
- Datasheet PDF, converted to text: "a massive text corpus created by EleutherAI". Sources
  range "from original scrapes ... to text data made available by the data owners, to
  third-party scrapes".
- Paper v1 2020-12-31; datasheet 2022-01-13.
- Pile-CC is the largest component by raw size (227.12 GiB).
- The replication-code LICENSE is MIT (2020 EleutherAI).
- The Pythia card gives the profanity and bias limitations and calls the Eye a "community
  mirror".

## docling — 2 changes (LF AI & Data hosting checked)

- The LF AI & Data project page (fetched, "Last updated: 2026-09-23") says: "IBM donated
  Docling to LF AI & Data Foundation as an Incubation-stage project in March 2025. It
  graduated to a Graduate-tier project in August 2026."
- The 2025-04-29 LF AI & Data blog says the projects "have officially been inducted" by the
  TAC. It does not give an induction month.
- Changes:
  - `summary.text`: "hosted by the LF AI & Data Foundation since April 2025" → "since 2025".
    Added `lfaidata-docling-page` to `source_ids`. Reason: the foundation's page dates the
    donation to March 2025.
  - `eligibility.explanation`: replaced "which inducted it in April 2025" with the project
    page's statement: donated as an Incubation-stage project in March 2025, with the
    induction announced April 2025, and Graduate-tier since August 2026. Reason: the old
    date conflicted with the foundation's own page, and the graduation is current status.
    Sources: lfaidata-docling-page, lfaidata-docling-blog.
- Verified:
  - README: "Docling is hosted as a project in the LF AI & Data Foundation"; "started by the
    AI for knowledge team at IBM Research Zurich"; MIT codebase; model licenses per package.
  - The formats, integrations, MCP server, docling-serve and CLI match the record.
  - Python 3.10+ since 2.70.0; macOS, Linux and Windows on x86_64 and arm64.
  - LICENSE is MIT ("The Docling Contributors").
  - The install page lists the extras (easyocr, rapidocr, tesserocr, asr, vlm, mac_intel), the
    CPU wheel index and uv.
  - Tech report v1 2024-08-19.

## mlflow — verified, no changes (LF Projects governance checked)

- **Charter PDF** (fetched from the repo): "Technical Charter ... for MLflow Project a Series of
  LF Projects, LLC, Adopted June 2, 2020". It says "LF Projects, LLC ... is a Delaware series
  limited liability company", and the TSC is "responsible for all technical oversight".
- **mlflow.org footer**: "© 2025 MLflow Project, a Series of LF Projects, LLC."
- **LF press release**: San Francisco, June 25, 2020; MLflow was originally created by
  Databricks.
- **LICENSE.txt**: Apache-2.0, headed "Copyright 2018 Databricks, Inc."
- **README**:
  - Features: tracing, observability, evaluation, prompt management and optimization, AI
    Gateway, OpenTelemetry.
  - Model training: tracking, evaluation, registry, deployment to Docker, Kubernetes,
    Azure ML and SageMaker.
  - Languages: Python, TypeScript/JavaScript and Java.
  - Runs locally, on-premises, in the cloud or on managed services.
  - `uvx mlflow server`.
  - The README's "largest" and download-count claims were rightly not carried into the
    record.
- **PyPI**: 3.16.1 is current, `requires_python >=3.10`.

## redpajama — 1 change (data license and book config checked)

- **Data license**:
  - The V2 card has no `license` metadata (Hub cardData is null). Its License section says
    "Please refer to the Common Crawl Foundation Terms of Use for the data" and "The code ...
    is licensed under the Apache 2.0 license".
  - The V1 card says to refer to each subset's license, and that GitHub was limited to MIT,
    BSD and Apache.
  - The record's "Neither version grants a single license for the data" is accurate.
- **Book config**: the V1 card says "Defunct: The 'book' config is defunct and no longer
  accessible due to reported copyright infringement for the Book3 dataset contained in this
  config." The record's wording matches.
- Other checks:
  - Both repos are ungated.
  - V2 has over 100B documents from 84 snapshots in five languages. The dedup `head_middle`
    table totals 30.4T tokens.
  - The blog says "40+" quality annotations; the card's table has 46 rows.
  - About 1TB per snapshot; `sample` config.
  - CCNet head/middle/tail buckets; Bloom filter duplicates kept and marked.
  - The acknowledgements list the V1 partners.
  - Software citation author: "Together Computer".
  - The repo LICENSE is Apache-2.0.
  - The paper's arXiv comment gives NeurIPS 2024 Datasets and Benchmarks.
  - Blog 2023-10-30.
  - V1 card: 1.2T tokens.
  - The V1 card's "Other Known Limitations" says "[More Information Needed]", so
    `stated_limitations: unknown` is correct.
- Change:
  - `eligibility.explanation`: "with an address in San Francisco, California" → "and give a
    San Francisco, California address for copyright notices".
  - Reason: the terms of service give 251 Rhode Island Street, San Francisco only in the
    DMCA-notice section. They do not state it as a headquarters or entity address. Source:
    together-tos.

## Could not verify / follow-ups for an editor

- The GitHub REST API was rate-limited for unauthenticated requests. I used release-page
  redirects, release-page `datetime` attributes and PyPI instead, which gave the same result
  for the latest-release claims.
- the-eye.eu has an expired TLS certificate. I made one listing request to
  `/public/AI/pile/` without certificate verification, only to see whether the path exists;
  it returned 404. I downloaded no data. An editor may want to recheck, because a CDN or
  host change could restore it.
- FineWeb's NeurIPS 2024 D&B venue rests only on the dataset card's citation block. The arXiv
  record has no comments field.
- Several upstream cards are stale compared with newer material. The records handle this, but
  an editor should know:
  - The Molmo2-O-7B card still says training code is coming later; it has since been released.
  - The SmolLM3-3B card says mid- and post-training data "will be uploaded later"; SmolTalk2
    is now published.
  - The Pythia card still points to the Eye as a community mirror.
- The Pythia card and repo README give different paths for evaluation results
  (`results/json/*` vs `evals/pythia-v1/*/*`). The record cites the card.
