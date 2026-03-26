import type { Volume, VolumeView } from "@/payload-types"

import RichText from "@/components/RichText"
import configPromise from "@payload-config"
import { getPayload } from "payload"
import React from "react"

import { PageRange } from "@/components/PageRange"
import { PaginationVolumes } from "@/components/PaginationVolumes"
import { VolumesView } from "@/components/VolumesView"
import { Skeleton } from "@/components/ui/skeleton"

interface VolumeViewBlockProps extends VolumeView {
  id?: string | null
  pageNumber?: number
}

export const VolumeViewBlock: React.FC<VolumeViewBlockProps> = async (props) => {
  const { id, introContent, populateBy, selectedDocs, pageNumber, limit: limitFromProps } = props

  if (populateBy === "collection") {
    const payload = await getPayload({ config: configPromise })

    const limit = limitFromProps || 6

    const { docs, page, totalDocs, totalPages } = await payload.find({
      collection: "volumes",
      depth: 1,
      limit,
      page: pageNumber,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        description: true,
        volumeNumber: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
      },
      sort: "-volumeNumber",
    })

    return (
      <div className="mx-auto my-4 max-w-xl space-y-8 px-4" id={id ?? undefined}>
        {introContent && (
          <RichText className="font-display" data={introContent} enableGutter={false} />
        )}
        <VolumesView volumes={docs} />
        <PageRange collection="volumes" currentPage={page} limit={limit} totalDocs={totalDocs} />
        {totalPages > 1 && page && (
          <div className="container">
            <PaginationVolumes page={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    )
  } else {
    if (selectedDocs?.length) {
      const volumes = selectedDocs
        .map((post) => (typeof post.value !== "number" ? post.value : undefined))
        .filter((volume): volume is Volume => volume !== undefined)

      return (
        <div className="my-4" id={`block-${id}`}>
          {introContent && (
            <div className="container mb-16">
              <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
            </div>
          )}
          <VolumesView volumes={volumes} />
        </div>
      )
    }
  }
}

/**
 * Skeleton fallback matching VolumeViewBlock structure.
 * Structure mirrors Entry: title, meta, description (my-6), separator.
 * ~200px per entry so 3 volumes + page text ≈ 600px.
 */
export const VolumeViewSkeleton: React.FC<VolumeView> = ({ id, limit }) => {
  const count = limit ?? 6
  return (
    <div className="relative mx-auto my-4 max-w-xl space-y-8 overflow-hidden rounded-xl px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`${id ?? ""}-skeleton-entry-${i}`} className="group space-y-2 overflow-hidden">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <div className="my-6 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
          <Skeleton className="h-px w-full shrink-0" />
        </div>
      ))}
      <div className="text-center">
        <Skeleton className="mx-auto h-5 w-48" />
      </div>
    </div>
  )
}
