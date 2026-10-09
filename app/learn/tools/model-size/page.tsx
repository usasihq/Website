import Link from "next/link";
import { ModelSizeCalculator } from "@/components/learn/ModelSizeCalculator";
import { PageHeader } from "@/components/PageHeader";
import { SupportPanel } from "@/components/SupportPanel";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Model size calculator",
  description: "Estimate how much storage a model's weights take at 32, 16, 8, or 4 bits per weight, with the arithmetic shown and what it leaves out.",
  path: "/learn/tools/model-size/",
});

export default function ModelSizePage() {
  return (
    <>
      <PageHeader
        eyebrow="Learn · Tool"
        title="Model size calculator"
        crumbs={[
          { href: "/learn/", label: "Learn" },
          { href: "/learn/tools/model-size/", label: "Model size calculator" },
        ]}
        description={
          <p>
            How much storage do a model&apos;s weights take? Enter the parameter count from a model card and a precision. The answer is arithmetic, not a hardware
            requirement.
          </p>
        }
      />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ModelSizeCalculator />
        <aside className="space-y-6 text-[0.9375rem] text-muted">
          <section aria-labelledby="how-heading">
            <h2 id="how-heading" className="text-base font-semibold text-text">
              How it works
            </h2>
            <p className="mt-2">
              Each parameter is stored as a number. At 16 bits per weight that is 2 bytes, at 8 bits 1 byte, and at 4 bits half a byte. So weight storage is the
              parameter count times the bits per weight, divided by 8. GB here means 1,000,000,000 bytes; GiB means 1,073,741,824 bytes, which some tools report
              instead.
            </p>
          </section>
          <section aria-labelledby="leaves-out-heading">
            <h2 id="leaves-out-heading" className="text-base font-semibold text-text">
              What it leaves out
            </h2>
            <p className="mt-2">
              Running a model also needs working memory that grows with the length of the conversation and the number of requests handled at once. Real quantized files are often somewhat larger than the arithmetic suggests: the quantization explainer describes a 4-bit copy
              as about a quarter to a third the size of a 16-bit original. Use the result as a starting point and check the publisher&apos;s and the
              runtime&apos;s own documentation.
            </p>
          </section>
          <section aria-labelledby="more-heading">
            <h2 id="more-heading" className="text-base font-semibold text-text">
              Read more
            </h2>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/learn/inference-hardware/" className="link">
                  Understanding inference hardware
                </Link>
              </li>
              <li>
                <Link href="/learn/quantization/" className="link">
                  Quantization: fitting models on smaller hardware
                </Link>
              </li>
              <li>
                <Link href="/hubs/local-ai/" className="link">
                  Running AI on your own hardware
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
      <SupportPanel variant="compact" />
    </>
  );
}
