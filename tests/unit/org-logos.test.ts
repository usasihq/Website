import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { officialWebsite, organizationLogoFields, orgLogoAbsoluteUrl, orgLogoHref, ORG_LOGO_SIZE } from "@/lib/org-logos";
import { rasterizeMonogram, writeOrgLogos } from "../../scripts/generate-org-logos";

describe("org logo paths", () => {
  it("are stable per slug and absolute for JSON-LD", () => {
    expect(orgLogoHref("anthropic")).toBe("/images/orgs/anthropic.png");
    expect(orgLogoAbsoluteUrl("anthropic")).toBe("https://unitedstatesofamericasuperintelligence.com/images/orgs/anthropic.png");
  });
});

describe("hiringOrganization url", () => {
  it("uses the official website when it is a real https URL", () => {
    expect(officialWebsite("https://www.anthropic.com")).toBe("https://www.anthropic.com");
    expect(organizationLogoFields({ slug: "anthropic", name: "Anthropic", website: "https://www.anthropic.com" })).toEqual({
      url: "https://www.anthropic.com",
      sameAs: "https://www.anthropic.com",
      logo: "https://unitedstatesofamericasuperintelligence.com/images/orgs/anthropic.png",
    });
  });

  it("falls back to this site's company page and omits sameAs when no official site is known", () => {
    expect(officialWebsite("")).toBeNull();
    expect(officialWebsite("  ")).toBeNull();
    expect(officialWebsite("http://example.com")).toBeNull();
    expect(officialWebsite("/local")).toBeNull();
    expect(officialWebsite("not-a-url")).toBeNull();
    const fields = organizationLogoFields({ slug: "new-lab", name: "New Lab", website: "" });
    expect(fields.url).toBe("https://unitedstatesofamericasuperintelligence.com/companies/new-lab/");
    expect(fields.sameAs).toBeUndefined();
    expect(fields.logo).toBe("https://unitedstatesofamericasuperintelligence.com/images/orgs/new-lab.png");
  });
});

describe("org logo generation", () => {
  it("is hooked from prepare:data", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    expect(pkg.scripts["prepare:data"]).toContain("generate-org-logos.ts");
  });

  it("writes 128×128 PNGs from a company-site source or a monogram", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "org-logos-"));
    const sourceDir = path.join(root, "source");
    const publicDir = path.join(root, "out");
    fs.mkdirSync(sourceDir);
    const src = await sharp({
      create: { width: 180, height: 180, channels: 3, background: { r: 20, g: 80, b: 40 } },
    })
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(sourceDir, "acme.png"), src);
    const written = await writeOrgLogos(
      [
        { slug: "acme", logo_text: "A" },
        { slug: "other", logo_text: "OT" },
      ],
      { sourceDir, publicDir },
    );
    expect(written.map((w) => w.source)).toEqual(["company-site", "monogram"]);
    for (const w of written) {
      const meta = await sharp(path.join(publicDir, `${w.slug}.png`)).metadata();
      expect(meta.width).toBe(ORG_LOGO_SIZE);
      expect(meta.height).toBe(ORG_LOGO_SIZE);
      expect(meta.format).toBe("png");
    }
    const mono = await sharp(await rasterizeMonogram("TML")).metadata();
    expect(mono.width).toBe(128);
    expect(mono.height).toBe(128);
  });
});
