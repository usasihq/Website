import Link from "next/link";
import { FilePen, MessageSquareWarning } from "lucide-react";
import { editUrl, issueUrl } from "@/lib/paths";
import { mailtoHref, siteConfig } from "@/lib/site-config";

/**
 * "Report a correction" and "Edit this entry". Real repository links when a
 * repository is configured in lib/site-config.ts; otherwise an honest note and
 * no fake links.
 */
export function EntryActions({ contentPath, title }: { contentPath: string; title: string }) {
  const edit = editUrl(contentPath);
  const report = issueUrl("correction.yml", `Correction: ${title}`, { entry: contentPath });

  if (!edit || !report) {
    const email = siteConfig.contact.email;
    const mail = email
      ? mailtoHref(
          email,
          `Correction: ${title}`,
          `Entry: ${contentPath}\n\nWhat is wrong:\n\nWhat it should say:\n\nSupporting source (URL):\n`,
        )
      : null;
    return (
      <div className="grid gap-3" data-testid="entry-actions-unconfigured">
        {mail ? (
          <div className="flex flex-wrap gap-3">
            <a href={mail} className="btn btn-secondary">
              <MessageSquareWarning aria-hidden="true" className="h-4 w-4" />
              Report a correction
              <span className="sr-only"> (opens your email app)</span>
            </a>
          </div>
        ) : null}
        <p className="text-[0.9375rem] text-muted">
          {mail ? "Corrections are sent by email for now. " : null}
          Online editing through the public source repository is not available yet. The entry file is{" "}
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
