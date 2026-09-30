import Content from "@/content/pages/disclaimer.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description:
    "USASI is an independent project, not a United States government website, not affiliated with listed organizations, and not a safety certification or source of legal, export-control, or investment advice.",
  path: "/disclaimer/",
});

export default function DisclaimerPage() {
  return (
    <EditorialPage eyebrow="Policies" title="Disclaimer" description={<p>Independence, limitations, and what this catalog does not provide.</p>}>
      <Content />
    </EditorialPage>
  );
}
