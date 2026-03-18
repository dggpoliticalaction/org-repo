import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, "..")
const envPath = path.join(appRoot, ".env")
const envExamplePath = envPath + ".example"
const authArg = (t) => `--//npm.pkg.github.com/:_authToken=${t}`

let token = process.env.GITHUB_TOKEN
if (!token && fs.existsSync(envPath)) {
  const m = fs.readFileSync(envPath, "utf8").match(/^GITHUB_TOKEN=(.+)$/m)
  token = m ? m[1].trim().replace(/^["']|["']$/g, "") : ""
}

if (!token) {
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log("Created .env - add GITHUB_TOKEN (see .env.example) then run: pnpm install")
  } else {
    console.log("GITHUB_TOKEN not set in .env - add it then run: pnpm install")
  }
  process.exit(1)
}

const cwd = process.env.GITHUB_TOKEN ? path.resolve(appRoot, "..") : appRoot
execSync(`pnpm install --ignore-scripts ${authArg(token)}`, { stdio: "inherit", cwd })
