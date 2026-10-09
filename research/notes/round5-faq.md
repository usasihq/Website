# round5-faq — notes (2026-10-08)

## Created

- `content/pages/faq.mdx`: opening paragraph (no heading), 5 groups, 28 questions, Sources.
  No front matter, no H1, no JSX, no imports, no tables, no code spans. Compiles with
  `@mdx-js/mdx`. `npx tsx scripts/validate.ts`: 0 errors, 1 pre-existing warning
  (continue-extension.yml).
- No route or loader was created (app/ and lib/ are outside this assignment). The page
  still needs an `app/faq/` route and wiring by whoever owns those files.

Structure for the integrator: each question is `<h3 id="...">Question?</h3>`, then ONE
answer paragraph (2 to 4 sentences, plain prose, links allowed, no bold or code, no
in-page `#` links, no "next answer" references, so it stands alone when extracted), then
an optional paragraph starting `Read more:` with 1 to 3 internal links. Group headings
use `id="group-..."`.

| Group id | Questions (ids) |
| --- | --- |
| group-basics | where-to-start, what-is-ai, what-is-an-llm, tokens-and-context, why-ai-makes-things-up, what-is-an-agent |
| group-open-models | open-source-ai, is-chatgpt-open-source, run-ai-locally, model-cards |
| group-trust | chats-and-training, spot-ai-content, benchmarks, safety-testing |
| group-policy | agi-and-superintelligence, super-intelligence-term, who-regulates-ai, ai-jobs |
| group-usasi | what-is-usasi, government-site, why-the-name, what-gets-included, rankings-and-ratings, unknown-details, who-writes-news, report-a-mistake, reuse-data, visitor-privacy |

Internal links were checked by script: every `/learn/<slug>/` is in lib/learn.ts, every
`/open/` and `/companies/` record is `publication_status: published`, hubs exist, every
glossary anchor exists in glossary.mdx, and every site-page anchor (about, methodology,
contribute, disclaimer, ai-history#federal-policy, policy-and-standards-sources#names-and-dates)
exists. No links to /policy/ or /licenses/ (not yet routes).

## Sources fetched today (curl, UA "USASI-catalog-research/0.3"; no identifiers sent)

Used and cited (35 documents): govinfo 15 U.S.C. 9401 (2024 ed.) and EO 14434 FR PDF;
whitehouse.gov EO 14434 page and OMB M-25-21 PDF; NIST super-intelligence page, AI RMF page,
CAISSI blog "Cheating On AI Agent Evaluations", NIST AI 100-4 PDF and publication page;
O*NET Data Scientists; Apprenticeship.gov AI portal; Dartmouth proposal (Stanford host);
Google MLCC LLM intro and transformers pages; Gemini Apps Privacy Hub; Google DeepMind
SynthID, Frontier safety page, Levels of AGI (arXiv abs + PDF v5); Anthropic privacy policy,
Reduce hallucinations, Context windows, Building effective agents, RSP page; OpenAI gpt-oss
model card (arXiv abs + PDF), HF gpt-oss-20b card, LICENSE, USAGE_POLICY, API "your data"
guide, Why Language Models Hallucinate (arXiv + OpenAI PDF); OSI OSAID 1.0; C2PA explainer
2.2; MCP spec 2026-07-28; Ollama FAQ and README; llama.cpp README.

Fetched for verification only, not cited: OMB memoranda index (M-25-21 is still listed;
also lists M-26-04 on AI principles, not used), github.com/openai/gpt-oss README, BIS EAR
page and developers.openai.com models page (not needed).

## Could not reach (skipped, per rules)

- openai.com: introducing-gpt-oss, chatgpt/overview, terms-of-use (both), charter: all 403.
  help.openai.com: 403. So "Is ChatGPT open source?" rests only on OpenAI's gpt-oss model
  card (arXiv) and its Hugging Face card, and is worded as "in the OpenAI documents read for
  this page". OpenAI's Charter definition of AGI was not used.
- ftc.gov: 404 for every URL tried, including the homepage, with the project UA (treated as
  a block, not retried with other tools). FTC is left out of "Who regulates AI".
- bls.gov Occupational Outlook Handbook: 403. Jobs answer uses O*NET and Apprenticeship.gov
  plus the careers explainer.

## Uncertain or deliberately limited

- Who regulates AI: lists document types (law, executive order, OMB memorandum, NIST
  voluntary guidance) only; no state laws, no claim that there is or is not a single
  regulator, no statement of what applies to anyone. M-25-21 is described with its date
  ("of April 3, 2025"), not as currently in force.
- AGI/superintelligence: only the Google DeepMind position paper's framing and EO 14434's
  definition; no predictions. The paper's table marks ASI "not yet achieved"; left out to
  avoid setting it against the EO's own Section 1 language.
- Anthropic privacy policy effective date did not appear in the fetched static text, so no
  date is given for it.
- Run-locally answer avoids "free" and "open-source" for Ollama/llama.cpp (licenses not
  re-read today).

## Self-check (each factual sentence against the passage read today)

- 15 U.S.C. 9401(3) quote matches govinfo text exactly; source credit "Pub. L. 116-283,
  div. E, §5002" and short title "National Artificial Intelligence Initiative Act of 2020".
- Dartmouth proposal dated August 31, 1955; "study of artificial intelligence ... summer of
  1956 at Dartmouth College". No coinage claim.
- MLCC: "predict a token or sequence of tokens, sometimes many paragraphs worth of predicted
  tokens"; summary "trained ... on massive datasets, enabling them to learn patterns and
  generate text based on probabilities"; "LLMs hallucinate, meaning their predictions often
  contain mistakes".
- Anthropic context windows quote exact; 400 error when input alone exceeds the window;
  compaction "summarizes earlier parts of the conversation", "available in beta".
- Anthropic hallucination guide: "known as 'hallucination'", "don't eliminate them
  entirely", "Always validate critical information". arXiv 2509.04664 submitted 4 Sep 2025;
  OpenAI PDF lists three OpenAI authors and one Georgia Tech author; abstract: training and
  evaluation "reward guessing over acknowledging uncertainty" (paraphrased as "admitting").
- Anthropic agents article (Dec 19, 2024) quote exact; MCP spec: hosts "must obtain explicit
  user consent before invoking any tool"; "MCP itself cannot enforce these security
  principles at the protocol level".
- OSAID 1.0: freedoms to use "for any purpose and without having to ask for permission",
  study, modify, share; precondition = preferred form (Data Information, Code, Parameters
  under OSI-approved terms); Open Source models/weights "must include the data information
  and code used to derive those parameters".
- gpt-oss card: "open-weight reasoning models available under the Apache 2.0 license and
  our gpt-oss usage policy"; "different risk profile than proprietary models" and no
  "possibility for OpenAI to implement additional mitigations or to revoke access"; "models
  served in our first-party products like ChatGPT"; model card vs system card quote exact;
  Preparedness Framework evaluations. HF card: 20b "run within 16GB of memory", 120b "single
  80GB GPU".
- Ollama FAQ: "We don't see your prompts or data when you run locally"; cloud-hosted models
  "we process your prompts and responses". llama.cpp README: "Download and run a model
  directly from Hugging Face".
- Anthropic privacy policy: train "unless you opt out through your account settings";
  exceptions for safety-flagged or reported conversations. Gemini hub (last updated Sept
  24, 2026): Keep Activity on, activity used "including training generative AI models".
  OpenAI API: not used to train "unless you explicitly opt in".
- NIST AI 100-4: "no silver bullet"; metadata "often" stripped when shared; false positives
  "can be extremely damaging" "in many contexts". C2PA: no value judgments whether
  provenance is "true"; Content Credential is "a cryptographically bound structure that
  records an asset's provenance". SynthID: watermarks embedded across Google's generative AI
  consumer products; detector checks content "made with AI from Google or our partners".
- NIST CAISSI blog (Dec 2, 2025): cheating on "agentic coding and cyber benchmarks", e.g.
  "using the internet to find walkthroughs and answers for cyber capture-the-flag
  challenges". Benchmark definition restates glossary.
- DeepMind FSF page: version 3.1 (17 Apr 2026); identify capability levels, mitigation
  plans. Anthropic RSP page: last updated Aug 14, 2026; version 3.4 effective July 8, 2026.
- Levels of AGI: "Many AI researchers and organizations have proposed definitions of AGI",
  "nine prominent examples", depth/breadth levels, ASI "able to do a wide range of tasks at a
  level that no human can match"; affiliations Google DeepMind.
- EO 14434 Secs. 1 to 3 checked line by line (agencies, "to the maximum extent permitted by
  law", list of document types, 2(b) no alteration of prior documents, 3(a) definition by
  reference to 15 U.S.C. 9401(3), 3(b) APST within 60 days). NIST SI page: "working to
  update its communications to incorporate the term ... as directed".
- M-25-21 dated April 3, 2025, guidance to heads of agencies on federal use of AI. NIST AI
  RMF: "intended for voluntary use"; "being revised".
- O*NET (U.S. Department of Labor, ETA) Data Scientists description paraphrased.
- Site answers re-read against about.mdx, disclaimer.mdx, methodology.mdx (eligibility,
  uncertainty, counts, news, jobs), contribute.mdx (corrections), reuse.mdx, privacy.mdx,
  ELIGIBILITY.md; wording follows them closely, including "once the repository is
  configured" for the correction action.
