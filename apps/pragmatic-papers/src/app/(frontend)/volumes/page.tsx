import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { VolumesView } from '@/components/VolumesView'

export const dynamic = 'force-static'
export const revalidate = 600

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const volumes = await payload.find({
    collection: 'volumes',
    depth: 1,
    limit: 6,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      description: true,
      volumeNumber: true,
      publishedAt: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />

      <div className="flex justify-center">
        <div className="text-center prose md:prose-md dark:prose-invert">
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
        {volumes.totalPages > 1 && volumes.page && (
          <Pagination page={volumes.page} totalPages={volumes.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Pragmatic Papers Volumes`,
  }
}
