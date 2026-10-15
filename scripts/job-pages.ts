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
import { jobPages } from "../lib/jobs/job-pages";

const out = path.join(process.cwd(), "out");
const template = fs.readFileSync(path.join(out, "jobs/index.html"), "utf8");
const htmlClass = /<html[^>]*\bclass="([^"]*)"/.exec(template)?.[1] ?? "";
const links = [...template.matchAll(/<link\b[^>]*>/g)]
  .map((m) => m[0])
  .filter((l) => /rel="(stylesheet|icon|apple-touch-icon)"/.test(l) || (/rel="preload"/.test(l) && /as="font"/.test(l)));
if (!links.some((l) => l.includes('rel="stylesheet"'))) throw new Error("job-pages: no stylesheet found in out/jobs/index.html");
const shell: PageShell = { htmlClass, links: links.join("\n") };

const pages = jobPages(getCatalog());
let withDescription = 0;
let withPosting = 0;
for (const p of pages) {
  const dir = path.join(out, p.path);
  if (fs.existsSync(path.join(dir, "index.html"))) throw new Error(`job-pages: ${p.path} would overwrite an existing page`);
  fs.mkdirSync(dir, { recursive: true });
  const html = renderJobPage(p, shell);
  fs.writeFileSync(path.join(dir, "index.html"), html);
  if (p.description) withDescription++;
  if (html.includes('"@type":"JobPosting"')) withPosting++;
}
console.log(`job-pages: ${pages.length} pages written (${withDescription} with the employer's description, ${withPosting} with JobPosting data).`);
