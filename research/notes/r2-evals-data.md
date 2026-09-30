# r2-evals-data research notes

Researcher group: r2-evals-data (round 2). Reviewed 2026-09-29.
Assigned: humaneval, openai-evals, nemotron-cc, slimpajama, dclm, bigcodebench, arc-agi
(+ optional org arc-prize-foundation), terminal-bench.

Validation: `npx tsx scripts/validate.ts` reports no errors in these files except the
expected `Unknown provenance artifact "redpajama"` in slimpajama.yml. `redpajama` is the
round-2 canonical slug another agent owns; it did not exist yet when I ran validation.
`common-crawl-corpus` and `stanford-university` already exist.

## Files created

| File | Status | Eligibility |
| --- | --- | --- |
| content/artifacts/humaneval.yml (eval) | published | eligible, us-governed-project (OpenAI) |
| content/artifacts/openai-evals.yml (eval) | published | eligible, us-governed-project (OpenAI) |
| content/artifacts/nemotron-cc.yml (dataset) | published | eligible, us-governed-project (NVIDIA) |
| content/artifacts/slimpajama.yml (dataset) | **archived** | eligible, us-governed-project (Cerebras) |
| content/artifacts/dclm.yml (dataset) | **draft** | pending_review, undetermined |
| content/artifacts/bigcodebench.yml (eval) | **draft** | pending_review, undetermined |
| content/artifacts/arc-agi.yml (eval) | published | eligible, us-governed-project (ARC Prize Foundation) |
| content/organizations/arc-prize-foundation.yml | published | eligible, us-nonprofit-or-lab |
| content/artifacts/terminal-bench.yml (eval) | published | eligible, us-governed-project (Stanford / Laude Institute / Harbor) |

I edited no existing files.

## Per-candidate notes

### HumanEval: published
- Repo `openai/human-eval`: not archived. The LICENSE is MIT, "Copyright (c) OpenAI".
- The data file `data/HumanEval.jsonl.gz` is in the repo. The HF dataset
  `openai/openai_humaneval` (MIT, 164 problems) is under OpenAI's HF org.
- The repo is barely maintained: 7 commits in total. The last ones (2025-01-17) fixed a
  broken eval; everything else is from 2021.
- `released_at: 2021-07` comes from paper v1 (2021-07-07); the GitHub API gives repo
  creation as 2021-07-06.
- Eligibility cites the OpenAI SEC exhibit (SF address), which I re-read today.

### OpenAI Evals: published, status described accurately
- The repo is **not archived** but is in maintenance mode:
  - Last PyPI release is 3.0.1.post1 (2024-05-01).
  - Commits since mid-2024 are only: a README pointer to OpenAI's hosted Evals in the
    dashboard (Dec 2024), removal of a defunct eval suite (Nov 2025), and CI/pre-commit
    pinning (Apr 2026).
  - The README says evals with custom code are not being accepted.
- License: MIT for code. LICENSE.md lists separately licensed datasets, including
  CC BY-NC 4.0 components.
- `released_at: 2023-03` is based on the first PyPI upload (0.1.1 on 2023-03-14). The
  GitHub API gives repo creation as 2023-01-23, probably while private. Not otherwise
  documented.
- Worth reconsidering later: if the repo is archived, switch to `archived`.

### Nemotron-CC: published
- One project record covering three releases:
  - Original release (Dec 2024; 6.3T tokens; 99 CC snapshots), hosted on Common Crawl's
    data site.
  - Nemotron-CC-v2 (Aug 2025) on Hugging Face.
  - Nemotron-CC-v2.1 (Dec 2025) on Hugging Face.
- **Licensing differs by release:**
  - The paper says the original is released "under the Common Crawl Terms of Use". Neither
    the CC contrib page nor NVIDIA's research page states a separate license.
  - v2 and v2.1 are gated on HF (contact info plus click-through) under the **NVIDIA Data
    Agreement for Model Training**. I read the full text (v. Aug 15, 2025) from the ungated
    `nvidia/Nemotron-Pretraining-Dataset-sample/LICENSE.md`, which the v2.1 card links.
  - That agreement allows use solely for internal model training and bars redistribution.
    Either party can terminate on 30 days' notice (then delete copies). Delaware law applies.
  - The v2 card warns that trained models may be subject to Qwen/DeepSeek license terms.
  - The v2.1 card summary also mentioned Phi-4. I did not verify that directly, so it is
    not recorded.
- The raw HF READMEs for v2/v2.1 are gated (401), so card facts come from the rendered
  pages via WebFetch.
- Provenance: `common-crawl-corpus`. The synthetic data was generated with non-U.S. models,
  recorded in the provenance text:
  - original: Mistral NeMo 12B Instruct
  - v2: Qwen3, DeepSeek, and Mistral-Nemo
  - v2.1: Qwen3 and gpt-oss-120b
- Checklist `access: public` because anyone can download after a click-through. The gate
  asks for contact info; I found no evidence of manual approval. Reviewer may prefer
  `partial`.

### SlimPajama: archived (material change)
- `huggingface.co/datasets/cerebras/SlimPajama-627B` (and SlimPajama-6B) returned **HTTP
  401 "not found"** today.
- Cerebras's HF org page lists only 4 unrelated datasets.
- An HF forum thread reports it unreachable from **2026-07-31**. Oumi's docs say the repo
  "has been removed from HuggingFace Hub".
- On **2026-09-01**, commit d76e028 ("removing slimpaja dir (#93)", no PR description)
  deleted the SlimPajama preprocessing directory from Cerebras/modelzoo main. It still exists
  at tag Release_2.10.0, which I cite.
- No official Cerebras explanation was found. Following the DBRX precedent, I recorded it
  as `archived` with `availability: not_public`.
- License: the Cerebras blog and README both say Apache 2.0 for the dataset. I could not
  read the HF card's license section (inaccessible), so `licensing: partial`.
- Opentensor is credited as a collaborator. Eligibility rests on Cerebras (Sunnyvale 10-Q,
  re-read today).
- A community re-upload exists under an individual's HF account. It is deliberately not
  named or linked.
- Noticed but not recorded: RedPajama-Data-1T's card now lists six sources without Books.
  That is for the redpajama owner.

### DCLM: draft, pending_review
- Maintainers, exactly as documented:
  - The dataset card says "Curated by: The DCLM Team".
  - The paper's datasheet (Q52) says "The DCLM team will be responsible for maintaining
    these assets". Hosting is by Common Crawl and Hugging Face.
  - Code and data sit under the `mlfoundations` GitHub/HF orgs, and the MIT license says
    "Copyright (c) 2024 mlfoundations".
  - The GitHub org has no stated name or location; its blog link is a personal academic
    page.
  - The contact is contact@datacomp.ai.
- The paper lists 23 affiliations: University of Washington, Apple, Toyota Research
  Institute, UT Austin, Tel Aviv University, Columbia, Stanford, UCLA, JSC, LAION, AI2, TUM,
  CMU, Hebrew University, SambaNova, Cornell, USC, Harvard, UCSB, SynthLabs, Bespokelabs.AI,
  Contextual AI, and DatologyAI.
- No U.S. maintaining institution is documented, so this stays `pending_review` +
  `undetermined` + draft per the assignment.
- Kind is `dataset` (DCLM-Baseline plus DCLM-Pool), and the summary describes the
  benchmark/testbed role. Reviewer could split it into an eval record.
- Discrepancy: the README intro says "over 300T unfiltered tokens", while the card, paper,
  and project page say DCLM-Pool is 240T. I used 240T.
- The README notes a Sept 2025 fix to CORE/EXTENDED baselines (older scores not comparable).
- Licenses: CC-BY-4.0 for the data (the paper adds that Common Crawl ToU applies), MIT for
  the code.

### BigCodeBench: draft, pending_review
- **The GitHub repo was archived on 2026-07-20** (read-only).
- Last GitHub release is v0.2.5 (Apr 2025, pre-release); PyPI 0.2.5 was uploaded
  2025-03-31.
- The HF dataset `bigcode/bigcodebench` (Apache 2.0, v0.1.0–v0.1.4) is still up.
- Maintainers: the BigCode project. The dataset card names a primary contact at Monash
  University & CSIRO's Data61 (Australia). The README routes leaderboard submissions to a
  monash.edu address.
- BigCode's mission page: "corporate support from ServiceNow and HuggingFace e.g. for
  hosting ... and for training compute; all technical governance takes place within working
  groups and task forces across the community."
- No U.S. maintaining institution is documented for the benchmark, so it stays
  pending_review + draft, similar to llama.cpp (CONTENT_REVIEW A1).
- An owner could decide that Hugging Face hosting makes it U.S.-governed, but I did not
  make that call.
- `organization_slugs` was left empty on purpose.

### ARC-AGI: published; ARC Prize Foundation: published (created)
- **Is it a U.S. nonprofit?** Yes, with a caveat.
  - The site says "nonprofit", and the donate page says donations are tax-deductible.
  - Its **Form 990 for TY2024** (EIN 99-2781492, e-filed; object 202523119349301902) checks
    501(c)(3) and public-charity status, and gives formation year 2024, Delaware legal
    domicile, and address 548 Market St PMB 83849, San Francisco. I extracted it from the
    IRS e-file batch `2025_TEOS_XML_11C.zip` by HTTP range request, and the IRS
    `index_2025.csv` lists it.
  - **Caveat:** it is NOT in the IRS EO BMF California extract or the Pub 78 data, both
    downloaded today; I searched by EIN and name. ProPublica also says it is "not listed in
    the IRS's most recent list of tax exempt organizations."
  - I recorded this caveat in legal_form and in eligibility.
  - U.S. location is solid either way, so the basis is `us-nonprofit-or-lab`.
  - Reviewer may prefer `us-headquarters`, since the address is a PMB mailbox.
- **Entity naming discrepancy:**
  - The site terms (updated 2024-06-03) and the privacy policy name "ARC Prize, Inc., a
    company registered in California" at the same PMB.
  - The 990 says "ARC Prize Foundation", domiciled in Delaware.
  - How the two names relate is not documented; this is recorded in notable_facts.
- Products: the ARC-AGI toolkit (MIT, "Copyright (c) 2026 ARC Prize 2026 ARC Prize
  Foundation"), the ARC Prize 2026 Kaggle competition, and ARC Prize Verified testing.
- The homepage says ARC Prize is a benchmark provider to NIST CAISI. This is recorded as
  the site's statement only; I did not verify it with NIST.
- I avoided officer and board names. The 990 lists individuals; none were copied.
- ARC-AGI licenses:
  - ARC-AGI-1: Apache 2.0, in the creator's personal GitHub repo (noted without naming the
    person).
  - ARC-AGI-2: Apache 2.0, in `arcprize/ARC-AGI-2`.
  - Toolkit: MIT.
  - **No license was found for the ARC-AGI-3 game environments themselves.**
- Availability is `partial`: the semi-private and private sets are withheld by design.
- Unverified: ARC-AGI-3's public/private game counts. The launch post and technical report
  abstract don't give a split.

### Terminal-Bench: published
- **The current version is 4.0**, not 2.0 as background knowledge suggested.
  - Release history: 2.0 (Nov 2025, 89 tasks, with Harbor), 2.1 (May 2026), 3.0 (Jul 2026),
    4.0 (Aug 2026, v4.0.0 tag 2026-08-26).
  - It has been a "continuous benchmark" with semantic versioning since Jul 2026.
- The repo moved from `laude-institute/*` to `harbor-framework/terminal-bench`; the old
  raw URLs redirect. License: Apache 2.0.
- Hosts, per the website and 4.0 post: "Stanford / Harbor / Laude Institute". The paper's
  first two affiliations are Stanford University and Laude Institute.
  - The IRS EO BMF CA lists the Board of Trustees of the Leland Stanford Junior University
    (Stanford, CA; 501(c)(3)).
  - It also lists **Laude Institute** (San Francisco; 501(c)(3); ruling 2026-01; EIN
    33-1387147). Laude's own "Hello, world" post says it is "a nonprofit with a public
    benefit corporation operating arm". Its /about page gives no location.
  - Harbor = framework from "the makers of terminal-bench". Its GitHub org location is the
    USA.
- All documented hosts are U.S., so the basis is `us-governed-project`.
- Maintainers: stanford-university (slug) plus Laude Institute and Harbor (no slugs). A
  `laude-institute` org record could be added in a later round.
- The GitHub releases page rendered wrong years (2024) through WebFetch. The Atom feed and
  the tbench.ai news index give 2026. I used the news index.
- `released_at: 2025-05-19` is the initial announcement per tbench.ai/news.

## Surprising / ambiguous items
1. SlimPajama has been withdrawn from Hugging Face, and its code was removed from Model Zoo
   main. No explanation was found.
2. BigCodeBench's repo is archived (Jul 2026).
3. Terminal-Bench is now at 4.0 and hosted under harbor-framework.
4. ARC Prize Foundation files a Form 990 claiming 501(c)(3) but is absent from the IRS BMF
   and Pub 78. Two entity names are in use (ARC Prize, Inc. vs ARC Prize Foundation).
5. Nemotron-CC v2/v2.1 are not openly licensed: an internal-training-only agreement, with
   no redistribution.
6. The GitHub API rate limit (unauthenticated) was hit mid-session. Later GitHub facts come
   from WebFetch of the HTML pages, raw files, or Atom feeds. I did not use `gh` because it
   would send the user's account token.
