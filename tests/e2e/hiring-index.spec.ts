import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the hiring index answers first, links from jobs, and stays in search limits", async ({ page, request }) => {
  await page.goto("/jobs/");
  await expect(page.getByTestId("jobs-section-nav").locator('a[href="/jobs/index/"]')).toBeVisible();
  await expect(page.getByTestId("browse-index").locator('a[href="/jobs/index/"]')).toBeVisible();
  await page.getByTestId("browse-index").locator('a[href="/jobs/index/"]').click();
  await expect(page).toHaveURL(/\/jobs\/index\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI Hiring Index");
  await expect(page.getByTestId("hiring-summary")).toBeVisible();
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description!.length).toBeGreaterThan(20);
  expect(description!.length).toBeLessThanOrEqual(160);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/jobs\/index\/$/);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join("\n");
  expect(ld).toContain('"CollectionPage"');
  expect(ld).toContain('"Dataset"');
  expect(ld).not.toContain('"JobPosting"');
  const sitemap = await (await request.get("/sitemap-pages.xml")).text();
  expect(sitemap).toContain("/jobs/index/</loc>");
  const index = await (await request.get("/data/search-index.json")).json();
  expect(index.entries.some((e: { href: string }) => e.href === "/jobs/index/")).toBe(true);
  await expect(page.getByRole("contentinfo").locator('a[href="/jobs/index/"]')).toBeVisible();
});

test("the hiring index passes axe and fits a narrow screen", async ({ page }) => {
  await page.goto("/jobs/index/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI Hiring Index");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  await page.screenshot({ path: `reports/screenshots/hiring-index-${test.info().project.name}.png`, fullPage: true });
});
