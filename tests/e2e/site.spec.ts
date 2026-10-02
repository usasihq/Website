import { execFileSync } from "node:child_process";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { isActive, readRecords, readRecordsFrom, shownCount, watchErrors } from "./helpers";

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
    await expect(page.locator("h1")).toHaveText("Explore the companies, models, and tools behind American Super Intelligence.");
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
    const input = page.getByLabel("Search the reference");
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
    await page.getByText("Filters and sort", { exact: false }).click();
    await page.getByLabel("Sector", { exact: true }).selectOption({ index: 1 });
    await expect(page).toHaveURL(/sector=/);
    const filtered = await shownCount(page);
    expect(filtered).toBeLessThanOrEqual(total);

    await page.reload();
    await expect.poll(() => shownCount(page)).toBe(filtered);
    await expect(page.getByLabel("Sector", { exact: true })).not.toHaveValue("");

    await page.getByText("Filters and sort", { exact: false }).click();
    await page.getByLabel("Has cataloged artifact records").check();
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
    expect(await response.text()).toMatch(/<meta http-equiv="Content-Security-Policy" content="[^"]*script-src 'self' https:\/\/static\.cloudflareinsights\.com 'sha256-/);
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
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(mobileNav).toBeHidden();

    await page.getByRole("button", { name: "Menu" }).click();
    await mobileNav.getByRole("link", { name: "Compare" }).click();
    await expect(page).toHaveURL(/\/matrix\/$/);
    await expect(mobileNav).toBeHidden();
  });
});

test.describe("contact and profiles", () => {
  test("footer lists the contact email and official profiles as plain links", async ({ page }) => {
    await page.goto("/");
    const contact = page.getByRole("list", { name: "USASI contact and profiles" });
    await expect(contact.getByRole("link", { name: "usasihq@gmail.com" })).toHaveAttribute("href", "mailto:usasihq@gmail.com");
    for (const host of ["github.com/usasihq", "huggingface.co/usasihq", "x.com/usasihq", "youtube.com/@USASIHQ", "bsky.app/profile/usasihq.bsky.social", "truthsocial.com/@Usasihq"]) {
      await expect(contact.locator(`a[href*="${host}"]`)).toHaveCount(1);
    }
    // No third-party embeds or scripts.
    const external = await page.evaluate(() =>
      [...document.querySelectorAll("script[src], iframe, img[src]")]
        .map((e) => (e as HTMLScriptElement).src)
        .filter((src) => src && !src.startsWith(location.origin)),
    );
    expect(external).toEqual([]);
  });

  test("entry pages link corrections and edits to the configured repository", async ({ page }) => {
    await page.goto(`/companies/${activeOrg.slug}/`);
    const report = page.getByRole("link", { name: /Report a correction/ });
    await expect(report).toHaveAttribute("href", /^https:\/\/github\.com\/usasihq\/Website\/issues\/new\?template=correction\.yml/);
    const edit = page.getByRole("link", { name: /Edit this entry/ });
    await expect(edit).toHaveAttribute("href", `https://github.com/usasihq/Website/edit/main/content/organizations/${activeOrg.slug}.yml`);
  });

  test("security.txt and structured data are published", async ({ request, page }) => {
    const sec = await request.get("/.well-known/security.txt");
    expect(sec.status()).toBe(200);
    expect(await sec.text()).toContain("Contact: mailto:usasihq@gmail.com");
    await page.goto("/");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    const org = ld["@graph"].find((n: { "@type": string }) => n["@type"] === "Organization");
    expect(org.sameAs).toContain("https://github.com/usasihq");
    expect(org.email).toBe("usasihq@gmail.com");
  });
});

test.describe("Local corner", () => {
  const people = (() => {
    try {
      return readRecordsFrom("people").filter((p) => p.publication_status === "published");
    } catch {
      return [];
    }
  })();

  test("lists every published profile with sources and the removal note", async ({ page }) => {
    test.skip(people.length === 0, "no published profiles yet");
    await page.goto("/local/");
    const profiles = page.locator("main article[id]");
    await expect(profiles).toHaveCount(people.length);
    // The index at the top links to each profile on the page.
    const index = page.getByRole("navigation", { name: "People on this page" });
    await expect(index.getByRole("link")).toHaveCount(people.length);
    await expect(page.getByText(/ask to be removed/)).toBeVisible();
    // Every profile's first source marker jumps to that profile's own source list.
    const firstMarker = profiles.first().locator("a[aria-label^='Source 1:']").first();
    const href = await firstMarker.getAttribute("href");
    await expect(page.locator(href!)).toHaveCount(1);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "People behind local AI" })).toBeVisible();
  });
});

test("People Behind Local AI is a standing list, the same in any month", async ({ page }) => {
  const people = readRecordsFrom("people").filter((p) => p.publication_status === "published");
  test.skip(people.length === 0, "no published profiles yet");
  const ids: string[][] = [];
  for (const when of ["2026-10-15T12:00:00Z", "2027-03-15T12:00:00Z"]) {
    await page.clock.setFixedTime(new Date(when));
    await page.goto("/local/");
    ids.push(await page.locator("main article[id]").evaluateAll((els) => els.map((e) => e.id)));
  }
  expect(ids[0]).toHaveLength(people.length);
  expect(ids[1]).toEqual(ids[0]);
  await page.goto("/");
  const strip = page.locator("section[aria-labelledby='local-corner-heading']");
  await expect(strip.locator("ul > li > a")).toHaveCount(people.length);
});

test.describe("first screen", () => {
  for (const [width, height] of [
    // Phone viewports as reported with browser toolbars (iPhone SE, iPhone 13, Galaxy S24, Pixel 7).
    [375, 667],
    [390, 664],
    [360, 780],
    [412, 839],
    [1280, 720],
    [1366, 768],
    [1440, 900],
  ]) {
    test(`heading, search, and both directory actions are visible without scrolling at ${width}x${height}`, async ({ page, isMobile }) => {
      test.skip(isMobile !== width < 768, "each size runs in the matching project");
      await page.setViewportSize({ width, height });
      await page.goto("/", { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      for (const locator of [
        page.locator("h1"),
        page.getByLabel("Search the reference"),
        page.getByRole("link", { name: "Explore Companies & Labs" }),
        page.getByRole("link", { name: "Explore Open Models & Tools" }),
      ]) {
        const box = await locator.boundingBox();
        expect(box && box.y + box.height).toBeLessThanOrEqual(height);
      }
    });
  }
});

test.describe("latest news", () => {
  const items = readRecordsFrom("news").filter((n) => n.publication_status === "published");

  test("news page, item pages, homepage strip, and RSS feed agree", async ({ page, request }) => {
    test.skip(items.length === 0, "no published news yet");
    await page.goto("/news/");
    await expect(page.locator("main article[data-news]")).toHaveCount(items.length);
    const first = page.locator("main article[data-news] h2 a").first();
    await first.click();
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Related catalog entries" })).toBeVisible();

    await page.goto("/");
    const strip = page.locator("section[aria-labelledby='latest-heading'] article[data-news]");
    expect(await strip.count()).toBe(Math.min(3, items.length));

    const feed = await request.get("/news/feed.xml");
    expect(feed.status()).toBe(200);
    const xml = await feed.text();
    expect(xml).toContain("<rss version=\"2.0\"");
    expect((xml.match(/<item>/g) ?? []).length).toBe(Math.min(50, items.length));
  });

  test("the weekly email block is honest about its state", async ({ page }) => {
    await page.goto("/news/");
    const block = page.locator("[data-newsletter]");
    const state = await block.getAttribute("data-newsletter");
    if (state === "active") await expect(block.getByRole("link", { name: /Subscribe/ })).toHaveAttribute("href", /^https:\/\//);
    else await expect(page.getByTestId("newsletter-unavailable")).toHaveText("The weekly email is coming soon.");
  });
});

test.describe("focused search and comparison", () => {
  test("OpenAI wins over description matches; clearing restores the directory", async ({ page }) => {
    await page.goto("/companies/?q=OpenAI");
    await expect(page.locator("article[data-slug]").first()).toHaveAttribute("data-slug", "openai");
    await page.getByRole("button", { name: "Clear all filters" }).click();
    await expect(page).toHaveURL(/\/companies\/$/);
    await expect(page.locator("article[data-slug]").first()).not.toHaveAttribute("data-slug", "openai");
    await page.goBack();
    await expect(page.locator("article[data-slug]").first()).toHaveAttribute("data-slug", "openai");
  });

  test("selection, full columns, refresh, back and reset are reflected in the URL", async ({ page }) => {
    await page.goto("/matrix/");
    const rows = page.locator("#models tbody tr");
    const all = await rows.count();
    await expect(page.locator("#models thead th")).toHaveCount(4);
    await page.getByLabel("Add organization to compare").selectOption("openai");
    await expect(rows).toHaveCount(1);
    await page.getByLabel("Add organization to compare").selectOption("ai2");
    await expect(rows).toHaveCount(2);
    await page.getByLabel("Show all comparison columns").check();
    await expect(page.locator("#models thead th")).toHaveCount(12);
    await page.reload();
    await expect(rows).toHaveCount(2);
    await expect(page.getByLabel("Show all comparison columns")).toBeChecked();
    await page.goBack();
    await expect(page.getByLabel("Show all comparison columns")).not.toBeChecked();
    await page.getByRole("button", { name: "Remove OpenAI", exact: true }).click();
    await expect(rows).toHaveCount(1);
    await page.getByRole("button", { name: "Reset comparison" }).click();
    await expect(rows).toHaveCount(all);
    await expect(page).toHaveURL(/\/matrix\/$/);
  });

  test("new disclosures and comparison table support keyboard and accessible names", async ({ page }) => {
    await page.goto("/companies/");
    const summary = page.getByText("Filters and sort", { exact: false });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Sector", { exact: true })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Sector", { exact: true })).not.toBeVisible();
    await page.goto("/matrix/?orgs=openai,ai2&detail=1");
    const table = page.getByRole("region", { name: /Organization comparison table/ });
    await table.focus();
    await expect(table).toBeFocused();
    await expect(page.getByRole("status")).toContainText("Showing 2 of");
    await expect(page.getByRole("rowheader", { name: "OpenAI", exact: true })).toBeVisible();
    await expect(page.locator('[data-org="openai"] td[data-col="releases"] a')).toHaveAccessibleName(/Model releases for OpenAI.*View the records counted/);
    const definitions = page.getByText("Column definitions and counting rules", { exact: true });
    await definitions.focus();
    await page.keyboard.press("Space");
    await expect(page.getByText("Zero versus unknown", { exact: true })).toBeVisible();
  });
});

test("comparison handles unknown selections and caps a focused set at four", async ({ page }) => {
  await page.goto("/matrix/?orgs=missing-organization");
  await expect(page.getByText(/No published organizations match this selection/)).toBeVisible();
  await page.getByRole("button", { name: "Reset comparison" }).click();
  for (const slug of ["openai", "ai2", "google", "meta"]) {
    await page.getByLabel("Add organization to compare").selectOption(slug);
  }
  await expect(page.locator("#models tbody tr")).toHaveCount(4);
  await expect(page.getByLabel("Add organization to compare").locator("option")).toHaveCount(1);
  await expect(page.getByLabel("Add organization to compare")).toContainText("Four selected — remove one first");
  await page.getByRole("button", { name: "Remove OpenAI", exact: true }).click();
  await expect(page.getByLabel("Add organization to compare")).toBeVisible();
});

test("expanded filters reflow on a narrow screen and result headings appear early", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const path of ["/companies/", "/open/"]) {
    await page.goto(path);
    const first = page.locator("article[data-slug]").first();
    const box = await first.boundingBox();
    expect(box!.y).toBeLessThan(800);
    await page.getByText("Filters and sort", { exact: false }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
});

test("project comparison summarizes duplicate license labels without changing records", async ({ page }) => {
  await page.goto("/matrix/");
  const repeated = artifacts.filter((a) => isActive(a) && a.record_level === "project" && (a.licenses ?? []).length > new Set((a.licenses ?? []).map((l: { spdx: string | null; name: string }) => l.spdx ?? l.name)).size);
  expect(repeated.length).toBeGreaterThan(0);
  for (const artifact of repeated) {
    const expected = [...new Set((artifact.licenses ?? []).map((l: { spdx: string | null; name: string }) => l.spdx ?? l.name))].join(", ");
    await expect(page.locator(`#projects tr[data-artifact="${artifact.slug}"] td`).nth(2)).toHaveText(expected);
  }
});

test("unconfigured sponsor is absent from every allowed and disallowed placement", async ({ page }) => {
  for (const path of ["/", "/companies/", "/open/", "/matrix/", "/news/"]) {
    await page.goto(path);
    await expect(page.locator("[data-homepage-sponsor]")).toHaveCount(0);
  }
});

for (const width of [320, 1280]) {
  test(`configured sponsor fixture has disclosure, no tracking, and accessible layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/images/sponsors/fixture.png", (route) => route.fulfill({ path: "app/apple-icon.png", contentType: "image/png" }));
    await page.goto("/");
    const externalRequests: string[] = [];
    page.on("request", (request) => { if (!request.url().startsWith("http://localhost:")) externalRequests.push(request.url()); });
    // Render the actual component with synthetic test data; no fixture is shipped in the site.
    const html = execFileSync(process.execPath, ["--import", "tsx", "tests/fixtures/render-sponsor.tsx"], { encoding: "utf8" });
    await page.evaluate((markup) => document.getElementById("latest-heading")!.closest("section")!.insertAdjacentHTML("beforebegin", markup), html);
    const panel = page.getByRole("complementary", { name: "Advertisement · Paid sponsor" });
    await panel.scrollIntoViewIfNeeded();
    await expect(panel.getByRole("link")).toHaveCount(1);
    await expect(panel.getByRole("link")).toHaveAttribute("rel", "sponsored noopener noreferrer");
    await expect(panel.getByRole("link")).toHaveAccessibleName(/Visit Fixture Sponsor.*external sponsor site/);
    await expect.poll(() => panel.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const before = await page.locator("#previews-heading").evaluate((h) => h.closest("section")!.getBoundingClientRect().bottom);
    const after = await page.locator("#latest-heading").evaluate((h) => h.closest("section")!.getBoundingClientRect().top);
    const box = (await panel.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(before);
    expect(box.y + box.height).toBeLessThanOrEqual(after);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 320) {
      const logo = (await panel.locator("img").boundingBox())!;
      const text = (await panel.locator("h2").boundingBox())!;
      expect(text.y).toBeGreaterThanOrEqual(logo.y + logo.height);
    }
    const results = await new AxeBuilder({ page }).include("[data-homepage-sponsor]").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
    expect(externalRequests).toEqual([]);
    await panel.screenshot({ path: `reports/screenshots/sponsor-fixture-${width}.png` });
  });
}


test("people navigation order, keyboard activation and current-page semantics", async ({ page, isMobile }) => {
  await page.goto("/about/");
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  const nav = page.getByRole("navigation", { name: isMobile ? "Primary (mobile)" : "Primary", exact: true });
  const labels = await nav.getByRole("link").allTextContents();
  expect(labels.slice(-3)).toEqual(["Methodology", "People Behind Local AI", "About"]);
  await nav.getByRole("link", { name: "Methodology", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "People Behind Local AI", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/local\/$/);
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(nav.getByRole("link", { name: "People Behind Local AI", exact: true })).toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Mia's October profile keeps sourced deployment work and catalog links", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-15T12:00:00Z"));
  await page.goto("/local/#mia");
  const card = page.locator("article#mia");
  await expect(card.getByRole("heading", { name: "Mia", exact: true })).toBeVisible();
  await expect(card.getByRole("link", { name: /^Website \(external site:/ })).toHaveAttribute("href", "https://mia-ai.net/");
  await expect(card.getByRole("link", { name: /^GitHub \(external site:/ })).toHaveAttribute("href", "https://github.com/MiaAI-Lab");
  await expect(card.locator('a[href="/open/vllm/"]')).toHaveCount(1);
  await expect(card).toContainText("independent deployment work using vLLM");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await card.screenshot({ path: `reports/screenshots/mia-${test.info().project.name}.png` });
});

test("every page carries the independence line, and orientation pages are reachable", async ({ page, isMobile }) => {
  for (const path of ["/", "/companies/", "/open/acme-not-real/", "/start/"]) {
    await page.goto(path);
    await expect(page.getByTestId("header-disclaimer")).toBeVisible();
    await expect(page.getByTestId("header-disclaimer")).toContainText("Not a U.S. government website");
  }
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Reference (mobile)" }).getByRole("link", { name: "Start here" })).toBeVisible();
  } else {
    await page.getByRole("navigation", { name: "Reference" }).getByRole("link", { name: "Start here" }).click();
    await expect(page).toHaveURL(/\/start\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("How to use this reference");
  }
  for (const path of ["/glossary/", "/learn/open-weight-vs-open-source/", "/reuse/"]) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("reference sections: learn, hubs, places, and record context", async ({ page }) => {
  await page.goto("/learn/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn");
  const explainers = page.locator("section[aria-labelledby='explainers-heading'] li a");
  expect(await explainers.count()).toBe(10);
  await explainers.nth(1).click();
  await expect(page.getByRole("heading", { level: 2, name: "Sources" })).toBeVisible();

  await page.goto("/hubs/");
  const hubs = page.locator("main li a");
  if (await hubs.count()) {
    await hubs.first().click();
    await expect(page.getByRole("heading", { name: "What this hub covers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Primary documents" })).toBeVisible();
  }

  await page.goto("/places/");
  await page.getByRole("link", { name: /^California/ }).click();
  await expect(page).toHaveURL(/\/places\/california\/$/);
  await expect(page.getByText(/not offices, facilities, or computing capacity/)).toBeVisible();

  await page.goto("/companies/nvidia/");
  await expect(page.getByRole("heading", { name: "Explore related information" })).toBeVisible();
});

test("comparison exports the visible selection with caveats", async ({ page }) => {
  await page.goto("/matrix/?orgs=openai,ai2");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /^JSON/ }).click()]);
  const body = JSON.parse(await (await import("node:fs/promises")).readFile((await download.path())!, "utf8"));
  expect(body.rows.map((r: { slug: string }) => r.slug).sort()).toEqual(["ai2", "openai"]);
  expect(body.caveat).toMatch(/not capability/);
});

test("search covers reference pages; timeline and source library load", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search the reference").fill("quantization");
  const results = page.getByRole("list", { name: "Search results" });
  await expect(results.getByRole("link", { name: /Quantization/ }).first()).toBeVisible();
  await page.getByLabel("Search the reference").fill("California");
  await expect(results.getByRole("link", { name: /California/ }).first()).toBeVisible();

  await page.goto("/timeline/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Timeline");
  await expect(page.locator("main section[id^='y'] li a").first()).toBeVisible();

  await page.goto("/sources/");
  await expect(page.getByRole("status").filter({ hasText: /sources$/ })).toContainText(/of [\d,]+ sources/);
  await page.getByLabel("Search sources").fill("license");
  await expect(page.locator("main ul.space-y-4 > li").first()).toBeVisible();
});
