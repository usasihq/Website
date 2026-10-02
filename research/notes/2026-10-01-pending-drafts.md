# Pending drafts re-check (2026-10-01)

Scope: ten draft records whose U.S. basis was undocumented. Rules applied: ELIGIBILITY.md,
research briefs (rounds 1–3), and the 2026-10-01 owner-delegated decisions (MLC LLM precedent).
Every source below was fetched today with WebFetch, curl (User-Agent
`USASI-catalog-research/0.3`), the GitHub API, or the in-app browser. No personal data was sent.
Three pages showed a human-verification check (Cloudflare); none was clicked or worked around,
and those pages were not read.

## Summary

| Record | Decision | Basis |
|---|---|---|
| organizations/unsloth.yml | **Published** | us-headquarters |
| artifacts/unsloth-library.yml | **Published** | us-governed-project |
| artifacts/bigcodebench.yml | **Published** | us-governed-project |
| organizations/crewai.yml | Draft (not edited) | undetermined |
| artifacts/crewai-framework.yml | Draft (not edited) | undetermined |
| artifacts/swe-bench.yml | Draft (not edited) | undetermined |
| artifacts/gpqa.yml | Draft (not edited) | undetermined |
| artifacts/mmlu.yml | Draft (not edited) | undetermined |
| artifacts/dclm.yml | Draft (not edited) | undetermined |
| artifacts/lance.yml | Draft (not edited) | undetermined |
| artifacts/openthoughts.yml | Draft (not edited) | undetermined |
| artifacts/triton.yml | Draft (not edited) | undetermined |

`npx tsx scripts/validate.ts`: 0 errors. The one remaining warning (continue-extension) is not
in my files.

## Unsloth (organization) — published, us-headquarters

The deciding evidence is the USPTO trademark file for UNSLOTH (official registry):

- TSDR status, https://tsdr.uspto.gov/statusview/sn98849307: Registration No. 7973599,
  registered 2025-10-07, for downloadable LLM training/fine-tuning software. Owner: Unsloth AI
  Inc., corporation organized in Delaware, owner address in San Francisco, California.
- Nonfinal office action of 2025-05-08,
  https://tsdrsec.uspto.gov/ts/cd/tmcasedoc/downloadproxy?url=/api/casedoc/cms/case/98849307/office-action/OfficeAction7406018.pdf:
  the domicile address of record (a Delaware address) was not acceptable. The applicant had to
  give its domicile, defined as "the location of applicant's headquarters where its senior
  executives or officers ordinarily direct and control" its activities.
- Response of 2025-06-09,
  https://tsdrsec.uspto.gov/ts/cd/tmcasedoc/downloadproxy?url=/api/casedoc/ts/cd/98849307/ROA20250610062538/1/webcontent:
  the owner address changed from Middletown, Delaware to San Francisco. The response lists only
  this one owner address; hidden fields such as email appear as XXXX, and no separate hidden
  domicile field appears.
- Supplemental office action of 2025-06-25,
  https://tsdrsec.uspto.gov/ts/cd/tmcasedoc/downloadproxy?url=/api/casedoc/cms/case/98849307/office-action/OfficeAction7564653.pdf:
  "an acceptable domicile address was submitted."

Reasoning: the USPTO first rejected a registered-agent-type Delaware address and asked for the
headquarters address. It then accepted the San Francisco address that the company gave in reply.
I treat this as an official filing that documents a U.S. principal place of business, which is
more than a Delaware incorporation or a choice-of-law clause. The record says plainly that the
address comes from the trademark file.

Edits: added `legal_name` (Unsloth AI Inc.) and `legal_form` (Delaware corporation), both from
the TSDR record. Set `headquarters` to "San Francisco, California (owner address in the company's
USPTO trademark registration)". Set eligibility to eligible / us-headquarters (assessed
2026-10-01) and publication_status to published, with updated_at 2026-10-01. Added six sources:
four USPTO documents and the unsloth.ai About and Contact pages. Marked the re-read sources with
reviewed_at. `last_reviewed` is unchanged because the products and summary were not re-audited.

Other checks today:

- unsloth.ai blocks curl and WebFetch with a Cloudflare challenge. The in-app browser loaded it
  without any interaction. The About, Contact, Pricing, and License pages give no address.
- The /license page is titled "Community License", dated February 10, 2024, but its text is a
  short privacy notice with no entity or address. /terms, /privacy, and /careers return 404.
- The repository LICENSE and studio/__init__.py still name the Unsloth AI Inc. team.
- Self-reported fields agree but were not relied on: GitHub org location "United States of
  America" and YC location "San Francisco" (batch Summer 2024).
- No SEC EDGAR company match for "unsloth".
- California's bizfile search returned "request was blocked by our security service". It was
  not retried.
- A search snippet mentioned a Covina, CA mailbox address on the license page. That address is
  not on the live page, so it was not used.

Ambiguity to note: the unsloth.ai footer markup has an unrendered element (zero size, beside an
old "© 2023 Unsloth" line) that reads "A Moonshot © company." and links to moonshotai.org. That
domain is now a defunct Wix placeholder. It looks like leftover template markup and is not
visible on the page. It was not treated as evidence of ownership, and no official source
describes any parent company. Worth a glance at the next review.

## Unsloth library — published, us-governed-project

The maintaining entity is Unsloth AI Inc. Evidence:

- The repository is in the unslothai GitHub org.
- The LICENSE appendix copyright line names the Unsloth AI Inc. team; re-read today at
  https://raw.githubusercontent.com/unslothai/unsloth/main/LICENSE.
- studio/__init__.py has the header "Copyright 2026-present the Unsloth AI Inc. team".

The company's U.S. principal place of business comes from the USPTO file above; the registered
goods match this software. Edits: eligibility text and status, publication_status published,
updated_at 2026-10-01, and the TSDR source added. The YC source was removed because no claim
cited it any more (validator warning). `last_reviewed` is unchanged.

## BigCodeBench — published, us-governed-project

Deciding evidence:

- BigCode organization page, https://www.bigcode-project.org/docs/about/organization/ (new
  source): BigCode is "a community project jointly led by Hugging Face and ServiceNow". It is
  "governed by a steering committee jointly led by ServiceNow and Hugging Face", which organizes
  and manages the project, oversees all working groups, and breaks ties as a last resort.
- Dataset card, https://huggingface.co/datasets/bigcode/bigcodebench: the dataset "was created
  as part of the BigCode Project". The point of contact includes the BigCode project address.
- The code, leaderboard, and dataset are published in BigCode's GitHub and HF organizations.
- The BigCode GitHub org profile says it is "run by Hugging Face and ServiceNow Research"
  (read through the GitHub API; not cited).

Both companies are published in the catalog as U.S.-headquartered (hugging-face: Brooklyn, NY;
servicenow: Santa Clara, CA). This matches the existing StarCoder2 records, which are published
as us-governed-project on the same BigCode stewardship. The 2026-09-29 assessment relied only on
the mission page ("corporate support"); the organization page documents governance directly.

Contributor affiliations (the lead curator is at Monash/CSIRO's Data61, Australia) were not
counted either way. The repository is archived (GitHub API: archived true).

Edits:

- Added Hugging Face and ServiceNow as maintainers ("co-leads the BigCode steering committee").
- Set `organization_slugs: [hugging-face, servicenow]`.
- Rewrote the eligibility text and set the status to eligible.
- Set publication_status to published and updated_at to 2026-10-01.
- Added the new source and reviewed_at on re-read sources.

`last_reviewed` is unchanged.

## CrewAI (organization and framework) — still draft; files not edited

Still missing: any official page, terms, or filing that gives a U.S. headquarters or principal
office. New evidence found today points the other way:

- USPTO trademark search (tmsearch.uspto.gov, owner and wordmark searches for "crewai") returned
  one filing: CREWAI, Serial No. 98425496, filed 2024-02-28, abandoned 2025-01-06
  (https://tsdr.uspto.gov/statusview/sn98425496). It names CrewAI, Inc. (Delaware) with an owner
  address in Cotia, São Paulo state, **Brazil**. The street address is not recorded in the
  catalog. This is the only official registry address found, and it is not in the U.S.
- The terms of use (effective 2025-09-24, re-read) still say only "CrewAI, Inc., a Delaware
  corporation" with New York governing law. Notices go to the order-form address, so no address
  is given.
- The privacy policy has no address.
- crewai.com has no about, careers, or contact page (all 404). The footer links to the Workable
  board, a Vanta trust center (JavaScript only, no address read), and the brand knowledge-graph
  page (no address).
- The Workable account API has no location. The docs and help pages have no address.
- SEC EDGAR: no company match for "crewai" and no Form D full-text hits.
- Business Wire releases on FinancialContent (latest 2026-02-11) add nothing new.
- Third-party aggregators disagree (San Francisco, São Paulo, Middletown DE) and were not used.

Decision: unchanged (pending_review / draft). An editor may want to add the Brazil trademark
address to the CrewAI eligibility text at the next review.

## SWE-bench — still draft

- README: the maintainers are the "SWE-bench team". Contacts are two individuals with Princeton
  and Stanford emails, which are contributor affiliations and do not count.
- The GitHub org describes itself as "Organization for maintaining SWE-bench and related
  projects", with no location.
- swebench.com says "© 2026 SWE-bench Team". It thanks supporters (Open Philanthropy, AWS,
  Modal, Andreessen Horowitz, OpenAI, Anthropic); supporters are not maintainers.
- The Princeton NLP group site (princeton-nlp.github.io) is stale and lists no projects.

Possible leads not read because they showed a human-verification check or a 403:

- Princeton Research Computing "Selected RSE Projects":
  https://researchcomputing.princeton.edu/research/selected-rse-projects
- Princeton AI Lab news, "AI Lab Research Software Engineers Bring Academic Theory into Practice"
  (2025): https://ai.princeton.edu/news/2025/ai-lab-research-software-engineers-bring-academic-theory-practice
- The PLI SWE-bench blog: https://pli.princeton.edu/blog/2023/swe-bench-can-language-models-resolve-real-world-github-issues

Next step: a manual check of these Princeton pages. If a Princeton lab or unit presents SWE-bench
as its own maintained project, it would qualify under the MLC precedent.

## GPQA — still draft

The NYU Alignment Research Group site (https://wp.nyu.edu/arg/) has only Home, People, and Blog
pages; /research, /publications, and /projects return 404. Its GPQA post is written in one
author's voice and does not present GPQA as a group project. The repository and dataset are
still under personal accounts.

Missing: an NYU (or other U.S.) lab page presenting GPQA as its project.

## MMLU — still draft

The CAIS research page (https://safe.ai/work/research, re-read) lists 32 works, including older
Hendrycks papers such as "Aligning AI With Shared Human Values". It does **not** list MMLU. The
CAIS homepage and About page do not mention it either. The cais/mmlu Hugging Face copy is still
the only CAIS link.

Missing: a CAIS or university statement that it maintains MMLU.

## DCLM — still draft

- The datacomp.ai DCLM page and Team page (https://www.datacomp.ai/dclm/people.html) list
  individuals from many U.S. and non-U.S. institutions (Tel Aviv University, Hebrew University,
  TUM, JSC/LAION, and others) and name no lead institution.
- The mlfoundations GitHub org has no description; its blog link points to a personal faculty
  page.

Missing: a lab or entity that presents DCLM as its own.

## Lance — still draft

lance.org/community (re-read) still describes volunteer, ASF-inspired governance. The PMC
includes members affiliated with LanceDB and other companies, including ByteDance. There is no
foundation or legal entity, and no move to one was found.

Missing: a single documented governing entity.

## OpenThoughts — still draft

The current site (https://www.openthoughts.ai/) says the collaboration is "led by researchers
and engineers" from many universities, including TUM, and LAION. It lists Bespoke Labs only
among supporters. The README still says "A collaboration led by Bespoke Labs and the DataComp
community", so the two official sources conflict. Bespoke Labs' U.S. headquarters is also not
documented: its terms show only California governing law.

Missing: a single U.S. governing entity, or an editor's call on multi-institution projects with
non-U.S. leads.

## Triton — still draft

- CONTRIBUTING.md (core maintainer list dated 09/18/2026) still gives control to individual
  module, core, and lead maintainers, with no company or foundation.
- The triton-lang GitHub org has no profile.
- The README mentions the October 2026 Triton conference next to PyTorch Conference.
- Search found the PyTorch Foundation's 2026 addition of Helion, not Triton; no foundation
  hosting of Triton was found.

Missing: an organization documented as Triton's governing or maintaining entity.
