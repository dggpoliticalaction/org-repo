import type { Config } from "@/payload-types"

import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"
import { getPayload } from "payload"

type Collection = keyof Config["collections"]

async function getDocument(collection: Collection, slug: string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}

async function getRedirects(depth = 1) {
  const payload = await getPayload({ config: configPromise })

  const { docs: redirects } = await payload.find({
    collection: "redirects",
    depth,
    limit: 0,
    pagination: false,
  })

  return redirects
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getCachedDocument = (collection: Collection, slug: string) =>
  unstable_cache(async () => getDocument(collection, slug), [collection, slug], {
    tags: [`${collection}_${slug}`],
  })

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getCachedRedirects = () =>
  unstable_cache(async () => getRedirects(), ["redirects"], {
    tags: ["redirects"],
  })
