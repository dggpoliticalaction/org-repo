import React from 'react'

import { ArticleTile } from '@/components/ArticleTile'
import type { ArticleGridSlots } from '../types'

/**
 * Vespucci 7 Layout (BBC Vermont-style)
 *
 * Mobile (grid-cols-1):
 *   All stack vertically: Featured, A (medium), B (medium), C–F (compact)
 *
 * Tablet (md:grid-cols-2):
 *   Col 1: A + B stacked (md:order-first)
 *   Col 2: Featured
 *   Full width row: C, D, E, F in 2×2 grid
 *
 * Desktop (lg:grid-cols-3):
 *   Col 1: A + B stacked
 *   Col 2: Featured
 *   Col 3: C, D, E, F stacked vertically
 */
export const Vespucci7Layout: React.FC<{ slots: ArticleGridSlots }> = ({ slots }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[25%_50%_25%]">
      {/* Featured — center column (50%), spans 2 rows */}
      <div className="md:order-last md:row-span-2 lg:order-none lg:col-start-2 lg:row-span-2">
        <ArticleTile
          article={slots.featured.article}
          variant="featured-large"
          kicker={slots.featured.kicker}
          overrideTitle={slots.featured.overrideTitle}
          className="h-full"
        />
      </div>

      {/* Slots A + B — left column (25%), spans 2 rows */}
      <div className="flex flex-col gap-6 md:order-first md:row-span-2 lg:col-start-1 lg:row-span-2">
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
      </div>

      {/* Slots C–F — right column (25%), 4 compact tiles filling the full height */}
      <div className="grid auto-rows-fr grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:grid-cols-1">
        <ArticleTile
          article={slots.c.article}
          variant="compact"
          kicker={slots.c.kicker}
          overrideTitle={slots.c.overrideTitle}
        />
        <ArticleTile
          article={slots.d.article}
          variant="compact"
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
    </div>
  )
}
