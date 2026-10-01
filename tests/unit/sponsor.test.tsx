import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomepageSponsor } from "@/components/HomepageSponsor";
import { HomepageSponsorSchema, siteConfig } from "@/lib/site-config";
import { sponsorFixture } from "../fixtures/sponsor";

describe("optional homepage advertisement", () => {
  it("is absent by default, with no placeholder or reserved markup", () => {
    expect(siteConfig.homepageSponsor).toBeNull();
    expect(renderToStaticMarkup(<HomepageSponsor />)).toBe("");
    expect(renderToStaticMarkup(<HomepageSponsor config={null} />)).toBe("");
  });

  it("requires complete, bounded factual copy and a safe destination", () => {
    expect(HomepageSponsorSchema.parse(sponsorFixture)).toEqual(sponsorFixture);
    for (const url of ["javascript:alert(1)", "http://sponsor.example.org", "https://user:pass@sponsor.example.org", "/sponsor", "https://sponsor.example.org/?utm_source=usasi"]) {
      expect(HomepageSponsorSchema.safeParse({ ...sponsorFixture, url }).success, url).toBe(false);
    }
    expect(HomepageSponsorSchema.safeParse({ ...sponsorFixture, name: " " }).success).toBe(false);
    expect(HomepageSponsorSchema.safeParse({ ...sponsorFixture, description: "x".repeat(221) }).success).toBe(false);
    expect(HomepageSponsorSchema.safeParse({ ...sponsorFixture, script: "tracker" }).success).toBe(false);
  });

  it.each(["https://sponsor.example.org/logo.png", "//sponsor.example.org/logo.png", "/images/sponsors/../logo.png", "/images/sponsors/%2e%2e.png", "/images/sponsors/logo.svg", "/images/sponsors/logo.png?pixel=1"])("rejects non-local or unsafe logo %s", (logo) => {
    expect(HomepageSponsorSchema.safeParse({ ...sponsorFixture, logo }).success).toBe(false);
  });

  it("discloses payment and renders exactly one marked link and one local decorative logo", () => {
    const html = renderToStaticMarkup(<HomepageSponsor config={sponsorFixture} />);
    expect(html).toContain("Advertisement · Paid sponsor");
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('rel="sponsored noopener noreferrer"');
    expect(html).toContain('src="/images/sponsors/fixture.png"');
    expect(html).toContain('alt=""');
    expect(html).toContain("Paid support does not affect listings");
    expect(html).not.toMatch(/<script|<iframe|<form/);
    const escaped = renderToStaticMarkup(<HomepageSponsor config={{ ...sponsorFixture, description: "<script>alert(1)</script>" }} />);
    expect(escaped).toContain("&lt;script&gt;");
  });

  it("keeps policies and current Compact references consistent", () => {
    const support = fs.readFileSync("content/pages/support.mdx", "utf8");
    const compact = fs.readFileSync("content/pages/compact.mdx", "utf8");
    const privacy = fs.readFileSync("content/pages/privacy.mdx", "utf8");
    for (const text of [support, compact, privacy]) {
      expect(text).toContain("Advertisement · Paid sponsor");
      expect(text).not.toMatch(/website carries no ads|sponsorships.*only in the weekly email|no analytics, advertising/i);
    }
    expect(support).toContain("reject or remove");
    expect(support).toContain("approve only their own advertisement");
    expect(compact).toContain("version 0.2");
    expect(compact).toContain("does not change eligibility criteria or the openness rubric");
    for (const file of ["app/compact/page.tsx", "components/SiteFooter.tsx", "content/pages/about.mdx", "app/methodology/page.tsx"]) {
      expect(fs.readFileSync(file, "utf8")).not.toContain("Compact v0.1");
    }
    expect(fs.existsSync("content/changelog/2026-09-30-compact-v02.yml")).toBe(true);
  });
});
