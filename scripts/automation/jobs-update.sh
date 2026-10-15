#!/usr/bin/env bash
# Local automation, Jobs only: take the run lock, refresh every job feed, then
# check, build, and deploy. The evening Jobs run uses it so listings and job
# pages stay current even on a day the morning routine fails. It makes no
# editorial changes, so publish.sh has nothing to commit and only deploys.
# Exit codes: those of sync.sh (2, 4) and publish.sh; 1 if the refresh fails.
set -euo pipefail
cd "$(dirname "$0")/../.."
bash scripts/automation/sync.sh
if ! npm run jobs:refresh; then
  echo "jobs-update: the refresh failed; nothing deployed" >&2
  bash scripts/automation/unlock.sh
  exit 1
fi
if ! bash scripts/automation/publish.sh "Jobs refresh $(date +%F)"; then
  echo "jobs-update: publish did not finish; see its output above" >&2
  bash scripts/automation/unlock.sh
  exit 1
fi
