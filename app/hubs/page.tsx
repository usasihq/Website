import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HubIcon } from "@/components/learn/HubIcon";
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
                <Link prefetch={false} href={`/hubs/${h.slug}/`} className="card card-link group flex h-full gap-4 p-5">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-line-strong bg-elev text-cyan">
                    <HubIcon slug={h.slug} className="h-5 w-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-lg font-semibold text-text group-hover:text-white">{h.title}</span>
                    <span className="mt-2 text-[0.9375rem] text-muted">{h.summary}</span>
                    <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-sm text-muted">
                      <span>
                        {h.organizations.length + h.artifacts.length + h.people.length} featured records · {h.reading_path.length} reading steps
                      </span>
                      <span className="meta inline-flex items-center gap-1">
                        Reviewed {formatDate(h.last_reviewed)}
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-cyan transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </span>
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
