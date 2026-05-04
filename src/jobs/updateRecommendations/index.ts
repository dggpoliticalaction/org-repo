import type { TaskConfig } from "payload"
import {
  buildCandidatesFromDB,
  createAnalyticsClient,
  DATE_RANGE_START,
  fetchGA4Metrics,
  logFilteredArticles,
  logRankings,
  logRawMetrics,
  MAX_RANKINGS,
  MIN_TOTAL_USERS,
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
      // Twice an hour (on the hour and at minute 30)
      cron: "0,30 * * * *",
      queue: "default",
    },
  ],
  outputSchema: [{ name: "count", type: "number", required: true }],
  handler: async ({ req }) => {
    const { payload } = req
    const log = payload.logger
    const startedAt = Date.now()
    try {
      log.info("[recommendations] === starting update run ===")

      log.debug("[recommendations] step 1/5: reading GA4 credentials from env")
      const { propertyId, clientEmail, privateKey } = readGA4Env()
      log.debug(
        `[recommendations]   GA4 property=${propertyId}, service account=${clientEmail}, private key length=${privateKey.length}`,
      )
      const analytics = createAnalyticsClient(clientEmail, privateKey)

      log.info(
        `[recommendations] step 2/5: fetching pageview metrics from GA4 (range ${DATE_RANGE_START} → today)`,
      )
      let metricsBySlug
      try {
        metricsBySlug = await fetchGA4Metrics(analytics, propertyId)
      } catch (ga4Err) {
        const e = ga4Err as {
          code?: number | string
          details?: string
          metadata?: unknown
          message?: string
          stack?: string
        }
        log.error(
          `[recommendations]   GA4 runReport call failed — code=${e.code ?? "?"}, details=${e.details ?? "?"}, message=${e.message ?? "?"}`,
        )
        log.error(
          `[recommendations]   raw error keys (own + proto)=${JSON.stringify([
            ...new Set([...Object.getOwnPropertyNames(e), ...Object.keys(e)]),
          ])}`,
        )
        throw ga4Err
      }
      log.info(
        `[recommendations]   GA4 returned metrics for ${metricsBySlug.size} unique article slugs`,
      )
      logRawMetrics(metricsBySlug, log)

      log.debug("[recommendations] step 3/5: matching slugs to articles in Payload")
      const candidates = await buildCandidatesFromDB(payload, metricsBySlug, log)
      const latestVolumeCount = candidates.filter((c) => c.isLatestVolume).length
      log.info(
        `[recommendations]   built ${candidates.length} candidates (${latestVolumeCount} from the latest volume — exempt from the ${MIN_TOTAL_USERS}-user minimum)`,
      )
      logFilteredArticles(candidates, log)

      log.debug(
        "[recommendations] step 4/5: scoring candidates as scrollRate × exp(-λ·weeksSincePublish)",
      )
      const scored = scoreArticles(candidates, Date.now())
      log.info(
        `[recommendations]   ${scored.length} of ${candidates.length} candidates passed the user threshold and were scored`,
      )
      logRankings(scored, log)

      log.debug(
        `[recommendations] step 5/5: writing top ${MAX_RANKINGS} rankings to the article-recommendations global`,
      )
      const { count } = await writeRankings(payload, scored, log)

      const elapsedMs = Date.now() - startedAt
      log.info(
        `[recommendations] === done — wrote ${count} rankings in ${(elapsedMs / 1000).toFixed(1)}s ===`,
      )
      return { output: { count } }
    } catch (err) {
      const dump = (e: unknown): Record<string, unknown> => {
        if (e === null || typeof e !== "object") return { value: String(e) }
        const keys = new Set<string>()
        let proto: object | null = e as object
        while (proto && proto !== Object.prototype) {
          for (const k of Object.getOwnPropertyNames(proto)) keys.add(k)
          proto = Object.getPrototypeOf(proto)
        }
        for (const k of Object.keys(e)) keys.add(k)
        const out: Record<string, unknown> = {}
        for (const k of keys) {
          if (k === "constructor") continue
          let v: unknown
          try {
            v = (e as Record<string, unknown>)[k]
          } catch {
            continue
          }
          if (typeof v === "function") continue
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
