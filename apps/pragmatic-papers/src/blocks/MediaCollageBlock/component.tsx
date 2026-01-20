'use client'
import React, { useState } from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Media } from '../../components/Media'
import type { Media as MediaType } from '@/payload-types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

interface CollageImage {
  media: number | MediaType
  id?: string | null
}

interface MediaCollageBlockProps {
  images?: CollageImage[]
  layout?: 'grid' | 'carousel'
  className?: string
  enableGutter?: boolean
}

// Carousel navigation indicators
const CarouselIndicators: React.FC<{
  images: CollageImage[]
  current: number
  api?: CarouselApi
}> = ({ images, current, api }) => {
  return (
    <div className="flex justify-center mt-2 gap-2">
      {images.map((_, idx) => (
        <button
          key={idx}
          onClick={() => api?.scrollTo(idx)}
          className={cn(
            'inline-block w-2 h-2 rounded-full bg-muted-foreground transition-all',
            idx === current ? 'bg-primary scale-125' : 'opacity-40',
          )}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  )
}

// Carousel caption display
const CarouselCaption: React.FC<{
  images: CollageImage[]
  current: number
  captionClassName: string
}> = ({ images, current, captionClassName }) => {
  const imageData = images[current]
  const image = typeof imageData?.media === 'number' ? null : imageData?.media

  return (
    <div className="h-20 overflow-hidden">
      <div className="transition-opacity duration-200">
        {image?.caption && (
          <figcaption className={captionClassName}>
            <RichText
              data={image.caption}
              enableGutter={false}
              enableProse={false}
              className="text-[0.95rem] text-muted-foreground not-prose"
            />
          </figcaption>
        )}
      </div>
    </div>
  )
}

// actual code for the collage/grid
export const MediaCollageBlock: React.FC<MediaCollageBlockProps> = ({
  images = [],
  layout = 'grid',
  className,
  enableGutter = false,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const figureClass = cn('', { container: enableGutter }, className)
  const imgClassName = 'border border-border rounded-[0.8rem]'
  const captionClassName = 'mt-2 text-center'

  if (!images.length) return null

  //carousel image layout
  if (layout === 'carousel') {
    return (
      <figure className={figureClass}>
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {images.map((imageData, index) => {
              const image = typeof imageData?.media === 'number' ? null : imageData?.media
              if (!image) return null

              return (
                <CarouselItem key={index}>
                  <div className="relative w-full aspect-video bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[0.8rem]">
                    <Media
                      resource={image}
                      imgClassName={cn(
                        imgClassName,
                        'absolute inset-0 w-full h-full object-contain',
                      )}
                      pictureClassName="w-full h-full"
                      className="w-full h-full"
                      enableModal
                    />
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <CarouselIndicators images={images} current={current} api={api} />
        <CarouselCaption images={images} current={current} captionClassName={captionClassName} />
      </figure>
    )
  }

  // Grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {images.map((img, idx) => {
        const media = typeof img.media === 'number' ? null : img.media
        if (!media) return null
        const isLastOddItem = images.length % 2 !== 0 && idx === images.length - 1
        return (
          <div
            key={idx}
            className={cn({
              'md:col-span-2 md:max-w-[50%] md:mx-auto': isLastOddItem,
            })}
          >
            <figure className={figureClass}>
              <Media resource={media} imgClassName={imgClassName} enableModal />
              {media.caption && (
                <figcaption className={captionClassName}>
                  <RichText
                    data={media.caption}
                    enableGutter={false}
                    enableProse={false}
                    className="text-[0.95rem] text-muted-foreground not-prose"
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
