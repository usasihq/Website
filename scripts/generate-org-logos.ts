/**
 * Writes one 128×128 PNG per catalog organization to public/images/orgs/.
 *
 * Prefer a checked-in mark from assets/org-logos/<slug>.png (fetched from the
 * company's own site by scripts/fetch-org-logos.ts). When none exists, draw a
 * monogram from logo_text so JobPosting hiringOrganization.logo is never empty.
 * No network. Safe to run on every prepare:data / build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadCatalog } from "../lib/catalog";
import { ORG_LOGO_PUBLIC_DIR, ORG_LOGO_SIZE } from "../lib/org-logos";
import type { Organization } from "../lib/schema";

export const SOURCE_DIR = "assets/org-logos";
export const PUBLIC_REL = ORG_LOGO_PUBLIC_DIR.replace(/^\//, "");

const MIN_SOURCE = 16;

function monogramSvg(text: string): Buffer {
  const label = text.replace(/[<>&]/g, "");
  const size = label.length >= 3 ? 42 : label.length === 2 ? 52 : 64;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ORG_LOGO_SIZE}" height="${ORG_LOGO_SIZE}" viewBox="0 0 ${ORG_LOGO_SIZE} ${ORG_LOGO_SIZE}">
  <rect width="${ORG_LOGO_SIZE}" height="${ORG_LOGO_SIZE}" rx="18" fill="#0b1a2e"/>
  <rect x="1" y="1" width="${ORG_LOGO_SIZE - 2}" height="${ORG_LOGO_SIZE - 2}" rx="17" fill="none" stroke="#3d6b8c" stroke-width="2"/>
  <text x="64" y="76" text-anchor="middle" fill="#c9d7e8" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="${size}" font-weight="500">${label}</text>
</svg>`;
  return Buffer.from(svg);
}

export async function rasterizeSource(file: string): Promise<Buffer> {
  const img = sharp(file, { failOn: "error" }).rotate();
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w < MIN_SOURCE || h < MIN_SOURCE) throw new Error(`source too small (${w}×${h})`);
  return img
    .resize(ORG_LOGO_SIZE, ORG_LOGO_SIZE, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();
}

export async function rasterizeMonogram(text: string): Promise<Buffer> {
  return sharp(monogramSvg(text)).png().toBuffer();
}

export type OrgLogoWrite = { slug: string; source: "company-site" | "monogram"; bytes: number };

export async function writeOrgLogos(
  orgs: Pick<Organization, "slug" | "logo_text">[],
  opts: { sourceDir: string; publicDir: string },
): Promise<OrgLogoWrite[]> {
  fs.mkdirSync(opts.publicDir, { recursive: true });
  const written: OrgLogoWrite[] = [];
  const wanted = new Set<string>();
  for (const org of orgs) {
    const dest = path.join(opts.publicDir, `${org.slug}.png`);
    wanted.add(`${org.slug}.png`);
    const source = path.join(opts.sourceDir, `${org.slug}.png`);
    let buf: Buffer;
    let kind: OrgLogoWrite["source"] = "monogram";
    if (fs.existsSync(source)) {
      try {
        buf = await rasterizeSource(source);
        kind = "company-site";
      } catch {
        buf = await rasterizeMonogram(org.logo_text);
      }
    } else {
      buf = await rasterizeMonogram(org.logo_text);
    }
    fs.writeFileSync(dest, buf);
    written.push({ slug: org.slug, source: kind, bytes: buf.length });
  }
  for (const name of fs.readdirSync(opts.publicDir)) {
    if (!name.endsWith(".png") || wanted.has(name)) continue;
    fs.rmSync(path.join(opts.publicDir, name), { force: true });
  }
  return written;
}

export async function generateOrgLogos(
  root = process.cwd(),
): Promise<{ written: OrgLogoWrite[]; companySite: number; monogram: number }> {
  const catalog = loadCatalog(path.join(root, "content"), { today: new Date().toISOString().slice(0, 10) });
  const orgs = [...catalog.organizations, ...catalog.archivedOrganizations];
  const written = await writeOrgLogos(orgs, {
    sourceDir: path.join(root, SOURCE_DIR),
    publicDir: path.join(root, "public", PUBLIC_REL),
  });
  const companySite = written.filter((w) => w.source === "company-site").length;
  const monogram = written.length - companySite;
  console.log(
    `org-logos: ${written.length} PNGs (${companySite} from company-site assets, ${monogram} monograms) → public/${PUBLIC_REL}`,
  );
  return { written, companySite, monogram };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateOrgLogos();
}
