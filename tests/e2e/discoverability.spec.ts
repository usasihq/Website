import { expect, test } from "@playwright/test";

test("llms.txt is at the site root with the catalog overview", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text.startsWith("# United States of America Superintelligence")).toBe(true);
  expect(text).toContain("> Independent, unofficial catalog");
  expect(text).toContain("## Jobs");
  expect(text).toContain("/jobs/index/");
  expect(text).toContain("/voices/");
  expect(text).toContain("https://unitedstatesofamericasuperintelligence.com/");
});
