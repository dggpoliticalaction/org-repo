import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"

export const label = "Miami 3"

export const slotDescriptions = [
  "Left article (image above)",
  "Center article (image above)",
  "Right article (image above)",
]

/**
 * Miami 3 Layout
 *
 * 3 articles in a single row, each with an image above.
 * Responsive: 1 column on mobile, 3 equal columns on md+.
 */
export const Miami3Layout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
