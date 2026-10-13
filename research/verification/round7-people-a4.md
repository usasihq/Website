# Batch A4: fact-check report (2026-10-13)

I fetched every cited source today without logging in, using curl with `-A "USASI-factcheck/0.3"`: 29 arXiv abstract pages, 3 arXiv HTML pages, and every cited official page, repository and blog. All of them returned HTTP 200 and resolved to the page described. I checked each file for identity, current role, catalog tie, privacy and tone, and directory fields. None of the 18 files contains he/she pronouns, superlatives, counts or money. I did not edit the repository.

## The two flagged roles

- **arthur-conmy: Anthropic role kept as current.**
  - Conmy's own site (Last-Modified 2026-08-14) says "I am joining Anthropic" and lists "Next role: Member of Technical Staff, Anthropic".
  - The newer MATS mentor page (MATS site last published 2026-10-07, https://www.matsprogram.org/mentor/conmy) says Conmy "is a Member of Technical Staff at Anthropic". It also confirms the earlier Google DeepMind and Redwood Research roles.
  - The newest official source therefore presents the role as current.
- **samuel-marks: Anthropic role changed from past to current.** Three sources support it:
  - Anthropic's own Alignment Science Blog post "Would This Change Your Answer?" (CHIVE), dated 2026-08-21, lists Samuel Marks with the affiliation "Anthropic".
  - The May 2026 MSM post also lists Marks with that affiliation.
  - The MATS mentor page (https://www.matsprogram.org/mentor/marks) lists "Anthropic — Member of Technical Staff" and says Marks "leads the Cognitive Oversight subteam of Anthropic's Alignment Science team".
  - **Identity:** I confirmed that the Anthropic researcher is the same person as the Northeastern postdoc under David Bau on the Harvard page. Marks's Google Scholar profile shows Anthropic, an email verified at northeastern.edu, and both *Sparse Feature Circuits* and *Auditing language models for hidden objectives*. I used that profile only to check identity and did not cite it.

## Per file

| File | Result | Details |
|---|---|---|
| ajeya-cotra | Checked OK | The METR team page and About page list Cotra as Technical Staff and describe the threat-modeling work and the earlier Coefficient Giving roles. The Frontier Risk Report credits read "Ajeya Cotra (report lead)" under Writing, and Cotra is also listed under Company engagement. |
| arthur-conmy | **Corrected** | Headline: "Joining Anthropic as Member of Technical Staff; …" → "Anthropic Member of Technical Staff; former Google DeepMind senior research engineer; ACDC first author". Bio: "whose site announces a new role as a Member of Technical Staff" → "is a Member of Technical Staff at Anthropic; Conmy's site describes the role as working on aligning upcoming models as they are trained". Anthropic role: "Member of Technical Staff (new role announced on Conmy's site)" → "Member of Technical Staff", still `current: true`, now also citing the new source `mats-conmy`. The papers check out against arXiv: ACDC (first author), IOI (co-author) and Gemma Scope (co-author). |
| chris-olah | Checked OK | colah.github.io/about confirms the Anthropic co-founder role and the past roles at OpenAI (led interpretability), Google Brain and Distill. The Framework article marks Olah as correspondence author (‡). Toy Models lists Olah last. The Biology paper's contributions statement matches the profile. |
| collin-burns | **Corrected** | Bio: "is also first author of 'Discovering Latent Knowledge…'" → "co-first author". Burns's own site marks Burns and Ye with \* for equal contribution. The rest checks out: own site ("previously worked at OpenAI and Anthropic"), Steinhardt's page ("Collin Burns (co-advised with Dan Klein → OpenAI)"), Weak-to-Strong (first author and † primary contributor), and MMLU. |
| dan-hendrycks | Checked OK | safe.ai/about lists "Executive & Research Director". Hendrycks's own page gives the PhD and advisors and the GELU work. On arXiv, Hendrycks is first author of MMLU and of GELU (with Gimpel), and last of 1,158 authors on Humanity's Last Exam (catalog tie). |
| david-bau | Checked OK | The Khoury faculty page (current) confirms Assistant Professor. baulab.info confirms the Google Talk team, Google Image Search and Trident/IE4 roles, the NDIF launch and nnsight. The nnsight README citation lists Bau last, and the repository is MIT-licensed. ROME lists Bau as co-author. |
| edward-beeching | Checked OK | Own site and GitHub say Research Scientist at Hugging Face. TRL's CITATION.cff lists Beeching as an author and gives the Apache-2.0 license and the abstract wording. The SmolLM3 blog lists Beeching in its author list and citation, and describes a "fully open 3B model". The Zephyr paper and own site mark Tunstall\* and Beeching\* as co-first authors. Own site lists the 2023 20B RLHF post and the 2026 Delta Weight Sync post. |
| ethan-perez | Checked OK | Own site says "I lead the alignment team at Anthropic" and "I led the team that developed Constitutional Classifiers". On arXiv, Perez is last author of Constitutional Classifiers, first author of the Red Teaming paper, and co-author of RAG. |
| evan-hubinger | Checked OK | GitHub bio reads "Alignment Stress-Testing lead @anthropics". The August 2026 reward-seeker post lists Hubinger. On arXiv, Hubinger is first author of Sleeper Agents, last author of Alignment Faking, and first author of Learned Optimization. |
| jacob-andreas | Checked OK | Own site says associate professor at MIT in EECS and CSAIL, and the current MIT EECS and CSAIL pages agree. ICL lists Andreas as co-author and MILAN lists Andreas last. |
| jacob-steinhardt | **Corrected** | MMLU contribution: "57 subjects, from elementary mathematics to law" → "57 tasks, including elementary mathematics and law", matching the arXiv abstract. Other facts check out: own site (Associate Professor; Founder & CEO of Transluce; postdoc year at OpenAI), the transluce.org description, and last authorship of both MMLU and IOI. |
| kenneth-li | Checked OK | Own site (updated June 2026) says "currently a researcher at Thinking Machines Lab" and gives the Harvard PhD advisors. Othello lists Li as first author. Li's site marks ITI co-first authors as Li\* and Patel\*. The site also lists the later COLM 2024 and Q-Probe papers. |
| marius-hobbhahn | Checked OK | Own site says CEO and co-founder of Apollo Research and describes the evals and scheming focus. The CV gives "Epoch June 2022 – April 2023: part-time research fellow" (catalog tie). The Apollo team page lists "CEO / Co-Founder" and the About page says "now a Public Benefit Corporation". On arXiv, Hobbhahn is last author of the Strategic Deception paper and co-author of Compute Trends. |
| neel-nanda | Checked OK | Own about page says Nanda runs the Google DeepMind mechanistic interpretability team and earlier worked at Anthropic under Olah. GitHub agrees. The Framework article marks Nanda with \* as a core research contributor. The TransformerLens README says "created by Neel Nanda" and the repository is MIT-licensed. On arXiv, Nanda is last author of Gemma Scope and first author of the Grokking paper. |
| owain-evans | Checked OK | Own site says "Director at Truthful AI (a non-profit…)" and "Affiliate Researcher at CHAI, UC Berkeley", lists past work at FHI (Oxford), and describes the research topics. On arXiv, Evans is co-author of TruthfulQA (817 questions in 38 categories) and last author of Emergent Misalignment. |
| paul-christiano | **Corrected** | Past NIST affiliation name: "U.S. AI Safety Institute, later the Center for AI Standards and Innovation" → "U.S. AI Safety Institute and Center for AI Standards and Innovation". No source states that one body was renamed as the other; Christiano's site names both. The other claims check out: own site (ARC executive director; technical advisor at CAISI; previously ran the OpenAI language model alignment team), the 2024-04-16 NIST release naming Christiano head of AI safety, and the 2017 human-preferences paper (first author). |
| samuel-marks | **Corrected** | `sector`: null → corporate. Headline → "Leads the Cognitive Oversight subteam at Anthropic; first author of a study on auditing hidden objectives". The bio now opens with the current Anthropic role and subteam. Anthropic role: `current: false`, "Researcher (first author …)" → `current: true`, "Member of Technical Staff; leads the Cognitive Oversight subteam of the Alignment Science team". I added the sources `mats-marks` and `anthropic-chive`, both cited. The auditing paper (first author and core research contributor; "conducted this work while at Anthropic"), the nnsight citation, the RLHF survey and the Harvard page (past Northeastern postdoc) all check out. |
| stephen-casper | Checked OK | Own site says Assistant Professor at the Harvard Kennedy School, Faculty Affiliate with Harvard SEAS, the work topics, and a PhD at MIT. The MATS page agrees. On arXiv, Casper is first author of the RLHF Open Problems paper and of Black-Box Access. |

## Totals

- **Files checked:** 18
- **Checked OK:** 13
- **Corrected:** 5 (arthur-conmy, collin-burns, jacob-steinhardt, paul-christiano, samuel-marks)
- **Set to draft:** 0
- **Deleted:** 0
- **Validator** (`npx tsx validate-batch.ts …/people/A4`): 18 batch files, 0 errors, 0 warnings.
