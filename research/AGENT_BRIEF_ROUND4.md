# Writing brief — round 4 (learning center, 2026-10-08)

USASI (https://unitedstatesofamericasuperintelligence.com) is an independent,
evidence-first reference about U.S. AI organizations and U.S.-led open models and
tools. Round 4 turns its Learn section into a place where a curious member of the
public, a student, a journalist, or a developer can learn how AI works and how to
check claims about it. Work in the repository root.

Today is **2026-10-08**. Use it everywhere a date is needed.

## Absolute rules

1. **Primary sources you fetch and read today only.** Official documentation,
   model cards, license files, specifications, standards, government pages,
   original research papers (arXiv, journal, or the lab's own page), company or
   project blogs and newsrooms. Never news coverage, aggregators, Wikipedia,
   social media, forums, or your memory. If a fetch fails, find another official
   page or leave the claim out. Your background knowledge may be stale; verify.
2. **Privacy in requests.** Never put an email address, personal name, or other
   identifier in a URL, header, User-Agent, or payload. Use WebFetch, or curl
   with `-A "USASI-catalog-research/0.3"`. Never solve or bypass CAPTCHAs, bot
   checks, or logins; skip a blocked source.
3. **No funding, valuations, revenue, prices, salaries, staff/user/download
   counts, benchmark scores, rankings, or superlatives** ("leading",
   "state-of-the-art", "best", "most popular", "first" unless a primary source
   documents the fact and it matters). Technical numbers that a primary source
   states (parameter counts, context lengths, bit widths, dates, item counts in a
   benchmark) are fine.
4. **Neutral and practical.** Explain; do not promote. Say plainly what is and is
   not known. No predictions about superintelligence, jobs, or national
   leadership. No gendered pronouns for real people unless their own pages state
   them; professional facts only.
5. **File ownership.** Create or edit only the files your assignment names. Never
   edit lib/, app/, components/, scripts/, tests/, data/, package files, or other
   agents' files. Do not run `npm run build`, git commands that change state,
   `scripts/automation/*`, or deploy anything.

## Explainer format (content/pages/learn-<slug>.mdx)

Open two models first and match them closely:
`content/pages/learn-hosted-or-local.mdx` and `content/pages/learn-open-weight.mdx`.

- **No front matter, no H1** (the page supplies the title). 1,000–1,500 words.
- **Opening paragraph** (no heading) answers the page's question directly in
  4–7 plain sentences, so a reader who stops there still learns the answer.
- **Sections** use raw HTML headings exactly like `<h2 id="short-id">Heading</h2>`
  (lowercase, hyphenated ids, unique within the page). Use 5–8 sections. `###`
  subheadings are allowed sparingly.
- **Explain from the ground up.** Define each technical term the first time it
  appears, in plain words, before using it. Prefer concrete examples from real
  documentation over abstractions.
- **Inline citations:** link the claim's words to the exact source page, as the
  models do. Every factual sentence about a product, standard, policy, or
  organization must be supported by a page you read today.
- **A worked example section** (`<h2 id="worked-example">`) with a fictional
  person labelled as fictional ("Sam is a fictional reader invented for this
  page"), walking through a realistic decision step by step.
- **`<h2 id="next">What you can do next</h2>`**: 3–5 bullets linking to catalog
  pages, other explainers, hubs, and glossary terms (see Links below).
- **`<h2 id="sources">Sources</h2>`** last: "All read on October 8, 2026." then a
  bulleted list grouped by publisher, every source linked.
- **MDX syntax:** Markdown lists, bold, links, and fenced code blocks work.
  **Markdown tables do not** (no GFM). Never put a bare `<`, `>`, `{`, or `}` in
  prose (write "less than", or `&lt;`, or put it in backticks). No JSX components,
  no imports, no images.
- **Check your MDX compiles:**
  `node -e "import('@mdx-js/mdx').then(async m=>{await m.compile(require('fs').readFileSync(process.argv[1],'utf8'));console.log('ok')})" content/pages/learn-<slug>.mdx`

## Links

- Internal links are root-relative with a trailing slash: `/open/<slug>/`,
  `/companies/<slug>/`, `/hubs/<slug>/`, `/learn/<slug>/`, `/glossary/#<id>`,
  `/methodology/`, `/news/`, `/jobs/`, `/local/`, `/sources/`, `/timeline/`.
- Link a record only if `content/organizations/<slug>.yml` or
  `content/artifacts/<slug>.yml` exists **and** has `publication_status: published`.
  Check with `grep -l "^publication_status: published" content/artifacts/<slug>.yml`.
- Existing explainers: open-weight-vs-open-source, how-to-read-a-model-card,
  hosted-or-local, inference-hardware, reading-evaluations,
  training-data-disclosures, how-the-ecosystem-fits-together, agents-and-robotics,
  infrastructure-and-energy-claims, policy-and-standards-sources. Round-4
  explainers (being written in parallel; you may link them):
  how-language-models-work, tokens-and-context-windows,
  pretraining-and-post-training, quantization, how-models-use-tools,
  retrieval-augmented-generation, safety-testing-and-frameworks,
  ai-content-provenance, ai-and-your-data, careers-in-ai, ai-history,
  multimodal-models.
- Hubs: local-ai, agents, chips-and-compute, open-source-foundations, science,
  foundation-models, robotics, evaluation, enterprise-ai, data-and-datasets.
- Glossary anchors that exist today: accelerator, acceptable-use-policy,
  benchmark, checkpoint, context-window, data-center, evaluation-harness,
  fine-tuning, foundation, gated-download, gguf, hosted-api, inference,
  license-scope, maintainer, mixture-of-experts, model-card, model-family,
  model-release, nonprofit, open-source-software, open-source-ai, open-stack,
  open-weight, parent-company, power-and-energy, quantization, restricted-weights,
  reviewed-date, self-hosting, subsidiary, tokenizer, unknown, weights. Link only
  these.

## Your notes file

Write `research/notes/round4-<your-label>.md` with, for each explainer:

```
slug: <slug>
title: <title, at most 70 characters, sentence case>
question: <the reader's question the page answers, at most 120 characters>
topic: <one of: basics | models-and-licenses | running-ai | evidence | industry | policy>
level: <Beginner | Intermediate>
takeaways:
  - <three takeaways, each one sentence of at most 160 characters, each a
     faithful restatement of something the page itself says>
sources fetched: <count>, any sources you could not reach, anything uncertain
```

Then a short self-check: re-read every factual sentence against the source
passage that supports it and fix or cut anything that does not match exactly.

Final reply (under 200 words): files written, word counts, anything you could
not verify, and any suggested glossary terms that would help readers.
