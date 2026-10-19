/**
 * First-seen tracking for the AI on GitHub and AI on Hugging Face snapshots ("New this week").
 * An item absent from the previous snapshot gets this fetch's time as `first_seen`; an item already
 * present keeps its `first_seen`, or has none if it predates tracking. A run whose previous snapshot
 * has no `tracking_since` starts tracking at this fetch and marks nothing new.
 */
export function markFirstSeen<T extends { first_seen?: string }>(
  items: T[],
  previous: { tracking_since?: string; items: T[] } | undefined,
  key: (item: T) => string | number,
  fetchedAt: string,
): { tracking_since: string; items: T[] } {
  const before = new Map((previous?.items ?? []).map((x) => [key(x), x]));
  for (const x of items) {
    const old = before.get(key(x));
    if (old?.first_seen) x.first_seen = old.first_seen;
    else if (!old && previous?.tracking_since) x.first_seen = fetchedAt;
  }
  return { tracking_since: previous?.tracking_since ?? fetchedAt, items };
}
