/**
 * U.S. state pages are built only from each organization's sourced
 * `headquarters.label` (for example "Santa Clara, California"). The state is
 * read from the label's own text; nothing is inferred from offices, facilities,
 * or prose. Labels without an explicit state stay unknown.
 */
export const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut",
  DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const BY_NAME = new Map(Object.entries(US_STATES).map(([code, name]) => [name.toLowerCase(), code]));

export function stateSlug(code: string): string {
  return US_STATES[code].toLowerCase().replace(/[^a-z]+/g, "-");
}

export function stateFromSlug(slug: string): string | undefined {
  return Object.keys(US_STATES).find((code) => stateSlug(code) === slug);
}

/**
 * The state named by a headquarters label, or null. Reads only the part before
 * any parenthetical note; accepts "City, State", "Area, State", "State", and
 * "Washington, D.C.". Labels such as "United States (city not stated ...)" are unknown.
 */
export function stateFromHeadquarters(label: string | null | undefined, country: string | null | undefined): string | null {
  if (!label || country !== "US") return null;
  const main = label.split("(")[0].trim().replace(/\.$/, "");
  if (/^washington,\s*d\.?\s*c\.?$/i.test(main) || /^district of columbia$/i.test(main)) return "DC";
  const parts = main.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return null;
  return BY_NAME.get(parts[parts.length - 1].toLowerCase()) ?? null;
}
