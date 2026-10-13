# A9 fact-check (2026-10-13)

Every cited source was fetched today, unauthenticated: curl with `-A "USASI-factcheck/0.3"`, or WebFetch where curl got a 403. All 22 arXiv pages were checked for title, author list, author order and v1 date, and every source URL resolved to the page described. Each file was also checked for identity, catalog tie, pronouns, superlatives, counts, money and personal details.

## Per file

- **pieter-abbeel**: checked OK. The homepage's Current Positions block (visible text, not the HTML comments) confirms the Berkeley chair and lab roles, Amazon Scholar (2024–), Covariant (2017–2024) and OpenAI Research Scientist (2016–2017). The homepage also links CS294-158. The DDPM and TRPO author lists match.
- **sergey-levine**: checked OK. The homepage shows Associate Professor, EECS, and RAIL. The CS 185/285 site lists Levine as instructor and links the Fall 2023 recordings. The π0 author list includes Levine. The openpi README (Apache-2.0, "published by the Physical Intelligence team") provides π0 base checkpoints for fine-tuning.
- **chelsea-finn**: checked OK. The homepage shows Assistant Professor in CS and EE at Stanford, "co-founder of Pi" (linking physicalintelligence.company), IRIS, earlier time on the Google Brain and Google DeepMind teams, and CS224R in Spring 2026. MAML (first author) and π0 (co-author) are confirmed.
- **anca-dragan**: checked OK. The homepage confirms the role on leave from Berkeley "to head AI Safety and Alignment at Google DeepMind", the Gemini safety teams and the InterACT Lab. Dragan is on the 2504.01849 author list.
- **ken-goldberg**: corrected. The Dex-Net 2.0 contribution changed from "synthetic dataset of 6.7 million point clouds…" to "synthetic dataset of point clouds…", removing the count. Source: arXiv 1703.09312. The homepage roles (Floyd Chair, Distinguished Professor, Ambi Robotics, Robot Learning Foundation) are confirmed.
- **david-silver**: corrected. The teaching page does not name UCL and lists the course as "Advanced Topics 2015 (COMPM050/COMPGI13)".
  - Before: "Silver's UCL reinforcement learning course, with ten lectures and an assignment…".
  - After: "Silver's site also publishes the lectures and Easy21 assignment of a 2015 Advanced Topics course on reinforcement learning (COMPM050/COMPGI13) under a CC-BY-NC 4.0 license".
  - The work item was renamed to match, its contribution now notes that third-party content is excluded from the license, and the source title was updated.
  - The homepage confirms CEO of Ineffable Intelligence, professor at UCL, and "until recently" led the DeepMind RL team.
- **richard-sutton**: corrected.
  - The ACM Turing Award was cut from the headline and the bio. It was sourced only to the University of Alberta release, and the ACM pages (awards.acm.org, amturing.acm.org, acm.org media center) all return 403 to curl and WebFetch. Official honors need the awarding body's page.
  - The headline now reads "University of Alberta professor of computing science; co-founded Google DeepMind Alberta in 2017".
  - The textbook contribution no longer says the release "credits [it] with helping define modern reinforcement learning", since the release's wording is promotional; it now states co-authorship only.
  - The Amii wording was narrowed to the release's "chief scientific advisor" and "fellow".
  - Still confirmed: the directory (Professor, Faculty of Science – Computing Science), and from the release, Google DeepMind Alberta co-founded in 2017 and its Edmonton office closed in 2023. The release was fetched with WebFetch.
- **john-schulman**: checked OK. https://people.eecs.berkeley.edu/~joschu/ returns a 301 to http://joschu.net/, which states the Thinking Machines co-founder and chief scientist role, earlier Alignment Science work at Anthropic, and the OpenAI co-founder, ChatGPT and post-training (2022–2024) roles. The Abbeel alumni list confirms the December 2016 thesis. The LoRA post byline and its Sep 29, 2025 date are confirmed. The GitHub profile `joschu` is titled "John Schulman" and links joschu.net.
- **volodymyr-mnih**: checked OK. The homepage says "I'm a research scientist at Google DeepMind" and lists the Nature DQN paper with a Code link. The DQN and A3C author lists match.
- **hado-van-hasselt**: checked OK. The About page confirms the Google DeepMind research scientist role and the earlier work with Rich Sutton; the location sentence on that page was correctly left out. The homepage post confirms the 2016 UCL course with Joseph Modayil. The Double DQN author list matches.
- **tom-schaul**: corrected. The homepage says Schaul leads "the reinforcement learning team at Google DeepMind London". The bio and role now say "leads a reinforcement learning team" instead of "leads its reinforcement learning team", which overstated the scope. The city was not added, to keep location off the profile. The rest is confirmed: senior staff research scientist, joined DeepMind in 2013, the research interests, Prioritized Experience Replay and Policy Churn as first author, and the GitHub company field.
- **timothy-lillicrap**: checked OK. The CIFAR bio confirms Institution "Google DeepMind", "Director of Research", Program Co-Director of Learning in Machines & Brains, joining in 2014 as a Research Scientist, and the research focus. The DDPG, AlphaZero and A3C author lists match.
- **shimon-whiteson**: checked OK. The lab page confirms Professor at Oxford, Research Director at Google DeepMind, the University of Amsterdam roles and Latent Logic. QMIX and COMA have Whiteson as last author.
- **jakob-foerster**: checked OK. The homepage lists Associate Professor (Engineering Science, Oxford), Research Scientist (FAIR, Meta AI) and Founding Director of BOLD. COMA (first author) and QMIX (co-author) are confirmed. Political and open-letter content on the homepage was correctly left out.
- **jakob-uszkoreit**: corrected. `inceptive-cart` changed from `published_at: null` to `2026-06-03`, the date shown on the post. Confirmed: the June 3, 2026 release names Uszkoreit "Inceptive co-founder and CEO"; the August 31, 2017 Google blog byline is "Software Engineer, Natural Language Understanding"; Uszkoreit is on the Transformer author list and the CAR-T post author list. The release's money figures were correctly left out.
- **shixiang-gu**: checked OK. The homepage confirms Senior Staff Research Scientist at Google DeepMind on the Gemini Thinking team, earlier lead of Gemini post-training multilinguality, the ChatGPT team at OpenAI, and founding member of Google Brain Robotics. The Gumbel-Softmax and Zero-Shot CoT author lists match.
- **tuomas-haarnoja**: corrected (kept published).
  - The DeepMind tie rested only on the Abbeel alumni list ("Next: Research Scientist at Deepmind", December 2018). I added a second primary source: the soccer paper PDF (arXiv 2304.13653v2, April 2024) lists Haarnoja under affiliation "Google DeepMind". `soccer-paper` is now cited on the affiliation, and the bio and contribution say so.
  - Removed the spec count "with 20 actuated joints".
  - The current role is still unverified, so the affiliation stays `current: false` and `sector: null`, as the brief directs.
  - GitHub `haarnoja` ("Tuomas Haarnoja", with the sac and softqlearning repositories) matches the identity.
- **emanuel-todorov**: corrected. "sold it commercially from 2015 to 2021" now reads "offered it as a commercial product from 2015 to 2021", matching Roboti's "available as a commercial product". Confirmed: the lab page (archival; Todorov "now working on research and development at Roboti LLC"), the CV (UCSD 2002–2009, UW from 2009) and the projects page ("our physics engine"). Roboti states that DeepMind acquired MuJoCo in October 2021 and released it under Apache 2.0. Todorov is on the 1709.10087 author list as "Emanuel Todorov".
- **vikash-kumar**: checked OK. The homepage confirms Co-founder and CEO of Myolab.ai, Adjunct Professor at the CMU Robotics Institute, previously Sr. Research Scientist at FAIR–Meta AI, Google Brain and OpenAI, lead creator of MyoSuite and RoboHive, and founding member of MuJoCo and TorchRL. Both repositories are Apache-2.0 and MuJoCo-based, and the MyoSuite citation is L4DC 2022 with Kumar as an author.

## Notes for the editor

- I did not touch the repository. `git status` there shows `data/jobs/current.json` modified, but its timestamp (13:24) is earlier than this batch, so it was not changed by this check.
- Sutton's Turing Award can be restored if an ACM page becomes fetchable; the ACM site returned 403 today.

## Totals

- Files checked: 19
- Checked OK, no change: 12 (abbeel, levine, finn, dragan, schulman, mnih, van-hasselt, lillicrap, whiteson, foerster, gu, kumar)
- Corrected: 7 (goldberg, silver, sutton, schaul, uszkoreit, haarnoja, todorov)
- Set to draft: 0
- Deleted: 0
- Validator: `19 batch file(s): 0 error(s), 0 warning(s)`
