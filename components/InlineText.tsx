import Link from "@/components/Link";
import { parseInline, type InlineToken } from "@/lib/inline-text";
import { ExternalLink } from "./ExternalLink";

/** Renders the **bold** / [label](href) markup used by weekly email issues. */
export function InlineText({ text }: { text: string }) {
  return <>{render(parseInline(text))}</>;
}

function render(tokens: InlineToken[]): React.ReactNode[] {
  return tokens.map((t, i) => {
    if (t.type === "text") return t.text;
    if (t.type === "bold") return <strong key={i} className="font-semibold text-text">{render(t.children)}</strong>;
    if (t.href.startsWith("/")) {
      return (
        <Link key={i} prefetch={false} href={t.href} className="link">
          {render(t.children)}
        </Link>
      );
    }
    return (
      <ExternalLink key={i} href={t.href}>
        {render(t.children)}
      </ExternalLink>
    );
  });
}
