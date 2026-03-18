import { cpSync, mkdirSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { green } from "./ansi.mjs"
const __dirname = dirname(fileURLToPath(import.meta.url))

const src = resolve(
  __dirname,
  "../node_modules/@digitalgroundgame/fonts/assets/FKScreamer-2.0.3/woff2-static",
)
const dest = resolve(__dirname, "../public/fonts")

mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })

console.log(`${green("✓")} Fonts copied to public/fonts`)
