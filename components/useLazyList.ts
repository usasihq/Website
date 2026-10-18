"use client";

import { useEffect, useState } from "react";

/**
 * The full ranked list for a long directory (AI on GitHub, AI on Hugging
 * Face), fetched from this site's own JSON only once `needed` turns true:
 * when someone searches, filters, or asks for more. The page embeds the first
 * page of results, so nothing loads for a plain visit.
 */
export function useLazyList<T>(dataUrl: string, needed: boolean, pick: (body: unknown) => T[]): { all: T[] | null; failed: boolean } {
  const [all, setAll] = useState<T[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!needed) return;
    let live = true;
    fetch(dataUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: unknown) => {
        if (live) setAll(pick(d));
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
    // `pick` is a pure accessor; only the URL and the trigger matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl, needed]);
  return { all, failed };
}
