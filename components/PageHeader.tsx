import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  href: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        <li>
          <Link href="/" className="hover:text-text">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 opacity-60" />
            <Link href={item.href} className="hover:text-text">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b border-line bg-[linear-gradient(180deg,rgba(11,18,36,0.6),transparent)]">
      <div className="container-page pb-10 pt-10 sm:pt-14">
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-semibold text-text sm:text-4xl">{title}</h1>
        {description ? <div className="mt-4 max-w-3xl text-lg text-muted">{description}</div> : null}
        {children}
      </div>
    </header>
  );
}

export function Section({
  id,
  title,
  description,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`scroll-mt-24 ${className}`}>
      <h2 id={headingId} className="text-xl font-semibold text-text sm:text-2xl">
        {title}
      </h2>
      {description ? <div className="mt-2 max-w-3xl text-muted">{description}</div> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
