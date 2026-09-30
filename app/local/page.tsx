import Link from "next/link";
import { ExternalLink } from "@/components/ExternalLink";
import { InitialsTile, monthLabel } from "@/components/LocalCorner";
import { PageHeader } from "@/components/PageHeader";
import { SourceRefs, SourcesList } from "@/components/Sources";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/metadata";
import { artifactHref, orgHref } from "@/lib/routes";
import { mailtoHref, siteConfig } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Local corner",
  description:
    "A small, monthly look at people whose public work helps others run AI models on their own hardware — local runtimes, on-device frameworks, efficient fine-tuning, and open-weight models.",
  path: "/local/",
});

export default function LocalCornerPage() {
  const catalog = getCatalog();
  const month = catalog.currentMonth();
  const { people } = catalog.localCornerLineup(month);
  const email = siteConfig.contact.email;

  return (
    <>
      <PageHeader
        eyebrow={`Local corner · ${monthLabel(month)}`}
        title="People behind local AI"
        description={
          <p>
            Each month, five people whose public work helps others run AI models on their own hardware: local runtimes, on-device
            frameworks, efficient fine-tuning, and open-weight models. The lineup changes at the start of each month.
          </p>
        }
      />
      <div className="container-page grid gap-12 py-12">
        {people.length === 0 ? (
          <p className="text-muted">No profiles are published for this month yet.</p>
        ) : (
          <ol className="grid gap-10">
            {people.map((p) => (
              <li key={p.slug}>
                <article id={p.slug} aria-labelledby={`${p.slug}-name`} className="card scroll-mt-24 p-5 sm:p-7">
                  <div className="flex items-start gap-4">
                    <InitialsTile initials={p.initials} size="lg" />
                    <div className="min-w-0">
                      <h2 id={`${p.slug}-name`} className="text-2xl font-semibold text-text">
                        {p.name}
                      </h2>
                      <p className="mt-1 text-ice">{p.headline}</p>
                    </div>
                  </div>
                  <p className="mt-5 max-w-3xl text-[#d5def2]">
                    {p.bio.text}
                    <SourceRefs ids={p.bio.source_ids} sources={p.sources} idPrefix={`${p.slug}-`} />
                  </p>

                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="eyebrow">Roles</h3>
                      <ul className="mt-2 space-y-1.5 text-[0.9375rem]">
                        {p.affiliations.map((a) => (
                          <li key={`${a.name}-${a.role}`}>
                            <span className="text-text">{a.role}</span>
                            {a.organization_slug && catalog.isActiveOrganization(a.organization_slug) ? (
                              <>
                                <span className="text-muted">, </span>
                                <Link prefetch={false} href={orgHref(a.organization_slug)} className="link">
                                  {a.name}
                                </Link>
                              </>
                            ) : a.role.toLowerCase().includes(a.name.toLowerCase()) ? null : (
                              <>
                                <span className="text-muted">, </span>
                                <span className="text-text">{a.name}</span>
                              </>
                            )}
                            {a.current ? null : <span className="text-muted"> (past)</span>}
                            <SourceRefs ids={a.source_ids} sources={p.sources} idPrefix={`${p.slug}-`} />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="eyebrow">Work</h3>
                      <ul className="mt-2 space-y-2 text-[0.9375rem]">
                        {p.work.map((w) => (
                          <li key={w.name}>
                            {w.artifact_slug && catalog.isActiveArtifact(w.artifact_slug) ? (
                              <Link prefetch={false} href={artifactHref(w.artifact_slug)} className="link font-medium">
                                {w.name}
                              </Link>
                            ) : w.url ? (
                              <ExternalLink href={w.url}>{w.name}</ExternalLink>
                            ) : (
                              <span className="font-medium text-text">{w.name}</span>
                            )}
                            <span className="text-muted"> — {w.contribution}</span>
                            <SourceRefs ids={w.source_ids} sources={p.sources} idPrefix={`${p.slug}-`} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {p.links.length > 0 ? (
                    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]" aria-label={`${p.name}: public pages`}>
                      {p.links.map((l) => (
                        <li key={l.url}>
                          <ExternalLink href={l.url}>{l.label}</ExternalLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-6 border-t border-line pt-4 text-[0.9375rem]">
                    <h3 className="eyebrow">Sources · reviewed {formatDate(p.last_reviewed)}</h3>
                    <div className="mt-3">
                      <SourcesList sources={p.sources} idPrefix={`${p.slug}-`} />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}

        <section aria-labelledby="about-corner" className="max-w-3xl rounded-xl border border-line p-5 text-[0.9375rem] text-muted">
          <h2 id="about-corner" className="font-semibold text-text">
            About the Local corner
          </h2>
          <p className="mt-2">
            Profiles use only public, professional information — roles, projects, and pages people publish themselves — with a source for
            each statement. They never include locations, nationality, ages, photos, or personal details. Everyone featured is connected to
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
