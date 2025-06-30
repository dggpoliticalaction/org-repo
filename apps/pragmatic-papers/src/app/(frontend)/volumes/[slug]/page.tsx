import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ArticleCard } from '@/components/ArticleCard'
import { toRoman } from '@/utilities/toRoman'
import { Squiggle } from '@/components/ui/squiggle'

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

export default async function VolumePage({
  params: paramsPromise,
}: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/volumes/' + slug
  const volume = await queryArticleBySlug({ slug })

  if (!volume) return <PayloadRedirects url={url} />
  const { publishedAt, editorsNote, id } = volume

  // Fetch articles for this volume
  const articles = await queryArticlesByVolume({ volumeId: id })

  return (
    <div className="pt-16 pb-16 max-w-2xl px-4 mx-auto">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}
      <div className="relative flex items-end">
        <div className="container pb-8 text-center">
          <div>
            <div>
              <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{`Volume ${toRoman(Number(volume.slug))}`}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-16 justify-center">
              {publishedAt && (
                <div className="flex flex-col gap-1">
                  <p className="text-sm">Date Published</p>
                  <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {editorsNote && (
        <div className="w-full container">
          <h2 className="text-2xl font-bold">Editor's Note:</h2>
          <RichText
            className="w-full"
            enableProse={false}
            enableGutter={false}
            data={editorsNote}
          />
        </div>
      )}
      <Squiggle className="w-1/2 h-6 mx-auto" />
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} doc={article} relationTo="articles" />
          ))}
        </div>
      </div>
    </div>
  )
}
