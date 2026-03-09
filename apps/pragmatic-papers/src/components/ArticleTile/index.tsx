import React from 'react'
import Link from 'next/link'
import { type VariantProps, cva } from 'class-variance-authority'
import { formatDistanceToNow } from 'date-fns'

import type { Article, Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export type ArticleTileData = Pick<
  Article,
  'title' | 'slug' | 'heroImage' | 'populatedAuthors' | 'publishedAt' | 'meta'
>

const articleTileVariants = cva('group relative', {
  variants: {
    variant: {
      featured: 'flex flex-col',
      'featured-large': 'flex flex-col',
      'featured-right': 'flex flex-col sm:flex-row-reverse',
      'featured-left': 'flex flex-col sm:flex-row',
      default: 'flex flex-row',
      compact: 'flex flex-col',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface ArticleTileProps extends VariantProps<typeof articleTileVariants> {
  article: ArticleTileData
  kicker?: string | null
  overrideTitle?: string | null
  secondary?: boolean
  className?: string
}

const VARIANTS_WITH_MEDIA = ['featured', 'featured-large', 'featured-right', 'featured-left', 'default'] as const
const VARIANTS_WITH_BYLINE = ['featured', 'featured-large', 'featured-right', 'featured-left', 'default'] as const

export const ArticleTile: React.FC<ArticleTileProps> = ({
  article,
  variant = 'default',
  kicker,
  overrideTitle,
  secondary = false,
  className,
}) => {
  const { title, slug, heroImage, populatedAuthors, publishedAt, meta } = article
  const displayTitle = overrideTitle || title
  const href = `/articles/${slug}`
  const description = meta?.description

  const showMedia =
    heroImage && (VARIANTS_WITH_MEDIA as readonly string[]).includes(variant ?? 'default')
  const showByline = (VARIANTS_WITH_BYLINE as readonly string[]).includes(variant ?? 'default')
  const showDescription = description && variant !== 'compact'
  const isFeatured = variant?.startsWith('featured') ?? false

  const authorNames = populatedAuthors
    ?.filter((a) => a?.name)
    .map((a) => a.name)
    .join(', ')

  const timeAgo = publishedAt
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true })
    : null

  return (
    <article className={cn(articleTileVariants({ variant }), className)}>
      {/* Media */}
      {showMedia && (
        <Link href={href} className={mediaWrapperClass(variant)} tabIndex={-1} aria-hidden>
          <Media
            resource={heroImage as MediaType}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
      )}

      {/* Text content */}
      <div className={textWrapperClass(variant)}>
        {/* Kicker */}
        {kicker && (
          <span className="mb-1 inline-block font-sans text-xs font-bold uppercase tracking-wider text-brand">
            {kicker}
          </span>
        )}

        {/* Title */}
        {secondary ? (
          <h4
            className={cn(
              'font-sans font-extrabold leading-tight',
              'text-base sm:text-lg lg:text-xl',
            )}
          >
            <Link href={href} className="transition-colors hover:text-brand">
              {displayTitle}
            </Link>
          </h4>
        ) : (
          <h3
            className={cn(
              'font-sans font-extrabold leading-tight',
              isFeatured ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-base lg:text-lg',
              variant === 'compact' && 'text-sm lg:text-base',
            )}
          >
            <Link href={href} className="transition-colors hover:text-brand">
              {displayTitle}
            </Link>
          </h3>
        )}

        {/* Byline */}
        {showByline && authorNames && (
          <p className="mt-1 line-clamp-1 font-sans text-sm text-muted-foreground">
            {authorNames}
          </p>
        )}

        {/* Description */}
        {showDescription && (
          <p className="mt-2 line-clamp-3 font-sans text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Metadata */}
        {timeAgo && (
          <p className="mt-1 font-sans text-xs text-muted-foreground/70">{timeAgo}</p>
        )}
      </div>
    </article>
  )
}

/**
 * Returns the class for the media wrapper based on variant.
 */
function mediaWrapperClass(variant: string | null | undefined): string {
  switch (variant) {
    case 'featured':
      return 'relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg'
    case 'featured-large':
      return 'relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg'
    case 'featured-right':
    case 'featured-left':
      return 'relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg sm:mb-0 sm:w-1/2 sm:flex-shrink-0'
    case 'default':
      return 'relative mr-3 aspect-square w-24 flex-shrink-0 overflow-hidden rounded-lg sm:w-28'
    default:
      return 'relative mb-3 overflow-hidden rounded-lg'
  }
}

/**
 * Returns the class for the text wrapper based on variant.
 */
function textWrapperClass(variant: string | null | undefined): string {
  switch (variant) {
    case 'featured':
    case 'featured-large':
      return 'flex flex-col'
    case 'featured-right':
      return 'flex flex-col justify-center sm:pr-4'
    case 'featured-left':
      return 'flex flex-col justify-center sm:pl-4'
    case 'default':
      return 'flex min-w-0 flex-col justify-center'
    case 'compact':
      return 'flex flex-col'
    default:
      return 'flex flex-col'
  }
}
