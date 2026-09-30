import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { artifactHref, orgHref } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Changelog",
  description: "Substantive changes to the USASI catalog and its policies, with dates. Rebuilds of the site are not recorded as changes.",
  path: "/changelog/",
});

const TYPE_LABELS: Record<string, string> = {
  added: "Added",
  updated: "Updated",
  corrected: "Corrected",
  archived: "Archived",
  removed: "Removed",
  policy: "Policy",
};

export default function ChangelogPage() {
  const catalog = getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Editorial log"
        title="Changelog"
        description={<p>Genuine catalog and policy changes, newest first. Rebuilding the site is not a change and is never recorded here.</p>}
      />
      <div className="container-page py-12">
        {catalog.changelog.length === 0 ? (
          <p className="text-muted">No changes have been recorded yet.</p>
        ) : (
          <ol className="grid max-w-3xl gap-10">
            {catalog.changelog.map((entry) => (
              <li key={`${entry.date}-${entry.title}`} className="border-l border-line-strong pl-6">
                <p className="meta">
                  <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                </p>
                <h2 className="mt-1 text-xl font-semibold text-text">{entry.title}</h2>
                <p className="mt-2 text-[#d5def2]">{entry.summary}</p>
                {entry.changes.length > 0 ? (
                  <ul className="mt-4 grid gap-1.5 text-[0.9375rem] sm:grid-cols-2">
                    {entry.changes.map((c, i) => {
                      const href =
                        c.slug && c.record_type === "organization" && catalog.organization(c.slug)
                          ? orgHref(c.slug)
                          : c.slug && c.record_type === "artifact" && catalog.artifact(c.slug)
                            ? artifactHref(c.slug)
                            : null;
                      const name =
                        (c.slug && c.record_type === "organization" && catalog.organization(c.slug)?.name) ||
                        (c.slug && c.record_type === "artifact" && catalog.artifact(c.slug)?.name) ||
                        c.note;
                      if (!name) return null;
                      return (
                        <li key={i}>
                          <span className="meta mr-2">{TYPE_LABELS[c.type]}</span>
                          {href ? (
                            <Link prefetch={false} href={href} className="link">
                              {name}
                            </Link>
                          ) : (
                            <span>{name}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
