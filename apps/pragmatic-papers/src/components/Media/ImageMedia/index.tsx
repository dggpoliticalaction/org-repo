'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    src: srcFromProps,
    loading: loadingFromProps,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, width: fullWidth } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    src = getMediaUrl(resource.sizes?.medium?.url, cacheTag)
  }

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  // NOTE: this is used by the browser to determine which image to download at different screen sizes

  return (
    <>
      <picture className={cn(pictureClassName)}>
        {resource &&
          typeof resource === 'object' &&
          resource.sizes &&
          Object.values(resource.sizes)
            .filter((size) => size !== resource.sizes?.square && size !== resource.sizes?.og)
            .map((size) => (
              <source
                key={size.url}
                srcSet={getMediaUrl(size.url?.replace(/ /g, '%20'), resource.updatedAt)}
                media={`(max-width: ${size.width}px)`}
                type={size.mimeType ?? ''}
                width={size.width!}
                height={size.height!}
              />
            ))}
        <img
          alt={alt}
          className={cn(imgClassName)}
          loading={loading}
          width={width}
          height={height}
          src={typeof src === 'object' ? src.src : src}
        />
      </picture>
    </>
  )
}
