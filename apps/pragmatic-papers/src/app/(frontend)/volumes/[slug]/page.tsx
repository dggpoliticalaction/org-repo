import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Article } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Card } from '@/components/Card'

export async function generateStaticParams(): Promise<{ slug: string | null | undefined }[]> {
  const payload = await getPayload({ config: configPromise })
  const volumes = await payload.find({
    collection: 'volumes',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = volumes.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

interface Args {
  params: Promise<{
    slug?: string
  }>
}
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const article = await queryArticleBySlug({ slug })

  return generateMeta({ doc: article })
}

const queryArticleBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'volumes',
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

const queryArticlesByVolume = cache(async ({ volumeId }: { volumeId: string | number }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'articles',
    draft,
    limit: 100,
    overrideAccess: draft,
    pagination: false,
    where: {
      volume: {
        equals: volumeId,
      },
    },
  })

  return result.docs || []
})

export default async function Article({ params: paramsPromise }: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/articles/' + slug
  const volume = await queryArticleBySlug({ slug })

  if (!volume) return <PayloadRedirects url={url} />
  const { publishedAt, title, editorsNote, id } = volume

  // Fetch articles for this volume
  const articles = await queryArticlesByVolume({ volumeId: id })

  return (
    <div className="pt-16 pb-16 max-w-[750px] mx-auto">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}
      <div>
        <div className="relative flex items-end">
          <div className="container z-10 pb-8 text-center">
            <div>
              <div>
                <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-16 justify-center">
                {publishedAt && (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">Date Published</p>

                    <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
                  </div>
                )}
                {editorsNote && <RichText data={editorsNote} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Card key={article.id} doc={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
