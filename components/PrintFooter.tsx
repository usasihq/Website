"use client";

import { useEffect, useState } from "react";

/**
 * A line printed at the end of every page: where it came from and when, so a
 * printout can be cited and checked later. Hidden on screen. Filled in on the
 * reader's own device; nothing is sent or stored.
 */
export function PrintFooter({ siteName }: { siteName: string }) {
  const [stamp, setStamp] = useState<{ url: string; date: string } | null>(null);
  useEffect(() => {
    const fill = () =>
      setStamp({
        url: `${window.location.origin}${window.location.pathname}`,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      });
    fill();
    window.addEventListener("beforeprint", fill);
    return () => window.removeEventListener("beforeprint", fill);
  }, []);
  if (!stamp) return null;
  return (
    <p className="hidden border-t border-line pt-3 text-sm print:block" data-testid="print-footer">
      Printed from {siteName}: {stamp.url} on {stamp.date}.
    </p>
  );
}
