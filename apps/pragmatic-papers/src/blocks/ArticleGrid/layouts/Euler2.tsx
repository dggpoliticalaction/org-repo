import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"
import type { LayoutDefinition } from "../types"

export const label = "Euler 2"

export const slotDescriptions = ["Left article", "Right article"]

/**
 * Euler 2 Layout
 *
 * 2 articles in a single row, each with an image above.
 * Responsive: 1 column on mobile, 2 equal columns on md+.
 */
export const Euler2Layout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {slots.map((slot, i) => (
        <ArticleTile
          key={i}
          article={slot.article}
          imagePosition="above"
          kicker={slot.kicker}
          overrideTitle={slot.overrideTitle}
        />
      ))}
    </div>
  )
}

export const Euler2: LayoutDefinition = {
  label,
  slotDescriptions,
  component: Euler2Layout,
}
