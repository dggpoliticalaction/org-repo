import { AuthorArticleCard } from "@/components/Articles/AuthorArticleCard"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { Pagination } from "@/components/Pagination"
import { PayloadRedirects } from "@/components/PayloadRedirects"
import {
  getVolumeByArticleId,
  queryArticlesByTopic,
  queryTopicBySlug,
  queryTopicSlugs,
} from "@/utilities/contentQueries"
import { generateMeta } from "@/utilities/generateMeta"
import { parsePageNumber } from "@/utilities/parsePageNumber"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import React from "react"

interface Args {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    p?: string
  }>
}

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  return queryTopicSlugs()
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = "" } = await params
  const topic = await queryTopicBySlug(slug)

  return generateMeta({ doc: topic, canonicalPath: `/topics/${slug}` })
}

const ARTICLES_PER_PAGE = 5

export default async function TopicPage({ params, searchParams }: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = "" } = await params
  const { p } = await searchParams
  const page = parsePageNumber(p)

  const url = `/topics/${slug}`
  const topic = await queryTopicBySlug(slug)

  if (!topic) return <PayloadRedirects url={url} />

  const {
    docs: articles,
    totalDocs,
    totalPages,
    page: currentPage,
  } = await queryArticlesByTopic(topic.id, page, ARTICLES_PER_PAGE)
  const volumeByArticleId = await getVolumeByArticleId(...articles.map(({ id }) => id))

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4">
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <header className="space-y-3">
        <h1>{topic.name}</h1>
        {topic.description && <p className="text-muted-foreground text-sm">{topic.description}</p>}
      </header>

      <section aria-label="Articles for this topic">
        <h2 className="mb-3">Articles</h2>
        {totalDocs === 0 ? (
          <p className="text-muted-foreground text-sm">No articles found for this topic yet.</p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {articles.map((article) => {
                const volume = volumeByArticleId.get(article.id)
                return <AuthorArticleCard key={article.id} article={article} volume={volume} />
              })}
            </div>
            {totalPages > 1 && currentPage && (
              <Pagination page={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </section>
    </article>
  )
}
