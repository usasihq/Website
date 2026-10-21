import Link from "@/components/Link";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { landingPageHref, pageWindow, type DirectoryLink } from "@/lib/jobs/pagination";
import { LISTINGS_SHOWN } from "@/lib/jobs/landing";

const n = (v: number) => v.toLocaleString("en-US");

function PaginationNav({ current, count }: { current: number; count: number }) {
  if (count <= 1) return null;
  const prev = current > 1 ? landingPageHref("/jobs/", current - 1) : null;
  const next = current < count ? landingPageHref("/jobs/", current + 1) : null;
  return (
    <nav aria-label="Listing pages" className="mt-6 flex flex-wrap items-center justify-center gap-2" data-testid="jobs-directory-pagination">
      {prev ? (
        <Link prefetch={false} href={prev} rel="prev" className="btn btn-secondary">
          Previous
        </Link>
      ) : (
        <span className="btn btn-inactive" aria-disabled="true">Previous</span>
      )}
      {pageWindow(current, count).map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            prefetch={false}
            href={landingPageHref("/jobs/", item)}
            aria-current={item === current ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm ${item === current ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-cyan"}`}
          >
            {item}
          </Link>
        ),
      )}
      {next ? (
        <Link prefetch={false} href={next} rel="next" className="btn btn-secondary">
          Next
        </Link>
      ) : (
        <span className="btn btn-inactive" aria-disabled="true">Next</span>
      )}
    </nav>
  );
}

export function JobsDirectoryList({
  links,
  page,
  pageCount,
  total,
}: {
  links: DirectoryLink[];
  page: number;
  pageCount: number;
  total: number;
}) {
  const from = (page - 1) * LISTINGS_SHOWN + (links.length ? 1 : 0);
  const to = (page - 1) * LISTINGS_SHOWN + links.length;
  return (
    <>
      <PageHeader
        eyebrow="The USASI catalog"
        title={page <= 1 ? "Jobs at U.S. AI companies and labs" : `Jobs at U.S. AI companies and labs · page ${page}`}
        crumbs={[{ href: "/jobs/", label: "Jobs" }, ...(page > 1 ? [{ href: landingPageHref("/jobs/", page), label: `Page ${page}` }] : [])]}
        description={
          <p>
            Listings {n(from)}–{n(to)} of {n(total)} current openings, most recently published first. Each title opens the listing’s page.
          </p>
        }
      />
      <div className="container-page py-8">
        <ul className="grid gap-2 md:grid-cols-2" data-testid="jobs-directory-links">
          {links.map((j) => (
            <li key={j.id}>
              <a href={j.href} className="link text-[0.9375rem]">
                {j.title}
                <span className="text-muted"> at {j.organization_name}</span>
              </a>
            </li>
          ))}
        </ul>
        <PaginationNav current={page} count={pageCount} />
        <p className="mt-6">
          <Link prefetch={false} href="/jobs/" className="link">
            Search and filter in the Jobs directory
          </Link>
        </p>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
