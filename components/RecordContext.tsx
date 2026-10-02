import Link from "next/link";
import type { RelatedLink } from "@/lib/record-context";
import { Section } from "./PageHeader";

/** "What this catalog does not know" and "Explore related information" for record pages. */
export function RecordContext({ unknowns, related }: { unknowns: string[]; related: RelatedLink[] }) {
  return (
    <>
      {unknowns.length ? (
        <Section
          id="unknowns"
          title="What this catalog does not know"
          description="Unknown means the sources reviewed for this record do not document it. It is not evidence that something does not exist."
        >
          <ul className="list-disc space-y-1.5 pl-5 text-[0.9375rem] text-text">
            {unknowns.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            Have a primary source? <Link href="/contribute/#corrections" className="link">How to report a correction</Link>.
          </p>
        </Section>
      ) : null}
      {related.length ? (
        <Section id="related" title="Explore related information">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.href}>
                <Link prefetch={false} href={r.href} className="card flex h-full flex-col p-4 hover:border-cyan">
                  <span className="meta">{r.note}</span>
                  <span className="mt-1 font-medium text-text">{r.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
