import config from "@payload-config"
import { draftMode } from "next/headers"
import { getPayload } from "payload"
import { cache } from "react"

import type { Article, Topic, User, Volume } from "@/payload-types"

const AUTHOR_ROLES = ["writer", "editor", "chief-editor"]
type SlugCollection = "articles" | "topics" | "volumes"

async function queryDocumentBySlug<Doc>(
  collection: SlugCollection,
  slug: string,
  depth = 0,
): Promise<Doc | null> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
    depth,
  })

  return (docs[0] as Doc | undefined) || null
}

export const queryAuthorSlugs = cache(async (): Promise<{ slug: string | null | undefined }[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "users",
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          role: {
            in: AUTHOR_ROLES,
          },
        },
        {
          slug: {
            not_equals: null,
          },
        },
      ],
    },
  })

  return docs.map(({ slug }) => ({ slug }))
})

export const queryTopicSlugs = cache(async (): Promise<{ slug: string | null | undefined }[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "topics",
    draft: false,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        not_equals: null,
      },
    },
  })

  return docs.map(({ slug }) => ({ slug }))
})

export const queryArticleSlugs = cache(async (): Promise<{ slug: string | null | undefined }[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "articles",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
    context: {
      skipAfterRead: true,
    },
  })

  return docs.map(({ slug }) => ({ slug }))
})

export const queryVolumeSlugs = cache(async (): Promise<{ slug: string | null | undefined }[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "volumes",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return docs.map(({ slug }) => ({ slug }))
})

export const queryUserBySlug = cache(async (slug: string): Promise<User | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: "users",
    draft,
    limit: 1,
    pagination: false,
    where: {
      and: [
        {
          role: {
            in: AUTHOR_ROLES,
          },
        },
        {
          slug: {
            equals: slug,
          },
        },
      ],
    },
    depth: 1,
  })

  return docs[0] || null
})

export const queryArticlesByAuthor = cache(async (userId: number, page: number, limit: number) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  return payload.find({
    collection: "articles",
    draft,
    limit,
    page,
    where: {
      authors: {
        equals: userId,
      },
    },
    depth: 2,
  })
})

export const queryTopics = cache(async (page: number, limit: number) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  return payload.find({
    collection: "topics",
    draft,
    limit,
    page,
    pagination: true,
  })
})

export const queryTopicBySlug = cache(async (slug: string): Promise<Topic | null> => {
  return queryDocumentBySlug<Topic>("topics", slug)
})

export const queryArticlesByTopic = cache(async (topicId: number, page: number, limit: number) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  return payload.find({
    collection: "articles",
    draft,
    limit,
    page,
    overrideAccess: draft,
    where: {
      topics: {
        equals: topicId,
      },
    },
    depth: 2,
  })
})

export const queryArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  return queryDocumentBySlug<Article>("articles", slug)
})

export const queryVolumeBySlug = cache(async (slug: string): Promise<Volume | null> => {
  return queryDocumentBySlug<Volume>("volumes", slug, 2)
})

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
