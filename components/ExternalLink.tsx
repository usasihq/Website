import { ArrowUpRight } from "lucide-react";

/**
 * Outbound link to an official or third-party source. Visually distinct from
 * internal navigation (arrow icon) and announced as external. Opens in the
 * same tab; `noreferrer` keeps the referring page URL from being sent.
 */
export function ExternalLink({
  href,
  children,
  className = "link",
  showHost = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  showHost?: boolean;
}) {
  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    /* validated upstream */
  }
  return (
    <a href={href} className={`${className} inline-flex items-baseline gap-0.5 break-words`} rel="noopener noreferrer" data-external="true">
      <span>
        {children}
        {showHost && host ? <span className="text-muted"> · {host}</span> : null}
      </span>
      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 translate-y-[1px] self-center opacity-70" />
      <span className="sr-only"> (external site{host && !showHost ? `: ${host}` : ""})</span>
    </a>
  );
}
