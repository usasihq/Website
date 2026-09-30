# Research brief — round 2 (expansion)

Read `research/AGENT_BRIEF.md` first: **every rule there still applies** (only
cite pages you fetched and read today, 2026-09-29; verify current status because
background knowledge may be stale; no invented facts; write in your own words;
restrained tone; draft or omit what you cannot support). Then read
`docs/CONTENT_FORMAT.md` and `lib/schema.ts` / `lib/enums.ts` for exact fields and
enums, and open two finished records as models of the expected quality, e.g.
`content/organizations/ai2.yml` and `content/artifacts/olmo-3-1-32b-think.yml`.

## Hard rules for round 2

1. **Privacy.** Never put any email address, name, or personal identifier in a
   request (User-Agent, headers, URL, payload). If a site wants a contact
   User-Agent (e.g. sec.gov), use WebFetch, or a generic UA such as
   `USASI-catalog-research/0.2`, or use the company's investor-relations page.
2. **File ownership.** Only create the files for the slugs assigned to you.
   **Do not edit any existing file** unless your assignment explicitly names it.
   The catalog already contains these slugs — do not recreate them:
   - organizations: adobe, ai2, amazon, amd, anthropic, anyscale, apple, arcee-ai, broadcom, cerebras, coreweave, databricks, eleutherai, figure, fireworks-ai, google-deepmind, google, groq, hugging-face, ibm, intel, lambda, linux-foundation, meta, microsoft, nvidia, openai, oracle, palantir, perplexity, physical-intelligence, poolside, pytorch-foundation, reflection-ai, salesforce, sambanova, scale-ai, snowflake, ssi, thinking-machines-lab, together-ai, xai
   - artifacts: dbrx-base, dbrx-instruct, dbrx, dolma, gemma-4-12b, gemma-4-26b-a4b, gemma-4-31b, gemma, gpt-oss-120b, gpt-oss-20b, gpt-oss, granite-4-2-30b, granite-4-2-3b, granite-4-2-8b, granite, grok-1, grok-2, grok, inkling-975b, inkling-small, inkling, jax, laguna-s-2-1, laguna-xs-2-1, laguna, llama-4-maverick-17b-128e, llama-4-scout-17b-16e, llama-cpp, llama, lm-evaluation-harness, maxtext, meta-muse, microsoft-muse, mlx, muse-glimmer-30b, nemotron-3-5-lightning-30b-a3b, nemotron-3-super-120b-a12b, nemotron-3-ultra-550b-a55b, nemotron, ollama, olmo-3-1025-7b, olmo-3-1-32b-think, olmo-3-7b-instruct, olmo, openpi, openxla, phi-4-mini-flash-reasoning, phi-4-reasoning-vision-15b, phi, pytorch, ray, snowflake-arctic-base, snowflake-arctic-instruct, snowflake-arctic, tensorrt-llm, trinity-large-thinking, trinity-mini, trinity, vllm, wham-1-6b
3. **Organizations, not individuals.** Never create records about individual
   people and never base eligibility on anyone's name or presumed nationality.
   "Top contributors" are represented by the organizations, labs, companies, and
   foundations that maintain open-source AI. If a project is maintained mainly
   by an individual with no documented organization, record it as
   `pending_review` + `draft` and explain in your notes.
4. **No funding, valuations, revenue, staff counts, user counts, download
   counts, benchmark scores, or leadership changes** as catalog facts. (Model
   parameter counts, context lengths, and license terms are fine when sourced.)
5. **Quality over quantity.** A smaller set of accurate, well-sourced records is
   better than a large thin one. Products: 1–4 per organization, each with an
   official URL you fetched. Model families: 1–3 current releases you verified.

## New enum values available

- `organization_roles`: `university-lab`, `standards-body` (in addition to the
  existing values).
- `ownership_category`: `public-institution` (e.g. a state university or a
  government laboratory).
- `sectors`: `science` (e.g. biology or materials models).

Universities: create one record per university (e.g. `stanford-university`),
with `university-lab` and `research-lab` roles; describe the specific labs that
maintain artifacts in `notable_facts` with sources. A private university is
`ownership_category: nonprofit`, `eligibility.basis: us-nonprofit-or-lab`; a
public (state) university is `public-institution`, basis `us-nonprofit-or-lab`.

Benchmarks and evaluation suites are `kind: eval`. Datasets are `kind: dataset`.
Both use `record_level: project`.

Where an open model is fine-tuned from another model (e.g. from Llama, Qwen, or
DeepSeek), record the base model in `provenance.derived_from` with its name and
URL, and state plainly in `provenance.text` where the base came from. A U.S.
fine-tune can be eligible through its own maintainer; the base model is not
thereby U.S.-developed.

## Canonical slugs for round 2 (use these for cross-references)

New organizations being researched in parallel (another agent may own them):
tesla, qualcomm, micron, marvell, cisco, dell-technologies, hpe, supermicro,
spacex, cloudflare, servicenow, linkedin, anysphere, cognition, runway,
midjourney, luma-ai, character-ai, glean, sierra, liquid-ai, nous-research,
prime-intellect, deep-cogito, zyphra, essential-ai, writer, genmo, nomic-ai,
skild-ai, agility-robotics, apptronik, boston-dynamics, waymo, langchain,
llamaindex, crewai, all-hands-ai, continue, modular, modal, baseten,
lightning-ai, chroma, lancedb, unsloth, common-crawl, mlcommons, lf-ai-data,
arc-institute, evolutionaryscale, center-for-ai-safety, stanford-university,
uc-berkeley, carnegie-mellon-university, princeton-university, lmsys,
new-york-university.

"Unknown organization slug" validation errors for slugs on these lists that
another agent owns are expected while work is in progress — ignore only those.

## Workflow

Same as round 1: research → write YAML → `npx tsx scripts/validate.ts` → fix
your files → write your notes file → final reply under 300 words (files,
statuses, unresolved items, anything surprising).
