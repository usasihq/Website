# Research brief — Latest news backfill (2026-10-13)

USASI (unitedstatesofamericasuperintelligence.com) is an independent, evidence-first
catalog of U.S. AI organizations and U.S.-led open models and tools. Its Latest news
section has 55 short, dated, sourced items, most of them from October. You are adding
items for significant events since **2026-07-01** that the section has not covered,
for the organizations assigned to you. Today is **2026-10-13**.

## Where things are

- Repository (read only; never edit it): `/tmp/claude-1000/usasi-wt/people`
  - Rules to read first:
    - the "news" section of `content/pages/methodology.mdx`;
    - the `NewsItem` schema in `lib/schema.ts`;
    - the news checks in `lib/validate.ts`, including `NEWS_FORBIDDEN`.
  - Read three files in `content/news/` as models (for example `vllm-0-31-0-released.yml`, `ibm-releases-granite-4-2.yml`, `qualcomm-completes-modular-acquisition.yml`).
- Existing items, as `event_date | slug | title`: `/tmp/claude-1000/usasi-growth/news/EXISTING.txt`. Never duplicate one of these, or an item another agent has claimed.
- Catalog slugs:
  - `/tmp/claude-1000/usasi-growth/people/ORG_SLUGS.txt` (`slug|name`)
  - `/tmp/claude-1000/usasi-growth/people/ARTIFACT_SLUGS.txt` (`slug|name|organizations`)
- Your folder: `/tmp/claude-1000/usasi-growth/news/<batch>/`. It contains `ORGS.md` (your organizations).
  - Write items to `<batch>/news/<slug>.yml`.
  - Write notes to `<batch>/NOTES.md`.
- Shared claims file: `/tmp/claude-1000/usasi-growth/news/claims.tsv`. Before writing an item, check it for the same event (any slug), then append `printf '%s\t%s\n' <slug> <batch>`.

## What to cover

Events dated **2026-07-01 to 2026-10-12** involving your organizations or their catalog artifacts, found on official sources:
- newsrooms and blogs;
- release notes and GitHub releases;
- model hubs (Hugging Face organization pages);
- SEC filings;
- government sites.

Good topics:
- model releases, especially open-weight;
- notable open-source releases (major versions, not every patch);
- license changes;
- completed or formally announced acquisitions;
- projects moving to foundations;
- official policy or standards actions;
- major research releases with public code, weights or data.

Aim for the **most significant 15–30 events** across your organizations. Prefer variety: don't write ten patch releases of one library. If an organization had nothing significant, write nothing for it.

## Each item

- **`slug`** equals the file name: kebab-case, descriptive (`<org>-releases-<thing>`).
- **`title`:** neutral and factual, 10–120 characters.
- **`event_date`:** the documented date (`YYYY-MM-DD`, or `YYYY-MM` if only the month is given).
- **`published_at`** and **`updated_at`:** `2026-10-13`.
- **`category`:** one of `release`, `license`, `acquisition`, `governance`, `catalog`, `research`, `policy`.
- **`summary.text`:** 2–5 sentences in your own words.
  - Say plainly what is confirmed and what is not.
  - Use the source's exact product, version and feature names.
  - End with "USASI has not tested …" where the item describes software or model capabilities.
  - Every sentence must match a specific passage in a cited source. Re-read each one against its source before saving.
  - Don't merge separate entries into one claim.
- **`summary.source_ids`:** cites every source.
- **`related_organizations` / `related_artifacts`:** published catalog slugs only; at least one.
- **`publication_status`:** `published`.
- **`sources`:** `id`, `title`, `url`, `publisher`, `kind` (`announcement`, `release-notes`, `model-card`, `repository`, `filing`, `official-page`, `paper`, `documentation`), `published_at` (when given), `accessed_at: 2026-10-13`.

## Hard rules

1. **Primary sources only, fetched today** (WebFetch, or curl with `-A "USASI-catalog-research/0.3"`).
   - Never use news aggregators, news articles, rumors, social-media posts, paywalled or leaked material, or Wikipedia.
   - You may use WebSearch only to find primary pages.
   - An event reported only by the press does not qualify.
2. **No funding amounts, prices, valuations, revenue, staff or user counts, benchmark scores, rankings, or superlatives** ("leading", "best", "state-of-the-art", "most powerful"). Don't quote marketing superlatives either.
3. **Never put any email address or personal identifier in a request.** No browser tools (no `mcp__Claude_Browser__*`, no claude-in-chrome). No logins or CAPTCHAs; if a site blocks you, skip that source.
4. **Never edit the repository.** Write only in your folder and append to `claims.tsv`.
5. **Validate:** `cd /tmp/claude-1000/usasi-wt/people && npx tsx /tmp/claude-1000/usasi-growth/validate-batch.ts /tmp/claude-1000/usasi-growth/news/<batch>`. Fix every error and every "not cited" warning; finish with 0 errors.

## Notes and final reply

`NOTES.md`:
- each item with its source URLs;
- candidate events you skipped and why (press-only, before the window, already covered, not significant).

Final reply, under 150 words:
- how many items you wrote, by category;
- confirmation that the validator reports 0 errors.
