import Link from "@/components/Link";
import { PROFILE_BADGE_ALT, PROFILE_BADGE_PATH, RANK_BADGE_HEIGHT } from "@/lib/badges";
import { absoluteUrl, asset } from "@/lib/paths";
import { badgeSnippets } from "@/lib/share";
import { CopyButton } from "./CopyButton";

/**
 * "Is this you?" box on People pages: how to correct the profile, and a
 * copy-paste badge that links back to it from a personal site or GitHub README.
 */
export function PersonClaimBox({ name, pagePath }: { name: string; pagePath: string }) {
  const snippets = badgeSnippets(absoluteUrl(pagePath), absoluteUrl(PROFILE_BADGE_PATH), `${name} — ${PROFILE_BADGE_ALT}`);
  return (
    <section aria-labelledby="claim-h" className="grid gap-4 rounded-2xl border border-line bg-surface/50 p-5 print:hidden" data-testid="person-claim">
      <h2 id="claim-h" className="text-xl font-semibold text-text">
        Is this you?
      </h2>
      <p className="max-w-3xl text-[0.9375rem] text-body">
        Profiles cover public professional work only, and every line cites a source. If something is out of date, missing or wrong, send a
        correction with a link to an official page and we will update it.{" "}
        <Link prefetch={false} href="/contribute/#corrections" className="link">
          Suggest a correction
        </Link>
      </p>
      <p className="text-[0.9375rem] text-muted">
        <img src={asset(PROFILE_BADGE_PATH)} alt={PROFILE_BADGE_ALT} height={RANK_BADGE_HEIGHT} className="mr-2 inline-block align-middle" />
        Add this badge to your website or GitHub profile README. It links back to this page. It is not an endorsement or a rating.
      </p>
      <Snippet label="Markdown (for a README)" text={snippets.markdown} />
      <Snippet label="HTML" text={snippets.html} />
    </section>
  );
}

function Snippet({ label, text }: { label: string; text: string }) {
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
