/**
 * Local corner lineup selection. Client-safe and pure, so the build and the
 * visitor's browser pick exactly the same five profiles for a given month.
 * The browser uses the current month, so the lineup rotates on the 1st of each
 * month without a rebuild or deploy.
 */
export interface LineupSchedule {
  lineups: Array<{ month: string; people: string[] }>;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Current month as YYYY-MM in UTC (the same clock the build uses). */
export function currentMonthUTC(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

/**
 * The editor's lineup for the month when one is scheduled, otherwise a
 * deterministic rotation through the published pool (sorted by slug),
 * advancing five places each month.
 */
export function lineupSlugs(
  month: string,
  poolSlugs: string[],
  schedule: LineupSchedule | null,
): { slugs: string[]; source: "schedule" | "rotation" } {
  const pool = [...poolSlugs].sort((a, b) => a.localeCompare(b));
  const scheduled = schedule?.lineups.find((l) => l.month === month);
  if (scheduled) return { slugs: scheduled.people.filter((s) => pool.includes(s)), source: "schedule" };
  if (pool.length <= 5) return { slugs: pool, source: "rotation" };
  const [y, m] = month.split("-").map(Number);
  const offset = ((y * 12 + (m - 1)) * 5) % pool.length;
  return { slugs: Array.from({ length: 5 }, (_, i) => pool[(offset + i) % pool.length]), source: "rotation" };
}
