import React from "react"
import configPromise from "@payload-config"
import { getPayload } from "payload"

import type { ArticleTileData } from "@/components/ArticleTile"
import type { ArticleGridBlock as ArticleGridBlockType } from "@/payload-types"
import type { ArticleGridSlotData } from "./types"
import { layouts, type ArticleGridLayoutKey } from "./config"

/** Raw slot shape from Payload (array item) */
interface RawSlot {
  article: number | { id: number }
  kicker?: string | null
  overrideTitle?: string | null
}

export const ArticleGridBlock: React.FC<
  ArticleGridBlockType & {
    id?: string
  }
> = async (props) => {
  const { id, layout } = props
  // Cast to array — the Payload schema defines `slots` as an array field,
  // but generated types may lag behind until `payload generate:types` is re-run.
  const slots = props.slots as unknown as RawSlot[] | undefined

  if (!layout || !slots?.length) return null

  const layoutDef = layouts[layout as ArticleGridLayoutKey]
  if (!layoutDef) return null

  const expectedCount = layoutDef.slotDescriptions.length
  if (slots.length < expectedCount) return null // incomplete grid

  const payload = await getPayload({ config: configPromise })

  // Collect unique article IDs to batch-fetch
  const articleIds = new Set<number>()
  for (const slot of slots) {
    if (!slot.article) continue
    const articleId = typeof slot.article === "object" ? slot.article.id : slot.article
    articleIds.add(articleId)
  }

  if (articleIds.size === 0) return null

  // Batch-fetch all articles in one query
  const ids = Array.from(articleIds)
  const articlesResult = await payload.find({
    collection: "articles",
    depth: 1,
    where: { id: { in: ids } },
    limit: ids.length,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      authors: true,
      heroImage: true,
      populatedAuthors: true,
      publishedAt: true,
      meta: true,
    },
  })

  // Build a lookup map: articleId → article data
  const articleLookup = new Map<number, ArticleTileData>()
  for (const doc of articlesResult.docs) {
    articleLookup.set(doc.id, doc as unknown as ArticleTileData)
  }

  // Resolve each slot in order
  const resolvedSlots: ArticleGridSlotData[] = []
  for (let i = 0; i < expectedCount; i++) {
    const slot = slots[i]!
    const articleId = typeof slot.article === "object" ? slot.article.id : slot.article
    const article = articleLookup.get(articleId)
    if (!article) return null // missing article → don't render incomplete grid

    resolvedSlots.push({
      article,
      kicker: slot.kicker,
      overrideTitle: slot.overrideTitle,
    })
  }

  const LayoutComponent = layoutDef.component

  return (
    <section className="container" id={`block-${id}`}>
      <LayoutComponent slots={resolvedSlots} />
    </section>
  )
}
