import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialPage } from "@/components/EditorialPage";
import { formatDate } from "@/lib/dates";
import { EXPLAINERS, explainer } from "@/lib/learn";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";
import { siteConfig } from "@/lib/site-config";
import { EXPLAINER_CONTENT } from "../content";

export function generateStaticParams() {
  return EXPLAINERS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const e = explainer((await params).slug);
  return pageMetadata({ title: e?.title ?? "Explainer", description: e?.question ?? "", path: `/learn/${(await params).slug}/` });
}

export default async function ExplainerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = explainer(slug);
  const Content = EXPLAINER_CONTENT[slug];
  if (!e || !Content) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.title,
    description: e.question,
    dateModified: e.reviewed,
    url: absoluteUrl(`/learn/${slug}/`),
    author: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    isAccessibleForFree: true,
  };
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <EditorialPage
      eyebrow="Explainer"
      title={e.title}
      crumbs={[{ href: "/learn/", label: "Learn" }, { href: `/learn/${slug}/`, label: e.title }]}
      description={
        <>
          <p>{e.question}</p>
          <p className="mt-2 text-sm">
            Reviewed {formatDate(e.reviewed)}. General information, not legal or professional advice. <Link href="/learn/" className="link">All explainers</Link>
          </p>
        </>
      }
    >
      <Content />
    </EditorialPage>
    </>
  );
}
