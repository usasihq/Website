# Round 3 — big-tech open releases (batch 1)

Researcher notes, 2026-10-01. Organizations already existed (`nvidia`, `microsoft`, `apple`);
no organization files were touched. All sources were fetched and read on 2026-10-01. SEC filings
(NVIDIA 10-Q for the quarter ended July 26, 2026; Microsoft FY2026 10-K; Apple FY2025 10-K) were
re-read today through WebFetch (no personal identifiers in any request; curl used the generic UA
`USASI-catalog-research/0.3`).

`npx tsx scripts/validate.ts`: 0 errors and 0 warnings in these files. (At the time of the run
the only error in the tree was in another agent's `boltz-2.yml`.)

## Decisions

| Slug | Kind / level | Decision | Eligibility basis | One-line reason |
| --- | --- | --- | --- | --- |
| `nvidia-dynamo` | runtime / project | published | us-governed-project (NVIDIA) | NVIDIA copyright, NVIDIA docs and announcements; Apache-2.0 LICENSE read. |
| `parakeet` | model / family | published | us-headquarters (NVIDIA) | NVIDIA HF org + NeMo Speech README; no license/checklist on family. |
| `parakeet-tdt-0-6b-v3` | model / release | published | us-headquarters (NVIDIA) | Card read; CC-BY-4.0; 600M params per card. |
| `parakeet-unified-en-0-6b` | model / release | published | us-headquarters (NVIDIA) | Card read; NVIDIA Open Model License (read today); 600M params per card. |
| `isaac-lab` | framework / project | published | us-governed-project (NVIDIA) | Multi-organization developer list; written assessment in the record (see below). |
| `cuopt` | framework / project | published | us-governed-project (NVIDIA) | Verified open source: Apache-2.0 LICENSE, NVIDIA SPDX headers, CONTRIBUTING says the NVIDIA cuOpt team triages. |
| `florence-2` | model / family | published | us-headquarters (Microsoft) | Paper (Azure AI, Microsoft), MSFT HF org. |
| `florence-2-large` | model / release | published | us-headquarters (Microsoft) | Card + MIT LICENSE read; 0.77B params per card. |
| `markitdown` | framework / project | published | us-governed-project (Microsoft) | MIT, Microsoft copyright, Microsoft CLA. |
| `coremltools` | framework / project | published | us-governed-project (Apple) | BSD-3-Clause, Apple Inc. copyright. |

Release slugs chosen: `parakeet-tdt-0-6b-v3`, `parakeet-unified-en-0-6b`, `florence-2-large`.

## Per-candidate notes and evidence gaps

### nvidia-dynamo
- Repository lives in a separate GitHub org, `ai-dynamo`, not `NVIDIA`. Eligibility rests on the
  NVIDIA copyright notices (README and CONTRIBUTING SPDX headers), NVIDIA-hosted docs, and NVIDIA
  newsroom announcements (Mar 18, 2025 launch; Mar 16, 2026 Dynamo 1.0). No GOVERNANCE file exists
  (404). If a foundation or multi-company body is later announced for `ai-dynamo`, re-assess.
- GitHub's API reports the license as NOASSERTION because the LICENSE file starts with a notice that
  DeepSeek-V3.2-derived test data is MIT; the rest is Apache-2.0. Recorded in `license_notes`.
- v1.5.0: GitHub release published 2026-09-21; the docs compatibility page shows "Released Sep 18,
  2026". The record uses only the GitHub publication date. KVBM is deprecated in v1.5.0 (removal
  targeted for v1.6.0); the README still lists it.
- No adoption/performance numbers from the README or press releases were used.

### parakeet (family) and releases
- The original Parakeet checkpoints (Dec 2023) — the parakeet-rnnt-1.1b card says it was "jointly
  developed" by NVIDIA NeMo and Suno.ai teams. Only that one card was checked for the Suno note;
  wording is narrowed to it.
- NVIDIA's NeMo repo has been split/renamed: `NVIDIA/NeMo` and `NVIDIA-NeMo/NeMo` both redirect to
  `NVIDIA-NeMo/Speech` (NeMo Speech 3.0, Aug 2026). Newer NVIDIA ASR releases use the "Nemotron
  Speech" name (e.g. Nemotron-3.5-ASR-Streaming-0.6B, June 2026); not covered here. Possible future
  candidate: a Nemotron Speech family or release.
- **Licensing changed within the family**: v3 and the original 1.1B card are CC-BY-4.0;
  parakeet-unified-en-0.6b uses the NVIDIA Open Model License Agreement (last modified Oct 24,
  2025). Recorded on the family's `license_notes`.
- **Conflicting statements on unified training code**: the unified card says only inference is
  supported and the training pipeline will be released "soon"; the paper abstract (arXiv
  2604.19079) says the Unified ASR framework is open-sourced. Set `training_code: unknown` with
  both statements in the note. Worth re-checking the NeMo Speech repo for a unified training recipe.
- Provenance: Granary pseudo-labels came from Whisper-large-v3 and P&C restoration from
  Qwen-2.5-7B (per Granary card). Recorded as data provenance; no third-party weights are documented
  in the checkpoints. Developer attributions of those third-party models were left out (not sourced
  today).
- Granary repo publishes manifests only; audio comes from source corpora (YODAS-Granary, MOSEL,
  etc.). NeMo ASR Set 3.0 is "in-house"; access terms for its component corpora (e.g. Fisher) were
  not reviewed — `training_data_access: partial`.
- The v3 card's "at least 2GB RAM" and "24 minutes ... on A100 80GB" figures were omitted (no
  precision stated). Benchmark WERs omitted.
- Technical report arXiv 2509.14128: only the abstract was read.

### isaac-lab
- **Multi-organization assessment**: CONTRIBUTORS.md lists four developer organizations — NVIDIA
  Corporation & Affiliates, Boston Dynamics AI Institute, ETH Zurich, University of Toronto — and
  the LICENSE copyright holder is "The Isaac Lab Project Developers". Published as `eligible` /
  `us-governed-project` because: repo is in the "NVIDIA Isaac Sim" GitHub org; NVIDIA distributes
  it as "NVIDIA Isaac Lab"; the technical report is authored as "NVIDIA" (© 2025 NVIDIA) and lists
  all three "core leadership" members (defined as having primary responsibility for organizational
  and technical direction) with NVIDIA affiliations. This uses organizational affiliations only,
  never names or nationality. No governance charter was found. **Editor may want to confirm** this
  reading, or move to `pending_review` under a stricter multi-org policy.
- The WebFetch summarizer claimed the NVIDIA developer page says NVIDIA "develops and maintains"
  Isaac Lab; the raw page does not say this, so that wording was not used.
- Dual licensing: BSD-3-Clause framework; `isaaclab_mimic` + scripts Apache-2.0. Full-featured
  workflows need Isaac Sim (proprietary components); `isaaclab_mimic` needs cuRobo (proprietary).
- `released_at: 2024-06` from the Orbit project page ("Isaac Lab is now officially released",
  update marked 03.06.2024, read as DD.MM given the page's other "18.03.2024" entry; month
  precision used to avoid the ambiguity).
- 3.0.0 is Early Access (Sep 16, 2026); stable pip package is isaaclab 2.3.2.post1.

### cuopt
- Verified open source: Apache-2.0 LICENSE, NVIDIA SPDX headers, June 11, 2025 NVIDIA technical blog
  ("Now available as open source under the Apache 2.0 license"). Announced Mar 18, 2025.
- Also hosted as a COIN-OR project (`coin-or/cuopt`); NVIDIA describes working with the COIN-OR
  Foundation. No COIN-OR governing role documented; eligibility rests on NVIDIA.
- Separate commercial channel: docs say the NVIDIA AI Enterprise microservice requires an NVAIE
  license or NVIDIA Developer Program membership, and NVAIE support covers only the routing API.
- `released_at: null` — cuOpt existed as a product before open-sourcing; the exact open-source
  date is not documented beyond "now available" in the June 2025 post. Hardware memory figures
  from the system-requirements page were left out of run notes.

### florence-2 / florence-2-large
- **The Hugging Face weights changed after release**: a Dec 8, 2024 commit ("initial tuned 4k
  context length model") replaced Florence-2-large with a 4k-context continued-pretrained
  version that the card says "might not be trained well"; OCR output now uses line separators.
  Recorded in summary and provenance.
- Parameter count 0.77B from the card (paper says 771M; HF metadata 776.7M — not used).
- Paper: image encoder initialized from UniCL, encoder-decoder from BART (recorded in
  `derived_from` without URLs — those pages were not fetched).
- No official training code or FLD-5B download linked from the card, paper, or Microsoft Research
  publication page → `training_code` and `training_data_access` unknown. Third-party blogs claim
  FLD-5B was not released; not used.
- Only Florence-2-large has a release record. base / base-ft / large-ft are MIT per HF metadata
  (cited on the family) and could be added as releases.

### markitdown
- MIT, Microsoft copyright, Microsoft CLA. PyPI metadata lists an individual maintainer's name and
  email; deliberately not used. Supported OSes are not stated → `supported_platforms: partial`.
- Optional Azure Document Intelligence / Content Understanding converters are billable Azure
  services; noted in `useful_for` without pricing details.

### coremltools
- BSD-3-Clause (LICENSE.txt, © Apple Inc.). The installation guide is stale (it describes version
  8.0's Python list); platform claims are cross-checked against 9.0 wheels on PyPI.
- `released_at: 2017-06` from the first PyPI upload (0.3.0, June 5, 2017).

## Method notes
- Model checklists use the v0.2 keys (`training_data_information`, `training_data_access`) with
  conservative statuses, rather than the `legacy_training_data_information` key that the existing
  NVIDIA records (`nemotron-3-super-120b-a12b`, `cosmos3-nano`) carry from the v0.1 migration.
  Structure otherwise mirrors those records (NVIDIA 10-Q eligibility, weights + code license
  records, license_notes summarizing NVIDIA license terms).
- The unauthenticated GitHub API hit its rate limit (shared IP). Raw files, release pages, and
  `releases.atom` feeds were used instead. The `gh` CLI was deliberately **not** used, because it
  would send the user's authenticated GitHub token.
- No benchmark scores, adoption figures, or staff counts were recorded.
