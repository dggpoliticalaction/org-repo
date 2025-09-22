import React from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import type { Article, Volume } from '@/payload-types'

export const ArticleCardsGridComponent: React.FC<{
  articles?: (string | Article)[]
  volume?: Volume
}> = ({ articles, volume }) => {
  // Use block-specific articles if provided, otherwise fall back to volume articles
  const sourceArticles = articles || volume?.articles

  // Filter out any string IDs that might not be populated
  const actualArticles = sourceArticles?.filter(
    (article) => typeof article !== 'string',
  ) as Article[]

  if (!actualArticles || actualArticles.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {actualArticles.map((article) => (
          <ArticleCard key={article.id} doc={article} relationTo="articles" />
        ))}
      </div>
    </div>
  )
}
