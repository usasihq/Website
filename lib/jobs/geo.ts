/**
 * U.S. geography read from employer-supplied job locations, for the Jobs
 * landing pages and the matching /jobs/ filters. Client-safe (no Node imports).
 *
 * Employers type locations freely: "Atlanta, GA", "Atlanta, Georgia, United
 * States", "Remote - US", "San Francisco". Nothing here geocodes or guesses.
 *
 * - A U.S. state is read only when the text names it: a postal code after a
 *   comma ("Atlanta, GA"), the full state name ("Atlanta, Georgia, United
 *   States", "Texas"), "New York City"/"NYC" for New York, or "Washington, DC"
 *   for the District of Columbia. A city alone ("San Francisco") names no
 *   state, and country-wide text ("Remote - US") is the United States, not a state.
 * - A location is outside the United States only when it names a country,
 *   region, or well-known city outside it ("London, UK", "EMEA", "Toronto").
 * - Postal codes that are also country codes are guarded: "Toronto, CA" is
 *   Canada, "Tel Aviv - IL" is Israel, "Bangalore, IN" is India.
 */
import { US_STATES } from "../places";

export type PlaceGeo = { states: string[]; us: boolean; outside: boolean };

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
    // Postal code after a comma: "Atlanta, GA", "Tulsa, OK - US (2)", "Austin, TX 78701".
    const code = /^([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?$/.exec(p)?.[1];
    if (code && i > 0 && code in US_STATES) found.push({ code, city });
    // Full name as the last place part, optionally followed only by the country.
    const named = NAME_TO_CODE.get(p.toLowerCase());
    if (named && cleaned.slice(i + 1).every((rest) => hasUSMarker(rest) && rest.length <= 25)) {
      if (named === "WA" && i === 0) return; // "Washington" alone could be the state or D.C.
      if (named === "GA" && i === 0 && !usCountry) return; // "Georgia" alone could be the country
      found.push({ code: named, city });
    }
  });
  if (DC.test(segment)) found.push({ code: "DC", city: "" });
  if (NEW_YORK_CITY.test(segment)) found.push({ code: "NY", city: "" });

  // A country named in the place itself ("Toronto, ON, Canada"), not in a city position before a state ("Lebanon, NH").
  const countryNamed = cleaned.some((p, i) => {
    const next = cleaned[i + 1];
    const beforeState = next !== undefined && /^[A-Z]{2}$/.test(next) && next in US_STATES;
    return !beforeState && (COUNTRY_RE.test(p) || (i > 0 && COUNTRY_CODE_PART.test(p)));
  }) || DASH_COUNTRY.test(segment);
  const usNamed = hasUSMarker(segment);
  let states = found.filter((f) => !(LOOKALIKE[f.code]?.test(f.city))).map((f) => f.code);
  if (countryNamed && !usNamed) states = [];
  const cityOutside = PLACES_OUTSIDE.test(segment) && states.length === 0;
  return { states, us: usNamed || states.length > 0, outside: countryNamed || cityOutside };
}

/** What one employer-supplied location string names. */
export function placeGeography(location: string, usCountry = false): PlaceGeo {
  const states = new Set<string>();
  let us = false;
  let outside = false;
  for (const segment of segments(location)) {
    const g = segmentGeo(segment, usCountry);
    for (const s of g.states) states.add(s);
    us ||= g.us;
    outside ||= g.outside;
  }
  return { states: [...states].sort(), us, outside };
}

export type JobGeo = PlaceGeo;
export type GeoJob = { locations: string[]; countries: string[] };

const cache = new WeakMap<object, JobGeo>();

/**
 * Geography of a listing from all of its locations and its employer-supplied
 * countries (Ashby feeds list them; Greenhouse feeds do not).
 * - `states`: U.S. states the listing names.
 * - `us`: it names the United States or a U.S. state.
 * - `outside`: it names a place outside the United States (or a wider region).
 */
export function jobGeography(job: GeoJob): JobGeo {
  const hit = cache.get(job);
  if (hit) return hit;
  const usCountry = job.countries.some(isUSCountry);
  const otherCountry = job.countries.some((c) => !isUSCountry(c));
  const states = new Set<string>();
  let us = usCountry;
  let outside = otherCountry;
  for (const location of job.locations) {
    const g = placeGeography(location, usCountry);
    for (const s of g.states) states.add(s);
    us ||= g.us;
    outside ||= g.outside;
  }
  // When the employer's countries for the posting include no U.S. entry, state-like text is not read as a U.S. state.
  if (job.countries.length > 0 && !usCountry) states.clear();
  const result = { states: [...states].sort(), us: us || states.size > 0, outside };
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

/** Location scopes offered by the Jobs directory (`where=`) and used by the remote landing pages. */
export const LOCATION_SCOPES = ["us", "remote", "remote-us"] as const;
export type LocationScope = (typeof LOCATION_SCOPES)[number];
export const LOCATION_SCOPE_LABELS: Record<LocationScope, string> = {
  us: "U.S. locations only",
  remote: "Remote, any location",
  "remote-us": "Remote, U.S. locations only",
};
export function inLocationScope(job: GeoJob & { workplace: string }, scope: LocationScope): boolean {
  if (scope === "us") return isUSOnly(job);
  if (scope === "remote") return isRemoteListing(job);
  return isRemoteListing(job) && isUSOnly(job);
}
