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

export type ImagePosition = "above" | "below" | "left" | "right" | "none"

export interface ArticleTileProps {
  article: ArticleTileData
  imagePosition?: ImagePosition
  showByline?: boolean
  kicker?: string | null
  overrideTitle?: string | null
  className?: string
}

export const ArticleTile: React.FC<ArticleTileProps> = ({
  article,
  imagePosition = "above",
  showByline = false,
  kicker,
  overrideTitle,
  className,
}) => {
  const { title, slug, heroImage, populatedAuthors, publishedAt, meta } = article
  const displayTitle = overrideTitle || title
  const href = `/articles/${slug}`

  const showMedia = imagePosition !== "none" && !!heroImage
  const isHorizontal = imagePosition === "left" || imagePosition === "right"

  const authorNames = populatedAuthors
    ?.filter((a) => a?.name)
    .map((a) => a.name)
    .join(", ")

  const showDescription = !!meta?.description

  const timeAgo = publishedAt
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true })
    : null

  const mediaBlock = showMedia && (
    <Link
      href={href}
      className={cn(
        "relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg",
        isHorizontal && "w-1/2",
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
  )

  const textBlock = (
    <div className={cn("flex flex-col", isHorizontal && "justify-center")}>
      {/* Kicker */}
      {kicker && (
        <span className="mb-1 inline-block font-sans text-xs font-bold uppercase tracking-wider text-brand">
          {kicker}
        </span>
      )}

      {/* Title — uses container queries to scale with available space */}
      <h4 className="font-sans text-sm font-extrabold leading-tight @xs:text-base @sm:text-lg @md:text-xl @lg:text-2xl @2xl:text-3xl">
        <Link href={href} className="transition-colors hover:underline">
          {displayTitle}
        </Link>
      </h4>

      {/* Byline */}
      {showByline && authorNames && (
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
  )

  return (
    <article
      className={cn(
        "group relative flex gap-4 @container",
        isHorizontal ? "flex-row items-center" : "flex-col",
        className,
      )}
    >
      {imagePosition === "below" ? (
        <>
          {textBlock}
          {mediaBlock}
        </>
      ) : imagePosition === "right" ? (
        <>
          {textBlock}
          {mediaBlock}
        </>
      ) : (
        <>
          {mediaBlock}
          {textBlock}
        </>
      )}
    </article>
  )
}
