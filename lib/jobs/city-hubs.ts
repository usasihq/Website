/**
 * Config-driven metro / city-hub job pages at /jobs/in/<city>/.
 *
 * These sit at the same URL level as state pages and can span more than one
 * city or state (Memphis, TN and Southaven, MS). Single-city pages generated
 * from listing counts stay at /jobs/in/<state>/<city>/.
 *
 * A hub is emitted only when its live listing count meets MIN_CITY_HUB_LISTINGS.
 * Add San Francisco, New York, Seattle, and others here when they should get a
 * hub page; slugs must not collide with a U.S. state slug (`new-york` is New
 * York State).
 */
import { cityKey, jobGeography, type GeoJob } from "./geo";
import { stateSlug, US_STATES } from "../places";

export type CityHubPlace = {
  /** Postal code, e.g. "TN". */
  state: string;
  /** Directory city slug, e.g. "memphis". */
  slug: string;
  /** Display name as listings usually spell it. */
  label: string;
};

export type CityHubConfig = {
  /** URL segment at /jobs/in/<slug>/. */
  slug: string;
  /** Short name for breadcrumbs, chips, and links. */
  name: string;
  h1: string;
  /** Title leads tried longest-first by openingsTitle. */
  titleLeads: string[];
  places: CityHubPlace[];
};

/** A hub page needs at least this many current listings; fewer would be a thin page. */
export const MIN_CITY_HUB_LISTINGS = 10;

export const CITY_HUBS: readonly CityHubConfig[] = [
  {
    slug: "memphis",
    name: "Memphis–Southaven",
    h1: "AI & tech jobs in Memphis, TN",
    titleLeads: ["AI & tech jobs in Memphis, TN", "AI jobs in Memphis, TN"],
    places: [
      { state: "TN", slug: "memphis", label: "Memphis" },
      { state: "MS", slug: "southaven", label: "Southaven" },
    ],
  },
];

export function cityHubPlaceKey(place: Pick<CityHubPlace, "state" | "slug">): string {
  return `${place.state}|${place.slug}`;
}

export function cityHubBySlug(slug: string): CityHubConfig | undefined {
  return CITY_HUBS.find((h) => h.slug === slug);
}

export function formatCityHubPlaces(places: readonly CityHubPlace[]): string {
  const names = places.map((p) => `${p.label}, ${p.state}`);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function listingMatchesCityHub(job: GeoJob, hub: Pick<CityHubConfig, "places">): boolean {
  const keys = new Set(hub.places.map(cityHubPlaceKey));
  return jobGeography(job).cities.some((c) => keys.has(cityKey(c)));
}

/** Hubs whose listing count meets the thin-page threshold. */
export function selectCityHubs<T extends { slug: string }>(
  hubs: readonly T[],
  countOf: (hub: T) => number,
  min = MIN_CITY_HUB_LISTINGS,
): T[] {
  return hubs.filter((hub) => countOf(hub) >= min);
}

const STATE_SLUGS = new Set(Object.keys(US_STATES).map(stateSlug));

for (const hub of CITY_HUBS) {
  if (STATE_SLUGS.has(hub.slug)) {
    throw new Error(`city hub slug "${hub.slug}" collides with a U.S. state page`);
  }
  if (!hub.places.length) throw new Error(`city hub "${hub.slug}" has no places`);
  for (const place of hub.places) {
    if (!(place.state in US_STATES)) throw new Error(`city hub "${hub.slug}" has unknown state ${place.state}`);
  }
}
