/**
 * URL helpers. Internal routes are written without the base path because
 * next/link adds it; raw asset URLs (images, JSON) need `asset()`.
 */
import { BASE_PATH, SITE_URL, siteConfig } from "./site-config";

export { artifactHref, orgHref } from "./routes";

/** Prefix a public-folder path with the deployment base path. */
export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Absolute URL for canonical links, sitemap entries, and social metadata. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/** "Edit this entry" on GitHub, or null when no repository is configured. */
export function editUrl(contentPath: string): string | null {
  const repo = siteConfig.repository.url;
  if (!repo) return null;
  return `${repo}/edit/${siteConfig.repository.branch}/${contentPath}`;
}

/** New-issue URL using one of the repository's issue forms, or null. */
export function issueUrl(template: "correction.yml" | "new-entry.yml", title: string, extra?: Record<string, string>): string | null {
  const repo = siteConfig.repository.url;
  if (!repo) return null;
  const params = new URLSearchParams({ template, title, ...extra });
  return `${repo}/issues/new?${params.toString()}`;
}

export function repositoryUrl(path = ""): string | null {
  const repo = siteConfig.repository.url;
  if (!repo) return null;
  return path ? `${repo}/blob/${siteConfig.repository.branch}/${path}` : repo;
}
