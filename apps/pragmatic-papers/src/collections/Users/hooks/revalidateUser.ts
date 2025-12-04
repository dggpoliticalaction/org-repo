import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { User } from '@/payload-types'

const revalidateDoc = async (givenDoc: User, payload: Payload) => {
  const path = `/contributors/${givenDoc.slug}`

  payload.logger.info(`Revalidating article at path: ${path}`)
  revalidatePath(path)
  revalidatePath('/feed.articles')
  revalidateTag('articles-sitemap')

  // Find and revalidate all articles that this user has authored
  const articles = await payload.find({
    collection: 'articles',
    where: {
      authors: {
        contains: givenDoc.id,
      },
    },
    select: {
      slug: true,
    },
    depth: 0,
  })

  articles.docs.forEach((article) => {
    const articlePath = `/articles/${article.slug}`
    payload.logger.info(`Revalidating article at path: ${articlePath}`)
    revalidatePath(articlePath)
  })
}

export const revalidateUser: CollectionAfterChangeHook<User> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc.meta?.publishPage === true) {
      await revalidateDoc(doc, payload)
    }

    // If the user was previously published, we need to revalidate the old path
    if (previousDoc.meta?.publishPage === true && doc.meta?.publishPage !== true) {
      await revalidateDoc(previousDoc, payload)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<User> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    await revalidateDoc(doc, payload)
  }

  return doc
}
