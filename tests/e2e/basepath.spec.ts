import { expect, test } from "@playwright/test";
import { isActive, readRecords } from "./helpers";

/**
 * GitHub Pages project-site layout: the export built with
 * NEXT_PUBLIC_BASE_PATH=/usasi and served under /usasi/ (npm run test:basepath).
 */
const org = readRecords("organizations").filter(isActive)[0];

test("assets, navigation, deep links, and 404 work under a base path", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("does-not-exist")) failed.push(`${r.status()} ${r.url()}`);
  });

  await page.goto("/usasi/");
  const hero = page.locator("figure img").first();
  expect(await hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const stylesheet = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  expect(stylesheet).toBe("rgb(5, 8, 22)");

  await page.getByRole("link", { name: "Explore Companies & Labs" }).click();
  await expect(page).toHaveURL(/\/usasi\/companies\/$/);

  await page.goto(`/usasi/companies/${org.slug}/`);
  await expect(page.locator("h1")).toHaveText(org.name);
  await page.reload();
  await expect(page.locator("h1")).toHaveText(org.name);

  const sitemap = await (await page.request.get("/usasi/sitemap.xml")).text();
  expect(sitemap).toContain(`/usasi/companies/${org.slug}/`);

  const notFound = await page.goto("/usasi/does-not-exist/");
  expect(notFound?.status()).toBe(404);
  expect(failed).toEqual([]);
});

test("Jobs links and filters preserve the base path", async ({page}) => {
  await page.goto("/usasi/jobs/?company=openai");
  await expect(page.getByRole("heading",{level:1})).toHaveText("Jobs");
  await expect(page.getByLabel("Company or lab",{exact:true})).toHaveValue("openai");
  await page.getByLabel("Company or lab",{exact:true}).selectOption("anthropic");
  await expect(page).toHaveURL(/\/usasi\/jobs\/\?company=anthropic/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href",/\/usasi\/jobs\/$/);
});
