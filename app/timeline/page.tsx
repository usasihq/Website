import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { groupTimeline, timelineEvents } from "@/lib/timeline";

export const metadata = pageMetadata({
  title: "Timeline",
  description: "Open releases and news events in the USASI catalog, by documented date. A navigation aid, not a ranking of importance.",
  path: "/timeline/",
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function TimelinePage() {
  const events = timelineEvents(getCatalog());
  const groups = groupTimeline(events);
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Timeline"
        description={
          <p>
            Open releases and news events from this catalog, newest first, using the dates documented on each record. Dates appear at the precision
            the sources give. This is a way to find records, not a ranking of importance, and it covers only what the catalog includes. Each entry
            links to the record or news item that cites its sources.
          </p>
        }
      />
      <div className="container-page py-10">
        <nav aria-label="Years" className="mb-8 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.year} href={`#y${g.year}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-3.5 text-[0.9375rem] hover:border-cyan">
              {g.year}
            </a>
          ))}
        </nav>
        <div className="grid gap-10">
          {groups.map((g) => (
            <section key={g.year} id={`y${g.year}`} aria-labelledby={`h${g.year}`} className="scroll-mt-28">
              <h2 id={`h${g.year}`} className="text-2xl font-semibold text-text">{g.year}</h2>
              {g.months.map((m) => (
                <div key={m.month || "year"} className="mt-4">
                  <h3 className="eyebrow">{m.month ? MONTHS[Number(m.month.slice(5, 7)) - 1] : "Date documented to the year only"}</h3>
                  <ul className="mt-2 space-y-2">
                    {m.events.map((e) => (
                      <li key={e.type + e.href} className="grid gap-x-4 sm:grid-cols-[8.5rem_1fr]">
                        <span className="meta pt-0.5">{e.date.length === 10 ? formatDate(e.date) : e.date}</span>
                        <span>
                          <Link prefetch={false} href={e.href} className="link font-medium">{e.title}</Link>
                          <span className="block text-sm text-muted">{e.label}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
