import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { timeAsync } from './serverTimingLog'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getRedirects(depth = 1) {
  const payload = await timeAsync('getPayload (redirects)', () =>
    getPayload({ config: configPromise }),
  )

  const { docs: redirects } = await timeAsync('find:redirects', () =>
    payload.find({
      collection: 'redirects',
      depth,
      limit: 0,
      pagination: false,
    }),
  )

  return redirects
}

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getCachedRedirects = () =>
  unstable_cache(async () => getRedirects(), ['redirects'], {
    tags: ['redirects'],
  })
