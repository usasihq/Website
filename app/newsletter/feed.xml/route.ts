import { getCatalog } from "@/lib/catalog";
import { inlinePlain } from "@/lib/inline-text";
import { rssDocument, rssResponse } from "@/lib/rss";

export const dynamic = "force-static";

/** Sent issues of the weekly email, as archived on the site. */
export function GET() {
  return rssResponse(
    rssDocument({
      title: "The USASI weekly",
      path: "/newsletter/",
      selfPath: "/newsletter/feed.xml",
      description: "Each issue of the USASI weekly email, archived on the site as it was sent.",
      items: getCatalog().newsletter.map((n) => ({
        title: n.subject,
        path: `/newsletter/${n.slug}/`,
        date: n.sent_at,
        description: [n.preview, ...n.sections.map((s) => `${s.heading}: ${s.items.map(inlinePlain).join(" ")}`)].join(" ").slice(0, 2000),
      })),
    }),
  );
}
