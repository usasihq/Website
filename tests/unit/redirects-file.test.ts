import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Cloudflare _redirects", () => {
  const text = fs.readFileSync(path.join(process.cwd(), "public/_redirects"), "utf8");

  it("sends www and http to the https apex, leaving query strings for the page canonical", () => {
    expect(text).toMatch(/^https:\/\/www\.unitedstatesofamericasuperintelligence\.com\/\* https:\/\/unitedstatesofamericasuperintelligence\.com\/:splat 301$/m);
    expect(text).toMatch(/^http:\/\/www\.unitedstatesofamericasuperintelligence\.com\/\* https:\/\/unitedstatesofamericasuperintelligence\.com\/:splat 301$/m);
    expect(text).toMatch(/^http:\/\/unitedstatesofamericasuperintelligence\.com\/\* https:\/\/unitedstatesofamericasuperintelligence\.com\/:splat 301$/m);
  });
});
