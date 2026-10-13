# A10 fact-check (2026-10-13)

Every cited source was re-fetched today with curl and the `USASI-factcheck/0.3` user agent; all URLs returned 200. Identity, current roles, catalog tie, privacy and tone, source quality, and directory fields were checked against the fetched text. No email address or personal identifier was sent in any request.

## Per file

- **abigail-see**: corrected (re-sourced). The Stanford page's "Since January 2022, I am a Research Scientist at Google DeepMind" is undated, so a newer primary source was added. The AlphaEvolve paper (arXiv 2506.13131, June 2025) lists See with Google DeepMind. It is cited as `alphaevolve-paper` on the Google DeepMind affiliation. All other claims match the Stanford page, the arXiv paper and the repository license (Apache 2.0, "Modifications Copyright 2017 Abigail See").
- **aylin-caliskan**: checked OK. Roles match the UW homepage. The paper's authors and abstract match the arXiv page.
- **cho-jui-hsieh**: checked OK. The homepage says "visiting scholar in Google since summer 2018", which is ambiguous, so it stays `current: false`. The LAMB and Lion authors and abstracts match arXiv.
- **christopher-manning**: checked OK. The homepage (last modified 2026-06-28), the GloVe Anthology page and the Stanza README (citation and Apache 2.0) all match.
- **colin-raffel**: corrected (wording). In the bio, "the lab works on…" became "Raffel's lab works on…", as the homepage says ("My lab"). The CV positions, the T5 paper (it names C4) and the repository's Apache 2.0 license all match.
- **danqi-chen**: corrected (count). In the RoBERTa work item, "Listed among the ten authors" became "Listed among the authors". The homepage (September 2026) supports Thinking Machines Lab for AY 25–26 (recorded as past), FAIR and Google DeepMind. SimCSE is under the MIT license.
- **emily-bender**: checked OK. Title, CLMS and CL Lab roles, and ACL board service match the homepage. The Grammar Matrix page lists Bender first among contributors and gives the MIT license. TACL 2018 matches the Anthology.
- **graham-neubig**: checked OK. The CMU page gives Associate Professor. The OpenHands About page lists "Graham Neubig, Chief Scientist". The GitHub profile reads "Carnegie Mellon University / OpenHands". The repository is under the MIT license. The OpenHands and SOTOPIA authors match arXiv.
- **graham-taylor**: corrected (narrowed). "NeurIPS 2024 Datasets and Benchmarks paper" became "paper presenting BIOSCAN-5M (journal reference NeurIPS 2024)", because arXiv shows only "Journal reference: NeurIPS 2024". The CV confirms Courant 2009–2012 and Google Brain Visiting Faculty 2018–2019.
- **hyung-won-chung**: corrected and published. The homepage at hwchung2.github.io still says "I am a Research Scientist at OpenAI", but GitHub's commit feed and the Last-Modified header date it to 2025-07-09. Co-author Jason Wei's homepage now says Wei works at Meta Superintelligence Labs. No current official page, Meta or other, confirms Chung's present role, and arXiv has no Chung paper after April 2025. Changes:
  - OpenAI `current: true` became `current: false` (the role is documented by the homepage);
  - `sector: corporate` became `null`;
  - the bio now describes the OpenAI work without asserting it is current;
  - `draft` became `published`, since every remaining claim is verified.

  The Flan paper (abstract: "publicly release Flan-T5 checkpoints") and the model card (apache-2.0) match.
- **jason-wei**: checked OK. The homepage says "I currently work at Meta Superintelligence Labs. From 2023 to 2025, I was at OpenAI". It also states a nationality, which is correctly left out of the profile. The CoT, FLAN and Flan-scaling papers match arXiv.
- **kristina-toutanova**: corrected (newest source). The Google Research profile still says "Google AI Language", but the newest primary source lists Toutanova at Google DeepMind. That source is arXiv 2509.22445 (ICLR 2026, v3 March 2026), and the 2025 data-mixtures paper agrees. Changes:
  - the affiliation went from "Google / google / Research scientist, Google AI Language" to "Google DeepMind / google-deepmind / Research scientist", citing `google-profile` and the new `mdl-paper`;
  - the headline and the bio's first sentence were updated to match.

  UW Affiliate Assistant Professor, Microsoft Research before 2017, and BERT (authors, Apache 2.0) all match.
- **kyunghyun-cho**: corrected (count). "one of the three founding Editors-in-Chief" became "a founding Editor-in-Chief" of TMLR. All roles and dates match the homepage. The encoder-decoder and attention paper authors match arXiv.
- **luke-zettlemoyer**: corrected (newest source). The Meta role went from "Research Director" (the Allen School page) to "Senior Research Director, Meta FAIR", as the personal homepage says (it has updates through November 2025). The homepage was added as source `lsz-site`, and the headline and bio were updated. "ten authors" became "authors" in the RoBERTa item. The QLoRA and ELMo details match arXiv.
- **maarten-sap**: checked OK. CMU LTI (courtesy HCII) and the Ai2 part-time role match the homepage. The SOTOPIA, SOTOPIA-Eval and SOTOPIA-hard details match the abstract.
- **michael-collins**: kept as draft, with edits. The Columbia homepage was last modified April 2020 (it shows "Current teaching (Spring 2020)"), and the current Columbia CS faculty directory does not list Collins. The Google Research profile has no title or date. The newest primary source is InfAlign (arXiv 2412.19792, ICML 2025, v5 August 2025), which lists Collins with Google DeepMind. Edits:
  - the bio now says the Columbia homepage lists teaching through Spring 2020;
  - the bio mentions the 2025 Google DeepMind listing, cited as the new `infalign-paper` source on the Google affiliation.

  No current official page confirms the present role or title, so the file stays draft. The 2025 paper's co-authors match the Google NLP group on the Google profile, so identity is consistent.
- **mohit-iyyer**: checked OK. UMD (lab moved January 2025), past UMass and AI2 Young Investigator, NoCha and BEARCUBS all match the homepage. The ELMo authors include Iyyer.
- **nanyun-peng**: checked OK. Google Senior Staff Research Scientist, UCLA (on leave), PLUSLAB and the USC/ISI roles match the homepage. Plan-And-Write matches arXiv.
- **saadia-gabriel**: checked OK. UCLA, UCLA NLP co-director, MARS Lab and the past NYU and MIT CSAIL fellowships match the homepage. MRF matches arXiv.
- **sameer-singh**: checked OK. UCI Professor (2024–current), Spiffy AI Cofounder/CTO (2023–current), Ai2 Allen Fellow 2021–2023 and UW postdoc 2013–2016 match the homepage. The LIME and CheckList authors match arXiv.
- **su-lin-blodgett**: checked OK. The homepage gives Mila independent visiting researcher (April 2026) and past Microsoft Research FATE principal researcher and postdoc. The paper matches arXiv. `sector` stays null.
- **swabha-swayamdipta**: checked OK. Gabilan Assistant Professor, USC CAIS Associate Director and Amazon Scholar match the homepage. The repository is Apache-2.0, and the paper lists Swayamdipta as first author.
- **timnit-gebru**: checked OK. The DAIR profile gives founder and executive director, and past co-lead of Google's Ethical AI team. The departure circumstances on that page are correctly left out. Both papers match arXiv. `sector` stays null.
- **yulia-tsvetkov**: checked OK. UW, the CMU adjunct role (previously assistant professor) and the Stanford postdoc match the homepage. Spurious Rewards matches arXiv.

Every file was also scanned for he/she pronouns, superlatives, counts of followers, stars or staff, money, location and nationality. None remain. All arXiv `published_at` values match arXiv's citation dates.

## Totals

- Files checked: 24
- Checked OK, unchanged: 15
- Corrected: 8 (abigail-see, colin-raffel, danqi-chen, graham-taylor, hyung-won-chung, kristina-toutanova, kyunghyun-cho, luke-zettlemoyer)
- Set to or kept as draft: 1 (michael-collins)
- Deleted: 0
- Validator: `24 batch file(s): 0 error(s), 0 warning(s)`
