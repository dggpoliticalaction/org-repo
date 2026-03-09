import type { Article } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RecommendedArticlesClient } from './client'

interface RecommendedArticlesProps {
  currentArticleSlug: string
}

export async function RecommendedArticles({ currentArticleSlug }: RecommendedArticlesProps) {
  const payload = await getPayload({ config: configPromise })

  const recommendations = await payload.findGlobal({
    slug: 'article-recommendations',
    depth: 1,
  })

  const rankings = recommendations?.rankings

  if (!rankings || rankings.length === 0) return null

  return (
    <RecommendedArticlesClient
      rankings={rankings
        .filter((r): r is typeof r & { article: Article } => typeof r.article === 'object')
        .map((r) => {
          const article = r.article
          const metaImage = article.meta?.image
          const imageUrl =
            typeof metaImage === 'object' && metaImage !== null && 'url' in metaImage
              ? (metaImage.url as string)
              : null

          return {
            slug: article.slug ?? '',
            title: article.title,
            metaImage: imageUrl,
            metaDescription: article.meta?.description ?? null,
            engagementScore: r.engagementScore,
            publishedAt: article.publishedAt ?? null,
          }
        })}
      currentArticleSlug={currentArticleSlug}
    />
  )
}
