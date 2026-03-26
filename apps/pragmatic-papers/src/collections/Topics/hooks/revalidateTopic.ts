import type { Topic } from "@/payload-types"
import { revalidatePath } from "next/cache"
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"

export const revalidateTopic: CollectionAfterChangeHook<Topic> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const slugsToRevalidate = new Set<string | null | undefined>()
  slugsToRevalidate.add(doc.slug)
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    slugsToRevalidate.add(previousDoc.slug)
  }

  for (const slug of slugsToRevalidate) {
    if (slug) {
      const path = `/topics/${slug}`
      payload.logger.info(`Revalidating topic at path: ${path}`)
      revalidatePath(path)
    }
  }

  return doc
}

export const revalidateTopicDelete: CollectionAfterDeleteHook<Topic> = ({
  doc,
  req: { context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc?.slug) {
    revalidatePath(`/topics/${doc.slug}`)
  }

  return doc
}
