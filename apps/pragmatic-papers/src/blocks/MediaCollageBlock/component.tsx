'use client'
import React, { useState } from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Media } from '../../components/Media'
import type { Media as MediaType } from '@/payload-types'

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

// Reusable carousel navigation button component
const CarouselButton: React.FC<{
  direction: 'left' | 'right'
  onClick: () => void
  ariaLabel: string
}> = ({ direction, onClick, ariaLabel }) => {
  const isLeft = direction === 'left'

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 bg-white border border-border rounded-full w-8 h-8 flex items-center justify-center shadow z-10 hover:bg-zinc-100 transition-colors',
        isLeft ? 'left-2' : 'right-2',
      )}
      aria-label={ariaLabel}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={isLeft ? 'M13.5 16L8.5 11L13.5 6' : 'M8.5 6L13.5 11L8.5 16'}
          stroke="black"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// actual code for the collage/grid
export const MediaCollageBlock: React.FC<MediaCollageBlockProps> = ({
  images = [],
  layout = 'grid',
  className,
  enableGutter = false,
}) => {
  const [current, setCurrent] = useState(0)

  const figureClass = cn('', { container: enableGutter }, className)
  const imgClassName = 'border border-border rounded-[0.8rem]'
  const captionClassName = 'mt-3 text-center container'

  if (!images.length) return null

  //carousel image layout
  if (layout === 'carousel') {
    const imageData = images[current]
    const image = typeof imageData?.media === 'number' ? null : imageData?.media
    // Touch event handlers for swipe
    let touchStartX = 0
    let touchEndX = 0
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.changedTouches?.[0]
      if (touch) {
        touchStartX = touch.screenX
      }
    }
    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.changedTouches?.[0]
      if (touch) {
        touchEndX = touch.screenX
        if (touchEndX - touchStartX > 50) {
          // Swipe right
          setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
        } else if (touchStartX - touchEndX > 50) {
          // Swipe left
          setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))
        }
      }
    }
    // handle switching images
    const goToPrevious = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
    const goToNext = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))

    // Render the carousel layout with the buttons
    return (
      <figure className={figureClass}>
        <div
          className="relative flex justify-center bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[0.8rem] h-[350px] md:h-[550px] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Media
            resource={image}
            imgClassName={cn(imgClassName, 'w-auto h-auto max-w-full max-h-full object-contain')}
            className="w-full h-full flex items-center justify-center p-4"
            pictureClassName="w-full h-full flex items-center justify-center"
            enableModal
          />
          <CarouselButton direction="left" onClick={goToPrevious} ariaLabel="Previous image" />
          <CarouselButton direction="right" onClick={goToNext} ariaLabel="Next image" />
        </div>
        <div className="flex justify-center mt-2 gap-2">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                'inline-block w-2 h-2 rounded-full bg-muted-foreground transition-all',
                idx === current ? 'bg-primary scale-125' : 'opacity-40',
              )}
            />
          ))}
        </div>
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
      </figure>
    )
  }

  // Grid layout
  return (
    <figure className={figureClass}>
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, idx) => {
          const media = typeof img.media === 'number' ? null : img.media
          if (!media) return null
          const isLastOddItem = images.length % 2 !== 0 && idx === images.length - 1
          return (
            <div
              key={idx}
              className={cn('flex flex-col items-center', {
                'col-span-2 justify-self-center max-w-[50%]': isLastOddItem,
              })}
            >
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
            </div>
          )
        })}
      </div>
    </figure>
  )
}
