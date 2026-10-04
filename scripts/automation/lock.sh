# Shared run-lock helpers for the local automation scripts (sourced, not run).
# The lock records when a run started and which Claude session owns it, so a
# run can only publish or release a lock it took itself. Outside Claude (a
# person in a terminal) the owner is "manual".
lock=reports/automation/run.lock
lock_owner="${CLAUDE_CODE_SESSION_ID:-manual}"
# A lock older than this is treated as abandoned and may be taken over.
lock_stale_seconds=43200
lock_holder() { [ -e "$lock" ] && awk '{print $2}' "$lock" || true; }
lock_started() { [ -e "$lock" ] && awk '{print $1}' "$lock" || true; }
lock_age() { echo $(( $(date +%s) - $(stat -c %Y "$lock") )); }
