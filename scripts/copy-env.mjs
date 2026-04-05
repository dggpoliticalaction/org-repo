import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"
import process from "process"
import { fileURLToPath } from "url"
import { blue, gray, green, red, yellow } from "./ansi.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = resolve(__dirname, "../.env")
const example = resolve(__dirname, "../.env.example")

console.warn(`${blue("●")} Setting up environment...`)

if (!existsSync(env)) {
  if (!existsSync(example)) {
    console.warn(`${red("✗")} No .env.example found`)
    process.exit(0)
  }
  copyFileSync(example, env)
  console.warn(`${green("✔")} Copied .env.example → .env`)
} else {
  console.warn(gray("○ .env already exists"))
}

const npmrc = resolve(__dirname, "../.npmrc")
const npmrcContent = existsSync(npmrc) ? readFileSync(npmrc, "utf-8") : ""
if (npmrcContent.includes("//npm.pkg.github.com/:_authToken=")) {
  console.warn(gray("○ .npmrc GitHub token already set"))
  process.exit(0)
}

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
  console.warn(`${green("✔")} Updated .npmrc with GitHub token`)
} else {
  console.warn(`${yellow("⚠")} .npmrc GitHub token not found in .env`)
}
