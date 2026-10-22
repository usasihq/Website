import { ExternalLink } from "@/components/ExternalLink";
import type { HiringProcess } from "@/lib/jobs/hiring-process";

/**
 * Short, sourced “how hiring works” note on an employer jobs page. Visible
 * prose only; not Q&A-shaped, so no FAQPage schema.
 */
export function HiringProcessSection({ name, note }: { name: string; note: HiringProcess }) {
  return (
    <section id="how-hiring-works" aria-labelledby="how-hiring-works-heading" className="mt-12 scroll-mt-24" data-testid="hiring-process">
      <h2 id="how-hiring-works-heading" className="text-xl font-semibold text-text sm:text-2xl">
        How hiring works at {name}
      </h2>
      {note.paragraphs.map((p) => (
        <p key={p} className="mt-3 max-w-3xl text-muted">
          {p}
        </p>
      ))}
      {note.steps?.length ? (
        <ol className="mt-4 max-w-3xl list-decimal space-y-1.5 pl-6 text-muted">
          {note.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      <p className="mt-4 max-w-3xl text-sm text-muted">
        From {name}&rsquo;s official pages:{" "}
        {note.sources.map((source, i) => (
          <span key={source.url}>
            {i > 0 ? " · " : null}
            <ExternalLink href={source.url}>{source.title}</ExternalLink>
          </span>
        ))}
        . This is a short summary of those pages. USASI does not recruit or take applications.
      </p>
    </section>
  );
}
