/**
 * A deliberately tiny inline markup for weekly email issues: **bold** and
 * [label](href) links, where href is a site path beginning with / or an https
 * URL. Anything else is plain text. Used to render issues on the site and to
 * produce the email HTML from the same source.
 */
export type InlineToken =
  | { type: "text"; text: string }
  | { type: "bold"; children: InlineToken[] }
  | { type: "link"; href: string; children: InlineToken[] };

export function parseInline(input: string): InlineToken[] {
  const out: InlineToken[] = [];
  let text = "";
  const flush = () => {
    if (text) out.push({ type: "text", text });
    text = "";
  };
  let i = 0;
  while (i < input.length) {
    if (input.startsWith("**", i)) {
      const end = input.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ type: "bold", children: parseInline(input.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (input[i] === "[") {
      const mid = input.indexOf("](", i + 1);
      const end = mid === -1 ? -1 : input.indexOf(")", mid + 2);
      if (mid > i + 1 && end > mid + 2 && !input.slice(i + 1, mid).includes("[")) {
        flush();
        out.push({ type: "link", href: input.slice(mid + 2, end), children: parseInline(input.slice(i + 1, mid)) });
        i = end + 1;
        continue;
      }
    }
    text += input[i];
    i += 1;
  }
  flush();
  return out;
}

/** Every link target in a line, in order. */
export function inlineLinks(input: string): string[] {
  const walk = (tokens: InlineToken[]): string[] => tokens.flatMap((t) => (t.type === "link" ? [t.href, ...walk(t.children)] : t.type === "bold" ? walk(t.children) : []));
  return walk(parseInline(input));
}

/** The line as plain text, without markup. */
export function inlinePlain(input: string): string {
  const walk = (tokens: InlineToken[]): string => tokens.map((t) => (t.type === "text" ? t.text : walk(t.children))).join("");
  return walk(parseInline(input));
}

/** A link target is allowed if it is a site path or an https URL. */
export function isAllowedHref(href: string): boolean {
  if (href.startsWith("/")) return !href.startsWith("//");
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Email HTML for one line, with links resolved to absolute URLs and inline styles for mail clients. */
export function inlineToEmailHtml(input: string, resolve: (href: string) => string, styles: { link: string; bold: string }): string {
  const walk = (tokens: InlineToken[]): string =>
    tokens
      .map((t) => {
        if (t.type === "text") return escapeHtml(t.text);
        if (t.type === "bold") return `<strong style="${styles.bold}">${walk(t.children)}</strong>`;
        return `<a style="${styles.link}" href="${escapeHtml(resolve(t.href))}">${walk(t.children)}</a>`;
      })
      .join("");
  return walk(parseInline(input));
}
