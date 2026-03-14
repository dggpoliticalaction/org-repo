"use client"

import { MediaBlock } from "@/blocks/MediaBlock/Component"
import { LightboxMediaBlock } from "@/blocks/MediaBlock/LightboxMediaBlock"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import type { Media as MediaType } from "@/payload-types"
import { cn } from "@/utilities/ui"
import React, { useState } from "react"

interface MediaCarouselProps {
  images: (MediaType | null)[]
  initialIndex?: number
  showCaptions?: boolean
  containerClassName?: string
  imageContainerClassName?: string
  imageClassName?: string
  pictureClassName?: string
  navigationClassName?: {
    previous?: string
    next?: string
  }
  indicatorClassName?: string
  enableModal?: boolean
  galleryData?: {
    images: MediaType[]
    startIndex: number
  }
}

// Carousel navigation indicators
const CarouselIndicators: React.FC<{
  count: number
  current: number
  api?: CarouselApi
  className?: string
}> = ({ count, current, api, className }) => {
  return (
    <div
      className={cn("absolute bottom-10 left-0 right-0 z-10 flex justify-center gap-2", className)}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => api?.scrollTo(idx)}
          type="button"
          className={cn(
            "inline-block h-2 w-2 rounded-sm bg-muted-foreground ring-2 ring-background transition-all",
            idx === current ? "scale-125 bg-primary" : "opacity-40",
          )}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  )
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images,
  initialIndex = 0,
  containerClassName,
  imageContainerClassName,
  imageClassName,
  navigationClassName,
  indicatorClassName,
  enableModal = false,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(initialIndex)

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

  return (
    <>
      <Carousel
        setApi={setApi}
        opts={{ loop: true, startIndex: initialIndex }}
        className={cn("relative", containerClassName)}
      >
        <CarouselContent>
          {validImages.map((image, index) => (
            <CarouselItem key={index} className="bg-neutral-300 dark:bg-neutral-700">
              <div
                className={cn(
                  "relative flex min-h-0 w-full items-center justify-center overflow-hidden rounded-sm",
                  imageContainerClassName ?? "aspect-video",
                )}
              >
                {enableModal ? (
                  <LightboxMediaBlock
                    media={image}
                    enableGutter={false}
                    className="h-full w-full"
                    pictureClassName="not-prose h-full w-full"
                    imgClassName={cn("max-h-full max-w-full object-contain", imageClassName)}
                  />
                ) : (
                  <MediaBlock
                    media={image}
                    enableGutter={false}
                    className="h-full w-full"
                    imgClassName={cn("max-h-full max-w-full object-contain", imageClassName)}
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselIndicators
          count={validImages.length}
          current={current}
          api={api}
          className={indicatorClassName}
        />
        <CarouselPrevious className={navigationClassName?.previous || "left-3 lg:-left-12"} />
        <CarouselNext className={navigationClassName?.next || "right-3 lg:-right-12"} />
      </Carousel>
    </>
  )
}
