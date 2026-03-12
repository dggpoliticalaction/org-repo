import { type VariantProps, cva } from "class-variance-authority"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import React from "react"

import { Media } from "@/components/Media"
import type { Article, Media as MediaType } from "@/payload-types"
import { cn } from "@/utilities/ui"

export type ArticleTileData = Pick<
  Article,
  "title" | "slug" | "heroImage" | "populatedAuthors" | "publishedAt" | "meta"
>

/**
 * Variants:
 *   featured — large primary tile: image above, large title (h3), description, byline
 *   medium   — secondary tile: image above, medium title (h4), description, byline
 *   compact  — no image, no description, no byline: kicker + title (h4 small) + timestamp
 */
const articleTileVariants = cva("group relative", {
  variants: {
    variant: {
      featured: "flex flex-col",
      medium: "flex flex-col",
      compact: "flex flex-col",
    },
  },
  defaultVariants: { variant: "medium" },
})

export interface ArticleTileProps extends VariantProps<typeof articleTileVariants> {
  article: ArticleTileData
  kicker?: string | null
  overrideTitle?: string | null
  horizontal?: boolean
  className?: string
}

export const ArticleTile: React.FC<ArticleTileProps> = ({
  article,
  variant = "medium",
  kicker,
  overrideTitle,
  horizontal = false,
  className,
}) => {
  const { title, slug, heroImage, populatedAuthors, publishedAt, meta } = article
  const displayTitle = overrideTitle || title
  const href = `/articles/${slug}`

  const showMedia = variant !== "compact" && !!heroImage

  const authorNames = populatedAuthors
    ?.filter((a) => a?.name)
    .map((a) => a.name)
    .join(", ")

  const showByline = !!authorNames
  const showDescription = !!meta?.description

  const timeAgo = publishedAt
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true })
    : null

  return (
    <article
      className={cn(
        articleTileVariants({ variant }),
        horizontal && "sm:flex-row-reverse sm:items-center sm:gap-4",
        className,
      )}
    >
      {/* Media */}
      {showMedia && (
        <Link
          href={href}
          className={cn(
            "relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg",
            horizontal && "sm:mb-0 sm:w-1/2 sm:shrink-0",
          )}
          tabIndex={-1}
          aria-hidden
        >
          <Media
            resource={heroImage as MediaType}
            className="h-full w-full transition-opacity group-hover:opacity-75"
            imgClassName="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
      )}

      {/* Text content */}
      <div className={cn("flex flex-col", horizontal && "sm:justify-center")}>
        {/* Kicker */}
        {kicker && (
          <span className="mb-1 inline-block font-sans text-xs font-bold uppercase tracking-wider text-brand">
            {kicker}
          </span>
        )}

        {/* Title */}
        {variant === "featured" ? (
          <h3 className="font-sans text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl">
            <Link href={href} className="transition-colors hover:underline">
              {displayTitle}
            </Link>
          </h3>
        ) : variant === "compact" ? (
          <h4 className="font-sans text-sm font-extrabold leading-tight lg:text-base">
            <Link href={href} className="transition-colors hover:underline">
              {displayTitle}
            </Link>
          </h4>
        ) : (
          /* medium / medium-right */
          <h4 className="font-sans text-base font-extrabold leading-tight sm:text-lg lg:text-xl">
            <Link href={href} className="transition-colors hover:underline">
              {displayTitle}
            </Link>
          </h4>
        )}

        {/* Byline */}
        {showByline && (
          <p className="mt-1 line-clamp-1 font-sans text-sm text-muted-foreground">{authorNames}</p>
        )}

        {/* Description */}
        {showDescription && (
          <p className="mt-2 line-clamp-3 font-sans text-sm text-muted-foreground">
            {meta!.description}
          </p>
        )}

        {/* Timestamp */}
        {timeAgo && <p className="mt-1 font-sans text-xs text-muted-foreground/70">{timeAgo}</p>}
      </div>
    </article>
  )
}
