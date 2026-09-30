import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against the production static export (./out) served by
 * scripts/serve-static.mjs — never against `next dev`.
 *
 *   npm run build && npm run test:e2e
 *
 * The "basepath" project needs a second export built under /usasi:
 *   npm run test:basepath
 */
const PORT = 4410;
const BASE_PORT = 4411;
const hasBasePathBuild = fs.existsSync(".out-basepath/index.html");

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `node scripts/serve-static.mjs --port ${PORT}`,
      url: `http://localhost:${PORT}/`,
      reuseExistingServer: !process.env.CI,
    },
    ...(hasBasePathBuild
      ? [
          {
            command: `node scripts/serve-static.mjs --port ${BASE_PORT} --base /usasi --dir .out-basepath`,
            url: `http://localhost:${BASE_PORT}/usasi/`,
            reuseExistingServer: !process.env.CI,
          },
        ]
      : []),
  ],
  projects: [
    {
      name: "desktop",
      testIgnore: /basepath\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "mobile",
      testMatch: /(site|a11y)\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
    // Only when the /usasi export exists (npm run test:basepath builds it first).
    ...(hasBasePathBuild
      ? [
          {
            name: "basepath",
            testMatch: /basepath\.spec\.ts/,
            use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${BASE_PORT}` },
          },
        ]
      : []),
  ],
});
