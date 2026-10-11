import { getCatalog } from "@/lib/catalog";
import { newsRssItems, rssDocument, rssResponse } from "@/lib/rss";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().hubs.map((h) => ({ slug: h.slug }));
}

/** News items about the organizations and records a hub features. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const hub = catalog.hub(slug)!;
  const orgs = new Set(hub.organizations);
  const arts = new Set(hub.artifacts);
  const items = catalog.news.filter((n) => n.related_organizations.some((s) => orgs.has(s)) || n.related_artifacts.some((s) => arts.has(s)));
  return rssResponse(
    rssDocument({
      title: `${hub.title} — USASI news`,
      path: `/hubs/${slug}/`,
      selfPath: `/hubs/${slug}/feed.xml`,
      description: `Dated, sourced news items about the organizations and records featured in the USASI ${hub.title} hub.`,
      items: newsRssItems(items),
    }),
  );
}
