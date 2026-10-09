# Round 5 — license guides (label: round5-licenses)

Date: 2026-10-08. All texts fetched today with curl (`-A "USASI-catalog-research/0.3"`, no
identifiers in any request). No Browser pane tools used. Guides restate the license text only;
none says what a reader may do in their own situation.

## Created (20 files, all `publication_status: published`)

`content/licenses/`: apache-2-0, apache-2-0-with-llvm-exception, mit, bsd-3-clause,
bsd-2-clause, agpl-3-0, cc-by-4-0, cc-by-nc-sa-4-0, cdla-permissive-2-0, odc-by-1-0,
openmdw-1-1, llama-3-community, llama-3-1-community, llama-4-community, gemma-terms-of-use,
nvidia-open-model-license, bigcode-openrail-m-v1, apple-ml-research-model-license,
lfm-open-license-v1-0, xai-community-license.

Match rules use exactly the SPDX ids and name prefixes in the assignment. A check against
`lib/licenses.ts` `licenseMatches` found every guide attaches to at least one record, no
license entry matches two guides, and the two "Apache-2.0 WITH LLVM-exception" records match
only the LLVM guide.

## Sources fetched today

| Guide | Text read |
|---|---|
| Apache-2.0 | https://www.apache.org/licenses/LICENSE-2.0 |
| Apache-2.0 WITH LLVM-exception | https://llvm.org/LICENSE.txt, https://spdx.org/licenses/LLVM-exception.html (also compared the modular/modular LICENSE cited by records: same Apache body and exception text) |
| MIT | https://spdx.org/licenses/MIT.html, https://opensource.org/license/mit |
| BSD-3-Clause / BSD-2-Clause | https://spdx.org/licenses/BSD-3-Clause.html, https://spdx.org/licenses/BSD-2-Clause.html |
| AGPL-3.0-only | https://spdx.org/licenses/AGPL-3.0-only.html, https://opensource.org/license/agpl-3.0 |
| CC BY 4.0 / CC BY-NC-SA 4.0 | creativecommons.org `legalcode.en` pages |
| CDLA-Permissive-2.0 | https://cdla.dev/permissive-2-0/ |
| ODC-By-1.0 | https://opendatacommons.org/licenses/by/1-0/ |
| OpenMDW-1.1 | https://openmdw.ai/license/1-1/ |
| Llama 3 / 3.1 / 4 | meta-llama/llama-models `models/llama3`, `llama3_1`, `llama4` LICENSE (raw GitHub) |
| Gemma | https://ai.google.dev/gemma/terms (last modified 2026-04-01) |
| NVIDIA Open Model License | nvidia.com agreements page (last modified 2025-10-24) |
| BigCode OpenRAIL-M v1 | Hugging Face Space bigcode/bigcode-model-license-agreement; the page is a Streamlit app, so the text was read from the Space's `app.py` (raw) |
| Apple ML Research Model License | apple/OpenELM-3B-Instruct and apple/FastVLM-7B LICENSE (identical) |
| LFM Open License v1.0 | LiquidAI/LFM2.5-2.6B and LFM2.5-8B-A1B LICENSE (identical) |
| xAI Community License | xai-org/grok-2 LICENSE (last updated 2025-11-04) |

## Skipped

None. All 20 licenses were readable today.

## Judgment calls and uncertainties

- **AGPL official_url** is the SPDX page because gnu.org refused the TLS connection twice
  today (`SSL_ERROR_SYSCALL`). The OSI copy was fetched as a second source. Worth swapping to
  https://www.gnu.org/licenses/agpl-3.0.html once someone can fetch it.
- **Thresholds stated without figures.** The Llama licenses (Section 2) set a threshold counted
  in monthly active users, and the LFM license sets an annual-revenue threshold in dollars. Brief
  rule 4 and the validator's forbidden-word check rule out user counts and dollar figures, so
  the guides say "a size threshold set out in Section 2" and "an annual-revenue amount defined
  in Section 1" and point readers to the text. The xAI liability cap is left out for the same
  reason.
- **Categories.** OpenMDW-1.1 is labelled `model-license`, not `permissive`. Its grant is
  unrestricted, but the `permissive` label reads "Permissive open-source license", and I found no
  official source today that calls it open source. Apple's license is `non-commercial` (it is
  limited to research). LFM is `model-license` because commercial use is allowed below its
  threshold. CC BY-NC-SA is `non-commercial` and CC BY is `content-license`.
- **Llama 3.1 and 4 Acceptable Use Policies** were not fetched. The guides only say the policies
  are incorporated by reference and give their URLs from the license text. The Llama 3 license
  file includes its own AUP.
- **MIT "Patents and trademarks"** key term says only that the text contains no clause naming
  patents or trademarks, which is a description of the text, not an interpretation.
- **LFM summary** says its definitions, grants, and redistribution conditions "closely follow
  the wording" of Apache 2.0, based on comparing the two texts side by side. Apache 2.0 is cited
  as a comparison source in that file.
- Records with names such as "NVIDIA Nemotron Open Model License", "Open WebUI License (BSD
  3-Clause terms plus a branding clause)", and "BSD-style license (Battelle Memorial Institute)"
  intentionally do not match any guide here.
