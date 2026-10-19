import Content from "@/content/pages/badges.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { rankBadgeAlt, rankBadgePath, RANK_BADGE_HEIGHT } from "@/lib/badges";
import { githubEntries } from "@/lib/github/projects";
import { hfModelEntries } from "@/lib/huggingface/items";
import { pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "Badges for maintainers",
  description:
    "Small badges maintainers can add to a README or website: “Listed in USASI” for catalog records, and a rank badge for AI on GitHub projects and Hugging Face models.",
  path: "/badges/",
});

export default function BadgesPage() {
  const github = githubEntries()[0];
  const model = hfModelEntries()[0];
  return (
    <EditorialPage
      eyebrow="For maintainers"
      title="Badges for maintainers"
      description={<p>Small badges that link a README or website to this site: a catalog listing, or a rank on AI on GitHub or AI on Hugging Face.</p>}
      headerExtra={
        <p className="mt-6 flex flex-wrap items-center gap-3">
          <img src={asset("/badges/listed.svg")} alt="Listed in the USASI catalog" width={96} height={20} />
          {github ? <img src={asset(rankBadgePath("github", github.slug))} alt={rankBadgeAlt("github", github.rank)} height={RANK_BADGE_HEIGHT} /> : null}
          {model ? <img src={asset(rankBadgePath("huggingface", model.slug))} alt={rankBadgeAlt("huggingface", model.rank)} height={RANK_BADGE_HEIGHT} /> : null}
        </p>
      }
    >
      <Content />
    </EditorialPage>
  );
}
