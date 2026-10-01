import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("component filters expose matching scope and survive back, refresh and reset", async ({ page }) => {
  await page.goto("/open/?license=MIT&licenseComponent=code");
  await expect(page.getByRole("list", { name: "Active filters" })).toContainText("License component: code");
  const cards = page.locator("article[data-slug]");
  const original = await cards.count();
  expect(original).toBeGreaterThan(0);
  await expect(page.locator("[data-license-match]").first()).toContainText("MIT");
  await page.getByText("Filters and sort", { exact: false }).click();
  await page.getByLabel("License component", { exact: true }).selectOption("weights");
  await expect(page).toHaveURL(/licenseComponent=weights/);
  for (const text of await page.locator("[data-license-match]").allTextContents()) expect(text).toMatch(/MIT \((weights|weights-and-code|all)\)/);
  await page.reload();
  await expect(page.getByRole("list", { name: "Active filters" })).toContainText("License component: weights");
  await page.goBack();
  await expect(cards).toHaveCount(original);
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page).toHaveURL(/\/open\/$/);
});

test("representative profiles and component evidence are accessible and wrap at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  for (const slug of ["openai", "ibm", "ai2"]) {
    await page.goto(`/companies/${slug}/`);
    await expect(page.getByRole("heading", { name: "Intended users", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "On this company page" })).toBeVisible();
    const email = page.getByRole("link", { name: /Email a correction/ });
    const href = await email.getAttribute("href");
    expect(href).toMatch(/^mailto:usasihq@gmail.com\?/);
    expect(decodeURIComponent(href!)).toContain(`/companies/${slug}/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map(v => v.id)).toEqual([]);
  }
  await page.goto("/open/gpt-oss-20b/");
  await expect(page.getByRole("heading", { name: "Component reuse rights" })).toBeVisible();
  await expect(page.getByText("No complete system-rights review is recorded for this release.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({ path: "reports/screenshots/evidence-320.png", fullPage: true });
});
