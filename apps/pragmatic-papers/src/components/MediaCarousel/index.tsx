"use client"

import { Media } from "@/components/Media"
import RichText from "@/components/RichText"
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
      className={cn("absolute right-0 bottom-10 left-0 z-10 flex justify-center gap-2", className)}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => api?.scrollTo(idx)}
          type="button"
          className={cn(
            "bg-muted-foreground ring-background inline-block h-2 w-2 rounded-sm ring-2 transition-all",
            idx === current ? "bg-primary scale-125" : "opacity-40",
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
  showCaptions = true,
  containerClassName,
  imageContainerClassName,
  imageClassName,
  pictureClassName,
  navigationClassName,
  indicatorClassName,
  enableModal = false,
  galleryData,
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
            <CarouselItem key={index}>
              <figure>
                <div className={cn("relative w-full rounded-sm", imageContainerClassName)}>
                  <Media
                    resource={image}
                    imgClassName={imageClassName}
                    pictureClassName={pictureClassName}
                    className="h-full w-full"
                    enableModal={enableModal}
                    gallery={galleryData}
                  />
                </div>
                {showCaptions && (
                  <figcaption className="mt-3 min-h-6 w-full text-center">
                    {image.caption && (
                      <RichText
                        data={image.caption}
                        enableGutter={false}
                        enableProse={false}
                        className="not-prose text-muted-foreground text-[0.95rem]"
                      />
                    )}
                  </figcaption>
                )}
              </figure>
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
