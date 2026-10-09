# Round 5 verification: license guides (`round5-verify-licenses`)

Checked on 2026-10-08. I fetched every license text again today with curl
(`-A "USASI-factcheck/0.3"`). No request carried an email address, name, or other identifier. I
did not use a browser or any Browser pane tool, and no site showed a bot check. My own copies are
in a separate folder of the session scratchpad. I did not use the copies the writer left in the
scratchpad.

Files checked: all 20 guides in `content/licenses/`. I edited only files in that folder, plus this
report. `npx tsx scripts/validate.ts` gives **0 errors**. Its only warning is the known
`continue-extension.yml` warning.

## How I checked

- **Text.** For each guide I compared the summary and every key term with the license text. Every
  quoted phrase was string-matched against my fresh copy. Paraphrases were read against the clause
  they cite.
- **Category, `official_url`, and source dates.** Checked against the fetched pages.
- **Matching.** I loaded the catalog with `npx tsx -e` (`loadCatalog` plus `usesOfLicense` and
  `licenseMatches`) and printed each guide's attached license entries, with SPDX id, name, URL, and
  `applies_to`. I ran the script again after my edits, because other agents published or changed
  records during the session (for example rocm, sentence-transformers, tiktoken, and
  embeddinggemma-2).
- **Final match state:**
  - 288 entries are attached in total, and no entry matches more than one guide.
  - apache-2-0 163, mit 67, openmdw-1-1 10, cc-by-4-0 9, bsd-3-clause 8.
  - apache-2-0-with-llvm-exception 3 (max, mojo, rocm). The three LLVM-exception entries go only to
    the LLVM guide.
  - The Llama 3.1, Llama 4, CDLA, and ODC-By guides have 3 each.
  - BSD-2-Clause, AGPL, Apple, BigCode, LFM, and NVIDIA have 2 each (BSD-2-Clause: liger-kernel and
    rocm).
  - Gemma, xAI, Llama 3, and CC BY-NC-SA have 1 each.
- **No wrong attachments.** No attached entry is wrong for the guide it attaches to.
- **Llama Guard 4.** The record's license file is `meta-llama/PurpleLlama/Llama-Guard4/12B/LICENSE`.
  A word-level diff against the Llama 4 Community License shows only "royalty- free" / "cross- claim"
  hyphen breaks and a `www.` difference in the use-policy URL. It is the same license.
- **Licenses with no guide.** Examples: NVIDIA Nemotron Open Model License (a separate agreement at
  a different nvidia.com URL), Open WebUI License, the BSD-3-clause-plus-patent wdl_limited license,
  GPL-3.0 (ROCgdb), and NCSA. None of these should attach to an existing guide.

## Changes (before → after, with the license passage)

### 1. `agpl-3-0.yml`: official_url, new source, match prefix

- **official_url**
  - Before: `https://spdx.org/licenses/AGPL-3.0-only.html`
  - After: `https://www.gnu.org/licenses/agpl-3.0.html`
  - Why: gnu.org is reachable today over IPv4 (`curl -4`). Over IPv6 the TLS handshake fails with
    `SSL_ERROR_SYSCALL`, which is probably what the writer saw. The page is titled "GNU Affero
    General Public License" and carries the full text: "Version 3, 19 November 2007", "Copyright
    (C) 2007 Free Software Foundation, Inc.".
- **New source** `gnu-agpl-3-0` (Free Software Foundation, published 2007-11-19, accessed
  2026-10-08). I added it first in every `source_ids` list, because every statement was re-checked
  against this copy. Matches I confirmed in the gnu.org text:
  - preamble: "specifically designed to ensure cooperation with the community in the case of
    network server software"
  - §2: "irrevocable provided the stated conditions are met"; "explicitly affirms your unlimited
    permission to run the unmodified Program"
  - §5(c): "the entire work, as a whole, under this License"
  - §6 conveying options; §8 60-day and 30-day reinstatement; §11 "a non-exclusive, worldwide,
    royalty-free patent license"; §13 network offer
- **match.name_prefixes**
  - Before: `"GNU Affero General Public License v3.0"`
  - After: `"GNU Affero General Public License v3.0 only"`
  - Why: The guide is for `AGPL-3.0-only`. SPDX says this identifier refers to "use the code under
    AGPL-3.0-only, as distinguished from use of code under AGPL-3.0-or-later". The old prefix would
    also attach a future "... v3.0 or later" entry that has no SPDX id. Both current entries start
    with "... v3.0 only", so today's attachments are unchanged (vet, unsloth-library).

### 2. `apache-2-0-with-llvm-exception.yml`: summary

- Before: "followed by two added exceptions written by the LLVM Project, whose license file states
  that the project ..."
- After: "followed by two exceptions headed "LLVM Exceptions to the Apache 2.0 License". The LLVM
  Project's license file states that the project ..."
- Why: Neither llvm.org/LICENSE.txt nor the SPDX page says who wrote the exceptions. The license
  file says only "The LLVM Project is under the Apache License v2.0 with LLVM Exceptions", and the
  exceptions section is headed "---- LLVM Exceptions to the Apache 2.0 License ----". SPDX says only
  "This exception was created specifically to be used with Apache-2.0".

### 3. `bigcode-openrail-m-v1.yml`: summary and "Copyright and patent grants"

- **Summary**
  - Before: "It grants royalty-free copyright and patent licenses for the Model and Modifications of
    the Model, ..."
  - After: "It grants a royalty-free copyright license for the Model and Modifications of the Model
    and a royalty-free patent license for the Model, ..."
  - Passages:
    - §2 grants a copyright license to "reproduce, prepare, publicly display, publicly perform,
      sublicense under the terms herein, and distribute the Model and Modifications of the Model".
    - §3 grants a patent license to "make, have made, Use, offer to sell, sell, import, and
      otherwise transfer the Model". It does not mention Modifications.
- **Key term**
  - Before: "The patent rights end if you bring patent litigation alleging that the Model or a
    Contribution infringes (Sections 2 and 3)."
  - After: "If you bring patent litigation alleging that the Model or a Contribution infringes, "any
    rights granted to You under this License Agreement for the Model shall terminate" (Sections 2
    and 3)."
  - Passage (§3): "If You institute patent litigation ... then any rights granted to You under this
    License Agreement for the Model shall terminate as of the date such litigation is filed."
  - Why: Unlike Apache 2.0, this clause ends all rights under the agreement for the Model, not only
    the patent license.

### 4. `gemma-terms-of-use.yml`: "Distribution conditions"

- Before: "... mark modified files, and include a Notice file stating ..."
- After: "... mark modified files, and, except for Distribution through a Hosted Service, include a
  Notice file stating ..."
- Passage (§3.1): "All Distributions (other than through a Hosted Service) must be accompanied by a
  "Notice" text file that contains the following notice: ...". The same guide already says that
  hosting counts as Distribution (§1.1(b)), so leaving the exception out overstated the Notice-file
  requirement.

## Checked and left as written

- **Apache-2.0**
  - All quotes match apache.org (§§2, 3, 4, 6, 7, 8).
  - The "Terms for your modifications" paraphrase follows the last paragraph of §4.
- **MIT**
  - The quotes match the SPDX text, and OSI reproduces the same text.
  - "The license text contains no clause that mentions patents or trademarks" is true of the text.
    It describes the text and does not interpret it.
- **BSD-2-Clause and BSD-3-Clause**
  - The clause quotes and SPDX full names match.
  - Both texts begin with `Copyright (c) <year> <owner>`, which supports the "template" sentence.
- **CC BY 4.0 and CC BY-NC-SA 4.0:** all quotes match the legalcode.en pages: the grant,
  NonCommercial definition, ShareAlike text, "Patent and trademark rights are not licensed under
  this Public License", royalties, §6 30-day reinstatement, and the "is not a law firm" notice.
- **CDLA-Permissive-2.0:** all quotes match (§§1.1, 1.2, 2.1, 3.1, 4.1, 5.4). The footer reads
  "Copyright © 2017 The Linux Foundation".
- **ODC-By-1.0:** the preamble, §2.3/2.4, the §3.1 "endeavour" quote, §4.2, §4.3, §9.1, and §9.4
  match.
- **OpenMDW-1.1:** all quotes match. The footer reads "Copyright The Linux Foundation and its
  contributors".
- **Llama 3, 3.1, and 4**
  - The version dates match the texts: April 18, 2024; July 23, 2024; and "Llama 4 Version
    Effective Date: April 5, 2025". Llama 4's §2 still says "version release date", which matches
    the guide.
  - The "Built with ..." quotes, the naming rules, the AUP URLs, §5.c, §6, and §7 match.
  - Llama 3 §1.b.v (the restriction on improving other LLMs) matches.
  - **Thresholds:** The guides say "a size threshold set out in Section 2". This is acceptable
    under the no-figures rule and points readers to the section.
- **Gemma:** the last-modified date (April 1, 2026), the Gemma 4 pointer, the appendix models, and
  the §1.1, §3.2, §3.3, and §4.5 quotes match.
- **NVIDIA Open Model License:** the last-modified date (October 24, 2025), "are commercially
  usable", the grant terms, Guardrail termination, the Notice and "Built on NVIDIA Cosmos" wording,
  the Trustworthy AI URL, ownership, and the update clause match.
- **Apple ML Research Model License:** the OpenELM and FastVLM copies are identical after
  whitespace normalization, and all quotes match.
- **LFM Open License v1.0**
  - The 2.6B and 8B-A1B copies are identical, and the quotes match (§§2, 3, 5, 11).
  - I confirmed by side-by-side reading that the definitions and §§2–4 follow the Apache 2.0
    wording.
  - **Threshold:** The guide gives the threshold without a figure and points to Section 1, which
    is acceptable.
- **xAI Community License:** "Last Updated: November 4, 2025" and all quotes match. The $100
  liability cap is correctly left out.
- **Categories:** all are consistent with the texts. OpenMDW-1.1 is discussed below.
- **official_url values:** all resolve to the license text. The Llama 3 and 3.1 URLs point to
  Meta's GitHub raw files. llama.com/llama3_1/license/ now redirects to a 404 on dev.meta.ai, so
  GitHub is the stable official copy.
- **Wording:** neutral throughout. No guide says what a particular reader may do.

## For the editor

1. **AGPL "Network interaction" wording.** The guide says "prominently offer everyone interacting
   with it remotely", but §13 says "all users". I left the paraphrase because the validator rejects
   the word "users" (NEWS_FORBIDDEN). It is not a quote, and the meaning is unchanged.
2. **OpenMDW-1.1 category (decision needed).**
   - The writer chose `model-license` because no official source called the license open source.
     One does now: the publisher's FAQ (https://openmdw.ai/faq/, fetched today) calls OpenMDW-1.1
     "a permissive open‑source license crafted specifically for machine‑learning models". The
     openmdw.ai home page says "A permissive license crafted for machine-learning models".
   - Against that, the SPDX list today has OpenMDW-1.0 but not 1.1, and
     opensource.org/license/openmdw-1-1 returns 404.
   - I left `model-license`. Switching to `permissive` would show "Permissive open-source license"
     on the strength of the publisher's own description only.
3. **Hermes 4 70B (record, not a guide).**
   - The `hermes-4-70b` entry is named "Meta Llama 3 Community License (card license field
     "llama3")", so the Llama 3 guide attaches to it. This is correct for the name as recorded.
   - The model card today shows `license: llama3` and `base_model: meta-llama/Meta-Llama-3.1-70B`.
     The record's own `license_notes` say the Llama 3.1 license applies to derivatives.
   - The editor may want to review that record. I cannot edit it from this assignment.
4. **Possible future overlap (`lib/licenses.ts`).** The Apache guide's prefix "Apache License 2.0"
   would also match an "Apache License 2.0 with LLVM Exceptions" entry recorded with no SPDX id.
   No current entry does this, because all three carry `Apache-2.0 WITH LLVM-exception`. Keeping
   SPDX ids on such entries avoids the problem. A prefix change cannot fix it.
5. **Writer's notes.** `research/notes/round5-licenses.md` still says gnu.org could not be reached.
   The guide now uses gnu.org. I did not edit the writer's notes file.
