import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [slug, name] of [["openclaw", "OpenClaw"], ["hermes-agent", "Hermes Agent"]]) {
  test(`${name} has a sourced runtime page and component-scoped search`, async ({ page }) => {
    await page.goto(`/open/?q=${encodeURIComponent(name)}&kind=runtime&license=MIT&licenseComponent=code`);
    await expect(page.getByRole("list", { name: "Active filters" })).toContainText("License component: code");
    const card = page.locator(`article[data-slug="${slug}"]`);
    await expect(card).toBeVisible();
    await page.goto(`/open/?q=${encodeURIComponent(name)}&kind=runtime&license=MIT&licenseComponent=weights`);
    await expect(page.getByRole("list", { name: "Active filters" })).toContainText("License component: weights");
    await expect(page.locator(`article[data-slug="${slug}"]`)).toHaveCount(0);
    await page.goto(`/open/${slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await expect(page.getByRole("heading", { name: "U.S. eligibility", exact: true })).toBeVisible();
    await expect(page.getByText(/The MIT entry applies to this project’s code/)).toBeVisible();
    await page.setViewportSize({ width: 320, height: 850 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations.map(v => v.id)).toEqual([]);
  });
}

test("Hermes Agent is linked from Nous Research without replacing the model family", async ({ page }) => {
  await page.goto("/companies/nous-research/");
  await expect(page.locator('a[href="/open/hermes-agent/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/open/hermes/"]').first()).toBeVisible();
  await page.locator('a[href="/open/hermes-agent/"]').first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hermes Agent");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nous Research");
});
