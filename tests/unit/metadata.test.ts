import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { pageMetadata, socialImages } from "@/lib/metadata";

describe("social metadata", () => {
  it("gives every page an Open Graph and Twitter image with alt text", () => {
    const meta = pageMetadata({ title: "About", description: "About USASI.", path: "/about/" });
    const og = (meta.openGraph?.images as { url: string; alt: string }[])[0];
    const twitter = (meta.twitter?.images as { url: string; alt: string }[])[0];
    expect(og.url).toMatch(/\/og\.png$/);
    expect(og.alt).toBe(socialImages.site.alt);
    expect(twitter).toEqual({ url: og.url, alt: og.alt });
  });

  it("uses the section card when a page asks for it", () => {
    const meta = pageMetadata({ title: "Open Models & Tools", description: "Directory.", path: "/open/", image: socialImages.open });
    const og = (meta.openGraph?.images as { url: string; alt: string }[])[0];
    const twitter = (meta.twitter?.images as { url: string; alt: string }[])[0];
    expect(og.url).toMatch(/\/og-open\.png$/);
    expect(twitter).toEqual({ url: og.url, alt: socialImages.open.alt });
  });

  it("ships each card as a 1200×630 file", async () => {
    for (const image of Object.values(socialImages)) {
      const file = path.join(process.cwd(), "public", image.path);
      expect(fs.existsSync(file), image.path).toBe(true);
      const { width, height } = await sharp(file).metadata();
      expect([width, height], image.path).toEqual([1200, 630]);
    }
  });
});
