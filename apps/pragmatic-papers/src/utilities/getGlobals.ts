import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { timeAsync } from './serverTimingLog'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<Config['globals'][T]> {
  const payload = await timeAsync(`getPayload (global:${slug})`, () =>
    getPayload({ config: configPromise }),
  )

  const global = await timeAsync(`findGlobal:${slug}`, () =>
    payload.findGlobal({
      slug,
      depth,
    }),
  )

  return global as Config['globals'][T]
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) => {
  const cached = unstable_cache(async () => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })
  return async () => {
    const start = performance.now()
    const result = await cached()
    // eslint-disable-next-line no-console
    console.log(
      `[TTFB-TIMING] getCachedGlobal(${slug}): ${(performance.now() - start).toFixed(1)}ms (includes cache lookup)`,
    )
    return result
  }
}
