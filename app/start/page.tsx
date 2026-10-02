import Content from "@/content/pages/start.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Start here",
  description:
    "How to use USASI: understand a term, find a model or tool you can use, understand an organization, or check a claim against its source.",
  path: "/start/",
});

export default function StartPage() {
  return (
    <EditorialPage eyebrow="Start here" title="How to use this reference" description={<p>Four short paths into the catalog, and a checklist for any model or tool.</p>}>
      <Content />
    </EditorialPage>
  );
}
