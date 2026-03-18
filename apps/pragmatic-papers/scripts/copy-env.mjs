import { copyFileSync, existsSync } from "fs"
import { dirname, resolve } from "path"
import process from "process"
import { fileURLToPath } from "url"
import { green, yellow } from "./ansi.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = resolve(__dirname, "../.env")
const example = resolve(__dirname, "../.env.example")

if (!existsSync(env)) {
  if (!existsSync(example)) {
    console.warn(`${yellow("⚠")} No .env.example found, skipping.`)
    process.exit(0)
  }
  copyFileSync(example, env)
  // eslint-disable-next-line no-console
  console.log(`${green("✓")} Copied .env.example → .env`)
} else {
  // eslint-disable-next-line no-console
  console.log(`${green("✓")} .env already exists, skipping.`)
}
