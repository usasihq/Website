import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PolicyTracker } from "@/components/PolicyTracker";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "U.S. AI policy tracker",
  description:
    "Federal laws, executive orders, OMB memoranda, standards, and frameworks on artificial intelligence, with dates, issuers, current status, and links to the official text.",
  path: "/policy/",
});

export default function PolicyPage() {
  const docs = getCatalog().policy;
  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="U.S. AI policy tracker"
        description={
          <p>
            Federal laws, executive orders, memoranda, standards, and frameworks on AI, newest first. Each entry says what the document does in its own terms,
            when it was issued, and whether an official source shows it was later revoked or replaced, with a link to the official text.
          </p>
        }
      />
      <div className="container-page grid gap-8 py-10">
        <p className="max-w-3xl rounded-xl border border-line bg-elev/50 p-4 text-sm text-muted">
          Summaries describe what each document says, not whether it is good policy, and they are not legal advice. Status comes from official sources read on
          the date shown. To check a document yourself, see{" "}
          <Link href="/learn/policy-and-standards-sources/" className="link">
            finding AI policy and standards sources
          </Link>
          .
        </p>
        {docs.length ? <PolicyTracker docs={docs} /> : <p className="text-muted">No policy documents are published yet.</p>}
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
