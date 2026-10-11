import Content from "@/content/pages/badges.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Badges for listed projects",
  description: "A small “Listed in USASI” badge that maintainers can add to a README or website, linking to the project's sourced catalog entry.",
  path: "/badges/",
});

export default function BadgesPage() {
  return (
    <EditorialPage
      eyebrow="For maintainers"
      title="Badges for listed projects"
      description={<p>A small badge that links your README or website to your project&rsquo;s entry in the catalog.</p>}
      headerExtra={
        <p className="mt-6">
          <img src={asset("/badges/listed.svg")} alt="Listed in the USASI catalog" width={96} height={20} />
        </p>
      }
    >
      <Content />
    </EditorialPage>
  );
}
