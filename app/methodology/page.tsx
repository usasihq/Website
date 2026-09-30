import Link from "next/link";
import Content from "@/content/pages/methodology.mdx";
import { EditorialPage } from "@/components/EditorialPage";
import { pageMetadata } from "@/lib/metadata";
import { RUBRIC_LABEL } from "@/lib/openness";

export const metadata = pageMetadata({
  title: "Methodology",
  description:
    "How USASI decides eligibility, describes openness with type-specific checklists and rubric v0.1 tiers, handles sources, dates, uncertainty, and counts.",
  path: "/methodology/",
});

const TOC = [
  ["eligibility", "Eligibility"],
  ["openness", "Openness"],
  ["tiers", "Model-disclosure tiers"],
  ["sources", "Source standards"],
  ["families", "Families and releases"],
  ["dates", "Dates"],
  ["uncertainty", "Uncertainty"],
  ["counts", "How counts work"],
  ["representation", "Equal representation"],
  ["badges", "Reading the badges"],
];

export default function MethodologyPage() {
  return (
    <EditorialPage
      eyebrow={`Methodology · ${RUBRIC_LABEL}`}
      title="Methodology"
      serif={false}
      description={
        <>
          <p>Eligibility, evidence, openness, dates, and counts — the rules every entry follows.</p>
          <nav aria-label="On this page" className="mt-5">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[0.9375rem]">
              {TOC.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="link">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/compact/" className="link">
                  USASI Compact v0.1
                </Link>
              </li>
            </ul>
          </nav>
        </>
      }
    >
      <Content />
    </EditorialPage>
  );
}
