import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlotData } from "../types"

export const label = "Vespucci 7"

export const slotDescriptions = [
  "Large featured article in center column",
  "Left column, top (image above)",
  "Left column, bottom (image above)",
  "Right column, stacked (no image)",
  "Right column, stacked (no image)",
  "Right column, stacked (no image)",
  "Right column, stacked (no image)",
]

/**
 * Vespucci 7 Layout
 *
 * Slots (by index):
 *   0: Featured — center column (50%, image above)
 *   1: A — left column, top (image above)
 *   2: B — left column, bottom (image above)
 *   3: C — right column (no image)
 *   4: D — right column (no image)
 *   5: E — right column (no image)
 *   6: F — right column (no image)
 *
 * Desktop (lg:grid-cols-3 — 25%/50%/25%)
 */
export const Vespucci7Layout: React.FC<{ slots: ArticleGridSlotData[] }> = ({ slots }) => {
  const [featured, a, b, c, d, e, f] = slots

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[25%_50%_25%]">
      {/* Featured — center column (50%), spans 2 rows */}
      <div className="md:order-last md:row-span-2 lg:order-none lg:col-start-2 lg:row-span-2">
        <ArticleTile
          article={featured!.article}
          imagePosition="above"
          kicker={featured!.kicker}
          overrideTitle={featured!.overrideTitle}
          className="h-full"
        />
      </div>

      {/* Slots A + B — left column (25%), spans 2 rows */}
      <div className="flex flex-col gap-6 md:order-first md:row-span-2 lg:col-start-1 lg:row-span-2">
        <ArticleTile
          article={a!.article}
          imagePosition="above"
          kicker={a!.kicker}
          overrideTitle={a!.overrideTitle}
        />
        <ArticleTile
          article={b!.article}
          imagePosition="above"
          kicker={b!.kicker}
          overrideTitle={b!.overrideTitle}
        />
      </div>

      {/* Slots C–F — right column (25%), 4 tiles with no image */}
      <div className="grid auto-rows-fr grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:grid-cols-1">
        {[c, d, e, f].map((slot, i) => (
          <ArticleTile
            key={i}
            article={slot!.article}
            imagePosition="none"
            showByline
            kicker={slot!.kicker}
            overrideTitle={slot!.overrideTitle}
          />
        ))}
      </div>
    </div>
  )
}
