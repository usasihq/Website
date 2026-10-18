"use client";
import { STALE_MS } from "@/lib/jobs/search";
import { useJobsClock } from "./useJobsClock";

/**
 * A static page cannot know how old it is when it is read. After the page loads,
 * this says so plainly when its listings were last checked more than 48 hours ago.
 */
export function JobsFreshness({ asOf, lastChecked }: { asOf: string; lastChecked: string | null }) {
  const now = useJobsClock(asOf);
  if (!lastChecked || now - Date.parse(lastChecked) <= STALE_MS) return null;
  return (
    <p role="status" className="card mb-8 border-tone-amber/45 p-4 text-sm text-text">
      These listings were last checked more than 48 hours ago, so some may have changed or closed. Check each employer&rsquo;s posting before
      applying.
    </p>
  );
}
