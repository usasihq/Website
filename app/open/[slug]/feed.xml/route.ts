import { getCatalog } from "@/lib/catalog";
import { artifactHref } from "@/lib/routes";
import { newsRssItems, rssDocument, rssResponse } from "@/lib/rss";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().artifacts.map((a) => ({ slug: a.slug }));
}

/** News items that mention one open model or tool. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const a = catalog.artifact(slug)!;
  return rssResponse(
    rssDocument({
      title: `${a.name} — USASI news`,
      path: artifactHref(slug),
      selfPath: `${artifactHref(slug)}feed.xml`,
      description: `Dated, sourced news items in the USASI catalog that mention ${a.name}.`,
      items: newsRssItems(catalog.newsForArtifact(slug)),
    }),
  );
}
