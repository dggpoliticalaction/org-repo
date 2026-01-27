import type { Metadata } from 'next'
import type { Payload } from 'payload'
import type { Article, User } from '@/payload-types'

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
import { AuthorCard } from '@/components/Authors/AuthorCard'

type VolumeArticleRef = number | Article

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

const queryVolumeBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload: Payload = await getPayload({ config: configPromise })

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
    depth: 2,
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
  const volume = await queryVolumeBySlug({ slug })

  return generateMeta({ doc: volume })
}

export default async function VolumePage({
  params: paramsPromise,
}: Args): Promise<React.ReactNode> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/volumes/' + slug
  const volume = await queryVolumeBySlug({ slug })

  if (!volume) return <PayloadRedirects url={url} />
  const { publishedAt, editorsNote, articles } = volume
  if (
    articles?.filter((article: VolumeArticleRef) => typeof article === 'number')?.length ??
    0 > 0
  ) {
    console.error('Fetching volume with unfetched articles', slug)
  }
  const actualArticles = articles?.filter(
    (article: VolumeArticleRef): article is Article => typeof article !== 'number',
  )
  const volumeAuthorIdSet = new Set<string | number>()
  actualArticles?.forEach((article) => {
    const populated = article.populatedAuthors || []
    populated.forEach((author) => {
      if (!author?.id) return
      volumeAuthorIdSet.add(author.id)
    })
  })

  const volumeAuthors = await queryAuthorsByIds({ ids: Array.from(volumeAuthorIdSet) })

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
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

            <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-16">
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
        <div className="container w-full">
          <RichText className="w-full" enableGutter={false} data={editorsNote} />
        </div>
      )}
      <Squiggle className="mx-auto h-6 w-1/2" />
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {actualArticles?.map((article) => (
            <ArticleCard key={article.id} doc={article} relationTo="articles" />
          ))}
        </div>
      </div>
      {volumeAuthors.length > 0 && (
        <section aria-label="Volume authors" className="mt-10 border-t pt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Meet the Author{volumeAuthors.length > 1 ? 's' : ''}
          </h2>
          <div className="flex flex-col gap-4">
            {volumeAuthors.map((author) => (
              <AuthorCard key={author.id} author={author} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
