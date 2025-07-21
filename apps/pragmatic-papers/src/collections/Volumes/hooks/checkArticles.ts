import { type RelationshipFieldManyValidation, getPayload } from 'payload'
import configPromise from '@payload-config'

export const checkArticles: RelationshipFieldManyValidation = async (value) => {
  const payload = await getPayload({ config: configPromise })

  const fieldValue = value as number[]

  const articles = await payload.find({
    collection: 'articles',
    where: {
      id: { in: fieldValue },
      _status: { not_equals: 'published' },
    },
  })

  if (articles.totalDocs === 0) {
    return true // All articles are published
  }

  return `The following articles are not published: ${articles.docs
    .map((article) => article.title)
    .join(', ')}`
}
