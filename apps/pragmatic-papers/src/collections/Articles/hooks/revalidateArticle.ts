import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Article } from '../../../payload-types'

export const revalidateArticle: CollectionAfterChangeHook<Article> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/articles/${doc.slug}`

      payload.logger.info(`Revalidating article at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/feed.articles')
      revalidateTag('articles-sitemap')

      // Find and revalidate all volumes that reference this article
      const volumes = await payload.find({
        collection: 'volumes',
        where: {
          'articles.id': {
            equals: doc.id,
          },
        },
        depth: 0,
      })

      volumes.docs.forEach((volume) => {
        const volumePath = `/volumes/${volume.slug}`
        payload.logger.info(`Revalidating volume at path: ${volumePath}`)
        revalidatePath(volumePath)
      })
    }

    // If the article was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/articles/${previousDoc.slug}`

      payload.logger.info(`Revalidating old article at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/feed.articles')
      revalidateTag('articles-sitemap')

      // Find and revalidate all volumes that reference this article
      const volumes = await payload.find({
        collection: 'volumes',
        where: {
          'articles.id': {
            equals: doc.id,
          },
        },
        select: {
          slug: true,
        },
        depth: 0,
      })

      volumes.docs.forEach((volume) => {
        const volumePath = `/volumes/${volume.slug}`
        revalidatePath(volumePath)
      })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Article> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/articles/${doc?.slug}`

    revalidatePath(path)
    revalidatePath('/feed.articles')
    revalidateTag('articles-sitemap')

    // Find and revalidate all volumes that reference this article
    const volumes = await payload.find({
      collection: 'volumes',
      where: {
        'articles.id': {
          equals: doc.id,
        },
      },
      select: {
        slug: true,
      },
      depth: 0,
    })

    volumes.docs.forEach((volume) => {
      const volumePath = `/volumes/${volume.slug}`
      revalidatePath(volumePath)
    })
  }

  return doc
}
