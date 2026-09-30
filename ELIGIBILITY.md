# USASI eligibility policy — version 0.1

Every record in the catalog must meet this policy before it is published. The
policy is applied the same way to every organization and project. There are no
exceptions for prominent organizations.

## Bases for eligibility

A record is eligible when it documents at least one of these bases, with
sources:

| Basis (`eligibility.basis`) | Applies to | Requirement |
| --- | --- | --- |
| `us-headquarters` | Organizations | Documented U.S. headquarters or principal executive office (official pages, terms of service naming the entity and address, or regulatory filings such as a 10-K cover page). The validator requires `headquarters.country: US`. |
| `us-nonprofit-or-lab` | Organizations | The entity is a U.S. nonprofit, university laboratory, or research institute (for example, per its own pages or an IRS exempt-organization listing). |
| `us-control` | Organizations | The entity is documented as primarily controlled by a U.S. entity — for example a research unit or subsidiary wholly owned by a U.S.-headquartered parent. |
| `us-governed-project` | Artifacts | The documented governing or maintaining entity of the software, dataset, or model is U.S.-based (for example a U.S. foundation or company). |

## Cases that do not qualify on their own

- A foreign organization whose only U.S. presence is a sales office.
- A project whose contributors appear to be American. Eligibility rests on the
  documented governing or maintaining entity, never on contributors' names or
  assumed nationalities.
- A U.S. fine-tune, wrapper, or redistribution of foreign base weights. The
  derivative may be eligible through its own maintainer, but the base model is
  not treated as U.S.-developed; the relationship is recorded under
  `provenance`.

## Cases that need a written assessment

- **Dual headquarters** (a company with significant presence in two countries).
- **Parent/subsidiary or unit** relationships, including foreign-headquartered
  units of U.S. companies and U.S. units of foreign companies.
- **Pending acquisitions or changes of control.** A signed agreement is recorded
  as pending in `status_note`; eligibility is reassessed when a change of
  control is documented as completed.
- **Projects with multi-organization governance.**

The assessment is written in `eligibility.explanation`, cites its sources, and
says what evidence was missing. If the basis cannot be documented, the record is
set to `status: pending_review`, `basis: undetermined`, and
`publication_status: draft`, and it is listed in `CONTENT_REVIEW.md`.

## Statuses

| Status | Public? | Meaning |
| --- | --- | --- |
| `eligible` | Yes, when also `published` | A basis is documented with sources. |
| `pending_review` | No | The basis is unresolved. Stays in the internal queue. |
| `excluded` | No | Reviewed and does not qualify. The reason is kept in the record or in `CONTENT_REVIEW.md`. |

Published records must be eligible; the validator enforces this.

## International collaboration and context

International collaboration does not need to be hidden. Where it exists, it is
described accurately. Non-U.S. organizations, models, or dependencies may appear
as clearly labeled provenance or comparison context inside a record, but they
are never added as catalog members.

## Tone

Eligibility is a scope rule for this catalog, not a judgment about any country,
company, or person. The catalog makes no claims about which country leads or
lags, and uses no national-superiority language.

## Changing this policy

Propose changes by pull request that updates this file, the methodology page,
and the USASI Compact if affected, with a changelog entry (`type: policy`).
