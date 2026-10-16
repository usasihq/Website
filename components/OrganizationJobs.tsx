"use client";
import Link from "next/link";
import { checkedLabel } from "@/lib/jobs/search";
import type { FeedHealth } from "@/lib/jobs/schema";
import { useJobsClock } from "./useJobsClock";
import { ExternalLink } from "./ExternalLink";
export function OrganizationJobs({ slug, name, url, enabled, jobCount, feed, asOf, roles = [] }: { slug: string; name: string; url: string | null; enabled: boolean; jobCount: number; feed: FeedHealth | null; asOf: string; roles?: { href: string; name: string; count: number }[] }) {
  const now = useJobsClock(asOf);
  const healthy = enabled && feed?.result === "ok" && feed.last_successful && now - Date.parse(feed.last_successful) <= 48 * 3600000;
  const count = healthy ? jobCount : 0;
  return <section id="jobs" className="scroll-mt-24"><h2 className="text-xl font-semibold text-text sm:text-2xl">Open positions</h2><p className="mt-3 text-muted">{!enabled ? "Automated job coverage is not configured for this organization." : !healthy ? "This job source has not been successfully verified recently. Check the employer’s careers page for current openings." : count ? `${count} recently confirmed positions in this catalog.` : "No current postings were present in the last successful source check."}</p>
    {feed ? <p className="mt-2 text-sm text-muted">Last successful source check: {checkedLabel(feed.last_successful)}</p> : null}
    <div className="mt-4 flex flex-wrap gap-5">{enabled ? <Link href={`/jobs/at/${encodeURIComponent(slug)}/`} className="link">All {name} jobs →</Link> : null}{url ? <ExternalLink href={url}>Official careers</ExternalLink> : null}</div>
    {healthy && roles.length ? <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2" data-testid="org-job-roles">{roles.map(r => <li key={r.href}><Link href={r.href} className="link">{r.name} at {name} ({r.count.toLocaleString("en-US")})</Link></li>)}</ul> : null}
  </section>;
}
