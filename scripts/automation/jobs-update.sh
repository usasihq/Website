#!/usr/bin/env bash
# Local automation, Jobs only: take the run lock, refresh every job feed, then
# check, build, and deploy. The evening Jobs run uses it so listings and job
# pages stay current even on a day the morning routine fails. It makes no
# editorial changes, so publish.sh has nothing to commit and only deploys.
# Exit codes: those of sync.sh (2, 4) and publish.sh; 1 if the refresh fails.
set -euo pipefail
cd "$(dirname "$0")/../.."
bash scripts/automation/sync.sh
# Diff source for Google Indexing API and IndexNow. Must be the snapshot from
# before this refresh, not the one we are about to write.
if [ -f data/jobs/current.json ]; then
  cp data/jobs/current.json data/jobs/previous.json
fi
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
# IndexNow after deploy so the URLs are live. Errors must not undo the publish.
if ! npm run jobs:indexnow; then
  echo "jobs-update: IndexNow ping did not finish; the site was still published" >&2
fi
# Optional Hugging Face dataset copy. Missing HF_TOKEN skips; a Hub failure
# must not undo the deploy (the Node script also exits 0 in that case).
if ! npm run jobs:hf-dataset; then
  echo "jobs-update: Hugging Face dataset push did not finish; the site was still published" >&2
fi
