import config from "@payload-config"
import { draftMode } from "next/headers"
import { getPayload } from "payload"
import { cache } from "react"

import type { Volume } from "@/payload-types"

const queryVolumesForArticles = cache(async (...articleIds: number[]): Promise<Volume[]> => {
  if (!articleIds.length) return []

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: "volumes",
    draft,
    limit: 1000,
    overrideAccess: draft,
    pagination: false,
    where: {
      articles: {
        in: articleIds,
      },
    },
    depth: 0,
  })

  return docs
})

export const getVolumeByArticleId = cache(
  async (...articleIds: number[]): Promise<Map<number, Volume>> => {
    const volumes = await queryVolumesForArticles(...articleIds)
    const volumeByArticleId = new Map<number, Volume>()

    for (const volume of volumes) {
      for (const article of volume.articles || []) {
        const articleId = typeof article === "number" ? article : article?.id

        if (articleId != null && !volumeByArticleId.has(articleId)) {
          volumeByArticleId.set(articleId, volume)
        }
      }
    }

    return volumeByArticleId
  },
)
