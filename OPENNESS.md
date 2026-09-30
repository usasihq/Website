# USASI openness rubric — version 0.1

This document defines how the USASI catalog describes what is public about an
artifact. The rules are implemented in `lib/openness.ts`; this file and that
module must change together, and any substantive change bumps `RUBRIC_VERSION`
and is recorded in the changelog.

The labels defined here are **USASI editorial categories ("USASI rubric
v0.1")**. They are not a certification, not a quality or safety rating, and not
the Open Source Initiative's Open Source AI Definition or any other external
standard. Where the rubric relies on an outside list (OSI-approved licenses), it
names the list and the exact identifiers it accepts.

## 1. Scope

- The rubric applies to records in the Open Models & Tools directory
  (`content/artifacts/`).
- Checklists apply to **model releases** and to **project** records (software,
  datasets, evaluation tools, research stacks). **Model family** overview records
  carry no checklist, no licenses, and no tier: families summarize releases,
  and licenses and availability can differ between releases.
- Organizations are never assigned an openness label. An organization page may
  carry an evidence-based `openness_summary`, which must not describe the whole
  organization as "open" because of one release.

## 2. Statuses

Every checklist item has one status:

| Status | Meaning |
| --- | --- |
| `public` | Documented as available to the general public. Access conditions and license terms may still apply (for example, a click-through license). |
| `partial` | Some of it is available, or access requires approval, is limited to some users, or is otherwise restricted. |
| `not_public` | The evidence documents that it is not available. |
| `unknown` | Not assessed, or the evidence is insufficient. Unknown never means "no". |
| `not_applicable` | Does not apply to this artifact. |

Any status other than `unknown` or `not_applicable` must cite at least one
source that supports it for **this specific release or project**. Evidence for
one release is never assumed to apply to another.

## 3. Type-specific checklists

### Model releases

| Key | Item | Question |
| --- | --- | --- |
| `weights` | Weights | Can the general public download the model parameters for this release? `public` = downloadable by anyone, possibly after accepting a license; `partial` = access by request/approval, or restricted to some users or regions. |
| `inference_code` | Inference code | Is code for running the model published? |
| `training_code` | Training code | Is the code used to train the model published? |
| `training_data_information` | Training-data information | `public` = the training data itself can be obtained; `partial` = composition or sources are documented without full access. |
| `training_recipe` | Training recipe | Are the training configuration and procedure documented in enough detail to follow? |
| `evaluation_materials` | Evaluation materials | `public` = evaluation code or prompts that let others re-run the reported evaluations are published for this release; `partial` = results only (for example a results table in the model card). |

### Frameworks and runtimes

`source_code`, `documentation`, `installation`, `supported_platforms`, `release_status`.

### Datasets

`access`, `provenance`, `documentation`, `licensing`, `stated_limitations`.

### Evaluation tools

`code`, `tasks_data`, `methodology`, `reproducibility_instructions`, `limitations`.

### Research stacks

`source_code`, `documentation`, `training_code`, `data_information`, `reproducibility_instructions`.

The weights ladder in §4 is never applied to software, datasets, or
evaluation tools.

## 4. Model-disclosure tiers (model releases only)

The tier is **computed** from a release's checklist and licenses by
`computeTier()` in `lib/openness.ts`. It cannot be written by hand and is never
inherited by a family or an organization.

| Tier | Requirement |
| --- | --- |
| **Unknown** | `weights` is `unknown`. |
| **Restricted weights** | `weights` is `partial` (approval-gated, or restricted to some users or regions). Not counted as open-weight. |
| **Weights not public** | `weights` is `not_public`. |
| **Open-weight** | `weights` is `public`. License terms may still restrict use; a caveat is shown whenever the weights license is not on the OSI list below. |
| **Open-stack** | Open-weight **and** `inference_code`, `training_code`, and `training_recipe` are all `public`, **and** `training_data_information` is `public` or `partial`. |
| **Fully open** | Open-stack **and** all six model items are `public` (so the training data itself is obtainable) **and** every license recorded for the weights and for the code has an SPDX identifier on the list below. |

Tiers are cumulative: fully open ⊂ open-stack ⊂ open-weight. When tiers are
shown as columns (for example on `/matrix`), the columns overlap and must never
be added together.

**Closed product/API** is a separate label used on organization pages for
documented hosted products (product kinds `hosted-model-api` and
`assistant-app`). It describes delivery, not an artifact, and says nothing
about other releases by the same organization.

## 5. OSI-approved license list used by the rubric

The rubric treats exactly these SPDX identifiers as OSI-approved:
`Apache-2.0`, `MIT`, `BSD-2-Clause`, `BSD-3-Clause`, `MPL-2.0`, `ISC`,
`GPL-2.0-only`, `GPL-2.0-or-later`, `GPL-3.0-only`, `GPL-3.0-or-later`,
`LGPL-2.1-only`, `LGPL-2.1-or-later`, `LGPL-3.0-only`, `LGPL-3.0-or-later`,
`AGPL-3.0-only`, `AGPL-3.0-or-later`, `EPL-2.0`.

The list is deliberately short. A license absent from it — including custom
model licenses such as community licenses, OpenMDW, or vendor model licenses —
does not satisfy the fully open requirement until an editor adds it here with a
citation to the OSI's approved-license list and bumps the rubric version.
Data licenses (for example ODC-By or CC BY) are recorded but are not part of the
fully open license test in v0.1.

## 6. Evidence requirements

- Licenses: the license file itself, or the license field of the model or
  dataset card, for the specific release. `applies_to` records whether the
  license covers weights, code, data, documentation, or everything.
- Weights availability: the model hub page or the publisher's download
  documentation, including any gating or regional restrictions.
- Training code, data, and recipe: the repository, data card, or technical
  report for that release. Fine-tuning code does not count as training code for
  the base model.
- Any hardware or memory estimate in run notes must be quoted from an official
  source and must state precision or quantization and assumptions; the validator
  rejects memory figures without them.

## 7. Known limitations of v0.1

- The rubric does not grade license restrictiveness beyond the OSI list.
- It does not evaluate the quality or completeness of documentation, only its
  documented availability.
- `partial` covers a wide range of situations; the checklist note explains each.

## 8. Changing the rubric

Propose changes by pull request that updates this file, `lib/openness.ts`,
the methodology page, and the unit tests together, bumps `RUBRIC_VERSION`, and
adds a changelog entry with `type: policy`.
