import React from 'react'

import { ArticleTile } from '@/components/ArticleTile'
import type { ArticleGridSlots } from '../types'

/**
 * Fibonacci 7 Layout (BBC Virginia-style)
 *
 * Mobile (grid-cols-1):
 *   All stack vertically: Featured, A, B, C, D (medium), E, F (compact)
 *
 * Tablet (md:grid-cols-2):
 *   Featured (col-span-2)
 *   A, B, C, D in 2×2
 *   E, F in 1×2 row
 *
 * Desktop (lg:grid-cols-4):
 *   Top row: Featured-horizontal (col-span-3) + D (medium, col 4, row-span-2)
 *   Second row: A, B, C (3 columns) | D continues
 *   Third row: E, F (compact, spanning cols 3–4 or similar)
 *
 *   Refined desktop layout:
 *   Left 3 cols: Featured (col-span-3, row 1) → A, B, C (row 2)
 *   Right col: D (row-span all) → E, F stacked
 */
export const Fibonacci7Layout: React.FC<{ slots: ArticleGridSlots }> = ({ slots }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Featured — full width on mobile/tablet, spans 3 cols on desktop */}
      <div className="md:col-span-2 lg:col-span-3">
        <ArticleTile
          article={slots.featured.article}
          variant="featured-right"
          kicker={slots.featured.kicker}
          overrideTitle={slots.featured.overrideTitle}
          className="h-full"
        />
      </div>

      {/* Slot D + E + F — right column on desktop: D (medium) then E, F (compact) stacked below */}
      <div className="flex flex-col gap-6 lg:row-span-2">
        <ArticleTile
          article={slots.d.article}
          variant="featured"
          secondary
          kicker={slots.d.kicker}
          overrideTitle={slots.d.overrideTitle}
        />
        <ArticleTile
          article={slots.e.article}
          variant="compact"
          kicker={slots.e.kicker}
          overrideTitle={slots.e.overrideTitle}
        />
        <ArticleTile
          article={slots.f.article}
          variant="compact"
          kicker={slots.f.kicker}
          overrideTitle={slots.f.overrideTitle}
        />
      </div>

      {/* Slots A, B, C — medium tiles, 2-col on tablet, 3 cols under featured on desktop */}
      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ArticleTile
            article={slots.a.article}
            variant="featured"
            secondary
            kicker={slots.a.kicker}
            overrideTitle={slots.a.overrideTitle}
          />
          <ArticleTile
            article={slots.b.article}
            variant="featured"
            secondary
            kicker={slots.b.kicker}
            overrideTitle={slots.b.overrideTitle}
          />
          <ArticleTile
            article={slots.c.article}
            variant="featured"
            secondary
            kicker={slots.c.kicker}
            overrideTitle={slots.c.overrideTitle}
          />
        </div>
      </div>
    </div>
  )
}
