import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const analytics = fs.readFileSync(path.join(process.cwd(), "public/analytics.js"), "utf8");
const layout = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
const postbuild = fs.readFileSync(path.join(process.cwd(), "scripts/postbuild.mjs"), "utf8");
const privacy = fs.readFileSync(path.join(process.cwd(), "content/pages/privacy.mdx"), "utf8");

describe("PostHog snippet", () => {
  it("initializes the shared US-cloud project without cookies or localStorage", () => {
    expect(analytics).toContain('posthog.init("phc_wCuwK2QFPvyvhH6SQMVe7xLgYC5xFtz9axEAUbXCqkgc"');
    expect(analytics).toContain('api_host: "https://e.unitedstatesofamericasuperintelligence.com"');
    expect(analytics).toContain('ui_host: "https://us.posthog.com"');
    expect(analytics).toContain('persistence: "memory"');
    expect(analytics).toContain('person_profiles: "identified_only"');
    expect(analytics).toContain("capture_pageview: true");
    expect(analytics).toContain("capture_pageleave: true");
    expect(analytics).toContain("autocapture: true");
    expect(analytics).toContain("maskAllInputs: true");
    expect(analytics).not.toMatch(/localStorage\+cookie|persistence:\s*"cookie"/);
    expect(layout).toContain('src={asset("/analytics.js")}');
  });

  it("keeps the per-page CSP in postbuild aligned with PostHog hosts", () => {
    expect(postbuild).toContain("https://e.unitedstatesofamericasuperintelligence.com");
    expect(postbuild).toContain("https://us-assets.i.posthog.com");
    expect(postbuild).toContain("https://cloudflareinsights.com");
    expect(postbuild).toContain("connect-src 'self' https://e.unitedstatesofamericasuperintelligence.com https://us.i.posthog.com https://us-assets.i.posthog.com https://cloudflareinsights.com");
    expect(postbuild).toContain("worker-src 'self' blob:");
  });

  it("installs a capture-phase click listener for named outbound, App Store, and download events", () => {
    expect(analytics).toContain('document.addEventListener("click", handler, true)');
    expect(analytics).toContain('document.addEventListener("auxclick", handler, true)');
    expect(analytics).toContain('posthog.capture(name, props, { transport: "sendBeacon" })');
    expect(analytics).toContain('"outbound_click"');
    expect(analytics).toContain('"app_store_click"');
    expect(analytics).toContain('"download_click"');
    expect(analytics).not.toMatch(/\.preventDefault\s*\(/);
  });

  it("describes PostHog and session replay in the published privacy page, without draft labels", () => {
    expect(privacy).toMatch(/<h2 id="posthog">PostHog<\/h2>/);
    expect(privacy).toContain("session replay");
    expect(privacy).toContain("masked");
    expect(privacy).toContain("memory-only persistence");
    expect(privacy).toContain("e.unitedstatesofamericasuperintelligence.com");
    expect(privacy).toContain("us.i.posthog.com");
    expect(privacy).toContain("outbound links (domain and path only, no query)");
    expect(privacy).toContain("App Store links and download links");
    expect(privacy).not.toMatch(/draft|lawyer review/i);
    const page = fs.readFileSync(path.join(process.cwd(), "app/privacy/page.tsx"), "utf8");
    const description = page.match(/description: "([^"]+)"/)?.[1] ?? "";
    expect(description).toContain("PostHog and Cloudflare analytics");
    expect(description).not.toMatch(/no analytics or trackers/);
    expect(description.length).toBeGreaterThan(20);
    expect(description.length).toBeLessThanOrEqual(160);
  });
});
