"use client";

import { useEffect, useState } from "react";

/**
 * "On this page" list for long-form pages. The section currently in view is
 * marked with aria-current so readers can see where they are; without
 * JavaScript it is a plain list of anchor links.
 */
export function TableOfContents({ headings }: { headings: { id: string; title: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // The first heading in document order that is in the reading band wins;
        // between headings, keep the last one passed.
        const first = targets.find((t) => visible.has(t.id));
        if (first) setActive(first.id);
        else {
          const passed = targets.filter((t) => t.getBoundingClientRect().top < 120);
          if (passed.length) setActive(passed[passed.length - 1].id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <ol className="space-y-1 border-l border-line text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            aria-current={active === h.id ? "location" : undefined}
            className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-muted transition-colors hover:text-text aria-[current=location]:border-cyan aria-[current=location]:text-text"
          >
            {h.title}
          </a>
        </li>
      ))}
    </ol>
  );
}
