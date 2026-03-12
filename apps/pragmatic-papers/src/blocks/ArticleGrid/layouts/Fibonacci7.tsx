import React from "react"

import { ArticleTile } from "@/components/ArticleTile"
import type { ArticleGridSlots } from "../types"

/**
 * Fibonacci 7 Layout
 *
 * Desktop (lg:grid-cols-4):
 *   Left 3 cols: Featured (col-span-3, image right) → A, B, C (row 2)
 *   Right col: D (image above, row-span-2) → E, F (no image) stacked
 */
export const Fibonacci7Layout: React.FC<{ slots: ArticleGridSlots }> = ({ slots }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Featured — spans 3 cols, image to the right */}
      <div className="md:col-span-2 lg:col-span-3">
        <ArticleTile
          article={slots.featured.article}
          imagePosition="right"
          kicker={slots.featured.kicker}
          overrideTitle={slots.featured.overrideTitle}
        />
      </div>

      {/* Slot D + E + F — right column: D (image above) then E, F (no image) */}
      <div className="flex flex-col gap-6 lg:row-span-2">
        <ArticleTile
          article={slots.d.article}
          imagePosition="above"
          kicker={slots.d.kicker}
          overrideTitle={slots.d.overrideTitle}
        />
        <ArticleTile
          article={slots.e.article}
          imagePosition="none"
          kicker={slots.e.kicker}
          overrideTitle={slots.e.overrideTitle}
        />
        <ArticleTile
          article={slots.f.article}
          imagePosition="none"
          kicker={slots.f.kicker}
          overrideTitle={slots.f.overrideTitle}
        />
      </div>

      {/* Slots A, B, C — image above, 3 cols under featured */}
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ArticleTile
            article={slots.a.article}
            imagePosition="above"
            kicker={slots.a.kicker}
            overrideTitle={slots.a.overrideTitle}
          />
          <ArticleTile
            article={slots.b.article}
            imagePosition="above"
            kicker={slots.b.kicker}
            overrideTitle={slots.b.overrideTitle}
          />
          <ArticleTile
            article={slots.c.article}
            imagePosition="above"
            kicker={slots.c.kicker}
            overrideTitle={slots.c.overrideTitle}
          />
        </div>
      </div>
    </div>
  )
}
