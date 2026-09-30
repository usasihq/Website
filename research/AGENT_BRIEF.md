# Research brief for catalog researchers

You are researching and writing verified catalog records for USASI (United States
of America Superintelligence), an independent, unofficial catalog of U.S. AI
organizations and U.S.-led open models, software, datasets, and evaluation tools.
It is not a government site, not a ranking, and not an endorsement.

Today is **2026-09-29**. Use that as `accessed_at`, `assessed_at`, `updated_at`,
`last_reviewed`, and product `last_reviewed` for everything you verify today.

## Absolute rules

1. **Only cite pages you actually fetched and read today** with WebFetch (or
   `curl` for raw files such as LICENSE files on GitHub). Never cite a URL from
   memory, from a search snippet, or that returned an error/redirect you did not
   follow. If a fetch fails, try another official source or leave the claim out.
2. **Your background knowledge may be stale** (things change fast in 2025–2026:
   acquisitions, mergers, reorganizations, renamed products, license changes, HQ
   moves). Treat every candidate name as a research lead, not a fact. Verify the
   current state. If something material changed (acquired, merged, shut down,
   renamed, relocated), record it in `status_note` with sources.
3. **Do not invent anything**: no staff, partnerships, funding, valuations, user
   counts, benchmark numbers, power capacity, hardware requirements, release
   dates, versions, or licenses. Omit rather than guess. `null` / `unknown` are
   honest and fine.
4. **Each claim cites the source that supports it specifically.** A homepage does
   not support a license claim. For licenses, read the license file or the
   model/dataset card's license field. For headquarters, prefer an official
   about/contact page or an SEC filing (10-K cover page lists principal executive
   offices) for public companies.
5. **Write in your own words.** Short, factual, restrained. No superlatives
   ("leading", "pioneering", "state-of-the-art"), no marketing, no claims about
   which company or country leads. Summaries: 1–3 sentences. Do not copy text.
6. **Do not publish what you cannot support.** If identity, eligibility, or core
   facts can't be verified, write the record with `publication_status: draft`
   (still schema-valid) or don't create a file at all, and explain in your notes.
   Fewer excellent records beat many thin ones.
7. **Never send personal data in requests.** No email addresses, names, or
   other identifiers in User-Agent strings, headers, URLs, or payloads. If a
   site wants a contact User-Agent, use WebFetch or a generic UA such as
   `USASI-catalog-research/0.1`.
8. Do not touch files outside your assignment. Do not edit lib/, app/, scripts/.
   Only create/edit YAML files for your assigned entities under
   `content/organizations/` and `content/artifacts/`, plus your notes file.

## U.S. eligibility policy (apply consistently)

- Eligible bases: `us-headquarters` (documented U.S. headquarters /
  principal executive office), `us-nonprofit-or-lab` (a U.S. nonprofit, university
  lab, or research institute entity), `us-control` (documented primary control by
  a U.S. entity, e.g. a unit wholly owned by a U.S.-headquartered parent), and
  `us-governed-project` (for software/datasets: the documented governing or
  maintaining entity is U.S.-based, e.g. a U.S. foundation or U.S. company).
- A foreign organization with only a U.S. sales office does NOT qualify.
- Dual-headquarters or parent/subsidiary cases need an explicit written
  assessment in `eligibility.explanation` citing sources. If you cannot resolve it,
  use `status: pending_review` and `publication_status: draft`.
- Project eligibility depends on documented governance/maintaining entities —
  never on contributors' names or assumed nationalities.
- A U.S. fine-tune or wrapper of foreign base weights does not make the base
  model U.S.-developed. Record provenance separately.
- No special exceptions for famous organizations.

## Records to produce

- Organization records for each assigned organization you can verify.
- For assigned model families: one `record_level: family` overview plus **1–3
  specific release records** for releases you can verify (prefer the most recent
  documented generation; choose releases whose model card and license you
  actually read). Never assign licenses or checklist to the family record.
- For software/datasets/evals: one `record_level: project` record each.
- Products on organization records: 1–4 of the most relevant documented AI
  products, each with an official URL you fetched. Hosted APIs and consumer
  assistants use kinds `hosted-model-api` / `assistant-app`.
- Checklists: fill only what you verified; leave the rest `unknown` (or omit the
  key). Remember `training_data_information`: `public` = the data itself can be
  obtained; `partial` = composition/sources documented without full access.
- `run_notes`: only documented facts (e.g. "The model card documents running
  with vLLM and Transformers"). Any memory/hardware figure must be quoted from an
  official source and must state precision/quantization and assumptions — or
  leave it out.

## Canonical organization slugs (use these for cross-references)

openai, anthropic, google, google-deepmind, meta, xai, ssi, thinking-machines-lab,
reflection-ai, microsoft, amazon, apple, nvidia, amd, broadcom, intel, cerebras,
groq, sambanova, coreweave, lambda, oracle, palantir, databricks, snowflake,
scale-ai, perplexity, together-ai, fireworks-ai, anyscale, hugging-face, ibm,
salesforce, adobe, ai2, arcee-ai, poolside, eleutherai, physical-intelligence,
figure, pytorch-foundation, linux-foundation

Another researcher may own the org you reference. While working in parallel,
"Unknown organization slug" errors for a canonical slug owned by another group
are expected — ignore only those. Fix every other validation error in your files.

## Workflow

1. Read `docs/CONTENT_FORMAT.md` (field reference with examples) and
   `lib/schema.ts` (exact enums).
2. Research each assigned entity with WebSearch to find official pages, then
   WebFetch to read them. Verify every fact you write.
3. Write YAML files. The file name must equal the slug.
4. Run `npx tsx scripts/validate.ts` from the project root and fix errors in
   your files.
5. Write your notes file (path given in your assignment) in Markdown with, for
   each assigned candidate: decision (published / draft / not created),
   one-line reason, eligibility basis, evidence gaps and open questions, and any
   material recent changes found. Also list anything surprising or ambiguous.
6. Final reply: a short summary — files created, publication status of each,
   and the unresolved items. Keep it under 300 words.
