#!/usr/bin/env bash
# Local automation, step 1: take the run lock and bring this working copy up to
# date with GitHub main, keeping the operational Jobs state (never committed).
# Exit codes: 0 ok, 2 uncommitted editorial changes, 4 another run in progress.
set -euo pipefail
cd "$(dirname "$0")/../.."
mkdir -p reports/automation
. scripts/automation/lock.sh
if [ -e "$lock" ] && [ "$(lock_holder)" != "$lock_owner" ] && [ "$(lock_age)" -lt "$lock_stale_seconds" ]; then
  echo "sync: another automated run started at $(lock_started); stopping" >&2
  exit 4
fi
echo "$(date -u +%FT%TZ) $lock_owner" > "$lock"
state=reports/automation/jobs-state.json
cp data/jobs/current.json "$state"
git checkout -- data/jobs/current.json
if [ -n "$(git status --porcelain -- . ':!reports')" ]; then
  echo "sync: the working copy has uncommitted changes; stopping so nothing is overwritten" >&2
  git status --short >&2
  cp "$state" data/jobs/current.json
  rm -f "$lock"
  exit 2
fi
before=$(git rev-parse HEAD)
git pull --rebase --quiet origin main
cp "$state" data/jobs/current.json
if [ ! -d node_modules ] || ! git diff --quiet "$before" HEAD -- package-lock.json; then
  npm ci --silent
fi
echo "sync: at $(git rev-parse --short HEAD) ($(git log -1 --format=%s))"
