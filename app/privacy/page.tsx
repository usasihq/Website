import Content from "@/content/pages/privacy.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy",
  description: "What the USASI static site does with information: no cookies, no analytics or trackers, in-browser search, and how hosting, external links, and tipping work.",
  path: "/privacy/",
});

export default function PrivacyPage() {
  return (
    <EditorialPage eyebrow="Policies" title="Privacy" description={<p>How this static site behaves, in plain terms.</p>}>
      <Content />
    </EditorialPage>
  );
}
