/**
 * Date display that preserves the precision of the evidence:
 * "2025" stays a year, "2025-08" stays a month. No locale or timezone
 * dependence, so server and client render identically.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Unknown";
  const [y, m, d] = value.split("-");
  if (!m) return y;
  const month = MONTHS[Number(m) - 1];
  if (!d) return `${month} ${y}`;
  return `${month} ${Number(d)}, ${y}`;
}

/** Whole days between two YYYY-MM-DD dates (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}
