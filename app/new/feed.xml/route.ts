import { getCatalog } from "@/lib/catalog";
import { NEW_HREF, newFeedItems, newThisWeek } from "@/lib/new-this-week";
import { rssDocument, rssResponse } from "@/lib/rss";

export const dynamic = "force-static";

/** What /new/ lists: catalog additions, news, and items new in the GitHub and Hugging Face rankings in the last seven days. */
export function GET() {
  return rssResponse(
    rssDocument({
      title: "USASI — New this week",
      path: NEW_HREF,
      selfPath: `${NEW_HREF}feed.xml`,
      description:
        "Organizations and open models or tools added to the USASI catalog, news items, and projects, models, and datasets new in the AI on GitHub and AI on Hugging Face rankings, over the last seven days.",
      items: newFeedItems(newThisWeek(getCatalog())),
    }),
  );
}
