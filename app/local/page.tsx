import Link from "next/link";
import { InitialsTile } from "@/components/LocalCorner";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { personHref } from "@/lib/routes";
import { mailtoHref, siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "People behind local SI",
  description:
    "A standing list of people whose public work helps others run AI models on their own hardware — local runtimes, on-device frameworks, efficient fine-tuning, and open-weight models.",
  path: "/local/",
});

export default function LocalCornerPage() {
  const catalog = getCatalog();
  const people = catalog.people.filter((p) => p.groups.includes("local"));
  const email = siteConfig.contact.email;

  return (
    <>
      <PageHeader
        eyebrow="Local corner"
        title="People behind local SI"
        description={
          <p>
            People whose public work helps others run AI models on their own hardware: local runtimes, on-device frameworks, efficient
            fine-tuning, and open-weight models. Listed alphabetically; each profile stays up until it is updated or removed. For everyone in the catalog, from founders to
            open-source maintainers, see <Link href="/people/" className="link">all people</Link>; for the leaders of the large AI companies, see{" "}
            <Link href="/big-si/" className="link">People Behind Big SI</Link>.
          </p>
        }
      />
      <div className="container-page grid gap-12 py-12">
        {people.length === 0 ? (
          <p className="text-muted">No profiles are published yet.</p>
        ) : (
          <section aria-labelledby="local-people-heading">
            <h2 id="local-people-heading" className="eyebrow">
              {people.length} people
            </h2>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="local-people">
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
                              {role.current ? "" : " (earlier)"}
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

        <section aria-labelledby="about-corner" className="max-w-3xl rounded-xl border border-line p-5 text-[0.9375rem] text-muted">
          <h2 id="about-corner" className="font-semibold text-text">
            About the Local corner
          </h2>
          <p className="mt-2">
            Profiles use only public, professional information — roles, projects, and pages people publish themselves — with a source for
            each statement. They never include locations, nationality, ages, photos, or personal details. Everyone listed is connected to
            an organization or project in this catalog. Selection is editorial, is not a ranking, and is never influenced by tips.
          </p>
          {email ? (
            <p className="mt-3">
              To suggest someone, correct a profile, or ask to be removed, email{" "}
              <a href={mailtoHref(email, "Local corner")} className="link">
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
