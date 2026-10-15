"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/dates";
import { asset } from "@/lib/paths";

/**
 * "Site generated <date>", read from /data/build-info.json after the page loads.
 * Keeping the date out of the page HTML means a page whose content did not
 * change is byte-identical between builds, so daily data refreshes only upload
 * the pages that actually changed.
 */
export function BuildDate() {
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    fetch(asset("/data/build-info.json"))
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { build_at?: string } | null) => {
        if (live && d?.build_at && /^\d{4}-\d{2}-\d{2}T/.test(d.build_at)) setDate(d.build_at);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  if (!date) return null;
  return (
    <p className="meta">
      Site generated <time dateTime={date}>{formatDate(date.slice(0, 10))}</time>
    </p>
  );
}
