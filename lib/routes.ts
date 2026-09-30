/** Internal route builders. Dependency-free so client components can use them. */
export const orgHref = (slug: string) => `/companies/${slug}/`;
export const artifactHref = (slug: string) => `/open/${slug}/`;
export const companiesHref = (query = "") => (query ? `/companies/?${query}` : "/companies/");
export const openHref = (query = "") => (query ? `/open/?${query}` : "/open/");

export const jobsHref = (query = "") => (query ? `/jobs/?${query}` : "/jobs/");
