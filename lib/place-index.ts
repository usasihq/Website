import type { Catalog } from "./catalog";
import { stateFromHeadquarters, US_STATES } from "./places";
import type { Organization } from "./schema";

export type StateGroup = { code: string; name: string; organizations: Organization[] };

/** Published organizations grouped by the state in their sourced headquarters label. */
export function organizationsByState(catalog: Catalog): { states: StateGroup[]; unknown: Organization[] } {
  const groups = new Map<string, Organization[]>();
  const unknown: Organization[] = [];
  for (const o of catalog.organizations) {
    const code = stateFromHeadquarters(o.headquarters?.label, o.headquarters?.country);
    if (!code) unknown.push(o);
    else groups.set(code, [...(groups.get(code) ?? []), o]);
  }
  const states = [...groups.entries()]
    .map(([code, organizations]) => ({ code, name: US_STATES[code], organizations }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { states, unknown };
}
