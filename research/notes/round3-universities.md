# round3-universities research notes

Researcher group: round 3, U.S. universities, open research projects, and a federal standards body.
Reviewed 2026-10-01. Every cited page was fetched on 2026-10-01. Requests used WebFetch or `curl`
with the generic UA `USASI-catalog-research/0.3`. No personal identifiers were sent.

Validation: `npx tsx scripts/validate.ts` reports 0 errors. None of the remaining warnings are in
these files.

## Files created

| File | Status | Eligibility |
| --- | --- | --- |
| content/organizations/mit.yml | published | eligible, us-nonprofit-or-lab (nonprofit) |
| content/organizations/university-of-washington.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| content/organizations/nist.yml | published | eligible, us-nonprofit-or-lab (public-institution) |
| content/artifacts/awq.yml (framework, project) | published | eligible, us-governed-project |
| content/artifacts/marin.yml (research-stack, project) | published | eligible, us-governed-project |
| content/artifacts/dioptra.yml (framework, project) | published | eligible, us-governed-project |
| content/artifacts/openthoughts.yml (dataset, project) | **draft** | pending_review, undetermined |

Not created: `ai-rmf` (see below) and a Marin model release record (see Marin).

## Organizations

### MIT (`mit`): published
- **Eligibility.** The IRS MA extract (EIN 04-2103594) lists "MASSACHUSETTS INSTITUTE OF TECHNOLOGY" at 77 Massachusetts Ave, Cambridge, with these codes:
  - subsection 03, which is 501(c)(3);
  - foundation code 11, school, 170(b)(1)(A)(ii);
  - organization code 1, corporation.
  The care-of (ICO) field in that row names an individual. I left it out.
- **Self-description.** MIT's policy page 1.2 calls it an "independent, coeducational, privately endowed university". It places the main campus in Cambridge and Lincoln Laboratory in Lexington.
- **Founding.** mit.edu/about says "Incorporated 1861". facts.mit.edu gives "1861: Founded in Boston" and "1916: Moved to Cambridge", and the origins page says the first students came in 1865.
- **Labs in notable_facts.** Only the MIT HAN Lab is described, because it maintains `awq`. The AWQ project page credits MIT, Tsinghua University, and the MIT-IBM Watson AI Lab.
- **Gap.** The HAN Lab homepage does not name its MIT department, so the record names none.

### University of Washington (`university-of-washington`): published
- **Status and governance.**
  - RCW 28B.20.010 designates "the state university located and established in Seattle" as the University of Washington.
  - RCW 28B.20.100 provides for 11 regents appointed by the governor with Senate consent.
  - uw.edu/about: founded 1861, a public university, with Seattle, Bothell, and Tacoma campuses.
- **IRS.** UW is not in the IRS BMF extract; only affiliated entities appear. As a state university that is expected, and eligibility rests on the statute.
- **Thin record by design.** The only artifact tie I could verify is OpenThoughts: the site, README, and paper all list UW. That record is a draft, so `openness_summary` is null.
- **Gaps.**
  - The datacomp.ai/dclm page names no institutions, so I did not repeat the DCLM–UW link that `dclm.yml` makes.
  - No UW lab page was tied to an artifact.

### NIST (`nist`): published
- **Status and location.** NIST was founded in 1901 and is part of the U.S. Department of Commerce. Headquarters is 100 Bureau Drive, Gaithersburg, MD. Its campuses are in Gaithersburg and Boulder, with the NCCoE in Rockville.
- **Fields.**
  - roles: `standards-body`, `research-lab`;
  - basis: `us-nonprofit-or-lab`, by analogy with the round-2 rule for government laboratories;
  - `legal_name`: null;
  - `parent_org_slug`: null, because Commerce has no catalog record.
- **AI work.** Described only from nist.gov and pages.nist.gov pages: the AI RMF, Dioptra, and the AI evaluation center.
- **Surprising: the CAISI → CAISSI change.** These observations are dated 2026-10-01:
  - `https://www.nist.gov/caisi` redirects to `https://www.nist.gov/caissi`, titled "Center for Advancing Innovation and Standards for Super Intelligence (CAISSI)". The page body uses "SI systems".
  - The same page's news list still uses "CAISI / Center for AI Standards and Innovation" for items through 2026-09-17. The news tag page is still titled "Center for AI Standards and Innovation".
  - `https://www.nist.gov/artificial-intelligence` now redirects to `/super-intelligence`. That page says NIST is updating its communications to use the term "super intelligence" under a "Sept. 29, 2026, Executive Order on Inaugurating the Era of Super Intelligence".
  - I recorded this neutrally in notable_facts, citing only nist.gov.
  - I did not fetch or cite whitehouse.gov. NIST's link to the order goes through an Outlook "safelinks" URL that embeds a staff email address, so I did not use that URL.
  - Editors should re-check within a few weeks; the transition looks incomplete.
  - The new government use of "super intelligence" is close to this catalog's own name. Editors may want to keep the "not a government site" disclaimer prominent.
- Statements on the CAISSI page about "adversary" systems and "U.S. dominance" were left out, per the neutral-wording instruction.

## Artifacts

### AWQ (`awq`): published, framework
- **Maintainer.** The repo is mit-han-lab/llm-awq. The MIT License reads "Copyright (c) 2023 MIT HAN Lab". The repo is not archived.
- **No versioned releases.** The releases page says "There aren't any releases here". The tags API returned none. `release_status` is therefore `not_public`.
- **Activity.** README news runs to 2025/04. The GitHub API showed the last push on 2025-07-17. The API is not cited, and the record does not call the project inactive.
- AutoAWQ is described in the README as a third-party implementation. I did not research its current status.
- Integration claims (Transformers, vLLM, TensorRT-LLM, and others) are attributed to the README. The Hugging Face download figures on the project page were left out.

### Marin (`marin`): published, research-stack
- **What Marin is now.** It is an open lab and platform, not just a model:
  - marin.community: "Marin is primarily developed by Open Athena, with contributors from the community", and it "began its voyage in 2024 at Stanford University".
  - README: core collaborators are Stanford CRFM and Open Athena.
  - The May 2025 announcement says it originated at Stanford CRFM and HAI.
- **Material change.** Primary development has moved from Stanford to Open Athena.
- **Eligibility.**
  - Open Athena's terms name "Open Athena AI Foundation Inc.", 1245 Broadway, Floor 16, New York, NY 10001, under New York law.
  - The IRS NY extract (EIN 99-4320392) lists "OPEN ATHENA FOUNDATION INC" at the same address, with these codes:
    - subsection 03, which is 501(c)(3);
    - foundation code 03, private operating foundation;
    - organization code 1, corporation;
    - ruling 2025-06.
  - The two names differ by the word "AI". I linked them only by the identical address, and the eligibility explanation says so.
  - The second steward is Stanford CRFM; the Marin 8B card says it was developed by "The Marin team at Stanford CRFM".
  - Open Athena's about page also lists a London office. The entity itself is a New York nonprofit.
- **Release record not created.** The validator requires a release's `family_slug` to point to a `record_level: family` record of the same kind (model). The assignment asked for `marin` as a project record, and no family slug was assigned. A release would need an extra family file, such as `marin-models`, which falls outside my file list.
  - Verified facts for a future `marin-8b-base` release:
    - The card states Apache 2.0 for code and model, and the weights are ungated.
    - The model uses the Llama architecture and was trained on about 12.7T tokens.
    - Phase data mixes are in the retrospective.
    - Training code is Levanter plus the Marin repo, and W&B reports are linked.
    - Marin 8B Instruct and Marin 32B Base also exist on HF.
- **Not recorded.** The in-progress 535B-A23B MoE training run (marin.community and the Open Athena blog) is still ongoing.
- **Suggestions for others.**
  - `stanford-university.yml` could add a notable fact that Marin began at Stanford CRFM/HAI in 2024 and that CRFM remains a core collaborator. I did not edit that file.
  - Open Athena is a candidate organization record. The IRS row's care-of field names an individual, which I left out.

### OpenThoughts (`openthoughts`): draft, pending_review
- **Why it is pending.** Leadership is described inconsistently, and no single U.S. governing entity is documented:
  - The README says it is "A collaboration led by Bespoke Labs and the DataComp community".
  - openthoughts.ai says it is "led by researchers and engineers from Stanford, UC Berkeley, UT Austin, NYU, University of Washington, UCSD, ASU, CMU, UCLA, UNC Chapel Hill, TUM, LAION, and other partners", and does not name Bespoke Labs.
  - The paper lists 16 affiliations, including the non-U.S. JSC, LAION, and TUM. Authors are listed alphabetically, and no lead is named.
- **About Bespoke Labs.** Its homepage names "BespokeLabs.AI, Inc.", "SF Bay Area", and lists OpenThoughts among its work. Its terms use California law, but the address field is an unfilled placeholder, "[INSERT BESPOKE LABS ADDRESS]".
- **Precedent.** This follows `dclm.yml`, a DataComp sibling, which is also pending for the same reason.
- **Editor option.** An editor could accept Bespoke Labs, a U.S. company, as the documented co-lead and publish.
- **Provenance.** The OpenThoughts3 traces were generated with QwQ-32B, published by Qwen. This is recorded under provenance.

### AI RMF (`ai-rmf`): not created
- The artifact kinds are model, dataset, framework, eval, runtime, and research-stack.
  - In this catalog `framework` means a software framework. Its checklist covers source code, installation, supported platforms, and release status.
  - The AI RMF is a voluntary risk-management guidance publication (NIST AI 100-1), not software, a dataset, or an evaluation.
  - Forcing it into `framework` would mislabel it and leave the checklist meaningless.
- It is described in a notable fact on `nist.yml` instead:
  - released 2023-01-26, with the Playbook, Roadmap, and Crosswalk;
  - the GenAI Profile, NIST-AI-600-1, released 2024-07-26;
  - a concept note for a critical-infrastructure profile, released 2026-04-07;
  - NIST's statement that AI RMF 1.0 "is being revised as part of the White House AI Action Plan".

### Dioptra (`dioptra`): published, framework
- **Kind.** I chose `framework` rather than `eval`: Dioptra is a containerized test platform with no tasks, data, or scoring method of its own. It is tagged `evaluation`.
- **License.** The LICENSE says:
  - NIST-employee work is not under U.S. copyright (17 U.S.C. §105);
  - NIST-held copyright is licensed under CC BY 4.0.
  - It is recorded as `CC-BY-4.0` with `applies_to: code`. Editors may want to review how the rights helper treats a CC license on software.
- **Status and versions.**
  - The README says "Release 1.1.0 -- with on-going improvements and development".
  - The tags are 1.0.0 (2024-07-26), 1.0.1 (2024-10-28), 1.1.0 (2026-02-19), and 1.2.0dev0.
  - There are no GitHub Releases entries.
  - `released_at` is 2024-07-26, the date of the NIST announcement and the 1.0.0 tag.
- **Gaps.**
  - There is no OS or architecture support matrix; the docs only recommend Linux. `supported_platforms` is therefore `partial`.
  - The docs URL linked from the README (`getting-started/...`) returns 404. The working page is under `how-to/setup-dioptra/`.
