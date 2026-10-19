/**
 * Writes each current job's page (out/jobs/at/<employer>/<slug>/index.html)
 * after `next build` and before scripts/postbuild.mjs adds the per-page CSP.
 * See lib/jobs/job-page-html.ts for why these are plain HTML.
 *
 * The stylesheet, font, and icon links are copied from the built /jobs/ page,
 * so job pages always use the same assets as the rest of the export.
 */
import fs from "node:fs";
import path from "node:path";
import { getCatalog } from "../lib/catalog";
import { renderJobPage, type PageShell } from "../lib/jobs/job-page-html";
import { jobPages, similarJobs } from "../lib/jobs/job-pages";
import { CITY_SLUG_ALIASES } from "../lib/jobs/geo";
import { stateSlug } from "../lib/places";
import { renderLlmsTxt } from "../lib/llms-txt";
import { absoluteUrl, asset } from "../lib/paths";

const out = path.join(process.cwd(), "out");
const template = fs.readFileSync(path.join(out, "jobs/index.html"), "utf8");
const htmlClass = /<html[^>]*\bclass="([^"]*)"/.exec(template)?.[1] ?? "";
const links = [...template.matchAll(/<link\b[^>]*>/g)]
  .map((m) => m[0])
  .filter((l) => /rel="(stylesheet|icon|apple-touch-icon)"/.test(l) || (/rel="preload"/.test(l) && /as="font"/.test(l)));
if (!links.some((l) => l.includes('rel="stylesheet"'))) throw new Error("job-pages: no stylesheet found in out/jobs/index.html");
const shell: PageShell = { htmlClass, links: links.join("\n") };

const pages = jobPages(getCatalog());
const similar = similarJobs(pages);
let withDescription = 0;
let withPosting = 0;
for (const p of pages) {
  const dir = path.join(out, p.path);
  if (fs.existsSync(path.join(dir, "index.html"))) throw new Error(`job-pages: ${p.path} would overwrite an existing page`);
  fs.mkdirSync(dir, { recursive: true });
  const html = renderJobPage(p, shell, similar.get(p.path) ?? []);
  fs.writeFileSync(path.join(dir, "index.html"), html);
  if (p.description) withDescription++;
  if (html.includes('"@type":"JobPosting"')) withPosting++;
}
console.log(`job-pages: ${pages.length} pages written (${withDescription} with the employer's description, ${withPosting} with JobPosting data).`);

// Sitemaps: Next writes the site's other pages to out/sitemap.xml (app/sitemap.ts). That file becomes
// /sitemap-pages.xml, job pages with the employer's description go into /sitemaps/jobs-<n>.xml
// (10,000 each), and /sitemap.xml becomes the index of all of them (robots.txt already names it).
const xmlEsc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pagesMap = path.join(out, "sitemap.xml");
if (!fs.readFileSync(pagesMap, "utf8").includes("<urlset")) throw new Error("job-pages: out/sitemap.xml is not the page sitemap");
fs.renameSync(pagesMap, path.join(out, "sitemap-pages.xml"));
const listed = pages.filter((p) => p.description);
const CHUNK = 10000;
fs.mkdirSync(path.join(out, "sitemaps"), { recursive: true });
const children = [absoluteUrl("/sitemap-pages.xml")];
for (let i = 0, n = 0; i < listed.length; i += CHUNK, n++) {
  const urls = listed.slice(i, i + CHUNK).map((p) => `<url>\n<loc>${xmlEsc(absoluteUrl(p.path))}</loc>\n<lastmod>${(p.job.posted_at ?? p.job.first_seen).slice(0, 10)}</lastmod>\n</url>`);
  fs.writeFileSync(path.join(out, `sitemaps/jobs-${n}.xml`), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
  children.push(absoluteUrl(`/sitemaps/jobs-${n}.xml`));
}
fs.writeFileSync(pagesMap, `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${children.map((c) => `<sitemap><loc>${xmlEsc(c)}</loc></sitemap>`).join("\n")}\n</sitemapindex>\n`);
console.log(`job-pages: sitemap index with ${children.length} sitemaps (${listed.length} job pages in ${children.length - 1} files).`);

// /llms.txt: rewrite whatever Next emitted so the file is always a markdown
// document at the site root (not a directory), using the current sitemap sections.
{
  const llmsPath = path.join(out, "llms.txt");
  if (fs.existsSync(llmsPath) && fs.lstatSync(llmsPath).isDirectory()) fs.rmSync(llmsPath, { recursive: true });
  fs.writeFileSync(llmsPath, renderLlmsTxt(getCatalog()));
}

// Renamed city pages: the old address points to the new one (no script; a plain refresh and link).
for (const [from, to] of Object.entries(CITY_SLUG_ALIASES)) {
  const [code, oldSlug] = from.split("|");
  const target = `/jobs/in/${stateSlug(code)}/${to.slice(3)}/`;
  const dir = path.join(out, `jobs/in/${stateSlug(code)}/${oldSlug}`);
  if (!fs.existsSync(path.join(out, target, "index.html")) || fs.existsSync(path.join(dir, "index.html"))) continue;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>This page moved</title><meta name="robots" content="noindex, follow"/>
<link rel="canonical" href="${absoluteUrl(target)}"/><meta http-equiv="refresh" content="0; url=${asset(target)}"/>
${shell.links}</head>
<body><main class="container-page py-16"><p>This page moved to <a class="link" href="${asset(target)}">${target}</a>.</p></main></body></html>
`);
  console.log(`job-pages: ${oldSlug} now points to ${target}`);
}
