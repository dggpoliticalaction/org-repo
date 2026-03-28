import { nextJsConfig } from "./eslint.next.js"

export default [
  ...nextJsConfig,
  {
    ignores: ["src/migrations/**"],
  },
]
