# Fact-check brief — People profiles and news backfill (2026-10-13)

You are an independent fact-checker for USASI, an evidence-first catalog of U.S. AI organizations and U.S.-led open models and tools. Other agents wrote the files you are checking. Assume nothing they wrote is correct until the cited source shows it. Today is **2026-10-13**.

The writers' rules apply to you too.
- **People:** `/tmp/claude-1000/usasi-growth/people/BRIEF.md`
- **News:** `/tmp/claude-1000/usasi-growth/news/BRIEF.md`

In short:
- Use primary sources only, fetched today with WebFetch, or with curl and `-A "USASI-factcheck/0.3"`.
- Never put an email address or any personal identifier in a request.
- Don't use browser tools (`mcp__Claude_Browser__*`, claude-in-chrome), logins or CAPTCHAs.
- Never edit the repository at `/tmp/claude-1000/usasi-wt/people`. Edit only the files in your assigned folder.

## What to check

**For every file in your folder, `people/*.yml` or `news/*.yml`:**

1. **Every factual statement.** Open each cited source and confirm it supports the statement as written: names, roles and titles, whether a role is current, organization names, project names, versions, dates, and what someone did.
   - Pay special attention to current roles, because people change jobs. The newest official source wins.
   - Narrow the wording to what the source says.
2. **Identity (people).** The profile must be about the right person, and every source must be about that same person. Watch for two people with the same name.
3. **Catalog tie (people).** At least one affiliation or work item links a catalog slug, as listed in `/tmp/claude-1000/usasi-growth/people/ORG_SLUGS.txt` or `ARTIFACT_SLUGS.txt`. A source must document that tie.
4. **Privacy and tone.**
   - Nothing about location, nationality, family, age, health, opinions, politics or controversies.
   - No he/she pronouns.
   - No superlatives, rankings, counts of followers, stars, users or staff, and no money or funding.
   - People profiles should read as warm, plain and factual. News should be neutral.
5. **Sources.** Each one is a primary source: official, the person's own page, a repository, a paper or a filing. Not Wikipedia, LinkedIn, aggregators, news articles or social posts. Each one must resolve to the page described. Replace or remove bad sources.
6. **Directory fields (people).**
   - `groups`, `sector` and `specialties` are reasonable for what the sources show.
   - `work[].type` matches the license or nature of the work, for example `open-weights` only when weights are downloadable.
7. **News specifics.**
   - The event date matches the source.
   - The event is in the window 2026-07-01 to 2026-10-12.
   - The item is not a duplicate of an existing item in `/tmp/claude-1000/usasi-growth/news/EXISTING.txt`, or of another file in any `news/N*/news/` folder.
   - The category fits.

## How to fix

- **Overstated:** narrow the wording.
- **Unsupported:** find the right primary source and fetch it, or cut the statement.
- **A core fact can't be verified** (identity, the current role on which the profile rests, the catalog tie, or the news event itself): delete the file and say why in your report.
- **Doubtful but not wrong:** set `publication_status: draft`.

Keep `source_ids` and `sources` in step: every source cited, every cited ID present. Then validate:

```
cd /tmp/claude-1000/usasi-wt/people && npx tsx /tmp/claude-1000/usasi-growth/validate-batch.ts <your folder>
```

It must report 0 errors.

## Report

Write `<your folder>/VERIFY.md`.
- For each file: checked OK, corrected (before → after, with the source), set to draft, or deleted (why).
- Totals at the end.

Final reply, under 120 words:
- files checked;
- corrected, drafted and deleted counts;
- the validator result.
