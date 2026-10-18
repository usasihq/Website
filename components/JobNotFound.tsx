"use client";

import Link from "@/components/Link";
import { useSyncExternalStore } from "react";
import { BASE_PATH } from "@/lib/site-config";

const noop = () => () => {};

/** A missing job page's employer and the title words from its address ("/jobs/at/anthropic/research-engineer-1a2b3c4/"). */
export function missingJob(pathname: string): { org: string; words: string } | null {
  const path = BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname;
  const m = /^\/jobs\/at\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/.exec(path);
  if (!m) return null;
  // The address ends with a 7-character code from the posting's ID; the rest is the title.
  const words = m[2].replace(/-[a-z0-9]{7}$/, "").split("-").filter(Boolean).slice(0, 8).join(" ");
  return { org: m[1], words };
}

/**
 * On the 404 page, for an address that looks like a job page: the posting has
 * closed (job pages exist only while a listing is current), with links to the
 * employer's other jobs and a search for similar ones. Static HTML shows
 * nothing here; the page still returns 404.
 */
export function JobNotFound({ employers }: { employers: Record<string, string> }) {
  const job = useSyncExternalStore(
    noop,
    () => window.location.pathname,
    () => "",
  );
  const hit = job ? missingJob(job) : null;
  if (!hit) return null;
  const name = employers[hit.org];
  return (
    <div className="card mt-8 max-w-2xl p-6" data-testid="job-not-found">
      <h2 className="text-xl font-semibold text-text">This job is no longer listed</h2>
      <p className="mt-2 text-muted">
        Job pages exist only while the employer&rsquo;s own job board lists the posting. Employers close postings when they are filled or withdrawn.
      </p>
      <ul className="mt-5 flex flex-wrap gap-3">
        {name ? (
          <li>
            <Link prefetch={false} href={`/jobs/at/${hit.org}/`} className="btn btn-primary">
              Jobs at {name}
            </Link>
          </li>
        ) : null}
        {hit.words ? (
          <li>
            <Link prefetch={false} href={`/jobs/?q=${encodeURIComponent(hit.words)}&where=all`} className="btn btn-secondary">
              Similar roles
            </Link>
          </li>
        ) : null}
        <li>
          <Link prefetch={false} href="/jobs/" className="btn btn-secondary">
            Search all jobs
          </Link>
        </li>
      </ul>
    </div>
  );
}
