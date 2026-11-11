import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __beaconFixtureLoaded?: boolean;
    __posthogAssetFixtureLoaded?: boolean;
    __posthogProxyFixtureLoaded?: boolean;
    __violations: string[];
    posthog?: { capture: (...args: unknown[]) => unknown };
  }
}

const PROXY = "https://e.unitedstatesofamericasuperintelligence.com";
const POSTHOG_CONNECT = `connect-src 'self' ${PROXY} https://us.i.posthog.com https://us-assets.i.posthog.com https://cloudflareinsights.com`;

async function stubAnalyticsHosts(page: Page) {
  await page.route("https://static.cloudflareinsights.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "window.__beaconFixtureLoaded = true;" }),
  );
  await page.route("https://us-assets.i.posthog.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "window.__posthogAssetFixtureLoaded = true;" }),
  );
  await page.route("https://us.i.posthog.com/**", (route) => route.fulfill({ status: 204, body: "" }));
  await page.route("https://cloudflareinsights.com/**", (route) => route.fulfill({ status: 204, body: "" }));
  await page.route(`${PROXY}/**`, (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.startsWith("/static/")) {
      return route.fulfill({ contentType: "application/javascript", body: "window.__posthogProxyFixtureLoaded = true;" });
    }
    return route.fulfill({ status: 204, body: "" });
  });
}

// Synthetic local fixtures only: never send measurement data to Cloudflare or PostHog.
test("both CSP policies allow Cloudflare and PostHog, and still block other origins", async ({ page }) => {
  await stubAnalyticsHosts(page);
  const response = await page.goto("/");
  const header = response!.headers()["content-security-policy"];
  const meta = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
  for (const policy of [header, meta!]) {
    expect(policy).toContain("https://static.cloudflareinsights.com");
    expect(policy).toContain(PROXY);
    expect(policy).toContain("https://us-assets.i.posthog.com");
    expect(policy).toContain("https://us.i.posthog.com");
    expect(policy).toContain(POSTHOG_CONNECT);
    expect(policy).toContain("worker-src 'self' blob:");
    expect(policy).toContain("https://cloudflareinsights.com");
    expect(policy).not.toContain("unsafe-eval");
  }
  await expect(page.locator('script[src*="analytics.js"]')).toHaveCount(1);
  const analytics = await (await page.request.get("/analytics.js")).text();
  expect(analytics).toContain("posthog.init");
  expect(analytics).toContain(`api_host: "${PROXY}"`);
  expect(analytics).toContain('ui_host: "https://us.posthog.com"');
  expect(analytics).toContain('persistence: "memory"');
  expect(analytics).toContain('person_profiles: "identified_only"');
  await page.evaluate(() => {
    Object.assign(window, { __violations: [] });
    document.addEventListener("securitypolicyviolation", (e) => window.__violations.push(e.blockedURI));
  });
  for (const suffix of ["beacon.min.js", "beacon.min.js/versioned-fixture"]) {
    await page.evaluate(async (src) => {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Blocked fixture"));
        document.body.append(script);
      });
    }, `https://static.cloudflareinsights.com/${suffix}`);
  }
  for (const suffix of ["static/array.js", "static/recorder.js"]) {
    await page.evaluate(async (src) => {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Blocked fixture"));
        document.body.append(script);
      });
    }, `https://us-assets.i.posthog.com/${suffix}`);
  }
  for (const suffix of ["static/array.js", "static/recorder.js"]) {
    await page.evaluate(async (src) => {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Blocked fixture"));
        document.body.append(script);
      });
    }, `${PROXY}/${suffix}`);
  }
  expect(await page.evaluate(() => window.__beaconFixtureLoaded)).toBe(true);
  expect(await page.evaluate(() => window.__posthogAssetFixtureLoaded)).toBe(true);
  expect(await page.evaluate(() => window.__posthogProxyFixtureLoaded)).toBe(true);
  expect(await page.evaluate(() => window.__violations)).toEqual([]);
  await page.route("**/cdn-cgi/rum", (route) => route.fulfill({ status: 204 }));
  expect(await page.evaluate(async () => (await fetch("/cdn-cgi/rum", { method: "POST", body: "local-test-only" })).status)).toBe(204);
  expect(await page.evaluate(async () => (await fetch("https://us.i.posthog.com/e/", { method: "POST", body: "local-test-only" })).status)).toBe(204);
  expect(await page.evaluate(async () => (await fetch("https://e.unitedstatesofamericasuperintelligence.com/i/v0/e/", { method: "POST", body: "local-test-only" })).status)).toBe(204);
  expect(await page.evaluate(async () => (await fetch("https://cloudflareinsights.com/cdn-cgi/rum", { method: "POST", body: "local-test-only" })).status)).toBe(204);
  expect(await page.evaluate(async () => { try { await fetch("https://example.com/blocked"); return false; } catch { return true; } })).toBe(true);
  expect(await page.context().cookies()).toEqual([]);
});

test("named click events fire once with sendBeacon and do not block navigation", async ({ page }) => {
  await stubAnalyticsHosts(page);
  await page.goto("/");
  const result = await page.evaluate(() => {
    const captures: Array<{ name: string; props: Record<string, unknown>; opts: unknown }> = [];
    if (!window.posthog || typeof window.posthog.capture !== "function") {
      throw new Error("posthog.capture is missing");
    }
    const original = window.posthog.capture.bind(window.posthog);
    window.posthog.capture = ((name: string, props: Record<string, unknown>, opts: unknown) => {
      captures.push({ name, props, opts });
      return original(name, props, opts);
    }) as typeof window.posthog.capture;

    function clickSample(href: string, text: string, attrs: Record<string, string> = {}) {
      const wrap = document.createElement("div");
      if (attrs["data-placement"]) {
        wrap.setAttribute("data-placement", attrs["data-placement"]);
        delete attrs["data-placement"];
      }
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      for (const [key, value] of Object.entries(attrs)) a.setAttribute(key, value);
      wrap.append(a);
      document.body.append(wrap);
      let defaultPrevented = false;
      a.addEventListener("click", (event) => {
        defaultPrevented = event.defaultPrevented;
        event.preventDefault();
      });
      a.click();
      wrap.remove();
      return defaultPrevented;
    }

    const outboundBlocked = clickSample("https://aipeoplewiki.com/profile/demo?q=secret", "Wiki profile", {
      "data-placement": "footer",
    });
    const storeBlocked = clickSample("https://apps.apple.com/us/app/shadowfetch/id1234567890", "Get Shadowfetch", {
      "data-app": "shadowfetch",
    });
    const downloadBlocked = clickSample(
      "https://github.com/usasihq/Website/releases/download/v1.2.3/usasi.dmg",
      "Download disk image",
      { "data-product": "usasi", "data-platform": "macos" },
    );
    const mailtoBlocked = clickSample("mailto:usasi@usasihq.com", "Email USASI");
    const internalBlocked = clickSample("/privacy/", "Privacy");

    return {
      captures,
      outboundBlocked,
      storeBlocked,
      downloadBlocked,
      mailtoBlocked,
      internalBlocked,
      page: location.pathname,
    };
  });

  expect(result.outboundBlocked).toBe(false);
  expect(result.storeBlocked).toBe(false);
  expect(result.downloadBlocked).toBe(false);
  expect(result.mailtoBlocked).toBe(false);
  expect(result.internalBlocked).toBe(false);

  const named = result.captures.filter((c) =>
    ["outbound_click", "app_store_click", "download_click"].includes(c.name),
  );
  expect(named.map((c) => c.name)).toEqual(["outbound_click", "app_store_click", "download_click"]);
  for (const event of named) {
    expect(event.opts).toEqual({ transport: "sendBeacon" });
    expect(event.props.page).toBe(result.page);
    expect(String(event.props.link_text).length).toBeLessThanOrEqual(80);
  }

  const outbound = named.find((c) => c.name === "outbound_click")!;
  expect(outbound.props).toMatchObject({
    placement: "footer",
    link_text: "Wiki profile",
    domain: "aipeoplewiki.com",
    url: "https://aipeoplewiki.com/profile/demo",
  });
  expect(String(outbound.props.url)).not.toContain("?");

  const store = named.find((c) => c.name === "app_store_click")!;
  expect(store.props).toMatchObject({
    placement: null,
    link_text: "Get Shadowfetch",
    app: "shadowfetch",
    store: "app_store",
    app_id: "id1234567890",
  });

  const download = named.find((c) => c.name === "download_click")!;
  expect(download.props).toMatchObject({
    placement: null,
    link_text: "Download disk image",
    product: "usasi",
    platform: "macos",
    version: "1.2.3",
    file_type: "dmg",
  });
});

test("client navigation validates data without CSP dynamic-code probes", async ({ page }) => {
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__violations.push(`${event.violatedDirective}: ${event.blockedURI}`);
    });
  });
  await stubAnalyticsHosts(page);
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary", exact: true });
  await nav.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page.locator("h1")).toBeVisible();
  await nav.getByRole("link", { name: "Companies & Labs", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("U.S. AI companies & labs");
  expect(await page.evaluate(() => window.__violations)).toEqual([]);
});
