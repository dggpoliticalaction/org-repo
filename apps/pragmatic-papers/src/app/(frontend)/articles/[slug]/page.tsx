import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { AuthorCard } from '@/components/Authors/AuthorCard'
import { ArticleHero } from '@/heros/ArticleHero'
import type { Article, User } from '@/payload-types'
import { generateMeta } from '@/utilities/generateMeta'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

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

const queryAuthorsByIds = cache(async ({ ids }: { ids: (string | number)[] }): Promise<User[]> => {
  const numericIds = ids
    .map((id) => (typeof id === 'string' ? Number(id) : id))
    .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id))

  if (!numericIds.length) return []

  const payload = await getPayload({ config: configPromise })

  const result = (await payload.find({
    collection: 'users',
    limit: numericIds.length,
    pagination: false,
    where: {
      id: {
        in: numericIds,
      },
    },
    depth: 1,
  })) as { docs: User[] }

  return result.docs || []
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
  const authorIds = populatedAuthors
    .map((author) => author?.id)
    .filter((id): id is string => typeof id === 'string')

  const authors = await queryAuthorsByIds({ ids: authorIds })

  return (
    <article className="m-auto max-w-3xl p-5 pb-16">
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
          <div className="flex flex-col gap-4">
            {authors.map((author) => (
              <AuthorCard key={author.id} author={author} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
