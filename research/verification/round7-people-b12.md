# B12 verification (2026-10-13)

Independent fact-check of `people/*.yml`. I fetched every cited source today, unauthenticated, using curl with the `USASI-factcheck/0.3` user agent. The Intel biography returns 403 to curl, so I fetched it with WebFetch. For arXiv papers I read the PDFs to check affiliations, footnotes and contributor sections.

I found no duplicates in the repository's `content/people` or `content/leaders`, or in other batches. Every profile now rests on a documented tie to a catalog organization or artifact. Mistral AI, Cohere, AI21 Labs, Mobileye, Silo AI and John Snow Labs are kept with `organization_slug: null`.

## Per file

- **albert-jiang**: corrected.
  - Bio before: "since the company's formation in June 2023". After: "Jiang's homepage says … since June 2023". Mistral's about page dates the company to April 2023.
  - Tie confirmed: the CV lists a Research Scientist Intern role at FAIR France, July–October 2022 (meta).
  - Mistral 7B and Mixtral abstracts confirmed: first author, Apache 2.0.
- **amnon-shashua**: corrected. Tense narrowed.
  - Before: Intel bio "who heads its organization". After: "undated newsroom biography … leading its organization … after Intel acquired Mobileye in 2017". Source: Intel bio.
  - Confirmed in the Mobileye July 23, 2026 release: CEO until a successor is named, the chairman offer, the Sachs Chair since 2007, the Dan David Prize (2020) and the NAE (2026).
  - The Intel role stays `current: false`.
- **armand-joulin**: corrected.
  - The Apache 2.0 statement for Gemma 4 is in the report's introduction, not its abstract. Before: "whose abstract says". After: "says".
  - Before: "lead of Google DeepMind's Gemma Team". After: "listed as the lead in the contributor lists of the Gemma 2 and Gemma 3 reports".
  - The FAIR affiliation now attaches only to Bag of Tricks, the paper whose PDF shows it.
  - Headline: "of fastText" became "the fastText papers".
  - Current Google DeepMind role: the Gemma 4 report (arXiv 2607.02770, v2 dated July 24, 2026, "Gemma Team, Google DeepMind") lists Joulin as a core contributor, so it meets the 2026-paper rule.
- **arthur-mensch**: corrected.
  - The DeepMind tie rested on one paper. I added the RETRO paper (arXiv 2112.04426, "All authors from DeepMind", Mensch equal contribution).
  - DeepMind role before: "Researcher; …". After: "Equal-contribution author of the RETRO (2021) and Chinchilla (2022) papers, written at DeepMind".
  - Confirmed: Chinchilla equal contribution and the deepmind.com corresponding author, and Co-founder and CEO on mistral.ai/about.
- **clement-farabet**: corrected, sources only.
  - Superlative blog titles replaced with plain titles.
  - Gemma 3 blog and NVIDIA blog URLs updated to the URLs they now redirect to.
  - Confirmed:
    - VP of Research, Google DeepMind (Gemma 4 byline, Apr 2, 2026);
    - Gemma 4 core contributor;
    - Executive Sponsor / Sponsor on Gemma 1, 2 and 3;
    - NVIDIA VP of AI infrastructure (2022);
    - Torch7 COPYRIGHT "2011-2013 NYU (Clement Farabet)".
- **daniel-de-freitas**: corrected.
  - The LaMDA summary is narrowed to the abstract. Before: "access to external tools". After: "consult external knowledge sources".
  - Google role before: "Researcher". After: "Co-author of the LaMDA paper (work done while at Google, per the paper's footnote)".
  - Confirmed: the Character.AI launch post (Dec 5, 2022) says De Freitas invented and led Meena and LaMDA.
- **david-talby**: corrected.
  - Before: "Before John Snow Labs, Talby built …". After: "The page also describes Talby's experience …".
  - Amazon role narrowed to the page's wording.
  - Confirmed: CEO and creator of Spark NLP, and the Apache-2.0 citation entry naming Kocaman and Talby.
- **jonathan-ross**: checked OK.
  - Groq releases confirm "CEO and Founder" (Apr 2025) and the Dec 24, 2025 licensing release: Ross "will join Nvidia"; Simon Edwards becomes CEO.
  - No official NVIDIA page says the move happened, so no NVIDIA role is recorded.
- **marie-anne-lachaux**: checked OK.
  - The PDFs confirm FAIR (2020), Meta AI (LLaMA) and GenAI, Meta (Llama 2) affiliations.
  - Current role unknown; sector stays null.
- **nick-frosst**: corrected.
  - Google role before: "Researcher listed with Google Brain". After: "Listed with a Google Brain affiliation on papers from 2017 and 2019".
  - Confirmed: the capsules and SNNL PDFs give Google Brain with google.com addresses, NAM v2 lists Frosst at Cohere, and cohere.com/about lists Frosst as co-founder.
- **peter-sarlin**: corrected.
  - The headline "Co-founder and CEO of Silo AI" was outdated. A Zalando AGM 2026 CV (as of March 2026) lists Silo AI CEO 2017–2026, founder and chair of Qutwo Oy and NestAI Oy since 2025, and Aalto Professor of Practice since 2022.
  - Headline is now "former CEO". Those roles are added as current and cited, and sector set to corporate.
  - The AMD role is narrowed to what AMD's releases show.
  - Fixed the amd-silo-complete URL: it pointed to a ".../amd-to-acquire-world-labs..." slug that only redirected.
- **scott-wu**: corrected.
  - Devin source title de-superlatived ("the first AI software engineer" removed).
  - The Windsurf contribution is cut back to the announcement itself; the employee-treatment clause was removed.
  - Confirmed: "Founder and CEO of Cognition" (Cognizant, Jan 28, 2026) and the Wu bylines on the Mar 2024, Jul 2025 and Jul 23, 2026 posts.
- **thomas-scialom**: corrected.
  - Headline before: "Equal-contribution lead author of Meta's Llama 2". After: "Corresponding author of Meta's Llama 2 paper".
  - The current Meta role is now worded "A 2026 paper, the Gaia2 benchmark paper published at ICLR 2026, lists Scialom at Meta SuperIntelligence Labs" (Gaia2, Feb 2026). The affiliation role says the same.
  - Confirmed: Llama 2 equal-contribution corresponding author and Science and Engineering Leadership, Llama 3 core contributor, and ARE lead author.
- **yoav-shoham**: corrected.
  - Before: "chairs the AI Index initiative", from the Stanford profile. The newer Stanford HAI pages list other chairs and Shoham as a Steering Committee member. After: "a member of the steering committee of the AI Index". New source: hai.stanford.edu/ai-index/people-of-ai-index.
  - Cut "for 28 years".
  - Confirmed:
    - Professor Emeritus;
    - AI21 Chairman & Co-Founder and former Google Principal Scientist;
    - the IJCAI 2019 and Allen Newell 2013 awards;
    - Jamba last author, Apache 2.0 (paper body).

## Totals

- Files checked: 14
- Checked OK: 2
- Corrected: 12
- Set to draft: 0
- Deleted: 0
- Validator: `14 batch file(s): 0 error(s), 0 warning(s)`
