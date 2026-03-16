"use client"
import { MediaCarousel } from "@/components/MediaCarousel"
import type {
  MediaCollageBlock as MediaCollageBlockType,
  Media as MediaType,
} from "@/payload-types"
import { cn } from "@/utilities/ui"
import React from "react"
import { LightboxMediaBlock } from "../MediaBlock/LightboxMediaBlock"

// actual code for the collage/grid
export const MediaCollageBlock: React.FC<MediaCollageBlockType> = ({ images, layout }) => {
  if (!images.length) return null

  // Extract valid media resources for gallery
  const validMedia = images
    .map((img) => (typeof img.media === "number" ? null : img.media))
    .filter((media): media is MediaType => media !== null)

  //carousel image layout
  if (layout === "carousel") {
    return <MediaCarousel images={validMedia} showCaptions enableModal />
  }

  // Grid layout
  return (
    <div className="-mx-5 grid grid-cols-1 items-start gap-6 md:-mx-8 md:grid-cols-2 xl:-mx-16">
      {images.map((img, idx) => {
        const media = typeof img.media === "number" ? null : img.media
        if (!media) return null
        const isLastOddItem = images.length % 2 !== 0 && idx === images.length - 1
        return (
          <LightboxMediaBlock
            key={`${img.id}-${idx}`}
            media={media}
            className={cn("not-prose", isLastOddItem && "mx-auto w-1/2 md:col-span-2")}
            sizes={
              isLastOddItem
                ? "(max-width: 1376px) 100vw, 1376px"
                : "(max-width: 768px) 100vw, (max-width: 1376px) 50vw, 688px"
            }
          />
        )
      })}
    </div>
  )
}
