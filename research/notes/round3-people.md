# round3-people: Local corner research notes (2026-10-01)

Validation: `npx tsx scripts/validate.ts` reports 0 errors. Its 2 warnings come from other agents' files (`organizations/vercel.yml` and `artifacts/continue-extension.yml`). A direct `validateContent` run loads 20 people and reports no issues in any people file.

Method:

- Every page was fetched today with WebFetch, or with curl using the generic UA `USASI-catalog-research/0.3` for GitHub raw and blob files. No email address or personal identifier went into any request.
- Sources are limited to rule-2 types: own sites, GitHub profiles, official org pages and announcements, repositories (README, CODEOWNERS, MAINTAINER.md, commit lists), and arXiv author lists.
- Search results also surfaced LinkedIn, Crunchbase, X, Wikipedia, alphaXiv, news, and press-release pages. None of them is cited or relied on.
- I left out the locations, education, funding amounts, and follower counts that appeared on fetched pages.
- I did not edit any existing file, including `content/local-corner.yml`.

| Candidate | Decision | Current role (source) | Contribution (source) | Published tie |
| --- | --- | --- | --- | --- |
| Georgi Gerganov | **published** | Maintains llama.cpp with the ggml team at Hugging Face (HF announcement, 2026-02-20; GitHub company field @huggingface) | llama.cpp, ggml, whisper.cpp (own site; ggml.ai says he founded it in 2023 and that HF acquired it in 2026); CODEOWNERS; commits dated 2026-10-01 | org `hugging-face` (`llama-cpp` artifact is draft and linked anyway) |
| Xuan-Son Nguyen | **published** | "Software engineer at Hugging Face" (own site; GitHub) | "Core maintainer of llama.cpp" and added vision/audio support (own site); CODEOWNERS for llama-mtmd and llama-server; HF Hub Ollama integration; wllama | org `hugging-face` |
| Tianqi Chen | **published** | Associate Professor, CMU ML and CS departments; Distinguished Engineer, NVIDIA (own site) | MLC LLM and Apache TVM under "Here are the ML systems that I started" (own site); MLC LLM README | orgs `carnegie-mellon-university`, `nvidia` (`mlc-llm` is draft) |
| Angelos Katharopoulos | **published** | "currently at the Machine Learning Research group at Apple" (own site); GitHub company field Apple | One of the four initial developers of MLX (README); 2026 commits on JACCL, the MLX distributed backend | org `apple`, artifact `mlx` |
| Loubna Ben Allal | **published** | "Research Engineer at Hugging Face" (own site) | "leading SmolLM, SmolLM2 & SmolLM3" (own site); first author of the SmolLM2 paper (arXiv 2502.02737) | org `hugging-face`, artifacts `smollm`, `smollm3-3b` |
| Ying Sheng | **published** | Officer, LMSYS (lmsys.org/about); SGLang codeowner and maintainer-nomination contact (CODEOWNERS, MAINTAINER.md) | First author of FlexGen (arXiv 2303.06865); SGLang paper author; xAI MTS who co-led the inference team, 2024–2025 (own site, past) | org `lmsys`, artifact `sglang`, org `xai` (past) |
| Byron Hsu | **published** | SGLang merge oncall for PD disaggregation (MAINTAINER.md, "based on the current situation") | Liger Kernel "Project lead. Led, architected, and implemented multiple kernels, public interface, and test suite." (arXiv 2410.10989 v1 contributors section); first in the README citation | artifacts `liger-kernel`, `sglang`, org `linkedin` (past) |
| Lianmin Zheng | not created | Own site: xAI MTS who leads the inference team for Grok | SGLang first author, LMSYS co-founder | His current work is not local, and SGLang already has two profiles. Well sourced if editors want him later. |
| Daniel Han / Michael Han (Unsloth) | not created | — | — | `unsloth` and `unsloth-library` are both draft, so no published tie is possible. |
| Leandro von Werra (TRL) | not created | GitHub bio says only "Machine Learning @huggingface"; no title in any allowed source | First author in the TRL citation | The role is too thin. Revisit if HF publishes a title. |
| Pedro Cuenca | not created | No role stated on his GitHub or HF profile | swift-transformers and Core ML work are visible only as repo pins | No verifiable role. |
| Michael Chiang (Ollama) | not created | Unchanged from people-a: no allowed source gives his surname together with a role | — | — |

## Points a reviewer may want to check

- **Georgi Gerganov.** No allowed source gives him a formal HF job title. The role text paraphrases the HF announcement, which says he and his team still spend 100% of their time maintaining llama.cpp with full leadership of its technical direction. ggml.ai appears in the bio rather than as an affiliation, because the company was acquired. The bio uses "develops" rather than "created"; the HF post calls GGML the "creators of Llama.cpp".
- **Angelos Katharopoulos.** His homepage footer reads "© 2020", so the page may be old. His current GitHub company field (Apple) and his 2026 MLX commits support the current Apple role. The MLX docs explain the JACCL name as "Jack and Angelos' Collective Communication Library". The profile does not use that name link.
- **Ying Sheng.** Her homepage is marked outdated by its author and says to apply to RadixArk. Her GitHub company field is RadixArk. No allowed source gives her RadixArk title: radixark.com names no people, and the "co-founder and CEO" title appears only in press and aggregator sources. RadixArk is therefore left out of the profile.
- **Byron Hsu.** His GitHub bio reads "RL System at Periodic Labs | SGLang, ex-xAI", but the company field still shows @xai-org. Because of this conflict, Periodic Labs appears only as an attributed sentence ("his GitHub bio describes…"), not as an affiliation. The LinkedIn role is marked past, based on the 2024 paper affiliation and his bio.
- **Draft artifact links.** `llama-cpp` and `mlc-llm` are draft. The UI renders a link only for active artifacts, so these show as external repository links until the records are published.
- **Count.** This round adds three people with current Hugging Face affiliations (two of them through llama.cpp). Editors may want to spread them across lineup months.
