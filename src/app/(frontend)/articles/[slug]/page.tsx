import config from "@payload-config"
import { cache } from "react"

import { AuthorList } from "@/components/Authors/AuthorList"
import { FootnoteList } from "@/components/FootnoteList"
import { JsonLd } from "@/components/JsonLd"
import { LivePreviewListener } from "@/components/LivePreviewListener"
import { PayloadRedirects } from "@/components/PayloadRedirects"
import RichText from "@/components/RichText"
import { TopicsList } from "@/components/Topics/TopicsList"
import { Separator } from "@/components/ui/separator"
import { ArticleHero } from "@/heros/ArticleHero"
import type { Article as ArticleType } from "@/payload-types"
import { MathJaxProvider } from "@/providers/MathJaxProvider"
import { generateMeta } from "@/utilities/generateMeta"
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/utilities/structuredData"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import { getPayload } from "payload"
import React from "react"

const queryArticleSlugs = cache(async (): Promise<{ slug: string | null | undefined }[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "articles",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
    context: {
      skipAfterRead: true,
    },
  })

  return docs.map(({ slug }) => ({ slug }))
})

const queryArticleBySlug = cache(async (slug: string): Promise<ArticleType | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: "articles",
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 0,
  })

  return docs[0] || null
})

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  return queryArticleSlugs()
}

interface Args {
  params: Promise<{
    slug?: string
  }>
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = "" } = await paramsPromise
  const article = await queryArticleBySlug(slug)

  return generateMeta({ doc: article, canonicalPath: `/articles/${slug}` })
}

export default async function Article({ params: paramsPromise }: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = "" } = await paramsPromise
  const url = "/articles/" + slug
  const article = await queryArticleBySlug(slug)

  if (!article) return <PayloadRedirects url={url} />

  const { footnotes, content, populatedAuthors, enableMathRendering, topics } = article

  return (
    <article className="mx-auto max-w-2xl space-y-6 px-4 md:px-1">
      <JsonLd
        data={[
          buildArticleJsonLd(article, url),
          buildBreadcrumbJsonLd([{ name: article.meta?.title || article.title, path: url }]),
        ]}
      />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <ArticleHero article={article} />
      <MathJaxProvider enableMathRendering={enableMathRendering}>
        <RichText
          data={content}
          enableGutter={false}
          className="drop-cap"
          parentDoc={{ collection: "articles", id: article.id }}
        />
      </MathJaxProvider>
      <FootnoteList footnotes={footnotes} />
      <Separator />
      <TopicsList topics={topics} />
      <AuthorList aria-label="Article Authors" authors={populatedAuthors} />
    </article>
  )
}
