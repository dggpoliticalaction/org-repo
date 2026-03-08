import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { timeAsync } from './serverTimingLog'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await timeAsync(`getPayload (doc:${collection}/${slug})`, () =>
    getPayload({ config: configPromise }),
  )

  const page = await timeAsync(`find:${collection}/${slug}`, () =>
    payload.find({
      collection,
      depth,
      where: {
        slug: {
          equals: slug,
        },
      },
    }),
  )

  return page.docs[0]
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection: Collection, slug: string) => {
  const cached = unstable_cache(async () => getDocument(collection, slug), [collection, slug], {
    tags: [`${collection}_${slug}`],
  })
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return async () => {
    const start = performance.now()
    const result = await cached()
    // eslint-disable-next-line no-console
    console.log(
      `[TTFB-TIMING] getCachedDocument(${collection}/${slug}): ${(performance.now() - start).toFixed(1)}ms (includes cache lookup)`,
    )
    return result
  }
}
