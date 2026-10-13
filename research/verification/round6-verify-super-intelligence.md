# Fact-check: "What Super Intelligence means" explainer, policy page, and video script

- Checked: 2026-10-13, by an independent pass. The drafter's `verification.md` and `raw/` copies were
  not used. Every source below was re-fetched today with GET requests only.
- Files checked: `explainer-draft.md` (MDX body and Sources), `explainer-data.ts` (registry entry,
  takeaways, source records), `policy-eo-14434.md`, `video-script.md`.
- Corrected copies: `explainer-draft.checked.md`, `explainer-data.checked.ts`,
  `policy-eo-14434.checked.md`, `video-script.checked.md`. Only the sentences marked NEEDS FIX were
  changed. The corrected MDX body compiles with `@mdx-js/mdx`. The repo was not edited.

## Totals

| Verdict | Count |
|---|---|
| SUPPORTED | 72 |
| NEEDS FIX | 23 |
| UNSUPPORTED | 0 |

Most fixes narrow the scope of the order. It covers the executive branch, so "federal government
writing", "official name", "federal document", and "renames" claimed too much. Other fixes correct a
misattributed quote subject, a dropped word in the I. J. Good paraphrase, uncited or overgeneral
descriptions ("usually", "mainly", "some companies", "philosopher"), and a watch-list claim that is
only partly true.

## How sources were fetched

- Tool: `curl` with its default User-Agent (`curl/8.5.0`), no custom headers, and no personal data
  in any header or URL. WebFetch was used once (see cbsnews.com).
- **state.gov**: HTTP 403 for `https://www.state.gov/` on 2026-10-13. This was recorded and not
  retried or worked around, so no State Department page could be checked.
- **x.ai** (homepage): HTTP 403. Not needed, because `docs.x.ai/overview` returned 200.
- **cbsnews.com**: curl returned HTTP 406. The page was then read with WebFetch, the fetch tool named
  in the house brief, using a GET request. WebFetch returns a model-made summary, so the CBS wording
  quoted below may not be exact. CBS is used only for attributed, reported-only items. An editor
  should spot-check the article in a browser before quoting it.
- **uscode.house.gov**: its section 9401 view returned "Page Not Found" because the site is in a
  temporary format. "Still uses 'artificial intelligence'" rests on the govinfo 2024 edition and on
  the order's own reference to the "existing statutory definition" (sec. 3(b)(i)).
- Federal Register API searches today: "Super Intelligence Force" returned 0 documents; "Accord on
  Super Intelligence" returned 0; "Super Intelligence" since 2026-09-01 returned 3 (EO 14434,
  EO 14432, and the National Energy Dominance Month proclamation). whitehouse.gov search: no page
  about a "Super Intelligence Force" or an accord.

## Source key (all fetched 2026-10-13)

- [EO-PDF] https://www.govinfo.gov/content/pkg/FR-2026-10-02/pdf/2026-20321.pdf (200)
- [EO-WH] https://www.whitehouse.gov/presidential-actions/2026/09/inaugurating-the-era-of-super-intelligence/ (200; text matches the FR text)
- [FR-API] https://www.federalregister.gov/api/v1/documents/2026-20321.json (200)
- [FS] https://www.whitehouse.gov/fact-sheets/2026/09/fact-sheet-president-donald-j-trump-inaugurates-the-era-of-super-intelligence/ (200)
- [VID] https://www.whitehouse.gov/videos/president-trump-participates-in-a-meeting-and-luncheon-on-super-intelligence/ (200)
- [UN] https://www.whitehouse.gov/releases/2026/09/president-trump-at-the-united-nations-while-others-have-talked-i-have-acted/ (200)
- [KYOTO] https://www.whitehouse.gov/releases/2026/10/us-leads-international-coalition-to-endorse-kyoto-vision-for-a-golden-age-of-science/ (200)
- [EO14432] https://www.govinfo.gov/content/pkg/FR-2026-10-02/pdf/2026-20319.pdf and https://www.federalregister.gov/api/v1/documents/2026-20319.json (200)
- [USC] https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap119-sec9401.htm (200)
- [NIST-SI] https://www.nist.gov/super-intelligence (200). https://www.nist.gov/artificial-intelligence returns 301 to it.
- [NIST-STD] https://www.nist.gov/super-intelligence/super-intelligence-standards (200). /artificial-intelligence/ai-standards returns 301 to it.
- [NIST-CAISSI] https://www.nist.gov/caissi (200). /caisi and /aisi return 301 to it.
- [NIST-NEWS] https://www.nist.gov/news-events/news (200; no CAISSI or renaming notice listed)
- [XAI] https://docs.x.ai/overview (200)
- [BOS] https://nickbostrom.com/papers/how-long-before-superintelligence/ (200)
- [BOS-HOME] https://nickbostrom.com/ (200)
- [SEP] https://plato.stanford.edu/entries/ethics-ai/ (200)
- [SSI] https://ssi.inc/ (200)
- [AP] https://www.click2houston.com/news/politics/2026/09/23/us-diplomats-told-to-say-super-intelligence-not-artificial-intelligence-after-trumps-call/ (200)
- [ABC] https://abcnews.com/Politics/president-donald-trump-announces-creation-super-intelligence-force/story?id=136986122 (200; datePublished 2026-10-04T15:53Z)
- [CBS] https://www.cbsnews.com/news/ai-super-intelligence-force-trump-jay-clayton/ (curl 406; WebFetch OK)
- [STATE] https://www.state.gov/ (403)
- [WATCH] repo file `research/watchlist.md` (read only)
- [FR-SEARCH] Federal Register API term searches (see above)

## Explainer: MDX body (`explainer-draft.md`)

### Opening and "What the term means now"

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Suggested correction |
|---|---|---|---|---|
| E1 | "In U.S. federal government writing, 'Super Intelligence' (SI) is now the official name for what was called artificial intelligence (AI)." | NEEDS FIX | The order covers only the executive branch: "the executive branch shall use the terms 'Super Intelligence' and 'SI' in place of..." (sec. 1). Statutes, Congress, and courts are outside it, and sec. 2(b) leaves past documents unchanged. NIST says it "is working to update its communications", so the change is still under way. [EO-PDF], [NIST-SI] | "In the executive branch of the U.S. federal government, 'Super Intelligence' (SI) is now the term agencies are directed to use in place of 'artificial intelligence' (AI)." |
| E2 | "EO 14434, signed on September 29, 2026, directs executive agencies, to the extent the law allows, to use the new term, and it defines Super Intelligence by the same legal definition that covers AI, so it renames today's technology rather than announcing a new one." | NEEDS FIX | Signing date, scope, and definition are supported: "To the maximum extent permitted by law, executive departments and agencies (agencies) shall use..." (sec. 2(a)); "For purposes of this order... mean the technologies and systems encompassed by the term 'artificial intelligence' as defined in section 9401(3)" (sec. 3(a)). "Renames" overstates this, because the order sets which term agencies use and the mapping applies only "for purposes of this order". [EO-PDF], [FR-API] signing_date 2026-09-29 | "...so for the order's purposes the new name covers the same technologies rather than a new kind of system." |
| E3 | "Before the order, 'superintelligence' usually meant something else: a possible future intellect much smarter than the best humans in nearly every field." | NEEDS FIX | The meaning is supported: "an intellect that is much smarter than the best human brains in practically every field" [BOS]. No source supports "usually", which is a claim about general usage. | "In earlier research and philosophy, 'superintelligence' meant something else: ..." |
| E4 | Page explains both meanings, has a timeline, lists unconfirmed items; "general information, not legal advice." | SUPPORTED | Describes the page itself. The disclaimer is kept, as the round-4 brief requires. | none |
| E5 | The order "sets a policy that the executive branch, 'to the maximum extent permitted by law,' will use 'Super Intelligence' and 'SI' in place of 'Artificial Intelligence' and 'AI.'" | SUPPORTED | "It is therefore the policy of my Administration that, to the maximum extent permitted by law, the executive branch shall use the terms..." (sec. 1) [EO-PDF] | none |
| E6 | "Section 2 applies this to agencies' official correspondence, public communications, websites, reports, policy documents, and other non-statutory documents." | SUPPORTED | "...in official correspondence, public communications, websites, reports, policy documents, and other non-statutory documents within the executive branch." (sec. 2(a)) [EO-PDF] | none |
| E7 | First section adds the executive branch "will not acknowledge the usage of 'Artificial Intelligence' and 'AI' in any applicable setting." | SUPPORTED | Exact wording in sec. 1. [EO-PDF] | none |
| E8 | Section 3: SI means the technologies and systems covered by the definition of AI at 15 U.S.C. 9401(3). | SUPPORTED | Sec. 3(a), quoted at E2. [EO-PDF] | none |
| E9 | Definition "enacted on January 1, 2021", quoted as "a machine-based system that can, for a given set of human-defined objectives, make predictions, recommendations or decisions influencing real or virtual environments." | SUPPORTED | Quote matches word for word. Source note: "(Pub. L. 116–283, div. E, §5002, Jan. 1, 2021, 134 Stat. 4523.)" [USC] | none |
| E10 | "It says nothing about matching or beating human ability." | SUPPORTED | The full text of (3), including parts (A)–(C), mentions only "human-defined objectives" and "human-based inputs". [USC] | none |
| E11 | "So in a federal document, SI refers to the same systems that AI did." | NEEDS FIX | Scope: the order covers executive-branch documents, "for purposes of this order", and only until it is superseded (sec. 3(a), 3(b)). [EO-PDF] | "So in an executive-branch document covered by the order, SI refers, for now, to the same systems that AI did." |
| E12 | Does not require changes to regulations, presidential actions, contracts, grants, or other documents issued before it. | SUPPORTED | "Nothing in this section requires the alteration of previously issued regulations, Presidential actions, contracts, grants, or other historical documents." (sec. 2(b)) [EO-PDF] | none |
| E13 | "It does not amend any law." | SUPPORTED | The order has no amending provision. It asks for "proposed conforming amendments... to existing statutory references to 'artificial intelligence' and 'AI'" (sec. 3(b)(ii)). [EO-PDF] | none |
| E14 | The statutory definition still uses "artificial intelligence", and the chapter is titled "National Artificial Intelligence Initiative" (2024 edition). | SUPPORTED | "United States Code, 2024 Edition... CHAPTER 119 - NATIONAL ARTIFICIAL INTELLIGENCE INITIATIVE" [USC]. The order calls it "the existing statutory definition of 'artificial intelligence'" (sec. 3(b)(i)) [EO-PDF]. | none |
| E15 | Directions are addressed to executive departments and agencies; nothing directs companies, states, or the public. | SUPPORTED | Sec. 1 is addressed to "the executive branch", sec. 2 to "executive departments and agencies", and sec. 3(b) to the APST. No other addressees. [EO-PDF] | none |
| E16 | Creates no right or benefit anyone can enforce in court against the government. | SUPPORTED | "...does not, create any right or benefit, substantive or procedural, enforceable at law or in equity by any party against the United States..." (sec. 4(c)) [EO-PDF]. The sentence is narrower than the clause, which also covers "any other person"; that is not an overstatement. | optional: "...against the government or anyone else." |
| E17 | Sec. 3(b): APST has 60 days to send proposed legislative language for a definition that "reflects the capabilities described in section 1 of this order." | SUPPORTED | "Within 60 days of the date of this order, the Assistant to the President for Science and Technology (APST)... shall submit to the President proposed legislative language..." [EO-PDF] | none |
| E18 | Proposal to assess whether the definition should "modify, expand upon, or otherwise supersede" the statutory definition. | SUPPORTED | Sec. 3(b)(i). [EO-PDF] | none |
| E19 | "Sixty days from September 29, 2026, is November 28, 2026." | SUPPORTED | Calculated: 2026-09-29 + 60 days = 2026-11-28. | none |
| E20 | The order's definition applies until a later presidential action or an Act of Congress replaces it. | SUPPORTED | "...unless and until superseded by subsequent Presidential action consistent with applicable law or by an Act of Congress." (sec. 3(a)) [EO-PDF] | none |

### "Where you will see it" and "Spelling is a hint"

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Suggested correction |
|---|---|---|---|---|
| E21 | NIST page says, per EO 14434, "NIST is working to update its communications to incorporate the term 'super intelligence' as directed." | SUPPORTED | "Per the Sept. 29, 2026, Executive Order 14434: Inaugurating the Era of Super Intelligence, NIST is working to update its communications to incorporate the term 'super intelligence' as directed." [NIST-SI] | none |
| E22 | NIST's old AI topic address now redirects to that page. | SUPPORTED | `www.nist.gov/artificial-intelligence` returns HTTP 301 to `www.nist.gov/super-intelligence`. | none |
| E23 | Center page uses the name CAISSI; items from September 17, 2026, and earlier use CAISI; no NIST notice explains the change. | SUPPORTED | Page title: "Center for Advancing Innovation and Standards for Super Intelligence (CAISSI)". Listed items: "CAISI's Assessment of Z.ai's GLM-5.3..." (Sept. 17, 2026); "...the U.S. Center for AI Standards and Innovation (CAISI)..." (July 23, 2026). The page does not cite the order, and the news listing has no renaming notice. [NIST-CAISSI], [NIST-NEWS] | none |
| E24 | EO 14432 (America.gov), signed the same day, uses "super intelligence". | SUPPORTED | "(e) ensure that super intelligence used in connection with America.gov is accurate, reliable, and transparent" (sec. 2). Signed September 29, 2026. [EO14432] | none |
| E25 | An October 4, 2026 release about an international science declaration uses "SI". | SUPPORTED | "Ministers recognized that SI is both accelerating existing research tasks..."; the release calls the Kyoto Vision a "joint declaration" and is dated October 4, 2026. [KYOTO] | none |
| E26 | The order writes two capitalized words, "Super Intelligence". | SUPPORTED | [EO-PDF] throughout. | none |
| E27 | NIST's pages often use lowercase "super intelligence". | SUPPORTED | Page title "Super intelligence | NIST"; body text "NIST's super intelligence (SI) efforts...". [NIST-SI] | none |
| E28 | Bostrom and the SEP write one word, "superintelligence". | SUPPORTED | [BOS], [SEP] | none |
| E29 | xAI's developer docs now use the name SpaceXSI, with the heading "Get started with SpaceX Super Intelligence"; the page does not say whether this is related to the order. | SUPPORTED | `<title>`: "Grok API Documentation \| SpaceXSI Docs"; heading "Get started with SpaceX Super Intelligence". The page has no mention of an executive order or EO 14434. [XAI] | none |

### "What it meant before"

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Suggested correction |
|---|---|---|---|---|
| E30 | "Before September 2026, 'superintelligence' was mainly a term from research and philosophy about a possible future level of machine ability." | NEEDS FIX | No source supports "mainly". Bostrom's definition is not limited to machines: "it could be a digital computer, an ensemble of networked computers, cultured cortical tissue or what have you" [BOS]. The SEP discusses it as a level AI may reach [SEP]. | "Before the order, 'superintelligence' was a term from research and philosophy for a possible future intellect far beyond human ability, often discussed as a level that AI might reach." |
| E31 | "In a paper first published in 1998 in the International Journal of Futures Studies, the philosopher Nick Bostrom defined a superintelligence as 'an intellect that is much smarter than the best human brains in practically every field.'" | NEEDS FIX (citation only) | Quote is exact. "Originally published in Int. Jour. of Futures Studies, 1998, vol. 2." [BOS] The cited paper page does not call Bostrom a philosopher. His home page header does: "Nick Bostrom / Philosopher" [BOS-HOME]. | Sentence unchanged. Add [BOS-HOME] to Sources (done in the checked MDX and in `SOURCES` as `bostrom-home`). |
| E32 | Listed scientific creativity, general wisdom, and social skills among those fields. | SUPPORTED | "...including scientific creativity, general wisdom and social skills." [BOS] | none |
| E33 | SEP entry by Vincent C. Müller (revised March 27, 2026) describes a classic argument that AI could reach systems more intelligent than humans, which it calls superintelligent. | SUPPORTED | "First published Thu Apr 30, 2020; substantive revision Fri Mar 27, 2026"; citation_author "Müller, Vincent C."; sec. 2.8.1 calls it "the classic narrative" in which AI reaches systems "that surpass the human level of intelligence, that is they are 'superintelligent'". [SEP] | none |
| E34 | Good "in 1965 described a machine that could far surpass the intellectual activities of any person." | NEEDS FIX | Good, as quoted in the SEP: a machine that "can far surpass all the intellectual activities of any man however clever" (Good 1965, 33). The paraphrase drops "all". The SEP says the fear "was first formulated as a possible trajectory of existing AI into an 'intelligence explosion' by Irvin Good", which supports the "first set out" clause. [SEP] | "...a machine that could far surpass all the intellectual activities of any person." |
| E35 | The entry describes both optimistic and pessimistic views of what would follow. | SUPPORTED | "Optimists like Kurzweil... expect a positive development, whereas pessimists like Bostrom or Yudkowsky expect that the risk..." [SEP] | none |
| E36 | "Some companies use the word for a goal. Safe Superintelligence Inc.'s homepage describes a safe superintelligence as its single goal and its only product." | NEEDS FIX (minor) | SSI: "one goal and one product: a safe superintelligence." [SSI] The page cites only one company, so "some companies" generalizes from one example. | "Companies can also use the word for a goal. For example, Safe Superintelligence Inc.'s homepage..." |
| E37 | "The difference, plainly" list: "In federal usage since September 29, 2026..." / "Federal usage: no..." / "Federal usage: Executive Order 14434, section 3..." | NEEDS FIX | The content is supported (sec. 3(a); [USC]; [BOS]). The label "federal usage" overstates the scope, for the same reason as E1. | Labels changed to "Under Executive Order 14434 (executive-branch usage since September 29, 2026)" and "Under the order". |
| E38 | Order "says today's frontier systems 'far exceed what was envisioned when the term 'Artificial Intelligence' first came into use' and 'increasingly represent not merely artificial intelligence, but a new era of Super Intelligence.'" | NEEDS FIX | The quotes are exact, but their subjects are misattributed. The order says "The extraordinary technologies being pioneered by American innovators far exceed what was envisioned..." and "As these capabilities continue to improve, they increasingly represent not merely artificial intelligence, but a new era of Super Intelligence." (sec. 1) [EO-PDF] | "...it says the technologies being pioneered by American innovators 'far exceed...' and that, as their capabilities improve, they 'increasingly represent...'" |
| E39 | "That is the order's stated reason for the name." | SUPPORTED | "Accordingly, the term 'Super Intelligence' more appropriately captures the promise, potential, and rapidly advancing capabilities of these technologies." (sec. 1) [EO-PDF] | none |
| E40 | "...so 'SI' in a federal document does not by itself claim that any system is smarter than people at nearly everything." | NEEDS FIX | The reasoning is supported by sec. 3(a) and [USC]. "Federal document" overstates the scope (see E1). | "...in an executive-branch document..." |

### Timeline

| # | Entry | Verdict | Evidence (quote, source) | Suggested correction |
|---|---|---|---|---|
| T1 | 1965: Good describes an "ultraintelligent machine", as quoted in the SEP. | SUPPORTED | "(Good 1965, 33)"; bibliography: "Speculations Concerning the First Ultraintelligent Machine", 1965. [SEP] | none |
| T2 | 1998: Bostrom paper published in the International Journal of Futures Studies, vol. 2, per the paper's own page. | SUPPORTED | "Originally published in Int. Jour. of Futures Studies, 1998, vol. 2." [BOS] | none |
| T3 | January 1, 2021: National AI Initiative Act of 2020 (Pub. L. 116-283, div. E) enacted, with the definition at 15 U.S.C. 9401(3). | SUPPORTED | Short title note: "may be cited as the 'National Artificial Intelligence Initiative Act of 2020'" (Pub. L. 116–283, div. E, §5001, Jan. 1, 2021). [USC] | none |
| T4 | September 22, 2026: UNGA address quote "the Artificial Intelligence being spoken of so much now — hereinafter officially called 'Super Intelligence,'" per a White House release that day. | SUPPORTED | Release dated September 22, 2026: "Today, President Donald J. Trump addressed the 81st session of the United Nations General Assembly..." It quotes "...a globalist scheme of control for the Artificial Intelligence being spoken of so much now — hereinafter officially called 'Super Intelligence.'" [UN]. The fragment matches. | none |
| T5 | September 29, 2026: EO 14434 signed; fact sheet and luncheon video posted; EO 14432 signed the same day and uses "super intelligence". | SUPPORTED | [EO-WH] and [FS] dated September 29, 2026; [VID] title and date "September 29, 2026"; [EO14432] signing_date 2026-09-29. | none |
| T6 | September 30, 2026: NIST standards page "Updated September 30, 2026"; CAISSI page metadata records a change that day. | SUPPORTED | "Created August 3, 2021, Updated September 30, 2026" [NIST-STD]; `dcterms.modified` 2026-09-30T11:18-04:00 [NIST-CAISSI]. | none |
| T7 | October 1, 2026: filed with the OFR at 11:15 a.m. | SUPPORTED | "[FR Doc. 2026–20321 Filed 10–1–26; 11:15 am]" [EO-PDF] | none |
| T8 | October 2, 2026: published at 91 FR 63129–63130, document 2026-20321. | SUPPORTED | citation "91 FR 63129", start_page 63129, end_page 63130, publication_date 2026-10-02 [FR-API] | none |
| T9 | October 4, 2026: release says the U.S. and 16 other countries endorsed the Kyoto Vision; uses "super intelligence" and "SI". | SUPPORTED | "the United States and 16 countries endorsed the Kyoto Vision for a Golden Age of Science". The list has 17 entries, including the United States. [KYOTO] | none |
| T10 | November 28, 2026 (calculated) deadline; the order does not say whether the proposal will be published. | SUPPORTED | Sec. 3(b) has no publication requirement. Date calculated as in E19. [EO-PDF] | none |

### "What has not been confirmed" (press-only list)

The section is clearly labeled, every item is attributed to the outlet, and none appears in the
timeline or the factual sections. This meets the house rule.

| # | Sentence (short form) | Verdict | Evidence (quote, source) | Suggested correction |
|---|---|---|---|---|
| N1 | Items appeared in news coverage; as of October 13, 2026, USASI found no official page confirming them. | SUPPORTED | [FR-SEARCH] found 0 documents for the Force and for the accord; whitehouse.gov search found no page. state.gov could not be read (403), which the AP item discloses. | none |
| N2 | "The catalog's watch list keeps checking official sources for them." | NEEDS FIX | `research/watchlist.md` has "'Super Intelligence Force' and a 'White House Accord on Super Intelligence'" (added 2026-10-04). It has no State Department email item. [WATCH] | "The catalog's watch list checks official sources for the task force and the accord." Alternatively, the editor adds the State Department item to the watch list and keeps the original sentence. |
| N3 | AP reported on September 23, 2026 that a State Department official emailed Bureau of International Organization Affairs staff to use "Super Intelligence" and "SI". | SUPPORTED (attributed) | AP, dated "September 23, 2026 at 3:59 PM": "...said an email sent Tuesday to employees by Michael Drager, deputy assistant secretary of state for the Bureau of International Organization Affairs." [AP] | none |
| N4 | "As reported, the email was sent on September 22, a week before Executive Order 14434." | SUPPORTED (derived) | AP says the email was "sent Tuesday". The article is dated Wednesday, September 23, 2026, so the email was sent Tuesday, September 22, seven days before September 29. [AP] | none |
| N5 | USASI could not read State Department pages on October 13, 2026, because state.gov refused automated requests. | SUPPORTED | HTTP 403 today. [STATE] | none |
| N6 | CBS and ABC reported on October 4, 2026 that the President announced the task force in a social media post. | SUPPORTED (attributed) | ABC (published 2026-10-04): "Trump wrote on his social media platform Sunday" (October 4, 2026 was a Sunday) [ABC]. CBS (October 4, 2026, 9:25 AM EDT): announced "in a post on Truth Social" [CBS, via WebFetch]. | none |
| N7 | No whitehouse.gov page or Federal Register document about the Force found as of October 13, 2026. | SUPPORTED | [FR-SEARCH]: 0 documents; whitehouse.gov search found no matching page. | none |
| N8 | CBS reported the accord as a one-page set of voluntary safety standards signed by AI companies. | SUPPORTED (attributed) | CBS: "the leaders signed a set of voluntary safety standards"; "a copy of the one-page accord that the president shared on Truth Social"; attendees were "the leaders of the country's top AI firms" [CBS, via WebFetch]. | optional precision: "signed by leaders of AI companies". |
| N9 | No whitehouse.gov page or Federal Register document about the accord found as of October 13, 2026. | SUPPORTED | [FR-SEARCH]: 0 documents; the whitehouse.gov search returned only the EO page. | none |

### "Why this site is not the government", "What you can do next", Sources

| # | Sentence (short form) | Verdict | Evidence | Suggested correction |
|---|---|---|---|---|
| G1 | USASI is an independent project, not a U.S. government website, and not affiliated with the White House, NIST, the State Department, or any agency. | SUPPORTED | Repo `content/pages/disclaimer.mdx`: "not operated, sponsored, endorsed, or reviewed by the United States government..."; `lib/site-config.ts` disclaimer: "Independent project. Not a United States government website." | none |
| G2 | The name includes "Superintelligence" but USASI does not speak for the government and is not an official source for the federal term. | SUPPORTED | Same as G1. | none |
| G3 | When the page says what an agency did, it links to that agency's own document. | SUPPORTED | Every agency statement has an official link, in the timeline or in Sources. Note: the "Where you will see it" paragraph has no inline links. | optional: add inline links to [NIST-SI], [NIST-CAISSI], [EO14432], [KYOTO] in that paragraph. |
| L1 | Internal links: `/policy/#eo-14434`, `/learn/policy-and-standards-sources/#names-and-dates`, `/learn/ai-history/#federal-policy`, `/kids/what-is-super-intelligence/`, `/companies/nist/`, `/companies/xai/`, `/disclaimer/`. | SUPPORTED | Checked in the repo (read only): PolicyTracker uses `id={d.slug}` and `content/policy/eo-14434.yml` exists; `learn-policy-sources.mdx` has `id="names-and-dates"`; `learn-ai-history.mdx` has `id="federal-policy"`; `lib/kids.ts` has slug `what-is-super-intelligence`; nist.yml and xai.yml are `published`; `app/disclaimer` exists. | none |
| S1 | Sources list: titles, dates, publishers, URLs, "reached from" redirect notes, SEP section 2.8.1, "Reported only, not used for facts" line. | SUPPORTED | Every title and date matches the fetched page. The AP piece is hosted on Click2Houston (KPRC). Redirects confirmed. | (Bostrom home page added under E31.) |

## Registry data (`explainer-data.ts`)

| # | Item | Verdict | Evidence | Suggested correction |
|---|---|---|---|---|
| D1 | title: What "Super Intelligence" means in U.S. government documents (60 chars) | SUPPORTED | Within the 80-character limit. The title only names the topic. | optional: "...in U.S. executive-branch documents" (69 chars) to match the scope fixes. Editor's choice. |
| D2 | question: "...now that the federal government uses it in place of 'AI'?" | NEEDS FIX | Same scope problem as E1. | "...now that federal agencies are directed to use it in place of 'AI'?" |
| D3 | Takeaway 1 (EO 14434, September 29, 2026; agencies; to the extent the law allows; in their documents) | SUPPORTED | Sec. 2(a). [EO-PDF] | none |
| D4 | Takeaway 2: "...so in federal documents it is a new name for the same technology..." | NEEDS FIX | Scope (see E11). | "The order defines SI by the legal definition of AI, so in executive-branch documents it is, for now, a new name for the same technology, not a claim that any system beats humans." (178 chars) |
| D5 | Takeaway 3: "Before the order, 'superintelligence' usually meant..." | NEEDS FIX | "Usually" is unsupported (see E3). | "In earlier research and philosophy, 'superintelligence' meant a possible future intellect far smarter than the best humans in nearly every field; check who uses the word, and when." (exactly 180 chars, at the test limit) |
| D6 | SOURCES records (ids, titles, URLs, publishers, kinds, dates) | SUPPORTED | Fields match the fetched pages. Every `kind` is in `SourceKind`. `published_at: "1998"` matches `DocumentedDate` (YYYY allowed). | Added `bostrom-home` (see E31). |
| D7 | REPORTED_ONLY records (kind "news") | SUPPORTED | Titles and dates match [AP], [CBS], [ABC]. | none |

## Policy page draft (`policy-eo-14434.md`)

| # | Item | Verdict | Evidence | Suggested correction |
|---|---|---|---|---|
| P1 | Header: title, executive order, EO 14434, issuer, official text URL | SUPPORTED | [FR-API] title, executive_order_number, pdf_url; [EO-WH] signed "DONALD J. TRUMP". | none |
| P2 | Status "In effect"; no revoking or amending order listed; notes field "See: EO 14252, March 27, 2025; EO 14292, May 5, 2025"; EO 14434's text mentions neither | SUPPORTED | [FR-API] `executive_order_notes` exactly as quoted, with no "Revoked by" or "Amended by" entry; [EO-PDF] text has no reference to either. Extra finding: the FR records for EO 14252 ("Making the District of Columbia Safe and Beautiful") and EO 14292 ("Improving the Safety and Security of Biological Research") each list "See: EO 14434, September 29, 2026". The cross-reference runs both ways, and the FR gives no explanation. | none. Keep the note's advice to show nothing about them. |
| P3 | Key dates table (signed 9/29; posted with fact sheet 9/29; filed 10/1 11:15 am; published 10/2 at 91 FR 63129–63130, Vol. 91, No. 190; 11/28 calculated) | SUPPORTED | [EO-PDF] header "Vol. 91, No. 190 / Friday, October 2, 2026" and footer; [FR-API]; [EO-WH]; [FS]. | none |
| P4 | Summary paragraph, and the note that it equals the current `summary` in `content/policy/eo-14434.yml` | SUPPORTED | Matches secs. 1–3 [EO-PDF]; identical to the repo YAML `summary.text`. | none |
| P5 | Key provisions 1–6, including all quotes | SUPPORTED | Every quote checked word for word against [EO-PDF] (secs. 1, 2(a), 2(b), 3(a), 3(b)(i)–(iii), 4(a)–(d); OSTP bears publication costs). | none |
| P6 | Definition callout (15 U.S.C. 9401(3); Pub. L. 116-283, div. E, sec. 5002, January 1, 2021) | SUPPORTED | [USC] | none |
| P7 | Plain-language note ("SI" names the same technologies as "AI" under this order; differs from the older meaning) | SUPPORTED | Sec. 3(a) [EO-PDF]; [BOS]. | none |
| P8 | Implementation on official pages: NIST quote; 301 from /artificial-intelligence; CAISSI name; /caisi and /aisi 301; CAISSI page does not cite the order; round-5 editor note 4 | SUPPORTED | [NIST-SI], [NIST-CAISSI]; redirects checked. `research/verification/round5-verify-policy.md` editor note 4 makes the same point. | none |
| P9 | Related documents: EO 14432 quote and date; "not currently in the tracker"; round-5 notes call it "outside the set"; NAIIA 2020 record slug; fact sheet | SUPPORTED | [EO14432]; the repo has no eo-14432 YAML; round5-verify-policy.md lists it under "Orders outside the set"; `content/policy/national-ai-initiative-act-2020.yml` exists. | none |
| P10 | "Reports about a 'Super Intelligence Force', a 'White House Accord...', and a State Department email are tracked on the watch list..." | NEEDS FIX | [WATCH] has the Force and the accord only (same as N2). | Fixed in `policy-eo-14434.checked.md`: the Force and the accord are on the watch list; the reported State Department email is not yet on it. |
| P11 | Sources table | SUPPORTED | All URLs return 200; titles and dates match. | none |
| P12 | Suggested YAML updates (advice) | SUPPORTED | Consistent with round-5 editor note 4. The existing YAML's "items from July 2026" wording is still true. The Sept. 17 item also uses CAISI. | none |

## Video script (`video-script.md`)

| # | Item | Verdict | Evidence | Suggested correction |
|---|---|---|---|---|
| V1 | Title "AI has a new official name"; shot 1 VO "In U.S. government writing, AI has a new official name: Super Intelligence." | NEEDS FIX | Same overstatement of scope as E1. [EO-PDF] secs. 1–2. | Title: "AI to SI: what Executive Order 14434 changes". VO: "Federal agencies are now directed to call AI by a new name: Super Intelligence." |
| V2 | Shot 2: EO 14434 signed September 29, 2026 tells federal agencies, as far as the law allows, to say "Super Intelligence"/"SI"; caption "Source: Federal Register, 91 FR 63129" | SUPPORTED | Sec. 2(a); [FR-API]. | none |
| V3 | Shot 3: covers websites, reports, official letters, policy documents; no rewrite of older regulations, contracts, grants; "doesn't change any law" | SUPPORTED | Secs. 2(a), 2(b); no amending provision; 3(b)(ii). [EO-PDF] | none |
| V4 | Shot 4: definition paraphrase "a machine-based system that makes predictions, recommendations, or decisions. So it's a new name for the same technology." | NEEDS FIX | The paraphrase drops "can" and "for a given set of human-defined objectives" [USC]. The mapping holds only until superseded (sec. 3(a)). | "...a machine-based system that can make predictions, recommendations, or decisions for goals that people set. So, for now, it's a new name for the same technology." |
| V5 | Shot 5: "That's different from how researchers used 'superintelligence' before. In a 1998 paper, philosopher Nick Bostrom described an intellect much smarter than the best human brains in practically every field..." | NEEDS FIX (minor) | The Bostrom part is supported [BOS], [BOS-HOME]. "How researchers used" generalizes to all researchers. | "That's different from an older research meaning of 'superintelligence.'" The rest is unchanged. |
| V6 | Shot 6: "You can already see it on agency websites. NIST says... and its center page now uses the name CAISSI." | NEEDS FIX | Only NIST was shown ("agency websites" is plural). Putting CAISSI right after the order implies the order caused it, which NIST does not say (round-5 editor note 4; [NIST-CAISSI]). | "You can see it at NIST, which says it is updating its communications to use 'super intelligence.' Separately, its center page now says CAISSI, without saying why." |
| V7 | Shot 7: "The order also asks the Assistant to the President..." | NEEDS FIX (minor) | The order says "shall submit", which is a direction, not a request (sec. 3(b)). | "directs" |
| V8 | Shot 8 end card: URL, disclaimer line, "independent project, not a government website" | SUPPORTED | `https://unitedstatesofamericasuperintelligence.com/learn/` returned 200; disclaimer wording matches `lib/site-config.ts`. | none |
| V9 | Description: "AI has a new official name in U.S. government writing." | NEEDS FIX | Same as V1. | "Federal agencies are now directed to call AI by a new name." |
| V10 | Description, rest (EO 14434, Sept. 29, 2026, 91 FR 63129; "to the extent the law allows"; defines SI by the existing legal definition; older meaning; independence line) | SUPPORTED | [EO-PDF], [FR-API], [BOS]. | none |
| V11 | Notes: usasihq.com/learn/ returns 301 to the main site's /learn/ | SUPPORTED | Checked today: 301 to `https://unitedstatesofamericasuperintelligence.com/learn/`. | none |
| V12 | Voiceover word count "about 200 words" | NEEDS FIX (editor note) | Counted 214 words in the original and 224 after the fixes. | "about 225 words... roughly 80–90 seconds" (updated in the checked copy). |

Visual guidance (no seals or logos, no government look, neutral tone) is consistent with the
independence rule. No change.

## Tone

All four files are neutral. They state no political opinion and endorse no position. The order's
own reasoning is quoted and attributed ("in its own words"). The fact sheet's partisan wording is
not repeated. Press items are clearly separated and attributed. Every file keeps the line that
USASI is independent and not a government website.

## Editor decisions

1. **Watch list.** Either add the reported State Department email to `research/watchlist.md` (then
   N2 and P10 can again say the watch list covers all three items), or keep the corrected wording.
2. **CBS article.** It was read through WebFetch after curl got HTTP 406. Spot-check it in a browser
   before quoting CBS wording.
3. **Optional.** Narrow the explainer title to "executive-branch documents" (D1). Add inline links in
   "Where you will see it" (G3). Use "signed by leaders of AI companies" (N8).
4. **Takeaway 3** is exactly 180 characters, which is the test limit.
5. `factCheck` in the registry entry can be set once this report is copied to
   `research/verification/`.
