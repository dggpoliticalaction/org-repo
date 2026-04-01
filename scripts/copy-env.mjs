import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs"
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
  console.warn(`${green("✓")} Copied .env.example → .env`)
} else {
  console.warn(`${green("✓")} .env already exists, skipping.`)
}

const npmrc = resolve(__dirname, "../.npmrc")
const envContent = readFileSync(env, "utf-8")
const tokenMatch = envContent.match(/^GH_FONT_READ=(.+)$/m)

if (tokenMatch?.[1]) {
  const token = tokenMatch[1].trim()
  writeFileSync(
    npmrc,
    [
      "legacy-peer-deps=true",
      "enable-pre-post-scripts=true",
      "@digitalgroundgame:registry=https://npm.pkg.github.com",
      `//npm.pkg.github.com/:_authToken=${token}`,
      "",
    ].join("\n"),
  )
  console.warn(`${green("✓")} Created .npmrc with GitHub token`)
} else {
  console.warn(`${yellow("⚠")} No GitHub token found in .env, skipping .npmrc creation`)
}
