import Link from "@/components/Link";
import { ArrowRight, BookA, Users } from "lucide-react";
import { KidLessonCard } from "@/components/kids/KidParts";
import { Breadcrumbs } from "@/components/PageHeader";
import { getCatalog } from "@/lib/catalog";
import { KID_LESSONS, KIDS_AGES } from "@/lib/kids";
import { pageMetadata } from "@/lib/metadata";
import { cardImage } from "@/lib/page-cards";
import { absoluteUrl } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "AI and Super Intelligence for kids",
  description: "Seven short, friendly lessons for readers about 8 to 12: what AI is, how it learns, what super intelligence means, and how to use AI safely.",
  path: "/kids/",
  image: cardImage(getCatalog(), "/kids/"),
});

export default function KidsPage() {
  const first = KID_LESSONS[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "AI and Super Intelligence for kids",
    description: "Seven short lessons for readers about 8 to 12, meant to be read with a grown-up.",
    url: absoluteUrl("/kids/"),
    inLanguage: "en-US",
    isAccessibleForFree: true,
    educationalLevel: "Elementary and middle school",
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Children ages 8 to 12" },
    provider: { "@type": "Organization", name: "USASI", url: absoluteUrl("/") },
    hasPart: KID_LESSONS.map((l) => ({ "@type": "LearningResource", name: l.title, url: absoluteUrl(`/kids/${l.slug}/`) })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgb(var(--cyan-rgb)/0.18),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgb(var(--glow2-rgb)/0.14),transparent_55%)]">
        <div className="container-page pb-12 pt-10 sm:pt-14">
          <Breadcrumbs items={[{ href: "/learn/", label: "Learn" }]} current={{ href: "/kids/", label: "For kids" }} />
          <p className="eyebrow">For kids</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-text sm:text-5xl">AI and Super Intelligence, explained for kids</h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-body">
            What is AI? How does it learn? What do people mean by super intelligence? Seven short lessons for readers {KIDS_AGES}. Read them with a
            grown-up, try the activities, and take the quick quizzes.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link prefetch={false} href={`/kids/${first.slug}/`} className="btn btn-primary text-base">
              Start with lesson 1 <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link prefetch={false} href="/kids/grown-ups/" className="link text-[1.0625rem]">
              A note for parents and teachers
            </Link>
            <Link prefetch={false} href="/kids/packet/" className="link text-[1.0625rem]">
              Printable classroom packet
            </Link>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-14 py-12">
        <section aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="text-2xl font-semibold text-text sm:text-3xl">
            The lessons
          </h2>
          <p className="mt-2 max-w-2xl text-[1.0625rem] text-muted">Each one takes about five minutes. Go in order, or pick the question you care about most.</p>
          <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {KID_LESSONS.map((l) => (
              <li key={l.slug}>
                <KidLessonCard lesson={l} />
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="more-heading" className="grid gap-5 md:grid-cols-2">
          <h2 id="more-heading" className="sr-only">
            More for kids and grown-ups
          </h2>
          <Link prefetch={false} href="/kids/words/" className="card card-link flex items-start gap-4 rounded-2xl p-6">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-cyan/15 text-cyan">
              <BookA aria-hidden="true" className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xl font-semibold text-text">Words to know</span>
              <span className="mt-1 block text-[1.0625rem] text-muted">Simple meanings for words like model, training, deepfake, and super intelligence.</span>
            </span>
          </Link>
          <Link prefetch={false} href="/kids/grown-ups/" className="card card-link flex items-start gap-4 rounded-2xl p-6">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-tone-violet/15 text-tone-violet">
              <Users aria-hidden="true" className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xl font-semibold text-text">For parents and teachers</span>
              <span className="mt-1 block text-[1.0625rem] text-muted">How these lessons were made, their sources, ideas for talking together, and privacy.</span>
            </span>
          </Link>
        </section>

        <p className="max-w-3xl text-[0.9375rem] text-muted">
          The lessons themselves have no ads, sign-ups, share buttons, or requests for tips. The quizzes run in your browser and save nothing, and the site
          sets no cookies (see the{" "}
          <Link prefetch={false} href="/privacy/" className="link">
            privacy page
          </Link>
          ). USASI is an independent project, not a United States government website.
        </p>
      </div>
    </>
  );
}
