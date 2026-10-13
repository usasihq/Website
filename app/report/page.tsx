import { notFound } from "next/navigation";
import { ReportPage } from "@/components/report/ReportPage";
import { latestEdition } from "@/lib/report-editions";
import { reportMetadata } from "@/lib/report-page";

/** The latest edition of The State of American AI; each edition also keeps its own permanent page. */
export function generateMetadata() {
  const latest = latestEdition();
  return latest ? reportMetadata(latest, true) : {};
}

export default function LatestReportPage() {
  const latest = latestEdition();
  if (!latest) notFound();
  return <ReportPage snapshot={latest} onLatestPage />;
}
