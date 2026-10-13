# B10 fact-check — IBM, Red Hat, enterprise open-source AI (2026-10-13)

The checker fetched every cited source today, without logging in. It used curl with the `USASI-factcheck/0.3` user agent. GitHub was read through the public pages and the unauthenticated API, and arXiv through the abstract, HTML and PDF pages, which show author affiliations. None of the profiles exists in the repository's `content/people` or `content/leaders`. Every slug is claimed by B10 in `claims.tsv`. The catalog slugs used (`ibm`, `red-hat`, `harvard-university`, `granite`) are all in ORG_SLUGS or ARTIFACT_SLUGS. The text was scanned for he/she pronouns, superlatives, counts, money and location; none remain.

## Per file

- **arvind-krishna — corrected.** The role and the IBM history check out against the newsroom bio, the IR senior-leadership page and the newsroom leadership page.
  - Red Hat work entry, before: "which brought Red Hat into IBM alongside its hybrid cloud business" (a paraphrase the bio doesn't make).
  - After: the acquisition, plus the fact that IBM's senior-leadership page lists the CEO of Red Hat. Now cites `ibm-senior-leadership` too.
- **dario-gil — corrected.**
  - The DOE bio confirms that Gil is Under Secretary for Science and was formerly IBM SVP and Director of Research. It also supports the MIT-IBM Lab, AI Alliance and NAE statements.
  - The DOE fact sheet of 2026-10-08 still quotes "Under Secretary for Science Dr. Darío Gil". It was added as `doe-fact-sheet` to show the role is current.
  - Bio, before: "overseeing programs that include advanced computing and the National Laboratories". After: "an office that supports the National Laboratories and is responsible for programs including advanced computing" (the DOE wording).
  - The MIT-IBM work entry now notes that mitibm.mit.edu presents the lab as the MIT-IBM Computing Research Lab (source `mitibm-home` added).
- **sriram-raghavan — corrected.**
  - New source `ibm-newsroom-bio` (in.newsroom.ibm.com/Sriram-Raghavan). It explicitly gives the current title "General Manager, IBM Software, India and Software Innovation Lab" and says "Previously … Vice President, IBM Research AI". This confirms the writer's current/past split, which before rested only on the research.ibm.com title field.
  - The role was spelled out from "GM" to "General Manager".
  - SystemT, before: "IBM's declarative information extraction system". The ACL page has no abstract, so this wasn't supported. After: the paper is cited by its exact title.
- **ruchir-puri — corrected.**
  - The profile, CodeNet (first author), Granite Code (co-author, Apache 2.0) and ITBench were all checked against their sources.
  - CodeNet, before: "dataset available for download from IBM's Apache-2.0-licensed repository". After: the repository's code is Apache-2.0, and the repository provides tools and a download link. The Apache license belongs to the repository, not necessarily to the dataset.
- **david-cox — checked OK.**
  - Title "VP, AI Foundations" matches both the IBM Research and the MIT-IBM pages, as does the past Harvard Loeb associate professorship.
  - Co-authorship of Granite Code and Granite Embedding, both Apache 2.0, is confirmed.
  - Hyperopt: the IBM profile says Cox's Harvard lab started it, Cox co-authored the ICML 2013 paper (Bergstra, Yamins, Cox), and LICENSE.txt is BSD 3-clause.
- **aleksandra-mojsilovic — corrected.**
  - Bio, before: "joined IBM Research in 2000". After: "joined IBM in 2000" (the blog says IBM).
  - Identity link added: IBM Research's 2018 "Introducing AI Fairness 360" post (`ibm-aif360-blog`) lists "Saška Mojsilović" among the AIF360 team members, matching "Aleksandra Mojsilovic" on the arXiv paper.
  - The past role, sector null and the AIF360/AIX360/FactSheets authorship are confirmed.
  - No current role is stated; kept published.
- **kush-varshney — checked OK.** The homepage and IBM profile confirm "IBM Fellow", "directs Human-Centered Trustworthy AI research", the co-director role 2015–2023, the toolkits plus Granite Guardian, and the 2022 book. Varshney is a Granite Guardian author, and the repository and model card are apache-2.0. The birth and address details on those pages are correctly left out.
- **francesca-rossi — checked OK.** The title, the 20 years at Padova, the research areas, and the IJCAI/AAAI presidencies and fellowships all match the IBM profile. Rossi is an author of "Thinking Fast and Slow in AI". SOFAI-LM is listed on the profile as a 2026 AAAI tutorial.
- **hendrik-strobelt — checked OK.** The title, the Explainability Lead role, joining IBM in 2017, and the Harvard SEAS postdoc are all confirmed. GLTR is confirmed through the arXiv paper, the repository's "A project by…" line (MIT-IBM Watson AI Lab and HarvardNLP collaboration) and its Apache-2.0 license. Strobelt is first author of LSTMVis.
- **michael-hind — corrected (minor).**
  - Bio, before: "earlier programming-language projects such as Jikes RVM and WALA". The profile does not say "earlier", so the word was dropped.
  - Everything else matches the IBM profile and the arXiv author lists: the title, the AIF360, AIX360, FactSheets and Granite Guardian authorship, AI Atlas Nexus (Apache 2.0), and the 2012 SIGPLAN award.
- **marina-danilevsky — checked OK.**
  - Title as on the IBM profile.
  - MTRAG: Danilevsky is last author, and the repository is Apache-2.0 with the data and corpora.
  - MTRAG-UN: the repository's BibTeX lists Danilevsky as an author.
  - Label Sleuth: Danilevsky is an author, with an IBM Research affiliation in the PDF. The location on the IBM page was left out.
- **hani-jamjoom — corrected and set to draft.**
  - The affiliations are confirmed in the papers themselves. The GPU-CC paper (arXiv HTML) gives "IBM Research", the 2018 paper (latest PDF) gives "IBM Research", and the QCSC paper gives "IBM T.J. Watson Research Center".
  - Bio, before: "recent papers about the systems that run AI workloads" and "helped examine the security…". The QCSC paper is about quantum and HPC, not AI workloads, and the paper doesn't describe a specific role for Jamjoom.
  - After: "co-author of papers on computing systems and their security". The 2018 paper is now dated as "first submitted in 2018"; Jamjoom was added in a later arXiv version.
  - Why draft: there is no official profile and no documented current role, and the AI tie is indirect (security of the infrastructure under AI workloads). The editor should decide.
- **ranit-aharonov — checked OK.**
  - The Nature 2021 paper confirms that Aharonov is last author and has an IBM Research AI affiliation.
  - The paper's contributions statement says Aharonov co-designed and built the system, designed the evaluation framework, co-wrote the paper and led the team with Slonim.
  - Label Sleuth: Aharonov is an author with an IBM Research affiliation; the repository is Apache-2.0.
  - No current role; kept published as a past tie.
- **avi-sil — checked OK.**
  - IBM's July 2022 blog says Sil led the Dr. Decr and GAAMA models that PrimeQA is based on.
  - IBM's publication page lists "Avi Sil" (IBM-affiliated at the time) for the PrimeQA paper that arXiv credits to "Avirup Sil". This establishes that the two names are the same person.
  - Avirup Sil is an author of Granite Embedding, which is Apache 2.0, and the PrimeQA repository is Apache-2.0 (per the GitHub API).
- **kate-soule — checked OK.** The title "Director, Technical Product Management, Granite", the earlier MIT-IBM lab membership-program role, and the publications all match the IBM profile. Soule is an author of Granite Embedding.
- **priya-nagpurkar — corrected.**
  - IBM Research's 2026-03-24 llm-d/CNCF post confirms the quote and the title "vice president of AI platform at IBM Research". The 2023 IBM posts confirm the earlier title.
  - Both papers list Nagpurkar under IBM Research in the PDFs.
  - A 2026 conference speaker bio (sched.com) suggests a different, possibly newer title, "VP of AI-native Systems research". It returns 403 to fetches and is not a primary source.
  - Before: headline, bio and role stated "Vice President of AI Platform" as the current title.
  - After: the profile now dates the title — "a vice president at IBM Research … titled vice president of AI platform in March 2026" — and the role reads "(as titled by IBM Research in March 2026)".
- **matt-hicks — checked OK.**
  - The Red Hat bio and leadership page give President and CEO (since 2022), the earlier EVP Products and Technologies role, the OpenShift founding engineer role, OpenShift AI and Inference Server, Neural Magic and vLLM, and the early IBM roles.
  - The IBM IR page gives "Senior Vice President and CEO of Red Hat".
  - Wording was already toned down from the bio's superlatives.
- **ashesh-badani — checked OK.** The title, responsibilities, earlier SVP Cloud Platforms role, OpenShift expansion, the JBoss start and the acquisitions role all match the Red Hat bio and leadership list. The counts in the bio were correctly left out.
- **chris-wright — corrected (minor).**
  - The title is confirmed.
  - Bio, before: "works with its ecosystem of associates, customers…". After: "co-creates technologies", which is closer to the source.
  - Linux kernel work: `type: open-source` became `type: null`. The cited bio doesn't state a license, and there is no repository source.
- **steven-huels — checked OK.**
  - The current author page (/authors/steven-huels-0) gives "Vice President of AI Engineering", the previous VP and GM role in the AI Business Unit, more than 20 years of experience, and that Huels was one of the founders of Open Data Hub and brought it to market as OpenShift AI.
  - The earlier author page shows "General Manager, AI Business Unit".
- **stefanie-chiras — checked OK.**
  - The bio text and the leadership list both give "Senior Vice President, The Open Accelerator". The page heading says "AI Innovation Hub"; the writer's choice is documented in NOTES.
  - The earlier RHEL SVP/GM role and the IBM Cognitive Systems VP role are confirmed. The location (the Massachusetts hub) was correctly left out.

## Totals

- Files checked: 21
- Checked OK, no changes: 12 (david-cox, kush-varshney, francesca-rossi, hendrik-strobelt, marina-danilevsky, ranit-aharonov, avi-sil, kate-soule, matt-hicks, ashesh-badani, steven-huels, stefanie-chiras)
- Corrected: 8 (arvind-krishna, dario-gil, sriram-raghavan, ruchir-puri, aleksandra-mojsilovic, michael-hind, priya-nagpurkar, chris-wright)
- Corrected and set to draft: 1 (hani-jamjoom)
- Deleted: 0
- Validator: `21 batch file(s): 0 error(s), 0 warning(s)`
