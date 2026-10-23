import { expect, test } from "@playwright/test";

// The export ships no RSC payload files (scripts/postbuild.mjs), so nothing may
// request them: internal links are plain <a> and every navigation is a page load.
const RSC = /(\/index\.txt|\/__next\.[^/]*\.txt)(\?|$)|[?&]_rsc=/;

test("navigation and filter history never request RSC payloads", async ({ page, request }) => {
  const rsc: string[] = [];
  const failed: string[] = [];
  page.on("request", (r) => { if (RSC.test(r.url())) rsc.push(r.url()); });
  page.on("response", (r) => { if (r.status() >= 400 && new URL(r.url()).origin === new URL(page.url() || r.url()).origin) failed.push(`${r.status()} ${r.url()}`); });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Companies & Labs" }).click();
  await expect(page).toHaveURL(/\/companies\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.locator('main a[href^="/companies/"]').first().click();
  await expect(page).toHaveURL(/\/companies\//);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  expect(rsc).toEqual([]);
  expect(failed).toEqual([]);
  expect((await request.get("/companies/index.txt")).status()).toBe(404);
});
