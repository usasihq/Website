"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * A small "Back to top" button that appears once a reader is well down a long
 * page (record pages with an in-depth guide run to many screens). It returns
 * focus to the start of the main content.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(window.scrollY > 1400));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <button
      type="button"
      onClick={() => {
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className={`fixed bottom-5 right-5 z-30 inline-flex h-11 items-center gap-1.5 rounded-full border border-line-strong bg-[rgba(10,16,36,0.92)] px-4 text-sm text-text shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-200 hover:border-cyan print:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      data-testid="back-to-top"
    >
      <ArrowUp aria-hidden="true" className="h-4 w-4" />
      Top
    </button>
  );
}
