# Institution coverage pilot: DOE national laboratories and U.S. universities

Reviewed 2026-10-01. Every cited page was fetched on 2026-10-01 with WebFetch or `curl` using the
generic User-Agent `USASI-catalog-research/0.3`. No personal identifiers were sent. Bot checks were
not bypassed, and TLS verification was not disabled. The unauthenticated GitHub REST API was used
only to check repository status (archived flag, default branch, release list). It is not cited.

Validation: `npx tsx scripts/validate.ts` reports 0 errors. The one remaining warning
(`continue-extension.yml`) predates this work. `npx vitest run tests/unit` passes (166 tests).

## Files created (all new; no existing file edited)

| File | Status | Eligibility |
| --- | --- | --- |
| organizations/lawrence-livermore-national-laboratory.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/oak-ridge-national-laboratory.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/pacific-northwest-national-laboratory.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/sandia-national-laboratories.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/lawrence-berkeley-national-laboratory.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/georgia-institute-of-technology.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/university-of-california-san-diego.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/university-of-illinois-urbana-champaign.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/university-of-texas-at-austin.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| organizations/harvard-university.yml | published | eligible, us-nonprofit-or-lab (nonprofit) |
| organizations/cornell-university.yml | published | eligible, us-nonprofit-or-lab (nonprofit) |
| artifacts/lbann.yml (framework) | published | eligible, us-governed-project (LLNL) |
| artifacts/hydragnn.yml (framework) | published | eligible, us-governed-project (ORNL) |
| artifacts/neuromancer.yml (framework) | published | eligible, us-governed-project (PNNL) |
| artifacts/transformer-explainer.yml (framework) | published | eligible, us-governed-project (Georgia Tech) |
| artifacts/fastvideo.yml (framework) | published | eligible, us-governed-project (UC San Diego) |
| artifacts/llmrouter.yml (framework) | published | eligible, us-governed-project (UIUC) |
| artifacts/kempnerforge.yml (framework) | published | eligible, us-governed-project (Harvard) |

## How the labs are recorded

All five labs use the same fields:

- **Ownership and role.** `ownership_category: public-institution`, `organization_roles: [research-lab]`, and `parent_org_slug: null` (DOE has no catalog record).
- **`ownership_evidence`.** Quotes the lab's own description of its government relationship.
- **`legal_form`.** Names the managing and operating contractor, as the lab's own pages state it.
- **Eligibility basis.** `us-nonprofit-or-lab`, following the NIST precedent for government laboratories.
- **`legal_name`.** Null, because a laboratory is a facility, not the contracting entity.
- **Neutral wording.** No record states or implies any relationship between this catalog and DOE or any lab.
- **Sectors.** LLNL and Sandia carry `defense` because their own pages describe NNSA nuclear-deterrent missions. Editors may prefer to drop it.

## Candidates

### DOE national laboratories

- **argonne-national-laboratory: not created.**
  - Every anl.gov page tried (`/`, `/about`, `/ai`) and `alcf.anl.gov/about` returned a Cloudflare "Just a moment..." challenge to curl, and HTTP 403 to WebFetch. Bot checks were not bypassed.
  - As a result, the management arrangement (UChicago Argonne, LLC) and the lab's AI activity could not be read from the lab's own pages.
  - Retry with an approved method, or have an editor supply the pages.
- **lawrence-livermore-national-laboratory: published, with `lbann`.**
  - Operator and history: operated by LLNS for NNSA; a GOCO FFRDC; LLNS has managed the lab since 2007-10-01; the LLNS team includes Bechtel National, the University of California, BWX Technologies, and Amentum; founded 1952.
  - AI work: from llnl.gov/news/highlights/ai, including its Data Science Institute and AI Innovation Incubator.
  - Genesis Mission projects are mentioned without counts.
- **oak-ridge-national-laboratory: published, with `hydragnn`.**
  - Operator: managed by UT-Battelle LLC for DOE. Founded in 1943, per the "80 years in 2023" statement and Manhattan Project origins.
  - The AI page names CAISER as the "Center for Artificial Intelligence Security Research". A second paragraph on the same page drops "Security"; the record uses the full name.
  - Gap: the ORNL pages fetched do not describe UT-Battelle's ownership, so only its name is recorded.
  - Left out: staff, economic-output, and supercomputer claims.
- **sandia-national-laboratories: published, no artifact.**
  - Operator: managed and operated by NTESS, a wholly owned subsidiary of Honeywell, under contract DE-NA-0003525. NTESS took over on 2017-05-01.
  - History: Z Division (1945), Sandia Laboratory (1948), Sandia Corporation (1949), Livermore site (1956), DOE national laboratory (1979).
  - `founded` is null because the history page gives several founding milestones.
  - PyApprox (MIT License, copyright NTESS) is described in notable_facts but not created as an artifact. Its README centres on uncertainty quantification and surrogate modelling rather than AI. An editor could add it.
- **los-alamos-national-laboratory: not created.**
  - On 2026-10-01 every lanl.gov URL tried returned HTTP 404, to both curl and WebFetch. That included the homepage, `/about`, `/sitemap.xml`, and news URLs returned by search.
  - The lab's own pages could not be read. Triad National Security's site (triadns.org) responded, but the brief asks for the lab's own pages.
  - Candidate artifact for a retry: `lanl/hippynn` (atomistic machine learning).
- **pacific-northwest-national-laboratory: published, with `neuromancer`.**
  - Operator: managed and operated by Battelle. PNNL's history page calls Battelle "a not-for-profit research institute".
  - Founded 1965-01-04, when the AEC awarded Battelle the contract. Headquarters is 902 Battelle Boulevard, Richland.
  - Left out: the NeuroMANCER README's funding acknowledgments.
- **lawrence-berkeley-national-laboratory: published, no artifact.**
  - Operator: managed by the University of California for DOE's Office of Science. Founded 1931. Address is 1 Cyclotron Road, Berkeley.
  - The Materials Project appears in notable_facts, citing Berkeley Lab's news article and docs.materialsproject.org.
  - No Materials Project dataset record was created. Its license is "Materials Project Terms of Use" (per the AWS Open Data registry), and the terms page on next-gen.materialsproject.org returned a bot challenge (403).
  - `openness_summary` is null.
  - Left out: the July 2026 director change (no leadership facts), and user and citation counts.

### Universities

- **university-of-illinois-urbana-champaign: published, with `llmrouter`.**
  - Public research university with a land-grant mission, founded 1867. Governance is cited from the Board of Trustees page.
  - Gap: ilga.gov (the Illinois statutes) failed TLS certificate verification for curl. Verification was not disabled, so no statute is cited.
  - LLMRouter: MIT License, "Copyright (c) 2024 U Lab @UIUC". The project page lists co-authors from UMD, NTU, Purdue, and UIC, and the record says so.
- **georgia-institute-of-technology: published, with `transformer-explainer`.**
  - Governance: the USG institutions and regents pages.
  - Transformer Explainer is recorded as `kind: framework`. That is the closest available kind, but it is an educational web visualization; editors may want a better fit.
  - Left out: the user count in the arXiv abstract.
- **university-of-texas-at-austin: published, no artifact.**
  - Governance: the UT System institutions page. statutes.capitol.texas.gov needs JavaScript, so no statute is cited.
  - Lab described: RPL Lab.
  - No artifact was created:
    - AMAGO's MIT License names an individual as copyright holder.
    - The LIBERO README names no institution.
- **columbia-university: not created.** Not researched in this pilot: the cap was reached, and no lab artifact was verified.
- **harvard-university: published, with `kempnerforge`.**
  - Identity: the IRS MA extract lists "President and Fellows of Harvard College" (EIN 04-2103580) as a 501(c)(3) corporation with school status.
  - `founded` is null. The schema requires `founded.year >= 1800`, and Harvard dates its founding to 1636; the year is stated in the summary and notable_facts instead.
  - Suggestion: editors may want to lower the schema minimum.
  - Overcomplete (Kempner GitHub) was not used, because its license names an individual.
- **university-of-california-san-diego: published, with `fastvideo`.**
  - Founded 1960, in La Jolla. Governance: the UC Regents page.
  - FastVideo provenance records:
    - its README credits code and design from Wan-Video, diffusers, vLLM, SGLang, and others;
    - its FastH3 checkpoints are distilled from MiniMax-H3.
  - Model checkpoints are not assessed.
  - Left out: the lab's sponsor list.
- **university-of-michigan: not created.** Not researched in this pilot: the cap was reached.
- **cornell-university: published, no artifact.**
  - Identity: the IRS NY extract lists "Cornell University" (EIN 15-0532082) as a 501(c)(3) corporation with school status.
  - The record notes that Cornell calls itself privately endowed, a SUNY partner, and New York's land-grant institution.
  - Labs described: the Kuleshov Group (MDLM) and the Zhang Research Group (HeuriGym).
  - No artifact was created:
    - The MDLM README points to an improved implementation in a personal repository.
    - The HeuriGym README does not name Cornell, and its dataset is under a separate Hugging Face organization.

## Other notes and surprises

- **LBANN is in transition.**
  - The repository moved from `LLNL/lbann` to `LBANN/lbann`.
  - The main branch is now "LBANNv2": pyproject version 0.0.1, marked Pre-Alpha, "bring your own Torch".
  - The last tagged release is v0.104 (2023-11-08). The v1.x toolkit lives on the `v1.x-*` branches.
  - The record cites both READMEs.
- **NeuroMANCER:**
  - The online docs are labeled 1.3.3, while the latest code release is v1.5.6.
  - The license is Battelle's own BSD-style text, recorded with `spdx: null`.
  - The PyPI page returned a client challenge and is not cited.
- **Genesis Mission.** LLNL, ORNL, and LBNL all describe participation in DOE's Genesis Mission. It is mentioned neutrally, without counts or budget figures.
- **People.** No personal names appear in records except the scientists named in lab-history facts that the labs publish themselves (E. O. Lawrence for Berkeley Lab). Faculty pages were used only to identify research groups.
