/**
 * U.S. geography read from employer-supplied job locations, for the Jobs
 * landing pages and the matching /jobs/ filters. Client-safe (no Node imports).
 *
 * Employers type locations freely: "Atlanta, GA", "Atlanta, Georgia, United
 * States", "Remote - US", "San Francisco". Nothing here geocodes or guesses.
 *
 * - A U.S. state is read when the text names it: a postal code after a comma
 *   ("Atlanta, GA", "Mountain View, CA USA"), the full state name ("Atlanta,
 *   Georgia, United States", "Texas"), "New York City"/"NYC" for New York, or
 *   "Washington, DC" for the District of Columbia. A city given alone counts
 *   only when it is in CITY_STATE, a short table of unambiguous U.S. city names
 *   ("San Francisco", "SF Office", "Seattle"); names shared with other places
 *   (Cambridge, Portland, Columbus, Arlington, Kansas City, Washington) are left
 *   out. Country-wide text ("Remote - US") is the United States, not a state.
 * - Each listing's cities are kept as "ST|City" (canonical names from
 *   CITY_STATE, or the city as the employer wrote it before a postal code).
 * - A location is outside the United States only when it names a country,
 *   region, or well-known city outside it ("London, UK", "EMEA", "Toronto").
 * - Postal codes that are also country codes are guarded: "Toronto, CA" is
 *   Canada, "Tel Aviv - IL" is Israel, "Bangalore, IN" is India.
 */
import { US_STATES } from "../places";

export type PlaceGeo = { states: string[]; cities: string[]; us: boolean; outside: boolean };

/**
 * Unambiguous U.S. city names (lowercase, as employers write them alone) and
 * the state and canonical name they stand for. Only names that no other
 * well-known place shares; extend with care and add a test for each.
 */
const CITY_STATE: Record<string, [string, string]> = {
  "san francisco": ["CA", "San Francisco"], "san fransisco": ["CA", "San Francisco"], sf: ["CA", "San Francisco"], "south san francisco": ["CA", "South San Francisco"],
  "san jose": ["CA", "San Jose"], "san mateo": ["CA", "San Mateo"], "santa clara": ["CA", "Santa Clara"], "palo alto": ["CA", "Palo Alto"],
  "mountain view": ["CA", "Mountain View"], fremont: ["CA", "Fremont"], sunnyvale: ["CA", "Sunnyvale"], "menlo park": ["CA", "Menlo Park"],
  "redwood city": ["CA", "Redwood City"], cupertino: ["CA", "Cupertino"], oakland: ["CA", "Oakland"], berkeley: ["CA", "Berkeley"],
  emeryville: ["CA", "Emeryville"], "foster city": ["CA", "Foster City"], "los angeles": ["CA", "Los Angeles"], "san diego": ["CA", "San Diego"],
  irvine: ["CA", "Irvine"], "santa monica": ["CA", "Santa Monica"],
  seattle: ["WA", "Seattle"], bellevue: ["WA", "Bellevue"], redmond: ["WA", "Redmond"], kirkland: ["WA", "Kirkland"],
  "new york": ["NY", "New York"], "new york city": ["NY", "New York"], nyc: ["NY", "New York"], brooklyn: ["NY", "Brooklyn"],
  boston: ["MA", "Boston"], chicago: ["IL", "Chicago"], chi: ["IL", "Chicago"],
  austin: ["TX", "Austin"], dallas: ["TX", "Dallas"], houston: ["TX", "Houston"],
  pittsburgh: ["PA", "Pittsburgh"], philadelphia: ["PA", "Philadelphia"], nashville: ["TN", "Nashville"],
  "st. louis": ["MO", "St. Louis"], "st louis": ["MO", "St. Louis"], "saint louis": ["MO", "St. Louis"],
  atlanta: ["GA", "Atlanta"], denver: ["CO", "Denver"], boulder: ["CO", "Boulder"], miami: ["FL", "Miami"],
  "salt lake city": ["UT", "Salt Lake City"], raleigh: ["NC", "Raleigh"], minneapolis: ["MN", "Minneapolis"],
  "ann arbor": ["MI", "Ann Arbor"], detroit: ["MI", "Detroit"], baltimore: ["MD", "Baltimore"], phoenix: ["AZ", "Phoenix"],
};
/** "San Francisco Bay Area" and "Bay Area" name California but no single city. */
const BAY_AREA = /^(?:san francisco )?bay area$/i;

/**
 * A place part as a city: no "Any Office"/"USA:" prefix, no "Office"/"HQ" suffix, and no
 * Workday site code after a hyphen ("Longmont-MAX- Office" → "Longmont"; "Winston-Salem" stays).
 */
const cityText = (part: string) =>
  part
    .replace(/^(?:any office|usa?|u\.s\.(?:a\.)?)\s*:?\s+/i, "")
    .replace(/\s+(?:office|offices|hq|headquarters|campus)$/i, "")
    .replace(/-[A-Z]{2,5}-?$/, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * City page slugs that changed when city names were cleaned up, old → new ("ST|slug"). The old
 * address keeps working: the build writes a redirect page there, and the directory reads the old
 * slug as the new one.
 */
export const CITY_SLUG_ALIASES: Record<string, string> = { "CO|longmont-max": "CO|longmont" };

/** Text in a city position that is not a city ("Remote, CA", "Multiple Locations, TX"). */
const NOT_A_CITY = /^(?:remote|hybrid|in-office|on-?site|distributed|anywhere|multiple(?: locations)?|various|united states|usa?|u\.s\.(?:a\.)?)?$|\d/i;

/** The table entry for a place part, also when a postal code that agrees follows it ("Mountain View CA", "Mountain View CA USA"). */
function cityLookup(part: string): [string, string] | null {
  const key = cityText(part).toLowerCase();
  if (CITY_STATE[key]) return CITY_STATE[key];
  const m = /^(.*?)\s+([a-z]{2})(?:\s+usa?)?$/.exec(key);
  const hit = m ? CITY_STATE[m[1]] : undefined;
  return hit && hit[0].toLowerCase() === m![2] ? hit : null;
}

/** The canonical name for a city written before a postal code ("san francisco, CA" → "San Francisco"). */
function cityName(city: string, code: string): string {
  const known = cityLookup(city);
  if (known && known[0] === code) return known[1];
  const trimmed = cityText(city);
  return trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()
    ? trimmed.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase())
    : trimmed;
}

/** URL slug for a city name ("St. Louis" → "st-louis"). */
export const citySlug = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** "CA|San Francisco" → "CA|san-francisco": what the directory's city filter and the city pages match on. */
export const cityKey = (city: string) => `${city.slice(0, 2)}|${citySlug(city.slice(3))}`;
/** "CA|San Francisco" → "San Francisco". */
export const cityLabel = (city: string) => city.slice(3);

/** State name for display; the District of Columbia reads as Washington, D.C. */
export const stateDisplayName = (code: string) => (code === "DC" ? "Washington, D.C." : US_STATES[code]);

const NAME_TO_CODE = new Map(
  Object.entries(US_STATES)
    .filter(([code]) => code !== "DC")
    .map(([code, name]) => [name.toLowerCase(), code]),
);

/** Country values as employers' feeds spell the United States. */
export function isUSCountry(value: string): boolean {
  return /^(united states( of america)?|usa?|u\.s\.(a\.)?)$/i.test(value.trim());
}

/** Case-sensitive "US"/"USA" (so "us" in prose never counts); "United States" in any case. */
const hasUSMarker = (s: string) => /\bunited s(?:t)?ates\b/i.test(s) || /(?<![A-Za-z])(?:USA|US|U\.S\.(?:A\.)?)(?![A-Za-z])/.test(s);

/** Countries (not Georgia or Jersey, which are also U.S. names), with U.S. look-alikes excluded. */
const COUNTRIES = [
  "afghanistan", "albania", "algeria", "andorra", "angola", "argentina", "armenia", "australia", "austria", "azerbaijan", "bahrain",
  "bangladesh", "belarus", "belgium", "bolivia", "bosnia", "botswana", "brazil", "brasil", "bulgaria", "cambodia", "cameroon", "canada",
  "chile", "china", "colombia", "costa rica", "croatia", "cyprus", "czech republic", "czechia", "denmark", "dominican republic", "ecuador",
  "egypt", "el salvador", "england", "estonia", "ethiopia", "finland", "france", "germany", "ghana", "greece", "guatemala", "honduras",
  "hong kong", "hungary", "iceland", "india", "indonesia", "iran", "iraq", "ireland", "israel", "italy", "ivory coast", "jamaica",
  "japan", "kazakhstan", "kenya", "korea", "south korea", "kosovo", "kuwait", "latvia", "lithuania", "luxembourg", "macau", "malaysia",
  "malta", "mauritius", "(?<!new )mexico", "méxico", "moldova", "monaco", "mongolia", "montenegro", "morocco", "nepal", "netherlands",
  "new zealand", "nicaragua", "nigeria", "north macedonia", "northern ireland", "norway", "oman", "pakistan", "panama(?! city)",
  "paraguay", "peru", "philippines", "poland", "portugal", "qatar", "romania", "russia", "rwanda", "saudi arabia", "scotland", "senegal",
  "serbia", "singapore", "slovakia", "slovenia", "south africa", "spain", "sri lanka", "sweden", "switzerland", "taiwan", "tanzania",
  "thailand", "the netherlands", "tunisia", "turkey", "türkiye", "uganda", "ukraine", "united arab emirates", "united kingdom", "uruguay",
  "uzbekistan", "venezuela", "vietnam", "viet nam", "wales", "zambia", "zimbabwe",
];
const REGIONS = [
  "africa", "americas", "apac", "apj", "apjc", "asia", "asia pacific", "emea", "emeia", "eu", "europe", "global", "international",
  "latam", "latin america", "middle east", "north america", "oceania", "worldwide", "anywhere",
];
const COUNTRY_RE = new RegExp(`(?<![\\p{L}])(?:${[...COUNTRIES, ...REGIONS].join("|")})(?![\\p{L}])`, "iu");
/** Short country forms used by feeds ("London, UK", "Toronto, CAN", "Munich, GER", "Remote, INT"). */
const COUNTRY_CODE_PART = /^(?:UK|U\.K\.|UAE|KSA|CAN|IND|GER|DEU|AUS|GBR|FRA|JPN|KOR|SGP|BRA|MEX|ISR|IRL|NLD|ESP|ITA|CHE|SWE|INT|EU|IE|IS|NZ|SG|JP|KR|FR|BR|MX|AU|CH|NL|ES|IT|SE|PL|PT|DK|NO|FI|AT|BE|CZ|TW|HK|CN|AE|SA|QA)$/;
/** " - IE" style country codes after a dash ("Dublin - IE", "Tel Aviv - IL"); "- US" is the United States. */
const DASH_COUNTRY = /\s[-–]\s(?:IE|IS|IL|UK|GB|DE|FR|IN|JP|KR|SG|AU|NZ|CA|MX|BR|NL|ES|IT|SE|CH|PL|PT|DK|NO|FI|AT|BE|CZ|TW|HK|CN|AE|SA|QA)(?![A-Za-z])/;
/** Cities and provinces outside the United States, used only when no U.S. state is named beside them. */
const PLACES_OUTSIDE = new RegExp(
  `(?<![\\p{L}])(?:${[
    "london", "dublin", "paris", "amsterdam", "berlin", "munich", "münchen", "hamburg", "frankfurt", "stockholm", "zurich", "zürich",
    "madrid", "barcelona", "lisbon", "milan", "rome", "warsaw", "krakow", "kraków", "prague", "copenhagen", "oslo", "helsinki", "edinburgh",
    "belgrade", "reykjavik", "reykjanesbaer", "tel aviv", "haifa", "jerusalem", "doha", "riyadh", "dubai", "abu dhabi", "tokyo", "osaka",
    "seoul", "taipei", "taoyuan", "hsinchu", "beijing", "shanghai", "shenzhen", "singapore", "bangalore", "bengaluru", "mumbai", "delhi",
    "new delhi", "gurgaon", "gurugram", "noida", "hyderabad", "pune", "chennai", "kolkata", "karnataka", "sydney", "melbourne", "brisbane",
    "perth", "auckland", "toronto", "montreal", "montréal", "vancouver", "ottawa", "calgary", "edmonton", "waterloo", "québec", "quebec",
    "ontario", "british columbia", "alberta", "manitoba", "saskatchewan", "nova scotia", "são paulo", "sao paulo", "rio de janeiro",
    "mexico city", "ciudad de méxico", "cdmx", "querétaro", "queretaro", "guadalajara", "monterrey", "bogotá", "bogota", "medellín",
    "medellin", "buenos aires", "santiago", "lima", "jakarta", "manila", "bangkok", "kuala lumpur", "ho chi minh", "hanoi", "nairobi",
    "lagos", "cairo", "cape town", "johannesburg", "istanbul", "tbilisi", "batumi", "kyiv", "kiev",
  ].join("|")})(?![\\p{L}])`,
  "iu",
);
/**
 * Postal codes that are also another country's code, with that country's cities:
 * "Toronto, CA" is Canada, not California; "Perth, WA" is Australia.
 */
const LOOKALIKE: Record<string, RegExp> = {
  CA: /toronto|vancouver|montr[eé]al|ottawa|calgary|edmonton|waterloo|qu[eé]bec/i,
  IN: /bangalore|bengaluru|mumbai|delhi|hyderabad|pune|chennai|gurgaon|gurugram|noida|kolkata/i,
  IL: /tel aviv|haifa|jerusalem|herzliya/i,
  DE: /berlin|munich|münchen|hamburg|frankfurt|cologne|köln|stuttgart|düsseldorf/i,
  CO: /bogot[aá]|medell[ií]n|cali\b/i,
  AR: /buenos aires|c[oó]rdoba/i,
  ID: /jakarta|bandung|bali/i,
  MA: /casablanca|rabat|marrakesh/i,
  WA: /perth/i,
  TN: /chennai|tunis/i,
  SC: /florian[oó]polis/i,
  PA: /panam[aá]/i,
  AL: /tirana/i,
  GA: /tbilisi|batumi|kutaisi/i,
};

/** One place per piece: "A; B | C / D or E & F". */
function segments(location: string): string[] {
  return location
    .split(/\s*(?:;|\||\/|\s+or\s+|\s+&\s+)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** A comma-separated part without workplace prefixes ("Hybrid- "), parentheticals, or " - US"-style suffixes. */
function bare(part: string): string {
  return part
    .replace(/\([^)]*\)/g, " ")
    .replace(/[()]/g, " ")
    .replace(/^\s*\*?\s*(?:hq|remote|hybrid|on-?site|in-office)\s*[-–:]\s*/i, "")
    .replace(/\s+[-–]\s+.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

const DC = /\bwashington,?\s*d\.?\s?c\b\.?|\bdistrict of columbia\b/i;
const NEW_YORK_CITY = /\bnew york city\b|(?<![A-Za-z])NYC(?![A-Za-z])/i;

function segmentGeo(segment: string, usCountry: boolean): PlaceGeo {
  const parts = segment.split(",").map((p) => p.trim());
  const cleaned = parts.map(bare);
  const found: { code: string; city: string }[] = [];
  cleaned.forEach((p, i) => {
    const city = i > 0 ? cleaned[i - 1] : "";
    // Postal code after a comma: "Atlanta, GA", "Tulsa, OK - US (2)", "Austin, TX 78701", "Mountain View, CA USA".
    const code = /^([A-Z]{2})(?:\s+(?:USA|US|U\.S\.A?\.?))?(?:\s+\d{5}(?:-\d{4})?)?$/.exec(p)?.[1];
    if (code && i > 0 && code in US_STATES) found.push({ code, city });
    // Full name as the last place part, optionally followed only by the country.
    const named = NAME_TO_CODE.get(p.toLowerCase());
    if (named && cleaned.slice(i + 1).every((rest) => hasUSMarker(rest) && rest.length <= 25)) {
      if (named === "WA" && i === 0) return; // "Washington" alone could be the state or D.C.
      if (named === "GA" && i === 0 && !usCountry) return; // "Georgia" alone could be the country
      found.push({ code: named, city });
    }
  });
  if (DC.test(segment)) found.push({ code: "DC", city: "Washington" });
  if (NEW_YORK_CITY.test(segment)) found.push({ code: "NY", city: "New York" });

  // A country named in the place itself ("Toronto, ON, Canada"), not in a city position before a state ("Lebanon, NH").
  const countryNamed = cleaned.some((p, i) => {
    const next = cleaned[i + 1];
    const beforeState = next !== undefined && /^[A-Z]{2}$/.test(next) && next in US_STATES;
    return !beforeState && (COUNTRY_RE.test(p) || (i > 0 && COUNTRY_CODE_PART.test(p)));
  }) || DASH_COUNTRY.test(segment);
  const usNamed = hasUSMarker(segment);
  // A city given without a state: only names in the unambiguous table, and never beside another country.
  const explicit = found.length > 0;
  if (!explicit && !(countryNamed && !usNamed)) {
    for (const p of cleaned) {
      const hit = cityLookup(p);
      if (hit) found.push({ code: hit[0], city: hit[1] });
      else if (BAY_AREA.test(p)) found.push({ code: "CA", city: "" });
    }
  }
  let kept = found.filter((f) => !(LOOKALIKE[f.code]?.test(f.city)));
  if (countryNamed && !usNamed) kept = [];
  const states = [...new Set(kept.map((f) => f.code))];
  const named = kept.map((f) => ({ code: f.code, city: f.city && cityName(f.city, f.code) })).filter((f) => f.city && !NOT_A_CITY.test(f.city));
  const cities = [...new Set(named.map((f) => `${f.code}|${f.city}`))];
  // A city outside the U.S. still counts beside a table city ("San Francisco, London"), not beside a written state ("Paris, TX").
  const cityOutside = PLACES_OUTSIDE.test(segment) && (!explicit || states.length === 0);
  return { states, cities, us: usNamed || states.length > 0, outside: countryNamed || cityOutside };
}

/** What one employer-supplied location string names. */
export function placeGeography(location: string, usCountry = false): PlaceGeo {
  const states = new Set<string>();
  const cities = new Set<string>();
  let us = false;
  let outside = false;
  for (const segment of segments(location)) {
    const g = segmentGeo(segment, usCountry);
    for (const s of g.states) states.add(s);
    for (const c of g.cities) cities.add(c);
    us ||= g.us;
    outside ||= g.outside;
  }
  return { states: [...states].sort(), cities: [...cities].sort(), us, outside };
}

export type JobGeo = PlaceGeo;
export type GeoJob = { locations: string[]; countries: string[] };

const cache = new WeakMap<object, JobGeo>();

/**
 * Geography of a listing from all of its locations and its employer-supplied
 * countries (Ashby feeds list them; Greenhouse feeds do not).
 * - `states`: U.S. states the listing names.
 * - `cities`: U.S. cities it names, as "ST|City".
 * - `us`: it names the United States or a U.S. state.
 * - `outside`: it names a place outside the United States (or a wider region).
 */
export function jobGeography(job: GeoJob): JobGeo {
  const hit = cache.get(job);
  if (hit) return hit;
  const usCountry = job.countries.some(isUSCountry);
  const otherCountry = job.countries.some((c) => !isUSCountry(c));
  const states = new Set<string>();
  const cities = new Set<string>();
  let us = usCountry;
  let outside = otherCountry;
  for (const location of job.locations) {
    const g = placeGeography(location, usCountry);
    for (const s of g.states) states.add(s);
    for (const c of g.cities) cities.add(c);
    us ||= g.us;
    outside ||= g.outside;
  }
  // When the employer's countries for the posting include no U.S. entry, state-like text is not read as a U.S. state.
  if (job.countries.length > 0 && !usCountry) {
    states.clear();
    cities.clear();
  }
  const result = { states: [...states].sort(), cities: [...cities].sort(), us: us || states.size > 0, outside };
  cache.set(job, result);
  return result;
}

/** "U.S. locations only": names the United States or a state, and nothing outside it. */
export const isUSOnly = (job: GeoJob) => {
  const g = jobGeography(job);
  return g.us && !g.outside;
};

export const REMOTE_LOCATION = /\bremote\b/i;
/** The employer marks the workplace as remote, or a listed location says "Remote" ("Remote - US", "Remote-Friendly"). */
export const isRemoteListing = (job: { workplace: string; locations: string[] }) =>
  job.workplace === "remote" || job.locations.some((l) => REMOTE_LOCATION.test(l));

/**
 * Location scopes offered by the Jobs directory (`where=`) and used by the remote landing pages.
 * "us-or-unstated" is the directory's default: listings that name a U.S. place, or name no place
 * at all that can be read ("Remote", "Hybrid"). Only listings located solely outside the United
 * States are left out; "all" shows every listing.
 */
export const LOCATION_SCOPES = ["us-or-unstated", "us", "remote", "remote-us", "all"] as const;
export type LocationScope = (typeof LOCATION_SCOPES)[number];
export const DEFAULT_LOCATION_SCOPE: LocationScope = "us-or-unstated";
export const LOCATION_SCOPE_LABELS: Record<LocationScope, string> = {
  "us-or-unstated": "U.S. (and location not stated)",
  us: "U.S. locations only",
  remote: "Remote, any location",
  "remote-us": "Remote, U.S. locations only",
  all: "All countries",
};
export function inLocationScope(job: GeoJob & { workplace: string }, scope: LocationScope): boolean {
  if (scope === "all") return true;
  if (scope === "us-or-unstated") {
    const g = jobGeography(job);
    return g.us || !g.outside;
  }
  if (scope === "us") return isUSOnly(job);
  if (scope === "remote") return isRemoteListing(job);
  return isRemoteListing(job) && isUSOnly(job);
}

/** Country names as plain text, for reordering "Israel, Tel Aviv" in displayLocation. */
const COUNTRY_NAMES = new Set(COUNTRIES.map((c) => c.replace(/\(\?<?[!=][^)]*\)/g, "")));
/** Short all-caps region names that are not words to recase. */
const KEEP_CAPS = new Set(["EMEA", "EMEIA", "APAC", "APJC", "LATAM", "AMER", "AMERICAS", "NORAM", "DACH", "CEMEA"]);
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

/**
 * An employer-supplied location tidied for display only; matching and filters
 * keep the raw text. Empty parts are dropped ("Aarhus, , Denmark" → "Aarhus,
 * Denmark"), all-capital place names beside other parts are recased ("San
 * Diego, CALIFORNIA, United States" → "San Diego, California, United States";
 * "AUSTIN, TX" → "Austin, TX"), and a country given first is moved last
 * ("India, Bengaluru" and "Netherlands - Amsterdam" → "Bengaluru, India").
 * Nothing is added: a place without a country ("Yokneam") stays as written.
 */
export function displayLocation(location: string): string {
  let parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    parts = parts.map((p) => (/^[A-Z][A-Z .'-]{3,}$/.test(p) && !KEEP_CAPS.has(p) && p.replace(/[^A-Z]/g, "").length >= 4 ? titleCase(p) : p));
  }
  let t = parts.join(", ");
  const m = /^([A-Za-z][A-Za-z .'-]*?)\s*(?:,|\s[-–]\s)\s*([^,]+)$/.exec(t);
  if (m && COUNTRY_NAMES.has(m[1].toLowerCase()) && !COUNTRY_NAMES.has(m[2].trim().toLowerCase()) && !/\bremote\b/i.test(m[2])) t = `${m[2].trim()}, ${m[1]}`;
  return t || location.replace(/[\s,]+/g, " ").trim();
}
