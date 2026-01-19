import type { Metadata } from 'next/types'

import { ResourceArchive } from '@/components/ResourceArchive'
import { PageRange } from '@/components/PageRange'
import { ResourcePagination } from '@/components/ResourcePagination'
import { ResourceSearch } from '@/components/ResourceSearch'
import { ResourceFilters } from '@/components/ResourceFilters'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import PageClient from './page.client'
import type { Where } from 'payload'

export const dynamic = 'force-dynamic'
export const revalidate = 600

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Props = {
  searchParams: Promise<{
    q?: string
    type?: string
    category?: string
    page?: string
  }>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function Page({ searchParams }: Props) {
  const { q, type, category, page } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Parse comma-separated filter values
  const types = type?.split(',').filter(Boolean) || []
  const categorySlugs = category?.split(',').filter(Boolean) || []

  // Build the where clause for filtering
  const whereConditions: Where[] = []

  if (q) {
    whereConditions.push({
      or: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    })
  }

  if (types.length > 0) {
    whereConditions.push({
      resourceType: { in: types },
    })
  }

  if (categorySlugs.length > 0) {
    // Find all categories by slug
    const categoryResult = await payload.find({
      collection: 'resource-categories',
      where: { slug: { in: categorySlugs } },
      limit: 100,
    })

    if (categoryResult.docs.length > 0) {
      const categoryIds = categoryResult.docs.map((cat) => cat.id)
      whereConditions.push({
        or: categoryIds.map((id) => ({
          resourceCategories: { contains: id },
        })),
      })
    }
  }

  const whereClause: Where | undefined =
    whereConditions.length > 0 ? { and: whereConditions } : undefined

  const currentPage = page ? Number(page) : 1

  const resources = await payload.find({
    collection: 'resources',
    depth: 1,
    limit: 12,
    page: currentPage,
    overrideAccess: false,
    where: whereClause,
    select: {
      title: true,
      slug: true,
      resourceType: true,
      resourceCategories: true,
      thumbnail: true,
      description: true,
    },
  })

  // Fetch categories for the filter dropdown
  const categories = await payload.find({
    collection: 'resource-categories',
    limit: 100,
    overrideAccess: false,
  })

  const hasFilters = Boolean(q || types.length > 0 || categorySlugs.length > 0)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-8">
        <div className="prose dark:prose-invert max-w-none mb-8">
          <h1>Resources</h1>
          <p className="text-lg text-muted-foreground">
            Browse our collection of documents, images, videos, and links.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <Suspense fallback={<div className="h-10 bg-muted animate-pulse rounded-lg w-full sm:w-64" />}>
            <ResourceSearch className="w-full sm:w-64" />
          </Suspense>
          <Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded-lg" />}>
            <ResourceFilters categories={categories.docs} />
          </Suspense>
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

      {resources.docs.length > 0 ? (
        <ResourceArchive resources={resources.docs} />
      ) : (
        <div className="container">
          <p className="text-muted-foreground">
            {hasFilters
              ? 'No resources found matching your criteria. Try adjusting your filters.'
              : 'No resources available yet.'}
          </p>
        </div>
      )}

      <div className="container">
        {resources.totalPages > 1 && resources.page && (
          <ResourcePagination page={resources.page} totalPages={resources.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Resources | DGG Political Action`,
    description: 'Browse our collection of documents, images, videos, and links.',
  }
}
