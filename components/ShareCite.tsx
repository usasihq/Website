import Link from "next/link";
import { Rss, Share2 } from "lucide-react";
import { absoluteUrl, asset } from "@/lib/paths";
import { badgeSnippets, citations, shareLinks } from "@/lib/share";
import { CopyButton } from "./CopyButton";

/**
 * Share links, citations, and (for catalog records) the maintainer badge.
 * Share links are ordinary links to each service's share page; nothing is
 * loaded from those services unless a reader follows one.
 */
export function ShareCite({
  path,
  title,
  date,
  citeKey,
  badge = false,
  feed,
}: {
  path: string;
  title: string;
  /** The page's own published or last-updated date (YYYY-MM-DD). */
  date: string;
  citeKey: string;
  badge?: boolean;
  /** Site path of an RSS feed of updates about this page's subject. */
  feed?: string;
}) {
  const url = absoluteUrl(path);
  const cite = citations({ title, url, date, key: citeKey });
  const snippets = badgeSnippets(url, absoluteUrl("/badges/listed.svg"));
  const pill = "inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm text-text hover:border-cyan";
  return (
    <section aria-labelledby="share-heading" className="grid gap-4 rounded-2xl border border-line bg-[rgba(8,14,30,0.5)] p-5" data-testid="share-cite">
      <h2 id="share-heading" className="flex items-center gap-2 text-base font-semibold text-text">
        <Share2 aria-hidden="true" className="h-4 w-4 text-cyan" />
        Share or cite this page
      </h2>
      <ul className="flex flex-wrap gap-2" aria-label="Share this page">
        {shareLinks(url, title).map((s) => (
          <li key={s.id}>
            <a href={s.href} className={pill} rel="noopener noreferrer">
              {s.label}
              <span className="sr-only">{s.id === "email" ? " (opens your email app)" : ` (opens ${s.label})`}</span>
            </a>
          </li>
        ))}
        <li>
          <CopyButton text={url} label="Copy link" />
        </li>
        {feed ? (
          <li>
            <a href={asset(feed)} className={pill} type="application/rss+xml">
              <Rss aria-hidden="true" className="mr-1.5 h-4 w-4 text-cyan" />
              RSS updates
            </a>
          </li>
        ) : null}
      </ul>
      <details className="group">
        <summary className="cursor-pointer text-[0.9375rem] text-ice hover:text-white">Cite this page</summary>
        <div className="mt-3 grid gap-3">
          <CitationBlock label="APA style" text={cite.apa} />
          <CitationBlock label="BibTeX" text={cite.bibtex} />
          <p className="text-sm text-muted">
            The date is when this page was last updated. Add the date you read it if your style needs one.
          </p>
        </div>
      </details>
      {badge ? (
        <details>
          <summary className="cursor-pointer text-[0.9375rem] text-ice hover:text-white">For maintainers: a &ldquo;Listed in USASI&rdquo; badge</summary>
          <div className="mt-3 grid gap-3">
            <p className="text-[0.9375rem] text-muted">
              <img src={asset("/badges/listed.svg")} alt="Listed in the USASI catalog" width={96} height={20} className="mr-2 inline-block align-middle" />
              Links to this page. It says the entry is listed, not endorsed or rated.{" "}
              <Link prefetch={false} href="/badges/" className="link">
                About the badge
              </Link>
            </p>
            <CitationBlock label="Markdown (for a README)" text={snippets.markdown} />
            <CitationBlock label="HTML" text={snippets.html} />
          </div>
        </details>
      ) : null}
    </section>
  );
}

function CitationBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        <CopyButton text={text} label={`Copy ${label.split(" ")[0]}`} />
      </div>
      <pre tabIndex={0} className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-[rgba(5,8,22,0.8)] p-3 font-mono text-[0.8125rem] text-ice">
        {text}
      </pre>
    </div>
  );
}
