import Content from "@/content/pages/about.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About",
  description: "What USASI is: an independent, evidence-first catalog of U.S. AI organizations and U.S.-led open artifacts, kept as two equal directories.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <EditorialPage eyebrow="About" title="About USASI" description={<p>Purpose, independence, approach, and licenses.</p>}>
      <Content />
    </EditorialPage>
  );
}
