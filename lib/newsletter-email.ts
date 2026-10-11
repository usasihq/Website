/**
 * Email HTML for a weekly issue, built from the same content file the site
 * archives, so the archive and what subscribers received cannot drift apart.
 * Styles are inline because mail clients ignore stylesheets; the result goes
 * into a single HTML snippet block in the email provider's editor.
 */
import { inlineToEmailHtml } from "./inline-text";
import type { NewsletterIssue } from "./schema";

const STYLE = {
  wrapper: "font-family:Inter,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#374151",
  p: "margin:0 0 14px",
  h2: "margin:28px 0 10px;font-size:21px;line-height:1.3;font-weight:700;color:#111827",
  ul: "margin:0 0 14px;padding-left:22px",
  li: "margin:0 0 8px",
  link: "color:#1d4ed8",
  bold: "color:#111827",
};

export function issueEmailHtml(issue: NewsletterIssue, resolve: (href: string) => string): string {
  const line = (text: string) => inlineToEmailHtml(text, resolve, { link: STYLE.link, bold: STYLE.bold });
  const p = (text: string) => `<p style="${STYLE.p}">${line(text)}</p>`;
  const parts = [
    ...issue.intro.map(p),
    ...issue.sections.map((s) =>
      [
        `<h2 style="${STYLE.h2}">${line(s.heading)}</h2>`,
        s.intro ? p(s.intro) : "",
        s.items.length ? `<ul style="${STYLE.ul}">${s.items.map((t) => `<li style="${STYLE.li}">${line(t)}</li>`).join("")}</ul>` : "",
        s.note ? p(s.note) : "",
      ].join(""),
    ),
    ...issue.closing.map(p),
  ];
  // The provider drops whitespace-only gaps between tags, so keep those spaces as &nbsp;.
  return `<div style="${STYLE.wrapper}">${parts.join("")}</div>`.replace(/(<\/(?:strong|a)>) (<(?:strong|a)\b)/g, "$1&nbsp;$2");
}
