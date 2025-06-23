import type { VolumeView as VolumeBlockProps, Volume } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { VolumesView } from '@/components/VolumesView'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'

export const VolumeViewBlock: React.FC<
  VolumeBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const volumes = await payload.find({
      collection: 'volumes',
      depth: 1,
      limit,
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
      <div className="my-16" id={`block-${id}`}>
        {introContent && (
          <div className="mb-16">
            <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
          </div>
        )}
        <VolumesView volumes={volumes.docs} />

        <div className="container mb-8">
          <PageRange
            collection="volumes"
            currentPage={volumes.page}
            limit={limit}
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
  } else {
    if (selectedDocs?.length) {
      const volumes = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Volume[]

      return (
        <div className="my-16" id={`block-${id}`}>
          {introContent && (
            <div className="container mb-16">
              <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
            </div>
          )}
          <VolumesView volumes={volumes} />
        </div>
      )
    }
  }
}
