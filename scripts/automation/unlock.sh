#!/usr/bin/env bash
# Release the run lock after a run stops early. Only the run that took the lock
# (see lock.sh) can release it; another run's lock is left in place.
set -euo pipefail
cd "$(dirname "$0")/../.."
. scripts/automation/lock.sh
if [ -e "$lock" ] && [ "$(lock_holder)" = "$lock_owner" ]; then
  rm -f "$lock"
  echo "unlock: released"
elif [ -e "$lock" ]; then
  echo "unlock: the lock belongs to another run (started $(lock_started)); left in place"
else
  echo "unlock: no lock to release"
fi
