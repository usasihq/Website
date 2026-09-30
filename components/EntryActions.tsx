import Link from "next/link";
import { FilePen, MessageSquareWarning } from "lucide-react";
import { editUrl, issueUrl } from "@/lib/paths";

/**
 * "Report a correction" and "Edit this entry". Real repository links when a
 * repository is configured in lib/site-config.ts; otherwise an honest note and
 * no fake links.
 */
export function EntryActions({ contentPath, title }: { contentPath: string; title: string }) {
  const edit = editUrl(contentPath);
  const report = issueUrl("correction.yml", `Correction: ${title}`, { entry: contentPath });

  if (!edit || !report) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong p-4 text-[0.9375rem] text-muted" data-testid="entry-actions-unconfigured">
        <p>
          <strong className="font-semibold text-text">Corrections and edits:</strong> the public source repository for this catalog has not
          been configured yet, so online correction and edit links are not available. The entry file is{" "}
          <code className="font-mono text-[0.8125rem] text-ice">{contentPath}</code>.{" "}
          <Link href="/contribute/" className="link">
            How contributions work
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a href={report} className="btn btn-secondary" rel="noopener noreferrer">
        <MessageSquareWarning aria-hidden="true" className="h-4 w-4" />
        Report a correction
        <span className="sr-only"> (opens GitHub)</span>
      </a>
      <a href={edit} className="btn btn-secondary" rel="noopener noreferrer">
        <FilePen aria-hidden="true" className="h-4 w-4" />
        Edit this entry
        <span className="sr-only"> (opens GitHub)</span>
      </a>
    </div>
  );
}
