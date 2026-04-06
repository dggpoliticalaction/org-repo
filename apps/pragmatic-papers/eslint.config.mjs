import { nextJsConfig } from "@repo/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: ["src/migrations/**"],
  },
  {
    // Intentionally using <a> instead of next/link to avoid RSC Vary headers
    // that prevent Cloudflare free-tier from caching page responses.
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]
