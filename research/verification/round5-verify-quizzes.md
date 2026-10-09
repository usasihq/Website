# Verification: round 5 explainer quizzes (label `round5-verify-quizzes`, 2026-10-08)

Files checked: all 22 files in `content/quizzes/` (66 questions). Each was checked against the explainer text in `content/pages/<file>.mdx`, using the slug-to-file mapping in `lib/learn.ts`. The writer's notes are in `research/notes/round5-quizzes.md`.

Method: no web access and no browser. For every question I read the whole explainer and checked five things:

1. The marked `answer` (0-based) is correct according to the page.
2. Every other choice is clearly ruled out by the page.
3. The question can be answered from the page alone and is not a trick.
4. The explanation restates the page accurately.
5. The wording is neutral, with no prices, funding, user or staff counts, or superlatives.

A script also checked every phrase in quotation marks in the 66 explanations. Each one appears verbatim in the matching MDX file once Markdown links, HTML tags, and case are normalized. The same script confirmed the schema limits: exactly 3 questions per file, 3–4 choices, a prompt of at most 220 characters, choices of at most 160, and explanations of at most 360.

Result: all 66 marked answers are correct, and every distractor is ruled out by its page. I made 6 edits in 4 files. One edit made a correct choice precise. Five fixed explanations that put the page's own wording in quotation marks as if it were a third party's exact words, or that left out a license condition. No answer index, prompt, or question count changed.

`npx tsx scripts/validate.ts` reports 0 errors and 1 warning. The warning is the existing one for `continue-extension.yml`.

## Changes made

### 1. `ai-history.yml`, Q2, choice 2 (executive order; the correct answer)

The choice paired "Super Intelligence" with "AI". The order as the page describes it pairs "Super Intelligence" with "Artificial Intelligence" and "SI" with "AI", and covers non-statutory documents.

- Before: `It directs agencies to use "Super Intelligence" in place of "AI" in their documents`
- After: `It directs agencies to use "Super Intelligence" and "SI" in place of "Artificial Intelligence" and "AI" in non-statutory documents`
- Page passage (`learn-ai-history.mdx`, Federal policy section): "directs agencies, to the maximum extent permitted by law, to use "Super Intelligence" and "SI" in place of "Artificial Intelligence" and "AI" in websites, reports, and other non-statutory documents."

### 2. `pretraining-and-post-training.yml`, Q3, explanation (licenses)

The old text said Apache 2.0 "allows additional or different terms" with no condition, which suggested that nothing carries over. The page says this holds only if you still comply with the license. The Llama 3.1 conditions apply to distributed derivatives.

- Before: `... The Llama 3.1 license sets naming and attribution conditions for derivatives, while Apache 2.0 "works differently" and allows additional or different terms for your modifications.`
- After: `... The Llama 3.1 license sets naming and attribution conditions for distributed derivatives, while Apache 2.0 "works differently": it allows additional or different terms for your modifications, "provided you still comply with it."`
- Page passages (`learn-pretraining-and-post-training.mdx`, licenses section):
  - "Anyone who distributes or makes available the Llama materials, a derivative of them, ... must provide a copy of the agreement and prominently display "Built with Llama.""
  - "The Apache License 2.0 works differently. Section 4 allows distributing derivative works if you include the license, mark files you changed, and keep the original notices, and it lets you put your own modifications, or the derivative as a whole, under additional or different terms, provided you still comply with it."

### 3. `ai-content-provenance.yml`, Q1, explanation

The page's own summary of C2PA's guidance was quoted as if it were C2PA's exact words. The page does not quote the guidance here. I removed the quotation marks and credited the summary to the page.

- Before: `C2PA's guidance says this result means "the file was not made with a conforming tool, or its credentials were stripped." ...`
- After: `The page, describing C2PA's guidance, says this result means the file was not made with a conforming tool, or its credentials were stripped. ...`
- Page passage (inspecting section): "It describes three results: ... **No Content Credentials found:** the file was not made with a conforming tool, or its credentials were stripped."

### 4. `ai-content-provenance.yml`, Q2, explanation

The text "The explainer says" followed by a quotation read as a direct quote from C2PA's explainer, because the prompt names C2PA's explainer. The quoted sentence is the page's own wording.

- Before: `The explainer says "provenance alone cannot tell you whether content is true, accurate, or factual." ...`
- After: `The page says C2PA's explainer is plain about limits: "Provenance alone cannot tell you whether content is true, accurate, or factual." ...`
- Page passage (Content Credentials section): "The explainer is plain about limits. Provenance alone cannot tell you whether content is true, accurate, or factual; Content Credentials show whether the record is intact and whether its signer is on a known trust list."

### 5. `ai-content-provenance.yml`, Q3, explanation

Two phrases were quoted as NIST's words. The page writes them as its own summary, not as quotations. The only NIST phrases the page quotes in this section are "a constant cat-and-mouse game" and "can be extremely damaging." I removed the quotation marks and credited the summary to the page.

- Before: `NIST AI 100-4 reports studies "finding detectors little better than chance on short passages," notes ... Detectors "may only perform well on" specific generators.`
- After: `The page says NIST AI 100-4 reports studies finding detectors little better than chance on short passages, notes ... It adds that detectors may only perform well on specific generators.`
- Page passage (detectors section): "NIST AI 100-4 calls this "a constant cat-and-mouse game" and says detectors are often tied to, and may only perform well on, specific generators. For text, it reports studies finding detectors little better than chance on short passages, notes that most detectors were built for English, and says they label English text by non-native writers as AI-generated more often."

### 6. `training-data-disclosures.yml`, Q1, explanation (licenses)

The page's summary of the Dolma dataset card was quoted as if it were the card's exact wording. I removed the quotation marks and credited the summary to the page. The page's own conclusion stays in quotation marks.

- Before: `The Dolma dataset card adds that using the corpus also binds you to "the license agreements and terms of use of the original data sources." The page says "a license on a compiled dataset does not, by itself, clear every document inside it."`
- After: `The page says the Dolma dataset card adds that using the corpus also binds you to the license agreements and terms of use of the original data sources. It concludes that "a license on a compiled dataset does not, by itself, clear every document inside it."`
- Page passage ("Public information is not permission"): "Ai2 releases its Dolma corpus under the Open Data Commons Attribution License (ODC-BY), and the Dolma dataset card adds that using it also binds you to the license agreements and terms of use of the original data sources. A license on a compiled dataset does not, by itself, clear every document inside it."

## Checked and left unchanged

These questions were checked closely because they cover executive orders, costs, dates, or licenses.

- **`ai-history` Q2 (EO 14434).** The other choices are each ruled out by the page:
  - Choice 0: the page says the order "does not require changing earlier regulations, contracts, or historical documents."
  - Choice 1: the page says EO 14110 "was revoked by Executive Order 14148 of January 20, 2025."
  - Choice 3: the page says the order "defines the new terms by pointing to the 2020 Act's definition."

  The date, September 29, 2026, matches the page. The explanation is accurate.
- **`ai-history` Q1 (1955 proposal date).** The answer matches "The proposal is dated August 31, 1955, and uses the phrase in its title". The choice that the proposal "proves that nobody ... had used the phrase" is ruled out by "the proposal does not say whether anyone used the phrase earlier."
- **`policy-and-standards-sources` Q2 (EO 14110 in the 2024 U.S. Code).** The answer matches "A compilation can reprint text that is no longer in effect". The quote "Revoked by: EO 14148, January 20, 2025." is verbatim from the page.
- **`policy-and-standards-sources` Q3 (AI RMF is voluntary guidance).** The answer matches the page's list of document types and its quote "intended for voluntary use."
- **`hosted-or-local` Q3 (cost).** It gives no figures, and the answer matches "Neither is cheaper in every case." The "always cheaper" distractors are ruled out by that sentence and by "plus power and upkeep."
- **`open-weight-vs-open-source` Q1–Q3 and `multimodal-models` Q3 (licenses).** The answers and quotes match their pages. CC BY 4.0 is given for Parakeet and the NVIDIA Open Model License for MagpieTTS.
- **`ai-and-your-data` Q1–Q2 (day counts).** The "up to 30 days" and "72 hours to 30 days" figures are quoted from the page. In Q2 the explanation ends its quote at "in the consumer examples." The page continues with "below," so this is a trimmed quote, not an altered one. Left as is.

Minor points, judged acceptable and not edited:

- `how-to-read-a-model-card` Q2 ends with an unquoted paraphrase ("A missing detail is not evidence that something was not done") that is consistent with "Record a gap as unknown rather than reading it as 'no'".
- `pretraining-and-post-training` Q2: DPO also avoids a separate reward model. It is still ruled out because the prompt also requires "a reward only when the model's answer is verified as correct," which the page gives only for RLVR.
- After edit 1, the correct choice in `ai-history` Q2 is the longest of its four choices. Accuracy was put first.

## Flag outside the quiz files (not changed)

The two explainers word EO 14434's carve-out differently:

- `learn-ai-history.mdx`: "It does not require changing earlier regulations, contracts, or historical documents".
- `learn-policy-sources.mdx`: "nothing in that section requires changing previously issued regulations, presidential actions, or other historical documents".

The ai-history quiz follows its own page, so the quiz is consistent. The page owner may want to reconcile "contracts" with "presidential actions" against the order's text.
