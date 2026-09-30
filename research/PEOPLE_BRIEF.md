# Research brief — Local corner profiles

The Local corner is a small, rotating feature (five people a month) about people
whose **public professional work** helps others run AI models on their own
hardware: local runtimes, on-device frameworks, quantization and efficient
fine-tuning, and open-weight model families. Today is **2026-09-29**.

These are real people. Treat accuracy and privacy as the highest priority.

## Hard rules

1. **Professional information only.** Roles, projects, contributions, and public
   professional pages they publish themselves (personal website, GitHub,
   company profile). **Never** include or research: location, nationality,
   citizenship, ethnicity, religion, age or birth date, family, education
   history beyond what is essential to a role (omit by default), personal social
   media activity, opinions, controversies, or anything from gossip or
   aggregator sites. The schema has no fields for these and the validator
   rejects wording such as "born", "lives in", "grew up", "nationality".
2. **Sources.** Cite only pages you fetched today: the person's own site or
   profile, an official organization page (team/about/blog byline), a project
   repository (README, MAINTAINERS, contributors policy), or a paper's author
   list. Do not use Wikipedia, Crunchbase-style aggregators, or social-media
   posts as sources. Never infer a role — if a role is not stated in a source,
   leave it out.
3. **Tie to the catalog.** Each profile must link to at least one **published**
   catalog record via `affiliations[].organization_slug` or
   `work[].artifact_slug`. Check `content/organizations/` and
   `content/artifacts/` for existing slugs (e.g. `ollama`, `mlx`, `gpt4all`,
   `nomic-ai`, `vllm`, `transformers`, `hugging-face`, `ai2`, `olmo`, `tulu`,
   `dolma`, `eleutherai`, `pythia`, `liquid-ai`, `lfm`, `google-deepmind`,
   `gemma`, `nous-research`, `hermes`). Do not edit those files.
4. **Pseudonymous people** may be profiled only under the name they use
   publicly on official pages; never attempt to identify them further.
5. **No photos, no images.** The site uses initials tiles.
6. **Tone.** Warm but factual, 2–4 sentences, your own words, no superlatives
   ("legendary", "genius", "leading"), no rankings, no follower counts, no
   funding or company valuations.
7. **Privacy in requests.** Never send any email address or personal identifier
   in any request; use WebFetch or a generic User-Agent.
8. If you cannot verify a person's current role and at least one concrete
   contribution from sources that meet rule 2, **do not create the profile**;
   explain in your notes.

## File format — `content/people/<slug>.yml`

```yaml
slug: jane-example                 # kebab-case of the public name
name: Jane Example                 # as they present publicly
initials: JE
headline: Maintainer of an open-source local inference runtime   # ≤ 110 chars, one line
bio:
  text: >-
    Two to four factual sentences about their professional work related to
    running or building models locally, in your own words.
  source_ids: [profile, repo]
affiliations:
  - name: Example Co
    organization_slug: example-co  # a catalog slug, or null
    role: Co-founder               # exactly as documented
    current: true                  # false for documented past roles you include
    source_ids: [profile]
work:
  - name: Example Runtime
    artifact_slug: example-runtime # a catalog slug, or null
    url: https://…                 # official project page/repo, or null
    contribution: Co-created the project and maintains its model library.   # what the source says they did
    source_ids: [repo]
links:                             # up to 4 pages THEY publish (site, GitHub, org profile)
  - label: GitHub
    url: https://github.com/…
publication_status: published      # or draft if anything is uncertain
updated_at: 2026-09-29
last_reviewed: 2026-09-29
sources:
  - id: profile
    title: …
    url: https://…
    publisher: …
    kind: official-page            # official-page | repository | paper | documentation | …
    published_at: null
    accessed_at: 2026-09-29
```

Run `npx tsx scripts/validate.ts` and fix errors in your files. Write notes to
your notes file listing each candidate: created (published/draft) or not
created, and why. Final reply under 200 words.
