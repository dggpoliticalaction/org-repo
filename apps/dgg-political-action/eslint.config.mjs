import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "src/migrations/**/*",
      "src/app/(payload)/admin/importMap.js",
    ]
  },
  ...nextJsConfig,
];