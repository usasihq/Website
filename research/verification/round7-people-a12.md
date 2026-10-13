# A12 verification (2026-10-13)

I fetched every cited source today, unauthenticated (curl with `-A "USASI-factcheck/0.3"`, plus WebFetch and WebSearch only to find primary pages). I checked each statement, identity, current role and catalog tie, and scanned for pronouns, superlatives, counts, money and personal details. No browser tools were used and the repository was not edited.

## Per file

- **harrison-chase**: checked OK. langchain.com/about (Chase started LangChain in late 2022; co-founder with Ankush Gola; LangGraph, LangSmith, Deep Agents), the LangChain blog post (byline "Harrison Chase", "Harrison's In the Loop", 2026-07-25), and the repo LICENSE (MIT) all match. No fetched LangChain page gives a CEO title, so the role stays "Co-founder".
- **jerry-liu**: corrected.
  - The bio said "first released in November 2022". It now says "with a release date of November 2022". CITATION.cff only gives `date-released: 2022-11-1`.
  - The CEO and co-founder role is confirmed by the LlamaIndex blog (2025-09-16, "Jerry here, CEO and co-founder"). No newer official page gives a different title.
  - Confirmed: the README "current focus" note (LlamaParse, LiteParse as a "free, fast, cheap text parser"), the CITATION.cff author entry, and the MIT LICENSE "Copyright (c) Jerry Liu".
- **shunyu-yao**: corrected; stays **draft**.
  - "first author of ReAct" → "the first-listed author of ReAct". WebShop lists Yao and Howard Chen as co-first authors.
  - Confirmed: the ReAct and τ-bench author lists (arXiv), the Google Research blog byline ("Shunyu Yao, Student Researcher … Google Research, Brain Team"), and the MIT license on the tau-bench repo.
  - Current-role finding: the homepage still says "I am a researcher at OpenAI", but it is marked "last updated: Feb 2025". Tencent's own newsroom names "Yao Shunyu, Chief AI Scientist at Tencent" (tencent.com/en-us/articles/2202320.html, 2026-04-24) and "Tencent's Chief Scientist for AI, Shunyu Yao" (tencent.com/en-us/articles/2202350.html, 2026-06-05). OpenAI as `current: false` is therefore right.
  - No official page links the Tencent executive to the ysymyth.github.io researcher; only news reports make that link. So I did not add the Tencent role. The editor should confirm identity, then add Tencent (not a catalog organization) and set `sector: corporate` before publishing.
- **omar-khattab**: checked OK. omarkhattab.com ("Last Update: September 2026") matches the Assistant Professor role at MIT EECS and CSAIL, the OASYS lab, and ColBERT, DSPy, GEPA and Recursive Language Models. The DSPy arXiv paper lists Khattab first, and the repo is MIT.
- **matei-zaharia**: corrected. In the DSPy work item, "the group's recent projects" → "Zaharia's recent projects", which is how the homepage puts it. Everything else matches the homepage and the Berkeley EECS faculty page (Associate Professor; co-founder and CTO of Databricks; started Spark; helped develop MLflow). The DSPy paper lists Zaharia, and MLflow is Apache-2.0. The ACM Prize was not added because awards.acm.org and acm.org returned 403 again today.
- **ion-stoica**: corrected. Headline "Co-author of Ray and vLLM" → "Co-author of the Ray and vLLM papers". The homepage (a UTF-16 page that needed decoding), short-bio.txt, the LMSYS advisors list, both arXiv author lists and both Apache-2.0 repos all confirm the rest.
- **joseph-e-gonzalez**: corrected.
  - Role "Professor in EECS" → "Associate Professor, Department of Electrical Engineering and Computer Sciences", and the bio now says "an associate professor". Sources: the bio page "Key facts" (updated 2026-10-07) and the Berkeley EECS faculty page.
  - Confirmed: Gorilla led by Gonzalez's students Patil and Zhang, BFCL now led by Huanzhi Mao, LMSYS founding member and advisor, both paper author lists, and the Apache-2.0 licenses.
- **michael-i-jordan**: corrected. Headline "Co-author of Ray and of latent Dirichlet allocation" → "Co-author of the Ray and latent Dirichlet allocation papers". The roles and dates (Inria and ENS 2023–present; Berkeley emeritus 2024–present; Berkeley 1998–2024; MIT 1988–1998; Amazon Scholar 2018–2024) match the homepage. The JMLR LDA page and the Ray author list match too.
- **trevor-hastie**: checked OK. The homepage title, the 1994–2025 joint appointment, nine years at Bell Labs, glmnet 5.0 (May 2026, Fortran replaced with C++), and the online courses with Tibshirani all match. CRAN lists Hastie as "aut, cre", with GPL-2 and a 2026-09-24 publish date. The ESL page offers a PDF download. The homepage mentions citizenship, and the profile correctly leaves it out.
- **robert-tibshirani**: corrected. Added the official Stanford profile (`tibs-stanford`), which shows "Professor of Biomedical Data Science and of Statistics … (2015 – Present)", as the current-role source. The role wording now follows that page. The lasso page, the software page, the CRAN author list and the ESL page all match.
- **andrew-ng**: corrected.
  - Added the current role "Managing Partner at AI Aspire", which andrewng.org lists.
  - Removed "later" from "later served as VP and Chief Scientist at Baidu", because the site gives no order.
  - The DistBelief contribution no longer uses "billions of parameters across tens of thousands of CPU cores". It now says the paper "describes DistBelief, a software framework for training large deep networks on computing clusters".
- **fei-fei-li**: checked OK. Confirmed from:
  - the Stanford profile: Sequoia Professor, HAI co-director (2019–present), SAIL director 2013–2018, Google VP and Chief Scientist of AI/ML at Google Cloud 2017–2018, "Co-founder/CEO of World Labs", and "inventor of ImageNet and the ImageNet Challenge";
  - the World Labs About page;
  - the ImageNet About page (PI; access for non-commercial research and education).
- **daphne-koller**: checked OK. Confirmed from:
  - the insitro leadership page: Founder & CEO, Board Member; Coursera co-founder, co-CEO and president; Engageli; Calico; 18 years on the Stanford faculty, now adjunct;
  - the Stanford profile: "Adjunct Professor, Computer Science";
  - the Coursera specialization page: instructor Daphne Koller, offered by Stanford Online.
- **yann-lecun**: checked OK.
  - Confirmed from: yann.lecun.com (HTTP; "Executive Chairman, Advanced Machine Intelligence (AMI Labs)"; Jacob T. Schwartz Professor), the linked bio document (Meta Chief AI Scientist 2018–2025; FAIR 2013–2017; NYU CDS 2011–2014; the convolutional network method), and the V-JEPA 2 author list.
  - Note: the NYU Courant profile link still shows the older title "Silver Professor". The link is kept because it is an official profile page.
  - The Turing Award is not added because the ACM pages returned 403.
- **geoffrey-hinton**: checked OK. Confirmed from:
  - the Toronto homepage bio: emeritus distinguished professor; Google half-time 2013–2023 as VP and Engineering Fellow; back-propagation;
  - the nobelprize.org summary and facts pages: 2024 Physics prize, shared with Hopfield, with the quoted motivation;
  - the AlexNet NeurIPS page and the distillation arXiv page.
- **alex-graves**: corrected.
  - The bio said "Alex Graves works on recurrent neural networks …", which came from a homepage frozen around 2013. It now attributes those interests to the homepage's own list.
  - Confirmed: the NTM author list and abstract, and the Nature DNC metadata (every author affiliated with Google DeepMind, published 2016-10-12).
  - The homepage does not list the DeepMind-era papers, so the identity link rests on the same name and the same research line (LSTM and sequence learning, Hinton group). This is accepted, but the editor may want a further check. The sector stays null.
- **david-ha**: checked OK. Confirmed from:
  - Sakana's corporate page: Co-Founder & CEO, founded 2023 with Ren Ito and Llion Jones, former Research Scientist at Google who led the Google Brain research team, the stated research areas, The AI Scientist, and the Darwin Gödel Machine;
  - the arXiv author lists for World Models, sketch-rnn and The AI Scientist.
  - Links: Sakana's page links Ha to x.com/hardmaru, and github.com/hardmaru links otoro.net.
- **kenneth-stanley**: corrected. Added the Lila Sciences team page (`lila-stanley`: "SVP, Open-endedness"; previously "led the Open-Endedness team at OpenAI") as the newest official source for the current and OpenAI roles. Other facts match kenstanley.net, and the ELM author list matches.
- **jeff-clune**: checked OK. Confirmed from:
  - jeffclune.com and its bio page: Professor at UBC, Canada CIFAR AI Chair at Vector, co-founder of Recursive; previously DeepMind Senior Research Advisor, OpenAI research manager, Uber AI Labs, Wyoming, and Cornell Research Scientist;
  - the VPT author list and the repo's MIT license (weights are downloadable);
  - The AI Scientist author list.
- **sara-hooker**: corrected.
  - The "Co-founder and CEO" role at Adaption appeared only in the home page's structured data. I added the Adaption blog (`adaption-blog`, 2026-10-09, "Adaption co-founder and CEO Sara Hooker") as visible, dated support.
  - Identity: the Hugging Face profile "sarahooker" belongs to both the adaptionlabs and CohereLabsCommunity organizations, and recent Adaption blog co-authors also appear on the Aya paper.
  - Confirmed from the PDFs: the Hardware Lottery affiliation ("Google Research, Brain Team"), and Hooker as last-listed author and corresponding author of Aya with a Cohere For AI affiliation. The aya-101 card lists Apache-2.0.

## Totals

- Files checked: 20
- Checked OK, no change: 9 (harrison-chase, omar-khattab, trevor-hastie, fei-fei-li, daphne-koller, yann-lecun, geoffrey-hinton, david-ha, jeff-clune)
- Corrected: 11 (jerry-liu, shunyu-yao, matei-zaharia, ion-stoica, joseph-e-gonzalez, michael-i-jordan, robert-tibshirani, andrew-ng, alex-graves, kenneth-stanley, sara-hooker)
- Set to draft: 1 (shunyu-yao, already draft and kept as draft pending the Tencent identity check)
- Deleted: 0
- Honors added: none (ACM returned 403; the Nobel Prize for Hinton was already cited from nobelprize.org)
- Validator: `20 batch file(s): 0 error(s), 0 warning(s)`
