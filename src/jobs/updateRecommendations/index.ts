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
      // Every five minutes
      cron: "*/5 * * * *",
      queue: "default",
    },
  ],
  outputSchema: [{ name: "count", type: "number", required: true }],
  handler: async ({ req }) => {
    const { payload } = req
    try {
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
    } catch (err) {
      const dump = (e: unknown): Record<string, unknown> => {
        if (e === null || typeof e !== "object") return { value: String(e) }
        const out: Record<string, unknown> = {}
        for (const k of Object.getOwnPropertyNames(e)) {
          const v = (e as Record<string, unknown>)[k]
          out[k] =
            v instanceof Error
              ? dump(v)
              : typeof v === "object"
                ? JSON.parse(JSON.stringify(v ?? null))
                : v
        }
        if ("cause" in (e as object) && (e as { cause?: unknown }).cause) {
          out.cause = dump((e as { cause: unknown }).cause)
        }
        return out
      }
      payload.logger.error(
        `updateRecommendations failed — full dump: ${JSON.stringify(dump(err), null, 2)}`,
      )
      throw err instanceof Error ? err : new Error(`Non-Error throwable: ${String(err)}`)
    }
  },
}
