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
    size,
  } = props

  let width: number | undefined = srcFromProps?.width
  let height: number | undefined = srcFromProps?.height
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, width: fullWidth } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    if (size) {
      switch (size) {
        case 'small':
          src = getMediaUrl(resource.sizes?.small?.url, cacheTag)
          width = resource.sizes?.small?.width ?? undefined
          height = resource.sizes?.small?.height ?? undefined
          break
        case 'medium':
          src = getMediaUrl(resource.sizes?.medium?.url, cacheTag)
          width = resource.sizes?.medium?.width ?? undefined
          height = resource.sizes?.medium?.height ?? undefined
          break
        case 'large':
          src = getMediaUrl(resource.sizes?.large?.url, cacheTag)
          width = resource.sizes?.large?.width ?? undefined
          height = resource.sizes?.large?.height ?? undefined
          break
        case 'xlarge':
          src = getMediaUrl(resource.sizes?.xlarge?.url, cacheTag)
          width = resource.sizes?.xlarge?.width ?? undefined
          height = resource.sizes?.xlarge?.height ?? undefined
          break
        case 'square':
          src = getMediaUrl(resource.sizes?.square?.url, cacheTag)
          width = resource.sizes?.square?.width ?? undefined
          height = resource.sizes?.square?.height ?? undefined
          break
      }
    } else {
      src = getMediaUrl(resource.sizes?.medium?.url, cacheTag)
    }
  }

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  // NOTE: this is used by the browser to determine which image to download at different screen sizes

  return (
    <picture className={cn(pictureClassName)}>
      {resource &&
        !size &&
        typeof resource === 'object' &&
        resource.sizes &&
        Object.values(resource.sizes)
          .filter(
            (resourceSize) =>
              resourceSize.url &&
              resourceSize !== resource.sizes?.square &&
              resourceSize !== resource.sizes?.og,
          )
          .map((resourceSize) => (
            <source
              key={resourceSize.url}
              srcSet={getMediaUrl(resourceSize.url?.replace(/ /g, '%20'), resource.updatedAt)}
              media={`(max-width: ${resourceSize.width}px)`}
              type={resourceSize.mimeType ?? ''}
              width={resourceSize.width!}
              height={resourceSize.height!}
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
  )
}
