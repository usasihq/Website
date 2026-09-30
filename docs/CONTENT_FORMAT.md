# Content format

Catalog records are YAML files validated by `lib/schema.ts` and `lib/validate.ts`.
Run `npm run validate` after every edit. This page is the field reference; the
editorial rules live in [ELIGIBILITY.md](../ELIGIBILITY.md),
[OPENNESS.md](../OPENNESS.md), and [CONTENT_REVIEW.md](../CONTENT_REVIEW.md).

```
content/organizations/<slug>.yml   one organization, lab, research unit, or foundation
content/artifacts/<slug>.yml       one model family, model release, software project, dataset, or eval tool
content/changelog/<date>-<topic>.yml  one genuine catalog change
content/featured.yml               homepage editorial selection (with explanation)
content/pages/*.mdx                editorial pages (About, Compact, ...)
```

The file name must equal the record's `slug`.

## General rules

- **Every public statement carries `source_ids`.** Each ID must match a `sources[].id`
  in the same file. Cite the source that actually supports the specific claim.
  An organization's homepage does not support a detailed technical claim.
- **Only cite pages you have opened and read.** Never cite a URL from memory or
  from a search-result snippet. `accessed_at` is the date you read it.
- **Unknown stays unknown.** Use `null`, `unknown`, or omit optional facts.
  Do not pad a date (`2025-08` stays `2025-08`; do not write `2025-08-01`).
- **No speculation.** No rumored versions, acquisitions, partnerships, staffing,
  funding, valuations, benchmark scores, user counts, or power-capacity figures.
- **Quote strings that look like numbers or dates** when they are not dates:
  `version: "3"`, `logo_text: "3M"`.
- **Plain, restrained prose.** Librarian / research-desk tone. No superlatives
  ("leading", "cutting-edge", "best"), no marketing copy, no national-superiority
  framing. Write summaries in your own words; do not copy source text.
- **Dates.** `updated_at` = date of the last substantive edit to this record.
  `last_reviewed` = date an editor last checked the evidence. `released_at` =
  documented release date of the artifact (or `null`). Builds never touch these.
- **Publication status.** `published` requires `eligibility.status: eligible`
  and adequate evidence. Use `draft` for anything incomplete or unresolved; drafts
  never reach the public site, search, counts, exports, or sitemap. `archived`
  keeps a historical page (requires `archive_note`).

## Sources

```yaml
sources:
  - id: ai2-about                 # lowercase, unique within the file
    title: About Ai2              # page title as published
    url: https://allenai.org/about
    publisher: Ai2                # who published the page
    kind: official-page           # official-page | documentation | repository | model-card |
                                  # dataset-card | license | release-notes | announcement |
                                  # paper | filing | news | other
    published_at: null            # YYYY, YYYY-MM, or YYYY-MM-DD if stated on the page; else null
    accessed_at: 2026-09-29       # the date you actually read it
```

Prefer, in order: the actual license file, model/dataset cards, official
documentation, release notes, repositories, the organization's own pages,
regulatory filings (e.g. SEC 10-K for headquarters and structure), and then
reputable reporting, used only for the specific claim it supports and labeled
`kind: news`.

## Organization

```yaml
slug: example-lab                  # kebab-case, stable
name: Example Lab                  # common name
legal_name: null                   # or {text, source_ids} when verified
website: https://…
logo_text: EL                      # 1–3 characters for the monogram tile
summary:
  text: One to three factual sentences about what the organization does.
  source_ids: [example-about]
organization_roles: [model-developer, research-lab]
  # model-developer | research-lab | cloud-provider | compute-infrastructure |
  # chip-designer | hardware-manufacturer | inference-provider | data-platform |
  # enterprise-software | developer-platform | consumer-products | robotics |
  # open-source-steward | nonprofit-research | data-services | university-lab |
  # standards-body
ownership_category: privately-held
  # publicly-traded | privately-held | nonprofit | unit-of-another-organization |
  # foundation-hosted | public-institution (e.g. a state university) | unknown
legal_form: null                   # or {text: "Delaware public benefit corporation", source_ids}
parent_org_slug: null              # set together with parent_relationship
parent_relationship: null          # subsidiary | division | research-unit | hosted-project
headquarters:                      # or null when not documented
  label: San Francisco, California
  country: US
  source_ids: [example-about]
other_locations: []                # [{label, country, source_ids}] — documented only
founded: null                      # or {year: 2019, source_ids}
sectors: [frontier-models, research]
  # frontier-models | cloud | chips | open-models | agents | data | enterprise |
  # robotics | defense | research | science — apply only what the record's evidence supports
status_note: null                  # or {text, source_ids} for material status (e.g. acquired)
products:
  - id: example-api                # unique within the file
    name: Example API
    kind: hosted-model-api
      # hosted-model-api | assistant-app | cloud-platform | compute-service |
      # inference-service | developer-tool | enterprise-software | data-platform |
      # hardware | robot | other
    access: Paid API access to Example's hosted models; documented in the developer docs.
    url: https://…
    source_ids: [example-api-docs]
    last_reviewed: 2026-09-29
notable_facts: []                  # [{text, source_ids}] — documented, relevant, non-promotional
eligibility:
  status: eligible                 # eligible | pending_review | excluded
  basis: us-headquarters           # us-headquarters | us-nonprofit-or-lab | us-control |
                                   # us-governed-project | none | undetermined
  explanation: Headquartered in San Francisco, California, per the company's about page.
  source_ids: [example-about]
  assessed_at: 2026-09-29
openness_summary:                  # evidence-based summary of what is and is not public; or null
  text: Offers hosted models through an API. This catalog has no record of public model weights from Example Lab.
  source_ids: [example-api-docs]
hiring_url: null                   # only a verified careers URL
publication_status: published
archive_note: null
updated_at: 2026-09-29
last_reviewed: 2026-09-29
sources: [ … ]
```

Notes:

- `ownership_category` is who owns/controls it; `organization_roles` is what it
  does; `legal_form` is its legal entity type. Do not merge these.
- A division or research unit (e.g. a lab inside a larger company) gets its own
  record only when it publishes distinct artifacts or products; set
  `parent_org_slug` and `parent_relationship`. Counts report units separately.
- `openness_summary` must never call a whole organization "open" because one
  release has public weights.

## Artifact

Kinds: `model | dataset | framework | eval | runtime | research-stack`.
Models are either a `family` overview or a specific `release`. All other kinds
use `record_level: project`.

```yaml
slug: example-model-2-8b
name: Example Model 2 8B
kind: model
record_level: release              # family | release | project
family_slug: example-model         # releases only
version: "2 (8B)"                  # exact designation as published, quoted
maintainers:
  - name: Example Lab
    organization_slug: example-lab # must also appear in organization_slugs; or null
    source_ids: [model-card]
organization_slugs: [example-lab]  # relationships; reverse links are derived from here
links:
  - label: Model card
    url: https://huggingface.co/…
    kind: model-hub                # website | repository | model-hub | dataset-hub |
                                   # documentation | paper | license | release-notes
summary:
  text: What the artifact is, factually.
  source_ids: [model-card]
useful_for:                        # what it is documented as useful for; no performance claims
  text: …
  source_ids: [model-card]
eligibility: { status, basis, explanation, source_ids, assessed_at }
availability:
  status: public                   # public | partial | not_public | unknown | not_applicable
  access_conditions: Downloadable after accepting the license on Hugging Face.   # or null
  source_ids: [model-card]
licenses:                          # releases and projects only, never on families
  - name: Apache License 2.0
    spdx: Apache-2.0               # SPDX ID or null for custom licenses
    url: https://…/LICENSE
    applies_to: weights            # weights | code | data | documentation | weights-and-code | all
    source_ids: [license-file]
license_notes: null                # or {text, source_ids} — e.g. use restrictions
checklist:                         # keys depend on kind; see OPENNESS.md
  weights: { status: public, note: null, source_ids: [model-card] }
  inference_code: { status: public, note: null, source_ids: [repo] }
  training_code: { status: unknown, note: null, source_ids: [] }
  training_data_information: { status: partial, note: Sources described at a high level., source_ids: [tech-report] }
  training_recipe: { status: unknown, note: null, source_ids: [] }
  evaluation_materials: { status: public, note: null, source_ids: [model-card] }
run_notes: []                      # [{text, source_ids}] — only documented facts; any memory
                                   # figure must state precision/quantization and assumptions
provenance: null                   # or {text, derived_from: [{name, artifact_slug, url, note}], source_ids}
tags: [language-model]
publication_status: published
archive_note: null
released_at: 2025-11               # documented release date at the precision documented; or null
updated_at: 2026-09-29
last_reviewed: 2026-09-29
sources: [ … ]
```

Checklist keys by kind (anything missing is shown as **Unknown**):

| Kind | Keys |
| --- | --- |
| model (release) | `weights`, `inference_code`, `training_code`, `training_data_information`, `training_recipe`, `evaluation_materials` |
| framework, runtime | `source_code`, `documentation`, `installation`, `supported_platforms`, `release_status` |
| dataset | `access`, `provenance`, `documentation`, `licensing`, `stated_limitations` |
| eval | `code`, `tasks_data`, `methodology`, `reproducibility_instructions`, `limitations` |
| research-stack | `source_code`, `documentation`, `training_code`, `data_information`, `reproducibility_instructions` |

Any status other than `unknown`/`not_applicable` requires `source_ids`.

Family overviews summarize a line of releases and link to the release records.
They carry no checklist and no licenses, because licenses and availability
belong to the specific releases assessed. The openness tier shown on a release
is computed from its checklist and licenses by `lib/openness.ts`; it is never
typed by hand and never inherited by the family.

Suggested tags: `language-model`, `code-model`, `reasoning`, `multimodal`,
`vision-language`, `embedding`, `speech`, `robotics`, `mixture-of-experts`,
`inference`, `serving`, `training`, `compiler`, `distributed-computing`,
`numerical-computing`, `evaluation`, `benchmark`, `pretraining-data`, `local-inference`.

## Local corner profile

`content/people/<slug>.yml` — see `research/PEOPLE_BRIEF.md` for the full rules
and an annotated example. Only professional, sourced information: `name`,
`initials`, `headline`, `bio {text, source_ids}`, `affiliations[]` (name,
organization_slug, role, current, source_ids), `work[]` (name, artifact_slug,
url, contribution, source_ids), up to four `links` the person publishes, dates,
and `sources`. No location, nationality, age, family, or photos.

## Changelog entry

```yaml
date: 2026-09-29
title: Initial catalog
summary: First published set of reviewed records.
changes:
  - { type: added, record_type: organization, slug: ai2, note: null }
```

Only record genuine editorial changes. A rebuild is not a change.
