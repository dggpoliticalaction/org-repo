import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Article } from '@/payload-types'

import { ArticleHero } from '@/heros/ArticleHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'

import Link from 'next/link'

import { authorSlugFromNameAndId } from '@/utilities/authorSlug'

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config: configPromise })
  const articles = await payload.find({
    collection: 'articles',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = articles.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

interface Args {
  params: Promise<{
    slug?: string
  }>
}

const queryArticleBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'articles',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const article = await queryArticleBySlug({ slug })

  return generateMeta({ doc: article })
}

export default async function Article({ params: paramsPromise }: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/articles/' + slug
  const article = await queryArticleBySlug({ slug })

  if (!article) return <PayloadRedirects url={url} />

  const populatedAuthors = article.populatedAuthors || []
  const authors = populatedAuthors
    .map((author) => {
      if (!author?.id) return null
      const authorSlug = authorSlugFromNameAndId(author.name ?? null, author.id)
      return {
        id: author.id,
        name: author.name ?? null,
        slug: authorSlug,
      }
    })
    .filter(
      (author): author is { id: string; name: string | null; slug: string } => author !== null,
    )

  return (
    <article className="m-auto max-w-3xl p-5 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <ArticleHero article={article} />

      <RichText className="" data={article.content} enableGutter={false} />

      {authors.length > 0 && (
        <section aria-label="Article authors" className="mt-10 border-t pt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Meet the Author{authors.length > 1 ? 's' : ''}
          </h2>
          <div className="-mx-4 overflow-x-auto pb-2">
            <div className="flex gap-4 px-4">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="min-w-[220px] max-w-xs flex-1 rounded-lg border bg-card p-4 text-center"
                >
                  <Link
                    href={`/authors/${author.slug}`}
                    className="text-base font-semibold text-foreground transition-colors hover:text-brand"
                  >
                    {author.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
