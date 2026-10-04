#!/usr/bin/env bash
# Local automation, final step: run every check, commit editorial changes as the
# USASI identity, push as the usasihq GitHub account, deploy with Wrangler, and
# verify the live site. Nothing is deployed unless every check passes.
# Usage: scripts/automation/publish.sh "Commit message summary"
set -euo pipefail
cd "$(dirname "$0")/../.."
. scripts/automation/lock.sh
summary="${1:-Automated update $(date +%F)}"
site=https://unitedstatesofamericasuperintelligence.com

[ "$(git config user.email)" = "335780783+usasihq@users.noreply.github.com" ] || { echo "publish: wrong git identity; stopping" >&2; exit 3; }
# Publish only from the run that took the lock in sync.sh, so one run never
# commits another run's unfinished edits.
[ "$(lock_holder)" = "$lock_owner" ] || { echo "publish: this run does not hold the run lock (run scripts/automation/sync.sh first; another run may have taken over); stopping" >&2; exit 4; }

npm run validate
npm run typecheck
npm run lint
npm test
npm run build
npm run check:links

# Editorial changes only: the Jobs state file is operational and stays local.
git add -A -- . ':!reports'
git reset -q -- data/jobs/current.json
if ! git diff --cached --quiet; then
  git commit -q -F - <<MSG
$summary

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
fi

push() {
  git -c credential.helper= \
    -c 'credential.helper=!f() { echo username=x-access-token; echo "password=$(gh auth token --user usasihq)"; }; f' \
    push origin main
}
pushed=yes
if ! push; then
  git pull --rebase --autostash --quiet origin main && push || pushed=no
fi

WRANGLER_SEND_METRICS=false npx wrangler deploy --message "$summary ($(git rev-parse --short HEAD))"

ok=no
for i in 1 2 3 4 5 6; do
  sleep 10
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "$site/")" = 200 ] && [ "$(curl -s -o /dev/null -w '%{http_code}' "$site/jobs/")" = 200 ]; then ok=yes; break; fi
done
[ "$(lock_holder)" = "$lock_owner" ] && rm -f "$lock"
echo "publish: commit $(git rev-parse --short HEAD), pushed=$pushed, live check=$ok"
[ "$pushed" = yes ] && [ "$ok" = yes ]
