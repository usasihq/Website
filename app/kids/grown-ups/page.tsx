import Content from "@/content/pages/kids-grown-ups.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "For parents and teachers: the kids' lessons",
  description: "How USASI's lessons on AI and super intelligence for kids were made, their sources, ideas for talking together, age rules for apps, and privacy.",
  path: "/kids/grown-ups/",
});

export default function KidsGrownUpsPage() {
  return (
    <EditorialPage
      eyebrow="For parents and teachers"
      title="About the lessons for kids"
      description={<p>How the lessons were made, what they say about super intelligence, and how to use them at home or in class.</p>}
      crumbs={[{ href: "/kids/", label: "For kids" }]}
      current={{ href: "/kids/grown-ups/", label: "For parents and teachers" }}
      support={false}
    >
      <Content />
    </EditorialPage>
  );
}
