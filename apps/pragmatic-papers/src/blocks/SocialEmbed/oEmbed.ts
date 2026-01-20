/**
 * oEmbed TypeScript types based on https://oembed.com/#section2 (oEmbed 1.0)
 */

/**
 * The format of the oEmbed response.
 */
export type OEmbedFormat = 'json' | 'xml'

/**
 * The type of the oEmbed resource.
 */
export type OEmbedResourceType = 'photo' | 'video' | 'link' | 'rich'

/**
 * Consumer request query parameters (spec-defined).
 * Query params are ultimately serialized to strings; this is an ergonomic shape.
 */
export interface OEmbedRequestQuery {
  url: string
  maxwidth?: number
  maxheight?: number
  format?: OEmbedFormat

  // Providers may support custom parameters.
  // [customParam: string]: string | number | undefined
}

/**
 * Thumbnail dependency rule from the spec:
 * if any thumbnail_* is present, all three must be present.
 */
export type OEmbedThumbnail =
  | {
    thumbnail_url: string
    thumbnail_width: number
    thumbnail_height: number
  }
  | {
    thumbnail_url?: undefined
    thumbnail_width?: undefined
    thumbnail_height?: undefined
  }

/**
 * Common response parameters valid for all response types.
 * Includes an index signature because providers may add fields not in the spec.
 */
export type OEmbedBase<Thumbnails extends boolean = false> = {
  type: OEmbedResourceType
  version: '1.0'

  title?: string
  author_name?: string
  author_url?: string
  provider_name?: string
  provider_url?: string
  cache_age?: number

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
} & (Thumbnails extends true ? OEmbedThumbnail : {})

export type OEmbedPhoto<Thumbnails extends boolean = false> = OEmbedBase<Thumbnails> & {
  type: 'photo'
  url: string
  width: number
  height: number
}

export type OEmbedVideo<Thumbnails extends boolean = false> = OEmbedBase<Thumbnails> & {
  type: 'video'
  html: string
  width: number
  height: number
}

export type OEmbedRich<Thumbnails extends boolean = false> = OEmbedBase<Thumbnails> & {
  type: 'rich'
  html: string
  width: number
  height: number
}

export type OEmbedLink<Thumbnails extends boolean = false> = OEmbedBase<Thumbnails> & {
  type: 'link'
}

export type OEmbedResponse<Thumbnails extends boolean = false> =
  | OEmbedPhoto<Thumbnails>
  | OEmbedVideo<Thumbnails>
  | OEmbedRich<Thumbnails>
  | OEmbedLink<Thumbnails>

export const isOEmbedPhoto = <Thumbnails extends boolean = false>(
  x: OEmbedResponse<Thumbnails>,
): x is OEmbedPhoto<Thumbnails> => x.type === 'photo'
export const isOEmbedVideo = <Thumbnails extends boolean = false>(
  x: OEmbedResponse<Thumbnails>,
): x is OEmbedVideo<Thumbnails> => x.type === 'video'
export const isOEmbedRich = <Thumbnails extends boolean = false>(
  x: OEmbedResponse<Thumbnails>,
): x is OEmbedRich<Thumbnails> => x.type === 'rich'
export const isOEmbedLink = <Thumbnails extends boolean = false>(
  x: OEmbedResponse<Thumbnails>,
): x is OEmbedLink<Thumbnails> => x.type === 'link'
