"use client";

import { Printer } from "lucide-react";
import { useEffect } from "react";

/**
 * Prints the page. Collapsed <details> sections are opened for printing
 * (also when printing from the browser menu) and closed again afterwards.
 */
export function PrintButton({ label = "Print", className = "btn btn-secondary" }: { label?: string; className?: string }) {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = [...document.querySelectorAll<HTMLDetailsElement>("main details:not([open])")];
      for (const d of opened) d.open = true;
    };
    const after = () => {
      for (const d of opened) d.open = false;
      opened = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
  return (
    <button type="button" onClick={() => window.print()} className={`${className} print:hidden`}>
      <Printer aria-hidden="true" className="h-4 w-4" />
      {label}
    </button>
  );
}
