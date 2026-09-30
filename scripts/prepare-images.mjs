#!/usr/bin/env node
/**
 * npm run prepare:images
 *
 * Generates responsive derivatives of the supplied artwork. The original in
 * assets/original/ is never modified. Derivatives are only ever downscaled —
 * the largest output equals the original's native width (1672 px); nothing is
 * upscaled, because upscaling cannot add real detail.
 *
 * Outputs (committed to the repository):
 *   public/hero.png                     byte-identical copy of the original
 *   public/images/hero/hero-<w>.{avif,webp,jpg}
 *   public/og.png                       1200×630 social card (cropped from the bottom)
 *   app/apple-icon.png                  180×180 touch icon rendered from app/icon.svg
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const ORIGINAL = path.join(root, "assets/original/USA SUPER LOGO.png");
const EXPECTED_SHA256 = "92dade47de878d42fcccf4e78f22dfa1f3ac0815300387be73e348745dc51736";
const WIDTHS = [640, 960, 1280, 1672];

const buffer = fs.readFileSync(ORIGINAL);
const sha = createHash("sha256").update(buffer).digest("hex");
if (sha !== EXPECTED_SHA256) {
  console.warn(`warning: original artwork hash changed (${sha}). Update EXPECTED_SHA256 and THIRD_PARTY_NOTICES.md if this is intentional.`);
}

const meta = await sharp(buffer).metadata();
console.log(`original: ${meta.width}×${meta.height} ${meta.format}`);

const outDir = path.join(root, "public/images/hero");
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(ORIGINAL, path.join(root, "public/hero.png"));

for (const width of WIDTHS) {
  if (width > meta.width) {
    console.log(`skip ${width}: larger than the original`);
    continue;
  }
  const base = sharp(buffer).resize({ width, withoutEnlargement: true });
  await base.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(outDir, `hero-${width}.avif`));
  await base.clone().webp({ quality: 80 }).toFile(path.join(outDir, `hero-${width}.webp`));
  await base.clone().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(path.join(outDir, `hero-${width}.jpg`));
}

await sharp(buffer)
  .resize({ width: 1200, height: 630, fit: "cover", position: "top" })
  .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
  .toFile(path.join(root, "public/og.png"));

const iconSvg = path.join(root, "app/icon.svg");
if (fs.existsSync(iconSvg)) {
  await sharp(fs.readFileSync(iconSvg)).resize(180, 180).png().toFile(path.join(root, "app/apple-icon.png"));
}

for (const file of fs.readdirSync(outDir).sort()) {
  const { size } = fs.statSync(path.join(outDir, file));
  console.log(`${file.padEnd(18)} ${(size / 1024).toFixed(0).padStart(5)} KiB`);
}
console.log("og.png, hero.png written");
