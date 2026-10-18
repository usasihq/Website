"use client";

import { List } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * A "Sections" menu that appears beside "Back to top" once a reader is well
 * down a long record page, so any section is one tap away from anywhere.
 * Plain links to the page's own section ids; nothing is stored.
 */
export function SectionJump({ sections }: { sections: { id: string; label: string }[] }) {
  const [visible, setVisible] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const show = window.scrollY > 1400;
        setVisible(show);
        if (!show && detailsRef.current) detailsRef.current.open = false;
      });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && detailsRef.current?.open) {
        detailsRef.current.open = false;
        detailsRef.current.querySelector("summary")?.focus();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKey);
    onScroll(); // a page opened mid-way (a #section link, a restored position) shows it at once
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  if (sections.length < 3) return null;
  return (
    <details
      ref={detailsRef}
      className={`group fixed bottom-5 left-5 z-30 print:hidden ${visible ? "opacity-100" : "pointer-events-none opacity-0"} transition-opacity duration-200`}
      aria-hidden={!visible}
      data-testid="section-jump"
    >
      <summary
        tabIndex={visible ? 0 : -1}
        className="inline-flex h-11 cursor-pointer list-none items-center gap-1.5 rounded-full border border-line-strong bg-float px-4 text-sm text-text shadow-float backdrop-blur hover:border-cyan [&::-webkit-details-marker]:hidden"
      >
        <List aria-hidden="true" className="h-4 w-4" />
        Sections
      </summary>
      <nav aria-label="Jump to a section" className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-line-strong bg-float p-2 shadow-float">
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:bg-cyan/8 hover:text-text"
                onClick={() => {
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
