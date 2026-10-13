import { notFound } from "next/navigation";
import { ReportPage } from "@/components/report/ReportPage";
import { findEdition, reportEditions } from "@/lib/report-editions";
import { reportMetadata } from "@/lib/report-page";

export const dynamicParams = false;

export function generateStaticParams() {
  return reportEditions().map((e) => ({ edition: e.edition }));
}

export async function generateMetadata({ params }: { params: Promise<{ edition: string }> }) {
  const s = findEdition((await params).edition);
  return s ? reportMetadata(s, false) : {};
}

/** One edition at its permanent address, exactly as published. */
export default async function EditionPage({ params }: { params: Promise<{ edition: string }> }) {
  const s = findEdition((await params).edition);
  if (!s) notFound();
  return <ReportPage snapshot={s} onLatestPage={false} />;
}
