import Link from "@/components/Link";
import { ArrowRight, Heart, Lock } from "lucide-react";
import { GithubPagination } from "@/components/GithubList";
import { HfDirectory } from "@/components/HfDirectory";
import { HfRow, HfRows, HfTabs } from "@/components/HfList";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { hfListData } from "@/lib/huggingface/page-data";
import {
  AUTHOR_TYPE_LABELS,
  derivedModels,
  formatParams,
  HF_DATASETS_INDEX,
  HF_INDEX,
  HF_PAGE_SIZE,
  hfCatalogMatch,
  hfEntries,
  hfEntryById,
  hfFetchedLabel,
  hfGithubMatch,
  hfHubUrl,
  hfItemHero,
  hfItemLd,
  hfLicenseLabel,
  hfPageCount,
  hfPageEntries,
  hfPageHref,
  hfSectionHero,
  quantizedBase,
  RELATION_LABELS,
  sameAuthor,
  taskLabel,
  toHfListItem,
  type HfEntry,
} from "@/lib/huggingface/items";
import type { HfKind } from "@/lib/huggingface/schema";
import { clipDescription, pageMetadata } from "@/lib/metadata";
import { asset } from "@/lib/paths";
import { itemList } from "@/lib/structured-data";

const nf = (v: number) => v.toLocaleString("en-US");
const NOUN = { model: ["model", "models"], dataset: ["dataset", "datasets"] } as const;
const CRUMBS = (kind: HfKind) => [{ href: HF_INDEX, label: "AI on Hugging Face" }, ...(kind === "dataset" ? [{ href: HF_DATASETS_INDEX, label: "Datasets" }] : [])];
const NOTE = "Likes measure popularity, not quality or safety.";

/* ---------------------------------------------------------------- */
/* Index: /huggingface/ (models) and /huggingface/datasets/          */
/* ---------------------------------------------------------------- */

export function hfIndexMetadata(kind: HfKind) {
  const { items } = hfListData(kind);
  const hero = hfSectionHero();
  return pageMetadata({
    title: kind === "model" ? "AI on Hugging Face: the most-liked open models" : "AI on Hugging Face: the most-liked datasets",
    description:
      kind === "model"
        ? `The ${nf(items.length)} most-liked models on the Hugging Face Hub, ranked by likes, each with its own page: task, library, license, parameters, and base model. Data from the Hugging Face Hub API, fetched ${hfFetchedLabel()}.`
        : `The ${nf(items.length)} most-liked datasets on the Hugging Face Hub, ranked by likes, each with its own page: task, modality, size, and license. Data from the Hugging Face Hub API, fetched ${hfFetchedLabel()}.`,
    path: kind === "model" ? HF_INDEX : HF_DATASETS_INDEX,
    image: { path: hero.image, alt: hero.alt },
  });
}

export function HfIndexPage({ kind }: { kind: HfKind }) {
  const { items, tasks, libraries, licenses, modalities, authors, gated, quantized } = hfListData(kind);
  const fetched = hfFetchedLabel();
  const first = items.slice(0, HF_PAGE_SIZE);
  const path = kind === "model" ? HF_INDEX : HF_DATASETS_INDEX;
  const [one, many] = NOUN[kind];
  return (
    <>
      <JsonLd data={itemList({ name: `AI on Hugging Face: most-liked ${many}`, path, items: first.map((i) => ({ name: i.id, href: `${path}${i.slug}/` })) })} />
      <PageHeader
        compact
        crumbs={kind === "dataset" ? [{ href: HF_INDEX, label: "AI on Hugging Face" }] : undefined}
        current={kind === "dataset" ? { href: HF_DATASETS_INDEX, label: "Datasets" } : undefined}
        eyebrow="Directory · AI on Hugging Face"
        title={kind === "model" ? "AI on Hugging Face" : "AI on Hugging Face: datasets"}
        description={
          <p>
            {kind === "model"
              ? "The most-liked models on the Hugging Face Hub, ranked by likes: language, vision, speech, and image models, with their quantized versions and fine-tunes."
              : "The most-liked datasets on the Hugging Face Hub, ranked by likes: training corpora, instruction and preference data, and benchmarks."}{" "}
            Data from the Hugging Face Hub API, fetched {fetched}. {NOTE}
          </p>
        }
      >
        <p className="meta mt-2">
          {nf(items.length)} {many} · {nf(authors.org)} from organizations · {nf(authors.user)} from personal accounts · {nf(gated)} gated
          {kind === "model" ? ` · ${nf(quantized)} quantized versions` : ""}. Downloads are for the last 30 days, as the Hub reports them.{" "}
          <Link href="/methodology/#huggingface" className="link">
            How this list is made
          </Link>
        </p>
      </PageHeader>
      <div className="container-page py-6">
        <HfTabs current={kind} models={hfListData("model").items.length} datasets={hfListData("dataset").items.length} />
        <HfDirectory
          kind={kind}
          initial={first}
          total={items.length}
          dataUrl={asset(kind === "model" ? "/data/huggingface-models.json" : "/data/huggingface-datasets.json")}
          tasks={tasks}
          libraries={libraries}
          licenses={licenses}
          modalities={modalities}
        />
        <GithubPagination current={1} count={hfPageCount(kind)} total={items.length} pageSize={HF_PAGE_SIZE} base={path} noun={many} />
        <section aria-labelledby="about-hf" className="mt-12 max-w-3xl rounded-xl border border-line p-5 text-[0.9375rem] text-muted">
          <h2 id="about-hf" className="font-semibold text-text">
            About this list
          </h2>
          <p className="mt-2">
            The list is the Hub&rsquo;s own ranking by likes: the {kind === "model" ? "5,000" : "1,000"} most-liked {many}, down to 100 likes, plus
            every {one} a USASI catalog record links to. Private and disabled repositories, items tagged not for all audiences, deepfake and
            undressing tools, &ldquo;uncensored&rdquo; or &ldquo;abliterated&rdquo; fine-tunes that remove safety training, and jailbreak or
            leaked-prompt collections are left out. Quantized re-uploads of another model stay and say so. The list includes {many} from anywhere
            in the world; it shows whether the author is an organization or a personal account and does not guess anyone&rsquo;s country. A
            listing is not an endorsement or a USASI catalog review; where a {one} is also in{" "}
            <Link href="/open/" className="link">
              Open Models &amp; Tools
            </Link>{" "}
            or{" "}
            <Link href="/github/" className="link">
              AI on GitHub
            </Link>
            , its page links there.
          </p>
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Ranking pages: /huggingface/page/<n>/, /huggingface/datasets/page/<n>/ */
/* ---------------------------------------------------------------- */

function range(kind: HfKind, n: number) {
  const total = hfEntries(kind).length;
  const from = (n - 1) * HF_PAGE_SIZE + 1;
  const to = Math.min(n * HF_PAGE_SIZE, total);
  return { from: nf(from), to: nf(to), start: from, total };
}

export const hfRankParams = (kind: HfKind) => Array.from({ length: hfPageCount(kind) - 1 }, (_, i) => ({ n: String(i + 2) }));

export function hfRankMetadata(kind: HfKind, n: number) {
  const { from, to } = range(kind, n);
  const hero = hfSectionHero();
  const many = NOUN[kind][1];
  return pageMetadata({
    title: `AI on Hugging Face: ${many} ranked ${from}–${to}`,
    description: `Hugging Face ${many} ranked ${from} to ${to} by likes, each with its own page. Data from the Hugging Face Hub API, fetched ${hfFetchedLabel()}.`,
    path: hfPageHref(kind, n),
    image: { path: hero.image, alt: hero.alt },
  });
}

export function HfRankPage({ kind, n }: { kind: HfKind; n: number }) {
  const { from, to, start, total } = range(kind, n);
  const many = NOUN[kind][1];
  const items = hfPageEntries(kind, n).map(toHfListItem);
  return (
    <>
      <PageHeader
        compact
        crumbs={CRUMBS(kind)}
        current={{ href: hfPageHref(kind, n), label: `Ranked ${from}–${to}` }}
        eyebrow="Directory · AI on Hugging Face"
        title={`AI on Hugging Face: ${many} ranked ${from}–${to}`}
        description={
          <p>
            {many.charAt(0).toUpperCase() + many.slice(1)} {from} to {to} of {nf(total)}, by likes on the Hub. Data from the Hugging Face Hub API, fetched{" "}
            {hfFetchedLabel()}. {NOTE} To search and filter every {NOUN[kind][0]}, use{" "}
            <Link href={kind === "model" ? HF_INDEX : HF_DATASETS_INDEX} className="link">
              the full list
            </Link>
            .
          </p>
        }
      />
      <div className="container-page py-6">
        <HfRows items={items} start={start} />
        <GithubPagination current={n} count={hfPageCount(kind)} total={total} pageSize={HF_PAGE_SIZE} base={kind === "model" ? HF_INDEX : HF_DATASETS_INDEX} noun={many} />
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Item pages                                                        */
/* ---------------------------------------------------------------- */

export function hfItemMetadata(e: HfEntry) {
  const hero = hfItemHero(e);
  const what = e.kind === "model" ? "model" : "dataset";
  const task = e.kind === "model" ? e.pipeline_tag : e.task_categories[0];
  const lead = e.kind === "dataset" && e.description ? clipDescription(e.description, 110) : `${e.name}, a ${task ? `${taskLabel(task).toLowerCase()} ` : ""}${what} by ${e.author}.`;
  return pageMetadata({
    title: `${e.id} on Hugging Face`,
    description: `${lead} Ranked #${nf(e.rank)} among Hugging Face ${what}s with ${nf(e.likes)} likes; ${hfLicenseLabel(e.license ?? "none", e.license_name)}.`,
    path: e.href,
    image: { path: hero.image, alt: hero.alt },
  });
}

/** "1M<n<10M" → "1M to 10M examples". */
export function sizeLabel(s: string): string {
  const between = s.match(/^([0-9.]+[KMBT]?)<n<([0-9.]+[KMBT]?)$/);
  if (between) return `${between[1]} to ${between[2]} examples`;
  const below = s.match(/^n<([0-9.]+[KMBT]?)$/);
  if (below) return `Fewer than ${below[1]} examples`;
  const above = s.match(/^n>([0-9.]+[KMBT]?)$/);
  if (above) return `More than ${above[1]} examples`;
  return s;
}

const ACCESS = { auto: "Gated: access is granted on accepting the terms", manual: "Gated: the author reviews each access request" } as const;

function languageText(langs: string[]): string {
  if (!langs.length) return "Not given";
  if (langs.length > 8) return `${nf(langs.length)} languages`;
  return langs.join(", ");
}

export function HfItemPage({ e }: { e: HfEntry }) {
  const catalog = getCatalog();
  const hero = hfItemHero(e);
  const inCatalog = hfCatalogMatch(catalog, e);
  const onGithub = hfGithubMatch(e.id);
  const page = Math.ceil(e.rank / HF_PAGE_SIZE);
  const many = NOUN[e.kind][1];
  const license = e.license ?? "none";
  const quantFrom = e.kind === "model" ? quantizedBase(e) : null;
  const quantListed = quantFrom ? hfEntryById("model", quantFrom) : undefined;
  const derived = e.kind === "model" ? derivedModels(e) : [];
  const more = sameAuthor(e);
  // Twelve facts, so the grid fills evenly at two and four columns.
  const facts: [string, React.ReactNode][] = [
    ["Hub id", e.id],
    ["Likes", nf(e.likes)],
    ["Downloads (last 30 days)", nf(e.downloads_30d)],
    ...(e.kind === "model"
      ? ([
          ["Task", e.pipeline_tag ? taskLabel(e.pipeline_tag) : "Not given"],
          ["Library", e.library_name ?? "Not given"],
          ["Parameters", e.params ? `${formatParams(e.params)} (${nf(e.params)})` : "Not reported by the Hub"],
        ] as [string, React.ReactNode][])
      : ([
          ["Tasks", e.task_categories.length ? e.task_categories.map(taskLabel).join(", ") : "Not given"],
          ["Modality", e.modalities.length ? e.modalities.join(", ") : "Not given"],
          ["Size", e.size_category ? sizeLabel(e.size_category) : "Not given"],
        ] as [string, React.ReactNode][])),
    ["License", license === "none" ? hfLicenseLabel("none") : `${hfLicenseLabel(license, e.license_name)}${license !== "other" && hfLicenseLabel(license) !== license ? ` (${license})` : ""}`],
    ["Access", e.gated === false ? "Open download" : ACCESS[e.gated]],
    ["Author", `${e.author}${e.author_type ? ` · ${AUTHOR_TYPE_LABELS[e.author_type]}` : ""}`],
    ["Languages", languageText(e.languages)],
    ["Created", formatDate(e.created_at.slice(0, 10))],
    ["Last modified", formatDate(e.last_modified.slice(0, 10))],
  ];

  return (
    <>
      <JsonLd data={hfItemLd(e)} />
      <article>
        <header className="border-b border-line bg-[linear-gradient(180deg,var(--hero-tint),transparent)]">
          <div className="container-page pb-10 pt-8 sm:pt-10">
            <Breadcrumbs items={CRUMBS(e.kind)} current={{ href: e.href, label: e.id }} />
            <figure className="overflow-hidden rounded-2xl border border-line shadow-hero">
              <img src={asset(hero.image)} alt={hero.alt} width={1200} height={630} fetchPriority="high" decoding="async" className="block aspect-[1200/630] h-auto w-full bg-fog" />
            </figure>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="badge">{e.kind === "model" ? "Model" : "Dataset"}</span>
              <span className="badge">
                Rank #{nf(e.rank)} of {nf(hfEntries(e.kind).length)}
              </span>
              <span className="badge">
                <Heart aria-hidden="true" className="h-3.5 w-3.5 text-tone-amber" /> {nf(e.likes)} likes
              </span>
              {e.kind === "model" && e.pipeline_tag ? <span className="badge">{taskLabel(e.pipeline_tag)}</span> : null}
              {e.kind === "model" && e.params ? <span className="badge">{formatParams(e.params)} parameters</span> : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-text [overflow-wrap:anywhere] sm:text-4xl">{e.name}</h1>
            <p className="mt-1 text-lg text-muted">
              by {e.author}
              {e.author_type ? <span className="text-base"> ({AUTHOR_TYPE_LABELS[e.author_type].toLowerCase()})</span> : null}
            </p>
            {e.kind === "dataset" ? (
              e.description ? (
                <p className="mt-4 max-w-3xl text-lg text-body [overflow-wrap:anywhere]">
                  {e.description}
                  <span className="sr-only"> (excerpt from the dataset card on Hugging Face)</span>
                </p>
              ) : (
                <p className="mt-4 text-muted">The Hub API gives no description for this dataset.</p>
              )
            ) : null}
            {quantFrom ? (
              <p className="mt-4 max-w-3xl text-lg text-body [overflow-wrap:anywhere]">
                Quantized version of{" "}
                {quantListed ? (
                  <Link href={quantListed.href} className="link font-medium">
                    {quantFrom}
                  </Link>
                ) : (
                  <a href={hfHubUrl("model", quantFrom)} className="link font-medium" rel="noopener noreferrer" data-external="true">
                    {quantFrom}
                    <span className="sr-only"> (external site: huggingface.co)</span>
                  </a>
                )}
                , according to the Hub&rsquo;s base-model tags.
              </p>
            ) : null}
            {e.gated !== false ? (
              <p className="mt-4 inline-flex max-w-3xl items-start gap-2 rounded-lg border border-line bg-card px-3 py-2 text-[0.9375rem] text-body">
                <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                Access requires accepting terms on Hugging Face{e.gated === "manual" ? "; the author reviews each request" : ""}.
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={hfHubUrl(e.kind, e.id)} className="btn btn-primary" rel="noopener noreferrer" data-external="true">
                View on Hugging Face<span className="sr-only"> (external site: huggingface.co)</span>
              </a>
            </div>
            {inCatalog || onGithub ? (
              <ul className="mt-5 grid gap-2">
                {inCatalog ? (
                  <li>
                    <Link href={inCatalog.href} className="link inline-flex items-center gap-1 font-medium">
                      In the USASI catalog: {inCatalog.name} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </li>
                ) : null}
                {onGithub ? (
                  <li>
                    <Link href={onGithub.href} className="link inline-flex items-center gap-1 font-medium">
                      On AI on GitHub: {onGithub.fullName} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </header>

        <div className="container-page grid gap-12 py-12">
          <section aria-labelledby="facts-heading">
            <h2 id="facts-heading" className="text-xl font-semibold text-text">
              {e.kind === "model" ? "Model facts" : "Dataset facts"}
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
              {facts.map(([k, v]) => (
                <div key={k} className="bg-card p-4">
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="mt-1 font-medium text-text [overflow-wrap:anywhere]">{v}</dd>
                </div>
              ))}
            </dl>
            {e.kind === "model" && e.base_models.length ? (
              <>
                <h3 className="mt-6 text-sm font-medium text-text">Base model</h3>
                <ul className="mt-2 grid gap-1 text-[0.9375rem]">
                  {e.base_models.map((b) => {
                    const listed = hfEntryById("model", b.id);
                    return (
                      <li key={`${b.relation}:${b.id}`} className="[overflow-wrap:anywhere]">
                        <span className="text-muted">{RELATION_LABELS[b.relation]} </span>
                        {listed ? (
                          <Link href={listed.href} className="link">
                            {b.id}
                          </Link>
                        ) : (
                          <a href={hfHubUrl("model", b.id)} className="link" rel="noopener noreferrer" data-external="true">
                            {b.id}
                            <span className="sr-only"> (external site: huggingface.co)</span>
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : null}
            <p className="meta mt-6">
              Rank #{nf(e.rank)} of {nf(hfEntries(e.kind).length)} {many} in{" "}
              <Link href={hfPageHref(e.kind, page)} className="link">
                AI on Hugging Face
              </Link>
              , by likes. Data from the Hugging Face Hub API, fetched {hfFetchedLabel()}. {NOTE} Downloads are for the last 30 days, as the Hub
              reports them; counts change daily. A listing is not an endorsement.{" "}
              <Link href="/methodology/#huggingface" className="link">
                How this list is made
              </Link>
            </p>
          </section>

          {derived.length ? (
            <section aria-labelledby="derived-heading">
              <h2 id="derived-heading" className="text-xl font-semibold text-text">
                Listed models built on this one
              </h2>
              <p className="mt-1 text-sm text-muted">Quantized versions, fine-tunes, adapters, and merges whose Hub base-model tags name this model.</p>
              <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                {derived.map(({ entry }) => (
                  <li key={entry.slug}>
                    <HfRow item={toHfListItem(entry)} level={3} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {more.length ? (
            <section aria-labelledby="more-heading">
              <h2 id="more-heading" className="text-xl font-semibold text-text [overflow-wrap:anywhere]">
                More {many} from {e.author}
              </h2>
              <ul className="mt-4 grid gap-3 lg:grid-cols-2">
                {more.map((m) => (
                  <li key={m.slug}>
                    <HfRow item={toHfListItem(m)} level={3} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
      <SupportPanel variant="compact" />
    </>
  );
}

