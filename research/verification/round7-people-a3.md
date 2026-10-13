# A3 fact-check (2026-10-13)

Every cited source in all 22 files was fetched today with plain curl (`-A "USASI-factcheck/0.3"`, unauthenticated) and checked against each statement. All 69 cited URLs returned 200. All `organization_slug` and `artifact_slug` values exist in ORG_SLUGS.txt / ARTIFACT_SLUGS.txt. No he/she pronouns, superlatives, counts or money remain. The Ai2 team directory was read in full (both pages, `/team` and `/team?o=100`; `?o=200` is empty).

## Per file

- **akshita-bhagia**: checked OK. The homepage and GitHub give the role as Senior Research Engineer (AllenNLP) at AI2, and the current Ai2 team page lists Bhagia. Co-author on the OLMo and Dolma author lists. The OLMo 2 and OLMoE contributions sections match.
- **alexander-wettig**: checked OK. The homepage gives a researcher role at Cursor (RL for Composer) and a past Princeton PhD advised by Danqi Chen, and confirms the SWE-bench and SWE-agent team role. The OLMoE contributions line matches, and Wettig is third author of SWE-bench. "Grew up" text on the homepage was correctly left out.
- **ali-farhadi**: corrected. The UW profile still says "serves as CEO" of Ai2, so I confirmed the past role from Ai2's own pages:
  - The Ai2 blog post of 2026-03-11 (allenai.org/blog/molmobot) quotes "Ali Farhadi, CEO of Ai2".
  - The Ai2 blog post of 2026-05-01 (allenai.org/blog/peter-clark-qa) is titled as a conversation with "Interim CEO Peter Clark", and Ai2's 2026-08-06 post also names Clark as Interim CEO.
  - `current: false` is therefore confirmed by official pages. Bio "has also served as CEO" → "previously served as CEO". Added both Ai2 pages as sources (`ai2-molmobot`, `ai2-clark-qa`) to the bio and the Ai2 affiliation. UW professor and RAIVN co-director roles are confirmed by the UW and lab pages. The OLMo 2 and OLMoE credits match.
- **aran-komatsuzaki**: corrected. The own site says "internship at Google Research in 2022".
  - Bio "2022 research internship" → "2022 internship".
  - Role "Research intern (2022)" → "Intern (2022)".
  - The GPT-J citation, Apache-2.0 weights, acknowledgment and Sparse Upcycling first authorship all check out.
- **ben-wang**: corrected; kept as draft.
  - The GitHub account kingoflolz is named "Ben Wang" and is the sole author in the Mesh Transformer JAX citation. It is also first author, with Komatsuzaki, in the GPT-J-6B citation.
  - The GPT-NeoX-20B Appendix A lists "Ben Wang" under Miscellaneous. No primary page states that this is the same person, so the identity link stays uncertain.
  - The EleutherAI "affiliation" was not a role at EleutherAI, since the paper gives no author affiliations. I replaced it with "Mesh Transformer JAX (GitHub project): author named in the citation entry (2021)", `current: false`.
  - Bio "wrote … model-parallel training" → "author named in the citation entry … model parallelism of transformers", which is the README's wording.
  - Added a repository source (`neox-commits`, github.com/EleutherAI/gpt-neox/commits/main/?author=kingoflolz). It shows kingoflolz authored a June 2021 merge commit in EleutherAI/gpt-neox, which ties the GitHub identity to the catalog artifact `gpt-neox`.
  - Kept `publication_status: draft` for the editor.
- **connor-leahy**: checked OK.
  - Conjecture's About page says Conjecture was founded in March 2022 by Leahy, Black and Alfour, and that EleutherAI was co-founded by Connor and Sid in 2020.
  - Leahy is the last author of The Pile (EleutherAI affiliation) and is credited with the NeoX-20B alignment-implications section. Leahy is also in the gpt-neox library citation (Apache-2.0).
  - The ConnorJL GitHub account has commits in EleutherAI repositories, so the identity is consistent.
- **dan-jurafsky**: checked OK. The homepage gives the Reynolds, Linguistics and CS professor titles and the research statement. CRFM lists Jurafsky as a faculty member. The SLP3 page shows the 2026-08-19 release, the new chapter 1 and the merged transformers/pretraining/decoding chapter.
- **david-wadden**: checked OK. The homepage gives the Google DeepMind (Gemini post-training) role and past AllenNLP and Semantic Scholar roles at Ai2. Wadden is a Tülu 2 co-author. OLMo 2 base-model development lists Wadden with an Ai2 affiliation, and OLMoE credits DCLM evaluations. Wadden is first author of SciFact-Open and MultiVerS.
- **dirk-groeneveld**: checked OK. Groeneveld is first author of OLMo. OLMo 2 lists Groeneveld with an Ai2 affiliation and credits base-model work. OLMoE credits stability and throughput advising, and Groeneveld is a Dolma co-author. Groeneveld is not on the current Ai2 directory, and no current role is documented, so `current: false` and `sector: null` are correct. The Hugging Face account dirkgr lists the OLMo 2 and OLMoE papers.
- **eric-mitchell**: checked OK. The homepage says Mitchell co-leads Post-training Frontiers at OpenAI with Yann Dubois (o1, o3, GPT-5-Thinking), and gives a Stanford PhD under Finn and Manning. Mitchell is a DPO co-author and first author of DetectGPT.
- **hannaneh-hajishirzi**: corrected.
  - The research-aims sentence ("establish the science of language modeling … retrieval-based language models") is not on any cited page. I replaced it with the research areas the homepage lists: large language models, reasoning and agents, open models and data, the science of AI and evaluation, and AI for science.
  - The Ai2 role's `current: false` was checked against official pages only:
    - The current Ai2 team directory, the newest official page, does not list Hajishirzi but does list Noah Smith, also a Senior Director.
    - The homepage (last modified Dec 2025), the June 2025 CV and the older UW profile still give Senior Director as current.
    - Ai2's media center calls Hajishirzi "Ai2's" as of March 2026.
  - No official page states that the role ended. Following brief rule 3 (when it is unclear, record a documented role as past), I kept `current: false`. The wording stays neutral ("has also served", headline "co-led"). The UW Torode Family Professor title and H2Lab role are confirmed. Hajishirzi is the last author of OLMo and Tülu 3, a Dolma co-author, and credited in OLMoE with overall direction.
- **ian-mckenzie**: checked OK. The Inverse Scaling paper (TMLR 10/2023) lists FAR AI and NYU. The robustness paper lists FAR.AI and marks McKenzie as an equal contributor with Howe. STACK lists FAR.AI. McKenzie is absent from the current far.ai/team page, which lists co-author Tom Tseng, so `current: false` fits.
- **jesse-dodge**: checked OK. The homepage gives a research scientist role in Meta Superintelligence Labs, Ai2 from 2019 to 2025, OLMo evaluation lead, and Playground research lead with OLMoTrace. Dodge is a co-author of both OLMo and Dolma.
- **kyle-lo**: corrected. Headline "senior author of the Dolma corpus paper" → "last-listed author of the Dolma paper", since the source shows only the author order. The rest is confirmed: the site's former Ai2 research scientist role and OLMo co-lead, the 2026-03-26 farewell, "something new", and GitHub "prev co-lead of Olmo". The Dolma, OLMo, OLMo 2 and OLMoE credits match. Personal details on the site were correctly left out.
- **leo-gao**: corrected. Bio "the open framework for evaluating language models" → "an open framework for few-shot evaluation of language models", which is the repository's description.
  - Gao is first author of The Pile with an EleutherAI affiliation, and first in the lm-evaluation-harness citation.
  - NeoX-20B credits Gao with evaluations, tokenizer work and alignment implications.
  - The leogao2 GitHub account pins EleutherAI's the-pile and lm-evaluation-harness repositories, so the identity is consistent.
- **noah-a-smith**: corrected. The bio and OLMo contribution said Smith "co-directs OLMo with Hanna Hajishirzi". That comes from the older UW profile. The newer homepage, which mentions a 2026 award and July 2026 papers, says Smith "directs the OLMo open language modeling effort". Changed to "directs", per the homepage. Confirmed:
  - the Vice Provost, Simonyi Chair and Professor roles;
  - Senior Director of NLP Research at Ai2, from the homepage and the UW page, and listed on the current Ai2 team page;
  - Smith's credits in the OLMo, Dolma, Tülu 3 and OLMoE papers.
- **oren-etzioni**: checked OK. The UW site gives Founding CEO of Ai2 from 2013 to late 2022, Professor Emeritus, the research areas, Open IE among the selected works, and Farecast acquired by Microsoft.
- **percy-liang**: checked OK.
  - The homepage gives Professor of CS (courtesy Statistics), says Liang created Marin with open development and public failed experiments, and links CS336. CRFM lists Liang as Director.
  - The CS336 Spring 2026 page names Liang and Hashimoto as instructors. Liang is first author of HELM, and the HELM README says CRFM created the framework.
  - The Marin README names CRFM and Open Athena as core collaborators (Apache-2.0). Together AI's team page lists "Percy Liang — Founder".
- **rishi-bommasani**: checked OK. The homepage and bio page give Senior Research Scholar at Stanford HAI (societal and economic impact of frontier AI) and a PhD advised by Liang and Jurafsky. Bommasani is second author of HELM and first author of the foundation-models report, and the abstract wording matches.
- **sid-black**: checked OK. Conjecture's history page confirms the co-founder roles. Black is first author of NeoX-20B, and Appendix A names Black lead developer and point person, with the credits listed. Black is third author of The Pile and appears in the gpt-neox library and lm-eval-harness citations.
- **tatsunori-hashimoto**: checked OK. The homepage gives assistant professor in Stanford CS and the robustness/statistics research. The Alpaca README says "All advised by Tatsunori B. Hashimoto", has a citation entry, Apache-2.0 code and CC BY NC 4.0 data and weight diff. Hashimoto is a HELM author, a CS336 Spring 2026 instructor and on the CRFM faculty list.
- **yejin-choi**: checked OK. The homepage Short Bio gives the Dieter Schwarz Foundation Professor and HAI Senior Fellow roles, the research focus, and the previous roles: NVIDIA Senior Research Director and Distinguished Research Scientist, UW Professor, and Ai2 Senior Director. "Choi, Yejin" is on the Nemotron 3 arXiv author list, and the homepage lists the paper.

## Totals

- Files checked: 22
- Checked OK, no change: 15
- Corrected: 7 (ali-farhadi, aran-komatsuzaki, ben-wang, hannaneh-hajishirzi, kyle-lo, leo-gao, noah-a-smith)
- Set to draft: 1 (ben-wang, kept as draft after correction)
- Deleted: 0
- Validator: `22 batch file(s): 0 error(s), 0 warning(s)`
