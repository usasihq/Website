import { getCatalog } from "@/lib/catalog";
import { orgHref } from "@/lib/routes";
import { newsRssItems, rssDocument, rssResponse } from "@/lib/rss";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().organizations.map((o) => ({ slug: o.slug }));
}

/** News items that mention one organization. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const org = catalog.organization(slug)!;
  return rssResponse(
    rssDocument({
      title: `${org.name} — USASI news`,
      path: orgHref(slug),
      selfPath: `${orgHref(slug)}feed.xml`,
      description: `Dated, sourced news items in the USASI catalog that mention ${org.name}.`,
      items: newsRssItems(catalog.newsForOrganization(slug)),
    }),
  );
}
