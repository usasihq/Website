import { expect, test } from "@playwright/test";

declare global { interface Window { __beaconFixtureLoaded?: boolean; __posthogAssetFixtureLoaded?: boolean; __violations: string[]; } }

const POSTHOG_CONNECT = "connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com";

// Synthetic local fixtures only: never send measurement data to Cloudflare or PostHog.
test("both CSP policies allow Cloudflare and PostHog, and still block other origins", async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", route => route.fulfill({
    contentType: "application/javascript", body: "window.__beaconFixtureLoaded = true;",
  }));
  await page.route("https://us-assets.i.posthog.com/**", route => route.fulfill({
    contentType: "application/javascript", body: "window.__posthogAssetFixtureLoaded = true;",
  }));
  await page.route("https://us.i.posthog.com/**", route => route.fulfill({ status: 204, body: "" }));
  const response = await page.goto("/");
  const header = response!.headers()["content-security-policy"];
  const meta = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  for (const policy of [header, meta!]) {
    expect(policy).toContain("https://static.cloudflareinsights.com");
    expect(policy).toContain("https://us-assets.i.posthog.com");
    expect(policy).toContain("https://us.i.posthog.com");
    expect(policy).toContain(POSTHOG_CONNECT);
    expect(policy).toContain("worker-src 'self' blob:");
    expect(policy).not.toContain("https://cloudflareinsights.com");
    expect(policy).not.toContain("unsafe-eval");
  }
  await expect(page.locator('script[src*="analytics.js"]')).toHaveCount(1);
  const analytics = await (await page.request.get("/analytics.js")).text();
  expect(analytics).toContain("posthog.init");
  expect(analytics).toContain('persistence: "memory"');
  expect(analytics).toContain('person_profiles: "identified_only"');
  await page.evaluate(() => {
    Object.assign(window, { __violations: [] });
    document.addEventListener("securitypolicyviolation", e => window.__violations.push(e.blockedURI));
  });
  for (const suffix of ["beacon.min.js", "beacon.min.js/versioned-fixture"]) {
    await page.evaluate(async src => {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script"); script.src = src;
        script.onload = () => resolve(); script.onerror = () => reject(new Error("Blocked fixture"));
        document.body.append(script);
      });
    }, `https://static.cloudflareinsights.com/${suffix}`);
  }
  for (const suffix of ["static/array.js", "static/recorder.js"]) {
    await page.evaluate(async src => {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script"); script.src = src;
        script.onload = () => resolve(); script.onerror = () => reject(new Error("Blocked fixture"));
        document.body.append(script);
      });
    }, `https://us-assets.i.posthog.com/${suffix}`);
  }
  expect(await page.evaluate(() => window.__beaconFixtureLoaded)).toBe(true);
  expect(await page.evaluate(() => window.__posthogAssetFixtureLoaded)).toBe(true);
  expect(await page.evaluate(() => window.__violations)).toEqual([]);
  await page.route("**/cdn-cgi/rum", route => route.fulfill({ status: 204 }));
  expect(await page.evaluate(async () => (await fetch("/cdn-cgi/rum", { method: "POST", body: "local-test-only" })).status)).toBe(204);
  expect(await page.evaluate(async () => (await fetch("https://us.i.posthog.com/e/", { method: "POST", body: "local-test-only" })).status)).toBe(204);
  expect(await page.evaluate(async () => { try { await fetch("https://example.com/blocked"); return false; } catch { return true; } })).toBe(true);
  expect(await page.context().cookies()).toEqual([]);
});


test("client navigation validates data without CSP dynamic-code probes", async ({ page }) => {
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener("securitypolicyviolation", event => {
      window.__violations.push(`${event.violatedDirective}: ${event.blockedURI}`);
    });
  });
  await page.route("https://us-assets.i.posthog.com/**", route => route.fulfill({
    contentType: "application/javascript", body: "window.__posthogAssetFixtureLoaded = true;",
  }));
  await page.route("https://us.i.posthog.com/**", route => route.fulfill({ status: 204, body: "" }));
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  await nav.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page.locator("h1")).toBeVisible();
  await nav.getByRole("link", { name: "Companies & Labs", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("U.S. AI companies & labs");
  expect(await page.evaluate(() => window.__violations)).toEqual([]);
});
