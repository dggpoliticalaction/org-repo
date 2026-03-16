"use client"
import { GalleryCarousel, MediaCarousel } from "@/components/MediaCarousel"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type {
  MediaCollageBlock as MediaCollageBlockType,
  Media as MediaType,
} from "@/payload-types"
import { cn } from "@/utilities/ui"
import React, { useState } from "react"

import { MediaBlock } from "@/blocks/MediaBlock/Component"

// actual code for the collage/grid
export const MediaCollageBlock: React.FC<MediaCollageBlockType> = ({ images, layout }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  if (!images.length) return null

  // Extract valid media resources for gallery
  const validMedia = images
    .map((img) => (typeof img.media === "number" ? null : img.media))
    .filter((media): media is MediaType => media !== null)

  //carousel image layout
  if (layout === "carousel") {
    return <MediaCarousel images={validMedia} showCaptions enableModal />
  }

  // Grid layout — clicking any image opens the full gallery at that index
  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="[&>button]:rounded-xs max-w-7xl border-0 p-0 shadow-none [&>button]:right-2 [&>button]:top-2 [&>button]:bg-background [&>button_svg]:h-6 [&>button_svg]:w-6">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Gallery</DialogTitle>
          </DialogHeader>
          <GalleryCarousel images={validMedia} initialIndex={modalIndex} />
        </DialogContent>
      </Dialog>
      <div className="-mx-5 grid grid-cols-1 items-start gap-6 md:-mx-8 md:grid-cols-2 xl:-mx-16">
        {images.map((img, idx) => {
          const media = typeof img.media === "number" ? null : img.media
          if (!media) return null
          const isLastOddItem = images.length % 2 !== 0 && idx === images.length - 1
          return (
            <button
              key={`${img.id}-${idx}`}
              type="button"
              className={cn(
                "not-prose cursor-pointer text-left",
                isLastOddItem && "mx-auto w-1/2 md:col-span-2",
              )}
              onClick={() => {
                setModalIndex(idx)
                setModalOpen(true)
              }}
            >
              <MediaBlock
                media={media}
                enableGutter={false}
                sizes={
                  isLastOddItem
                    ? "(max-width: 1376px) 100vw, 1376px"
                    : "(max-width: 768px) 100vw, (max-width: 1376px) 50vw, 688px"
                }
                imgClassName="transition-opacity hover:opacity-80"
              />
            </button>
          )
        })}
      </div>
    </>
  )
}
