'use client'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import type { MediaCollageBlock as MediaCollageBlockType } from '@/payload-types'
import { cn } from '@/utilities/ui'
import React, { useState } from 'react'

type CollageImage = MediaCollageBlockType['images'][number]

// Carousel navigation indicators
const CarouselIndicators: React.FC<{
  images: CollageImage[]
  current: number
  api?: CarouselApi
}> = ({ images, current, api }) => {
  return (
    <div className="mt-2 flex justify-center gap-2">
      {images.map((_, idx) => (
        <button
          key={idx}
          onClick={() => api?.scrollTo(idx)}
          type="button"
          className={cn(
            'inline-block h-2 w-2 rounded-full bg-muted-foreground transition-all',
            idx === current ? 'scale-125 bg-primary' : 'opacity-40',
          )}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  )
}

// actual code for the collage/grid
export const MediaCollageBlock: React.FC<MediaCollageBlockType> = ({ images, layout }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  if (!images.length) return null

  //carousel image layout
  if (layout === 'carousel') {
    return (
      <>
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {images.map((imageData, index) => {
              const image = typeof imageData?.media === 'number' ? null : imageData?.media
              if (!image) return null

              return (
                <CarouselItem key={index}>
                  <figure>
                    <div className="relative aspect-video w-full rounded-[0.8rem] bg-muted/50 dark:bg-muted/50">
                      <Media
                        resource={image}
                        imgClassName="border border-border rounded-[0.8rem] absolute inset-0 w-full h-full object-contain"
                        pictureClassName="w-full h-full"
                        className="h-full w-full"
                        enableModal
                      />
                    </div>
                    {image.caption && (
                      <div className="absolute -bottom-6 h-14 w-full overflow-hidden">
                        <figcaption className="mt-1 w-full text-center">
                          <RichText
                            data={image.caption}
                            enableGutter={false}
                            enableProse={false}
                            className="not-prose text-[0.95rem] text-muted-foreground"
                          />
                        </figcaption>
                      </div>
                    )}
                  </figure>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className="left-4 lg:-left-12" />
          <CarouselNext className="right-4 lg:-right-12" />
        </Carousel>
        <CarouselIndicators images={images} current={current} api={api} />
      </>
    )
  }

  // Grid layout
  return (
    <div className="grid grid-cols-1 items-start gap-x-4 gap-y-4 md:grid-cols-2">
      {images.map((img, idx) => {
        const media = typeof img.media === 'number' ? null : img.media
        if (!media) return null
        const isLastOddItem = images.length % 2 !== 0 && idx === images.length - 1
        return (
          <div
            key={idx}
            className={cn({
              'md:col-span-2 md:mx-auto md:max-w-[50%]': isLastOddItem,
            })}
          >
            <figure className="my-0">
              <Media
                resource={media}
                imgClassName="border border-border rounded-[0.8rem]"
                enableModal
              />
              {media.caption && (
                <figcaption className="mt-1 w-full text-center">
                  <RichText
                    data={media.caption}
                    enableGutter={false}
                    enableProse={false}
                    className="not-prose text-[0.95rem] text-muted-foreground"
                  />
                </figcaption>
              )}
            </figure>
          </div>
        )
      })}
    </div>
  )
}
