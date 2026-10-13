# N3 fact-check (2026-10-13)

Checked 23 news items in `news/`. Every cited URL (32 in all) was fetched today with curl, using the UA `USASI-factcheck/0.3`, and all returned HTTP 200. The GitHub API rate-limited me, so release dates come from the release pages' `datetime` stamps. No browser tools were used and no personal identifiers were sent. I also fetched the AMD IR press-release list to look for a Taalas closing announcement; there was none through release 1301 (10-12).

For each item I confirmed:
- the event date is inside the window 2026-07-01..2026-10-12;
- the event is not in EXISTING.txt, in repo `content/news/`, or in N1/N2/N4/N5;
- every related catalog slug exists.

## Corrected (5)

- **amd-agrees-to-acquire-taalas**
  - Title: before "…; the deal has not yet closed". After "AMD agrees to acquire Taalas, a developer of AI inference silicon".
  - Why: the 08-06 release gives no closing timeline. A missing closing release can't prove the deal is still open, because small deals can close without one.
  - Summary: added that the release gives no expected closing date and that USASI has not seen a closing announcement.
- **lightmatter-launches-open-silicon-photonics-workstream-at-ocp**
  - Title: before "Lightmatter-led initiative…". After "Open Silicon Photonics for AI Systems initiative becomes an Open Compute Project workstream". The release doesn't say "led".
  - Summary: cut "now has 19 member companies" (a count). Rewrote the white-paper sentence to the release's wording: a shared CPO blueprint for MHS- and ORv3-compliant AI clusters.
- **tinygrad-0-14-0-released**: cut "more than 1,000 commits since 0.13.0" (a count). The rest matches the v0.14.0 notes.
- **isaac-lab-3-0-early-access-released**
  - Title: before "NVIDIA publishes…". After "Isaac Lab 3.0 Early Access published…". The release page doesn't name NVIDIA as publisher, and the summary already says "The Isaac Lab project".
  - Summary: "will take only bug fixes…" became "will focus only on bug fixes, stability, compatibility and documentation improvements", as the notes say.
- **nvidia-launches-open-agent-safety-platform**: "quarantine agents that move outside their boundaries" became "…that attempt to move outside…", as the press release says.

## Checked OK (18)

- **amd-releases-instella-moe**: ROCm blog dated 07-24 gives 16B total / 2.8B active, MI300X/MI325X, Primus/Miles, and weights from every stage. The HF card gives the ResearchRAIL license and "research purposes only".
- **amd-releases-rocm-core-sdk-10-0**: release notes dated 2026-08-26. TheRock note, framework list, HIP scan APIs and AMD SMI 27.0.0 relink all match. The GitHub release is 08-26.
- **cisco-releases-antares-vulnerability-localization-models**:
  - Cisco blog 07-21: 350M and 1B open-weight, ranked files plus trace, not a replacement for the AppSec toolchain, 3B "coming soon".
  - HF card: Apache 2.0, Granite 4.0 1B, gated access.
- **intel-releases-openvino-2026-4**: GitHub release 2026-09-16. MTP, DFlash preview, models, Node.js ASRPipeline and the Python 3.10 notice all match.
- **lemonade-2026-39-1-adopts-calendar-versioning**: v2026.39.1 is 09-23 and v11.9.0 is 09-02. v11.9.0 is the previous stable release (only a candidate prerelease came between). The breaking version format, TheNoise 0.7.1, /v1/docs and auto-evict all match.
- **modular-26-6-opens-mojo-compiler-to-contributions**: blog and GitHub release 09-17. Contributions accepted, issues migrated, String/SIMD/List stable, fn/alias removed, MiniMax-Music3, Inkling. This is a separate event from the existing 08-18 open-sourcing item.
- **modular-releases-mojo-1-0**: blog and GitHub release 08-11. "Primarily additive", stable APIs, deprecated alias and fix-it, max package, M1 support.
- **nvidia-adds-cuda-q-logical-to-cuda-q**: newsroom 09-14. CUDA-Q Logical is on GitHub, and the QUOPS reference implementation is in CUDA-Q.
- **nvidia-dynamo-1-5-0-released**: GitHub release 2026-09-21. Router policies, KVBM deprecation (removal targeted for v1.7.0), v1beta1, Rust EPP, Snapshot operator, and engine versions SGLang 0.5.18, TRT-LLM 1.3.0rc25 and vLLM 0.28.0.
- **nvidia-launches-open-secure-ai-alliance**: NVIDIA blog 07-27. Purpose, listed partners, Akrites/OpenSSF, contributions, NOOA on GitHub, HPE SPIFFE/SPIRE.
- **nvidia-nemo-speech-3-0-released**: release notes match. The GitHub timestamp is 2026-08-07T00:13Z (evening of 08-06 in U.S. time), so I kept the UTC date.
- **nvidia-releases-cosmos-3-edge**: HF card release date 07/20/2026 on HF and GitHub. 4B, MoT, inputs and outputs, OpenMDW-1.1, commercial use, and the 08-25 update note.
- **nvidia-releases-cuda-python-1-0**: technical blog 08-25. CUDA 13.3, independently versioned components, the semver commitment, and Numba CUDA MLIR not yet covered.
- **nvidia-releases-nemotron-3-5-lightning**: HF card release date 08-11. 30B/3B, Mamba-2/MoE/attention hybrid, reasoning toggle, OpenMDW 1.1, NVFP4 checkpoint. The blog confirms DFlash/DSpark and the Nemotron-RL Agentic Terminal Pivot dataset.
- **nvidia-releases-nemotron-3-embed**: both cards give 07/16/2026, 34 languages, 4096/2048 dimensions with slicing and re-normalizing, OpenMDW-1.1, and "Built with Ministral-3-8B-Instruct-2512 … Apache 2.0".
- **open-secure-ai-alliance-joins-linux-foundation**: LF announcement 09-14. Neutral home, established by NVIDIA with members including LF, OpenSSF, SAFE, and comments due "by September 21".
- **ray-2-59-0-released**: GitHub release 2026-10-02. Data/Serve LLM GA, vLLM 0.27.0, local-cluster token auth with RAY_AUTH_MODE=disabled, external shuffle_v2, ORC reading.
- **together-ai-publishes-tev1-4b-experimental**: blog published 9/23/2026 ("We just launched"), serverless availability, tev1 repo. The HF card confirms the decision-model description, the license still being finalized, Apache-2.0 base, and the limitations line. The source title contains "$17"; I kept it verbatim as the official title, which follows repo precedent for source titles.

## Drafted (0) / Deleted (0)

None.

## Totals

23 checked: 18 OK, 5 corrected, 0 set to draft, 0 deleted.

Validator: `23 batch file(s): 0 error(s), 0 warning(s)`.
