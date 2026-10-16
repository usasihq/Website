/**
 * The Jobs search box's "Where" field: plain words become the directory's
 * location filters. "Remote" and "Remote US" pick the remote scopes, a state
 * name or code picks the state, "City, ST" picks a city in that state, and
 * anything else is matched against the employer-supplied location text.
 */
import { US_STATES } from "../places";
import { citySlug, stateDisplayName, type LocationScope } from "./geo";

export type WhereFilters = { where: LocationScope | ""; state: string; city: string; location: string };
export const EMPTY_WHERE: WhereFilters = { where: "", state: "", city: "", location: "" };

const norm = (s: string) => s.toLowerCase().replace(/[.]/g, "").replace(/\s+/g, " ").trim();
const STATE_BY_NAME = new Map<string, string>();
for (const [code, name] of Object.entries(US_STATES)) {
  STATE_BY_NAME.set(norm(name), code);
  STATE_BY_NAME.set(code.toLowerCase(), code);
}
STATE_BY_NAME.set("washington dc", "DC");
STATE_BY_NAME.set("washington, dc", "DC");
STATE_BY_NAME.set("dc", "DC");

function stateCode(text: string): string | null {
  return STATE_BY_NAME.get(norm(text)) ?? null;
}

export function parseWhere(text: string): WhereFilters {
  const t = text.trim();
  if (!t) return EMPTY_WHERE;
  const n = norm(t);
  if (/^(remote|anywhere|work from home|wfh)$/.test(n)) return { ...EMPTY_WHERE, where: "remote" };
  if (/^remote[ ,(-]*(us|usa|united states|u s)\)?$/.test(n) || n === "us remote") return { ...EMPTY_WHERE, where: "remote-us" };
  if (/^(us|usa|united states|u s|america)$/.test(n)) return { ...EMPTY_WHERE, where: "us" };
  if (/^(washington,? ?dc|washington dc|dc)$/.test(n)) return { ...EMPTY_WHERE, state: "DC" };
  const state = stateCode(t);
  if (state) return { ...EMPTY_WHERE, state };
  const comma = t.lastIndexOf(",");
  if (comma > 0) {
    const cityPart = t.slice(0, comma).trim();
    const st = stateCode(t.slice(comma + 1));
    if (st && cityPart) return { ...EMPTY_WHERE, state: st, city: citySlug(cityPart) };
  }
  return { ...EMPTY_WHERE, location: t.slice(0, 120) };
}

/** The text a set of location filters reads as in the "Where" box. */
export function whereText(f: WhereFilters, cityName = ""): string {
  if (f.where === "remote") return "Remote";
  if (f.where === "remote-us") return "Remote (U.S.)";
  if (f.where === "us") return "United States";
  if (f.state && f.city) return `${cityName || f.city.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}, ${f.state}`;
  if (f.state) return stateDisplayName(f.state);
  return f.location;
}
