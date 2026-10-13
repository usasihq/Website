/** Internal route builders. Dependency-free so client components can use them. */
export const orgHref = (slug: string) => `/companies/${slug}/`;
export const artifactHref = (slug: string) => `/open/${slug}/`;
export const companiesHref = (query = "") => (query ? `/companies/?${query}` : "/companies/");
export const openHref = (query = "") => (query ? `/open/?${query}` : "/open/");

/** A profile in the People directory; Big SI leaders keep their /big-si/ pages. */
export const personHref = (slug: string) => `/people/${slug}/`;
export const leaderHref = (slug: string) => `/big-si/${slug}/`;

export const jobsHref = (query = "") => (query ? `/jobs/?${query}` : "/jobs/");
