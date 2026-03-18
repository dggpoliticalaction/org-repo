import { cpSync, mkdirSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const src = resolve(
  __dirname,
  "../node_modules/@digitalgroundgame/fonts/assets/FKScreamer-2.0.3/woff2-static",
)
const dest = resolve(__dirname, "../public/fonts")

mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })

console.log("\x1b[32m✓\x1b[0m Fonts copied to public/fonts")
