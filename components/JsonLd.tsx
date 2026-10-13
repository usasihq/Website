import { serializeJsonLd } from "@/lib/structured-data";

/** One JSON-LD block for search engines. Build the data with lib/structured-data.ts. */
export function JsonLd({ data }: { data: object | null | undefined }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
