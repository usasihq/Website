/** RSS 2.0 documents, generated as static files at build time. */
import { absoluteUrl } from "./paths";
import type { NewsItem } from "./schema";

export type RssItem = { title: string; path: string; date: string; category?: string; description: string };

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (isoDate: string) => new Date(`${isoDate.length === 10 ? isoDate : isoDate.slice(0, 10)}T12:00:00Z`).toUTCString();

export const FEED_FOOTER = "Independent project. Not a United States government website.";

export function rssDocument({ title, path, selfPath, description, items }: { title: string; path: string; selfPath: string; description: string; items: RssItem[] }): string {
  const body = items
    .map((i) => {
      const url = absoluteUrl(i.path);
      return `    <item>
      <title>${escape(i.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(i.date)}</pubDate>${i.category ? `\n      <category>${escape(i.category)}</category>` : ""}
      <description>${escape(i.description)}</description>
    </item>`;
    })
    .join("\n");
  const latest = items.map((i) => i.date).sort().at(-1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(title)}</title>
    <link>${absoluteUrl(path)}</link>
    <atom:link href="${absoluteUrl(selfPath)}" rel="self" type="application/rss+xml"/>
    <description>${escape(`${description} ${FEED_FOOTER}`)}</description>
    <language>en-us</language>${latest ? `\n    <lastBuildDate>${rfc822(latest)}</lastBuildDate>` : ""}
${body}
  </channel>
</rss>
`;
}

/** Stable anchor for a changelog entry on /changelog/. */
export const changelogAnchor = (c: { date: string; title: string }) =>
  `c-${c.date}-${c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}`;

export const newsRssItems = (items: NewsItem[]): RssItem[] =>
  items.slice(0, 50).map((n) => ({ title: n.title, path: `/news/${n.slug}/`, date: n.published_at, category: n.category, description: n.summary.text }));

export const rssResponse = (xml: string) => new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
