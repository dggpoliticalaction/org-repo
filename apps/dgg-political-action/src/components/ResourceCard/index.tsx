'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Resource, ResourceCategory } from '@/payload-types'

import { Media } from '@/components/Media'

export type ResourceCardData = Pick<
  Resource,
  'slug' | 'resourceCategories' | 'thumbnail' | 'title' | 'description' | 'resourceType'
>

const resourceTypeIcons: Record<Resource['resourceType'], string> = {
  document: '📄',
  image: '🖼️',
  video: '🎬',
  link: '🔗',
}

const resourceTypeLabels: Record<Resource['resourceType'], string> = {
  document: 'Document',
  image: 'Image',
  video: 'Video',
  link: 'Link',
}

export const ResourceCard: React.FC<{
  className?: string
  doc?: ResourceCardData
  showCategories?: boolean
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, showCategories } = props

  const { slug, resourceCategories, thumbnail, title, description, resourceType } = doc || {}

  const hasCategories =
    resourceCategories && Array.isArray(resourceCategories) && resourceCategories.length > 0
  const href = `/resources/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-video bg-muted">
        {!thumbnail && (
          <div className="flex items-center justify-center h-full text-4xl">
            {resourceType ? resourceTypeIcons[resourceType] : '📁'}
          </div>
        )}
        {thumbnail && typeof thumbnail !== 'number' && (
          <Media resource={thumbnail} size="33vw" fill />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
            {resourceType ? resourceTypeLabels[resourceType] : 'Resource'}
          </span>
          {showCategories && hasCategories && (
            <div className="flex gap-1 flex-wrap">
              {resourceCategories?.map((category, index) => {
                if (typeof category === 'object') {
                  const { title: categoryTitle } = category as ResourceCategory

                  return (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                    >
                      {categoryTitle || 'Untitled'}
                    </span>
                  )
                }

                return null
              })}
            </div>
          )}
        </div>
        {title && (
          <div className="prose dark:prose-invert">
            <h3 className="text-lg font-semibold mb-1">
              <Link className="not-prose" href={href} ref={link.ref}>
                {title}
              </Link>
            </h3>
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{description}</p>
        )}
      </div>
    </article>
  )
}
