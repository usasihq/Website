import { formatDate } from "@/lib/dates";
import type { Source } from "@/lib/schema";
import { ExternalLink } from "./ExternalLink";

export const SOURCE_KIND_LABELS: Record<string, string> = {
  "official-page": "Official page",
  documentation: "Documentation",
  repository: "Repository",
  "model-card": "Model card",
  "dataset-card": "Dataset card",
  license: "License",
  "release-notes": "Release notes",
  announcement: "Announcement",
  paper: "Paper",
  filing: "Filing",
  news: "News report",
  other: "Other",
};

/**
 * Inline citation markers for a claim. Numbers follow the record's source
 * list order and link to the full entry in the Sources section.
 */
export function SourceRefs({ ids, sources, idPrefix = "" }: { ids: string[]; sources: Source[]; idPrefix?: string }) {
  if (ids.length === 0) return null;
  return (
    <span className="ml-1 inline-flex flex-wrap gap-0.5 align-baseline">
      {ids.map((id) => {
        const index = sources.findIndex((s) => s.id === id);
        if (index < 0) return null;
        const source = sources[index];
        return (
          <a
            key={id}
            href={`#src-${idPrefix}${id}`}
            className="inline-flex min-h-6 min-w-6 items-center justify-center rounded border border-line px-1 font-mono text-[0.75rem] leading-none text-ice no-underline hover:border-cyan hover:text-text"
            aria-label={`Source ${index + 1}: ${source.title}`}
          >
            {index + 1}
          </a>
        );
      })}
    </span>
  );
}

export function SourcesList({ sources, idPrefix = "" }: { sources: Source[]; idPrefix?: string }) {
  return (
    <ol className="space-y-3">
      {sources.map((source, i) => (
        <li key={source.id} id={`src-${idPrefix}${source.id}`} className="grid scroll-mt-24 grid-cols-[2rem_1fr] gap-2 target:rounded-md target:bg-[rgba(76,201,255,0.07)]">
          <span className="meta pt-0.5 text-right">{i + 1}.</span>
          <div className="min-w-0">
            <ExternalLink href={source.url}>{source.title}</ExternalLink>
            <p className="meta mt-0.5 text-[0.8125rem]">
              {source.publisher}
              {source.kind ? ` · ${SOURCE_KIND_LABELS[source.kind]}` : ""}
              {source.published_at ? ` · published ${formatDate(source.published_at)}` : ""} · accessed {formatDate(source.accessed_at)}
              {source.fetched_at ? ` · fetched ${formatDate(source.fetched_at)}` : ""}
              {source.reviewed_at ? ` · evidence reviewed ${formatDate(source.reviewed_at)}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
