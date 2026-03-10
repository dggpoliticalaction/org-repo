import type { Payload, RequiredDataFromCollectionSlug } from 'payload'
import type { ArticleGridBlock } from '@/payload-types'
import type { SlotName } from '@/blocks/ArticleGrid/config'
import { createRichTextFromString } from '../richtext'

/**
 * Slot names used by both vespucci-7 and fibonacci-7 layouts.
 */
const SLOT_NAMES: SlotName[] = ['featured', 'a', 'b', 'c', 'd', 'e', 'f']

/**
 * Builds a single ArticleGrid slot referencing an article by ID.
 */
function createSlot(articleId: number, kicker?: string | null, overrideTitle?: string | null) {
  return {
    article: articleId,
    kicker: kicker ?? null,
    overrideTitle: overrideTitle ?? null,
  }
}

/**
 * Builds the `slots` object for an ArticleGrid block from an ordered array of article IDs.
 * The order matches: [featured, a, b, c, d, e, f].
 */
function createSlots(articleIds: number[]): ArticleGridBlock['slots'] {
  if (articleIds.length !== SLOT_NAMES.length) {
    throw new Error(
      `ArticleGrid requires exactly ${SLOT_NAMES.length} articles, received ${articleIds.length}`,
    )
  }
  return Object.fromEntries(
    SLOT_NAMES.map((name, i) => [name, createSlot(articleIds[i]!)]),
  ) as ArticleGridBlock['slots']
}

/**
 * Creates the home page with ArticleGrid blocks and saves it to the `pages` collection.
 *
 * The page mirrors the exported article.json layout:
 *   1. Content block  – "Vespucci Style Article Grid"
 *   2. ArticleGrid    – vespucci-7 layout
 *   3. Content block  – "Fibonacci Style Article Grid"
 *   4. ArticleGrid    – fibonacci-7 layout
 *
 * @param volume1ArticleIds - IDs for volume 1 articles (6 articles)
 * @param volume2ArticleIds - IDs for volume 2 articles (at least 2 needed)
 */
export async function createArticleGridHomePage(
  payload: Payload,
  volume1ArticleIds: number[],
  volume2ArticleIds: number[],
): Promise<void> {
  // Vespucci grid: 6 articles from volume 1 + article 2 from volume 2 (slot f)
  const vespucciArticleIds = [
    ...volume1ArticleIds.slice(0, 6),
    volume2ArticleIds[1]!, // "Irony as Ideology" (2nd volume-2 article)
  ]

  // Fibonacci grid: 6 articles from volume 1 + article 1 from volume 2 (slot f)
  const fibonacciArticleIds = [
    ...volume1ArticleIds.slice(0, 6),
    volume2ArticleIds[0]!, // "Dawkins vs. Blackmore" (1st volume-2 article)
  ]

  const homeData: RequiredDataFromCollectionSlug<'pages'> = {
    title: 'Home',
    slug: 'home',
    generateSlug: false,
    _status: 'published',
    publishedAt: new Date().toISOString(),
    hero: {
      type: 'pageHero',
      richText: createRichTextFromString('Article Grid Home Page Demo!'),
      links: [],
      media: null,
    },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: createRichTextFromString('Vespucci Style Article Grid'),
            enableLink: false,
          },
        ],
      },
      {
        blockType: 'articleGrid',
        blockName: 'Vespucci',
        layout: 'vespucci-7',
        slots: createSlots(vespucciArticleIds),
      },
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: createRichTextFromString('Fibonacci Style Article Grid'),
            enableLink: false,
          },
        ],
      },
      {
        blockType: 'articleGrid',
        blockName: 'Fibonacci',
        layout: 'fibonacci-7',
        slots: createSlots(fibonacciArticleIds),
      },
    ],
    meta: {
      title: null,
      image: null,
      description: null,
    },
  }

  await payload.create({ collection: 'pages', data: homeData })
}
