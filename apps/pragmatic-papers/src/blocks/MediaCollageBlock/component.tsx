"use client"
import { MediaCarousel } from "@/components/MediaCarousel"
import type {
  MediaCollageBlock as MediaCollageBlockType,
  Media as MediaType,
} from "@/payload-types"
import { cn } from "@/utilities/utils"
import React from "react"
import { LightboxMediaBlock } from "../MediaBlock/LightboxMediaBlock"

export const MediaCollageBlock: React.FC<MediaCollageBlockType> = ({ images, layout }) => {
  if (!images.length) return null

  const validMedia = images
    .map((img) => (typeof img.media === "number" ? null : img.media))
    .filter((media): media is MediaType => media !== null)

  if (layout === "carousel") {
    return <MediaCarousel images={validMedia} showCaptions enableModal />
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:-mx-8 xl:-mx-16">
      {images.map((img, idx) => {
        const media = typeof img.media === "number" ? null : img.media
        if (!media) return null
        const isLastOddItem = images.length % 2 !== 0 && idx === images.length - 1
        return (
          <LightboxMediaBlock
            key={`${img.id}-${idx}`}
            media={media}
            className={cn("not-prose", isLastOddItem && "mx-auto w-auto md:col-span-2 md:w-1/2")}
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
