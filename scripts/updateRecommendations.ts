import { getPayload } from "payload"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  buildCandidatesFromDB,
  buildCandidatesFromSite,
  createAnalyticsClient,
  fetchGA4Metrics,
  logFilteredArticles,
  logRankings,
  logRawMetrics,
  readGA4Env,
  scoreArticles,
  seedRandomRankings,
  writeRankings,
} from "../src/jobs/updateRecommendations/logic"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const payloadConfigPath = path.join(__dirname, "../src/payload.config.ts")

const DRY_RUN = process.argv.includes("--dry-run")
const LOCAL_DEV = process.argv.includes("--local")

async function main(): Promise<void> {
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

  const candidates = DRY_RUN
    ? await buildCandidatesFromSite(metricsBySlug, payload.logger)
    : await buildCandidatesFromDB(payload, metricsBySlug)
  const scored = scoreArticles(candidates, Date.now())

  if (DRY_RUN) {
    payload.logger.info("\n=== DRY RUN MODE ===\n")
    logRawMetrics(metricsBySlug, payload.logger)
    logFilteredArticles(candidates, payload.logger)
    logRankings(scored, payload.logger)
    payload.logger.info("\nDry run complete — no data written to DB.")
  } else {
    const { count } = await writeRankings(payload, scored)
    payload.logger.info(`Updated recommendations with ${count} articles`)
    logRankings(scored.slice(0, count), payload.logger)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error("Failed to update recommendations:", err)
  process.exit(1)
})
