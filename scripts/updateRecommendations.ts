/*
MUST READ: This is a debug script for playing with recommendation algorithm logic. 
See src/jobs/updateRecommendations.ts for the ACTUAL CRON.
*/
import { getPayload } from "payload"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  buildCandidatesFromSite,
  createAnalyticsClient,
  fetchGA4Metrics,
  logFilteredArticles,
  logRankings,
  logRawMetrics,
  readGA4Env,
  scoreArticles,
  seedRandomRankings,
} from "../src/jobs/updateRecommendations/logic"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const payloadConfigPath = path.join(__dirname, "../src/payload.config.ts")

const DRY_RUN = process.argv.includes("--dry-run")
const LOCAL_DEV = process.argv.includes("--local")

async function main(): Promise<void> {
  if (!DRY_RUN && !LOCAL_DEV) {
    console.error(
      "Must pass either --dry-run (GA4 fetch, no writes) or --local (seed random rankings into local DB).",
    )
    process.exit(1)
  }

  const awaitedConfig = (await import(payloadConfigPath)).default
  const payload = await getPayload({ config: awaitedConfig })

  if (LOCAL_DEV) {
    payload.logger.info("=== LOCAL DEV MODE — inserting random articles ===\n")
    const count = await seedRandomRankings(payload)
    payload.logger.info(`Inserted ${count} random articles as recommendations`)
    process.exit(0)
  }

  const { propertyId, clientEmail, privateKey } = readGA4Env()
  const analytics = createAnalyticsClient(clientEmail, privateKey)

  payload.logger.info(`Fetching metrics from GA4 property ${propertyId}...`)
  const metricsBySlug = await fetchGA4Metrics(analytics, propertyId)
  payload.logger.info(`Got metrics for ${metricsBySlug.size} article paths`)

  const candidates = await buildCandidatesFromSite(metricsBySlug, payload.logger)
  const scored = scoreArticles(candidates, Date.now())

  payload.logger.info("\n=== DRY RUN MODE ===\n")
  logRawMetrics(metricsBySlug, payload.logger)
  logFilteredArticles(candidates, payload.logger)
  logRankings(scored, payload.logger)
  payload.logger.info("\nDry run complete — no data written to DB.")

  process.exit(0)
}

main().catch((err) => {
  console.error("Failed to update recommendations:", err)
  process.exit(1)
})
