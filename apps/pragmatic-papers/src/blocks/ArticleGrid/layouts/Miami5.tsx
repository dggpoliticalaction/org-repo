import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"
import type { LayoutDefinition } from "../types"

export const label = "Miami 5"

export const slotDescriptions = [
  "First article (image above)",
  "Second article (image above)",
  "Third article (image above)",
  "Fourth article (image above)",
  "Fifth article (image above)",
]

/**
 * Miami 5 Layout
 *
 * 5 articles in a single row, each with an image above.
 * Responsive: 1 column on mobile, 2 on sm, 3 on md, 5 equal columns on lg+.
 */
export const Miami5Layout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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

export const Miami5: LayoutDefinition = {
  label,
  slotDescriptions,
  component: Miami5Layout,
}
