import Link from "@/components/Link";
import { rankBadgeAlt, rankBadgePath, rankBadgeSnippets, RANK_BADGE_HEIGHT } from "@/lib/badges";
import { absoluteUrl, asset } from "@/lib/paths";
import { CopyButton } from "./CopyButton";

/**
 * Preview + copy-paste snippets so a maintainer can put their USASI rank on a
 * README. The image is the build-time SVG at a stable /badges/… URL; the
 * snippets always link back to this page.
 */
export function RankBadgeBox({
  kind,
  slug,
  rank,
  pagePath,
}: {
  kind: "github" | "huggingface";
  slug: string;
  rank: number;
  pagePath: string;
}) {
  const badgePath = rankBadgePath(kind, slug);
  const alt = rankBadgeAlt(kind, rank);
  const snippets = rankBadgeSnippets(absoluteUrl(pagePath), absoluteUrl(badgePath), kind, rank);
  const where = kind === "github" ? "AI on GitHub" : "AI on Hugging Face";
  return (
    <section aria-labelledby="rank-badge-heading" className="grid gap-4 rounded-2xl border border-line bg-surface/50 p-5 print:hidden" data-testid="rank-badge">
      <h2 id="rank-badge-heading" className="text-xl font-semibold text-text">
        Add this badge to your README
      </h2>
      <p className="text-[0.9375rem] text-muted">
        <img src={asset(badgePath)} alt={alt} height={RANK_BADGE_HEIGHT} className="mr-2 inline-block align-middle" />
        Shows this {kind === "github" ? "repository’s" : "model’s"} rank in {where} and links back to this
        page. Ranks are by {kind === "github" ? "stars" : "likes"} and change when the list is refreshed. The badge is
        not an endorsement or a rating.{" "}
        <Link prefetch={false} href="/badges/" className="link">
          About the badges
        </Link>
      </p>
      <SnippetBlock label="Markdown (for a README)" text={snippets.markdown} />
      <SnippetBlock label="HTML" text={snippets.html} />
    </section>
  );
}

function SnippetBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        <CopyButton text={text} label={`Copy ${label.split(" ")[0]}`} />
      </div>
      <pre tabIndex={0} className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-[var(--field-bg)] p-3 font-mono text-[0.8125rem] text-ice">
        {text}
      </pre>
    </div>
  );
}
