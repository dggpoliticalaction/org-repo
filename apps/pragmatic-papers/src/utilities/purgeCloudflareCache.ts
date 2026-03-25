import type { Payload } from "payload"

import { getServerSideURL } from "./getURL"

/**
 * Purges specific paths from Cloudflare's edge cache.
 *
 * Requires CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN env vars.
 * Silently skips if either is absent (e.g. local dev).
 */
export async function purgeCloudflareCache(
  paths: string[],
  logger?: Payload["logger"],
): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN

  if (!zoneId || !apiToken) return

  const baseUrl = getServerSideURL()
  const files = paths.map((path) => `${baseUrl}${path}`)

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    })

    if (!res.ok) {
      const text = await res.text()
      logger?.error(`Cloudflare cache purge failed (${res.status}): ${text}`)
    } else {
      logger?.info(`Cloudflare cache purged: ${files.join(", ")}`)
    }
  } catch (err) {
    logger?.error(`Cloudflare cache purge error: ${String(err)}`)
  }
}
