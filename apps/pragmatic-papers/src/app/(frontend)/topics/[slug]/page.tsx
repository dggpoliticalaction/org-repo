import { AuthorArticleCard } from "@/components/Articles/AuthorArticleCard"
import { Pagination } from "@/components/Pagination"
import type { Volume } from "@/payload-types"
import React from "react"

import { queryArticlesByTopic, queryTopicBySlug, queryVolumesForArticles } from "./queries"

interface Args {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ p?: string }>
}

export default async function TopicPage({ params, searchParams }: Args): Promise<React.ReactNode> {
  const { slug = "" } = await params
  const { p } = await searchParams
  let page = Number(p) || 1
  if (!Number.isInteger(page) || page < 1) page = 1

  const topic = await queryTopicBySlug(slug) // deduplicated via shared cache instance
  if (!topic) return null

  const {
    docs: articles,
    totalDocs,
    totalPages,
    page: currentPage,
  } = await queryArticlesByTopic(topic.id, page)

  if (totalDocs === 0) {
    return <p className="text-muted-foreground text-sm">No articles found for this topic yet.</p>
  }

  const articleIds = articles.map((a) => a.id).filter(Boolean)
  const volumes = await queryVolumesForArticles(articleIds)

  const volumeByArticleId = new Map<number, Volume>()
  for (const volume of volumes) {
    for (const articleRef of volume.articles || []) {
      const articleId =
        typeof articleRef === "object" && articleRef !== null
          ? articleRef.id
          : (articleRef as number | undefined)
      if (articleId != null && !volumeByArticleId.has(articleId)) {
        volumeByArticleId.set(articleId, volume)
      }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <AuthorArticleCard
            key={article.id}
            article={article}
            volume={volumeByArticleId.get(article.id)}
          />
        ))}
      </div>
      {totalPages > 1 && currentPage && <Pagination page={currentPage} totalPages={totalPages} />}
    </>
  )
}
