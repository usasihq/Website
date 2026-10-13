import { JsonLd } from "@/components/JsonLd";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import type { ReportSnapshot } from "@/lib/report";
import { latestEdition, policyLink, previousEdition, reportLinks, sinceEdition } from "@/lib/report-editions";
import { reportJsonLd, reportNames } from "@/lib/report-page";
import { editionSummary, ReportEdition } from "./ReportEdition";

/** An edition as a page: /report/ (the latest) or its permanent /report/<YYYY-MM>/. */
export function ReportPage({ snapshot, onLatestPage }: { snapshot: ReportSnapshot; onLatestPage: boolean }) {
  const catalog = getCatalog();
  return (
    <>
      <JsonLd data={reportJsonLd(snapshot, onLatestPage, editionSummary(snapshot))} />
      <ReportEdition
        snapshot={snapshot}
        previous={previousEdition(snapshot.edition)}
        latest={latestEdition()!}
        since={sinceEdition(snapshot, catalog)}
        hrefFor={reportLinks(catalog)}
        policyHrefFor={(slug) => policyLink(catalog, slug)}
        names={reportNames(catalog)}
        onLatestPage={onLatestPage}
      />
      <SupportPanel variant="compact" />
    </>
  );
}
