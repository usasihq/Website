# Local automation

The site is kept current by two scheduled Claude tasks on the owner's computer
(Claude desktop app → Scheduled). They run only while that computer is on and
the app is open; a missed run starts on the next launch. Both work in a
permanent clone of this repository and deploy with the machine's existing
Wrangler login. The GitHub Actions deploy and Jobs-refresh workflows stay
paused (`CLOUDFLARE_DEPLOY=false`), so there is no Cloudflare API token in GitHub.

| Task | When | What it does |
|---|---|---|
| Daily site update | every day, 7:00 local | refresh all Jobs feeds; research and publish new Latest news from official sources; record completed pending events (for example a closed acquisition); check, commit, push, deploy |
| Weekly catalog upkeep | Sundays, 10:00 local | review a batch of cited sources for changes; apply supported corrections; add recent open releases from catalog organizations; check, commit, push, deploy |

News is published without individual human review (disclosed on `/news/` and in
the methodology). Every run must pass `npm run validate`, typecheck, lint, unit
tests, the production build, and the internal link check before anything is
committed or deployed. Tasks never edit code, tests, or validation rules.

## Scripts

- `scripts/automation/sync.sh` takes a run lock (one run at a time), keeps the
  local Jobs state (`data/jobs/current.json` is operational and never committed),
  and rebases onto GitHub `main`. It stops if there are uncommitted editorial
  changes.
- `scripts/automation/publish.sh "summary"` runs every check, commits editorial
  changes as `USASI <335780783+usasihq@users.noreply.github.com>`, pushes with the
  `usasihq` account's token from `gh` (the active `gh` account is not switched),
  deploys with Wrangler, verifies the live site, and releases the lock.

Run logs are written to `reports/automation/` (not committed).

## Pausing or changing it

Pause or edit either task in the desktop app's Scheduled view. To publish by
hand instead: `scripts/automation/sync.sh`, edit, then
`scripts/automation/publish.sh "what changed"`.
