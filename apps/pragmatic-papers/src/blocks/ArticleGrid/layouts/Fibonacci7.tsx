import React from 'react'
import Link from 'next/link'

import { Media } from '@/components/Media'
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
      {/* Featured — full width on mobile/tablet, spans 3 cols on desktop.
           On sm+ the tile goes side-by-side: image right, text left.
           We achieve this by making the ArticleTile's children flow as a row
           via a wrapping flex override rather than a separate variant. */}
      <div className="md:col-span-2 lg:col-span-3">
        <div className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center">
          <Link
            href={`/articles/${slots.featured.article.slug}`}
            className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg sm:w-1/2"
            tabIndex={-1}
            aria-hidden
          >
            {slots.featured.article.heroImage && (
              <Media
                resource={slots.featured.article.heroImage as import('@/payload-types').Media}
                className="h-full w-full"
                imgClassName="h-full w-full object-cover"
                loading="lazy"
              />
            )}
          </Link>
          <div className="flex flex-col justify-center">
            {slots.featured.kicker && (
              <span className="mb-1 inline-block font-sans text-xs font-bold uppercase tracking-wider text-brand">
                {slots.featured.kicker}
              </span>
            )}
            <h3 className="font-sans text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl">
              <Link href={`/articles/${slots.featured.article.slug}`} className="transition-colors hover:text-brand">
                {slots.featured.overrideTitle || slots.featured.article.title}
              </Link>
            </h3>
            {slots.featured.article.populatedAuthors?.filter((a) => a?.name).map((a) => a.name).join(', ') && (
              <p className="mt-1 line-clamp-1 font-sans text-sm text-muted-foreground">
                {slots.featured.article.populatedAuthors?.filter((a) => a?.name).map((a) => a.name).join(', ')}
              </p>
            )}
            {slots.featured.article.meta?.description && (
              <p className="mt-2 line-clamp-3 font-sans text-sm text-muted-foreground">
                {slots.featured.article.meta.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slot D + E + F — right column on desktop: D (medium) then E, F (compact) stacked below */}
      <div className="flex flex-col gap-6 lg:row-span-2">
        <ArticleTile
          article={slots.d.article}
          variant="medium"
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
            variant="medium"
            kicker={slots.a.kicker}
            overrideTitle={slots.a.overrideTitle}
          />
          <ArticleTile
            article={slots.b.article}
            variant="medium"
            kicker={slots.b.kicker}
            overrideTitle={slots.b.overrideTitle}
          />
          <ArticleTile
            article={slots.c.article}
            variant="medium"
            kicker={slots.c.kicker}
            overrideTitle={slots.c.overrideTitle}
          />
        </div>
      </div>
    </div>
  )
}
