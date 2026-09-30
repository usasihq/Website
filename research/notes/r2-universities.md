# r2-universities research notes

Researcher group: r2-universities. Reviewed 2026-09-29.
Assigned orgs: stanford-university, uc-berkeley, carnegie-mellon-university, princeton-university,
new-york-university, lmsys.
Assigned artifacts: helm, dspy, sglang, mlc-llm, swe-bench, gpqa, berkeley-function-calling-leaderboard.

Validation: `npx tsx scripts/validate.ts` reports no errors or warnings in any of the files below.
The 4 remaining errors are in other groups' files (arc-agi, pythia, pythia-12b, slimpajama).

## Files created

| File | Status | Eligibility |
| --- | --- | --- |
| content/organizations/stanford-university.yml | published | eligible, us-nonprofit-or-lab |
| content/organizations/uc-berkeley.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| content/organizations/carnegie-mellon-university.yml | published | eligible, us-nonprofit-or-lab |
| content/organizations/princeton-university.yml | published | eligible, us-nonprofit-or-lab |
| content/organizations/new-york-university.yml | published | eligible, us-nonprofit-or-lab |
| content/organizations/lmsys.yml | published | eligible, us-nonprofit-or-lab |
| content/artifacts/helm.yml (eval) | published | eligible, us-governed-project |
| content/artifacts/dspy.yml (framework) | published | eligible, us-governed-project |
| content/artifacts/sglang.yml (runtime) | published | eligible, us-governed-project |
| content/artifacts/swe-bench.yml (eval) | published | eligible, us-governed-project (judgment call, see below) |
| content/artifacts/berkeley-function-calling-leaderboard.yml (eval) | published | eligible, us-governed-project (judgment call, see below) |
| content/artifacts/mlc-llm.yml (runtime) | **draft** | pending_review, undetermined |
| content/artifacts/gpqa.yml (eval) | **draft** | pending_review, undetermined |

No person records were created. Where READMEs or PyPI pages name individual maintainers or give
personal email addresses, I left those out of the records.

## Organizations

### Stanford University (`stanford-university`): published
- Evidence:
  - The IRS CA extract (EIN 94-1156365) lists "The Board of Trustees of the Leland Stanford Junior University" in Stanford, CA, as 501(c)(3), foundation code 11 (school), organization type 2 (trust).
  - facts.stanford.edu: founded 1885, first students 1891, Stanford, CA 94305.
- Labs recorded in notable_facts:
  - CRFM, an initiative at Stanford HAI, which maintains HELM.
  - The Stanford NLP Group, which lists DSPy as its software.
  - Stanford's part in the 2023 LMSYS collaboration.
- Gap: no official page I read uses the word "private". The summary therefore says "a university", and ownership rests on the IRS 501(c)(3) listing.

### University of California, Berkeley (`uc-berkeley`): published
- ownership_category is `public-institution` and legal_name is null. UC Berkeley is a campus, not a separate legal entity; the legal body is The Regents of the University of California. The Regents page cites Art. IX §9 of the California Constitution.
- Founding: berkeley.edu/about says the University of California was founded in 1868. The history page says the university moved to Berkeley in 1873 and uses the phrase "at a public university".
- notable_facts:
  - UC Berkeley contributed vLLM to the PyTorch Foundation (May 2025).
  - The Sky Computing Lab follows AMPLab and RISELab.
  - BFCL: all paper authors are from UC Berkeley; the leaderboard is on gorilla.cs.berkeley.edu; the HF org is "Gorilla LLM (UC Berkeley)".
  - LMSYS/Chatbot Arena origins, and that Arena is now operated by Arena Intelligence Inc.
- The existing `vllm.yml` does not list `uc-berkeley` in organization_slugs. I did not edit it because it is outside my assignment. An editor may want to add the relationship.
- Gap: the Sky Computing Lab homepage no longer lists vLLM as a lab project. I did not claim that vLLM came from Sky Lab, only that UC Berkeley contributed it.

### Carnegie Mellon University (`carnegie-mellon-university`): published
- Evidence:
  - IRS PA extract (EIN 25-0969449): 501(c)(3), school status, Pittsburgh.
  - About page: 5000 Forbes Ave.
  - History page: founded in 1900 as the Carnegie Technical Schools; merged with the Mellon Institute in 1967.
- notable_facts:
  - Catalyst lists MLC LLM, XGrammar, FlexFlow, Mirage, and TVM.
  - The MLC LLM initiators included CMU Catalyst.
  - CMU took part in the 2023 LMSYS collaboration.

### Princeton University (`princeton-university`): published
- Evidence: IRS NJ extract, EIN 21-0634501, "PRINCETON UNIVERSITY", Princeton NJ, 501(c)(3), school status, corporation.
- **Gap: princeton.edu returned HTTP 403 to every fetch attempt** (www, profile, pli, princetoniana, copyright; pr.princeton.edu closed the socket). As a result:
  - `founded` is null. The university's own pages give 1746, but I could not fetch them.
  - `legal_name` is null. The corporate name is believed to be "The Trustees of Princeton University", and IRS subordinate listings use "Trustees of Princeton University", but no official page was read.
  - I could not describe Princeton Language and Intelligence (PLI) from its own site. It appears only as a paper affiliation.

### New York University (`new-york-university`): published
- Evidence:
  - IRS NY extract, EIN 13-5562308: 501(c)(3), school status, association.
  - The about page says "private research university", founded 1831, with degree-granting campuses in Abu Dhabi and Shanghai. These campuses are recorded as other_locations (AE, CN) and noted in the eligibility explanation.
- notable_facts: GPQA's NYU authorship, and the NYU Alignment Research Group.
- NYU has no published artifact in this batch because GPQA is a draft.

### LMSYS (`lmsys`): published. What LMSYS is today, precisely:
- **A U.S. 501(c)(3) nonprofit.** lmsys.org/about says it is "a 501(c)(3) non-profit focused on incubating open-source projects and research", "incorporated as a non-profit in September 2024".
- It "originated from a multi-university collaboration involving UC Berkeley, Stanford, UCSD, CMU, and MBZUAI in 2023". MBZUAI is in the UAE; that is history, not current governance.
- IRS CA extract: **LMSYS CORP**, EIN 99-4817542, Sacramento, CA, subsection 03, ruling 2024-09, corporation, NTEE U41.
  - I matched it to LMSYS Org by name and ruling date. No LMSYS page gives a legal name or an address, so `headquarters` is null.
  - The Sacramento street address appears to be a registered-agent-style address. I did not record it as headquarters.
- **LMArena/Arena is a separate company, not part of LMSYS.**
  - LMSYS's Sept 20, 2024 blog: Chatbot Arena "graduated" to its own site (lmarena.ai) and "will remain a close partner"; LMSYS continues as an incubator.
  - arena.ai/about: "In 2025, we formed Arena Intelligence Inc."; Arena (formerly LMArena) was created by researchers from UC Berkeley.
  - The May 27, 2025 Arena post: "We started as a research project under UC Berkeley / LMSys".
  - lmarena.ai/about now 301-redirects to arena.ai/about.
  - This is recorded in `status_note`. No Arena org record was created because it is not assigned.
- No products were recorded. The projects (SGLang, FastChat, Vicuna, RouteLLM) are artifacts, not hosted products.

## Artifacts

### HELM (`helm`): published
- Repo stanford-crfm/helm, Apache-2.0 (LICENSE file read). PyPI crfm-helm 0.5.16 (2026-04-30), author "Stanford CRFM".
- **Material change: HELM entered maintenance mode on June 1, 2026.**
  - Volunteer maintainers work on a best-effort basis.
  - No new features and no new leaderboard evaluations.
  - Suggested alternatives include Inspect AI Evals, Lighteval, and the LM Evaluation Harness.
  - This is recorded in the summary and run_notes.
- The limitations checklist item is `partial`: the paper's stated gaps plus the maintenance policy. The reproduction guide does not discuss caveats.

### DSPy (`dspy`): published
- Repo stanfordnlp/dspy (GitHub org "Stanford NLP", location Stanford, CA). MIT LICENSE: "Copyright (c) 2023 Stanford Future Data Systems".
- The nlp.stanford.edu homepage lists DSPy among the group's software. dspy.ai says it "started at Stanford NLP and grew into a research community".
- Release 3.4.0 (2026-09-25; GitHub release page and PyPI).
- Maintainers: PyPI lists three individual maintainers. A search snippet from the repo roadmap lists people with Stanford, Databricks, UC Berkeley, CMU, and other affiliations. I did not use individuals' affiliations. Eligibility rests on the Stanford NLP org hosting, the group's own listing, and the Stanford copyright line.
- Open question: whether DSPy has formal multi-organization governance (e.g. Databricks co-maintenance). No governance document was found.

### SGLang (`sglang`): published
- **Governing entity:** the README says "SGLang is currently hosted under the non-profit open-source organization LMSYS". LMSYS is a U.S. 501(c)(3) (see above).
- **RadixArk** is a company that the LMSYS blog (2026-07-30) calls "a maintainer of the SGLang project". Its site says it builds on SGLang and will keep investing in it.
  - It is listed as a second maintainer with organization_slug null.
  - Search results mention a May 2026 BusinessWire launch press release, but the fetch returned 403.
  - RadixArk's HQ was not verified. Eligibility does not rest on RadixArk.
  - If RadixArk ever becomes the governing entity (e.g. the repo moves), eligibility needs a fresh assessment.
- SGLang "joins PyTorch Ecosystem" (March 2025 per the README). This is ecosystem membership, **not** PyTorch Foundation hosting (unlike vLLM).
- Apache-2.0 (LICENSE: "Copyright 2023-2024 SGLang Team"). v0.5.20 released 2026-09-18 (PyPI).
  - The GitHub release page summary misreported the year as 2024; the PyPI page and GitHub API give 2026-09-18.
  - I verified the CUDA 13 requirement in the install doc source.

### MLC LLM (`mlc-llm`): **draft, pending_review**
- Apache-2.0 (LICENSE read). Repo mlc-ai/mlc-llm is active (commits dated 2026-09-29). Distribution is by nightly pre-release wheels; no stable versioned release was found (the GitHub API shows only v0.1.dev0 from 2023).
- Governance evidence:
  - README citation author: "MLC team"; docs footer: "© 2023-2025 MLC LLM".
  - mlc.ai: "An Open Community of ML Compilations". It lists supporting organizations NSF, CMU, Catalyst, Purdue, NVIDIA, Amazon, and Google.
  - CMU Catalyst lists MLC LLM as its research project.
  - The MLC blog (2023-05-08) and the WebLLM README say it was "initiated by members from CMU catalyst, UW SAMPL, SJTU, OctoML and the MLC community". SJTU is Shanghai Jiao Tong University.
- Reason for draft: the governing entity is a multi-institution community with no documented legal home, and a non-U.S. university was among the initiators. Per the assignment, it cannot be documented as U.S.-based.
- If an editor accepts CMU Catalyst's listing as the maintaining entity, the record could be published under us-governed-project. The text is otherwise complete.

### SWE-bench (`swe-bench`): published (judgment call)
- Evidence:
  - Paper (ICLR 2024, arXiv v3): affiliations Princeton University and Princeton Language and Intelligence, plus one co-author at the University of Chicago.
  - The original datasets and SWE-Llama models are under the HF org "princeton-nlp (Princeton NLP group)".
- The code repo was **transferred**: github.com/princeton-nlp/SWE-bench now 301-redirects to github.com/SWE-bench/SWE-bench, a standalone org.
  - The newer datasets are under an HF org named "SWE-bench".
  - The MIT LICENSE names the individual authors as copyright holders.
  - The README license badge links to Princeton's copyright policy page, which returned 403.
  - The README contact section lists individuals at Princeton and Stanford. I did not use this for eligibility.
- My call: eligible, based on the documented Princeton origin and dataset hosting, with every U.S. institution involved. The explanation states that the current GitHub org has no documented legal entity. **If the coordinator reads the policy more strictly, switch it to pending_review + draft**; the explanation already supports that.
- The dataset licenses are not stated on the HF cards read. MIT is recorded for code only.
- Version 5.0.2 (PyPI, 2026-08-18). SWE-bench Multimodal v2 (480 tasks) was fully open-sourced on 2026-09-01.

### GPQA (`gpqa`): **draft, pending_review**
- Evidence:
  - Paper (arXiv 2311.12022, COLM 2024): all authors list New York University; two also list Cohere or Anthropic, PBC.
  - The code repo is under an individual's personal GitHub account, and the MIT LICENSE names that individual.
  - The HF dataset (CC BY 4.0, gated with auto-approval, configs main/diamond/extended/experts) is under an individual's HF account.
  - The NYU Alignment Research Group blog has a 2024 post on GPQA's mistakes but does not present GPQA as a group project.
- Reason for draft: the artifact is maintained from individual accounts with no documented organizational maintainer, which falls under brief rule 3.
- The GPQA README publishes a password for its data archive, and the HF terms ask users not to reveal examples. I did not reproduce either the password or any examples.

### Berkeley Function Calling Leaderboard (`berkeley-function-calling-leaderboard`): published (judgment call)
- Evidence:
  - ICML 2025 paper (PMLR v267): all authors are affiliated with the University of California, Berkeley.
  - The leaderboard is at gorilla.cs.berkeley.edu (V4, last updated 2026-04-12).
  - The HF dataset org is named "Gorilla LLM (UC Berkeley)", with an Apache-2.0 license tag.
  - The code is in the Gorilla repo (Apache-2.0) under an **individual's GitHub account**.
  - PyPI bfcl-eval 2026.3.23 (2026-03-23).
- My call: eligible, because the project has institutional hosting on berkeley.edu and a UC Berkeley-labelled HF org, unlike GPQA. The personal-account code hosting is disclosed in the explanation.
- The limitations checklist item is `unknown`: no limitations section was found in the paper or README I read.
- The HF card was last updated for V3 (09/22/2024). V4 data is in the GitHub repo.

## Surprising or ambiguous items
1. **HELM maintenance mode (June 1, 2026).** It is no longer actively developed.
2. **LMSYS vs Arena.** LMSYS is a California-registered 501(c)(3) (per the IRS extract). Chatbot Arena is now run by a separate for-profit company, Arena Intelligence Inc. (formed 2025; brand "Arena", arena.ai). lmarena.ai redirects to arena.ai.
3. **RadixArk (2026)** is a company described by LMSYS as an SGLang maintainer, while the README still says LMSYS hosts SGLang. This should be watched for a governance change.
4. **SWE-bench moved** from the princeton-nlp GitHub org to a standalone SWE-bench org.
5. **princeton.edu blocks automated fetching** (403 on every subdomain tried except admission, cs, and the nlp pages).
6. Two remaining judgment calls on eligibility need a second look: SWE-bench (published) and BFCL (published). There are also two drafts: MLC LLM and GPQA.
