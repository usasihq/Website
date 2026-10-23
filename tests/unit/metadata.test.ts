import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { canonicalPath, listingTitle, pageMetadata, socialImages, TITLE_MAX } from "@/lib/metadata";

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

describe("canonical URLs", () => {
  it("strips query parameters and hashes so filter and utm variants share one URL", () => {
    expect(canonicalPath("/github/?topic=deepseek")).toBe("/github/");
    expect(canonicalPath("/companies/openai/?utm_source=share")).toBe("/companies/openai/");
    expect(canonicalPath("/companies/openai#models")).toBe("/companies/openai/");
    const meta = pageMetadata({ title: "AI on GitHub", description: "Projects.", path: "/github/?topic=cli" });
    expect(String(meta.alternates?.canonical)).toMatch(/^https:\/\/[^/]+\/github\/$/);
    expect(String(meta.alternates?.canonical)).not.toContain("?");
    expect(String(meta.openGraph?.url)).toMatch(/\/github\/$/);
    expect(String(meta.openGraph?.url)).not.toContain("?");
  });
});

describe("listing titles", () => {
  it("keeps owner/name plus the host while it fits, then clips the id", () => {
    expect(listingTitle("openai/whisper", "GitHub")).toBe("openai/whisper on GitHub");
    expect(listingTitle("a".repeat(80), "GitHub").length).toBeLessThanOrEqual(TITLE_MAX);
    expect(listingTitle("owner/abcdefghijklmnopqrstuvwxyz-abcdefghijklmnopqrst", "GitHub")).toBe(
      "owner/abcdefghijklmnopqrstuvwxyz-abcdefghijklmnopqrst",
    );
  });
});

describe("meta descriptions", async () => {
  const { clipDescription, DESCRIPTION_MAX } = await import("@/lib/metadata");
  it("keeps short descriptions as they are", () => {
    expect(clipDescription("A short description.")).toBe("A short description.");
  });
  it("cuts long ones at a word boundary within the limit", () => {
    const long = "word ".repeat(60);
    const out = clipDescription(long);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out.endsWith("word…")).toBe(true);
  });
  it("applies to page metadata", () => {
    const meta = pageMetadata({ description: "x ".repeat(200), path: "/a/" });
    expect((meta.description as string).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect((meta.openGraph?.description as string).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });
});
