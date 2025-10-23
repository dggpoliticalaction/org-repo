'use client'
import React, { useState } from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Media } from '../../components/Media'
import type { Media as MediaType } from '@/payload-types'

interface CollageImage {
  media: MediaType
}

interface MediaCollageBlockProps {
  images?: CollageImage[]
  layout?: 'grid' | 'carousel'
  className?: string
  enableGutter?: boolean
}

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

  if (layout === 'carousel') {
    const image = images[current]?.media
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
    return (
      <figure className={figureClass}>
        <div
          className="relative flex justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Media resource={image} imgClassName={imgClassName} />
          <button
            onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-black border border-border rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-primary/80 dark:hover:bg-primary/80 transition-colors z-10"
            aria-label="Previous image"
          >
            &#8592;
          </button>
          <button
            onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-black border border-border rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-primary/80 dark:hover:bg-primary/80 transition-colors z-10"
            aria-label="Next image"
          >
            &#8594;
          </button>
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
        {images.map((img, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <Media resource={img.media} imgClassName={imgClassName} />
            {img.media?.caption && (
              <figcaption className={captionClassName}>
                <RichText
                  data={img.media.caption}
                  enableGutter={false}
                  enableProse={false}
                  className="text-[0.95rem] text-muted-foreground not-prose"
                />
              </figcaption>
            )}
          </div>
        ))}
      </div>
    </figure>
  )
}
