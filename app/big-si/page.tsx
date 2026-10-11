import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InitialsTile } from "@/components/LocalCorner";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { getCatalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/paths";

export const metadata = pageMetadata({
  title: "People Behind Big SI",
  description:
    "Career profiles of the founders, executives, and builders behind the companies shaping AI, now called SI by U.S. agencies: what they built, with sources.",
  path: "/big-si/",
});

export default function BigSiPage() {
  const catalog = getCatalog();
  const leaders = catalog.leaders;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "People Behind Big SI",
    url: absoluteUrl("/big-si/"),
    hasPart: leaders.map((l) => ({ "@type": "ProfilePage", name: l.name, url: absoluteUrl(`/big-si/${l.slug}/`) })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        eyebrow="People"
        title="People Behind Big SI"
        description={
          <p>
            The founders, chief executives, and builders behind the companies and products shaping SI, the name U.S. federal agencies now use for
            AI: from the largest labs to the tools developers use every day. Each profile follows a career to today: what they built and what they
            have accomplished. Every statement links to an official
            biography, company filing, government record, university, or awarding body. For the people who make AI run on your own computer, see{" "}
            <Link prefetch={false} href="/local/" className="link">
              People Behind Local SI
            </Link>
            .
          </p>
        }
      />
      <div className="container-page py-12">
        {leaders.length === 0 ? (
          <p className="text-muted">No profiles are published yet.</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" data-testid="big-si-list">
            {leaders.map((l) => (
              <li key={l.slug}>
                <Link prefetch={false} href={`/big-si/${l.slug}/`} className="card card-link group flex h-full flex-col p-5 sm:p-6">
                  <span className="flex items-center gap-4">
                    <InitialsTile initials={l.initials} size="lg" />
                    <span className="min-w-0">
                      <span className="block text-xl font-semibold text-text group-hover:text-white">{l.name}</span>
                      <span className="mt-0.5 block text-sm text-cyan">
                        {l.current_roles
                          .slice(0, 2)
                          .map((r) => `${r.role}, ${r.organization}`)
                          .join(" · ")}
                      </span>
                    </span>
                  </span>
                  <span className="mt-4 block text-[0.9375rem] text-[#d5def2]">{l.headline}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-cyan">
                    Read the profile <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
