# Writing brief — round 5 (reference tools, 2026-10-08)

Round 5 adds reference tools that help readers look things up: a license guide,
a U.S. AI policy tracker, an FAQ, "check your understanding" quizzes on every
explainer, and missing catalog records. Work in the repository root.

Today is **2026-10-08**. Use it everywhere a date is needed.

## Absolute rules (same as round 4)

1. **Primary sources you fetch and read today only**: official documentation,
   license texts, model cards, specifications, government pages (whitehouse.gov,
   govinfo.gov, nist.gov, omb/whitehouse.gov memoranda, congress.gov or
   federalregister.gov when reachable), original papers, organizations' own
   pages. Never news coverage, aggregators, Wikipedia, social media, forums, or
   memory. If a fetch fails, find another official copy (govinfo.gov carries
   the Federal Register and public laws) or leave the item out.
2. **Privacy in requests.** Never put an email address, personal name, or other
   identifier in a URL, header, User-Agent, or payload. Use WebFetch, or curl
   with `-A "USASI-catalog-research/0.3"`.
3. **No bot-check bypassing, and never use the shared Browser pane tools**
   (mcp__Claude_Browser__* or any browser tab); use WebFetch or curl only. If a
   page only loads in a browser or returns 403, skip it.
4. **No funding, valuations, revenue, prices, salaries, staff/user/download
   counts, benchmark scores, rankings, or superlatives.** Neutral, plain
   language. For policy: describe what a document says and does, never whether
   it is good or bad, and never speculate about motives or effects.
5. **File ownership.** Create or edit only the files your assignment names.
   Never edit lib/, app/, components/, scripts/, tests/, data/, package files,
   or other agents' files. Do not run `npm run build`, git commands that change
   state, `scripts/automation/*`, or deploy anything.
6. **Validate.** Run `npx tsx scripts/validate.ts` and fix every error in your
   files (a warning about continue-extension.yml is pre-existing; ignore it).

## Formats

The exact schemas are in `lib/schema.ts` (`LicenseGuide`, `PolicyDocument`,
`Quiz`, and the existing `Artifact`, `Organization`, `Source`, `Claim`). Source
entries look like those in `content/hubs/agents.yml` (`id`, `title`, `url`,
`publisher`, `kind`, `published_at`, `accessed_at: 2026-10-08`). Claims carry
`reviewed_at: 2026-10-08`. Set `publication_status: published`, `updated_at`
and `last_reviewed` to 2026-10-08 for anything you can fully support;
otherwise `draft` with the reason in your notes.

- **License guide** (`content/licenses/<slug>.yml`): `summary` is 2–4 plain
  sentences on what the license is and who publishes it. `key_terms` are 3–6
  short labelled restatements of what the license text itself says (for
  example "Commercial use", "Attribution and notices", "Use restrictions",
  "Derivatives and naming", "Patents", "Share-alike", "Termination"), each
  citing the license text. Quote short distinctive phrases exactly in quotation
  marks; otherwise paraphrase closely. Never interpret beyond the text and never
  say what a reader may legally do in their situation. `match.spdx` lists SPDX
  ids; `match.name_prefixes` lists the exact starting text of license names
  that catalog records use (see the list your assignment gives).
- **Policy document** (`content/policy/<slug>.yml`): `title` is the official
  title; `identifier` the official number (for example "EO 14110",
  "Public Law 116-283", "NIST AI 100-1", "M-25-21"); `summary` is 2–4 sentences
  on what it does, from its own text; `status` reflects official sources only
  (a revocation must cite the revoking document); `superseded_by` points to
  another policy slug when an official document replaced it.
- **Quiz** (`content/quizzes/<explainer-slug>.yml`): 3 questions, each with 3–4
  choices, one correct answer (0-based `answer` index), and an `explanation`
  that quotes or closely paraphrases the explainer itself. Every question must
  be answerable from the explainer alone; no outside facts; no trick questions;
  wrong choices must be clearly wrong per the explainer, not arguably right.

## Notes and final reply

Write `research/notes/<your-label>.md`: what you created, sources fetched,
anything skipped and why, anything uncertain. Final reply under 200 words.
