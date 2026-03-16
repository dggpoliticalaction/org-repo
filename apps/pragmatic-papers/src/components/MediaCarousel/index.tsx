"use client"

import { MediaBlock } from "@/blocks/MediaBlock/Component"
import {
  Carousel,
  CarouselContent,
  CarouselIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Media as MediaType } from "@/payload-types"
import { cn } from "@/utilities/ui"
import React, { useState } from "react"

interface MediaCarouselProps {
  images: (MediaType | null)[]
  initialIndex?: number
  showCaptions?: boolean
  enableModal?: boolean
}

// Inner carousel rendered inside the gallery lightbox modal — no modal recursion.
const GalleryCarousel: React.FC<{ images: MediaType[]; initialIndex: number }> = ({
  images,
  initialIndex,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(initialIndex)

  React.useEffect(() => {
    if (!api) return
    if (initialIndex > 0) api.scrollTo(initialIndex, true)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api, initialIndex])

  return (
    <Carousel setApi={setApi} opts={{ loop: true, startIndex: initialIndex }} className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem
            key={index}
            className="flex aspect-video w-full items-center justify-center"
          >
            <MediaBlock
              media={image}
              enableGutter={false}
              className="h-full w-full"
              imgClassName="not-prose object-contain"
              sizes="100vw"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselIndicators count={images.length} current={current} />
      <CarouselPrevious className="left-3" />
      <CarouselNext className="right-3" />
    </Carousel>
  )
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images,
  initialIndex = 0,
  enableModal = false,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(initialIndex)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(initialIndex)

  React.useEffect(() => {
    if (!api) {
      return
    }

    // Set initial index
    if (initialIndex > 0) {
      api.scrollTo(initialIndex, true)
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api, initialIndex])

  const validImages = images.filter((img): img is MediaType => img !== null)

  if (!validImages.length) return null

  const handleItemClick = (index: number) => {
    setModalIndex(index)
    setModalOpen(true)
  }

  return (
    <>
      {enableModal && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="[&>button]:rounded-xs max-w-7xl border-0 p-0 shadow-none [&>button]:right-2 [&>button]:top-2 [&>button]:bg-background [&>button_svg]:h-6 [&>button_svg]:w-6">
            <DialogHeader className="sr-only">
              <DialogTitle>Image Gallery</DialogTitle>
            </DialogHeader>
            <GalleryCarousel images={validImages} initialIndex={modalIndex} />
          </DialogContent>
        </Dialog>
      )}
      <Carousel
        setApi={setApi}
        opts={{ loop: true, startIndex: initialIndex }}
        className="-mx-5 md:-mx-8 xl:-mx-16"
      >
        <CarouselContent>
          {validImages.map((image, index) => (
            <CarouselItem
              key={index}
              className={cn(
                "flex aspect-video w-full items-center justify-center",
                enableModal && "cursor-pointer",
              )}
              onClick={enableModal ? () => handleItemClick(index) : undefined}
            >
              <MediaBlock
                media={image}
                enableGutter={false}
                className="h-full w-full"
                imgClassName="not-prose object-contain"
                captionClassName="hidden"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselIndicators count={validImages.length} current={current} />
        <CarouselPrevious className="left-3 lg:-left-12" />
        <CarouselNext className="right-3 lg:-right-12" />
      </Carousel>
    </>
  )
}
