import Link from "@/components/Link";
import { Download, Heart, Lock } from "lucide-react";
import { formatParams, hfLicenseLabel, taskLabel, type HfListItem } from "@/lib/huggingface/directory";
import { hfHue } from "@/lib/huggingface/hero";

const nf = (v: number) => v.toLocaleString("en-US");

/**
 * One ranked Hugging Face model or dataset. Dataset descriptions are
 * third-party text from the Hub and are rendered as plain text only. The rank
 * tile takes the warm hue of the item's hero image.
 */
export function HfRow({ item, level = 2 }: { item: HfListItem; level?: 2 | 3 }) {
  const hue = hfHue(`${item.kind}:${item.id}`);
  const Heading = level === 2 ? "h2" : "h3";
  const href = item.kind === "model" ? `/huggingface/${item.slug}/` : `/huggingface/datasets/${item.slug}/`;
  return (
    <article className="card card-link relative flex gap-3 p-4 sm:gap-4 sm:p-5">
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.rank >= 1000 ? "text-[0.6875rem]" : "text-sm"} font-semibold tabular-nums text-[#2a1e17] sm:h-12 sm:w-12`}
        style={{ background: `linear-gradient(160deg, hsl(${hue} 85% 95%), hsl(${(hue + 20) % 360} 85% 82%))`, boxShadow: `inset 0 0 0 1px hsl(${hue} 50% 78%), 0 3px 0 hsl(${hue} 60% 86%)` }}
      >
        {item.rank.toLocaleString("en-US")}
      </span>
      <div className="min-w-0 flex-1">
        <Heading className="text-[1.0625rem] font-semibold leading-snug text-text [overflow-wrap:anywhere]">
          <span className="sr-only">Rank {nf(item.rank)}: </span>
          <Link prefetch={false} href={href} className="after:absolute after:inset-0 after:content-['']">
            <span className="font-normal text-muted">{item.author}/</span>
            {item.name}
          </Link>
        </Heading>
        {item.description ? <p className="mt-1 line-clamp-2 text-[0.9375rem] text-body [overflow-wrap:anywhere]">{item.description}</p> : null}
        {item.quantizedFrom ? <p className="mt-1 text-[0.9375rem] text-body [overflow-wrap:anywhere]">Quantized version of {item.quantizedFrom}</p> : null}
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1 font-medium text-text">
            <Heart aria-hidden="true" className="h-3.5 w-3.5 text-tone-amber" />
            {nf(item.likes)}
            <span className="sr-only"> likes</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            {nf(item.downloads)}
            <span className="sr-only"> downloads in the last 30 days</span>
          </span>
          {item.task ? <span>{taskLabel(item.task)}</span> : null}
          {item.params ? <span>{formatParams(item.params)} parameters</span> : null}
          <span>{hfLicenseLabel(item.license, item.licenseName)}</span>
          {item.gated ? (
            <span className="inline-flex items-center gap-1">
              <Lock aria-hidden="true" className="h-3.5 w-3.5" />
              Gated
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}

export function HfRows({ items, start }: { items: HfListItem[]; start?: number }) {
  return (
    <ol className="mt-4 grid gap-3" start={start} data-testid="hf-list">
      {items.map((item) => (
        <li key={item.slug}>
          <HfRow item={item} />
        </li>
      ))}
    </ol>
  );
}

/** Models | Datasets switch at the top of /huggingface/ and /huggingface/datasets/ (plain links, so it works without JavaScript). */
export function HfTabs({ current, models, datasets }: { current: "model" | "dataset"; models: number; datasets: number }) {
  const tab = (kind: "model" | "dataset", href: string, label: string, count: number) => (
    <li>
      <Link
        href={href}
        aria-current={current === kind ? "page" : undefined}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9375rem] font-medium ${current === kind ? "border-cyan bg-cyan/10 text-text" : "border-line text-muted hover:border-line-strong hover:text-text"}`}
      >
        {label} <span className="tabular-nums text-muted">{nf(count)}</span>
      </Link>
    </li>
  );
  return (
    <nav aria-label="Models or datasets" className="mb-4">
      <ul className="flex flex-wrap gap-2">
        {tab("model", "/huggingface/", "Models", models)}
        {tab("dataset", "/huggingface/datasets/", "Datasets", datasets)}
      </ul>
    </nav>
  );
}
