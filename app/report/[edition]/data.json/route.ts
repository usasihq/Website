import { findEdition, reportEditions } from "@/lib/report-editions";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return reportEditions().map((e) => ({ edition: e.edition }));
}

/** The complete edition file, as committed: figures, definitions, findings, record lists, and input digests. CC BY 4.0. */
export async function GET(_request: Request, { params }: { params: Promise<{ edition: string }> }) {
  const s = findEdition((await params).edition);
  if (!s) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(s, null, 2) + "\n", { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
