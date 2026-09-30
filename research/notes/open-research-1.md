# open-research-1 notes (2026-09-29)

Assigned: organizations `ai2`, `eleutherai`; artifacts `olmo` (+ releases), `dolma`,
`hellaswag`, `lm-evaluation-harness`; placeholder `ae2-eval`.

All sources cited in records were read today with WebFetch, or with curl for raw files
(LICENSE files, IRS CSV extracts, the IRS field-definition PDF). `npx tsx scripts/validate.ts`
reports no errors or warnings in these files. The errors that remain in the run belong to other
groups (`pytorch-foundation` / `linux-foundation` slugs).

## Summary table

| Candidate | File | Decision | Eligibility basis | Computed tier |
| --- | --- | --- | --- | --- |
| Ai2 | organizations/ai2.yml | published | us-nonprofit-or-lab | n/a |
| EleutherAI | organizations/eleutherai.yml | published | us-nonprofit-or-lab | n/a |
| OLMo (family) | artifacts/olmo.yml | published | us-nonprofit-or-lab | n/a (family) |
| Olmo 3 7B base (Olmo-3-1025-7B) | artifacts/olmo-3-1025-7b.yml | published | us-nonprofit-or-lab | open-stack |
| Olmo 3 7B Instruct | artifacts/olmo-3-7b-instruct.yml | published | us-nonprofit-or-lab | open-stack |
| Olmo 3.1 32B Think | artifacts/olmo-3-1-32b-think.yml | published | us-nonprofit-or-lab | fully-open |
| Dolma | artifacts/dolma.yml | published | us-governed-project | n/a |
| LM Evaluation Harness | artifacts/lm-evaluation-harness.yml | published | us-governed-project | n/a |
| HellaSwag | none | **not created** | not established | n/a |
| "ae2-eval" | none | **rejected / unresolved** | n/a | n/a |

## Ai2 (`ai2`): published

- Reason: identity, U.S. location, and non-profit status are documented by official sources.
- Eligibility: `us-nonprofit-or-lab`. The about page describes Ai2 as a "Seattle based non-profit
  AI research institute" founded in 2014 by Paul Allen. The contact page gives a Seattle, WA
  address. The IRS EO BMF extract (eo_wa.csv) lists "THE ALLEN INSTITUTE FOR ARTIFICIAL
  INTELLIGENCE" in Seattle with subsection 03 (501(c)(3)) and organization code 1 (corporation).
- Legal form: taken from IRS codes. Foundation code 03 is "private operating foundation (other)"
  per the IRS information sheet. The IRS ruling date field reads 2025-08, which may mean a
  recent determination letter. I did not interpret this further and it is not in the record.
- Products (3): Ai2 Playground (`assistant-app`), Asta (`assistant-app`), Semantic Scholar
  (`other`).
  - playground.allenai.org and asta.allen.ai return only a JavaScript shell (HTTP 200), so I
    could not read them directly. Both are described from official pages instead:
    allenai.org/olmo plus the Olmo 3 blog for the Playground, and allenai.org/asta for Asta.
  - Ai2 does not document an API of its own. Its docs send API users to OpenRouter, Cirrascale,
    and Parasail. I recorded this as a notable fact, not as a product.
- Material recent changes (not in the record):
  - An Ai2 blog post dated 2026-05-01, which I read, says Peter Clark has resumed the role of
    interim CEO.
  - GeekWire headlines in search results (not fetched, not cited) report that CEO Ali Farhadi
    stepped down in March 2026, and that Microsoft hired him along with several Ai2 researchers,
    including OLMo contributors.
  - Neither is an acquisition, merger, or relocation, so there is no `status_note`. Worth
    watching for how the OLMo program continues. The Clark post says open models "remain
    fundamental."

## EleutherAI (`eleutherai`): published

- Legal status: EleutherAI's about page says it "incorporated as a non-profit research
  institute" in early 2023. A March 2023 blog post announced "The EleutherAI Institute."
- Location (official source): the IRS EO BMF extract for DC (eo_dc.csv) lists EIN 92-2215190,
  "ELEUTHERAI INSTITUTE," Washington, DC. It shows subsection 03 (501(c)(3)), organization code
  1 (corporation), ruling date 2023-11, and foundation code 15 (170(b)(1)(A)(vi) publicly
  supported organization).
  - EleutherAI's own site gives no location, so the headquarters is sourced only to IRS data.
  - The IRS row includes a street address with a unit number. It may be residential, so I left
    it out of the record on purpose.
- Identity link: ProPublica's Form 990 summary names the executive director, and that name
  matches the executive director on eleuther.ai/staff. This is cited in the eligibility
  explanation (the record does not name the person).
- Blocked sources, not bypassed: the IRS TEOS page returned 403, and ProPublica's XML download
  showed a bot check.
- No products are recorded, since none were requested for EleutherAI. `hiring_url` is null
  because no careers page was verified.

## OLMo family and releases

- Most recent generation: Olmo 3 (announced 2025-11-20), plus Olmo 3.1 32B checkpoints
  announced 2025-12-12 as an update on the same blog post.
  - Ai2 docs "Latest Releases" still names Olmo 3 (November 2025) as the latest.
  - The HF API lists no newer general Olmo LLM generation. Newer repos are Olmo Hybrid
    (Jan–Feb 2026) and OlmoEarth (Earth observation).
- Olmo Hybrid (blog 2026-03-05): a 7B architecture proof of concept (3:1 Gated DeltaNet to
  attention). It is mentioned in the family summary but has no release record. It could get one
  later; its license was not verified.
- Releases chosen (model card and license read for each):
  - `olmo-3-1025-7b` (base 7B)
  - `olmo-3-7b-instruct`
  - `olmo-3-1-32b-think`: the Olmo 3.1 flagship. The technical report v2 describes it as the
    Olmo 3 Think 32B RL run extended from 750 to 2,300 steps.
- Checklist decisions:
  - Weights, inference code, training code, training recipe, and evaluation materials are
    `public` for all three. Sources:
    - HF cards: not gated, Apache 2.0.
    - OLMo-core `src/scripts/official/OLMo3` for the 7B/32B pretrain, midtrain, and
      long-context scripts.
    - open-instruct `scripts/train/olmo3` for the SFT/DPO/RL scripts. Its README says SFT runs
      on OLMo-core.
    - arXiv 2512.13961v2 for stages and hyperparameters.
    - OLMES README for the commands that reproduce the Olmo 3 report's evaluation suites.
  - `training_data_information` differs between the two sizes:
    - 7B releases: **partial**. The card for `dolma3_mix-6T-1025-7B` (the 7B pretraining mix)
      says some olmOCR science PDFs were redacted after training (`[REMOVED]`) and that this
      "will affect reproducibility of Olmo 3 7B." I did not treat the data as fully obtainable,
      so the 7B releases compute as open-stack, not fully-open.
    - 32B Think: **public**. The 32B mix (`dolma3_mix-6T`), the dolmino/longmino 1125 mixes,
      and Dolci-Think SFT/DPO/RL-32B are all downloadable, ungated, and ODC-BY.
- Dataset relationship: recorded in provenance. The 7B base derives from the Dolma 3 Mix,
  Dolmino, and Longmino 1025 mixes. The 32B base derives from `dolma3_mix-6T`. The Instruct
  model derives from `olmo-3-1025-7b` plus Dolci Instruct. All link to `dolma` via
  `artifact_slug`.
- Model card inconsistencies found (worth watching):
  - The Olmo 3.1 32B Think and 7B Instruct cards still say "Paper: [TBD]" and "logs (coming
    soon)." The paper is at arXiv 2512.13961, and allenai.org/papers/olmo3 redirects there.
  - Post-trained cards copy 7B dataset names into their stage lists. Several dataset links
    redirect to renamed repos:
    - `dolci-thinking-sft` → `Dolci-Think-SFT-7B`
    - `Dolci-Think-RL` → `Dolci-Think-RL-32B`
    - `dolma3_mix-6T-1025` → `dolma3_mix-6T-1025-7B`
    - `dolma3_mix-5.5T-1125` → `dolma3_mix-6T`
  - The cards' "OLMo-Eval" link now redirects to `allenai/olmo-eval`, a 2026 evaluation
    workbench whose README does not mention Olmo 3. I cited OLMES for evaluation instead.
  - The docs "Latest Releases" page gives the script path as `src/examples/official/OLMo3/...`,
    but the files are at `src/scripts/official/OLMo3/`.
  - The Dolma 3 pool card links "Olmo-3-1025-32B," which returns 401. The real repo is
    `Olmo-3-1125-32B`.
  - The Olmo 3 blog says datasets are released "without any license restrictions." The dataset
    cards say ODC-BY and "intended for research and educational use." The records follow the
    cards.
- License notes: the cards say Apache 2.0, plus "intended for research and educational use in
  accordance with Ai2's Responsible Use Guidelines." I recorded this without judging whether it
  is binding.

## Dolma (`dolma`): published

- One project record covers the family of versions:
  - v1 (2023-08-18), v1.5, v1.6, and v1.7 (2024-04-15) on `allenai/dolma`.
  - Dolma 3 (2025): 9.31T-token pool, 6T pretraining mixes, Dolmino and Longmino mixes, with
    construction code in `allenai/dolma3`.
  - A Dolma 3.5 pool. HF lists the repo as created 2026-03. Its card does not say which model
    it trained, and the record does not claim one.
- Licensing:
  - Data is ODC-BY (license change dated 2024-04-15 on the v1.x card). The v1.x card also says
    users are bound by the original sources' terms.
  - Toolkit and dolma3 repo are Apache-2.0 (LICENSE files read).
  - WebFetch's summary of github.com/allenai/dolma wrongly called the repo ODC-BY; the LICENSE
    file is Apache 2.0.
- Datasheet: the Dolma paper (arXiv 2402.00159, ACL 2024) includes a Limitations section and a
  datasheet appendix (Appendix N), checked in the arXiv HTML v2.
- Gap: the Dolma 3 pool repo hosts only its Common Crawl and olmOCR PDF portions. The other
  sources link out to third-party repos, which I did not audit.

## HellaSwag (`hellaswag`): NOT CREATED

- **Material change found:** `github.com/rowanz/hellaswag` returns HTTP 451. The GitHub API
  reports "Repository access blocked," reason `dmca`, created 2026-09-14. The linked notice
  (github/dmca `2026/09/2026-09-14-wikihow.md`, read today) was filed on behalf of wikiHow,
  Inc. and lists `rowanz/hellaswag` among repositories said to contain scraped wikiHow content.
- Why I did not create a record: the assignment requires the paper and the repository to
  substantiate identity, license, and eligibility. Here they do not:
  - Repository and license: the repository and its LICENSE file cannot be read. The HF mirror
    card (`Rowan/hellaswag`) says "MIT" and links to the blocked LICENSE. That is a secondary
    card, so I did not use it as license evidence.
  - Maintaining institution: none is documented.
    - The paper (ACL 2019 PDF, read) lists author affiliations at the University of
      Washington's Paul G. Allen School and the Allen Institute for AI.
    - The code lives in a personal GitHub account, and the project page (rowanzellers.com)
      tells users to contact the lead author personally.
    - Author affiliations alone do not establish a governing entity under the policy.
  - Status: the leaderboard says submissions closed in November 2024.
- Kind, if a record is created later: `dataset`. The paper presents HellaSwag as "a new
  challenge dataset," and harnesses such as lm-eval implement the scoring. `eval` would fit
  only if a maintained evaluation codebase came with it.
- Revisit if the repository is restored or a maintaining institution publishes the dataset.

## LM Evaluation Harness (`lm-evaluation-harness`): published

- Maintainer: EleutherAI. The repo is in EleutherAI's GitHub org, `LICENSE.md` reads "MIT
  License, Copyright (c) 2020 EleutherAI," and PyPI lists EleutherAI as author. Basis:
  `us-governed-project`, which depends on the EleutherAI IRS record above.
- Latest release: v0.4.13, 2026-08-31 (GitHub API, release page, PyPI). WebFetch summaries
  wrongly dated the releases to 2024; I checked the date with the GitHub API and PyPI.
- Checklist: `limitations` is **partial**. The README documents operational limits only (no
  native multi-node evaluation, MPS caveats, unsupported request types). I found no general
  discussion of how valid the benchmarks are.
- `tasks_data` is public: task configs are in the repo, and data loads from HF datasets. The
  harness's MIT license does not cover third-party benchmark data.
- Not read: the "Lessons from the Trenches" reproducibility paper. It could strengthen
  methodology and limitations evidence later.

## "ae2-eval": REJECTED / UNRESOLVED

No project with that identity was established, and I invented nothing. Searches run today:

- WebSearch `"ae2-eval"`: results were the Wikipedia "AE2" disambiguation page,
  sanity-labs/agent-e2e-evals (unrelated), and other unrelated pages.
- WebSearch `"AE2" evaluation benchmark language model`: no matching project.
- GitHub repository search `ae2-eval`: 3 unrelated student repos ("AE2_ABP-Ejercicio...").
- Hugging Face model and dataset search `ae2-eval`: only an unrelated robotics model whose
  name contains "ae2" as part of a hash.
- PyPI `ae2-eval`: not found.

Observation, not a conclusion: "AE2" is sometimes used informally for AlpacaEval 2 ("AlpacaEval
2 LC" appears in Olmo cards). That is a different project with its own identity, and nothing
links it to the token "ae2-eval." No record was created.

## Other surprises / ambiguities

- WebFetch summaries got facts wrong several times, including dates, license claims, and a
  "released June 2025" claim for a Dolci dataset. Where it mattered I checked raw files (HF
  README, GitHub API, LICENSE files), and records rely only on content I confirmed.
- Ai2's IRS foundation classification (private operating foundation) and its 2025-08 ruling
  date could be checked further if the catalog wants legal-form precision.
