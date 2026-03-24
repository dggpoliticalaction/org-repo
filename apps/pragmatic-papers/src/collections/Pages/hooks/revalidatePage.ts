import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"

import { revalidatePath, revalidateTag } from "next/cache"

import type { Page } from "../../../payload-types"
import { purgeCloudflareCache } from "../../../utilities/purgeCloudflareCache"

export const revalidatePage: CollectionAfterChangeHook<Page> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc
  if (doc._status === "published") {
    const path = doc.slug === "home" ? "/" : `/${doc.slug}`

    payload.logger.info(`Revalidating page at path: ${path}`)
    if (doc.slug === "/home") {
      revalidatePath(doc.slug)
    }
    revalidatePath(path)
    revalidateTag("pages-sitemap")
    await purgeCloudflareCache([path], payload.logger)
  }

  // If the page was previously published, we need to revalidate the old path
  if (previousDoc?._status === "published" && doc._status !== "published") {
    const oldPath = previousDoc.slug === "home" ? "/" : `/${previousDoc.slug}`

    payload.logger.info(`Revalidating old page at path: ${oldPath}`)

    revalidatePath(oldPath)
    revalidateTag("pages-sitemap")
    await purgeCloudflareCache([oldPath], payload.logger)
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = doc?.slug === "home" ? "/" : `/${doc?.slug}`
    revalidatePath(path)
    revalidateTag("pages-sitemap")
    await purgeCloudflareCache([path], payload.logger)
  }

  return doc
}
