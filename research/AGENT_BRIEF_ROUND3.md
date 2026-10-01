# Research brief — round 3 (expansion, 2026-10-01)

Read `research/AGENT_BRIEF.md` and `research/AGENT_BRIEF_ROUND2.md` first:
**every rule there still applies**, with one change: today is **2026-10-01**, so
use that date for `accessed_at`, `reviewed_at`, `assessed_at`, `updated_at`, and
`last_reviewed` on anything you verify today. Then read `docs/CONTENT_FORMAT.md`,
`lib/schema.ts`, `lib/enums.ts`, and `lib/jobs/schema.ts` for exact fields.

Models of current quality (open and imitate them):
- organizations: `content/organizations/openai.yml` (has `profile` and `careers`),
  `content/organizations/ai2.yml`, `content/organizations/ibm.yml`
- artifacts: `content/artifacts/openclaw.yml`, `content/artifacts/hermes-agent.yml`,
  `content/artifacts/olmo-3-1-32b-think.yml`, `content/artifacts/gpt-oss-20b.yml`
- people: `content/people/mia.yml`, `content/people/stella-biderman.yml`
- news: any file in `content/news/`

## Public information only (the owner's explicit instruction)

Use only information an organization or person has published themselves, or
that appears in official public records (SEC filings, official registries,
official project repositories, papers, official announcements). Never use
leaked, paywalled, scraped-private, or gossip material; never infer private
facts. For people: professional work only (see `research/PEOPLE_BRIEF.md`).

## Hard rules (in addition to rounds 1–2)

1. **Only cite pages you fetched and read today.** Background knowledge may be
   stale: verify current status (acquisitions, renames, license changes).
2. **Privacy in requests.** Never put any email address, personal name, or
   identifier in a User-Agent, header, URL, or payload. Use WebFetch, or a
   generic UA like `USASI-catalog-research/0.3`.
3. **File ownership.** Create only the files assigned to you. Edit an existing
   file only if your assignment names it, and then change only the parts the
   assignment describes. Never edit `lib/`, `app/`, `components/`, `scripts/`,
   `tests/`, `data/`, or other agents' files.
4. **No funding, valuations, revenue, staff/user/download counts, benchmark
   scores, or leadership gossip.** Model parameter counts, context lengths, and
   license terms are fine when sourced.
5. **Eligibility** follows `ELIGIBILITY.md` and the round-1 policy exactly. A
   foreign company with a U.S. office is not eligible. Never decide eligibility
   from anyone's name or presumed nationality. Unclear → `pending_review` +
   `draft`, with the reason in your notes.
6. **v0.2 fields.** Prefer adding `reviewed_at: 2026-10-01` to claims you
   checked today. For organization `profile` blocks, follow `openai.yml`.
   Do not invent `system_openness_review`; omit it unless you can fill every
   field from sources (rare). Never advance `last_reviewed` on an existing
   record unless you re-checked the whole record.
7. **Quality over quantity.** Fewer accurate records beat many thin ones.

## Existing slugs (do not recreate)

Run `ls content/organizations content/artifacts content/people content/news`
before creating anything. If a slug you were asked to create already exists,
skip it and say so in your notes.

## New slugs being created in parallel this round (cross-reference freely)

Organizations: typesafe-ai (only if it exists and qualifies), element-labs,
mozilla-ai, mintplex-labs, tiny-corp, block, cline, red-hat, github, vercel,
replit, cartesia, inception-labs, world-labs, crusoe, arista-networks, etched,
d-matrix, lightmatter, sifive, weights-and-biases, mit, university-of-washington,
futurehouse, boltz, chai-discovery, profluent, nist, agentic-ai-foundation.

Artifacts: lm-studio, llamafile, open-webui, anythingllm, lemonade, openvino,
executorch, litert, bitnet, tinygrad, model-context-protocol, goose, agents-md,
codex-cli, openai-agents-sdk, gemini-cli, agent-development-kit, a2a-protocol,
strands-agents, cline-extension, smolagents, nvidia-dynamo, parakeet, isaac-lab,
cuopt, florence-2, markitdown, coremltools, faiss, gpt-oss-safeguard, petri,
embeddinggemma, llm-d, instructlab, spec-kit, ai-sdk, wandb-sdk, awq, marin,
openthoughts, ether0, paper-qa, boltz-2, chai-1, dioptra, ai-rmf.

"Unknown organization/artifact slug" validation errors for slugs on these
lists are expected while others work — ignore only those. Fix every other
error in your own files.

## Workflow

Research (WebSearch to find official pages, WebFetch to read them) → write YAML
→ `npx tsx scripts/validate.ts` → fix your files → write your notes file
(path in your assignment) listing each candidate: decision (published / draft /
not created), one-line reason, eligibility basis, evidence gaps → final reply
under 300 words: files, statuses, unresolved items, anything surprising.
