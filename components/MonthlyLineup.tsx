"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { currentMonthUTC, lineupSlugs, monthLabel, type LineupSchedule } from "@/lib/local-corner";

// The month does not change during a visit, so there is nothing to subscribe to.
const subscribe = () => () => {};

/** The month to show: the build month in the static HTML, the current month in the browser. */
function useLineupMonth(buildMonth: string): string {
  return useSyncExternalStore(subscribe, () => currentMonthUTC(), () => buildMonth);
}

export function MonthLabel({ buildMonth, prefix = "" }: { buildMonth: string; prefix?: string }) {
  const month = useLineupMonth(buildMonth);
  return (
    <>
      {prefix}
      {monthLabel(month)}
    </>
  );
}

/**
 * Renders the month's profiles from pre-rendered items. The server renders the
 * build month's lineup (works without JavaScript); the browser switches to the
 * current month's lineup, so rotation needs no rebuild.
 */
export function MonthlyLineup({
  buildMonth,
  poolSlugs,
  schedule,
  items,
  as = "ul",
  className,
  empty,
}: {
  buildMonth: string;
  poolSlugs: string[];
  schedule: LineupSchedule | null;
  items: Record<string, ReactNode>;
  as?: "ul" | "ol";
  className?: string;
  empty?: ReactNode;
}) {
  const month = useLineupMonth(buildMonth);
  const { slugs } = lineupSlugs(month, poolSlugs, schedule);
  if (slugs.length === 0) return <>{empty ?? null}</>;
  const List = as;
  return (
    <List className={className} data-lineup-month={month}>
      {slugs.map((slug) => items[slug])}
    </List>
  );
}
