/**
 * Share links and citations for public pages. Share links are ordinary links
 * to each service's own share page: nothing is loaded from those services
 * unless a reader follows one, and only the page's address and title are
 * passed along.
 */
export type ShareLink = { id: string; label: string; href: string };

const enc = encodeURIComponent;

export function shareLinks(url: string, title: string): ShareLink[] {
  return [
    { id: "x", label: "X", href: `https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { id: "bluesky", label: "Bluesky", href: `https://bsky.app/intent/compose?text=${enc(`${title} ${url}`)}` },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { id: "reddit", label: "Reddit", href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}` },
    { id: "hacker-news", label: "Hacker News", href: `https://news.ycombinator.com/submitlink?u=${enc(url)}&t=${enc(title)}` },
    { id: "email", label: "Email", href: `mailto:?subject=${enc(title)}&body=${enc(url)}` },
  ];
}

export const CITATION_AUTHOR = "USASI";
export const CITATION_SITE = "United States of America Superintelligence";

/** Escapes BibTeX special characters in a field value. */
export function bibtexEscape(value: string): string {
  const map: Record<string, string> = { "\\": "\\textbackslash{}", "~": "\\textasciitilde{}", "^": "\\textasciicircum{}" };
  return value.replace(/[\\~^&%$#_{}]/g, (c) => map[c] ?? `\\${c}`);
}

const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * APA-style and BibTeX citations. `date` is the page's own last-updated or
 * published date (YYYY-MM-DD), never the build date.
 */
export function citations({ title, url, date, key }: { title: string; url: string; date: string; key: string }): { apa: string; bibtex: string } {
  const [y, m, d] = date.split("-");
  const apaDate = [y, m ? `${FULL_MONTHS[Number(m) - 1]}${d ? ` ${Number(d)}` : ""}` : ""].filter(Boolean).join(", ");
  const apa = `${CITATION_AUTHOR}. (${apaDate}). ${title}. ${CITATION_SITE}. ${url}`;
  const bibtex = [
    `@misc{usasi_${key.replace(/[^a-z0-9]+/gi, "_")},`,
    `  author = {{${CITATION_AUTHOR}}},`,
    `  title = {${bibtexEscape(title)}},`,
    `  year = {${y}},`,
    ...(m ? [`  month = ${MONTHS[Number(m) - 1]},`] : []),
    `  howpublished = {\\url{${url}}},`,
    `  note = {${CITATION_SITE}. Last updated ${date}}`,
    `}`,
  ].join("\n");
  return { apa, bibtex };
}

/** Markdown and HTML snippets for a badge image that links to a page. */
export function badgeSnippets(recordUrl: string, badgeUrl: string, alt = "Listed in the USASI catalog"): { markdown: string; html: string } {
  return {
    markdown: `[![${alt}](${badgeUrl})](${recordUrl})`,
    html: `<a href="${recordUrl}"><img src="${badgeUrl}" alt="${alt}" height="20"></a>`,
  };
}
