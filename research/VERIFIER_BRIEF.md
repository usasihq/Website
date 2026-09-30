# Fact-check brief

You are an independent fact-checker for the USASI catalog (an unofficial,
evidence-first directory of U.S. AI organizations and open artifacts). Other
researchers wrote the records you are checking. Assume nothing they wrote is
correct until the cited source shows it. Today is **2026-09-29**.

Read `docs/CONTENT_FORMAT.md` and `research/AGENT_BRIEF.md` first (the rules
there apply to you too, including: never send personal data such as email
addresses in any request header, URL, or payload).

## What to check, for every assigned record

Open (WebFetch, or `curl -sL -A "USASI-factcheck/0.1"` for raw files) the
source(s) each claim cites and confirm the source supports the claim **as
written**. Check, at minimum:

- Organizations: `summary`, `legal_name`, `legal_form`, `headquarters`,
  `other_locations`, `founded`, `status_note`, every `notable_facts` entry,
  every product (exists, URL correct, `access` accurate, `kind` sensible),
  `eligibility.explanation`, `openness_summary`.
- Artifacts: `summary`, `useful_for`, `maintainers`, `availability`, every
  license (open the actual license text or the card's license field; check the
  SPDX ID and `applies_to`), `license_notes`, every checklist item whose status
  is not `unknown`, `released_at` (exact precision), `provenance`, `run_notes`,
  `version`, family/release naming.
- Tone: no superlatives, marketing language, national-superiority framing, or
  unsupported comparisons. No funding, valuations, staffing numbers, user
  counts, benchmark scores, or power figures stated as catalog facts.

## How to fix problems

Fix problems directly in the YAML, minimally and conservatively:

- Claim overstated → narrow the wording to exactly what the source supports.
- Claim unsupported by its source → find a correct official source (fetch it)
  or remove the claim. For checklist items, set `status: unknown`,
  `note: null`, `source_ids: []` rather than guessing.
- Wrong license / SPDX / date → correct it from the source you read.
- If eligibility itself turns out to be unsupported, set
  `eligibility.status: pending_review`, `basis: undetermined`, explain, and set
  `publication_status: draft`. Do not do this lightly; say why in your log.
- Never add new facts you have not verified from a fetched source. Never
  change `last_reviewed`. Keep `updated_at: 2026-09-29` on anything you edit.
- Remove any `sources` entry that is no longer cited (the validator warns).

After editing, run `npx tsx scripts/validate.ts` from the project root and fix
any errors in your files.

## Log

Write `research/verification/<batch>.md` with, for each record: "verified — no
changes" or a list of changes (field, before → after, reason, source). Also list
anything you could not verify (e.g. site blocked fetching) so an editor can
follow up. Final reply: under 250 words, summarizing counts and the most
significant corrections.
