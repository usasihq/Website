/**
 * The first paragraph under a record's heading: what it is, what it publishes
 * openly, and under which license, in one or two sentences assembled from the
 * record's own fields. Facts keep their source markers; links lead to the
 * family, organization, license guide, and state pages they mention.
 */
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { Catalog } from "@/lib/catalog";
import { formatDate } from "@/lib/dates";
import { KIND_LABELS } from "@/lib/labels";
import { guideFor } from "@/lib/licenses";
import { checklistStatus, computeTier } from "@/lib/openness";
import { stateFromHeadquarters, stateSlug, US_STATES } from "@/lib/places";
import { artifactHref, orgHref } from "@/lib/routes";
import type { Artifact, LicenseRecord, Organization } from "@/lib/schema";
import { article, COVERS, headquartersPhrase, organizationOutput, roleDescription } from "@/lib/seo";
import { SourceRefs } from "./Sources";

const CLASS = "mt-3 max-w-3xl text-[1.0625rem] leading-relaxed text-text";

/** "A", "A and B", "A, B, and C" for rendered items. */
function Join({ items }: { items: ReactNode[] }) {
  return (
    <>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 ? (items.length === 2 ? " and " : i === items.length - 1 ? ", and " : ", ") : null}
          {item}
        </Fragment>
      ))}
    </>
  );
}

/** "the Apache License 2.0", linked to its plain-language guide when there is one. */
function LicenseName({ catalog, license, refs }: { catalog: Catalog; license: LicenseRecord; refs?: ReactNode }) {
  const guide = guideFor(catalog, license);
  const name = license.name;
  const the = /^the\s/i.test(name) ? "" : "the ";
  return (
    <>
      {the}
      {guide ? (
        <Link prefetch={false} href={`/licenses/${guide.slug}/`} className="link">
          {name}
        </Link>
      ) : (
        name
      )}
      {refs}
    </>
  );
}

/** Distinct license entries covering a component, else every entry. */
function licensesFor(a: Artifact, component: keyof typeof COVERS): LicenseRecord[] {
  const covering = a.licenses.filter((l) => COVERS[component].includes(l.applies_to));
  const list = covering.length ? covering : a.licenses;
  return list.filter((l, i) => list.findIndex((x) => x.name === l.name) === i).slice(0, 3);
}

function LicenseList({ catalog, a, component }: { catalog: Catalog; a: Artifact; component: keyof typeof COVERS }) {
  return (
    <Join
      items={licensesFor(a, component).map((l) => (
        <LicenseName key={`${l.name}-${l.applies_to}`} catalog={catalog} license={l} refs={<SourceRefs ids={l.source_ids} sources={a.sources} />} />
      ))}
    />
  );
}

function Maintainers({ catalog, a }: { catalog: Catalog; a: Artifact }) {
  return (
    <Join
      items={a.maintainers.map((m) => (
        <Fragment key={m.name}>
          {m.organization_slug && catalog.isActiveOrganization(m.organization_slug) ? (
            <Link prefetch={false} href={orgHref(m.organization_slug)} className="link">
              {m.name}
            </Link>
          ) : (
            m.name
          )}
          <SourceRefs ids={m.source_ids} sources={a.sources} />
        </Fragment>
      ))}
    />
  );
}

const when = (a: Artifact) => (
  <>
    {a.version ? `, version ${a.version}` : null}
    {a.released_at ? `, released ${formatDate(a.released_at)}` : null}
  </>
);

export function ArtifactLead({ catalog, a }: { catalog: Catalog; a: Artifact }) {
  const s = a.sources;
  const family = catalog.familyOf(a);
  const hasLicense = a.licenses.length > 0;

  if (a.record_level === "family") {
    const releases = catalog.releasesOf(a.slug);
    const seen = new Set<string>();
    const releaseLicenses = releases
      .flatMap((r) => licensesFor(r, "weights"))
      .filter((l) => (seen.has(l.name) ? false : (seen.add(l.name), true)))
      .slice(0, 3);
    return (
      <p className={CLASS} data-testid="record-lead">
        {a.name} is a model family from <Maintainers catalog={catalog} a={a} />
        {releases.length ? (
          <>
            , with{" "}
            <a href="#releases" className="link">
              {releases.length} assessed {releases.length === 1 ? "release" : "releases"}
            </a>{" "}
            in this catalog
          </>
        ) : null}
        . Licenses and availability are recorded for each release, not for the family
        {releaseLicenses.length ? (
          <>
            ; its releases use <Join items={releaseLicenses.map((l) => <LicenseName key={l.name} catalog={catalog} license={l} />)} />
          </>
        ) : null}
        .
      </p>
    );
  }

  if (a.record_level === "release") {
    const tier = computeTier(a) ?? "unknown";
    const weightRefs = <SourceRefs ids={a.checklist.weights?.source_ids ?? []} sources={s} />;
    const kind = tier === "open-weight" ? "an open-weight" : tier === "open-stack" ? "an open-stack" : tier === "fully-open" ? "an open-system" : "a";
    const license = hasLicense ? (
      <>
        {" "}
        under <LicenseList catalog={catalog} a={a} component="weights" />
      </>
    ) : (
      "; no license is recorded"
    );
    return (
      <p className={CLASS} data-testid="record-lead">
        {a.name} is {kind} model release
        {family ? (
          <>
            {" "}
            in the{" "}
            <Link prefetch={false} href={artifactHref(family.slug)} className="link">
              {family.name}
            </Link>{" "}
            family
          </>
        ) : null}{" "}
        from <Maintainers catalog={catalog} a={a} />
        {when(a)}.{" "}
        {tier === "open-weight" || tier === "fully-open" ? (
          <>
            Its weights can be downloaded by the public{weightRefs}
            {license}.
          </>
        ) : tier === "open-stack" ? (
          <>
            Its weights, inference and training code, and training recipe are public{weightRefs}; the weights are{license}.
          </>
        ) : tier === "restricted-weights" ? (
          <>
            Its weights are available only on request or with approval{weightRefs}
            {hasLicense ? "," : null}
            {license}.
          </>
        ) : tier === "weights-not-public" ? (
          <>Its weights are not public{weightRefs}.</>
        ) : (
          <>The availability of its weights has not been assessed.</>
        )}
      </p>
    );
  }

  // Projects: software, datasets, evaluation tools.
  const isDataset = a.kind === "dataset";
  const kindNoun = a.kind === "eval" ? "evaluation tool" : KIND_LABELS[a.kind].toLowerCase();
  const codeKey = a.kind === "eval" ? "code" : "source_code";
  const open = isDataset ? checklistStatus(a, "access") : checklistStatus(a, codeKey);
  const openRefs = <SourceRefs ids={a.checklist[isDataset ? "access" : codeKey]?.source_ids ?? []} sources={s} />;
  const licenses = hasLicense ? <LicenseList catalog={catalog} a={a} component={isDataset ? "data" : "code"} /> : null;
  const subject = isDataset ? "The data" : a.kind === "eval" ? "Its code" : "Its source code";
  return (
    <p className={CLASS} data-testid="record-lead">
      {a.name} is {article(kindNoun)} {kindNoun} {isDataset ? "from" : "maintained by"} <Maintainers catalog={catalog} a={a} />
      {when(a)}.{" "}
      {open === "public" ? (
        <>
          {subject} {isDataset ? "is publicly available" : "is public"}
          {openRefs}
          {licenses ? <> under {licenses}</> : "; no license is recorded"}.
        </>
      ) : open === "partial" ? (
        <>
          {subject} is partly available or requires approval{openRefs}
          {licenses ? <>; licensed under {licenses}</> : "; no license is recorded"}.
        </>
      ) : licenses ? (
        <>It is licensed under {licenses}.</>
      ) : (
        <>No license is recorded for it.</>
      )}
    </p>
  );
}

/** The headquarters place, with the state linked to its page when the label names one. */
function HeadquartersPlace({ org }: { org: Organization }) {
  const hq = org.headquarters!;
  const { place } = headquartersPhrase(hq.label);
  const code = stateFromHeadquarters(hq.label, hq.country);
  if (!code) return <>{place}</>;
  const href = `/places/${stateSlug(code)}/`;
  const state = US_STATES[code];
  if (place.endsWith(`, ${state}`)) {
    return (
      <>
        {place.slice(0, -state.length)}
        <Link prefetch={false} href={href} className="link">
          {state}
        </Link>
      </>
    );
  }
  return (
    <Link prefetch={false} href={href} className="link">
      {place}
    </Link>
  );
}

export function OrganizationLead({ catalog, org }: { catalog: Catalog; org: Organization }) {
  const out = organizationOutput(catalog, org);
  const hq = org.headquarters ? headquartersPhrase(org.headquarters.label) : null;
  const seen = new Set<string>();
  const licenses = out.licenses.filter((l) => (seen.has(l.name) ? false : (seen.add(l.name), true))).slice(0, 2);
  return (
    <p className={CLASS} data-testid="record-lead">
      {org.name} is {roleDescription(org)}
      {hq ? (
        <>
          {" "}
          {hq.verb} <HeadquartersPlace org={org} />
          <SourceRefs ids={org.headquarters!.source_ids} sources={org.sources} />
        </>
      ) : null}
      .{" "}
      {out.parts.length ? (
        <>
          This catalog lists{" "}
          <a href="#artifacts" className="link">
            {out.parts.length > 1 ? `${out.parts.slice(0, -1).join(", ")}${out.parts.length > 2 ? "," : ""} and ${out.parts[out.parts.length - 1]}` : out.parts[0]}
          </a>{" "}
          from {org.name}
          {licenses.length ? (
            <>
              , under licenses including <Join items={licenses.map((l) => <LicenseName key={l.name} catalog={catalog} license={l} />)} />
            </>
          ) : null}
          .
        </>
      ) : (
        <>No open models or tools from {org.name} are in this catalog yet{org.products.length ? "; its documented products are listed below" : ""}.</>
      )}
    </p>
  );
}
