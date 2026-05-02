import type { TaskConfig } from "payload"
import {
  buildCandidatesFromDB,
  createAnalyticsClient,
  fetchGA4Metrics,
  readGA4Env,
  scoreArticles,
  writeRankings,
} from "./logic"

export const updateRecommendationsTask: TaskConfig<"updateRecommendations"> = {
  slug: "updateRecommendations",
  label: "Update Article Recommendations",
  retries: { attempts: 2, backoff: { type: "exponential", delay: 60_000 } },
  schedule: [
    {
      // Top of every hour
      cron: "0 * * * *",
      queue: "default",
    },
  ],
  outputSchema: [{ name: "count", type: "number", required: true }],
  handler: async ({ req }) => {
    const { payload } = req
    const { propertyId, clientEmail, privateKey } = readGA4Env()
    const analytics = createAnalyticsClient(clientEmail, privateKey)

    payload.logger.info(`Fetching metrics from GA4 property ${propertyId}...`)
    const metricsBySlug = await fetchGA4Metrics(analytics, propertyId)
    payload.logger.info(`Got metrics for ${metricsBySlug.size} article paths`)

    const candidates = await buildCandidatesFromDB(payload, metricsBySlug)
    const scored = scoreArticles(candidates, Date.now())
    const { count } = await writeRankings(payload, scored)

    payload.logger.info(`Updated recommendations with ${count} articles`)
    return { output: { count } }
  },
}
