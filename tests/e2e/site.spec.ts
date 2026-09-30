import { expect, test } from "@playwright/test";
import { isActive, readRecords, shownCount, watchErrors } from "./helpers";

const DISCLAIMER = "Independent project. Not a United States government website.";
const orgs = readRecords("organizations");
const artifacts = readRecords("artifacts");
const activeOrg = orgs.filter(isActive).sort((a, b) => a.slug.localeCompare(b.slug))[0];
const activeRelease = artifacts.filter((a) => isActive(a) && a.record_level === "release").sort((a, b) => a.slug.localeCompare(b.slug))[0];

test.describe("homepage", () => {
  test("artwork, live heading, disclaimer, and both directory actions", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Explore the companies, models, and tools behind American AI.");
    await expect(page.getByTestId("intro-disclaimer")).toHaveText(DISCLAIMER);
    await expect(page.getByTestId("footer-disclaimer")).toHaveText(DISCLAIMER);

    const hero = page.locator("figure img").first();
    await expect(hero).toHaveAttribute("width", "1672");
    await expect(hero).toHaveAttribute("height", "941");
    expect(await hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

    await expect(page.getByRole("link", { name: "Explore Companies & Labs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore Open Models & Tools" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("cross-directory search labels results and hands off to each directory", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Search both directories");
    await input.fill(activeRelease.name.split(" ")[0]);
    const results = page.getByRole("list", { name: "Search results" });
    await expect(results.getByRole("link").first()).toBeVisible();
    const handoff = page.getByRole("link", { name: /in Open Models & Tools/ });
    const expected = Number((await handoff.innerText()).match(/^(\d+)/)![1]);
    await handoff.click();
    await expect(page).toHaveURL(/\/open\/\?q=/);
    await expect.poll(() => shownCount(page)).toBe(expected);
  });
});

test.describe("directory URL state", () => {
  test("filters persist through refresh, back/forward, and can be cleared", async ({ page }) => {
    await page.goto("/companies/");
    const total = await shownCount(page);
    await page.getByLabel("Sector", { exact: true }).selectOption({ index: 1 });
    await expect(page).toHaveURL(/sector=/);
    const filtered = await shownCount(page);
    expect(filtered).toBeLessThanOrEqual(total);

    await page.reload();
    await expect.poll(() => shownCount(page)).toBe(filtered);
    await expect(page.getByLabel("Sector", { exact: true })).not.toHaveValue("");

    await page.getByLabel("Has open artifact records").check();
    await expect(page).toHaveURL(/open=1/);
    const combined = await shownCount(page);
    expect(combined).toBeLessThanOrEqual(filtered);

    await page.goBack();
    await expect(page).not.toHaveURL(/open=1/);
    await expect.poll(() => shownCount(page)).toBe(filtered);
    await page.goForward();
    await expect.poll(() => shownCount(page)).toBe(combined);

    await page.getByRole("button", { name: "Clear all filters" }).click();
    await expect(page).toHaveURL(/\/companies\/$/);
    await expect.poll(() => shownCount(page)).toBe(total);
  });

  test("search updates results and shows an honest empty state", async ({ page }) => {
    await page.goto("/open/");
    await page.getByLabel("Search open models and tools").fill("zzzz-no-such-artifact");
    await expect(page.getByText("No records match these filters.")).toBeVisible();
    await expect(page).toHaveURL(/q=zzzz-no-such-artifact/);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText("No records match these filters.")).toHaveCount(0);
  });

  test("deep links apply combined filters on first load", async ({ page }) => {
    await page.goto("/open/?kind=model&level=release");
    const expectedReleases = artifacts.filter((a) => isActive(a) && a.kind === "model" && a.record_level === "release").length;
    await expect.poll(() => shownCount(page)).toBe(expectedReleases);
    await expect(page.getByRole("list", { name: "Active filters" }).getByRole("button")).toHaveCount(2);
  });

  test("the full list is present in the static HTML without JavaScript", async ({ request }) => {
    const html = await (await request.get("/companies/")).text();
    for (const org of orgs.filter(isActive)) expect(html).toContain(`data-slug="${org.slug}"`);
  });
});

test.describe("comparison workspace", () => {
  test("sampled numeric cells open a directory view listing exactly that many records", async ({ page }) => {
    await page.goto("/matrix/");
    const cells = page.locator('#models td[data-col]:not([data-col="hosted"]) a[data-count]');
    const total = await cells.count();
    expect(total).toBeGreaterThan(0);
    const picks = Array.from(new Set([0, 1, 2, 3, 5, 8, 13, 21, 34, 55].filter((i) => i < total)));
    const targets: Array<{ href: string; count: number }> = [];
    for (const i of picks) {
      const cell = cells.nth(i);
      targets.push({ href: (await cell.getAttribute("href"))!, count: Number(await cell.getAttribute("data-count")) });
    }
    for (const t of targets) {
      await page.goto(t.href);
      await expect.poll(() => shownCount(page), { message: t.href }).toBe(t.count);
    }
  });

  test("hosted-product cells point at the organization's hosted products section", async ({ page }) => {
    await page.goto("/matrix/");
    const link = page.locator('td[data-col="hosted"] a[data-count]:not([data-count="0"])').first();
    const count = Number(await link.getAttribute("data-count"));
    await page.goto((await link.getAttribute("href"))!);
    await expect(page).toHaveURL(/#hosted-model-products$/);
    await expect(page.locator("#hosted-model-products tbody tr")).toHaveCount(count);
  });
});

test.describe("detail pages", () => {
  test("organization page shows sources, eligibility, and the non-endorsement notice", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`/companies/${activeOrg.slug}/`);
    await expect(page.locator("h1")).toHaveText(activeOrg.name);
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "U.S. eligibility" })).toBeVisible();
    await expect(page.getByText("This listing is not an endorsement or a federal approval.")).toBeVisible();
    const marker = page.locator("a[aria-label^='Source 1:']").first();
    await marker.click();
    await expect(page).toHaveURL(/#src-/);
    expect(errors).toEqual([]);
  });

  test("model release page shows its checklist, tier, and family context", async ({ page }) => {
    await page.goto(`/open/${activeRelease.slug}/`);
    await expect(page.locator("h1")).toHaveText(activeRelease.name);
    await expect(page.getByRole("heading", { name: "Public materials checklist" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Model-disclosure tier" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Open Models & Tools");
  });

  test("external links are marked and do not send referrers", async ({ page }) => {
    await page.goto(`/companies/${activeOrg.slug}/`);
    const external = page.locator('a[data-external="true"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const rel of await external.evaluateAll((els) => els.map((e) => e.getAttribute("rel")))) {
      expect(rel).toContain("noreferrer");
    }
  });
});

test.describe("static hosting behavior", () => {
  test("unknown paths return the styled 404 with a 404 status", async ({ page }) => {
    const response = await page.goto("/definitely-not-a-page/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("This page isn’t in the catalog.");
    await expect(page.getByRole("link", { name: "Companies & Labs" }).first()).toBeVisible();
  });

  test("directory paths without a trailing slash redirect to the canonical URL", async ({ page }) => {
    await page.goto(`/companies/${activeOrg.slug}`);
    await expect(page).toHaveURL(new RegExp(`/companies/${activeOrg.slug}/$`));
  });

  test("drafts and non-eligible records have no page and are not in the sitemap", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const hidden = [
      ...orgs.filter((o) => !isActive(o) && o.publication_status !== "archived").map((o) => `/companies/${o.slug}/`),
      ...artifacts.filter((a) => !isActive(a) && a.publication_status !== "archived").map((a) => `/open/${a.slug}/`),
    ];
    for (const path of hidden) {
      expect((await request.get(path)).status(), path).toBe(404);
      expect(sitemap).not.toContain(path);
    }
    const catalog = await (await request.get("/data/catalog.json")).json();
    const exported = new Set([...catalog.organizations, ...catalog.artifacts].map((r: { slug: string }) => r.slug));
    for (const r of [...orgs, ...artifacts].filter((r) => !isActive(r))) expect(exported.has(r.slug), r.slug).toBe(false);
  });

  test("every sitemap page carries Support Us and the footer disclaimer", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(paths.length).toBeGreaterThan(10);
    for (const path of paths) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain("data-support-panel=");
      expect(html, path).toContain(DISCLAIMER);
    }
  });

  test("security headers and the per-page CSP are served", async ({ request }) => {
    const response = await request.get("/");
    expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(await response.text()).toMatch(/<meta http-equiv="Content-Security-Policy" content="[^"]*script-src 'self' 'sha256-/);
  });
});

test.describe("keyboard and menus", () => {
  test("skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/about/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("mobile menu opens, closes with Escape, and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    const mobileNav = page.getByRole("navigation", { name: "Primary (mobile)" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Companies & Labs" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(mobileNav).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();

    await page.getByRole("button", { name: "Menu" }).click();
    await mobileNav.getByRole("button", { name: "Close menu" }).click();
    await expect(mobileNav).toBeHidden();

    await page.getByRole("button", { name: "Menu" }).click();
    await mobileNav.getByRole("link", { name: "Compare" }).click();
    await expect(page).toHaveURL(/\/matrix\/$/);
    await expect(mobileNav).toBeHidden();
  });
});
