# B3 fact-check — 2026-10-13

Every cited source was re-fetched today (curl with `-A "USASI-factcheck/0.3"` or WebFetch, unauthenticated). arXiv author lists and abstracts were checked, and PDFs were checked where a claim depended on an affiliation. All 21 files were checked for identity, current role, catalog tie, privacy, tone and source/ID consistency.

## Per file

- **kevin-scott** — checked OK. The exec bio supports every statement. The Microsoft leadership index still lists the bio, so the CTO role is current.
- **eric-horvitz** — checked OK. The MSR page and homepage give the CSO role, the earlier Microsoft Research director role, Aether, and the Feigenbaum and Newell prizes. The arXiv 2303.13375 and 2311.16452 author lists include Horvitz.
- **peter-lee** — checked OK. The MSR page supports the President, Microsoft Science role, DARPA, the CMU dates, NAM membership, the book, and early GPT-4 access.
- **sebastien-bubeck** — corrected.
  - **Bad source:** `https://sbubeck.com/` doesn't resolve over HTTPS: the TLS handshake fails, and both curl and WebFetch fail. The site works only over http, and the schema allows https only. Removed it from the sources and links.
  - **OpenAI role:** re-sourced to arXiv 2511.16072 ("Early science acceleration experiments with GPT-5", Nov 2025, Bubeck first author, OpenAI affiliation in the PDF) and the gpt-oss card. It stays `current: true`; the http homepage read today also says "I work on AI at OpenAI".
  - **Microsoft role:** "VP AI and Distinguished Scientist (… Theory Group)" → "Vice President, Microsoft GenAI", from the Phi-2 blog byline and the Phi-4 report.
  - **Princeton:** the assistant professor affiliation was cut, because no resolvable source remains.
  - Added the GPT-5 science paper as a work item, and rewrote the headline and bio to match.
- **ronen-eldan** — corrected.
  - **Licence claim:** "publishes the small TinyStories models under the MIT license" overstated it. Only the TinyStories-33M card lists MIT, and a TinyStories-1M thread asks about the licence. Narrowed to "along with the small models trained for the paper".
  - **Newer affiliation:** added OpenAI as `current: false`, from the arXiv 2511.16072 PDF, which lists Eldan at OpenAI in Nov 2025. Sector stays null.
- **yuanzhi-li** — checked OK. The TinyStories, phi-1, phi-1.5, Phi-3 and Phi-4 author lists and the Phi-2 contributors list all include Li, with MSR affiliation in the PDFs. The phi-1.5 report says its data is "almost exclusively" synthetic, and the phi-1_5 card says MIT.
  - "Li, Yuanzhi" also appears on the gpt-oss card. Not added, because a common name on an author list alone can't establish identity.
- **jianfeng-gao** — checked OK. The MSR page supports the Technical Fellow & CVP role, UW adjunct, the Deep Learning Group, and DSSM. The Phi-3, LLaVA-Med and DSSM author lists include Gao, and the Phi-3-mini card says MIT.
- **chris-bishop** — checked OK. The MSR page and PRML page support the Technical Fellow role, AI for Science, Cambridge lab director 2015–2022, Edinburgh honorary professor, the books, and FRS 2017. The co-author's family relation is not mentioned.
- **zico-kolter** — checked OK. The own bio and homepage support the CMU MLD head role, the OpenAI board and SSC chair, the Qualcomm board, and Gray Swan. The arXiv 2307.15043 author list includes Kolter, and the paper links the llm-attacks code. openai.com returns 403, so OpenAI's own page couldn't be cross-checked.
- **mark-russinovich** — corrected (source). The Ignite speaker URL doesn't resolve to a profile: its speaker data is empty, and WebFetch sees only "Speaker details". Replaced it with the Azure Blog author page, `https://azure.microsoft.com/en-us/blog/author/mark-russinovich/`, which has a post dated 2026-10-13 and the title "Chief Technology Officer, Deputy Chief Information Security Officer, and Technical Fellow, Microsoft Azure". The role now uses that exact wording.
- **rangan-majumder** — checked OK. The MSR page says "I'm Vice President of Search and Artificial Intelligence at Microsoft" and the page still exists. Majumder is on the MS MARCO author list.
- **saurabh-tiwary** — set to draft.
  - **Conflicting titles:** the CapitalG page's title line reads "Vice President, Technical Fellow, Google Deepmind", but its bio says "Vice President and General Manager of Cloud AI at Google". No Google page resolving the conflict was found: the Cloud blog author page renders empty.
  - **Supported facts:** the past Microsoft CVP/Technical Fellow/Turing role and the MT-NLG and MS MARCO authorship are supported.
- **misha-bilenko** — set to draft.
  - **Identity and role:** they rest only on the Phi-3 author list; the report is credited to "Microsoft" in the PDF. No official role page exists: the MSR `mbilenko` URL redirects to the generic directory.
  - Affiliation role reworded to "Listed among the authors of the Phi-3 Technical Report, which is credited to Microsoft".
- **xuedong-huang** — checked OK. The Zoom leadership page supports the CTO role, joining in 2023, the Azure AI CTO/Technical Fellow role, the 1993 speech group, human parity milestones, and the fellowships. Huang is on the CNTK author list.
- **li-deng** — checked OK. The UW ECE page supports the 2000–2017 Microsoft roles, Waterloo faculty, and the 2015 SPS award. The current role is correctly left out, since the page's "Citadel since 2017" line is old. The CD-DNN, DSSM and DLMA pages list Deng.
- **dong-yu** — corrected.
  - **Microsoft role:** "Principal Researcher (1998–2017)" → "Principal Researcher (at Microsoft from 1998 until 2017)". The homepage says Yu was at Microsoft "since 1998", not a principal researcher for all of it. The bio was narrowed the same way.
  - **Headline:** "CNTK lead author" → "first author on CNTK".
- **xiaodong-he** — corrected.
  - **JD role:** "…and managing director of JD AI Research" → "Senior Vice President of JD Group (JD.COM)". The MMSP 2025 page's title line says "Managing Director of JD Joy Future Academy" but its bio says "JD AI Research", so only the consistent part is kept.
  - **Ranking cut:** removed "whose approach won the 2017 VQA challenge" and described the method instead.
- **ming-zhou** — checked OK. The Langboat about and résumé pages support Founder/CEO, June 2021, Mengzi, MSRA VP 1999–2020, the IME, Bing Dictionary, XiaoIce, UniLM, ACL Fellow, and ACL president. Zhou is on the UniLM and Mengzi author lists.
- **hsiao-wuen-hon** — checked OK. The MSR page supports Emeritus Researcher, the CVP/MSRA managing director role, the Search Technology Center, Speech Server, and IEEE Fellow. Hon is on the UniLM author list.
- **bill-dolan** — checked OK. The IGLU 2022 PDF organizer bio says "Partner Researcher Manager at Microsoft Research … manages the Natural Language Processing group". The DialoGPT PDF says Microsoft Corporation. The MSRP page supports the corpus, and the DialoGPT repo and card say MIT.
- **hoifung-poon** — checked OK. The MSR Forum page (2025-02-25) supports the GM, Microsoft Health Futures role and the GigaPath details. Poon is on the LLaVA-Med and Medprompt author lists. The page's speaker card now reads "General Manager, Real-World Evidence"; the existing wording ("as introduced in February 2025", `current: false`) is accurate.

## Totals

- Files checked: 21
- Checked OK: 14
- Corrected: 5 (sebastien-bubeck, ronen-eldan, mark-russinovich, dong-yu, xiaodong-he)
- Set to draft: 2 (saurabh-tiwary, misha-bilenko)
- Deleted: 0
- Validator: `21 batch file(s): 0 error(s), 0 warning(s)`
