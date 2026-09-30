# Research notes: r2-oss-artifacts-c

Reviewed 2026-09-29. All records are artifact records; no organization files were edited.
Validator (`npx tsx scripts/validate.ts`) shows no errors or warnings for any file in this group.
Referenced slugs owned by other agents (`common-crawl-corpus`, `lf-ai-data`) already exist and
resolve.

Raw files (LICENSE files, READMEs, Hugging Face card READMEs, PyPI/GitHub/HF API metadata) were
read with `curl` using the generic UA `USASI-catalog-research/0.2`; pages were read with WebFetch.
No personal data was sent in any request.

## Hugging Face (`hugging-face`)

Eligibility for all HF artifacts relies on Hugging Face's ToS (Hugging Face, Inc., Delaware; New
York law and courts) and privacy policy (company and servers located in the U.S.; Paris SAS only as
the EU main establishment), and points to the existing organization record's dual-country
assessment. The pending NVIDIA acquisition (on the org record) was not relied on.

| Slug | Decision | Basis | Notes |
| --- | --- | --- | --- |
| `transformers` | published | us-governed-project | v5.17.0 (GitHub release 2026-09-09). Install doc: PyTorch only, Python 3.10+, PyTorch 2.5+; CUDA, Intel XPU, CPU, NVIDIA ARM64 setups. LICENSE: Apache-2.0, "Copyright 2018- The Hugging Face team". |
| `diffusers` | published | us-governed-project | v0.40.0 (2026-08-20) removed JAX/Flax and added tensor-parallel support for CUDA and AWS Neuron. Install docs say "tested on Python 3.8+" while PyPI requires >=3.10, so Python version was left out. Telemetry note recorded in run_notes. |
| `trl` | published | us-governed-project | v1.14.1 released today (2026-09-29). `supported_platforms` left unknown (no platform statement in docs). PyPI lists an individual as author; not used. |
| `smollm` (family) | published | us-headquarters | SmolLM (2024-07-16), SmolLM2 (paper 2025-02-04), SmolLM3 (2025-07-08). No SmolLM4 found (HF model listing and search). |
| `smollm3-3b` | published | us-headquarters | Apache-2.0 weights, ungated. Pretraining configs (huggingface/smollm), post-training recipe (alignment-handbook, Apache-2.0), intermediate checkpoints, SmolTalk2 data all public. Provenance notes that post-training data includes outputs of Qwen3-32B and DeepSeek-V3 and reasoning traces from the Llama-Nemotron and OpenThoughts3 datasets. |
| `fineweb` | published | us-governed-project | ODC-By 1.0 per card; use also subject to Common Crawl Terms of Use. v1.4.0 (2025-07-11) added Jan–Jun 2025 snapshots; card now says >18.5T tokens (originally 15T). Provenance uses `common-crawl-corpus`. The card's summary paragraph still says "96 dumps ... to April 2024" (stale relative to its changelog); the record follows the changelog. Publisher org HuggingFaceFW is named "FineData" and says it is part of the Hugging Face Science team. |

## Ai2 (`ai2`)

| Slug | Decision | Basis | Notes |
| --- | --- | --- | --- |
| `molmo` (family) | published | us-nonprofit-or-lab | Molmo (2024-09-25), Molmo 2 (Dec 2025), MolmoAct 2 (2026-05-05). Other 2026 variants seen on HF (MolmoWeb, MolmoPoint, MolmoBot, Molmo2-ER, MolmoMotion) are not described in the record. |
| `molmo2-o-7b` | published | us-nonprofit-or-lab | Chosen because its LLM (Olmo 3 7B Instruct) is Ai2's own; Molmo2-4B/8B use Qwen3 (recorded on the family provenance). Card still says training code "will be made available at a later date", but allenai/molmo2 (Apache-2.0) now has training code and pretrain/SFT checkpoints; record states both. All nine Molmo2 datasets are ODC-BY and ungated (checked via HF API). Molmo2-Cap card says some captions were generated with GPT-4.1/GPT-5; noted alongside the paper's "no closed VLMs" statement. Card names "SigLIP 2" but links google/siglip-so400m-patch14-384; record quotes both. Exact release day not pinned (blog vs. press dates differ), so `released_at: 2025-12`. |
| `tulu` (family) | published | us-nonprofit-or-lab | **Model family, not research-stack**: Ai2's cards and Tulu page call Tülu 3 "an instruction following model family" offering a post-training package (data, code, recipes). Recipe code lives in open-instruct. Base models are Meta Llama 3.1 (provenance links the `llama` family record). No Tülu 4 found. |
| `llama-3-1-tulu-3-1-8b` | published | us-nonprofit-or-lab | Latest Tülu release. Llama 3.1 Community License (custom, `spdx: null`); key terms summarized from the license file. `released_at: null` because no page states the 3.1 release date (HF repo creation 2025-02-07 is not a documented release date). `training_data_information: partial` (post-training data public; Llama 3.1 pretraining corpus unknown per card). |

## EleutherAI (`eleutherai`)

Eligibility cites EleutherAI's about page (incorporated as a non-profit in early 2023) and the IRS
EO BMF DC extract (EleutherAI Institute, Washington, D.C., subsection 03, ruling 2023-11).

| Slug | Decision | Basis | Notes |
| --- | --- | --- | --- |
| `pythia` (family) | published | us-nonprofit-or-lab | Current suite retrained 2023-04-03; 14M/31M added 2023-11-02; extra seeds (PolyPythias). |
| `pythia-12b` | published | us-nonprofit-or-lab | Apache-2.0 (card and repo license section covers models and code). 154 checkpoints. Repository erratum: 6.9B/12B used a different initialization than intended; recorded in provenance. |
| `gpt-neox` | published (research-stack) | us-governed-project | Latest tagged release v2.0 (2023-03-09 per README news); repo still active (pushed 2026-09-04). README states testing on Python 3.8–3.10 / PyTorch 1.8–2.0. `version: null`. |
| `the-pile` | published, availability **partial** | us-governed-project | See "Pile availability" below. |

### Pile availability (ambiguous; flagged for editor)

- pile.eleuther.ai and the the-pile README still link a download hosted by the Eye; the Pythia card
  calls that host "a community mirror". The HF `EleutherAI/pile` repo holds only a loading script
  that downloads from the Eye.
- the-eye.eu could not be reached from this environment (curl connection failure; WebFetch
  refused the domain), so current availability there is **unverified**, not confirmed removed.
- EleutherAI's Common Pile v0.1 paper (2025) states unlicensed data "has previously resulted in DMCA
  takedowns of datasets such as the Pile". No EleutherAI page found that formally withdraws the
  Pile or names Common Pile as its replacement, so I did not use `archived` or `not_public`.
- EleutherAI's HF org still hosts `the_pile_deduplicated` (134M rows, ~451 GB parquet, no card,
  no license), pre-tokenized Pythia training data, and `pile_val_test` (MIT tag, card present).
- A community HF discussion (2023) and Wikipedia describe the takedown in more detail, but they are
  not official, so they were not cited.
- No overall data license: the HF card defers to per-subset licenses and the loader lists most as
  "Unknown". Only the replication code (MIT) is licensed. `released_at: null` (paper date
  2020-12-31 is a paper date, not a documented dataset release date).
- Editor question: whether a dataset with a DMCA history and an unverifiable primary download should
  stay `published` with `partial` availability (current choice) or move to `archived`.

## IBM (`ibm`)

| Slug | Decision | Basis | Notes |
| --- | --- | --- | --- |
| `docling` | published | us-governed-project | README: "Docling is hosted as a project in the LF AI & Data Foundation"; LF AI & Data blog (2025-04-29) says its TAC inducted Docling, Data Prep Kit, and BeeAI on IBM's contribution, and describes LF AI & Data as an umbrella foundation of the Linux Foundation (LF privacy policy: San Francisco mailing address). `organization_slugs: [lf-ai-data, linux-foundation, ibm]`. Project was started by IBM Research **Zurich**; the maintainer list gives an IBM Zurich contact. Eligibility is based on the U.S. foundation host, not on where developers work; this is noted in the explanation. v2.131.0 released 2026-09-29. MIT license ("Copyright The Docling Contributors"). |

## Databricks (`databricks`)

| Slug | Decision | Basis | Notes |
| --- | --- | --- | --- |
| `mlflow` | published | us-governed-project | Governed as "MLflow Project, a Series of LF Projects, LLC" (technical charter adopted 2020-06-02, in the repo as mlflow-charter.pdf; site footer). LF press release 2020-06-25 (San Francisco dateline) says it was created by Databricks. **Not** an LF AI & Data project (lfaidata.foundation/projects/mlflow returns 404 and it is absent from the projects list), so `lf-ai-data` is not referenced; `organization_slugs: [linux-foundation, databricks]`. v3.16.1 (PyPI 2026-09-16; GitHub release 2026-09-17 per API). LICENSE keeps "Copyright 2018 Databricks, Inc.". |

## Together AI (`together-ai`)

| Slug | Decision | Basis | Notes |
| --- | --- | --- | --- |
| `redpajama` | published | us-governed-project | Current version V2 (announced 2023-10-30): 84 CC snapshots, 100B+ docs, ~30.4T deduplicated annotated tokens, 5 languages. **No data license**: V2 card refers to the Common Crawl Foundation Terms of Use for data and Apache 2.0 for code; V1 card defers to per-subset licenses. V1 `book` config (Books3) marked defunct for reported copyright infringement. `stated_limitations` left unknown (V2 card's limitations sections are placeholders). `slimpajama` (another agent) references this slug; that validation error is now resolved. Provenance uses `common-crawl-corpus`. |

## Surprising or ambiguous items

- Hugging Face's pending acquisition by NVIDIA (org record) does not change these artifact records;
  if it closes, the HF artifacts' eligibility explanations may need a note.
- Molmo2-O-7B's card is out of date about training-code availability; the GitHub repo has it.
- Docling's day-to-day maintainers appear to be at IBM Research Zurich (Switzerland), while
  governance sits with LF AI & Data (U.S.). An editor may want to confirm this reading of
  "governing entity".
- FineWeb's card text is internally inconsistent about scope (summary vs. changelog).
- GitHub's REST API rate limit was hit partway through; remaining raw files were read from
  raw.githubusercontent.com.
