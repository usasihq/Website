import { getCatalog } from "@/lib/catalog";
import { changelogAnchor, rssDocument, rssResponse } from "@/lib/rss";

export const dynamic = "force-static";

/** Every change to the catalog and site, as listed on the changelog page. */
export function GET() {
  return rssResponse(
    rssDocument({
      title: "USASI — Changelog",
      path: "/changelog/",
      selfPath: "/changelog/feed.xml",
      description: "New records, corrections, and site changes in the USASI catalog.",
      items: getCatalog()
        .changelog.slice(0, 50)
        .map((c) => ({ title: c.title, path: `/changelog/#${changelogAnchor(c)}`, date: c.date, description: c.summary })),
    }),
  );
}
