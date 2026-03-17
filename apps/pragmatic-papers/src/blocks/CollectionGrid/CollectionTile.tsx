import { formatDistanceToNow } from "date-fns"
import React from "react"

import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { isMedia, Media } from "@/components/Media"
import type { Article, CollectionGridSlots, Media as MediaType } from "@/payload-types"
import { cn } from "@/utilities/ui"

export type ImagePosition = "above" | "below" | "left" | "right" | "none"

export interface CollectionTileProps extends React.ComponentProps<"div"> {
  tile: CollectionGridSlots[number]
  imagePosition?: ImagePosition
  showByline?: boolean
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

  let populatedAuthors: Article["populatedAuthors"] = []
  let heroImage: MediaType | null = null

  if (
    imagePosition !== "none" &&
    collection.relationTo === "articles" &&
    isMedia(collection.value.heroImage)
  ) {
    heroImage = collection.value.heroImage
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
      className={cn(
        "@container group flex flex-col gap-6",
        isHorizontal && "flex-col items-start md:flex-row",
        className,
      )}
    >
      {heroImage && (
        <div
          className={cn(
            "aspect-video overflow-hidden rounded-sm",
            isHorizontal ? "md:basis-1/2" : "w-full shrink",
            imagePosition === "left" && "md:order-first",
            imagePosition === "right" && "md:order-last",
          )}
        >
          <Media media={heroImage} className="hover:opacity-80" variant="medium" />
        </div>
      )}
      <div
        className={cn(
          isHorizontal && "@container flex flex-col justify-center self-stretch md:basis-1/2",
        )}
      >
        {/* Kicker */}
        {kicker && (
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-brand">
            {kicker}
          </p>
        )}

        {/* Title — uses container queries to scale with available space */}
        <h2 className="font-display @xs:text-base @sm:text-lg @md:text-xl @lg:text-2xl @2xl:text-3xl text-balance text-sm font-bold leading-tight text-primary hover:text-primary/80">
          {overrideTitle || title}
        </h2>

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
