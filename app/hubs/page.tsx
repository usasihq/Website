import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Hubs",
  description: "Sourced introductions to parts of the American AI landscape, each with a reading path into the catalog and its primary documents.",
  path: "/hubs/",
});

export default function HubsPage() {
  const hubs = getCatalog().hubs;
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Hubs"
        description={
          <p>
            Short, sourced introductions to parts of the landscape. Each hub says what it covers and what it does not, suggests a reading path,
            and links to records and primary documents. Featured records are examples, not rankings.
          </p>
        }
      />
      <div className="container-page py-10">
        {hubs.length === 0 ? (
          <p className="text-muted">No hubs are published yet.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {hubs.map((h) => (
              <li key={h.slug}>
                <Link prefetch={false} href={`/hubs/${h.slug}/`} className="card flex h-full flex-col p-5 hover:border-cyan">
                  <span className="text-lg font-semibold text-text">{h.title}</span>
                  <span className="mt-2 text-[0.9375rem] text-muted">{h.summary}</span>
                  <span className="meta mt-3">Reviewed {formatDate(h.last_reviewed)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
