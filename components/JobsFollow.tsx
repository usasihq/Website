"use client";
import Link from "@/components/Link";
import { Rss } from "lucide-react";
import { closestFeed, FILTER_NAMES, type FollowFeed } from "@/lib/jobs/feed-match";
import type { JobFilters } from "@/lib/jobs/search";
import { absoluteUrl, asset } from "@/lib/paths";

/**
 * "Follow this search": the job feed for the directory's current filters, or the closest one
 * (lib/jobs/feed-match.ts). Feeds need no account and keep nothing in the browser.
 */
export function JobsFollow({ filters, feeds, fallback }: { filters: JobFilters; feeds: FollowFeed[]; fallback: FollowFeed }) {
  const m = closestFeed(filters, feeds, fallback);
  const left = m.unmatched.map((k) => FILTER_NAMES[k] ?? k);
  const outsideNote = m.feed.includesOutside && filters.where !== "all" ? " It also lists positions outside the U.S." : "";
  const usOnlyNote = !m.feed.includesOutside && filters.where === "all" && m.feed === fallback ? " It lists U.S. positions and ones with no stated location." : "";
  return (
    <section aria-labelledby="jobs-follow-heading" className="mt-8 rounded-xl border border-line p-4 sm:p-5" data-testid="jobs-follow">
      <h2 id="jobs-follow-heading" className="flex items-center gap-2 text-base font-semibold text-text">
        <Rss aria-hidden="true" className="h-4 w-4 text-cyan" />
        Follow this search
      </h2>
      <p className="mt-2 text-[0.9375rem] text-text">
        {m.exact ? "Feed for these filters: " : "Closest feed: "}
        <a href={asset(m.feed.path)} className="link font-medium" type="application/rss+xml" data-testid="jobs-follow-link">
          {m.feed.title} (RSS)
        </a>
        <span className="text-muted">, the 100 newest listings</span>
      </p>
      {!m.exact ? (
        <p className="mt-1 text-sm text-muted" data-testid="jobs-follow-note">
          {left.length
            ? `No feed applies ${left.length === 1 ? "this filter" : "these filters"}: ${left.join(", ")}. The feed follows the page `
            : "The feed follows the page "}
          <Link prefetch={false} href={m.feed.page} className="link">
            {m.feed.title}
          </Link>
          .{outsideNote}
          {usOnlyNote}
        </p>
      ) : outsideNote ? (
        <p className="mt-1 text-sm text-muted">{outsideNote.trim()}</p>
      ) : null}
      <p className="mt-2 text-sm text-muted">
        RSS needs no account: paste <code className="font-mono text-[0.8125rem] text-ice [overflow-wrap:anywhere]">{absoluteUrl(m.feed.path)}</code> into any feed
        reader and new listings appear there. Prefer email?{" "}
        <Link prefetch={false} href="/newsletter/" className="link">
          The USASI weekly
        </Link>{" "}
        sums up each week. <Link prefetch={false} href="/feeds/#job-feeds" className="link">All job feeds</Link>
      </p>
    </section>
  );
}
