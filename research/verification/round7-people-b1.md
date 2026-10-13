# B1 fact-check (2026-10-13)

All 16 files in `people/` were checked against sources fetched today with curl (`-A "USASI-factcheck/0.3"`, no login). That covers 38 arXiv abstract pages, plus the PDFs where author marks or contributor lists mattered: LLaMA, OPT, Llama 3, Code Llama, Chameleon, Memorization, D4, CM3, Devstral, Ministral 3 and the Muse Spark report. It also covers Cohere/about, the McGill homepage, both Airbnb Newsroom posts, five ai.meta.com people pages, Mistral/about, the CMA CGM Kyutai launch post, Kyutai/team, Perceptron/about, five GitHub profiles, the Zhang and Roller homepages, and seven LICENSE files. The arXiv API was used to look for newer affiliations. Every catalog tie is documented: meta, llama, meta-muse, apple, openai, google, google-deepmind, character-ai and thinking-machines-lab. The profiles contain no pronouns, superlatives, popularity counts, money or personal details.

## Per file

- **joelle-pineau**: checked OK.
  - Cohere/about lists "Joelle Pineau, Chief AI Officer" on the executive team.
  - The McGill page gives the professorship, Mila, the part-time leave and VP AI research at Meta / FAIR (2017–2025). It also gives the reproducibility checklist and challenge, the inaugural NeurIPS Reproducibility Chair, and the AAAI and RSC fellowships.
  - The arXiv 2003.12206 author list confirms first authorship.
- **ahmad-al-dahle**: checked OK.
  - The Airbnb CTO post (2026-01-14) confirms every Meta and Apple statement.
  - The Airbnb post of 2026-09-23 still names Al-Dahle as CTO.
  - The Llama 3 PDF lists Al-Dahle under Core Contributors.
- **angela-fan**: checked; **kept as draft**.
  - Every paper claim is confirmed: Llama 2 author, Llama 3 core contributor, NLLB, fairseq, first author of the story-generation paper, and MIT license.
  - The Meta people page (FAIR, machine translation) lists Llama 2, which settles identity and the catalog tie.
  - No official page gives a current role. A Sep 2025 OpenAI/Apollo paper lists an "Angela Fan", but no primary source confirms it is the same person, so the Meta role stays `current: false`.
- **guillaume-lample**: checked OK.
  - mistral.ai/about lists "Co-founder and Chief Science Officer".
  - The GitHub bio reads "Research Scientist at Facebook AI Research…".
  - The LLaMA PDF marks Lample as one of five equal-contribution authors, with Meta AI as the affiliation.
  - The Mistral 7B and Mixtral abstracts confirm the Apache 2.0 release, and the UNMT, XLM and symbolic-math papers confirm first authorship.
- **edouard-grave**: **corrected**.
  - Bio sentence 1 changed from "Edouard Grave is a research scientist whose corporate research experience spans…" to "The November 2023 announcement of the Kyutai research lab describes Edouard Grave as a research scientist with experience in…". The reason: the only source is the 2023 CMA CGM launch post, so the description is attributed to it and not stated as current.
  - Everything else is confirmed: Kyutai/team lists Grave among alumni as Chief Language Officer, Grave is a LLaMA equal-contribution author, a co-author of both fastText papers, and a co-author of Moshi, and fastText is MIT-licensed.
  - A Sep 2026 arXiv paper (2609.15528) still lists a Kyutai affiliation. The official team page lists Grave as an alumnus, so the role stays `current: false`.
- **timothee-lacroix**: **corrected**.
  - "later Mistral AI papers including Devstral (2025)" changed to "listed among the authors of Devstral (2025), a paper from Mistral AI and All Hands AI". The work item was changed to match. The source is the Devstral PDF header, "Mistral AI × All Hands AI".
  - mistral.ai/about lists "Co-founder and CTO", and the LLaMA, CP-decomposition, Mistral 7B and Mixtral claims are confirmed.
- **baptiste-roziere**: **corrected**.
  - The Devstral and Ministral 3 wording now says Rozière is among the core contributors of Devstral (2025), a Mistral AI and All Hands AI paper, and among the contributors of Mistral AI's Ministral 3 (2026). Before, both were "Mistral AI's … papers". The sources are the contributor sections in the Devstral and Ministral 3 PDFs.
  - The Meta page confirms the code generation team, "contributed to Llama and started Code Llama".
  - The Code Llama PDF marks Rozière as first author and core contributor (†), the Llama 3 PDF lists Rozière as a core contributor, and the LLaMA and TransCoder author lists are confirmed.
  - `current: false` for Meta is consistent with Mistral papers through Jul 2026.
- **naman-goyal**: checked; **kept as draft**.
  - The OPT equal-contribution mark (∗), the Meta AI affiliation, LLaMA, Llama 2, Llama 3 core contributor, RoBERTa, Recipes and the metaseq MIT license are all confirmed.
  - There is no official profile, and the name is shared: a "Naman Goyal" appears on Gemini 2.5 and on unrelated 2026 papers. A news roundup reports a move to Thinking Machines Lab, but news is not a primary source. The current role is undocumented.
- **abhinav-jauhri**: checked; **kept as draft**.
  - Llama 3 Core Contributors list and the ⅔-runtime definition are confirmed. No official profile was found, and the current role is undocumented.
- **armen-aghajanyan**: checked OK.
  - The GitHub bio reads "co-founder @ perceptron.inc".
  - Perceptron/about says Aghajanyan led multimodal research at FAIR and that the company was started in November 2024.
  - CM3 (Facebook AI Research) confirms first authorship.
  - The Chameleon contributions section marks Aghajanyan as joint first author (∗) and Pre-Training workstream lead (‡).
  - The memorization and D4 author lists and the Chameleon Research License are confirmed.
- **susan-zhang**: checked OK.
  - The homepage's OpenAI Five RL system, the OPT-175B infrastructure, the release contents and the codebase link to metaseq match the profile, which drops the homepage's superlatives.
  - The OPT equal-contribution mark, Dota 2 authorship and the MIT license are confirmed. No current role is claimed.
- **adina-williams**: checked OK.
  - The Meta page and the GitHub bio ("Research Scientist at FAIR") support the role.
  - The Muse Spark report (May 2026) author list includes Williams.
  - MultiNLI first authorship, ANLI (CC BY-NC 4.0), HolisticBias and Llama 2 are confirmed. The meta-muse artifact covers Muse Spark.
- **kushal-tirumala**: checked; **kept as draft**.
  - The memorization and D4 PDFs show equal-contribution first authorship with a Meta AI Research affiliation.
  - Chameleon lists Tirumala under Pre-Training, and Transfusion lists Tirumala as an author.
  - No official profile was found, and the current role is undocumented. The GPT-5 System Card entry was correctly left out.
- **stephen-roller**: checked OK.
  - The homepage says "currently a Member of the Technical Staff at Thinky", linking to thinkingmachines.ai, which is the website of the catalog organization thinking-machines-lab. It also gives the Google DeepMind, Character.AI and FAIR roles, with FAIR dated 2017–2023.
  - OPT, Recipes and BlenderBot 3 claims and the MIT license are confirmed.
- **eric-michael-smith**: checked OK.
  - The Meta page shows the "Research Scientist" label and a bio that says Research Engineer at FAIR. It also lists Llama Guard 3 Vision (as "Eric Smith") and Llama 2, which settles identity.
  - HolisticBias first authorship, Llama 3 core contributor, the Muse Spark author list and the ResponsibleNLP MIT license are confirmed.
- **jason-weston**: **corrected**.
  - The affiliation name changed from "Meta (FAIR)" to "Meta (Meta Superintelligence Labs)", and the source `metareasoning-paper` (arXiv 2609.38147, 2026-09-29) was added. Weston's Sep and Oct 2026 papers list Meta Superintelligence Labs, and the Meta page says only "Research Scientist at Facebook", so "FAIR" was unsupported. This also confirms that `current: true` is current.
  - Everything else is confirmed: the Meta page's earlier roles, the Test of Time Award, Memory Networks, ParlAI (MIT), ANLI, Recipes, BB3 and Self-Rewarding.

## Totals

- 16 files checked.
- 4 corrected: edouard-grave, timothee-lacroix, baptiste-roziere and jason-weston.
- 4 kept as draft, with no change in status: angela-fan, naman-goyal, abhinav-jauhri and kushal-tirumala.
- 0 deleted.
- 8 checked OK.
- Validator: `16 batch file(s): 0 error(s), 0 warning(s)`.
