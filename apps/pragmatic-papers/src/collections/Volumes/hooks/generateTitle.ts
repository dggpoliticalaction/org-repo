import type { FieldHook } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Volume } from '@/payload-types'

export const generateTitle: FieldHook<Volume, string, Volume> = async ({ value, siblingData }) => {
  // Only auto-generate if the toggle is enabled
  const autoGenerate = siblingData.autoGenerateTitle
  if (!autoGenerate) {
    return value || ''
  }

  // Check if we have articles
  const articleIds = siblingData.articles as number[] | undefined

  if (!articleIds || articleIds.length === 0) {
    return value || ''
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all the articles to get their titles
    const articles = await payload.find({
      collection: 'articles',
      where: {
        id: { in: articleIds },
      },
      limit: articleIds.length,
      sort: '-publishedAt', // Sort by published date, newest first
    })

    if (articles.docs.length === 0) {
      return value || ''
    }

    // Sort articles by the order they appear in the articleIds array
    const sortedArticles = articleIds
      .map((id) => articles.docs.find((doc) => doc.id === id))
      .filter(Boolean)

    // Generate title by joining article titles with " • "
    const generatedTitle = sortedArticles.map((article) => article?.title ?? '').join(' • ')

    return generatedTitle
  } catch (error) {
    console.error('Error generating volume title:', error)
    return value || ''
  }
}
