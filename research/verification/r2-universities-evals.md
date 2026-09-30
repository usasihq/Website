# Verification log: r2-universities-evals

Verifier pass on 2026-09-29. Every source cited in each record was reopened. Tools used:
- WebFetch.
- `curl -A "USASI-factcheck/0.2"` for raw GitHub files, PyPI JSON, Hugging Face API/cards, GitHub Atom feeds, and IRS files. The unauthenticated GitHub API was rate-limited, so release and commit facts come from Atom feeds and HTML pages.

Licenses were checked against the LICENSE files. No personal identifiers were sent in any request.

Validator result after edits: `0 error(s), 1 warning(s)`. The one warning is in `artifacts/continue-extension.yml`, which is not in this batch.

**Summary: 22 records checked (7 organizations, 15 artifacts).**
- **6 verified with no changes:** stanford-university, dspy, gpqa, berkeley-function-calling-leaderboard, humaneval, terminal-bench.
- **16 edited:** uc-berkeley, carnegie-mellon-university, princeton-university, new-york-university, lmsys, arc-prize-foundation, helm, sglang, mlc-llm, swe-bench, openai-evals, nemotron-cc, slimpajama, dclm, bigcodebench, arc-agi.
- **One eligibility change:** swe-bench moves from `eligible`/`published` to `pending_review`/`undetermined`/`draft`.
- **One availability change:** nemotron-cc goes from `public` to `partial`, because Hugging Face reports manual approval for the v2/v2.1 gates.
- **Status unchanged:** mlc-llm, gpqa, dclm and bigcodebench stay `draft`/`pending_review`; slimpajama stays `archived`.

No person records exist in the batch. No eligibility rests on individuals.

---

## Organizations

### stanford-university: verified, no changes
- **IRS eo_ca.csv row (EIN 94-1156365):** "THE BOARD OF TRUSTEES OF THE LELAND STANFORD JUNIOR UNIVERSITY", Stanford CA 94305. Subsection 03, foundation code 11 = "School 170(b)(1)(A)(ii)", organization code 2 = "Trust", per eo-info.pdf.
- **stanford.edu/about:** "founded in 1885 by California Senator Leland Stanford and his wife, Jane".
- **facts.stanford.edu/about:** "welcomed students in 1891"; footer "Stanford, California 94305".
- **CRFM:** "an interdisciplinary initiative at the Stanford Institute for Human-Centered Artificial Intelligence (HAI)".
- **nlp.stanford.edu:** lists DSPy; members come from Linguistics, CS and other departments.
- **DSPy LICENSE:** "Copyright (c) 2023 Stanford Future Data Systems".

### uc-berkeley: 2 source fixes
- `sources.arena-about`:
  - Before: url `https://arena.ai/about`, title "About | Arena".
  - After: url `https://arena.ai/company/about`, title "About Us - Arena.ai".
  - Reason: the old URL now redirects there. The content still supports the claims ("Created by researchers from UC Berkeley, Arena (formerly LMArena)…", "In 2025, we formed Arena Intelligence Inc.").
- `sources.pytorch-vllm.published_at`: `2025-05-06` → `2025-05-07`. Reason: the post displays "May 7, 2025".
  - **Editor follow-up:** `content/artifacts/vllm.yml` (not in this batch) has the same 2025-05-06 date.
- Verified:
  - berkeley.edu/about: "The University of California was founded in 1868".
  - History page: 1873 move to Berkeley; the MCAP entry says "at a public university".
  - Regents page: Art. IX §9, "full powers of organization and governance".
  - Sky Lab: "the next chapter of data-intensive systems research at Berkeley", after AMPLab and RISELab; "run seamlessly on any or multiple clouds".
  - vLLM post: "Contributed by the University of California – Berkeley".
  - BFCL paper: all 7 authors carry affiliation 1, UC Berkeley.
  - HF org fullname: "Gorilla LLM (UC Berkeley)".
  - Gorilla LICENSE: Apache-2.0.
  - Arena blog of 27 May 2025: "We started as a research project under UC Berkeley / LMSys".

### carnegie-mellon-university: 3 wording/source fixes
- `summary`:
  - Before: "…Carnegie Technical Schools, founded by Andrew Carnegie in 1900…"
  - After: "…traces its origin to 1900, when Andrew Carnegie funded the Carnegie Technical Schools…"
  - Reason: the history page says "1900: Initial Funding for Carnegie Technical Schools" (first class admitted 1906). It does not say "founded".
- `notable_facts[0]`:
  - Before: "Its research page lists MLC LLM, XGrammar, FlexFlow, Mirage, and TVM."
  - After: "Its homepage lists research projects including machine learning compilation for large language models (MLC LLM), XGrammar, FlexFlow, Mirage, and Apache TVM."
  - Reason: the cited page is catalyst.cs.cmu.edu (the homepage). It lists "Machine Learning Compilation for Large Language Models", which links to /projects/mlc-llm.html.
- `sources.cmu-history.url`: `/about/history.html` → `/about/history` (redirect target).
- `sources.mlc-home.title` → "MLC - A Community of Machine Learning Compilers" (the page title as published).
- Verified:
  - IRS eo_pa row (EIN 25-0969449): Pittsburgh, subsection 03, foundation 11.
  - About page footer: "5000 Forbes Avenue Pittsburgh, PA 15213".
  - 1967 merger with the Mellon Institute.
  - MLC blog 2023-05-08: "initiated by members from CMU catalyst, UW SAMPL, SJTU, OctoML and the MLC community".
  - mlc.ai supporter logos: NSF, CMU, Catalyst, Purdue, NVIDIA, Amazon, Google.
- Not changed: history also documents CMU-Qatar and a Silicon Valley campus. `other_locations` is left empty; adding them is optional.

### princeton-university: 1 fix
- `notable_facts[1]`:
  - Before: "The Hugging Face organization of the Princeton NLP group hosts the original SWE-bench datasets…"
  - After: "The Princeton NLP group's Hugging Face account (princeton-nlp) hosts the original SWE-bench datasets…", plus a sentence that the repository, now in a standalone SWE-bench GitHub organization, links current copies under a separate SWE-bench HF organization.
  - Reason: the HF API shows `princeton-nlp` is a user account (fullname "Princeton NLP group"), not an organization. The SWE-bench README's Downloads table now links `SWE-bench/SWE-bench`, `SWE-bench/SWE-bench_Lite`, `_Verified` and `_Multimodal`.
  - Added source `swe-bench-readme`.
- Verified:
  - IRS eo_nj row (EIN 21-0634501): "PRINCETON UNIVERSITY", Princeton NJ, subsection 03, foundation 11, organization 1 (corporation).
  - SWE-bench paper v3 affiliations: Princeton University, Princeton Language and Intelligence, and one University of Chicago co-author.
- Could not verify: princeton.edu still returns HTTP 403 (www, pli). `founded` and `legal_name` stay null.

### new-york-university: source replaced (original page blocked)
- `https://www.nyu.edu/about.html` returned **HTTP 403** to curl and WebFetch today, as did other www.nyu.edu subpages. I could not confirm "main campus in Manhattan".
- Replaced source `nyu-about` with `nyu-bulletin` (https://bulletins.nyu.edu/nyu/, "New York University | NYU Bulletins", fetched). It says:
  - "Since its founding in 1831"
  - "research universities"
  - "Anchored in New York City and with degree-granting campuses in Abu Dhabi and Shanghai"
  - "among the largest private universities in the US"
- Changes:
  - `summary`:
    - Before: "…founded in 1831, with its main campus in Manhattan, New York City, and degree-granting campuses in Abu Dhabi and Shanghai."
    - After: "…founded in 1831. It is anchored in New York City and has degree-granting campuses in Abu Dhabi and Shanghai."
  - `eligibility.explanation`: "whose main campus is in Manhattan" → "anchored in New York City"; "its campuses" → "its degree-granting campuses".
  - `headquarters`, `other_locations[0..1]`, `founded`, `summary` and `eligibility` sources: `nyu-about` → `nyu-bulletin`.
- Verified:
  - IRS eo_ny row (EIN 13-5562308): subsection 03, foundation 11, organization 5 (association).
  - GPQA paper affiliations: all NYU; two also list Cohere or Anthropic, PBC.
  - NYU ARG homepage wording and related groups.

### lmsys: 3 fixes
- `legal_name.source_ids`: `[irs-eo-bmf-ca]` → `[lmsys-about, irs-eo-bmf-ca]`. The about page now reads "Large Model Systems (LMSYS Corp.) is a 501(c)(3) non-profit…".
- `eligibility.explanation`:
  - Before: "…This record matches the two by name and date; no LMSYS page states its legal name or a headquarters address…"
  - After: the about page names the organization "Large Model Systems (LMSYS Corp.)"; no LMSYS page states a headquarters address.
  - Reason: the legal-name claim was contradicted by the current about page.
- `notable_facts[1]`:
  - Before: "An LMSYS blog post from July 2026 describes RadixArk…"
  - After: "A July 2026 post on the LMSYS blog, credited to RadixArk and Google, states that RadixArk… is a maintainer of the SGLang project."
  - Reason: the post is bylined "RadixArk & Google". The sentence "RadixArk is a maintainer of the SGLang project" is verbatim from it.
- `sources.arena-about`: URL and title updated as in uc-berkeley.
- Verified:
  - IRS eo_ca row: "LMSYS CORP", EIN 99-4817542, 2108 N St Ste N, Sacramento; subsection 03; ruling 202409; foundation 16 (509(a)(2)); organization 1 (corporation); NTEE U41.
  - Donations page: "LMSYS is a 501(c)(3) public charity".
  - About page:
    - "originated from a multi-university collaboration involving UC Berkeley, Stanford, UCSD, CMU, and MBZUAI in 2023"
    - "incorporated as a non-profit in September 2024"
    - "Chatbot Arena (graduated)"
  - Homepage lists SGLang, FastChat, Vicuna and RouteLLM.
  - 2024-09-20 blog: Arena "graduate[s]", LMSys "will continue to serve as an incubator".
  - The Arena/LMArena separation is supported as written.
  - `headquarters` stays null: the Sacramento address is only in the IRS file.

### arc-prize-foundation: legal_form corrected, product and fact wording narrowed
- **What the sources show about status.** I re-extracted the Form 990 XML (object 202523119349301902) from `2025_TEOS_XML_11C.zip` by HTTP range request. `index_2025.csv` lists EIN 992781492, "ARC PRIZE FOUNDATION", tax period 202412, batch 11C.
  - Return: period 2024-04-26 to 2024-12-31, filed 2025-11-07; initial return.
  - `Organization501c3Ind` = X; corporation; FormationYr 2024; LegalDomicileStateCd DE; address 548 Market St PMB 83849, San Francisco CA.
  - **Schedule A:** Part I `PublicOrganization170Ind` = X (170(b)(1)(A)(vi)). In Part II, **no** first-five-years box and **no** support-test box are checked, and `PrivateFoundation170Ind` = X. That is line 18, "Private foundation. If the organization did not check a box on line 13, 16a, 16b, 17a, or 17b, check this box…" per the 2024 Schedule A form, which I fetched.
  - The organization is absent from IRS eo_ca.csv (and from DE, NY, MA, TX, WA, PA, NJ and DC extracts searched by EIN and name) and from Pub 78 data (data-download-pub78.txt).
  - ProPublica: "not listed in the IRS's most recent list of tax exempt organizations".
  - Site: "nonprofit"; "Donations are tax-deductible". No page states "501(c)(3)".
  - Terms (last updated June 03, 2024): "ARC Prize, Inc.… a company registered in California… 548 Market Street, #83849". Privacy policy (June 11, 2024) and site footer: "© 2026 ARC Prize, Inc".
- Changes:
  - `legal_form.text`:
    - Before: "…that reports Section 501(c)(3) status and public-charity status on its Form 990 for tax year 2024…"
    - After: states the short tax year, that the return checks 501(c)(3), and that Schedule A checks the 170(b)(1)(A)(vi) category in Part I but checks line 18 "Private foundation" in Part II (no first-five-years or support-test box). Keeps the IRS listing and ProPublica caveats.
    - Reason: "public-charity status" was only half of what the return shows.
    - Added source `irs-f990-schedule-a-2024` (https://www.irs.gov/pub/irs-prior/f990sa--2024.pdf).
    - No dollar amounts are recorded.
  - `products[arc-prize-verified].access`:
    - Before: "Testing of selected publicly available models…"
    - After: "Testing of models from open-source and commercial providers selected at ARC Prize's discretion…"
    - Reason: the policy says "We collaborate with selected (at our discretion) open-source and commercial model providers". It publishes results after a model "is publicly released", so it does not limit testing to publicly available models.
  - `notable_facts[2]`: "lists ARC Prize Foundation as the authors' affiliation" → "is credited to ARC Prize Foundation as its author". The arXiv author field is "ARC Prize Foundation".
- Eligibility unchanged (`us-nonprofit-or-lab`). A 501(c)(3) private foundation would still be a U.S. nonprofit, and the U.S. location is documented by the 990 and the terms. The HQ address is a private mailbox (PMB); an editor may prefer `us-headquarters`.
- Verified:
  - NIST CAISI statement is recorded as the site's statement only.
  - Competition page: Kaggle submissions, no internet access, open-source requirement.
  - Toolkit: MIT, "Copyright (c) 2026 ARC Prize 2026 ARC Prize Foundation"; optional `ARC_API_KEY` "will give you access to more games".
  - ARC-AGI-2 LICENSE: Apache-2.0, "Copyright 2019 ARC Prize Foundation".
  - Launch posts dated 2025-03-24 and 2026-03-25.
  - Jobs page resolves.

---

## Artifacts

### helm: 3 fixes (maintenance-mode wording checked against the policy text)
- `checklist.tasks_data.status`: `public` → `partial`.
  - Note adds that the reproduction guide divides MedHELM benchmarks into public, gated ("require credentials or approval", e.g. PhysioNet) and private ones.
  - Added `helm-reproducing` to its sources.
- `checklist.limitations.note`:
  - Before: "…The reproduction guide does not discuss caveats such as changes to hosted model APIs."
  - After: the maintenance-mode policy "warns that scenarios and models that depend on external APIs may break without active support".
  - Reason: the policy says so explicitly, so the old note was misleading. Dropped `helm-reproducing` from this item.
- `run_notes[1]`:
  - Before: "volunteer maintainers fix significant bugs on a best-effort basis… alternatives including Inspect AI Evals, Lighteval, and the LM Evaluation Harness."
  - After: HELM is maintained by volunteers on a best-effort basis and significant issues "may be addressed when maintainer bandwidth is available". It lists all five alternatives: Evalchemy, Inspect AI Evals, Lighteval, EleutherAI's LM Evaluation Harness, and Unitxt.
  - Source: docs/maintenance_mode.md (raw), which says "HELM entered maintenance mode on June 1, 2026".
- Verified:
  - LICENSE: Apache-2.0, "Copyright 2022 Stanford University".
  - PyPI crfm-helm 0.5.16 uploaded 2026-04-30; author "Stanford CRFM"; Python >=3.10.
  - Raw-results bucket `crfm-helm-public` "allows public unauthenticated access".
  - Paper: 7 metrics; the TMLR 2023 abstract notes "what's missing or underrepresented".

### dspy: verified, no changes
- LICENSE: MIT, "Stanford Future Data Systems".
- GitHub org "Stanford NLP", location "Stanford, CA".
- dspy.ai/current: "DSPy started at Stanford NLP and grew into a research community".
- PyPI 3.4.0 uploaded 2026-09-25; requires `<3.15,>=3.10`.
- Release page 3.4.0 dated 25 Sep.

### sglang: 4 fixes (LMSYS hosting and RadixArk role checked)
- `maintainers[1].name`: "RadixArk (company described by LMSYS as a maintainer)" → "RadixArk (company described as a maintainer in a post on the LMSYS blog)". Reason: the post is credited to "RadixArk & Google".
- `eligibility.explanation`: "An LMSYS blog post also describes…" → "A July 2026 post on the LMSYS blog, credited to RadixArk and Google, also describes…". Same reason.
- Install doc URL, in `links` and `sources.sglang-install`: `/get_started/install.html` → `https://docs.sglang.io/docs/get-started/install` (redirect target). The content supports the claims: Python 3.10+; "SGLang requires CUDA 13"; "SGLang 0.5.19 is the last release with a CUDA 12 lane"; methods 1–7; platform pages.
- `sources.pytorch-sglang.published_at`: null → `2025-03-19`, as shown on the post.
- Verified:
  - README: "SGLang is currently hosted under the non-profit open-source organization LMSYS".
  - LICENSE: Apache-2.0, "Copyright 2023-2024 SGLang Team".
  - PyPI 0.5.20 uploaded 2026-09-18; releases Atom lists v0.5.20.
  - The PyTorch post is an ecosystem announcement. The foundation's hosted-projects menu (PyTorch, ExecuTorch, vLLM, DeepSpeed, Ray, Helion, Safetensors) does not include SGLang.
  - RadixArk site: "we build on SGLang… We will continue investing in SGLang". RadixArk's location is still not verified; eligibility does not rest on it.

### mlc-llm: stays draft; 3 fixes
- `checklist.release_status.note`:
  - Before: "…no stable versioned release was found in the pages read."
  - After: nightly pre-release builds in the install guide. The repository's tags include v0.20.0 (July 7, 2026), whose commit message describes it as a stable release; the install guide documents no packaged stable release.
  - Reason: github.com/mlc-ai/mlc-llm/tags shows "v0.20.0 … mlc-llm v0.20.0 stable (last monolithic-era release; aligns with mlc-ai 0.20.0) Jul 7, 2026". The researcher's note that the API shows only v0.1.dev0 was incorrect.
  - Added source `mlc-tags`. Status stays `partial`.
- `availability.access_conditions` and `checklist.installation.note`:
  - Before: conda was presented as an install method.
  - After: conda is the recommended environment for the nightly pip wheels; building from source is the other method.
  - Source: install page ("We provide nightly built pip wheels…"; "highly recommended to use conda").
- `sources.mlc-home.title` → "MLC - A Community of Machine Learning Compilers".
- Eligibility left `pending_review`; the explanation is accurate.

### swe-bench: eligibility → pending_review / undetermined / draft (standalone-org move)
- **Evidence read today:**
  - `github.com/princeton-nlp/SWE-bench` returns 301 to `SWE-bench/SWE-bench`.
  - The SWE-bench GitHub org lists no location (website swebench.com only).
  - The README Downloads table links datasets under the **SWE-bench** HF organization. The older `princeton-nlp/*` copies still exist (last modified March 2025); `princeton-nlp` is a user account, not an organization.
  - PyPI `swebench` 5.0.2: author "SWE-bench team".
  - LICENSE: MIT, copyright held by the seven individual authors.
  - swebench.com and the docs contain no institutional statement (no "Princeton" or "Stanford" in the 2.4 MB homepage HTML).
  - The only Princeton/Stanford references are individual contact emails and a badge linking Princeton's copyright policy, which returns 403. Neither can support eligibility.
- **Reasoning:** ELIGIBILITY.md requires the documented *governing or maintaining* entity to be U.S.-based. The Princeton origin is documented; a current maintaining institution is not.
  - This matches how the catalog treats llama.cpp (A1), DCLM ("DCLM team"/mlfoundations) and GPQA.
  - It differs from BFCL, which has current institutional hosting (gorilla.cs.berkeley.edu, HF org "Gorilla LLM (UC Berkeley)"), and from Terminal-Bench ("Hosted by Stanford / Harbor / Laude Institute" on every page).
  - The original researcher flagged this as the stricter reading.
- **Changes:**
  - `eligibility.status`: eligible → pending_review.
  - `eligibility.basis`: us-governed-project → undetermined.
  - `eligibility.explanation`: rewritten to state exactly what is and is not documented.
  - `eligibility.source_ids`: dropped `irs-eo-bmf-nj`; kept `swe-bench-paper`, `princeton-nlp-hf`, `swe-bench-hf` and `swe-bench-license`; added `swe-bench-repo`, `swe-bench-readme` and `swe-bench-pypi`.
  - `publication_status`: published → draft.
  - `maintainers[0].name`: "Princeton University (Princeton NLP group and Princeton Language and Intelligence)" → "Princeton University (original authors; Princeton NLP group account hosts the original datasets)".
  - Removed the now-uncited source `irs-eo-bmf-nj`.
- **Editor follow-up:** add SWE-bench to CONTENT_REVIEW.md. I did not edit that file because it is outside this batch. To restore publication, an editor would need to accept Princeton origin plus legacy dataset hosting as sufficient.
- Other content verified:
  - 2,294 instances / 12 repos (HF card).
  - Verified set: 500 human-validated (card).
  - Paper limitations: "task instances are all in Python"; execution-based testing is "insufficient to guarantee reliable performance".
  - README: 120 GB / 16 GB / 8 cores; arm64 experimental; run_id caching.
  - PyPI 5.0.2 uploaded 2026-08-18.

### gpqa: verified, no changes (stays draft)
- Paper v1 (2023-11-20): 448 questions; all authors NYU, one also Cohere, one also Anthropic, PBC. The Limitations section matches the note.
- LICENSE: MIT, held by an individual.
- HF (individual account): CC-BY-4.0; gate is `auto`; terms ask users not to reveal examples; configs gpqa_main, gpqa_diamond, gpqa_extended, gpqa_experts.
- README: canary string; only two OpenAI models implemented; baseline commands.
- NYU ARG post dated May 15, 2024.
- The password and examples were not reproduced.

### berkeley-function-calling-leaderboard: verified, no changes (BFCL under an individual account)
- The code is in `ShishirPatil/gorilla` (an individual account), as the record discloses. Institutional hosting is documented:
  - Leaderboard at gorilla.cs.berkeley.edu ("Last Updated: 2026-04-12"; evaluated at commit f7cf735; "All the model response we obtained is available here"; cost in USD and latency in seconds).
  - HF org "Gorilla LLM (UC Berkeley)", Apache-2.0 tag, "Latest Version Release Date: 09/22/2024", `load_dataset` warning.
  - PMLR paper: all authors UC Berkeley.
- PyPI bfcl-eval 2026.3.23 uploaded 2026-03-23.
- README: bfcl-eval vs unrelated bfcl; BFCL_PROJECT_ROOT; SerpAPI; vllm/sglang backends.

### humaneval: verified, no changes
- LICENSE: "Copyright (c) OpenAI".
- README: Python 3.7; execution call deliberately commented out; malloc known issue; pass@k not computed when there are fewer samples than k.
- Commits Atom: last commits 2025-01-17 ("fix broken eval"); the rest from 2021.
- HF card: MIT; 164 problems; published on GitHub, so likely in future dumps; not gated.
- Paper v1 7 Jul 2021: unbiased pass@k estimator; 164 hand-written problems.
- SEC exhibit: "OpenAI Group PBC, a Delaware public benefit corporation", 1455 3rd Street, San Francisco, dated February 27, 2026.

### openai-evals: 2 fixes (maintenance status checked)
- `license_notes.text`:
  - Before: "…CC BY-NC 4.0 for some components of the text-compression and steganography evals".
  - After: "…for some components of the steganography and theory-of-mind evals, CC BY-NC 4.0".
  - Reason: LICENSE.md lists CC BY-NC 4.0 under Steganography and Theory of Mind. Text Compression components are ODC-By, CC0, CC BY-SA/GFDL, MIT and CC BY 4.0.
- `summary`: "activity has been limited to maintenance since 2024" → "activity since mid-2024 has been limited to maintenance". Reason: commits in April and July 2024 still added content (Release 3.0.x, "Add IMO problems"). Later commits are maintenance.
- Verified:
  - Not archived.
  - README points to hosted Evals in the dashboard; "Minimum Required Version: Python 3.9"; "we are currently not accepting evals with custom code"; the contributor MIT/data-use disclaimer.
  - PyPI 3.0.1.post1 uploaded 2024-05-01; first upload 0.1.1 on 2023-03-14.
  - Commits: Dec 2024 README, Nov 2025 incontext_rl removal, Apr 2026 pinning.
  - run-evals.md: 10 threads / 40 s; no mid-eval resume.

### nemotron-cc: access corrected to partial; provenance and license wording narrowed
- **Gating.** The HF API returns `"gated": "manual"` for both `nvidia/Nemotron-CC-v2` and `nvidia/Nemotron-CC-v2.1`. Required fields: Company, Institutional Email, and "I agree to use this dataset for model training purposes ONLY". Hugging Face's gated-datasets docs say that in manual mode "the requests have to be approved manually by the authors". The researcher's assumption of automatic access was wrong.
  - `availability.status`: public → **partial**. `access_conditions` now states the fields and the manual approval.
  - `checklist.access.status`: public → **partial**, with a matching note.
  - Added sources `ncc-v2-hub-api`, `ncc-v21-hub-api` and `hf-gated-docs`.
- **Generator models.** Both HF cards are combined "collection" cards.
  - `provenance.text` previously said the v2 card lists DeepSeek models and the v2.1 card lists gpt-oss-120b among Nemotron-CC generators.
  - The per-dataset tables show: Nemotron-CC-v2 used Mistral-Nemo-12B-Instruct and Qwen3-30B-A3B; the Nemotron-CC-v2.1 subsets used Qwen3-30B-A3B.
  - DeepSeek, gpt-oss and Phi-4 appear for other datasets in the collection.
  - The text now says exactly this, and adds that the v2.1 STEM QA subset was built from Essential-Web documents (v2.1 card).
- `license_notes.text`:
  - Before: "The v2 card adds that models trained on the data may be subject to… Qwen and DeepSeek…, because those models generated parts of it."
  - After: the v2 card lists the collection's generator models and states the Qwen/DeepSeek condition; the v2.1 card also names the Phi-4 license agreement.
  - Added `ncc-v21-card`.
- `eligibility.explanation`: "the v2 and v2.1 dataset cards name NVIDIA as dataset owner" → "the v2 card names NVIDIA as data developer, and the v2.1 card names NVIDIA Corporation as dataset owner", matching the card wording.
- Verified:
  - CC contrib page: 6.3T tokens, 4.4T + 1.9T; 10.4 TiB; CC-MAIN-2013-20 to 2024-30 (99 crawls); five quality buckets.
  - Paper v2: "We release the dataset… under the Common Crawl Terms of Use"; Mistral NeMo 12B instruct; the Limitations section matches the note.
  - NVIDIA research page "Published: December 03, 2024".
  - NVIDIA Data Agreement (v. August 15, 2025):
    - §2.1 "solely for the purpose of internal training"
    - §2.2.2 no distribution or sublicensing
    - §2.3.1 no rights in copyrighted material
    - §3.2.1 30 days' notice; §3.3 delete and destroy
    - §6.7 U.S. and Delaware law
  - Common Crawl ToU "LAST UPDATED: March 7, 2024"; "limited, non-assignable, non-transferable…"; Crawled Content "may be subject to separate terms".
  - NVIDIA 10-Q (quarter ended July 26, 2026): 2788 San Tomas Expressway, Santa Clara.

### slimpajama: 1 fix (stays archived; withdrawal re-confirmed)
- Re-confirmed:
  - `cerebras/SlimPajama-627B` and `-6B` return 401 with a 404 page.
  - The Cerebras HF org lists only 4 other datasets.
  - Model Zoo commit d76e028 "removing slimpaja dir (#93)", dated Tue 1 Sep 2026, removes 18 files with no explanation. The main-branch directory returns 404; the Release_2.10.0 README is readable.
  - Oumi docs: "The original cerebras/SlimPajama-627B repository has been removed from HuggingFace Hub."
- `availability.access_conditions`:
  - Before: "Users reported the repository unreachable from July 31, 2026…"
  - After: "A Hugging Face forum post dated August 1, 2026 reported the repository returning HTTP 404 (401 for anonymous API requests) on July 31, 2026…"
  - Reason: the forum post reports the outage on July 31. The same post says the page "now appears to load" on Aug 1, so "from July 31" overstated continuity.
- Verified:
  - Blog (Jun 09 2023): Apache 2.0; 49.6% of bytes removed; the low-length filter "applied to every corpora other than Books and GitHub"; 1.86%; 2.5 days on a 64-core CPU; 1.4 TB; Opentensor partnership; bias and risks text.
  - Model Zoo LICENSE: Apache-2.0.
  - Cerebras 10-Q (quarter ended June 30, 2026): Delaware; 1237 E. Arques Avenue, Sunnyvale.

### dclm: 1 fix (stays draft)
- `license_notes.text`:
  - Before: "The dataset card limits intended use to research in the context of the DCLM benchmark."
  - After: "Separately from the license, the dataset card states that DCLM-Baseline is intended for research use in the context of the DCLM benchmark."
  - Reason: the card's statement is an intended-use statement and recommendation, not a license term. The license is CC-BY-4.0.
- Verified:
  - Card: "Curated by: The DCLM Team", CC-by-4.0, 4T / 3B docs, 240T pool, out-of-scope use, limitations; not gated.
  - Paper v4 datasheet Q52: "The DCLM team will be responsible for maintaining these assets". CC-BY-4 plus the Common Crawl ToU. "none have had any special treatment for PII and sensitive content". 53 tasks. 412M–7B.
  - README: Sept 2025 CORE/EXTENDED fix; AWS credentials required but "should not incur costs"; JSONL and Parquet on HF.
  - LICENSE: MIT "mlfoundations".
  - HF created 2024-06-17; arXiv v1 17 Jun 2024.
  - Discrepancy: the README intro says "over 300T unfiltered tokens" and the record keeps 240T. The paper, card and project page all say 240T.

### bigcodebench: 2 fixes (stays draft)
- `checklist.limitations.note`:
  - Before: "…including Python- and English-only coverage, possible saturation, reliability and test-coverage concerns, and limited interaction complexity…"
  - After: the card "notes that tasks cover only English and Python, lists limitation areas (multilingualism, saturation, reliability, efficiency, rigorousness, generalization, evolution, and interaction), and refers to Appendix D".
  - Reason: the card gives headings only. "Test-coverage concerns" and "limited interaction complexity" were interpretations.
- `availability.access_conditions`: "archived and read-only, so no further changes are expected there" → "was archived on July 20, 2026 and is read-only". This removes the inference.
- Verified:
  - Repo banner: "archived by the owner on Jul 20, 2026".
  - LICENSE: Apache-2.0; HF card: apache-2.0, not gated, splits v0.1.0_hf through v0.1.4, 1,140 tasks, 7 domains, 77 + 62 = 139 libraries.
  - Hard subset: 148 (README).
  - PyPI 0.2.5 uploaded 2025-03-31; GitHub v0.2.5 released 11 Apr, marked "Pre-release".
  - BigCode mission: "all technical governance takes place within working groups and task forces"; ServiceNow and Hugging Face support.
  - arXiv v1 22 Jun 2024; README release date 2024-06-18.

### arc-agi: 3 fixes
- `summary`:
  - Before: "ARC-AGI-3… with no stated rules or goals. …the semi-private and private evaluation sets of ARC-AGI-1 and -2… are held back."
  - After: "…environments in which agents must explore and infer goals without explicit instructions. …semi-private and private evaluation sets used for official scoring are held back."
  - Reason: the technical report abstract ("explore, infer goals… without explicit instructions"). The ARC-AGI-3 page lists "Clear goals + meaningful feedback" as a design principle, so "no stated… goals" was too strong. The testing policy shows ARC-AGI-3 also has a semi-private set.
  - Added `arc-policy`.
- `availability.access_conditions` and `checklist.tasks_data.note`: add ARC-AGI-3's semi-private set to the withheld sets. Source: arc-policy, "ARC-AGI-3 - The public demo is harder than the Semi-Private set".
- `eligibility.explanation`: "is the affiliation on the ARC-AGI-3 technical report" → "is credited as the author of…".
- Verified:
  - ARC-AGI-1: 400/400 tasks; semi-private and private 100 each; README 3-trial rule and leak warning; LICENSE Apache-2.0.
  - ARC-AGI-2: 1,000 training / 120 public eval; semi-private and private 120 each; calibration.
  - arcprize GitHub org: location "United States of America".
  - Series page: 2019 introduction.
  - Toolkit: MIT; optional API key.
  - No license was found for the ARC-AGI-3 game environments; the record already says so.

### terminal-bench: verified, no changes (hosts confirmed)
- tbench.ai home, news index and the 4.0 post all carry "Hosted by Stanford / Harbor / Laude Institute". The home footer links cs.stanford.edu.
- News index dates: 2025-05-19 launch; 2.0 on 2025-11-07; 2.1 on 2026-05-06; 3.0 and "Continuous Benchmarks" on 2026-07-30; 4.0 on 2026-08-28.
- 4.0 post: 8-hour flat timeout; 8 tasks removed; semantic versioning; `terminal-bench@4.0.0` on the Harbor Hub.
- README: continuous benchmark, tagged releases on the Harbor Hub, oracle 5x, Modal in CI/CD. LICENSE: Apache-2.0.
- Paper v1 (17 Jan 2026):
  - Affiliations 1 = Stanford University, 2 = Laude Institute.
  - 89 tasks.
  - Claude Code, Codex CLI, OpenHands, Terminus 2.
  - "System Administration" category.
  - Limitations: internet access / oracle, canary, private test set out of scope.
  - Pinned versions and prebuilt images.
- IRS eo_ca: LAUDE INSTITUTE, San Francisco, 501(c)(3), ruling 202601.
- Laude "Hello, world" (June 23, 2025): "a nonprofit with a public benefit corporation operating arm".
- Harbor site: "from the makers of terminal-bench"; harbor-framework GitHub location "United States of America".

---

## Could not verify / editor follow-up
1. **nyu.edu** (about.html and other www subpages) returned 403 today. NYU facts now rest on bulletins.nyu.edu; "Manhattan" was dropped.
2. **princeton.edu** still returns 403. Princeton `founded` and `legal_name` stay null, and PLI could not be described from its own site.
3. **SWE-bench** was moved to draft/pending_review. It should be added to CONTENT_REVIEW.md, which is outside this batch.
4. **vllm.yml** (outside batch) cites the PyTorch vLLM post as 2025-05-06; the page shows May 7, 2025.
5. **ARC Prize Foundation:**
   - The relationship between "ARC Prize, Inc." (terms, privacy, site footer) and "ARC Prize Foundation" (990) is still undocumented.
   - The Schedule A line-18 box and the absence from IRS listings are recorded as fact without interpretation.
   - An editor may prefer basis `us-headquarters`, since the address is a PMB.
6. **RadixArk**'s location is not verified. The BusinessWire release was not fetched; eligibility of SGLang does not depend on it.
7. The **GitHub API** was rate-limited. Release, tag and commit facts were checked through Atom feeds and HTML pages instead.
