# People Behind Local AI: re-review of four drafts (2026-10-01)

Scope: `content/people/awni-hannun.yml`, `brandon-duderstadt.yml`, `andriy-mulyar.yml`,
`luca-soldaini.yml`. Rules: `research/PEOPLE_BRIEF.md` plus this assignment's wording rules
(no gendered pronouns, no personal details, no funding/follower counts/superlatives).

Method: every cited page was fetched on 2026-10-01 with curl, User-Agent
`USASI-catalog-research/0.3`. No email address or personal identifier went into any request. No
Wikipedia, aggregator, news or social-media sources were used. Only the four files above were
edited. `npx tsx scripts/validate.ts`: 0 errors. The one warning is in another file
(`artifacts/continue-extension.yml`).

## Why they were drafts

None of the four was drafted for a verification gap. All four were researched and published on
2026-09-29 (`people-a.md`, `people-b.md`). The fact-check pass the same day
(`research/verification/people.md`) applied **editor ruling 1**: "a published profile needs a
current role tied to local or open-weight AI work". All four now hold current roles outside that
work (Anthropic, Calcifer Computing, Nomic's construction-industry platform, Microsoft AI), so the
pass set Mulyar to draft and kept the other three as drafts. The open item is
`CONTENT_REVIEW.md` F1k ("Confirm, or allow profiles based on past contributions").

The section has since become a standing list (changelog 2026-10-01). Profiles published since
then follow a looser test: a documented current role plus documented local-AI work, which may be
past. Andrej Karpathy, for example, is published with no current affiliation. This assignment
uses the same test: a verified current role and at least one concrete local-AI contribution. All
four pass it, so all four are now **published**.

**Owner action:** this reverses ruling 1 / F1k for these four. `CONTENT_REVIEW.md` F1k still
reads "Applied". It was outside my edit scope and should be updated, or the four reset to draft
if ruling 1 still stands.

## Per profile

### Awni Hannun: published
- Current role: awnihannun.com says "I am currently a Member of the Technical Staff at
  Anthropic". The GitHub bio reads "Research at Anthropic. Prev: co-created MLX at Apple…".
- Past role: the same site says "a Research Scientist at Apple where I co-created MLX".
- Contribution: the MLX README calls MLX "an array framework for machine learning on Apple
  silicon". It says the suite "was initially developed with equal contribution by Awni Hannun,
  Jagrit Digani, Angelos Katharopoulos, and Ronan Collobert" and lists the four in its BibTeX
  entry.
- Catalog: `mlx`, `anthropic`, `apple` (all published).
- Changes: no stale facts. Removed pronouns from bio and contribution, added the GitHub profile
  as a source for the work entry, refreshed dates, set to published.
- Left out: education, earlier employers, and the email address shown on the site.

### Brandon Duderstadt: published
- Current role: nomad.garden home page says "Calcifer, an organization I founded" and "I spend
  most of my time … at Calcifer". The bio page says "is building Calcifer Computing, a long-term
  oriented AI research and development company". Role recorded as Founder, with no catalog slug.
- Past role: "Previously, I cofounded Nomic" (home page) and "founding CEO of Nomic AI" (bio page).
- Contributions:
  - Author of the GPT4All paper (arXiv 2311.04931 author list) and named in the gpt4all README
    citation. The README says GPT4All "runs large language models (LLMs) privately on everyday
    desktops & laptops". The repository is MIT-licensed and not archived.
  - The Nomic Embed report's Contributions section (§7.1) says the work included "several design
    contributions across the entire stack" and "the base implementation of the data curation
    pipeline". Also an author of arXiv 2402.01613.
- Catalog: `nomic-ai` (past), `gpt4all`, `nomic-embed`.
- Changes: headline reworded to "Nomic co-founder…". Pronouns removed. Wording "large language
  models" now matches the README. Dates refreshed, set to published.
- Left out: location, fellowship/teaching, investing, press mentions, board seat.

### Andriy Mulyar: published
- Current role, from three sources:
  - Nomic post "Announcing a new Nomic Platform" (2025-11-03), signed "Andriy Mulyar CEO, Nomic";
  - Nomic post of 2026-09-03, signed "Andriy CEO";
  - GitHub bio "Merging humans with latent spaces at @nomic-ai", organization Nomic AI.
- Nomic's current focus: the 2025-11-03 post describes "domain-specific embedding, parsing and
  vision language models" and agents for "the design and construction of the built world". The
  bio now states this so readers do not take the CEO role to be local-AI work.
- Contributions: GPT4All paper author and README citation. The Nomic Embed report §7.1 says Mulyar
  "set early project direction, reviewed code implementations, and made several model design and
  dataset curation contributions".
- Catalog: `nomic-ai`, `gpt4all`, `nomic-embed`.
- Note: one source's page title mentions a funding round. It is cited only for the CEO signature
  and its date. No profile text mentions funding. Nomic has no /about or /company page (both 404),
  and no other 2026 post gives Mulyar's full name with a title. The 2026-04-02 AEC-Bench post lists
  Mulyar as a Nomic author but gives no title.

### Luca Soldaini: published
- Current role: soldaini.net says "Currently, I am a member of the technical staff at Microsoft AI
  working on MAI-Thinking models". The GitHub bio says "currently MTS @ Microsoft AI". Linked to the
  `microsoft` organization, as in the 2026-09-29 version.
- Past role: "From 2022 to early 2026, I was a lead research scientist at Ai2, co-leading the Olmo
  project". The site describes Olmo as "fully-open". It says the team released "three generations
  of dense, mixture-of-experts, hybrid, and multimodal variants, alongside the data, code, recipes,
  and checkpoints".
- Contribution: first author of the Dolma paper (arXiv 2402.00159, submitted 2024-01-31). The
  abstract says the data curation toolkit was open-sourced.
- Catalog: `ai2` (past), `microsoft`, `olmo`, `dolma`.
- Changes:
  - Added the GitHub profile as a second current-role source.
  - Removed "Ai2's" before Dolma, because the abstract does not attribute the corpus to an
    organization.
  - Added the open-source toolkit to the Dolma entry.
  - Removed pronouns, refreshed dates, set to published.
- Left out: education, earlier employer, hobbies, and contact links.
