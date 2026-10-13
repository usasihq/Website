import { snapshotCsv } from "@/lib/report";
import { findEdition, reportEditions } from "@/lib/report-editions";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return reportEditions().map((e) => ({ edition: e.edition }));
}

/** Every figure of the edition as one tidy CSV table (totals, then one line per table row). CC BY 4.0. */
export async function GET(_request: Request, { params }: { params: Promise<{ edition: string }> }) {
  const s = findEdition((await params).edition);
  if (!s) return new Response("Not found", { status: 404 });
  return new Response(snapshotCsv(s), { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
