import type { Topic, Volume } from "@/payload-types"
import config from "@payload-config"
import { draftMode } from "next/headers"
import { getPayload } from "payload"
import { cache } from "react"

export const ARTICLES_PER_PAGE = 5

export const queryTopicBySlug = cache(async (slug: string): Promise<Topic | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "topics",
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
    depth: 0,
  })
  return docs[0] || null
})

export const queryArticlesByTopic = cache(async (topicId: number, page: number = 1) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  return payload.find({
    collection: "articles",
    draft,
    limit: ARTICLES_PER_PAGE,
    page,
    overrideAccess: draft,
    where: { topics: { equals: topicId } },
    depth: 2,
  })
})

export const queryVolumesForArticles = cache(async (articleIds: number[]): Promise<Volume[]> => {
  if (!articleIds.length) return []
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "volumes",
    draft,
    limit: ARTICLES_PER_PAGE,
    overrideAccess: draft,
    pagination: false,
    where: { articles: { in: articleIds } },
    depth: 0,
  })
  return docs
})
