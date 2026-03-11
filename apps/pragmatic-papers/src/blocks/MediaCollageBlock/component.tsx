'use client'
import { Media } from '@/components/Media'
import { MediaCarousel } from '@/components/MediaCarousel'
import RichText from '@/components/RichText'
import type {
  MediaCollageBlock as MediaCollageBlockType,
  Media as MediaType,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import React from 'react'

// actual code for the collage/grid
export const MediaCollageBlock: React.FC<MediaCollageBlockType> = ({ images, layout }) => {
  if (!images.length) return null

  // Extract valid media resources for gallery
  const validMedia = images
    .map((img) => (typeof img.media === 'number' ? null : img.media))
    .filter((media): media is MediaType => media !== null)

  //carousel image layout
  if (layout === 'carousel') {
    return (
      <MediaCarousel
        images={validMedia}
        showCaptions
        indicatorClassName="bottom-20"
        imageClassName="border border-border rounded-sm absolute inset-0 w-full h-full object-contain"
        pictureClassName="w-full h-full"
        imageContainerClassName="aspect-video"
        enableModal
        galleryData={{
          images: validMedia,
          startIndex: 0,
        }}
      />
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
                imgClassName="border border-border rounded-sm"
                enableModal
                gallery={{
                  images: validMedia,
                  startIndex: idx,
                }}
              />
              {media.caption && (
                <figcaption className="mt-1 w-full text-center">
                  <RichText
                    data={media.caption}
                    enableGutter={false}
                    enableProse={false}
                    className="not-prose text-muted-foreground text-[0.95rem]"
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
