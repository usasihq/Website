import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { isActive, readRecords } from "./helpers";

/**
 * Representative layouts at 360, 390, 768, 1280, and 1920 px, plus 320 px
 * (equivalent to 1280 px at 400% zoom — the WCAG 2.2 reflow case). Checks for
 * page-wide horizontal overflow (tables must scroll inside their container)
 * and saves full-page screenshots to reports/screenshots/.
 */
const WIDTHS = [320, 360, 390, 768, 1280, 1920];
const org = readRecords("organizations").filter(isActive).find((o) => o.slug === "ai2") ?? readRecords("organizations").filter(isActive)[0];
const release = readRecords("artifacts").filter((a) => isActive(a) && a.record_level === "release")[0];

const PAGES: Array<[string, string]> = [
  ["home", "/"],
  ["companies", "/companies/"],
  ["open", "/open/"],
  ["organization", `/companies/${org.slug}/`],
  ["artifact", `/open/${release.slug}/`],
  ["matrix", "/matrix/"],
  ["support", "/support/"],
  ["not-found", "/this-page-does-not-exist/"],
];

fs.mkdirSync("reports/screenshots", { recursive: true });

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width < 768 ? 800 : 1000 } });
    for (const [name, path] of PAGES) {
      test(`${name} has no page-wide horizontal overflow`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `${name} at ${width}px`).toBeLessThanOrEqual(clientWidth);
        // Brand lettering in the header must not be clipped.
        const brand = page.getByRole("link", { name: /USASI — United States of America Superintelligence, home/ });
        const box = await brand.boundingBox();
        expect(box && box.x >= 0 && box.x + box.width <= clientWidth).toBeTruthy();
        await page.screenshot({ path: `reports/screenshots/${name}-${width}.png`, fullPage: true });
      });
    }
  });
}
