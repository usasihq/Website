import { expect, test } from "@playwright/test";

declare global { interface Window { __beaconFixtureLoaded?: boolean; __violations: string[]; } }

// Synthetic local fixture only: never sends measurement data to Cloudflare.
test("both CSP policies allow the Cloudflare beacon and same-origin collection only", async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", route => route.fulfill({
    contentType: "application/javascript", body: "window.__beaconFixtureLoaded = true;",
  }));
  const response = await page.goto("/");
  const header = response!.headers()["content-security-policy"];
  const meta = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  for (const policy of [header, meta!]) {
    expect(policy).toContain("https://static.cloudflareinsights.com");
    expect(policy).toContain("connect-src 'self'");
    expect(policy).not.toContain("https://cloudflareinsights.com");
    expect(policy).not.toContain("unsafe-eval");
  }
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
  expect(await page.evaluate(() => window.__beaconFixtureLoaded)).toBe(true);
  expect(await page.evaluate(() => window.__violations)).toEqual([]);
  await page.route("**/cdn-cgi/rum", route => route.fulfill({ status: 204 }));
  expect(await page.evaluate(async () => (await fetch("/cdn-cgi/rum", { method: "POST", body: "local-test-only" })).status)).toBe(204);
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
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  await nav.getByRole("link", { name: "Jobs", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Jobs");
  await page.getByLabel("Search jobs", { exact: true }).fill("engineer");
  await nav.getByRole("link", { name: "People Behind Local AI", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("People behind local AI");
  await nav.getByRole("link", { name: "Companies & Labs", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Companies & Labs");
  expect(await page.evaluate(() => window.__violations)).toEqual([]);
});
