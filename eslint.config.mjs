import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", ".out-basepath/**", ".out-main-tmp/**", ".wrangler/**", "reports/**", "node_modules/**", "next-env.d.ts", "test-results/**", "playwright-report/**", "public/data/**"]),
  {
    rules: {
      // Raw <img>/<picture> is intentional: the static export uses prebuilt responsive derivatives.
      "@next/next/no-img-element": "off",
    },
  },
]);
