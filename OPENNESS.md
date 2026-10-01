# USASI openness rubric — version 0.2

This specification and `lib/openness.ts` change together. These are USASI editorial categories, not OSI certification or a claim that the entire catalog has undergone an OSAID audit. Ownership, hosting, availability, and reuse permission are separate axes. Publicly traded companies may publish restricted products; private companies may publish open components.

## Component evidence

Each availability item is `public`, `partial`, `not_public`, `unknown`, or `not_applicable`. Unknown means insufficient or unreviewed evidence, never closed. Public means obtainable or documented as asked by that item, not unrestricted reuse. Non-unknown assessments cite the specific release's evidence.

Model releases separately record weights, inference code, training code, complete training/preprocessing pipeline, training recipe, evaluation materials, training-data information, and training-data access. Information completeness covers provenance, scope, acquisition, selection, labeling, processing/filtering and listings of sources or alternatives. A downloadable dataset alone does not establish completeness. A fine-tuning script or inference SDK does not establish the complete base-training pipeline.

The v0.1 `training_data_information` item mixed data access and disclosure. Its existing values, notes and citations are preserved as `legacy_training_data_information`, excluded from new tier calculations. New completeness/access assessments default to unknown until reviewed; the migration does not refresh evidence dates or silently certify old claims.

Licenses record their component: weights, code, data, documentation, weights-and-code, or all. Scoped search requires the selected license and component to match the SAME license record. Weights-and-code covers only those two components. Any component is explicitly unscoped. Licenses on documentation do not license weights.

## Model tiers

Families and organizations never inherit tiers. Only specific model releases have them.

| Label | Requirement |
| --- | --- |
| Unknown | Weights unassessed. |
| Restricted weights | Partial access (approval or other restrictions). |
| Weights not public | Documented unavailable weights. |
| Open-weight | Publicly obtainable weights; usage restrictions may still apply. |
| Open-stack | Open-weight plus public inference code, training code and recipe, and public/partial NEW training-data information. This is a materials-disclosure label, not a rights determination. |
| Open system (reviewed) | Open-stack plus public complete training pipeline and complete data information, AND an explicit release-specific `system_openness_review` marked verified, with rationale, sources and review date. |

The last label retains the `fully-open` URL key for shared links. Tiers are cumulative; do not sum their columns. No existing record receives the highest label solely from its old checklist or license names.

A verified system review must assess the freedoms to use, study, modify and share the parameters, complete training/run/preprocessing code and data information, under applicable qualifying terms. It must explain any missing or unshareable inputs, how disclosed information permits reconstruction, and why the cited rights apply to this release. An editor must resolve license combinations/alternatives and scope; the code cannot make a legal or completeness judgment from SPDX identifiers alone. Unknown or restricted reviews cannot earn this label.

## Relationship to external definitions

The [OSI Open Source AI Definition 1.0](https://opensource.org/ai/open-source-ai-definition) requires sufficient data information, complete code, and parameters in the preferred form for modification under qualifying terms. It does NOT require every original training datum to be freely downloadable: unshareable and third-party paid data can be described. Data access restrictions therefore do not alone disprove system openness. Its [checklist](https://opensource.org/ai/checklist) is an educational tool, not certification or a substitute for release-specific review.

Readability and reuse rights remain distinct. Noncommercial weights can be downloadable; NC data does not earn an open-data-rights indicator; no-derivatives documentation is readable but not freely modifiable. A restrictive dataset license is a component fact, not an automatic verdict on a whole AI system.

`componentRights()` reports qualifying-license, review-required, or unknown. It requires a fact-level reviewed date and a recorded SPDX identifier; missing/custom/unreviewed terms remain unknown, not definitively closed. Multiple distinct licenses require review rather than assuming cumulative or alternative terms. The limited software-license list in `OSI_APPROVED_SPDX` is drawn from the [OSI license list](https://opensource.org/licenses). Data/content licenses are classified separately using the [Open Definition list](https://opendefinition.org/licenses/): CC0-1.0, CC-BY-4.0, CC-BY-SA-4.0, ODC-By-1.0, ODbL-1.0 and PDDL-1.0. They are not described as OSI-approved software licenses. An identifier alone never substitutes for inspecting the actual terms.

## Other artifact types and evidence

Frameworks/runtimes: source code, documentation, installation, supported platforms, release status. Datasets: access, provenance, documentation, licensing, limitations. Evaluations: code, tasks/data, methodology, reproducibility instructions, limitations. Research stacks: source, documentation, training code, data information, reproducibility. These are never forced onto a weights ladder.

Hosted product/API describes delivery only, not weights or licensing. Licenses must cite the applicable license file or card. Availability must cite the actual access documentation and restrictions. Release evidence is never inherited from another version. Fact reviewed, fact effective, source fetched/accessed, record edited, record reviewed, and build dates remain distinct; absent dates are unknown. Hardware estimates retain source and precision/quantization assumptions.

## Changes

Change this specification, implementation, methodology and tests together, bump `RUBRIC_VERSION`, and add a policy changelog. v0.2 conservatively withdraws old aggregate conclusions until the separate completeness and rights reviews exist. No automatic fetch changes a published fact or review date.
