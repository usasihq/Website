# Research brief — People directory, round 7 (2026-10-13)

USASI (unitedstatesofamericasuperintelligence.com) is an independent, evidence-first
catalog of U.S. AI organizations and U.S.-led open models and tools. It is adding a
People directory where each person has their own page. You are writing profiles for
one roster batch. Today is **2026-10-13**.

These are real people. Accuracy and privacy come first. When unsure, leave it out.

## Where things are

- Repository (read only; never edit it): `/tmp/claude-1000/usasi-wt/people`
  - Existing profiles: `content/people/*.yml` (format to copy) and `content/leaders/*.yml`.
  - Schema: `Person` and `PERSON_GROUPS` in `lib/schema.ts`.
  - The older Local-corner brief `research/PEOPLE_BRIEF.md` (its hard rules still apply).
- Catalog slugs you may link to:
  - organizations: `/tmp/claude-1000/usasi-growth/people/ORG_SLUGS.txt` (`slug|name`)
  - artifacts: `/tmp/claude-1000/usasi-growth/people/ARTIFACT_SLUGS.txt` (`slug|name|organizations`)
- Your batch folder: `/tmp/claude-1000/usasi-growth/people/<batch>/`. It contains `ROSTER.md`.
  Write each profile to `<batch>/people/<slug>.yml` and your notes to `<batch>/NOTES.md`.
- Shared claims file: `/tmp/claude-1000/usasi-growth/people/claims.tsv`.

## Steps for each roster name

1. **Check for a duplicate.** Make the slug: the kebab-case public name, ASCII only, so "Gaël Varoquaux" becomes `gael-varoquaux`.
   - If `content/people/<slug>.yml` or `content/leaders/<slug>.yml` already exists in the repository, skip the person and note "exists".
   - If the slug is already in `claims.tsv`, skip and note "claimed by <batch>".
   - Otherwise claim it first: `printf '%s\t%s\n' <slug> <batch> >> /tmp/claude-1000/usasi-growth/people/claims.tsv`.
2. **Identify the person unambiguously.** Do it from their own homepage, their faculty or official team page, their GitHub profile, or a paper's author list. If the roster name could be more than one person, or you cannot tell which one is meant, skip and explain.
3. **Find the catalog tie.** A profile is publishable only if a source fetched today documents one of these:
   - a current or past role at a catalog organization (`affiliations[].organization_slug`); or
   - concrete work on a catalog artifact (`work[].artifact_slug`).

   Many roster names are academics or work outside the United States. Past roles count, for example years at Google DeepMind, Meta (FAIR), Microsoft Research, OpenAI, or NVIDIA.

   If there is no documented tie, do not write a profile. Note "no catalog tie" and name the person's main project or institution, so the editor can decide later whether that project belongs in the catalog.
4. **Write the profile** (format below), using only facts from sources you fetched today.
5. **Validate:** `cd /tmp/claude-1000/usasi-wt/people && npx tsx /tmp/claude-1000/usasi-growth/validate-batch.ts /tmp/claude-1000/usasi-growth/people/<batch>`
   - Fix every error.
   - Fix "not cited" warnings by citing the source or deleting it.
   - Run it again at the end; it must report 0 errors.

## Hard rules

1. **Professional information only.** Roles, projects, papers, software, datasets, courses and books, plus professional honors given by an awarding body or university (for example the Turing Award) when an official page states them.
   - Never research or write: location, nationality, citizenship, ethnicity, religion, age or birth date, family, health, personal life, personal social-media activity, opinions, politics, controversies, disputes, departures framed as conflicts, lawsuits, or anything from gossip.
   - Education only when an official page ties it to the work (for example "PhD under X at Y" on their faculty page); otherwise omit it.
   - The validator rejects words like "born", "lives in", "based in", "grew up", "nationality".
2. **Sources.** Cite only pages you fetched today (WebFetch, or curl with `-A "USASI-catalog-research/0.3"`):
   - the person's own site or GitHub profile;
   - an official organization page (team, about, faculty, lab, blog byline, press release);
   - a project repository (README, AUTHORS, CODEOWNERS, MAINTAINERS, release notes, contributor listings);
   - a paper's arXiv or proceedings page (author list and abstract);
   - official award pages (e.g. the ACM Turing Award site, nobelprize.org).

   Never cite Wikipedia, Crunchbase-style aggregators, LinkedIn, social-media posts, news articles, podcasts, or interview transcripts. You may use WebSearch only to find primary pages.
3. **Current roles must be current.**
   - State a role as `current: true` only if a source fetched today presents it as current (for example a homepage saying "I am a professor at …", or the org's current team page).
   - People change jobs often (2025–2026 included). If the newest official source contradicts an older page, follow the newest; if it is unclear, record the role as past (`current: false`) only when a source documents it, or leave it out.
   - Never infer a role.
4. **Tone.** Warm, factual, plain; your own words; 2–5 sentences in the bio.
   - No superlatives or rankings ("leading", "legendary", "pioneer of", "godfather", "top", "best", "renowned", "world-class", "state-of-the-art").
   - No counts of followers, stars, downloads, citations, users or employees, and no funding, valuations or money.
   - Don't use he/she/his/her: use the person's name or "they".
5. **Pseudonymous people** (for example Bartowski, TheBloke): use only the public handle and what their official pages state; never try to identify them further.
6. **Privacy in requests.** Never put any email address, personal name of the site owner, or account identifier in any request header, URL or payload. Use WebFetch or the generic User-Agent above.
7. **No browser pane, no logins, no CAPTCHAs.** If a site blocks you, use another primary source or skip.
8. **Never edit the repository.** Write only inside your batch folder and append to `claims.tsv`.

## Good places to verify

These are where to start; they are not the only sources.

- **llama.cpp:**
  - contributor history: `https://github.com/ggml-org/llama.cpp/graphs/contributors`;
  - CODEOWNERS: `https://github.com/ggml-org/llama.cpp/blob/master/CODEOWNERS`;
  - release notes.
- **PyTorch:**
  - repository and maintainers page: `https://github.com/pytorch/pytorch`, `https://docs.pytorch.org/docs/stable/community/persons_of_interest.html`;
  - governance pages.
- **Hugging Face:**
  - the organization directories at `https://huggingface.co/<org>`;
  - team member profiles at `https://huggingface.co/<user>`;
  - library repositories (`transformers`, `diffusers`, `trl`, `smolagents`, `huggingface_hub`), whose release notes and READMEs credit maintainers.
- **Other good sources:**
  - official company leadership pages and newsroom executive bios;
  - university faculty pages;
  - arXiv author lists.

## Groups (`groups:` — one or more, most relevant first)

- `open-source`: creates or maintains open-source software, models or datasets (the repository or project page credits them).
- `engineering`: researcher or engineer whose published methods, models or systems are the focus.
- `leadership`: founder, CEO, or executive of an organization (only if a source states the role).
- `local`: their work directly helps people run AI models on their own hardware (local runtimes, quantization, on-device frameworks, small open-weight models).

## Directory fields

- **`sector`:** the kind of organization of the person's current main role, as the sources show it:
  - `corporate` (a company);
  - `academic` (a university);
  - `nonprofit` (a nonprofit institute or foundation);
  - `government` (a national lab or agency);
  - `independent` (no current organizational role documented, e.g. an independent maintainer).
- **`specialties`:** one to three, most relevant first: `language-models`, `multimodal`, `vision`, `generative-media`, `speech-audio`, `robotics`, `reinforcement-learning`, `agents`, `inference`, `training-systems`, `ml-frameworks`, `hardware`, `developer-tools`, `evaluation`, `safety-alignment`, `interpretability`, `ai-for-science`, `data`, `education`, `ml-theory`.
- **`work[].type`:** how that work is available:
  - `open-source` (code under an open license);
  - `open-weights` (downloadable model weights);
  - `open-data` (a downloadable dataset);
  - `open-research` (a published paper, course or book);
  - `proprietary` (a closed product or model).

  Say only what the source shows, for example the repository's license file or the model card's license.
- **Never record a country, city, or other location for a person.** The site's privacy rule keeps location off profiles; an organization's own catalog page carries its headquarters.

## File format — `<batch>/people/<slug>.yml`

Copy the style of `content/people/tri-dao.yml`. Fields, in this order:

```yaml
slug: jane-example
name: Jane Example                 # as they present publicly (keep accents)
initials: JE                       # 1–3 ASCII letters
groups: [open-source, engineering]
sector: corporate                  # corporate | academic | nonprofit | government | independent
specialties: [ml-frameworks, training-systems]   # 1–3 from the list above
headline: Co-creator of an open-source training library; research scientist at Example Lab   # ≤ 110 characters
bio:
  text: >-
    Two to five factual sentences in your own words, centered on the work that ties them to the catalog.
  source_ids: [homepage, repo]
  reviewed_at: 2026-10-13
affiliations:                      # at least one; current role first
  - name: Example Lab
    organization_slug: null        # a catalog slug when the org is in ORG_SLUGS.txt, else null
    role: Research Scientist       # exactly as the source states it
    current: true
    source_ids: [homepage]
work:                              # at least one; the tied work first
  - name: Example Library
    artifact_slug: example-library # a catalog slug, or null
    type: open-source              # open-source | open-weights | open-data | open-research | proprietary
    url: https://github.com/…      # official project page, repo, or paper; or null
    contribution: >-
      What the source says they did (≥ 10 characters), e.g. "Listed as a maintainer in the CODEOWNERS file …".
    source_ids: [repo]
links:                             # up to 4 pages THEY publish or official profile pages (homepage, GitHub, faculty page)
  - label: Website
    url: https://…
publication_status: published      # use draft if anything material is uncertain
updated_at: 2026-10-13
last_reviewed: 2026-10-13
sources:
  - id: homepage                   # lowercase-kebab ids, unique within the file
    title: Jane Example — homepage
    url: https://…
    publisher: Jane Example
    kind: official-page            # official-page | documentation | repository | model-card | dataset-card | license | release-notes | announcement | paper | filing | other
    published_at: null             # or YYYY / YYYY-MM / YYYY-MM-DD when the page gives it
    accessed_at: 2026-10-13
```

Every source must be cited by at least one claim (`bio`, `affiliations[].source_ids`, or `work[].source_ids`). Quote YAML strings that contain `: ` or start with a special character.

## Notes and final reply

`NOTES.md` has one line per roster name: `slug — created | skipped (exists / claimed / no catalog tie: <main project or institution> / could not verify: <why> / ambiguous)`.

Final reply, under 150 words:
- how many profiles you created;
- how many you skipped, by reason;
- confirmation that the validator reports 0 errors.
