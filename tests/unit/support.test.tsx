import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { parseSupportConfig, siteConfig, supportState, type SupportConfig } from "@/lib/site-config";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const { SupportPanel } = await import("@/components/SupportPanel");

const base: SupportConfig = {
  enabled: true,
  heading: "Support Us",
  subheading: "Help keep USASI useful.",
  body: "Find the catalog useful? Leave an optional tip to support its upkeep. Tips never affect listings, coverage, or openness assessments.",
  tipUrl: null,
  providerLabel: null,
  amountLinks: [],
  contactUrl: null,
};

describe("support configuration", () => {
  it("site config uses the owner's tip page and invents no amount links", () => {
    expect(siteConfig.support.tipUrl).toBe("https://buymeacoffee.com/usasi");
    expect(siteConfig.support.providerLabel).toBe("Buy Me a Coffee");
    expect(siteConfig.support.amountLinks).toEqual([]);
    expect(supportState(siteConfig.support).active).toBe(true);
  });

  it.each([
    ["javascript:", "javascript:alert(1)"],
    ["data:", "data:text/html,<b>x</b>"],
    ["http:", "http://tips.usasi-fixtures.org/me"],
    ["relative", "/tip"],
    ["credentials in URL", "https://user:pass@tips.usasi-fixtures.org/me"],
    ["not a URL", "tip me"],
  ])("rejects an unsafe tip URL (%s)", (_label, tipUrl) => {
    expect(() => parseSupportConfig({ ...base, tipUrl })).toThrow();
  });

  it("accepts a valid https tip URL", () => {
    const config = parseSupportConfig({ ...base, tipUrl: "https://tips.usasi-fixtures.org/usasi", providerLabel: "Fixture Tips" });
    expect(supportState(config).active).toBe(true);
  });

  it("rejects amount links without a general tip URL, and unsafe amount URLs", () => {
    expect(() => parseSupportConfig({ ...base, amountLinks: [{ label: "$5", url: "https://tips.usasi-fixtures.org/5" }] })).toThrow(/general tipUrl/);
    expect(() =>
      parseSupportConfig({ ...base, tipUrl: "https://tips.usasi-fixtures.org/usasi", amountLinks: [{ label: "$5", url: "javascript:void(0)" }] }),
    ).toThrow();
  });

  it("validates the optional contact URL", () => {
    expect(() => parseSupportConfig({ ...base, contactUrl: "mailto:not an email" })).toThrow();
    expect(parseSupportConfig({ ...base, contactUrl: "mailto:hello@usasi-fixtures.org" }).contactUrl).toBe("mailto:hello@usasi-fixtures.org");
  });
});

describe("Support Us panel", () => {
  it("unconfigured: stays visible, says tips are coming, and renders no payment link", () => {
    const html = renderToStaticMarkup(<SupportPanel variant="home" config={base} />);
    expect(html).toContain("Support Us");
    expect(html).toContain("Help keep USASI useful.");
    expect(html).toContain("Tips will be available here soon.");
    expect(html).toContain('href="/support/"');
    expect(html).not.toContain("Leave a tip");
    expect(html).not.toMatch(/href="#"/);
    expect(html).toContain('data-support-panel="unconfigured"');
  });

  it("configured: renders the external tip link with honest microcopy", () => {
    const config = parseSupportConfig({ ...base, tipUrl: "https://tips.usasi-fixtures.org/usasi", providerLabel: "Fixture Tips" });
    const html = renderToStaticMarkup(<SupportPanel variant="home" config={config} />);
    expect(html).toContain('href="https://tips.usasi-fixtures.org/usasi"');
    expect(html).toContain("Leave a tip");
    expect(html).toContain("Optional. No USASI account required. Payment takes place on the linked provider’s website");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("Tips will be available here soon.");
  });

  it("renders amount links only when each has its own configured URL", () => {
    const config = parseSupportConfig({
      ...base,
      tipUrl: "https://tips.usasi-fixtures.org/usasi",
      amountLinks: [
        { label: "$3", url: "https://tips.usasi-fixtures.org/usasi/3" },
        { label: "$5", url: "https://tips.usasi-fixtures.org/usasi/5" },
      ],
    });
    const html = renderToStaticMarkup(<SupportPanel config={config} />);
    expect(html).toContain('href="https://tips.usasi-fixtures.org/usasi/3"');
    expect(html).toContain('href="https://tips.usasi-fixtures.org/usasi/5"');
    expect(html).not.toContain("$10");
  });

  it("renders nothing when support is disabled", () => {
    expect(renderToStaticMarkup(<SupportPanel config={{ ...base, enabled: false }} />)).toBe("");
  });
});
