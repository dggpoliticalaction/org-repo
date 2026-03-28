import { cpSync, existsSync, mkdirSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"
import process from "process"
import { fileURLToPath } from "url"
import { green, yellow } from "./ansi.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))

const src = resolve(
  __dirname,
  "../node_modules/@digitalgroundgame/fonts/assets/FKScreamer-2.0.3/woff2-static",
)
const dest = resolve(__dirname, "../public/fonts")
const placeholder = resolve(dest, "FKScreamer-Bold.woff2")

mkdirSync(dest, { recursive: true })

if (!existsSync(src)) {
  if (!existsSync(placeholder)) {
    writeFileSync(placeholder, "")
  }
  // eslint-disable-next-line no-console
  console.log(`${yellow("⚠")} GH_FONT_READ not set — private fonts disabled, using placeholder.`)
  process.exit(0)
}

cpSync(src, dest, { recursive: true })

// eslint-disable-next-line no-console
console.log(`${green("✓")} Fonts copied to public/fonts`)
