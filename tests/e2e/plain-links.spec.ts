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
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Jobs" }).click();
  await expect(page).toHaveURL(/\/jobs\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jobs at U.S. AI companies and labs");
  await page.getByRole("group", { name: "Quick filters" }).getByRole("button", { name: "Internships" }).click();
  await expect(page).toHaveURL(/level=intern/);
  await page.goBack();
  await expect(page).toHaveURL(/\/jobs\/$/);
  await page.locator('main a[href^="/jobs/at/"]').first().click();
  await expect(page).toHaveURL(/\/jobs\/at\//);
  await page.goBack();
  await expect(page).toHaveURL(/\/jobs\/$/);
  expect(rsc).toEqual([]);
  expect(failed).toEqual([]);
  expect((await request.get("/jobs/index.txt")).status()).toBe(404);
});
