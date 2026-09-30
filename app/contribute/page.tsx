import Content from "@/content/pages/contribute.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { ExternalLink } from "@/components/ExternalLink";
import { pageMetadata } from "@/lib/metadata";
import { issueUrl, repositoryUrl } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Contribute",
  description: "How to report corrections, suggest entries, and edit the USASI catalog: YAML records, evidence requirements, eligibility review, validation, and pull requests.",
  path: "/contribute/",
});

function RepositoryStatus() {
  const repo = repositoryUrl();
  const correction = issueUrl("correction.yml", "Correction: ");
  const entry = issueUrl("new-entry.yml", "Entry request: ");
  if (!repo || !correction || !entry) {
    return (
      <div className="mb-10 max-w-3xl rounded-xl border border-dashed border-line-strong p-5 font-sans text-[0.9375rem] text-muted" data-testid="repo-unconfigured">
        <p>
          <strong className="font-semibold text-text">Repository not yet published.</strong> The public repository for this catalog has not been
          configured, so there are no live links for issues or pull requests yet. The workflow below is what will apply once it is.
        </p>
      </div>
    );
  }
  return (
    <ul className="mb-10 flex max-w-3xl flex-wrap gap-x-6 gap-y-2 font-sans text-[0.9375rem]">
      <li>
        <ExternalLink href={repo}>Source repository</ExternalLink>
      </li>
      <li>
        <ExternalLink href={correction}>Report a correction</ExternalLink>
      </li>
      <li>
        <ExternalLink href={entry}>Request an entry</ExternalLink>
      </li>
    </ul>
  );
}

export default function ContributePage() {
  return (
    <EditorialPage eyebrow="Contribute" title="Contribute" serif={false} description={<p>Corrections, new entries, and changes to the rules — all in the open.</p>}>
      <RepositoryStatus />
      <Content />
    </EditorialPage>
  );
}
