/**
 * Standalone reseed script.
 * Runs Payload migrations and seeds the database directly — no running Next.js server required.
 *
 * Usage: pnpm dev:reseed (from apps/pragmatic-papers)
 *    or: pnpm dev:reseed (from repo root via turbo)
 */
import config from "@payload-config"
import { getPayload } from "payload"
import { seed } from "@/endpoints/seed"

async function main() {
  console.log("\n🌱 Starting reseed...\n")

  const payload = await getPayload({ config })

  console.log("⏳ Running migrations...")
  await payload.db.migrate()
  console.log("✅ Migrations complete\n")

  console.log("⏳ Seeding database...")
  await seed(payload, (message, step, total) => {
    console.log(`  [${step}/${total}] ${message}`)
  })
  console.log("\n✅ Seed complete!")

  process.exit(0)
}

main().catch((err) => {
  console.error("❌ Reseed failed:", err)
  process.exit(1)
})
