# B4 fact-check — NVIDIA roster (2026-10-13)

All 70 cited URLs were fetched today with curl (`-A "USASI-factcheck/0.3"`, unauthenticated), and every one returned 200. I checked identity, current roles, the catalog tie, and each bio, affiliation and work statement against those pages. I also scanned every file for pronouns, superlatives, counts, money and location. The extra pages I fetched to check current roles are listed under each person.

## Per file

- **bryan-catanzaro**: corrected.
  - Bio: "cuDNN, NVIDIA's library of GPU routines" → "cuDNN, a library of optimized deep learning routines for GPUs" (arXiv 1410.0759 abstract).
  - Confirmed: the role (GTC Berlin 2026 speaker list and both NVIDIA author pages); the cuDNN and Megatron author lists; the Megatron README citation and BSD-style LICENSE; the Nemotron 3 leadership and NVFP4 credits; the September 2025 "Open Secret" post.
- **kari-briski**: checked OK.
  - Confirmed: the GTC Berlin 2026 title; the blog bio (IBM, joined 2016); the posts of 2026-03-11, 2026-04-28 and 2026-08-11; the Nemotron 3 leadership credit; the 2026-03-16 release quote.
- **bill-dally**: corrected (source added).
  - The NVIDIA role now also cites the GTC San Jose 2026 speakers page ("Chief Scientist and SVP of Research").
  - Everything else matches the NVIDIA Research profile, the blog bio and arXiv 1510.00149.
- **anima-anandkumar**: checked OK.
  - Caltech profile: Bren Professor, neural operators, the weather model, the IEEE/ACM/AAAI fellowships, and past roles at NVIDIA and AWS.
  - NVIDIA blog: joined in 2018 as director of ML research.
  - Papers and library: the FNO, Voyager and Eureka author lists; the NeuralOperator README (MIT license, official FNO implementation).
- **sanja-fidler**: corrected (source added); stays published.
  - The UofT role now also cites the UofT CS faculty directory, which lists Fidler as Associate Professor.
  - NVIDIA status:
    - The homepage and Vector Institute bio still say VP of AI Research at NVIDIA, but the homepage shows no dates after 2021.
    - The NVIDIA person page returns 403.
    - The former Toronto lab now redirects to the Spatial Intelligence Lab. Its members data (`/labs/sil/members/people.js`) does not list Fidler.
    - The role is kept as `current: false`, as BRIEF rule 3 allows. The CV documents it from March 2022.
  - The catalog tie holds through the past NVIDIA role and the Cosmos co-authorship (arXiv 2501.03575).
- **rev-lebaredian**: checked OK.
  - Both NVIDIA author pages match. The current one has a post dated 2026-08-08, and the GTC Berlin 2026 talk is confirmed.
- **jim-fan**: checked OK.
  - GEAR page: "led by Dr. Jim Fan and Prof. Yuke Zhu".
  - Homepage: the mission, the research highlights, and the 2016 OpenAI internship.
  - Research profile: the MineDojo award at NeurIPS 2022.
  - Author lists: GR00T N1, Isaac Lab, Voyager and Eureka.
  - Isaac Lab README: the citation and the BSD-3 framework license.
- **dieter-fox**: corrected (source added).
  - The NVIDIA role now also cites the UW Allen School profile, which says Fox led NVIDIA's Robotics Research Lab before Ai2. The role text was changed to add "which Fox then led".
  - Confirmed: the Ai2 role (job posting and team page), the UW role, the fellowships, and the GR00T N1 and Cosmos author lists.
- **gavriel-state**: corrected.
  - Newton work: "Wrote" → "Co-wrote, with Spencer Huang and Miles Macklin". The post's byline lists three authors. The post itself was added as source `newton-post`.
  - The GitHub profile ("Senior Director, Simulation and AI @NVIDIA") was added as a current-role source and a link.
  - Confirmed: the Isaac Gym, Orbit and Isaac Lab author lists, and the CONTRIBUTORS.md Acknowledgements entry.
- **mitesh-agrawal**: set to **draft**; one count removed.
  - Confirmed separately: the Positron About page lists the CEO, and Lambda's pages confirm the "Head of Cloud" quote and the blog posts.
  - Draft reason: no primary source links Positron's CEO to the Lambda Mitesh Agrawal.
    - Positron's pages do not mention Lambda.
    - Positron's own press release on PR Newswire does not either.
    - Business Wire returned 403.
    - Only a third-party conference speaker bio (AI Infra Summit) and news items connect the two, and neither is citable.
  - Removed the GPU count ("16 to 512") from the 1-Click Clusters work item.
- **manuvir-das**: checked OK.
  - Western Digital's 2026-05-28 release (gzip-encoded; read after decompressing) confirms the Stonepeak role since April 2025, the board seat, the NVIDIA, Dell EMC and Microsoft roles, and the AI Enterprise launch.
  - The NVIDIA role is correctly marked past.
- **tim-costa**: corrected.
  - Headline: "...; leads NVIDIA's CUDA-X product line" → "VP and general manager of quantum at NVIDIA; earlier led product management for NVIDIA HPC software". The CUDA-X claim comes only from an undated blog bio whose own title line differs, so it is no longer stated as a current fact. The bio keeps it, attributed to the blog.
  - Confirmed: the role and the open-source CUDA-Q in the 2026-09-14 release.
- **richard-kerris**: checked OK.
  - The blog bio matches, with posts through 2026-04-20, including Media2 (2025-01-06) and CloudXR/Vision Pro (2026-03-17).
- **rama-akkiraju**: corrected (source added).
  - The NVIDIA role now also cites the GTC San Jose 2026 speakers page ("VP of AI/ML for IT, NVIDIA").
  - The IBM history matches the NVIDIA Research profile.
- **david-luebke**: corrected.
  - Bio: "presented at HPG 2026" → "which NVIDIA lists under HPG 2026". The profile only lists the venue.
  - The rest matches the research profile and arXiv 2508.18540.
- **aaron-lefohn**: checked OK.
  - Confirmed by the blog bio (VP Graphics Research), the research profile, and the NVIDIA Real-Time Graphics Research lab page ("Team Leader"). The SIGGRAPH 2023 honorable mention is confirmed.
- **simon-see**: checked OK.
  - The PolyU-NVIDIA page and the UNU event page (Oct 2025) give the title.
  - The DyaPlex arXiv author list and the NVIDIA AMRI page list "Simon See".
- **azita-martin**: set to **draft**.
  - The NVIDIA blog author page still says Martin "leads the retail team", but the newest dated activity is a post from June 2025.
  - Martin does not appear on NVIDIA's NRF 2026 page or its GTC 2026 speakers page, and no 2026 official source was found. Das's author page shows that NVIDIA author bios can stay up after someone leaves, so the current role is doubtful.
  - The stated facts themselves match the sources.
- **kimberly-powell**: checked OK.
  - Confirmed: GTC Berlin 2026 "VP/GM, Healthcare"; the blog bio (joined 2008, earlier roles); the posts of 2023-11-28, 2024-01-08 and 2025-01-13.
- **jonathan-cohen**: corrected.
  - The current NVIDIA affiliation was re-sourced. The role now reads "Credited in Nemotron 3 leadership (December 2025) and Nemotron 3 Super contributors (April 2026)". New source `nemotron3-super-report` (arXiv 2604.12374 PDF) lists Jonathan Cohen among the contributors. The bio and the Nemotron work item now mention it.
  - The Senior Director title stays `current: false`, as the writer noted.
  - Removed "about a million hours" from the Granary work item (a count).
  - Confirmed: the blog bio (NeMo, Apple, NVIDIA), the NeMo Guardrails post (2023-04-25) and the Granary post (2025-08-15).

## Totals

- Files checked: 20.
- Checked OK with no change: 9 (kari-briski, anima-anandkumar, rev-lebaredian, jim-fan, manuvir-das, richard-kerris, aaron-lefohn, simon-see, kimberly-powell).
- Corrected: 9 (bryan-catanzaro, bill-dally, sanja-fidler, dieter-fox, gavriel-state, tim-costa, rama-akkiraju, david-luebke, jonathan-cohen).
- Set to draft: 2 (mitesh-agrawal, which also had a count removed; azita-martin).
- Deleted: 0.
- No he/she pronouns, superlatives, money or location were found in any profile text.
- Validator: `20 batch file(s): 0 error(s), 0 warning(s)`.
