"use client";

import Link from "@/components/Link";
import { useSyncExternalStore } from "react";
import { missingJob } from "@/lib/jobs/closed-job";

const noop = () => () => {};

export { missingJob };

/**
 * Fallback on the generic 404 page (GitHub Pages and other static hosts that
 * do not run the Cloudflare Worker). Cloudflare and `preview:static` serve a
 * dedicated 410 page instead. Static HTML shows nothing here.
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
      <h2 className="text-xl font-semibold text-text">This role has closed</h2>
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
        {name ? (
          <li>
            <Link prefetch={false} href={`/companies/${hit.org}/`} className="btn btn-secondary">
              About {name}
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
        <li>
          <Link prefetch={false} href="/jobs/fellowships/" className="btn btn-secondary">
            Fellowships and postdocs
          </Link>
        </li>
      </ul>
    </div>
  );
}
