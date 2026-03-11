import type { Metadata } from 'next'

import type { Page, Volume, Article } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getMediaUrl } from './getMediaUrl'

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Volume> | Partial<Article> | null
}): Promise<Metadata> => {
  const { doc } = args
  const ogImage =
    typeof doc?.meta?.image === 'object' ? getMediaUrl(doc?.meta?.image?.sizes?.og?.url) : undefined

  const title = doc?.meta?.title ? doc?.meta?.title : 'Pragmatic Papers'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
