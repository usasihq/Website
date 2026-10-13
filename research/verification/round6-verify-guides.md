# Fact-check: "How to check an AI claim" and "Choosing a local model" explainers

- Checked: 2026-10-13, in a separate pass by a checker who did not write the pages. The author's
  claim table (`claims.md`) was not used. Every cited source was fetched again today with GET
  requests only.
- Files checked: `content/pages/learn-how-to-check-an-ai-claim.mdx`,
  `content/pages/learn-choosing-a-local-model.mdx`, and their registry entries in `lib/learn.ts`
  (title, question, and three takeaways each).
- Each factual sentence was checked against its cited source for support, exact numbers, dates,
  names, and quoted wording, and for any claim broader than the source. Tone was checked too
  (neutral, no rankings or "best" claims), along with labelling of fictional examples and whether
  the takeaways match the body.
- Edits were made directly in the two MDX files. Only the five sentences marked NEEDS FIX were
  changed, plus one Sources entry added for fix C8. Structure, heading ids, and the "All read on
  October 13, 2026." lines are unchanged. Both files still compile with `@mdx-js/mdx`.
- `factCheck: "round6-verify-guides.md"` is now set on both registry entries.

## Totals

| Verdict | Count |
|---|---|
| SUPPORTED | 123 |
| NEEDS FIX | 5 |
| UNSUPPORTED | 0 |

What the fixes do: one sentence now matches Hugging Face's current evaluation-results system. One
sentence on Microsoft Learn is now limited to Windows 10. Two labels ("download size") are no
longer read into Ollama's "Size / Usage" column. The worked example now says its benchmark name is
invented too.

## How sources were fetched

- Tool: `curl` with its default User-Agent (`curl/8.5.0`), with no custom headers and no personal
  data in any header or URL. GitHub files were read from `raw.githubusercontent.com`, and Hugging
  Face cards from `/raw/main/README.md` plus the public `/api/models/...` JSON (for revision and
  license). The page links themselves were confirmed with HTTP 200.
- **ftc.gov**: HTTP 403 to curl for both Workado press releases. Both were then read with WebFetch,
  the fetch tool named in the house brief, which makes GET requests. WebFetch returns a model-made
  extraction, so FTC wording quoted below may not be exact. The figures and the phrase "competent
  and reliable evidence" are confirmed word for word in the FTC's own Federal Register notice on
  govinfo ([FTC-FR] below), so they rest on a fully read primary text.
- **sec.gov**: HTTP 403 to curl for all four SEC URLs (search-filings, reada10k.pdf, the Form D
  notice page, formd.pdf). All four were then read with WebFetch. For the two PDFs, WebFetch saved
  the original binaries, and their text was extracted locally with `pdftotext`, so the 10-K
  bulletin and Form D quotes below are exact. The EDGAR and Form D notice HTML pages rest on
  WebFetch's extraction only. The Form D 15-day rule is also confirmed in 17 CFR 230.503 on govinfo.
  **An editor should spot-check the two FTC releases and the EDGAR search page in a browser.**
- **federalregister.gov** full-text HTML (`/documents/full_text/...`) returned a CAPTCHA "Request
  Access" page. It was not retried or worked around. The JSON API (`/api/v1/...`) worked, and the
  same document was read on govinfo.
- Redirect: `https://ai.google.dev/gemma/docs/gemma_4_license` returns 301 to
  `https://ai.google.dev/gemma/apache_2` ("Apache License 2.0 | Gemma"). That is the page described,
  and the link is the one the Gemma card itself uses, so it was kept.

## Source key (all fetched 2026-10-13)

- [NIST] https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.800-2.ipd.pdf (200); [CAISSI] https://www.nist.gov/caissi/guidelines (200)
- [ARXIV-MOD] https://info.arxiv.org/help/moderation/index.html (200); [ARXIV-VER] https://info.arxiv.org/help/versions.html (200)
- [HF-MC] https://huggingface.co/docs/hub/model-cards (200); [HF-EVAL] https://huggingface.co/docs/hub/eval-results (200); [HF-GATED] https://huggingface.co/docs/hub/models-gated (200); [HF-REPO] https://huggingface.co/docs/hub/repositories (200); [HF-GGUF] https://huggingface.co/docs/hub/gguf (200)
- [FTC-APR] https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-order-requires-workado-back-artificial-intelligence-detection-claims (curl 403; WebFetch OK)
- [FTC-AUG] https://www.ftc.gov/news-events/news/press-releases/2025/08/ftc-approves-final-order-against-workado-llc-which-misrepresented-accuracy-its-artificial (curl 403; WebFetch OK)
- [FTC-FR] https://www.govinfo.gov/content/pkg/FR-2025-05-02/html/2025-07617.htm (200): FTC, "Workado, LLC, f/k/a Content at Scale AI; Analysis of Proposed Consent Order To Aid Public Comment," 90 FR 18857 (May 2, 2025). Used to corroborate the FTC figures; not cited on the page.
- [OSAID] https://opensource.org/ai/open-source-ai-definition (200); [OSD] https://opensource.org/osd (200)
- [GH-LIC] https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository (200); [GH-PERMA] https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files (200)
- [LLAMA] https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE (200; text via raw.githubusercontent.com)
- [OLL-LIB] https://ollama.com/library/gpt-oss (200); [OLL-TAG] https://ollama.com/library/gpt-oss:20b (200, used to check fix L32); [OLL-CLOUD] https://docs.ollama.com/cloud (200); [OLL-MAC] https://docs.ollama.com/macos (200); [OLL-WIN] https://docs.ollama.com/windows (200); [OLL-GPU] https://docs.ollama.com/gpu (200); [OLL-CTX] https://docs.ollama.com/context-length (200); [OLL-FAQ] https://docs.ollama.com/faq (200)
- [OAI-CARD] https://deploymentsafety.openai.com/gpt-oss (200); [OAI-GUIDE] https://developers.openai.com/cookbook/articles/gpt-oss/run-locally-ollama (200)
- [NARA] https://www.archives.gov/federal-register/the-federal-register/about.html (200); [FR-API] https://www.federalregister.gov/api/v1/documents/2026-20321.json (200)
- [GOVINFO] https://www.govinfo.gov/about (200); [CFR101] https://www.govinfo.gov/content/pkg/CFR-2025-title17-vol3/xml/CFR-2025-title17-vol3-sec229-101.xml (200); [CFR503] https://www.govinfo.gov/content/pkg/CFR-2025-title17-vol3/xml/CFR-2025-title17-vol3-sec230-503.xml (200, corroboration only)
- [SEC-EDGAR] https://www.sec.gov/search-filings (curl 403; WebFetch OK); [SEC-10K] https://www.sec.gov/files/reada10k.pdf (curl 403; WebFetch saved the PDF; pdftotext); [SEC-DNOTICE] https://www.sec.gov/resources-small-businesses/exempt-offerings/filing-form-d-notice (curl 403; WebFetch OK); [SEC-FORMD] https://www.sec.gov/files/formd.pdf (curl 403; WebFetch saved the PDF; pdftotext)
- [IA-SAVE] https://help.archive.org/help/save-pages-in-the-wayback-machine/ (200); [IA-USE] https://help.archive.org/help/using-the-wayback-machine/ (200)
- [NV] https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/ (200); [MS] https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/gpu-process-memory-counters-report-wrong-value (200)
- [MLX] https://github.com/ml-explore/mlx/blob/main/README.md (200); [MLXLM] https://github.com/ml-explore/mlx-lm/blob/main/README.md (200)
- [MBA] https://www.apple.com/macbook-air/specs/ (200); [AM] https://support.apple.com/guide/activity-monitor/view-memory-usage-actmntr1004/mac (200)
- [LCPP] https://github.com/ggml-org/llama.cpp/blob/master/README.md (200); [LCPP-Q] https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md (200); [LCPP-PERF] https://github.com/ggml-org/llama.cpp/blob/master/docs/development/token_generation_performance_tips.md (200)
- [LMS-REQ] https://lmstudio.ai/docs/app/system-requirements (200); [LMS-DL] https://lmstudio.ai/docs/app/basics/download-model (200); [LMS-TOS] https://lmstudio.ai/app-terms (200)
- [GEMMA] https://ai.google.dev/gemma/docs/core (200); [G12B] https://huggingface.co/google/gemma-4-12B-it (200; API sha 707f0a3b…); [GGGUF] https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf (200; API sha 29d09777…) and https://huggingface.co/api/models/google/gemma-4-12B-it-qat-q4_0-gguf/tree/main (200); [GLIC] https://ai.google.dev/gemma/docs/gemma_4_license (301 to /gemma/apache_2, 200)
- [GPTOSS] https://huggingface.co/openai/gpt-oss-20b (200; API sha 6cee5e81…)
- Repo files (internal links and USASI claims): `content/pages/methodology.mdx`, `content/pages/contribute.mdx`, `content/pages/glossary.mdx`, `lib/finder.ts`, `lib/hardware.ts`, `app/learn/tools/model-size/page.tsx`, `content/artifacts/*.yml`, `content/organizations/element-labs.yml`, `content/hubs/local-ai.yml`, `lib/learn.ts`.

## Explainer 1: `learn-how-to-check-an-ai-claim.mdx`

### Opening

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| C1 | Name the claim type, then find the document that would have to exist (evaluation, license and files, provider page, developer testing, official text, and an SEC filing for a public company's headcount). | SUPPORTED | Summarizes the body, where each document is sourced (C6–C37). For headcount: Reg. S-K asks for "the number of persons employed by the registrant" [CFR101]. | none |
| C2 | "Then check the date and keep your own dated copy." | SUPPORTED | Guidance, sourced in the date-and-archive section (C39–C47). | none |
| C3 | Screenshots, undated pages, "leaked" files, and scores without their setup are leads to trace, not evidence. | SUPPORTED | Editorial guidance. The reasoning about scores matches NIST's reporting practice (C6). | none |
| C4 | "This page is general information, not legal or investment advice." | SUPPORTED | Disclaimer kept, as the round-4 brief requires for legal and policy topics. | none |

### Seven kinds of claims

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| C5 | Capability examples (*"Scores 92% on a coding test." "Reads any document."*); look for the model card, report or paper, and evaluation code. | SUPPORTED | The examples are unattributed, illustrative claims, not facts. The rest is guidance. | none |
| C6 | NIST AI 800-2 (initial public draft, January 2026) says evaluators should report key details: benchmark version, number and type of test items, exact model version, evaluation protocol, uncertainty estimates. | SUPPORTED | Cover: "NIST AI 800-2 / Initial Public Draft … January 2026". Practice 3.2: "1. Report key evaluation details. Such details include … selected benchmark version(s); number and type of test items …; exact model version(s); details of the evaluation protocol … results of statistical analysis with uncertainty estimates" [NIST]. Listed as "(Initial Public Draft)" [CAISSI]. | none |
| C7 | arXiv says its moderation "is not a peer-review process." | SUPPORTED | "Please note that the arXiv moderation process is not a peer-review process." [ARXIV-MOD] | none |
| C8 | "the results widget on a Hugging Face model page shows numbers parsed from the card's own metadata" | NEEDS FIX | The model-cards doc supports the metadata route: "Results are parsed by the Hub and displayed in a widget on the model page" [HF-MC]. But Hub results can also come from repository files, including community pull requests: "Evaluation scores are stored in model repos as YAML files in the .eval_results/ folder. These results: Appear on the model page…"; "Anyone can submit evaluation results to any model via Pull Request" [HF-EVAL]. As written, the sentence describes only part of the system. | → "and Hugging Face shows evaluation scores on a model page from the card's metadata ([model cards]) or from result files in the model's repository, which anyone can propose through a pull request ([evaluation results](https://huggingface.co/docs/hub/eval-results))." Added "Evaluation Results" to the Hugging Face line in Sources. |
| C9 | The FTC said Workado promoted an AI content detector as "98 percent" accurate, while independent testing showed 53 percent on general-purpose content (April 2025). | SUPPORTED | WebFetch of [FTC-APR] (dated April 28, 2025): "The order settles allegations that Workado promoted its AI Content Detector as "98 percent" accurate…"; "But independent testing showed the accuracy rate on general-purpose content was just 53 percent, according to the FTC's administrative complaint." Corroborated word for word in the FTC's FR analysis: "with over 98 percent accuracy"; "testing shows … could correctly classify non-academic AI-generated text with around 53 percent accuracy" [FTC-FR]. The sentence attributes the figures to the FTC, which is accurate. | none (editor spot-check advised, see fetch notes) |
| C10 | The final order requires "competent and reliable evidence" for such claims (August 2025). | SUPPORTED | WebFetch of [FTC-AUG] (dated August 28, 2025): "…requiring the company to stop advertising the accuracy or efficacy of its … AI content detection products … unless it has competent and reliable evidence showing those products are as accurate as claimed." The same phrase is in Provision I of the proposed order [FTC-FR]. | none (editor spot-check advised) |
| C11 | Openness: ask what was released and under which license. | SUPPORTED | Guidance. | none |
| C12 | OSAID 1.0 requires access to "the preferred form to make modifications to the system": data information, complete code to train and run, and parameters such as weights, each under OSI-approved terms. | SUPPORTED | "A precondition to exercising these freedoms is to have access to the preferred form to make modifications to the system." "…must include all the elements below: Data Information: Sufficiently detailed information about the data used to train the system … Code: The complete source code used to train and run the system … Parameters: The model parameters, such as weights or other configuration settings", each "under OSI-approved terms" or "licenses" [OSAID]. | none |
| C13 | "By that definition, downloadable weights on their own are not enough." | SUPPORTED | The author's note calls this a reading of the "must include all the elements" rule. The definition also says it directly: ""Open Source models" and "Open Source weights" must include the data information and code used to derive those parameters." [OSAID] | none |
| C14 | The OSD says a license "must not restrict anyone from making use of the program in a specific field of endeavor," with use in a business as an example. | SUPPORTED | "The license must not restrict anyone from making use of the program in a specific field of endeavor. For example, it may not restrict the program from being used in a business…" [OSD] | none |
| C15 | Read the license file or card field, not a summary. | SUPPORTED | Guidance. | none |
| C16 | On Hugging Face, a custom license is entered as `other`, with a name and a link. | SUPPORTED | "…specify a custom license by adding other as the license value and specifying the name and a link to the license in the metadata." [HF-MC] | none |
| C17 | GitHub: without a license, default copyright laws apply and "no one may reproduce, distribute, or create derivative works from your work." | SUPPORTED | "…without a license, the default copyright laws apply, meaning that you retain all rights to your source code and no one may reproduce, distribute, or create derivative works from your work." [GH-LIC] | none |
| C18 | Llama 3.1 license: "Built with Llama" on distribution of the model or a product containing it; brings in an AUP; licensees over 700M MAU in the calendar month before the release date must request a license. | SUPPORTED | §1.b.i "If you distribute or make available the Llama Materials … or a product or service … that contains any of them, you shall … prominently display "Built with Llama""; §1.b.iv the Acceptable Use Policy "is hereby incorporated by reference"; §2 "If, on the Llama 3.1 version release date, the monthly active users … is greater than 700 million monthly active users in the preceding calendar month, you must request a license from Meta" [LLAMA]. Version date "July 23, 2024" matches. | none |
| C19 | Availability: find the provider's own page and read what access requires. | SUPPORTED | Guidance. | none |
| C20 | A gated model asks you to share your username and email address with its authors. | SUPPORTED | "By clicking on Agree, you agree to share your username and email address with the model authors." [HF-GATED] | none |
| C21 | Access may need manual approval; authors "can decide at any time to block your access"; they can restrict EU users. | SUPPORTED | "…the requests have to be approved manually by the authors…"; "they can decide at any time to block your access to the model without prior notice"; "…restrict users from European Union countries." [HF-GATED] | none |
| C22 | "Available" can also mean hosted rather than downloadable. | SUPPORTED | "Run models in Ollama's cloud … No model or app download required." [OLL-CLOUD] | none |
| C23 | Ollama's gpt-oss page has a "cloud" tag and lists `gpt-oss:20b-cloud` "with no download size" next to `gpt-oss:20b` at 14GB. | NEEDS FIX | The tag "cloud", `gpt-oss:20b-cloud` with "- · 128K context window", and `gpt-oss:20b` "14GB · 128K context window" are all on the page [OLL-LIB]. The column is labelled "Size / Usage", not download size, so "download size" goes beyond the page. | "with no download size" → "with no size given". |
| C24 | Ollama's docs say cloud models run in Ollama's cloud and do not need to be downloaded. | SUPPORTED | "Run models in Ollama's cloud from your apps or terminal."; "Cloud models do not need to be downloaded." [OLL-CLOUD] | none |
| C25 | Safety: look for the card, framework, and outside reports; "A card is the developer's own account." | SUPPORTED | Guidance. The gpt-oss card is published by OpenAI on its Deployment Safety Hub [OAI-CARD]. | none |
| C26 | The gpt-oss card (August 5, 2025) says OpenAI engaged outside experts (METR, SecureBio, Daniel Kang) "to independently review and validate" its malicious fine-tuning methodology. | SUPPORTED | "Published August 5, 2025"; §5.1.1 "We engaged a small group of external safety experts (METR, SecureBio, and Daniel Kang) to independently review and validate our malicious fine-tuning methodology." [OAI-CARD] | none |
| C27 | 22 recommendations; OpenAI acted on 11; an appendix describes its responses. | SUPPORTED | "In total, 22 recommendations were submitted by external reviewers. We acted on 11 of them…"; "7. Appendix 2: This section describes the recommendations we received … and how we responded." [OAI-CARD] | none |
| C28 | That is still OpenAI's report; the safety explainer covers more. | SUPPORTED | Reasoning. `/learn/safety-testing-and-frameworks/` exists in `lib/learn.ts` and has a "Self-reports and independent checks" section. | none |
| C29 | NARA calls the Federal Register "the daily journal of the Federal government," publishing regulations, proposed rules, notices, EOs, and other presidential documents. | SUPPORTED | "The Federal Register (the daily journal of the Federal government)…"; it lists "Federal agency regulations", "Proposed Rules and Notices…", "Executive orders", "Other Presidential documents" [NARA]. Page "last reviewed on August 8, 2018." | none |
| C30 | It calls FederalRegister.gov "our unofficial version." | SUPPORTED | "You can also access our unofficial version of the Federal Register at www.federalregister.gov." [NARA] | none |
| C31 | govinfo, run by GPO, provides official publications from all three branches and adds digital signatures to PDFs so users can verify they have not been altered. | SUPPORTED | "GovInfo is a service of the United States Government Publishing Office (GPO)…"; "…official publications from all three branches…"; "…digital signatures to PDF files so users can verify documents have not been altered…" [GOVINFO] | none |
| C32 | The policy-sources explainer covers dates, status, and replaced documents. | SUPPORTED | `learn-policy-sources.mdx` has the sections "Names, addresses, and dates can change" and "Check for a superseding document" and covers status (draft, final, revoked). | none |
| C33 | EDGAR offers free access and full-text search across more than 20 years of filings. | SUPPORTED | WebFetch of [SEC-EDGAR]: "Enjoy free public access to millions of informational documents filed by publicly traded companies"; "Find keywords and phrases in more than 20 years of EDGAR filings". | none (editor spot-check advised) |
| C34 | The 10-K bulletin says the company writes the 10-K; the SEC "neither writes the 10-K nor vouches for its accuracy"; laws prohibit materially false or misleading statements. | SUPPORTED | Exact text extracted from the PDF: "The company writes the 10-K and files it with the SEC. Laws and regulations prohibit companies from making materially false or misleading statements in their 10-Ks."; "The SEC neither writes the 10-K nor vouches for its accuracy." Dated "September 2011" [SEC-10K]. | none |
| C35 | 17 CFR 229.101 asks for human capital resources, "including the number of persons employed by the registrant," to the extent material. | SUPPORTED | "(2) Discuss the information … to the extent material to an understanding of, the registrant's business taken as a whole … (ii) A description of the registrant's human capital resources, including the number of persons employed by the registrant…" (2025-04-01 edition) [CFR101] | none |
| C36 | A company selling under certain registration exemptions files a Form D notice within 15 days after the first sale. | SUPPORTED | WebFetch of [SEC-DNOTICE]: "A company must file this notice within 15 days after the first sale of securities in the offering." Rule text: "…no later than 15 calendar days after the first sale of securities in the offering" for offerings under Rule 504 or 506 [CFR503]. | none |
| C37 | The form asks for the total offering amount and the amount sold as of the filing date. | SUPPORTED | Exact PDF text: "Item 13. Offering and Sales Amounts (a) Total Offering Amount … (b) Total Amount Sold"; instructions: "Also enter the dollar amount of securities sold in the offering as of the filing date." [SEC-FORMD] | none |

### Red flags; dating and archiving

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| C38 | Red flags intro ("trace it further," not "false") and seven bullets (no date, screenshot, "leaked," score without setup, no link, secondhand only, future tense). | SUPPORTED | Editorial guidance with no new factual claims. The "score without its setup" bullet matches NIST Practice 3.2 (C6). Neutral tone, no rankings. | none |
| C39 | Write down URL, title, publisher, page date, and read date. | SUPPORTED | Guidance. It matches USASI's own source rule ("title, publisher, URL, publication date … and the date an editor read it", methodology.mdx). | none |
| C40 | GitHub: pressing `y` changes the URL to a permanent link naming the exact commit. | SUPPORTED | "…put a commit ID. This will permanently link to the exact version of the file in that commit…"; "…you can type y to automatically update the URL to the permalink version." [GH-PERMA] | none |
| C41 | A branch link can change, because the version at a branch's head "can change as new commits are made." | SUPPORTED | "The version of a file at the head of branch can change as new commits are made…" [GH-PERMA] | none |
| C42 | Hugging Face models are hosted as Git repositories with version control. | SUPPORTED | "Models, Spaces, and Datasets are hosted on the Hugging Face Hub as Git repositories, which means that version control and collaboration are core elements of the Hub." [HF-REPO] | none |
| C43 | arXiv: each replacement creates a new version; earlier versions stay available; cite a specific version with the full identifier. | SUPPORTED | "Any replacement or withdrawal of that article generates a new version."; "…each version of a work is considered a permanent part of the scientific record and may not be removed."; "Authors can cite each version with the full identifier that includes the version number." [ARXIV-VER] | none |
| C44 | EO 14434 is 91 FR 63129, document 2026-20321. | SUPPORTED | `"citation": "91 FR 63129"`, `"document_number": "2026-20321"`, `"executive_order_number": 14434` [FR-API] | none |
| C45 | Save Page Now gives "a permanent URL for your page," saves a single page, not outlinks; some sites prohibit crawling. | SUPPORTED | "You will instantly have a permanent URL for your page. Please note, this method only saves a single page…"; "…some sites prohibit crawling…"; "It does not save any of the outlinks…" [IA-SAVE] | none |
| C46 | The Wayback timestamp is yyyymmddhhmmss; not every date for every site is complete. | SUPPORTED | "Not every date for every site archived is 100% complete."; "…it translates as yyyymmddhhmmss." [IA-USE] | none |
| C47 | Keep your own copy in case a page cannot be archived. | SUPPORTED | Guidance, consistent with [IA-SAVE] ("some sites prohibit crawling"). | none |

### Worked example; how USASI applies the checks; next steps; Sources

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| C48 | "Example Lab and its post are invented for this page." | NEEDS FIX | The organization and post are labelled fictional, but the benchmark name "CodeBench" is not, so a reader could take it for a real test. | → "Example Lab, its post, and the CodeBench test it names are invented for this page." |
| C49 | Steps 1–6 and the outcome (split the claim; find the source; capability "reported by Example Lab"; a custom license that bars some industries conflicts with the field-of-endeavor rule; gated with manual approval; save, note the commit and date). | SUPPORTED | Fictional and labelled. The one real-world rule it uses (OSD field of endeavor) matches C14. The internal link `/learn/choosing-a-local-model/` exists. No "best" or ranking language outside the quoted fictional post. | none |
| C50 | USASI cites the specific source; order of preference; news only for the specific claim and labelled. | SUPPORTED | "Each claim cites the source that specifically supports it. In order of preference: the applicable license file; model and dataset cards; official documentation and release notes; the project's repository; the organization's own pages; and regulatory filings…"; "Reputable reporting is used only for the specific claim it supports and is labeled as a news report." (methodology.mdx #sources) | none |
| C51 | Each source records its publication date when stated, and the read date. | SUPPORTED | "Every source records its title, publisher, URL, publication date if the page states one, and the date an editor read it." (#sources) | none |
| C52 | Checklists suited to the artifact; model releases get a tier from rubric v0.2, which is not the OSI definition or a certification. | SUPPORTED | "…a checklist suited to what the artifact is."; "…versioned as rubric v0.2. They are not an external certification, and they are not the Open Source Initiative's Open Source AI Definition…" (#openness) | none |
| C53 | No funding, valuations, staffing, or benchmark scores as facts; news written only from primary sources. | SUPPORTED | "It does not publish … staffing, funding, valuations, benchmark scores…" (#sources); "…working only from primary sources…" (#news) | none |
| C54 | "Unknown" means not assessed or insufficient evidence, never a polite "no." | SUPPORTED | "**Unknown** means the item has not been assessed or the evidence is insufficient. It is never a polite way of saying "no."" (#uncertainty) | none |
| C55 | Pages say when a source check was done; no claim of individual human review or hands-on tests. | SUPPORTED | "Pages say when this was done."; "USASI does not currently claim this level for any page"; "No record or finder entry currently claims this…" (#review-levels) | none |
| C56 | Report a correction with entry, statement, and source; accepted corrections are recorded in the changelog. | SUPPORTED | "…the most useful report includes the entry, the specific statement, and a source…"; "Accepted corrections are made in the open and recorded in the changelog." (contribute.mdx #corrections) | none |
| C57 | "What you can do next" links (explainers, glossary anchors, license guide, policy tracker, source library) and the five-item checklist. | SUPPORTED | All four explainer slugs exist in `lib/learn.ts`. Glossary ids `benchmark`, `open-source-ai`, `license-scope`, `gated-download` exist in `glossary.mdx`. `/licenses/`, `/policy/`, `/sources/`, `/changelog/`, `/methodology/` anchors all exist. | none |
| C58 | Sources list (titles and dates). | SUPPORTED | Dates match: NIST January 2026; FTC April 28 and August 28, 2025 (WebFetch date lines); Llama July 23, 2024; gpt-oss card August 5, 2025; NARA last reviewed August 8, 2018; CFR revised as of April 1, 2025; 10-K bulletin September 2011. | Evaluation Results entry added (part of fix C8). |

### Registry entry (`lib/learn.ts`, slug `how-to-check-an-ai-claim`)

| # | Item | Verdict | Evidence | Fix applied |
|---|---|---|---|---|
| R1 | Title "How to check an AI claim"; question "Where is the evidence behind a claim about an AI model, product, policy, or company?" | SUPPORTED | Matches the page's scope. | none |
| R2 | Takeaway 1: name the claim (seven types); each has its own primary document, such as a license file or a filing. | SUPPORTED | Restates the "Seven kinds of claims" section. | none |
| R3 | Takeaway 2: screenshots, undated pages, "leaked" files, and scores without setup are leads, not evidence. | SUPPORTED | Restates the opening and red flags. | none |
| R4 | Takeaway 3: record URL, version or commit, and read date; save a copy, e.g. with Save Page Now, because pages change. | SUPPORTED | Restates "Date what you read, and keep a copy" (C39–C47). | none |

## Explainer 2: `learn-choosing-a-local-model.mdx`

### Opening and Step 1

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| L1 | What you can run depends first on memory: VRAM on a PC, unified memory shared by CPU and GPU on Apple silicon, or system RAM if the CPU works alone. | SUPPORTED | "Arrays in MLX live in shared memory. Operations … can be performed on any of the supported device types without transferring data" [MLX]. CPU-only support in [LCPP] and [OLL-MAC]. | none |
| L2 | Find a published figure for the exact file, including its quantization, and note what it leaves out, such as the context window. | SUPPORTED | Guidance. Gemma's figures "don't include the additional VRAM needed for supporting software or the context window" [GEMMA]. | none |
| L3 | Check that the runtime supports your hardware; read the license. | SUPPORTED | Guidance, sourced in Steps 5 and 6. | none |
| L4 | "A model that fits can still run slowly." | SUPPORTED | 0.1 to 9.1 tokens/s for one model on one machine [LCPP-PERF]; "Models which are large relative to the total RAM … can be slow" [MLXLM]. | none |
| L5 | Speed and quality vary with hardware, settings, and task; USASI does not benchmark, test, or rank models. | SUPPORTED | [LCPP-PERF], [LMS-DL]. Methodology: "No record or finder entry currently claims this [hands-on test]" (#review-levels). | none |
| L6 | "This page is general information." | SUPPORTED | Disclaimer kept. | none |
| L7 | NVIDIA's page lists the RTX 5060 Ti with "16 GB / 8 GB GDDR7." | SUPPORTED | Spec table, column "GeForce RTX 5060 Ti", "Standard Memory Config: 16 GB / 8 GB GDDR7" [NV]. | none |
| L8 | "On Windows, Task Manager's Performance pane shows dedicated GPU memory; Microsoft notes that some GPUs do not use it, and then the counter is missing or reads 0." | NEEDS FIX | The article applies to Windows 10 only: "Applies to: Windows 10 - all editions". It says "To monitor dedicated GPU memory on affected systems, use the Performance pane of Task Manager" and notes "Some GPUs do not use dedicated GPU memory. In those cases, the Dedicated GPU memory counter is either not available or has a value of "0."" [MS]. "On Windows" generalizes beyond Windows 10. | → "For Windows 10, Microsoft says Task Manager's Performance pane shows dedicated GPU memory, and notes that some GPUs do not use dedicated GPU memory, in which case the Dedicated GPU memory counter is not available or reads 0 ([Microsoft Learn])." |
| L9 | MLX README: arrays "live in shared memory" and can be used on the CPU or GPU without transferring data. | SUPPORTED | Quoted at L1. Devices: "(currently the CPU and the GPU)". "…brought to you by Apple machine learning research." [MLX] | none |
| L10 | MacBook Air specs: 16GB unified memory, configurable to 24GB or 32GB. | SUPPORTED | "16GB unified memory / Configurable to: 24GB or 32GB" [MBA] | none |
| L11 | Activity Monitor's Memory tab shows "Physical Memory," the amount of RAM installed. | SUPPORTED | "click Memory…"; "Physical Memory: The amount of RAM installed." [AM] | none |
| L12 | llama.cpp lists CPU support: AVX, AVX2, AVX512, AMX on x86, and Apple silicon optimizations. | SUPPORTED | "AVX, AVX2, AVX512 and AMX support for x86 architectures"; "Apple silicon is a first-class citizen - optimized via ARM NEON, Accelerate and Metal frameworks" [LCPP] | none |
| L13 | Ollama macOS page: M-series "CPU and GPU support," x86 "CPU only." | SUPPORTED | "Apple M series (CPU and GPU support) or x86 (CPU only)" [OLL-MAC] | none |

### Steps 2–4

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| L14 | Weights have to fit, plus working memory that grows with the conversation. | SUPPORTED | "Memory consumption will increase dynamically based on the total number of tokens in your prompt and the generated response." [GEMMA]; [OLL-CTX] | none |
| L15 | "Setting a larger context length will increase the amount of memory required to run a model." | SUPPORTED | Exact sentence [OLL-CTX]. | none |
| L16 | Default context: 4k below 24 GiB, 32k from 24 to 48 GiB, 256k at 48 GiB or more. | SUPPORTED | "< 24 GiB VRAM: 4k context / 24-48 GiB VRAM: 32k context / >= 48 GiB VRAM: 256k context" [OLL-CTX] | none |
| L17 | FAQ: required RAM scales with parallel requests times context length. | SUPPORTED | "Required RAM will scale by OLLAMA_NUM_PARALLEL * OLLAMA_CONTEXT_LENGTH." [OLL-FAQ] | none |
| L18 | llama.cpp offers "CPU+GPU hybrid inference to partially accelerate models larger than the total VRAM capacity." | SUPPORTED | Exact wording [LCPP]. | none |
| L19 | `ollama ps` shows "100% GPU," "100% CPU," or "48%/52% CPU/GPU." | SUPPORTED | "100% GPU means…"; "100% CPU means…"; "48%/52% CPU/GPU means…" [OLL-FAQ] | none |
| L20 | Splitting costs speed; OpenAI's guide: offload to CPU when short on VRAM, "but expect it to run slower." | SUPPORTED | "You can offload to CPU if you're short on VRAM, but expect it to run slower." [OAI-GUIDE] | none |
| L21 | Ollama advises avoiding CPU offload for best performance. | SUPPORTED | "For best performance, use the maximum context length for a model, and avoid offloading the model to CPU." [OLL-CTX] | none |
| L22 | LM Studio calls `Q` options "copies of the same model, provided in varying degrees of fidelity"; quantization compresses files "while giving up some degree of quality." | SUPPORTED | "These are all copies of the same model, provided in varying degrees of fidelity. … compressing model files in size, while giving up some degree of quality." [LMS-DL] | none |
| L23 | It suggests "a 4-bit option or higher if your machine is capable enough for running it." | SUPPORTED | "Choose a 4-bit option or higher if your machine is capable enough for running it." [LMS-DL] | none |
| L24 | Llama 3.1 8B: 14.96 GiB F16, 7.95 GiB Q8_0, 4.58 GiB Q4_K_M. | SUPPORTED | Table for meta-llama/Llama-3.1-8B: F16 "14.96", Q8_0 "7.95", Q4_K_M "4.58" (size GiB) [LCPP-Q] | none |
| L25 | Quantization "may introduce some accuracy loss"; requantizing can severely reduce quality compared with 16 or 32 bits. | SUPPORTED | "This process however, may introduce some accuracy loss…"; "`--allow-requantize` … Warning: This can severely reduce quality compared to quantizing from 16bit or 32bit" [LCPP-Q] | none |
| L26 | Gemma 4 overview (last updated July 8, 2026) gives approximate GPU or TPU memory to load each model, including "20% overhead of loading additional things." | SUPPORTED | "Last updated 2026-07-08 UTC."; "Table 1. Approximate GPU or TPU memory required to load Gemma 4 models based on parameter count, quantization level and 20% overhead of loading additional things." [GEMMA] | none |
| L27 | Gemma 4 12B: 26.7 GB BF16, 13.4 GB SFP8, 6.7 GB Q4_0. | SUPPORTED | Row "Gemma 4 12B: 26.7 GB / 13.4 GB / 6.7 GB" under "BF16 (16-bit) / SFP8 (8-bit) / Q4_0 (4-bit)" [GEMMA] | none |
| L28 | Estimates "only account for the memory required to load the static model weights," without VRAM for supporting software or the context window. | SUPPORTED | "The estimates in the preceding table only account for the memory required to load the static model weights. They don't include the additional VRAM needed for supporting software or the context window." [GEMMA] | none |
| L29 | Memory grows with prompt and response tokens; numbers may change with tool and environment. | SUPPORTED | Quoted at L14; "Note: These numbers may change based on your specific inference tool and environment." [GEMMA] | none |
| L30 | gpt-oss-20b card: MXFP4 quantization of the MoE weights lets it "run within 16GB of memory." | SUPPORTED | "…post-trained with MXFP4 quantization of the MoE weights, making … the `gpt-oss-20b` model run within 16GB of memory." [GPTOSS] | none |
| L31 | OpenAI's guide: best with at least 16GB of VRAM or unified memory. | SUPPORTED | "gpt-oss-20b … Best with ≥16GB VRAM or unified memory" [OAI-GUIDE] | none |
| L32 | "**Download size.** … lists `gpt-oss:20b` at 14GB with a 128K context window. That is the download, not the memory needed…" | NEEDS FIX | The page lists "14GB · 128K context window" under a column labelled "Size / Usage" [OLL-LIB], and the tag page shows the model at "14GB" [OLL-TAG]. Neither calls it a download size. The point that it is not the memory needed with a long context is supported by [OLL-CTX]. | → "**Listed size.** … lists `gpt-oss:20b` at 14GB, under "Size / Usage," with a 128K context window. That is the model's size, not the memory needed once a long context is in use." |

### Steps 5–6

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| L33 | Ollama: macOS Sonoma (14) or newer; Windows 10 22H2 or newer with NVIDIA driver 551.61 or newer. | SUPPORTED | "MacOS Sonoma (v14) or newer" [OLL-MAC]; "Windows 10 22H2 or newer, Home or Pro"; "NVIDIA 551.61 or newer Drivers if you have an NVIDIA card" [OLL-WIN] | none |
| L34 | Hardware page: NVIDIA compute capability 5.0+, AMD through ROCm v7, Apple through Metal, and Vulkan. | SUPPORTED | "Ollama supports Nvidia GPUs with compute capability 5.0+…"; "Ollama requires the AMD ROCm v7 driver on Linux"; "Ollama supports GPU acceleration on Apple devices via the Metal API."; "Vulkan GPU Support" [OLL-GPU] | none |
| L35 | Install pages: models "can be tens to hundreds of GB in size." | SUPPORTED | Same sentence on [OLL-MAC] and [OLL-WIN]. | none |
| L36 | LM Studio Mac: Apple silicon M1–M4, macOS 14.0+, "16GB+ RAM recommended," 8GB Macs with "smaller models and modest context sizes," Intel Macs not supported. | SUPPORTED | "Chip: Apple Silicon (M1/M2/M3/M4). macOS 14.0 or newer is required. 16GB+ RAM recommended. … stick to smaller models and modest context sizes. Intel-based Macs are currently not supported." [LMS-REQ] | none |
| L37 | LM Studio Windows: AVX2 on x64; at least 16GB RAM and 4GB dedicated VRAM recommended. | SUPPORTED | "CPU: AVX2 instruction set support is required (for x64)"; "At least 16GB of RAM is recommended."; "GPU: at least 4GB of dedicated VRAM is recommended." [LMS-REQ] | none |
| L38 | LM Studio's terms name the provider as Element Labs, Inc. | SUPPORTED | "These Terms constitute an agreement between Element Labs, Inc. …"; "Version: August 23, 2026" [LMS-TOS]. `/companies/element-labs/` is published. | none |
| L39 | llama.cpp backends: CUDA, HIP, Metal, Vulkan, SYCL (Intel GPUs), alongside CPU support. | SUPPORTED | Backends table: "CUDA \| Nvidia GPU", "HIP \| AMD GPU", "Metal \| Apple Silicon", "Vulkan \| GPU", "SYCL \| Intel GPU" [LCPP] | none |
| L40 | MLX is an array framework for machine learning on Apple silicon. | SUPPORTED | "MLX is an array framework for machine learning on Apple silicon" [MLX] | none |
| L41 | mlx-lm says models large relative to total RAM "can be slow." | SUPPORTED | "Models which are large relative to the total RAM available on the machine can be slow." [MLXLM] | none |
| L42 | HF: GGUF "is designed for use with GGML and other executors"; usage lists llama.cpp, LM Studio, GPT4All, Ollama. | SUPPORTED | "GGUF is designed for use with GGML and other executors."; "Usage with open-source tools: llama.cpp, LM Studio, GPT4All, Ollama" [HF-GGUF] | none |
| L43 | Read the license for the exact release you download, whoever made the copy. | SUPPORTED | Guidance. | none |
| L44 | gpt-oss-20b: Apache 2.0, per its card. | SUPPORTED | Card metadata `license: apache-2.0`; API sha 6cee5e81… matches revision 6cee5e8 [GPTOSS] | none |
| L45 | Gemma 4 12B instruction-tuned card lists Apache 2.0 and links to Google's license page, which reproduces the Apache License 2.0. | SUPPORTED | `license: apache-2.0`, `license_link: https://ai.google.dev/gemma/docs/gemma_4_license`; API sha 707f0a3b… [G12B]. The link redirects (301) to a page titled "Apache License 2.0 \| Gemma" containing "Apache License / Version 2.0, January 2004 / TERMS AND CONDITIONS…" [GLIC] | none |
| L46 | Llama 3.1 license: "Built with Llama"; derived model name must begin with "Llama"; AUP; separate process above 700M MAU. | SUPPORTED | §1.b.i "…you shall also include "Llama" at the beginning of any such AI model name"; other parts quoted at C18 [LLAMA] | none |
| L47 | `base_model` can name the original, with the relationship marked "quantized." | SUPPORTED | "If your model is a fine-tune, an adapter, or a quantized version of a base model, you can specify the base model…"; "…you can also set it explicitly if needed: base_model_relation: quantized" [HF-MC] | none |
| L48 | A gated download asks you to share your username and email address with the authors. | SUPPORTED | Quoted at C20 [HF-GATED] | none |

### USASI tools, speed, worked example, next steps, Sources

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Fix applied |
|---|---|---|---|---|
| L49 | The finder checks a small set of documented configurations against your input, explains why, and shows what is unverified. | SUPPORTED | `lib/finder.ts` `assess()` builds reasons, checks, and blockers. There are 17 files in `content/finder/`. | none |
| L50 | "Estimated to fit" means a publisher's figure for one exact variant is within your amount, not that USASI ran it; with no figure, the result says evidence is insufficient. | SUPPORTED | `memoryVerdict()`: "Estimated to fit, not tested: the publisher's figure for ${variant} is about…"; "Insufficient evidence: the publisher does not state a memory figure for a specific variant…" | none |
| L51 | Memory pages: 8, 12, 16, 24 GB VRAM; 8, 16, 24, 32, 64 GB Apple silicon. VRAM pages compare only graphics-memory figures; Apple pages compare unified memory with both kinds. | SUPPORTED | `lib/hardware.ts`: `VRAM_AMOUNTS = [8, 12, 16, 24]`, `UNIFIED_AMOUNTS = [8, 16, 24, 32, 64]`. VRAM input sets only `gpuGb`, so system-memory figures give "no-input". The Apple input sets `ramGb` and `memoryVerdict` uses it for graphics figures too ("Apple silicon shares one pool of unified memory"). | none |
| L52 | The model size calculator shows weight-storage arithmetic at 32, 16, 8, or 4 bits and what it leaves out. | SUPPORTED | `app/learn/tools/model-size/page.tsx`: "…at 32, 16, 8, or 4 bits per weight, with the arithmetic shown and what it leaves out." | none |
| L53 | USASI does not benchmark or rank; no record or finder entry claims a hands-on test. | SUPPORTED | methodology.mdx #review-levels, quoted at L5. | none |
| L54 | One 4-bit 30B model on one machine: under 0.1 to 9.1 tokens/s depending only on thread-count and GPU-offload settings. | SUPPORTED | Model "…30B-Uncensored.q4_0.gguf (30B parameters, 4bit quantization…)"; results "-ngl 2000000 \| N/A (less than 0.1)" to "-t 4 -ngl 2000000 \| 9.1". Same machine and command; only flags differ [LCPP-PERF] | none |
| L55 | Quality depends on model, file, and task; test with your prompts and record runtime version, file, context, where it loaded, date. | SUPPORTED | Guidance, consistent with [LMS-DL] and [LCPP-Q] on quality loss. | none |
| L56 | Jo is fictional; choices are not a recommendation; steps labelled Stated/Estimated/Tested; checked October 13, 2026; USASI did not run either model. | SUPPORTED | Clearly labelled as fictional and as not a recommendation. | none |
| L57 | Steps 1–2: guide says gpt-oss-20b best with ≥16GB; Jo has 8 GB; estimated split, which the guide says runs slower. | SUPPORTED | [OAI-GUIDE], quoted at L20 and L31. | none |
| L58 | Step 3: Google's table lists 6.7 GB for 12B at Q4_0, weights only; Google's repo offers a QAT Q4_0 GGUF of the instruction-tuned model, a 6,975,879,296-byte file (about 7.0 GB), plus a smaller mmproj file. | SUPPORTED | [GEMMA] (L27, L28). File tree: `gemma-4-12b-it-qat-q4_0.gguf` size 6975879296, `mmproj-gemma-4-12b-it-qat-q4_0.gguf` size 175115616 [GGGUF]. Card: "optimized with Quantization-Aware Training (QAT)… GGUF (Q4_0)". Revision 29d0977 matches. 6,975,879,296 bytes ≈ 6.98 GB. | none |
| L59 | Steps 4–6: little room left (estimate); E4B 4.5 GB at Q4_0 as fallback; card lists Apache 2.0; LM Studio on Windows needs AVX2 on x64. | SUPPORTED | Row "Gemma 4 E4B … 4.5 GB" (Q4_0) [GEMMA]; GGUF card `license: apache-2.0` [GGGUF]; [LMS-REQ] quoted at L37. | none |
| L60 | Step 7 (Tested) and Jo's outcome; "Another model whose published figure fits could serve as well." | SUPPORTED | Fictional, labelled, and not framed as a recommendation or ranking. | none |
| L61 | "What you can do next" links. | SUPPORTED | `/learn/inference-hardware/`, `/learn/quantization/`, `/learn/hosted-or-local/`, `/learn/how-to-check-an-ai-claim/` exist. `/find/memory/8gb-vram/` and `/find/memory/16gb-apple-silicon/` are generated by `MEMORY_PAGES`. `/hubs/local-ai/` exists. Artifacts `ollama`, `llama-cpp`, `mlx`, `gemma-4-12b`, `gpt-oss-20b`, `llama-3-1-8b` are published. Glossary ids `quantization`, `gguf`, `context-window`, `gpu` exist. | none |
| L62 | Sources list (titles, dates, revisions). | SUPPORTED | LM Studio terms "Version: August 23, 2026"; Gemma overview "Last updated 2026-07-08"; revisions 707f0a3, 29d0977, 6cee5e8 match the API `sha` values; Llama July 23, 2024. | none |

### Registry entry (`lib/learn.ts`, slug `choosing-a-local-model`)

| # | Item | Verdict | Evidence | Fix applied |
|---|---|---|---|---|
| R5 | Title "Choosing a local model for your computer"; question "Which models can my computer run, and what should I check before downloading one?" | SUPPORTED | Matches the page's scope. | none |
| R6 | Takeaway 1: start from VRAM, unified memory, or system RAM; compare a published figure for the exact file. | SUPPORTED | Restates the opening and Step 1. | none |
| R7 | Takeaway 2: Gemma 4 table counts only the weights, not context or supporting software; longer context needs more memory. | SUPPORTED | Restates Step 4 (L28, L29) and Step 2 (L15). | none |
| R8 | Takeaway 3: read the license for the exact release; test speed and answers yourself; a model that fits can still run slowly; USASI does not benchmark or rank. | SUPPORTED | Restates Step 6, "Fitting is not the same as running well", and the opening. | none |

## Tone and format

- Neither page contains rankings, "best" claims, or superlatives outside the quoted fictional post
  in the claim-check worked example. Funding, prices, and counts of staff or users are not stated as
  USASI facts (the 700 million MAU threshold is a license term, quoted as such).
- Both pages keep their "general information" disclaimers, use `<h2 id>` headings, end with a
  Sources section, have no Markdown tables, and compile with `@mdx-js/mdx`.

## For the editor

- Spot-check in a browser: the two FTC Workado releases (C9, C10) and the SEC EDGAR search page
  (C33). curl got 403 from both sites, so their wording here rests on WebFetch's model-made
  extraction. The FTC figures and the "competent and reliable evidence" phrase are corroborated by
  the FTC's Federal Register notice on govinfo (90 FR 18857). If the editor wants every FTC figure
  on a fully readable primary text, that notice could be added to Sources.
- The Gemma license link (L45) is a 301 redirect to `https://ai.google.dev/gemma/apache_2`. It was
  kept because the Gemma card uses that URL.
