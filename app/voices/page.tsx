import Link from "@/components/Link";
import { InitialsTile } from "@/components/LocalCorner";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { personHref } from "@/lib/routes";
import { mailtoHref, siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Voices of SI: tech creators and communicators",
  description:
    "The people whose shows, channels, podcasts, newsletters, and reporting explain AI and superintelligence to the public, each profiled from their own official pages.",
  path: "/voices/",
});

export default function VoicesPage() {
  const catalog = getCatalog();
  const people = catalog.people.filter((p) => p.groups.includes("creators"));
  const email = siteConfig.contact.email;

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Voices of SI"
        description={
          <p>
            The tech creators and communicators whose shows, channels, podcasts, newsletters, and reporting explain AI and
            superintelligence to the public. Each profile says what the person makes and where, from their own official pages. Listed
            alphabetically. For the people building AI, see <Link href="/people/" className="link">all people</Link> and{" "}
            <Link href="/big-si/" className="link">People Behind Big SI</Link>.
          </p>
        }
      />
      <div className="container-page grid gap-12 py-12">
        {people.length === 0 ? (
          <p className="text-muted">No profiles are published yet.</p>
        ) : (
          <section aria-labelledby="voices-heading">
            <h2 id="voices-heading" className="eyebrow">
              {people.length} people
            </h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="voices-people">
              {people.map((p) => {
                const role = p.affiliations.find((a) => a.current) ?? p.affiliations[0];
                return (
                  <li key={p.slug} id={p.slug} className="scroll-mt-24">
                    <article className="card card-link relative flex h-full flex-col p-5">
                      <div className="flex items-start gap-3">
                        <InitialsTile initials={p.initials} />
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold leading-snug text-text">
                            <Link prefetch={false} href={personHref(p.slug)} className="after:absolute after:inset-0 after:content-['']">
                              {p.name}
                            </Link>
                          </h3>
                          {role ? (
                            <p className="mt-0.5 text-sm text-muted">
                              {role.role}, {role.name}
                              {role.current ? "" : " (not confirmed as current)"}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 text-[0.9375rem] text-[#d5def2]">{p.headline}</p>
                      <p className="mt-auto pt-3 text-sm text-muted">
                        {p.work
                          .slice(0, 3)
                          .map((w) => w.name)
                          .join(" · ")}
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="about-voices" className="max-w-3xl rounded-xl border border-line p-5 text-[0.9375rem] text-muted">
          <h2 id="about-voices" className="font-semibold text-text">
            How these profiles are made
          </h2>
          <p className="mt-2">
            Each profile states only what the person&rsquo;s own official pages show: the show, channel, podcast, newsletter, book, or
            publication, and the roles those pages name, with a source for every statement. Profiles report what people make, not what
            they say or believe: no opinions, predictions, controversies, or follower and audience counts, and never locations,
            nationality, ages, photos, or personal details. Selection is editorial, is not a ranking or an endorsement, and is never
            influenced by tips.
          </p>
          {email ? (
            <p className="mt-3">
              To suggest someone, correct a profile, or ask to be removed, email{" "}
              <a href={mailtoHref(email, "Voices of SI")} className="link">
                {email}
              </a>
              . Removal requests are honored.
            </p>
          ) : null}
        </section>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
