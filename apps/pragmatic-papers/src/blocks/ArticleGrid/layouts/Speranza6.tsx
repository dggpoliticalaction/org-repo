import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"
import type { LayoutDefinition } from "../types"

export const label = "Speranza 6"

export const slotDescriptions = [
  "Large featured article spanning top-left (image right)",
  "Bottom row, left",
  "Bottom row, center",
  "Bottom row, right",
  "Right column, top",
  "Right column, bottom",
]

/**
 * Speranza 6 Layout
 *
 * Like Fibonacci 7, but the right column has two image-above tiles
 * instead of one image-above + two no-image tiles.
 *
 * Slots (by index):
 *   0: Featured — top-left spanning 3 cols (image right)
 *   1: A — bottom row, left
 *   2: B — bottom row, center
 *   3: C — bottom row, right
 *   4: D — right column, top
 *   5: E — right column, bottom
 *
 * Desktop (lg:grid-cols-4)
 */
export const Speranza6Layout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  const [featured, a, b, c, d, e] = slots

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Featured — spans 3 cols, image to the right */}
      <div className="md:col-span-2 lg:col-span-3">
        <ArticleTile
          article={featured!.article}
          imagePosition="right"
          kicker={featured!.kicker}
          overrideTitle={featured!.overrideTitle}
        />
      </div>

      {/* Slots D + E — right column: both image above */}
      <div className="flex flex-col gap-6 lg:row-span-2">
        <ArticleTile
          article={d!.article}
          imagePosition="above"
          kicker={d!.kicker}
          overrideTitle={d!.overrideTitle}
        />
        <ArticleTile
          article={e!.article}
          imagePosition="none"
          kicker={e!.kicker}
          overrideTitle={e!.overrideTitle}
        />
      </div>

      {/* Slots A, B, C — image above, 3 cols under featured */}
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[a, b, c].map((slot, i) => (
            <ArticleTile
              key={i}
              article={slot!.article}
              imagePosition="above"
              kicker={slot!.kicker}
              overrideTitle={slot!.overrideTitle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const Speranza6: LayoutDefinition = {
  label,
  slotDescriptions,
  component: Speranza6Layout,
}
