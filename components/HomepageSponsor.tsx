import { ArrowUpRight } from "lucide-react";
import { asset } from "@/lib/paths";
import { siteConfig, type HomepageSponsorConfig } from "@/lib/site-config";

/** Homepage only. No sponsor means no markup, network request, or reserved space. */
export function HomepageSponsor({ config = siteConfig.homepageSponsor }: { config?: HomepageSponsorConfig | null }) {
  if (!config) return null;
  return (
    <aside aria-labelledby="homepage-sponsor-label" className="container-page py-6" data-homepage-sponsor>
      <div className="rounded-xl border border-line p-4 sm:p-5">
        <p id="homepage-sponsor-label" className="text-sm font-semibold text-ice">Advertisement · Paid sponsor</p>
        <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <img src={asset(config.logo)} alt="" width={96} height={64} loading="lazy" decoding="async" className="h-16 w-24 shrink-0 object-contain" />
          <div className="min-w-0 flex-1 break-words">
            <h2 className="text-base font-semibold text-text">{config.name}</h2>
            <p className="mt-1 text-sm text-muted">{config.description}</p>
          </div>
          <a href={config.url} rel="sponsored noopener noreferrer" data-external="true"
            className="link inline-flex min-h-11 max-w-full items-center gap-1 break-words text-sm sm:max-w-48">
            <span className="min-w-0">{config.linkLabel}</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="sr-only"> (external sponsor site)</span>
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">Paid support does not affect listings, assessments, or editorial coverage.</p>
      </div>
    </aside>
  );
}
