import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { VolumesView } from '@/components/VolumesView'
import { PaginationVolumes } from '@/components/PaginationVolumes'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const volumes = await payload.find({
    collection: 'volumes',
    depth: 1,
    limit: 6,
    page: sanitizedPageNumber,
    overrideAccess: false,
    sort: '-volumeNumber',
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Volumes</h1>
        </div>
      </div>

      <VolumesView volumes={volumes.docs} />

      <div className="container mb-8">
        <PageRange
          collection="volumes"
          currentPage={volumes.page}
          limit={6}
          totalDocs={volumes.totalDocs}
        />
      </div>

      <div className="container">
        {volumes?.page && volumes?.totalPages > 1 && (
          <PaginationVolumes page={volumes.page} totalPages={volumes.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'volumes',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
