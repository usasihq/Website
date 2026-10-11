# Local automation

The site is kept current by two scheduled Claude tasks on the owner's computer
(Claude desktop app → Scheduled). They run only while that computer is on and
the app is open; a missed run starts on the next launch. Both work in a
permanent clone of this repository and deploy with the machine's existing
Wrangler login. The GitHub Actions deploy and Jobs-refresh workflows stay
paused (`CLOUDFLARE_DEPLOY=false`), so there is no Cloudflare API token in GitHub.

| Task | When | What it does |
|---|---|---|
| Daily site update | every day, 7:00 local | refresh all Jobs feeds; research and publish new Latest news from official sources; record completed pending events (for example a closed acquisition) and confirmed watch-list items; check, commit, push, deploy |
| Weekly catalog upkeep | Sundays, 10:00 local | review a batch of cited sources for changes; apply supported corrections; add recent open releases from catalog organizations; check, commit, push, deploy |

News is published without individual human review (disclosed on `/news/` and in
the methodology). Every run must pass `npm run validate`, typecheck, lint, unit
tests, the production build, and the internal link check before anything is
committed or deployed. Tasks never edit code, tests, or validation rules.

## Scripts

- `scripts/automation/sync.sh` takes a run lock (one run at a time), keeps the
  local Jobs state (`data/jobs/current.json` is operational and never committed),
  and rebases onto GitHub `main`. It stops if there are uncommitted editorial
  changes. The lock (`reports/automation/run.lock`) records the start time and
  the Claude session that took it (`manual` outside Claude); another run may
  take it over only after 12 hours.
- `scripts/automation/publish.sh "summary"` runs every check, commits editorial
  changes as `USASI <335780783+usasihq@users.noreply.github.com>`, pushes with the
  `usasihq` account's token from `gh` (the active `gh` account is not switched),
  deploys with Wrangler, verifies the live site, and releases the lock. It
  refuses to run unless the current run holds the lock, so one run never
  commits another run's unfinished edits.
- `scripts/automation/unlock.sh` releases the lock when a run stops early. It
  leaves another run's lock in place.

## Watch list

`research/watchlist.md` lists claims the catalog has seen but cannot publish
yet because no official source confirms them (for example a rename announced
only on social media). Each item names the official sources to check and the
update to make. The daily update checks them on every run and moves confirmed
items to "Resolved".

Run logs are written to `reports/automation/` (not committed).

## Weekly email issues

Each issue of the USASI weekly is a file in `content/newsletter/` (schema `NewsletterIssue` in `lib/schema.ts`). The same file produces the email and the archived copy at `/newsletter/<slug>/`, so the two cannot drift apart.

- Write the issue only from what the site published that week: news items, changelog entries, and new records. Text supports `**bold**` and `[label](/site/path/)` links only. Validation rejects links to pages the site does not build and non-https external links.
- Keep `publication_status: draft` until the issue is sent. Drafts are validated but not shown on the site.
- `npm run newsletter:email -- <slug>` writes `reports/automation/newsletter/<slug>.inline.html` and prints its length and SHA-256. Paste it into one HTML snippet block in beehiiv, then check that the snippet's text has the same hash.
- In beehiiv, set the byline to the "USASI" guest author, not a personal profile.
- Sending, scheduling, and test sends happen only after the owner says yes.
- After sending, set `publication_status: published`, `sent_at`, and `web_url`, then publish the site. A unit test pins issue 1 to the exact HTML that was emailed.

## Pausing or changing it

Pause or edit either task in the desktop app's Scheduled view. To publish by
hand instead: `scripts/automation/sync.sh`, edit, then
`scripts/automation/publish.sh "what changed"`.
