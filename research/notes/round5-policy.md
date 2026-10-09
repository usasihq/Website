# Round 5 — U.S. AI policy tracker (label: round5-policy)

Date: 2026-10-08. All facts come from official pages and documents fetched today with
`curl -A "USASI-catalog-research/0.3"`. No identifiers were sent in any request, and the shared
Browser pane was not used.

## What I created

30 files in `content/policy/`, all `publication_status: published`, `updated_at` and
`last_reviewed` 2026-10-08. `issuer_org_slug: nist` is set on the four NIST documents.
`related_organizations` lists only `nist` (published), on documents whose text directs NIST:
EO 13859, EO 14110, the National AI Initiative Act, the AI Action Plan, and EO 14409.

| Slug | Identifier | Date | Status | Status basis |
|---|---|---|---|---|
| eo-13859 | EO 13859 | 2019-02-11 signed | in-effect | FR EO notes list no revocation |
| m-21-06 | M-21-06 | 2020-11-17 issued | in-effect | M-25-21 (2025) tells agencies to consult it |
| eo-13960 | EO 13960 | 2020-12-03 signed | in-effect | FR EO notes; M-26-04 (Dec 2025) builds on it |
| ai-in-government-act-2020 | Public Law 116-260, Division U, Title I | 2020-12-27 enacted | in-effect | M-25-21 says the Act required it |
| national-ai-initiative-act-2020 | Public Law 116-283, Division E | 2021-01-01 enacted | in-effect | Codified at 15 U.S.C. ch. 119 (2024 ed.); EO 14434 uses 15 U.S.C. 9401(3); sunset after 10 years (sec. 5101(e)) |
| blueprint-ai-bill-of-rights | (none) | 2022-10-04 released | unknown | Only on archived site marked "historical material"; its disclaimer says non-binding; no official withdrawal found |
| ai-rmf-1-0 | NIST AI 100-1 | 2023-01-26 released | final | NIST page: "being revised as part of the White House AI Action Plan" |
| eo-14110 | EO 14110 | 2023-10-30 signed | revoked | EO 14148 sec. 2(ggg); FR notes "Revoked by: EO 14148" |
| m-24-10 | M-24-10 | 2024-03-28 issued | rescinded → m-25-21 | M-25-21: "rescinds and replaces" M-24-10 |
| nist-ai-600-1 | NIST AI 600-1 | 2024-07-26 published | final | NIST publication record |
| nist-ai-100-5 | NIST AI 100-5 | 2024-07-26 published | final | NIST publication record |
| m-24-18 | M-24-18 | 2024-09-24 issued | rescinded → m-25-22 | M-25-22: "rescinds and replaces" M-24-18 |
| nist-ai-100-4 | NIST AI 100-4 | 2024-11-20 published | final | NIST publication record |
| eo-14141 | EO 14141 | 2025-01-14 signed | revoked | EO 14318 sec. 4; FR notes "Revoked by: EO 14318" |
| eo-14148 | EO 14148 | 2025-01-20 signed | in-effect | FR EO notes |
| eo-14179 | EO 14179 | 2025-01-23 signed | in-effect | FR EO notes |
| m-25-21 | M-25-21 | 2025-04-03 issued | in-effect | M-26-04 names it as an existing directive |
| m-25-22 | M-25-22 | 2025-04-03 issued | in-effect | M-26-04 complements it |
| eo-14277 | EO 14277 | 2025-04-23 signed | in-effect | FR EO notes |
| take-it-down-act | Public Law 119-12 | 2025-05-19 enacted | in-effect | Enrolled law text (approved May 19, 2025) |
| americas-ai-action-plan | (none) | 2025-07-23 released | final | EO 14363 refers to implementing it; NIST revising AI RMF under it |
| eo-14318 | EO 14318 | 2025-07-23 signed | in-effect | FR EO notes |
| eo-14319 | EO 14319 | 2025-07-23 signed | in-effect | FR EO notes; M-26-04 implements it |
| eo-14320 | EO 14320 | 2025-07-23 signed | in-effect | FR EO notes |
| eo-14355 | EO 14355 | 2025-09-30 signed | in-effect | FR EO notes |
| eo-14363 | EO 14363 (Genesis Mission) | 2025-11-24 signed | in-effect | FR EO notes |
| eo-14365 | EO 14365 | 2025-12-11 signed | in-effect | FR EO notes |
| m-26-04 | M-26-04 | 2025-12-11 issued | in-effect | Listed on OMB memoranda page (no status_note) |
| eo-14409 | EO 14409 | 2026-06-02 signed | in-effect | FR EO notes |
| eo-14434 | EO 14434 | 2026-09-29 signed | in-effect | FR EO notes; NIST says it is updating its communications under it |

Summaries are 2–4 sentences restating what each document directs, from its own text. Where a
document states its own policy in charged or aspirational terms (EO 14179, EO 14365), the policy
sentence is quoted in quotation marks rather than paraphrased. Official titles are used as issued,
including EO 14148 ("Initial Rescissions of Harmful Executive Orders and Actions") and EO 14319
("Preventing Woke AI in the Federal Government"). No dollar amounts, counts of actions, or
purpose/background language from the documents were carried into summaries.

## Sources fetched (2026-10-08)

- **Federal Register API** (`federalregister.gov/api/v1/...`): search for executive orders
  mentioning "artificial intelligence" (2018–2026), each order's record including
  `executive_order_notes` (revocations/cross-references), and raw full text. Each EO entry cites
  its API record (`.../documents/<doc-number>.json`) for status.
- **govinfo.gov**: Federal Register PDFs of all 15 executive orders (texts re-checked against the
  FR raw text); Public Laws 116-260, 116-283, 119-12 (HTML); U.S. Code 2024 edition, title 15
  chapter 119. Each EO's `official_url` is its govinfo Federal Register PDF.
- **whitehouse.gov**: OMB memoranda page; M-21-06, M-25-21, M-25-22, M-26-04, M-26-10 PDFs;
  America's AI Action Plan PDF; "White House Unveils America's AI Action Plan" release (July 23,
  2025).
- **bidenwhitehouse.archives.gov** (archived official site): M-24-10 and M-24-18 PDFs; Blueprint
  for an AI Bill of Rights page, "About this Document" (legal disclaimer), PDF, and OSTP release
  of October 4, 2022.
- **nist.gov / nvlpubs.nist.gov**: AI RMF page; NIST AI 100-1, 600-1, 100-4, 100-5 PDFs and
  publication records (dates); Super intelligence page; CAISSI page.

## Blocked, unavailable, or skipped

- **federalregister.gov HTML document pages** return a "Request Access" bot-check page, so they
  are not cited. I used the public API (no bot check) and govinfo copies instead.
- **congress.gov** returned 403; not used.
- **uscode.house.gov** showed "Under Maintenance"; used the govinfo 2024 U.S. Code edition.
- **ai.gov/action-plan** returned 404; used the whitehouse.gov PDF.
- **whitehouse.gov/ostp/ai-bill-of-rights/** (the address printed in the Blueprint) returned 404
  today; the Blueprint is only on the archived site. I kept this out of the entry (a 404 is not a
  citable statement) and used `status: unknown` ("Status not stated").
- **NIST AI 800-1** (misuse risk for dual-use foundation models): only the second public draft
  (`NIST.AI.800-1.ipd2.pdf`) is available; no final found, so not included.
- **NIST AI RMF critical infrastructure profile**: only a concept note (April 7, 2026); not included.
- **Not attempted / left for a later round**: National Security Memorandum 25 (Oct 2024; no
  official status found without more searching), the Advancing American AI Act (Public Law
  117-263, referenced by M-24-18, M-25-21, M-25-22), the National AI R&D Strategic Plan, the
  Commerce statement creating CAISI (June 2025), M-26-10 (checked: it does not mention AI).

## Uncertain points

- **"In effect" for executive orders** rests on the Federal Register's executive order notes
  listing no revoking or amending order (checked today). That is the official disposition record,
  but it is an absence-of-revocation finding, and the notes can lag new orders by days.
- **OMB memoranda statuses** rest on later OMB documents referring to them (M-26-04 for M-25-21,
  M-25-22; M-25-21 for M-21-06). I scanned OMB memoranda titles through M-26-19; none rescinds
  these, but I did not read every later memorandum's body.
- **TAKE IT DOWN Act** is marked in effect from the enacted text alone; I could not check
  congress.gov for later amendments.
- **CAISSI renaming**: nist.gov does not use the word "renamed." It shows the name Center for
  Advancing Innovation and Standards for Super Intelligence (CAISSI) on the center page (where
  July 2026 items still say "Center for AI Standards and Innovation (CAISI)"), and the Super
  intelligence page says NIST is updating its communications per EO 14434. The `/caisi` URL
  redirects to `/caissi`. The EO 14434 entry's status note states only what the pages say.
- **Blueprint `document_type: framework`**: it calls itself both a "white paper" and a
  "framework"; I used `framework`.
- **Action Plan and NIST documents** use `final` (published, not orders). AI 600-1, 100-4 and
  100-5 were developed under EO 14110, which was later revoked; no official source says they were
  withdrawn, and NIST still lists them, so no status note was added.
- **EO 14434** sets a policy that the executive branch use "Super Intelligence"/"SI" in place of
  "AI". USASI is not an executive agency, so entries keep the documents' own terms.

## Follow-ups worth scheduling

- EO 14434 sec. 3(b): APST legislative proposal on a Federal "Super Intelligence" definition is
  due within 60 days (about late November 2026).
- AI RMF 1.0 revision under the Action Plan (watch the NIST AI RMF page).
- Recheck the FR executive order notes for all `in-effect` orders at each review.
