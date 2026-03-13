import type React from "react"
import type { ArticleTileData } from "@/components/ArticleTile"

/** Resolved slot data passed to layout components */
export interface ArticleGridSlotData {
  article: ArticleTileData
  kicker?: string | null
  overrideTitle?: string | null
}

export interface LayoutDefinition {
  /** Human-readable name shown in the layout selector */
  label: string
  /** One description string per slot, in order. Length determines slot count. */
  slotDescriptions: string[]
  /** The React component that renders this layout */
  component: React.FC<{ slots: ArticleGridSlotData[] }>
}
