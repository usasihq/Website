import { getCatalog } from "@/lib/catalog";
import { renderLlmsTxt } from "@/lib/llms-txt";

export const dynamic = "force-static";

/** Agent-facing map of the catalog (https://llmstxt.org). */
export function GET() {
  return new Response(renderLlmsTxt(getCatalog()), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
