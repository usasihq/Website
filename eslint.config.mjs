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
      // Internal links are plain <a> (components/Link.tsx): the export ships no RSC payload files.
      "@next/next/no-html-link-for-pages": "off",
      "no-restricted-imports": ["error", { paths: [{ name: "next/link", message: "Use @/components/Link: the static export ships no RSC payload files for client navigation." }] }],
    },
  },
]);
