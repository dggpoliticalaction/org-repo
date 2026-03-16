import { formatDistanceToNow } from "date-fns"
import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import type { Article, CollectionGridSlots, Media as MediaType, Volume } from "@/payload-types"
import { cn } from "@/utilities/ui"

export type ImagePosition = "above" | "below" | "left" | "right" | "none"

export interface CollectionTileProps extends React.ComponentProps<"div"> {
  tile: CollectionGridSlots[number]
  imagePosition?: ImagePosition
  showByline?: boolean
}

export const isArticle = (entry: Article | Volume): entry is Article => {
  return "type" in entry && entry.type === "article"
}

export const isVolume = (entry: Article | Volume): entry is Volume => {
  return "type" in entry && entry.type === "volume"
}

export const CollectionTile: React.FC<CollectionTileProps> = ({
  tile,
  imagePosition = "above",
  showByline = false,
  className,
}) => {
  if (!tile) return null
  const { id, collection, kicker, overrideTitle } = tile

  if (typeof collection.value === "number") return null

  const { title, slug, publishedAt, meta } = collection.value
  const href = `/${collection.relationTo}/${slug}`

  let showMedia = false
  let populatedAuthors: Article["populatedAuthors"] = []
  let heroImage: MediaType | null = null

  if ("heroImage" in collection.value) {
    heroImage = collection.value.heroImage as MediaType
    showMedia = imagePosition !== "none" && !!heroImage
  }

  if ("populatedAuthors" in collection.value) {
    populatedAuthors = collection.value.populatedAuthors ?? []
  }

  const isHorizontal = imagePosition === "left" || imagePosition === "right"

  // Volume authors are not supported for the byline at this time
  const authorNames =
    populatedAuthors
      ?.map((a) => a.name)
      .filter((a) => Boolean(a))
      .join(", ") ?? null

  const timeAgo = publishedAt && formatDistanceToNow(new Date(publishedAt), { addSuffix: true })

  return (
    <HoverPrefetchLink
      href={href}
      id={id ?? undefined}
      className={cn("group flex flex-col gap-2 @container", isHorizontal && "flex-row items-center", className)}
    >
      {showMedia && (
        <div
          className={cn(
            "aspect-video w-full shrink overflow-hidden rounded-sm",
            imagePosition === "left" && "md:order-first",
            imagePosition === "right" && "md:order-last",
          )}
        >
          <Media
            resource={heroImage}
            className="h-full w-full rounded-sm hover:opacity-80"
            imgClassName="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div>
        {/* Kicker */}
        {kicker && (
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-brand">
            {kicker}
          </p>
        )}

        {/* Title — uses container queries to scale with available space */}
        <h3 className="font-display text-sm font-bold leading-tight text-primary hover:text-primary/80 @xs:text-base @sm:text-lg @md:text-xl @lg:text-2xl @2xl:text-3xl">
          {overrideTitle || title}
        </h3>

        {/* Byline */}
        {showByline && authorNames && (
          <p className="line-clamp-1 font-sans text-sm text-muted-foreground">{authorNames}</p>
        )}

        {/* Description */}
        {meta?.description && (
          <p className="mt-2 line-clamp-3 font-serif text-sm text-primary">{meta!.description}</p>
        )}

        {/* Timestamp */}
        {timeAgo && <p className="mt-1 font-sans text-xs text-muted-foreground">{timeAgo}</p>}
      </div>
    </HoverPrefetchLink>
  )
}
