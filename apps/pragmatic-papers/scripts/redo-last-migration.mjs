import { execSync } from "child_process"
import { readFileSync, rmSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import process from "process"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, "../src/migrations")
const indexFile = join(migrationsDir, "index.ts")

const source = readFileSync(indexFile, "utf8")
const eol = source.includes("\r\n") ? "\r\n" : "\n"
const lines = source.split(eol)

// Find the last migration name from the last `name:` line in the migrations array
const lastNameLine = [...lines].reverse().find((l) => l.match(/name:\s*['"`]/))
const fullNameMatch = lastNameLine?.match(/name:\s*['"`]([^'"`]+)['"`]/)
if (!fullNameMatch) {
  console.error("Could not determine last migration name from index.ts")
  process.exit(1)
}
const fullName = fullNameMatch[1]
const varName = `migration_${fullName}`

// Remove the import line
const importIdx = lines.findIndex((l) => l.includes(`* as ${varName} from`))
if (importIdx === -1) {
  console.error(`Could not find import for ${varName} in index.ts`)
  process.exit(1)
}
lines.splice(importIdx, 1)

// Find the `name:` line for this migration and remove the surrounding 5-line block:
//   {
//     up: varName.up,
//     down: varName.down,
//     name: '...',
//   },
const nameIdx = lines.findIndex((l) => l.includes(`name:`) && l.includes(fullName))
if (nameIdx === -1) {
  console.error(`Could not find array entry for ${fullName} in index.ts`)
  process.exit(1)
}
lines.splice(nameIdx - 3, 5)

writeFileSync(indexFile, lines.join(eol))
// eslint-disable-next-line no-console
console.log(`Removed entry from index.ts: ${fullName}`)

// Delete the .ts and .json migration files
for (const file of [`${fullName}.ts`, `${fullName}.json`]) {
  rmSync(join(migrationsDir, file))
  // eslint-disable-next-line no-console
  console.log(`Deleted: ${file}`)
}

// Strip the timestamp prefix (YYYYMMDD_HHMMSS_) to get just the descriptive name
const migrationName = fullName.replace(/^\d{8}_\d{6}_/, "")

// eslint-disable-next-line no-console
console.log(`\nRunning: pnpm migrate:create "${migrationName}"`)
execSync(`pnpm migrate:create "${migrationName}"`, {
  cwd: join(__dirname, ".."),
  stdio: "inherit",
})
