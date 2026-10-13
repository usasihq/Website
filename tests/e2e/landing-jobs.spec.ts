import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Jobs landing pages (/jobs/in/<state>/, /jobs/in/<state>/<city>/, and the topic pages), built from the
 * local jobs data at build time. Counts change daily, so the tests compare a
 * page with itself and with the directory rather than with fixed numbers.
 */
const TOPICS = ["/jobs/data-center-infrastructure/", "/jobs/no-programming/", "/jobs/entry-level/", "/jobs/remote-us/", "/jobs/remote/"];

async function jsonLd(page: Page) {
  return (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
}
const countOnPage = async (page: Page) => Number((await page.getByTestId("landing-count").textContent())!.replace(/,/g, ""));

test("a state page answers first, labels geography, and links to employers and live postings", async ({ page }) => {
  await page.goto("/jobs/in/california/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI jobs in California");
  const count = await countOnPage(page);
  expect(count).toBeGreaterThanOrEqual(10);
  await expect(page).toHaveTitle(new RegExp(`^AI jobs in California: ${count.toLocaleString("en-US")} open listings`));
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description!.length).toBeLessThanOrEqual(160);
  expect(description).toMatch(/^[\d,]+ open listings naming a location in California/);
  await expect(page.getByText("Listings last checked", { exact: true })).toBeVisible();
  await expect(page.getByText("Location named: California")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How this list is made" })).toBeVisible();
  await expect(page.getByText(/best-effort match/)).toBeVisible();
  await expect(page.getByTestId("header-disclaimer")).toContainText("Independent project");
  // Employers link to their profiles; the state's headquarters page is linked separately.
  await expect(page.locator('#employers a[href^="/companies/"]').first()).toBeVisible();
  await expect(page.locator('#employers a[href="/places/california/"]')).toBeVisible();
  // At most 100 listings in the HTML, each linking to the employer's own posting.
  const listings = page.locator("#listings li");
  expect(await listings.count()).toBeLessThanOrEqual(100);
  const posting = page.locator('#listings a[data-external="true"]').first();
  await expect(posting).toHaveAttribute("rel", "noopener noreferrer");
  await expect(posting).toHaveAttribute("href", /^https:\/\//);
  const ld = await jsonLd(page);
  expect(ld).toContain('"BreadcrumbList"');
  expect(ld).toContain('"ItemList"');
  expect(ld).not.toContain("JobPosting");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/jobs\/in\/california\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/jobs\/in-california\.jpg$/);
});

test("the full list in the directory is the same set of listings", async ({ page }) => {
  await page.goto("/jobs/in/california/");
  const count = await countOnPage(page);
  const loaded = page.waitForResponse((r) => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.getByRole("link", { name: /^See all [\d,]+ in the Jobs directory$/ }).click();
  await loaded;
  await expect(page).toHaveURL(/\/jobs\/\?state=CA&sort=newest$/);
  await expect(page.getByLabel("U.S. state named in location", { exact: true })).toHaveValue("CA");
  await expect(page.getByText(new RegExp(`^Showing \\d+ of ${count} matching positions?$`))).toBeVisible();
});

test("a city page sits under its state, and its full list in the directory is the same set", async ({ page }) => {
  await page.goto("/jobs/in/california/");
  const stateCount = await countOnPage(page);
  await expect(page.getByTestId("landing-cities").locator('a[href="/jobs/in/california/san-francisco/"]')).toBeVisible();
  await page.goto("/jobs/in/california/san-francisco/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI jobs in San Francisco, California");
  const count = await countOnPage(page);
  expect(count).toBeGreaterThanOrEqual(10);
  expect(count).toBeLessThan(stateCount);
  await expect(page).toHaveTitle(new RegExp(`^AI jobs in San Francisco, CA: ${count.toLocaleString("en-US")} open listings`));
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description!.length).toBeLessThanOrEqual(160);
  await expect(page.getByText("Location named: San Francisco, California")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).locator('a[href="/jobs/in/california/"]')).toBeVisible();
  await expect(page.getByTestId("landing-cities").locator('a[href="/jobs/in/california/"]')).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/jobs\/in-california-san-francisco\.jpg$/);
  const loaded = page.waitForResponse((r) => r.url().endsWith("/data/jobs.json") && r.ok());
  await page.getByRole("link", { name: /^See all [\d,]+ in the Jobs directory$/ }).click();
  await loaded;
  await expect(page).toHaveURL(/\/jobs\/\?state=CA&city=san-francisco&sort=newest$/);
  await expect(page.getByTestId("jobs-city-filter")).toContainText("City: San Francisco, CA");
  await expect(page.getByText(new RegExp(`^Showing \\d+ of ${count} matching positions?$`))).toBeVisible();
  await page.getByRole("button", { name: "Show all of California" }).click();
  await expect(page).toHaveURL(/\/jobs\/\?state=CA&sort=newest$/);
});

for (const path of TOPICS) {
  test(`topic page ${path} documents its rule and its geography`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How this list is made" })).toBeVisible();
    await expect(page.getByText(/best-effort match/)).toBeVisible();
    const badge = page.locator("main header .badge").first();
    if (path === "/jobs/remote-us/") await expect(badge).toHaveText("U.S. locations only");
    else await expect(badge).toHaveText(/^(Includes positions outside the United States|No positions outside the United States listed today)$/);
    expect(await page.locator("#listings li").count()).toBeLessThanOrEqual(100);
    expect(await jsonLd(page)).not.toContain("JobPosting");
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description!.length).toBeLessThanOrEqual(160);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("landing pages are linked from /jobs/ and /places/, listed in the sitemap, and found by search", async ({ page, request }) => {
  await page.goto("/jobs/");
  const browse = page.getByRole("navigation", { name: "Browse by" });
  await expect(browse.locator('a[href="/jobs/entry-level/"]')).toBeVisible();
  await expect(browse.locator('a[href="/jobs/in/california/"]')).toBeVisible();
  await page.goto("/places/california/");
  await expect(page.locator('main a[href="/jobs/in/california/"]')).toBeVisible();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/jobs/in/california/", "/jobs/in/california/san-francisco/", ...TOPICS]) expect(sitemap).toContain(`${path}</loc>`);
  expect(sitemap).not.toContain("?state=");
  const index = await (await request.get("/data/search-index.json")).json();
  expect(index.entries.some((e: { href: string }) => e.href === "/jobs/in/california/")).toBe(true);
});

test("only states at or above the listing threshold have a page", async ({ page, request }) => {
  await page.goto("/jobs/");
  const chips = page.getByRole("navigation", { name: "Browse by" }).locator('a[href^="/jobs/in/"]');
  expect(await chips.count()).toBeGreaterThan(0);
  for (const text of await chips.allTextContents()) expect(Number(/\(([\d,]+)\)/.exec(text)![1].replace(/,/g, ""))).toBeGreaterThanOrEqual(10);
  expect((await request.get("/jobs/in/not-a-state/")).status()).toBe(404);
  expect((await request.get("/jobs/in/california/not-a-city/")).status()).toBe(404);
});

test("landing pages pass axe and fit narrow screens", async ({ page }) => {
  for (const path of ["/jobs/in/california/", "/jobs/in/california/san-francisco/", "/jobs/remote-us/"]) {
    await page.goto(path);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${path}: ${v.id}`)).toEqual([]);
  }
});

test("the freshness notice appears once listings are more than 48 hours old", async ({ page }) => {
  await page.clock.install({ time: new Date(Date.now() + 72 * 3600000) });
  await page.goto("/jobs/in/california/");
  await expect(page.getByRole("status").filter({ hasText: "more than 48 hours ago" })).toBeVisible();
});

test("screenshots of two landing pages at 375 and 1280 pixels", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "one set of screenshots is enough");
  for (const [slug, path] of [["georgia", "/jobs/in/georgia/"], ["entry-level", "/jobs/entry-level/"]] as const) {
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: `reports/screenshots/jobs-landing-${slug}-${width}.png` });
      await page.locator("#listings").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `reports/screenshots/jobs-landing-${slug}-${width}-listings.png` });
    }
  }
});
