"use client";
import { useEffect, useState } from "react";
export function useJobsClock(initial: string) {
  const [now, setNow] = useState(Date.parse(initial));
  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Timer also ages an already-open tab without a new deploy.
    const start = window.setTimeout(tick, 0), interval = window.setInterval(tick, 60000);
    return () => { window.clearTimeout(start); window.clearInterval(interval); };
  }, []);
  return now;
}
