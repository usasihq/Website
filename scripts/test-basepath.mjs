#!/usr/bin/env node
/**
 * npm run test:basepath
 *
 * Builds the site a second time with NEXT_PUBLIC_BASE_PATH=/usasi (the layout of
 * a GitHub Pages project site), moves that export to .out-basepath/, restores
 * the normal ./out, then checks internal links and runs the "basepath"
 * Playwright project against it.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

const BASE = "/usasi";
const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

const hadOut = fs.existsSync("out");
if (hadOut) fs.renameSync("out", ".out-main-tmp");
try {
  run("npx next build", { NEXT_PUBLIC_BASE_PATH: BASE });
  run("node scripts/postbuild.mjs", { NEXT_PUBLIC_BASE_PATH: BASE });
  fs.rmSync(".out-basepath", { recursive: true, force: true });
  fs.renameSync("out", ".out-basepath");
} finally {
  if (hadOut) {
    fs.rmSync("out", { recursive: true, force: true });
    fs.renameSync(".out-main-tmp", "out");
  }
}

run("node scripts/check-links.mjs --dir .out-basepath", { NEXT_PUBLIC_BASE_PATH: BASE });
run("npx playwright test --project=basepath");
