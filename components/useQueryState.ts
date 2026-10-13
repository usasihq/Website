"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

/**
 * Filter state persisted in the URL query string.
 *
 * `location.search` is treated as an external store. The server snapshot is
 * empty, so the static HTML always shows the unfiltered list (the catalog works
 * without JavaScript and is fully indexable). After hydration the state follows
 * the address bar, including back/forward, and updates are written with
 * pushState (discrete choices) or replaceState (typing).
 */
const URL_CHANGE = "usasi:urlchange";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(URL_CHANGE, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(URL_CHANGE, callback);
  };
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

export function useQueryState<T>(parse: (params: URLSearchParams) => T, serialize: (value: T) => string) {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const state = useMemo(() => parse(new URLSearchParams(search)), [parse, search]);

  const update = useCallback(
    (next: T, mode: "push" | "replace" = "push") => {
      const query = serialize(next);
      const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
      if (url === `${window.location.pathname}${window.location.search}`) return;
      if (mode === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
      window.dispatchEvent(new Event(URL_CHANGE));
    },
    [serialize],
  );

  return { state, update };
}

/** Debounced copy of a value, for polite screen-reader announcements. */
export function useDebounced<T>(value: T, delay = 600): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const getHydrated = () => true;
const getServerHydrated = () => false;

/**
 * How many results a long directory shows. The static HTML lists every
 * record (no JavaScript needed, fully indexable); after hydration it shows
 * `pageSize` at a time, and "Show more" raises `?n=` in the address so the
 * back button returns to the same depth. Changing a filter rewrites the
 * query without `n`, which starts again from the first page.
 */
export function useShowMore(pageSize: number) {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(subscribe, getHydrated, getServerHydrated);
  const requested = Number(new URLSearchParams(search).get("n"));
  const limit = !hydrated ? Infinity : Number.isFinite(requested) && requested > pageSize ? Math.floor(requested) : pageSize;

  const showMore = useCallback(
    (total: number) => {
      const params = new URLSearchParams(window.location.search);
      params.set("n", String(Math.min(total, limit + pageSize)));
      window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
      window.dispatchEvent(new Event(URL_CHANGE));
    },
    [limit, pageSize],
  );

  return { limit, showMore };
}
