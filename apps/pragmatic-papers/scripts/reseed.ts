/**
 * dev:reseed — nuke the DB, run migrations, create the dev admin, and seed.
 * Then exits cleanly so the `&&` in package.json hands off to turbo (dev server).
 *
 * Requires DEV_ADMIN_EMAIL, DEV_ADMIN_NAME, and DEV_ADMIN_PASSWORD in .env
 */
import { execSync } from "node:child_process"
import config from "@payload-config"
import { getPayload } from "payload"
import type { Payload } from "payload"
import { seed } from "@/endpoints/seed"

/**
 * Wraps a Payload instance so every local-API mutation automatically carries
 * `context: { disableRevalidate: true }`.  This prevents revalidatePath calls
 * from crashing when there is no active Next.js request context (i.e. in scripts).
 */
function withNoRevalidate(payload: Payload): Payload {
  const ctx = { disableRevalidate: true } as const
  const merge = (args: Record<string, unknown>) => ({
    ...args,
    context: { ...ctx, ...(args.context as object | undefined) },
  })
  const WRITE_OPS = new Set([
    "create",
    "update",
    "updateByID",
    "delete",
    "deleteByID",
    "updateGlobal",
  ])
  return new Proxy(payload, {
    get(target, prop) {
      if (typeof prop === "string" && WRITE_OPS.has(prop)) {
        return (args: Record<string, unknown>) =>
          (target[prop as keyof Payload] as (a: unknown) => unknown)(merge(args))
      }
      return target[prop as keyof Payload]
    },
  })
}

const { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD } = process.env

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" })
}

async function waitForPostgres(timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      execSync("docker exec pragmatic-papers-postgres-dev pg_isready -U postgres", {
        stdio: "ignore",
      })
      return
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error("Timed out waiting for Postgres")
}

async function main() {
  if (!DEV_ADMIN_EMAIL || !DEV_ADMIN_PASSWORD || !process.env.DEV_ADMIN_NAME) {
    console.error(
      "\n❌ DEV_ADMIN_EMAIL, DEV_ADMIN_NAME, and DEV_ADMIN_PASSWORD must all be set in .env",
    )
    process.exit(1)
  }

  // ── 1. Nuke DB ──────────────────────────────────────────────────────────
  console.log("\n🗑️  Nuking database...")
  run("pnpm run dev:db-nuke")

  // ── 2. Start Postgres ───────────────────────────────────────────────────
  console.log("\n🐘 Starting Postgres...")
  run("docker compose -p pragmatic-papers -f docker-compose.yml up -d")
  console.log("   Waiting for Postgres...")
  await waitForPostgres()
  console.log("   Postgres ready.")

  // ── 3. Migrations + dev admin ────────────────────────────────────────────
  console.log("\n⏳ Running migrations...")
  const payload = await getPayload({ config })
  await payload.db.migrateFresh({ forceAcceptWarning: true })
  console.log("✅ Migrations complete")

  const seeder = withNoRevalidate(payload)

  console.log("\n👤 Creating dev admin...")
  await seeder.create({
    collection: "users",
    data: {
      email: process.env.DEV_ADMIN_EMAIL!,
      name: process.env.DEV_ADMIN_NAME!,
      password: process.env.DEV_ADMIN_PASSWORD!,
      role: "admin",
      slug: "dev-admin",
    },
  })
  console.log(`   Dev admin created: ${process.env.DEV_ADMIN_EMAIL}`)

  console.log("\n🌱 Seeding database...")
  await seed(seeder, (message, step, total) => {
    console.log(`   [${step}/${total}] ${message}`)
  })
  console.log("✅ Seed complete")

  await payload.destroy()

  console.log("\n🚀 Starting dev server...\n")
  process.exit(0)
}

main().catch((err) => {
  console.error("❌ Reseed failed:", err)
  process.exit(1)
})
