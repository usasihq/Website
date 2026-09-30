import { getCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/paths";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`).toUTCString();

/** RSS 2.0 feed of published news items, generated as a static file at build time. */
export function GET() {
  const catalog = getCatalog();
  const items = catalog.news
    .slice(0, 50)
    .map((n) => {
      const url = absoluteUrl(`/news/${n.slug}/`);
      return `    <item>
      <title>${escape(n.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(n.published_at)}</pubDate>
      <category>${escape(n.category)}</category>
      <description>${escape(n.summary.text)}</description>
    </item>`;
    })
    .join("\n");
  const latest = catalog.news[0]?.published_at;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${siteConfig.shortName} — Latest news`)}</title>
    <link>${absoluteUrl("/news/")}</link>
    <atom:link href="${absoluteUrl("/news/feed.xml")}" rel="self" type="application/rss+xml"/>
    <description>${escape("Dated, sourced updates about the U.S. AI organizations and open artifacts in the USASI catalog. Independent project. Not a United States government website.")}</description>
    <language>en-us</language>${latest ? `\n    <lastBuildDate>${rfc822(latest)}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
