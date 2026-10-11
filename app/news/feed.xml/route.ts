import { getCatalog } from "@/lib/catalog";
import { newsRssItems, rssDocument, rssResponse } from "@/lib/rss";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

/** RSS feed of published news items. */
export function GET() {
  return rssResponse(
    rssDocument({
      title: `${siteConfig.shortName} — Latest news`,
      path: "/news/",
      selfPath: "/news/feed.xml",
      description: "Dated, sourced updates about the U.S. AI organizations and open artifacts in the USASI catalog.",
      items: newsRssItems(getCatalog().news),
    }),
  );
}
