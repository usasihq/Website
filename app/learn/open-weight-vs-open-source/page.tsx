import Content from "@/content/pages/learn-open-weight.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "What open weight and open source actually mean",
  description:
    "If you can download a model, what are you allowed to do with it? Availability versus permission, components and their licenses, and real catalog examples.",
  path: "/learn/open-weight-vs-open-source/",
});

export default function OpenWeightExplainerPage() {
  return (
    <EditorialPage
      eyebrow="Explainer"
      title="What open weight and open source actually mean"
      description={<p>If you can download a model, what are you allowed to do with it?</p>}
    >
      <Content />
    </EditorialPage>
  );
}
