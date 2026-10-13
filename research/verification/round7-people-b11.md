# B11 fact-check (2026-10-13)

All cited sources were fetched today, either with curl (`-A "USASI-factcheck/0.3"`) or with WebFetch. WebFetch was used for the Circle, DigitalOcean, Amazon IR and SEC pages, because they return 403 to curl. No email address or other personal identifier was sent in any request. No browser tools were used, and the repository was not edited.

## Per file

- **adam-selipsky**: checked OK.
  - Amazon's 2024 note supports the 2005 VP hire, the 11 years leading Sales, Marketing and Support, Tableau CEO, Bedrock/Q, and Garman as CEO from June 3.
  - The Circle release (2025-07-22) supports the board appointment, AWS CEO, Tableau and the Salesforce acquisition.
  - Circle's committee page lists Selipsky as "Committee Member" twice. The board seat is recorded only as Circle's official pages state it.
- **alex-smola**: corrected.
  - "one of the four core authors" became "one of the four authors" (bio) and "four listed authors" (work). The d2l.ai site has an "Authors" heading, not "core authors".
  - Licenses (CC BY-SA 4.0 for the book, modified MIT for sample code) are confirmed by LICENSE-SUMMARY.
  - The CV supports the roles and dates.
- **antje-barth**: corrected.
  - Current role "Member of Technical Staff, Amazon AGI Labs" became "Member of Technical Staff — AI Product & Developer Experience, Amazon AGI". This is the wording of the GitHub profile README; "amazon-agi-labs" is only the org handle.
  - The headline and bio were updated to match.
  - The README's "six at AWS" supports the AWS role being past. The MIT-0 license, the 12 chapters and the co-authors are confirmed.
- **bratin-saha**: corrected.
  - `sector: independent` became `null`. No source states that Saha has no organizational role, and a search found no newer role.
  - The DigitalOcean 2024 release confirms the AWS VP/GM title, NVIDIA VP of Software Infrastructure, and the CPTO appointment. The June 2026 release names Vinay Kumar as CPTO.
  - The Amazon Science 2022 post confirms Saha's AWS VP title.
- **byron-boots**: checked OK.
  - The UW faculty page and homepage support the Amazon Professor title, the Robot Learning Lab and the earlier Georgia Tech post.
  - Overland's 2026-04-21 release names Boots as "co-founder and chief executive officer".
  - The GPMP2 README is BSD-licensed, credits the Georgia Tech Robot Learning Lab and lists the RSS 2016 and IJRR papers for citation.
  - The NVIDIA role is still left out, as the writer noted.
- **charlie-bell**: corrected.
  - Removed the work claim that Bell "founded Server Technologies Group and unified engineering at AWS". The Microsoft bio sentence ("held leadership roles at Oracle, founded Server Technologies Group and unified engineering at AWS") is ambiguous about where that group was. The AWS work now rests on the Tenable 8-K release alone.
  - Everything else matches the Tenable release (2026-10-06), Nadella's 2026-02-04 note and the CVPR 2020 page.
- **emily-webber**: checked OK.
  - The Amazon Science post (2026-08-10) lists Webber as a co-author and gives the role "principal machine learning specialist solutions architect on the AWS Trainium team within Annapurna Labs".
  - The Packt repo is MIT-licensed, dated 2023, and its contents match the description.
- **james-mccaffrey**: corrected; still a draft.
  - `sector: independent` became `null`. The blog's about page refers to "any company I work for", so the person is not shown as independent.
  - MSDN archive dates (Dec 2002 – Aug 2019) and the August 2019 bio ("works for Microsoft Research") are confirmed.
- **jeff-barr**: checked OK.
  - Supported by the Jan 2026 roundup ("AWS VP and Chief Evangelist"), jeff-barr.com, the author page (blog started 2004; Trn2 and S3 Tables posts) and "And that's a wrap" (Dec 2024).
- **julien-simon**: corrected.
  - The book date "2019" became "first edition August 2020", citing a new source, julien.org/books. The homepage's "(2019)" conflicts with the books page, which gives August 2020 (first edition) and September 2021 (second edition).
  - The container's `type: open-source` became `null`. Its LICENSE is a "Modified MIT License" that adds conditions excluding some organizations, so it is not an open license. The contribution now says so.
  - "Intel/AMD CPUs" became "Graviton (Arm64) and Intel Xeon (AMD64) instances", as the README states.
- **matt-garman**: checked OK.
  - Supported by the Amazon IR bio, the About Amazon author page, the S-team list ("Matt Garman, CEO, Amazon Web Services") and the 2024 note on EC2, EBS and Compute.
- **pieter-noordhuis**: corrected.
  - `sector: independent` became `null`.
  - The PyTorch 2.14 persons-of-interest page lists "(emeritus) Pieter Noordhuis (pietern)" under Distributed. This is the catalog tie (`pytorch`).
  - The arXiv author lists are confirmed. Gloo commits run 2019-05 to 2020-01, with "Create libuv transport" on 2019-08-27, and Gloo is BSD-licensed.
- **rajeev-rastogi**: corrected.
  - "quoted in Amazon's announcements" became "quoted in Amazon India's July 2026 announcement". Only one announcement is cited.
  - Role, Yahoo Labs, Bell Labs, joining in 2012 and the ICLR 2024 paper are confirmed.
- **rohit-prasad**: corrected.
  - "spent 12 years at Amazon as SVP and Head Scientist…" became "spent 12 years at Amazon… and most recently served as SVP and Head Scientist…". The Boston Dynamics release gives the title only for the most recent role.
  - The CEO role (effective 2026-10-07), Nova, Alexa and BBN are confirmed.
- **stefano-soatto**: checked OK.
  - The Amazon Science page gives "vice president and distinguished scientist, AWS Agentic AI".
  - The UCLA Science Hub lists "Vice President, Agentic AI, Amazon Web Services; Professor, UCLA Computer Science". The DCAB page says "on leave".
  - Both arXiv papers are confirmed: author lists, the Apache 2.0 release of the 8B/32B models, and the CVPR/ICML 2026 venues.
- **swami-sivasubramanian**: checked OK.
  - The author page gives VP of Agentic AI, the product launches, S-team since Sep 2023, Amazon since 2005, and NAIAC May 2022 – May 2025.
  - The Dynamo (SOSP 2007) and DynamoDB (USENIX ATC 2022) author lists are confirmed.
- **tye-brady**: checked OK.
  - Supported by the Delivering the Future 2024 bio, the ICRA 2022 post and the Blue Jay post (2025-10-22). No newer source contradicts the role.
- **vasi-philomin**: checked OK.
  - The Siemens release (2025-06-30, effective July 1, 2025) and the June 2026 release confirm the title. The AWS VP of Generative AI role, Bedrock and Philips are confirmed.
- **werner-vogels**: checked OK.
  - Supported by the official bio on allthingsdistributed.com (CTO, joined 2004 from Cornell), the blog subtitle and recent posts (latest 2026-09-08), the Amazon predictions page (2025-11-25) and the Dynamo paper.

## Totals

- Files checked: 19.
- Checked OK: 10.
- Corrected: 9 (alex-smola, antje-barth, bratin-saha, charlie-bell, james-mccaffrey, julien-simon, pieter-noordhuis, rajeev-rastogi, rohit-prasad).
- Newly set to draft: 0 (james-mccaffrey stays a draft).
- Deleted: 0.
- Validator: `19 batch file(s): 0 error(s), 0 warning(s)`.
