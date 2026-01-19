import type { Metadata } from 'next/types'

import { ResourceArchive } from '@/components/ResourceArchive'
import { PageRange } from '@/components/PageRange'
import { ResourcePagination } from '@/components/ResourcePagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const revalidate = 600

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const resources = await payload.find({
    collection: 'resources',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      resourceType: true,
      resourceCategories: true,
      thumbnail: true,
      description: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Resources</h1>
          <p className="text-lg text-muted-foreground">
            Browse our collection of documents, images, videos, and links.
          </p>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="resources"
          currentPage={resources.page}
          limit={12}
          totalDocs={resources.totalDocs}
        />
      </div>

      <ResourceArchive resources={resources.docs} />

      <div className="container">
        {resources?.page && resources?.totalPages > 1 && (
          <ResourcePagination page={resources.page} totalPages={resources.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Resources Page ${pageNumber || ''} | DGG Political Action`,
    description: 'Browse our collection of documents, images, videos, and links.',
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'resources',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 12)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
