import type { ArticleTileData } from "@/components/ArticleTile"

/** Resolved slot data passed to layout components */
export interface ArticleGridSlotData {
  article: ArticleTileData
  kicker?: string | null
  overrideTitle?: string | null
}
