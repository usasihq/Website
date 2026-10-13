# Batch A2 fact-check (2026-10-13)

Independent check of all 19 files in `people/A2/people/`. Every cited source was fetched today, either with WebFetch or with plain unauthenticated curl (`-A "USASI-factcheck/0.3"`). The GitHub API hit its unauthenticated rate limit, so GitHub profiles were read from public HTML. Separately, all 101 distinct URLs in the files (sources and links) returned HTTP 200 today.

Every file was also scanned for he/she pronouns, superlatives, counts, money and personal details. The only hit was the corpus size in hamel-husain, which was cut.

## Per file

- **abubakar-abid**: corrected.
  - Change: "Founder"/"founded" Gradio → "Co-founder"/"co-founded" (headline, bio, Gradio role, Gradio work item).
  - Why: the Hugging Face blog post `gradio-joins-hf` (2021-12-21) is written "as one of the founders of Gradio", and the LLM Course says Dawood Khan started Gradio "with his fellow co-founders".
  - Confirmed as written:
    - the Hugging Face team-lead role (LLM Course, plus the GitHub bio "Working on Gradio … at @huggingface!");
    - the 2019 paper's first authorship and abstract;
    - the Apache-2.0 license.
- **alexander-rush**: checked OK.
  - rush-nlp.com confirms "ML Researcher. Cursor.", the post-training focus, the Harvard/Cornell professorships (2016–2026) and the Hugging Face researcher role (2019–2024).
  - It also lists the Annotated Transformer (ACL NLP-OSS 2018), Zephyr (COLM 2024) and Transformers (EMNLP Demos 2020).
  - The GitHub `srush` profile ("Sasha Rush", "Cursor Research") links to rush-nlp.com. The display name "Sasha Rush" is correct.
- **chip-huyen**: checked OK.
  - huyenchip.com confirms the NVIDIA ML tooling role as a NeMo core developer (it links github.com/NVIDIA/NeMo), plus Snorkel AI, Netflix, and teaching ML Systems at Stanford.
  - The CS 329S page lists Chip Huyen as instructor, with the book from O'Reilly, 2022.
  - The NeMo LICENSE is Apache 2.0.
- **douwe-kiela**: corrected.
  - Change: "a co-author of Ai2's OLMoE open mixture-of-experts models" → "a co-author of the paper on the OLMoE open mixture-of-experts models".
  - Why: the cited arXiv abstract page does not name Ai2.
  - Confirmed: all roles match douwekiela.github.io (Google DeepMind researcher; former CEO and co-founder of Contextual AI; Stanford adjunct; Hugging Face Head of Research; FAIR). The RAG, Dynabench and OLMoE author lists and abstracts also match.
- **eugene-yan**: corrected.
  - Bio change: "where Yan's timeline describes the work as…" → "and describes the work as…". The "bridge the field and the frontier" line is in the site intro, not the timeline.
  - Bio change: "Alibaba's Lazada" → "Alibaba/Lazada", as the about page writes it.
  - Bio change: "led the document integration and structure" → "led the bulk of the document integration and overall structure", matching the applied-llms.org acknowledgments.
  - Work item: "Listed first among the six authors" → "Listed first among the authors", to drop the count.
  - Confirmed: Anthropic MTS (2026–now) on eugeneyan.com/about and the GitHub company field (@anthropics); Amazon 2020–2025.
- **hamel-husain**: corrected.
  - Change: CodeSearchNet work item "about 6 million functions … in six programming languages" → "functions from open-source code in Go, Java, JavaScript, PHP, Python, and Ruby". This removes the count.
  - Confirmed:
    - the Parlance Labs role, GitHub and Airbnb (GitHub README);
    - hamel.dev links the CodeSearchNet paper as its "early LLM research";
    - the GitHub Blog nbdev post (2020-11-20) bylines Hamel Husain;
    - the nbdev license is Apache 2.0.
- **leandro-von-werra**: checked OK.
  - TRL CITATION.cff lists von Werra first, with date-released 2020-03-27 and Apache-2.0.
  - von Werra is in the smolagents README BibTeX and on the StarCoder and StarCoder2 author lists.
  - The GitHub bio reads "Machine Learning @huggingface", and the LLM Course gives the open-source team role.
- **lewis-tunstall**: checked OK.
  - Tunstall is first author of Zephyr and first in the alignment-handbook BibTeX (Apache-2.0), and is listed in TRL CITATION.cff.
  - The GitHub `lewtun` bio reads "post-training @ Hugging Face". That account has no display name, but it links "Lewis Tunstall's Blog", and the Hugging Face profile `lewtun` (Lewis Tunstall) links back to it.
- **margaret-mitchell**: checked OK.
  - whoami.html confirms the current Hugging Face researcher and Chief Ethics Scientist role, Google AI Staff Research Scientist (founded and co-led Ethical AI), and Microsoft Research.
  - timeline.html gives Hugging Face in 2021 and the Seeing AI release on 12 July 2017 via Microsoft Cognitive Services.
  - The Model Cards author list and description match.
- **nathan-lambert**: corrected.
  - Bio change: "The Interconnects about page describes Lambert as a senior research scientist and post-training lead at … Ai2, training open models under the Olmo, Molmo, and Tülu names" → "Previously, Lambert was a senior research scientist and post-training lead at … Ai2, where Lambert trained open Olmo language models".
  - Why: Interconnects says Lambert trains "Olmos" and lists Tülu and Molmo only as research works, so the claim was narrowed to Olmo.
  - Source fix: the `trillium-intro` source had `published_at: null` → 2026-10-01 (the post's date; it is signed by Nathan Lambert & Tom Zick).
  - Why the Ai2 role is past: natolambert.com now presents only Trillium Labs (Co-founder and Executive Director). Ai2's team directory (allenai.org/team, alphabetical) has no entry between "Anna Kwa" and "Paul Laskowski", where Lambert would be listed. That directory was checked but not cited.
  - Confirmed:
    - Tülu 3: first author, a ♥ core contributor, with an Allen Institute for AI affiliation (arXiv HTML);
    - TRL and Diffusers citations;
    - rlhfbook.com: "The print, ePub, and liveBook editions were published by Manning" in July 2026.
- **nils-reimers**: corrected.
  - Change: Sentence Transformers contribution "creator and core maintainer" → "creator".
  - Why: the vita's maintainer line dates from Reimers's Hugging Face years, and the README now names Tom Aarsen as maintainer.
  - Confirmed: VP of AI Search at Cohere (homepage; GitHub company "Cohere"); Hugging Face Research Scientist 2021–2022 (vita); the README origin line about the UKP Lab at TU Darmstadt; the SBERT abstract; BEIR and MTEB on the homepage.
- **patrick-von-platen**: set to draft.
  - Confirmed:
    - first author in the Diffusers README and CITATION.cff (Apache-2.0);
    - co-author of the Transformers paper;
    - vLLM CODEOWNERS "# Mistral-specific files" → @patrickvonplaten;
    - listed in "The Mistral AI Team" on the Mistral-Nemo card;
    - a contributor on Ministral 3 (Jan 2026).
  - Why draft: the Mistral AI affiliation is recorded as `current: false`, but no source documents an end to that role. A newer Mistral report, Shieldstral (arXiv 2607.25857, 2026-07-28), also lists von Platen as a contributor, and the CODEOWNERS entry is current. No page states a current title either.
  - Editor: decide whether to record Mistral as current (and with what role) before publishing.
- **philipp-schmid**: checked OK.
  - philschmid.de/philipp-schmid confirms Staff Engineer (Developer Experience and Developer Relations) at Google DeepMind and "Before joining Google DeepMind in 2025, I was a Technical Lead at Hugging Face", plus Inference Endpoints.
  - The page's revenue figures were correctly left out.
  - Schmid is in the Accelerate BibTeX (Apache-2.0), and the blog index shows the Gemini and agent guides.
- **sasha-luccioni**: corrected.
  - Change: added the source `saig-team` (https://sustainableaigroup.com/, "Who we are"). It states "Co-Founder, Chief Scientific Officer" and "Previously AI & Climate Lead at Hugging Face".
  - Change: the Hugging Face role "Research Scientist" → "Research Scientist; AI & Climate Lead".
  - Change: the bio now says "Luccioni was previously AI & Climate Lead at Hugging Face".
  - Why: before this, the past Hugging Face role rested only on a CV that still says "2021 - Present" and on a GitHub company field. The official company page now documents it as past.
  - Confirmed: the two paper abstracts and author lists.
- **sayak-paul**: checked OK.
  - sayak.dev says "I work on 🧨 diffusion models at Hugging Face" and lists PAWBench and the ECCV'26 tutorial.
  - Paul is in the Diffusers citation and CITATION.cff (Apache-2.0).
- **shreya-shankar**: checked OK.
  - sh-reya.com confirms the CMU CSD Assistant Professor appointment in 2027 (CMU Database Group) and the Berkeley EECS PhD with Aditya Parameswaran, where Shankar built DocETL.
  - The GitHub bio reads "prev CS PhD student at UC Berkeley EECS".
  - The DocETL README states the EPIC Data Lab / DSF origin and the MIT license.
  - The applied-llms.org credits match.
- **sylvain-gugger**: checked OK.
  - The GitHub bio reads "prev Hugging Face/fast.ai", so both roles are correctly past.
  - The LLM Course bio, the Transformers paper and README citation (Apache-2.0), and the Accelerate BibTeX (listed first; "thin wrapper") all match.
  - `sector: null` is kept, because no current role is documented.
- **yacine-jernite**: checked OK.
  - yjernite.github.io says "I currently lead the ML and Society team at Hugging Face" and describes the BigScience co-organizer and data area chair work and the ROOTS/BLOOM link.
  - The Transformers, StarCoder2 and Power Hungry Processing author lists match.
- **younes-belkada**: checked OK.
  - The DeepLearning.AI page (it now redirects to /courses/quantization-fundamentals) lists "Younes Belkada, Machine Learning Engineer at Hugging Face".
  - Belkada is in TRL CITATION.cff and on the Zephyr, StarCoder2 and LLM.int8() author lists. The LLM.int8() abstract supports the "single server with consumer GPUs" wording.
  - The 2601.04890 HTML header gives "Falcon LLM Team". The Hugging Face role as past and `sector: null` are appropriate.

## Totals

- Files checked: 19
- Checked OK, unchanged: 11
- Corrected: 7 (abubakar-abid, douwe-kiela, eugene-yan, hamel-husain, nathan-lambert, nils-reimers, sasha-luccioni)
- Set to draft: 1 (patrick-von-platen)
- Deleted: 0
- Validator: `19 batch file(s): 0 error(s), 0 warning(s)`

Note: the repository at `/tmp/claude-1000/usasi-wt/people` was not edited. Its `git status` shows a pre-existing change to `data/jobs/current.json` that this check did not make.
