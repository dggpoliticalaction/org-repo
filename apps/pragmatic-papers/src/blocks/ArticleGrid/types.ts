import type { ArticleTileData } from '@/components/ArticleTile'
import type { SlotName } from './config'

/** Resolved slot data passed to layout components */
export interface ArticleGridSlotData {
  article: ArticleTileData
  kicker?: string | null
  overrideTitle?: string | null
}

export type ArticleGridSlots = Record<SlotName, ArticleGridSlotData>
