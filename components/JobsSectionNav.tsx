import Link from "@/components/Link";
import { HIRING_INDEX_HREF } from "@/lib/jobs/hiring-index";

const ITEMS = [
  { href: "/jobs/", label: "All jobs" },
  { href: HIRING_INDEX_HREF, label: "Hiring Index" },
  { href: "/jobs/layoffs/", label: "WARN layoffs" },
] as const;

/** Jobs / Hiring Index / WARN — the jobs-area nav on those three pages. */
export function JobsSectionNav({ current }: { current: (typeof ITEMS)[number]["href"] }) {
  return (
    <nav aria-label="Jobs pages" className="mt-5" data-testid="jobs-section-nav">
      <ul className="flex flex-wrap gap-2">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              prefetch={false}
              href={item.href}
              aria-current={item.href === current ? "page" : undefined}
              className={`badge min-h-11 px-3 hover:border-cyan ${item.href === current ? "border-cyan bg-cyan/10 text-text" : ""}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
