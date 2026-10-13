import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  esbuild: { jsx: "automatic" },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    environment: "node",
    env: { USASI_TODAY: "2026-09-29" },
    // Several suites load the whole published catalog; in a full parallel run
    // they can pass 5 s on a busy machine without anything being wrong.
    testTimeout: 30_000,
  },
});
