import type { Volume, VolumeView as VolumeBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { PageRange } from '@/components/PageRange'
import { PaginationVolumes } from '@/components/PaginationVolumes'
import { VolumesView } from '@/components/VolumesView'

export const VolumeViewBlock: React.FC<
  VolumeBlockProps & {
    id?: string
    searchParamsPromise: Promise<{ p?: string }>
  }
> = async (props) => {
  const {
    id,
    introContent,
    populateBy,
    selectedDocs,
    searchParamsPromise,
    limit: limitFromProps,
  } = props

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const limit = limitFromProps || 6
    const { p: pageNumber } = await searchParamsPromise

    let sanitizedPageNumber = Number(pageNumber)

    if (!Number.isInteger(sanitizedPageNumber)) sanitizedPageNumber = 0

    const volumes = await payload.find({
      collection: 'volumes',
      depth: 1,
      limit,
      page: sanitizedPageNumber,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        description: true,
        volumeNumber: true,
        publishedAt: true,
      },
      sort: '-volumeNumber',
    })

    return (
      <div className="my-4" id={`block-${id}`}>
        {introContent && (
          <div className="mb-16">
            <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
          </div>
        )}
        <VolumesView volumes={volumes.docs} />

        <div className="container mx-auto mt-6 mb-8 p-4 md:p-6">
          <PageRange
            collection="volumes"
            currentPage={volumes.page}
            limit={limit}
            totalDocs={volumes.totalDocs}
          />
        </div>

        <div className="container mx-auto p-4 md:p-6">
          {volumes.totalPages > 1 && volumes.page && (
            <PaginationVolumes page={volumes.page} totalPages={volumes.totalPages} />
          )}
        </div>
      </div>
    )
  } else {
    if (selectedDocs?.length) {
      const volumes = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Volume[]

      return (
        <div className="my-4" id={`block-${id}`}>
          {introContent && (
            <div className="container mx-auto mb-16 p-4 md:p-6">
              <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
            </div>
          )}
          <VolumesView volumes={volumes} />
        </div>
      )
    }
  }
}
