/**
 * Each current job's own page: /jobs/at/<employer>/<title>-<id>/. Client-safe,
 * so the directory can link listings to the same addresses the build creates.
 *
 * The address is the title (readable, for people and search engines) plus a
 * short, stable code from the job's ID, so two postings with the same title
 * never collide. A changed title changes the address; the old one then stops
 * existing, like a closed posting.
 */

/** 32-bit FNV-1a of a string, as 7 base-36 characters. */
export function shortCode(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36).padStart(7, "0").slice(-7);
}

export function titleSlug(title: string): string {
  const s = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Long titles are cut at a word boundary within 70 characters.
  const cut = s.length > 70 ? s.slice(0, 71).replace(/-[^-]*$/, "") : s;
  return cut.replace(/-+$/, "") || "job";
}

export const jobSlug = (job: { id: string; title: string }) => `${titleSlug(job.title)}-${shortCode(job.id)}`;
export const jobHref = (job: { id: string; title: string; organization_slug: string }) => `/jobs/at/${job.organization_slug}/${jobSlug(job)}/`;
