# Round 5 verification — U.S. AI policy tracker (label: round5-verify-policy)

Date: 2026-10-08. Independent check of the 30 entries in `content/policy/` written by
`round5-policy` (notes: `research/notes/round5-policy.md`).

## Method

- Every official text was fetched today with `curl -A "USASI-factcheck/0.3"`. No email address,
  name, or other identifier was placed in any URL, header, or payload. The shared Browser pane was
  not used. No bot check was bypassed.
- Executive orders: Federal Register API record for each order
  (`federalregister.gov/api/v1/documents/<doc>.json`: title, `executive_order_number`,
  `signing_date`, `citation`, `executive_order_notes`) and the order's raw Federal Register text
  (the API's `raw_text_url`). All 15 govinfo PDF links in the entries resolve (HTTP 200).
- Laws: govinfo HTML of Public Laws 116-260, 116-283, 119-12; U.S. Code 2024 edition, title 15,
  chapter 119 (govinfo).
- OMB memoranda: PDFs of M-21-06, M-24-10, M-24-18 (archived site), M-25-21, M-25-22, M-26-04;
  the current OMB memoranda index on whitehouse.gov, plus the text of every memorandum listed
  from M-25-23 through M-26-19 (scanned for references to M-21-06, M-24-10, M-24-18, M-25-21,
  M-25-22, M-26-04).
- NIST: PDFs of NIST AI 100-1, 600-1, 100-4, 100-5; their nist.gov publication records; the AI
  RMF page; the "Super intelligence" page; the CAISSI page.
- Other: America's AI Action Plan PDF and its July 23, 2025 release; Blueprint for an AI Bill of
  Rights page, "About this Document" disclaimer, PDF, and OSTP release (archived site).
- All 57 URLs cited in the 30 entries resolve to the described document (HTTP 200, no unrelated
  redirects).

## Result per entry

"OK" means title, identifier, issuer, date, date_label, status, status_note, superseded_by,
related organizations, and every summary sentence matched the official text.

| Entry | Checked against | Result |
|---|---|---|
| eo-13859 | FR 2019-02544 record + text | OK |
| eo-13960 | FR 2020-27065 record + text; M-26-04 App. A | OK |
| eo-14110 | FR 2023-24283 record ("Revoked by: EO 14148") + text; EO 14148 sec. 2(ggg) | OK |
| eo-14141 | FR 2025-01395 record ("Revoked by: EO 14318") + text; EO 14318 sec. 4 | OK |
| eo-14148 | FR 2025-01901 record + text | OK |
| eo-14179 | FR 2025-02172 record + text | OK |
| eo-14277 | FR 2025-07368 record + text | OK |
| eo-14318 | FR 2025-14212 record + text | **1 fix** (summary) |
| eo-14319 | FR 2025-14217 record + text; M-26-04 | OK |
| eo-14320 | FR 2025-14218 record + text | OK |
| eo-14355 | FR 2025-19495 record + text | OK |
| eo-14363 | FR 2025-21665 record + text | OK |
| eo-14365 | FR 2025-23092 record + text | **1 fix** (summary) |
| eo-14409 | FR 2026-11415 record + text | **2 fixes** (summary) |
| eo-14434 | FR 2026-20321 record + text; NIST SI and CAISSI pages | OK (see editor note 4) |
| m-21-06 | M-21-06 PDF; M-25-21 | OK |
| m-24-10 | M-24-10 PDF; M-25-21 ("rescinds and replaces") | OK |
| m-24-18 | M-24-18 PDF; M-25-22 ("rescinds and replaces") | OK |
| m-25-21 | M-25-21 PDF; M-26-04 App. A; OMB index scan | OK |
| m-25-22 | M-25-22 PDF; M-26-04; OMB index scan | OK |
| m-26-04 | M-26-04 PDF; OMB index scan | **1 fix** (summary) |
| ai-in-government-act-2020 | PL 116-260 Div. U Title I; M-25-21 | **1 fix** (status_note) |
| national-ai-initiative-act-2020 | PL 116-283 Div. E; 15 U.S.C. ch. 119 (2024 ed.); EO 14434 | **1 fix** (status_note) |
| take-it-down-act | PL 119-12 | OK |
| ai-rmf-1-0 | NIST AI 100-1 PDF + record; AI RMF page | **1 fix** (date_label) |
| nist-ai-600-1 | PDF + record | OK |
| nist-ai-100-5 | PDF + record | OK |
| nist-ai-100-4 | PDF + record | OK |
| americas-ai-action-plan | Plan PDF; release; EO 14363; AI RMF page | OK (see editor note 5) |
| blueprint-ai-bill-of-rights | archived page, disclaimer, PDF, release | OK |

Details confirmed for every executive order: the official title, number, and signing date equal
the Federal Register API's `title`, `executive_order_number`, and `signing_date`; each source
title's citation and publication date equal the API's `citation` and `publication_date`.

## Changes (before → after, with the official passage)

### 1. `ai-rmf-1-0.yml` — date_label

- Before: `date_label: released`
- After: `date_label: published`
- Basis: the rule for this check is publication date for NIST documents. NIST's publication record
  for NIST AI 100-1 reads "Published January 26, 2023" (the date itself was already correct). The
  three other NIST entries already used `published`.

### 2. `ai-in-government-act-2020.yml` — status_note (sunset added)

- Before: "OMB Memorandum M-25-21 of April 3, 2025 states that the AI in Government Act of 2020
  required its issuance, and directs agencies to develop compliance plans consistent with section
  104(c) and (d) of the Act." (sources: m-25-21-text)
- After: same text, plus "Section 103(d) of the Act provides that section 103, which creates the AI
  Center of Excellence, ceases to be effective 5 years after the date of enactment." (sources:
  m-25-21-text, pl-116-260)
- Official passage (PL 116-260, Div. U, sec. 103(d)): "Sunset.--This section shall cease to be
  effective on the date that is 5 years after the date of enactment of this Act." The law was
  approved December 27, 2020, so the "in-effect" status alone did not tell readers that the
  section the summary leads with has its own 5-year sunset. The note states only what the law says;
  I did not check for a later extension (see open items).

### 3. `national-ai-initiative-act-2020.yml` — status_note (codification overstated)

- Before: "The Act's provisions are codified in chapter 119 of title 15 of the United States Code
  (2024 edition), ..."
- After: "Most of the Act's provisions are codified in chapter 119 of title 15 of the United States
  Code (2024 edition), ..."
- Official passages: the 2024 U.S. Code chapter 119 source credits cover Div. E sections 5002,
  5101–5104, 5106, 5201, 5302, 5303, 5401, 5501 (15 U.S.C. 9401–9461). Section 5301 instead
  amends the NIST Act ("SEC. 22A. <<NOTE: 15 USC 278h-1.>> STANDARDS FOR ARTIFICIAL
  INTELLIGENCE"), which is outside chapter 119, and section 5105 (National Academies workforce
  study) is not in the chapter.

### 4. `eo-14318.yml` — summary (categorical exclusions)

- Before: "It directs agencies to use categorical exclusions under the National Environmental
  Policy Act and other measures to speed environmental reviews and permitting for such projects,
  and to offer sites on Federal lands and military installations for them."
- After: "It directs agencies to identify existing, and establish new, categorical exclusions under
  the National Environmental Policy Act for such projects, sets out other measures to expedite
  environmental reviews and permitting, and directs agencies to offer sites on Federal lands and
  military installations for them."
- Official passage (sec. 5(a)–(b)): "each relevant agency shall identify to the Council on
  Environmental Quality any categorical exclusions already established or adopted by such agency
  ... The Council on Environmental Quality shall coordinate with relevant agencies on the
  establishment of new categorical exclusions to cover actions related to Qualifying Projects".
  The order does not direct agencies to "use" exclusions.

### 5. `eo-14365.yml` — summary (who is directed)

- Before: "It directs the Federal Communications Commission to begin a proceeding ... and the
  Federal Trade Commission to issue a policy statement ..."
- After: "It directs the Chairman of the Federal Communications Commission to begin a proceeding
  ... and the Chairman of the Federal Trade Commission to issue a policy statement ..."
- Official passages: sec. 6, "the Chairman of the Federal Communications Commission shall ...
  initiate a proceeding"; sec. 7, "the Chairman of the Federal Trade Commission shall ... issue a
  policy statement".

### 6. `eo-14409.yml` — summary (two precision fixes)

- (a) Before: "to form an AI cybersecurity clearinghouse with industry and critical infrastructure
  operators to coordinate ..."
  After: "to form an AI cybersecurity clearinghouse, in voluntary collaboration with the AI
  industry and critical infrastructure operators, to coordinate ..."
  Official passage (sec. 2(d)): "shall form an AI cybersecurity clearinghouse, in voluntary
  collaboration with the AI industry and operators of critical infrastructure".
- (b) Before: "The order states that it does not authorize a mandatory licensing, preclearance, or
  permitting requirement for new AI models, and directs the Attorney General ..."
  After: "The order states that nothing in its frontier model section authorizes a mandatory
  governmental licensing, preclearance, or permitting requirement for new AI models, and it
  directs the Attorney General ..."
  Official passage (sec. 3(c), within "Sec. 3. Secure Frontier Model Deployment"): "Nothing in
  this section shall be construed to authorize the creation of a mandatory governmental licensing,
  preclearance, or permitting requirement for the development, publication, release, or
  distribution of new AI models, including frontier models." The statement is limited to section 3,
  not the whole order.
- The summary text was re-wrapped; no other wording changed.

### 7. `m-26-04.yml` — summary (requirement vs. recommendation)

- Before: "It requires agencies to include contractual requirements ... in any new solicitation or
  order for a large language model, to modify existing contracts where practicable, and to update
  their procurement policies by March 11, 2026."
- After: "It requires agencies to include contractual requirements ... in any new solicitation or
  order for a large language model and to update their procurement policies by March 11, 2026,
  and says agencies should, to the extent practicable, modify existing contracts for large language
  models."
- Official passages: "a. ... Agencies must ensure that any solicitation or order for procurement of
  an LLM they issue after the date of this memorandum includes contractual requirements"; "b. ...
  Agencies should, to the extent practicable, modify existing contracts for LLMs"; "c. No later than
  March 11, 2026, agencies must update their policies and procedures". Modifying existing contracts
  is a "should", not a requirement.

`npx tsx scripts/validate.ts`: 0 errors, 1 warning (the pre-existing continue-extension.yml warning).

## Status checks

- **Executive orders marked in-effect (13 orders).** Federal Register `executive_order_notes`
  retrieved today list no "Revoked by" or "Amended by" entry for EO 13859, 13960, 14148, 14179,
  14277, 14318, 14319, 14320, 14355, 14363, 14365, 14409, or 14434. As a second check I searched the
  API for every presidential document whose text cites each of these orders. The only later
  citations are EO 14319 (cites 13960), EO 14365 (cites 14179), and, for EO 14148, EO 14236, EO 14248,
  a July 15, 2025 memorandum, and two cyber-emergency continuation notices. I read the EO 14236 and
  EO 14248 passages: both refer to EO 14148's revocations and neither amends or revokes it.
- The "Notice of March 24, 2026 (91 FR 15511)" in the EO 14110 and EO 14148 notes is
  "Continuation of the National Emergency With Respect to Significant Malicious Cyber-Enabled
  Activities" (FR doc 2026-06076); it does not affect either order's status.
- **Revoked:** EO 14110 — EO 14148 sec. 2(ggg) lists "Executive Order 14110 of October 30, 2023
  (Safe, Secure, and Trustworthy Development and Use of Artificial Intelligence)" under "The
  following executive actions are hereby revoked"; FR note "Revoked by: EO 14148, January 20,
  2025". EO 14141 — EO 14318 sec. 4: "Executive Order 14141 of January 14, 2025 ... is hereby
  revoked"; FR note "Revoked by: EO 14318, July 23, 2025".
- **Rescinded:** M-24-10 — M-25-21: "This memorandum rescinds and replaces Office of Management and
  Budget (OMB) Memorandum M-24-10". M-24-18 — M-25-22: "This memorandum rescinds and replaces OMB
  Memorandum M-24-18". `superseded_by` correctly points to m-25-21 and m-25-22.
- **OMB memoranda marked in-effect** (M-21-06, M-25-21, M-25-22, M-26-04): no memorandum from
  M-25-23 through M-26-19 mentions or rescinds any of them.
- **Laws:** status notes match the texts (AI in Government Act: see change 2; National AI
  Initiative Act: sec. 5101(e) "shall terminate on the date that is 10 years after the date of
  enactment"; TAKE IT DOWN Act sec. 3(a)(1)(A) one-year deadline).
- **NIST/plan/Blueprint:** "The AI RMF 1.0 is being revised as part of the White House AI Action
  Plan" (NIST AI RMF page) and "a review ... is expected to take place no later than 2028" (AI 100-1)
  are both verbatim support. The Blueprint's archived page carries "This is historical material
  'frozen in time'"; its disclaimer says it "is non-binding and does not constitute U.S. government
  policy". No later official document I read mentions the Blueprint except EO 14110 (revoked), so
  `unknown` is supported.

## Balance

Both sides of every revocation or replacement in the set are present: EO 14110 ↔ EO 14148,
EO 14141 ↔ EO 14318, M-24-10 ↔ M-25-21, M-24-18 ↔ M-25-22. The revoking or replacing entry's
summary names the earlier document, and the earlier document's status_note names the later one
and the provision. `superseded_by` links the two OMB pairs. For the two revoked executive orders it
stays `null` (see editor note 1).

## Missing AI executive orders (2019–2026) — not added

Federal Register API search: `presidential_document_type=executive_order`,
`signing_date >= 2019-01-01`, terms "artificial intelligence" (44 results), "AI" (24),
"super intelligence" (2), "machine learning", "data center(s)", "frontier model", "large language
model". The 15 orders in the set include every order with AI, artificial intelligence, or super
intelligence in its title and every order whose main subject is AI. The latest executive order
published as of today is EO 14434. Orders outside the set with substantive AI provisions:

1. **EO 14144** (Jan. 16, 2025), *Strengthening and Promoting Innovation in the Nation's
   Cybersecurity*: a cybersecurity order whose sec. 6 is titled "Promoting Security with and in
   Artificial Intelligence" (19 AI mentions). FR note: "Amended by: EO 14306".
2. **EO 14306** (June 6, 2025), *Sustaining Select Efforts To Strengthen the Nation's
   Cybersecurity and Amending Executive Order 13694 and Executive Order 14144*: strikes EO 14144's AI
   section and inserts a new "Sec. 5. Promoting Security with and in Artificial Intelligence".
3. **EO 14432** (Sept. 29, 2026), *Streamlining Access to Government Services Through America.gov*:
   sets up a "conversational point of entry" and a policy to "ensure that super intelligence used in
   connection with America.gov is accurate, reliable, and transparent".

Every other match mentions AI only in passing (1–6 times; for example EO 14261 and EO 14299 on
power for AI data centers, EO 14177 on PCAST, EO 14307 on drones).

## Notes for the editor (no change made)

1. **`superseded_by` for revoked orders.** The writer brief defines `superseded_by` as "when an
   official document replaced it". EO 14148 and EO 14318 revoke EO 14110 and EO 14141 but do not say
   they replace them, so I left `superseded_by: null`. The tracker would show a "See ..." link if it
   were set. If you want revoked entries linked to the revoking order, either set it (eo-14110 →
   eo-14148, eo-14141 → eo-14318) or add a `revoked_by` field to the schema.
2. **M-26-04 sunset.** The memo says "This memorandum shall cease to have any force or effect two
   years after the date of its issuance, unless the Director of OMB provides otherwise" (that is,
   December 11, 2027). The entry has no status_note. Consider adding one.
3. **AI in Government Act sunset (change 2).** I could not confirm whether a later law extended
   section 103. congress.gov was not used. The govinfo U.S. Code 2024 edition would only show
   amendments through its cutoff.
4. **EO 14434 status note.** Its CAISSI sentence is accurate (center page title and "About" use
   CAISSI; items dated July 23 and Sept. 17, 2026 use CAISI). However, it sits next to NIST's
   statement about the order, which suggests the renaming followed from the order. NIST does not
   say so. Consider trimming it to the NIST "super intelligence" page sentence.
5. **Action Plan title.** The PDF cover reads "Winning the Race / America's AI Action Plan", which
   the entry uses. The July 23, 2025 release calls it "Winning the AI Race: America's AI Action
   Plan". No change.
6. **Not checked:** National Security Memorandum 25 (Oct. 24, 2024; cited in EO 14141 but not
   published in the Federal Register) and the Advancing American AI Act (PL 117-263), both noted as
   left out by the writer.
