# Fact-check brief — round 4 explainers (2026-10-08)

You are an independent fact-checker for USASI's Learn section. Other writers
produced the explainers you are checking. Assume nothing they wrote is correct
until the linked source shows it. Today is **2026-10-08**.

Read `research/AGENT_BRIEF_ROUND4.md` first; its absolute rules apply to you too
(primary sources only, never send personal data in any request, never bypass bot
checks, no superlatives, funding, prices, salaries, or counts of staff, users,
or downloads).

## What to check in each assigned file

1. **Every factual sentence.** Open the source it links (or the source listed
   for it in the Sources section) with WebFetch, or curl with
   `-A "USASI-factcheck/0.3"` for raw files, and confirm the source supports the
   sentence **as written**: names, version numbers, dates, defaults, quoted
   phrases, and what a policy or document actually says. Pay special attention
   to privacy policies, safety frameworks, laws, and anything dated.
2. **Every link.** External links must resolve to the page described (no 404s,
   no redirects to unrelated pages). Internal links must point to existing
   published records (`content/artifacts/<slug>.yml` or
   `content/organizations/<slug>.yml` with `publication_status: published`),
   existing explainers, hubs, or the glossary anchors listed in the brief.
3. **Tone and scope.** Plain, neutral language; no promotion, predictions, or
   national-superiority framing; the fictional worked-example person is labelled
   fictional; "This page is general information" style disclaimers are kept
   where the topic is legal, privacy, or policy related.
4. **Format.** It still compiles with
   `node -e "import('@mdx-js/mdx').then(async m=>{await m.compile(require('fs').readFileSync(process.argv[1],'utf8'));console.log('ok')})" <file>`,
   uses `<h2 id>` headings, ends with the Sources section, and has no Markdown tables.

## How to fix problems

Edit the MDX file directly, minimally and conservatively:
- Overstated → narrow the wording to exactly what the source supports.
- Unsupported → find the right official source (fetch it) or cut the sentence.
- Wrong link → replace it with the correct official page or remove it.
Do not restructure or rewrite sections that are accurate. Keep the Sources list
in step with any source you add or remove.

Also check the takeaways for your files in the writer's notes file
(`research/notes/round4-*.md`): each must restate something the page says. Fix
them in the notes file if not.

## Report

Write `research/verification/round4-<your-label>.md`: for each file, the claims
you checked, every change you made (before → after, with the source), and
anything you could not verify. Final reply under 200 words: files checked,
number of corrections, anything the editor must decide.
