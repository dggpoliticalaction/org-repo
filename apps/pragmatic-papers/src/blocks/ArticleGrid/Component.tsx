import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { ArticleTileData } from '@/components/ArticleTile'
import type { ArticleGridBlock as ArticleGridBlockType } from '@/payload-types'
import type { ArticleGridLayout, SlotName } from './config'
import type { ArticleGridSlots } from './types'

import { Vespucci7Layout } from './layouts/Vespucci7'
import { Fibonacci7Layout } from './layouts/Fibonacci7'

const layoutComponents: Record<
  ArticleGridLayout,
  React.FC<{ slots: ArticleGridSlots }>
> = {
  'vespucci-7': Vespucci7Layout,
  'fibonacci-7': Fibonacci7Layout,
}

export const ArticleGridBlock: React.FC<
  ArticleGridBlockType & {
    id?: string
  }
> = async (props) => {
  const { id, layout, slots } = props

  if (!layout || !slots) return null

  const payload = await getPayload({ config: configPromise })

  // Collect all article IDs from slots to batch-fetch
  const slotNames: SlotName[] = ['featured', 'a', 'b', 'c', 'd', 'e', 'f']
  const articleIdMap = new Map<number, SlotName[]>()

  for (const slotName of slotNames) {
    const slot = slots[slotName]
    if (!slot?.article) continue

    const articleId = typeof slot.article === 'object' ? slot.article.id : slot.article
    if (!articleIdMap.has(articleId)) {
      articleIdMap.set(articleId, [])
    }
    articleIdMap.get(articleId)!.push(slotName)
  }

  if (articleIdMap.size === 0) return null

  // Batch-fetch all articles in one query
  const articleIds = Array.from(articleIdMap.keys())
  const articlesResult = await payload.find({
    collection: 'articles',
    depth: 1,
    where: {
      id: {
        in: articleIds,
      },
    },
    limit: articleIds.length,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
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

  // Build resolved slots
  const resolvedSlots: Partial<ArticleGridSlots> = {}
  for (const slotName of slotNames) {
    const slot = slots[slotName]
    if (!slot?.article) continue

    const articleId = typeof slot.article === 'object' ? slot.article.id : slot.article
    const article = articleLookup.get(articleId)

    if (!article) continue

    resolvedSlots[slotName] = {
      article,
      kicker: slot.kicker,
      overrideTitle: slot.overrideTitle,
    }
  }

  // Ensure all required slots are populated
  const allSlotsResolved = slotNames.every((name) => resolvedSlots[name])
  if (!allSlotsResolved) {
    // Gracefully degrade — don't render an incomplete grid
    return null
  }

  const LayoutComponent = layoutComponents[layout as ArticleGridLayout]
  if (!LayoutComponent) return null

  return (
    <section className="container" id={`block-${id}`}>
      <LayoutComponent slots={resolvedSlots as ArticleGridSlots} />
    </section>
  )
}
