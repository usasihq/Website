# B8 fact-check: people profiles (2026-10-13)

I checked all 16 files in `people/`. I fetched every cited URL today, unauthenticated (curl with `-A "USASI-factcheck/0.3"`, plus one WebFetch attempt). All 64 cited URLs returned 200. perplexity.ai (all paths) and Yarats's NYU page (cs.nyu.edu/~dy1042) returned 403, so neither is cited.

Catalog slugs used: databricks, uc-berkeley, perplexity, anthropic, stanford-university, ibm, together-ai, openai, meta, mit, plus artifacts terminal-bench, redpajama and helm. All of them are present in ORG_SLUGS.txt or ARTIFACT_SLUGS.txt.

## Per file

- **ali-ghodsi**: checked OK.
  - The DAIS 2026 speaker page gives "CEO and Co–Founder", says Ghodsi became CEO in January 2016 after serving as VP of Engineering and Product Management, and names Ghodsi as an adjunct professor at UC Berkeley and one of the creators of Apache Spark.
  - Bylines confirmed: the USENIX Mesos page (all eight authors at UC Berkeley), the DBRX post (six authors) and the Unity Catalog post (five authors, Apache 2.0, LF AI & Data).
  - The 2023 MosaicML release quotes Ghodsi as Co-Founder and CEO.
  - The DBRX work type stays null: the 2024 post points to GitHub and Hugging Face, but the writer could not re-verify the weights.

- **reynold-xin**: checked OK.
  - The speaker page gives "Co-Founder and Chief Architect, Databricks", and the GitHub profile shows Databricks.
  - The Spark committers page lists Xin under Databricks.
  - Xin is in the byline of the Spark 4.2 post (2026-07-16).
  - Xin is first author on Shark (arXiv 1211.6176) and GraphX (1402.2394).

- **patrick-wendell**: corrected.
  - Before: "committers page quotes Wendell's guidance on when bug fixes should be backported".
  - After: "listed as a committer … with Databricks as the organization".
  - Reason: that page attributes the quote only to the handle "pwendell", not to a name. The work entry is narrowed the same way.
  - The rest is confirmed by the speaker page (Co-Founder and VP of Engineering, leads AI efforts including Genie and Unity Gateway) and the Unity Catalog post byline.

- **andy-konwinski**: corrected.
  - Before: "At Laude, Konwinski co-created the Terminal-Bench benchmark…".
  - After: "Laude co-created the Terminal-Bench benchmark with Ludwig Schmidt's group at Stanford, and Konwinski is a co-author of the paper".
  - Reason: the About page says "At Laude we co-created…".
  - Everything else is confirmed:
    - About page: co-founder of Laude, Databricks and Perplexity; VP Product AI/ML; Learning Spark; founding President; the Research to Startups seminar; Mesos and Spark during grad school.
    - laude.org: "Co-founder, MoTS, Board, Laude Ventures Co-founder and GP", and Konwinski is on the Terminal-Bench team listing.
    - arXiv 2601.11868 author list.
    - Spark committers page.
    - AWS article: Perplexity founders.
    - Mesos page.
  - Sector stays null; Laude's pages do not state what kind of organization it is.

- **arsalan-tavakoli-shiraji**: checked OK.
  - The speaker page gives "Co-founder & SVP of Field Engineering" and lists Tavakoli-Shiraji in the Tuesday keynote.
  - The Unity Catalog post byline is confirmed.

- **naveen-rao**: corrected.
  - Headline before: "Co-founder and CEO of Unconventional AI; co-founded MosaicML and Nervana Systems…".
  - Headline after: "CEO and cofounder of Unconventional AI; founder of Nervana Systems and MosaicML…".
  - Reason: the unconv.ai author page says Rao "founded" both companies, and no source says Rao co-founded Nervana.
  - The bio is confirmed by:
    - the unconv.ai author page and homepage;
    - the 2023 MosaicML release (Co-Founder and CEO at MosaicML);
    - the 2024 Shutterstock release (Vice President of AI at Databricks);
    - the DBRX byline.

- **jonathan-frankle**: checked OK.
  - The homepage says Chief AI Scientist at Databricks, leading research on reinforcement learning, model training and agent evaluation.
  - The homepage also confirms: arrived through the MosaicML acquisition; on the MosaicML founding team; MIT PhD in 2023; the lottery ticket hypothesis was the main line of PhD research.
  - The speaker page and GitHub bio agree.
  - Author lists confirmed: LTH (1803.03635: Frankle, Carbin), MosaicBERT (2312.17482), and the DBRX byline (first of six).

- **hanlin-tang**: checked OK.
  - The speaker page says "CTO - Neural Networks", responsible for Databricks' AI products, and previously co-founder and CTO of MosaicML.
  - The 2026 session title "The Agentic Stack: A Founder Conversation on the Open Infrastructure Powering AI Agents" matches.
  - DBRX byline confirmed.

- **rohan-taori**: checked OK.
  - The homepage says researcher on the pretraining team at Anthropic, Stanford CS PhD advised by Tatsu Hashimoto, and lists equal contribution on Alpaca, AlpacaFarm and AlpacaEval, plus the natural-distribution-shift paper.
  - The GitHub profile shows Anthropic.
  - The stanford_alpaca README lists five grad-student authors who contributed equally, says the base is a 7B LLaMA model, gives code under Apache-2.0, and puts the data and weight diff under CC BY NC 4.0.
  - AlpacaFarm author list and the alpaca_eval Apache-2.0 license confirmed.

- **piero-molino**: corrected.
  - Before: Predibase "built around Ludwig and LoRAX".
  - After: "fine-tuning and serving large language models through Ludwig and LoRAX".
  - Reason: this is what the CV says.
  - The rest is confirmed by the CV at w4nderlu.st/about:
    - Studio Atelico CEO and co-founder;
    - Predibase 2020–2025;
    - Staff Research Scientist at Stanford (Hazy Research), 2020–2021;
    - Uber AI Labs, where Molino created Ludwig;
    - Researcher at IBM Watson.
  - The Ludwig README says it is hosted by LF AI & Data, under Apache-2.0.
  - Location and money on the source page are not used.

- **ce-zhang**: corrected (identity strengthened).
  - The homepage and bio page confirm: CTO of Together; Neubauer Associate Professor at UChicago; formerly ETH Zurich; PhD at UW–Madison and Stanford postdoc, both with Chris Ré; the research focus. The Together About page lists "Ce Zhang — Founder & CTO".
  - The homepage does not list RedPajama or HELM, so the work items rested on the name only. I added sources that tie them to this person:
    - **`helm-pdf`** (arXiv 2211.09110v2, Appendix A): it credits Ce Zhang with managing the Together Research Computer infrastructure for evaluating the open models. The HELM contribution now says this.
    - **`redpajama-html`** (arXiv HTML v1): the listed affiliations include Together AI and the University of Chicago, and the paper releases the RedPajama-V1 and RedPajama-V2 datasets. The RedPajama contribution now says this.

- **vipul-ved-prakash**: checked OK.
  - The Together About page gives "Founder & CEO", and the GitHub profile shows @togethercomputer.
  - The May 15, 2023 post (signed "Co-founder and CEO") supports the founding with Chris, Percy and Ce, the "open and decentralized alternatives" rationale, the GPT-JT, OpenChatKit and RedPajama list, and the cloud platform for training and inference.
  - The funding figures on that page are not used.

- **christopher-re**: checked OK.
  - The homepage and bio.txt confirm: professor in Stanford CS (SAIL, CRFM, ML Group); co-founded companies with students and collaborators; ThunderKittens; Hyena and HyenaDNA; the RedPajama-Data link; MacArthur Fellowship; NeurIPS 2020 test-of-time award.
  - Together About page: "Chris Ré — Founder".
  - Author lists confirmed for FlashAttention, Hyena, HELM and RedPajama.

- **aravind-srinivas**: corrected.
  - BoTNet before: "adds global self-attention to the final bottleneck blocks of a ResNet".
  - BoTNet after: "replaces the spatial convolutions in the final three bottleneck blocks of a ResNet with global self-attention". This is the abstract's wording. I also cited the dissertation for BoTNet, since the dissertation lists it.
  - I retitled the Haas source so the title has no pronoun.
  - Confirmed by:
    - NVIDIA Newsroom, 2026-03-16: "cofounder and CEO of Perplexity";
    - AWS: OpenAI researcher, and the founding team;
    - Haas, 2025-10-21: PhD '21 in computer science;
    - EECS-2021-197: Pieter Abbeel as advisor, with CURL and BoTNet among the articles;
    - arXiv first authorship of CURL and BoTNet.
  - One caveat: the Haas page is a university School News post that is mostly an interview transcript. It is used only for its staff-written lead (Perplexity CEO, PhD '21, prior researcher roles). It is what links the Perplexity CEO to the dissertation author, "Aravind Srinivas Lakshminarayanan".

- **denis-yarats**: corrected (identity and current role re-sourced).
  - The DrQ papers had been matched by name only. They are now tied to the person through matching affiliations:
    - the AWS article's author note says Yarats was an AI Research Scientist at Facebook AI Research from 2016 to 2022, after an NYU PhD;
    - the DrQ PDF (2004.13649v4) lists Yarats at "New York University & Facebook AI Research";
    - the DrQ-v2 PDF (2107.09645v1) lists Yarats at "NYU & FAIR".
    I switched those two sources to the PDF URLs and worded the bio and contributions to match.
  - The current role used to rest on a 2024 page. I added:
    - **`humanx-yarats`**: the HumanX April 2026 speaker page, "Co-founder & CTO, Perplexity";
    - **`draco-paper`**, now the arXiv HTML: DRACO, February 2026, lists Yarats under the Perplexity affiliation.
  - The Meta role is renamed "Meta (Facebook AI Research)" with the role "AI Research Scientist", as the AWS note states.
  - The education claim is not stated in the profile.

- **michael-carbin**: corrected.
  - Before: "including systems built on neural networks, approximate transformations and unreliable hardware".
  - After: "with a focus on systems that operate under uncertainty, such as those implemented with neural networks or run on unreliable hardware". This matches the homepage wording.
  - Confirmed: the MIT CSAIL homepage gives Associate Professor, EECS, Head of the Programming Systems Group. The unconv.ai page gives Senior Fellow and cofounder, Associate Professor at MIT, and founding Advisor for MosaicML. The LTH author list matches.
  - The CSAIL page looks dated, but the newer Unconventional AI page agrees on the MIT role.

## Privacy and tone

- No he/she pronouns in profile text. The only hit is inside the Haas source URL.
- No location, family, age or opinions.
- No superlatives, counts of followers, stars or users, or money in any profile text.
- Source pages that mention money (Predibase sale, Together seed round, the MosaicML deal figure) or location were not used for those details.

## Validator

`cd /tmp/claude-1000/usasi-wt/people && npx tsx /tmp/claude-1000/usasi-growth/validate-batch.ts /tmp/claude-1000/usasi-growth/people/B8` reports 16 batch files, 0 errors, 0 warnings.

I did not edit the repository. `git status` there shows an existing change to `data/jobs/current.json` that this check did not make.

## Totals

- Files checked: 16.
- Checked OK: 8 (ali-ghodsi, reynold-xin, arsalan-tavakoli-shiraji, jonathan-frankle, hanlin-tang, rohan-taori, vipul-ved-prakash, christopher-re).
- Corrected: 8 (patrick-wendell, andy-konwinski, naveen-rao, piero-molino, ce-zhang, aravind-srinivas, denis-yarats, michael-carbin).
- Set to draft: 0.
- Deleted: 0.
