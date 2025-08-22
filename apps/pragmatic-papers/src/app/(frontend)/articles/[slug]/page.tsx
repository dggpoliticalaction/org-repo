import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Article } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { Squiggle } from '@/components/ui/squiggle'

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

  const { populatedAuthors, publishedAt, title } = article

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <article className="pb-16 max-w-3xl m-auto p-5">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <div className="flex-col">
        <div className="pb-4 flex-col dark:text-white">
          <h1 className="mb-6 leading-tight text-4xl text-center font-bold tracking-normal">
            {title}
          </h1>
          {hasAuthors && (
            <div className="font-mono text-xs text-center">
              <span>
                by <strong className="font-bold inline">{formatAuthors(populatedAuthors)}</strong>
              </span>
            </div>
          )}
          {publishedAt && (
            <div className="font-mono text-xs text-center">
              <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
            </div>
          )}
        </div>
        <div className="my-8">
          <Squiggle />
        </div>
      </div>

      <RichText className="font-serif" data={article.content} enableGutter={false} />
    </article>
  )
}
