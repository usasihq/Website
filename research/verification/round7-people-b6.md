# B6 verification (2026-10-13)

Independent fact-check of all 15 files in `B6/people/`. Every cited source was fetched today, unauthenticated:

- **curl** (`-A "USASI-factcheck/0.3"`) for arXiv PDFs and abstracts and the GitHub repositories;
- **page fetches** of SSI, Thinking Machines Lab, Periodic Labs, the Anthropic leadership page (full bios read from the page data), the Anthropic constitution and news post, the OpenAI Forum and the OpenAI developer blog, and the personal sites;
- **WebFetch** for the NVIDIA investor release, which returns 403 to curl.

No email address or personal identifier went into any request. All catalog slugs exist. No file had a duplicate in the repository. No he/she pronouns, superlatives or money appear. Departures are not described.

## Files

- **ilya-sutskever.yml: checked OK.**
  - The NVIDIA release (2026-07-27) says "Ilya Sutskever, cofounder and CEO of SSI". It credits contributions to AlexNet, AlphaGo, sequence-to-sequence learning and the GPT models, and says Sutskever "spearheaded the research that led to reasoning models such as OpenAI o1".
  - ssi.inc/updates (2025-07-03 message, signed Ilya) says "I am now formally CEO of SSI". The ssi.inc homepage says "one goal and one product: a safe superintelligence".
  - In the o1 card, Sutskever is under Reasoning Research, Foundational Contributors.
  - OpenAI-affiliated author on GPT-3, CLIP (last), Codex/HumanEval and Whisper (last).
  - Licenses: CLIP, Whisper and human-eval are MIT.
- **alec-radford.yml: corrected.**
  - Scaling-laws work item: "credits Radford with developing the optimized Transformer implementation and, with others, the text datasets" → "credits Radford, with others, with developing the optimized Transformer implementation and the text datasets". The source is the contributions line of arXiv 2001.08361, which lists Brown, Child, Gray and Radford for the implementation.
  - Confirmed as written:
    - "Independent" affiliation on 2601.21571 and 2602.06964;
    - per arXiv's API, these are Radford's newest papers;
    - equal-contribution first author of CLIP and Whisper;
    - the gpt-2 repository's citation puts Radford first, and its license is "Modified MIT".
- **aditya-ramesh.yml: checked OK.**
  - Homepage source: VP of Research at OpenAI leading Worldsim, the robotics effort, and the DALL·E, DALL·E 3, Sora and Sora 2 statements. The live http://adityaramesh.com shows the same text; the source file was last committed 2025-10-11, which is the newest source found.
  - First author of DALL·E (2102.12092) and DALL·E 2 (2204.06125); co-author of CLIP.
- **mark-chen.yml: checked OK.**
  - The OpenAI Forum event (March 4, 2026) lists "Chief Research Officer @ OpenAI", with a bio saying Chen joined in 2018.
  - Codex: first author and corresponding author.
  - DALL·E co-author; DALL·E 2 last author.
  - GPT-4 report: "Vision team co-lead, Deployment lead".
  - o1 card: Reasoning Research Leadership and Executive Leadership.
  - Named in the gpt-oss card contributors.
- **liam-fedus.yml: corrected.**
  - Headline: "…o1 reasoning research lead at OpenAI; on the Periodic Labs team" → "On the Periodic Labs team; first author of Switch Transformers; in OpenAI o1 reasoning research leadership". The o1 card lists Fedus under Reasoning Research "Leadership"; "lead" overstated it.
  - Confirmed as written:
    - periodic.com lists Fedus under "Who we are", with no title;
    - Switch Transformers: "William Fedus*", liamfedus@google.com, Google;
    - GPT-4 report: "Data flywheel lead".
- **jakub-pachocki.yml: corrected.**
  - Headline: "research lead on OpenAI Five" → "set research direction for OpenAI Five". The source is the Dota 2 paper's contributions section.
  - The developer blog source's `published_at` was null; it is now 2025-09-22, the date on the page. The bio now says "a September 2025 OpenAI developer blog post".
  - Confirmed as written:
    - blog: "our Chief Scientist Jakub Pachocki";
    - arXiv 2609.36054 (2026-09-28) lists Pachocki with OpenAI;
    - GPT-4 report: "Overall lead, optimization lead";
    - o1 card: Leadership and Executive Leadership;
    - named in the gpt-oss contributors;
    - gpt-oss repository: Apache-2.0.
- **bob-mcgrew.yml: corrected; stays draft.**
  - Headline: "Former member of OpenAI's executive leadership…" → "Listed in OpenAI's executive leadership on the o1 System Card; led aspects of OpenAI's robot-hand research". No primary source documents a departure date or a current role. A search found only news and aggregator pages about a new company, which are not usable.
  - Confirmed as written:
    - o1 card: Executive Leadership;
    - Rubik's Cube paper: equal-contribution author, and "led aspects of this project and set research directions";
    - Codex co-author with OpenAI.
- **mira-murati.yml: checked OK.**
  - The Thinking Machines NVIDIA post (Mar 10, 2026) says "Mira Murati, cofounder and CEO of Thinking Machines".
  - The homepage calls the company an "artificial intelligence research and product company" and mentions "Inkling: Our Open-Weights Models". The Tinker page calls Tinker "a training API for researchers".
  - The o1 card lists Murati under Executive Leadership; the GPT-4 report lists Murati under "Additional contributions"; the Codex paper has Murati as an OpenAI co-author.
- **jared-kaplan.yml: checked OK.**
  - The Anthropic leadership page gives the title "Co-Founder and Chief Science Officer" and heading technical research. Its full bio confirms:
    - 15 years as a theoretical physicist;
    - "instrumental in building GPT-3 and Codex at OpenAI";
    - "associate professor at Johns Hopkins University".
  - Scaling laws: equal-contribution first author, with "Johns Hopkins University, OpenAI"; the paper says Kaplan and McCandlish led the research.
  - Constitutional AI: last author.
  - Codex: equal contribution, with Anthropic AI, "work performed while at OpenAI".
  - The constitution's contribution statement says Kaplan "worked with Amanda to create the Claude Character project in 2023".
- **tom-brown.yml: checked OK.**
  - Leadership page: "Co-Founder and Chief Compute Officer", leading the compute organization. The full bio says Brown "led the engineering of GPT-3 at OpenAI" and co-invented deep RLHF with Dario Amodei.
  - GPT-3: equal-contribution first author. Co-author of 1706.03741 (as Tom B. Brown) and of Constitutional AI.
- **amanda-askell.yml: corrected.**
  - HHH paper work item: "Equal-contribution first author" → "First-listed author, marked as a core research contributor". In arXiv 2112.00861, ∗ means "Core Research Contributors".
  - Confirmed as written:
    - askell.io: philosopher working on finetuning and alignment at Anthropic, plus the team description and the earlier OpenAI policy-team role;
    - the constitution says "Amanda Askell leads Anthropic's Character work and is the primary author", "wrote the majority … led its development through multiple rounds of revision", and carries a CC0 1.0 deed;
    - the news post is dated Jan 22, 2026;
    - co-author of GPT-3 and CLIP.
- **jan-leike.yml: checked OK.**
  - jan.leike.name: leads the Alignment Science team at Anthropic, previously co-led Superalignment at OpenAI (InstructGPT, ChatGPT, GPT-4 alignment), and was earlier an alignment researcher at DeepMind who prototyped RLHF. It also lists the team's research areas.
  - Second author of 1706.03741; first author of 1811.07871; co-author of InstructGPT (OpenAI) and of weak-to-strong generalization.
- **nicholas-carlini.yml: checked OK.**
  - nicholas.carlini.com:
    - "Research Scientist, Anthropic";
    - Google Brain 2018–2023 and DeepMind 2023–2025;
    - the security and ML focus.
  - First author of 2012.07805 and 2403.06634.
  - The benchmark repository (GPL-3.0) describes a dataflow DSL and tests "derived from something I've asked a LLM to perform". The homepage links github.com/carlini.
- **jack-clark.yml: corrected.**
  - Bio: the Anthropic Institute is no longer said to oversee the teams. The leadership page says Clark "leads The Anthropic Institute" and, "in this role, he oversees research teams" (Societal Impacts, Frontier Red Team, Economic Research, Measuring AI Progress, …).
  - Confirmed as written:
    - title "Co-Founder and Head of Public Benefit";
    - Policy Director at OpenAI and earlier technical journalist (leadership page and jack-clark.net/about);
    - founding member of the AI Index at Stanford University, 2017–2024;
    - co-author of GPT-3 and CLIP.
  - The about page's older "Head of Policy" title and its reader count are correctly left out.
- **sam-mccandlish.yml: checked OK.**
  - Leadership page: "Co-Founder and Chief Architect", leading pretraining, research productivity and RL infrastructure. The full bio says McCandlish "built and led a team focused on the science and scaling of machine learning" at OpenAI.
  - Large-batch paper (1812.06162): first author, with OpenAI. Scaling laws: equal contribution; led the research with Kaplan.
  - Codex: Anthropic AI, "work performed while at OpenAI".
  - The current page also says "As Responsible Scaling Officer". The writer left this out, which is acceptable as an omission.

## Totals

- Files checked: 15
- Checked OK: 9
- Corrected: 6 (alec-radford, liam-fedus, jakub-pachocki, bob-mcgrew, amanda-askell, jack-clark)
- Set to draft: 0 new; bob-mcgrew was already draft and stays draft
- Deleted: 0
- Validator: `15 batch file(s): 0 error(s), 0 warning(s)`
